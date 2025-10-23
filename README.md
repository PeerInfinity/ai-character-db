# AI Character Database

A database of AI characters from fiction, sourced from TV Tropes and other sources with detailed analysis.

**🌐 Browse Database:** [https://peerinfinity.github.io/ai-character-db/](https://peerinfinity.github.io/ai-character-db/)

## Project Overview

This project collects and analyzes AI characters from various sources, evaluating:
- **Benevolence**: Benevolent, Malevolent, Ambiguous, or N/A
- **Alignment**: Aligned, Misaligned, Ambiguous, or N/A (with creator intent)
- **AI Qualification**: Does it meet the criteria for an artificial intelligence?

## Current Files

### Data Files
- **ai-character-db.json** - Character database (50 entries, schema v4.0)
- **collection-progress.json** - Tracks collection progress (legacy format)
- **skipped-entries.json** - Tracks entries that were reviewed but not included

### Display
- **index.html** - Interactive web interface
  - Toggle between Benevolence and Alignment views
  - Filter by benevolence, alignment, and AI qualification
  - Search functionality
  - Work type folders with rating breakdowns
  - Collapsible sections for descriptions and assessments
  - Expand/collapse all controls

### Documentation
- **[collection-guide.md](collection-guide.md)** - Data format and field descriptions
- **[scripts.md](scripts.md)** - Guide for using the merge and fix scripts
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
  "alignment_rating_explanation": "Why this rating was assigned"
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

### Data Quality
- Detailed explanations for every rating
- AI qualification assessment (mechanical vs biological/magical)
- Independent benevolence and alignment ratings
- Multiple source tracking via `source_urls`

## Current Status

**Total Entries**: 50 characters (schema v4.0)
**Status**: Active collection in progress

**Sources Covered So Far**:
- Benevolent AI (Anime & Manga): 7 entries
- Artificial Intelligence (Anime & Manga): 4 entries
- AI Is A Crapshoot (Anime & Manga): 39 entries

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

