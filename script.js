let allCharacters = [];
let appVersion = null;
let filters = {
    sortBy: 'benevolence',
    aiQualification: {
        pass: true,
        ambiguous: true,
        fail: true,
        na: true,
        unresearched: true
    },
    aiQualificationTotals: {
        pass: true,
        ambiguous: false,
        fail: false,
        na: false,
        unresearched: true
    },
    benevolence: {
        benevolent: true,
        ambiguous: true,
        malevolent: true,
        na: true
    },
    alignment: {
        aligned: true,
        ambiguous: true,
        misaligned: true,
        na: true
    },
    search: ''
};
let shuffleState = {
    charactersShuffled: false,
    workTypesShuffled: false
};

// Processing state management
let processingState = {
    debounceTimer: null,
    isProcessing: false,
    hasQueuedChanges: false,
    currentProgress: 0
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

// Helper functions to control indicators
function showActionQueued() {
    const indicator = document.getElementById('action-queued-indicator');
    if (indicator) {
        indicator.classList.add('visible');
    }
}

function hideActionQueued() {
    const indicator = document.getElementById('action-queued-indicator');
    if (indicator) {
        indicator.classList.remove('visible');
    }
}

function showProgressIndicator() {
    const indicator = document.getElementById('progress-indicator');
    if (indicator) {
        indicator.classList.add('visible');
    }
}

function hideProgressIndicator() {
    const indicator = document.getElementById('progress-indicator');
    if (indicator) {
        indicator.classList.remove('visible');
    }
}

function updateProgress(percentage, statusText = 'Processing entries...') {
    const progressFill = document.getElementById('processing-progress-fill');
    const progressPercentage = document.getElementById('processing-percentage');
    const statusTextElement = document.getElementById('processing-status-text');

    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    if (progressPercentage) {
        progressPercentage.textContent = Math.round(percentage) + '%';
    }
    if (statusTextElement) {
        statusTextElement.textContent = statusText;
    }

    processingState.currentProgress = percentage;
}

// Helper functions to get ratings
function getBenevolence(character) {
    return character.benevolence_rating || 'N/A';
}

function getAlignment(character) {
    return character.alignment_rating || 'N/A';
}

// Update loading progress
function updateLoadingProgress(loaded, total, workType = '') {
    // Update main progress indicators
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const loadingText = document.querySelector('.loading-text');

    // Update chart progress indicators
    const chartProgressFill = document.getElementById('chart-progress-fill');
    const chartProgressText = document.getElementById('chart-progress-text');
    const chartLoadingText = document.querySelector('#chart-loading .loading-text');

    const percentage = Math.round((loaded / total) * 100);

    console.log(`Progress: ${loaded}/${total} (${percentage}%) - ${workType}`);

    // Update main progress
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }

    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }

    if (loadingText && workType) {
        loadingText.textContent = `Loading ${workType}... (${loaded}/${total})`;
    }

    // Update chart progress
    if (chartProgressFill) {
        chartProgressFill.style.width = percentage + '%';
    }

    if (chartProgressText) {
        chartProgressText.textContent = `${percentage}%`;
    }

    if (chartLoadingText && workType) {
        chartLoadingText.textContent = `Loading ${workType}... (${loaded}/${total})`;
    }
}

// Load version file for cache busting
async function loadVersion() {
    try {
        // Always bypass cache for version.json using timestamp
        const timestamp = new Date().getTime();
        const response = await fetch(`version.json?t=${timestamp}`);
        const version = await response.json();
        appVersion = version.version;
        console.log('App version:', appVersion);
        return version;
    } catch (error) {
        console.warn('Could not load version file, using timestamp fallback:', error);
        appVersion = new Date().getTime().toString();
        return { version: appVersion };
    }
}

// Fetch with cache busting
async function fetchWithVersion(url) {
    const separator = url.includes('?') ? '&' : '?';
    const versionedUrl = `${url}${separator}v=${appVersion}`;
    return fetch(versionedUrl);
}

