// ════
// TICKET MATCHING MATRIX - Enhanced JavaScript
// ════

// ────
// GLOBAL STATE
// ────
const STATE = {
  smartAddEnabled: true,
  matrixMode: 'structural', // 'structural' or 'data'
  hiddenColumns: new Set(),
  smartAddCount: 0,
  autoPopulatedCount: 0,
  preview: {
    tableKey: null,
    rows: []
  }
};

// ────
// STATIC SAMPLE DATA (HCL ONLY) - Data Preview rows
// ────
const SAMPLE_DATA_HCL = {
  ticket_data: [
    {
      "Request ID": "548279",
      "CUSTOMER REFERENCE": "NA",
      "Requester": "Ambuj Pathak",
      "Subject": "Jakarta || Indonesia || HCL_Caterpillar || ETA: 19/05/2025 at 10:00 || P4 || SCTASK3824526",
      "Site": "12550-PT Caterpillar Finance Indonesia",
      "Priority": "P4",
      "Assigned Technician": "Savita Pandit",
      "Request Status": "Closed",
      "Account": "HCL_Caterpillar",
      "REGION OF THE COUNTRY": "APAC",
      "Country": "Indonesia",
      "CITY OR TOWN": "jakarta",
      "Created Time (UK time)": "5/16/2025 10:19",
      "Completed Time (UK time)": "7/16/2025 12:50",
      "Total Hours in Hours": "1",
      "Total Revenue": "37.5",
      "currency": "USD",
      "Total labor Cost": "15",
      "Profit": "22.5",
      "Margin in %": "60"
    },
    {
      "Request ID": "553418",
      "CUSTOMER REFERENCE": "NA",
      "Requester": "Ambuj Pathak",
      "Subject": "Rayong || Thailand || HCL_CATERPILLAR || ETA: [07/07/2025], [08/07/2025], [09/07/2025] || P4",
      "Site": "Common Site",
      "Priority": "P4",
      "Assigned Technician": "Savita Pandit",
      "Request Status": "Closed",
      "Account": "HCL_Caterpillar",
      "REGION OF THE COUNTRY": "APAC",
      "Country": "Thailand",
      "CITY OR TOWN": "Rayong",
      "Created Time (UK time)": "6/23/2025 12:45",
      "Completed Time (UK time)": "7/24/2025 11:50",
      "Total Hours in Hours": "4",
      "Total Revenue": "1656",
      "currency": "USD",
      "Total labor Cost": "772.33",
      "Profit": "883.67",
      "Margin in %": "53"
    }
  ],

  dispatch: [
    {
      "Site Category": "Dispatch",
      "Customer Name": "Caterpillar",
      "Partner Name": "Excis",
      "Customer Ticket Number": "NA",
      "Customer Ticket Created Date (MM/DD/YYYY)": "07/07/2025",
      "Partner Ticket Number": "553418",
      "Source of Request": "NA",
      "PO number": "9200135149",
      "Country": "Thailand",
      "State": "Rayong",
      "City": "Rayong",
      "Site Address": "Common Site",
      "Zip code": "NA",
      "Activity Details": "Rayong || Thailand || HCL_CATERPILLAR || ETA: [07/07/2025], [08/07/2025], [09/07/2025] || P4",
      "Dispatch Category": "NBD",
      "Ticket Priority": "P4",
      "ETA Date (MM/DD/YYYY)": "07/07/2025",
      "Technician Name": "NA",
      "Technician IN Date (MM/DD/YYYY)": "07/07/2025",
      "Technician IN Time": "7:30:00",
      "Technician OUT Time": "17:00:00",
      "Total Hours": "10",
      "Total Cost": "18002.88",
      "Currency": "THB",
      "SLA Met": "Yes",
      "Service Month (MM/YYYY)": "Nov 1"
    },
    {
      "Site Category": "Dispatch",
      "Customer Name": "Caterpillar",
      "Partner Name": "Excis",
      "Customer Ticket Number": "SCTASK3936890",
      "Customer Ticket Created Date (MM/DD/YYYY)": "06/30/2025",
      "Partner Ticket Number": "554015",
      "Source of Request": "NA",
      "PO number": "9200135479",
      "Country": "Indonesia",
      "State": "JAKARTA",
      "City": "JAKARTA",
      "Site Address": "Common Site",
      "Zip code": "NA",
      "Activity Details": "Jakarta || Indonesia || HCL_Caterpillar || ETA: 30/06/2025 09:00 || P4",
      "Dispatch Category": "NBD",
      "Ticket Priority": "P4",
      "ETA Date (MM/DD/YYYY)": "06/30/2025",
      "Technician Name": "NA",
      "Technician IN Date (MM/DD/YYYY)": "06/30/2025",
      "Technician IN Time": "8:30:00",
      "Technician OUT Time": "9:32:00",
      "Total Hours": "1",
      "Total Cost": "401175.04",
      "Currency": "IDR",
      "SLA Met": "Yes",
      "Service Month (MM/YYYY)": "Nov-2025"
    }
  ],

  dedicated: [
    {
      "Site Category": "Dedicated",
      "Customer Name": "BMS",
      "Partner Name": "Excis",
      "Country": "Argentina",
      "State": "Buenos Aires",
      "City": "Buenos Aires",
      "Site Address": "Alvaro Barros 1113 . Buenos Aires. Site name: BUO",
      "Zip code": "7403",
      "PO number": "9200137647",
      "Technician Name": "Joel Rivas",
      "Band": "Band 3",
      "Backfill": "Without Backfill",
      "Total Days": "20",
      "Total Cost": "3631.98",
      "Currency": "USD",
      "SLA Met": "Yes",
      "Service Month (MM/YYYY)": "Nov-25"
    }
  ],

  sv_visit: [
    {
      "Site Category": "Scheduled Visit",
      "Customer Name": "BMS",
      "Partner Name": "Excis",
      "Customer Ticket Number": "NA",
      "Partner Ticket Number": "NA",
      "Source of Request": "Email",
      "PO number": "9200137647",
      "Country": "Israel",
      "State": "Petach-Tikva",
      "City": "Petach-Tikva",
      "Site Address": "18 Aharon Bart St",
      "Zip code": "4951446",
      "Activity Details": "Scheduled Visit",
      "Category (Half day/Full Day/Per Hour)": "Half day",
      "ETA Date (MM/DD/YYYY)": "11/3/2025",
      "Technician Name": "Nabil Fitiani",
      "Total Hours": "4",
      "Total Cost": "1272.01",
      "Currency": "ILS",
      "SLA Met": "Yes",
      "Service Month (MM/YYYY)": "Nov-25"
    }
  ],

  final_ticket: [
    {
      "Request ID": "548279",
      "CUSTOMER REFERENCE": "NA",
      "Requester": "Ambuj Pathak",
      "Subject": "Jakarta || Indonesia || HCL_Caterpillar || ETA: 19/05/2025 at 10:00 || P4",
      "Site": "12550-PT Caterpillar Finance Indonesia",
      "Priority": "P4",
      "Assigned Technician": "Savita Pandit",
      "Request Status": "Closed",
      "Account": "HCL_Caterpillar",
      "REGION OF THE COUNTRY": "APAC",
      "Country": "Indonesia",
      "CITY OR TOWN": "jakarta",
      "Total Hours in Hours": "1",
      "Total Revenue": "37.5",
      "currency": "USD",
      "Total labor Cost": "15",
      "Profit": "22.5",
      "Margin in %": "60"
    },
    {
      "Request ID": "553418",
      "CUSTOMER REFERENCE": "NA",
      "Requester": "Ambuj Pathak",
      "Subject": "Rayong || Thailand || HCL_CATERPILLAR || ETA: [07/07/2025]",
      "Site": "Common Site",
      "Priority": "P4",
      "Assigned Technician": "Savita Pandit",
      "Request Status": "Closed",
      "Account": "HCL_Caterpillar",
      "REGION OF THE COUNTRY": "APAC",
      "Country": "Thailand",
      "CITY OR TOWN": "Rayong",
      "Total Hours in Hours": "4",
      "Total Revenue": "1656",
      "currency": "USD",
      "Total labor Cost": "772.33",
      "Profit": "883.67",
      "Margin in %": "53"
    }
  ]
};

