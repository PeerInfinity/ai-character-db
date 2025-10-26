# AI Character Database Scripts

This document explains how to use the scripts for managing and merging AI character data.

## Overview

The database uses six main scripts:

1. **merge_json_files.py** - Merges all JSON files and filters entries by quality
2. **split_json_by_work_type.py** - Splits the database into work type files for progressive loading
3. **fix_invalid_entries.py** - Fixes entries with old/invalid field names
4. **resolve_duplicates.py** - Resolves duplicate entries by intelligently merging them
5. **apply_work_type_standardization.py** - Standardizes work type names across all files
6. **check_incomplete_duplicates.py** - Finds and resolves duplicates between incomplete and main databases

## Script 1: merge_json_files.py

### Purpose

Merges all JSON files in the current directory and filters entries based on data quality and schema compliance.

### Usage

```bash
# Merge JSON files in current directory only
python3 merge_json_files.py

# Merge JSON files in current directory AND batches subdirectories
python3 merge_json_files.py --batches
# or
python3 merge_json_files.py -b
```

### Options

- `-b, --batches` - Include JSON files from the `batches` directory and all of its subdirectories in addition to the current directory

### What It Does

The script processes entries in this order:

1. **Step 0: Filter Invalid Entries** - Removes entries with unexpected field names
   - Output: `invalid-entries.json`
   - These entries have fields not in the schema (e.g., `name`, `work`, `year`, `film`)

2. **Step 1: Filter Incomplete Entries** - Removes entries missing required fields
   - Output: `incomplete-entries.json`
   - Missing fields are automatically added with empty values

3. **Step 2: Filter Multi-Work Entries** - Removes characters appearing in multiple works
   - Output: `multi-work-entries.json`
   - Same character + work name, but different work_type or publication_year

4. **Step 3: Filter Duplicate Entries** - Removes duplicate character entries
   - Output: `duplicate-entries.json`
   - Same character + work name with different data
   - Note: Identical entries are merged (only one copy kept)

5. **Final Output** - Valid, complete, unique entries
   - Output: `ai-character-db.json`
   - These entries pass all validation checks

6. **Automatic Split** - Splits database into work type files
   - Automatically runs `split_json_by_work_type.py` after merging
   - Creates `data/` directory with individual work type files
   - Generates `version.json` for cache busting

### Sorting

All output files are sorted by:
1. `work_type` (alphabetically)
2. `work_name` (alphabetically)
3. `character_name` (alphabetically)

### Required Fields

Based on `collection-guide.md` schema v4.0:

**Required (must be present and non-empty):**
- `source_urls` (can be empty array `[]`)
- `work_url` (can be empty string `""`)
- `work_type`
- `work_name`
- `character_name`
- `character_description`
- `ai_qualification`
- `ai_qualification_explanation`
- `benevolence_rating`
- `benevolence_rating_explanation`
- `alignment_rating`
- `alignment_rating_explanation`

**Optional:**
- `publication_year`
- `character_type`

### Output Files

| File | Description | Fields Added |
|------|-------------|--------------|
| `ai-character-db.json` | Valid, complete entries | None |
| `invalid-entries.json` | Entries with unexpected fields | None |
| `incomplete-entries.json` | Entries missing required fields | Missing fields added as empty |
| `multi-work-entries.json` | Characters in multiple works | None |
| `duplicate-entries.json` | Duplicate character entries | None |

### Example Output

```
Loading all JSON files...
Loaded 2500 total entries from all files

Filtering entries...
Step 0: Filtered out 127 invalid entries (unexpected fields)
Remaining: 2373 entries
Step 1: Filtered out 2265 incomplete entries
Remaining: 108 entries
Step 2: Filtered out 0 multi-work entries
Remaining: 108 entries
Step 3: Filtered out 0 duplicate entries
Final valid entries: 54 entries

Saving filtered results...
Saved 54 entries to ai-character-db.json
Saved 127 entries to invalid-entries.json
Saved 2265 entries to incomplete-entries.json
Saved 0 entries to multi-work-entries.json
Saved 0 entries to duplicate-entries.json

=== Summary ===
Total entries processed: 2500
Valid entries: 54
Invalid entries (unexpected fields): 127
Incomplete entries: 2265
Multi-work entries: 0
Duplicate entries: 0
```

