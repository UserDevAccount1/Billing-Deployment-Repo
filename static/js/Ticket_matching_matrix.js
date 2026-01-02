// ════════════════════════════════════════════════════════════════════════════
// TICKET MATCHING MATRIX - Core Control (No Filtering)
// ════════════════════════════════════════════════════════════════════════════

// ──── GLOBAL STATE ────
const STATE = {
  smartAddEnabled: true,
  matrixMode: 'structural', // 'structural' or 'data'
  hiddenColumns: new Set(),
  smartAddCount: 0,
  autoPopulatedCount: 0
};

// ──── DATA STORE (Empty by default) ────
const DATA_STORE = {
  ticket_data: {},
  rate_card: {},
  dispatch: {},
  standby: {},
  dedicated: {},
  sv_visit: {},
  project: {},
  final_ticket: {}
};

// ──── TABLE DEFINITIONS ────
const TABLE_NAMES = {
  ticket_data: 'Ticket Data',
  rate_card: 'Rate Card',
  dispatch: 'Dispatch',
  standby: 'Standby',
  dedicated: 'Dedicated',
  sv_visit: 'SV Visit',
  project: 'Project',
  final_ticket: 'Final Ticket'
};

const TABLE_SCHEMAS = {
  ticket_data: ['request_id', 'ticket_number', 'requester', 'subject', 'customer', 'account', 'region', 'country', 'city', 'site_name', 'address', 'postal_code', 'contact_name', 'contact_phone', 'contact_email', 'priority', 'status', 'created_date', 'scheduled_date', 'completed_date', 'sla_due_date', 'service_type', 'problem_description', 'resolution', 'notes'],
  rate_card: ['customer', 'account', 'region', 'country', 'service_type', 'rate_type', 'base_rate', 'hourly_rate', 'overtime_rate', 'weekend_rate', 'holiday_rate', 'travel_rate', 'per_diem', 'currency', 'effective_date', 'expiry_date'],
  dispatch: ['ticket_number', 'dispatch_id', 'technician_name', 'technician_id', 'dispatch_date', 'arrival_time', 'departure_time', 'travel_time', 'onsite_time', 'total_hours', 'status', 'notes'],
  standby: ['ticket_number', 'standby_id', 'technician_name', 'technician_id', 'standby_date', 'start_time', 'end_time', 'total_hours', 'rate', 'total_cost', 'status', 'notes'],
  dedicated: ['ticket_number', 'dedicated_id', 'technician_name', 'technician_id', 'start_date', 'end_date', 'daily_rate', 'total_days', 'total_cost', 'customer', 'account', 'site_name', 'status', 'notes'],
  sv_visit: ['ticket_number', 'sv_id', 'technician_name', 'technician_id', 'visit_date', 'visit_type', 'arrival_time', 'departure_time', 'total_hours', 'rate', 'total_cost', 'status', 'notes'],
  project: ['project_id', 'project_name', 'customer', 'account', 'region', 'country', 'start_date', 'end_date', 'budget', 'actual_cost', 'status', 'project_manager', 'team_size', 'notes'],
  // UPDATED: All requested fields for the Final Preview
  final_ticket: [
    'request_id', 'customer_reference', 'requester', 'subject', 'site_name', 'priority',
    'technician_name', 'status', 'worklog_type', 'completed_date', 'account', 'region',
    'country', 'city', 'contact_email', 'band_type', 'total_hours',
    'hourly_rate', 'revenue', 'currency', 'labor_cost', 'profit', 'margin',
    'vendor_po', 'pre_visit', 'post_visit', 'notes'
  ]
};

