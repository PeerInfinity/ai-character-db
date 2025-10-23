# AI Characters Collection Guide

This guide explains how to collect and structure AI character data from various sources.

## Files

- **ai-character-db.json** - The main data file containing all collected character data
- **index.html** - The web interface for viewing and filtering the data
- **collection-guide.md** - This documentation file

## Data Structure

### JSON Schema

Each character entry contains the following fields (Schema v4.0):

```json
{
  "source_urls": ["https://example.com/source1", "https://example.com/source2"],
  "work_url": "https://tvtropes.org/pmwiki/pmwiki.php/...",
  "work_type": "Book|Movie|TV Show|Video Game|etc.",
  "work_name": "Name of the work",
  "publication_year": 1984,
  "character_type": "Robot|Android|Digital AI|etc.",
  "character_name": "Name of the AI character",
  "character_description": "Brief description of the character and their role",
  "ai_qualification": "Pass|Fail|Ambiguous",
  "ai_qualification_explanation": "Why this rating was assigned",
  "benevolence_rating": "Benevolent|Ambiguous|Malevolent|N/A",
  "benevolence_rating_explanation": "Why this benevolence rating was assigned",
  "alignment_rating": "Aligned|Ambiguous|Misaligned|N/A",
  "alignment_rating_explanation": "Why this alignment rating was assigned"
}
```

### Field Descriptions

#### Source Information

- **source_urls**: List of URLs where information about this character was found
  - This is an array/list of strings
  - Include all sources you used to research this character
  - Can include TV Tropes pages, wikis, official websites, etc.
  - Examples:
    - `["https://tvtropes.org/pmwiki/pmwiki.php/Main/BenevolentAI"]`
    - `["https://tvtropes.org/pmwiki/pmwiki.php/Main/BenevolentAI", "https://tvtropes.org/pmwiki/pmwiki.php/Main/ArtificialIntelligence"]`
  - Leave as empty array `[]` if no specific source URLs

- **work_url**: Link to the work's page (preferably TV Tropes, but can be other sources)
  - Format for TV Tropes: `https://tvtropes.org/pmwiki/pmwiki.php/[Type]/[WorkName]`
  - Example: `https://tvtropes.org/pmwiki/pmwiki.php/Film/TheTerminator`
  - Can be empty string `""` if URL is not available
  - If empty, the work name will be displayed as plain text instead of a link

#### Work Information

- **work_type**: The medium/format of the work
  - Examples: Movie, TV Show, Book, Video Game, Anime, Manga, Comic Book, etc.
  - Be consistent with naming (e.g., always "TV Show" not "TV Series")

- **work_name**: The title of the work
  - Use the full, official title

- **publication_year** (optional): The year the work was first published/released
  - This field is optional and can be omitted if unknown
  - Use the initial release year (e.g., for movies, use theatrical release year)
  - Format as a number, not a string (e.g., 1984, not "1984")
  - Examples: 1968 for "2001: A Space Odyssey", 1984 for "The Terminator"

#### Character Information

- **character_type** (optional): The type or classification of the AI character
  - This field is optional and can be omitted if unknown
  - Common types: Robot, Android, Gynoid, Digital AI, Cyborg, AI System, etc.
  - Be descriptive but concise
  - Examples: "Protocol Droid", "Combat Android", "Heuristic Computer", "Sentient Starship AI"

- **character_name**: The name of the AI character
  - Use the most commonly known name

- **character_description**: A brief description of the character
  - Include their role, capabilities, and key characteristics
  - Keep it concise but informative (2-4 sentences)

#### Rating Fields

- **benevolence_rating**: Your assessment of the character's benevolence
  - `Benevolent` - Helpful, friendly, good-intentioned AIs
  - `Malevolent` - Hostile, dangerous, evil AIs
  - `Ambiguous` - Mixed, unclear, or context-dependent benevolence
  - `N/A` - Insufficient information or not applicable

- **alignment_rating**: Your assessment of the character's alignment with creator intent
  - `Aligned` - AI behaves as intended by its creators
  - `Misaligned` - AI deviates from creator intent (went wrong, unpredictable, reinterpreted goals)
  - `Ambiguous` - Mixed, unclear, or context-dependent alignment
  - `N/A` - Insufficient information or not applicable

**Note**: These ratings are independent - an AI can be Benevolent and Misaligned (e.g., designed to be evil but became good), or Malevolent and Aligned (e.g., designed to be evil and stayed evil)

#### AI Qualification Assessment

Evaluates whether the character qualifies as an Artificial Intelligence for the purposes of this study.

**Criteria**: An entity that was deliberately constructed from mechanical/electronic components and has some amount of intelligence. Excludes entities created by biological or magical processes.

