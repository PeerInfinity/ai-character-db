#!/usr/bin/env python3
"""
Script to merge JSON files containing character data.
Filters entries based on completeness, multi-work conflicts, and duplicates.
"""

import json
import glob
import argparse
import os
from collections import defaultdict
from typing import List, Dict, Any, Tuple


def get_required_fields() -> List[str]:
    """Return list of required (non-optional) fields for a character entry.

    Based on collection-guide.md schema v4.0:
    - Optional fields: publication_year, character_type
    - source_urls can be empty array []
    - work_url can be empty string ""
    - All other fields are required
    """
    return [
        "source_urls",
        "work_url",
        "work_type",
        "work_name",
        "character_name",
        "character_description",
        "ai_qualification",
        "ai_qualification_explanation",
        "benevolence_rating",
        "benevolence_rating_explanation",
        "alignment_rating",
        "alignment_rating_explanation"
    ]


def get_valid_fields() -> List[str]:
    """Return list of all valid fields (required + optional) for a character entry.

    Based on collection-guide.md schema v4.0.
    """
    return get_required_fields() + [
        "publication_year",
        "character_type",
        "needs_research"
    ]


def has_unexpected_fields(entry: Dict[str, Any]) -> bool:
    """Check if an entry has fields that are not in the valid schema.

    Returns True if there are unexpected fields, False otherwise.
    """
    valid_fields = set(get_valid_fields())
    entry_fields = set(entry.keys())
    unexpected = entry_fields - valid_fields

    return len(unexpected) > 0


def is_complete(entry: Dict[str, Any]) -> bool:
    """Check if an entry has all required fields with non-empty values.

    Special handling:
    - source_urls: can be empty array [] (but must exist and be a list)
    - work_url: can be empty string "" (but must exist)
    - All other required fields must have non-empty values
    """
    required_fields = get_required_fields()

    for field in required_fields:
        # Field is missing or is None
        if field not in entry or entry[field] is None:
            return False

        # Special case: source_urls can be empty array
        if field == "source_urls":
            if not isinstance(entry[field], list):
                return False
            # Empty array is OK
            continue

        # Special case: work_url can be empty string
        if field == "work_url":
            if not isinstance(entry[field], str):
                return False
            # Empty string is OK
            continue

        # All other fields: must not be empty
        if isinstance(entry[field], str) and entry[field].strip() == "":
            return False

    return True


def get_entry_key(entry: Dict[str, Any]) -> Tuple[str, str]:
    """Get the key tuple (character_name, work_name) for grouping entries."""
    char_name = entry.get("character_name", "").strip()
    work_name = entry.get("work_name", "").strip()
    return (char_name, work_name)


def is_empty_value(value: Any) -> bool:
    """Check if a value is considered empty (None, empty string, empty list)."""
    if value is None:
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    if isinstance(value, list) and len(value) == 0:
        return True
    return False


def entries_are_identical(entry1: Dict[str, Any], entry2: Dict[str, Any]) -> bool:
    """Check if two entries are identical (same data, not just same character/work).

    Entries are considered identical if:
    1. They have exactly the same data, OR
    2. They differ only by one having missing/empty data where the other has values

    Returns True if entries are identical.
    """
    # Compare all fields except metadata-like fields that might differ
    e1_copy = {k: v for k, v in entry1.items() if k not in ["metadata"]}
    e2_copy = {k: v for k, v in entry2.items() if k not in ["metadata"]}

    # First check: exact match
    if json.dumps(e1_copy, sort_keys=True) == json.dumps(e2_copy, sort_keys=True):
        return True

    # Second check: differ only by missing/empty values
    all_keys = set(e1_copy.keys()) | set(e2_copy.keys())

    for key in all_keys:
        val1 = e1_copy.get(key)
        val2 = e2_copy.get(key)

        # If both have values, they must match
        if not is_empty_value(val1) and not is_empty_value(val2):
            if val1 != val2:
                return False
        # If one is empty and the other has a value, that's OK (we'll merge)
        # If both are empty, that's OK too

    return True


