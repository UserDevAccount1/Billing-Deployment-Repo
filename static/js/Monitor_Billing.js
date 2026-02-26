// Monitor_Billing.js - Complete Dashboard Logic

let qvCurrentMode = 'table';
let qvCurrentRecordIndex = 0;

const steps = [
    { id: 1, name: 'Ticket Match', icon: 'fas fa-ticket-alt', status: 'completed' },
    { id: 2, name: 'Rate Match', icon: 'fas fa-exchange-alt', status: 'in-progress' },
    { id: 3, name: 'File Gen', icon: 'fas fa-file-export', status: 'pending' },
    { id: 4, name: 'Consolidate', icon: 'fas fa-compress-arrows-alt', status: 'pending' },
    { id: 5, name: 'Upload', icon: 'fas fa-cloud-upload-alt', status: 'pending' },
    { id: 6, name: 'Approval', icon: 'fas fa-thumbs-up', status: 'pending' },
    { id: 7, name: 'Invoice', icon: 'fas fa-file-invoice-dollar', status: 'pending' }
];

let finalTickets = [];
let filteredBillingData = [];

const billingTableConfig = {
    columns: [
        { id: 'selection', label: '<input type="checkbox" id="selectAllTickets" onclick="toggleAllTickets(this)">', visible: true, sortable: false },
        { id: 'request_id', label: 'Request ID', visible: true, sortable: true },
        { id: 'ticket_number', label: 'Ticket Number', visible: true, sortable: true },
        { id: 'version', label: 'Version', visible: true, sortable: true },
        { id: 'customer', label: 'Customer', visible: true, sortable: true },
        { id: 'customer_reference', label: 'Customer Reference', visible: true, sortable: true },
        { id: 'requester', label: 'Requester', visible: true, sortable: true },
        { id: 'subject', label: 'Subject', visible: false, sortable: true },
        { id: 'site_name', label: 'Site Name', visible: true, sortable: true },
        { id: 'priority', label: 'Priority', visible: true, sortable: true },
        { id: 'technician_name', label: 'Technician Name', visible: true, sortable: true },
        { id: 'status', label: 'Status', visible: true, sortable: true },
        { id: 'worklog_type', label: 'Worklog Type', visible: true, sortable: true },
        { id: 'completed_date', label: 'Completed Date', visible: true, sortable: true },
        { id: 'account', label: 'Account', visible: true, sortable: true },
        { id: 'region', label: 'Region', visible: true, sortable: true },
        { id: 'country', label: 'Country', visible: true, sortable: true },
        { id: 'city', label: 'City', visible: true, sortable: true },
        { id: 'contact_email', label: 'Contact Email', visible: false, sortable: true },
        { id: 'band', label: 'Band', visible: true, sortable: true },
        { id: 'total_hours', label: 'Total Hours', visible: true, sortable: true },
        { id: 'hourly_rate', label: 'Hourly Rate', visible: true, sortable: true },
        { id: 'revenue', label: 'Revenue', visible: true, sortable: true },
        { id: 'currency', label: 'Currency', visible: true, sortable: true },
        { id: 'labor_cost', label: 'Labor Cost', visible: true, sortable: true },
        { id: 'profit', label: 'Profit', visible: true, sortable: true },
        { id: 'margin', label: 'Margin', visible: true, sortable: true },
        { id: 'vendor_po', label: 'Vendor PO', visible: true, sortable: true },
        { id: 'pre_visit', label: 'Pre Visit', visible: false, sortable: true },
        { id: 'post_visit', label: 'Post Visit', visible: false, sortable: true },
        { id: 'notes', label: 'Notes', visible: false, sortable: true }
    ],
    pageSize: 10,
    currentPage: 1,
    sortColumn: 'completed_date',
    sortDirection: 'desc'
};

let billingCurrentStep = 2;

// ==================== DATA FETCHING ====================

async function fetchBillingTickets() {
    try {
        console.log("Fetching billing data...");
        const response = await fetch('/billing/api/final-data/');
        const result = await response.json();
        if (result.success) {
            finalTickets = (result.data || []).filter(t => t.band != null);
            populateBillingFilterDropdowns();
            applyBillingFilters();
        }
    } catch (error) { console.error('Fetch error:', error); }
}

// ==================== FILTER DROPDOWNS ====================

function populateBillingFilterDropdowns() {
    const customers = new Set();
    const accounts = new Set();
    const regions = new Set();

    finalTickets.forEach(ticket => {
        if (ticket.customer) customers.add(ticket.customer);
        if (ticket.account) accounts.add(ticket.account);
        if (ticket.data_table && ticket.data_table.region) regions.add(ticket.data_table.region);
    });

    updateDropdown('billingCustomerFilter', customers, 'All Customers');
    updateDropdown('billingAccountFilter', accounts, 'All Accounts');
    updateDropdown('billingRegionFilter', regions, 'All Regions');
}

function updateDropdown(id, valueSet, defaultText) {
    const select = document.getElementById(id);
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = `<option value="">${defaultText}</option>`;
    Array.from(valueSet).sort().forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        if (val === currentValue) option.selected = true;
        select.appendChild(option);
    });
}

// ==================== COLUMN TOGGLE ====================

function initBillingColumnToggle() {
    const columnsMenu = document.getElementById('columnsMenu');
    const toggleBtn = document.getElementById('toggleColumns');
    if (!columnsMenu || !toggleBtn) return;
    toggleBtn.onclick = (e) => {
        e.stopPropagation();
        columnsMenu.classList.toggle('active');
    };
    document.addEventListener('click', (e) => {
        if (!columnsMenu.contains(e.target) && e.target !== toggleBtn) {
            columnsMenu.classList.remove('active');
        }
    });
    columnsMenu.innerHTML = '';
    billingTableConfig.columns.forEach(column => {
        const item = document.createElement('div');
        item.className = 'columns-menu-item';
        item.style.padding = '8px 12px';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '10px';
        item.style.cursor = 'pointer';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = column.visible;
        const label = document.createElement('label');
        label.textContent = column.label;
        label.style.marginBottom = '0';
        item.appendChild(checkbox);
        item.appendChild(label);
        item.onclick = () => {
            checkbox.checked = !checkbox.checked;
            column.visible = checkbox.checked;
            renderBillingTable();
        };
        checkbox.onclick = (e) => { e.stopPropagation(); column.visible = checkbox.checked; renderBillingTable(); };
        columnsMenu.appendChild(item);
    });
}

