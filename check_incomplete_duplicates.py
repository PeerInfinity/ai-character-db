#!/usr/bin/env python3
"""
Check if any entries in incomplete-entries.json match entries in ai-character-db.json.
Update ai-character-db.json with any missing fields from incomplete-entries.json.

This script compares entries based on work_type, work_name, and character_name.
"""

import json
import sys


def load_database(filename):
    """Load a character database."""
    with open(filename, 'r') as f:
        return json.load(f)


def save_database(data, filename):
    """Save a character database."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_entry_key(entry):
    """Create a unique key for an entry based on work_type, work_name, and character_name."""
    return (
        entry.get('work_type', '').strip(),
        entry.get('work_name', '').strip(),
        entry.get('character_name', '').strip()
    )


def compare_entries(main_entry, incomplete_entry):
    """Compare two entries and return fields that exist in incomplete but are missing in main."""
    missing_fields = {}

    for field, value in incomplete_entry.items():
        # Check if field is missing or empty in main entry
        main_value = main_entry.get(field)

        # Consider a field missing if it doesn't exist, is None, or is an empty string
        if main_value is None or (isinstance(main_value, str) and main_value.strip() == ''):
            # Only add non-empty values from incomplete entry
            if value is not None and not (isinstance(value, str) and value.strip() == ''):
                missing_fields[field] = value

    return missing_fields


def main():
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print("DRY RUN MODE - No files will be modified\n")

    print("Loading databases...")

    # Load both databases
    main_db = load_database('ai-character-db.json')
    incomplete_db = load_database('incomplete-entries.json')

    main_entries = main_db.get('characters', [])
    incomplete_entries = incomplete_db.get('characters', [])

    print(f"Main database: {len(main_entries)} entries")
    print(f"Incomplete database: {len(incomplete_entries)} entries")

    # Create a mapping of keys to entries in main database
    main_entries_map = {}
    for entry in main_entries:
        key = get_entry_key(entry)
        main_entries_map[key] = entry

    # Create a mapping of keys to entries in incomplete database
    incomplete_entries_map = {}
    for entry in incomplete_entries:
        key = get_entry_key(entry)
        incomplete_entries_map[key] = entry

    # Check for duplicates and missing fields
    duplicates = []
    entries_with_updates = []
    total_fields_added = 0

    for key in incomplete_entries_map.keys():
        if key in main_entries_map:
            duplicates.append({
                'work_type': key[0],
                'work_name': key[1],
                'character_name': key[2]
            })

            # Compare entries to find missing fields
            main_entry = main_entries_map[key]
            incomplete_entry = incomplete_entries_map[key]
            missing_fields = compare_entries(main_entry, incomplete_entry)

            if missing_fields:
                entries_with_updates.append({
                    'key': key,
                    'main_entry': main_entry,
                    'missing_fields': missing_fields
                })
                total_fields_added += len(missing_fields)

    # Print results
    print("\n" + "="*60)
    print("DUPLICATE CHECK RESULTS")
    print("="*60)

    if duplicates:
        print(f"\n⚠️  Found {len(duplicates)} duplicate(s) in incomplete-entries.json:\n")
        for i, dup in enumerate(duplicates, 1):
            print(f"{i}. {dup['character_name']} from {dup['work_name']}")
            print(f"   Work Type: {dup['work_type']}")
    else:
        print("\n✅ No duplicates found!")
        print("All entries in incomplete-entries.json are unique compared to ai-character-db.json")

    # Print missing fields analysis
    if entries_with_updates:
        print("\n" + "="*60)
        print("MISSING FIELDS ANALYSIS")
        print("="*60)
        print(f"\nFound {len(entries_with_updates)} entries with missing fields")
        print(f"Total fields to add: {total_fields_added}\n")

        for i, update in enumerate(entries_with_updates, 1):
            key = update['key']
            missing_fields = update['missing_fields']
            print(f"{i}. {key[2]} from {key[1]} ({key[0]})")
            print(f"   Missing fields ({len(missing_fields)}): {', '.join(missing_fields.keys())}")
            for field, value in missing_fields.items():
                # Truncate long values for display
                display_value = str(value)
                if len(display_value) > 60:
                    display_value = display_value[:57] + "..."
                print(f"     - {field}: {display_value}")
            print()

        # Apply updates
        if not dry_run:
            print("="*60)
            print("APPLYING UPDATES")
            print("="*60)

            for update in entries_with_updates:
                main_entry = update['main_entry']
                missing_fields = update['missing_fields']

                # Add missing fields to main entry
                for field, value in missing_fields.items():
                    main_entry[field] = value

            # Save updated database
            print(f"\nSaving updated ai-character-db.json...")
            save_database(main_db, 'ai-character-db.json')
            print(f"✅ Added {total_fields_added} fields to {len(entries_with_updates)} entries")
        else:
            print("\n" + "="*60)
            print("DRY RUN - No files were modified")
            print("Run without --dry-run to apply changes")
    else:
        print("\n✅ No missing fields found in main database entries")

    # Remove duplicates from incomplete-entries.json
    if duplicates and not dry_run:
        print("\n" + "="*60)
        print("REMOVING DUPLICATES FROM INCOMPLETE-ENTRIES.JSON")
        print("="*60)

        # Get set of duplicate keys
        duplicate_keys = set()
        for key in incomplete_entries_map.keys():
            if key in main_entries_map:
                duplicate_keys.add(key)

        # Filter out duplicate entries
        original_count = len(incomplete_entries)
        incomplete_entries_filtered = []
        for entry in incomplete_entries:
            key = get_entry_key(entry)
            if key not in duplicate_keys:
                incomplete_entries_filtered.append(entry)

        # Update the incomplete database
        incomplete_db['characters'] = incomplete_entries_filtered

        # Update metadata if it exists
        if 'metadata' in incomplete_db:
            incomplete_db['metadata']['total_entries'] = len(incomplete_entries_filtered)

        # Save updated incomplete database
        print(f"\nRemoving {len(duplicates)} duplicate entries from incomplete-entries.json...")
        save_database(incomplete_db, 'incomplete-entries.json')
        print(f"✅ Removed {original_count - len(incomplete_entries_filtered)} entries")
        print(f"   Incomplete entries remaining: {len(incomplete_entries_filtered)}")

    print("\n" + "="*60)


if __name__ == "__main__":
    main()
