#!/usr/bin/env python3
"""
Script to resolve duplicate entries in duplicate-entries.json.
For each pair of duplicates, merges the best information from both entries.
"""

import json
from typing import List, Dict, Any

def is_better_field(val1: Any, val2: Any, field_name: str) -> bool:
    """
    Determines which field value is better to keep.
    Returns True if val1 is better, False if val2 is better.
    """
    # If one is missing and the other isn't, prefer the non-missing one
    if not val1 and val2:
        return False
    if val1 and not val2:
        return True

    # If both present, prefer the longer/more detailed one for text fields
    if isinstance(val1, str) and isinstance(val2, str):
        # For description and explanation fields, prefer longer content
        if 'description' in field_name or 'explanation' in field_name:
            return len(val1) >= len(val2)
        # For other string fields, prefer non-empty
        return len(val1.strip()) >= len(val2.strip())

    # Default to first value
    return True

def merge_entries(entry1: Dict[str, Any], entry2: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merges two duplicate entries, keeping the best information from each.
    """
    merged = {}

    # Get all unique keys from both entries
    all_keys = set(entry1.keys()) | set(entry2.keys())

    for key in all_keys:
        val1 = entry1.get(key)
        val2 = entry2.get(key)

        # Special handling for source_urls - merge unique URLs
        if key == 'source_urls':
            merged[key] = list(set(val1 + val2)) if val1 and val2 else (val1 or val2 or [])
        # For other fields, pick the better one
        elif is_better_field(val1, val2, key):
            merged[key] = val1 if val1 else val2
        else:
            merged[key] = val2 if val2 else val1

    return merged

def group_duplicates(characters: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
    """
    Groups duplicate entries based on work_name and character_name.
    Returns list of lists, where each inner list contains duplicate entries.
    """
    groups = {}

    for char in characters:
        key = (char.get('work_name', ''), char.get('character_name', ''))
        if key not in groups:
            groups[key] = []
        groups[key].append(char)

    # Return groups that have more than one entry (duplicates)
    return [group for group in groups.values() if len(group) > 1]

def resolve_duplicates(input_file: str, output_file: str):
    """
    Reads duplicate-entries.json, resolves duplicates by merging,
    and writes the result back.
    """
    # Read the input file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data['characters']
    print(f"Total entries before deduplication: {len(characters)}")

    # Group duplicates
    duplicate_groups = group_duplicates(characters)
    print(f"Found {len(duplicate_groups)} groups of duplicates")

    # Merge each group of duplicates
    merged_characters = []
    processed_indices = set()

    for i, char in enumerate(characters):
        if i in processed_indices:
            continue

        # Find if this character has duplicates
        key = (char.get('work_name', ''), char.get('character_name', ''))
        duplicates = [c for c in characters if (c.get('work_name', ''), c.get('character_name', '')) == key]

        if len(duplicates) > 1:
            # Mark all indices as processed
            for c in duplicates:
                idx = characters.index(c)
                processed_indices.add(idx)

            # Merge all duplicates
            merged = duplicates[0]
            for dup in duplicates[1:]:
                merged = merge_entries(merged, dup)

            merged_characters.append(merged)
            print(f"Merged {len(duplicates)} entries for: {char.get('character_name')} from {char.get('work_name')}")
        else:
            processed_indices.add(i)
            merged_characters.append(char)

    print(f"Total entries after deduplication: {len(merged_characters)}")

    # Update metadata
    data['characters'] = merged_characters
    data['metadata']['total_entries'] = len(merged_characters)

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Wrote deduplicated entries to {output_file}")

if __name__ == '__main__':
    resolve_duplicates('duplicate-entries.json', 'duplicate-entries.json')
