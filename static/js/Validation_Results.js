// Validation_Results.js - Enhanced with Assign Rate Card and Edit buttons

// Import data from Ticket_matching_matrix.js
const VALIDATION_DATA_SOURCE = window.DATA_STORE?.final_ticket || window.SAMPLE_DATA_HCL?.final_ticket || [];

// Enhanced sample data with real ticket information
const SAMPLE_VALIDATION_DATA = [
    {
        ticket_number: "548279",
        customer_reference: "NA",
        requester: "Ambuj Pathak",
        subject: "Jakarta || Indonesia || HCL_Caterpillar || ETA: 19/05/2025 at 10:00 || P4 || SCTASK3824526",
        customer: "12550-PT Caterpillar Finance Indonesia",
        priority: "P4",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/16/2025 12:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Indonesia",
        city: "jakarta",
        technician: "NA",
        engineer_details: "v-agung.p@excis.com",
        band_type: "Band 1",
        hours: 1.75,
        rate: 37.5,
        revenue: 37.5,
        currency: "USD",
        cost: 15,
        profit: 22.5,
        margin: 60,
        vendor_po: "INDOPO-6422/INDOPO-6421",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Dika went to give KT along with Agung"
    },
    {
        ticket_number: "553418",
        customer_reference: "NA",
        requester: "Ambuj Pathak",
        subject: "Rayong || Thailand || HCL_CATERPILLAR || ETA: [07/07/2025], [08/07/2025], [09/07/2025] || P4",
        customer: "Common Site",
        priority: "P4",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/24/2025 11:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Thailand",
        city: "Rayong",
        technician: "Rittikiat, Keerti, Ekachai",
        engineer_details: "(+66) 81 715 5138, v-rittikiat@excis.com",
        band_type: "Band 2",
        hours: 9.5,
        rate: 414,
        revenue: 1656,
        currency: "USD",
        cost: 772.33,
        profit: 883.67,
        margin: 53,
        vendor_po: "THAIPO-1254/THAIPO-1248",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Full day 170 and additional for KT 70 for cost is given"
    },
    {
        ticket_number: "553418-2",
        customer_reference: "NA",
        requester: "Ambuj Pathak",
        subject: "Rayong || Thailand || HCL_CATERPILLAR || ETA: [09/07/2025] || P4",
        customer: "Common Site",
        priority: "P4",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/24/2025 11:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Thailand",
        city: "Rayong",
        technician: "Rittikiat, Keerti, Ekachai",
        engineer_details: "(+66) 81 715 5138, v-rittikiat@excis.com",
        band_type: "Band 3",
        hours: 8.5,
        rate: 414,
        revenue: 1656,
        currency: "USD",
        cost: 772.33,
        profit: 883.67,
        margin: 53,
        vendor_po: "THAIPO-1254/THAIPO-1248",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Full day 170 and additional for KT 70 for cost is given"
    },
    {
        ticket_number: "553418-3",
        customer_reference: "NA",
        requester: "Ambuj Pathak",
        subject: "Rayong || Thailand || HCL_CATERPILLAR || ETA: [08/07/2025] || P4",
        customer: "Common Site",
        priority: "P4",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/24/2025 11:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Thailand",
        city: "Rayong",
        technician: "Rittikiat, Keerti, Ekachai",
        engineer_details: "(+66) 81 715 5138, v-rittikiat@excis.com",
        band_type: "Band 4",
        hours: 8.5,
        rate: 414,
        revenue: 1656,
        currency: "USD",
        cost: 772.33,
        profit: 883.67,
        margin: 53,
        vendor_po: "THAIPO-1254/THAIPO-1248",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Full day 170 and additional for KT 70 for cost is given"
    },
    {
        ticket_number: "554015",
        customer_reference: "SCTASK3936890",
        requester: "Ambuj Pathak",
        subject: "Jakarta || Indonesia || HCL_Caterpillar || ETA: 30/06/2025 09:00 || P4 || Hardware Return",
        customer: "Common Site",
        priority: "P4",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/16/2025 19:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Indonesia",
        city: "JAKARTA",
        technician: "Dika Prasetya",
        engineer_details: "v-dika@excis.com, +6281313300909",
        band_type: "Band 1",
        hours: 1.03,
        rate: 401175.04,
        revenue: 401175.04,
        currency: "IDR",
        cost: 232500,
        profit: 168675.04,
        margin: 42,
        vendor_po: "INDOPO-6502",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "hourly rates"
    },
    {
        ticket_number: "553807",
        customer_reference: "SCTASK3846028",
        requester: "Nisha Singh",
        subject: "Batam || Indonesia || HCL_Caterpillar || ETA: [26/06/2025 8:00] || P4 || Full day visit",
        customer: "Common Site",
        priority: "P4- Low",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/18/2025 19:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Indonesia",
        city: "Batam",
        technician: "Muhammad Jaya",
        engineer_details: "v-muhammad@excis.com",
        band_type: "Band 2",
        hours: 8.0,
        rate: 401175.04,
        revenue: 12436426.24,
        currency: "IDR",
        cost: 7207500,
        profit: 5228926.24,
        margin: 42,
        vendor_po: "INDOPO-6498",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Engineer worked for 5 days and hourly rates applied"
    },
    {
        ticket_number: "553807-2",
        customer_reference: "SCTASK3846028",
        requester: "Nisha Singh",
        subject: "Batam || Indonesia || HCL_Caterpillar || ETA: [30/07/2025] || P4 || Full day visit",
        customer: "Common Site",
        priority: "P4- Low",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/18/2025 19:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Indonesia",
        city: "Batam",
        technician: "Muhammad Jaya",
        engineer_details: "v-muhammad@excis.com",
        band_type: "Band 3",
        hours: 8.0,
        rate: 401175.04,
        revenue: 12436426.24,
        currency: "IDR",
        cost: 7207500,
        profit: 5228926.24,
        margin: 42,
        vendor_po: "INDOPO-6498",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Engineer worked for 5 days and hourly rates applied"
    },
    {
        ticket_number: "553807-3",
        customer_reference: "SCTASK3846028",
        requester: "Nisha Singh",
        subject: "Batam || Indonesia || HCL_Caterpillar || ETA: [01/07/2025 13:00] || P4 || Full day visit",
        customer: "Common Site",
        priority: "P4- Low",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/18/2025 19:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Indonesia",
        city: "Batam",
        technician: "Muhammad Jaya",
        engineer_details: "v-muhammad@excis.com",
        band_type: "Band 4",
        hours: 4.0,
        rate: 401175.04,
        revenue: 12436426.24,
        currency: "IDR",
        cost: 7207500,
        profit: 5228926.24,
        margin: 42,
        vendor_po: "INDOPO-6498",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Engineer worked for 5 days and hourly rates applied"
    },
    {
        ticket_number: "553807-4",
        customer_reference: "SCTASK3846028",
        requester: "Nisha Singh",
        subject: "Batam || Indonesia || HCL_Caterpillar || ETA: [02/07/2025 09:00] || P4 || Full day visit",
        customer: "Common Site",
        priority: "P4- Low",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/18/2025 19:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Indonesia",
        city: "Batam",
        technician: "Muhammad Jaya",
        engineer_details: "v-muhammad@excis.com",
        band_type: "Band 1",
        hours: 7.0,
        rate: 401175.04,
        revenue: 12436426.24,
        currency: "IDR",
        cost: 7207500,
        profit: 5228926.24,
        margin: 42,
        vendor_po: "INDOPO-6498",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Engineer worked for 5 days and hourly rates applied"
    },
    {
        ticket_number: "553807-5",
        customer_reference: "SCTASK3846028",
        requester: "Nisha Singh",
        subject: "Batam || Indonesia || HCL_Caterpillar || ETA: [3/07/2025] || P4 || Full day visit",
        customer: "Common Site",
        priority: "P4- Low",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/18/2025 19:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Indonesia",
        city: "Batam",
        technician: "Muhammad Jaya",
        engineer_details: "v-muhammad@excis.com",
        band_type: "Band 2",
        hours: 4.0,
        rate: 401175.04,
        revenue: 12436426.24,
        currency: "IDR",
        cost: 7207500,
        profit: 5228926.24,
        margin: 42,
        vendor_po: "INDOPO-6498",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "Engineer worked for 5 days and hourly rates applied"
    },
    {
        ticket_number: "554743",
        customer_reference: "INC8733679",
        requester: "Thokchom Panganba",
        subject: "Bogor || Indonesia || HCL_Caterpillar || ETA: 02/07/2025 9:00 || NBD || Computer Hardware Failure",
        customer: "16820-Bogor Jawa Barat 16820",
        priority: "NBD",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/17/2025 12:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Indonesia",
        city: "Bogor",
        technician: "Dika",
        engineer_details: "v-dika@excis.com, +62 81313300909",
        band_type: "Band 3",
        hours: 6.05,
        rate: 401175.04,
        revenue: 2407050.24,
        currency: "IDR",
        cost: 1395000,
        profit: 1012050.24,
        margin: 42,
        vendor_po: "INDOPO-6508",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "hourly rates applied"
    },
    {
        ticket_number: "555624",
        customer_reference: "NA",
        requester: "Thokchom Panganba",
        subject: "Almaty || Kazakhstan || HCL_Caterpillar || ETA:08/07/2025 at 9:00 || P4 || Half day (4 hours)",
        customer: "Common Site",
        priority: "P4",
        assigned_technician: "Savita Pandit",
        status: "Closed",
        category: "Resolution",
        completion_date: "7/22/2025 19:50",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Kazakhstan",
        city: "Almaty",
        technician: "Alexander erin",
        engineer_details: "erin@excis.com",
        band_type: "Band 4",
        hours: 5.5,
        rate: 317.68,
        revenue: 317.68,
        currency: "EUR",
        cost: 151.25,
        profit: 166.43,
        margin: 52,
        vendor_po: "GBRPO-38108",
        pre_visit: "YES",
        post_visit: "YES",
        comments: "hourly rates applied"
    },
    {
        ticket_number: "557859",
        customer_reference: "NA",
        requester: "Nisha Singh",
        subject: "Bangkok || Thailand || HCL_Caterpillar || ETA:[21/7/2025],[22/7/2025],[24/07/2025] || P4 || Full Day Visit",
        customer: "TH-19-02, floor time square building, 246 Sukhumvit 12-14 Rd, Bangkok",
        priority: "P4",
        assigned_technician: "Savita Pandit",
        status: "Resolved",
        category: "Resolution",
        completion_date: "",
        account: "HCL_Caterpillar",
        region: "APAC",
        country: "Thailand",
        city: "Bangkok",
        technician: "Rittikiet",
        engineer_details: "v-rittikiat@excis.com, 66 64 880 9325",
        band_type: "Band 1",
        hours: 8.0,
        rate: 1217.88,
        revenue: 1217.88,
        currency: "USD",
        cost: 480,
        profit: 737.88,
        margin: 61,
        vendor_po: "THAIPO-1279",
        pre_visit: "Yes",
        post_visit: "Yes",
        comments: "Cost is full day and income is hourly and engineer have worked for 3 days"
    }
];

