# TVTropes HTML Parsing Guide

This guide explains how to download TVTropes pages and parse them into manageable batches for analysis.

## Overview

The parsing process consists of two main steps:
1. **Download HTML files** from TVTropes to the `cached-pages/` directory
2. **Run the splitting script** to extract and organize the examples into batch files

## Step 1: Downloading HTML Files

### Finding Pages to Download

When downloading a TVTropes page with examples, you need to:
1. Download the main page
2. Check if the page has "Example subpages" (pages with too many examples split content across multiple subpages)
3. Download all subpages if they exist

### Main Page Structure

TVTropes pages typically have this structure:
- **Main pages with Examples header**: Contains `<h2>Examples:</h2>` followed by examples
- **Main pages with Example subpages**: Contains `<h2>Example subpages:</h2>` with links to subpages, followed by `<h2>Other examples:</h2>` for remaining examples
- **Subpages**: Contain examples for a specific media category (Anime & Manga, Video Games, etc.)

### Download Commands

Use `curl` to download pages. The general format is:

```bash
# Main page
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/Main/TROPE_NAME" -o cached-pages/tvtropes-trope_name.html

# Subpages (if they exist)
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/TROPE_NAME/CATEGORY" -o cached-pages/tvtropes-trope_name_category.html
```

### Example: AI Is A Crapshoot

Here's a complete example of downloading a page with subpages:

```bash
# Create directory
mkdir -p cached-pages

# Download main page
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/Main/AIIsACrapshoot" -o cached-pages/tvtropes-ai_is_a_crapshoot.html

# Download subpages
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/AnimeAndManga" -o cached-pages/tvtropes-ai_is_a_crapshoot_anime_manga.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/ComicBooks" -o cached-pages/tvtropes-ai_is_a_crapshoot_comic_books.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/FanWorks" -o cached-pages/tvtropes-ai_is_a_crapshoot_fanworks.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/Film" -o cached-pages/tvtropes-ai_is_a_crapshoot_film.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/Literature" -o cached-pages/tvtropes-ai_is_a_crapshoot_literature.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/LiveActionTV" -o cached-pages/tvtropes-ai_is_a_crapshoot_liveactiontv.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/TabletopGames" -o cached-pages/tvtropes-ai_is_a_crapshoot_tabletopgames.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/VideoGames" -o cached-pages/tvtropes-ai_is_a_crapshoot_videogames.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/Webcomics" -o cached-pages/tvtropes-ai_is_a_crapshoot_webcomics.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/WebOriginal" -o cached-pages/tvtropes-ai_is_a_crapshoot_weboriginal.html
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/AIIsACrapshoot/WesternAnimation" -o cached-pages/tvtropes-ai_is_a_crapshoot_westernanimation.html
```

### Naming Convention

**Important**: Follow this naming convention:
- Main pages: `tvtropes-{trope_name}.html` (use underscores for spaces/special chars)
- Subpages: `tvtropes-{trope_name}_{category}.html` (use underscores, convert CamelCase to snake_case)

Examples:
- `AIIsACrapshoot` → `tvtropes-ai_is_a_crapshoot.html`
- `AnimeAndManga` → `_anime_manga`
- `LiveActionTV` → `_liveactiontv`
- `BenevolentAI` → `tvtropes-benevolent_ai.html`

## Step 2: Running the Splitting Script

Once you have downloaded the HTML files, run the splitting script from the project root directory:

```bash
# Make sure you're in the ai-character-db directory
python3 split-tvtropes-html.py
```

**Note**: The script uses relative paths, so it must be run from the directory containing the `cached-pages/` folder and the script itself.

### What the Script Does

The script performs the following operations:

1. **Finds all HTML files** in `cached-pages/`
2. **Extracts example content** between the `<hr data-format='&#8212;&#8212;' />` markers
3. **Splits long lines** so each `<li>` entry is on its own line
4. **Creates batches** of approximately 50 lines each
5. **Avoids splitting multiline entries** (entries with nested `<ul>` tags are kept together)
6. **Normalizes filenames** by converting underscores to dashes

### Output Structure

The script creates batch files in the `batches/` directory:

