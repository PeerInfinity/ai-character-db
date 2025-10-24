#!/usr/bin/env python3
"""
Split TVTropes HTML files into manageable batches of ~50 lines each
"""
import os
import glob
from pathlib import Path

# Get all HTML files in cached-pages directory
input_dir = "cached-pages"
html_files = glob.glob(f"{input_dir}/*.html")

base_dir = "batches"
CHUNK_SIZE = 50

print(f"Found {len(html_files)} HTML files to process\n")

for input_file in sorted(html_files):
    # Extract filename without extension and convert underscores to dashes
    filename = Path(input_file).stem  # e.g., "tvtropes-benevolent_ai"
    filename_normalized = filename.replace('_', '-')  # e.g., "tvtropes-benevolent-ai"

    # Create output directory based on normalized filename
    output_dir = f"{base_dir}/{filename_normalized}"
    os.makedirs(output_dir, exist_ok=True)

    print(f"Processing: {filename}")

    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find all hr markers
    hr_markers = []
    for i, line in enumerate(lines):
        if '<hr data-format=\'&#8212;&#8212;\' />' in line:
            hr_markers.append(i)

    # Find the closing div tag for the main content
    content_end = -1
    for i in range(len(lines) - 1, -1, -1):
        if '</div>' in lines[i] and 'article-content' in str(lines[max(0, i-20):i]):
            content_end = i
            break

    if len(hr_markers) == 0:
        print(f"  ✗ Could not find hr markers, skipping...")
        print()
        continue

    # Check if this file has an Examples header (main pages) or not (subpages)
    examples_header = -1
    for i, line in enumerate(lines):
        if '<h2>Examples:</h2>' in line:
            examples_header = i
            break

    if examples_header != -1:
        # Main page format: Extract from Examples: header to the second hr marker
        examples_start = examples_header
        examples_end = hr_markers[1] if len(hr_markers) > 1 else content_end
    elif len(hr_markers) == 2:
        # Subpage format with 2 markers: Extract between the first and second hr markers
        examples_start = hr_markers[0]
        examples_end = hr_markers[1]
    elif len(hr_markers) == 1:
        # Subpage format with 1 marker: Extract from the hr marker to the end of content
        examples_start = hr_markers[0]
        examples_end = content_end if content_end != -1 else len(lines)
    else:
        print(f"  ✗ Unexpected format, skipping...")
        print()
        continue

    # Extract only the examples content
    content_lines = lines[examples_start:examples_end]

    # Split long lines at </li><li> boundaries to get one entry per line
    expanded_lines = []
    for line in content_lines:
        # Split at </li><li> to separate list items
        if '</li><li>' in line:
            # Split and preserve both the closing and opening tags
            parts = line.split('</li><li>')
            for i, part in enumerate(parts):
                if i == 0:
                    # First part: add closing tag back
                    expanded_lines.append(part + '</li>\n')
                elif i == len(parts) - 1:
                    # Last part: add opening tag back
                    expanded_lines.append('<li>' + part)
                else:
                    # Middle parts: add both tags back
                    expanded_lines.append('<li>' + part + '</li>\n')
        else:
            expanded_lines.append(line)

    content_lines = expanded_lines

    # Split into chunks of ~50 lines, but avoid splitting multiline entries
    batch_num = 0
    i = 0

    while i < len(content_lines):
        batch_num += 1
        end_index = min(i + CHUNK_SIZE, len(content_lines))

        # If we haven't reached the end of content, find a safe split point
        if end_index < len(content_lines):
            # Look for the next safe split point (</li> followed by <li> with no <ul > or </ul> between)
            found_split = False
            for j in range(end_index, len(content_lines)):
                line = content_lines[j]
                # Check if this line ends with </li> and the next line starts with <li>
                if line.rstrip().endswith('</li>'):
                    # Check if next line exists and starts with <li>
                    if j + 1 < len(content_lines):
                        next_line = content_lines[j + 1].lstrip()
                        # Make sure there's no <ul > or </ul> indicating nested structure
                        if next_line.startswith('<li>') and '<ul >' not in line and '</ul>' not in line:
                            end_index = j + 1
                            found_split = True
                            break
                # Safety limit: don't search more than 50 lines ahead
                if j - end_index > 50:
                    break

            # If we didn't find a split point within 50 lines, just use the original end_index
            if not found_split:
                end_index = min(i + CHUNK_SIZE, len(content_lines))

        chunk = content_lines[i:end_index]

        output_file = f"{output_dir}/{filename_normalized}-batch_{batch_num:02d}.html"
        with open(output_file, 'w', encoding='utf-8') as f:
            # Write minimal HTML wrapper
            f.write('<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n')
            # Write chunk
            f.writelines(chunk)
            # Close HTML properly
            f.write('\n</body>\n</html>\n')

        i = end_index

    print(f"  ✓ Created {batch_num} batches ({len(content_lines)} lines total) in {output_dir}/")
    print()
