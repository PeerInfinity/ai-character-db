#!/usr/bin/env python3
"""
Script to fix invalid entries by renaming old field names to new schema field names.

Field mappings:
- year -> publication_year
- work -> work_name
- name -> character_name
"""

import json
from typing import Dict, Any, List


def fix_field_names(entry: Dict[str, Any]) -> Dict[str, Any]:
    """Fix field names in an entry by renaming old fields to new schema fields.

    Field mappings:
    - year -> publication_year
    - work -> work_name
    - name -> character_name
    - film -> work_name

    Fields to remove (not in schema):
    - benevolence_rating_explanation_additional
    """
    fixed_entry = entry.copy()

    # Map old field names to new field names
    field_mappings = {
        "year": "publication_year",
        "work": "work_name",
        "name": "character_name",
        "film": "work_name"
    }

    for old_field, new_field in field_mappings.items():
        if old_field in fixed_entry:
            # Only copy if the new field doesn't already exist or is empty
            if new_field not in fixed_entry or fixed_entry[new_field] == "":
                fixed_entry[new_field] = fixed_entry[old_field]
            # Remove the old field
            del fixed_entry[old_field]

    # Remove fields that are not in the schema
    fields_to_remove = [
        "benevolence_rating_explanation_additional"
    ]

    for field in fields_to_remove:
        if field in fixed_entry:
            del fixed_entry[field]

    return fixed_entry


def main():
    print("Loading invalid-entries.json...")
    try:
        with open("invalid-entries.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: invalid-entries.json not found")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Could not parse invalid-entries.json: {e}")
        return

    entries = data.get("characters", [])
    print(f"Loaded {len(entries)} invalid entries")

    print("\nFixing field names...")
    fixed_entries = [fix_field_names(entry) for entry in entries]

    print("Saving to fixed-entries.json...")
    output = {
        "metadata": {
            "total_entries": len(fixed_entries),
            "generated_by": "fix_invalid_entries.py",
            "note": "Field names converted from old schema to new schema"
        },
        "characters": fixed_entries
    }

    with open("fixed-entries.json", 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(fixed_entries)} fixed entries to fixed-entries.json")
    print("\n=== Summary ===")
    print(f"Total entries fixed: {len(fixed_entries)}")
    print("\nField mappings applied:")
    print("  year -> publication_year")
    print("  work -> work_name")
    print("  name -> character_name")
    print("  film -> work_name")
    print("\nFields removed (not in schema):")
    print("  benevolence_rating_explanation_additional")


if __name__ == "__main__":
    main()