// State management
let validationState = {
    tickets: [],
    filteredTickets: [],
    currentPage: 1,
    itemsPerPage: 25,
    currentView: 'table',
    sortColumn: null,
    sortDirection: 'asc',
    searchTerm: '',
    filterStatus: 'all',
    visibleColumns: []
};

// Column definitions
const COLUMN_DEFINITIONS = [
    { id: 'ticket_number', label: 'Request ID', visible: true, sortable: true },
    { id: 'customer_reference', label: 'Customer Reference', visible: true, sortable: true },
    { id: 'requester', label: 'Requester', visible: true, sortable: true },
    { id: 'subject', label: 'Subject', visible: true, sortable: true },
    { id: 'customer', label: 'Site', visible: true, sortable: true },
    { id: 'priority', label: 'Priority', visible: true, sortable: true },
    { id: 'assigned_technician', label: 'Assigned Technician', visible: true, sortable: true },
    { id: 'status', label: 'Request Status', visible: true, sortable: true },
    { id: 'category', label: 'Worklog Type', visible: true, sortable: true },
    { id: 'completion_date', label: 'Completed Time', visible: true, sortable: true },
    { id: 'account', label: 'Account', visible: true, sortable: true },
    { id: 'region', label: 'Region', visible: true, sortable: true },
    { id: 'country', label: 'Country', visible: true, sortable: true },
    { id: 'city', label: 'City', visible: true, sortable: true },
    { id: 'technician', label: 'Field Engineer Resolver', visible: true, sortable: true },
    { id: 'engineer_details', label: 'Engineer Details', visible: true, sortable: true },
    { id: 'band_type', label: 'Band Type', visible: true, sortable: true },
    { id: 'hours', label: 'Time Spent (Hours)', visible: true, sortable: true },
    { id: 'rate', label: 'Revenue Rate', visible: true, sortable: true },
    { id: 'revenue', label: 'Total Revenue', visible: true, sortable: true },
    { id: 'currency', label: 'Currency', visible: true, sortable: true },
    { id: 'cost', label: 'Total Labor Cost', visible: true, sortable: true },
    { id: 'profit', label: 'Profit', visible: true, sortable: true },
    { id: 'margin', label: 'Margin %', visible: true, sortable: true },
    { id: 'vendor_po', label: 'Vendor PO', visible: true, sortable: true },
    { id: 'pre_visit', label: 'PRE Visit', visible: true, sortable: true },
    { id: 'post_visit', label: 'POST Visit', visible: true, sortable: true },
    { id: 'comments', label: 'Comments', visible: true, sortable: true },
    { id: 'validation_status', label: 'Validation', visible: true, sortable: true }
];