function initTicketManagerModal() {
    const tmBtn = document.getElementById('ticketManagerBtn');
    const tmModal = document.getElementById('ticketManagerModal');
    const closeBtn1 = document.getElementById('closeTicketManagerModal');
    const closeBtn2 = document.getElementById('closeTicketManagerBtn');

    if (tmBtn && tmModal) {
        tmBtn.addEventListener('click', () => {
            tmModal.classList.add('active');
            fetchAvailableVersionedFiles();
        });
    }

    if (closeBtn1) closeBtn1.addEventListener('click', () => tmModal.classList.remove('active'));
    if (closeBtn2) closeBtn2.addEventListener('click', () => tmModal.classList.remove('active'));

    // Tab switching for Ticket Manager modal
    document.querySelectorAll('#ticketManagerModal .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tm-tab');

            // Update button states
            document.querySelectorAll('#ticketManagerModal .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content states 
            document.querySelectorAll('#ticketManagerModal .tab-content').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Capitalize first letter logic (available -> Available)
            const activeTab = document.getElementById(`tm${tabId.charAt(0).toUpperCase() + tabId.slice(1)}Tab`);
            if (activeTab) {
                activeTab.classList.add('active');
                activeTab.style.display = 'block';
            }
        });
    });

    // Setup filter inputs inside each tab
    setupTicketManagerFilters();
}

function setupTicketManagerFilters() {
    const tabs = document.querySelectorAll('#ticketManagerModal .tab-content');
    tabs.forEach(tab => {
        const searchInput = Array.from(tab.querySelectorAll('.tm-filter-input')).find(el => el.placeholder === 'Search files...');
        const versionInput = Array.from(tab.querySelectorAll('.tm-filter-input')).find(el => el.placeholder === 'Enter version (e.g. v1)');
        const clearBtn = tab.querySelector('.tm-btn-clear');
        const tableRows = tab.querySelectorAll('tbody tr');

        function filterRows() {
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            const versionTerm = versionInput ? versionInput.value.toLowerCase() : '';

            tableRows.forEach(row => {
                // Ignore "no files found" placeholder rows
                if (row.cells.length === 1 && row.cells[0].colSpan > 1) return;

                const textContent = row.textContent.toLowerCase();

                let matchesSearch = textContent.includes(searchTerm);
                let matchesVersion = !versionTerm || textContent.includes(versionTerm);

                if (matchesSearch && matchesVersion) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        if (searchInput) searchInput.addEventListener('input', filterRows);
        if (versionInput) versionInput.addEventListener('input', filterRows);

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (versionInput) versionInput.value = '';
                filterRows();
            });
        }
    });
}

// ==================== TICKET MANAGER API ====================
function fetchAvailableVersionedFiles() {
    fetch('/billing/api/available-versioned-files/')
        .then(response => response.json())
        .then(data => {
            if (data.files) {
                renderAvailableFilesTab(data.files);
            }
        })
        .catch(err => console.error("Error fetching available files:", err));
}

function renderAvailableFilesTab(files) {
    const tbody = document.querySelector('#tmAvailableTab tbody');
    if (!tbody) return;

    if (files.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px; color: #64748b;">No available files found.</td></tr>`;
        return;
    }

    let rowsHtml = '';
    files.forEach(f => {
        rowsHtml += `
            <tr>
                <td><input type="checkbox" class="tm-radio" value="${f.filename}"></td>
                <td>${f.original_name}</td>
                <td><span class="tm-status-badge sent">V${f.version}.0</span></td>
                <td><span class="tm-status-badge amount" style="background:#f1f5f9; color:#475569; font-weight:normal;">${f.notes || '-'}</span></td>
                <td>${f.creation_date}</td>
                <td>-</td>
                <td><span class="tm-status-badge amount">${f.ticket_count}</span></td>
                <td><span class="tm-status-badge sent">AVAILABLE</span></td>
                <td>
                    <div class="tm-actions">
                        <button class="tm-act-btn" onclick="previewFile('${f.filename}', '${f.file_type}')" title="Preview File"><i class="fas fa-eye"></i></button>
                        <button class="tm-act-btn" onclick="downloadFile('${f.filename}')" title="Download File"><i class="fas fa-download"></i></button>
                        <button class="tm-act-btn pink" onclick="sendForCalculation('${f.filename}')" title="Send for Calculation"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

function previewFile(filename, fileType) {
    const modal = document.getElementById('filePreviewModal');
    const body = document.getElementById('filePreviewBody');
    const title = document.getElementById('filePreviewTitle');
    if (!modal || !body) return;

    title.innerHTML = `<i class="fas fa-eye"></i> Preview: ${filename}`;
    body.innerHTML = '<div style="text-align:center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Loading preview...</p></div>';
    modal.classList.add('active');

    const fileUrl = `/billing/api/file-serve/${filename}/`;

    if (fileType === 'pdf') {
        body.innerHTML = `<iframe src="${fileUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
    } else if (fileType === 'csv' || fileType === 'xlsx' || fileType === 'xls') {
        // Fetch binary and pass to SheetJS
        fetch(fileUrl)
            .then(res => res.arrayBuffer())
            .then(ab => {
                const workbook = XLSX.read(ab, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                // Convert to HTML string
                const htmlStr = XLSX.utils.sheet_to_html(worksheet, { id: "previewExcelTable", editable: false });
                body.innerHTML = `
                    <style>
                        #previewExcelTable { width: 100%; border-collapse: collapse; background: white; }
                        #previewExcelTable td, #previewExcelTable th { border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 14px; }
                        #previewExcelTable tr:nth-child(even) { background-color: #f8fafc; }
                    </style>
                    <div style="overflow: auto; max-height: 100%; padding: 10px;">${htmlStr}</div>
                `;
            })
            .catch(err => {
                console.error("Error previewing excel:", err);
                body.innerHTML = `<div style="text-align:center; color: red; padding: 40px;">Failed to load preview.</div>`;
            });
    } else {
        body.innerHTML = `<div style="text-align:center; padding: 40px;">Preview not supported for this file type.</div>`;
    }
}

function downloadFile(filename) {
    window.location.href = `/billing/api/file-serve/${filename}/?download=1`;
}

function sendForCalculation(filename) {
    alert("Sending " + filename + " for calculation! (Backend connection pending)");
    // TODO: Wire up actual calculation API here
}

// Bind the modal close buttons for File Preview Modal
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn1 = document.getElementById('closeFilePreviewModal');
    const closeBtn2 = document.getElementById('closeFilePreviewBtn');
    const modal = document.getElementById('filePreviewModal');

    if (closeBtn1) closeBtn1.addEventListener('click', () => modal.classList.remove('active'));
    if (closeBtn2) closeBtn2.addEventListener('click', () => modal.classList.remove('active'));
});

