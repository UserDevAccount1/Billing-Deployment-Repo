// RateCardEnhanced.js - Complete Implementation with Manual Assignment Modal
class RateCardAssignmentEnhanced {
    constructor() {
        this.currentTicket = null;
        this.currentView = 'table';
        this.currentFormIndex = 0;

        // Data Stores
        this.bandRecords = [];
        this.currentBandIndex = 0;
        this.tickets = [];
        this.originalTickets = [];
        this.modifiedTickets = [];

        // Filter State
        this.filters = {
            status: 'all',
            search: '',
            customer: 'all',
            account: 'all'
        };

        // Full Column Visibility Map
        this.visibleColumns = {
            'ticket_number': true,
            'request_id': true,
            'customer': true,
            'account': true,
            'subject': true,
            'site_name': true,
            'technician_name': true,
            'service_type': true,
            'total_cost': true,
            'currency': true,
            'priority': true,
            'region': true,
            'status': true,
            'city': false,
            'country': false,
            'vendor_po': true,
            'total_hours': true,
            'created_date': false,
            'sla_met': true,
            'sla_reason': false
        };

        this.initialize();
    }

    async initialize() {
        console.log('Initializing Rate Card Application...');

        try {
            const tableBody = document.getElementById('tableBody-ratecard');
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading Data...</td></tr>';

            await Promise.all([
                this.fetchInitialData(),
                this.fetchFinalTickets(),
                this.fetchBandData()
            ]);

            this.restoreAssignments();

            this.originalTickets = JSON.parse(JSON.stringify(this.tickets));
            this.modifiedTickets = JSON.parse(JSON.stringify(this.tickets));

            this.setupEventListeners();
            this.setupBandNavigation();
            this.setupColumnFilter();

            this.switchView('table');
            this.renderBandDataCard();

            console.log(`Init Complete. Tickets: ${this.tickets.length}`);

        } catch (error) {
            console.error("Init Error:", error);
            this.showNotification("Failed to load data.", "error");
        }
    }

    // ==================== API CALLS ====================

    async fetchFinalTickets() {
        try {
            const response = await fetch('/billing/api/final-data/');
            if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
            const jsonResponse = await response.json();

            if (jsonResponse.success && Array.isArray(jsonResponse.data)) {
                this.tickets = jsonResponse.data;
            } else {
                this.tickets = [];
            }

            // Process Tickets
            this.tickets.forEach(t => {
                if (t.customer) t.customer = String(t.customer);
                if (t.account) t.account = String(t.account);

                // --- NEW STATUS LOGIC (FIXED) ---
                // If 'band' object is present and not null, it's assigned.
                if (t.band) {
                    t.assignmentStatus = 'assigned';
                    // Safe access to nested properties just in case
                    t.rateCardAssigned = t.band.ticket_number || 'Assigned Band';
                    t.bandUuid = t.band.uuid;
                } else {
                    t.assignmentStatus = 'pending';
                    t.rateCardAssigned = null;
                }
                // --------------------------------

                // Sanitize Data Table HTML
                if (t.data_table) {
                    Object.keys(t.data_table).forEach(key => {
                        let val = t.data_table[key];
                        if (typeof val === 'string' && val.includes('>')) {
                            const div = document.createElement('div');
                            div.innerHTML = val;
                            t.data_table[key] = div.textContent || val.replace(/<[^>]*>/g, '');
                        }
                    });
                }

                if (t.initial_ticket_uuid && this.initialDataMap) {
                    t.initial_data_cache = this.initialDataMap.get(t.initial_ticket_uuid);
                }
            });

            this.updateSummary();

        } catch (error) {
            console.error("Error fetching tickets:", error);
            this.tickets = [];
        }
    }

    async fetchInitialData() {
        try {
            const response = await fetch('/billing/api/initial-data/');
            if (response.ok) {
                const json = await response.json();
                this.initialDataMap = new Map();
                if (json.success && json.data) {
                    json.data.forEach(item => this.initialDataMap.set(item.uuid, item.data_table));
                }
            }
        } catch (e) { console.error("Initial data fetch failed", e); }
    }

    async fetchBandData() {
        try {
            const response = await fetch('/billing/api/band-data/');
            if (!response.ok) {
                this.bandRecords = [];
                return;
            }
            const jsonResponse = await response.json();
            if (jsonResponse.success && Array.isArray(jsonResponse.data)) {
                this.bandRecords = jsonResponse.data;
            } else if (Array.isArray(jsonResponse)) {
                this.bandRecords = jsonResponse;
            } else {
                this.bandRecords = [];
            }
        } catch (error) {
            console.error("Error fetching band data:", error);
            this.bandRecords = [];
        }
    }

    // ==================== PERSISTENCE ====================

    restoreAssignments() {
        const storedData = localStorage.getItem('tmm_assignments');
        if (storedData) {
            const assignments = JSON.parse(storedData);
            this.tickets.forEach(ticket => {
                const uniqueId = this.getUniqueId(ticket);
                if (assignments[uniqueId]) {
                    ticket.assignmentStatus = 'assigned';
                    ticket.rateCardAssigned = assignments[uniqueId].rateCardId || 'Manual Assign';
                }
            });
        }
    }