// Validation rules
function getValidationStatus(ticket) {
    const issues = [];
    
    if (!ticket.technician || ticket.technician.trim() === '' || ticket.technician === 'NA') {
        issues.push('Missing technician');
    }
    if (!ticket.completion_date || ticket.completion_date.trim() === '') {
        issues.push('Missing completion date');
    }
    if (!ticket.hours || parseFloat(ticket.hours) === 0) {
        issues.push('Zero or missing hours');
    }
    if (!ticket.rate || parseFloat(ticket.rate) === 0) {
        issues.push('Zero or missing rate');
    }
    if (!ticket.revenue || parseFloat(ticket.revenue) === 0) {
        issues.push('Zero or missing revenue');
    }
    if (!ticket.customer || ticket.customer.trim() === '') {
        issues.push('Missing customer');
    }
    if (!ticket.account || ticket.account.trim() === '') {
        issues.push('Missing account');
    }
    if (!ticket.band_type || ticket.band_type.trim() === '') {
        issues.push('Missing band type');
    }
    
    if (issues.length === 0) return { status: 'valid', issues: [] };
    if (issues.length <= 2) return { status: 'warning', issues };
    return { status: 'error', issues };
}

// Convert raw data to ticket format
function convertToTicketFormat(rawData) {
    return rawData.map(item => ({
        ticket_number: item.ticket_number || item.ticketNumber || item.id || 'N/A',
        customer: item.customer || item.customerName || item.site || 'N/A',
        account: item.account || item.accountNumber || 'N/A',
        band_type: item.band_type || item.bandType || item.band || 'N/A',
        technician: item.technician || item.tech_name || item.assigned_technician || '',
        completion_date: item.completion_date || item.completionDate || item.date || '',
        hours: item.hours || item.total_hours || item.time_spent || 0,
        rate: item.rate || item.hourly_rate || item.revenue_rate || 0,
        revenue: item.revenue || item.total_revenue || 0,
        status: item.status || item.request_status || 'Pending',
        category: item.category || item.service_category || item.worklog_type || 'General',
        customer_reference: item.customer_reference || item.customerReference || 'N/A',
        requester: item.requester || 'N/A',
        subject: item.subject || 'N/A',
        priority: item.priority || 'N/A',
        assigned_technician: item.assigned_technician || item.technician || 'N/A',
        region: item.region || 'N/A',
        country: item.country || 'N/A',
        city: item.city || 'N/A',
        engineer_details: item.engineer_details || 'N/A',
        currency: item.currency || 'USD',
        cost: item.cost || item.total_cost || 0,
        profit: item.profit || 0,
        margin: item.margin || 0,
        vendor_po: item.vendor_po || 'N/A',
        pre_visit: item.pre_visit || 'N/A',
        post_visit: item.post_visit || 'N/A',
        comments: item.comments || 'N/A'
    }));
}