function normalizeCategoryKey(raw) {
  const v = (raw || '').trim().toLowerCase();
  if (v === 'sv' || v === 'scheduled_visit' || v === 'scheduled visit') return 'sv_visit';
  if (v === 'ticket' || v === 'ticket_data') return 'ticket_data';
  if (v === 'rate' || v === 'rate_card') return 'rate_card';
  if (v === 'final' || v === 'final_ticket') return 'final_ticket';
  return v;
}

// ────
// TABLE SCHEMAS - Define which fields exist in each table
// ────
const TABLE_SCHEMAS = {
  ticket_data: [
    'request_id', 'ticket_number', 'requester', 'subject', 'customer', 'account',
    'region', 'country', 'city', 'site_name', 'address', 'postal_code',
    'contact_name', 'contact_phone', 'contact_email', 'priority', 'status',
    'created_date', 'scheduled_date', 'completed_date', 'sla_due_date',
    'service_type', 'problem_description', 'resolution', 'notes'
  ],
  rate_card: [
    'customer', 'account', 'region', 'country', 'service_type', 'rate_type',
    'base_rate', 'hourly_rate', 'overtime_rate', 'weekend_rate', 'holiday_rate',
    'travel_rate', 'per_diem', 'currency', 'effective_date', 'expiry_date'
  ],
  dispatch: [
    'ticket_number', 'dispatch_id', 'technician_name', 'technician_id',
    'dispatch_date', 'arrival_time', 'departure_time', 'travel_time',
    'onsite_time', 'total_hours', 'status', 'notes'
  ],
  standby: [
    'ticket_number', 'standby_id', 'technician_name', 'technician_id',
    'standby_date', 'start_time', 'end_time', 'total_hours', 'rate',
    'total_cost', 'status', 'notes'
  ],
  dedicated: [
    'ticket_number', 'dedicated_id', 'technician_name', 'technician_id',
    'start_date', 'end_date', 'daily_rate', 'total_days', 'total_cost',
    'customer', 'account', 'site_name', 'status', 'notes'
  ],
  sv_visit: [
    'ticket_number', 'sv_id', 'technician_name', 'technician_id',
    'visit_date', 'visit_type', 'arrival_time', 'departure_time',
    'total_hours', 'rate', 'total_cost', 'status', 'notes'
  ],
  project: [
    'project_id', 'project_name', 'customer', 'account', 'region', 'country',
    'start_date', 'end_date', 'budget', 'actual_cost', 'status',
    'project_manager', 'team_size', 'notes'
  ],
  final_ticket: [
    'ticket_number', 'request_id', 'customer', 'account', 'region', 'country',
    'city', 'site_name', 'service_type', 'technician_name', 'scheduled_date',
    'completed_date', 'total_hours', 'labor_cost', 'travel_cost', 'parts_cost',
    'total_cost', 'revenue', 'profit', 'margin', 'sla_met', 'status'
  ]
};

