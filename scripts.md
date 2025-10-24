# AI Character Database Scripts

This document explains how to use the scripts for managing and merging AI character data.

## Overview

The database uses two main scripts:

1. **merge_json_files.py** - Merges all JSON files and filters entries by quality
2. **fix_invalid_entries.py** - Fixes entries with old/invalid field names

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

## Script 2: fix_invalid_entries.py

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

## Schema Reference

See `collection-guide.md` for detailed information about:
- Valid field names and types
- Required vs optional fields
- Field value constraints
- Rating explanations
