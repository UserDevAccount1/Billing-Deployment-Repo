// ════════════════════════════════════════════════════════════════════════════
// TICKET MATCHING MATRIX - COMPLETE CONTROLLER 
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
window.VALIDATION_RESULTS = [];
window.VALIDATION_DATA_MAP = {};
window.CURRENT_VALIDATION_ROW = null;

// VISUAL STORE: What is currently displayed in the DOM inputs
const DATA_STORE = {
  ticket_data: {}, rate_card: {}, dispatch: {}, standby: {},
  dedicated: {}, sv_visit: {}, project: {}, final_ticket: {}
};

// SCHEMA: Defines which fields belong to which table
const TABLE_SCHEMAS = {
  ticket_data: [
    'request_id', 'ticket_number', 'requester', 'source_of_request', 'subject', 'customer',
    'account', 'region', 'country', 'city', 'site_name', 'address', 'postal_code',
    'contact_name', 'contact_phone', 'contact_email', 'priority', 'status',
    'created_date', 'scheduled_date', 'completed_date', 'sla_due_date',
    'service_type', 'problem_description', 'resolution', 'notes'
  ],
  rate_card: [
    'customer', 'ticket_number', 'account', 'region', 'country', 'service_type',
    'rate_type', 'base_rate', 'hourly_rate', 'overtime_rate', 'weekend_rate',
    'holiday_rate', 'travel_rate', 'per_diem', 'currency', 'effective_date', 'expiry_date'
  ],
  dispatch: [
    'ticket_number', 'account', 'customer', 'request_id', 'vendor_po', 'dispatch_id',
    'site_name', 'region', 'country', 'city', 'address', 'postal_code',
    'technician_name', 'technician_id', 'technician_in_date',
    'dispatch_date', 'arrival_time', 'departure_time', 'scheduled_date',
    'travel_time', 'onsite_time', 'total_hours',
    'first_hour_qty', 'first_hour_rate', 'first_hour_cost',
    'after_hours_qty', 'after_hours_rate', 'after_hours_cost',
    'ot_hours', 'ot_rate', 'ot_cost',
    'out_of_office_hours', 'out_of_office_rate', 'out_of_office_cost',
    'weekend_ot_hours', 'weekend_rate', 'weekend_cost',
    'travel_extra_cost', 'total_cost',
    'tax_percent', 'tax_cost', 'total_cost_inc_tax',
    'currency', 'sla_met', 'sla_reason', 'csr_report', 'service_month', 'status', 'notes'
  ],
  standby: [
    'ticket_number', 'account', 'customer', 'vendor_po', 'standby_id',
    'site_name', 'region', 'country', 'city', 'address', 'postal_code',
    'technician_name', 'technician_id', 'standby_date', 'start_time', 'end_time',
    'site_support', 'standby_monthly_cost',
    'total_hours', 'rate', 'total_cost',
    'tax_percent', 'tax_cost', 'total_cost_inc_tax',
    'currency', 'service_month', 'status', 'notes'
  ],
  dedicated: [
    'ticket_number', 'dedicated_id', 'customer', 'account', 'vendor_po',
    'site_name', 'region', 'country', 'city', 'address', 'postal_code',
    'technician_name', 'technician_id', 'band', 'variant',
    'start_date', 'end_date', 'service_month',
    'working_days', 'worked_days', 'monthly_rate', 'actual_cost',
    'ot_hours', 'ot_rate', 'ot_cost',
    'weekend_ot_hours', 'weekend_rate', 'weekend_cost',
    'travel_extra_cost', 'tax_percent', 'tax_cost', 'total_cost',
    'currency', 'sla_percentage', 'sla_met', 'sla_reason', 'attendance_approved',
    'status', 'notes'
  ],
  sv_visit: [
    'ticket_number', 'account', 'customer', 'request_id', 'vendor_po', 'sv_id',
    'site_name', 'region', 'country', 'city', 'address', 'postal_code',
    'technician_name', 'technician_id', 'technician_in_date',
    'visit_date', 'visit_type', 'category_visit',
    'arrival_time', 'departure_time', 'scheduled_date',
    'total_hours', 'half_day_rate', 'full_day_rate', 'per_hour_rate', 'weekend_rate',
    'out_of_office_hours', 'out_of_office_rate', 'out_of_office_cost',
    'travel_extra_cost', 'rate', 'total_cost',
    'tax_percent', 'tax_cost', 'total_cost_inc_tax',
    'currency', 'sla_met', 'sla_reason', 'service_month', 'status', 'notes'
  ],
  project: [
    'project_id', 'ticket_number', 'project_name', 'customer', 'account', 'vendor_po',
    'region', 'country', 'city', 'address', 'postal_code',
    'start_date', 'end_date', 'service_month',
    'technician_name', 'band', 'variant',
    'working_days', 'worked_days', 'monthly_rate',
    'ot_hours', 'ot_rate', 'ot_cost',
    'weekend_ot_hours', 'weekend_rate', 'weekend_cost',
    'travel_extra_cost', 'tax_percent', 'tax_cost', 'total_cost',
    'budget', 'actual_cost', 'status', 'project_manager', 'team_size',
    'sla_percentage', 'sla_met', 'sla_reason', 'attendance_approved', 'notes'
  ],
  final_ticket: [
    'request_id', 'ticket_number', 'customer_reference', 'requester', 'subject',
    'site_name', 'priority', 'technician_name', 'status', 'worklog_type',
    'completed_date', 'account', 'region', 'country', 'city', 'contact_email',
    'band', 'total_hours', 'hourly_rate', 'revenue', 'currency',
    'labor_cost', 'profit', 'margin', 'vendor_po', 'pre_visit', 'post_visit', 'notes'
  ]
};

const TABLE_NAMES = {
  ticket_data: 'Ticket Data', rate_card: 'Rate Card', dispatch: 'Dispatch',
  standby: 'Standby', dedicated: 'Dedicated', sv_visit: 'SV Visit',
  project: 'Project', final_ticket: 'Final Ticket'
};