// ────
// FIELD DEFINITIONS - Metadata for all fields
// ────
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

// ────
// DATA STORE - Holds actual data values
// ────
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

// ────
// TABLE DISPLAY NAMES
// ────
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

// ---- Export matrix internals to global scope (required for importer) ----
window.STATE = STATE;
window.DATA_STORE = DATA_STORE;
window.TABLE_SCHEMAS = TABLE_SCHEMAS;
window.FIELD_DEFINITIONS = FIELD_DEFINITIONS;
window.TABLE_NAMES = TABLE_NAMES;

// functions used by importer
window.renderMatrixBody = renderMatrixBody;
window.applyColumnVisibility = applyColumnVisibility;
window.updateStatistics = updateStatistics;
window.updateFinalTablePreview = updateFinalTablePreview;
window.smartAddToOtherTables = smartAddToOtherTables;
window.showToast = showToast;

// ════
// INITIALIZATION
// ════
document.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  applyFilters();
  initColumnVisibility();
  initSearchHighlight();
  updateStatistics();
  updateFinalTablePreview();

  const cust = document.getElementById('tmm_customerSelect');
  const cat = document.getElementById('tmm_categorySelect');

  if (cust) cust.addEventListener('change', () => { if (STATE.matrixMode === 'data') updateMatrixData(); });
  if (cat) cat.addEventListener('change', () => { if (STATE.matrixMode === 'data') updateMatrixData(); });
});

