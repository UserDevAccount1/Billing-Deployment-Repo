// ════════════════════════════════════════════════════════════════════════════
// TICKET MATCHING MATRIX CONTROL - Separate Control Functions
// ════════════════════════════════════════════════════════════════════════════
// This file handles: Advanced Filters, Column Visibility, Data Input Modes
// Connected to: Ticket_matching_matrix.js
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// COLUMN VISIBILITY CONTROLS
// ════════════════════════════════════════════════════════════════════════════

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
    // FIX: If user explicitly wants SHOW ALL, we must clear hidden columns
    // AND reset the site category dropdown so the UI doesn't look conflicting
    if (siteCategoryEl && siteCategoryEl.value !== '') {
      siteCategoryEl.value = ''; // Reset category to "All"
      // Optional: Notify user
      // showToast('Category filter cleared', 'info'); 
    }
    STATE.hiddenColumns.clear();
  } else {
    // Specific table selected
    const target = tableMap[tableFilter];
    if (target) {
      // If we are filtering by a specific table, we also reset the category
      // to avoid confusion
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
      if (ragFilter === 'REQUIRED' && !def.required) visible = false;
      if (ragFilter === 'OPTIONAL' && def.required) visible = false;
      if (['GREEN', 'AMBER', 'RED'].includes(ragFilter) && rag !== ragFilter) visible = false;
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

  if (mode === 'BULK') {
    showBulkInputModal();
    return;
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

/**
 * Show bulk input modal
 */
function showBulkInputModal() {
  const modal = document.getElementById('bulkInputModal');
  if (modal) {
    modal.style.display = 'flex';

    // Focus on textarea
    const textarea = document.getElementById('bulkTextarea');
    if (textarea) {
      textarea.focus();
      // Add placeholder example
      if (!textarea.value) {
        textarea.placeholder = 'Example:\nticket_number, 12345, ticket_data\ncustomer, Acme Corp, ticket_data\nregion, EMEA, ticket_data';
      }
    }
  }
}

/**
 * Close bulk input modal
 */
function closeBulkInputModal() {
  const modal = document.getElementById('bulkInputModal');
  if (modal) modal.style.display = 'none';

  // Reset input mode dropdown
  const inputMode = document.getElementById('inputMode');
  if (inputMode) inputMode.value = 'NORMAL';
}

/**
 * Process bulk input data
 */
function processBulkInput() {
  const textarea = document.getElementById('bulkTextarea');
  if (!textarea) return;

  const lines = textarea.value.trim().split('\n');
  let processed = 0;
  let errors = 0;

  console.log('[processBulkInput] Processing', lines.length, 'lines');

  lines.forEach((line, index) => {
    if (!line.trim()) return; // Skip empty lines

    const parts = line.split(',').map(p => p.trim());

    if (parts.length < 2) {
      console.warn(`[processBulkInput] Line ${index + 1}: Invalid format (need at least field,value)`);
      errors++;
      return;
    }

    const field = parts[0].toLowerCase().replace(/\s+/g, '_');
    const value = parts[1];
    const table = parts[2] ? parts[2].toLowerCase().replace(/\s+/g, '_') : 'ticket_data';

    if (!DATA_STORE[table]) {
      console.warn(`[processBulkInput] Line ${index + 1}: Unknown table "${table}"`);
      errors++;
      return;
    }

    DATA_STORE[table][field] = value;
    processed++;

    // Apply smart add if enabled
    if (STATE.smartAddEnabled) {
      smartAddToOtherTables(field, value);
    }

    console.log(`[processBulkInput] Line ${index + 1}: ${field} = ${value} → ${table}`);
  });

  // Clear textarea
  textarea.value = '';

  // Close modal
  closeBulkInputModal();

  // Refresh matrix
  renderMatrixBody();
  applyColumnVisibility();
  updateStatistics();
  updateFinalTablePreview();

  // Show result
  if (errors > 0) {
    showToast(`Processed ${processed} entries (${errors} errors)`, 'warning');
  } else {
    showToast(`Successfully processed ${processed} entries`, 'success');
  }

  console.log(`[processBulkInput] Complete: ${processed} processed, ${errors} errors`);
}

// ════════════════════════════════════════════════════════════════════════════
// DISPLAY OPTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Apply highlighting based on selected mode
 */
function applyHighlighting() {
  const mode = document.getElementById('highlightMode')?.value || 'NONE';
  const rows = document.querySelectorAll('#matrixBody .matrix-row');

  console.log('[applyHighlighting] Mode:', mode);

  // Remove all highlight classes first
  rows.forEach(row => {
    row.classList.remove(
      'highlight-source',
      'highlight-type',
      'highlight-required',
      'highlight-rag',
      'highlight-auto',
      'highlight-validation',
      'highlight-empty',
      'highlight-nonexistent',
      'highlight-rag-green',
      'highlight-rag-amber',
      'highlight-rag-red'
    );
  });

  if (mode === 'NONE') return;

  // Apply new highlighting
  rows.forEach(row => {
    const field = row.dataset.field;
    const def = FIELD_DEFINITIONS[field] || {};

    switch (mode) {
      case 'REQUIRED_STATUS':
        if (def.required) row.classList.add('highlight-required');
        break;

      case 'RAG_STATUS':
        const ragColor = (def.rag || 'green').toLowerCase();
        row.classList.add(`highlight-rag-${ragColor}`);
        break;

      case 'AUTO_POP':
        if (def.autoPopTo && def.autoPopTo.length > 1) {
          row.classList.add('highlight-auto');
        }
        break;

      case 'EMPTY':
        const hasData = Object.values(DATA_STORE).some(store => store[field]);
        if (!hasData) row.classList.add('highlight-empty');
        break;

      case 'DATA_TYPE':
        row.classList.add('highlight-type');
        break;
    }
  });

  showToast(`Highlighting: ${mode}`, 'info');
}

/**
 * Apply display options
 */
function applyDisplayOptions() {
  console.log('[applyDisplayOptions] Applying display options');
  applyHighlighting();
}

/**
 * Apply display mode
 */
function applyDisplayMode() {
  const mode = document.getElementById('displayMode')?.value || 'COMPACT';
  const matrixTable = document.querySelector('.matrix-table');

  if (!matrixTable) return;

  // Remove existing mode classes
  matrixTable.classList.remove('display-compact', 'display-comfortable', 'display-spacious');

  // Add new mode class
  matrixTable.classList.add(`display-${mode.toLowerCase()}`);

  console.log('[applyDisplayMode] Mode:', mode);
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
    closeBulkInputModal();

    const dropdown = document.getElementById('columnDropdownContent');
    if (dropdown) dropdown.classList.remove('show');

    const panel = document.getElementById('advancedFilters');
    if (panel) panel.classList.remove('show');
  }
});

console.log('[Ticket_matching_matrix_control.js] Loaded successfully');