// Load JSON data progressively
async function loadData() {
    try {
        // First load the version
        const versionInfo = await loadVersion();

        // Update stylesheet with version
        const stylesheet = document.getElementById('main-stylesheet');
        if (stylesheet && appVersion) {
            stylesheet.href = `styles.css?v=${appVersion}`;
        }

        // Load manifest
        const manifestResponse = await fetchWithVersion('data/manifest.json');
        const manifest = await manifestResponse.json();

        const workTypes = manifest.work_types || [];
        const totalFiles = workTypes.length;
        let loadedFiles = 0;

        // Update last updated date from metadata
        if (manifest.metadata && manifest.metadata.last_updated) {
            document.getElementById('last-updated').textContent =
                `Last updated: ${manifest.metadata.last_updated}`;
        }

        // Load each work type file
        allCharacters = [];

        for (const workTypeInfo of workTypes) {
            const filename = workTypeInfo.filename;
            const workType = workTypeInfo.work_type;

            try {
                const response = await fetchWithVersion(`data/${filename}`);
                const data = await response.json();

                // Add characters from this file
                if (data.characters && Array.isArray(data.characters)) {
                    allCharacters = allCharacters.concat(data.characters);
                }

                loadedFiles++;
                updateLoadingProgress(loadedFiles, totalFiles, workType);

            } catch (error) {
                console.error(`Error loading ${filename}:`, error);
                loadedFiles++;
                updateLoadingProgress(loadedFiles, totalFiles, workType);
            }
        }

        // All files loaded, update UI
        updateStatistics();
        updateChartColors();
        updateChartFilterState();
        await displayEntries();

        // Hide loading indicator and show chart
        const chartLoading = document.getElementById('chart-loading');
        if (chartLoading) {
            chartLoading.style.display = 'none';
        }

        // Show stats container
        const statsContainer = document.getElementById('stats');
        if (statsContainer) {
            statsContainer.style.display = 'grid';
        }

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('entries').innerHTML =
            '<div class="no-results">Error loading data. Please ensure data files are available.</div>';

        // Hide loading indicator on error
        const chartLoading = document.getElementById('chart-loading');
        if (chartLoading) {
            chartLoading.innerHTML = '<div class="no-results">Error loading data. Please ensure data files are available.</div>';
        }
    }
}

