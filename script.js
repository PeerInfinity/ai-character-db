let allCharacters = [];
let skippedEntries = [];
let filters = {
    sortBy: 'benevolence',
    aiQualification: 'any',
    benevolence: 'any',
    alignment: 'any',
    search: ''
};
let shuffleState = {
    charactersShuffled: false,
    workTypesShuffled: false
};

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const btn = document.querySelector('.theme-toggle');

    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        btn.textContent = '🌙 Dark Mode';
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        btn.textContent = '☀️ Light Mode';
    }
}

// Helper functions to get ratings
function getBenevolence(character) {
    return character.benevolence_rating || 'N/A';
}

function getAlignment(character) {
    return character.alignment_rating || 'N/A';
}

// Load JSON data
async function loadData() {
    try {
        const response = await fetch('ai-character-db.json');
        const data = await response.json();
        allCharacters = data.characters || [];

        // Update statistics
        updateStatistics();

        // Update chart colors based on initial sort mode
        updateChartColors();

        // Update chart filter state
        updateChartFilterState();

        // Update last updated date
        if (data.metadata && data.metadata.last_updated) {
            document.getElementById('last-updated').textContent =
                `Last updated: ${data.metadata.last_updated}`;
        }

        // Display entries
        displayEntries();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('entries').innerHTML =
            '<div class="no-results">Error loading data. Please ensure ai-character-db.json is in the same directory.</div>';
    }
}

// Update chart cell colors based on sort mode
function updateChartColors() {
    const chartCells = document.querySelectorAll('.chart-cell');
    chartCells.forEach(cell => {
        // Remove all color classes
        cell.classList.remove('chart-cell-benevolent', 'chart-cell-ambiguous', 'chart-cell-malevolent',
                              'chart-cell-aligned', 'chart-cell-misaligned');

        // Add appropriate color class based on sort mode
        if (filters.sortBy === 'benevolence') {
            const benevolence = cell.getAttribute('data-benevolence');
            cell.classList.add(`chart-cell-${benevolence}`);
        } else {
            const alignment = cell.getAttribute('data-alignment');
            cell.classList.add(`chart-cell-${alignment}`);
        }
    });
}

// Update chart cell filtered state based on current filters
function updateChartFilterState() {
    const allChartCells = document.querySelectorAll('.chart-cell, .chart-cell-total');

    allChartCells.forEach(cell => {
        const benevolence = cell.getAttribute('data-benevolence');
        const alignment = cell.getAttribute('data-alignment');

        // Determine if this cell is filtered out
        let isFilteredOut = false;

        // Check benevolence filter
        if (filters.benevolence !== 'any') {
            const filterValue = filters.benevolence === 'ambiguous-only' ? 'ambiguous' : filters.benevolence;
            if (benevolence !== filterValue && benevolence !== 'any') {
                isFilteredOut = true;
            }
        }

        // Check alignment filter
        if (filters.alignment !== 'any') {
            const filterValue = filters.alignment === 'ambiguous-only' ? 'ambiguous' : filters.alignment;
            if (alignment !== filterValue && alignment !== 'any') {
                isFilteredOut = true;
            }
        }

        // Apply or remove filtered-out class
        if (isFilteredOut) {
            cell.classList.add('chart-cell-filtered-out');
        } else {
            cell.classList.remove('chart-cell-filtered-out');
        }
    });
}

// Handle chart cell clicks
function handleChartCellClick(event) {
    const cell = event.target.closest('.chart-cell, .chart-cell-total');
    if (!cell) return;

    const benevolence = cell.getAttribute('data-benevolence');
    const alignment = cell.getAttribute('data-alignment');

    // Update benevolence filter
    if (benevolence === 'any') {
        filters.benevolence = 'any';
    } else {
        filters.benevolence = benevolence === 'ambiguous' ? 'ambiguous-only' : benevolence;
    }

    // Update alignment filter
    if (alignment === 'any') {
        filters.alignment = 'any';
    } else {
        filters.alignment = alignment === 'ambiguous' ? 'ambiguous-only' : alignment;
    }

    // Update the filter button states
    updateFilterButtons();

    // Update chart filter state
    updateChartFilterState();

    // Display filtered entries
    displayEntries();
}

// Update filter button states to match current filters
function updateFilterButtons() {
    // Update benevolence filter buttons
    const benevolenceButtons = document.querySelectorAll('[data-filter-type="benevolence"]');
    benevolenceButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filters.benevolence) {
            btn.classList.add('active');
        }
    });

    // Update alignment filter buttons
    const alignmentButtons = document.querySelectorAll('[data-filter-type="alignment"]');
    alignmentButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filters.alignment) {
            btn.classList.add('active');
        }
    });
}

