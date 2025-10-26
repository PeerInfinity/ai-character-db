#!/usr/bin/env python3
"""
Split ai-character-db.json into separate files by work type for progressive loading.
Also generates a version.json file for cache busting.
"""

import json
import os
import hashlib
from datetime import datetime
from pathlib import Path


def generate_file_hash(content):
    """Generate a hash of the file content for cache busting."""
    return hashlib.md5(content.encode('utf-8')).hexdigest()[:8]


def split_json_by_work_type(input_file='ai-character-db.json', output_dir='data'):
    """Split the main JSON file into separate files by work type."""

    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(exist_ok=True)

    # Load the main JSON file
    print(f"Loading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    characters = data.get('characters', [])
    metadata = data.get('metadata', {})

    print(f"Total characters: {len(characters)}")

    # Group characters by work type
    work_type_groups = {}
    for character in characters:
        work_type = character.get('work_type', 'Other')
        if work_type not in work_type_groups:
            work_type_groups[work_type] = []
        work_type_groups[work_type].append(character)

    # Generate manifest with file info
    manifest = {
        'metadata': metadata,
        'generated_at': datetime.now().isoformat(),
        'total_characters': len(characters),
        'work_types': []
    }

    # Write each work type to a separate file
    print(f"\nSplitting into {len(work_type_groups)} work type files...")
    for work_type, chars in sorted(work_type_groups.items()):
        # Create a safe filename from work type
        safe_name = work_type.lower().replace(' ', '-').replace('/', '-')
        safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '-')
        filename = f"{safe_name}.json"
        filepath = os.path.join(output_dir, filename)

        # Create the file content
        file_data = {
            'work_type': work_type,
            'character_count': len(chars),
            'characters': chars
        }

        file_content = json.dumps(file_data, indent=2, ensure_ascii=False)

        # Write the file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(file_content)

        # Generate hash for this file
        file_hash = generate_file_hash(file_content)

        # Add to manifest
        manifest['work_types'].append({
            'work_type': work_type,
            'filename': filename,
            'character_count': len(chars),
            'hash': file_hash
        })

        print(f"  ✓ {work_type}: {len(chars)} characters → {filename}")

    # Write manifest file
    manifest_path = os.path.join(output_dir, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, indent=2, fp=f, ensure_ascii=False)

    print(f"\n✓ Manifest written to {manifest_path}")

    # Generate version.json for cache busting
    version_data = {
        'version': generate_file_hash(json.dumps(manifest)),
        'timestamp': datetime.now().isoformat(),
        'last_updated': metadata.get('last_updated', ''),
        'data_version': manifest['generated_at']
    }

    with open('version.json', 'w', encoding='utf-8') as f:
        json.dump(version_data, indent=2, fp=f)

    print(f"✓ Version file written to version.json")
    print(f"\nCache busting version: {version_data['version']}")
    print(f"\nDone! Split {len(characters)} characters into {len(work_type_groups)} files.")

    return manifest


if __name__ == '__main__':
    split_json_by_work_type()