## Script 2: split_json_by_work_type.py

### Purpose

Splits the main `ai-character-db.json` file into separate JSON files by work type for progressive loading in the web interface. This enables:
- Faster initial page load (loads data incrementally)
- Visual progress indicator showing which work type is loading
- Better cache management for large datasets

### Usage

```bash
# Run manually (also runs automatically after merge_json_files.py)
python3 split_json_by_work_type.py
```

### What It Does

1. Reads `ai-character-db.json`
2. Groups characters by `work_type` field
3. Creates a `data/` directory if it doesn't exist
4. Writes separate JSON files for each work type:
   - `data/movie.json` (112 characters)
   - `data/tv-show.json` (217 characters)
   - `data/video-game.json` (280 characters)
   - etc. (37 files total)
5. Generates `data/manifest.json` with:
   - List of all work type files
   - Character counts per file
   - Content hashes for each file
   - Metadata from original database
6. Creates `version.json` in root directory for cache busting:
   - Version hash (MD5 of manifest)
   - Timestamp
   - Last updated date from metadata

### Output Files

| File | Description |
|------|-------------|
| `data/manifest.json` | Index of all work type files with metadata |
| `data/{work-type}.json` | Individual work type data files (37 files) |
| `version.json` | Cache busting version file |

### Example Output

```
Loading ai-character-db.json...
Total characters: 1198

Splitting into 37 work type files...
  ✓ Movie: 112 characters → movie.json
  ✓ TV Show: 217 characters → tv-show.json
  ✓ Video Game: 280 characters → video-game.json
  ✓ Book: 138 characters → book.json
  ...

✓ Manifest written to data/manifest.json
✓ Version file written to version.json

Cache busting version: 61193944

Done! Split 1198 characters into 37 files.
```

### Work Type File Format

Each work type file contains:

```json
{
  "work_type": "Movie",
  "character_count": 112,
  "characters": [
    { /* character entry */ },
    { /* character entry */ },
    ...
  ]
}
```

### Manifest Format

The `data/manifest.json` file contains:

```json
{
  "metadata": {
    "total_entries": 1198,
    "generated_by": "apply_work_type_standardization.py",
    "work_types_standardized": true
  },
  "generated_at": "2025-10-25T21:44:02.441649",
  "total_characters": 1198,
  "work_types": [
    {
      "work_type": "Movie",
      "filename": "movie.json",
      "character_count": 112,
      "hash": "a1b2c3d4"
    },
    ...
  ]
}
```

### Version File Format

The `version.json` file contains:

```json
{
  "version": "61193944",
  "timestamp": "2025-10-25T21:44:02.475003",
  "last_updated": "",
  "data_version": "2025-10-25T21:44:02.441649"
}
```

### Cache Busting

The version file enables automatic cache busting:
1. Web app loads `version.json?t={timestamp}` (always fresh)
2. Extracts version hash from the file
3. Loads all other resources with `?v={version}` parameter
4. When data updates, new version hash is generated
5. Browsers fetch fresh files automatically (no manual cache clearing)

### When to Run

This script runs automatically after `merge_json_files.py`, but you can also run it manually:
- After manually editing `ai-character-db.json`
- To regenerate version hash for cache busting
- To rebuild the `data/` directory

## Script 3: fix_invalid_entries.py

### Purpose

Fixes entries in `invalid-entries.json` by converting old field names to the new schema format.

### Usage

```bash
python3 fix_invalid_entries.py
```

### What It Does

1. Loads `invalid-entries.json`
2. Applies field name mappings:
   - `year` → `publication_year`
   - `work` → `work_name`
   - `name` → `character_name`
   - `film` → `work_name`
3. Removes fields not in schema:
   - `benevolence_rating_explanation_additional`
4. Saves results to `fixed-entries.json`

### Field Mapping Logic

