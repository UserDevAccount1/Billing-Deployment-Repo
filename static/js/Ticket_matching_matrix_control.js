// ════════════════════════════════════════════════════════════════════════════
// TICKET MATCHING MATRIX CONTROL - Separate Control Functions
// ════════════════════════════════════════════════════════════════════════════
// This file handles: Advanced Filters, Column Visibility, Data Input Modes
// Connected to: Ticket_matching_matrix.js
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// COLUMN VISIBILITY CONTROLS
// ════════════════════════════════════════════════════════════════════════════

let highlightTimeoutId = null;

/**
 * Initialize column visibility checkboxes
 */
function initColumnVisibility() {
  const checkboxList = document.getElementById('columnCheckboxList');
  if (!checkboxList) return;

  let html = '';
  Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
    html += `
      <label class="column-checkbox-item">
        <input type="checkbox" checked onchange="toggleColumnVisibility('${tableKey}', this.checked)" data-table="${tableKey}">
        ${TABLE_NAMES[tableKey]}
      </label>
    `;
  });
  checkboxList.innerHTML = html;
}

/**
 * Toggle column visibility dropdown
 */
function toggleColumnDropdown() {
  const dropdown = document.getElementById('columnDropdownContent');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

/**
 * Toggle visibility of a specific column
 */
function toggleColumnVisibility(tableKey, visible) {
  if (visible) {
    STATE.hiddenColumns.delete(tableKey);
  } else {
    STATE.hiddenColumns.add(tableKey);
  }
  applyColumnVisibility();
}

/**
 * Apply column visibility to matrix
 */
function applyColumnVisibility() {
  if (typeof STATE === 'undefined') return;

  const headerCells = document.querySelectorAll('#matrixHeader th[data-table]');
  const bodyCells = document.querySelectorAll('#matrixBody td[data-table]');

  // Use empty string '' to remove the style attribute entirely when showing
  // This allows the CSS table-cell property to take over
  headerCells.forEach(cell => {
    cell.style.display = STATE.hiddenColumns.has(cell.dataset.table) ? 'none' : '';
  });

  bodyCells.forEach(cell => {
    cell.style.display = STATE.hiddenColumns.has(cell.dataset.table) ? 'none' : '';
  });
}

/**
 * Show all columns (Column Visibility Dropdown)
 */
function showAllColumns() {
  if (typeof STATE === 'undefined') return;

  STATE.hiddenColumns.clear();

  // Also reset the category/table filters visually so UI matches reality
  const siteCategoryEl = document.getElementById('siteCategory');
  const tableFilterEl = document.getElementById('tableFilter');
  if (siteCategoryEl) siteCategoryEl.value = '';
  if (tableFilterEl) tableFilterEl.value = 'SHOW_ALL';

  applyColumnVisibility();
  updateCheckboxes();
  // showToast('All columns visible', 'success');
}

/**
 * Hide all columns (Column Visibility Dropdown)
 */
function hideAllColumns() {
  if (typeof STATE === 'undefined' || typeof TABLE_SCHEMAS === 'undefined') return;

  Object.keys(TABLE_SCHEMAS).forEach(key => {
    STATE.hiddenColumns.add(key);
  });

  applyColumnVisibility();
  updateCheckboxes();
}

/**
 * Update checkboxes based on current state
 */
function updateCheckboxes() {
  const checkboxes = document.querySelectorAll('#columnCheckboxList input[type="checkbox"]');
  checkboxes.forEach(cb => {
    const table = cb.dataset.table;
    cb.checked = !STATE.hiddenColumns.has(table);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// ADVANCED FILTER CONTROLS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Toggle advanced filters panel
 */
function toggleAdvancedFilters() {
  const panel = document.getElementById('advancedFilters');
  if (panel) {
    panel.classList.toggle('show');
  }
}

/**
 * Apply all filters to the matrix
 */
function applyFilters() {
  if (typeof STATE === 'undefined' || typeof FIELD_DEFINITIONS === 'undefined') return;

  const tableFilterEl = document.getElementById('tableFilter');
  const tableFilter = tableFilterEl ? tableFilterEl.value : 'SHOW_ALL';

  const fieldGroupFilter = document.getElementById('fieldGroupFilter')?.value || 'ALL';
  const ragFilter = document.getElementById('ragFilter')?.value || 'ALL';
  const dataTypeFilter = document.getElementById('dataTypeFilter')?.value || 'ALL';
  const sortOrder = document.getElementById('sortOrder')?.value || 'ALPHABETICAL_ASC';

  const siteCategoryEl = document.getElementById('siteCategory');
  const showRequiredOnly = document.getElementById('showRequiredOnly')?.checked || false;
  const showEmptyOnly = document.getElementById('showEmptyOnly')?.checked || false;

  // 1) COLUMN VISIBILITY LOGIC
  const tableMap = {
    'TICKET_DATA': 'ticket_data',
    'RATE_CARD': 'rate_card',
    'DISPATCH': 'dispatch',
    'STANDBY': 'standby',
    'DEDICATED': 'dedicated',
    'SV_VISIT': 'sv_visit',
    'PROJECT': 'project',
    'FINAL_TABLE': 'final_ticket'
  };

  if (tableFilter === 'SHOW_ALL') {
    if (siteCategoryEl && siteCategoryEl.value !== '') {
      siteCategoryEl.value = ''; // Reset category to "All"
    }
    STATE.hiddenColumns.clear();
  } else {
    // Specific table selected
    const target = tableMap[tableFilter];
    if (target) {
      if (siteCategoryEl && siteCategoryEl.value !== '') {
        siteCategoryEl.value = '';
      }

      Object.keys(TABLE_SCHEMAS).forEach(k => {
        if (k === target) STATE.hiddenColumns.delete(k);
        else STATE.hiddenColumns.add(k);
      });
    }
  }

  // Apply visual changes to columns
  applyColumnVisibility();
  updateCheckboxes();

  // --- NEW LOGIC: PRE-CALCULATE VISIBLE TABLES FOR "REQUIRED_TABLE" FILTER ---
  const visibleTables = Object.keys(TABLE_SCHEMAS).filter(key => !STATE.hiddenColumns.has(key));
  let ignoreRequiredTableFilter = false;

  if (ragFilter === 'REQUIRED_TABLE') {
    if (visibleTables.length !== 1) {
      // If the user tries to use this filter with multiple tables visible, show a warning
      // We use a small timeout to ensure the toast renders after any previous UI updates
      setTimeout(() => showToast("Select exactly one table to use 'Required in table'", "warning"), 100);
      ignoreRequiredTableFilter = true;
    }
  }
  // ---------------------------------------------------------------------------

  // 2) ROW FILTER LOGIC (Hide/Show Rows based on content)
  const rows = Array.from(document.querySelectorAll('#matrixBody .matrix-row'));

  rows.forEach(row => {
    const field = row.dataset.field;
    const group = row.dataset.group;
    const type = row.dataset.type;
    const rag = row.dataset.rag;
    const def = FIELD_DEFINITIONS[field] || {};

    let visible = true;

    if (fieldGroupFilter !== 'ALL' && group !== fieldGroupFilter) visible = false;

    if (ragFilter !== 'ALL') {
      // --- NEW LOGIC: REQUIRED_TABLE ---
      if (ragFilter === 'REQUIRED_TABLE') {
        if (!ignoreRequiredTableFilter) {
          const activeTable = visibleTables[0];
          // Check if the field exists in the schema of the single visible table
          if (!TABLE_SCHEMAS[activeTable].includes(field)) {
            visible = false;
          }
        }
      }
      // ---------------------------------
      else if (ragFilter === 'REQUIRED' && !def.required) visible = false;
      else if (ragFilter === 'OPTIONAL' && def.required) visible = false;
      else if (['GREEN', 'AMBER', 'RED'].includes(ragFilter) && rag !== ragFilter) visible = false;
    }

    if (dataTypeFilter !== 'ALL' && type !== dataTypeFilter) visible = false;

    if (showRequiredOnly && !def.required) visible = false;

    if (showEmptyOnly) {
      // empty means: no value anywhere in DATA_STORE for this field
      const hasData = Object.values(DATA_STORE).some(store => {
        const v = store[field];
        return v !== undefined && v !== null && String(v).trim() !== '';
      });
      if (hasData) visible = false;
    }

    row.style.display = visible ? '' : 'none';
  });

  // 3) SORT LOGIC
  applySortOrder(sortOrder);
}
function applySortOrder(sortOrder) {
  const tbody = document.getElementById('matrixBody');
  if (!tbody) return;

  const displayMode = document.getElementById('displayMode')?.value || 'FLAT';
  if (displayMode === 'GROUPED' || displayMode === 'TABLE_WISE') {
    return;
  }

  const rows = Array.from(tbody.querySelectorAll('.matrix-row'));

  const keyFor = (row) => {
    const field = row.dataset.field;
    const def = FIELD_DEFINITIONS[field] || {};
    return {
      label: (def.label || field).toLowerCase(),
      required: !!def.required,
      rag: (def.rag || row.dataset.rag || 'GREEN'),
      type: (def.type || row.dataset.type || 'TEXT'),
      group: (def.group || row.dataset.group || 'SYSTEM')
    };
  };

  const visibleRows = rows.filter(r => r.style.display !== 'none');
  const hiddenRows = rows.filter(r => r.style.display === 'none');

  const cmp = {
    ALPHABETICAL_ASC: (a, b) => keyFor(a).label.localeCompare(keyFor(b).label),
    ALPHABETICAL_DESC: (a, b) => keyFor(b).label.localeCompare(keyFor(a).label),
    REQUIRED_FIRST: (a, b) => Number(keyFor(b).required) - Number(keyFor(a).required) || keyFor(a).label.localeCompare(keyFor(b).label),
    MANDATORY_FIRST: (a, b) => Number(keyFor(b).required) - Number(keyFor(a).required) || keyFor(a).label.localeCompare(keyFor(b).label),
    DATA_TYPE: (a, b) => keyFor(a).type.localeCompare(keyFor(b).type) || keyFor(a).label.localeCompare(keyFor(b).label),
    FIELD_GROUP: (a, b) => keyFor(a).group.localeCompare(keyFor(b).group) || keyFor(a).label.localeCompare(keyFor(b).label),
    TABLE_ORDER: (a, b) => 0
  }[sortOrder] || ((a, b) => keyFor(a).label.localeCompare(keyFor(b).label));

  if (sortOrder !== 'TABLE_ORDER') {
    visibleRows.sort(cmp);
  }

  // Re-append in order: visible first (sorted), then hidden (keep existing order)
  [...visibleRows, ...hiddenRows].forEach(r => tbody.appendChild(r));
}
/**
 * Reset all filters to default
 */
function resetFilters() {
  // Reset all filter dropdowns
  const tableFilter = document.getElementById('tableFilter');
  const fieldGroupFilter = document.getElementById('fieldGroupFilter');
  const ragFilter = document.getElementById('ragFilter');
  const dataTypeFilter = document.getElementById('dataTypeFilter');
  const sortOrder = document.getElementById('sortOrder');
  const inputMode = document.getElementById('inputMode');

  if (tableFilter) tableFilter.value = 'SHOW_ALL';
  if (fieldGroupFilter) fieldGroupFilter.value = 'ALL';
  if (ragFilter) ragFilter.value = 'ALL';
  if (dataTypeFilter) dataTypeFilter.value = 'ALL';
  if (sortOrder) sortOrder.value = 'ALPHABETICAL_ASC';
  if (inputMode) inputMode.value = 'NORMAL';

  // Reset checkboxes
  const showRequiredOnly = document.getElementById('showRequiredOnly');
  const showEmptyOnly = document.getElementById('showEmptyOnly');
  const showTransformation = document.getElementById('showTransformation');

  if (showRequiredOnly) showRequiredOnly.checked = false;
  if (showEmptyOnly) showEmptyOnly.checked = false;
  if (showTransformation) showTransformation.checked = false;

  // Reset column visibility
  STATE.hiddenColumns.clear();
  applyColumnVisibility();
  updateCheckboxes();

  // Show all rows
  const rows = document.querySelectorAll('#matrixBody .matrix-row');
  rows.forEach(row => row.style.display = '');

  // Hide site category group
  const siteCategoryGroup = document.getElementById('siteCategoryGroup');
  if (siteCategoryGroup) siteCategoryGroup.style.display = 'none';

  console.log('[resetFilters] All filters reset');
  showToast('Filters reset', 'info');
}

/**
 * Filter by specific site category
 */
function filterBySiteCategory() {
  const category = document.getElementById('siteCategory')?.value || '';
  const tableFilterEl = document.getElementById('tableFilter');

  if (typeof STATE === 'undefined') return;

  if (!category) {
    // If category is cleared, show everything
    STATE.hiddenColumns.clear();
  } else {
    // If a category is selected, ensure the "Table Filter" dropdown 
    // says "Show All" (or similar) so it doesn't look like a conflict,
    // but we technically hide the non-category columns below.
    if (tableFilterEl) tableFilterEl.value = 'SHOW_ALL';

    const categoryMap = {
      'dispatch': 'dispatch',
      'dedicated': 'dedicated',
      'project': 'project',
      'sv': 'sv_visit',
      'standby': 'standby'
    };

    const targetTable = categoryMap[category];

    Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
      // Always show ticket_data and final_ticket, plus the selected category table
      if (tableKey === targetTable || tableKey === 'ticket_data' || tableKey === 'final_ticket') {
        STATE.hiddenColumns.delete(tableKey);
      } else {
        STATE.hiddenColumns.add(tableKey);
      }
    });
  }

  applyColumnVisibility();
  updateCheckboxes();

  if (category) showToast(`Filtered to: ${category}`, 'success');
}

// ════════════════════════════════════════════════════════════════════════════
// DATA INPUT MODE CONTROLS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handle input mode changes
 */
function handleInputMode() {
  const mode = document.getElementById('inputMode')?.value || 'NORMAL';
  const siteCategoryGroup = document.getElementById('siteCategoryGroup');

  // Show/hide site category selector
  if (siteCategoryGroup) {
    siteCategoryGroup.style.display = (mode === 'SITE_CATEGORY') ? 'block' : 'none';
  }

  if (mode === 'FINAL_TABLE') {
    // show ticket_data + final_ticket only
    Object.keys(TABLE_SCHEMAS).forEach(k => {
      if (k === 'ticket_data' || k === 'final_ticket') STATE.hiddenColumns.delete(k);
      else STATE.hiddenColumns.add(k);
    });
    applyColumnVisibility();
    updateCheckboxes();
    showToast('Input Mode: Final Table Centric', 'info');
    return;
  }

  if (mode === 'TABLE_SPECIFIC') {
    // rely on current tableFilter selection
    applyFilters();
    showToast('Input Mode: Table-Specific (uses Table Filter)', 'info');
    return;
  }

  // NORMAL / VALIDATION_FIRST / etc. -> for now just re-apply filters
  applyFilters();
}

// ════════════════════════════════════════════════════════════════════════════
// DISPLAY OPTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Apply highlighting based on selected mode
 */
/**
 * Apply highlighting based on selected mode
 */
function applyHighlighting() {
  const mode = document.getElementById('highlightMode')?.value || 'NONE';
  const rows = document.querySelectorAll('#matrixBody .matrix-row');

  // Get Filter values
  const typeFilterVal = document.getElementById('dataTypeFilter')?.value || 'ALL';
  const ragFilterVal = document.getElementById('ragFilter')?.value || 'ALL';

  // Get Source Table Selection
  const sourceSelect = document.getElementById('tmm_categorySelect');
  const sourceValue = sourceSelect ? sourceSelect.value : 'all';

  // 1. CLEAR: Remove all previous highlight classes
  rows.forEach(row => {
    row.className = 'matrix-row';
    row.querySelectorAll('td').forEach(td => {
      td.classList.remove('highlight-source-cell');
      td.classList.remove('highlight-validation-error');
      td.classList.remove('highlight-empty'); // Clear empty highlights
    });
  });

  if (mode === 'NONE') return;

  // 2. APPLY: Iterate rows
  rows.forEach(row => {
    const field = row.dataset.field;
    const def = FIELD_DEFINITIONS[field] || {};

    if (!def) return;

    switch (mode) {
      // ----------------------------------------------------------------
      // CASE: EMPTY FIELDS (Cell-Level)
      // Highlights specific cells that have inputs but no value
      // ----------------------------------------------------------------
      case 'EMPTY':
        // Find all data cells in this row (exclude the label cell)
        const dataCells = row.querySelectorAll('td.data-cell');

        dataCells.forEach(cell => {
          const input = cell.querySelector('input');
          // If input exists and value is empty string
          if (input && input.value.trim() === '') {
            cell.classList.add('highlight-empty');
          }
        });
        break;

      // ----------------------------------------------------------------
      // CASE: VALIDATION STATUS (Cell-Level)
      // Highlights ONLY the Final Ticket cell if it is Mandatory + Empty
      // ----------------------------------------------------------------
      case 'VALIDATION':
        // Only proceed if the field is actually required
        if (def.required) {
          // Find the specific cell for 'final_ticket'
          const finalCell = row.querySelector('td[data-table="final_ticket"]');

          if (finalCell) {
            const input = finalCell.querySelector('input');
            // Check if input is empty
            if (input && input.value.trim() === '') {
              finalCell.classList.add('highlight-validation-error');
            }
          }
        }
        break;

      // ----------------------------------------------------------------
      // CASE: RAG STATUS (Row-Level)
      // ----------------------------------------------------------------
      case 'RAG_STATUS':
        const rowRag = (def.rag || 'GREEN').toUpperCase();
        const selectedRag = ragFilterVal.toUpperCase();
        const validRagValues = ['GREEN', 'AMBER', 'RED', 'ALL'];
        const isRagMatch = (selectedRag === 'ALL') || (selectedRag === rowRag);

        if (validRagValues.includes(selectedRag) && isRagMatch) {
          row.classList.add('highlight-dynamic-row');
        } else if (!validRagValues.includes(selectedRag)) {
          row.classList.add('highlight-dynamic-row');
        }
        break;

      // ----------------------------------------------------------------
      // CASE: REQUIRED STATUS (Row-Level)
      // ----------------------------------------------------------------
      case 'REQUIRED_STATUS':
        const isRequired = def.required === true;
        const selectedReqOption = ragFilterVal.toUpperCase();

        if (selectedReqOption === 'REQUIRED') {
          if (isRequired) row.classList.add('highlight-dynamic-row');
        }
        else if (selectedReqOption === 'OPTIONAL') {
          if (!isRequired) row.classList.add('highlight-dynamic-row');
        }
        else if (selectedReqOption === 'REQUIRED_TABLE') {
          if (row.style.display !== 'none') row.classList.add('highlight-dynamic-row');
        }
        else {
          if (isRequired) row.classList.add('highlight-dynamic-row');
        }
        break;

      // ----------------------------------------------------------------
      // CASE: DATA TYPE (Row-Level)
      // ----------------------------------------------------------------
      case 'DATA_TYPE':
        const rowType = (row.dataset.type || 'TEXT').toUpperCase();
        const selectedType = typeFilterVal.toUpperCase();
        if (selectedType === 'ALL' || selectedType === rowType) {
          row.classList.add('highlight-dynamic-row');
        }
        break;

      // ----------------------------------------------------------------
      // CASE: SOURCE TABLE (Cell-Level)
      // ----------------------------------------------------------------
      case 'SOURCE_TABLE':
        const schemaMap = {
          'ticket': 'ticket_data',
          'rate': 'rate_card',
          'dispatch': 'dispatch',
          'standby': 'standby',
          'dedicated': 'dedicated',
          'sv': 'sv_visit',
          'project': 'project',
          'final': 'final_ticket'
        };

        let targetKeys = [];
        if (sourceValue === 'all') {
          targetKeys = Object.keys(TABLE_SCHEMAS);
        } else {
          const mappedKey = schemaMap[sourceValue] || sourceValue;
          if (mappedKey) targetKeys.push(mappedKey);
        }

        targetKeys.forEach(key => {
          const cell = row.querySelector(`td[data-table="${key}"]`);
          if (cell) {
            cell.classList.add('highlight-source-cell');
          }
        });
        break;

      // ----------------------------------------------------------------
      // CASE: AUTO POPULATED (Row-Level)
      // ----------------------------------------------------------------
      case 'AUTO_POP':
        if (def.autoPopTo && def.autoPopTo.length > 0) {
          row.classList.add('highlight-type-dropdown');
        }
        break;
    }
  });

  console.log(`Highlighting applied: ${mode}`);
}

/**
 * Apply display options
 */
function applyDisplayOptions() {
  console.log('[applyDisplayOptions] Applying display options');
  applyHighlighting();
}

function applyDisplayMode() {
  const mode = document.getElementById('displayMode')?.value || 'FLAT';
  const matrixTable = document.querySelector('.matrix-table');

  if (!matrixTable) return;

  console.log('[applyDisplayMode] Switching to:', mode);

  // 1. Remove existing display classes
  matrixTable.classList.remove('display-compact', 'display-expanded', 'display-flat');

  // 2. Apply CSS Class based on mode
  if (mode === 'COMPACT') {
    matrixTable.classList.add('display-compact');
  } else {
    matrixTable.classList.add('display-expanded');
  }

  // 3. Re-render the body (This handles the Grouping structure)
  renderMatrixBody();

  showToast(`Display mode: ${mode}`, 'info');
}

// ════════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS & INITIALIZATION
// ════════════════════════════════════════════════════════════════════════════

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('columnDropdownContent');
  const btn = document.querySelector('.column-visibility-btn');

  if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

// Close advanced filters when clicking outside
document.addEventListener('click', (e) => {
  const panel = document.getElementById('advancedFilters');
  const btn = document.querySelector('[onclick="toggleAdvancedFilters()"]');

  if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
    if (panel.classList.contains('show')) {
      // Don't close if clicking inside the panel
      if (!e.target.closest('#advancedFilters')) {
        panel.classList.remove('show');
      }
    }
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + F: Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.focus();
  }
  // Ctrl/Cmd + Shift + F: Toggle advanced filters
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    toggleAdvancedFilters();
  }
  // Escape: Close modals and dropdowns
  if (e.key === 'Escape') {
    const dropdown = document.getElementById('columnDropdownContent');
    if (dropdown) dropdown.classList.remove('show');

    const panel = document.getElementById('advancedFilters');
    if (panel) panel.classList.remove('show');
  }
});