// Update statistics
function updateStatistics() {
    // Filter to only include characters with both benevolence and alignment ratings
    const ratedCharacters = allCharacters.filter(c =>
        getBenevolence(c) !== 'N/A' && getAlignment(c) !== 'N/A'
    );

    // Benevolent row
    const benevolentAligned = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Benevolent' && getAlignment(c) === 'Aligned'
    ).length;
    const benevolentNeutral = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Benevolent' && getAlignment(c) === 'Ambiguous'
    ).length;
    const benevolentMisaligned = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Benevolent' && getAlignment(c) === 'Misaligned'
    ).length;

    // Neutral row
    const neutralAligned = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Ambiguous' && getAlignment(c) === 'Aligned'
    ).length;
    const neutralNeutral = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Ambiguous' && getAlignment(c) === 'Ambiguous'
    ).length;
    const neutralMisaligned = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Ambiguous' && getAlignment(c) === 'Misaligned'
    ).length;

    // Malevolent row
    const malevolentAligned = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Malevolent' && getAlignment(c) === 'Aligned'
    ).length;
    const malevolentNeutral = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Malevolent' && getAlignment(c) === 'Ambiguous'
    ).length;
    const malevolentMisaligned = ratedCharacters.filter(c =>
        getBenevolence(c) === 'Malevolent' && getAlignment(c) === 'Misaligned'
    ).length;

    // Column totals
    const totalAligned = benevolentAligned + neutralAligned + malevolentAligned;
    const totalNeutral = benevolentNeutral + neutralNeutral + malevolentNeutral;
    const totalMisaligned = benevolentMisaligned + neutralMisaligned + malevolentMisaligned;

    // Row totals
    const totalBenevolent = benevolentAligned + benevolentNeutral + benevolentMisaligned;
    const totalNeutralBenev = neutralAligned + neutralNeutral + neutralMisaligned;
    const totalMalevolent = malevolentAligned + malevolentNeutral + malevolentMisaligned;

    // Grand total
    const grandTotal = totalAligned + totalNeutral + totalMisaligned;

    // Update the DOM
    document.getElementById('benevolent-aligned').textContent = benevolentAligned;
    document.getElementById('benevolent-neutral').textContent = benevolentNeutral;
    document.getElementById('benevolent-misaligned').textContent = benevolentMisaligned;
    document.getElementById('total-benevolent').textContent = totalBenevolent;

    document.getElementById('neutral-aligned').textContent = neutralAligned;
    document.getElementById('neutral-neutral').textContent = neutralNeutral;
    document.getElementById('neutral-misaligned').textContent = neutralMisaligned;
    document.getElementById('total-neutral-benev').textContent = totalNeutralBenev;

    document.getElementById('malevolent-aligned').textContent = malevolentAligned;
    document.getElementById('malevolent-neutral').textContent = malevolentNeutral;
    document.getElementById('malevolent-misaligned').textContent = malevolentMisaligned;
    document.getElementById('total-malevolent').textContent = totalMalevolent;

    document.getElementById('total-aligned').textContent = totalAligned;
    document.getElementById('total-neutral').textContent = totalNeutral;
    document.getElementById('total-misaligned').textContent = totalMisaligned;
    document.getElementById('grand-total').textContent = grandTotal;
}