// ────
// MATRIX INITIALIZATION
// ────
function initMatrix() {
  renderMatrixHeader();
  renderMatrixBody();
}

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
      <span class="field-name">${def.label}</span>
      <span class="field-meta">${def.type} | ${def.group}</span>
      ${def.required ? '<span class="required-badge">Required</span>' : ''}
      <span class="rag-indicator rag-${def.rag.toLowerCase()}">●</span>
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
  Object.values(TABLE_SCHEMAS).forEach(schema => {
    schema.forEach(field => fields.add(field));
  });
  Object.keys(FIELD_DEFINITIONS).forEach(field => fields.add(field));
  return Array.from(fields).sort();
}

// ════
// COLUMN VISIBILITY
// ════
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
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function toggleColumnVisibility(tableKey, visible) {
  if (visible) {
    STATE.hiddenColumns.delete(tableKey);
  } else {
    STATE.hiddenColumns.add(tableKey);
  }
  applyColumnVisibility();
}

function applyColumnVisibility() {
  const headerCells = document.querySelectorAll('#matrixHeader th[data-table]');
  const bodyCells = document.querySelectorAll('#matrixBody td[data-table]');

  headerCells.forEach(cell => {
    const table = cell.dataset.table;
    cell.style.display = STATE.hiddenColumns.has(table) ? 'none' : '';
  });

  bodyCells.forEach(cell => {
    const table = cell.dataset.table;
    cell.style.display = STATE.hiddenColumns.has(table) ? 'none' : '';
  });
}

function showAllColumns() {
  STATE.hiddenColumns.clear();
  const checkboxes = document.querySelectorAll('#columnCheckboxList input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = true);
  applyColumnVisibility();
  showToast('All columns visible', 'success');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('columnDropdownContent');
  const btn = document.querySelector('.column-visibility-btn');
  if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

// ════
// SEARCH HIGHLIGHTING
// ════
function initSearchHighlight() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearchHighlight(searchInput.value);
    }
  });

  searchInput.addEventListener('input', (e) => {
    if (e.target.value === '') {
      clearSearchHighlight();
    }
  });
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

    if (fieldLabel.includes(lowerQuery)) {
      row.classList.add('search-match-row');
      matchCount++;
    }

    const cells = row.querySelectorAll('.cell-input');
    cells.forEach(input => {
      if (input.value.toLowerCase().includes(lowerQuery)) {
        input.closest('td').classList.add('search-match-cell');
        row.classList.add('search-match-row');
        matchCount++;
      }
    });
  });

  if (matchCount > 0) {
    showToast(`Found ${matchCount} matches`, 'info');
  } else {
    showToast('No matches found', 'warning');
  }
}

function clearSearchHighlight() {
  document.querySelectorAll('.search-match-row').forEach(el => el.classList.remove('search-match-row'));
  document.querySelectorAll('.search-match-cell').forEach(el => el.classList.remove('search-match-cell'));
}