// Update chart cell colors based on sort mode
function updateChartColors() {
    const chartCells = document.querySelectorAll('.chart-cell');
    chartCells.forEach(cell => {
        // Remove all color classes
        cell.classList.remove('chart-cell-benevolent', 'chart-cell-ambiguous', 'chart-cell-malevolent',
                              'chart-cell-aligned', 'chart-cell-misaligned', 'chart-cell-na');

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
        if (benevolence !== 'any') {
            if (benevolence === 'benevolent' && !filters.benevolence.benevolent) {
                isFilteredOut = true;
            } else if (benevolence === 'ambiguous' && !filters.benevolence.ambiguous) {
                isFilteredOut = true;
            } else if (benevolence === 'malevolent' && !filters.benevolence.malevolent) {
                isFilteredOut = true;
            } else if (benevolence === 'na' && !filters.benevolence.na) {
                isFilteredOut = true;
            }
        }

        // Check alignment filter
        if (alignment !== 'any') {
            if (alignment === 'aligned' && !filters.alignment.aligned) {
                isFilteredOut = true;
            } else if (alignment === 'ambiguous' && !filters.alignment.ambiguous) {
                isFilteredOut = true;
            } else if (alignment === 'misaligned' && !filters.alignment.misaligned) {
                isFilteredOut = true;
            } else if (alignment === 'na' && !filters.alignment.na) {
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

    // Update benevolence filter - enable only the clicked category
    if (benevolence === 'any') {
        // Enable all benevolence categories
        filters.benevolence.benevolent = true;
        filters.benevolence.ambiguous = true;
        filters.benevolence.malevolent = true;
        filters.benevolence.na = true;
    } else {
        // Enable only the clicked category
        filters.benevolence.benevolent = (benevolence === 'benevolent');
        filters.benevolence.ambiguous = (benevolence === 'ambiguous');
        filters.benevolence.malevolent = (benevolence === 'malevolent');
        filters.benevolence.na = false;
    }

    // Update alignment filter - enable only the clicked category
    if (alignment === 'any') {
        // Enable all alignment categories
        filters.alignment.aligned = true;
        filters.alignment.ambiguous = true;
        filters.alignment.misaligned = true;
        filters.alignment.na = true;
    } else {
        // Enable only the clicked category
        filters.alignment.aligned = (alignment === 'aligned');
        filters.alignment.ambiguous = (alignment === 'ambiguous');
        filters.alignment.misaligned = (alignment === 'misaligned');
        filters.alignment.na = false;
    }

    // Update the filter button states
    updateFilterButtons();

    // Update chart filter state
    updateChartFilterState();

    // Display filtered entries
    triggerProcessing();
}

// Update filter button states to match current filters
function updateFilterButtons() {
    // Update benevolence filter buttons
    const benevolenceButtons = document.querySelectorAll('[data-filter-type="benevolence"]');
    benevolenceButtons.forEach(btn => {
        const filterValue = btn.dataset.filter;
        if (filterValue === 'any') {
            // Check if all are enabled
            const allActive = Object.values(filters.benevolence).every(v => v === true);
            btn.classList.toggle('active', allActive);
        } else {
            btn.classList.toggle('active', filters.benevolence[filterValue]);
        }
    });

    // Update alignment filter buttons
    const alignmentButtons = document.querySelectorAll('[data-filter-type="alignment"]');
    alignmentButtons.forEach(btn => {
        const filterValue = btn.dataset.filter;
        if (filterValue === 'any') {
            // Check if all are enabled
            const allActive = Object.values(filters.alignment).every(v => v === true);
            btn.classList.toggle('active', allActive);
        } else {
            btn.classList.toggle('active', filters.alignment[filterValue]);
        }
    });
}

// Update statistics
function updateStatistics() {
    // Filter characters matching the AI qualification totals filter
    const filteredCharacters = allCharacters.filter(c => {
        // Check AI qualification totals filter
        const aiQual = c.ai_qualification;
        if (aiQual === 'Pass' && !filters.aiQualificationTotals.pass) return false;
        if (aiQual === 'Ambiguous' && !filters.aiQualificationTotals.ambiguous) return false;
        if (aiQual === 'Fail' && !filters.aiQualificationTotals.fail) return false;
        if ((!aiQual || aiQual === 'N/A') && !filters.aiQualificationTotals.na) return false;

        // Check unresearched filter
        if (c.needs_research === true && !filters.aiQualificationTotals.unresearched) return false;

        return true;
    });

    // Benevolent row
    const benevolentAligned = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Benevolent' && getAlignment(c) === 'Aligned'
    ).length;
    const benevolentNeutral = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Benevolent' && getAlignment(c) === 'Ambiguous'
    ).length;
    const benevolentMisaligned = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Benevolent' && getAlignment(c) === 'Misaligned'
    ).length;
    const benevolentNA = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Benevolent' && getAlignment(c) === 'N/A'
    ).length;

    // Ambiguous benevolence row
    const neutralAligned = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Ambiguous' && getAlignment(c) === 'Aligned'
    ).length;
    const neutralNeutral = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Ambiguous' && getAlignment(c) === 'Ambiguous'
    ).length;
    const neutralMisaligned = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Ambiguous' && getAlignment(c) === 'Misaligned'
    ).length;
    const neutralNA = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Ambiguous' && getAlignment(c) === 'N/A'
    ).length;

    // Malevolent row
    const malevolentAligned = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Malevolent' && getAlignment(c) === 'Aligned'
    ).length;
    const malevolentNeutral = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Malevolent' && getAlignment(c) === 'Ambiguous'
    ).length;
    const malevolentMisaligned = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Malevolent' && getAlignment(c) === 'Misaligned'
    ).length;
    const malevolentNA = filteredCharacters.filter(c =>
        getBenevolence(c) === 'Malevolent' && getAlignment(c) === 'N/A'
    ).length;

    // N/A benevolence row
    const naAligned = filteredCharacters.filter(c =>
        getBenevolence(c) === 'N/A' && getAlignment(c) === 'Aligned'
    ).length;
    const naNeutral = filteredCharacters.filter(c =>
        getBenevolence(c) === 'N/A' && getAlignment(c) === 'Ambiguous'
    ).length;
    const naMisaligned = filteredCharacters.filter(c =>
        getBenevolence(c) === 'N/A' && getAlignment(c) === 'Misaligned'
    ).length;
    const naNA = filteredCharacters.filter(c =>
        getBenevolence(c) === 'N/A' && getAlignment(c) === 'N/A'
    ).length;

    // Column totals
    const totalAligned = benevolentAligned + neutralAligned + malevolentAligned + naAligned;
    const totalNeutral = benevolentNeutral + neutralNeutral + malevolentNeutral + naNeutral;
    const totalMisaligned = benevolentMisaligned + neutralMisaligned + malevolentMisaligned + naMisaligned;
    const totalNA = benevolentNA + neutralNA + malevolentNA + naNA;

    // Row totals
    const totalBenevolent = benevolentAligned + benevolentNeutral + benevolentMisaligned + benevolentNA;
    const totalNeutralBenev = neutralAligned + neutralNeutral + neutralMisaligned + neutralNA;
    const totalMalevolent = malevolentAligned + malevolentNeutral + malevolentMisaligned + malevolentNA;
    const totalNABenev = naAligned + naNeutral + naMisaligned + naNA;

    // Grand total
    const grandTotal = totalAligned + totalNeutral + totalMisaligned + totalNA;

    // Update the DOM
    document.getElementById('benevolent-aligned').textContent = benevolentAligned;
    document.getElementById('benevolent-neutral').textContent = benevolentNeutral;
    document.getElementById('benevolent-misaligned').textContent = benevolentMisaligned;
    document.getElementById('benevolent-na').textContent = benevolentNA;
    document.getElementById('total-benevolent').textContent = totalBenevolent;

    document.getElementById('neutral-aligned').textContent = neutralAligned;
    document.getElementById('neutral-neutral').textContent = neutralNeutral;
    document.getElementById('neutral-misaligned').textContent = neutralMisaligned;
    document.getElementById('neutral-na').textContent = neutralNA;
    document.getElementById('total-neutral-benev').textContent = totalNeutralBenev;

    document.getElementById('malevolent-aligned').textContent = malevolentAligned;
    document.getElementById('malevolent-neutral').textContent = malevolentNeutral;
    document.getElementById('malevolent-misaligned').textContent = malevolentMisaligned;
    document.getElementById('malevolent-na').textContent = malevolentNA;
    document.getElementById('total-malevolent').textContent = totalMalevolent;

    document.getElementById('na-aligned').textContent = naAligned;
    document.getElementById('na-neutral').textContent = naNeutral;
    document.getElementById('na-misaligned').textContent = naMisaligned;
    document.getElementById('na-na').textContent = naNA;
    document.getElementById('total-na-benev').textContent = totalNABenev;

    document.getElementById('total-aligned').textContent = totalAligned;
    document.getElementById('total-neutral').textContent = totalNeutral;
    document.getElementById('total-misaligned').textContent = totalMisaligned;
    document.getElementById('total-na-align').textContent = totalNA;
    document.getElementById('grand-total').textContent = grandTotal;
}

