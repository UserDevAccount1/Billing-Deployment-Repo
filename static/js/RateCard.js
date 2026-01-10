// RateCardEnhanced.js - UPDATED with floating modal comparison
class RateCardAssignmentEnhanced {
    constructor() {
        this.currentTicket = null;
        this.currentView = 'table';
        this.currentFormIndex = 0;
        this.rateCards = [];
        this.tickets = [];
        this.filters = {
            status: 'all',
            search: '',
            customer: 'All customers',
            account: 'all'
        };
        this.visibleColumns = {
            'requestId': true,
            'customerRef': true,
            'requester': true,
            'subject': true,
            'site': true,
            'priority': true,
            'technician': true,
            'timeFields': true,
            'account': true,
            'region': true,
            'engineerDetails': true,
            'poNumber': true,
            'revenue': true,
            'cost': true,
            'profit': true,
            'vendorPo': true,
            'visitType': true,
            'band': true,
            'status': true
        };
        
        // For comparison tracking
        this.originalTickets = [];
        this.modifiedTickets = [];
        
        this.initialize();
    }

    async initialize() {
        // Load sample data immediately
        this.loadSampleTickets();
        this.loadSampleRateCards();
        
        // Create copies for comparison
        this.originalTickets = JSON.parse(JSON.stringify(this.tickets));
        this.modifiedTickets = JSON.parse(JSON.stringify(this.tickets));
        
        // Initialize the UI
        this.setupEventListeners();
        this.render();
        
        // Auto-assign rate cards
        setTimeout(() => {
            // this.autoAssignRateCards();
        }, 500);
    }

    loadSampleTickets() {
        
        console.log('Loaded tickets:', this.tickets.length);
    }

    loadSampleRateCards() {
        // Service Rate Cards
        
        console.log('Loaded rate cards:', this.rateCards.length);
    }

