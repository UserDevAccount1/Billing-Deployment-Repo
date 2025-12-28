// ═══════════════════════════════════════════════════════════════════════════
// TMM BAND FEATURES - JAVASCRIPT (Connected to Ticket_matching_matrix.js)
// ═══════════════════════════════════════════════════════════════════════════

console.log('[TMM Band Features] Script loading...');

// ─────────────────────────────────────────────────────────────────────────────
// TMM BAND STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
const TMM_BAND_STATE = {
  selectedTables: new Set(['dispatch', 'dedicated', 'sv_visit', 'project']),
  currentCustomer: 'HCL',
  currentAccount: '',
  currentBand: '',
  bandData: {
    dispatch: {},
    dedicated: {},
    sv_visit: {},
    project: {},
    standby: {}
  },
  isModified: false,
  isPanelOpen: false
};

// ─────────────────────────────────────────────────────────────────────────────
// TMM BAND TABLE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const TMM_BAND_TABLES = {
  dispatch: {
    name: 'Dispatch Services',
    icon: 'fas fa-truck-fast',
    color: '#10b981',
    description: 'On-demand incident & IMAC pricing with band-based rates',
    bands: ['4 Hour', 'SBD', 'NBD', '2 BD', '3 BD', 'Additional Hour'],
    columns: ['Price', 'SLA', 'Description'],
    hasBandLevels: false
  },
  dedicated: {
    name: 'Dedicated Services',
    icon: 'fas fa-user-tie',
    color: '#ef4444',
    description: 'Monthly dedicated resource pricing with 5 band levels',
    bands: ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'],
    columns: ['With Benefits', 'Without Benefits', 'Difference'],
    hasBandLevels: true
  },
  sv_visit: {
    name: 'SV Visit (Full/Half Day)',
    icon: 'fas fa-calendar-check',
    color: '#1e40af',
    description: 'Scheduled visit pricing for full day and half day services',
    groups: [
      {
        title: 'Full Day Visit (8hrs)',
        bands: ['Band 0', 'Band 1', 'Band 2'],
        columns: ['Price', 'Duration', 'Max Hours']
      },
      {
        title: 'Half Day Visit (4hrs)',
        bands: ['Band 0', 'Band 1', 'Band 2'],
        columns: ['Price', 'Duration', 'Max Hours']
      }
    ],
    hasBandLevels: true
  },
  project: {
    name: 'Project Work',
    icon: 'fas fa-project-diagram',
    color: '#5b21b6',
    description: 'Short & long term project pricing with band levels',
    groups: [
      {
        title: 'Short Term (≤3 months)',
        bands: ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'],
        columns: ['Price', 'Duration', 'Min Term', 'Max Term']
      },
      {
        title: 'Long Term (>3 months)',
        bands: ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'],
        columns: ['Price', 'Duration', 'Min Term', 'Max Term']
      }
    ],
    hasBandLevels: true
  },
  standby: {
    name: 'Standby Services',
    icon: 'fas fa-clock',
    color: '#f59e0b',
    description: 'Standby resource pricing with hourly rates',
    bands: ['Band 0', 'Band 1', 'Band 2', 'Band 3'],
    columns: ['Hourly Rate', 'Min Hours', 'Max Hours'],
    hasBandLevels: true
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TMM SAMPLE BAND DATA (HCL)
// ─────────────────────────────────────────────────────────────────────────────
const TMM_SAMPLE_BAND_DATA = {
  dispatch: {
    '4 Hour': ['$350', '4 hours', 'Immediate response'],
    'SBD': ['$450', 'Same Day', 'Business hours'],
    'NBD': ['$550', 'Next Day', 'Business hours'],
    '2 BD': ['$650', '2 Days', 'Business days'],
    '3 BD': ['$750', '3 Days', 'Business days'],
    'Additional Hour': ['$120/hr', 'Hourly', 'Extra time']
  },
  dedicated: {
    'Band 0': ['$26,000', '$23,000', '$3,000'],
    'Band 1': ['$28,000', '$25,000', '$3,000'],
    'Band 2': ['$30,000', '$27,000', '$3,000'],
    'Band 3': ['$32,000', '$29,000', '$3,000'],
    'Band 4': ['$34,000', '$31,000', '$3,000']
  },
  sv_visit: {
    'Full Day Visit (8hrs)': {
      'Band 0': ['$300', '8 hours', '8'],
      'Band 1': ['$320', '8 hours', '8'],
      'Band 2': ['$350', '8 hours', '8']
    },
    'Half Day Visit (4hrs)': {
      'Band 0': ['$150', '4 hours', '4'],
      'Band 1': ['$160', '4 hours', '4'],
      'Band 2': ['$175', '4 hours', '4']
    }
  },
  project: {
    'Short Term (≤3 months)': {
      'Band 0': ['$5,000', '<3 months', '1 month', '3 months'],
      'Band 1': ['$5,500', '<3 months', '1 month', '3 months'],
      'Band 2': ['$6,000', '<3 months', '1 month', '3 months'],
      'Band 3': ['$6,500', '<3 months', '1 month', '3 months'],
      'Band 4': ['$7,000', '<3 months', '1 month', '3 months']
    },
    'Long Term (>3 months)': {
      'Band 0': ['$4,500', '>3 months', '4 months', '12 months'],
      'Band 1': ['$5,000', '>3 months', '4 months', '12 months'],
      'Band 2': ['$5,500', '>3 months', '4 months', '12 months'],
      'Band 3': ['$6,000', '>3 months', '4 months', '12 months'],
      'Band 4': ['$6,500', '>3 months', '4 months', '12 months']
    }
  },
  standby: {
    'Band 0': ['$45/hr', '2 hours', '8 hours'],
    'Band 1': ['$50/hr', '2 hours', '8 hours'],
    'Band 2': ['$55/hr', '2 hours', '8 hours'],
    'Band 3': ['$60/hr', '2 hours', '8 hours']
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TMM INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────
function tmmInitializeBandFeatures() {
  console.log('[TMM Band Features] Initializing...');
  
  // Load sample data
  TMM_BAND_STATE.bandData = JSON.parse(JSON.stringify(TMM_SAMPLE_BAND_DATA));
  
  // Set up event listeners
  document.addEventListener('click', tmmHandleOutsideClick);
  document.addEventListener('keydown', tmmHandleEscapeKey);
  
  // Sync with main matrix customer/account selection
  tmmSyncWithMainMatrix();
  
  console.log('[TMM Band Features] Initialized successfully');
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNC WITH MAIN MATRIX (Ticket_matching_matrix.js)
// ─────────────────────────────────────────────────────────────────────────────
function tmmSyncWithMainMatrix() {
  const customerSelect = document.getElementById('tmm_customerSelect');
  const accountSelect = document.getElementById('tmm_accountSelect');
  
  if (customerSelect) {
    TMM_BAND_STATE.currentCustomer = customerSelect.value || 'HCL';
    customerSelect.addEventListener('change', (e) => {
      TMM_BAND_STATE.currentCustomer = e.target.value;
      console.log('[TMM Band Features] Customer changed to:', TMM_BAND_STATE.currentCustomer);
      tmmLoadBandDataForCustomer(TMM_BAND_STATE.currentCustomer);
    });
  }
  
  if (accountSelect) {
    TMM_BAND_STATE.currentAccount = accountSelect.value || '';
    accountSelect.addEventListener('change', (e) => {
      TMM_BAND_STATE.currentAccount = e.target.value;
      console.log('[TMM Band Features] Account changed to:', TMM_BAND_STATE.currentAccount);
    });
  }
  
  console.log('[TMM Band Features] Synced with main matrix');
}

function tmmLoadBandDataForCustomer(customer) {
  if (customer.toUpperCase().includes('HCL')) {
    TMM_BAND_STATE.bandData = JSON.parse(JSON.stringify(TMM_SAMPLE_BAND_DATA));
    console.log('[TMM Band Features] Loaded HCL band data');
  } else {
    Object.keys(TMM_BAND_STATE.bandData).forEach(key => {
      TMM_BAND_STATE.bandData[key] = {};
    });
    console.log('[TMM Band Features] No band data for customer:', customer);
  }
  
  if (TMM_BAND_STATE.isPanelOpen) {
    tmmLoadBandDetailsContent();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TMM BAND FILTER DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
function tmmToggleBandFilterDropdown() {
  const dropdown = document.getElementById('tmmBandFilterDropdown');
  const btn = document.getElementById('tmmBandFilterBtn');
  
  if (!dropdown || !btn) {
    console.error('[TMM Band Filter] Dropdown or button not found');
    return;
  }
  
  const isShown = dropdown.classList.contains('show');
  
  if (isShown) {
    dropdown.classList.remove('show');
    btn.classList.remove('active');
  } else {
    dropdown.classList.add('show');
    btn.classList.add('active');
  }
}

function tmmHandleBandTableFilter(checkbox) {
  const tableKey = checkbox.value;
  
  if (checkbox.checked) {
    TMM_BAND_STATE.selectedTables.add(tableKey);
  } else {
    TMM_BAND_STATE.selectedTables.delete(tableKey);
  }
  
  console.log('[TMM Band Filter] Selected tables:', Array.from(TMM_BAND_STATE.selectedTables));
  tmmApplyBandTableFilterToMatrix();
}

function tmmApplyBandTableFilterToMatrix() {
  console.log('[TMM Band Filter] Applying filter to matrix...');
  
  // Get all table columns in the main matrix
  const allTables = ['ticket_data', 'rate_card', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'];
  
  // Hide/show columns based on band table selection
  allTables.forEach(tableKey => {
    // Always show ticket_data and final_ticket
    if (tableKey === 'ticket_data' || tableKey === 'final_ticket' || tableKey === 'rate_card') {
      tmmShowMatrixColumn(tableKey);
      return;
    }
    
    // Show/hide based on selection
    if (TMM_BAND_STATE.selectedTables.has(tableKey)) {
      tmmShowMatrixColumn(tableKey);
    } else {
      tmmHideMatrixColumn(tableKey);
    }
  });
  
  console.log('[TMM Band Filter] Filter applied to matrix');
}

function tmmShowMatrixColumn(tableKey) {
  if (typeof STATE !== 'undefined' && STATE.hiddenColumns) {
    STATE.hiddenColumns.delete(tableKey);
  }
  
  const headerCells = document.querySelectorAll(`#matrixHeader th[data-table="${tableKey}"]`);
  const bodyCells = document.querySelectorAll(`#matrixBody td[data-table="${tableKey}"]`);
  
  headerCells.forEach(cell => cell.style.display = '');
  bodyCells.forEach(cell => cell.style.display = '');
}

function tmmHideMatrixColumn(tableKey) {
  if (typeof STATE !== 'undefined' && STATE.hiddenColumns) {
     STATE.hiddenColumns.add(tableKey);
  }
  
  const headerCells = document.querySelectorAll(`#matrixHeader th[data-table="${tableKey}"]`);
  const bodyCells = document.querySelectorAll(`#matrixBody td[data-table="${tableKey}"]`);
  
  headerCells.forEach(cell => cell.style.display = 'none');
  bodyCells.forEach(cell => cell.style.display = 'none');
}

function tmmClearBandFilters() {
  const checkboxes = document.querySelectorAll('.tmm-band-filter-item input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  
  TMM_BAND_STATE.selectedTables.clear();
  tmmApplyBandTableFilterToMatrix();
  
  tmmShowToast('Band filters cleared', 'info');
}

function tmmSelectAllBandFilters() {
  const checkboxes = document.querySelectorAll('.tmm-band-filter-item input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = true;
    TMM_BAND_STATE.selectedTables.add(checkbox.value);
  });
  
  tmmApplyBandTableFilterToMatrix();
  tmmShowToast('All band tables selected', 'success');
}

// ─────────────────────────────────────────────────────────────────────────────
// TMM BAND DETAILS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function tmmOpenBandDetailsPanel() {
  console.log('[TMM Band Panel] Opening panel...');
  
  const panel = document.getElementById('tmmBandDetailsPanel');
  const overlay = document.getElementById('tmmBandOverlay');
  
  if (!panel || !overlay) {
    console.error('[TMM Band Panel] Panel or overlay not found!');
    return;
  }
  
  if (TMM_BAND_STATE.selectedTables.size === 0) {
    tmmShowToast('Please select at least one band table to view details', 'warning');
    return;
  }
  
  // Close dropdown first
  const dropdown = document.getElementById('tmmBandFilterDropdown');
  const btn = document.getElementById('tmmBandFilterBtn');
  if (dropdown) dropdown.classList.remove('show');
  if (btn) btn.classList.remove('active');
  
  // Show panel with animation
  TMM_BAND_STATE.isPanelOpen = true;
  
  setTimeout(() => {
    overlay.classList.add('active');
    panel.classList.add('active');
  }, 10);
  
  // Load content
  tmmLoadBandDetailsContent();
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function tmmCloseBandDetailsPanel() {
  console.log('[TMM Band Panel] Closing panel...');
  
  const panel = document.getElementById('tmmBandDetailsPanel');
  const overlay = document.getElementById('tmmBandOverlay');
  
  if (panel) panel.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  
  TMM_BAND_STATE.isPanelOpen = false;
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  if (TMM_BAND_STATE.isModified) {
    if (confirm('You have unsaved changes. Do you want to save before closing?')) {
      tmmSaveBandDetails();
    } else {
      TMM_BAND_STATE.isModified = false;
    }
  }
}

function tmmLoadBandDetailsContent() {
  const content = document.getElementById('tmmBandPanelContent');
  if (!content) return;
  
  console.log('[TMM Band Panel] Loading content...');
  
  content.innerHTML = `
    <div class="tmm-band-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading band details...</p>
    </div>
  `;
  
  setTimeout(() => {
    content.innerHTML = tmmRenderBandDetailsContent();
  }, 500);
}

function tmmRenderBandDetailsContent() {
  let html = '';
  
  // Add customer/account info header
  html += `
    <div class="tmm-band-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-left: none;">
      <div class="tmm-band-section-header" style="border-bottom-color: rgba(255,255,255,0.2);">
        <div class="tmm-band-section-title" style="color: white;">
          <i class="fas fa-building"></i>
          <span>Context Information</span>
        </div>
      </div>
      <div class="tmm-band-info-row">
        <span class="tmm-band-info-label" style="color: rgba(255,255,255,0.9);">Customer:</span>
        <span class="tmm-band-info-value" style="color: white; font-weight: 600;">${TMM_BAND_STATE.currentCustomer || 'Not Selected'}</span>
      </div>
      <div class="tmm-band-info-row">
        <span class="tmm-band-info-label" style="color: rgba(255,255,255,0.9);">Account:</span>
        <span class="tmm-band-info-value" style="color: white; font-weight: 600;">${TMM_BAND_STATE.currentAccount || 'Not Selected'}</span>
      </div>
      <div class="tmm-band-info-row" style="border-bottom: none;">
        <span class="tmm-band-info-label" style="color: rgba(255,255,255,0.9);">Selected Tables:</span>
        <span class="tmm-band-info-value" style="color: white; font-weight: 600;">${TMM_BAND_STATE.selectedTables.size}</span>
      </div>
    </div>
  `;
  
  // Render each selected table
  TMM_BAND_STATE.selectedTables.forEach(tableKey => {
    const table = TMM_BAND_TABLES[tableKey];
    if (!table) return;
    
    html += `
      <div class="tmm-band-card ${tableKey}">
        <div class="tmm-band-card-header">
          <div class="tmm-band-card-icon ${tableKey}">
            <i class="${table.icon}"></i>
          </div>
          <div class="tmm-band-card-title">
            <h3>${table.name}</h3>
            <p>${table.description}</p>
          </div>
        </div>
        <div class="tmm-band-card-content">
          ${tmmRenderBandTable(tableKey, table)}
        </div>
      </div>
    `;
  });
  
  if (TMM_BAND_STATE.selectedTables.size === 0) {
    html = `
      <div class="tmm-band-section">
        <p class="tmm-band-text-muted">Please select at least one band table from the filter dropdown to view details.</p>
      </div>
    `;
  }
  
  return html;
}

function tmmRenderBandTable(tableKey, table) {
  const data = TMM_BAND_STATE.bandData[tableKey] || {};
  
  if (table.groups) {
    return table.groups.map(group => `
      <div class="tmm-band-section">
        <div class="tmm-band-section-header">
          <div class="tmm-band-section-title">
            <span>${group.title}</span>
          </div>
        </div>
        <div class="tmm-band-table-wrapper">
          <table class="tmm-band-table">
            <thead>
              <tr>
                <th>Band</th>
                ${group.columns.map(col => `<th>${col}</th>`).join('')}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${group.bands.map(band => {
                const bandData = data[group.title]?.[band] || Array(group.columns.length).fill('');
                return `
                  <tr>
                    <td><strong>${band}</strong></td>
                    ${group.columns.map((col, idx) => `
                      <td>
                        <input type="text" 
                               class="tmm-band-table-input" 
                               value="${bandData[idx] || ''}"
                               onchange="tmmUpdateBandData('${tableKey}', '${group.title}', '${band}', ${idx}, this.value)"
                               placeholder="Enter ${col.toLowerCase()}">
                      </td>
                    `).join('')}
                    <td>
                      <button class="tmm-btn-band-danger" onclick="tmmDeleteBandRow('${tableKey}', '${group.title}', '${band}')" title="Delete ${band}">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('');
  } else {
    return `
      <div class="tmm-band-table-wrapper">
        <table class="tmm-band-table">
          <thead>
            <tr>
              <th>${table.hasBandLevels ? 'Band' : 'Service Type'}</th>
              ${table.columns.map(col => `<th>${col}</th>`).join('')}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${table.bands.map(band => {
              const bandData = data[band] || Array(table.columns.length).fill('');
              return `
                <tr>
                  <td><strong>${band}</strong></td>
                  ${table.columns.map((col, idx) => `
                    <td>
                      <input type="text" 
                             class="tmm-band-table-input" 
                             value="${bandData[idx] || ''}"
                             onchange="tmmUpdateBandData('${tableKey}', null, '${band}', ${idx}, this.value)"
                             placeholder="Enter ${col.toLowerCase()}"
                             ${tableKey === 'dedicated' && idx === 2 ? 'readonly style="background: #f0f0f0;"' : ''}>
                    </td>
                  `).join('')}
                  <td>
                    <button class="tmm-btn-band-danger" onclick="tmmDeleteBandRow('${tableKey}', null, '${band}')" title="Delete ${band}">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TMM BAND DATA MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
function tmmUpdateBandData(tableKey, groupTitle, band, columnIndex, value) {
  if (groupTitle) {
    if (!TMM_BAND_STATE.bandData[tableKey][groupTitle]) {
      TMM_BAND_STATE.bandData[tableKey][groupTitle] = {};
    }
    if (!TMM_BAND_STATE.bandData[tableKey][groupTitle][band]) {
      TMM_BAND_STATE.bandData[tableKey][groupTitle][band] = [];
    }
    TMM_BAND_STATE.bandData[tableKey][groupTitle][band][columnIndex] = value;
  } else {
    if (!TMM_BAND_STATE.bandData[tableKey][band]) {
      TMM_BAND_STATE.bandData[tableKey][band] = [];
    }
    TMM_BAND_STATE.bandData[tableKey][band][columnIndex] = value;
  }
  
  TMM_BAND_STATE.isModified = true;
  
  if (tableKey === 'dedicated' && columnIndex < 2) {
    tmmCalculateDedicatedDifference(band);
  }
}

function tmmCalculateDedicatedDifference(band) {
  const data = TMM_BAND_STATE.bandData.dedicated[band];
  if (!data || !data[0] || !data[1]) return;
  
  const withBenefits = parseFloat(data[0].replace(/[^0-9.-]+/g, ''));
  const withoutBenefits = parseFloat(data[1].replace(/[^0-9.-]+/g, ''));
  
  if (!isNaN(withBenefits) && !isNaN(withoutBenefits)) {
    const difference = withBenefits - withoutBenefits;
    data[2] = `$${difference.toLocaleString()}`;
    
    const inputs = document.querySelectorAll('.tmm-band-table-input');
    inputs.forEach(input => {
      const row = input.closest('tr');
      if (row && row.querySelector('strong')?.textContent === band) {
        const cells = row.querySelectorAll('.tmm-band-table-input');
        if (cells[2]) cells[2].value = data[2];
      }
    });
  }
}

function tmmDeleteBandRow(tableKey, groupTitle, band) {
  if (!confirm(`Are you sure you want to delete ${band}?`)) return;
  
  if (groupTitle) {
    delete TMM_BAND_STATE.bandData[tableKey][groupTitle][band];
  } else {
    delete TMM_BAND_STATE.bandData[tableKey][band];
  }
  
  TMM_BAND_STATE.isModified = true;
  tmmLoadBandDetailsContent();
  tmmShowToast(`Deleted ${band}`, 'success');
}

function tmmSaveBandDetails() {
  console.log('[TMM Band Data] Saving...');
  
  const saveBtn = document.querySelector('.tmm-btn-band-save');
  if (saveBtn) {
    const originalHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    setTimeout(() => {
      TMM_BAND_STATE.isModified = false;
      saveBtn.innerHTML = originalHTML;
      saveBtn.disabled = false;
      tmmShowToast('Band details saved successfully', 'success');
      tmmSyncBandDataToMatrix();
    }, 1000);
  }
}

function tmmSyncBandDataToMatrix() {
  if (typeof DATA_STORE !== 'undefined') {
    Object.keys(TMM_BAND_STATE.bandData).forEach(tableKey => {
      if (DATA_STORE[tableKey]) {
        DATA_STORE[tableKey]['band_details'] = JSON.stringify(TMM_BAND_STATE.bandData[tableKey]);
      }
    });
    console.log('[TMM Band Data] Synced to main matrix DATA_STORE');
  }
}

function tmmExportBandDetails() {
  const data = {
    customer: TMM_BAND_STATE.currentCustomer,
    account: TMM_BAND_STATE.currentAccount,
    tables: Array.from(TMM_BAND_STATE.selectedTables),
    data: TMM_BAND_STATE.bandData,
    exportedAt: new Date().toISOString()
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tmm_band_details_${TMM_BAND_STATE.currentCustomer}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  tmmShowToast('Band details exported', 'success');
}

// ─────────────────────────────────────────────────────────────────────────────
// TMM UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function tmmShowToast(message, type = 'info') {
  if (typeof showToast === 'function') {
    showToast(message, type);
    return;
  }
  
  let container = document.querySelector('.tmm-notifications');
  if (!container) {
    container = document.createElement('div');
    container.className = 'tmm-notifications';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `tmm-toast tmm-toast-${type}`;
  toast.style.cssText = `
    padding: 12px 20px;
    margin-bottom: 10px;
    border-radius: 6px;
    background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s ease;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─────────────────────────────────────────────────────────────────────────────
// TMM EVENT HANDLERS
// ─────────────────────────────────────────────────────────────────────────────
function tmmHandleOutsideClick(e) {
  const dropdown = document.getElementById('tmmBandFilterDropdown');
  const btn = document.getElementById('tmmBandFilterBtn');
  
  if (dropdown && btn && 
      !dropdown.contains(e.target) && 
      !btn.contains(e.target) &&
      dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
    btn.classList.remove('active');
  }
}

function tmmHandleEscapeKey(e) {
  if (e.key === 'Escape') {
    const panel = document.getElementById('tmmBandDetailsPanel');
    if (panel && panel.classList.contains('active')) {
      tmmCloseBandDetailsPanel();
    }
    
    const dropdown = document.getElementById('tmmBandFilterDropdown');
    if (dropdown && dropdown.classList.contains('show')) {
      tmmToggleBandFilterDropdown();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TMM INITIALIZE ON DOM READY
// ─────────────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tmmInitializeBandFeatures);
} else {
  tmmInitializeBandFeatures();
}

console.log('[TMM Band Features] Script loaded and ready');