// ════
// CELL CHANGE HANDLER & SMART ADD
// ════
function handleCellChange(tableKey, field, value) {
  DATA_STORE[tableKey][field] = value;

  if (STATE.smartAddEnabled) {
    smartAddToOtherTables(field, value);
  }

  updateStatistics();
  updateFinalTablePreview();
}

function smartAddToOtherTables(field, value) {
  const def = FIELD_DEFINITIONS[field];
  if (!def || !def.autoPopTo) return;

  const indicator = document.getElementById('smartAddIndicator');
  const text = document.getElementById('smartAddText');

  if (indicator && text) {
    indicator.style.display = 'flex';
    text.textContent = `Smart Add: Populating "${def.label}" to ${def.autoPopTo.length} tables...`;
  }

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

  setTimeout(() => {
    if (indicator) indicator.style.display = 'none';
  }, 1500);

  if (populated > 0) {
    showToast(`Auto-populated "${def.label}" to ${populated} tables`, 'success');
  }
}

// ════
// TOGGLE FUNCTIONS
// ════
function toggleMatrixMode() {
  const toggle = document.getElementById('matrixModeToggle');
  STATE.matrixMode = toggle && toggle.checked ? 'data' : 'structural';

  if (STATE.matrixMode === 'data') {
    updateMatrixData();
  } else {
    renderMatrixBody();
    applyColumnVisibility();
    updateFinalTablePreview();
  }
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

function toggleAdvancedFilters() {
  const panel = document.getElementById('advancedFilters');
  if (panel) {
    panel.classList.toggle('show');
  }
}

// ════
// FILTERS
// ════
function applyFilters() {
  const tableFilter = document.getElementById('tableFilter')?.value || 'SHOW_ALL';
  const fieldGroupFilter = document.getElementById('fieldGroupFilter')?.value || 'ALL';
  const ragFilter = document.getElementById('ragFilter')?.value || 'ALL';
  const dataTypeFilter = document.getElementById('dataTypeFilter')?.value || 'ALL';
  const showRequiredOnly = document.getElementById('showRequiredOnly')?.checked || false;
  const showEmptyOnly = document.getElementById('showEmptyOnly')?.checked || false;

  const rows = document.querySelectorAll('#matrixBody .matrix-row');

  rows.forEach(row => {
    const field = row.dataset.field;
    const group = row.dataset.group;
    const type = row.dataset.type;
    const rag = row.dataset.rag;
    const def = FIELD_DEFINITIONS[field] || {};

    let visible = true;

    if (fieldGroupFilter !== 'ALL' && group !== fieldGroupFilter) {
      visible = false;
    }

    if (ragFilter !== 'ALL') {
      if (ragFilter === 'REQUIRED' && !def.required) visible = false;
      if (ragFilter === 'OPTIONAL' && def.required) visible = false;
      if (['GREEN', 'AMBER', 'RED'].includes(ragFilter) && rag !== ragFilter) visible = false;
    }

    if (dataTypeFilter !== 'ALL' && type !== dataTypeFilter) {
      visible = false;
    }

    if (showRequiredOnly && !def.required) {
      visible = false;
    }

    if (showEmptyOnly) {
      const hasData = Object.values(DATA_STORE).some(store => store[field]);
      if (hasData) visible = false;
    }

    row.style.display = visible ? '' : 'none';
  });

  if (tableFilter !== 'SHOW_ALL') {
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
    const targetTable = tableMap[tableFilter];
    if (targetTable) {
      Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
        if (tableKey === targetTable) {
          STATE.hiddenColumns.delete(tableKey);
        } else {
          STATE.hiddenColumns.add(tableKey);
        }
      });
      applyColumnVisibility();
      updateCheckboxes();
    }
  }
}

function updateCheckboxes() {
  const checkboxes = document.querySelectorAll('#columnCheckboxList input[type="checkbox"]');
  checkboxes.forEach(cb => {
    const table = cb.dataset.table;
    cb.checked = !STATE.hiddenColumns.has(table);
  });
}

