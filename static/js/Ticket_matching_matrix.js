// ════════════════════════════════════════════════════════════════════════════
// TICKET MATCHING MATRIX - COMPLETE CONTROLLER (v3.2 - Fixes Applied)
// ════════════════════════════════════════════════════════════════════════════

// ──── 1. GLOBAL STATE & CONFIGURATION ────

const STATE = {
  smartAddEnabled: true,
  matrixMode: 'structural',
  hiddenColumns: new Set(),
  smartAddCount: 0,
  autoPopulatedCount: 0
};

// MASTER DATA: The Single Source of Truth
window.MASTER_DATA = []; 
window.PENDING_DATA = []; 
window.DIFF_LOG = [];     
window.currentImportIndex = 0;

// VISUAL STORE: What is currently displayed in the DOM inputs
const DATA_STORE = {
  ticket_data: {}, rate_card: {}, dispatch: {}, standby: {},
  dedicated: {}, sv_visit: {}, project: {}, final_ticket: {}
};

// SCHEMA: Defines which fields belong to which table
const TABLE_SCHEMAS = {
  ticket_data: ['request_id', 'ticket_number', 'requester', 'subject', 'customer', 'account', 'region', 'country', 'city', 'site_name', 'address', 'postal_code', 'contact_name', 'contact_phone', 'contact_email', 'priority', 'status', 'created_date', 'scheduled_date', 'completed_date', 'sla_due_date', 'service_type', 'problem_description', 'resolution', 'notes'],
  rate_card: ['customer', 'ticket_number', 'account', 'region', 'country', 'service_type', 'rate_type', 'base_rate', 'hourly_rate', 'overtime_rate', 'weekend_rate', 'holiday_rate', 'travel_rate', 'per_diem', 'currency', 'effective_date', 'expiry_date'],
  dispatch: ['ticket_number', 'account', 'dispatch_id', 'technician_name', 'technician_id', 'dispatch_date', 'arrival_time', 'departure_time', 'travel_time', 'onsite_time', 'total_hours', 'status', 'notes'],
  standby: ['ticket_number', 'account', 'standby_id', 'technician_name', 'technician_id', 'standby_date', 'start_time', 'end_time', 'total_hours', 'rate', 'total_cost', 'status', 'notes'],
  dedicated: ['ticket_number', 'dedicated_id', 'technician_name', 'technician_id', 'start_date', 'end_date', 'daily_rate', 'total_days', 'total_cost', 'customer', 'account', 'site_name', 'status', 'notes'],
  sv_visit: ['ticket_number', 'account', 'sv_id', 'technician_name', 'technician_id', 'visit_date', 'visit_type', 'arrival_time', 'departure_time', 'total_hours', 'rate', 'total_cost', 'status', 'notes'],
  project: ['project_id', 'ticket_number', 'project_name', 'customer', 'account', 'region', 'country', 'start_date', 'end_date', 'budget', 'actual_cost', 'status', 'project_manager', 'team_size', 'notes'],
  final_ticket: ['request_id', 'ticket_number', 'customer_reference', 'requester', 'subject', 'site_name', 'priority', 'technician_name', 'status', 'worklog_type', 'completed_date', 'account', 'region', 'country', 'city', 'contact_email', 'band_type', 'total_hours', 'hourly_rate', 'revenue', 'currency', 'labor_cost', 'profit', 'margin', 'vendor_po', 'pre_visit', 'post_visit', 'notes']
};

const TABLE_NAMES = {
  ticket_data: 'Ticket Data', rate_card: 'Rate Card', dispatch: 'Dispatch',
  standby: 'Standby', dedicated: 'Dedicated', sv_visit: 'SV Visit',
  project: 'Project', final_ticket: 'Final Ticket'
};