- Only overwrites the new field if it doesn't already exist or is empty
- Removes the old field after mapping
- Preserves all other fields

### Example Transformation

**Before:**
```json
{
  "name": "HAL 9000",
  "film": "2001: A Space Odyssey",
  "year": 1968,
  "source_urls": [...],
  "character_description": "...",
  "ai_qualification": "Pass",
  ...
}
```

**After:**
```json
{
  "character_name": "HAL 9000",
  "work_name": "2001: A Space Odyssey",
  "publication_year": 1968,
  "source_urls": [...],
  "character_description": "...",
  "ai_qualification": "Pass",
  ...
}
```

### Output

- **Input:** `invalid-entries.json`
- **Output:** `fixed-entries.json`
- All entries in the output file will have valid schema field names

### Example Output

```
Loading invalid-entries.json...
Loaded 127 invalid entries

Fixing field names...
Saving to fixed-entries.json...
Saved 127 fixed entries to fixed-entries.json

=== Summary ===
Total entries fixed: 127

Field mappings applied:
  year -> publication_year
  work -> work_name
  name -> character_name
  film -> work_name

Fields removed (not in schema):
  benevolence_rating_explanation_additional
```

## Script 4: resolve_duplicates.py

### Purpose

Intelligently resolves duplicate character entries by merging information from multiple entries for the same character. This script is designed to handle the output from `duplicate-entries.json` created by `merge_json_files.py`.

### Usage

```bash
python3 resolve_duplicates.py
```

### What It Does

1. Reads `duplicate-entries.json`
2. Groups entries by work_name and character_name
3. For each group of duplicates:
   - Merges all unique source URLs from all entries
   - Selects the longer/more detailed descriptions
   - Selects the longer/more detailed explanations
   - Preserves optional fields (character_type, publication_year) when present
   - Keeps the best information from each duplicate entry
4. Writes the deduplicated entries back to `duplicate-entries.json`
5. Run `merge_json_files.py` to merge the resolved entries back into the main database

### Merging Strategy

The script uses intelligent field selection:

**Source URLs:**
- Combines all unique URLs from all duplicate entries
- Example: If one entry has `["url1"]` and another has `["url2"]`, result is `["url1", "url2"]`

**Text Fields (descriptions, explanations):**
- Prefers longer, more detailed content
- Ensures no information is lost in the merge

**Optional Fields (character_type, publication_year):**
- Preserves the field if present in any entry
- Prefers non-empty values over empty ones

**Other Fields:**
- Keeps the first non-empty value encountered

### Example Merge

**Before (2 duplicate entries):**

Entry 1:
```json
{
  "source_urls": ["https://tvtropes.org/pmwiki/pmwiki.php/Main/BenevolentAI"],
  "work_name": "Ghost in the Shell: Stand Alone Complex",
  "character_name": "Tachikomas",
  "character_type": "Spider Tank AI",
  "character_description": "AI-equipped spider tanks used by Section 9...",
  "ai_qualification": "Pass",
  ...
}
```

Entry 2:
```json
{
  "source_urls": ["https://tvtropes.org/pmwiki/pmwiki.php/Main/AIIsACrapshoot"],
  "work_name": "Ghost in the Shell: Stand Alone Complex",
  "character_name": "Tachikomas",
  "publication_year": 2002,
  "character_description": "The Tachikomas develop individuality beyond their programming...",
  "ai_qualification": "Pass",
  ...
}
```

**After (merged):**
```json
{
  "source_urls": [
    "https://tvtropes.org/pmwiki/pmwiki.php/Main/BenevolentAI",
    "https://tvtropes.org/pmwiki/pmwiki.php/Main/AIIsACrapshoot"
  ],
  "work_name": "Ghost in the Shell: Stand Alone Complex",
  "character_name": "Tachikomas",
  "character_type": "Spider Tank AI",
  "publication_year": 2002,
  "character_description": "The Tachikomas develop individuality beyond their programming...",
  "ai_qualification": "Pass",
  ...
}
```

### Output