function resetFilters() {
  document.getElementById('tableFilter').value = 'SHOW_ALL';
  document.getElementById('fieldGroupFilter').value = 'ALL';
  document.getElementById('ragFilter').value = 'ALL';
  document.getElementById('dataTypeFilter').value = 'ALL';
  document.getElementById('sortOrder').value = 'ALPHABETICAL_ASC';
  document.getElementById('inputMode').value = 'NORMAL';

  const showRequiredOnly = document.getElementById('showRequiredOnly');
  const showEmptyOnly = document.getElementById('showEmptyOnly');
  const showTransformation = document.getElementById('showTransformation');

  if (showRequiredOnly) showRequiredOnly.checked = false;
  if (showEmptyOnly) showEmptyOnly.checked = false;
  if (showTransformation) showTransformation.checked = false;

  STATE.hiddenColumns.clear();
  applyColumnVisibility();
  updateCheckboxes();

  const rows = document.querySelectorAll('#matrixBody .matrix-row');
  rows.forEach(row => row.style.display = '');

  showToast('Filters reset', 'info');
}

function handleInputMode() {
  const mode = document.getElementById('inputMode')?.value || 'NORMAL';
  const siteCategoryGroup = document.getElementById('siteCategoryGroup');

  if (mode === 'SITE_CATEGORY') {
    if (siteCategoryGroup) siteCategoryGroup.style.display = 'block';
  } else {
    if (siteCategoryGroup) siteCategoryGroup.style.display = 'none';
  }

  if (mode === 'BULK') {
    showBulkInputModal();
  }
}

function filterBySiteCategory() {
  const category = document.getElementById('siteCategory')?.value || '';
  if (!category) {
    STATE.hiddenColumns.clear();
  } else {
    const categoryMap = {
      'dispatch': 'dispatch',
      'dedicated': 'dedicated',
      'project': 'project',
      'sv': 'sv_visit',
      'standby': 'standby'
    };
    Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
      if (tableKey === categoryMap[category] || tableKey === 'ticket_data' || tableKey === 'final_ticket') {
        STATE.hiddenColumns.delete(tableKey);
      } else {
        STATE.hiddenColumns.add(tableKey);
      }
    });
  }
  applyColumnVisibility();
  updateCheckboxes();
}

// ════
// DISPLAY OPTIONS
// ════
function applyHighlighting() {
  const mode = document.getElementById('highlightMode')?.value || 'NONE';
  const rows = document.querySelectorAll('#matrixBody .matrix-row');

  rows.forEach(row => {
    row.classList.remove('highlight-source', 'highlight-type', 'highlight-required', 'highlight-rag', 'highlight-auto', 'highlight-validation', 'highlight-empty', 'highlight-nonexistent');

    if (mode === 'NONE') return;

    const field = row.dataset.field;
    const def = FIELD_DEFINITIONS[field] || {};

    switch (mode) {
      case 'REQUIRED_STATUS':
        if (def.required) row.classList.add('highlight-required');
        break;
      case 'RAG_STATUS':
        row.classList.add(`highlight-rag-${(def.rag || 'green').toLowerCase()}`);
        break;
      case 'AUTO_POP':
        if (def.autoPopTo && def.autoPopTo.length > 1) row.classList.add('highlight-auto');
        break;
      case 'EMPTY':
        const hasData = Object.values(DATA_STORE).some(store => store[field]);
        if (!hasData) row.classList.add('highlight-empty');
        break;
    }
  });
}

function applyDisplayOptions() {
  // Placeholder
}

function applyDisplayMode() {
  // Placeholder
}