// Display filtered entries (async with progress reporting)
async function displayEntries() {
    entryCounter = 0;
    const container = document.getElementById('entries');
    let entries = allCharacters;

    // Apply AI qualification filter
    updateProgress(5, 'Filtering by AI qualification...');
    await sleep(0); // Yield to browser
    entries = entries.filter(e => {
        const aiQual = e.ai_qualification;
        if (aiQual === 'Pass' && filters.aiQualification.pass) return true;
        if (aiQual === 'Ambiguous' && filters.aiQualification.ambiguous) return true;
        if (aiQual === 'Fail' && filters.aiQualification.fail) return true;
        if ((!aiQual || aiQual === 'N/A') && filters.aiQualification.na) return true;
        return false;
    });

    // Apply unresearched filter
    updateProgress(10, 'Filtering unresearched entries...');
    await sleep(0); // Yield to browser
    entries = entries.filter(e => {
        if (e.needs_research === true && !filters.aiQualification.unresearched) return false;
        return true;
    });

    // Apply benevolence filter
    updateProgress(15, 'Filtering by benevolence...');
    await sleep(0); // Yield to browser
    entries = entries.filter(e => {
        const benev = getBenevolence(e);
        if (benev === 'Benevolent' && filters.benevolence.benevolent) return true;
        if (benev === 'Ambiguous' && filters.benevolence.ambiguous) return true;
        if (benev === 'Malevolent' && filters.benevolence.malevolent) return true;
        if (benev === 'N/A' && filters.benevolence.na) return true;
        return false;
    });

    // Apply alignment filter
    updateProgress(20, 'Filtering by alignment...');
    await sleep(0); // Yield to browser
    entries = entries.filter(e => {
        const align = getAlignment(e);
        if (align === 'Aligned' && filters.alignment.aligned) return true;
        if (align === 'Ambiguous' && filters.alignment.ambiguous) return true;
        if (align === 'Misaligned' && filters.alignment.misaligned) return true;
        if (align === 'N/A' && filters.alignment.na) return true;
        return false;
    });

    // Apply search filter
    updateProgress(25, 'Applying search filter...');
    await sleep(0); // Yield to browser
    if (filters.search) {
        const query = filters.search.toLowerCase();
        entries = entries.filter(entry =>
            (entry.character_name || '').toLowerCase().includes(query) ||
            (entry.work_name || '').toLowerCase().includes(query) ||
            (entry.character_description || '').toLowerCase().includes(query) ||
            (entry.work_type || '').toLowerCase().includes(query) ||
            (entry.character_type || '').toLowerCase().includes(query) ||
            (entry.publication_year ? String(entry.publication_year).includes(query) : false)
        );
    }

    // Generate HTML
    if (entries.length === 0) {
        container.innerHTML = '<div class="no-results">No entries found matching your criteria.</div>';
        return;
    }

    // Group by work type
    updateProgress(30, 'Grouping entries...');
    await sleep(0); // Yield to browser
    const grouped = groupByWorkType(entries);
    let sortedWorkTypes = Object.keys(grouped).sort();

    // Apply work types shuffle if active
    if (shuffleState.workTypesShuffled) {
        sortedWorkTypes = shuffleArray(sortedWorkTypes);
    }

    // Generate HTML with progress reporting
    let html = '';
    const totalWorkTypes = sortedWorkTypes.length;

    for (let i = 0; i < sortedWorkTypes.length; i++) {
        const workType = sortedWorkTypes[i];
        let workTypeEntries = grouped[workType];

        // Calculate progress (30% to 90% for HTML generation)
        const progress = 30 + (60 * (i / totalWorkTypes));
        updateProgress(progress, `Generating HTML for ${workType}...`);
        await sleep(0); // Yield to browser

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
    }

    // Update DOM
    updateProgress(95, 'Updating display...');
    await sleep(0); // Yield to browser
    container.innerHTML = html;

    updateProgress(100, 'Complete!');
}