    setupEventListeners() {
        // View Toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-btn').dataset.view;
                this.switchView(view);
            });
        });

        // Search input
        const searchInput = document.getElementById('searchTickets');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.renderTable();
            });
        }

        // Filter dropdowns
        const customerFilter = document.getElementById('filterCustomer');
        if (customerFilter) {
            customerFilter.addEventListener('change', (e) => {
                this.filters.customer = e.target.value;
                this.renderTable();
            });
        }

        const accountFilter = document.getElementById('filterAccount');
        if (accountFilter) {
            accountFilter.addEventListener('change', (e) => {
                this.filters.account = e.target.value;
                this.renderTable();
            });
        }

        const statusFilter = document.getElementById('filterStatus');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.renderTable();
            });
        }

        // Action buttons
        const autoAssignBtn = document.getElementById('autoAssignAll');
        if (autoAssignBtn) {
            autoAssignBtn.addEventListener('click', () => {
                this.autoAssignRateCards();
            });
        }

        const exportBtn = document.getElementById('exportReport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }

        // Quick actions
        const quickAssignBtn = document.getElementById('quickAssignBtn');
        if (quickAssignBtn) {
            quickAssignBtn.addEventListener('click', () => {
                this.autoAssignRateCards();
            });
        }

        // Form navigation
        const prevBtn = document.getElementById('prevTicket');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.navigateForm(-1);
            });
        }

        const nextBtn = document.getElementById('nextTicket');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.navigateForm(1);
            });
        }

        // Setup column filter
        this.setupColumnFilter();
    }

    setupColumnFilter() {
        const columnOptions = {
            'requestId': 'Request ID',
            'customerRef': 'Customer Reference',
            'requester': 'Requester',
            'subject': 'Subject',
            'site': 'Site',
            'priority': 'Priority',
            'technician': 'Assigned Technician',
            'timeFields': 'Time Fields',
            'account': 'Account',
            'region': 'Region/Country/City',
            'engineerDetails': 'Engineer Details',
            'poNumber': 'PO NUMBER',
            'revenue': 'Revenue',
            'cost': 'Cost',
            'profit': 'Profit/Margin',
            'vendorPo': 'Vendor PO',
            'visitType': 'PRE/POST Visit',
            'band': 'Band',
            'status': 'Status'
        };

        const optionsDiv = document.getElementById('columnFilterOptions');
        if (!optionsDiv) return;
        
        optionsDiv.innerHTML = '';

        for (const [key, label] of Object.entries(columnOptions)) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'column-option';
            optionDiv.innerHTML = `
                <input type="checkbox" id="col_${key}" ${this.visibleColumns[key] ? 'checked' : ''}>
                <label for="col_${key}">${label}</label>
            `;
            
            const checkbox = optionDiv.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                this.visibleColumns[key] = e.target.checked;
                this.renderTable();
            });
            
            optionsDiv.appendChild(optionDiv);
        }
    }


    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-view="${view}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Show/hide view containers
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });
        const viewContainer = document.getElementById(`${view}View`);
        if (viewContainer) {
            viewContainer.classList.add('active');
        }
        
        // Render specific view
        switch(view) {
            case 'table':
                this.renderTable();
                break;
            case 'form':
                this.renderForm();
                break;
            case 'comparison':
                this.renderComparison();
                break;
        }
    }

    render() {
        this.renderTable();
        this.updateSummary();
        this.updateRateCardPreview();
    }

    renderTable() {
        const tableBody = document.getElementById('tableBody-ratecard');
        const tableHead = document.getElementById('tableHeaders-ratecard');
        
        if (!tableBody || !tableHead) {
            console.error('Table elements not found!');
            return;
        }

        const filteredTickets = this.filterTickets();
        
        // Render headers based on visible columns
        const columnDefinitions = {
            'requestId': { label: 'Request ID', source: 'Generated', width: '100px' },
            'customerRef': { label: 'Customer Ref', source: 'Customer Ticket Number', width: '120px' },
            'requester': { label: 'Requester', source: 'Ticket Data', width: '120px' },
            'subject': { label: 'Subject', source: 'Activity Details', width: '150px' },
            'site': { label: 'Site', source: 'Site Address', width: '150px' },
            'priority': { label: 'Priority', source: 'Ticket Priority', width: '80px' },
            'technician': { label: 'Technician', source: 'Technician Name', width: '120px' },
            'timeFields': { label: 'Time Fields', source: 'IN/OUT times', width: '150px' },
            'account': { label: 'Account', source: 'Customer Name', width: '120px' },
            'region': { label: 'Region', source: 'Geographic fields', width: '150px' },
            'engineerDetails': { label: 'Engineer Details', source: 'Contact info', width: '150px' },
            'poNumber': { label: 'PO Number', source: 'PO number', width: '100px' },
            'revenue': { label: 'Revenue', source: 'Calculations', width: '100px' },
            'cost': { label: 'Cost', source: 'Calculations', width: '100px' },
            'profit': { label: 'Profit/Margin', source: 'Calculations', width: '120px' },
            'vendorPo': { label: 'Vendor PO', source: 'Formatted PO', width: '120px' },
            'visitType': { label: 'Visit Type', source: 'Activity type', width: '100px' },
            'band': { label: 'Band', source: 'Band Level', width: '80px' },
            'status': { label: 'Status', source: 'Assignment Status', width: '100px' }
        };

        // Render headers
        let headersHtml = '<th style="width: 40px;"><input type="checkbox" id="selectAll"></th>';
        
        for (const [key, def] of Object.entries(columnDefinitions)) {
            if (this.visibleColumns[key]) {
                headersHtml += `
                    <th style="width: ${def.width}" 
                        data-tooltip="Source: ${def.source}">
                        ${def.label}
                    </th>
                `;
            }
        }
        
        headersHtml += '<th style="width: 150px;">Actions</th>';
        tableHead.innerHTML = headersHtml;

        // Render table rows
        if (filteredTickets.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="${Object.keys(this.visibleColumns).filter(k => this.visibleColumns[k]).length + 2}" 
                        class="empty-state">
                        <i>📭</i>
                        <h4>No tickets found</h4>
                        <p>Try adjusting your filters</p>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredTickets.map(ticket => {
                let rowHtml = `
                    <td>
                        <input type="checkbox" class="ticket-checkbox" data-id="${ticket.id}">
                    </td>
                `;

                // Add columns based on visibility
                for (const [key, def] of Object.entries(columnDefinitions)) {
                    if (this.visibleColumns[key]) {
                        let value = ticket[key] || '-';
                        
                        // Format specific columns
                        if (key === 'profit') {
                            value = `${ticket.currency || ''} ${ticket.profit} (${ticket.margin || 'N/A'})`;
                        } else if (key === 'revenue' || key === 'cost') {
                            value = `${ticket.currency || ''} ${value}`;
                        } else if (key === 'status') {
                            value = this.getStatusBadge(ticket.assignmentStatus);
                        } else if (key === 'priority') {
                            value = `<span class="priority-badge ${ticket.priority.toLowerCase()}">${ticket.priority}</span>`;
                        }
                        
                        rowHtml += `<td>${value}</td>`;
                    }
                }

                // Actions column
                rowHtml += `
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline" onclick="rateCardApp.showOverview('${ticket.id}')">
                                <i>👁️</i> Overview
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="rateCardApp.showComparisonForTicket('${ticket.id}')">
                                <i>🔍</i> Compare
                            </button>
                            ${!ticket.rateCardAssigned ? 
                                `<button class="btn btn-sm btn-success" onclick="rateCardApp.manualAssignRateCard('${ticket.id}', '')">
                                    <i>➕</i> Assign
                                </button>` : 
                                `<button class="btn btn-sm btn-danger" onclick="rateCardApp.removeRateCardAssignment('${ticket.id}')">
                                    <i>🗑️</i> Remove
                                </button>`
                            }
                        </div>
                    </td>
                `;

                return `<tr>${rowHtml}</tr>`;
            }).join('');
        }

        // Update ticket count
        const ticketCountElement = document.getElementById('ticketCount');
        if (ticketCountElement) {
            ticketCountElement.textContent = filteredTickets.length;
        }
    }

    // ==================== FLOATING MODAL OVERVIEW ====================
    
    showOverview(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) {
            this.showNotification('Ticket not found', 'error');
            return;
        }
        
        this.currentTicket = ticket;
        this.showOverviewModal(ticket);
    }

    showOverviewModal(ticket) {
        // Create or get modal
        let modal = document.getElementById('overviewModal');
        if (!modal) {
            modal = this.createOverviewModal();
        }
        
        // Populate modal with ticket data
        this.populateOverviewModal(ticket);
        
        // Show modal
        modal.style.display = 'flex';
        
        // Setup modal event listeners
        this.setupOverviewModalEvents();
    }

    createOverviewModal() {
        const modalHtml = `
            <div id="overviewModal" class="modal-overlay" style="display: none;">
                <div class="modal-content" style="width: 90%; max-width: 1200px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2 id="overviewModalTitle">Rate Card Overview</h2>
                        <button class="modal-close" onclick="rateCardApp.closeOverviewModal()">&times;</button>
                    </div>
                    <div class="modal-body" style="overflow-y: auto;">
                        <div class="overview-controls">
                            <div class="overview-selectors">
                                <div class="selector-group">
                                    <label><i class="fas fa-users"></i> Customer</label>
                                    <select id="overviewCustomer" class="filter-dropdown">
                                        <!-- Populated by JavaScript -->
                                    </select>
                                </div>
                                <div class="selector-group">
                                    <label><i class="fas fa-building"></i> Account</label>
                                    <select id="overviewAccount" class="filter-dropdown">
                                        <!-- Populated by JavaScript -->
                                    </select>
                                </div>
                                <div class="selector-group">
                                    <label><i class="fas fa-ticket-alt"></i> Ticket</label>
                                    <select id="overviewTicket" class="filter-dropdown">
                                        <!-- Populated by JavaScript -->
                                    </select>
                                </div>
                            </div>
                            <div class="view-toggle-group">
                                <span class="toggle-label">View Mode:</span>
                                <div class="toggle-switch">
                                    <button class="toggle-btn active" data-view="sidebyside">
                                        <i class="fas fa-columns"></i> Side by Side
                                    </button>
                                    <button class="toggle-btn" data-view="beforeafter">
                                        <i class="fas fa-exchange-alt"></i> Before/After
                                    </button>
                                    <button class="toggle-btn" data-view="changes">
                                        <i class="fas fa-list"></i> Changes Only
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="overview-content" id="overviewContent">
                            <!-- Content will be populated by JavaScript -->
                        </div>
                        
                        <div class="overview-summary">
                            <div class="summary-header">
                                <h3><i class="fas fa-chart-bar"></i> Change Summary</h3>
                                <div class="summary-stats">
                                    <div class="stat-badge total">
                                        <span class="stat-label">Total Changes</span>
                                        <span class="stat-value" id="totalChanges">0</span>
                                    </div>
                                    <div class="stat-badge match">
                                        <span class="stat-label">Matches</span>
                                        <span class="stat-value" id="matchCount">0</span>
                                    </div>
                                    <div class="stat-badge conflict">
                                        <span class="stat-label">Conflicts</span>
                                        <span class="stat-value" id="conflictCount">0</span>
                                    </div>
                                    <div class="stat-badge new">
                                        <span class="stat-label">New Fields</span>
                                        <span class="stat-value" id="newCount">0</span>
                                    </div>
                                </div>
                            </div>
                            <div class="changes-list" id="changesList">
                                <!-- Changes will be listed here -->
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="rateCardApp.closeOverviewModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                        <button class="btn btn-primary" onclick="rateCardApp.exportComparison()">
                            <i class="fas fa-download"></i> Export Comparison
                        </button>
                        <button class="btn btn-success" onclick="rateCardApp.applyChanges()">
                            <i class="fas fa-check"></i> Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        return document.getElementById('overviewModal');
    }

    populateOverviewModal(ticket) {
        // Set modal title
        document.getElementById('overviewModalTitle').textContent = 
            `Rate Card Overview - ${ticket.id}`;
        
        // Populate customer dropdown
        const customerSelect = document.getElementById('overviewCustomer');
        customerSelect.innerHTML = '';
        const customers = [...new Set(this.tickets.map(t => t.customer))];
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer;
            option.textContent = customer;
            option.selected = customer === ticket.customer;
            customerSelect.appendChild(option);
        });
        
        // Populate account dropdown
        this.updateOverviewAccounts(ticket.customer, ticket.account);
        
        // Populate ticket dropdown
        this.updateOverviewTickets(ticket.customer, ticket.account, ticket.id);
        
        // Load comparison data
        this.loadOverviewComparison(ticket);
    }

    updateOverviewAccounts(customer, selectedAccount) {
        const accountSelect = document.getElementById('overviewAccount');
        accountSelect.innerHTML = '';
        
        const accounts = this.tickets
            .filter(t => t.customer === customer)
            .map(t => t.account);
        const uniqueAccounts = [...new Set(accounts)];
        
        uniqueAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account;
            option.textContent = account;
            option.selected = account === selectedAccount;
            accountSelect.appendChild(option);
        });
    }

    updateOverviewTickets(customer, account, selectedTicketId) {
        const ticketSelect = document.getElementById('overviewTicket');
        ticketSelect.innerHTML = '';
        
        const filteredTickets = this.tickets.filter(t => 
            t.customer === customer && t.account === account
        );
        
        filteredTickets.forEach(ticket => {
            const option = document.createElement('option');
            option.value = ticket.id;
            option.textContent = `${ticket.id} - ${ticket.serviceType}`;
            option.selected = ticket.id === selectedTicketId;
            ticketSelect.appendChild(option);
        });
    }

    loadOverviewComparison(ticket) {
        const originalTicket = this.originalTickets.find(ot => ot.id === ticket.id);
        const modifiedTicket = this.modifiedTickets.find(mt => mt.id === ticket.id) || ticket;
        
        // Calculate changes
        const changes = this.calculateTicketChanges(originalTicket, modifiedTicket);
        
        // Update summary stats
        this.updateOverviewSummary(changes);
        
        // Load comparison based on selected view mode
        const viewMode = document.querySelector('.toggle-btn.active')?.dataset.view || 'sidebyside';
        this.renderComparisonView(viewMode, originalTicket, modifiedTicket, changes);
    }

    calculateTicketChanges(original, modified) {
        if (!original || !modified) return [];
        
        const changes = [];
        
        // Define fields to compare
        const fieldsToCompare = [
            'revenue', 'cost', 'profit', 'margin',
            'rateCardAssigned', 'rateCardVersion',
            'status', 'assignmentStatus'
        ];
        
        fieldsToCompare.forEach(field => {
            const originalValue = original[field];
            const modifiedValue = modified[field];
            
            if (originalValue !== modifiedValue) {
                changes.push({
                    field: field,
                    before: originalValue,
                    after: modifiedValue,
                    type: this.getChangeType(field, originalValue, modifiedValue)
                });
            }
        });
        
        return changes;
    }

    getChangeType(field, before, after) {
        if (field === 'rateCardAssigned') {
            return before === null ? 'new-assignment' : 'assignment-change';
        }
        
        if (typeof before === 'number' && typeof after === 'number') {
            return after > before ? 'increase' : 'decrease';
        }
        
        return 'modification';
    }

    updateOverviewSummary(changes) {
        const totalChanges = document.getElementById('totalChanges');
        const matchCount = document.getElementById('matchCount');
        const conflictCount = document.getElementById('conflictCount');
        const newCount = document.getElementById('newCount');
        
        if (totalChanges) totalChanges.textContent = changes.length;
        if (matchCount) matchCount.textContent = changes.filter(c => c.type === 'match').length;
        if (conflictCount) conflictCount.textContent = changes.filter(c => c.type === 'conflict').length;
        if (newCount) newCount.textContent = changes.filter(c => c.type === 'new-assignment').length;
        
        // Update changes list
        this.renderChangesList(changes);
    }

    renderChangesList(changes) {
        const changesList = document.getElementById('changesList');
        if (!changesList) return;
        
        if (changes.length === 0) {
            changesList.innerHTML = `
                <div class="no-changes">
                    <i class="fas fa-check-circle"></i>
                    <p>No changes detected. Original and modified data are identical.</p>
                </div>
            `;
            return;
        }
        
        changesList.innerHTML = changes.map(change => `
            <div class="change-item change-${change.type}">
                <div class="change-field">
                    <span class="field-name">${this.formatFieldName(change.field)}</span>
                    <span class="change-type">${this.getChangeTypeLabel(change.type)}</span>
                </div>
                <div class="change-values">
                    <span class="value-before">
                        <i class="fas fa-arrow-left"></i>
                        ${this.formatValue(change.field, change.before)}
                    </span>
                    <span class="change-arrow"><i class="fas fa-long-arrow-alt-right"></i></span>
                    <span class="value-after">
                        ${this.formatValue(change.field, change.after)}
                        <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
                ${change.field.includes('revenue') || change.field.includes('cost') || change.field.includes('profit') ? `
                    <div class="change-percentage">
                        ${this.calculatePercentageChange(change.before, change.after)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    renderComparisonView(viewMode, original, modified, changes) {
        const overviewContent = document.getElementById('overviewContent');
        if (!overviewContent) return;
        
        switch(viewMode) {
            case 'sidebyside':
                overviewContent.innerHTML = this.renderSideBySideView(original, modified, changes);
                break;
            case 'beforeafter':
                overviewContent.innerHTML = this.renderBeforeAfterView(original, modified, changes);
                break;
            case 'changes':
                overviewContent.innerHTML = this.renderChangesOnlyView(changes);
                break;
        }
    }

    renderSideBySideView(original, modified, changes) {
        const rateCard = modified.rateCardAssigned ? 
            this.rateCards.find(rc => rc.id === modified.rateCardAssigned) : null;
        
        return `
            <div class="comparison-container side-by-side">
                <div class="comparison-panel">
                    <div class="panel-header original">
                        <h3><i class="fas fa-history"></i> Original Data</h3>
                        <span class="panel-subtitle">Before Rate Card Assignment</span>
                    </div>
                    <div class="panel-content">
                        <div class="data-section">
                            <h4><i class="fas fa-ticket-alt"></i> Final Ticket Data</h4>
                            <table class="data-table">
                                <tr><td>Revenue:</td><td>${original?.currency || 'SGD'} ${original?.originalRevenue || original?.revenue || 0}</td></tr>
                                <tr><td>Cost:</td><td>${original?.currency || 'SGD'} ${original?.originalCost || original?.cost || 0}</td></tr>
                                <tr><td>Profit:</td><td>${original?.currency || 'SGD'} ${original?.originalProfit || original?.profit || 0}</td></tr>
                                <tr><td>Margin:</td><td>${original?.margin || '0%'}</td></tr>
                                <tr><td>Rate Card:</td><td>${original?.rateCardAssigned || 'Not assigned'}</td></tr>
                                <tr><td>Status:</td><td>${original?.status || 'VALIDATED'}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="comparison-panel">
                    <div class="panel-header modified">
                        <h3><i class="fas fa-sync-alt"></i> Modified Data</h3>
                        <span class="panel-subtitle">After Rate Card Assignment</span>
                    </div>
                    <div class="panel-content">
                        <div class="data-section">
                            <h4><i class="fas fa-ticket-alt"></i> Final Ticket Data</h4>
                            <table class="data-table">
                                <tr><td>Revenue:</td><td>${modified.currency} ${modified.modifiedRevenue || modified.revenue}</td></tr>
                                <tr><td>Cost:</td><td>${modified.currency} ${modified.modifiedCost || modified.cost}</td></tr>
                                <tr><td>Profit:</td><td>${modified.currency} ${modified.modifiedProfit || modified.profit}</td></tr>
                                <tr><td>Margin:</td><td>${modified.margin}</td></tr>
                                <tr><td>Rate Card:</td><td>${modified.rateCardAssigned || 'Not assigned'}</td></tr>
                                <tr><td>Status:</td><td>${modified.status}</td></tr>
                            </table>
                        </div>
                        
                        ${rateCard ? `
                            <div class="data-section">
                                <h4><i class="fas fa-file-invoice"></i> Service Rate Card</h4>
                                <table class="data-table">
                                    <tr><td>ID:</td><td>${rateCard.id}</td></tr>
                                    <tr><td>Version:</td><td>${rateCard.version}</td></tr>
                                    <tr><td>Category:</td><td>${rateCard.category}</td></tr>
                                    <tr><td>Rate Value:</td><td>${rateCard.currency} ${rateCard.rateValue}</td></tr>
                                    <tr><td>After Hours:</td><td>${rateCard.afterHours}x</td></tr>
                                    <tr><td>Weekend:</td><td>${rateCard.weekend}x</td></tr>
                                </table>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderBeforeAfterView(original, modified, changes) {
        const rateCard = modified.rateCardAssigned ? 
            this.rateCards.find(rc => rc.id === modified.rateCardAssigned) : null;
            
        return `
            <div class="comparison-container before-after">
                <div class="data-timeline">
                    <div class="timeline-item original">
                        <div class="timeline-marker">
                            <i class="fas fa-calendar-times"></i>
                        </div>
                        <div class="timeline-content">
                            <h4>Before Assignment</h4>
                            <div class="data-card">
                                <h5>Final Ticket Data</h5>
                                <p><strong>Revenue:</strong> ${original?.currency || 'SGD'} ${original?.originalRevenue || original?.revenue || 0}</p>
                                <p><strong>Cost:</strong> ${original?.currency || 'SGD'} ${original?.originalCost || original?.cost || 0}</p>
                                <p><strong>Status:</strong> ${original?.status || 'VALIDATED'}</p>
                                <p><strong>Rate Card:</strong> ${original?.rateCardAssigned || 'Not assigned'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="change-connector">
                        <i class="fas fa-arrow-down"></i>
                        <span>${changes.length} changes applied</span>
                    </div>
                    
                    <div class="timeline-item current">
                        <div class="timeline-marker">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="timeline-content">
                            <h4>Current State</h4>
                            <div class="data-card">
                                <h5>Final Ticket Data</h5>
                                <p><strong>Revenue:</strong> ${modified.currency} ${modified.modifiedRevenue || modified.revenue}</p>
                                <p><strong>Cost:</strong> ${modified.currency} ${modified.modifiedCost || modified.cost}</p>
                                <p><strong>Status:</strong> ${modified.status}</p>
                                <p><strong>Rate Card:</strong> ${modified.rateCardAssigned || 'Not assigned'}</p>
                                
                                ${rateCard ? `
                                    <h5>Service Rate Card</h5>
                                    <p><strong>ID:</strong> ${rateCard.id}</p>
                                    <p><strong>Rate:</strong> ${rateCard.currency} ${rateCard.rateValue}</p>
                                    <p><strong>Category:</strong> ${rateCard.category}</p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderChangesOnlyView(changes) {
        return `
            <div class="comparison-container changes-only">
                <div class="changes-overview">
                    <div class="overview-grid">
                        <div class="overview-card affected">
                            <div class="card-icon">
                                <i class="fas fa-file-invoice-dollar"></i>
                            </div>
                            <div class="card-content">
                                <h5>Financial Changes</h5>
                                <div class="card-details">
                                    ${changes.filter(c => ['revenue', 'cost', 'profit', 'margin'].includes(c.field))
                                        .map(change => `
                                            <div class="detail-item">
                                                <span>${this.formatFieldName(change.field)}</span>
                                                <span class="detail-value ${change.type}">
                                                    ${this.formatValue(change.field, change.after)}
                                                </span>
                                            </div>
                                        `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="overview-card assignment">
                            <div class="card-icon">
                                <i class="fas fa-id-card"></i>
                            </div>
                            <div class="card-content">
                                <h5>Assignment Status</h5>
                                <div class="card-details">
                                    ${changes.filter(c => c.field.includes('rateCard') || c.field.includes('assignment'))
                                        .map(change => `
                                            <div class="detail-item">
                                                <span>${this.formatFieldName(change.field)}</span>
                                                <span class="detail-value ${change.type}">
                                                    ${change.after || 'Not assigned'}
                                                </span>
                                            </div>
                                        `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatFieldName(field) {
        const fieldNames = {
            'revenue': 'Revenue',
            'cost': 'Cost',
            'profit': 'Profit',
            'margin': 'Margin',
            'rateCardAssigned': 'Rate Card',
            'rateCardVersion': 'Rate Card Version',
            'status': 'Status',
            'assignmentStatus': 'Assignment Status'
        };
        return fieldNames[field] || field;
    }

    formatValue(field, value) {
        if (value === null || value === undefined) return 'Not set';
        
        if (field.includes('revenue') || field.includes('cost') || field.includes('profit')) {
            return `${this.currentTicket?.currency || 'USD'} ${value}`;
        }
        
        if (field.includes('margin')) {
            return `${value}%`;
        }
        
        return value;
    }

    calculatePercentageChange(before, after) {
        if (typeof before !== 'number' || typeof after !== 'number') return '';
        
        const change = ((after - before) / before * 100);
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    }

    getChangeTypeLabel(type) {
        const labels = {
            'increase': 'Increased',
            'decrease': 'Decreased',
            'new-assignment': 'New Assignment',
            'assignment-change': 'Assignment Changed',
            'modification': 'Modified'
        };
        return labels[type] || type;
    }

    setupOverviewModalEvents() {
        // Customer dropdown change
        const customerSelect = document.getElementById('overviewCustomer');
        if (customerSelect) {
            customerSelect.addEventListener('change', (e) => {
                const customer = e.target.value;
                this.updateOverviewAccounts(customer, '');
                this.updateOverviewTickets(customer, '', '');
            });
        }
        
        // Account dropdown change
        const accountSelect = document.getElementById('overviewAccount');
        if (accountSelect) {
            accountSelect.addEventListener('change', (e) => {
                const customer = document.getElementById('overviewCustomer').value;
                const account = e.target.value;
                this.updateOverviewTickets(customer, account, '');
            });
        }
        
        // Ticket dropdown change
        const ticketSelect = document.getElementById('overviewTicket');
        if (ticketSelect) {
            ticketSelect.addEventListener('change', (e) => {
                const ticketId = e.target.value;
                const ticket = this.tickets.find(t => t.id === ticketId);
                if (ticket) {
                    this.currentTicket = ticket;
                    this.loadOverviewComparison(ticket);
                }
            });
        }
        
        // View mode toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewMode = e.target.closest('.toggle-btn').dataset.view;
                
                // Update active state
                document.querySelectorAll('.toggle-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.closest('.toggle-btn').classList.add('active');
                
                // Reload comparison with new view mode
                const ticket = this.currentTicket;
                if (ticket) {
                    const original = this.originalTickets.find(ot => ot.id === ticket.id);
                    const modified = this.modifiedTickets.find(mt => mt.id === ticket.id) || ticket;
                    const changes = this.calculateTicketChanges(original, modified);
                    this.renderComparisonView(viewMode, original, modified, changes);
                }
            });
        });
    }

    closeOverviewModal() {
        const modal = document.getElementById('overviewModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentTicket = null;
    }

    exportComparison() {
        const ticket = this.currentTicket;
        if (!ticket) return;
        
        const original = this.originalTickets.find(ot => ot.id === ticket.id);
        const modified = this.modifiedTickets.find(mt => mt.id === ticket.id) || ticket;
        const changes = this.calculateTicketChanges(original, modified);
        
        const data = {
            exportDate: new Date().toISOString(),
            ticketId: ticket.id,
            customer: ticket.customer,
            account: ticket.account,
            originalData: original,
            modifiedData: modified,
            changes: changes,
            summary: {
                totalChanges: changes.length,
                financialChanges: changes.filter(c => ['revenue', 'cost', 'profit', 'margin'].includes(c.field)).length,
                assignmentChanges: changes.filter(c => c.field.includes('rateCard')).length
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparison-${ticket.id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Comparison exported successfully', 'success');
    }

    applyChanges() {
        if (!this.currentTicket) return;
        
        if (confirm('Apply these changes to the ticket?')) {
            // Update the main ticket with modified data
            const modifiedTicket = this.modifiedTickets.find(mt => mt.id === this.currentTicket.id);
            if (modifiedTicket) {
                // Update financial values if they were modified
                if (modifiedTicket.modifiedRevenue && modifiedTicket.modifiedRevenue !== this.currentTicket.revenue) {
                    this.currentTicket.revenue = modifiedTicket.modifiedRevenue;
                }
                if (modifiedTicket.modifiedCost && modifiedTicket.modifiedCost !== this.currentTicket.cost) {
                    this.currentTicket.cost = modifiedTicket.modifiedCost;
                }
                if (modifiedTicket.modifiedProfit && modifiedTicket.modifiedProfit !== this.currentTicket.profit) {
                    this.currentTicket.profit = modifiedTicket.modifiedProfit;
                }
                
                this.render();
                this.showNotification('Changes applied successfully', 'success');
            }
        }
    }

    // ==================== EXISTING METHODS (keep as is) ====================

    renderForm() {
        // Keep your existing renderForm method exactly as it was
        const filteredTickets = this.filterTickets();
        const ticketForm = document.getElementById('ticketForm');
        
        if (!ticketForm) return;
        
        if (filteredTickets.length === 0) {
            ticketForm.innerHTML = `
                <div class="empty-state">
                    <i>📭</i>
                    <h4>No tickets found</h4>
                    <p>Adjust your filters to see tickets</p>
                </div>
            `;
            return;
        }

        if (this.currentFormIndex >= filteredTickets.length) {
            this.currentFormIndex = 0;
        }

        const ticket = filteredTickets[this.currentFormIndex];
        const currentPosition = document.getElementById('currentFormPosition');
        if (currentPosition) {
            currentPosition.textContent = `Ticket ${this.currentFormIndex + 1} of ${filteredTickets.length}`;
        }
        
        // Check if this ticket has a rate card assigned
        const hasRateCard = ticket.rateCardAssigned;
        const rateCard = hasRateCard ? 
            this.rateCards.find(rc => rc.id === ticket.rateCardAssigned) : null;

        const formHtml = `
            <div class="form-group">
                <div class="form-label">Final Ticket ID</div>
                <div class="form-value">${ticket.id}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Customer Reference</div>
                <div class="form-value">${ticket.customerRef}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Requester</div>
                <div class="form-value">${ticket.requester}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Subject</div>
                <div class="form-value">${ticket.subject}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Site</div>
                <div class="form-value">${ticket.site}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Priority</div>
                <div class="form-value ${ticket.priority === 'High' ? 'conflict' : ''}">${ticket.priority}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Assigned Technician</div>
                <div class="form-value">${ticket.technician}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Time Fields</div>
                <div class="form-value">${ticket.timeFields}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Account</div>
                <div class="form-value">${ticket.account}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Region/Country/City</div>
                <div class="form-value">${ticket.region}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Engineer Details</div>
                <div class="form-value">${ticket.engineerDetails}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">PO NUMBER</div>
                <div class="form-value">${ticket.poNumber}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Revenue</div>
                <div class="form-value ${hasRateCard ? 'assigned' : 'missing'}">
                    ${ticket.currency} ${ticket.revenue}
                    ${hasRateCard ? ' (Rate Card Applied)' : ' (No Rate Card)'}
                </div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Cost</div>
                <div class="form-value ${hasRateCard ? 'assigned' : 'missing'}">
                    ${ticket.currency} ${ticket.cost}
                </div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Profit/Margin</div>
                <div class="form-value ${hasRateCard ? 'assigned' : 'missing'}">
                    ${ticket.currency} ${ticket.profit} (${ticket.margin})
                </div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Vendor PO</div>
                <div class="form-value">${ticket.vendorPo}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">PRE/POST Visit</div>
                <div class="form-value">${ticket.visitType}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Band</div>
                <div class="form-value">${ticket.band}</div>
            </div>
            
            <div class="form-group">
                <div class="form-label">Rate Card Assignment</div>
                <div class="form-value ${hasRateCard ? 'assigned' : 'missing'}">
                    ${hasRateCard ? 
                        `${ticket.rateCardAssigned} (v${ticket.rateCardVersion}) - ${rateCard ? rateCard.category : 'N/A'}` : 
                        'No rate card assigned'
                    }
                </div>
            </div>
            
            <div class="form-actions">
                <button class="btn btn-outline" onclick="rateCardApp.showOverview('${ticket.id}')">
                    <i>👁️</i> Full Overview
                </button>
                <button class="btn btn-primary" onclick="rateCardApp.showComparisonForTicket('${ticket.id}')">
                    <i>🔍</i> Compare with Rate Card
                </button>
                ${!hasRateCard ? 
                    `<button class="btn btn-success" onclick="rateCardApp.manualAssignRateCard('${ticket.id}', '')">
                        <i>➕</i> Assign Rate Card
                    </button>` : 
                    `<button class="btn btn-danger" onclick="rateCardApp.removeRateCardAssignment('${ticket.id}')">
                        <i>🗑️</i> Remove Assignment
                    </button>`
                }
            </div>
        `;

        ticketForm.innerHTML = formHtml;
    }

    renderComparison() {
        // Keep your existing renderComparison method
        const comparisonView = document.getElementById('comparisonView');
        if (!comparisonView) return;
        
        comparisonView.innerHTML = `
            <div class="comparison-view-header">
                <h3><i class="fas fa-exchange-alt"></i> Rate Card Comparison Preview</h3>
                <p>Select a ticket to compare data with assigned rate card</p>
            </div>
            
            <div class="comparison-selector">
                <label>Select Ticket:</label>
                <select id="comparisonTicketSelect" class="filter-dropdown">
                    <option value="">Select a ticket...</option>
                    ${this.tickets.map(ticket => `
                        <option value="${ticket.id}">${ticket.id} - ${ticket.customer} - ${ticket.serviceType}</option>
                    `).join('')}
                </select>
            </div>
            
            <div class="comparison-container" id="comparisonContainer">
                <div class="empty-state">
                    <i>🔍</i>
                    <h4>Select a ticket to compare</h4>
                    <p>Choose a ticket from the dropdown above to view comparison</p>
                </div>
            </div>
            
            <div class="comparison-legend">
                <div class="legend-item">
                    <span class="legend-color original"></span>
                    <span>Original Ticket Data</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color assigned"></span>
                    <span>Assigned Rate Card Data</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color match"></span>
                    <span>Perfect Match</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color conflict"></span>
                    <span>Conflict/Mismatch</span>
                </div>
            </div>
        `;

        // Add event listener for ticket selection
        const ticketSelect = document.getElementById('comparisonTicketSelect');
        if (ticketSelect) {
            ticketSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.showComparisonForTicket(e.target.value);
                }
            });
        }
    }

    // Keep all other existing methods exactly as they were
    navigateForm(direction) {
        const filteredTickets = this.filterTickets();
        this.currentFormIndex += direction;
        
        if (this.currentFormIndex < 0) {
            this.currentFormIndex = filteredTickets.length - 1;
        } else if (this.currentFormIndex >= filteredTickets.length) {
            this.currentFormIndex = 0;
        }
        
        this.renderForm();
    }

    filterTickets() {
        return this.tickets.filter(ticket => {
            // Status filter
            if (this.filters.status !== 'all' && this.filters.status !== ticket.assignmentStatus) {
                return false;
            }
            
            // Customer filter
            if (this.filters.customer !== 'All customers' && this.filters.customer !== ticket.customer) {
                return false;
            }
            
            // Account filter
            if (this.filters.account !== 'all' && this.filters.account !== ticket.account) {
                return false;
            }
            
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                return ticket.id.toLowerCase().includes(searchLower) ||
                       ticket.ticketId.toLowerCase().includes(searchLower) ||
                       ticket.customer.toLowerCase().includes(searchLower) ||
                       ticket.account.toLowerCase().includes(searchLower) ||
                       ticket.subject.toLowerCase().includes(searchLower);
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
        return badges[status] || '<span class="status-badge status-pending">Pending</span>';
    }

    updateSummary() {
        const counts = {
            assigned: this.tickets.filter(t => t.assignmentStatus === 'assigned').length,
            pending: this.tickets.filter(t => t.assignmentStatus === 'pending').length,
            missing: this.tickets.filter(t => t.assignmentStatus === 'missing').length,
            conflict: this.tickets.filter(t => t.assignmentStatus === 'conflict').length
        };

        // Update all count displays
        const countIds = ['assignedCount', 'pendingCount', 'missingCount', 'conflictCount'];
        const summaryIds = ['summaryAssigned', 'summaryPending', 'summaryMissing', 'summaryConflict'];
        
        const countValues = [counts.assigned, counts.pending, counts.missing, counts.conflict];
        
        countIds.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = countValues[index];
            }
        });
        
        summaryIds.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = countValues[index];
            }
        });

        // Update progress
        const totalTickets = this.tickets.length;
        const progress = totalTickets > 0 ? Math.round((counts.assigned / totalTickets) * 100) : 0;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}% Complete`;
    }

    updateRateCardPreview() {
        const previewDiv = document.getElementById('rateCardPreview');
        if (!previewDiv) return;
        
        // Find first assigned rate card
        const assignedTicket = this.tickets.find(t => t.rateCardAssigned);
        
        if (assignedTicket && assignedTicket.rateCardAssigned) {
            const rateCard = this.rateCards.find(rc => rc.id === assignedTicket.rateCardAssigned);
            
            if (rateCard) {
                previewDiv.innerHTML = `
                    <div class="preview-header">
                        <h3>Rate Card Preview</h3>
                    </div>
                    <div class="preview-content">
                        <div class="preview-item">
                            <div class="preview-label">Rate Card ID</div>
                            <div class="preview-value">${rateCard.id}</div>
                        </div>
                        <div class="preview-item">
                            <div class="preview-label">Version</div>
                            <div class="preview-value">${rateCard.version}</div>
                        </div>
                        <div class="preview-item">
                            <div class="preview-label">Service Type</div>
                            <div class="preview-value">${rateCard.category}</div>
                        </div>
                        <div class="preview-item">
                            <div class="preview-label">Band Level</div>
                            <div class="preview-value">${rateCard.bandLevel}</div>
                        </div>
                        <div class="preview-item">
                            <div class="preview-label">Base Rate</div>
                            <div class="preview-value">${rateCard.currency} ${rateCard.rateValue}</div>
                        </div>
                        <div class="preview-item">
                            <div class="preview-label">Validity</div>
                            <div class="preview-value">${rateCard.validFrom} to ${rateCard.validTo}</div>
                        </div>
                        <div class="preview-item">
                            <div class="preview-label">Applied to Ticket</div>
                            <div class="preview-value">${assignedTicket.id}</div>
                        </div>
                    </div>
                `;
            } else {
                previewDiv.innerHTML = this.getEmptyPreview();
            }
        } else {
            previewDiv.innerHTML = this.getEmptyPreview();
        }
    }

    getEmptyPreview() {
        return `
            <div class="preview-header">
                <h3>Rate Card Preview</h3>
            </div>
            <div class="preview-content">
                <div class="empty-state">
                    <i>📄</i>
                    <h4>No Rate Card Assigned</h4>
                    <p>Select a ticket to preview rate card details</p>
                </div>
            </div>
        `;
    }

    autoAssignRateCards() {
        console.log('Auto-assigning rate cards...');
        
        let assignedCount = 0;
        let conflictCount = 0;
        let missingCount = 0;

        this.tickets.forEach(ticket => {
            if (ticket.rateCardAssigned) return; // Skip already assigned
            
            const matchingCards = this.findMatchingRateCards(ticket);
            
            if (matchingCards.length === 1) {
                // Auto-assign single match
                const rateCard = matchingCards[0];
                
                // Store original values before assignment
                const originalTicket = this.originalTickets.find(ot => ot.id === ticket.id);
                if (originalTicket) {
                    originalTicket.originalRevenue = ticket.revenue;
                    originalTicket.originalCost = ticket.cost;
                    originalTicket.originalProfit = ticket.profit;
                }
                
                // Assign rate card
                this.assignRateCard(ticket, rateCard);
                assignedCount++;
                
                // Update modified values with rate card calculations
                const modifiedTicket = this.modifiedTickets.find(mt => mt.id === ticket.id);
                if (modifiedTicket) {
                    // Simulate price changes based on rate card
                    modifiedTicket.modifiedRevenue = ticket.revenue * 1.1; // 10% increase
                    modifiedTicket.modifiedCost = ticket.cost * 1.1; // 10% increase
                    modifiedTicket.modifiedProfit = modifiedTicket.modifiedRevenue - modifiedTicket.modifiedCost;
                    modifiedTicket.modifiedMargin = ((modifiedTicket.modifiedProfit / modifiedTicket.modifiedRevenue) * 100).toFixed(2) + '%';
                    modifiedTicket.rateCardAssigned = rateCard.id;
                    modifiedTicket.rateCardVersion = rateCard.version;
                    modifiedTicket.assignmentStatus = 'assigned';
                    modifiedTicket.status = 'READY FOR PRICING';
                }
            } else if (matchingCards.length > 1) {
                // Multiple matches - flag as conflict
                ticket.assignmentStatus = 'conflict';
                conflictCount++;
            } else {
                // No match found
                ticket.assignmentStatus = 'missing';
                missingCount++;
            }
        });

        this.render();
        this.showNotification(`Auto-assigned: ${assignedCount} assigned, ${conflictCount} conflicts, ${missingCount} missing`, 'info');
    }

    findMatchingRateCards(ticket) {
        return this.rateCards.filter(card => {
            return card.customer === ticket.customer &&
                   card.account === ticket.account &&
                   card.category === ticket.serviceType &&
                   card.bandLevel === ticket.band &&
                   card.currency === ticket.currency &&
                   card.status === 'Active';
        });
    }

    assignRateCard(ticket, rateCard) {
        ticket.rateCardAssigned = rateCard.id;
        ticket.rateCardVersion = rateCard.version;
        ticket.assignmentStatus = 'assigned';
        ticket.status = 'READY FOR PRICING';
        
        this.showNotification(`Rate card ${rateCard.id} assigned to ${ticket.id}`, 'success');
    }

    manualAssignRateCard(ticketId, rateCardId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        
        if (!ticket) {
            this.showNotification('Ticket not found', 'error');
            return;
        }
        
        // Show manual assignment modal
        this.showManualAssignmentModal(ticket);
    }

    removeRateCardAssignment(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        ticket.rateCardAssigned = null;
        ticket.rateCardVersion = null;
        ticket.assignmentStatus = 'pending';
        ticket.status = 'VALIDATED';

        this.render();
        this.showNotification(`Rate card assignment removed from ${ticketId}`, 'info');
    }

    showComparisonForTicket(ticketId) {
        // This now redirects to the overview modal
        this.showOverview(ticketId);
    }

    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Simple alert for now
        alert(`${type.toUpperCase()}: ${message}`);
    }

    exportReport() {
        const data = {
            timestamp: new Date().toISOString(),
            tickets: this.tickets.length,
            assigned: this.tickets.filter(t => t.assignmentStatus === 'assigned').length,
            pending: this.tickets.filter(t => t.assignmentStatus === 'pending').length,
            missing: this.tickets.filter(t => t.assignmentStatus === 'missing').length,
            conflict: this.tickets.filter(t => t.assignmentStatus === 'conflict').length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rate-card-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Report exported successfully', 'success');
    }

    showManualAssignmentModal(ticket) {
        const matchingCards = this.findMatchingRateCards(ticket);
        
        const modalHtml = `
            <div class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div class="modal-content" style="background: white; border-radius: 10px; width: 600px; max-width: 90%; max-height: 80vh; overflow-y: auto;">
                    <div class="modal-header" style="padding: 20px; background: #2c3e50; color: white; border-radius: 10px 10px 0 0;">
                        <h2 style="margin: 0;">Assign Rate Card - ${ticket.id}</h2>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 20px;">
                        <p><strong>Ticket Details:</strong> ${ticket.customer} - ${ticket.account} - ${ticket.serviceType} - ${ticket.band}</p>
                        
                        ${matchingCards.length > 0 ? `
                            <h3>Available Rate Cards:</h3>
                            <div style="margin-top: 15px;">
                                ${matchingCards.map(card => `
                                    <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                                        <h4 style="margin: 0 0 10px 0;">${card.id} (${card.version})</h4>
                                        <p style="margin: 5px 0;">Rate: ${card.currency} ${card.rateValue} (${card.rateType})</p>
                                        <p style="margin: 5px 0;">Validity: ${card.validFrom} to ${card.validTo}</p>
                                        <button onclick="rateCardApp.confirmAssignRateCard('${ticket.id}', '${card.id}'); this.closest('.modal-overlay').remove();" 
                                                style="margin-top: 10px; padding: 8px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                            Assign This Card
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 30px;">
                                <p style="color: #e74c3c; font-size: 16px;">No matching rate cards found!</p>
                                <p>No rate cards match this ticket's criteria.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    confirmAssignRateCard(ticketId, rateCardId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        const rateCard = this.rateCards.find(rc => rc.id === rateCardId);
        
        if (ticket && rateCard) {
            this.assignRateCard(ticket, rateCard);
            this.render();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rateCardApp = new RateCardAssignmentEnhanced();
    console.log('Rate Card Application initialized');
});