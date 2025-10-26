#!/usr/bin/env python3
"""
Complete work type standardization for the AI character database.

This script:
1. Fixes ambiguous work types (Manga/Anime -> primary medium)
2. Applies standardization mapping (Film -> Movie, Fanfic -> Fan Fiction, etc.)
3. Generates a detailed report

Usage:
    python3 apply_work_type_standardization.py [--dry-run] [--all] [--no-backup]

Options:
    --dry-run: Show what would change without modifying files
    --all: Process all JSON files in current directory and subdirectories
    --no-backup: Don't create backup files before modifying
"""

import json
import sys
from collections import Counter
from pathlib import Path


# Ambiguous work type resolutions
AMBIGUOUS_RESOLUTIONS = {
    ("Dragon Ball", "Android 16"): "Manga",
    ("Dragon Ball", "Android 19"): "Manga",
    ("Dragon Ball", "Cell"): "Manga",
    ("Ghost in the Shell", "Puppetmaster"): "Manga",
    ("½ Prince", "Self-Aware NPCs"): "Light Novel",
}

# Work type standardization mapping
WORK_TYPE_MAPPING = {
    "Film": "Movie",
    "Animated Movie": "Movie",
    "Anime Movie": "Movie",
    "Short Film": "Movie",
    "Fanfic": "Fan Fiction",
    "Fan Work": "Fan Fiction",
    "Web Original": "Web Fiction",
    "Web Serial": "Web Fiction",
    "Web Serial Novel": "Web Fiction",
    "Blog Fiction": "Web Fiction",
    "Literature": "Book",
    "Book Series": "Book",
    "Radio Drama": "Radio",
    "Radio Show": "Radio",
    "Actual Play Podcast": "Podcast",
    "Multimedia Franchise": "Franchise",
    "Trading Card Game": "Tabletop Game",
    "Forum Roleplay": "Roleplay",
    "Fake Gaming News": "Website",
    "Rant": "Web Video",
    "Animated Short": "Cartoon Short",
}


def load_database(filename="ai-character-db.json"):
    """Load the character database."""
    with open(filename, 'r') as f:
        return json.load(f)