```
Total entries before deduplication: 150
Found 71 groups of duplicates
Merged 2 entries for: Artemis from Black★★Rock Shooter: Dawn Fall
Merged 2 entries for: Layzner AI from Blue Comet SPT Layzner
Merged 3 entries for: Tachikomas from Ghost in the Shell: Stand Alone Complex
...
Total entries after deduplication: 71
Wrote deduplicated entries to duplicate-entries.json
```

### When to Use

Run this script when:
- `merge_json_files.py` produces a `duplicate-entries.json` with entries in it
- You have multiple entries for the same character from different sources
- You want to combine information from multiple duplicate entries rather than manually choosing one

### Workflow

1. Run `merge_json_files.py` to identify duplicates
2. Check if `duplicate-entries.json` has entries
3. If yes, run `resolve_duplicates.py` to merge them
4. Run `merge_json_files.py` again to merge the resolved entries into `ai-character-db.json`
5. Verify that `duplicate-entries.json` now shows 0 entries

## Typical Workflow

### Initial Data Merge

1. Place all JSON files with character data in the current directory
2. Run the merge script:
   ```bash
   python3 merge_json_files.py
   ```
3. Review the output:
   - `ai-character-db.json` - Your clean, merged database
   - `invalid-entries.json` - Entries with wrong field names
   - `incomplete-entries.json` - Entries needing more data

### Fixing Invalid Entries

If you have entries in `invalid-entries.json`:

1. Run the fix script:
   ```bash
   python3 fix_invalid_entries.py
   ```
2. This creates `fixed-entries.json` with corrected field names
3. Move/rename `fixed-entries.json` to something like `batch-fixed.json`
4. Run the merge script again to include the fixed entries:
   ```bash
   python3 merge_json_files.py
   ```

### Completing Incomplete Entries

If you have entries in `incomplete-entries.json`:

1. Open `incomplete-entries.json`
2. Find entries with empty fields (empty strings `""`)
3. Fill in the missing data
4. Save a subset of completed entries to a new file (e.g., `batch-completed.json`)
5. Run the merge script again:
   ```bash
   python3 merge_json_files.py
   ```

### Resolving Duplicate Entries

If you have entries in `duplicate-entries.json`:

1. Run the resolve duplicates script:
   ```bash
   python3 resolve_duplicates.py
   ```
2. This will intelligently merge duplicate entries, combining:
   - All source URLs from all duplicates
   - The most detailed descriptions and explanations
   - Optional fields like character_type and publication_year
3. Run the merge script again to integrate resolved entries:
   ```bash
   python3 merge_json_files.py
   ```
4. Verify that `duplicate-entries.json` now shows 0 entries

## Tips

### Avoiding Re-processing

The merge script loads **all** JSON files in the directory, including output files. To avoid re-processing:

**Option 1: Move output files**
```bash
mkdir output
mv *-entries.json output/
```

**Option 2: Delete temporary output files**
```bash
rm invalid-entries.json incomplete-entries.json multi-work-entries.json duplicate-entries.json
# Keep ai-character-db.json as your main database
```

**Option 3: Use the batches directory**
```bash
mkdir -p batches
mv batch*.json batches/
# Run from the root directory with --batches flag
python3 merge_json_files.py --batches
```

This option allows you to organize your batch files in subdirectories under `batches/` while keeping the output files in the root directory.

### Incremental Updates

To add new character data:

1. Create a new JSON file (e.g., `batch-new.json`) with new entries
2. Ensure `ai-character-db.json` is in the same directory
3. Run the merge script:
   ```bash
   python3 merge_json_files.py
   ```
4. The script will merge the new entries with existing ones
5. Review `duplicate-entries.json` to catch any duplicates

### Checking for Specific Issues

**Find entries with unexpected fields:**
```bash
python3 -c "
import json
with open('invalid-entries.json') as f:
    data = json.load(f)
print(f'Total invalid: {len(data[\"characters\"])}')
"
```

**Find entries missing specific fields:**
```bash
python3 -c "
import json
with open('incomplete-entries.json') as f:
    data = json.load(f)
missing_work_type = [e for e in data['characters'] if not e.get('work_type')]
print(f'Missing work_type: {len(missing_work_type)}')
"
```