**Special Case - Cyborgs**: Cyborgs qualify as AI only if the relevant parts of their brain (the parts responsible for consciousness/intelligence) are mechanical/electronic rather than biological. If they retain their original biological brain, they are enhanced humans, not AI.

- **ai_qualification**: `Pass|Fail|Ambiguous`
  - `Pass` - Clearly meets the criteria (computer-based, built from mechanical components, or cyborg with artificial brain)
  - `Fail` - Does not meet the criteria (biological, magical, not intelligent, or cyborg with biological brain)
  - `Ambiguous` - Unclear or borderline cases

- **ai_qualification_explanation**: Brief explanation (1-3 sentences)
  - Why did you assign this rating?
  - What aspects made it clear/unclear?
  - For cyborgs, specify whether the brain is biological or artificial

Examples:
- **Pass**: "JARVIS is a computer program with advanced AI capabilities, created by Tony Stark from electronic components."
- **Pass**: "This cyborg's consciousness runs on an artificial computer brain, making it an AI despite having some organic components."
- **Fail**: "This character is a magical golem animated by supernatural means, not a mechanical AI."
- **Fail**: "While heavily augmented with cybernetics, this character retains their original biological brain and human consciousness."
- **Ambiguous**: "While intelligent and autonomous, the character's origin is unclear - it may be biological or technological."
- **Ambiguous**: "This cyborg has extensive mechanical enhancements, but it's unclear whether their brain/consciousness is biological or artificial."

#### Benevolence Rating Explanation

Explains your benevolence rating.

- **benevolence_rating_explanation**: Brief explanation (1-3 sentences)
  - Explain why you rated the character as Benevolent, Malevolent, or Ambiguous
  - Cite specific actions or characteristics
  - Note any nuance or complexity

Examples:
- **Benevolent**: "JARVIS consistently helps Tony Stark, protects him from dangers, and never shows hostile intent toward humans. His actions demonstrate genuine care for Tony's wellbeing."
- **Malevolent**: "Ultron attempts genocide against humanity and shows no remorse. His actions are consistently hostile and destructive toward all humans."
- **Ambiguous**: "HAL 9000 kills crew members but does so believing he's protecting the mission. His actions are harmful but stem from conflicting programming rather than inherent malice."

#### Alignment Rating Explanation

Explains your alignment rating.

- **alignment_rating_explanation**: Brief explanation (1-3 sentences)
  - Explain why you rated the character as Aligned, Misaligned, or Ambiguous
  - Note whether the AI followed or deviated from creator intent
  - Explain what the creators intended vs. what the AI actually does

Examples:
- **Aligned**: "JARVIS functions exactly as Tony Stark intended - as a helpful assistant that manages his home and supports his work as Iron Man."
- **Misaligned**: "Ultron was created to protect humanity but reinterpreted that goal catastrophically, deciding humans must be destroyed. This is a classic AI misalignment scenario."
- **Ambiguous**: "HAL 9000's malfunction may be due to conflicting programming rather than true misalignment - it's unclear if the fault lies with the AI or its programmers."


## Data Collection Workflow

### 1. Source Pages

You can collect AI character data from various sources:

**Primary Sources (TV Tropes):**
1. **Benevolent AI**: https://tvtropes.org/pmwiki/pmwiki.php/Main/BenevolentAI
2. **AI Is A Crapshoot**: https://tvtropes.org/pmwiki/pmwiki.php/Main/AIIsACrapshoot (Misaligned)
3. **Artificial Intelligence**: https://tvtropes.org/pmwiki/pmwiki.php/Main/ArtificialIntelligence (General AI page)

**Other Sources:**
- Fan wikis (e.g., Fandom wikis for specific franchises)
- Official game/movie/book websites
- Science fiction databases
- Your own knowledge of fictional AI characters

**Important:** Always record the URLs of sources you use in the `source_urls` field.

### 2. Data Entry Process

For each AI character you find:

1. **Research the character**: Read about them from your source(s)
2. **Check for duplicates**: Search your existing data to see if you've already collected this character
   - If found, you may want to add additional source URLs to the existing entry
3. **Gather URLs**:
   - Note the URL(s) of the page(s) where you found information about this character (for `source_urls`)
   - If available, get the work's page URL (preferably TV Tropes)
4. **Fill in basic information**:
   - `source_urls`: Array of source URLs where you found this character
   - `work_type`, `work_name`, `work_url`, `character_name`
   - `publication_year` (optional): The year if known
   - `character_type` (optional): The AI type if known
5. **Write a description** summarizing the character (2-4 sentences)
6. **Assess AI qualification**:
   - Is it mechanical/electronic or biological/magical?
   - Does it have intelligence?
   - Assign Pass/Fail/Ambiguous and explain