// ──── FIELD DEFINITIONS ────
const FIELD_DEFINITIONS = {
  request_id: { label: 'Request ID', type: 'TEXT', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'final_ticket'] },
  ticket_number: { label: 'Ticket Number', type: 'TEXT', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'final_ticket'] },
  requester: { label: 'Requester', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  subject: { label: 'Subject', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  customer: { label: 'Customer', type: 'DROPDOWN', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'rate_card', 'dedicated', 'project', 'final_ticket'] },
  account: { label: 'Account', type: 'DROPDOWN', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'rate_card', 'dedicated', 'project', 'final_ticket'] },
  region: { label: 'Region', type: 'DROPDOWN', group: 'GEOGRAPHIC', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'rate_card', 'project', 'final_ticket'] },
  country: { label: 'Country', type: 'DROPDOWN', group: 'GEOGRAPHIC', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'rate_card', 'project', 'final_ticket'] },
  city: { label: 'City', type: 'TEXT', group: 'GEOGRAPHIC', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'final_ticket'] },
  site_name: { label: 'Site Name', type: 'TEXT', group: 'GEOGRAPHIC', required: false, rag: 'AMBER', autoPopTo: ['ticket_data', 'dedicated', 'final_ticket'] },
  address: { label: 'Address', type: 'TEXT', group: 'GEOGRAPHIC', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  postal_code: { label: 'Postal Code', type: 'TEXT', group: 'GEOGRAPHIC', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  contact_name: { label: 'Contact Name', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  contact_phone: { label: 'Contact Phone', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  contact_email: { label: 'Contact Email', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  priority: { label: 'Priority', type: 'DROPDOWN', group: 'SERVICE', required: false, rag: 'AMBER', autoPopTo: ['ticket_data'] },
  status: { label: 'Status', type: 'DROPDOWN', group: 'SERVICE', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
  created_date: { label: 'Created Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  scheduled_date: { label: 'Scheduled Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'AMBER', autoPopTo: ['ticket_data', 'final_ticket'] },
  completed_date: { label: 'Completed Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'final_ticket'] },
  sla_due_date: { label: 'SLA Due Date', type: 'DATE', group: 'QUALITY', required: false, rag: 'AMBER', autoPopTo: ['ticket_data'] },
  service_type: { label: 'Service Type', type: 'DROPDOWN', group: 'SERVICE', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'rate_card', 'final_ticket'] },
  problem_description: { label: 'Problem Description', type: 'TEXT', group: 'SERVICE', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  resolution: { label: 'Resolution', type: 'TEXT', group: 'SERVICE', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  notes: { label: 'Notes', type: 'TEXT', group: 'SYSTEM', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project'] },
  technician_name: { label: 'Technician Name', type: 'TEXT', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit', 'final_ticket'] },
  technician_id: { label: 'Technician ID', type: 'TEXT', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit'] },
  dispatch_id: { label: 'Dispatch ID', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  dispatch_date: { label: 'Dispatch Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  arrival_time: { label: 'Arrival Time', type: 'TIME', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'sv_visit'] },
  departure_time: { label: 'Departure Time', type: 'TIME', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'sv_visit'] },
  travel_time: { label: 'Travel Time', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  onsite_time: { label: 'Onsite Time', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  total_hours: { label: 'Total Hours', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'sv_visit', 'final_ticket'] },
  standby_id: { label: 'Standby ID', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  standby_date: { label: 'Standby Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  start_time: { label: 'Start Time', type: 'TIME', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  end_time: { label: 'End Time', type: 'TIME', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  rate: { label: 'Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['standby', 'sv_visit'] },
  total_cost: { label: 'Total Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['standby', 'dedicated', 'sv_visit', 'final_ticket'] },
  dedicated_id: { label: 'Dedicated ID', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['dedicated'] },
  start_date: { label: 'Start Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  end_date: { label: 'End Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  daily_rate: { label: 'Daily Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['dedicated'] },
  total_days: { label: 'Total Days', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated'] },
  sv_id: { label: 'SV ID', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },
  visit_date: { label: 'Visit Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },
  visit_type: { label: 'Visit Type', type: 'DROPDOWN', group: 'SERVICE', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },
  project_id: { label: 'Project ID', type: 'TEXT', group: 'PROJECT', required: false, rag: 'GREEN', autoPopTo: ['project'] },
  project_name: { label: 'Project Name', type: 'TEXT', group: 'PROJECT', required: false, rag: 'GREEN', autoPopTo: ['project'] },
  budget: { label: 'Budget', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['project'] },
  actual_cost: { label: 'Actual Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['project'] },
  project_manager: { label: 'Project Manager', type: 'TEXT', group: 'PROJECT', required: false, rag: 'GREEN', autoPopTo: ['project'] },
  team_size: { label: 'Team Size', type: 'NUMBER', group: 'PROJECT', required: false, rag: 'GREEN', autoPopTo: ['project'] },
  rate_type: { label: 'Rate Type', type: 'DROPDOWN', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  base_rate: { label: 'Base Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  hourly_rate: { label: 'Hourly Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  overtime_rate: { label: 'Overtime Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['rate_card'] },
  weekend_rate: { label: 'Weekend Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['rate_card'] },
  holiday_rate: { label: 'Holiday Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['rate_card'] },
  travel_rate: { label: 'Travel Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  per_diem: { label: 'Per Diem', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  currency: { label: 'Currency', type: 'DROPDOWN', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  effective_date: { label: 'Effective Date', type: 'DATE', group: 'SYSTEM', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  expiry_date: { label: 'Expiry Date', type: 'DATE', group: 'SYSTEM', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  labor_cost: { label: 'Labor Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  travel_cost: { label: 'Travel Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  parts_cost: { label: 'Parts Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  revenue: { label: 'Revenue', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  profit: { label: 'Profit', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  margin: { label: 'Margin', type: 'PERCENTAGE', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  sla_met: { label: 'SLA Met', type: 'BOOLEAN', group: 'QUALITY', required: false, rag: 'GREEN', autoPopTo: ['final_ticket'] }
};

// ──── EXPORTS ────
window.STATE = STATE;
window.DATA_STORE = DATA_STORE;
window.TABLE_SCHEMAS = TABLE_SCHEMAS;
window.FIELD_DEFINITIONS = FIELD_DEFINITIONS;
window.TABLE_NAMES = TABLE_NAMES;
window.renderMatrixBody = renderMatrixBody;
window.applyColumnVisibility = applyColumnVisibility;
window.updateStatistics = updateStatistics;
window.updateFinalTablePreview = updateFinalTablePreview;
window.smartAddToOtherTables = smartAddToOtherTables;
window.showToast = showToast;

// ──── INITIALIZATION ────
document.addEventListener('DOMContentLoaded', function () {
  initFileUpload();
  initMatrix();
  initColumnVisibility();
  initSearchHighlight();
  updateStatistics();
  updateFinalTablePreview();

  const validateBtn = document.getElementById('validateFilesBtn');
  if (validateBtn) validateBtn.addEventListener('click', runValidationProcess);

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('keyup', (e) => filterValidationResults(e.target.value));

  document.getElementById('tableViewBtn')?.addEventListener('click', () => toggleView('table'));
  document.getElementById('formViewBtn')?.addEventListener('click', () => toggleView('card'));

  const navBar = document.getElementById('recordNavigation');
  if (navBar) navBar.style.display = 'none';

  // INJECT INLINE EDIT MODAL (If missing)
  if (!document.getElementById('tmmInlineEditModal')) {
    const modalHtml = `
      <div id="tmmInlineEditModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000; justify-content:center; align-items:center;">
          <div style="background:white; padding:20px; border-radius:8px; width:90%; max-width:800px; max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Edit Record Details</h3>
              <div id="tmmInlineEditContent" style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; padding:15px 0;"></div>
              <div style="margin-top:20px; text-align:right; border-top:1px solid #eee; padding-top:10px;">
                  <button onclick="document.getElementById('tmmInlineEditModal').style.display='none'" class="btn-secondary" style="margin-right:10px; padding:8px 16px; cursor:pointer; background:#eee; border:none; border-radius:4px;">Cancel</button>
                  <button onclick="saveInlineEdit()" class="btn-primary" style="padding:8px 16px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">Save Changes</button>
              </div>
          </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
});

function initMatrix() {
  renderMatrixHeader();
  renderMatrixBody();
}

// ──── RENDERING ────
function renderMatrixHeader() {
  const header = document.getElementById('matrixHeader');
  if (!header) return;

  let html = '<th class="field-column">Field Name</th>';
  Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
    const isHidden = STATE.hiddenColumns.has(tableKey);
    html += `<th class="table-column" data-table="${tableKey}" ${isHidden ? 'style="display:none;"' : ''}>${TABLE_NAMES[tableKey]}</th>`;
  });
  header.innerHTML = html;
}

function renderMatrixBody() {
  const body = document.getElementById('matrixBody');
  if (!body) return;

  const allFields = getAllUniqueFields();
  let html = '';

  allFields.forEach(field => {
    const def = FIELD_DEFINITIONS[field] || { label: field, type: 'TEXT', group: 'SYSTEM', required: false, rag: 'RED' };
    html += `<tr class="matrix-row" data-field="${field}" data-group="${def.group}" data-type="${def.type}" data-rag="${def.rag}">`;
    html += `<td class="field-cell">
      <span class="field-name">${def.label || ''}</span>
      <span class="field-meta">${def.type || ''} | ${def.group || ''}</span>
      ${def.required ? '<span class="required-badge">Required</span>' : ''}
      <span class="rag-indicator rag-${def.rag ? def.rag.toLowerCase() : ''}">●</span>
    </td>`;

    Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
      const exists = TABLE_SCHEMAS[tableKey].includes(field);
      const isHidden = STATE.hiddenColumns.has(tableKey);
      const value = DATA_STORE[tableKey][field] || '';

      if (STATE.matrixMode === 'structural') {
        html += `<td class="matrix-cell ${exists ? 'exists' : 'not-exists'}" data-table="${tableKey}" data-field="${field}" ${isHidden ? 'style="display:none;"' : ''}>
          ${exists ? '<span class="check-mark">✔</span>' : '<span class="x-mark">✖</span>'}
        </td>`;
      } else {
        html += `<td class="matrix-cell data-cell ${exists ? '' : 'pending-data'}" data-table="${tableKey}" data-field="${field}" ${isHidden ? 'style="display:none;"' : ''}>
          <input type="text" class="cell-input" value="${value}" onchange="handleCellChange('${tableKey}', '${field}', this.value)" placeholder="${exists ? 'Enter value' : 'Pending'}">
        </td>`;
      }
    });

    html += '</tr>';
  });

  body.innerHTML = html;
}

function getAllUniqueFields() {
  const fields = new Set();
  Object.values(TABLE_SCHEMAS).forEach(schema => schema.forEach(field => fields.add(field)));
  Object.keys(FIELD_DEFINITIONS).forEach(field => fields.add(field));
  return Array.from(fields).sort();
}

// ──── COLUMN VISIBILITY (MANUAL CHECKBOXES ONLY) ────
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

function toggleColumnDropdown() {
  const dropdown = document.getElementById('columnDropdownContent');
  if (dropdown) dropdown.classList.toggle('show');
}

function toggleColumnVisibility(tableKey, visible) {
  if (visible) STATE.hiddenColumns.delete(tableKey);
  else STATE.hiddenColumns.add(tableKey);
  applyColumnVisibility();
}

function applyColumnVisibility() {
  const headerCells = document.querySelectorAll('#matrixHeader th[data-table]');
  const bodyCells = document.querySelectorAll('#matrixBody td[data-table]');
  headerCells.forEach(cell => cell.style.display = STATE.hiddenColumns.has(cell.dataset.table) ? 'none' : '');
  bodyCells.forEach(cell => cell.style.display = STATE.hiddenColumns.has(cell.dataset.table) ? 'none' : '');
}

function showAllColumns() {
  STATE.hiddenColumns.clear();
  document.querySelectorAll('#columnCheckboxList input[type="checkbox"]').forEach(cb => cb.checked = true);
  applyColumnVisibility();
  showToast('All columns visible', 'success');
}

function hideAllColumns() {
  Object.keys(TABLE_SCHEMAS).forEach(key => STATE.hiddenColumns.add(key));
  document.querySelectorAll('#columnCheckboxList input[type="checkbox"]').forEach(cb => cb.checked = false);
  applyColumnVisibility();
  showToast('All columns hidden', 'info');
}

// ──── SEARCH ────
function initSearchHighlight() {
  const searchInput = document.getElementById('searchInput'); // Use simple search ID from your HTML
  const matrixSearch = document.getElementById('matrixSearchInput'); // Handle both if present

  const attach = (el) => {
    if (!el) return;
    el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearchHighlight(el.value);
    });
    el.addEventListener('input', (e) => {
      if (e.target.value === '') clearSearchHighlight();
    });
  };

  attach(searchInput);
  attach(matrixSearch);
}

function performSearchHighlight(query) {
  clearSearchHighlight();
  if (!query.trim()) return;
  const lowerQuery = query.toLowerCase();
  const rows = document.querySelectorAll('#matrixBody .matrix-row');
  let matchCount = 0;

  rows.forEach(row => {
    const field = row.dataset.field;
    const def = FIELD_DEFINITIONS[field] || {};
    const fieldLabel = (def.label || field).toLowerCase();

    // Check Field Name or Input Values
    let match = fieldLabel.includes(lowerQuery);
    if (!match) {
      const cells = row.querySelectorAll('.cell-input');
      cells.forEach(input => {
        if (input.value.toLowerCase().includes(lowerQuery)) {
          input.closest('td').classList.add('search-match-cell');
          match = true;
        }
      });
    }

    if (match) {
      row.classList.add('search-match-row');
      matchCount++;
    }
  });

  showToast(matchCount > 0 ? `Found ${matchCount} matches` : 'No matches found', matchCount > 0 ? 'info' : 'warning');
}

function clearSearchHighlight() {
  document.querySelectorAll('.search-match-row').forEach(el => el.classList.remove('search-match-row'));
  document.querySelectorAll('.search-match-cell').forEach(el => el.classList.remove('search-match-cell'));
}

// ──── DATA HANDLING & SMART ADD ────
function handleCellChange(tableKey, field, value) {
  // 1. Update the Visual Matrix Store (Keep existing behavior)
  DATA_STORE[tableKey][field] = value;

  // 2. NEW: Update the Master Record for Validation
  // This ensures the validator sees what you just typed
  if (loadedImportRecords && loadedImportRecords[currentImportIndex]) {
    loadedImportRecords[currentImportIndex][field] = value;
  }

  // 3. Smart Add & UI Updates
  if (STATE.smartAddEnabled) smartAddToOtherTables(field, value);
  updateStatistics();
  updateFinalTablePreview();
}

function smartAddToOtherTables(field, value) {
  const def = FIELD_DEFINITIONS[field];
  if (!def || !def.autoPopTo) return;

  let populated = 0;
  def.autoPopTo.forEach(targetTable => {
    if (DATA_STORE[targetTable] && !DATA_STORE[targetTable][field]) {
      DATA_STORE[targetTable][field] = value;
      populated++;
      const cell = document.querySelector(`td[data-table="${targetTable}"][data-field="${field}"] .cell-input`);
      if (cell) {
        cell.value = value;
        cell.classList.add('auto-populated');
        setTimeout(() => cell.classList.remove('auto-populated'), 1000);
      }
    }
  });

  STATE.smartAddCount++;
  STATE.autoPopulatedCount += populated;
  if (populated > 0) showToast(`Auto-populated "${def.label}" to ${populated} tables`, 'success');
}

// ──── TOGGLES (Structural vs Data) ────
function toggleMatrixMode() {
  const toggle = document.getElementById('matrixModeToggle');
  STATE.matrixMode = toggle && toggle.checked ? 'data' : 'structural';
  renderMatrixBody();
  applyColumnVisibility();
  updateFinalTablePreview();
}

function toggleSmartAdd() {
  const toggle = document.getElementById('smartAddToggle');
  STATE.smartAddEnabled = toggle ? toggle.checked : true;
  const status = document.getElementById('smartAddStatus');
  if (status) {
    status.textContent = STATE.smartAddEnabled ? 'ACTIVE' : 'DISABLED';
    status.style.color = STATE.smartAddEnabled ? 'var(--success)' : 'var(--gray)';
  }
}

// ──── STATISTICS ────
function updateStatistics() {
  const allFields = getAllUniqueFields();
  let commonCount = 0;
  let uniqueCount = 0;

  allFields.forEach(field => {
    const schemas = Object.values(TABLE_SCHEMAS);
    const inAll = schemas.every(s => s.includes(field));
    const count = schemas.filter(s => s.includes(field)).length;
    if (inAll) commonCount++;
    if (count === 1) uniqueCount++;
  });

  document.getElementById('totalColumns').textContent = allFields.length;
  document.getElementById('commonColumns').textContent = commonCount;
  document.getElementById('uniqueColumns').textContent = uniqueCount;
  document.getElementById('requiredCount').textContent = Object.values(FIELD_DEFINITIONS).filter(d => d.required).length;
  document.getElementById('smartAddCount').textContent = STATE.smartAddCount;
  document.getElementById('autoPopulated').textContent = STATE.autoPopulatedCount;
}

function updateFinalTablePreview() {
  const previewContainer = document.getElementById('finalTablePreview');
  const headerContainer = document.querySelector('.preview-title');
  if (!previewContainer) return;

  // Always use final_ticket store
  const activeData = DATA_STORE['final_ticket'] || {};

  if (headerContainer) {
    headerContainer.innerHTML = `<i class="fas fa-ticket-alt"></i> Final Ticket Data Preview (Aggregation)`;
  }

  // Use the SCHEMA to define order and what to show
  const columnsToShow = TABLE_SCHEMAS.final_ticket;

  // Check if we have any data to show
  const hasData = Object.keys(activeData).length > 0;

  if (!hasData) {
    previewContainer.innerHTML = `
            <div class="empty-preview" style="text-align: center; color: #999; padding: 20px;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>No data aggregated in <strong>Final Ticket</strong> table yet.</p>
            </div>`;
    return;
  }

  let html = '<div class="final-table-scroll"><table class="final-preview-table"><thead><tr>';

  // Headers based on SCHEMA
  columnsToShow.forEach(key => {
    // Fallback label generation since definitions might be missing
    const def = FIELD_DEFINITIONS[key];
    const label = def ? def.label : key.replace(/_/g, ' ').toUpperCase();
    html += `<th>${label}</th>`;
  });

  html += '</tr></thead><tbody><tr>';

  // Values
  columnsToShow.forEach(key => {
    let val = activeData[key];
    // Default to NA if empty/undefined
    if (val === undefined || val === null || String(val).trim() === '') {
      val = 'NA';
    }
    html += `<td>${val}</td>`;
  });

  html += '</tr></tbody></table></div>';
  previewContainer.innerHTML = html;
}

// ──── BULK INPUT (TEXT) ────
function showBulkInputModal() {
  const modal = document.getElementById('bulkInputModal');
  if (modal) modal.style.display = 'flex';
}

function closeBulkInputModal() {
  const modal = document.getElementById('bulkInputModal');
  if (modal) modal.style.display = 'none';
}

function processBulkInput() {
  const textarea = document.getElementById('bulkTextarea');
  if (!textarea) return;

  const lines = textarea.value.trim().split('\n');
  let processed = 0;

  lines.forEach(line => {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const field = parts[0].toLowerCase().replace(/\s+/g, '_');
      const value = parts[1];
      const table = parts[2] ? parts[2].toLowerCase().replace(/\s+/g, '_') : 'ticket_data';

      if (DATA_STORE[table]) {
        DATA_STORE[table][field] = value;
        processed++;
        if (STATE.smartAddEnabled) smartAddToOtherTables(field, value);
      }
    }
  });

  closeBulkInputModal();
  renderMatrixBody();
  applyColumnVisibility();
  updateStatistics();
  updateFinalTablePreview();
  showToast(`Processed ${processed} entries`, 'success');
}

// ──── UTILS ────
function showToast(message, type = 'info') {
  let container = document.querySelector('.tmm-notifications');
  if (!container) {
    container = document.createElement('div');
    container.className = 'tmm-notifications';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `tmm-toast tmm-toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Close dropdown on click outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('columnDropdownContent');
  const btn = document.querySelector('.column-visibility-btn');
  if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) dropdown.classList.remove('show');
});



// ════════════════════════════════════════════════════════════════════════════
// 1. INITIALIZATION & FILE LISTENING
// ════════════════════════════════════════════════════════════════════════════

function initFileUpload() {
  const dropZone = document.getElementById('tmm_uploadArea');
  const fileInput = document.getElementById('tmm_fileInput');

  if (!dropZone || !fileInput) return;

  const checkSelection = () => {
    const contextCustomer = document.getElementById('tmm_customerSelect').value;
    const contextAccount = document.getElementById('tmm_accountSelect').value;

    if (!contextCustomer || contextCustomer.toLowerCase().includes('all') ||
      !contextAccount || contextAccount.toLowerCase().includes('all')) {
      window.showToast("Please select a specific customer and account before importing", "error");
      return false;
    }
    return true;
  }

  // Click to upload
  dropZone.addEventListener('click', () => {
    if (!checkSelection()) return; // Stop if selection invalid
    fileInput.value = '';
    fileInput.click();
  });

  // File Drop
  dropZone.addEventListener('drop', (e) => {
    if (!checkSelection()) return; // Stop if selection invalid
    const dt = e.dataTransfer;
    handleFiles(dt.files);
  }, false);

  // File selected via dialog
  fileInput.addEventListener('change', (e) => {
    if (!checkSelection()) return; // Stop if selection invalid
    handleFiles(e.target.files);
  });

  // Drag & Drop Visuals
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(evt => {
    dropZone.addEventListener(evt, () => dropZone.classList.add('highlight'), false);
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, () => dropZone.classList.remove('highlight'), false);
  });
}


function handleFiles(files) {
  if (!files || files.length === 0) return;

  const allowedExtensions = ['csv', 'xls', 'xlsx'];

  Array.from(files).forEach(file => {
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      window.showToast(`Invalid format: .${fileExtension}`, 'error');
      return;
    }

    window.showToast(`Processing ${file.name}...`, 'info');

    if (fileExtension === 'csv') {
      parseCSV(file);
    } else {
      parseExcel(file);
    }
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 2. CONFIGURATION: FIELD MAPPING (SYNONYMS)
// ════════════════════════════════════════════════════════════════════════════

// Global State
let loadedImportRecords = [];
let currentImportIndex = 0;

/**
 * Maps System IDs (Keys) to potential CSV/Excel Headers (Values Array).
 * Updated based on provided CSV headers.
 */
// UPDATED: Mappings to find the new fields in CSV
const FIELD_SYNONYMS = {
  request_id: ["Request ID", "Req ID", "Ticket Ref", "Case ID", "Partner Ticket Number"],
  ticket_number: ["Ticket Number", "Ticket #", "Inc Number", "Incident ID", "PO number", "External PO NUMBER", "Customer Ticket Number", "Vendor PO"],
  status: ["Request Status", "Status", "State", "Current Status"],
  worklog_type: ["Worklog Type"],
  priority: ["Priority", "Severity", "SLA Level", "Ticket Priority"],
  city: ["CITY OR TOWN", "City", "Town"],
  region: ["REGION OF THE COUNTRY", "Region", "Area", "State", "States"],
  country: ["Country", "Nation", "Location"],
  site_name: ["Site", "Site Name", "Facility", "Site Category"],
  address: ["Address", "Site Address"],
  postal_code: ["Postal Code", "Zip", "Zip code"],
  requester: ["Requester", "Created By"],
  technician_name: ["FIELD ENGINEERS RESOLVER", "Technician", "Engineer", "Resolver", "Technician Name", "Assigned Technician", "Field Engineer Resolver"],
  contact_email: ["Engineer details", "Contact Email", "Engineer Details"],
  customer_reference: ["Customer Reference", "CUSTOMER REFERENCE"],
  subject: ["Subject", "Short Description", "Summary", "Activity Details"],
  service_type: ["Service Type", "Dispatch Category"],
  currency: ["Currency", "Currency ", "currency", "currency-cost"],
  band_type: ["Band Type"],
  vendor_po: ["Vendor PO"],
  pre_visit: ["PRE Visit"],
  post_visit: ["POST Visit"],
  hourly_rate: ["Rate for NBD Per Hour", "Rate for SBD Per Hour", "Hourly Rate", "First Hour rate", "Revenue rate", "1st Hour Revenue Rate", "Revenue Rate"],
  total_hours: ["Total Hours in Hours", "Total Hours", "Time Spent (Hours)"],
  total_cost: ["Total Amount", "Billing as per PO", "Amount on PO", "Total Cost", "Total Cost including Tax"],
  labor_cost: ["Total labor Cost", "Labor Cost", "Total Labor Cost"],
  parts_cost: ["Parts Cost", "Misc. cost ( travel&others)"],
  revenue: ["Total Revenue", "Revenue"],
  profit: ["Profit"],
  margin: ["Margin", "Margin in %", "Margin %"],
  po_balance: ["PO Balance ", "Bal after last months billing "],
  created_date: ["Created Time LT", "Created Date", "Customer Ticket Created Date (MM/DD/YYYY)", "Created Time (UK time)"],
  completed_date: ["Time Spent", "Completed Date", "Resolved Date", "Resolved Time (UK time)", "Resolved Time LT", "Completed Time (UK time)", "Completed Time"],
  arrival_time: ["Starttime LT", "Arrival Time", "Technician IN Time", "Time Spent Starttime (UK time)", "Time Spent Starttime LT"],
  departure_time: ["Endtime LT", "Departure Time", "Technician OUT Time", "Time Spent Endtime (UK time)", "Time Spent Endtime LT"],
  scheduled_date: ["ETA Date (MM/DD/YYYY)", "ETA Time (HH:MM)"],
  notes: ["HCL Comments", "Excis SDM comments", "Notes", "Description", "Remarks", "Comments"],
  customer: ["Customer", "Customer Name", "CUSTOMER REFERENCE"],
  account: ["Account", "Partner Name"]
};

// ════════════════════════════════════════════════════════════════════════════
// 3. PARSERS (CSV & EXCEL)
// ════════════════════════════════════════════════════════════════════════════

function parseCSV(file) {
  Papa.parse(file, {
    header: true, // Crucial: Creates Array of Objects
    skipEmptyLines: true,
    complete: function (results) {
      if (results.data && results.data.length > 0) {
        initializeImportData(results.data);
        window.showToast(`Loaded ${results.data.length} CSV records`, 'success');
      } else {
        window.showToast("File is empty", 'error');
      }
    },
    error: function (err) {
      window.showToast(`CSV Error: ${err.message}`, 'error');
    }
  });
}

function parseExcel(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Assume data is on the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON (Array of Objects)
      // defval: "" ensures empty cells aren't undefined
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData && jsonData.length > 0) {
        initializeImportData(jsonData);
        window.showToast(`Loaded ${jsonData.length} Excel records`, 'success');
      } else {
        window.showToast("Sheet is empty", 'error');
      }
    } catch (error) {
      console.error(error);
      window.showToast(`Error parsing Excel`, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

// ════════════════════════════════════════════════════════════════════════════
// 4. NAVIGATION & ORCHESTRATION (FIXED SCOPE)
// ════════════════════════════════════════════════════════════════════════════

function initializeImportData(dataArray) {
  // 1. Save to Global Window Object (Crucial for Navigation & Validation)
  window.loadedImportRecords = dataArray;
  window.currentImportIndex = 0;

  // 2. Enable Validation Button & Update Count
  const validateBtn = document.getElementById('validateFilesBtn');
  const fileCountDisplay = document.getElementById('fileCount');

  if (validateBtn) {
    validateBtn.disabled = false;
    // Prevent duplicate event listeners
    validateBtn.removeEventListener('click', runValidationProcess);
    validateBtn.addEventListener('click', runValidationProcess);
  }

  if (fileCountDisplay) {
    fileCountDisplay.innerText = window.loadedImportRecords.length + " Records";
  }

  // 3. Show Navigation Bar
  const navBar = document.getElementById('recordNavigation');
  if (navBar) navBar.style.display = 'flex';

  // 4. Load the first record to the visual matrix
  loadRecord(0);
}

function loadRecord(index) {
  // Always check the GLOBAL variable
  if (!window.loadedImportRecords || window.loadedImportRecords.length === 0) return;

  // Safety bounds
  if (index < 0) index = 0;
  if (index >= window.loadedImportRecords.length) index = window.loadedImportRecords.length - 1;

  window.currentImportIndex = index;
  const record = window.loadedImportRecords[index];

  // Update Counter
  const counter = document.getElementById('currentRecordDisplay');
  if (counter) counter.innerText = `${window.currentImportIndex + 1} / ${window.loadedImportRecords.length}`;

  // Reset & Populate Visual Matrix
  if (typeof resetDataStore === 'function') {
    resetDataStore();
  } else {
    Object.keys(DATA_STORE).forEach(key => DATA_STORE[key] = {});
  }

  populateMatrixFromRecord(record);

  // Update UI
  renderMatrixBody();
  updateStatistics();
  updateFinalTablePreview();
}

function nextRecord() {
  // Explicitly check window variables
  if (window.loadedImportRecords && window.currentImportIndex < window.loadedImportRecords.length - 1) {
    loadRecord(window.currentImportIndex + 1);
  } else {
    window.showToast("End of records", 'info');
  }
}

function prevRecord() {
  if (window.currentImportIndex > 0) {
    loadRecord(window.currentImportIndex - 1);
  }
}

function clearCsvData() {
  window.loadedImportRecords = [];
  window.currentImportIndex = 0;

  if (typeof resetDataStore === 'function') resetDataStore();
  renderMatrixBody();
  updateStatistics();
  updateFinalTablePreview();

  const navBar = document.getElementById('recordNavigation');
  if (navBar) navBar.style.display = 'none';

  window.showToast("Data cleared", 'info');
}

// ════════════════════════════════════════════════════════════════════════════
// 5. DATA SYNC (Visual Matrix <-> Validation Array)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Handles manual cell edits and saves them to BOTH the Matrix View AND the Validation Source
 */
window.handleCellChange = function (tableKey, field, value) {
  // 1. Update the Visual Matrix Store (What you see in the grid)
  if (DATA_STORE[tableKey]) {
    DATA_STORE[tableKey][field] = value;
  }

  // 2. CRITICAL: Update the Source Record for Validation
  if (window.loadedImportRecords && window.loadedImportRecords[window.currentImportIndex]) {
    window.loadedImportRecords[window.currentImportIndex][field] = value;
  }

  // 3. Smart Add & UI Refresh
  if (STATE.smartAddEnabled && typeof smartAddToOtherTables === 'function') {
    smartAddToOtherTables(field, value);
  }

  if (typeof updateStatistics === 'function') updateStatistics();
  if (typeof updateFinalTablePreview === 'function') updateFinalTablePreview();
};

/**
 * Populates the Matrix and INJECTS Dropdown Context into the CURRENT Record
 */
function populateMatrixFromRecord(rowObject) {
  // 1. GET CONTEXT
  const contextOptionElem = document.getElementById('tmm_categorySelect');
  const contextCustomerElem = document.getElementById('tmm_customerSelect');
  const contextAccountElem = document.getElementById('tmm_accountSelect');
  const importModeElem = document.getElementById('tmm_importMode');

  const contextOption = contextOptionElem ? contextOptionElem.value : 'ticket';
  const importMode = importModeElem ? importModeElem.value : 'smart';

  // Get Dropdown Text Names
  let contextCustomerName = "";
  if (contextCustomerElem && contextCustomerElem.selectedIndex > -1) {
    const text = contextCustomerElem.options[contextCustomerElem.selectedIndex].text;
    if (!text.toLowerCase().includes('all')) contextCustomerName = text;
  }

  let contextAccountName = "";
  if (contextAccountElem && contextAccountElem.selectedIndex > -1) {
    const text = contextAccountElem.options[contextAccountElem.selectedIndex].text;
    if (!text.toLowerCase().includes('all')) contextAccountName = text;
  }

  // 2. INJECT CONTEXT INTO CURRENT RECORD (For Matrix View)
  if (contextCustomerName) rowObject['customer'] = contextCustomerName;
  if (contextAccountName) rowObject['account'] = contextAccountName;

  // 3. SETUP TARGETS
  const tableKeyMap = {
    'all': 'all', 'ticket': 'ticket_data', 'final': 'final_ticket',
    'rate': 'rate_card', 'dispatch': 'dispatch', 'standby': 'standby',
    'dedicated': 'dedicated', 'sv': 'sv_visit', 'project': 'project'
  };
  const targetTableKey = tableKeyMap[contextOption] || 'ticket_data';
  const isBroadMode = (contextOption === 'all');

  let matchedHeaders = new Set();
  let pendingUpdates = {};

  // 4. SMART MAPPING
  for (const [systemField, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    let foundValue = null;

    if (rowObject.hasOwnProperty(systemField)) {
      foundValue = rowObject[systemField];
      matchedHeaders.add(systemField);
    } else {
      for (const synonym of synonyms) {
        if (rowObject.hasOwnProperty(synonym)) {
          const val = rowObject[synonym];
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            foundValue = val;
            matchedHeaders.add(synonym);
            break;
          }
        }
      }
    }

    if (foundValue !== null) {
      let valStr = String(foundValue);
      if (systemField === 'technician_name') valStr = valStr.replace(/[\r\n]+/g, ", ");
      pendingUpdates[systemField] = valStr;
    }
  }

  // 5. APPEND MODE
  if (importMode === 'append') {
    Object.keys(rowObject).forEach(header => {
      if (!matchedHeaders.has(header) && !FIELD_SYNONYMS[header]) {
        const rawValue = rowObject[header];
        if (rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== "") {
          const dynamicFieldId = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (typeof FIELD_DEFINITIONS !== 'undefined' && !FIELD_DEFINITIONS[dynamicFieldId]) {
            FIELD_DEFINITIONS[dynamicFieldId] = {
              label: header, type: 'text', placeholder: 'Imported',
              category: 'imported', section: 'Imported Data', is_mandatory: false, options: []
            };
          }
          pendingUpdates[dynamicFieldId] = String(rawValue);
        }
      }
    });
  }

  // 6. UPDATE DATA STORE
  if (Object.keys(pendingUpdates).length > 0) {
    if (isBroadMode) {
      if (typeof smartAddToOtherTables === 'function') {
        Object.entries(pendingUpdates).forEach(([key, val]) => smartAddToOtherTables(key, val));
      }
    } else {
      if (DATA_STORE[targetTableKey]) Object.assign(DATA_STORE[targetTableKey], pendingUpdates);
      if (DATA_STORE['final_ticket']) Object.assign(DATA_STORE['final_ticket'], pendingUpdates);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 6. VALIDATION LOGIC (FIXED TO INJECT CONTEXT INTO ALL RECORDS)
// ════════════════════════════════════════════════════════════════════════════

function runValidationProcess() {
  const records = window.loadedImportRecords;

  if (!records || records.length === 0) {
    window.showToast("No records loaded to validate.", "error");
    return;
  }

  window.showToast("Running validation rules...", "info");

  // 1. Get Global Context from Dropdowns
  const contextCustomerElem = document.getElementById('tmm_customerSelect');
  const contextAccountElem = document.getElementById('tmm_accountSelect');

  let globalCustomer = "";
  if (contextCustomerElem && contextCustomerElem.selectedIndex > -1) {
    const text = contextCustomerElem.options[contextCustomerElem.selectedIndex].text;
    if (!text.toLowerCase().includes('all')) globalCustomer = text;
  }

  let globalAccount = "";
  if (contextAccountElem && contextAccountElem.selectedIndex > -1) {
    const text = contextAccountElem.options[contextAccountElem.selectedIndex].text;
    if (!text.toLowerCase().includes('all')) globalAccount = text;
  }

  // 2. Validate Loop (WITH CONTEXT INJECTION FOR ALL RECORDS)
  window.validationResults = records.map((record, index) => {

    // INJECTION: If the record doesn't have a customer/account yet, 
    // inject the dropdown value directly into the record object.
    if (globalCustomer && (!record['customer'] || record['customer'] === 'NA')) {
      record['customer'] = globalCustomer;
    }
    if (globalAccount && (!record['account'] || record['account'] === 'NA')) {
      record['account'] = globalAccount;
    }

    return validateSingleRecord(record, index);
  });

  // 3. Update UI
  updateValidationDashboard(window.validationResults);
  window.showToast("Validation complete!", "success");
}

function validateSingleRecord(rawRecord, index) {
  // Map fields using priority logic
  const mappedRecord = mapRecordToSystemFields(rawRecord);
  let messages = [];
  let status = 'VALID';

  // Check against Rules
  Object.entries(FIELD_DEFINITIONS).forEach(([fieldKey, def]) => {
    const value = mappedRecord[fieldKey];

    // Rule 1: Required Fields
    if (def.required) {
      if (!value || String(value).trim() === '') {
        status = 'ERROR';
        messages.push(`Missing required field: ${def.label}`);
      }
    }

    // Rule 2: Data Types (Basic Number check)
    if (value && String(value).trim() !== '') {
      if (def.type === 'NUMBER' || def.type === 'CURRENCY') {
        const cleanNum = String(value).replace(/[^0-9.-]+/g, "");
        if (isNaN(parseFloat(cleanNum))) {
          status = (status === 'ERROR') ? 'ERROR' : 'WARNING';
          messages.push(`Invalid format for ${def.label}`);
        }
      }
    }
  });

  return {
    id: index + 1,
    mapped: mappedRecord,
    status: status,
    messages: messages
  };
}

function mapRecordToSystemFields(rawRecord) {
  let mapped = {};

  for (const [systemKey, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    // PRIORITY 1: Direct match (Manual Edits / Injected Context have priority)
    if (rawRecord.hasOwnProperty(systemKey) && rawRecord[systemKey] !== undefined && rawRecord[systemKey] !== "") {
      mapped[systemKey] = rawRecord[systemKey];
      continue;
    }

    // PRIORITY 2: Synonym match (Original CSV Data)
    let foundValue = "";
    for (const synonym of synonyms) {
      if (rawRecord.hasOwnProperty(synonym)) {
        const val = rawRecord[synonym];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          foundValue = val;
          break;
        }
      }
    }
    mapped[systemKey] = foundValue;
  }
  return mapped;
}

// --- Validation UI Updaters ---

function updateValidationDashboard(results) {
  const total = results.length;
  const valid = results.filter(r => r.status === 'VALID').length;
  const warning = results.filter(r => r.status === 'WARNING').length;
  const error = results.filter(r => r.status === 'ERROR').length;

  animateValue("validCount", valid);
  animateValue("warningCount", warning);
  animateValue("errorCount", error);
  animateValue("totalCount", total);

  renderValidationTable(results);
  renderValidationCards(results);
}

function renderValidationTable(results) {
  const tbody = document.getElementById('tableBody');
  const thead = document.getElementById('tableHeader');
  if (!tbody || !thead) return;

  thead.innerHTML = `<tr><th>Status</th><th>Row #</th><th>Ticket Number</th><th>Customer</th><th>Technician</th><th>Validation Messages</th><th>Actions</th></tr>`;

  tbody.innerHTML = results.map(row => {
    const statusClass = row.status === 'VALID' ? 'status-valid' : (row.status === 'WARNING' ? 'status-warning' : 'status-error');
    const icon = row.status === 'VALID' ? '<i class="fas fa-check-circle text-success"></i>' : (row.status === 'WARNING' ? '<i class="fas fa-exclamation-triangle text-warning"></i>' : '<i class="fas fa-times-circle text-danger"></i>');

    const messagesHtml = row.messages.length > 0
      ? `<ul class="msg-list">${row.messages.slice(0, 2).map(m => `<li>${m}</li>`).join('')}${row.messages.length > 2 ? '<li>...</li>' : ''}</ul>`
      : '<span class="text-muted">No issues found</span>';

    // Add Edit button to jump back to Matrix view
    return `<tr class="${statusClass}">
            <td class="text-center">${icon}</td>
            <td>${row.id}</td>
            <td><strong>${row.mapped.ticket_number || 'N/A'}</strong></td>
            <td>${row.mapped.customer || 'N/A'}</td>
            <td>${row.mapped.technician_name || 'N/A'}</td>
            <td>${messagesHtml}</td>
            <td><button class="btn-icon-small" onclick="loadRecord(${row.id - 1}); document.querySelector('.tab-btn[data-tab=\\'distributionTab\\']').click();"><i class="fas fa-edit"></i></button></td>
        </tr>`;
  }).join('');
}

// ════════════════════════════════════════════════════════════════════════════
// 6. VALIDATION UI & INLINE EDITING (UPDATED TABLE RENDERER)
// ════════════════════════════════════════════════════════════════════════════

function renderValidationTable(results) {
  const tbody = document.getElementById('tableBody');
  const thead = document.getElementById('tableHeader');
  if (!tbody || !thead) return;

  // 1. Generate Headers dynamically based on Final Ticket Schema
  const finalSchema = TABLE_SCHEMAS.final_ticket;
  let headerHtml = '<tr><th>Status</th><th>Row #</th>';

  // Create headers for all Final Ticket columns
  finalSchema.forEach(fieldKey => {
    const def = FIELD_DEFINITIONS[fieldKey];
    const label = def ? def.label : fieldKey.replace(/_/g, ' ').toUpperCase();
    headerHtml += `<th>${label}</th>`;
  });

  // Append Validation Messages and Actions columns
  headerHtml += '<th>Validation Messages</th><th>Actions</th></tr>';
  thead.innerHTML = headerHtml;

  // 2. Generate Rows
  tbody.innerHTML = results.map(row => {
    const statusClass = row.status === 'VALID' ? 'status-valid' : (row.status === 'WARNING' ? 'status-warning' : 'status-error');
    const icon = row.status === 'VALID' ? '<i class="fas fa-check-circle text-success"></i>' : (row.status === 'WARNING' ? '<i class="fas fa-exclamation-triangle text-warning"></i>' : '<i class="fas fa-times-circle text-danger"></i>');

    const messagesHtml = row.messages.length > 0
      ? `<ul class="msg-list">${row.messages.slice(0, 2).map(m => `<li>${m}</li>`).join('')}${row.messages.length > 2 ? '<li>...</li>' : ''}</ul>`
      : '<span class="text-muted">No issues found</span>';

    // Start Row
    let rowHtml = `<tr class="${statusClass}">
        <td class="text-center">${icon}</td>
        <td>${row.id}</td>`;

    // Populate Data Cells based on Final Ticket Schema
    finalSchema.forEach(fieldKey => {
      let val = row.mapped[fieldKey];
      // Default to empty string if undefined/null to prevent "undefined" showing up
      if (val === undefined || val === null) val = '';
      rowHtml += `<td>${val}</td>`;
    });

    // Add Validation Message Column
    rowHtml += `<td>${messagesHtml}</td>`;

    // Add Actions Column (Edit + Delete)
    rowHtml += `
        <td>
            <div style="display:flex; gap:5px;">
                <button class="btn-icon-small" title="Edit" onclick="openInlineEditModal(${row.id - 1})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon-small btn-danger" title="Delete" onclick="deleteRecord(${row.id - 1})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>`;

    return rowHtml;
  }).join('');
}

// --- NEW: DELETE FUNCTION ---
window.deleteRecord = function (index) {
  if (!confirm("Are you sure you want to delete this record?")) return;

  // Remove from Master Array
  window.loadedImportRecords.splice(index, 1);

  // Adjust current index if needed
  if (window.currentImportIndex >= window.loadedImportRecords.length) {
    window.currentImportIndex = Math.max(0, window.loadedImportRecords.length - 1);
  }

  // Re-run validation to refresh table
  runValidationProcess();

  // Refresh Matrix View
  loadRecord(window.currentImportIndex);

  window.showToast("Record deleted", "info");
};

function animateValue(id, end) {
  const obj = document.getElementById(id);
  if (obj) { obj.innerHTML = end; }
}

function toggleView(viewType) {
  const tableDisplay = document.getElementById('tableDisplay');
  const formDisplay = document.getElementById('formViewContainer');
  const btnTable = document.getElementById('tableViewBtn');
  const btnForm = document.getElementById('formViewBtn');

  if (viewType === 'table') {
    tableDisplay.style.display = 'block'; formDisplay.style.display = 'none';
    btnTable.classList.add('active'); btnForm.classList.remove('active');
  } else {
    tableDisplay.style.display = 'none'; formDisplay.style.display = 'grid';
    btnTable.classList.remove('active'); btnForm.classList.add('active');
  }
}

function filterValidationResults(query) {
  const lowerQ = query.toLowerCase();
  document.querySelectorAll('#tableBody tr').forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(lowerQ) ? '' : 'none';
  });
}



// --- NEW: INLINE EDIT FUNCTIONS ---

window.openInlineEditModal = function (index) {
  if (!window.loadedImportRecords || !window.loadedImportRecords[index]) return;

  window.inlineEditIndex = index;
  const record = window.loadedImportRecords[index];
  // Map using synonyms to get current values
  const mapped = mapRecordToSystemFields(record);

  const content = document.getElementById('tmmInlineEditContent');
  const modal = document.getElementById('tmmInlineEditModal');

  content.innerHTML = '';

  // We use the Final Ticket Schema to decide what fields to show in the edit modal
  const fieldsToShow = TABLE_SCHEMAS.final_ticket;

  fieldsToShow.forEach(fieldKey => {
    const def = FIELD_DEFINITIONS[fieldKey];

    // Get value: Check mapped first, then fallback to NA
    let val = mapped[fieldKey];
    if (val === undefined || val === null) val = '';

    // Generate Label: Use definition if exists, else format key
    const label = def ? def.label : fieldKey.replace(/_/g, ' ').toUpperCase();

    const html = `
        <div style="display:flex; flex-direction:column;">
            <label style="font-size:0.85rem; font-weight:bold; color:#555; margin-bottom:4px;">${label}</label>
            <input type="text" id="inline_${fieldKey}" value="${val}" placeholder="NA" style="padding:8px; border:1px solid #ccc; border-radius:4px;">
        </div>`;

    content.insertAdjacentHTML('beforeend', html);
  });

  modal.style.display = 'flex';
};

window.saveInlineEdit = function () {
  const index = window.inlineEditIndex;
  if (index === null) return;

  const record = window.loadedImportRecords[index];

  // Iterate through the inputs we created
  const fieldsToShow = TABLE_SCHEMAS.final_ticket;
  fieldsToShow.forEach(fieldKey => {
    const input = document.getElementById(`inline_${fieldKey}`);
    if (input) {
      // Update the MASTER record directly
      record[fieldKey] = input.value;

      // Sync with Matrix Data Store ONLY if this record is currently loaded in matrix view
      if (index === window.currentImportIndex) {
        // We check all tables to see if this field belongs to them
        Object.keys(DATA_STORE).forEach(tableKey => {
          // Simple check: does this table typically hold this field?
          // Or we just force update if the key exists in the schema
          if (TABLE_SCHEMAS[tableKey] && TABLE_SCHEMAS[tableKey].includes(fieldKey)) {
            DATA_STORE[tableKey][fieldKey] = input.value;
          }
        });
        // Always update final ticket store
        if (DATA_STORE['final_ticket']) DATA_STORE['final_ticket'][fieldKey] = input.value;
      }
    }
  });

  // Close modal
  document.getElementById('tmmInlineEditModal').style.display = 'none';

  // Re-run validation to update the status in the validation table
  runValidationProcess();

  // Refresh Matrix UI if we edited the currently viewed record
  if (index === window.currentImportIndex) {
    renderMatrixBody();
    updateStatistics();
    updateFinalTablePreview();
  }

  window.showToast("Record updated successfully", "success");
};