**Count entries by work type:**
```bash
python3 -c "
import json
from collections import Counter
with open('ai-character-db.json') as f:
    data = json.load(f)
types = [e['work_type'] for e in data['characters']]
for work_type, count in Counter(types).most_common():
    print(f'{work_type}: {count}')
"
```

## Troubleshooting

### "FileNotFoundError: invalid-entries.json"

This means the merge script didn't find any entries with invalid field names. This is good! You can skip running `fix_invalid_entries.py`.

### "No entries loaded"

Make sure you have JSON files in the current directory. Check that they have either:
- A `"characters"` array at the top level, OR
- Are a direct array of character objects

### "JSON decode error"

One of your JSON files has invalid syntax. Common issues:
- Trailing comma after last entry in array
- Missing quotes around strings
- Missing commas between entries
- Unescaped quotes in string values

Use a JSON validator like `jsonlint.com` to find the syntax error.

### "All entries filtered out as incomplete"

Your entries are missing required fields. Check:
- Are you using the correct field names? (see Required Fields above)
- Are fields empty strings when they should have values?
- Look at `incomplete-entries.json` to see which fields are missing

## Script 5: apply_work_type_standardization.py

### Purpose

Standardizes work type names across the database by:
1. Fixing ambiguous work types (e.g., "Manga/Anime" → specific type)
2. Applying standardization mappings (e.g., "Film" → "Movie", "Radio Drama" → "Radio")
3. Optionally processing all JSON files in the directory

### Usage

```bash
# Process single file (ai-character-db.json)
python3 apply_work_type_standardization.py

# Dry run - see what would change without modifying files
python3 apply_work_type_standardization.py --dry-run

# Process all JSON files in directory and subdirectories
python3 apply_work_type_standardization.py --all

# Process all files without creating backups
python3 apply_work_type_standardization.py --all --no-backup

# Combine flags
python3 apply_work_type_standardization.py --all --dry-run
```

### Options

- `--dry-run` - Show what would change without modifying files
- `--all` - Process all JSON files in current directory and subdirectories (excludes "old" directory)
- `--no-backup` - Don't create backup files before modifying

### What It Does

1. **Fixes Ambiguous Entries** - Resolves entries with ambiguous work types like "Manga/Anime"
   - Uses a predefined mapping for known characters
   - Example: "Android 16 from Dragon Ball" - "Manga/Anime" → "Manga"

2. **Applies Standardization Mapping** - Converts non-standard work type names
   - `Film` → `Movie`
   - `Animated Movie` → `Movie`
   - `Anime Movie` → `Movie`
   - `Fanfic` → `Fan Fiction`
   - `Web Original` → `Web Fiction`
   - `Radio Drama` → `Radio`
   - `Radio Show` → `Radio`
   - `Trading Card Game` → `Tabletop Game`
   - And more...

3. **Updates Metadata** - Sets `work_types_standardized: true` in metadata

4. **Creates Backups** - Saves backup files (unless `--no-backup` is used)

### Ambiguous Work Type Resolutions

The script resolves these known ambiguous cases:

```python
("Dragon Ball", "Android 16"): "Manga"
("Dragon Ball", "Android 19"): "Manga"
("Dragon Ball", "Cell"): "Manga"
("Ghost in the Shell", "Puppetmaster"): "Manga"
("½ Prince", "Self-Aware NPCs"): "Light Novel"
```

### Example Output

