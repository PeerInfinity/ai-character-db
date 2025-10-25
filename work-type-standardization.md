# Work Type Standardization

This document lists all `work_type` values found in the database and provides a mapping to standardize them.

## Current Work Types

Total unique work types: **60**

### All Work Types (with counts)

| Work Type | Count | Status | Standard Name |
|-----------|-------|--------|---------------|
| Video Game | 280 | ✅ Standard | Video Game |
| TV Show | 217 | ✅ Standard | TV Show |
| Book | 112 | ✅ Standard | Book |
| Movie | 103 | ✅ Standard | Movie |
| Comic Book | 66 | ✅ Standard | Comic Book |
| Webcomic | 56 | ✅ Standard | Webcomic |
| Anime | 48 | ✅ Standard | Anime |
| Tabletop RPG | 31 | ✅ Standard | Tabletop RPG |
| Fanfic | 26 | ⚠️ Merge | Fan Fiction |
| Web Animation | 20 | ✅ Standard | Web Animation |
| Web Video | 20 | ✅ Standard | Web Video |
| Tabletop Game | 17 | ✅ Standard | Tabletop Game |
| Short Story | 16 | ✅ Standard | Short Story |
| Literature | 15 | ⚠️ Merge? | Book |
| Fan Work | 14 | ⚠️ Merge | Fan Fiction |
| Manga | 12 | ✅ Standard | Manga |
| Web Fiction | 12 | ✅ Standard | Web Fiction |
| Book Series | 11 | ⚠️ Merge | Book |
| Fan Fiction | 11 | ✅ Standard | Fan Fiction |
| Visual Novel | 11 | ✅ Standard | Visual Novel |
| Website | 11 | ✅ Standard | Website |
| Audio Play | 10 | ✅ Standard | Audio Play |
| Light Novel | 7 | ✅ Standard | Light Novel |
| Comic Strip | 5 | ✅ Standard | Comic Strip |
| Franchise | 4 | ✅ Standard | Franchise |
| Manga/Anime | 4 | ⚠️ Ambiguous | (case by case) |
| Music | 4 | ✅ Standard | Music |
| Podcast | 4 | ✅ Standard | Podcast |
| Toy Line | 4 | ✅ Standard | Toy Line |
| Web Original | 4 | ⚠️ Merge | Web Fiction |
| Anime Movie | 3 | ⚠️ Merge | Movie |
| Film | 3 | ⚠️ Merge | Movie |
| Web Series | 3 | ✅ Standard | Web Series |
| Animated Movie | 2 | ⚠️ Merge | Movie |
| Cartoon Short | 2 | ✅ Standard | Cartoon Short |
| Forum Roleplay | 2 | ⚠️ Merge | Roleplay |
| Multimedia Franchise | 2 | ⚠️ Merge | Franchise |
| Radio | 2 | ✅ Standard | Radio |
| Roleplay | 2 | ✅ Standard | Roleplay |
| Web Serial Novel | 2 | ⚠️ Merge | Web Fiction |
| Actual Play Podcast | 1 | ⚠️ Merge | Podcast |
| Advertisement | 1 | ✅ Standard | Advertisement |
| Animated Short | 1 | ✅ Standard | Animated Short |
| ARG | 1 | ✅ Standard | ARG |
| Blog | 1 | ✅ Standard | Blog |
| Blog Fiction | 1 | ⚠️ Merge | Web Fiction |
| Fake Gaming News | 1 | ⚠️ Special | Website |
| Manga/Light Novel | 1 | ⚠️ Ambiguous | (case by case) |
| Music Video | 1 | ✅ Standard | Music Video |
| Mythology | 1 | ✅ Standard | Mythology |
| Pinball | 1 | ✅ Standard | Pinball |
| Radio Drama | 1 | ⚠️ Merge | Radio |
| Radio Show | 1 | ⚠️ Merge | Radio |
| Rant | 1 | ⚠️ Special | Web Video |
| Short Film | 1 | ⚠️ Merge | Movie |
| Social Media Bot | 1 | ✅ Standard | Social Media Bot |
| Theatre | 1 | ✅ Standard | Theatre |
| Theme Park Attraction | 1 | ✅ Standard | Theme Park Attraction |
| Trading Card Game | 1 | ⚠️ Merge | Tabletop Game |
| Web Serial | 1 | ⚠️ Merge | Web Fiction |

## Proposed Standardization Mapping

This mapping will be used to normalize work types across the database.

### Film/Movie Categories
```python
{
    "Film": "Movie",
    "Animated Movie": "Movie",
    "Anime Movie": "Movie",
    "Short Film": "Movie"
}
```

**Rationale**: All are essentially movies. If needed, `character_description` can note if it's animated/anime/short.

### Fan Content
```python
{
    "Fanfic": "Fan Fiction",
    "Fan Work": "Fan Fiction"
}
```

