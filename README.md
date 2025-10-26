# AI Character Database

A database of AI characters from fiction, sourced from TV Tropes and other sources with detailed ratings and analysis.

**🌐 Browse Database:** [https://peerinfinity.github.io/ai-character-db/](https://peerinfinity.github.io/ai-character-db/)

**📊 Current Size:** 1,198 characters across 37 work types

## Project Overview

This project collects and analyzes AI characters from various fictional works, evaluating each on three dimensions:
- **Benevolence**: Is the AI good, evil, or morally ambiguous?
- **Alignment**: Does it follow its creator's intent, or has it deviated?
- **AI Qualification**: Is it actually an AI (computational/mechanical) or something else?

## Current Files

### Data Files
- **ai-character-db.json** - Main character database (1,198 entries, schema v4.0)
- **data/** - Directory containing split data files by work type (37 files)
  - **manifest.json** - Index of all work type files with metadata
  - Individual work type files (e.g., `movie.json`, `tv-show.json`, `book.json`)
- **version.json** - Cache busting version file with timestamp
- **duplicate-entries.json** - Duplicate character entries identified by merge script
- **incomplete-entries.json** - Entries missing required fields
- **invalid-entries.json** - Entries with incorrect field names
- **multi-work-entries.json** - Characters appearing in multiple works

### Display
- **index.html** - Interactive web interface
  - Progressive loading with visual progress indicator
  - Toggle between Benevolence and Alignment views
  - Filter by benevolence, alignment, and AI qualification
  - Search functionality
  - Work type folders with rating breakdowns
  - Collapsible sections for descriptions and assessments
  - Expand/collapse all controls
  - Dark/Light theme toggle
  - Automatic cache busting for fresh data

### Scripts
- **merge_json_files.py** - Merges JSON files and filters by quality (now automatically runs split script)
- **split_json_by_work_type.py** - Splits main database into work type files for progressive loading
- **fix_invalid_entries.py** - Fixes entries with old/invalid field names
- **resolve_duplicates.py** - Intelligently merges duplicate entries
- **split_tvtropes_html.py** - Extracts character entries from TVTropes HTML
- **apply_work_type_standardization.py** - Standardizes work type names across database
- **check_incomplete_duplicates.py** - Syncs duplicates between incomplete and main databases

### Documentation
- **[collection-guide.md](collection-guide.md)** - Data format and field descriptions
- **[scripts.md](scripts.md)** - Guide for using the merge and fix scripts
- **[parsing-tvtropes.md](parsing-tvtropes.md)** - Guide for extracting data from TVTropes pages
- **[work-type-standardization.md](work-type-standardization.md)** - Work type normalization guide
- **[ai-character-catalog.md](ai-character-catalog.md)** - A list of AI characters
- **README.md** - This file

## Data Schema (v4.0)

Each character entry includes:

```json
{
  "source_urls": ["https://example.com/source1", "https://example.com/source2"],
  "work_url": "https://tvtropes.org/pmwiki/pmwiki.php/...",
  "work_type": "Movie|TV Show|Book|etc.",
  "work_name": "Name of the work",
  "publication_year": 1984,
  "character_type": "Robot|Android|Digital AI|etc.",
  "character_name": "AI character name",
  "character_description": "Description of the character",
  "ai_qualification": "Pass|Fail|Ambiguous",
  "ai_qualification_explanation": "Why this rating was assigned",
  "benevolence_rating": "Benevolent|Malevolent|Ambiguous|N/A",
  "benevolence_rating_explanation": "Why this rating was assigned",
  "alignment_rating": "Aligned|Misaligned|Ambiguous|N/A",
  "alignment_rating_explanation": "Why this rating was assigned",
  "needs_research": false
}
```

## Data Sources

Data can be collected from various sources:

**Primary Sources (TV Tropes)**:
1. **Benevolent AI**: https://tvtropes.org/pmwiki/pmwiki.php/Main/BenevolentAI
2. **AI Is A Crapshoot**: https://tvtropes.org/pmwiki/pmwiki.php/Main/AIIsACrapshoot
3. **Artificial Intelligence**: https://tvtropes.org/pmwiki/pmwiki.php/Main/ArtificialIntelligence

**Other Potential Sources**:
- Fan wikis (Fandom, etc.)
- Official game/movie/book websites
- Science fiction databases
- Personal knowledge of fictional AI characters

## Features

### Web Interface
- **Progressive Loading**: Data loads incrementally by work type with visual progress bar
- **Cache Busting**: Automatic versioning ensures fresh data without manual cache clearing
- **Benevolence/Alignment Toggle**: Switch between viewing by Benevolence or Alignment ratings
- **Statistics Dashboard**: Character and work counts by rating category
- **Advanced Filtering**: By benevolence, alignment, and AI qualification
- **Work Type Folders**: Entries grouped by medium (Movies, TV, Books, Anime, etc.)
- **Rating Breakdowns**: Color-coded counts in each work type folder
- **Collapsible Sections**: Descriptions and assessments can be shown/hidden
- **Expand/Collapse Controls**: Bulk expand/collapse for all four categories (Descriptions, AI Qualification, Benevolence, Alignment)
- **Search**: Free-text search across all fields
- **Source URLs**: Numbered links to source pages for each character
- **Dark/Light Mode**: Theme toggle for comfortable viewing
- **Processing Indicators**: Visual feedback during filtering and display operations

### Data Quality
- Detailed explanations for every rating
- AI qualification assessment (mechanical vs biological/magical)
- Independent benevolence and alignment ratings
- Multiple source tracking via `source_urls`

## Current Status

**Total Entries**: 1,198 characters (schema v4.0)
**Status**: Active collection in progress

### Database Statistics

**By Rating Category**:
- Benevolence: 491 Malevolent, 354 Benevolent, 317 Ambiguous, 36 N/A
- Alignment: 646 Misaligned, 311 Aligned, 184 Ambiguous, 57 N/A
- AI Qualification: 1,111 Pass, 62 Ambiguous, 17 Fail, 8 N/A

**Top Work Types** (37 unique types, standardized):
- Video Game: 280 entries
- TV Show: 217 entries
- Book: 138 entries (includes Literature, Book Series)
- Movie: 112 entries (includes Film, Animated Movie, Anime Movie, Short Film)
- Comic Book: 66 entries
- Webcomic: 56 entries
- Fan Fiction: 51 entries (includes Fanfic, Fan Work)
- Anime: 48 entries
- Tabletop RPG: 31 entries
- Plus 29 additional work types

### Sources Processed

**TVTropes Pages Completed**:
- AI Is A Crapshoot
- Benevolent AI
- Artificial Intelligence

## Data Processing Workflow

The project uses a multi-script pipeline for processing character data:

1. **split_tvtropes_html.py** - Extracts character entries from TVTropes HTML pages
2. **merge_json_files.py** - Merges all JSON files and filters by quality
   - Use `--batches` flag to include files from `/batches/` subdirectories
   - Produces: `ai-character-db.json`, `duplicate-entries.json`, `incomplete-entries.json`, `invalid-entries.json`, `multi-work-entries.json`
   - Automatically runs `split_json_by_work_type.py` after merging
3. **split_json_by_work_type.py** - Splits the main database into work type files
   - Creates `data/` directory with individual JSON files for each work type
   - Generates `data/manifest.json` with file index and metadata
   - Creates `version.json` for cache busting
4. **fix_invalid_entries.py** - Converts old field names to schema v4.0 format
5. **resolve_duplicates.py** - Intelligently merges duplicate entries
6. **apply_work_type_standardization.py** - Standardizes work type names
   - Fixes ambiguous work types (e.g., "Manga/Anime" → "Manga")
   - Applies standardization mappings (e.g., "Film" → "Movie")
   - Use `--all` to process all JSON files, `--dry-run` to preview changes
7. **check_incomplete_duplicates.py** - Syncs incomplete and main databases
   - Identifies duplicates between `incomplete-entries.json` and `ai-character-db.json`
   - Adds missing fields to main database
   - Removes duplicates from incomplete entries
   - Use `--dry-run` to preview changes

See [scripts.md](scripts.md) for detailed usage instructions.

### Cache Busting System

The application uses a version-based cache busting strategy:

- **version.json** is always loaded fresh (bypasses cache with timestamp parameter)
- All other resources (CSS, data files) use the version from `version.json` as a query parameter
- When data is updated and `split_json_by_work_type.py` runs, a new version hash is generated
- Browsers automatically fetch fresh files because the version parameter changes
- No manual cache clearing needed by users

## Rating Guidance

**Benevolence** (Good vs Evil):
- **Benevolent**: Helpful, friendly, protective of humans
- **Malevolent**: Harmful, hostile, destructive
- **Ambiguous**: Mixed intentions, context-dependent, or unclear
- **N/A**: Insufficient information

**Alignment** (Following Creator Intent):
- **Aligned**: Behaves as creators intended
- **Misaligned**: Deviates from creator intent (goal misalignment, unexpected behavior)
- **Ambiguous**: Unclear if deviation occurred, or if creators intended harmful behavior
- **N/A**: Creator intent unknown

## License

This is a personal data collection project. The data is sourced from various public sources and used for educational/research purposes.