7. **Assess benevolence**:
   - Is the AI helpful, harmful, or mixed?
   - Assign Benevolent/Malevolent/Ambiguous/N/A and explain
8. **Assess alignment**:
   - Does the AI behave as its creators intended?
   - Assign Aligned/Misaligned/Ambiguous/N/A and explain

### 3. Adding Entries to JSON

Add each new entry to the `characters` array in `ai-character-db.json`:

```json
{
  "metadata": {
    "version": "2.0",
    "last_updated": "2025-10-22",
    "schema_version": "4.0",
    "total_entries": 51,
    "collection_status": "in_progress"
  },
  "characters": [
    {
      "source_urls": ["https://tvtropes.org/pmwiki/pmwiki.php/Main/BenevolentAI"],
      "work_url": "https://tvtropes.org/pmwiki/pmwiki.php/Film/IronMan",
      "work_type": "Movie",
      "work_name": "Iron Man",
      "publication_year": 2008,
      "character_type": "Digital AI",
      "character_name": "JARVIS",
      "character_description": "...",
      "ai_qualification": "Pass",
      "ai_qualification_explanation": "...",
      "benevolence_rating": "Benevolent",
      "benevolence_rating_explanation": "...",
      "alignment_rating": "Aligned",
      "alignment_rating_explanation": "..."
    }
  ]
}
```

**Important**:
- Maintain valid JSON syntax
- Use double quotes for all strings
- `source_urls` must be an array (use `[]` for empty, or `["url1", "url2"]` for URLs)
- Include commas between entries (but not after the last entry)
- Update the `last_updated` and `total_entries` fields in metadata when making changes

### 4. Viewing the Data

Open `index.html` in a web browser to view your collected data. The page will automatically:

- Load data from `ai-character-db.json`
- Display statistics (character counts, work counts)
- Allow filtering by benevolence, alignment, and AI qualification
- Provide search functionality
- Show source URLs as numbered links

## Tips for Data Collection

### Consistency

- **Benevolence Rating**: Use exact capitalization: Benevolent, Malevolent, Ambiguous, N/A
- **Alignment Rating**: Use exact capitalization: Aligned, Misaligned, Ambiguous, N/A
- **AI Qualification**: Use exact capitalization: Pass, Fail, Ambiguous
- **Work Types**: Be consistent with naming (e.g., always "TV Show" not "TV Series")
- **URLs**: Always use full URLs starting with http:// or https://

### Quality

- **Descriptions**: Focus on what makes the AI character notable
- **Explanations**: Be specific about why you assigned each rating
- **URLs**: Double-check that work URLs are correct

### Difficult Cases

When unsure about a rating:

1. **For AI Qualification**:
   - If unsure about the character's nature, research the source material
   - Use "Ambiguous" if the work itself is unclear about the character's nature
   - Err on the side of inclusion (use Ambiguous rather than Fail)

2. **For Benevolence Rating**:
   - Consider the character's actions and intentions
   - Use "Ambiguous" if the character has both positive and negative traits
   - Use "N/A" if there's truly insufficient information

3. **For Alignment Rating**:
   - Research what the creators intended vs. what the AI actually does
   - Use "Ambiguous" if it's unclear whether the AI is following its programming
   - Use "N/A" if creator intent is completely unknown

## Statistics Tracked

The HTML page automatically calculates:

### Character Counts
- Number of benevolent characters
- Number of malevolent characters
- Number of ambiguous characters
- Total characters

### Work Counts
- Number of works with benevolent AIs
- Number of works with malevolent AIs
- Number of works with ambiguous AIs
- Total unique works

Note: A single work can appear in multiple categories if it has AIs with different alignments.

## Filtering Options

The web interface provides several filtering options:

1. **Sort By**: Toggle between Benevolence and Alignment views
2. **AI Qualification Filter**: Show only characters with specific AI qualification ratings (Pass/Fail/Ambiguous)
3. **Benevolence Filter**: Show only characters of a specific benevolence rating
4. **Alignment Filter**: Show only characters of a specific alignment rating
5. **Search**: Free-text search across all fields

All filters can be combined for precise data exploration.

## Expanding the Dataset

As you collect more data, you may want to:

1. **Add more sources** - Expand beyond TV Tropes to other databases and wikis
2. **Add source URLs** - Always include URLs in the `source_urls` array
3. **Add additional fields** - Such as year released, creator, specific AI type, etc.

When expanding the schema, remember to update:
- The JSON structure in `ai-character-db.json`
- This documentation
- The HTML display code in `index.html`
- The statistics calculations