// ==================== TABLE RENDERING ====================

function renderBillingTable() {
    const tableBody = document.getElementById('billingMonitorTableBody');
    const thead = document.querySelector('#managementTable thead tr');
    if (!tableBody || !thead) return;

    thead.innerHTML = '';
    billingTableConfig.columns.forEach(column => {
        if (!column.visible) return;
        const th = document.createElement('th');
        if (column.id === 'selection') {
            th.innerHTML = column.label;
        } else {
            th.textContent = column.label;
        }
        if (column.sortable) {
            th.className = 'sortable';
            if (billingTableConfig.sortColumn === column.id) th.classList.add(billingTableConfig.sortDirection);
            th.onclick = () => sortBillingTable(column.id);
        }
        thead.appendChild(th);
    });
    const actionsTh = document.createElement('th');
    actionsTh.textContent = 'Actions';
    thead.appendChild(actionsTh);

    const startIndex = (billingTableConfig.currentPage - 1) * billingTableConfig.pageSize;
    const pageData = filteredBillingData.slice(startIndex, startIndex + billingTableConfig.pageSize);
    tableBody.innerHTML = pageData.length ? '' : '<tr><td colspan="100%" style="text-align:center; padding: 40px;">No matching records found</td></tr>';

    pageData.forEach(ticket => {
        const row = document.createElement('tr');
        const dataTable = ticket.data_table || {};
        billingTableConfig.columns.forEach(column => {
            if (!column.visible) return;
            const td = document.createElement('td');
            let val = '-';
            switch (column.id) {
                case 'selection': val = `<input type="checkbox" class="ticket-checkbox" value="${ticket.uuid}" onclick="event.stopPropagation()">`; break;
                case 'version': val = '-'; break;
                case 'request_id': val = ticket.request_id || dataTable.request_id || '-'; break;
                case 'ticket_number': val = `<strong>${ticket.ticket_number || dataTable.ticket_number || '-'}</strong>`; break;
                case 'customer': val = ticket.customer || dataTable.customer || '-'; break;
                case 'customer_reference': val = dataTable.customer_reference || '-'; break;
                case 'requester': val = dataTable.requester || '-'; break;
                case 'subject': val = dataTable.subject || '-'; break;
                case 'site_name': val = dataTable.site_name || '-'; break;
                case 'priority': val = dataTable.priority || '-'; break;
                case 'technician_name': val = dataTable.technician_name || '-'; break;
                case 'status': val = `<span class="status-badge status-success">${dataTable.status || 'Finalized'}</span>`; break;
                case 'worklog_type': val = dataTable.worklog_type || '-'; break;
                case 'completed_date': val = dataTable.completed_date || '-'; break;
                case 'account': val = ticket.account || dataTable.account || '-'; break;
                case 'region': val = dataTable.region || '-'; break;
                case 'country': val = dataTable.country || '-'; break;
                case 'city': val = dataTable.city || '-'; break;
                case 'contact_email': val = dataTable.contact_email || '-'; break;
                case 'band': val = dataTable.band || '-'; break;
                case 'total_hours': val = dataTable.total_hours || '-'; break;
                case 'hourly_rate': val = dataTable.hourly_rate || '-'; break;
                case 'revenue': val = dataTable.revenue || '-'; break;
                case 'currency': val = dataTable.currency || '-'; break;
                case 'labor_cost': val = dataTable.labor_cost || '-'; break;
                case 'profit': val = dataTable.profit || '-'; break;
                case 'margin': val = dataTable.margin || '-'; break;
                case 'vendor_po': val = dataTable.vendor_po || '-'; break;
                case 'pre_visit': val = dataTable.pre_visit || '-'; break;
                case 'post_visit': val = dataTable.post_visit || '-'; break;
                case 'notes': val = dataTable.notes || '-'; break;
                case 'created_at': val = `<small>${new Date(ticket.created_at).toLocaleString()}</small>`; break;
            }
            td.innerHTML = val;
            row.appendChild(td);
        });
        const actionsTd = document.createElement('td');
        actionsTd.innerHTML = `<button class="action-btn btn-view" onclick="alert('Viewing ticket ${ticket.ticket_number}')"><i class="fas fa-eye"></i></button>`;
        row.appendChild(actionsTd);
        tableBody.appendChild(row);
    });
    updateBillingPagination();
}

function updateBillingPagination() {
    const pc = document.getElementById('paginationControls');
    if (!pc) return;
    const totalPages = Math.ceil(filteredBillingData.length / billingTableConfig.pageSize);
    if (!filteredBillingData.length) { pc.innerHTML = ''; return; }
    const start = (billingTableConfig.currentPage - 1) * billingTableConfig.pageSize + 1;
    const end = Math.min(billingTableConfig.currentPage * billingTableConfig.pageSize, filteredBillingData.length);
    pc.innerHTML = `
        <div class="pagination-info">Showing ${start}-${end} of ${filteredBillingData.length} records</div>
        <div class="pagination-buttons">
            <button class="page-btn ${billingTableConfig.currentPage === 1 ? 'disabled' : ''}" onclick="changeBillingPage(${billingTableConfig.currentPage - 1})"><i class="fas fa-chevron-left"></i></button>
            <span style="padding: 0 10px;">Page ${billingTableConfig.currentPage} of ${totalPages}</span>
            <button class="page-btn ${billingTableConfig.currentPage === totalPages ? 'disabled' : ''}" onclick="changeBillingPage(${billingTableConfig.currentPage + 1})"><i class="fas fa-chevron-right"></i></button>
        </div>
    `;
}