window.applyFilters = applyFilters;
console.log('[Ticket_matching_matrix_control.js] Loaded successfully');


let lastQuery = '';
let currentMatchIndex = -1;

// ──── SEARCH ────
function initSearchHighlight() {
  const searchInput = document.getElementById('searchInput');
  const matrixSearch = document.getElementById('matrixSearchInput');

  const attach = (el) => {
    if (!el) return;
    if (el.dataset.hasSearchListener === 'true') return;
    el.dataset.hasSearchListener = 'true';

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        performSearchHighlight(el.value);
      }
    });

    el.addEventListener('input', (e) => {
      // If user clears input, clear visuals AND reset index
      if (e.target.value === '') {
         clearSearchHighlight();
         currentMatchIndex = -1; 
         lastQuery = '';
      }
    });
  };

  attach(searchInput);
  attach(matrixSearch);
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCH LOGIC UPDATE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Triggered when Search Mode dropdown changes
 */
function updateMatrixSearchMode(mode) {
  const input = document.getElementById('matrixSearchInput');
  if (input && input.value.trim() !== '') {
    performSearchHighlight(input.value, false);
  }
}

/**
 * Triggered when Search Option checkboxes change
 */
function updateMatrixSearchOptions() {
  const input = document.getElementById('matrixSearchInput');
  if (input && input.value.trim() !== '') {
    performSearchHighlight(input.value, false);
  }
}