**Rationale**: These all refer to fan-created fiction. "Fan Fiction" is the most common term.

### Web Fiction
```python
{
    "Web Original": "Web Fiction",
    "Web Serial": "Web Fiction",
    "Web Serial Novel": "Web Fiction",
    "Blog Fiction": "Web Fiction"
}
```

**Rationale**: All are fiction published on the web. "Web Fiction" is inclusive and clear.

### Literature/Books
```python
{
    "Literature": "Book",
    "Book Series": "Book"
}
```

**Rationale**: "Literature" is redundant with "Book". Book series are still books.

### Radio Content
```python
{
    "Radio Drama": "Radio",
    "Radio Show": "Radio"
}
```

**Rationale**: Consolidate under "Radio" for simplicity.

### Podcasts
```python
{
    "Actual Play Podcast": "Podcast"
}
```

**Rationale**: It's still a podcast. Description can note it's actual play.

### Franchises
```python
{
    "Multimedia Franchise": "Franchise"
}
```

**Rationale**: All franchises are multimedia by nature.

### Tabletop Games
```python
{
    "Trading Card Game": "Tabletop Game"
}
```

**Rationale**: Trading card games fall under the tabletop game category.

### Roleplay
```python
{
    "Forum Roleplay": "Roleplay"
}
```

**Rationale**: The medium doesn't need to be specified in the type.

### Animated Shorts
```python
{
    "Animated Short": "Cartoon Short"
}
```

**Rationale**: These refer to the same type of content. "Cartoon Short" is more commonly used.

### Special Cases
```python
{
    "Fake Gaming News": "Website",
    "Rant": "Web Video"
}
```

**Rationale**: These are edge cases that fit better in broader categories.

## Ambiguous Cases (Needs Manual Review)

### Manga/Anime (4 entries)
These entries list both media types. Need to determine:
- Is it originally a manga adapted to anime?
- Is it originally an anime with a manga adaptation?
- Should we split into two entries?

### Manga/Light Novel (1 entry)
Same issue - needs to determine the original medium.

**Recommendation**: Review these entries individually and assign the **original/primary** medium.

## Complete Mapping Dictionary

```python
WORK_TYPE_MAPPING = {
    # Film/Movie consolidation
    "Film": "Movie",
    "Animated Movie": "Movie",
    "Anime Movie": "Movie",
    "Short Film": "Movie",

    # Fan content consolidation
    "Fanfic": "Fan Fiction",
    "Fan Work": "Fan Fiction",

    # Web fiction consolidation
    "Web Original": "Web Fiction",
    "Web Serial": "Web Fiction",
    "Web Serial Novel": "Web Fiction",
    "Blog Fiction": "Web Fiction",

    # Literature consolidation
    "Literature": "Book",
    "Book Series": "Book",

    # Radio consolidation
    "Radio Drama": "Radio",
    "Radio Show": "Radio",

    # Podcast consolidation
    "Actual Play Podcast": "Podcast",

    # Franchise consolidation
    "Multimedia Franchise": "Franchise",

    # Tabletop consolidation
    "Trading Card Game": "Tabletop Game",

    # Roleplay consolidation
    "Forum Roleplay": "Roleplay",

    # Animated short consolidation
    "Animated Short": "Cartoon Short",

    # Special cases
    "Fake Gaming News": "Website",
    "Rant": "Web Video",
}
```

## Statistics After Standardization

After applying this mapping, the database has **37** unique work types instead of 60 (23 types eliminated through consolidation).

### Largest Categories After Standardization:
- Video Game: 280
- TV Show: 217
- Book: 138 (112 + 15 + 11)
- Movie: 112 (103 + 2 + 3 + 3 + 1)
- Comic Book: 66
- Webcomic: 56
- Fan Fiction: 51 (26 + 14 + 11)
- Anime: 48
- Tabletop RPG: 31
- Web Fiction: 19 (12 + 4 + 1 + 2)
- Web Animation: 20
- Web Video: 21 (20 + 1)

## How to Apply Standardization

### Quick Start

```bash
# Preview changes without modifying files
python3 apply_work_type_standardization.py --dry-run

# Apply standardization (creates backup first)
python3 apply_work_type_standardization.py
```

### What the Script Does

1. **Fixes ambiguous entries**: Resolves "Manga/Anime" and "Manga/Light Novel" to primary medium
2. **Applies mapping**: Converts all non-standard work types to standard names
3. **Creates backup**: Saves `ai-character-db-backup.json` before making changes
4. **Updates metadata**: Marks database as standardized
5. **Generates report**: Shows all changes made

### Script Details

The standardization script (`apply_work_type_standardization.py`) consolidates:
- 60 work types → 37 work types (23 eliminated)
- Fixes 5 ambiguous entries (Manga/Anime → Manga, etc.)
- Standardizes 94 entries total