window.changeBillingPage = (page) => { if (page >= 1 && page <= Math.ceil(filteredBillingData.length / billingTableConfig.pageSize)) { billingTableConfig.currentPage = page; renderBillingTable(); } };

function sortBillingTable(columnId) {
    if (billingTableConfig.sortColumn === columnId) billingTableConfig.sortDirection = billingTableConfig.sortDirection === 'asc' ? 'desc' : 'asc';
    else { billingTableConfig.sortColumn = columnId; billingTableConfig.sortDirection = 'asc'; }
    filteredBillingData.sort((a, b) => {
        let aVal = a[columnId] || (a.data_table && a.data_table[columnId]) || '';
        let bVal = b[columnId] || (b.data_table && b.data_table[columnId]) || '';
        return billingTableConfig.sortDirection === 'asc' ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true }) : String(bVal).localeCompare(String(aVal), undefined, { numeric: true });
    });
    renderBillingTable();
}

function applyBillingFilters() {
    const region = document.getElementById('billingRegionFilter')?.value;
    const customer = document.getElementById('billingCustomerFilter')?.value;
    const account = document.getElementById('billingAccountFilter')?.value;
    const search = document.getElementById('billingSearchInput')?.value.toLowerCase();
    filteredBillingData = finalTickets.filter(t => {
        if (region && t.data_table?.region !== region) return false;
        if (customer && t.customer !== customer) return false;
        if (account && t.account !== account) return false;
        if (search) {
            const text = `${t.ticket_number} ${t.request_id} ${t.customer}`.toLowerCase();
            if (!text.includes(search)) return false;
        }
        return true;
    });
    billingTableConfig.currentPage = 1;
    renderBillingTable();
}

// ==================== QUICK VIEW (INITIAL DATA) ====================

let initialTickets = [];
let quickViewTab = 'dedicated';