// Display filtered entries
function displayEntries() {
    entryCounter = 0;
    const container = document.getElementById('entries');
    let entries = allCharacters;

    // Apply AI qualification filter
    if (filters.aiQualification !== 'any') {
        if (filters.aiQualification === 'ambiguous-only') {
            entries = entries.filter(e => e.ai_qualification === 'Ambiguous');
        } else {
            entries = entries.filter(e =>
                e.ai_qualification.toLowerCase() === filters.aiQualification
            );
        }
    }

    // Apply benevolence filter
    if (filters.benevolence !== 'any') {
        if (filters.benevolence === 'ambiguous-only') {
            entries = entries.filter(e => getBenevolence(e) === 'Ambiguous');
        } else {
            entries = entries.filter(e =>
                getBenevolence(e).toLowerCase() === filters.benevolence
            );
        }
    }

    // Apply alignment filter
    if (filters.alignment !== 'any') {
        if (filters.alignment === 'ambiguous-only') {
            entries = entries.filter(e => getAlignment(e) === 'Ambiguous');
        } else {
            entries = entries.filter(e =>
                getAlignment(e).toLowerCase() === filters.alignment
            );
        }
    }

    // Apply search filter
    if (filters.search) {
        const query = filters.search.toLowerCase();
        entries = entries.filter(entry =>
            (entry.character_name || '').toLowerCase().includes(query) ||
            (entry.work_name || '').toLowerCase().includes(query) ||
            (entry.character_description || '').toLowerCase().includes(query) ||
            (entry.work_type || '').toLowerCase().includes(query)
        );
    }

    // Generate HTML
    if (entries.length === 0) {
        container.innerHTML = '<div class="no-results">No entries found matching your criteria.</div>';
        return;
    }

    // Group by work type
    const grouped = groupByWorkType(entries);
    let sortedWorkTypes = Object.keys(grouped).sort();

    // Apply work types shuffle if active
    if (shuffleState.workTypesShuffled) {
        sortedWorkTypes = shuffleArray(sortedWorkTypes);
    }

    let html = '';
    sortedWorkTypes.forEach(workType => {
        let workTypeEntries = grouped[workType];

        // Apply character shuffle if active
        if (shuffleState.charactersShuffled) {
            workTypeEntries = shuffleArray(workTypeEntries);
        }
        const workTypeId = workType.replace(/[^a-zA-Z0-9]/g, '_');

        // Calculate counts based on current sort mode
        let counts;
        if (filters.sortBy === 'benevolence') {
            const benevolent = workTypeEntries.filter(e => getBenevolence(e) === 'Benevolent').length;
            const ambiguous = workTypeEntries.filter(e => getBenevolence(e) === 'Ambiguous').length;
            const malevolent = workTypeEntries.filter(e => getBenevolence(e) === 'Malevolent').length;
            counts = `<span class="count-badge benevolent" title="Benevolent">${benevolent}</span><span class="count-badge ambiguous" title="Ambiguous">${ambiguous}</span><span class="count-badge malevolent" title="Malevolent">${malevolent}</span>`;
        } else {
            const aligned = workTypeEntries.filter(e => getAlignment(e) === 'Aligned').length;
            const ambiguous = workTypeEntries.filter(e => getAlignment(e) === 'Ambiguous').length;
            const misaligned = workTypeEntries.filter(e => getAlignment(e) === 'Misaligned').length;
            counts = `<span class="count-badge aligned" title="Aligned">${aligned}</span><span class="count-badge ambiguous" title="Ambiguous">${ambiguous}</span><span class="count-badge misaligned" title="Misaligned">${misaligned}</span>`;
        }

        html += `
            <div class="work-type-folder" id="folder-${workTypeId}">
                <div class="work-type-header" onclick="toggleWorkType('${workTypeId}')">
                    <span>
                        <span class="work-type-toggle">▼</span>
                        ${workType}
                    </span>
                    <div class="work-type-counts">
                        ${counts}
                        <span class="count-badge total" title="Total">${workTypeEntries.length}</span>
                    </div>
                </div>
                <div class="work-type-content">
                    ${workTypeEntries.map(entry => generateEntryHTML(entry)).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Group entries by work type
function groupByWorkType(entries) {
    const grouped = {};
    entries.forEach(entry => {
        const workType = entry.work_type || 'Other';
        if (!grouped[workType]) {
            grouped[workType] = [];
        }
        grouped[workType].push(entry);
    });
    return grouped;
}

// Toggle work type folder visibility
function toggleWorkType(workTypeId) {
    const folder = document.getElementById('folder-' + workTypeId);
    if (folder) {
        folder.classList.toggle('collapsed');
    }
}

// Generate HTML for a single entry
let entryCounter = 0;
function generateEntryHTML(entry) {
    const entryId = entryCounter++;

    // Determine which rating to display as badge based on sortBy
    let ratingValue, ratingClass;
    if (filters.sortBy === 'benevolence') {
        ratingValue = getBenevolence(entry);
        ratingClass = ratingValue.toLowerCase();
    } else {
        ratingValue = getAlignment(entry);
        ratingClass = ratingValue.toLowerCase();
    }

    const workLink = entry.work_url ?
        `<a href="${entry.work_url}" target="_blank">${entry.work_name}</a>` :
        entry.work_name;

    // Generate source URLs display (numbered links)
    let sourceUrlsDisplay = '';
    if (entry.source_urls && entry.source_urls.length > 0) {
        sourceUrlsDisplay = entry.source_urls.map((url, index) =>
            `<a href="${url}" target="_blank">${index + 1}</a>`
        ).join(', ');
    } else {
        sourceUrlsDisplay = 'N/A';
    }

    const benevolenceRating = getBenevolence(entry);
    const alignmentRating = getAlignment(entry);

    return `
        <div class="entry ${ratingClass}">
            <div class="entry-header">
                <div class="entry-title">${entry.character_name}</div>
                <div class="entry-badge ${ratingClass}">${ratingValue}</div>
            </div>

            <div class="entry-meta">
                <div class="meta-item">
                    <div class="meta-label">Work</div>
                    <div class="meta-value">${workLink}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Sources</div>
                    <div class="meta-value">${sourceUrlsDisplay}</div>
                </div>
            </div>

            <div class="assessment-grid">
                <div class="collapsible-section description-section" id="desc-${entryId}">
                    <div class="collapsible-header" onclick="toggleCollapsible('desc-${entryId}')">
                        <span class="collapsible-toggle">▼</span>
                        <span class="assessment-title">Description</span>
                    </div>
                    <div class="collapsible-content">
                        <div class="description-text">
                            ${entry.character_description || 'No description available'}
                        </div>
                    </div>
                </div>

                <div class="collapsible-section ai-qual-section" id="aiqual-${entryId}">
                    <div class="collapsible-header" onclick="toggleCollapsible('aiqual-${entryId}')">
                        <span class="collapsible-toggle">▼</span>
                        <div class="assessment-title">
                            <span>AI Qualification</span>
                            <span class="assessment-rating ${(entry.ai_qualification || 'N/A').toLowerCase().replace('/', '-')}">${entry.ai_qualification || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="collapsible-content">
                        <div class="assessment-explanation">
                            ${entry.ai_qualification_explanation || 'No explanation provided'}
                        </div>
                    </div>
                </div>

                <div class="collapsible-section benevolence-section" id="benev-${entryId}">
                    <div class="collapsible-header" onclick="toggleCollapsible('benev-${entryId}')">
                        <span class="collapsible-toggle">▼</span>
                        <div class="assessment-title">
                            <span>Benevolence Rating</span>
                            <span class="assessment-rating ${benevolenceRating.toLowerCase().replace('/', '-')}">${benevolenceRating}</span>
                        </div>
                    </div>
                    <div class="collapsible-content">
                        <div class="assessment-explanation">
                            ${entry.benevolence_rating_explanation || 'No explanation provided'}
                        </div>
                    </div>
                </div>

                <div class="collapsible-section alignment-section" id="align-${entryId}">
                    <div class="collapsible-header" onclick="toggleCollapsible('align-${entryId}')">
                        <span class="collapsible-toggle">▼</span>
                        <div class="assessment-title">
                            <span>Alignment Rating</span>
                            <span class="assessment-rating ${alignmentRating.toLowerCase().replace('/', '-')}">${alignmentRating}</span>
                        </div>
                    </div>
                    <div class="collapsible-content">
                        <div class="assessment-explanation">
                            ${entry.alignment_rating_explanation || 'No explanation provided'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Toggle collapsible section
function toggleCollapsible(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// Filter button event listeners
document.querySelectorAll('.filter-btn:not(.shuffle-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
        const filterType = btn.dataset.filterType;
        const filterValue = btn.dataset.filter;

        // Update active button within the same filter group
        const filterGroup = btn.closest('.filter-section');
        filterGroup.querySelectorAll('.filter-btn:not(.shuffle-btn)').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update filter
        if (filterType === 'sort-by') {
            filters.sortBy = filterValue;
            updateChartColors();
            displayEntries();
        } else if (filterType === 'ai-qualification') {
            filters.aiQualification = filterValue;
            displayEntries();
        } else if (filterType === 'benevolence') {
            filters.benevolence = filterValue;
            updateChartFilterState();
            displayEntries();
        } else if (filterType === 'alignment') {
            filters.alignment = filterValue;
            updateChartFilterState();
            displayEntries();
        }
    });
});

// Chart cell click event listeners
document.querySelectorAll('.chart-clickable').forEach(cell => {
    cell.addEventListener('click', handleChartCellClick);
});

// Search box event listener
document.getElementById('search').addEventListener('input', (e) => {
    filters.search = e.target.value;
    displayEntries();
});

// Expand/collapse functions for character details
function expandAllSections() {
    document.querySelectorAll('.description-section, .ai-qual-section, .benevolence-section, .alignment-section').forEach(section => {
        section.classList.remove('collapsed');
    });
}

function collapseAllSections() {
    document.querySelectorAll('.description-section, .ai-qual-section, .benevolence-section, .alignment-section').forEach(section => {
        section.classList.add('collapsed');
    });
}

// Expand/collapse functions for work types
function expandAllWorkTypes() {
    document.querySelectorAll('.work-type-folder').forEach(folder => {
        folder.classList.remove('collapsed');
    });
}

function collapseAllWorkTypes() {
    document.querySelectorAll('.work-type-folder').forEach(folder => {
        folder.classList.add('collapsed');
    });
}

// Toggle skipped entries section
function toggleSkippedEntries() {
    const section = document.getElementById('skipped-section');
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Toggle shuffle characters
function toggleShuffleCharacters() {
    const btn = document.getElementById('shuffle-characters-btn');

    if (shuffleState.charactersShuffled) {
        // Turn off shuffle - restore original order
        shuffleState.charactersShuffled = false;
        btn.classList.remove('active');
        displayEntries(); // Re-render with original order
    } else {
        // Turn on shuffle
        shuffleState.charactersShuffled = true;
        btn.classList.add('active');
        shuffleCharacters();
    }
}

// Toggle shuffle work types
function toggleShuffleWorkTypes() {
    const btn = document.getElementById('shuffle-work-types-btn');

    if (shuffleState.workTypesShuffled) {
        // Turn off shuffle - restore original order
        shuffleState.workTypesShuffled = false;
        btn.classList.remove('active');
        displayEntries(); // Re-render with original order
    } else {
        // Turn on shuffle
        shuffleState.workTypesShuffled = true;
        btn.classList.add('active');
        shuffleWorkTypes();
    }
}

// Shuffle characters within each work type group
function shuffleCharacters() {
    // Get all work type folders
    const folders = document.querySelectorAll('.work-type-folder');

    folders.forEach(folder => {
        const content = folder.querySelector('.work-type-content');
        if (!content) return;

        // Get all entry elements
        const entries = Array.from(content.querySelectorAll('.entry'));

        // Shuffle the entries
        const shuffled = shuffleArray(entries);

        // Clear content and re-append in shuffled order
        content.innerHTML = '';
        shuffled.forEach(entry => {
            content.appendChild(entry);
        });
    });
}

// Shuffle the order of work type folders
function shuffleWorkTypes() {
    const container = document.getElementById('entries');

    // Get all work type folders
    const folders = Array.from(container.querySelectorAll('.work-type-folder'));

    if (folders.length === 0) return;

    // Shuffle the folders
    const shuffled = shuffleArray(folders);

    // Clear container and re-append in shuffled order
    container.innerHTML = '';
    shuffled.forEach(folder => {
        container.appendChild(folder);
    });
}

// Load skipped entries
async function loadSkippedEntries() {
    try {
        const response = await fetch('skipped_entries.json');
        const data = await response.json();
        skippedEntries = data.skipped_entries || [];

        // Update count
        document.getElementById('skipped-count').textContent =
            `(${skippedEntries.length} ${skippedEntries.length === 1 ? 'entry' : 'entries'})`;

        // Display skipped entries
        displaySkippedEntries();
    } catch (error) {
        console.error('Error loading skipped entries:', error);
        document.getElementById('skipped-content').innerHTML =
            '<div class="no-results">Error loading skipped entries.</div>';
    }
}

// Display skipped entries
function displaySkippedEntries() {
    const container = document.getElementById('skipped-content');

    if (skippedEntries.length === 0) {
        container.innerHTML = '<div class="no-results">No skipped entries found.</div>';
        return;
    }

    let html = '';
    skippedEntries.forEach(entry => {
        html += `
            <div class="skipped-entry">
                <div class="skipped-entry-title">${entry.character_name}</div>
                <div class="skipped-meta">
                    <div class="skipped-meta-item">
                        <span class="skipped-meta-label">Work:</span> ${entry.work_name}
                    </div>
                    <div class="skipped-meta-item">
                        <span class="skipped-meta-label">Source Page:</span> ${entry.source_page}
                    </div>
                    <div class="skipped-meta-item">
                        <span class="skipped-meta-label">Section:</span> ${entry.source_section}
                    </div>
                </div>
                <div class="skipped-reason">
                    <div class="skipped-reason-label">Reason for Exclusion:</div>
                    ${entry.reason}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Initialize
loadData();
loadSkippedEntries();