// ════
// STATISTICS
// ════
function updateStatistics() {
  const allFields = getAllUniqueFields();
  const totalColumns = allFields.length;

  let commonCount = 0;
  allFields.forEach(field => {
    const inAll = Object.values(TABLE_SCHEMAS).every(schema => schema.includes(field));
    if (inAll) commonCount++;
  });

  let uniqueCount = 0;
  allFields.forEach(field => {
    const tableCount = Object.values(TABLE_SCHEMAS).filter(schema => schema.includes(field)).length;
    if (tableCount === 1) uniqueCount++;
  });

  const requiredCount = Object.values(FIELD_DEFINITIONS).filter(def => def.required).length;

  document.getElementById('totalColumns').textContent = totalColumns;
  document.getElementById('commonColumns').textContent = commonCount;
  document.getElementById('uniqueColumns').textContent = uniqueCount;
  document.getElementById('requiredCount').textContent = requiredCount;
  document.getElementById('smartAddCount').textContent = STATE.smartAddCount;
  document.getElementById('autoPopulated').textContent = STATE.autoPopulatedCount;
}

// ════
// FINAL TABLE PREVIEW
// ════
function updateFinalTablePreview() {
  // If we are in Data Preview mode, show sample data instead
  if (STATE.matrixMode === 'data' && STATE.preview.rows && STATE.preview.rows.length > 0) {
    const title = `Data Preview (HCL) — ${TABLE_NAMES[STATE.preview.tableKey] || STATE.preview.tableKey} — ${STATE.preview.rows.length} row(s)`;
    renderDataPreviewTable('finalTablePreview', title, STATE.preview.rows);
    return;
  }

  // Otherwise show Final Ticket data
  const preview = document.getElementById('finalTablePreview');
  if (!preview) return;

  const finalData = DATA_STORE.final_ticket;
  const fieldsWithData = Object.entries(finalData).filter(([key, value]) => value);

  if (fieldsWithData.length === 0) {
    preview.innerHTML = `
      <div class="empty-preview">
        <i class="fas fa-inbox"></i>
        <p>No data in Final Ticket table yet</p>
        <small>Enter data in the matrix above to populate this preview</small>
      </div>
    `;
    return;
  }

  let html = '<div class="final-table-scroll"><table class="final-preview-table"><thead><tr>';
  fieldsWithData.forEach(([field]) => {
    const def = FIELD_DEFINITIONS[field] || { label: field };
    html += `<th>${def.label}</th>`;
  });
  html += '</tr></thead><tbody><tr>';
  fieldsWithData.forEach(([field, value]) => {
    html += `<td>${value}</td>`;
  });
  html += '</tr></tbody></table></div>';

  preview.innerHTML = html;
}

// ════
// BULK INPUT MODAL
// ════
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

        if (STATE.smartAddEnabled) {
          smartAddToOtherTables(field, value);
        }
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

// ════
// TOAST NOTIFICATIONS
// ════
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

// ════
// CONTEXT UPDATES & DATA PREVIEW
// ════
function updateMatrixData() {
  console.log('[updateMatrixData] fired');
  
  const { tableKey, customer } = getSelectedContext();
  console.log('[updateMatrixData] tableKey:', tableKey, 'customer:', customer);

  const rows = loadSampleRowsForContext(tableKey, customer);
  console.log('[updateMatrixData] loaded rows:', rows.length);

  STATE.preview.tableKey = tableKey;
  STATE.preview.rows = rows;

  if (STATE.matrixMode === 'data' && rows.length) {
    applySampleToMatrixStore(tableKey, rows);
  }

  renderMatrixBody();
  applyColumnVisibility();
  updateStatistics();
  updateFinalTablePreview();

  if (!rows.length) {
    showToast(`No sample data for ${customer || '(customer)'} / ${tableKey || '(table)'}`, 'warning');
  } else {
    showToast(`Loaded sample: ${customer} / ${tableKey} (${rows.length} row(s))`, 'success');
  }
}