const quickViewConfig = {
    dedicated: {
        tableId: 'dedicatedInitialTable', bodyId: 'dedicatedInitialBody',
        cols: [
            { id: 'account', label: 'Account' },
            { id: 'actual_cost', label: 'Actual Cost' },
            { id: 'address', label: 'Address' },
            { id: 'attendance_approved', label: 'Attendance Approved' },
            { id: 'band', label: 'Band' },
            { id: 'city', label: 'City' },
            { id: 'country', label: 'Country' },
            { id: 'currency', label: 'Currency' },
            { id: 'customer', label: 'Customer' },
            { id: 'dedicated_id', label: 'Dedicated ID' },
            { id: 'end_date', label: 'End Date' },
            { id: 'monthly_rate', label: 'Monthly Rate' },
            { id: 'notes', label: 'Notes' },
            { id: 'worked_days', label: 'Number of Worked Days' },
            { id: 'working_days', label: 'Number of Working Days' },
            { id: 'ot_cost', label: 'OT Cost' },
            { id: 'ot_hours', label: 'OT Hours' },
            { id: 'ot_rate', label: 'OT Rate' },
            { id: 'postal_code', label: 'Postal Code' },
            { id: 'region', label: 'Region' },
            { id: 'service_month', label: 'Service Month' },
            { id: 'site_name', label: 'Site Name' },
            { id: 'sla_percentage', label: 'SLA %' },
            { id: 'sla_reason', label: 'SLA Failure Reason' },
            { id: 'sla_met', label: 'SLA Met' },
            { id: 'start_date', label: 'Start Date' },
            { id: 'status', label: 'Status' },
            { id: 'tax_percent', label: 'Tax %' },
            { id: 'tax_cost', label: 'Tax Cost' },
            { id: 'technician_id', label: 'Technician ID' },
            { id: 'technician_name', label: 'Technician Name' },
            { id: 'ticket_number', label: 'Ticket Number' },
            { id: 'total_cost', label: 'Total Cost' },
            { id: 'travel_extra_cost', label: 'Travel/Extra Cost' },
            { id: 'variant', label: 'Variant' },
            { id: 'vendor_po', label: 'Vendor PO' },
            { id: 'weekend_cost', label: 'Weekend Cost' },
            { id: 'weekend_ot_hours', label: 'Weekend OT Hours' },
            { id: 'weekend_rate', label: 'Weekend Rate' }
        ]
    },
    sv_visit: {
        tableId: 'sv_visitInitialTable', bodyId: 'sv_visitInitialBody',
        cols: [
            { id: 'account', label: 'Account' },
            { id: 'address', label: 'Address' },
            { id: 'arrival_time', label: 'Arrival Time' },
            { id: 'city', label: 'City' },
            { id: 'country', label: 'Country' },
            { id: 'currency', label: 'Currency' },
            { id: 'customer', label: 'Customer' },
            { id: 'departure_time', label: 'Departure Time' },
            { id: 'full_day_rate', label: 'Full Day Rate' },
            { id: 'half_day_rate', label: 'Half Day Rate' },
            { id: 'notes', label: 'Notes' },
            { id: 'out_of_office_cost', label: 'Out of Office Cost' },
            { id: 'out_of_office_hours', label: 'Out of Office Hours' },
            { id: 'out_of_office_rate', label: 'Out of Office Rate' },
            { id: 'per_hour_rate', label: 'Per Hour Rate' },
            { id: 'postal_code', label: 'Postal Code' },
            { id: 'rate', label: 'Rate' },
            { id: 'region', label: 'Region' },
            { id: 'request_id', label: 'Request ID' },
            { id: 'scheduled_date', label: 'Scheduled Date' },
            { id: 'service_month', label: 'Service Month' },
            { id: 'site_name', label: 'Site Name' },
            { id: 'sla_reason', label: 'SLA Failure Reason' },
            { id: 'sla_met', label: 'SLA Met' },
            { id: 'status', label: 'Status' },
            { id: 'sv_id', label: 'SV ID' },
            { id: 'tax_percent', label: 'Tax %' },
            { id: 'tax_cost', label: 'Tax Cost' },
            { id: 'technician_id', label: 'Technician ID' },
            { id: 'technician_in_date', label: 'Technician IN Date' },
            { id: 'technician_name', label: 'Technician Name' },
            { id: 'ticket_number', label: 'Ticket Number' },
            { id: 'total_cost', label: 'Total Cost' },
            { id: 'total_cost_inc_tax', label: 'Total Cost (Inc Tax)' },
            { id: 'total_hours', label: 'Total Hours' },
            { id: 'travel_extra_cost', label: 'Travel/Extra Cost' },
            { id: 'vendor_po', label: 'Vendor PO' },
            { id: 'category_visit', label: 'Visit Category' },
            { id: 'visit_date', label: 'Visit Date' },
            { id: 'visit_type', label: 'Visit Type' },
            { id: 'weekend_rate', label: 'Weekend Rate' }
        ]
    },
    project: {
        tableId: 'projectInitialTable', bodyId: 'projectInitialBody',
        cols: [
            { id: 'account', label: 'Account' },
            { id: 'actual_cost', label: 'Actual Cost' },
            { id: 'address', label: 'Address' },
            { id: 'attendance_approved', label: 'Attendance Approved' },
            { id: 'band', label: 'Band' },
            { id: 'budget', label: 'Budget' },
            { id: 'city', label: 'City' },
            { id: 'country', label: 'Country' },
            { id: 'customer', label: 'Customer' },
            { id: 'end_date', label: 'End Date' },
            { id: 'monthly_rate', label: 'Monthly Rate' },
            { id: 'notes', label: 'Notes' },
            { id: 'worked_days', label: 'Number of Worked Days' },
            { id: 'working_days', label: 'Number of Working Days' },
            { id: 'ot_cost', label: 'OT Cost' },
            { id: 'ot_hours', label: 'OT Hours' },
            { id: 'ot_rate', label: 'OT Rate' },
            { id: 'postal_code', label: 'Postal Code' },
            { id: 'project_id', label: 'Project ID' },
            { id: 'project_manager', label: 'Project Manager' },
            { id: 'project_name', label: 'Project Name' },
            { id: 'region', label: 'Region' },
            { id: 'service_month', label: 'Service Month' },
            { id: 'sla_percentage', label: 'SLA %' },
            { id: 'sla_reason', label: 'SLA Failure Reason' },
            { id: 'sla_met', label: 'SLA Met' },
            { id: 'start_date', label: 'Start Date' },
            { id: 'status', label: 'Status' },
            { id: 'tax_percent', label: 'Tax %' },
            { id: 'tax_cost', label: 'Tax Cost' },
            { id: 'team_size', label: 'Team Size' },
            { id: 'technician_name', label: 'Technician Name' },
            { id: 'ticket_number', label: 'Ticket Number' },
            { id: 'total_cost', label: 'Total Cost' },
            { id: 'travel_extra_cost', label: 'Travel/Extra Cost' },
            { id: 'variant', label: 'Variant' },
            { id: 'vendor_po', label: 'Vendor PO' },
            { id: 'weekend_cost', label: 'Weekend Cost' },
            { id: 'weekend_ot_hours', label: 'Weekend OT Hours' },
            { id: 'weekend_rate', label: 'Weekend Rate' }
        ]
    },
    dispatch: {
        tableId: 'dispatchInitialTable', bodyId: 'dispatchInitialBody',
        cols: [
            { id: 'account', label: 'Account' },
            { id: 'address', label: 'Address' },
            { id: 'after_hours_cost', label: 'After Hours Cost' },
            { id: 'after_hours_qty', label: 'After Hours Qty' },
            { id: 'after_hours_rate', label: 'After Hours Rate' },
            { id: 'arrival_time', label: 'Arrival Time' },
            { id: 'city', label: 'City' },
            { id: 'country', label: 'Country' },
            { id: 'csr_report', label: 'CSR Report Submitted' },
            { id: 'currency', label: 'Currency' },
            { id: 'customer', label: 'Customer' },
            { id: 'departure_time', label: 'Departure Time' },
            { id: 'dispatch_date', label: 'Dispatch Date' },
            { id: 'dispatch_id', label: 'Dispatch ID' },
            { id: 'first_hour_cost', label: 'First Hour Cost' },
            { id: 'first_hour_qty', label: 'First Hour Qty' },
            { id: 'first_hour_rate', label: 'First Hour Rate' },
            { id: 'notes', label: 'Notes' },
            { id: 'onsite_time', label: 'Onsite Time' },
            { id: 'ot_cost', label: 'OT Cost' },
            { id: 'ot_hours', label: 'OT Hours' },
            { id: 'ot_rate', label: 'OT Rate' },
            { id: 'out_of_office_cost', label: 'Out of Office Cost' },
            { id: 'out_of_office_hours', label: 'Out of Office Hours' },
            { id: 'out_of_office_rate', label: 'Out of Office Rate' },
            { id: 'postal_code', label: 'Postal Code' },
            { id: 'region', label: 'Region' },
            { id: 'request_id', label: 'Request ID' },
            { id: 'scheduled_date', label: 'Scheduled Date' },
            { id: 'service_month', label: 'Service Month' },
            { id: 'site_name', label: 'Site Name' },
            { id: 'sla_reason', label: 'SLA Failure Reason' },
            { id: 'sla_met', label: 'SLA Met' },
            { id: 'status', label: 'Status' },
            { id: 'tax_percent', label: 'Tax %' },
            { id: 'tax_cost', label: 'Tax Cost' },
            { id: 'technician_id', label: 'Technician ID' },
            { id: 'technician_in_date', label: 'Technician IN Date' },
            { id: 'technician_name', label: 'Technician Name' },
            { id: 'ticket_number', label: 'Ticket Number' },
            { id: 'total_cost', label: 'Total Cost' },
            { id: 'total_cost_inc_tax', label: 'Total Cost (Inc Tax)' },
            { id: 'total_hours', label: 'Total Hours' },
            { id: 'travel_time', label: 'Travel Time' },
            { id: 'travel_extra_cost', label: 'Travel/Extra Cost' },
            { id: 'vendor_po', label: 'Vendor PO' },
            { id: 'weekend_cost', label: 'Weekend Cost' },
            { id: 'weekend_ot_hours', label: 'Weekend OT Hours' },
            { id: 'weekend_rate', label: 'Weekend Rate' }
        ]
    }
};