// Initialize validation results
function initializeValidationResults() {
    console.log('Initializing Validation Results...');
    
    // Load data
    const rawData = VALIDATION_DATA_SOURCE.length > 0 ? VALIDATION_DATA_SOURCE : SAMPLE_VALIDATION_DATA;
    console.log('Raw data loaded:', rawData.length, 'tickets');
    
    validationState.tickets = convertToTicketFormat(rawData);
    
    // Add validation status to each ticket
    validationState.tickets = validationState.tickets.map(ticket => ({
        ...ticket,
        ...getValidationStatus(ticket)
    }));
    
    console.log('Processed tickets:', validationState.tickets);
    
    // Initialize visible columns
    validationState.visibleColumns = COLUMN_DEFINITIONS.filter(col => col.visible).map(col => col.id);
    
    // Initial render
    validationState.filteredTickets = validationState.tickets;
    updateSummaryCards();
    renderTableHeaders();
    renderCurrentView();
    setupEventListeners();
    injectBadgeStyles();
    injectFloatingMessageStyles();
    
    console.log('Validation Results initialized successfully');
}

// Inject badge styles
function injectBadgeStyles() {
    const styleId = 'validation-badge-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        #validation .validation-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        #validation .validation-badge.valid {
            background-color: #d4edda;
            color: #155724;
        }
        #validation .validation-badge.warning {
            background-color: #fff3cd;
            color: #856404;
        }
        #validation .validation-badge.error {
            background-color: #f8d7da;
            color: #721c24;
        }
        #validation .action-buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
        }
        #validation .btn-assign-rate {
            padding: 6px 12px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: background-color 0.2s;
            white-space: nowrap;
        }
        #validation .btn-assign-rate:hover {
            background-color: #218838;
        }
        #validation .btn-edit {
            padding: 6px 12px;
            background-color: #ffc107;
            color: #000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: background-color 0.2s;
            white-space: nowrap;
        }
        #validation .btn-edit:hover {
            background-color: #e0a800;
        }
        #validation .ticket-card-header h4 {
            color: #fff;
            font-weight: 700;
            font-size: 18px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
}