const FIELD_DEFINITIONS = {
  request_id: { label: 'Request ID', type: 'TEXT', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'final_ticket'] },
  ticket_number: { label: 'Ticket Number', type: 'TEXT', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'rate_card', 'project', 'sv_visit', 'final_ticket'] },
  requester: { label: 'Requester', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  subject: { label: 'Subject', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  customer: { label: 'Customer', type: 'DROPDOWN', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'rate_card', 'project', 'sv_visit', 'final_ticket'] },
  account: { label: 'Account', type: 'DROPDOWN', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'rate_card', 'project', 'sv_visit', 'final_ticket'] },
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
  notes: { label: 'Notes', type: 'TEXT', group: 'SYSTEM', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
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
  requester: ["Requester", "Created By", "Source of Request"],
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

// ──── 2. EXPORTS & INIT ────

// Export to window
window.STATE = STATE;
window.DATA_STORE = DATA_STORE;
window.FIELD_DEFINITIONS = FIELD_DEFINITIONS;
window.handleCellChange = handleCellChange;
window.confirmOverwrite = confirmOverwrite;
window.closeDiffModal = closeDiffModal;
window.changeDiffPage = changeDiffPage;
window.loadRecord = loadRecord;
window.toggleMatrixMode = toggleMatrixMode;
window.nextRecord = nextRecord;
window.prevRecord = prevRecord;
window.clearCsvData = clearCsvData;
window.updateStatistics = updateStatistics;
window.smartAddToOtherTables = smartAddToOtherTables;

document.addEventListener('DOMContentLoaded', function () {
  initFileUpload();
  initMatrix();
  initColumnVisibility(); // From Control JS
  initSaveButton(); 
  updateStatistics();
  updateFinalTablePreview();

  const navBar = document.getElementById('recordNavigation');
  if (navBar) navBar.style.display = 'none';

  // Inject Inline Edit Modal
  if (!document.getElementById('tmmInlineEditModal')) {
    const modalHtml = `
      <div id="tmmInlineEditModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000; justify-content:center; align-items:center;">
          <div style="background:white; padding:20px; border-radius:8px; width:90%; max-width:800px; max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Edit Record Details</h3>
              <div id="tmmInlineEditContent" style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; padding:15px 0;"></div>
              <div style="margin-top:20px; text-align:right; border-top:1px solid #eee; padding-top:10px;">
                  <button onclick="document.getElementById('tmmInlineEditModal').style.display='none'" class="btn-secondary" style="margin-right:10px;">Cancel</button>
                  <button onclick="saveInlineEdit()" class="btn-primary">Save Changes</button>
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

// ──── 3. FILE UPLOAD & NORMALIZATION ENGINE ────

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

  dropZone.addEventListener('click', () => {
    if (!checkSelection()) return;
    fileInput.value = '';
    fileInput.click();
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!checkSelection()) return;
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    if (!checkSelection()) return;
    handleFiles(e.target.files);
  });
  
  ['dragenter', 'dragover'].forEach(evt => dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.add('highlight'); }));
  ['dragleave', 'drop'].forEach(evt => dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.remove('highlight'); }));
}

function handleFiles(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  const ext = file.name.split('.').pop().toLowerCase();

  window.showToast(`Processing ${file.name}...`, 'info');

  if (ext === 'csv') parseCSV(file);
  else if (['xls', 'xlsx'].includes(ext)) parseExcel(file);
  else window.showToast("Invalid format", "error");
}

function parseCSV(file) {
  Papa.parse(file, {
    header: true, skipEmptyLines: true,
    complete: (results) => initializeImportData(results.data),
    error: (err) => window.showToast(`CSV Error: ${err.message}`, 'error')
  });
}

function parseExcel(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
      initializeImportData(jsonData);
    } catch (error) {
      window.showToast(`Error parsing Excel`, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

/**
 * EAGER NORMALIZER: Converts Raw Data to Master Matrix Data Immediately
 * Handles Append Mode vs Smart Mode mapping
 */
function normalizeBatch(rawData) {
    const contextCustomer = document.getElementById('tmm_customerSelect')?.selectedOptions[0]?.text || "";
    const contextAccount = document.getElementById('tmm_accountSelect')?.selectedOptions[0]?.text || "";
    const isImportAll = contextCustomer.toLowerCase().includes("all");
    const importMode = document.getElementById('tmm_importMode')?.value || 'smart'; // 'smart' or 'append'

    return rawData.map(raw => {
        let normalized = {};
        
        // 1. Context
        if (!isImportAll) {
            normalized['customer'] = contextCustomer;
            normalized['account'] = contextAccount;
        }

        const matchedHeaders = new Set();

        // 2. Smart Mapping (Synonyms)
        for (const [systemField, synonyms] of Object.entries(FIELD_SYNONYMS)) {
            let found = false;
            if (raw[systemField] !== undefined) {
                normalized[systemField] = String(raw[systemField]).trim();
                matchedHeaders.add(systemField);
                found = true;
            } else {
                for (const syn of synonyms) {
                    if (raw[syn] !== undefined && raw[syn] !== null && String(raw[syn]).trim() !== "") {
                        let val = String(raw[syn]).trim();
                        if (systemField === 'technician_name') val = val.replace(/[\r\n]+/g, ", ");
                        normalized[systemField] = val;
                        matchedHeaders.add(syn);
                        found = true;
                        break;
                    }
                }
            }
        }

        // 3. Append Mode: Capture extra fields
        if (importMode === 'append') {
            Object.keys(raw).forEach(header => {
                if (!matchedHeaders.has(header) && raw[header] !== undefined) {
                    const dynamicId = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    // Add definition if missing
                    if(!FIELD_DEFINITIONS[dynamicId]) {
                        FIELD_DEFINITIONS[dynamicId] = { 
                            label: header, type: 'TEXT', group: 'IMPORTED', rag: 'GREY', required: false
                        };
                    }
                    normalized[dynamicId] = String(raw[header]).trim();
                }
            });
        }
        
        // 4. Fill defaults
        Object.keys(FIELD_DEFINITIONS).forEach(field => {
            if (normalized[field] === undefined) normalized[field] = "";
        });

        return normalized;
    });
}

// ──── 4. IMPORT LOGIC & OVERWRITE ANALYZER ────

function initializeImportData(rawArray) {
    const newNormalizedData = normalizeBatch(rawArray);
    const overwriteToggle = document.getElementById('overwriteToggle');
    const isOverwrite = overwriteToggle && overwriteToggle.checked;
    
    if (window.MASTER_DATA.length > 0 && isOverwrite) {
        window.PENDING_DATA = newNormalizedData;
        runOverwriteAnalysis(window.MASTER_DATA, newNormalizedData);
    } else {
        window.MASTER_DATA = newNormalizedData;
        finalizeLoad();
    }
}

function finalizeLoad() {
    window.currentImportIndex = 0;
    document.getElementById('validateFilesBtn').disabled = false;
    document.getElementById('fileCount').innerText = window.MASTER_DATA.length + " Records";
    document.getElementById('recordNavigation').style.display = 'flex';
    
    loadRecord(0);
    window.showToast(`Loaded ${window.MASTER_DATA.length} records`, "success");
}

function runOverwriteAnalysis(currentData, newData) {
    window.DIFF_LOG = [];
    const limit = currentData.length; 
    
    for (let i = 0; i < limit; i++) {
        if (!newData[i]) break; 

        const currentRow = currentData[i];
        const newRow = newData[i];
        let changes = [];
        let hasChange = false;

        Object.keys(FIELD_DEFINITIONS).forEach(field => {
            const currentVal = currentRow[field] || "";
            const newVal = newRow[field] || "";

            if (currentVal !== newVal) {
                hasChange = true;
                // Identify which tables use this field
                const tables = [];
                Object.keys(TABLE_SCHEMAS).forEach(tbl => {
                    if(TABLE_SCHEMAS[tbl].includes(field)) tables.push(TABLE_NAMES[tbl]);
                });
                
                changes.push({ 
                    field: field, 
                    current: currentVal, 
                    new: newVal,
                    tables: tables 
                });
            }
        });

        window.DIFF_LOG.push({
            index: i,
            rowId: currentRow.ticket_number || `Row ${i+1}`,
            hasChange: hasChange,
            changes: changes
        });
    }

    renderDiffModal();
}

// ──── 5. DIFF MODAL RENDERING ────

let DIFF_PAGE = 1;
const DIFF_PER_PAGE = 20;

function renderDiffModal() {
    const existing = document.getElementById('tmmDiffModal');
    if(existing) existing.remove();

    const changedCount = window.DIFF_LOG.filter(r => r.hasChange).length;

    const html = `
    <div id="tmmDiffModal" class="tmm-modal-overlay">
        <div class="tmm-modal-container">
            <div class="tmm-modal-header">
                <div>
                    <h3 style="margin:0">Overwrite Analysis</h3>
                    <small>Comparing existing data vs new file (Index by Index)</small>
                </div>
                <span class="badge" style="background:#ffc107; color:#000;">${changedCount} Rows to Update</span>
            </div>
            <div class="tmm-modal-body" id="diffTableContainer"></div>
            <div class="tmm-modal-footer">
                <div>
                    <button class="btn btn-sm" onclick="changeDiffPage(-1)">Previous</button>
                    <span id="diffPageDisplay" style="margin:0 15px; font-weight:bold;">Page 1</span>
                    <button class="btn btn-sm" onclick="changeDiffPage(1)">Next</button>
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="closeDiffModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="confirmOverwrite()">Confirm Overwrite</button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    renderDiffPage();
}

function renderDiffPage() {
    const container = document.getElementById('diffTableContainer');
    const start = (DIFF_PAGE - 1) * DIFF_PER_PAGE;
    const end = start + DIFF_PER_PAGE;
    const slice = window.DIFF_LOG.slice(start, end);

    let html = `<table class="tmm-diff-table">
        <thead>
            <tr>
                <th class="diff-meta-col">Record ID</th>
                <th class="diff-changes-col">Changes Found</th>
            </tr>
        </thead>
        <tbody>`;

    slice.forEach(row => {
        if (!row.hasChange) {
            // html += `<tr><td colspan="2" style="color:#aaa; text-align:center; padding:5px;">Row ${row.index + 1} Unchanged</td></tr>`;
        } else {
            let changeHtml = row.changes.map(c => `
                <div class="diff-change-box">
                    <span class="diff-field-label">${FIELD_DEFINITIONS[c.field]?.label || c.field}</span>
                    <div style="margin-bottom:2px;">
                        ${c.tables.map(t => `<span class="diff-table-badge">${t}</span>`).join(' ')}
                    </div>
                    <div>
                        <span class="diff-val-old">${c.current || "<em>(empty)</em>"}</span>
                        <span class="diff-arrow">➜</span>
                        <span class="diff-val-new">${c.new || "<em>(empty)</em>"}</span>
                    </div>
                </div>
            `).join('');

            html += `<tr class="diff-row-changed">
                <td class="diff-meta-col">
                    <div class="diff-record-id">${row.rowId}</div>
                    <small style="color:#666">Row Index: ${row.index + 1}</small>
                </td>
                <td class="diff-changes-col">${changeHtml}</td>
            </tr>`;
        }
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
    document.getElementById('diffPageDisplay').innerText = `Page ${DIFF_PAGE}`;
}

function changeDiffPage(dir) {
    const max = Math.ceil(window.DIFF_LOG.length / DIFF_PER_PAGE);
    DIFF_PAGE += dir;
    if(DIFF_PAGE < 1) DIFF_PAGE = 1;
    if(DIFF_PAGE > max) DIFF_PAGE = max;
    renderDiffPage();
}

function closeDiffModal() {
    document.getElementById('tmmDiffModal').remove();
    window.PENDING_DATA = [];
}

function confirmOverwrite() {
    for(let i=0; i < window.PENDING_DATA.length; i++) {
        if (i < window.MASTER_DATA.length) {
            window.MASTER_DATA[i] = window.PENDING_DATA[i];
        }
    }
    window.showToast("Data Overwritten Successfully", "success");
    closeDiffModal();
    loadRecord(window.currentImportIndex);
}

// ──── 6. MATRIX UI & NAVIGATION ────

function loadRecord(index) {
  if (!window.MASTER_DATA || window.MASTER_DATA.length === 0) return;

  if (index < 0) index = 0;
  if (index >= window.MASTER_DATA.length) index = window.MASTER_DATA.length - 1;
  window.currentImportIndex = index;

  const record = window.MASTER_DATA[index];

  // Clear Visual Stores
  Object.keys(DATA_STORE).forEach(key => DATA_STORE[key] = {});

  // Populate Visual Stores
  Object.keys(FIELD_DEFINITIONS).forEach(field => {
      const val = record[field];
      if (val) smartAddToOtherTables(field, val); 
  });

  document.getElementById('currentRecordDisplay').innerText = `${index + 1} / ${window.MASTER_DATA.length}`;
  
  // 1. Render the HTML completely (resets classes/attributes)
  renderMatrixBody();
  
  // 2. CRITICAL: Re-Apply Filters Immediately
  // Because rendering wipes the previous filter state from the DOM elements
  if(typeof window.applyFilters === 'function') window.applyFilters();
  if(typeof window.applyColumnVisibility === 'function') window.applyColumnVisibility(); // Forces column hiding to re-run
  
  // 3. Re-Apply Search Highlighting if active
  const searchVal = document.getElementById('searchInput')?.value;
  if(searchVal && typeof performSearchHighlight === 'function') performSearchHighlight(searchVal);

  updateStatistics();
  updateFinalTablePreview();
}

function handleCellChange(tableKey, field, value) {
  DATA_STORE[tableKey][field] = value;
  
  // Update Master Data
  if (window.MASTER_DATA[window.currentImportIndex]) {
      window.MASTER_DATA[window.currentImportIndex][field] = value;
  }
  
  if (STATE.smartAddEnabled) smartAddToOtherTables(field, value);
  updateStatistics();
  updateFinalTablePreview();
}

function smartAddToOtherTables(field, value) {
  const def = FIELD_DEFINITIONS[field];
  if (!def || !def.autoPopTo) return;

  let populatedCount = 0;
  def.autoPopTo.forEach(targetTable => {
    // Only update if empty or if needed (depending on strictness)
    // Here we update if visual store exists
    if (DATA_STORE[targetTable]) {
      DATA_STORE[targetTable][field] = value;
      populatedCount++;
      const cell = document.querySelector(`td[data-table="${targetTable}"][data-field="${field}"] .cell-input`);
      if (cell) {
        cell.value = value;
        cell.classList.add('auto-populated');
        setTimeout(() => cell.classList.remove('auto-populated'), 1000);
      }
    }
  });
  
  if (populatedCount > 0) {
      STATE.smartAddCount++;
      STATE.autoPopulatedCount += populatedCount;
  }
}

// ──── 7. UTILS, STATS & RENDERING ────

function renderMatrixHeader() {
  const header = document.getElementById('matrixHeader');
  if (!header) return;
  let html = '<th class="field-column">Field Name</th>';
  
  Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
    // CRITICAL: Ensure we add the data-table attribute here for filtering logic to find it
    html += `<th class="table-column" data-table="${tableKey}">${TABLE_NAMES[tableKey]}</th>`;
  });
  
  header.innerHTML = html;
}

function renderMatrixBody() {
  const body = document.getElementById('matrixBody');
  if (!body) return;
  const allFields = Array.from(new Set([
      ...Object.values(TABLE_SCHEMAS).flat(),
      ...Object.keys(FIELD_DEFINITIONS)
  ])).sort();

  let html = '';
  allFields.forEach(field => {
    const def = FIELD_DEFINITIONS[field] || { label: field, type: 'TEXT', group: 'SYSTEM', rag: 'RED' };
    
    // CRITICAL: Added data attributes (field, group, type, rag) so filters can work
    html += `<tr class="matrix-row" data-field="${field}" data-group="${def.group}" data-type="${def.type}" data-rag="${def.rag}">
      <td class="field-cell">
        <span class="field-name">${def.label || ''}</span>
        <span class="field-meta">${def.type || ''} | ${def.group || ''}</span>
        ${def.required ? '<span class="required-badge">Required</span>' : ''}
        <span class="rag-indicator rag-${def.rag ? def.rag.toLowerCase() : ''}">●</span>
      </td>`;

    Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
      const exists = TABLE_SCHEMAS[tableKey].includes(field);
      const value = DATA_STORE[tableKey][field] || '';

      // CRITICAL: Ensure data-table attribute matches header for column hiding
      if (STATE.matrixMode === 'structural') {
        html += `<td class="matrix-cell ${exists ? 'exists' : 'not-exists'}" data-table="${tableKey}" data-field="${field}">${exists ? '✔' : '✖'}</td>`;
      } else {
        html += `<td class="matrix-cell data-cell ${exists ? '' : 'pending-data'}" data-table="${tableKey}" data-field="${field}">
          <input type="text" class="cell-input" value="${value}" onchange="handleCellChange('${tableKey}', '${field}', this.value)" placeholder="${exists ? 'Value' : 'Pending'}">
        </td>`;
      }
    });
    html += '</tr>';
  });
  body.innerHTML = html;
}

function updateStatistics() {
    // 1. Calculate Columns
    const allFields = Array.from(new Set([
        ...Object.values(TABLE_SCHEMAS).flat(),
        ...Object.keys(FIELD_DEFINITIONS)
    ]));
    
    let commonCount = 0;
    let uniqueCount = 0;
    const schemas = Object.values(TABLE_SCHEMAS);
    
    allFields.forEach(f => {
        const occurences = schemas.filter(s => s.includes(f)).length;
        if(occurences === schemas.length) commonCount++;
        if(occurences === 1) uniqueCount++;
    });

    // 2. Update DOM
    const elTotal = document.getElementById('totalColumns');
    if(elTotal) elTotal.textContent = allFields.length;
    
    const elCommon = document.getElementById('commonColumns');
    if(elCommon) elCommon.textContent = commonCount;
    
    const elUnique = document.getElementById('uniqueColumns');
    if(elUnique) elUnique.textContent = uniqueCount;
    
    const elSmart = document.getElementById('smartAddCount');
    if(elSmart) elSmart.textContent = STATE.smartAddCount;
    
    const elAuto = document.getElementById('autoPopulated');
    if(elAuto) elAuto.textContent = STATE.autoPopulatedCount;
}

function updateFinalTablePreview() {
  const container = document.getElementById('finalTablePreview');
  if (!container) return;
  const activeData = DATA_STORE['final_ticket'] || {};
  const columns = TABLE_SCHEMAS.final_ticket;

  if (Object.keys(activeData).length === 0) {
      container.innerHTML = `<div style="text-align:center;color:#999;padding:20px;">No Final Ticket Data</div>`;
      return;
  }

  let html = '<div class="final-table-scroll"><table class="final-preview-table"><thead><tr>';
  columns.forEach(k => html += `<th>${FIELD_DEFINITIONS[k]?.label || k}</th>`);
  html += '</tr></thead><tbody><tr>';
  columns.forEach(k => html += `<td>${activeData[k] || 'NA'}</td>`);
  html += '</tr></tbody></table></div>';
  container.innerHTML = html;
}

function toggleMatrixMode() {
    STATE.matrixMode = STATE.matrixMode === 'structural' ? 'data' : 'structural';
    renderMatrixBody();
    if(typeof window.applyFilters === 'function') window.applyFilters(); // Re-apply on toggle
}

function nextRecord() {
    if (window.currentImportIndex < window.MASTER_DATA.length - 1) loadRecord(window.currentImportIndex + 1);
    else showToast("End of records", "info");
}

function prevRecord() {
    if (window.currentImportIndex > 0) loadRecord(window.currentImportIndex - 1);
}

function clearCsvData() {
    window.MASTER_DATA = [];
    window.currentImportIndex = 0;
    Object.keys(DATA_STORE).forEach(key => DATA_STORE[key] = {});
    renderMatrixBody();
    updateFinalTablePreview();
    document.getElementById('recordNavigation').style.display = 'none';
    showToast("Data Cleared", "info");
}

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
    setTimeout(() => { toast.remove(); }, 3000);
}

function initSaveButton() {
    const saveBtn = document.getElementById('viewRulesBtn');
    if (!saveBtn) return;
    saveBtn.addEventListener('click', function() {
        if (window.MASTER_DATA.length === 0) {
            showToast("No data to save.", "error");
            return;
        }
        console.group("💾 FULL DATA DUMP");
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Records: ${window.MASTER_DATA.length}`);
        console.log("Master Data (Current State):", window.MASTER_DATA);
        console.groupEnd();
        showToast("Data dumped to Console", "success");
    });
}
// ──── END OF FILE ────