async function fetchInitialTickets() {
    try {
        console.log("Fetching initial raw data...");
        const response = await fetch('/billing/api/initial-data/');
        const result = await response.json();
        if (result.success) {
            console.log("Initial raw data received:", result.data.length, "items");
            initialTickets = result.data;
            renderQuickViewTabs();
        } else {
            console.error("Error fetching initial data:", result.error);
        }
    } catch (error) { console.error('Fetch error:', error); }
}

function renderQuickViewTabs() {
    Object.keys(quickViewConfig).forEach(tab => renderQuickViewTable(tab));
}

function renderQuickViewTable(tab) {
    const config = quickViewConfig[tab];
    const table = document.getElementById(config.tableId);
    const body = document.getElementById(config.bodyId);
    if (!table || !body) return;

    // Ensure Headers are built with an Actions column for the Eye icon
    const thead = table.querySelector('thead');
    if (thead.rows.length === 0 || thead.innerHTML.trim() === '') {
        thead.innerHTML = '<tr>' + config.cols.map(c => `<th>${c.label}</th>`).join('') + '<th>Actions</th></tr>';
    }

    // ALL DATA goes to EVERY TAB
    let displayData = initialTickets;

    // Apply Search Filter if present
    const search = document.getElementById('quickViewSearchInput')?.value.toLowerCase();
    if (search) {
        displayData = displayData.filter(t => {
            const dt = t.data_table || {};
            const text = `${t.customer} ${t.account} ${t.ticket_number} ${t.request_id} ${dt.customer} ${dt.account} ${dt.ticket_number} ${dt.request_id} ${dt.subject}`.toLowerCase();
            return text.includes(search);
        });
    }

    if (displayData.length === 0) {
        body.innerHTML = `<tr><td colspan="${config.cols.length + 1}" style="text-align:center; padding: 20px; color: #666;">No data found</td></tr>`;

        // If form view is active, update it to show empty state
        if (qvCurrentMode === 'form') renderQuickViewForm();
        return;
    }

    // Map data to columns, fill missing with "-", and add Action Button
    body.innerHTML = displayData.map((t, index) => {
        const dt = t.data_table || {};
        const cells = config.cols.map(c => {
            let val = (dt[c.id] !== undefined && dt[c.id] !== null) ? dt[c.id] : (t[c.id] !== undefined && t[c.id] !== null ? t[c.id] : '-');
            const sVal = String(val).trim().toLowerCase();
            if (val === "" || sVal === "na" || sVal === "n/a" || sVal === "null" || sVal === "nan" || sVal === "undefined") {
                val = '-';
            }
            return `<td>${val}</td>`;
        }).join('');

        const actionCell = `<td><button class="control-btn secondary" style="padding: 4px 8px;" onclick="openQuickViewForm(${index})" title="View in Form"><i class="fas fa-eye"></i></button></td>`;

        return `<tr>${cells}${actionCell}</tr>`;
    }).join('');

    // If form view is currently active, ensure it syncs with any search changes
    if (qvCurrentMode === 'form') {
        renderQuickViewForm();
    }
}

function toggleQuickViewMode(forceMode = null) {
    qvCurrentMode = forceMode || (qvCurrentMode === 'table' ? 'form' : 'table');

    const tableContainer = document.getElementById('quickViewTableContainer');
    const formContainer = document.getElementById('quickViewFormContainer');
    const toggleBtn = document.getElementById('toggleQuickViewModeBtn');

    if (qvCurrentMode === 'form') {
        tableContainer.style.display = 'none';
        formContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-table"></i> Table View';
        renderQuickViewForm();
    } else {
        tableContainer.style.display = 'block';
        formContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-list-alt"></i> Form View';
    }
}

// ---- NEW FUNCTION: Open Form from Row Eye Button ----
window.openQuickViewForm = function (index) {
    qvCurrentRecordIndex = index;
    toggleQuickViewMode('form');
};