def merge_entries(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge multiple identical entries, keeping the most complete values.

    For each field, prefer non-empty values over empty ones.
    If multiple entries have non-empty values for the same field,
    they should all be the same (enforced by entries_are_identical check).

    Args:
        entries: List of entries to merge (should all be identical per entries_are_identical)

    Returns:
        A single merged entry with the most complete data
    """
    if not entries:
        return {}

    if len(entries) == 1:
        return entries[0]

    # Start with the first entry as base
    merged = entries[0].copy()

    # Get all possible keys from all entries
    all_keys = set()
    for entry in entries:
        all_keys.update(entry.keys())

    # For each key, find the first non-empty value
    for key in all_keys:
        if key == "metadata":
            continue  # Skip metadata fields

        # Find first non-empty value for this key
        for entry in entries:
            value = entry.get(key)
            if not is_empty_value(value):
                merged[key] = value
                break

    return merged


def remove_identical_duplicates(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove entries that are completely identical to another entry.

    Keeps only one copy of each unique entry.
    """
    unique_entries = []
    seen_serialized = set()

    for entry in entries:
        # Serialize entry for comparison (excluding metadata fields)
        entry_copy = {k: v for k, v in entry.items() if k not in ["metadata"]}
        serialized = json.dumps(entry_copy, sort_keys=True)

        if serialized not in seen_serialized:
            seen_serialized.add(serialized)
            unique_entries.append(entry)

    duplicates_removed = len(entries) - len(unique_entries)
    if duplicates_removed > 0:
        print(f"Removed {duplicates_removed} identical duplicate entries")

    return unique_entries


def load_all_json_files(include_batches: bool = False) -> List[Dict[str, Any]]:
    """Load all JSON files in the current directory and extract character entries.

    Args:
        include_batches: If True, also scan the batches directory and all subdirectories
    """
    all_entries = []
    json_files = glob.glob("*.json")

    # If include_batches is True, add JSON files from batches directory
    if include_batches:
        batches_pattern = os.path.join("batches", "**", "*.json")
        batch_files = glob.glob(batches_pattern, recursive=True)
        json_files.extend(batch_files)
        print(f"Scanning batches directory found {len(batch_files)} additional JSON files")

    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

                # Handle different JSON structures
                if isinstance(data, dict) and "characters" in data:
                    all_entries.extend(data["characters"])
                elif isinstance(data, list):
                    all_entries.extend(data)

        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not load {file_path}: {e}")

    return all_entries


def sort_entries(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sort entries by work_type, work_name, then character_name alphabetically."""
    return sorted(
        entries,
        key=lambda e: (
            e.get("work_type", "").lower(),
            e.get("work_name", "").lower(),
            e.get("character_name", "").lower()
        )
    )


def filter_entries(entries: List[Dict[str, Any]]) -> Tuple[
    List[Dict[str, Any]],  # valid entries
    List[Dict[str, Any]],  # invalid entries (unexpected fields)
    List[Dict[str, Any]],  # incomplete entries
    List[Dict[str, Any]],  # multi-work entries
    List[Dict[str, Any]]   # duplicate entries
]:
    """
    Filter entries in the specified order:
    0. Filter out invalid entries (with unexpected fields)
    1. Filter out incomplete entries
    2. Filter out multi-work entries (same char/work, different type/year)
    3. Filter out duplicate entries (same char/work, different data)
    """

    # Step 0: Filter invalid entries (with unexpected fields)
    valid_schema_entries = []
    invalid_entries = []

    for entry in entries:
        if has_unexpected_fields(entry):
            invalid_entries.append(entry)
        else:
            valid_schema_entries.append(entry)

    print(f"Step 0: Filtered out {len(invalid_entries)} invalid entries (unexpected fields)")
    print(f"Remaining: {len(valid_schema_entries)} entries")

    # Step 1: Filter incomplete entries
    complete_entries = []
    incomplete_entries = []

    for entry in valid_schema_entries:
        if is_complete(entry):
            complete_entries.append(entry)
        else:
            incomplete_entries.append(entry)

    print(f"Step 1: Filtered out {len(incomplete_entries)} incomplete entries")
    print(f"Remaining: {len(complete_entries)} entries")

    # Step 2: Filter multi-work entries
    # Group by (character_name, work_name)
    grouped = defaultdict(list)
    for entry in complete_entries:
        key = get_entry_key(entry)
        grouped[key].append(entry)

    valid_after_multiwork = []
    multi_work_entries = []

    for key, group in grouped.items():
        if len(group) == 1:
            # Only one entry for this character/work combo
            valid_after_multiwork.append(group[0])
        else:
            # Multiple entries - check if they have different work_type or publication_year
            work_types = set(e.get("work_type", "") for e in group)
            # Check both 'year' and 'publication_year' for backwards compatibility
            years = set()
            for e in group:
                year = e.get("publication_year") or e.get("year")
                if year is not None:
                    years.add(year)

            if len(work_types) > 1 or len(years) > 1:
                # Different work types or years - this is a multi-work situation
                multi_work_entries.extend(group)
            else:
                # Same work_type and year - will check for duplicates in next step
                valid_after_multiwork.extend(group)

    print(f"Step 2: Filtered out {len(multi_work_entries)} multi-work entries")
    print(f"Remaining: {len(valid_after_multiwork)} entries")

    # Step 3: Filter duplicate entries
    # Group again by (character_name, work_name)
    grouped = defaultdict(list)
    for entry in valid_after_multiwork:
        key = get_entry_key(entry)
        grouped[key].append(entry)

    valid_entries = []
    duplicate_entries = []

    for key, group in grouped.items():
        if len(group) == 1:
            # Only one entry
            valid_entries.append(group[0])
        else:
            # Multiple entries - check if they're identical
            # Compare first entry with all others
            all_identical = True
            for i in range(1, len(group)):
                if not entries_are_identical(group[0], group[i]):
                    all_identical = False
                    break

            if all_identical:
                # All entries are identical (possibly with missing data)
                # Keep the most complete version by merging
                merged_entry = merge_entries(group)
                valid_entries.append(merged_entry)
            else:
                # Entries differ - these are duplicates with different data
                duplicate_entries.extend(group)

    print(f"Step 3: Filtered out {len(duplicate_entries)} duplicate entries")
    print(f"Final valid entries: {len(valid_entries)} entries")

    return valid_entries, invalid_entries, incomplete_entries, multi_work_entries, duplicate_entries


def add_missing_fields(entry: Dict[str, Any]) -> Dict[str, Any]:
    """Add missing required fields to an entry, initialized to empty values.

    - source_urls: initialized to empty array []
    - work_url: initialized to empty string ""
    - All other string fields: initialized to empty string ""
    """
    required_fields = get_required_fields()
    updated_entry = entry.copy()

    for field in required_fields:
        if field not in updated_entry:
            # Special case: source_urls should be an empty array
            if field == "source_urls":
                updated_entry[field] = []
            else:
                # All other fields: empty string
                updated_entry[field] = ""

    return updated_entry


def save_json(entries: List[Dict[str, Any]], filename: str, add_missing: bool = False):
    """Save entries to a JSON file.

    Args:
        entries: List of character entries to save
        filename: Output filename
        add_missing: If True, add missing required fields initialized to empty values
    """
    # Add missing fields if requested
    if add_missing:
        entries = [add_missing_fields(entry) for entry in entries]

    sorted_entries = sort_entries(entries)

    output = {
        "metadata": {
            "total_entries": len(sorted_entries),
            "generated_by": "merge_json_files.py"
        },
        "characters": sorted_entries
    }

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(sorted_entries)} entries to {filename}")


def main():
    parser = argparse.ArgumentParser(
        description="Merge JSON files containing character data. "
                    "Filters entries based on completeness, multi-work conflicts, and duplicates."
    )
    parser.add_argument(
        "-b", "--batches",
        action="store_true",
        help="Include JSON files from the batches directory and all subdirectories"
    )

    args = parser.parse_args()

    print("Loading all JSON files...")
    all_entries = load_all_json_files(include_batches=args.batches)
    print(f"Loaded {len(all_entries)} total entries from all files")

    print("\nRemoving identical duplicates...")
    all_entries = remove_identical_duplicates(all_entries)
    print(f"Remaining after deduplication: {len(all_entries)} entries")

    print("\nFiltering entries...")
    valid, invalid, incomplete, multi_work, duplicates = filter_entries(all_entries)

    print("\nSaving filtered results...")
    save_json(valid, "ai-character-db.json")
    save_json(invalid, "invalid-entries.json")
    save_json(incomplete, "incomplete-entries.json", add_missing=True)
    save_json(multi_work, "multi-work-entries.json")
    save_json(duplicates, "duplicate-entries.json")

    print("\n=== Summary ===")
    print(f"Total entries processed: {len(all_entries)}")
    print(f"Valid entries: {len(valid)}")
    print(f"Invalid entries (unexpected fields): {len(invalid)}")
    print(f"Incomplete entries: {len(incomplete)}")
    print(f"Multi-work entries: {len(multi_work)}")
    print(f"Duplicate entries: {len(duplicates)}")


if __name__ == "__main__":
    import subprocess
    import sys

    main()

    # After merging, automatically split the JSON by work type
    print("\n=== Splitting JSON by work type ===")
    try:
        result = subprocess.run(
            [sys.executable, "split_json_by_work_type.py"],
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print("Warnings:", result.stderr, file=sys.stderr)
    except subprocess.CalledProcessError as e:
        print(f"Error running split script: {e}", file=sys.stderr)
        print(e.stdout)
        print(e.stderr, file=sys.stderr)
    except FileNotFoundError:
        print("Warning: split_json_by_work_type.py not found. Skipping split step.", file=sys.stderr)