function getSelectedContext() {
  const tableRaw = document.getElementById('tmm_categorySelect')?.value;
  const customerRaw = document.getElementById('tmm_customerSelect')?.value;

  const tableKey = normalizeCategoryKey(tableRaw);
  const customer = (customerRaw || '').trim();

  console.log('[getSelectedContext] raw:', tableRaw, customerRaw, '=> normalized:', tableKey, customer);

  return { tableKey, customer };
}

function loadSampleRowsForContext(tableKey, customer) {
  const c = (customer || '').toUpperCase();
  if (!c.includes('HCL')) {
    console.log('[loadSampleRowsForContext] customer not HCL, returning empty');
    return [];
  }
  
  const data = SAMPLE_DATA_HCL[tableKey] || [];
  console.log('[loadSampleRowsForContext] found', data.length, 'rows for', tableKey);
  return data;
}

function mapSampleRowToStore(tableKey, row) {
  const out = {};

  // Map based on actual column names from sample data
  out.request_id = row["Request ID"] || row["Partner Ticket Number"] || '';
  out.ticket_number = row["Partner Ticket Number"] || row["Request ID"] || '';
  out.requester = row["Requester"] || '';
  out.subject = row["Subject"] || row["Activity Details"] || '';
  out.customer = row["Customer Name"] || '';
  out.account = row["Account"] || '';
  out.region = row["REGION OF THE COUNTRY"] || '';
  out.country = row["Country"] || '';
  out.city = row["City"] || row["CITY OR TOWN"] || '';
  out.site_name = row["Site"] || row["Site Address"] || '';
  out.address = row["Site Address"] || '';
  out.postal_code = row["Zip code"] || '';
  out.priority = row["Priority"] || row["Ticket Priority"] || '';
  out.status = row["Request Status"] || '';
  out.created_date = row["Created Time (UK time)"] || row["Customer Ticket Created Date (MM/DD/YYYY)"] || '';
  out.completed_date = row["Completed Time (UK time)"] || '';
  out.scheduled_date = row["ETA Date (MM/DD/YYYY)"] || '';
  out.technician_name = row["Assigned Technician"] || row["Technician Name"] || '';
  out.total_hours = row["Total Hours in Hours"] || row["Total Hours"] || '';
  out.total_cost = row["Total labor Cost"] || row["Total Cost"] || '';
  out.revenue = row["Total Revenue"] || '';
  out.profit = row["Profit"] || '';
  out.margin = row["Margin in %"] || '';
  out.currency = row["currency"] || row["Currency"] || '';
  out.sla_met = row["SLA Met"] || '';
  out.service_type = row["Site Category"] || row["Dispatch Category"] || '';

  return out;
}

function applySampleToMatrixStore(tableKey, rows) {
  if (!DATA_STORE[tableKey]) return;
  DATA_STORE[tableKey] = {};

  if (!rows || !rows.length) return;

  const first = rows[0];
  const mapped = mapSampleRowToStore(tableKey, first);

  Object.entries(mapped).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s || s === 'NA' || s === 'N/A') return;
    DATA_STORE[tableKey][k] = s;

    if (STATE.smartAddEnabled) smartAddToOtherTables(k, s);
  });
}

function renderDataPreviewTable(containerId, title, rows) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!rows || rows.length === 0) {
    el.innerHTML = `
      <div class="empty-preview">
        <i class="fas fa-inbox"></i>
        <p>No sample data loaded</p>
        <small>Select HCL + a table, then switch to Data Preview</small>
      </div>
    `;
    return;
  }

  const colSet = new Set();
  Object.keys(rows[0]).forEach(k => colSet.add(k));
  rows.forEach(r => Object.keys(r).forEach(k => colSet.add(k)));
  const cols = Array.from(colSet);

  let html = `
    <div class="final-table-scroll">
      <div style="font-weight:600; margin-bottom:8px;">${title}</div>
      <table class="final-preview-table">
        <thead><tr>
          ${cols.map(c => `<th>${c}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              ${cols.map(c => `<td>${(r[c] ?? '')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  el.innerHTML = html;
}