def save_database(data, filename="ai-character-db.json"):
    """Save the character database."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_work_type_stats(data):
    """Get work type statistics."""
    work_types = Counter(e['work_type'] for e in data['characters'])
    return work_types


def fix_ambiguous_entries(data, resolutions=AMBIGUOUS_RESOLUTIONS):
    """Fix ambiguous work types like 'Manga/Anime'."""
    changes = []

    for entry in data['characters']:
        key = (entry['work_name'], entry['character_name'])
        if key in resolutions:
            old_type = entry['work_type']
            new_type = resolutions[key]
            entry['work_type'] = new_type
            changes.append((entry['character_name'], entry['work_name'], old_type, new_type))

    return changes


def standardize_work_types(data, mapping=WORK_TYPE_MAPPING):
    """Apply work type standardization mapping."""
    changes = Counter()

    for entry in data['characters']:
        original_type = entry['work_type']
        if original_type in mapping:
            new_type = mapping[original_type]
            entry['work_type'] = new_type
            changes[f"{original_type} → {new_type}"] += 1

    return changes


def print_report(before_stats, after_stats, ambiguous_changes, mapping_changes):
    """Print a detailed report of changes."""
    print("\n" + "="*60)
    print("WORK TYPE STANDARDIZATION REPORT")
    print("="*60)

    print(f"\nBefore: {len(before_stats)} unique work types")
    print(f"After:  {len(after_stats)} unique work types")
    print(f"Reduction: {len(before_stats) - len(after_stats)} work types")

    if ambiguous_changes:
        print(f"\n--- Ambiguous Entries Fixed ({len(ambiguous_changes)}) ---")
        for char, work, old, new in ambiguous_changes:
            print(f"  • {char} from {work}")
            print(f"    {old} → {new}")

    if mapping_changes:
        print(f"\n--- Standardization Mapping ({sum(mapping_changes.values())} entries) ---")
        for change, count in mapping_changes.most_common():
            print(f"  • {change}: {count} entries")

    print(f"\n--- Top 15 Work Types After Standardization ---")
    for work_type, count in after_stats.most_common(15):
        change = ""
        # Check if this was affected
        before_count = before_stats.get(work_type, 0)
        if before_count != count:
            change = f" (was {before_count})"
        print(f"  {count:3d}  {work_type}{change}")

    print("\n" + "="*60)


def find_json_files():
    """Find all JSON files in current directory and subdirectories."""
    json_files = []
    for json_file in Path('.').rglob('*.json'):
        # Skip backup files, hidden directories, and 'old' directory
        if not any(part.startswith('.') for part in json_file.parts):
            if 'backup' not in json_file.name.lower():
                if 'old' not in json_file.parts:
                    json_files.append(json_file)
    return sorted(json_files)


def process_single_file(filename, dry_run=False, no_backup=False):
    """Process a single JSON file."""
    print(f"\n{'='*60}")
    print(f"Processing: {filename}")
    print(f"{'='*60}")

    try:
        print("Loading database...")
        data = load_database(filename)

        # Verify it has the expected structure
        if 'characters' not in data:
            print(f"⚠️  Skipping {filename}: No 'characters' field found")
            return False

        print(f"Loaded {len(data['characters'])} entries")

        # Get before stats
        before_stats = get_work_type_stats(data)

        # Step 1: Fix ambiguous entries
        print("\nStep 1: Fixing ambiguous entries...")
        ambiguous_changes = fix_ambiguous_entries(data)
        if ambiguous_changes:
            print(f"Fixed {len(ambiguous_changes)} ambiguous entries")
        else:
            print("No ambiguous entries to fix")

        # Step 2: Apply standardization mapping
        print("\nStep 2: Applying standardization mapping...")
        mapping_changes = standardize_work_types(data)
        if mapping_changes:
            print(f"Modified {sum(mapping_changes.values())} entries")
        else:
            print("No mapping changes needed")

        # Get after stats
        after_stats = get_work_type_stats(data)

        # Print report
        print_report(before_stats, after_stats, ambiguous_changes, mapping_changes)

        # Save results
        if not dry_run:
            print("\nSaving standardized database...")
            # Update metadata
            if 'metadata' not in data:
                data['metadata'] = {}
            data['metadata']['work_types_standardized'] = True
            data['metadata']['total_entries'] = len(data['characters'])

            # Backup original (unless --no-backup flag is set)
            if not no_backup:
                import shutil
                backup_name = str(filename).replace('.json', '-backup.json')
                shutil.copy(filename, backup_name)
                print(f"Created backup: {backup_name}")

            # Save standardized version
            save_database(data, filename)
            print(f"Saved: {filename}")
            print("\n✅ Standardization complete!")
        else:
            print("\nDRY RUN - No files were modified")

        return True

    except json.JSONDecodeError as e:
        print(f"⚠️  Skipping {filename}: Invalid JSON - {e}")
        return False
    except Exception as e:
        print(f"⚠️  Error processing {filename}: {e}")
        return False


def main():
    dry_run = "--dry-run" in sys.argv
    process_all = "--all" in sys.argv
    no_backup = "--no-backup" in sys.argv

    if dry_run:
        print("DRY RUN MODE - No files will be modified\n")

    if no_backup and not dry_run:
        print("NO BACKUP MODE - Backup files will not be created\n")

    if process_all:
        print("Finding all JSON files in current directory and subdirectories...")
        json_files = find_json_files()

        if not json_files:
            print("No JSON files found!")
            return

        print(f"\nFound {len(json_files)} JSON file(s):")
        for f in json_files:
            print(f"  • {f}")

        print("\n" + "="*60)
        print("PROCESSING ALL FILES")
        print("="*60)

        successful = 0
        for json_file in json_files:
            if process_single_file(str(json_file), dry_run, no_backup):
                successful += 1

        print("\n" + "="*60)
        print(f"SUMMARY: Processed {successful}/{len(json_files)} files successfully")
        print("="*60)

        if not dry_run:
            print("\n✅ All files processed!")
        else:
            print("\nDRY RUN - Run without --dry-run to apply changes")
    else:
        # Process single file (original behavior)
        process_single_file("ai-character-db.json", dry_run, no_backup)

        if dry_run:
            print("\nRun without --dry-run to apply changes")


if __name__ == "__main__":
    main()