// Inject floating message styles
function injectFloatingMessageStyles() {
    const styleId = 'floating-message-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .floating-message-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease-in;
        }
        .floating-message-window {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            animation: slideIn 0.3s ease-out;
        }
        .floating-message-header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .floating-message-header h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        .floating-message-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #999;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .floating-message-close:hover {
            color: #333;
        }
        .floating-message-body {
            padding: 20px;
        }
        .floating-message-content {
            margin-bottom: 20px;
        }
        .floating-message-content p {
            margin: 0 0 15px 0;
            color: #555;
            line-height: 1.6;
        }
        .floating-message-details {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .floating-message-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .floating-message-details td {
            padding: 6px 0;
            font-size: 14px;
        }
        .floating-message-details td:first-child {
            font-weight: 600;
            color: #333;
            width: 40%;
        }
        .floating-message-details td:last-child {
            color: #555;
        }
        .floating-message-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .floating-message-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
        }
        .floating-message-btn-cancel {
            background-color: #6c757d;
            color: white;
        }
        .floating-message-btn-cancel:hover {
            background-color: #5a6268;
        }
        .floating-message-btn-confirm {
            background-color: #007bff;
            color: white;
        }
        .floating-message-btn-confirm:hover {
            background-color: #0056b3;
        }
        .floating-message-btn-assign {
            background-color: #28a745;
            color: white;
        }
        .floating-message-btn-assign:hover {
            background-color: #218838;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Show floating message for Edit action
function showEditConfirmation(ticket) {
    const overlay = document.createElement('div');
    overlay.className = 'floating-message-overlay';
    
    overlay.innerHTML = `
        <div class="floating-message-window">
            <div class="floating-message-header">
                <h3>Confirm Ticket Modification</h3>
                <button class="floating-message-close">&times;</button>
            </div>
            <div class="floating-message-body">
                <div class="floating-message-content">
                    <p>Are you sure you want to modify this validated ticket and send it back to the Matching Matrix table for re-processing?</p>
                    <div class="floating-message-details">
                        <table>
                            <tr>
                                <td>Ticket Number:</td>
                                <td><strong>${ticket.ticket_number}</strong></td>
                            </tr>
                            <tr>
                                <td>Customer:</td>
                                <td>${ticket.customer}</td>
                            </tr>
                            <tr>
                                <td>Account:</td>
                                <td>${ticket.account}</td>
                            </tr>
                            <tr>
                                <td>Band Type:</td>
                                <td>${ticket.band_type}</td>
                            </tr>
                        </table>
                    </div>
                    <p style="font-size: 13px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 15px;">
                        <strong>Note:</strong> This action will remove the ticket from the validation results and return it to the matching matrix for further adjustments.
                    </p>
                </div>
                <div class="floating-message-actions">
                    <button class="floating-message-btn floating-message-btn-cancel">Cancel</button>
                    <button class="floating-message-btn floating-message-btn-confirm">Confirm & Edit</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close button
    overlay.querySelector('.floating-message-close').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Cancel button
    overlay.querySelector('.floating-message-btn-cancel').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Confirm button
    overlay.querySelector('.floating-message-btn-confirm').addEventListener('click', () => {
        handleEditTicket(ticket);
        overlay.remove();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Show floating message for Assign Rate Card action
function showAssignRateCardMessage(ticket) {
    const overlay = document.createElement('div');
    overlay.className = 'floating-message-overlay';
    
    overlay.innerHTML = `
        <div class="floating-message-window">
            <div class="floating-message-header">
                <h3>Assign Rate Card</h3>
                <button class="floating-message-close">&times;</button>
            </div>
            <div class="floating-message-body">
                <div class="floating-message-content">
                    <p>You are about to assign or update the rate card for this ticket.</p>
                    <div class="floating-message-details">
                        <table>
                            <tr>
                                <td>Ticket Number:</td>
                                <td><strong>${ticket.ticket_number}</strong></td>
                            </tr>
                            <tr>
                                <td>Customer:</td>
                                <td>${ticket.customer}</td>
                            </tr>
                            <tr>
                                <td>Account:</td>
                                <td>${ticket.account}</td>
                            </tr>
                            <tr>
                                <td>Band Type:</td>
                                <td>${ticket.band_type}</td>
                            </tr>
                            <tr>
                                <td>Current Rate:</td>
                                <td>${ticket.currency} ${parseFloat(ticket.rate || 0).toFixed(2)}/hr</td>
                            </tr>
                        </table>
                    </div>
                    <p style="font-size: 13px; color: #004085; background-color: #cce5ff; padding: 10px; border-radius: 4px; margin-top: 15px;">
                        <strong>Info:</strong> This will open the rate card assignment interface where you can select or update the appropriate service rate card for this ticket.
                    </p>
                </div>
                <div class="floating-message-actions">
                    <button class="floating-message-btn floating-message-btn-cancel">Cancel</button>
                    <button class="floating-message-btn floating-message-btn-assign">Proceed to Assign</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close button
    overlay.querySelector('.floating-message-close').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Cancel button
    overlay.querySelector('.floating-message-btn-cancel').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Assign button
    overlay.querySelector('.floating-message-btn-assign').addEventListener('click', () => {
        handleAssignRateCard(ticket);
        overlay.remove();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Handle edit ticket action
function handleEditTicket(ticket) {
    console.log('Editing ticket:', ticket);
    alert(`Ticket ${ticket.ticket_number} will be sent back to the Matching Matrix for editing.`);
}

// Handle assign rate card action
function handleAssignRateCard(ticket) {
    console.log('Assigning rate card for ticket:', ticket);
    alert(`Opening rate card assignment for ticket ${ticket.ticket_number}`);
}

// Update summary cards
function updateSummaryCards() {
    const total = validationState.tickets.length;
    const valid = validationState.tickets.filter(t => t.status === 'valid').length;
    const warnings = validationState.tickets.filter(t => t.status === 'warning').length;
    const errors = validationState.tickets.filter(t => t.status === 'error').length;
    
    const validEl = document.getElementById('validCount');
    const warningsEl = document.getElementById('warningCount');
    const errorsEl = document.getElementById('errorCount');
    const totalEl = document.getElementById('totalCount');
    
    if (validEl) validEl.textContent = valid;
    if (warningsEl) warningsEl.textContent = warnings;
    if (errorsEl) errorsEl.textContent = errors;
    if (totalEl) totalEl.textContent = total;
}

// Render table headers
function renderTableHeaders() {
    const thead = document.getElementById('tableHeader');
    if (!thead) return;
    
    const headers = validationState.visibleColumns.map(colId => {
        const col = COLUMN_DEFINITIONS.find(c => c.id === colId);
        return `<th>${col.label}</th>`;
    }).join('');
    
    thead.innerHTML = `<tr>${headers}<th>Actions</th></tr>`;
}

// Render table view
function renderTableView() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    
    const start = (validationState.currentPage - 1) * validationState.itemsPerPage;
    const end = start + validationState.itemsPerPage;
    const pageTickets = validationState.filteredTickets.slice(start, end);
    
    console.log('Rendering table view with', pageTickets.length, 'tickets');
    
    if (pageTickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" style="text-align: center; padding: 40px;">No tickets found</td></tr>';
        return;
    }
    
    tbody.innerHTML = pageTickets.map(ticket => {
        const cells = validationState.visibleColumns.map(colId => {
            if (colId === 'validation_status') {
                return `<td><span class="validation-badge ${ticket.status}">${ticket.status}</span></td>`;
            }
            if (colId === 'revenue' || colId === 'rate' || colId === 'cost' || colId === 'profit') {
                return `<td>${ticket.currency || 'USD'} ${parseFloat(ticket[colId] || 0).toFixed(2)}</td>`;
            }
            if (colId === 'hours') {
                return `<td>${parseFloat(ticket[colId] || 0).toFixed(2)}</td>`;
            }
            if (colId === 'margin') {
                return `<td>${parseFloat(ticket[colId] || 0).toFixed(0)}%</td>`;
            }
            return `<td>${ticket[colId] || 'N/A'}</td>`;
        }).join('');
        
        return `
            <tr>
                ${cells}
                <td>
                    <div class="action-buttons">
                        <button class="btn-assign-rate" data-ticket='${JSON.stringify(ticket).replace(/'/g, "&apos;")}'>Assign Rate Card</button>
                        <button class="btn-edit" data-ticket='${JSON.stringify(ticket).replace(/'/g, "&apos;")}'>Edit</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners for action buttons
    tbody.querySelectorAll('.btn-assign-rate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ticket = JSON.parse(e.target.getAttribute('data-ticket'));
            showAssignRateCardMessage(ticket);
        });
    });
    
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ticket = JSON.parse(e.target.getAttribute('data-ticket'));
            showEditConfirmation(ticket);
        });
    });
    
    updatePagination();
}

// Render card view
function renderCardView() {
    const container = document.getElementById('ticketCards');
    if (!container) {
        console.error('Card container not found');
        return;
    }
    
    const start = (validationState.currentPage - 1) * validationState.itemsPerPage;
    const end = start + validationState.itemsPerPage;
    const pageTickets = validationState.filteredTickets.slice(start, end);
    
    console.log('Rendering card view with', pageTickets.length, 'tickets');
    
    if (pageTickets.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; grid-column: 1/-1;">No tickets found</div>';
        return;
    }
    
    container.innerHTML = pageTickets.map(ticket => `
        <div class="ticket-card">
            <div class="ticket-card-header">
                <h4>${ticket.ticket_number}</h4>
                <span class="validation-badge ${ticket.status}">${ticket.status}</span>
            </div>
            <div class="ticket-card-body">
                ${validationState.visibleColumns.map(colId => {
                    const col = COLUMN_DEFINITIONS.find(c => c.id === colId);
                    if (!col || colId === 'validation_status' || colId === 'ticket_number') return '';
                    
                    let value = ticket[colId] || 'N/A';
                    if (colId === 'revenue' || colId === 'rate' || colId === 'cost' || colId === 'profit') {
                        value = `${ticket.currency || 'USD'} ${parseFloat(ticket[colId] || 0).toFixed(2)}`;
                    } else if (colId === 'hours') {
                        value = parseFloat(ticket[colId] || 0).toFixed(2);
                    } else if (colId === 'margin') {
                        value = `${parseFloat(ticket[colId] || 0).toFixed(0)}%`;
                    }
                    
                    return `
                        <div class="ticket-field">
                            <label>${col.label}:</label>
                            <span>${value}</span>
                        </div>
                    `;
                }).join('')}
                ${ticket.issues && ticket.issues.length > 0 ? `
                    <div class="ticket-field" style="grid-column: 1/-1;">
                        <label>Issues:</label>
                        <span style="color: #dc3545;">${ticket.issues.join(', ')}</span>
                    </div>
                ` : ''}
            </div>
            <div class="ticket-card-footer">
                <div class="action-buttons">
                    <button class="btn-assign-rate" data-ticket='${JSON.stringify(ticket).replace(/'/g, "&apos;")}'>Assign Rate Card</button>
                    <button class="btn-edit" data-ticket='${JSON.stringify(ticket).replace(/'/g, "&apos;")}'>Edit</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for action buttons
    container.querySelectorAll('.btn-assign-rate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ticket = JSON.parse(e.target.getAttribute('data-ticket'));
            showAssignRateCardMessage(ticket);
        });
    });
    
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ticket = JSON.parse(e.target.getAttribute('data-ticket'));
            showEditConfirmation(ticket);
        });
    });
    
    updatePagination();
}