```
batches/
├── tvtropes-ai-is-a-crapshoot/
│   ├── tvtropes-ai-is-a-crapshoot-batch_01.html
│   ├── tvtropes-ai-is-a-crapshoot-batch_02.html
│   ├── tvtropes-ai-is-a-crapshoot-batch_03.html
│   └── tvtropes-ai-is-a-crapshoot-batch_04.html
├── tvtropes-ai-is-a-crapshoot-anime-manga/
│   ├── tvtropes-ai-is-a-crapshoot-anime-manga-batch_01.html
│   └── tvtropes-ai-is-a-crapshoot-anime-manga-batch_02.html
└── ...
```

### Batch File Format

Each batch file contains:
- Standard HTML wrapper (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)
- Extracted example entries, one per line (except for nested sub-lists)
- Closing HTML tags

Example content:
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body>
<li> Example entry 1...</li>
<li> Example entry 2 with nested items:
<ul ><li> Sub-item A</li>
<li> Sub-item B</li>
</ul></li>
<li> Example entry 3...</li>
</body>
</html>
```

## Understanding the HTML Structure

### Main Pages with Examples Header

Structure:
```
<h2>Examples:</h2>
<hr data-format='&#8212;&#8212;' />
[Example content]
<hr data-format='&#8212;&#8212;' />
```

The script extracts everything from the Examples header to the second `<hr>` marker.

### Subpages

Structure:
```
<hr data-format='&#8212;&#8212;' />
[Example content]
[End of content div]
```

Subpages have only one `<hr>` marker at the beginning. The script extracts from this marker to the end of the content.

### Nested Lists

Some entries contain nested sub-lists for related examples:

```html
<li> Main entry about a franchise
<ul ><li> Sub-entry about specific series 1</li>
<li> Sub-entry about specific series 2</li>
</ul></li>
```

The script keeps these multiline entries together in the same batch to maintain context.

## Verifying Results

After running the script, verify the output:

```bash
# Check how many batches were created
ls batches/tvtropes-ai-is-a-crapshoot/

# Check line counts
wc -l batches/tvtropes-ai-is-a-crapshoot/*.html

# View a sample batch
head -30 batches/tvtropes-ai-is-a-crapshoot/tvtropes-ai-is-a-crapshoot-batch_01.html
```

## Troubleshooting

### Issue: No batch files created for a page

**Cause**: The page might not have the expected `<hr data-format='&#8212;&#8212;' />` markers.

**Solution**: Check the HTML structure manually:
```bash
grep "hr data-format" cached-pages/tvtropes-your_page.html
grep "Examples:" cached-pages/tvtropes-your_page.html
```

### Issue: Batches seem too large or too small

**Cause**: The script creates batches of ~50 lines but extends to complete multiline entries.

**Solution**: This is expected behavior. The script prioritizes keeping related content together over strict line counts.

### Issue: Missing subpages

**Cause**: Not all subpages were downloaded.

**Solution**: Check the main page for the "Example subpages:" section and ensure all linked subpages are downloaded.

## Complete Workflow Example

Here's a complete workflow for a new trope:

```bash
# 1. Create directory if needed
mkdir -p cached-pages

# 2. Download main page
curl -s "https://tvtropes.org/pmwiki/pmwiki.php/Main/BenevolentAI" -o cached-pages/tvtropes-benevolent_ai.html

# 3. Check if there are subpages (manually view the page or grep)
grep "Example subpages:" cached-pages/tvtropes-benevolent_ai.html

# 4. If subpages exist, download them (adjust URLs based on the links found)
# curl -s "https://tvtropes.org/pmwiki/pmwiki.php/BenevolentAI/AnimeAndManga" -o cached-pages/tvtropes-benevolent_ai_anime_manga.html
# ... (repeat for all subpages)

# 5. Run the splitting script
python3 split-tvtropes-html.py

# 6. Verify output
ls -la batches/tvtropes-benevolent-ai/
```

## Notes

- The script ignores HTML files in `batches/` thanks to `.gitignore` configuration
- Batch sizes vary (typically 50-70 lines) due to the multiline entry protection
- Underscores in source filenames are converted to dashes in output directories
- The script processes all HTML files in `cached-pages/` in a single run