// ---- REPLACEMENT FUNCTION: Render the Form View Grid & Pagination ----
function renderQuickViewForm() {
    const container = document.getElementById('qvFormContent');
    const counter = document.getElementById('qvFormRecordCounter');
    const prevBtn = document.getElementById('qvFormPrevBtn');
    const nextBtn = document.getElementById('qvFormNextBtn');
    const tabNameDisplay = document.getElementById('qvFormActiveTabName');

    const tabNames = { 'dedicated': 'Dedicated', 'project': 'Project', 'sv_visit': 'SV Full & Half Day', 'dispatch': 'Dispatch' };
    tabNameDisplay.textContent = tabNames[quickViewTab] || 'Details';

    let displayData = initialTickets;
    const search = document.getElementById('quickViewSearchInput')?.value.toLowerCase();
    if (search) {
        displayData = displayData.filter(t => {
            const dt = t.data_table || {};
            const text = `${t.customer} ${t.account} ${t.ticket_number} ${t.request_id} ${dt.customer} ${dt.account} ${dt.ticket_number} ${dt.request_id} ${dt.subject}`.toLowerCase();
            return text.includes(search);
        });
    }

    if (displayData.length === 0) {
        container.innerHTML = '<div style="width: 100%; text-align: center; padding: 20px;">No records match your search.</div>';
        counter.textContent = 'Record 0 of 0';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    if (qvCurrentRecordIndex >= displayData.length) qvCurrentRecordIndex = displayData.length - 1;
    if (qvCurrentRecordIndex < 0) qvCurrentRecordIndex = 0;

    const ticket = displayData[qvCurrentRecordIndex];
    const dt = ticket.data_table || {};
    const config = quickViewConfig[quickViewTab];

    counter.textContent = `Record ${qvCurrentRecordIndex + 1} of ${displayData.length}`;

    const groups = {
        details: { title: 'General Details', icon: 'fa-info-circle', cols: [] },
        location: { title: 'Location Details', icon: 'fa-map-marked-alt', cols: [] },
        resource: { title: 'Resource Details', icon: 'fa-users', cols: [] },
        dates_sla: { title: 'Dates & SLA', icon: 'fa-calendar-check', cols: [] },
        cost: { title: 'Cost Summary', icon: 'fa-calculator', cols: [] }
    };

    const locationKeys = ['address', 'city', 'country', 'region', 'postal_code', 'site_name'];
    const resourceKeys = ['technician_name', 'technician_id', 'band', 'variant', 'working_days', 'worked_days', 'attendance_approved', 'team_size', 'project_manager'];
    const costKeys = ['total_cost', 'total_cost_inc_tax', 'actual_cost', 'budget', 'monthly_rate', 'daily_rate', 'rate', 'currency', 'ot_cost', 'ot_rate', 'tax_cost', 'tax_percent', 'travel_extra_cost', 'weekend_cost', 'weekend_rate', 'first_hour_cost', 'first_hour_rate', 'after_hours_cost', 'after_hours_rate', 'out_of_office_cost', 'out_of_office_rate', 'half_day_rate', 'full_day_rate', 'revenue', 'profit', 'margin'];
    const dateSlaKeys = ['start_date', 'end_date', 'service_month', 'visit_date', 'dispatch_date', 'scheduled_date', 'arrival_time', 'departure_time', 'onsite_time', 'travel_time', 'sla_percentage', 'sla_met', 'sla_reason', 'technician_in_date'];

    config.cols.forEach(c => {
        if (locationKeys.includes(c.id)) groups.location.cols.push(c);
        else if (resourceKeys.includes(c.id)) groups.resource.cols.push(c);
        else if (costKeys.includes(c.id)) groups.cost.cols.push(c);
        else if (dateSlaKeys.includes(c.id)) groups.dates_sla.cols.push(c);
        else groups.details.cols.push(c);
    });

    container.style.display = 'block';
    let html = '';

    Object.values(groups).forEach(group => {
        if (group.cols.length === 0) return;

        html += `
            <div style="width: 100%; margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">
                    <i class="fas ${group.icon}" style="color: #6c757d; margin-right: 8px;"></i>${group.title}
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
        `;

        group.cols.forEach(c => {
            let val = (dt[c.id] !== undefined && dt[c.id] !== null) ? dt[c.id] : (ticket[c.id] !== undefined && ticket[c.id] !== null ? ticket[c.id] : '-');
            const sVal = String(val).trim().toLowerCase();
            if (val === "" || sVal === "na" || sVal === "n/a" || sVal === "null" || sVal === "nan" || sVal === "undefined") {
                val = '-';
            }

            if (c.id === 'sla_met' && val === 'Yes') {
                val = `<span class="status-badge status-success" style="padding: 2px 8px; border-radius: 4px; background: #e6f4ea; color: #28a745;">${val}</span>`;
            } else if (c.id === 'sla_met' && val === 'No') {
                val = `<span class="status-badge status-danger" style="padding: 2px 8px; border-radius: 4px; background: #fce4e4; color: #dc3545;">${val}</span>`;
            }

            html += `
                <div style="background: white; padding: 12px 15px; border-radius: 6px; border: 1px solid #ced4da; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; margin-bottom: 5px; font-weight: 600;">${c.label}</label>
                    <div style="font-size: 14px; color: #212529; word-break: break-word;">${val}</div>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    // --- LOOKUP BAND DATA FROM FINAL TICKETS ---
    const matchingFinalTicket = finalTickets.find(ft => ft.initial_ticket_uuid === ticket.uuid);

    if (matchingFinalTicket && matchingFinalTicket.band && matchingFinalTicket.band.band_data) {
        const tabBandData = matchingFinalTicket.band.band_data[quickViewTab];
        if (tabBandData) {
            html += generateBandHtml(tabBandData, quickViewTab);
        }
    }

    // --- APPEND ATTACHMENTS & APPROVALS SECTIONS ---
    html += `
        <div style="width: 100%; margin-top: 30px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e9ecef; padding-bottom: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0; font-size: 16px; color: #495057; display: flex; align-items: center;">
                    <i class="fas fa-file-invoice" style="color: #6f42c1; margin-right: 8px;"></i> Ticket References
                    <span style="background: #6f42c1; color: white; border-radius: 50%; padding: 2px 8px; font-size: 11px; margin-left: 10px; font-weight: bold;">0</span>
                </h4>
                <button class="control-btn info" style="padding: 6px 14px; font-size: 13px; background-color: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-plus"></i> Add Ticket
                </button>
            </div>
            <div style="background: #f8f9fa; border: 1px dashed #ced4da; border-radius: 6px; padding: 40px; text-align: center; color: #6c757d;">
                No ticket references available.
            </div>
        </div>

        <div style="width: 100%; margin-top: 30px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e9ecef; padding-bottom: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0; font-size: 16px; color: #495057; display: flex; align-items: center;">
                    <i class="fas fa-file-signature" style="color: #6f42c1; margin-right: 8px;"></i> Files for Approval
                    <span style="background: #6f42c1; color: white; border-radius: 50%; padding: 2px 8px; font-size: 11px; margin-left: 10px; font-weight: bold;">0</span>
                </h4>
                <button class="control-btn success" style="padding: 6px 14px; font-size: 13px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-upload"></i> Upload for Approval
                </button>
            </div>
            <div style="background: #f8f9fa; border: 1px dashed #ced4da; border-radius: 6px; padding: 40px; text-align: center; color: #6c757d;">
                No files pending approval.
            </div>
        </div>
    `;

    container.innerHTML = html;

    prevBtn.disabled = qvCurrentRecordIndex === 0;
    nextBtn.disabled = qvCurrentRecordIndex === displayData.length - 1;
}

// ---- NEW HELPER FUNCTIONS FOR BAND DATA ----
function generateBandHtml(tabBandData, tabName) {
    let html = `
    <div style="width: 100%; margin-top: 30px; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e9ecef; padding-bottom: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0; font-size: 16px; color: #495057; display: flex; align-items: center;">
                <i class="fas fa-chart-bar" style="color: #007bff; margin-right: 8px;"></i> Band Details
            </h4>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
    `;

    const firstKey = Object.keys(tabBandData)[0];
    if (!firstKey) return '';

    // Check if nested (like Project) or direct array (like Dedicated)
    if (Array.isArray(tabBandData[firstKey])) {
        html += buildBandTable(tabName.toUpperCase(), tabBandData, tabName);
    } else {
        Object.entries(tabBandData).forEach(([subCategory, bandObj]) => {
            html += buildBandTable(subCategory, bandObj, tabName);
        });
    }

    html += `</div></div>`;
    return html;
}

function buildBandTable(title, bandObj, tabName) {
    let maxCols = 0;
    Object.values(bandObj).forEach(arr => {
        if (Array.isArray(arr) && arr.length > maxCols) maxCols = arr.length;
    });

    // Dynamic headers based on tab structure
    let headers = ['Band'];
    if (tabName === 'project') {
        headers.push('Price', 'Duration', 'Min Term', 'Max Term');
    } else if (tabName === 'sv_visit') {
        headers.push('Price', 'Duration', 'Qty/Units');
    } else if (tabName === 'dispatch') {
        headers.push('Price', 'SLA/Duration', 'Priority/Type');
    } else {
        for (let i = 0; i < maxCols; i++) headers.push(`Value ${i + 1}`);
    }

    let colsHtml = headers.slice(0, maxCols + 1).map(h => `<th style="padding: 10px; border-bottom: 2px solid #dee2e6; color: #495057; font-size: 12px; text-transform: uppercase;">${h}</th>`).join('');

    let rowsHtml = '';
    Object.entries(bandObj).forEach(([bandName, values]) => {
        // Color coding for bands
        let bg = '#6c757d';
        if (bandName.includes('0')) bg = '#6c757d';
        if (bandName.includes('1')) bg = '#28a745';
        if (bandName.includes('2')) bg = '#007bff';
        if (bandName.includes('3')) bg = '#ffc107';
        if (bandName.includes('4')) bg = '#dc3545';

        let textColor = bg === '#ffc107' ? '#000' : '#fff';
        let badgeStyle = `padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; text-align: center; min-width: 60px; background-color: ${bg}; color: ${textColor};`;

        let row = `<tr><td style="padding: 10px; border-bottom: 1px solid #e9ecef;"><span style="${badgeStyle}">${bandName}</span></td>`;
        for (let i = 0; i < maxCols; i++) {
            let val = (values && values[i]) ? values[i].trim() : '-';
            if (val === '') val = '-';
            row += `<td style="padding: 10px; border-bottom: 1px solid #e9ecef; font-size: 13px; color: #495057;">${val}</td>`;
        }
        row += `</tr>`;
        rowsHtml += row;
    });

    return `
        <div style="background: white; border: 1px solid #ced4da; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="background: #f8f9fa; padding: 12px 15px; border-bottom: 1px solid #ced4da;">
                <h5 style="margin: 0; font-size: 14px; color: #343a40;"><i class="fas fa-calendar-alt" style="color: #6c757d; margin-right: 5px;"></i> ${title}</h5>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead style="background: #fff;"><tr>${colsHtml}</tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        </div>
    `;
}

function initQuickView() {
    const qvBtn = document.getElementById('quickSetupBtn');
    const modal = document.getElementById('quickSetupModal');
    const closeBtn = document.getElementById('closeQuickSetupModal');
    const closeBtn2 = document.getElementById('closeQuickViewBtn');

    if (qvBtn && modal) {
        qvBtn.onclick = () => {
            modal.classList.add('active');
            fetchInitialTickets();
        };
    }

    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
    if (closeBtn2) closeBtn2.onclick = () => modal.classList.remove('active');

    // Bind Toggle Button
    document.getElementById('toggleQuickViewModeBtn')?.addEventListener('click', () => toggleQuickViewMode());

    // Bind Pagination Buttons
    document.getElementById('qvFormPrevBtn')?.addEventListener('click', () => {
        if (qvCurrentRecordIndex > 0) {
            qvCurrentRecordIndex--;
            renderQuickViewForm();
        }
    });

    document.getElementById('qvFormNextBtn')?.addEventListener('click', () => {
        // Find current length based on search
        let displayData = initialTickets;
        const search = document.getElementById('quickViewSearchInput')?.value.toLowerCase();
        if (search) {
            displayData = displayData.filter(t => JSON.stringify(t).toLowerCase().includes(search));
        }
        if (qvCurrentRecordIndex < displayData.length - 1) {
            qvCurrentRecordIndex++;
            renderQuickViewForm();
        }
    });

    // Tab switching for Quick View modal
    document.querySelectorAll('#quickSetupModal .tab-btn').forEach(btn => {
        btn.onclick = () => {
            const tab = btn.getAttribute('data-tab');

            // Update button states
            document.querySelectorAll('#quickSetupModal .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content states 
            document.querySelectorAll('#quickSetupModal .tab-content').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            const targetId = 'qv' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Tab';
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }

            quickViewTab = tab;
            qvCurrentRecordIndex = 0; // Reset index when changing tabs
            renderQuickViewTable(tab);
        };
    });

    const qvSearchInput = document.getElementById('quickViewSearchInput');
    if (qvSearchInput) {
        qvSearchInput.addEventListener('input', () => {
            qvCurrentRecordIndex = 0; // Reset index when search changes
            renderQuickViewTabs();
        });
    }
}

function initBillingStepTracker() {
    const tracker = document.getElementById('stepTracker');
    if (!tracker) return;

    tracker.innerHTML = '';
    steps.forEach((step) => {
        const stepEl = document.createElement('div');
        stepEl.className = `step ${step.status} ${step.id === billingCurrentStep ? 'active' : ''}`;

        stepEl.innerHTML = `
            <div class="step-icon"><i class="${step.icon}"></i></div>
            <div class="step-label">${step.name}</div>
            <div class="step-status ${step.status}">${step.status}</div>
        `;
        tracker.appendChild(stepEl);
    });
}

window.toggleAllTickets = function (source) {
    const checkboxes = document.querySelectorAll('.ticket-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
};

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Dashboard...");
    initBillingStepTracker();
    fetchBillingTickets();
    initBillingColumnToggle();
    initQuickView();
    initTicketManagerModal();

    document.getElementById('billingRegionFilter')?.addEventListener('change', applyBillingFilters);
    document.getElementById('billingCustomerFilter')?.addEventListener('change', applyBillingFilters);
    document.getElementById('billingAccountFilter')?.addEventListener('change', applyBillingFilters);
    document.getElementById('billingSearchInput')?.addEventListener('input', applyBillingFilters);
    document.getElementById('refreshTable')?.addEventListener('click', fetchBillingTickets);

    document.getElementById('playPipeline')?.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.ticket-checkbox:checked')).map(cb => cb.value);
        console.log("Selected UUIDs:", selectedIds);
        alert("Selected UUIDs printed to console:\n" + selectedIds.join('\n'));
    });
});