function updateHighlightDuration(val) {
    // Optional: Update a label text if you have one, e.g.:
    // document.getElementById('durationLabel').textContent = val + 'ms';
    console.log('Highlight duration set to:', val);
}


/**
 * Main Search Execution Function
 * Respects: Mode (All/Field/Value), Case Sensitivity, Exact Match, Hidden Rows
 */
// Add this helper for the range slider (optional, handles the oninput event)
function performSearchHighlight(query, shouldScrollParam = true) {
  // 1. Get Search Controls & Options
  const searchMode = document.getElementById('matrixSearchMode')?.value || 'all';
  const isCaseSensitive = document.getElementById('matrixCaseSensitive')?.checked || false;
  const isExactMatch = document.getElementById('matrixExactMatch')?.checked || false;
  const includeHidden = document.getElementById('matrixSearchHidden')?.checked || false;
  const matchColor = document.getElementById('currentMatchColor')?.value || '#FFFF00';
  
  // --- TIMEOUT MANAGEMENT: Clear pending removal if user searches again ---
  if (highlightTimeoutId) {
    clearTimeout(highlightTimeoutId);
    highlightTimeoutId = null;
  }

  // 2. Prepare Query
  const comparisonQuery = isCaseSensitive ? query : query.toLowerCase();

  // Handle Empty Query
  if (!comparisonQuery || comparisonQuery.trim() === '') {
    clearSearchHighlight();
    lastQuery = '';
    currentMatchIndex = -1; 
    return;
  }

  // Handle New Query
  if (comparisonQuery !== lastQuery) {
    currentMatchIndex = -1;
    lastQuery = comparisonQuery;
  }

  // 3. Clear Previous Highlights
  clearSearchHighlight();

  const rows = document.querySelectorAll('#matrixBody .matrix-row');
  let matches = [];

  // --- HELPER: Comparison Logic ---
  const checkMatch = (textValue) => {
    if (!textValue) return false;
    const val = isCaseSensitive ? textValue : textValue.toLowerCase();
    if (isExactMatch) return val === comparisonQuery;
    return val.includes(comparisonQuery);
  };

  // 4. Iterate Rows
  rows.forEach(row => {
    if (!includeHidden && row.style.display === 'none') return;

    let rowMatches = false;

    // Scope 1: Field Names
    if (searchMode === 'all' || searchMode === 'field') {
      const fieldNameEl = row.querySelector('.field-name');
      if (fieldNameEl && checkMatch(fieldNameEl.textContent.trim())) {
        rowMatches = true;
        fieldNameEl.closest('td').classList.add('search-match-cell');
      }
    }

    // Scope 2: Values
    if (searchMode === 'all' || searchMode === 'value' || searchMode === 'table') {
      const cells = row.querySelectorAll('td.data-cell');
      cells.forEach(cell => {
        if (searchMode === 'table') {
          const tableKey = cell.getAttribute('data-table');
          if (checkMatch(tableKey)) {
             cell.classList.add('search-match-cell');
             rowMatches = true;
          }
        } else {
          const input = cell.querySelector('input');
          if (input && checkMatch(input.value)) {
            cell.classList.add('search-match-cell');
            rowMatches = true;
          }
        }
      });
    }

    // 5. Collect Matches
    if (rowMatches) {
      row.classList.add('search-match-row');
      matches.push(row);
    }
  });

  // 6. Handle No Matches
  if (matches.length === 0) {
    showToast('No matches found', 'warning');
    currentMatchIndex = -1; 
    return;
  }

  // 7. Navigation
  currentMatchIndex = (currentMatchIndex + 1) % matches.length;
  const currentRow = matches[currentMatchIndex];
  
  // Apply Color
  document.documentElement.style.setProperty('--tmm-current-match-color', matchColor);
  currentRow.classList.add('search-match-active');

  // Scroll
  const shouldScrollCheckbox = document.getElementById('autoScrollToMatch')?.checked || false;
  if (shouldScrollCheckbox && shouldScrollParam) {
    currentRow.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  showToast(`Match ${currentMatchIndex + 1} of ${matches.length}`, 'info');

  // 8. --- NEW: AUTO-CLEAR HIGHLIGHTS LOGIC ---
  // If "Persist Highlights" is UNCHECKED, remove highlights after X seconds
  const persistCheckbox = document.getElementById('persistHighlights');
  
  // Default to true (persist) if element is missing
  const shouldPersist = persistCheckbox ? persistCheckbox.checked : true; 

  if (!shouldPersist) {
      const durationInput = document.getElementById('highlightDuration');
      const duration = durationInput ? parseInt(durationInput.value, 10) : 1000;

      highlightTimeoutId = setTimeout(() => {
          clearSearchHighlight();
          // We do NOT reset currentMatchIndex here so if they press 'Enter' again, 
          // it continues to the next match even if visually cleared.
      }, duration);
  }
}


function clearSearchHighlight() {
  document.querySelectorAll('.search-match-row').forEach(el => el.classList.remove('search-match-row'));
  document.querySelectorAll('.search-match-cell').forEach(el => el.classList.remove('search-match-cell'));
  document.querySelectorAll('.search-match-active').forEach(el => el.classList.remove('search-match-active'));
}


function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


// ════════════════════════════════════════════════════════════════════════════
// COLOR PICKER CONTROLS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Updates the Global Highlight Color (Used for Search & Source Table)
 */
function updateMatchHighlightColor(color) {
  // 1. Set CSS Variable on Root
  document.documentElement.style.setProperty('--tmm-highlight-color', color);

  // 2. Update the text label next to the picker
  const label = document.getElementById('matchColorValue');
  if (label) label.textContent = color;

  // 3. Optional: Persist to localStorage
  // localStorage.setItem('tmm_highlight_color', color);
}

/**
 * Updates the "Current" Match Color (Used for the active search result)
 */
function updateCurrentMatchColor(color) {
  document.documentElement.style.setProperty('--tmm-current-match-color', color);
  const label = document.getElementById('currentColorValue');
  if (label) label.textContent = color;
}

// Initialize colors on load
document.addEventListener('DOMContentLoaded', () => {
  initSearchHighlight();
  const matchPicker = document.getElementById('matchHighlightColor');
  const currentPicker = document.getElementById('currentMatchColor');

  if (matchPicker) updateMatchHighlightColor(matchPicker.value);
  if (currentPicker) updateCurrentMatchColor(currentPicker.value);
});