    saveAssignment(uniqueId, rateCardId) {
        let assignments = JSON.parse(localStorage.getItem('tmm_assignments') || '{}');
        assignments[uniqueId] = {
            status: 'assigned',
            rateCardId: rateCardId,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('tmm_assignments', JSON.stringify(assignments));
    }

    // ==================== VIEW MANAGEMENT ====================

    switchView(view) {
        this.currentView = view;

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) btn.classList.add('active');
        });

        document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
        const activeContainer = document.getElementById(`${view}View`);
        if (activeContainer) activeContainer.classList.add('active');

        if (view === 'table') {
            this.renderTable();
        } else if (view === 'form') {
            this.renderForm();
        } else if (view === 'comparison') {

        }
        this.updateSummary();
    }

    getUniqueId(ticket) {
        return ticket.uuid || ticket.ticket_number || ticket.request_id;
    }

    // ==================== TABLE VIEW RENDER ====================

    renderTable() {
        const tableBody = document.getElementById('tableBody-ratecard');
        const tableHead = document.getElementById('tableHeaders-ratecard');

        if (!tableBody || !tableHead) return;

        const filteredTickets = this.filterTickets();

        const columnMap = {
            'ticket_number': { label: 'Ticket #', path: 'data_table.ticket_number', width: '120px', tooltip: 'Customer Ticket Number' },
            'request_id': { label: 'Request ID', path: 'data_table.request_id', width: '100px', tooltip: 'Generated ID' },
            'customer': { label: 'Customer', path: 'customer', width: '100px', tooltip: 'Customer Name' },
            'account': { label: 'Account', path: 'account', width: '120px', tooltip: 'Account Name' },
            'site_name': { label: 'Site', path: 'data_table.site_name', width: '150px', tooltip: 'Site Address' },
            'subject': { label: 'Subject', path: 'data_table.subject', width: '200px', tooltip: 'Activity Details' },
            'priority': { label: 'Priority', path: 'data_table.priority', width: '80px', tooltip: 'Ticket Priority' },
            'technician_name': { label: 'Technician', path: 'data_table.technician_name', width: '120px', tooltip: 'Technician Name' },
            'region': { label: 'Region', path: 'data_table.region', width: '100px', tooltip: 'Geographic Region' },
            'city': { label: 'City', path: 'data_table.city', width: '100px', tooltip: 'City' },
            'country': { label: 'Country', path: 'data_table.country', width: '100px', tooltip: 'Country' },
            'service_type': { label: 'Service', path: 'data_table.service_type', width: '80px', tooltip: 'Dispatch Category' },
            'vendor_po': { label: 'Vendor PO', path: 'data_table.vendor_po', width: '100px', tooltip: 'Formatted PO' },
            'total_hours': { label: 'Hours', path: 'data_table.total_hours', width: '80px', tooltip: 'Total Hours' },
            'total_cost': { label: 'Cost', path: 'data_table.total_cost', width: '100px', tooltip: 'Calculations' },
            'created_date': { label: 'Date', path: 'data_table.created_date', width: '100px', tooltip: 'Created Date' },
            'sla_met': { label: 'SLA Met', path: 'data_table.sla_met', width: '80px', tooltip: 'SLA Compliance' },
            'sla_reason': { label: 'SLA Reason', path: 'data_table.sla_reason', width: '150px', tooltip: 'Reason for Failure' },
            'status': { label: 'Status', path: 'assignmentStatus', width: '100px', tooltip: 'Assignment Status' }
        };

        // Render Headers
        let headersHtml = '<th style="width: 40px;"><input type="checkbox" id="selectAll"></th>';
        for (const [key, def] of Object.entries(columnMap)) {
            if (this.visibleColumns[key]) {
                headersHtml += `<th style="width: ${def.width}" data-tooltip="Source: ${def.tooltip}">${def.label}</th>`;
            }
        }
        headersHtml += '<th style="width: 220px;">Actions</th>';
        tableHead.innerHTML = headersHtml;

        // Render Rows
        if (filteredTickets.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="100%" class="empty-state">No tickets found matching filters.</td></tr>`;
        } else {
            tableBody.innerHTML = filteredTickets.map(ticket => {
                const uniqueId = this.getUniqueId(ticket);
                let rowHtml = `<td><input type="checkbox" class="ticket-checkbox" data-id="${uniqueId}"></td>`;

                for (const [key, def] of Object.entries(columnMap)) {
                    if (this.visibleColumns[key]) {
                        let value = this.getValueByPath(ticket, def.path);

                        if (key === 'total_cost') {
                            const curr = this.getValueByPath(ticket, 'data_table.currency') || '';
                            value = `${curr} ${value || 0}`;
                        } else if (key === 'status') {
                            value = this.getStatusBadge(ticket.assignmentStatus || 'pending');
                        } else if (key === 'priority') {
                            value = `<span class="priority-badge ${(value || '').toLowerCase()}">${value || '-'}</span>`;
                        } else if (key === 'sla_met') {
                            const isMet = String(value).toLowerCase().includes('yes');
                            value = isMet ? '<span style="color:#2ecc71; font-weight:600;">Yes</span>' : '<span style="color:#e74c3c; font-weight:600;">No</span>';
                        }

                        rowHtml += `<td title="${String(value).replace(/<[^>]*>/g, '')}">${value}</td>`;
                    }
                }

                rowHtml += `
                    <td>
                        <div class="table-actions" style="display: flex; gap: 5px;">
                            <button class="btn btn-sm btn-outline" style="display: inline-flex; align-items: center; gap: 5px;" 
    onclick="rateCardApp.openOverviewModal('${uniqueId}')" title="View Overview">
    <i class="fas fa-eye"></i> Overview
</button>
                            ${ticket.assignmentStatus !== 'assigned' ?
                        `<button class="btn btn-sm btn-success" style="display: inline-flex; align-items: center; gap: 5px;" onclick="rateCardApp.manualAssignRateCard('${uniqueId}')" title="Assign">
                                    <i class="fas fa-plus"></i> Assign
                                </button>` :
                        `<span class="status-badge status-assigned" style="padding: 5px 10px;">Assigned</span>`
                    }
                        </div>
                    </td>
                `;
                return `<tr>${rowHtml}</tr>`;
            }).join('');
        }

        const countEl = document.getElementById('ticketCount');
        if (countEl) countEl.innerText = filteredTickets.length;
    }

    // ==================== FORM VIEW RENDER ====================

    renderForm() {
        const filteredTickets = this.filterTickets();
        const formContainer = document.getElementById('ticketForm');

        if (!formContainer) return;

        if (filteredTickets.length === 0) {
            formContainer.innerHTML = `<div class="empty-state"><h4>No tickets found</h4><p>Adjust filters to view tickets</p></div>`;
            return;
        }

        if (this.currentFormIndex >= filteredTickets.length) this.currentFormIndex = 0;
        if (this.currentFormIndex < 0) this.currentFormIndex = filteredTickets.length - 1;

        const ticket = filteredTickets[this.currentFormIndex];
        const uniqueId = this.getUniqueId(ticket);
        const data = ticket.data_table || {};

        const posEl = document.getElementById('currentFormPosition');
        if (posEl) posEl.innerText = `Ticket ${this.currentFormIndex + 1} of ${filteredTickets.length}`;

        formContainer.innerHTML = `
            <div class="form-header" style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <h3>${uniqueId}</h3>
                ${this.getStatusBadge(ticket.assignmentStatus || 'pending')}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group"><div class="form-label">Customer</div><div class="form-value">${ticket.customer || '-'}</div></div>
                <div class="form-group"><div class="form-label">Account</div><div class="form-value">${ticket.account || '-'}</div></div>
                <div class="form-group"><div class="form-label">Request ID</div><div class="form-value">${ticket.request_id || '-'}</div></div>
                <div class="form-group"><div class="form-label">Service Type</div><div class="form-value">${data.service_type || '-'}</div></div>
                <div class="form-group" style="grid-column: span 2;"><div class="form-label">Subject</div><div class="form-value">${data.subject || '-'}</div></div>
                <div class="form-group"><div class="form-label">Site</div><div class="form-value">${data.site_name || '-'}</div></div>
                <div class="form-group"><div class="form-label">Priority</div><div class="form-value">${data.priority || '-'}</div></div>
                <div class="form-group"><div class="form-label">Total Cost</div><div class="form-value">${data.currency} ${data.total_cost || 0}</div></div>
            </div>

            <div class="form-actions" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; display: flex; gap: 10px;">
                <button class="btn btn-outline" title="View Overview"><i class="fas fa-eye"></i> Full Overview</button>
                ${ticket.assignmentStatus !== 'assigned' ?
                `<button class="btn btn-primary" onclick="rateCardApp.manualAssignRateCard('${uniqueId}')">Assign Rate Card</button>` :
                `<span class="badge badge-success">Assigned</span>`
            }
            </div>
        `;
    }

    // ==================== ASSIGNMENT MODAL ====================

    manualAssignRateCard(id) {
        const ticket = this.tickets.find(t => this.getUniqueId(t) === id);
        if (!ticket) return;

        // 1. Intelligent Filtering: Match Customer & Account
        const matchingCards = this.bandRecords.filter(rc =>
            String(rc.customer) === String(ticket.customer) &&
            String(rc.account) === String(ticket.account)
        );

        // 2. Fallback: Match Customer only if no account specific cards
        const allCustomerCards = matchingCards.length > 0 ? [] : this.bandRecords.filter(rc =>
            String(rc.customer) === String(ticket.customer)
        );

        this.showManualAssignmentModal(ticket, matchingCards, allCustomerCards);
    }

    showManualAssignmentModal(ticket, exactMatches = [], otherMatches = []) {
        const uniqueId = this.getUniqueId(ticket);

        const modalHtml = `
            <div class="modal-overlay" id="assignModal">
                <div class="modal-content" style="width:600px; max-height:80vh; overflow-y:auto;">
                    <div class="modal-header">
                        <h3>Assign Rate Card to ${uniqueId}</h3>
                        <button onclick="document.getElementById('assignModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="background:#f8f9fa; padding:10px; border-radius:5px; margin-bottom:15px;">
                            <p style="margin:5px 0;"><strong>Service:</strong> ${ticket.data_table?.service_type}</p>
                            <p style="margin:5px 0;"><strong>Region:</strong> ${ticket.data_table?.region}</p>
                        </div>

                        ${exactMatches.length > 0 ? `
                            <h5 style="margin-bottom:10px; color:#2c3e50;">Recommended Cards (Account Match)</h5>
                            ${exactMatches.map(card => this.renderRateCardItem(card, uniqueId)).join('')}
                        ` : ''}

                        ${otherMatches.length > 0 ? `
                            <h5 style="margin:15px 0 10px; color:#e67e22;">Other Customer Cards</h5>
                            ${otherMatches.map(card => this.renderRateCardItem(card, uniqueId)).join('')}
                        ` : ''}

                        ${exactMatches.length === 0 && otherMatches.length === 0 ? `
                            <div style="text-align:center; padding:20px; color:#7f8c8d;">
                                <i class="fas fa-exclamation-circle" style="font-size:24px; margin-bottom:10px;"></i>
                                <p>No matching rate cards found for this Customer.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    renderRateCardItem(card, ticketId) {
        return `
            <div style="border:1px solid #eee; padding:12px; margin-bottom:8px; border-radius:5px; display:flex; justify-content:space-between; align-items:center; background:white;">
                <div>
                    <div style="font-weight:bold; color:#2980b9;">${card.category} - ${card.bandLevel || 'Standard'}</div>
                    <div style="font-size:0.85em; color:#666;">
                        ID: ${card.id} | Ver: ${card.version}
                    </div>
                    <div style="font-weight:bold; margin-top:4px;">${card.currency} ${card.rateValue}</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="rateCardApp.confirmAssignment('${ticketId}', '${card.uuid}')">Select</button>
            </div>
        `;
    }

    // RateCardEnhanced.js

    async confirmAssignment(ticketId, bandUuid) {
        console.log(`Assigning Band ${bandUuid} to Ticket ${ticketId}`);

        // 1. Find Ticket
        // We look for the ticket where the unique ID matches (which we set to uuid in getUniqueId)
        // OR fallback to matching by ticket_number if uuid matching fails (legacy support)
        let ticket = this.tickets.find(t => t.uuid === ticketId);

        if (!ticket) {
            // Fallback: Check if ticketId is actually a ticket number or request ID
            ticket = this.tickets.find(t => t.ticket_number === ticketId || t.request_id === ticketId);
        }

        if (!ticket) {
            this.showNotification("Ticket not found in local store.", "error");
            return;
        }

        if (!bandUuid || bandUuid === 'undefined') {
            this.showNotification("Invalid Band UUID.", "error");
            return;
        }

        const payload = [{
            "final_ticket": ticket.uuid, // Ensure we send the backend UUID
            "band": bandUuid
        }];

        // 2. Call API
        try {
            const response = await fetch('/billing/api/batch-assign-bands/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                // 3. Update Local State
                ticket.assignmentStatus = 'assigned';
                // Find band info to update display text
                const bandRec = this.bandRecords.find(b => b.uuid === bandUuid);

                // Update the ticket object to match what fetchFinalTickets does
                ticket.band = {
                    uuid: bandUuid,
                    ticket_number: bandRec ? bandRec.ticket_number : 'Assigned'
                };

                ticket.rateCardAssigned = bandRec ? bandRec.ticket_number : 'Assigned Band';
                ticket.bandUuid = bandUuid;

                this.showNotification(`Successfully assigned band to ${ticket.ticket_number}`, 'success');

                document.getElementById('assignModal')?.remove();
                this.switchView(this.currentView);
            } else {
                this.showNotification(`Assignment failed: ${result.error}`, 'error');
            }
        } catch (err) {
            console.error("Assignment Error:", err);
            this.showNotification("Server error during assignment.", "error");
        }
    }

    // ==================== BAND DATA RENDERING ====================
    // (This logic remains the same as previous step, ensuring sidebar works)

    setupBandNavigation() {
        const prevBtn = document.getElementById('prevBandBtn');
        const nextBtn = document.getElementById('nextBandBtn');

        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (this.currentBandIndex > 0) { this.currentBandIndex--; this.renderBandDataCard(); }
        });

        if (nextBtn) nextBtn.addEventListener('click', () => {
            if (this.currentBandIndex < this.bandRecords.length - 1) { this.currentBandIndex++; this.renderBandDataCard(); }
        });
    }

    renderBandDataCard() {
        const container = document.getElementById('rateCardPreview');
        const counter = document.getElementById('bandCounter');
        const prevBtn = document.getElementById('prevBandBtn');
        const nextBtn = document.getElementById('nextBandBtn');

        if (!container) return;

        if (!this.bandRecords || this.bandRecords.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No Band Records Found</p></div>`;
            if (counter) counter.innerText = "0/0";
            return;
        }

        if (this.currentBandIndex >= this.bandRecords.length) this.currentBandIndex = 0;
        const record = this.bandRecords[this.currentBandIndex];
        const bandData = record.band_data || {};

        if (counter) counter.innerText = `${this.currentBandIndex + 1} / ${this.bandRecords.length}`;
        if (prevBtn) prevBtn.disabled = this.currentBandIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentBandIndex === this.bandRecords.length - 1;

        let html = `
            <div class="band-card" style="font-size: 0.9em;">
                <div class="band-header" style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #3498db;">
                    <div style="font-weight: bold; color: #2c3e50;">${record.customer || 'N/A'} - ${record.account || 'N/A'}</div>
                    <div style="color: #7f8c8d; font-size: 0.85em;">Ticket: ${record.ticket_number || 'N/A'}</div>
                </div>
                <div class="band-tables" style="max-height: 500px; overflow-y: auto;">
        `;

        const renderCategoryTable = (title, dataObj) => {
            if (!dataObj || Object.keys(dataObj).length === 0) return '';
            const isGrouped = Object.values(dataObj).some(val => !Array.isArray(val) && typeof val === 'object');
            let content = '';

            if (isGrouped) {
                Object.entries(dataObj).forEach(([groupName, groupData]) => {
                    content += renderCategoryTable(`${title} - ${groupName}`, groupData);
                });
            } else {
                content += `
                    <div style="margin-bottom: 15px; border: 1px solid #eee; border-radius: 4px;">
                        <div style="background: #ecf0f1; padding: 5px 10px; font-weight: 600; font-size: 0.85em;">${title}</div>
                        <table style="width: 100%; border-collapse: collapse;"><tbody>`;

                Object.entries(dataObj).forEach(([band, values]) => {
                    if (Array.isArray(values) && values.some(v => v && v.trim() !== '')) {
                        content += `<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding:4px;">${band}</td><td style="padding:4px;">${values.join(' | ')}</td></tr>`;
                    }
                });
                content += `</tbody></table></div>`;
            }
            return content;
        };

        html += renderCategoryTable('Dispatch', bandData.dispatch);
        html += renderCategoryTable('Dedicated', bandData.dedicated);
        html += renderCategoryTable('SV Visit', bandData.sv_visit);
        html += `</div></div>`;
        container.innerHTML = html;
    }

    // ==================== HELPERS ====================

    setupColumnFilter() {
        const optionsDiv = document.getElementById('columnFilterOptions');
        if (!optionsDiv) return;
        optionsDiv.innerHTML = '';
        const labels = { 'ticket_number': 'Ticket #', 'request_id': 'Request ID', 'customer': 'Customer', 'total_cost': 'Cost', 'status': 'Status' }; // Add more as needed

        Object.keys(this.visibleColumns).forEach(key => {
            const optionDiv = document.createElement('div');
            optionDiv.innerHTML = `<label style="display:flex; gap:5px; padding:5px;"><input type="checkbox" ${this.visibleColumns[key] ? 'checked' : ''} onchange="rateCardApp.toggleColumn('${key}', this.checked)"> ${labels[key] || key}</label>`;
            optionsDiv.appendChild(optionDiv);
        });

        document.getElementById('columnFilterBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('columnFilterDropdown').classList.toggle('show');
        });
        document.addEventListener('click', () => document.getElementById('columnFilterDropdown')?.classList.remove('show'));
    }

    toggleColumn(key, checked) {
        this.visibleColumns[key] = checked;
        this.renderTable();
    }

    getValueByPath(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '-';
    }

    filterTickets() {
        const statusSelect = document.getElementById('filterStatus');
        const customerSelect = document.getElementById('filterCustomer');
        const accountSelect = document.getElementById('filterAccount');

        const selectedCust = customerSelect
            ? customerSelect.options[customerSelect.selectedIndex].text
            : 'All customers';

        const selectedAcc = accountSelect
            ? accountSelect.options[accountSelect.selectedIndex].text
            : 'All Accounts';
        const selectedStatus = statusSelect ? statusSelect.value : 'all';

        console.log(selectedAcc, selectedCust);

        return this.tickets.filter(ticket => {
            const data = ticket.data_table || {};
            const uniqueId = this.getUniqueId(ticket);

            if (selectedStatus !== 'all') {
                const currentStatus = ticket.assignmentStatus || 'pending';
                if (currentStatus !== selectedStatus) return false;
            }
            if (selectedCust !== 'All customers' && String(ticket.customer) !== String(selectedCust)) return false;
            if (selectedAcc !== 'All Accounts' && String(ticket.account) !== String(selectedAcc)) return false;

            if (this.filters.search) {
                const term = this.filters.search.toLowerCase();
                const searchable = [uniqueId, data.site_name, data.technician_name, data.subject].map(s => (s || '').toString().toLowerCase());
                if (!searchable.some(val => val.includes(term))) return false;
            }
            return true;
        });
    }

    getStatusBadge(status) {
        const badges = {
            'assigned': '<span class="status-badge status-assigned">Assigned</span>',
            'pending': '<span class="status-badge status-pending">Pending</span>',
            'missing': '<span class="status-badge status-missing">Missing</span>',
            'conflict': '<span class="status-badge status-conflict">Conflict</span>'
        };
        return badges[status] || badges['pending'];
    }

    updateSummary() {
        const counts = {
            assigned: this.tickets.filter(t => t.assignmentStatus === 'assigned').length,
            pending: this.tickets.filter(t => t.assignmentStatus === 'pending').length,
            missing: this.tickets.filter(t => t.assignmentStatus === 'missing').length,
            conflict: this.tickets.filter(t => t.assignmentStatus === 'conflict').length
        };
        ['assignedCount', 'pendingCount', 'missingCount', 'conflictCount'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = counts[id.replace('Count', '')];
        });
    }

    // ==================== MODAL OVERVIEW ====================



    // ==================== UTILS ====================

    setupEventListeners() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        document.getElementById('searchTickets')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            if (this.currentView === 'table') this.renderTable();
        });

        ['filterCustomer', 'filterAccount', 'filterStatus'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                const filterKey = id.replace('filter', '').toLowerCase();
                this.filters[filterKey] = e.target.value;
                if (this.currentView === 'table') this.renderTable();
            });
        });

        document.getElementById('prevTicket')?.addEventListener('click', () => {
            if (this.currentFormIndex > 0) {
                this.currentFormIndex--;
                this.renderForm();
            }
        });

        document.getElementById('nextTicket')?.addEventListener('click', () => {
            const total = this.filterTickets().length;
            if (this.currentFormIndex < total - 1) {
                this.currentFormIndex++;
                this.renderForm();
            }
        });
    }

    // ==================== MANUAL ASSIGNMENT MODAL LOGIC ====================

    manualAssignRateCard(id) {
        const ticket = this.tickets.find(t => this.getUniqueId(t) === id);
        if (!ticket) {
            this.showNotification("Ticket not found", "error");
            return;
        }
        const allBandRecords = this.bandRecords || [];

        if (allBandRecords.length === 0) {
            this.showNotification("No Band Data records loaded from API", "warning");
        }
        this.modalBandPage = 0;
        this.modalBandPageSize = 5;
        this.showManualAssignmentModal(ticket, allBandRecords);
    }

    showManualAssignmentModal(ticket, bandRecords) {
        // Remove existing modal if any
        const existing = document.getElementById('assignModal');
        if (existing) existing.remove();

        const uniqueId = this.getUniqueId(ticket);
        const data = ticket.data_table || {};

        // Calculate Pagination
        const totalPages = Math.ceil(bandRecords.length / this.modalBandPageSize);
        const startIdx = this.modalBandPage * this.modalBandPageSize;
        const currentRecords = bandRecords.slice(startIdx, startIdx + this.modalBandPageSize);

        const modalHtml = `
            <div class="" id="assignModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; justify-content:center; align-items:center;">
                <div style="background:white; width:900px; max-width:95%; max-height:90vh; border-radius:8px; display:flex; flex-direction:column; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    
                    <div class="" style="padding:15px 20px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#f8f9fa; border-radius: 8px 8px 0 0;">
                        <div>
                            <h3 style="margin:0; color:#2c3e50;">Assign Band Record</h3>
                            <small style="color:#666;">Ticket: <strong>${uniqueId}</strong></small>
                        </div>
                        <button onclick="document.getElementById('assignModal').remove()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#666;">&times;</button>
                    </div>

                    <div class="" style="padding:20px; overflow-y:auto; background:#fff; flex: 1;">
                        
                        <div style="background:#e3f2fd; padding:10px 15px; border-radius:6px; margin-bottom:20px; border-left:4px solid #2196f3; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <strong style="color:#1565c0;">Target:</strong> ${ticket.customer || 'N/A'} - ${ticket.account || 'N/A'}
                            </div>
                            <div style="font-size:0.9em; color:#1565c0;">
                                Region: ${data.region || '-'} | Service: ${data.service_type || '-'}
                            </div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <h5 style="margin:0; color:#2c3e50;">Available Band Records (${bandRecords.length})</h5>
                            <div class="modal-pagination">
                                <button class="btn btn-sm btn-outline" onclick="rateCardApp.changeModalPage(-1, '${uniqueId}')" ${this.modalBandPage === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <span style="font-size:0.85em; margin:0 10px;">Page ${this.modalBandPage + 1} of ${totalPages || 1}</span>
                                <button class="btn btn-sm btn-outline" onclick="rateCardApp.changeModalPage(1, '${uniqueId}')" ${this.modalBandPage >= totalPages - 1 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>

                        <div class="band-list-container">
                            ${currentRecords.length > 0 ?
                currentRecords.map(record => this.renderBandSelectionItem(record, uniqueId)).join('')
                :
                `<div style="text-align:center; padding:40px; color:#95a5a6;">
                                    <i class="fas fa-database" style="font-size:24px; margin-bottom:10px; display:block;"></i>
                                    No Band Data Records Available
                                </div>`
            }
                        </div>
                    </div>

                    <div class="modal-footer" style="padding:15px 20px; border-top:1px solid #eee; text-align:right; background:#f8f9fa; border-radius: 0 0 8px 8px;">
                        <button class="btn btn-outline" onclick="document.getElementById('assignModal').remove()">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    changeModalPage(direction, ticketId) {
        const totalPages = Math.ceil((this.bandRecords || []).length / this.modalBandPageSize);
        const newPage = this.modalBandPage + direction;

        if (newPage >= 0 && newPage < totalPages) {
            this.modalBandPage = newPage;
            const ticket = this.tickets.find(t => this.getUniqueId(t) === ticketId);
            this.showManualAssignmentModal(ticket, this.bandRecords);
        }
    }

    renderBandSelectionItem(record, ticketId) {
        // Safe access to nested properties
        const customer = record.customer || 'Unknown Customer';
        const account = record.account || 'Unknown Account';
        const refTicket = record.ticket_number || 'N/A';

        // --- FIX: Ensure we get the correct UUID from the band record ---
        const recordUuid = record.uuid;
        // ----------------------------------------------------------------

        const uniqueKey = `band-${recordUuid}`; // For collapse ID

        // Extract some summary data to show in the row
        const dispatchCount = record.band_data?.dispatch ? Object.keys(record.band_data.dispatch).length : 0;
        const dedicatedCount = record.band_data?.dedicated ? Object.keys(record.band_data.dedicated).length : 0;

        // Generate Collapsible Detail HTML
        const detailsHtml = this.generateBandDetailsHtml(record.band_data);

        return `
            <div class="band-selection-card" style="border:1px solid #e0e0e0; border-radius:6px; margin-bottom:10px; background:white; overflow:hidden;">
                <div style="padding:12px 15px; display:flex; justify-content:space-between; align-items:center; background:#fff; cursor:pointer;" 
                     onclick="document.getElementById('${uniqueKey}').style.display = document.getElementById('${uniqueKey}').style.display === 'none' ? 'block' : 'none'">
                    
                    <div style="flex-grow:1;">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                            <i class="fas fa-chevron-down" style="color:#aaa; font-size:0.8em;"></i>
                            <span style="font-weight:bold; color:#2c3e50; font-size:1.05em;">${customer}</span>
                            <span style="color:#ccc;">|</span>
                            <span style="color:#555;">${account}</span>
                        </div>
                        <div style="font-size:0.85em; color:#7f8c8d; display:flex; gap:15px; margin-left: 18px;">
                            <span><i class="fas fa-hashtag"></i> Ref: <strong>${refTicket}</strong></span>
                            <span title="Dispatch Categories"><i class="fas fa-truck"></i> Disp: ${dispatchCount}</span>
                            <span title="Dedicated Categories"><i class="fas fa-user-clock"></i> Ded: ${dedicatedCount}</span>
                        </div>
                    </div>

                    <div style="margin-left:15px;" onclick="event.stopPropagation()">
                        <button class="btn btn-sm btn-primary" 
                            style="padding:6px 15px; box-shadow:0 2px 4px rgba(52, 152, 219, 0.3);"
                            onclick="rateCardApp.confirmAssignment('${ticketId}', '${recordUuid}')">
                            Assign
                        </button>
                    </div>
                </div>
                
                <div id="${uniqueKey}" style="display:none; border-top:1px solid #f0f0f0; background:#fafafa; padding:15px;">
                    <div class="band-tables" style="max-height: 300px; overflow-y: auto; font-size: 0.85em;">
                        ${detailsHtml || '<p style="color:#999; text-align:center;">No detailed band data available.</p>'}
                    </div>
                    <div style="font-size:0.7em; color:#ccc; margin-top:5px;">UUID: ${recordUuid}</div>
                </div>
            </div>
        `;
    }

    // Helper to generate the inner table HTML (Shared logic)
    generateBandDetailsHtml(bandData) {
        if (!bandData) return '';
        let html = '';

        const renderTable = (title, dataObj) => {
            if (!dataObj || Object.keys(dataObj).length === 0) return '';

            // Check if nested groups exist
            const isGrouped = Object.values(dataObj).some(val => !Array.isArray(val) && typeof val === 'object');
            let section = '';

            if (isGrouped) {
                Object.entries(dataObj).forEach(([groupName, groupData]) => {
                    section += renderTable(`${title} - ${groupName}`, groupData);
                });
            } else {
                section += `
                    <div style="margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; background:white;">
                        <div style="background: #eee; padding: 4px 8px; font-weight: 600; font-size: 0.9em; color:#555;">${title}</div>
                        <table style="width: 100%; border-collapse: collapse;"><tbody>`;

                Object.entries(dataObj).forEach(([band, values]) => {
                    if (Array.isArray(values) && values.some(v => v && v.trim() !== '')) {
                        section += `<tr style="border-bottom: 1px solid #f9f9f9;">
                            <td style="padding:3px 8px; font-weight:500; width:40%;">${band}</td>
                            <td style="padding:3px 8px; color:#666;">${values.join(' | ')}</td>
                        </tr>`;
                    }
                });
                section += `</tbody></table></div>`;
            }
            return section;
        };

        html += renderTable('Dispatch', bandData.dispatch);
        html += renderTable('Dedicated', bandData.dedicated);
        html += renderTable('SV Visit', bandData.sv_visit);
        return html;
    }

    showNotification(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    // ==================== OVERVIEW MODAL LOGIC ====================

    /**
     * Entry point to open the comparison modal
     * @param {string} ticketId - Unique identifier of the ticket (usually uuid)
     */
    openOverviewModal(ticketId) {
        // 1. Get Final Ticket Data
        const finalTicket = this.tickets.find(t => this.getUniqueId(t) === ticketId);

        if (!finalTicket) {
            this.showNotification("Ticket data not found.", "error");
            return;
        }

        // 2. Get Initial Data from Cache
        // Note: The API returns initial_ticket_uuid in the final ticket object
        const initialUuid = finalTicket.initial_ticket_uuid;
        const initialData = (initialUuid && this.initialDataMap)
            ? (this.initialDataMap.get(initialUuid) || {})
            : {};

        const finalData = finalTicket.data_table || {};

        // 3. Generate Diff Data
        this.currentComparison = this.generateComparisonData(initialData, finalData);
        this.currentComparison.meta = {
            ticketNumber: finalTicket.ticket_number,
            requestId: finalTicket.request_id,
            isLinked: !!initialUuid
        };

        // 4. Render UI
        this.renderOverviewHeader();
        this.renderTab1Data(); // Summary
        this.renderOverviewTab2(); // Full Table
        this.renderTab3Data(); // Changes

        // 5. Reset to Tab 1 & Show Modal
        this.switchOverviewTab('ov-tab1', document.querySelector('[data-tab="ov-tab1"]'));
        document.getElementById('overviewModal').style.display = 'flex';
    }

    closeOverviewModal() {
        document.getElementById('overviewModal').style.display = 'none';
    }

    /**
     * Compares two objects and returns a flat list of changes
     */
    generateComparisonData(initial, final) {
        const allKeys = new Set([...Object.keys(initial), ...Object.keys(final)]);
        const sortedKeys = Array.from(allKeys).filter(k => !k.startsWith('_')).sort(); // Filter internal keys if any

        const diffs = [];
        let added = 0, modified = 0, removed = 0;

        sortedKeys.forEach(key => {
            const initVal = initial[key] !== undefined && initial[key] !== null ? String(initial[key]).trim() : null;
            const finalVal = final[key] !== undefined && final[key] !== null ? String(final[key]).trim() : null;

            let status = 'unchanged';

            if (initVal === null && finalVal !== null) {
                status = 'added';
                added++;
            } else if (initVal !== null && finalVal === null) {
                status = 'removed';
                removed++;
            } else if (initVal !== finalVal) {
                status = 'modified';
                modified++;
            }

            diffs.push({
                key: key,
                initial: initVal,
                final: finalVal,
                status: status
            });
        });

        return { diffs, counts: { added, modified, removed } };
    }

    // --- RENDERERS ---

    renderOverviewHeader() {
        const meta = this.currentComparison.meta;
        document.getElementById('overview-ticket-id').innerText = `${meta.ticketNumber} | ${meta.requestId}`;

        const badgesContainer = document.getElementById('overview-meta-badges');
        badgesContainer.innerHTML = meta.isLinked
            ? `<span class="badge badge-success" style="background:#dcfce7; color:#15803d; padding:5px 10px; border-radius:15px;">Linked to Initial</span>`
            : `<span class="badge badge-warning" style="background:#fff7ed; color:#c2410c; padding:5px 10px; border-radius:15px;">Unlinked (New)</span>`;
    }

    switchOverviewTab(tabId, tabElement) {
        // Hide all contents
        document.querySelectorAll('.overview-modal-container .tab-content').forEach(el => el.classList.remove('active'));
        // Deactivate all tabs
        document.querySelectorAll('.overview-modal-container .tab').forEach(el => el.classList.remove('active'));

        // Activate selected
        document.getElementById(tabId).classList.add('active');
        if (tabElement) tabElement.classList.add('active');
    }

    renderTab1Data() {
        const counts = this.currentComparison.counts;
        const diffs = this.currentComparison.diffs;

        // Update Counts
        document.getElementById('ov-stat-added').innerText = counts.added;
        document.getElementById('ov-stat-modified').innerText = counts.modified;
        document.getElementById('ov-stat-removed').innerText = counts.removed;

        // Update Summary Table (Only show changed items)
        const tbody = document.getElementById('ov-summary-body');
        const changedItems = diffs.filter(d => d.status !== 'unchanged');

        if (changedItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">No discrepancies found between initial and final data.</td></tr>`;
            return;
        }

        tbody.innerHTML = changedItems.map(item => {
            let statusBadge = '';
            if (item.status === 'added') statusBadge = `<span style="color:#28a745; font-weight:bold;">Added</span>`;
            if (item.status === 'modified') statusBadge = `<span style="color:#f39c12; font-weight:bold;">Modified</span>`;
            if (item.status === 'removed') statusBadge = `<span style="color:#e74c3c; font-weight:bold;">Removed</span>`;

            return `
                <tr>
                    <td style="font-weight:600;">${item.key}</td>
                    <td>${statusBadge}</td>
                    <td style="color:#666;">${item.initial || '-'}</td>
                    <td>${item.final || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    renderOverviewTab2() {
        const isFinal = document.getElementById('overviewViewToggle').checked;
        const diffs = this.currentComparison.diffs;

        // Toggle Labels UI
        document.getElementById('ov-toggle-before').classList.toggle('active', !isFinal);
        document.getElementById('ov-toggle-after').classList.toggle('active', isFinal);

        const tbody = document.getElementById('ov-full-body');

        tbody.innerHTML = diffs.map(item => {
            const displayValue = isFinal ? item.final : item.initial;

            // Determine row highlight
            let rowClass = '';
            if (item.status === 'added' && isFinal) rowClass = 'diff-added';
            if (item.status === 'removed' && !isFinal) rowClass = 'diff-removed';
            if (item.status === 'modified') rowClass = 'diff-modified';

            return `
                <tr class="${rowClass}">
                    <td style="font-weight:500;">${item.key}</td>
                    <td>${displayValue !== null ? displayValue : '<em style="color:#ccc">null</em>'}</td>
                </tr>
            `;
        }).join('');
    }

    renderTab3Data() {
        const container = document.getElementById('ov-changes-list');
        const changedItems = this.currentComparison.diffs.filter(d => d.status !== 'unchanged');

        if (changedItems.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:30px; color:#999;">No changes detected.</div>`;
            return;
        }

        container.innerHTML = changedItems.map(item => {
            let content = '';
            if (item.status === 'modified') {
                content = `Changed from <span style="background:#fee2e2; padding:2px 5px; border-radius:3px; text-decoration:line-through;">${item.initial}</span> 
                           to <span style="background:#dcfce7; padding:2px 5px; border-radius:3px; font-weight:bold;">${item.final}</span>`;
            } else if (item.status === 'added') {
                content = `New Value: <strong>${item.final}</strong>`;
            } else {
                content = `Removed Value: <span style="text-decoration:line-through;">${item.initial}</span>`;
            }

            return `
                <div class="change-card ${item.status}">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="color:#2c3e50;">${item.key}</strong>
                        <span style="text-transform:uppercase; font-size:0.75em; font-weight:700; opacity:0.7;">${item.status}</span>
                    </div>
                    <div style="font-size:0.9rem; color:#444;">${content}</div>
                </div>
            `;
        }).join('');
    }
}

// Initialize when DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.rateCardApp = new RateCardAssignmentEnhanced();
});