// ═══════════════════════════════════════════════════════════════════════════
// TMM BAND FEATURES - JAVASCRIPT (Connected to Ticket_matching_matrix.js)
// ═══════════════════════════════════════════════════════════════════════════

console.log('[TMM Band Features] Script loading...');

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATE MANAGEMENT (Removed 'dispatch_imac', added grouping support)
// ─────────────────────────────────────────────────────────────────────────────
const TMM_BAND_STATE = {
  // 'dispatch' now covers both Incident and IMAC
  selectedTables: new Set(['dispatch', 'dedicated', 'sv_visit', 'project', 'standby']),
  currentCustomer: 'HCL',
  currentAccount: '',

  // Holds the visual data for the currently displayed record
  bandData: {
    dispatch: {},
    dedicated: {},
    sv_visit: {},
    project: {},
    standby: {}
  },

  // Imported Data State for Pagination
  importedRecords: [],
  currentImportIndex: 0,
  currentMeta: {},

  isModified: false,
  isPanelOpen: false
};

// ─────────────────────────────────────────────────────────────────────────────
// STATE SYNCHRONIZATION HELPER
// ─────────────────────────────────────────────────────────────────────────────

function tmmSyncStateWithGlobal() {
  if (typeof window.STATE === 'undefined' || !window.STATE.hiddenColumns) return;

  TMM_BAND_STATE.selectedTables.clear();

  Object.keys(TMM_BAND_TABLES).forEach(tableKey => {
    if (!window.STATE.hiddenColumns.has(tableKey)) {
      TMM_BAND_STATE.selectedTables.add(tableKey);
    }
  });

  const checkboxes = document.querySelectorAll('.tmm-band-filter-item input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = TMM_BAND_STATE.selectedTables.has(cb.value);
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. TABLE CONFIGURATION (MERGED DISPATCH & DISPATCH_IMAC)
// ─────────────────────────────────────────────────────────────────────────────
const TMM_BAND_TABLES = {
  dispatch: {
    name: 'Dispatch Services',
    icon: 'fas fa-truck-fast',
    color: '#10b981',
    description: 'Incident & IMAC pricing',
    // GROUPED STRUCTURE (Like sv_visit)
    groups: [
      {
        title: 'Incident Services',
        bands: ['4 Hour', 'SBD', 'NBD', '2 BD', '3 BD', 'Additional Hour'],
        columns: ['Price', 'SLA', 'Description']
      },
      {
        title: 'IMAC Services',
        bands: ['2 BD', '3 BD', '4 BD'],
        columns: ['Price', 'SLA', 'Description']
      }
    ],
    hasBandLevels: false
  },
  dedicated: {
    name: 'Dedicated Services', icon: 'fas fa-user-tie', color: '#ef4444',
    description: 'Monthly dedicated resource pricing',
    bands: ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'],
    columns: ['With Backfill', 'Without Backfill', 'Difference'], hasBandLevels: true
  },
  sv_visit: {
    name: 'SV Visit (Full/Half Day)', icon: 'fas fa-calendar-check', color: '#1e40af',
    description: 'Scheduled visit pricing',
    groups: [
      { title: 'Full Day Visit (8hrs)', bands: ['Band 0', 'Band 1', 'Band 2'], columns: ['Price', 'Duration', 'Max Hours'] },
      { title: 'Half Day Visit (4hrs)', bands: ['Band 0', 'Band 1', 'Band 2'], columns: ['Price', 'Duration', 'Max Hours'] }
    ], hasBandLevels: true
  },
  project: {
    name: 'Project Work', icon: 'fas fa-project-diagram', color: '#5b21b6',
    description: 'Short & long term project pricing',
    groups: [
      { title: 'Short Term (≤3 months)', bands: ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'], columns: ['Price', 'Duration', 'Min Term', 'Max Term'] },
      { title: 'Long Term (>3 months)', bands: ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'], columns: ['Price', 'Duration', 'Min Term', 'Max Term'] }
    ], hasBandLevels: true
  },
  standby: {
    name: 'Standby Services', icon: 'fas fa-clock', color: '#f59e0b',
    description: 'Standby resource pricing',
    bands: ['Band 0', 'Band 1', 'Band 2', 'Band 3'],
    columns: ['Hourly Rate', 'Min Hours', 'Max Hours'], hasBandLevels: true
  }
};

// Default Sample Data (Updated structure)
const TMM_SAMPLE_BAND_DATA = {
  dispatch: {
    'Incident Services': { '4 Hour': ['$350', '4h', 'Crit'] },
    'IMAC Services': { '2 BD': ['$400', '2BD', 'Std'] }
  },
  dedicated: { 'Band 0': ['$26,000', '$23,000', '$3,000'] }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CORE FUNCTIONS (Unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function tmmSyncWithMainMatrix() {
  const customerSelect = document.getElementById('tmm_customerSelect');
  const accountSelect = document.getElementById('tmm_accountSelect');

  if (customerSelect) {
    TMM_BAND_STATE.currentCustomer = customerSelect.value || 'HCL';
    customerSelect.addEventListener('change', (e) => {
      if (TMM_BAND_STATE.importedRecords.length === 0) {
        TMM_BAND_STATE.currentCustomer = e.target.value;
        tmmLoadBandDataForCustomer(TMM_BAND_STATE.currentCustomer);
      }
    });
  }
  if (accountSelect) {
    TMM_BAND_STATE.currentAccount = accountSelect.value || '';
    accountSelect.addEventListener('change', (e) => {
      if (TMM_BAND_STATE.importedRecords.length === 0) {
        TMM_BAND_STATE.currentAccount = e.target.value;
      }
    });
  }
}

function tmmLoadBandDataForCustomer(customer) {
  if (customer && customer.toUpperCase().includes('HCL')) {
    TMM_BAND_STATE.bandData = JSON.parse(JSON.stringify(TMM_SAMPLE_BAND_DATA));
  } else {
    // Reset data
    Object.keys(TMM_BAND_TABLES).forEach(k => TMM_BAND_STATE.bandData[k] = {});
  }
  if (TMM_BAND_STATE.isPanelOpen) tmmLoadBandDetailsContent();
}

function tmmSetupImportControls() {
  if (!document.getElementById('tmmBandImportInput')) {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'tmmBandImportInput';
    input.accept = '.csv';
    input.style.display = 'none';
    input.onchange = function () { tmmHandleBandCSVUpload(this); };
    document.body.appendChild(input);
  }

  const footer = document.querySelector('.tmm-band-panel-footer');
  if (footer && !footer.querySelector('.tmm-btn-band-import')) {
    const importBtn = document.createElement('button');
    importBtn.className = 'tmm-btn-band-action tmm-btn-band-import';
    importBtn.style.backgroundColor = '#8b5cf6';
    importBtn.innerHTML = '<i class="fas fa-file-import"></i> Import CSV';
    importBtn.type = 'button';
    importBtn.onclick = () => document.getElementById('tmmBandImportInput').click();

    if (footer.firstChild) {
      footer.insertBefore(importBtn, footer.firstChild);
    } else {
      footer.appendChild(importBtn);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CSV IMPORT PARSING LOGIC (Mapped to new Grouped Dispatch)
// ─────────────────────────────────────────────────────────────────────────────

function tmmHandleBandCSVUpload(inputElement) {
  const file = inputElement.files[0];
  if (!file) return;

  tmmShowToast(`Reading ${file.name}...`, 'info');
  const reader = new FileReader();

  reader.onload = function (e) {
    const csvContent = e.target.result;
    try {
      const jsonData = tmmConvertRateCardCsvToJson(csvContent);

      if (jsonData && jsonData.length > 0) {
        TMM_BAND_STATE.importedRecords = jsonData;
        TMM_BAND_STATE.currentImportIndex = 0;
        tmmLoadImportedRecord(0);
        tmmShowToast(`Imported ${jsonData.length} records`, 'success');
      } else {
        tmmShowToast("No valid data rows found (Check Header format)", "error");
      }
    } catch (err) {
      console.error(err);
      tmmShowToast("Error parsing CSV", "error");
    }
  };
  reader.readAsText(file);
  inputElement.value = '';
}

function tmmConvertRateCardCsvToJson(csvString) {
  const lines = csvString.trim().split('\n');
  const result = [];

  const splitCSV = (str) => {
    const parts = str.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return parts.map(p => {
      let val = p.trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      return val;
    });
  };

  const calcDiff = (v1, v2) => {
    if (!v1 || !v2) return '';
    const n1 = parseFloat(v1.replace(/[^0-9.-]+/g, ""));
    const n2 = parseFloat(v2.replace(/[^0-9.-]+/g, ""));
    return (isNaN(n1) || isNaN(n2)) ? '' : '$' + (n1 - n2).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('region') && lines[i].toLowerCase().includes('country')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error("Header not found");
    return [];
  }

  const startDataIndex = headerIndex + 1;

  for (let i = startDataIndex; i < lines.length; i++) {
    const row = splitCSV(lines[i]);
    if (!row || row.length < 5 || (row.length === 1 && row[0] === '')) continue;

    const meta = {
      region: row[0] || "",
      country: row[1] || "",
      supplier: row[2] || "",
      currency: row[3] || "USD",
      entity: row[4] || "",
      ticket_number: row[5] || "N/A"
    };

    const services = {
      // 6-15: Dedicated
      dedicated: {
        'Band 0': [row[6], row[7], calcDiff(row[6], row[7])],
        'Band 1': [row[8], row[9], calcDiff(row[8], row[9])],
        'Band 2': [row[10], row[11], calcDiff(row[10], row[11])],
        'Band 3': [row[12], row[13], calcDiff(row[12], row[13])],
        'Band 4': [row[14], row[15], calcDiff(row[14], row[15])]
      },

      // 16-21: Scheduled
      sv_visit: {
        'Full Day Visit (8hrs)': {
          'Band 0': [row[16], '8 hours', '8'], 'Band 1': [row[17], '8 hours', '8'], 'Band 2': [row[18], '8 hours', '8']
        },
        'Half Day Visit (4hrs)': {
          'Band 0': [row[19], '4 hours', '4'], 'Band 1': [row[20], '4 hours', '4'], 'Band 2': [row[21], '4 hours', '4']
        }
      },

      // 22-30: Dispatch (Merged Group)
      dispatch: {
        'Incident Services': {
          '4 Hour': [row[22], '4 hours', 'Critical'],
          'SBD': [row[23], 'Same Day', 'Urgent'],
          'NBD': [row[24], 'Next Day', 'Standard'],
          '2 BD': [row[25], '2 Days', 'Standard'],
          '3 BD': [row[26], '3 Days', 'Standard'],
          'Additional Hour': [row[27], 'Hourly', 'Overage']
        },
        'IMAC Services': {
          '2 BD': [row[28], '2 Days', 'IMAC'],
          '3 BD': [row[29], '3 Days', 'IMAC'],
          '4 BD': [row[30], '4 Days', 'IMAC']
        }
      },

      // 31-40: Projects
      project: {
        'Short Term (≤3 months)': {
          'Band 0': [row[31], '<3m', '1m', '3m'], 'Band 1': [row[32], '<3m', '1m', '3m'],
          'Band 2': [row[33], '<3m', '1m', '3m'], 'Band 3': [row[34], '<3m', '1m', '3m'], 'Band 4': [row[35], '<3m', '1m', '3m']
        },
        'Long Term (>3 months)': {
          'Band 0': [row[36], '>3m', '4m', '12m'], 'Band 1': [row[37], '>3m', '4m', '12m'],
          'Band 2': [row[38], '>3m', '4m', '12m'], 'Band 3': [row[39], '>3m', '4m', '12m'], 'Band 4': [row[40], '>3m', '4m', '12m']
        }
      },

      standby: { 'Band 0': ['', '', ''], 'Band 1': ['', '', ''] }
    };

    result.push({ meta, services });
  }
  return result;
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. EXPORT LOGIC (Updated for Grouped Dispatch)
// ─────────────────────────────────────────────────────────────────────────────

function tmmExportBandDetails() {
  const records = TMM_BAND_STATE.importedRecords.length > 0
    ? TMM_BAND_STATE.importedRecords
    : [{ meta: { region: 'EMEA', country: TMM_BAND_STATE.currentCustomer, supplier: '', currency: 'USD', entity: 'N', ticket_number: '' }, services: TMM_BAND_STATE.bandData }];

  let csv = '';

  // Header 1
  csv += `(Project/ Operation) ",," Full Day Visit (8hrs) \n(Excluding travel time) ",,," 1/2 Day Visit (4hrs) \n(Excluding travel time) ",,," Dispatch Ticket \n(Incident - including Service Management Fee)\n(RESPONSE TIME TO SITE)\n(9x5 Business Hours)\n(Time on Task - 1 hour) ",,,,,," Dispatch Ticket \n(IMAC including Service Management Fee)\n(RESPONSE TIME TO SITE)\n(9x5 Business Hours)\n(Time on Task - 1 hour) ",,, Short Term Project ( Up to 3 months) ,,,,, Long Term Project (more than 3 months) ,,,,\n`;

  // Header 2
  csv += `Region,Country,Supplier,Currency ,Entity,Ticket Number,  With Backfill Yearly Rate ,  Without Backfill Yearly Rate ,  With Backfill Yearly Rate ,  Without Backfill Yearly Rate ,  With Backfill Yearly Rate ,  Without Backfill Yearly Rate ,  With Backfill Yearly Rate ,  Without Backfill Yearly Rate ,  Backfill Yearly Rate , Without Backfill Yearly Rate , Band 0 , Band 1 , Band 2 , Band 0 , Band 1 , Band 2 ," 4 hour\n(Standby Applicable) ", SBD , NBD , 2 BD , 3 BD , Additional Hour  , 2 BD , 3 BD , 4 BD , Band 0 , Band 1 , Band 2 , Band 3 , Band 4 , Band 0 , Band 1 , Band 2 , Band 3 , Band 4 \n`;

  records.forEach(rec => {
    const m = rec.meta || {};
    const s = rec.services || {};
    const q = (val) => val ? `"${val}"` : "";

    let row = `${q(m.region)},${q(m.country)},${q(m.supplier)},${q(m.currency)},${q(m.entity)},${q(m.ticket_number)},`;

    // 6-15 Dedicated
    const d = s.dedicated || {};
    ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'].forEach(b => {
      row += `${q(d[b]?.[0])},${q(d[b]?.[1])},`;
    });

    // 16-21 SV
    const svF = s.sv_visit?.['Full Day Visit (8hrs)'] || {};
    const svH = s.sv_visit?.['Half Day Visit (4hrs)'] || {};
    ['Band 0', 'Band 1', 'Band 2'].forEach(b => row += `${q(svF[b]?.[0])},`);
    ['Band 0', 'Band 1', 'Band 2'].forEach(b => row += `${q(svH[b]?.[0])},`);

    // 22-27 Dispatch Incident (Accessed via Group Name)
    const dispInc = s.dispatch?.['Incident Services'] || {};
    ['4 Hour', 'SBD', 'NBD', '2 BD', '3 BD', 'Additional Hour'].forEach(b => row += `${q(dispInc[b]?.[0])},`);

    // 28-30 Dispatch IMAC (Accessed via Group Name)
    const dispImac = s.dispatch?.['IMAC Services'] || {};
    ['2 BD', '3 BD', '4 BD'].forEach(b => row += `${q(dispImac[b]?.[0])},`);

    // 31-40 Projects
    const pShort = s.project?.['Short Term (≤3 months)'] || {};
    const pLong = s.project?.['Long Term (>3 months)'] || {};
    ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'].forEach(b => row += `${q(pShort[b]?.[0])},`);

    ['Band 0', 'Band 1', 'Band 2', 'Band 3', 'Band 4'].forEach((b, i) => {
      row += `${q(pLong[b]?.[0])}`;
      if (i < 4) row += ',';
    });

    csv += row + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `RateCard_Export_${new Date().getTime()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  tmmShowToast('Exported Rate Card CSV', 'success');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. UI RENDERING & PAGINATION (UNCHANGED LOGIC)
// ─────────────────────────────────────────────────────────────────────────────

function tmmLoadImportedRecord(index) {
  if (index < 0 || index >= TMM_BAND_STATE.importedRecords.length) return;
  TMM_BAND_STATE.currentImportIndex = index;
  const record = TMM_BAND_STATE.importedRecords[index];
  TMM_BAND_STATE.bandData = record.services;
  TMM_BAND_STATE.currentMeta = record.meta;
  tmmLoadBandDetailsContent();
}

function tmmUpdateFooterControls() {
  const footer = document.querySelector('.tmm-band-panel-footer');
  if (!footer) return;
  const existing = document.getElementById('tmmBandPagination');
  if (existing) existing.remove();

  if (TMM_BAND_STATE.importedRecords.length > 1) {
    const pag = document.createElement('div');
    pag.id = 'tmmBandPagination';
    pag.style.cssText = 'display:flex; align-items:center; gap:10px; margin-right:auto;';
    const idx = TMM_BAND_STATE.currentImportIndex;
    const total = TMM_BAND_STATE.importedRecords.length;
    pag.innerHTML = `
            <button class="tmm-btn-band-action" ${idx === 0 ? 'disabled' : ''} onclick="tmmLoadImportedRecord(${idx - 1})"><i class="fas fa-chevron-left"></i></button>
            <span style="color:white; font-weight:600; font-size:0.9rem;">${idx + 1} / ${total}</span>
            <button class="tmm-btn-band-action" ${idx === total - 1 ? 'disabled' : ''} onclick="tmmLoadImportedRecord(${idx + 1})"><i class="fas fa-chevron-right"></i></button>
        `;
    if (footer.children.length > 1) footer.insertBefore(pag, footer.children[1]);
    else footer.appendChild(pag);
  }
}

function tmmLoadBandDetailsContent() {
  const content = document.getElementById('tmmBandPanelContent');
  if (!content) return;
  content.innerHTML = `<div class="tmm-band-loading"><i class="fas fa-spinner fa-spin"></i><p>Loading band details...</p></div>`;
  setTimeout(() => { content.innerHTML = tmmRenderBandDetailsContent(); }, 300);
}

function tmmRenderBandDetailsContent() {
  let html = '';
  const meta = TMM_BAND_STATE.currentMeta;
  const isImported = TMM_BAND_STATE.importedRecords.length > 0;

  html += `
    <div class="tmm-band-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-left: none;">
      <div class="tmm-band-section-header" style="border-bottom-color: rgba(255,255,255,0.2);">
        <div class="tmm-band-section-title" style="color: white;"><i class="fas fa-globe"></i><span>${isImported ? 'Imported Record Context' : 'Manual Entry Context'}</span></div>
        ${isImported ? `<div style="background:rgba(0,0,0,0.3); padding:2px 8px; border-radius:4px; font-size:0.85rem;">Record ${TMM_BAND_STATE.currentImportIndex + 1} of ${TMM_BAND_STATE.importedRecords.length}</div>` : ''}
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
          <div class="tmm-band-info-row"><span class="tmm-band-info-label" style="color:rgba(255,255,255,0.9);">Customer:</span><span class="tmm-band-info-value" style="color:white;font-weight:600;">${isImported ? (meta.country || 'N/A') : (TMM_BAND_STATE.currentCustomer || 'Not Selected')}</span></div>
          <div class="tmm-band-info-row"><span class="tmm-band-info-label" style="color:rgba(255,255,255,0.9);">Region:</span><span class="tmm-band-info-value" style="color:white;font-weight:600;">${isImported ? (meta.region || 'N/A') : 'Global'}</span></div>
          ${isImported ? `<div class="tmm-band-info-row"><span class="tmm-band-info-label" style="color:rgba(255,255,255,0.9);">Currency:</span><span class="tmm-band-info-value" style="color:white;font-weight:600;">${meta.currency || 'USD'}</span></div>` : ''}
      </div>
    </div>`;

  if (TMM_BAND_STATE.selectedTables.size === 0) {
    html += `<div class="tmm-band-section"><p class="tmm-band-text-muted">Please select at least one band table from the filter dropdown.</p></div>`;
  } else {
    TMM_BAND_STATE.selectedTables.forEach(tableKey => {
      const table = TMM_BAND_TABLES[tableKey];
      if (!table) return;
      html += `<div class="tmm-band-card ${tableKey}">
                <div class="tmm-band-card-header"><div class="tmm-band-card-icon ${tableKey}"><i class="${table.icon}"></i></div><div class="tmm-band-card-title"><h3>${table.name}</h3></div></div>
                <div class="tmm-band-card-content">${tmmRenderBandTable(tableKey, table)}</div>
              </div>`;
    });
  }
  tmmUpdateFooterControls();
  return html;
}

function tmmRenderBandTable(tableKey, table) {
  const data = TMM_BAND_STATE.bandData[tableKey] || {};
  if (table.groups) {
    return table.groups.map(group => `
          <div class="tmm-band-section">
            <div class="tmm-band-section-header"><div class="tmm-band-section-title"><span>${group.title}</span></div></div>
            <div class="tmm-band-table-wrapper">
              <table class="tmm-band-table">
                <thead><tr><th>Band</th>${group.columns.map(col => `<th>${col}</th>`).join('')}<th>Actions</th></tr></thead>
                <tbody>${group.bands.map(band => {
      const bandData = data[group.title]?.[band] || Array(group.columns.length).fill('');
      return `<tr><td><strong>${band}</strong></td>${group.columns.map((col, idx) => `<td><input type="text" class="tmm-band-table-input" value="${bandData[idx] || ''}" onchange="tmmUpdateBandData('${tableKey}', '${group.title}', '${band}', ${idx}, this.value)"></td>`).join('')}<td><button class="tmm-btn-band-danger" onclick="tmmDeleteBandRow('${tableKey}', '${group.title}', '${band}')"><i class="fas fa-trash"></i></button></td></tr>`;
    }).join('')}</tbody>
              </table>
            </div>
          </div>`).join('');
  } else {
    return `
          <div class="tmm-band-table-wrapper">
            <table class="tmm-band-table">
              <thead><tr><th>${table.hasBandLevels ? 'Band' : 'Service Type'}</th>${table.columns.map(col => `<th>${col}</th>`).join('')}<th>Actions</th></tr></thead>
              <tbody>${table.bands.map(band => {
      const bandData = data[band] || Array(table.columns.length).fill('');
      return `<tr><td><strong>${band}</strong></td>${table.columns.map((col, idx) => `<td><input type="text" class="tmm-band-table-input" value="${bandData[idx] || ''}" onchange="tmmUpdateBandData('${tableKey}', null, '${band}', ${idx}, this.value)"></td>`).join('')}<td><button class="tmm-btn-band-danger" onclick="tmmDeleteBandRow('${tableKey}', null, '${band}')"><i class="fas fa-trash"></i></button></td></tr>`;
    }).join('')}</tbody>
            </table>
          </div>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA & EVENT UTILS (UNCHANGED)
// ─────────────────────────────────────────────────────────────────────────────

function tmmUpdateBandData(tableKey, groupTitle, band, columnIndex, value) {
  const dataRef = TMM_BAND_STATE.bandData[tableKey];
  if (groupTitle) {
    if (!dataRef[groupTitle]) dataRef[groupTitle] = {};
    if (!dataRef[groupTitle][band]) dataRef[groupTitle][band] = [];
    dataRef[groupTitle][band][columnIndex] = value;
  } else {
    if (!dataRef[band]) dataRef[band] = [];
    dataRef[band][columnIndex] = value;
  }
  if (TMM_BAND_STATE.importedRecords.length > 0) {
    TMM_BAND_STATE.importedRecords[TMM_BAND_STATE.currentImportIndex].services = TMM_BAND_STATE.bandData;
  }
  TMM_BAND_STATE.isModified = true;
  if (tableKey === 'dedicated' && columnIndex < 2) tmmCalculateDedicatedDifference(band);
}

function tmmCalculateDedicatedDifference(band) {
  const data = TMM_BAND_STATE.bandData.dedicated[band];
  if (!data || !data[0] || !data[1]) return;
  const v1 = parseFloat(data[0].replace(/[^0-9.-]+/g, ''));
  const v2 = parseFloat(data[1].replace(/[^0-9.-]+/g, ''));
  if (!isNaN(v1) && !isNaN(v2)) {
    data[2] = `$${(v1 - v2).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const inputs = document.querySelectorAll('.tmm-band-table-input');
    inputs.forEach(input => {
      if (input.closest('tr')?.querySelector('strong')?.textContent === band) {
        const cells = input.closest('tr').querySelectorAll('input');
        if (cells[2]) cells[2].value = data[2];
      }
    });
  }
}

function tmmSaveBandDetails() {
  console.group("💾 SAVING BAND DATA");

  const customerSelect = document.getElementById('tmm_customerSelect');
  const accountSelect = document.getElementById('tmm_accountSelect');

  const customerId = (customerSelect && customerSelect.value !== 'all') ? parseInt(customerSelect.value) : null;
  const accountId = (accountSelect && accountSelect.value !== 'all') ? parseInt(accountSelect.value) : null;

  if (!customerId) {
    tmmShowToast('Error: Please select a specific Customer.', 'error');
    console.groupEnd();
    return;
  }
  let payload = [];

  if (TMM_BAND_STATE.importedRecords.length > 0) {
    payload = TMM_BAND_STATE.importedRecords.map(record => ({
      customer: customerId,
      account: accountId, // Can be null
      ticket_number: record.meta.ticket_number || "UNKNOWN",
      band_data: record.services
    }));
  } else {
    // Manual Entry Case
    const currentTicket = TMM_BAND_STATE.currentMeta.ticket_number || "MANUAL_ENTRY";
    payload.push({
      customer: customerId,
      account: accountId,
      ticket_number: currentTicket,
      band_data: TMM_BAND_STATE.bandData
    });
  }

  console.log("Payload:", payload);
  const csrftoken = getCookie('csrftoken');

  fetch('/billing/api/band-table/batch/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.message || 'Server Error'); });
      }
      return response.json();
    })
    .then(data => {
      console.log("Success:", data);
      tmmShowToast(`Saved ${payload.length} records successfully!`, 'success');
      TMM_BAND_STATE.isModified = false;
      if (typeof window.tmmSyncBandDataToMatrix === 'function') window.tmmSyncBandDataToMatrix();
    })
    .catch(error => {
      console.error("Save Error:", error);
      tmmShowToast(`Save Failed: ${error.message}`, 'error');
    })
    .finally(() => {
      console.groupEnd();
    });
}


function tmmShowToast(message, type = 'info') {
  if (typeof showToast === 'function') { showToast(message, type); return; }
  alert(message);
}

function tmmHandleOutsideClick(e) {
  const dropdown = document.getElementById('tmmBandFilterDropdown');
  const btn = document.getElementById('tmmBandFilterBtn');
  if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target) && dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
    btn.classList.remove('active');
  }
}

function tmmHandleEscapeKey(e) {
  if (e.key === 'Escape') {
    const panel = document.getElementById('tmmBandDetailsPanel');
    if (panel && panel.classList.contains('active')) tmmCloseBandDetailsPanel();
    const dropdown = document.getElementById('tmmBandFilterDropdown');
    if (dropdown && dropdown.classList.contains('show')) tmmToggleBandFilterDropdown();
  }
}

function tmmToggleBandFilterDropdown() {
  const dropdown = document.getElementById('tmmBandFilterDropdown');
  const btn = document.getElementById('tmmBandFilterBtn');
  if (!dropdown) return;
  dropdown.classList.toggle('show');
  if (btn) btn.classList.toggle('active');
}

function tmmHandleBandTableFilter(checkbox) {
  if (checkbox.checked) TMM_BAND_STATE.selectedTables.add(checkbox.value);
  else TMM_BAND_STATE.selectedTables.delete(checkbox.value);
  tmmApplyBandTableFilterToMatrix();
}

function tmmApplyBandTableFilterToMatrix() {
  const allTables = ['ticket_data', 'rate_card', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'];
  allTables.forEach(tableKey => {
    if (tableKey === 'ticket_data' || tableKey === 'final_ticket' || tableKey === 'rate_card') {
      tmmShowMatrixColumn(tableKey);
      return;
    }
    if (TMM_BAND_STATE.selectedTables.has(tableKey)) {
      tmmShowMatrixColumn(tableKey);
    } else {
      tmmHideMatrixColumn(tableKey);
    }
  });
}

function tmmShowMatrixColumn(tableKey) {
  if (typeof STATE !== 'undefined' && STATE.hiddenColumns) STATE.hiddenColumns.delete(tableKey);
  const headerCells = document.querySelectorAll(`#matrixHeader th[data-table="${tableKey}"]`);
  const bodyCells = document.querySelectorAll(`#matrixBody td[data-table="${tableKey}"]`);
  headerCells.forEach(cell => cell.style.display = '');
  bodyCells.forEach(cell => cell.style.display = '');
}

function tmmHideMatrixColumn(tableKey) {
  if (typeof STATE !== 'undefined' && STATE.hiddenColumns) STATE.hiddenColumns.add(tableKey);
  const headerCells = document.querySelectorAll(`#matrixHeader th[data-table="${tableKey}"]`);
  const bodyCells = document.querySelectorAll(`#matrixBody td[data-table="${tableKey}"]`);
  headerCells.forEach(cell => cell.style.display = 'none');
  bodyCells.forEach(cell => cell.style.display = 'none');
}

function tmmClearBandFilters() {
  const checkboxes = document.querySelectorAll('.tmm-band-filter-item input[type="checkbox"]');
  checkboxes.forEach(checkbox => checkbox.checked = false);
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

function tmmOpenBandDetailsPanel() {
  const panel = document.getElementById('tmmBandDetailsPanel');
  const overlay = document.getElementById('tmmBandOverlay');
  if (!panel) return;
  tmmSetupImportControls();
  if (TMM_BAND_STATE.selectedTables.size === 0) {
    tmmShowToast('Please select at least one band table', 'warning');
    return;
  }
  const dropdown = document.getElementById('tmmBandFilterDropdown');
  const btn = document.getElementById('tmmBandFilterBtn');
  if (dropdown) dropdown.classList.remove('show');
  if (btn) btn.classList.remove('active');
  TMM_BAND_STATE.isPanelOpen = true;
  setTimeout(() => { if (overlay) overlay.classList.add('active'); panel.classList.add('active'); }, 10);
  tmmLoadBandDetailsContent();
}

function tmmCloseBandDetailsPanel() {
  const panel = document.getElementById('tmmBandDetailsPanel');
  const overlay = document.getElementById('tmmBandOverlay');
  if (panel) panel.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  TMM_BAND_STATE.isPanelOpen = false;
  if (TMM_BAND_STATE.isModified) {
    if (confirm('Unsaved changes. Save?')) tmmSaveBandDetails();
    else TMM_BAND_STATE.isModified = false;
  }
}

function tmmDeleteBandRow(key, group, band) {
  if (!confirm("Delete?")) return;
  if (group) delete TMM_BAND_STATE.bandData[key][group][band];
  else delete TMM_BAND_STATE.bandData[key][band];
  TMM_BAND_STATE.isModified = true;
  tmmLoadBandDetailsContent();
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. FINAL INITIALIZATION & UI BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function tmmBuildFilterDropdown() {
  const container = document.getElementById('tmmBandFilterContainer');
  if (!container) return;

  let html = `
    <button id="tmmBandFilterBtn" class="tmm-btn-band-filter" onclick="tmmToggleBandFilterDropdown()">
      <i class="fas fa-filter"></i> Filter Tables
    </button>
    <div id="tmmBandFilterDropdown" class="tmm-band-dropdown-menu">
      <div class="tmm-band-dropdown-header">
        <span>Select Tables</span>
        <div style="display:flex; gap:5px;">
           <small onclick="tmmSelectAllBandFilters()" style="cursor:pointer; color:#667eea;">All</small>
           <small onclick="tmmClearBandFilters()" style="cursor:pointer; color:#ef4444;">None</small>
        </div>
      </div>
      <div class="tmm-band-dropdown-body">`;

  Object.keys(TMM_BAND_TABLES).forEach(key => {
    const table = TMM_BAND_TABLES[key];
    html += `
      <label class="tmm-band-filter-item">
        <input type="checkbox" value="${key}" onchange="tmmHandleBandTableFilter(this)">
        <i class="${table.icon}" style="color:${table.color}; width:20px;"></i>
        <span>${table.name}</span>
      </label>`;
  });

  html += `</div></div>`;
  container.innerHTML = html;
}

function tmmInitializeBandFeatures() {
  console.log('[TMM Band Features] Initializing...');
  tmmBuildFilterDropdown();
  tmmSyncStateWithGlobal();
  tmmSetupImportControls();
  tmmSyncWithMainMatrix();
  document.addEventListener('click', tmmHandleOutsideClick);
  document.addEventListener('keydown', tmmHandleEscapeKey);
  tmmApplyBandTableFilterToMatrix();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tmmInitializeBandFeatures);
} else {
  tmmInitializeBandFeatures();
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