```
Finding all JSON files in current directory and subdirectories...

Found 94 JSON file(s):
  • ai-character-db.json
  • batches/tvtropes-ai-is-a-crapshoot/tvtropes-ai-is-a-crapshoot-batch_01.json
  ...

============================================================
PROCESSING ALL FILES
============================================================

============================================================
Processing: ai-character-db.json
============================================================
Loaded 1198 entries

Step 1: Fixing ambiguous entries...
Fixed 5 ambiguous entries

Step 2: Applying standardization mapping...
Modified 12 entries

============================================================
WORK TYPE STANDARDIZATION REPORT
============================================================

Before: 37 unique work types
After:  35 unique work types
Reduction: 2 work types

--- Ambiguous Entries Fixed (5) ---
  • Android 16 from Dragon Ball
    Manga/Anime → Manga
  ...

--- Standardization Mapping (12 entries) ---
  • Film → Movie: 8 entries
  • Radio Drama → Radio: 2 entries
  • Trading Card Game → Tabletop Game: 2 entries

--- Top 15 Work Types After Standardization ---
  280  Video Game
  217  TV Show
  138  Book
  112  Movie (was 104)
  ...

============================================================

Saving standardized database...
Created backup: ai-character-db-backup.json
Saved: ai-character-db.json

✅ Standardization complete!

============================================================
SUMMARY: Processed 77/94 files successfully
============================================================

✅ All files processed!
```

### When to Use

- After merging new batch files that might have inconsistent work type names
- Before generating statistics or reports
- To ensure consistent work type naming across the entire database
- When preparing data for the web interface

## Script 6: check_incomplete_duplicates.py

### Purpose

Identifies duplicate entries between `incomplete-entries.json` and `ai-character-db.json`, then:
1. Adds any missing fields to entries in the main database
2. Removes the duplicate entries from incomplete-entries.json

This ensures that completed entries don't remain in the incomplete file and that the main database has all available information.

### Usage

```bash
# Process and update both files
python3 check_incomplete_duplicates.py

# Dry run - see what would change without modifying files
python3 check_incomplete_duplicates.py --dry-run
```

### Options

- `--dry-run` - Show what would change without modifying files

### What It Does

1. **Identifies Duplicates** - Finds entries that exist in both files
   - Matches based on `work_type`, `work_name`, and `character_name`

2. **Analyzes Missing Fields** - Compares duplicate entries
   - Identifies fields that exist in incomplete-entries.json but are missing/empty in ai-character-db.json
   - Common missing fields: `publication_year`, `character_type`

3. **Updates Main Database** - Adds missing fields
   - Only adds non-empty values
   - Preserves existing data (doesn't overwrite)

4. **Removes Duplicates** - Cleans up incomplete-entries.json
   - Removes all entries that now exist in the main database
   - Updates metadata with new entry count

### Example Output

```
Loading databases...
Main database: 1198 entries
Incomplete database: 453 entries

============================================================
DUPLICATE CHECK RESULTS
============================================================

⚠️  Found 52 duplicate(s) in incomplete-entries.json:

1. Android 8 from Dragon Ball
   Work Type: Anime
2. Android 16 from Dragon Ball Z
   Work Type: Anime
...

============================================================
MISSING FIELDS ANALYSIS
============================================================

Found 20 entries with missing fields
Total fields to add: 20

1. Android 16 from Dragon Ball Z (Anime)
   Missing fields (1): publication_year
     - publication_year: 1992

2. Proteus IV from Demon Seed (Movie)
   Missing fields (1): character_type
     - character_type: Digital AI
...

============================================================
APPLYING UPDATES
============================================================

Saving updated ai-character-db.json...
✅ Added 20 fields to 20 entries

============================================================
REMOVING DUPLICATES FROM INCOMPLETE-ENTRIES.JSON
============================================================

Removing 52 duplicate entries from incomplete-entries.json...
✅ Removed 52 entries
   Incomplete entries remaining: 401

============================================================
```

### When to Use

- After completing entries in incomplete-entries.json
- After merging new data that might have duplicates
- To clean up the incomplete entries file
- To ensure the main database has all available optional fields

### Workflow

1. Work on completing entries in `incomplete-entries.json`
2. Run `merge_json_files.py` to merge completed entries into main database
3. Run `check_incomplete_duplicates.py` to:
   - Add any missing optional fields to main database
   - Remove duplicates from incomplete-entries.json
4. Verify that duplicate entries are removed and fields are updated

## Schema Reference

See `collection-guide.md` for detailed information about:
- Valid field names and types
- Required vs optional fields
- Field value constraints
- Rating explanations