// Helper function to sleep for async operations
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounced processing trigger
function triggerProcessing() {
    // Clear any existing debounce timer
    if (processingState.debounceTimer) {
        clearTimeout(processingState.debounceTimer);
    }

    // If currently processing, mark that we have queued changes
    if (processingState.isProcessing) {
        processingState.hasQueuedChanges = true;
        showActionQueued();
        return;
    }

    // Show "Action queued" indicator and start debounce
    showActionQueued();

    // Start debounce timer
    processingState.debounceTimer = setTimeout(async () => {
        // Debounce period finished, start processing
        hideActionQueued();
        await processEntries();
    }, 350); // 350ms debounce
}

// Process entries with progress tracking and queue handling
async function processEntries() {
    processingState.isProcessing = true;
    hideActionQueued(); // Always hide "Action queued" when processing starts
    showProgressIndicator();
    updateProgress(0, 'Starting...');

    try {
        // Display entries
        await displayEntries();

        // Check if there are queued changes
        if (processingState.hasQueuedChanges) {
            processingState.hasQueuedChanges = false;
            hideActionQueued(); // Hide the "Action queued" indicator
            // Reset progress and restart processing
            updateProgress(0, 'Processing queued changes...');
            await sleep(100); // Brief pause for visual feedback
            await displayEntries();
        }

        // All done
        await sleep(200); // Brief pause to show 100% completion
        hideProgressIndicator();
    } catch (error) {
        console.error('Error processing entries:', error);
        hideProgressIndicator();
    } finally {
        processingState.isProcessing = false;

        // Check one more time if changes were queued while we were finishing up
        if (processingState.hasQueuedChanges) {
            processingState.hasQueuedChanges = false;
            hideActionQueued();
            await processEntries();
        }
    }
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

    // Format work name with optional year
    const workNameWithYear = entry.publication_year
        ? `${entry.work_name} (${entry.publication_year})`
        : entry.work_name;

    const workLink = entry.work_url ?
        `<a href="${entry.work_url}" target="_blank">${workNameWithYear}</a>` :
        workNameWithYear;

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

    // Format character name with optional type
    const characterNameWithType = entry.character_type
        ? `${entry.character_name} <span class="character-type">(${entry.character_type})</span>`
        : entry.character_name;

    // Add research note if needed
    const researchNote = entry.needs_research
        ? '<span class="needs-research-badge">Needs More Research</span>'
        : '';

    return `
        <div class="entry ${ratingClass}">
            <div class="entry-header">
                <div class="entry-title">${characterNameWithType}${researchNote}</div>
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

        // Handle toggle filters (ai-qualification-totals, ai-qualification, benevolence, alignment)
        if (filterType === 'ai-qualification-totals' || filterType === 'ai-qualification' ||
            filterType === 'benevolence' || filterType === 'alignment') {

            const filterObj = filterType === 'ai-qualification-totals' ? filters.aiQualificationTotals :
                             filterType === 'ai-qualification' ? filters.aiQualification :
                             filterType === 'benevolence' ? filters.benevolence :
                             filters.alignment;

            if (filterValue === 'any') {
                // Check if all are currently enabled
                const allActive = Object.values(filterObj).every(v => v === true);

                if (allActive) {
                    // Toggle all off
                    Object.keys(filterObj).forEach(key => {
                        filterObj[key] = false;
                    });
                } else {
                    // Toggle all on
                    Object.keys(filterObj).forEach(key => {
                        filterObj[key] = true;
                    });
                }

                // Update all button states
                const filterGroup = btn.closest('.filter-section');
                filterGroup.querySelectorAll('.filter-btn:not(.shuffle-btn)').forEach(b => {
                    const bFilterValue = b.dataset.filter;
                    if (bFilterValue === 'any') {
                        b.classList.toggle('active', !allActive);
                    } else {
                        b.classList.toggle('active', !allActive);
                    }
                });
            } else {
                // Toggle individual button
                btn.classList.toggle('active');
                filterObj[filterValue] = !filterObj[filterValue];

                // Update "Any" button state
                const filterGroup = btn.closest('.filter-section');
                const anyBtn = filterGroup.querySelector('[data-filter="any"]');
                const allActive = Object.values(filterObj).every(v => v === true);
                if (allActive) {
                    anyBtn.classList.add('active');
                } else {
                    anyBtn.classList.remove('active');
                }
            }

            if (filterType === 'ai-qualification-totals') {
                updateStatistics();
            } else {
                updateChartFilterState();
                triggerProcessing();
            }
            return;
        }

        // Handle sort-by filter (radio buttons)
        const filterGroup = btn.closest('.filter-section');
        filterGroup.querySelectorAll('.filter-btn:not(.shuffle-btn)').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (filterType === 'sort-by') {
            filters.sortBy = filterValue;
            updateChartColors();
            triggerProcessing();
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
    triggerProcessing();
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

// Toggle N/A row and column in chart
function toggleNAInChart() {
    const btn = document.getElementById('toggle-na-chart-btn');
    const statsContainer = document.getElementById('stats');

    statsContainer.classList.toggle('show-na');

    if (statsContainer.classList.contains('show-na')) {
        btn.textContent = 'Hide N/A in Chart';
        btn.classList.add('active');
    } else {
        btn.textContent = 'Show N/A in Chart';
        btn.classList.remove('active');
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
        triggerProcessing(); // Re-render with original order
    } else {
        // Turn on shuffle
        shuffleState.charactersShuffled = true;
        btn.classList.add('active');
        triggerProcessing();
    }
}

// Toggle shuffle work types
function toggleShuffleWorkTypes() {
    const btn = document.getElementById('shuffle-work-types-btn');

    if (shuffleState.workTypesShuffled) {
        // Turn off shuffle - restore original order
        shuffleState.workTypesShuffled = false;
        btn.classList.remove('active');
        triggerProcessing(); // Re-render with original order
    } else {
        // Turn on shuffle
        shuffleState.workTypesShuffled = true;
        btn.classList.add('active');
        triggerProcessing();
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

// Initialize
loadData();