// Render current view
function renderCurrentView() {
    if (validationState.currentView === 'table') {
        document.getElementById('tableDisplay').style.display = 'block';
        document.getElementById('formViewContainer').style.display = 'none';
        renderTableView();
    } else {
        document.getElementById('tableDisplay').style.display = 'none';
        document.getElementById('formViewContainer').style.display = 'block';
        renderCardView();
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(validationState.filteredTickets.length / validationState.itemsPerPage);
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');
    
    if (paginationInfo) {
        const start = (validationState.currentPage - 1) * validationState.itemsPerPage + 1;
        const end = Math.min(start + validationState.itemsPerPage - 1, validationState.filteredTickets.length);
        paginationInfo.textContent = `Showing ${start}-${end} of ${validationState.filteredTickets.length} tickets`;
    }
    
    if (paginationControls) {
        let controlsHTML = '';
        
        // Previous button
        controlsHTML += `<button class="pagination-btn" ${validationState.currentPage === 1 ? 'disabled' : ''} onclick="changePage(${validationState.currentPage - 1})">
            <i class="fas fa-chevron-left"></i> Previous
        </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= validationState.currentPage - 1 && i <= validationState.currentPage + 1)) {
                controlsHTML += `<button class="pagination-btn ${i === validationState.currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
            } else if (i === validationState.currentPage - 2 || i === validationState.currentPage + 2) {
                controlsHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Next button
        controlsHTML += `<button class="pagination-btn" ${validationState.currentPage >= totalPages ? 'disabled' : ''} onclick="changePage(${validationState.currentPage + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>`;
        
        paginationControls.innerHTML = controlsHTML;
    }
}

// Change page function (global scope for onclick)
window.changePage = function(page) {
    const totalPages = Math.ceil(validationState.filteredTickets.length / validationState.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        validationState.currentPage = page;
        renderCurrentView();
    }
};

// Setup event listeners
function setupEventListeners() {
    // View toggle
    const tableViewBtn = document.getElementById('tableViewBtn');
    const formViewBtn = document.getElementById('formViewBtn');
    
    if (tableViewBtn) {
        tableViewBtn.addEventListener('click', () => {
            validationState.currentView = 'table';
            tableViewBtn.classList.add('active');
            formViewBtn.classList.remove('active');
            renderCurrentView();
        });
    }
    
    if (formViewBtn) {
        formViewBtn.addEventListener('click', () => {
            validationState.currentView = 'form';
            formViewBtn.classList.add('active');
            tableViewBtn.classList.remove('active');
            renderCurrentView();
        });
    }
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            validationState.searchTerm = e.target.value.toLowerCase();
            applyFilters();
        });
    }
    
    // Rows per page
    const rowsPerPage = document.getElementById('rowsPerPage');
    if (rowsPerPage) {
        rowsPerPage.addEventListener('change', (e) => {
            validationState.itemsPerPage = e.target.value === 'all' ? validationState.filteredTickets.length : parseInt(e.target.value);
            validationState.currentPage = 1;
            renderCurrentView();
        });
    }
    
    // Column configuration
    const configBtn = document.getElementById('configureColumnsBtn');
    const configOverlay = document.getElementById('configOverlay');
    const configWindow = document.getElementById('configWindow');
    const closeConfigBtn = document.getElementById('closeConfigWindow');
    const applyConfigBtn = document.getElementById('applyConfig');
    const selectAllBtn = document.getElementById('selectAllCols');
    const deselectAllBtn = document.getElementById('deselectAllCols');
    
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            configOverlay.style.display = 'block';
            configWindow.style.display = 'block';
            renderColumnConfig();
        });
    }
    
    if (closeConfigBtn) {
        closeConfigBtn.addEventListener('click', () => {
            configOverlay.style.display = 'none';
            configWindow.style.display = 'none';
        });
    }
    
    if (configOverlay) {
        configOverlay.addEventListener('click', () => {
            configOverlay.style.display = 'none';
            configWindow.style.display = 'none';
        });
    }
    
    if (applyConfigBtn) {
        applyConfigBtn.addEventListener('click', () => {
            applyColumnConfiguration();
            configOverlay.style.display = 'none';
            configWindow.style.display = 'none';
        });
    }
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            document.querySelectorAll('#columnGroups input[type="checkbox"]').forEach(cb => cb.checked = true);
        });
    }
    
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            document.querySelectorAll('#columnGroups input[type="checkbox"]').forEach(cb => cb.checked = false);
        });
    }
    
    // Export
    const exportBtn = document.getElementById('exportResultsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
}