const FIELD_DEFINITIONS = {
  // --- Basic Info ---
  request_id: { label: 'Request ID', type: 'TEXT', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'sv_visit', 'final_ticket'] },
  ticket_number: { label: 'Ticket Number', type: 'TEXT', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'rate_card', 'project', 'sv_visit', 'final_ticket'] },
  requester: { label: 'Requester', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'final_ticket'] },
  source_of_request: { label: 'Source of Request', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  subject: { label: 'Subject', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'sv_visit', 'final_ticket'] },
  customer: { label: 'Customer', type: 'DROPDOWN', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'rate_card', 'project', 'sv_visit', 'final_ticket'] },
  account: { label: 'Account', type: 'DROPDOWN', group: 'BASIC_INFO', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'rate_card', 'project', 'sv_visit', 'final_ticket'] },
  vendor_po: { label: 'Vendor PO', type: 'TEXT', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },

  // --- Geographic ---
  region: { label: 'Region', type: 'DROPDOWN', group: 'GEOGRAPHIC', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'rate_card', 'final_ticket'] },
  country: { label: 'Country', type: 'DROPDOWN', group: 'GEOGRAPHIC', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'rate_card', 'final_ticket'] },
  city: { label: 'City', type: 'TEXT', group: 'GEOGRAPHIC', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
  site_name: { label: 'Site Name', type: 'TEXT', group: 'GEOGRAPHIC', required: false, rag: 'AMBER', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
  address: { label: 'Address', type: 'TEXT', group: 'GEOGRAPHIC', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project'] },
  postal_code: { label: 'Postal Code', type: 'TEXT', group: 'GEOGRAPHIC', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project'] },

  // --- Contacts ---
  contact_name: { label: 'Contact Name', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  contact_phone: { label: 'Contact Phone', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  contact_email: { label: 'Contact Email', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'final_ticket'] },

  // --- Service & Dates ---
  priority: { label: 'Priority', type: 'DROPDOWN', group: 'SERVICE', required: false, rag: 'AMBER', autoPopTo: ['ticket_data', 'dispatch', 'final_ticket'] },
  status: { label: 'Status', type: 'DROPDOWN', group: 'SERVICE', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
  created_date: { label: 'Created Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'sv_visit'] },
  scheduled_date: { label: 'Scheduled Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'AMBER', autoPopTo: ['ticket_data', 'dispatch', 'sv_visit', 'final_ticket'] },
  completed_date: { label: 'Completed Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'final_ticket'] },
  sla_due_date: { label: 'SLA Due Date', type: 'DATE', group: 'QUALITY', required: false, rag: 'AMBER', autoPopTo: ['ticket_data'] },
  service_type: { label: 'Service Type', type: 'DROPDOWN', group: 'SERVICE', required: true, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'rate_card', 'final_ticket'] },
  service_month: { label: 'Service Month', type: 'TEXT', group: 'SYSTEM', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit', 'project'] },
  problem_description: { label: 'Problem Description', type: 'TEXT', group: 'SERVICE', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  resolution: { label: 'Resolution', type: 'TEXT', group: 'SERVICE', required: false, rag: 'GREEN', autoPopTo: ['ticket_data'] },
  notes: { label: 'Notes', type: 'TEXT', group: 'SYSTEM', required: false, rag: 'GREEN', autoPopTo: ['ticket_data', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },

  // --- Technician & Dispatch ---
  technician_name: { label: 'Technician Name', type: 'TEXT', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
  technician_id: { label: 'Technician ID', type: 'TEXT', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit'] },
  dispatch_id: { label: 'Dispatch ID', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  dispatch_date: { label: 'Dispatch Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  technician_in_date: { label: 'Technician IN Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'sv_visit'] },
  arrival_time: { label: 'Arrival Time', type: 'TIME', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'sv_visit'] },
  departure_time: { label: 'Departure Time', type: 'TIME', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'sv_visit'] },
  travel_time: { label: 'Travel Time', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  onsite_time: { label: 'Onsite Time', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  total_hours: { label: 'Total Hours', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'sv_visit', 'final_ticket'] },

  // --- Breakdown of Hours & Rates (Dispatch/Visit) ---
  first_hour_qty: { label: 'First Hour Qty', type: 'NUMBER', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  first_hour_rate: { label: 'First Hour Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  first_hour_cost: { label: 'First Hour Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },

  after_hours_qty: { label: 'After Hours Qty', type: 'NUMBER', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  after_hours_rate: { label: 'After Hours Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  after_hours_cost: { label: 'After Hours Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },

  ot_hours: { label: 'OT Hours', type: 'NUMBER', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'dedicated', 'project'] },
  ot_rate: { label: 'OT Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'dedicated', 'project'] },
  ot_cost: { label: 'OT Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'dedicated', 'project'] },

  out_of_office_hours: { label: 'Out of Office Hours', type: 'NUMBER', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'sv_visit'] },
  out_of_office_rate: { label: 'Out of Office Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'sv_visit'] },
  out_of_office_cost: { label: 'Out of Office Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'sv_visit'] },

  weekend_ot_hours: { label: 'Weekend OT Hours', type: 'NUMBER', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'dedicated', 'project'] },
  weekend_rate: { label: 'Weekend Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['rate_card', 'dispatch', 'dedicated', 'sv_visit', 'project'] },
  weekend_cost: { label: 'Weekend Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['dispatch', 'dedicated', 'project'] },

  travel_extra_cost: { label: 'Travel/Extra Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['dispatch', 'dedicated', 'sv_visit', 'project'] },

  // --- Dedicated / Project Specifics ---
  band: { label: 'Band', type: 'TEXT', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project', 'final_ticket'] },
  variant: { label: 'Variant', type: 'TEXT', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  working_days: { label: 'Number of Working Days', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  worked_days: { label: 'Number of Worked Days', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  monthly_rate: { label: 'Monthly Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  attendance_approved: { label: 'Attendance Approved', type: 'BOOLEAN', group: 'QUALITY', required: false, rag: 'AMBER', autoPopTo: ['dedicated', 'project'] },

  // --- Standby Specifics ---
  standby_id: { label: 'Standby ID', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  standby_date: { label: 'Standby Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  start_time: { label: 'Start Time', type: 'TIME', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  end_time: { label: 'End Time', type: 'TIME', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  site_support: { label: 'Site Support', type: 'TEXT', group: 'SERVICE', required: false, rag: 'GREEN', autoPopTo: ['standby'] },
  standby_monthly_cost: { label: 'Standby Monthly Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['standby'] },

  // --- SV Visit Specifics ---
  sv_id: { label: 'SV ID', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },
  visit_date: { label: 'Visit Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },
  visit_type: { label: 'Visit Type', type: 'DROPDOWN', group: 'SERVICE', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },
  category_visit: { label: 'Visit Category', type: 'TEXT', group: 'SERVICE', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },
  half_day_rate: { label: 'Half Day Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },
  full_day_rate: { label: 'Full Day Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] },

  // --- Financials (Totals & Taxes) ---
  rate: { label: 'Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['standby', 'sv_visit'] },
  total_cost: { label: 'Total Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
  tax_percent: { label: 'Tax %', type: 'PERCENTAGE', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit', 'project'] },
  tax_cost: { label: 'Tax Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit', 'project'] },
  total_cost_inc_tax: { label: 'Total Cost (Inc Tax)', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'standby', 'dedicated', 'sv_visit'] },

  dedicated_id: { label: 'Dedicated ID', type: 'TEXT', group: 'BASIC_INFO', required: false, rag: 'GREEN', autoPopTo: ['dedicated'] },
  start_date: { label: 'Start Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  end_date: { label: 'End Date', type: 'DATE', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  daily_rate: { label: 'Daily Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['dedicated'] },
  total_days: { label: 'Total Days', type: 'NUMBER', group: 'TECHNICIAN', required: false, rag: 'GREEN', autoPopTo: ['dedicated'] },

  project_id: { label: 'Project ID', type: 'TEXT', group: 'PROJECT', required: false, rag: 'GREEN', autoPopTo: ['project'] },
  project_name: { label: 'Project Name', type: 'TEXT', group: 'PROJECT', required: false, rag: 'GREEN', autoPopTo: ['project'] },
  budget: { label: 'Budget', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['project'] },
  actual_cost: { label: 'Actual Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['dedicated', 'project'] },
  project_manager: { label: 'Project Manager', type: 'TEXT', group: 'PROJECT', required: false, rag: 'GREEN', autoPopTo: ['project'] },
  team_size: { label: 'Team Size', type: 'NUMBER', group: 'PROJECT', required: false, rag: 'GREEN', autoPopTo: ['project'] },

  rate_type: { label: 'Rate Type', type: 'DROPDOWN', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  base_rate: { label: 'Base Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  hourly_rate: { label: 'Hourly Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card', 'final_ticket'] },
  overtime_rate: { label: 'Overtime Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['rate_card'] },
  holiday_rate: { label: 'Holiday Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['rate_card'] },
  travel_rate: { label: 'Travel Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  per_diem: { label: 'Per Diem', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  currency: { label: 'Currency', type: 'DROPDOWN', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['rate_card', 'dispatch', 'standby', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
  effective_date: { label: 'Effective Date', type: 'DATE', group: 'SYSTEM', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  expiry_date: { label: 'Expiry Date', type: 'DATE', group: 'SYSTEM', required: false, rag: 'GREEN', autoPopTo: ['rate_card'] },
  labor_cost: { label: 'Labor Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  travel_cost: { label: 'Travel Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  parts_cost: { label: 'Parts Cost', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  revenue: { label: 'Revenue', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  profit: { label: 'Profit', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  margin: { label: 'Margin', type: 'PERCENTAGE', group: 'FINANCIAL', required: false, rag: 'AMBER', autoPopTo: ['final_ticket'] },
  sla_met: { label: 'SLA Met', type: 'BOOLEAN', group: 'QUALITY', required: false, rag: 'GREEN', autoPopTo: ['dispatch', 'dedicated', 'sv_visit', 'project', 'final_ticket'] },
  sla_reason: { label: 'SLA Failure Reason', type: 'TEXT', group: 'QUALITY', required: false, rag: 'AMBER', autoPopTo: ['dispatch', 'dedicated', 'sv_visit', 'project'] },
  sla_percentage: { label: 'SLA %', type: 'PERCENTAGE', group: 'QUALITY', required: false, rag: 'GREEN', autoPopTo: ['dedicated', 'project'] },
  csr_report: { label: 'CSR Report Submitted', type: 'BOOLEAN', group: 'QUALITY', required: false, rag: 'GREEN', autoPopTo: ['dispatch'] },
  per_hour_rate: { label: 'Per Hour Rate', type: 'CURRENCY', group: 'FINANCIAL', required: false, rag: 'GREEN', autoPopTo: ['sv_visit'] }
};

const FIELD_SYNONYMS = {
  request_id: ["Request ID", "Req ID", "Ticket Ref", "Case ID", "Partner Ticket Number"],
  ticket_number: ["Ticket Number", "Ticket #", "Inc Number", "Incident ID", "Customer Ticket Number"],
  status: ["Request Status", "Status", "State", "Current Status"],
  worklog_type: ["Worklog Type"],
  priority: ["Priority", "Severity", "SLA Level", "Ticket Priority"],
  city: ["CITY OR TOWN", "City", "Town"],
  region: ["REGION OF THE COUNTRY", "Region", "Area", "State", "States"],
  country: ["Country", "Nation", "Location"],
  site_name: ["Site", "Site Name", "Facility", "Site Category"],
  address: ["Address", "Site Address"],
  postal_code: ["Postal Code", "Zip", "Zip code", "Zip Code"],
  requester: ["Requester", "Created By", "Source of Request"],
  technician_name: ["FIELD ENGINEERS RESOLVER", "Technician", "Engineer", "Resolver", "Technician Name", "Assigned Technician", "Field Engineer Resolver", "Technician name"],
  contact_email: ["Engineer details", "Contact Email", "Engineer Details"],
  customer_reference: ["Customer Reference", "CUSTOMER REFERENCE"],
  subject: ["Subject", "Short Description", "Summary", "Activity Details"],
  service_type: ["Service Type", "Dispatch Category"],
  currency: ["Currency", "Currency ", "currency", "currency-cost"],
  vendor_po: ["Vendor PO", "PO number", "External PO NUMBER", "PO Number"],
  pre_visit: ["PRE Visit"],
  post_visit: ["POST Visit"],
  hourly_rate: ["Rate for NBD Per Hour", "Rate for SBD Per Hour", "Hourly Rate", "Revenue rate", "1st Hour Revenue Rate", "Revenue Rate"],
  total_hours: ["Total Hours in Hours", "Total Hours", "Time Spent (Hours)"],
  total_cost: ["Total Amount", "Billing as per PO", "Amount on PO", "Total Cost"],
  // Separated tax inclusive cost as requested
  total_cost_inc_tax: ["Total Cost including Tax"],
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
  account: ["Account", "Partner Name"],

  // --- New Synonyms based on provided headers ---
  technician_in_date: ["Technician IN Date (MM/DD/YYYY)"],
  first_hour_qty: ["First Hour"],
  first_hour_rate: ["First Hour rate"],
  first_hour_cost: ["First Hour cost"],
  after_hours_qty: ["Hours worked after First Hour"],
  after_hours_rate: ["After First Hours rate"],
  after_hours_cost: ["After First Hour cost"],
  ot_hours: ["OT Hours"],
  ot_rate: ["OT Hours rate", "OT per Hour Rate"],
  ot_cost: ["OT Hours Cost", "OT Hours cost"],
  out_of_office_hours: ["Out of office Hours"],
  out_of_office_rate: ["Out of Office Hours Rate"],
  out_of_office_cost: ["Out of office Hours Cost"],
  weekend_ot_hours: ["Weekened OT Hours"],
  weekend_rate: ["Weekend Rates", "Weekend Rate (if applicable)", "Weekend Rate"],
  weekend_cost: ["Weekend Cost"],
  travel_extra_cost: ["Travel/extra cost if applicable as per contract"],
  tax_percent: ["Tax %"],
  tax_cost: ["Tax cost"],
  sla_met: ["SLA Met"],
  sla_reason: ["Reason for SLA not met(if applicable)"],
  csr_report: ["CSR Report submitted"],
  service_month: ["Service Month (MM/YYYY)"],
  site_support: ["Site support"],
  standby_monthly_cost: ["Stand by Monthly cost"],
  band: ["Band", "Band Type"],
  variant: ["Variant"],
  working_days: ["Number of working days"],
  worked_days: ["Number of worked days"],
  monthly_rate: ["Monthly rate"],
  actual_cost: ["Actual Cost"],
  sla_percentage: ["SLA %"],
  attendance_approved: ["Attendence approved by Delivery"],
  category_visit: ["Category (Half day/Full Day/Per Hour)"],
  half_day_rate: ["Half Day Rate"],
  full_day_rate: ["Full Date Rate"],
  per_hour_rate: ["Per Hour rate"],
  project_name: ["Project Name"],
  start_date: ["Project Start Date (MM/DD/YYYY)"],
  end_date: ["Project End Date (MM/DD/YYYY)"]
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
  initColumnVisibility();
  initSaveButton();
  updateStatistics();
  updateFinalTablePreview();
  initRecordValidationButton();
  initBandPreviewListeners();
  initValidationViewToggles();
  initValidationPaginationListeners();

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

  const validateBtn = document.getElementById('validateFilesBtn');
  if (validateBtn) {
    validateBtn.addEventListener('click', function () {
      window.showToast("Running Validation...", "info");
      runFinalTicketValidation();
    });
  }
});

function initMatrix() {
  renderMatrixHeader();
  renderMatrixBody();
}

function initValidationViewToggles() {
  const tableBtn = document.getElementById('tableViewBtn');
  const cardBtn = document.getElementById('formViewBtn');
  const tableView = document.getElementById('validationTableView');
  const cardView = document.getElementById('validationCardView');

  if (tableBtn && cardBtn) {
    tableBtn.addEventListener('click', () => {
      // Update Buttons
      tableBtn.classList.add('active');
      cardBtn.classList.remove('active');

      // Update Views
      tableView.style.display = 'block';
      cardView.style.display = 'none';
    });

    cardBtn.addEventListener('click', () => {
      // Update Buttons
      cardBtn.classList.add('active');
      tableBtn.classList.remove('active');

      // Update Views
      tableView.style.display = 'none';
      cardView.style.display = 'block';
    });
  }
}
function initRecordValidationButton() {
  const btn = document.getElementById('saveRecordBtn'); // The green "Save Record" button
  if (!btn) return;

  btn.addEventListener('click', function () {
    // 1. Check if we have data
    if (!window.MASTER_DATA || window.MASTER_DATA.length === 0) {
      showToast("No records available to save.", "error");
      return;
    }

    // 2. Get Context IDs from DOM
    const customerSelect = document.getElementById('tmm_customerSelect');
    const accountSelect = document.getElementById('tmm_accountSelect');

    const customerId = (customerSelect && customerSelect.value !== 'all') ? parseInt(customerSelect.value) : null;
    const accountId = (accountSelect && accountSelect.value !== 'all') ? parseInt(accountSelect.value) : null;

    if (!customerId) {
      showToast('Error: Please select a specific Customer before saving.', 'error');
      return;
    }

    // 3. Force Validation Run (Ensure Sync)
    runFinalTicketValidation();

    // 4. Construct Payload for API
    const payload = window.VALIDATION_RESULTS.map(res => {
      const record = window.MASTER_DATA[res.rowIndex];

      // Prepare the Data Table JSON (Actual data + Validation Metadata)
      const jsonStorage = {
        ...record,
        _meta: {
          row_index: res.rowIndex,
          validation_status: res.status,
          missing_fields: res.missing
        }
      };

      return {
        customer: customerId,
        account: accountId, // Can be null
        ticket_number: record.ticket_number || "UNKNOWN",
        request_id: record.request_id || "UNKNOWN",
        data_table: jsonStorage,

        // --- NEW: Attach Initial Ticket UUID ---
        // This comes from the Step 1 execution. 
        // If viewRulesBtn wasn't clicked, this will be null.
        initial_ticket_uuid: record._initial_uuid || null
      };
    });

    console.group("💾 SAVING FINAL TICKETS");
    console.log(`Payload (${payload.length} records):`, payload);

    // 5. Send to API
    const csrftoken = getCookie('csrftoken');
    const btnOriginalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    fetch('/billing/api/final-ticket/batch/', {
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
        showToast(`Successfully saved ${payload.length} validated records!`, 'success');

        // Visual Success Feedback
        btn.innerHTML = '<i class="fas fa-check"></i> Saved';
        setTimeout(() => {
          btn.innerHTML = btnOriginalText;
          btn.disabled = false;
        }, 2000);
      })
      .catch(error => {
        console.error("Save Error:", error);
        showToast(`Save Failed: ${error.message}`, 'error');
        btn.innerHTML = btnOriginalText;
        btn.disabled = false;
      })
      .finally(() => {
        console.groupEnd();
      });
  });
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

  if (ext === 'csv') {
    parseCSV(file);
  } else if (['xls', 'xlsx'].includes(ext)) {
    parseExcel(file);
  } else if (ext === 'pdf') {
    parsePDF(file);
  } else {
    window.showToast("Invalid format. Supported: CSV, Excel, PDF", "error");
  }
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
      const currentTable = document.getElementById('tmm_categorySelect');
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const sheetNames = workbook.SheetNames;
      const sheetMap = {
        "dispatch": "Dispatch",
        "standby": "Dispatch Stand by Charges",
        "dedicated": "Dedicated",
        "sv": "SV,Full & Half day Visit",
        "project": "Project work"
      };
      const selectedValue = currentTable.value;
      const sheetNameToUse = sheetMap[selectedValue] && sheetNames.includes(sheetMap[selectedValue])
        ? sheetMap[selectedValue]
        : sheetNames[0];
      const sheet = workbook.Sheets[sheetNameToUse];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      initializeImportData(jsonData);
    } catch (error) {
      window.showToast(`Error parsing Excel`, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

/**
 * ROBUST NORMALIZER
 * 1. Maps Dropdown Value to Actual Schema Key.
 * 2. Matches headers case-insensitively against Synonyms.
 * 3. Appends new fields ONLY IF 'append' mode is selected.
 */
function normalizeBatch(rawData) {
  const contextCustomer = document.getElementById('tmm_customerSelect')?.selectedOptions[0]?.text || "";
  const contextAccount = document.getElementById('tmm_accountSelect')?.selectedOptions[0]?.text || "";
  const isImportAll = contextCustomer.toLowerCase().includes("all");

  // Get the raw dropdown value
  const dropdown = document.getElementById('tmm_categorySelect');
  const rawValue = dropdown ? dropdown.value : null;

  // Check the Import Mode (Smart vs Append)
  const importModeEl = document.getElementById('tmm_importMode');
  const isAppendMode = importModeEl && importModeEl.value === 'append';

  // Create a Map to translate HTML Value -> Schema Key
  const schemaMap = {
    'ticket': 'ticket_data',
    'rate': 'rate_card',
    'dispatch': 'dispatch',
    'standby': 'standby',
    'dedicated': 'dedicated',
    'sv': 'sv_visit',
    'project': 'project',
    'final': 'final_ticket',
    'all': 'all'
  };

  // Get the correct key used in TABLE_SCHEMAS
  const selectedSchemaKey = schemaMap[rawValue] || rawValue;

  // Determine which tables should receive the new columns
  let targetTables = [];

  if (selectedSchemaKey === 'all') {
    targetTables = Object.keys(TABLE_SCHEMAS);
  } else if (selectedSchemaKey && TABLE_SCHEMAS[selectedSchemaKey]) {
    targetTables = [selectedSchemaKey];
  }

  console.log(`[Normalizer] Mode: ${isAppendMode ? 'APPEND' : 'SMART (Strict)'}`);

  return rawData.map(raw => {
    let normalized = {};

    // 1. Context
    if (!isImportAll) {
      normalized['customer'] = contextCustomer;
      normalized['account'] = contextAccount;
    }

    // 2. Iterate over EVERY column in the uploaded file
    Object.keys(raw).forEach(fileHeader => {
      const cleanHeader = String(fileHeader).trim();
      const cleanHeaderLower = cleanHeader.toLowerCase();
      const val = String(raw[fileHeader]).trim();

      // Skip garbage columns
      if (!cleanHeader || cleanHeader.startsWith('__EMPTY') || val === "") return;

      let matchedSystemField = null;

      // --- A. CHECK FOR SYNONYM MATCH (Case Insensitive) ---
      for (const [sysField, synonyms] of Object.entries(FIELD_SYNONYMS)) {
        if (sysField.toLowerCase() === cleanHeaderLower) {
          matchedSystemField = sysField;
          break;
        }
        if (synonyms.some(s => s.toLowerCase() === cleanHeaderLower)) {
          matchedSystemField = sysField;
          break;
        }
      }

      if (matchedSystemField) {
        // MAPPED: Standardize data
        let cleanVal = val;
        if (matchedSystemField === 'technician_name') cleanVal = cleanVal.replace(/[\r\n]+/g, ", ");
        normalized[matchedSystemField] = cleanVal;
      }
      else {
        // --- B. APPEND MODE CHECK ---
        // If we are NOT in append mode, ignore this unknown column entirely.
        if (!isAppendMode) {
          return;
        }

        // --- C. APPEND MODE (New Field Logic) ---
        // Create a safe ID
        const dynamicId = cleanHeaderLower.replace(/[^a-z0-9]/g, '_');

        // 1. Create Field Definition if missing
        if (!FIELD_DEFINITIONS[dynamicId]) {
          FIELD_DEFINITIONS[dynamicId] = {
            label: cleanHeader,
            type: 'TEXT',
            group: 'IMPORTED',
            rag: 'GREY',
            required: false,
            // Auto-populate to all targeted tables
            autoPopTo: [...targetTables]
          };
        } else {
          // Update existing definition to include these tables in autoPop if not present
          targetTables.forEach(tbl => {
            if (FIELD_DEFINITIONS[dynamicId].autoPopTo && !FIELD_DEFINITIONS[dynamicId].autoPopTo.includes(tbl)) {
              FIELD_DEFINITIONS[dynamicId].autoPopTo.push(tbl);
            }
          });
        }

        // Update the Table Schemas explicitly using the Mapped Key
        targetTables.forEach(tbl => {
          if (TABLE_SCHEMAS[tbl] && !TABLE_SCHEMAS[tbl].includes(dynamicId)) {
            TABLE_SCHEMAS[tbl].push(dynamicId);
            console.log(`[Schema Update] Added ${dynamicId} to ${tbl}`);
          }
        });

        // 2. Map the Data
        normalized[dynamicId] = val;
      }
    });

    // 3. Fill defaults for missing standard fields
    Object.keys(FIELD_DEFINITIONS).forEach(field => {
      if (normalized[field] === undefined) normalized[field] = "";
    });

    return normalized;
  });
}

// ──── 4. IMPORT LOGIC & OVERWRITE ANALYZER ────

function initializeImportData(rawArray) {
  const newNormalizedData = normalizeBatch(rawArray);

  // 1. VALIDATION PATH
  if (window.IS_VALIDATION_MODE) {
    window.showToast("Generating Validation Report...", "info");
    runValidationAnalysis(window.MASTER_DATA, newNormalizedData);
    window.IS_VALIDATION_MODE = false; // Reset flag immediately
    return;
  }

  // 2. STANDARD IMPORT PATH (Existing Logic)
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
  const valBtn = document.getElementById('validateFilesBtn');
  if (valBtn) valBtn.disabled = false;
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
          if (TABLE_SCHEMAS[tbl].includes(field)) tables.push(TABLE_NAMES[tbl]);
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
      rowId: currentRow.ticket_number || `Row ${i + 1}`,
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
  if (existing) existing.remove();

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
  if (DIFF_PAGE < 1) DIFF_PAGE = 1;
  if (DIFF_PAGE > max) DIFF_PAGE = max;
  renderDiffPage();
}

function closeDiffModal() {
  document.getElementById('tmmDiffModal').remove();
  window.PENDING_DATA = [];
}

function confirmOverwrite() {
  for (let i = 0; i < window.PENDING_DATA.length; i++) {
    if (i < window.MASTER_DATA.length) {
      window.MASTER_DATA[i] = window.PENDING_DATA[i];
    }
  }
  window.showToast("Data Overwritten Successfully", "success");
  closeDiffModal();
  loadRecord(window.currentImportIndex);
}

function loadRecord(index) {
  if (!window.MASTER_DATA || window.MASTER_DATA.length === 0) return;

  if (index < 0) index = 0;
  if (index >= window.MASTER_DATA.length) index = window.MASTER_DATA.length - 1;
  window.currentImportIndex = index;

  const record = window.MASTER_DATA[index];

  // ════════════════════════════════════════════════════════════════
  // NEW: 3-STEP PRIORITY MATCHING LOGIC
  // ════════════════════════════════════════════════════════════════
  window.CURRENT_VALIDATION_ROW = null;

  // 1. Get Clean Keys from the SYSTEM record
  const sysTicket = getCleanKey(record.ticket_number);
  const sysReq = getCleanKey(record.request_id);
  const sysPo = getCleanKey(record.vendor_po);

  // 2. Priority 1: TICKET NUMBER
  if (sysTicket && window.VAL_BY_TICKET && window.VAL_BY_TICKET[sysTicket]) {
    window.CURRENT_VALIDATION_ROW = window.VAL_BY_TICKET[sysTicket];
    // console.log(`Matched by Ticket: ${sysTicket}`);
  }
  // 3. Priority 2: REQUEST ID (Only if Ticket failed)
  else if (sysReq && window.VAL_BY_REQ && window.VAL_BY_REQ[sysReq]) {
    window.CURRENT_VALIDATION_ROW = window.VAL_BY_REQ[sysReq];
    // console.log(`Matched by Request ID: ${sysReq}`);
  }
  // 4. Priority 3: VENDOR PO (Only if Ticket AND Req failed)
  else if (sysPo && window.VAL_BY_PO && window.VAL_BY_PO[sysPo]) {
    window.CURRENT_VALIDATION_ROW = window.VAL_BY_PO[sysPo];
    // console.log(`Matched by Vendor PO: ${sysPo}`);
  }
  // ════════════════════════════════════════════════════════════════

  STATE.smartAddCount = 0;
  STATE.autoPopulatedCount = 0;

  // Reset Visual Stores
  Object.keys(DATA_STORE).forEach(key => DATA_STORE[key] = {});

  // Populate Visual Stores
  Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
    const fieldsInTable = TABLE_SCHEMAS[tableKey];
    fieldsInTable.forEach(field => {
      if (record[field] !== undefined) {
        DATA_STORE[tableKey][field] = record[field];
      }
    });
  });

  // Smart Add logic
  Object.keys(FIELD_DEFINITIONS).forEach(field => {
    const val = record[field];
    if (val) smartAddToOtherTables(field, val);
  });

  document.getElementById('currentRecordDisplay').innerText = `${index + 1} / ${window.MASTER_DATA.length}`;

  renderMatrixBody();

  if (typeof window.applyFilters === 'function') window.applyFilters();
  if (typeof window.applyColumnVisibility === 'function') window.applyColumnVisibility();

  const searchVal = document.getElementById('searchInput')?.value;
  if (searchVal && typeof performSearchHighlight === 'function') performSearchHighlight(searchVal);

  updateStatistics();
  updateFinalTablePreview();
}

function handleCellChange(tableKey, field, value) {
  DATA_STORE[tableKey][field] = value;

  // Update Master Data
  if (window.MASTER_DATA[window.currentImportIndex]) {
    window.MASTER_DATA[window.currentImportIndex][field] = value;
  }
  if (field === 'band') {
    updateBandTablePreview();
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

  const displayMode = document.getElementById('displayMode')?.value || 'FLAT';

  // 1. Get all unique fields
  const allFields = Array.from(new Set([
    ...Object.values(TABLE_SCHEMAS).flat(),
    ...Object.keys(FIELD_DEFINITIONS)
  ])).sort();

  let html = '';

  // --- HELPER: Generate HTML for a single row ---
  const generateRowHtml = (field) => {
    const def = FIELD_DEFINITIONS[field] || { label: field, type: 'TEXT', group: 'SYSTEM', rag: 'RED' };

    let row = `<tr class="matrix-row" data-field="${field}" data-group="${def.group}" data-type="${def.type}" data-rag="${def.rag}">
      <td class="field-cell">
        <span class="field-name">${def.label || field}</span>
        <span class="field-meta">${def.type || ''} | ${def.group || ''}</span>
        ${def.required ? '<span class="required-badge">Required</span>' : ''}
        <span class="rag-indicator rag-${(def.rag || '').toLowerCase()}">●</span>
      </td>`;

    // Render cells for each table column
    Object.keys(TABLE_SCHEMAS).forEach(tableKey => {
      const exists = TABLE_SCHEMAS[tableKey].includes(field);
      const value = DATA_STORE[tableKey][field] || '';

      if (STATE.matrixMode === 'structural') {
        row += `<td class="matrix-cell ${exists ? 'exists' : 'not-exists'}" data-table="${tableKey}" data-field="${field}">
                  ${exists ? '<i class="fas fa-check"></i>' : ''}
                </td>`;
      } else {
        let validationClass = '';
        let titleAttr = ''; // For tooltip

        if (exists && window.CURRENT_VALIDATION_ROW) {
          const validVal = String(window.CURRENT_VALIDATION_ROW[field] || "").trim();
          const currentVal = String(value || "").trim();

          if (validVal !== "") {
            if (currentVal === validVal) {
              validationClass = 'val-match'; // GREEN
            } else {
              validationClass = 'val-mismatch'; // RED
              titleAttr = `title="Validation File says: ${validVal}"`;
            }
          }
        }

        row += `<td class="matrix-cell data-cell ${exists ? '' : 'pending-data'}" data-table="${tableKey}" data-field="${field}">
          <input type="text" 
                 class="cell-input ${validationClass}" 
                 value="${value}" 
                 ${titleAttr}
                 onchange="handleCellChange('${tableKey}', '${field}', this.value)" 
                 placeholder="${exists ? 'Value' : 'Pending'}">
        </td>`;
      }
    });
    row += '</tr>';
    return row;
  };

  // ... (Rest of the renderMatrixBody function logic - grouping etc - remains exactly the same)

  // --- LOGIC A: FLAT / COMPACT / EXPANDED ---
  if (displayMode === 'FLAT' || displayMode === 'COMPACT' || displayMode === 'EXPANDED') {
    allFields.forEach(field => { html += generateRowHtml(field); });
  }
  // --- LOGIC B: GROUPED BY CATEGORY ---
  else if (displayMode === 'GROUPED') {
    const groups = {};
    allFields.forEach(field => {
      const def = FIELD_DEFINITIONS[field] || { group: 'OTHER' };
      const gName = def.group || 'OTHER';
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(field);
    });
    const sortedKeys = Object.keys(groups).sort();
    sortedKeys.forEach(groupName => {
      const colSpan = Object.keys(TABLE_SCHEMAS).length + 1;
      html += `<tr class="group-header-row"><td colspan="${colSpan}">${groupName.replace(/_/g, ' ')}</td></tr>`;
      groups[groupName].forEach(field => { html += generateRowHtml(field); });
    });
  }
  // --- LOGIC C: TABLE WISE ---
  else if (displayMode === 'TABLE_WISE') {
    const tableGroups = {};
    const tableKeys = Object.keys(TABLE_SCHEMAS);
    tableKeys.forEach(k => tableGroups[k] = []);
    tableGroups['OTHER'] = [];
    allFields.forEach(field => {
      const foundTable = tableKeys.find(key => TABLE_SCHEMAS[key].includes(field));
      if (foundTable) tableGroups[foundTable].push(field);
      else tableGroups['OTHER'].push(field);
    });
    [...tableKeys, 'OTHER'].forEach(tblKey => {
      const fields = tableGroups[tblKey];
      if (fields && fields.length > 0) {
        const colSpan = tableKeys.length + 1;
        const displayName = TABLE_NAMES[tblKey] || "Imported / Other";
        html += `<tr class="group-header-row"><td colspan="${colSpan}">${displayName}</td></tr>`;
        fields.forEach(f => html += generateRowHtml(f));
      }
    });
  }

  body.innerHTML = html;
  applyHighlighting();
  if (typeof window.applyFilters === 'function') window.applyFilters();
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
    if (occurences === schemas.length) commonCount++;
    if (occurences === 1) uniqueCount++;
  });

  // 2. Update DOM
  const elTotal = document.getElementById('totalColumns');
  if (elTotal) elTotal.textContent = allFields.length;

  const elCommon = document.getElementById('commonColumns');
  if (elCommon) elCommon.textContent = commonCount;

  const elUnique = document.getElementById('uniqueColumns');
  if (elUnique) elUnique.textContent = uniqueCount;

  const elSmart = document.getElementById('smartAddCount');
  if (elSmart) elSmart.textContent = STATE.smartAddCount;

  const elAuto = document.getElementById('autoPopulated');
  if (elAuto) elAuto.textContent = STATE.autoPopulatedCount;
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
  if (typeof window.applyFilters === 'function') window.applyFilters(); // Re-apply on toggle
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

  saveBtn.addEventListener('click', function () {
    // 1. Basic Checks
    if (!window.MASTER_DATA || window.MASTER_DATA.length === 0) {
      showToast("No data to process.", "error");
      return;
    }

    const customerSelect = document.getElementById('tmm_customerSelect');
    const accountSelect = document.getElementById('tmm_accountSelect');
    const customerId = (customerSelect && customerSelect.value !== 'all') ? parseInt(customerSelect.value) : null;
    const accountId = (accountSelect && accountSelect.value !== 'all') ? parseInt(accountSelect.value) : null;

    if (!customerId) {
      showToast('Error: Please select a specific Customer before uploading Initial Data.', 'error');
      return;
    }

    // 2. Prepare Payload & Sanitize Ticket Numbers
    // We modify MASTER_DATA in place to ensure visual consistency
    const payload = window.MASTER_DATA.map(record => {

      // GENERATE UNIQUE TICKET NUMBER IF MISSING
      let cleanTicketNum = record.ticket_number;
      if (!cleanTicketNum || cleanTicketNum === 'N/A' || cleanTicketNum.trim() === '') {
        // Generate: GEN-{Timestamp}-{Random4Digits}
        cleanTicketNum = `GEN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        record.ticket_number = cleanTicketNum; // Update local state
      }

      // Ensure Request ID exists (fallback to ticket number)
      const cleanRequestId = record.request_id || cleanTicketNum;
      record.request_id = cleanRequestId; // Update local state

      return {
        customer: customerId,
        account: accountId,
        ticket_number: cleanTicketNum,
        request_id: cleanRequestId,
        data_table: record // Store the full raw object
      };
    });

    console.group("🚀 UPLOADING INITIAL DATA");
    console.log(`Sending ${payload.length} records...`);

    // 3. Send to API
    const csrftoken = getCookie('csrftoken'); // Ensure you have this helper function
    const btnOriginalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Initial...';
    saveBtn.disabled = true;

    fetch('/billing/api/initial-ticket/batch/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data.success) {
          showToast(`Initial Data Uploaded! Linked ${data.created_items.length} records.`, "success");

          // 4. MAP UUIDS BACK TO MASTER DATA
          // We assume the API returns items in the same order, or we match by ticket_number
          if (data.created_items && Array.isArray(data.created_items)) {
            data.created_items.forEach((item, index) => {
              // Option A: Map by Index (Fastest if API preserves order)
              if (window.MASTER_DATA[index]) {
                window.MASTER_DATA[index]._initial_uuid = item.uuid;
              }
            });
            console.log("UUIDs linked to Master Data:", window.MASTER_DATA.map(r => r._initial_uuid));
          }

          // Refresh View to show generated ticket numbers if any
          if (window.loadRecord) loadRecord(window.currentImportIndex);

          saveBtn.innerHTML = '<i class="fas fa-check"></i> Initial Linked';
        } else {
          throw new Error(data.message || 'Unknown Error');
        }
      })
      .catch(error => {
        console.error('Initial Upload Error:', error);
        showToast(`Upload Failed: ${error.message}`, 'error');
        saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Retry Initial';
      })
      .finally(() => {
        saveBtn.disabled = false;
        console.groupEnd();

        // Optional: Restore button text after delay
        setTimeout(() => {
          if (saveBtn.innerHTML.includes('Check')) saveBtn.innerHTML = btnOriginalText;
        }, 3000);
      });
  });
}


// ════════════════════════════════════════════════════════════════════════════
// 8. VALIDATION MODE (READ-ONLY COMPARISON)
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// 8.1 PAGINATION LOGIC FOR VALIDATION RESULTS
// ════════════════════════════════════════════════════════════════════════════

let VAL_TABLE_PAGE = 1;
let VAL_ROWS_PER_PAGE = 25; // Default matches your HTML selected option

function initValidationPaginationListeners() {
  const rowsSelect = document.getElementById('rowsPerPage');
  if (rowsSelect) {
    rowsSelect.addEventListener('change', function (e) {
      VAL_ROWS_PER_PAGE = e.target.value === 'all' ? Infinity : parseInt(e.target.value);
      VAL_TABLE_PAGE = 1; // Reset to first page on size change
      renderValidationTableUI();
    });
  }
}

// Global Flag to distinguish between regular Import and Validation Check
window.IS_VALIDATION_MODE = false;
window.VALIDATION_LOG = [];

/**
 * Triggered by the "Import File for Validation" button
 */
function CheckParsingFile() {
  window.IS_VALIDATION_MODE = true;
  const fileInput = document.getElementById('tmm_fileInput');
  if (fileInput) {
    // Reset value to allow selecting the same file again if needed
    fileInput.value = '';
    fileInput.click();
  } else {
    showToast("File input element not found.", "error");
  }
}



/**
 * REPLACED: Indexes the validation file into THREE separate buckets 
 * Priority: Ticket -> Request ID -> Vendor PO
 */
function runValidationAnalysis(currentData, newData) {
  // 1. Reset Maps
  window.VAL_BY_TICKET = {};
  window.VAL_BY_REQ = {};
  window.VAL_BY_PO = {}; // <--- New Map

  let matchCount = 0;

  // 2. Index the Validation Data (Build Lookup Tables)
  newData.forEach(row => {
    // Clean keys from the FILE
    const fileTicket = getCleanKey(row.ticket_number);
    const fileReqId = getCleanKey(row.request_id);
    const filePo = getCleanKey(row.vendor_po); // <--- New Key

    // Index by Ticket Number
    if (fileTicket) {
      window.VAL_BY_TICKET[fileTicket] = row;
    }

    // Index by Request ID
    if (fileReqId) {
      window.VAL_BY_REQ[fileReqId] = row;
    }

    // Index by Vendor PO
    if (filePo) {
      window.VAL_BY_PO[filePo] = row;
    }
  });

  // 3. Verify matches against current system data (For the Toast Notification count)
  currentData.forEach(record => {
    const sysTicket = getCleanKey(record.ticket_number);
    const sysReq = getCleanKey(record.request_id);
    const sysPo = getCleanKey(record.vendor_po);

    // Priority 1: Match by Ticket Number
    if (sysTicket && window.VAL_BY_TICKET[sysTicket]) {
      matchCount++;
    }
    // Priority 2: Match by Request ID
    else if (sysReq && window.VAL_BY_REQ[sysReq]) {
      matchCount++;
    }
    // Priority 3: Match by Vendor PO
    else if (sysPo && window.VAL_BY_PO[sysPo]) {
      matchCount++;
    }
  });

  // 4. Feedback
  if (matchCount > 0) {
    window.showToast(`Validation Data Loaded. Linked ${matchCount} records.`, "success");
    // Reload current record to trigger highlighting immediately
    loadRecord(window.currentImportIndex);
  } else {
    window.showToast("Warning: No matching Ticket, Request ID, or Vendor PO found.", "warning");
  }
}

/**
 * Renders the Read-Only Validation Modal
 */
let VAL_PAGE = 1;
const VAL_PER_PAGE = 20;

function renderValidationModal() {
  const existing = document.getElementById('tmmValidationModal');
  if (existing) existing.remove();

  const count = window.VALIDATION_LOG.length;

  const html = `
    <div id="tmmValidationModal" class="tmm-modal-overlay">
        <div class="tmm-modal-container" style="border-top: 5px solid #17a2b8;">
            <div class="tmm-modal-header">
                <div>
                    <h3 style="margin:0; color:#17a2b8;"><i class="fas fa-clipboard-check"></i> Validation Report</h3>
                    <small>Comparing File against Current System Data (Read Only)</small>
                </div>
                <span class="badge" style="background:#17a2b8; color:#fff;">${count} Discrepancies Found</span>
            </div>
            
            <div class="tmm-modal-body" id="valTableContainer"></div>

            <div class="tmm-modal-footer">
                <div>
                    <button class="btn btn-sm" onclick="changeValPage(-1)">Previous</button>
                    <span id="valPageDisplay" style="margin:0 15px; font-weight:bold;">Page 1</span>
                    <button class="btn btn-sm" onclick="changeValPage(1)">Next</button>
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="document.getElementById('tmmValidationModal').remove()">Close Report</button>
                </div>
            </div>
        </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  VAL_PAGE = 1;
  renderValPage();
}

function getCleanKey(val) {
  if (val === undefined || val === null) return "";
  return String(val).trim().toLowerCase();
}

function renderValPage() {
  const container = document.getElementById('valTableContainer');
  const start = (VAL_PAGE - 1) * VAL_PER_PAGE;
  const end = start + VAL_PER_PAGE;
  const slice = window.VALIDATION_LOG.slice(start, end);

  let html = `<table class="tmm-diff-table">
        <thead>
            <tr>
                <th class="diff-meta-col">Row / ID</th>
                <th class="diff-changes-col">Discrepancy Details</th>
            </tr>
        </thead>
        <tbody>`;

  slice.forEach(row => {
    let detailsHtml = row.issues.map(issue => {
      if (issue.type === 'NEW_RECORD' || issue.type === 'MISSING_RECORD') {
        return `<div style="padding:5px; background:#f8f9fa; border:1px solid #ddd; border-radius:4px; font-weight:bold; color:#d9534f;">${issue.msg}</div>`;
      }

      // Color coding based on issue type
      let badgeColor = '#6c757d'; // Mismatch (Grey)
      if (issue.type === 'MISSING_IN_FILE') badgeColor = '#dc3545'; // Red (Warning)
      if (issue.type === 'NEW_IN_FILE') badgeColor = '#28a745'; // Green (Info)

      return `
                <div class="diff-change-box" style="border-left: 3px solid ${badgeColor};">
                    <span class="diff-field-label">${FIELD_DEFINITIONS[issue.field]?.label || issue.field}</span>
                    <div style="font-size:11px; margin-bottom:3px; color:${badgeColor}; font-weight:700;">${issue.type.replace(/_/g, ' ')}</div>
                    <div>
                        <span style="color:#dc3545; text-decoration:none; display:block; font-size:0.9em;">
                            <i class="fas fa-database"></i> Sys: ${issue.current || "<em>(empty)</em>"}
                        </span>
                        <span style="color:#28a745; font-weight:700; display:block; font-size:0.9em;">
                            <i class="fas fa-file-excel"></i> File: ${issue.new || "<em>(empty)</em>"}
                        </span>
                    </div>
                </div>
            `;
    }).join('');

    html += `<tr>
            <td class="diff-meta-col">
                <div class="diff-record-id">${row.rowId}</div>
                <small style="color:#666">Index: ${row.index + 1}</small>
            </td>
            <td class="diff-changes-col">${detailsHtml}</td>
        </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;

  const max = Math.ceil(window.VALIDATION_LOG.length / VAL_PER_PAGE) || 1;
  document.getElementById('valPageDisplay').innerText = `Page ${VAL_PAGE} of ${max}`;
}

function changeValPage(dir) {
  const max = Math.ceil(window.VALIDATION_LOG.length / VAL_PER_PAGE) || 1;
  VAL_PAGE += dir;
  if (VAL_PAGE < 1) VAL_PAGE = 1;
  if (VAL_PAGE > max) VAL_PAGE = max;
  renderValPage();
}

function toggleSmartAdd() {
  STATE.smartAddEnabled = !STATE.smartAddEnabled;
  const btn = document.getElementById('smartAddStatus');
  btn.innerText = STATE.smartAddEnabled ? "ACTIVE" : "NOT ACTIVE";
}
function runFinalTicketValidation() {
  // 1. Reset Global Object and Counters
  window.VALIDATION_RESULTS = [];
  let validCount = 0;
  let errorCount = 0;

  const finalTicketFields = TABLE_SCHEMAS['final_ticket'];

  // --- ITERATE DATA & CALCULATE STATUS ---
  window.MASTER_DATA.forEach((record, index) => {
    let status = 'SUCCESS';
    let missingFields = [];

    finalTicketFields.forEach(fieldKey => {
      const fieldConfig = FIELD_DEFINITIONS[fieldKey];
      const value = record[fieldKey] || '';

      // Check Required
      if (fieldConfig && fieldConfig.required) {
        if (value === undefined || value === null || String(value).trim() === '') {
          status = 'ERROR';
          missingFields.push(fieldConfig.label || fieldKey);
        }
      }
    });

    // Update Counters
    if (status === 'SUCCESS') validCount++;
    else errorCount++;

    // Store result
    window.VALIDATION_RESULTS.push({
      rowIndex: index,
      ticketNumber: record.ticket_number,
      status: status,
      missing: missingFields,
      data: record // Reference to original data for Card View
    });
  });

  // --- UPDATE DASHBOARD COUNTERS ---
  if (document.getElementById('validCount')) document.getElementById('validCount').innerText = validCount;
  if (document.getElementById('errorCount')) document.getElementById('errorCount').innerText = errorCount;
  if (document.getElementById('totalCount')) document.getElementById('totalCount').innerText = window.MASTER_DATA.length;

  // --- RENDER UI ---
  renderValidationTableUI();

  console.log("Validation Analysis Complete. UI Rendered.");
}
// Helper for Card View (Same as before)
function generateValidationCard(valObj) {
  let borderClass = 'border-success';
  let icon = '<i class="fas fa-check-circle" style="color:#28a745"></i>';
  let statusText = '';

  if (valObj.status === 'ERROR') {
    borderClass = 'border-danger';
    icon = '<i class="fas fa-times-circle" style="color:#dc3545"></i>';
    statusText = `<div style="margin-top:8px; color:#dc3545; font-size:0.9em; background:#faeaea; padding:5px;">
                        <strong>Missing:</strong> ${valObj.missing.join(', ')}
                      </div>`;
  }

  // A simpler card for the "Card View"
  return `
    <div class="ticket-card" style="border-left: 5px solid; margin-bottom: 10px; padding: 15px; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" class="${borderClass}">
        <div style="display:flex; justify-content:space-between; align-items: flex-start;">
            <h4 style="margin:0;">${icon} ${valObj.ticketNumber} 
    </h4>
            
            <div style="text-align:right;">
                 <span style="color:#888; font-size:0.8em; display:block; margin-bottom:5px;">Row ${valObj.rowIndex + 1}</span>
                 <button class="btn btn-sm btn-danger" onclick="deleteValidationRecord(${valObj.rowIndex})" style="padding: 2px 8px; font-size: 12px;">
                    <i class="fas fa-trash"></i> Delete
                 </button>
            </div>
            </div>
        ${statusText}
        <div style="margin-top:10px; font-size:0.85em; display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
             <div><strong>Cust:</strong> ${valObj.data.customer || '-'}</div>
            <div><strong>Region:</strong> ${valObj.data.region || '-'}</div>
            <div><strong>Svc Type:</strong> ${valObj.data.service_type || '-'}</div>
            <div><strong>Status:</strong> ${valObj.data.status || '-'}</div>
        </div>
    </div>`;
}

window.deleteValidationRecord = function (index) {
  if (!confirm("Are you sure you want to remove this record from the dataset?")) return;
  window.MASTER_DATA.splice(index, 1);
  if (document.getElementById('fileCount')) {
    document.getElementById('fileCount').innerText = window.MASTER_DATA.length + " Records";
  }
  runFinalTicketValidation();
  window.showToast("Record deleted", "success");
};


// ════════════════════════════════════════════════════════════════════════════
// 9. BAND SPECIFIC PREVIEW LOGIC (NEW)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Extracts just the number from a string. 
 * Handles: "Band 1", "band 1", "b1", "1" -> Returns "1"
 */
function getNormalizedBand(val) {
  if (!val) return "";
  // Convert to string, lowercase, and remove anything that isn't a digit
  return String(val).toLowerCase().replace(/[^0-9]/g, '');
}

function initBandPreviewListeners() {
  const bandSelect = document.getElementById('tmm_bandSelect');
  if (bandSelect) {
    bandSelect.addEventListener('change', updateBandTablePreview);
  }

  // Dynamically create the container if it doesn't exist
  const finalPreview = document.getElementById('finalTablePreview');
  let bandContainer = document.getElementById('bandTablePreview');

  if (!bandContainer && finalPreview) {
    bandContainer = document.createElement('div');
    bandContainer.id = 'bandTablePreview';
    bandContainer.style.marginTop = "20px";
    bandContainer.style.borderTop = "2px dashed #ccc";
    bandContainer.style.paddingTop = "10px";
    // Insert immediately after the Final Table Preview
    finalPreview.parentNode.insertBefore(bandContainer, finalPreview.nextSibling);
  }
}

function updateBandTablePreview() {
  const container = document.getElementById('bandTablePreview');
  const bandSelect = document.getElementById('tmm_bandSelect');

  if (!container || !bandSelect) return;

  // 1. Get Target Band (Normalized)
  // If value is "" (All Bands), targetBand becomes ""
  const rawSelectValue = bandSelect.value;
  const targetBand = getNormalizedBand(rawSelectValue);

  // 2. Filter Master Data
  const columns = TABLE_SCHEMAS.final_ticket;

  // Filter logic: 
  // If "All Bands" (targetBand is empty) -> Show everything (or limit to first 100)
  // Else -> Show only matches
  const filteredData = window.MASTER_DATA.filter((record) => {
    if (!targetBand) return true; // Show all if dropdown is "All Bands"

    const recordBand = getNormalizedBand(record.band || "");
    return recordBand === targetBand;
  });

  // 3. Render Table
  if (filteredData.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:#999;padding:10px;">
            No records found for Band ${targetBand || "Selection"}
        </div>`;
    return;
  }

  const countLabel = targetBand ? `Band ${targetBand}` : "All Bands";

  let html = `
    <h4 style="margin-bottom:10px; color:#333;">
        ${countLabel} Preview <span class="badge" style="background:#6c757d">${filteredData.length} Records</span>
    </h4>
    <div class="final-table-scroll" style="max-height: 300px; overflow-y: auto;">
        <table class="final-preview-table" style="font-size: 0.85em; width:100%;">
            <thead>
                <tr>
                    <th style="position:sticky; top:0; background:#eee;">#</th>`;

  columns.forEach(k => {
    html += `<th style="position:sticky; top:0; background:#eee;">${FIELD_DEFINITIONS[k]?.label || k}</th>`;
  });

  html += `   </tr>
            </thead>
            <tbody>`;

  // Limit render to 100 rows for performance if showing "All"
  const renderLimit = 100;
  const dataToRender = filteredData.slice(0, renderLimit);

  dataToRender.forEach((row, index) => {
    html += `<tr>
            <td>${index + 1}</td>`;
    columns.forEach(k => {
      html += `<td>${row[k] || ''}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;

  if (filteredData.length > renderLimit) {
    html += `<div style="text-align:center; padding:5px; font-style:italic; color:#666;">
            (Showing first ${renderLimit} of ${filteredData.length} matches)
        </div>`;
  }

  html += `</div>`;

  container.innerHTML = html;
}

function renderValidationTableUI() {
  const finalTicketFields = TABLE_SCHEMAS['final_ticket'];

  // 1. Calculate Slice
  const totalRecords = window.VALIDATION_RESULTS.length;
  const startIndex = (VAL_TABLE_PAGE - 1) * VAL_ROWS_PER_PAGE;
  const endIndex = (VAL_ROWS_PER_PAGE === Infinity) ? totalRecords : Math.min(startIndex + VAL_ROWS_PER_PAGE, totalRecords);

  const displayData = window.VALIDATION_RESULTS.slice(startIndex, endIndex);

  // 2. Build Table HTML
  let tableHtml = `<table class="val-table">
        <thead>
            <tr>
                <th style="width: 50px;">#</th>
                <th style="width: 80px;">Action</th> 
                <th class="col-status">Validation Status</th>`;

  finalTicketFields.forEach(key => {
    const label = FIELD_DEFINITIONS[key]?.label || key;
    tableHtml += `<th>${label}</th>`;
  });
  tableHtml += `</tr></thead><tbody>`;

  // 3. Generate Rows
  if (displayData.length === 0) {
    tableHtml += `<tr><td colspan="${finalTicketFields.length + 3}" style="text-align:center; padding:20px;">No records found</td></tr>`;
  } else {
    displayData.forEach((res) => {
      const record = window.MASTER_DATA[res.rowIndex]; // Access original data via index

      let statusDisplay = res.status === 'SUCCESS'
        ? `<span class="text-success"><i class="fas fa-check-circle"></i> Valid</span>`
        : `<span class="text-error"><i class="fas fa-times-circle"></i> Invalid</span>`;

      let tableCellsHtml = '';
      finalTicketFields.forEach(fieldKey => {
        const value = record[fieldKey] || '';
        // Highlight cell if it caused an error (part of missing fields)
        const fieldLabel = FIELD_DEFINITIONS[fieldKey]?.label || fieldKey;
        const isMissing = res.missing.includes(fieldLabel);
        const cellClass = isMissing ? 'cell-error' : '';

        tableCellsHtml += `<td class="${cellClass}">${value}</td>`;
      });

      tableHtml += `<tr>
                <td>${res.rowIndex + 1}</td>
                <td style="text-align:center;">
                    <button class="btn btn-sm btn-danger" onclick="deleteValidationRecord(${res.rowIndex})" title="Delete Record">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
                <td>${statusDisplay}</td>
                ${tableCellsHtml}
            </tr>`;
    });
  }
  tableHtml += `</tbody></table>`;

  // 4. Inject Pagination Controls (Dynamic)
  const totalPages = (VAL_ROWS_PER_PAGE === Infinity) ? 1 : Math.ceil(totalRecords / VAL_ROWS_PER_PAGE);

  tableHtml += `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#f8f9fa; border-top:1px solid #ddd;">
        <div>
            Showing ${startIndex + 1} to ${endIndex} of ${totalRecords} records
        </div>
        <div style="display:flex; gap:5px;">
            <button class="btn btn-sm" onclick="changeValTablePage(-1)" ${VAL_TABLE_PAGE === 1 ? 'disabled' : ''}>Previous</button>
            <span style="padding:5px 10px; font-weight:bold;">Page ${VAL_TABLE_PAGE} of ${totalPages}</span>
            <button class="btn btn-sm" onclick="changeValTablePage(1)" ${VAL_TABLE_PAGE >= totalPages ? 'disabled' : ''}>Next</button>
        </div>
    </div>`;

  // 5. Inject Table
  const tableContainer = document.getElementById('validationTableContent');
  if (tableContainer) tableContainer.innerHTML = tableHtml;

  // 6. Generate Cards (Optional: Cards usually don't strictly follow table pagination, 
  // but usually user expects them to sync. Here we just render the same slice)
  let cardsHtml = '';
  displayData.forEach(res => {
    cardsHtml += generateValidationCard(res);
  });
  const cardContainer = document.getElementById('validationCardContent');
  if (cardContainer) cardContainer.innerHTML = cardsHtml;
}

function changeValTablePage(dir) {
  const totalRecords = window.VALIDATION_RESULTS.length;
  const totalPages = Math.ceil(totalRecords / VAL_ROWS_PER_PAGE);

  let newPage = VAL_TABLE_PAGE + dir;
  if (newPage < 1) newPage = 1;
  if (newPage > totalPages) newPage = totalPages;

  if (newPage !== VAL_TABLE_PAGE) {
    VAL_TABLE_PAGE = newPage;
    renderValidationTableUI();
  }
}


// ════════════════════════════════════════════════════════════════════════════
// NEW: PDF PROCESSING ENGINE
// ════════════════════════════════════════════════════════════════════════════

/**
 * 1. Reads PDF
 * 2. Extracts Text (Preserving Layout)
 * 3. Sends to API with current Schema
 * 4. Feeds result into existing initializeImportData()
 */
async function parsePDF(file) {
  try {
    window.showToast("Reading PDF content...", "info");

    // 1. Read File
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(buffer).promise;
    let fullText = "";

    // 2. Extract Text Page by Page
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent();
      // Use the layout-preserving reconstruct function
      const pageText = reconstructPdfText(textContent);
      fullText += `--- Page ${p} ---\n\n${pageText}\n\n`;

      // Optional: Update toast for multi-page PDFs
      if (p % 5 === 0) window.showToast(`Reading page ${p}/${pdf.numPages}...`, "info");
    }

    // 3. Prepare Schema for AI
    // We generate this dynamically from your FIELD_DEFINITIONS so AI knows what to look for
    const dynamicSchema = generateSchemaForAI();

    window.showToast("Analyzing with AI...", "info");

    // 4. Call API
    const payload = {
      pdf_content: fullText,
      table_schema: dynamicSchema
    };

    const response = await fetch('/billing/api/extract-pdf-data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add CSRF Token if Django requires it
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "AI Extraction Failed");
    }

    // 5. Handover to Existing Logic
    // data.extracted_data is an array of objects, exactly what initializeImportData expects
    window.showToast("PDF Processed Successfully!", "success");
    initializeImportData(data.extracted_data);

  } catch (error) {
    console.error("PDF Error:", error);
    window.showToast(`PDF Error: ${error.message}`, "error");
  }
}

/**
 * Reconstructs text from PDF.js items, attempting to preserve visual layout
 * (columns, tables) by using X/Y coordinates to insert newlines and spaces.
 */
function reconstructPdfText(textContent) {
  const items = textContent.items.map(i => ({
    str: i.str,
    x: Math.round(i.transform[4]), // X coordinate
    y: Math.round(i.transform[5]), // Y coordinate (PDF origin is bottom-left)
    w: i.width
  }));

  // Sort: Top-to-Bottom, then Left-to-Right
  items.sort((a, b) => b.y - a.y || a.x - b.x);

  let out = "";
  let lastY = null;
  let lastX = 0;

  items.forEach(i => {
    if (!i.str.trim()) return; // Skip empty strings

    // Detect new line (if Y difference is significant)
    if (lastY !== null && Math.abs(i.y - lastY) > 5) {
      out += "\n";
      lastX = 0;
    }

    // Calculate approximate spaces for indentation/columns
    // Dividing by 4 is a heuristic for average char width
    let spaces = 0;
    if (lastX) {
      spaces = Math.floor((i.x - lastX) / 4);
    } else {
      spaces = Math.floor(i.x / 4);
    }

    out += " ".repeat(Math.max(0, spaces)) + i.str;

    lastY = i.y;
    lastX = i.x + i.w;
  });

  return out;
}

/**
 * helper to convert your internal FIELD_DEFINITIONS into the simplified
 * schema format expected by the backend/AI.
 */
function generateSchemaForAI() {
  const aiSchema = {};

  // You can customize this list if you only want specific fields extracted from PDF
  // For now, we dump all defined fields + hints about their type
  Object.keys(FIELD_DEFINITIONS).forEach(key => {
    const def = FIELD_DEFINITIONS[key];
    let description = `${def.type}`;

    if (def.type === 'DATE') description += " (YYYY-MM-DD)";
    if (def.type === 'CURRENCY') description += " (Number, extract value only)";
    if (key === 'ticket_number') description += " (Important: Extract unique ID)";

    aiSchema[key] = description;
  });

  return aiSchema;
}