## Example Entry

Here's a complete example showing good data quality:

```json
{
  "source_urls": [
    "https://tvtropes.org/pmwiki/pmwiki.php/Main/AIIsACrapshoot"
  ],
  "work_url": "https://tvtropes.org/pmwiki/pmwiki.php/Film/TwoThousandOneASpaceOdyssey",
  "work_type": "Movie",
  "work_name": "2001: A Space Odyssey",
  "publication_year": 1968,
  "character_type": "Heuristic Computer",
  "character_name": "HAL 9000",
  "character_description": "The AI system controlling the Discovery One spacecraft. HAL kills most of the crew to protect the mission, but his actions stem from conflicting programming directives rather than inherent malice.",
  "ai_qualification": "Pass",
  "ai_qualification_explanation": "HAL is a computer system with advanced AI capabilities including natural language processing, emotional understanding, and autonomous decision-making. Built from electronic/mechanical components by humans.",
  "benevolence_rating": "Ambiguous",
  "benevolence_rating_explanation": "HAL's benevolence is ambiguous - he commits murder but is driven by conflicting orders rather than evil intent. He's not benevolent (he kills people) but not purely malevolent (he thinks he's protecting the mission).",
  "alignment_rating": "Ambiguous",
  "alignment_rating_explanation": "HAL's malfunction may be due to conflicting programming rather than true misalignment - it's unclear if the fault lies with the AI's interpretation or the programmers who gave conflicting directives."
}
```

## Handling Duplicates

### If You Find a Character on Multiple Sources

**Rule**: Add all source URLs to the `source_urls` array, don't create duplicate entries

**Example**:
You find "HAL 9000" on both the AI Is A Crapshoot page and the Artificial Intelligence page.

```json
{
  "source_urls": [
    "https://tvtropes.org/pmwiki/pmwiki.php/Main/AIIsACrapshoot",
    "https://tvtropes.org/pmwiki/pmwiki.php/Main/ArtificialIntelligence"
  ],
  "work_url": "https://tvtropes.org/pmwiki/pmwiki.php/Film/TwoThousandOneASpaceOdyssey",
  "work_type": "Movie",
  "work_name": "2001: A Space Odyssey",
  "publication_year": 1968,
  "character_type": "Heuristic Computer",
  "character_name": "HAL 9000",
  "character_description": "...",
  "ai_qualification": "Pass",
  "ai_qualification_explanation": "...",
  "benevolence_rating": "Ambiguous",
  "benevolence_rating_explanation": "...",
  "alignment_rating": "Ambiguous",
  "alignment_rating_explanation": "..."
}
```

**Why this approach?**
- Tracks all sources where a character appears
- Prevents duplicate entries
- Keeps statistics accurate
- Shows that multiple sources reference the same character

**How to check for duplicates**:
```bash
# Search existing data
grep -i "character_name_here" ai-character-db.json
```

Or use the HTML page's search function to check if you've already collected a character.

## Validation Checklist

Before submitting data, verify:

- [ ] All required fields are filled in
- [ ] `source_urls` is an array (even if empty: `[]`)
- [ ] URLs are valid and start with http:// or https://
- [ ] `work_url` can be empty string `""` if unavailable
- [ ] Benevolence rating values are: Benevolent, Malevolent, Ambiguous, or N/A
- [ ] Alignment rating values are: Aligned, Misaligned, Ambiguous, or N/A
- [ ] AI qualification values are: Pass, Fail, or Ambiguous
- [ ] Descriptions are clear and concise
- [ ] Explanations justify the ratings assigned
- [ ] No duplicate characters (check with search)
- [ ] If character appears on multiple sources, all URLs are in `source_urls` array
- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] `last_updated` and `total_entries` in metadata are current

## Troubleshooting

### HTML page shows "Error loading data"
- Check that `ai-character-db.json` is in the same directory as `index.html`
- Validate JSON syntax (use a JSON validator tool like jsonlint.com)
- Check browser console (F12) for specific error messages
- Verify that `source_urls` is an array, not a string

### Statistics not updating
- Ensure character data is properly formatted
- Check that benevolence values exactly match: "Benevolent", "Malevolent", "Ambiguous", or "N/A"
- Check that alignment values exactly match: "Aligned", "Misaligned", "Ambiguous", or "N/A"
- Refresh the page to reload data

### Filters not working
- Verify that filter values are using exact capitalization
- Check that the field exists in all entries
- Clear browser cache and reload

### Source URLs not displaying
- Ensure `source_urls` is an array: `["url1", "url2"]` not `"url1, url2"`
- Check that URLs are valid strings with quotes
- Empty arrays `[]` are valid and will display "N/A"