// Apply filters
function applyFilters() {
    validationState.filteredTickets = validationState.tickets.filter(ticket => {
        const matchesSearch = !validationState.searchTerm || 
            Object.values(ticket).some(val => 
                String(val).toLowerCase().includes(validationState.searchTerm)
            );
        
        return matchesSearch;
    });
    
    validationState.currentPage = 1;
    updateSummaryCards();
    renderCurrentView();
}

// Render column configuration
function renderColumnConfig() {
    const container = document.getElementById('columnGroups');
    if (!container) return;
    
    container.innerHTML = COLUMN_DEFINITIONS.map(col => `
        <label class="column-checkbox">
            <input type="checkbox" value="${col.id}" ${validationState.visibleColumns.includes(col.id) ? 'checked' : ''}>
            <span>${col.label}</span>
        </label>
    `).join('');
}

// Apply column configuration
function applyColumnConfiguration() {
    const checkboxes = document.querySelectorAll('#columnGroups input[type="checkbox"]');
    validationState.visibleColumns = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    renderTableHeaders();
    renderCurrentView();
}

// Export to CSV
function exportToCSV() {
    const headers = validationState.visibleColumns.map(colId => {
        const col = COLUMN_DEFINITIONS.find(c => c.id === colId);
        return col.label;
    });
    
    const rows = validationState.filteredTickets.map(ticket => {
        return validationState.visibleColumns.map(colId => {
            return ticket[colId] || '';
        });
    });
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation_results_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeValidationResults);
} else {
    initializeValidationResults();
}