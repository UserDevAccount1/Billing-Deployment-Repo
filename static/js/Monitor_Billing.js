// Enhanced sample data with manual workflow integration
const steps = [
    {
        id: 1,
        name: 'Ticket Match',
        icon: 'fas fa-ticket-alt',
        status: 'completed',
        timestamp: '2024-01-15 09:00:00',
        manualCounterpart: {
            name: 'Ticket Data Distribution',
            description: 'Ticket Data Upload (Regional Stage) - Upload ticket file per region (Excel/CSV), Validate columns & ticket details, Mark upload as Validated',
            requiredControls: ['Data Upload Tracker Table', 'Notification Toggle'],
            workflowDetails: `Ticket Data Upload (Regional Stage) (SDM Users, Admin Oversight)
            1. Upload ticket file per region (Excel/CSV)
            2. Validate columns & ticket details
            3. Mark upload as Validated
            4. Mandatory: Data Upload Tracker Table, Notification Toggle`
        }
    },
    {
        id: 2,
        name: 'Rate Match',
        icon: 'fas fa-exchange-alt',
        status: 'in-progress',
        timestamp: '2024-01-15 09:02:00',
        manualCounterpart: {
            name: 'Rate Card Assignment',
            description: 'Select appropriate rate card. Admin reviews and approves.',
            requiredControls: ['Rate Card Management Table', 'Approval Button', 'Change Log Panel'],
            workflowDetails: `Rate Card Assignment (FSO, Verified by Admin)
            1. Select appropriate rate card
            2. Admin reviews and approves
            3. Mandatory: Rate Card Management Table, Approval Button, Change Log Panel`
        }
    },
    {
        id: 3,
        name: 'File Gen',
        icon: 'fas fa-file-export',
        status: 'pending',
        timestamp: null
    },
    {
        id: 4,
        name: 'Consolidate',
        icon: 'fas fa-compress-arrows-alt',
        status: 'pending',
        timestamp: null,
        manualCounterpart: {
            name: 'Consolidation & Upload to HCL',
            description: 'Merge regional files. Validate currency and totals. Upload to HCL FSO Portal and log reference.',
            requiredControls: ['File Merge Tool', 'Currency Validator', 'Upload Button', 'Upload Log Table'],
            workflowDetails: `Consolidation & Upload to HCL (Admin)
            1. Merge regional files
            2. Validate currency and totals
            3. Upload to HCL FSO Portal and log reference
            4. Mandatory: File Merge Tool, Currency Validator, Upload Button, Upload Log Table`
        }
    },
    {
        id: 5,
        name: 'Upload',
        icon: 'fas fa-cloud-upload-alt',
        status: 'pending',
        timestamp: null
    },
    {
        id: 6,
        name: 'Approval',
        icon: 'fas fa-thumbs-up',
        status: 'pending',
        timestamp: null,
        manualCounterpart: {
            name: 'Review & Monitoring',
            description: 'Monitor HCL feedback. Update record status manually. Notify SDM via Teams.',
            requiredControls: ['Review Tracker Table', 'Notify SDM Button', 'Summary Graph'],
            workflowDetails: `Review & Monitoring (Admin & FSO)
            1. Monitor HCL feedback
            2. Update record status manually
            3. Notify SDM via Teams
            4. Mandatory: Review Tracker Table, Notify SDM Button, Summary Graph`
        }
    },
    {
        id: 7,
        name: 'Invoice',
        icon: 'fas fa-file-invoice-dollar',
        status: 'pending',
        timestamp: null,
        manualCounterpart: {
            name: 'Final Approval & Invoice Preparation',
            description: 'Review all regions marked "Approved". Click "Generate Invoice Summary". Export report for Finance Team.',
            requiredControls: ['Invoice Summary Table', 'Export Controls', 'Cycle Close Control'],
            workflowDetails: `Final Approval & Invoice Preparation (Admin)
            1. Review all regions marked "Approved"
            2. Click "Generate Invoice Summary"
            3. Export report for Finance Team
            4. Mandatory: Invoice Summary Table, Export Controls, Cycle Close Control`
        }
    }
];

const cycles = [
    {
        cycleId: '2024-01',
        customer: 'Acme Corp',
        region: 'EMEA',
        status: 'In Progress',
        currentStep: 'Rate Match',
        processed: 125,
        errors: 3,
        lastAction: '2024-01-15 09:10:00 (System)',
        uploadRef: 'UPL-00123',
        slaTimer: '02:30:15',
        slaFlag: 'warning',
        manualIntervention: {
            required: true,
            step: 'Rate Card Assignment',
            startedAt: '2024-01-15 09:10:00',
            assignedTo: 'FSO User',
            dueBy: '2024-01-15 17:00:00',
            status: 'manual-pending',
            details: {
                ticketCount: 3,
                issueType: 'Rate mismatch',
                affectedTickets: ['TKT-001', 'TKT-003', 'TKT-007']
            }
        },
        details: {
            startedAt: '2024-01-15 09:00:00',
            recordsTotal: 125,
            recordsProcessed: 122,
            successRate: '97.6%'
        }
    },
    {
        cycleId: '2024-01',
        customer: 'Globex Corporation',
        region: 'APAC',
        status: 'Completed',
        currentStep: 'Invoice',
        processed: 89,
        errors: 0,
        lastAction: '2024-01-15 08:45:00 (Admin)',
        uploadRef: 'UPL-00122',
        slaTimer: '04:15:30',
        slaFlag: 'success',
        manualIntervention: {
            required: false,
            step: null,
            startedAt: null,
            assignedTo: null,
            dueBy: null,
            status: null,
            details: null
        },
        details: {
            startedAt: '2024-01-15 08:00:00',
            recordsTotal: 89,
            recordsProcessed: 89,
            successRate: '100%'
        }
    },
    {
        cycleId: '2024-01',
        customer: 'Wayne Enterprises',
        region: 'NA',
        status: 'Validation Failed',
        currentStep: 'Ticket Match',
        processed: 67,
        errors: 12,
        lastAction: '2024-01-15 09:05:00 (System)',
        uploadRef: null,
        slaTimer: '01:45:20',
        slaFlag: 'error',
        manualIntervention: {
            required: true,
            step: 'Ticket Data Distribution',
            startedAt: '2024-01-15 09:05:00',
            assignedTo: 'SDM User',
            dueBy: '2024-01-15 14:00:00',
            status: 'manual-in-progress',
            details: {
                ticketCount: 12,
                issueType: 'Validation errors',
                affectedTickets: ['TKT-101', 'TKT-102', 'TKT-103']
            }
        },
        details: {
            startedAt: '2024-01-15 08:30:00',
            recordsTotal: 67,
            recordsProcessed: 55,
            successRate: '82.1%'
        }
    },
    {
        cycleId: '2024-01',
        customer: 'Stark Industries',
        region: 'EU',
        status: 'Paused',
        currentStep: 'File Gen',
        processed: 42,
        errors: 1,
        lastAction: '2024-01-15 09:15:00 (Admin)',
        uploadRef: null,
        slaTimer: '03:20:45',
        slaFlag: 'warning',
        manualIntervention: {
            required: true,
            step: 'Rate Card Assignment',
            startedAt: '2024-01-15 09:15:00',
            assignedTo: 'FSO User',
            dueBy: '2024-01-15 18:00:00',
            status: 'manual-in-progress',
            details: {
                ticketCount: 1,
                issueType: 'Complex calculation required',
                affectedTickets: ['TKT-201']
            }
        },
        details: {
            startedAt: '2024-01-15 08:45:00',
            recordsTotal: 42,
            recordsProcessed: 41,
            successRate: '97.6%'
        }
    },
    {
        cycleId: '2024-01',
        customer: 'Umbrella Corp',
        region: 'LATAM',
        status: 'In Progress',
        currentStep: 'Ticket Match',
        processed: 31,
        errors: 0,
        lastAction: '2024-01-15 09:18:00 (System)',
        uploadRef: null,
        slaTimer: '00:45:10',
        slaFlag: 'success',
        manualIntervention: {
            required: false,
            step: null,
            startedAt: null,
            assignedTo: null,
            dueBy: null,
            status: null,
            details: null
        },
        details: {
            startedAt: '2024-01-15 09:00:00',
            recordsTotal: 31,
            recordsProcessed: 31,
            successRate: '100%'
        }
    }
];

const stepLogs = {
    2: [
        { time: '09:10:00', message: 'Rate matching started for 125 records', type: 'info' },
        { time: '09:10:15', message: 'Found 122 matching rate entries', type: 'success' },
        { time: '09:10:30', message: '3 records missing rate matches', type: 'warning' },
        { time: '09:11:00', message: 'Applied fallback rates for 2 records', type: 'info' },
        { time: '09:11:30', message: '1 record requires manual intervention - Rate Card Assignment needed', type: 'manual' }
    ]
};

// Table configuration
const tableConfig = {
    columns: [
        { id: 'cycleId', label: 'Cycle ID', visible: true, sortable: true },
        { id: 'customer', label: 'Customer', visible: true, sortable: true },
        { id: 'region', label: 'Region', visible: true, sortable: true },
        { id: 'status', label: 'Status', visible: true, sortable: true },
        { id: 'currentStep', label: 'Current Step', visible: true, sortable: true },
        { id: 'processed', label: 'Processed', visible: true, sortable: true },
        { id: 'errors', label: 'Errors', visible: true, sortable: true },
        { id: 'lastAction', label: 'Last Action', visible: true, sortable: true },
        { id: 'uploadRef', label: 'Upload Ref', visible: true, sortable: true },
        { id: 'slaTimer', label: 'SLA Timer', visible: true, sortable: true },
        { id: 'manualIntervention', label: 'Manual Intervention', visible: true, sortable: false },
        { id: 'manualStep', label: 'Manual Step', visible: true, sortable: false },
        { id: 'actions', label: 'Actions', visible: true, sortable: false }
    ],
    pageSize: 10,
    currentPage: 1,
    sortColumn: 'lastAction',
    sortDirection: 'desc'
};

let currentStep = 2; // Rate Match is active (starting at step 2 since step 1 is completed)
let advancedFilters = [];
let filteredCycles = [...cycles];

// ==================== QUICK SETUP MODAL FUNCTIONS ====================

// Initialize Quick Setup Tabs
function initQuickSetupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
}

// Set tab values from configuration
function setTabValues(tabId, configuration) {
    const tab = document.getElementById(tabId);
    if (tab) {
        const inputs = tab.querySelectorAll('select, input');
        const configKeys = Object.keys(configuration);

        configKeys.forEach((key, index) => {
            if (index < inputs.length && configuration[key]) {
                inputs[index].value = configuration[key];
            }
        });
    }
}

// Load saved configuration into modal
function loadQuickSetupConfig() {
    const savedConfig = localStorage.getItem('quickSetupConfig');
    if (savedConfig) {
        try {
            const configuration = JSON.parse(savedConfig);

            // Determine which tab to activate based on configuration keys
            if (configuration.engineerType) {
                // It's a dedicated config
                document.querySelector('[data-tab="dedicated"]').click();
                setTabValues('dedicatedTab', configuration);
            } else if (configuration.projectType) {
                // It's a project config
                document.querySelector('[data-tab="project"]').click();
                setTabValues('projectTab', configuration);
            } else if (configuration.visitType) {
                // It's a SV Visit config
                document.querySelector('[data-tab="svVisit"]').click();
                setTabValues('svVisitTab', configuration);
            } else if (configuration.dispatchPriority) {
                // It's a Dispatch config
                document.querySelector('[data-tab="dispatch"]').click();
                setTabValues('dispatchTab', configuration);
            }
        } catch (e) {
            console.error('Error loading quick setup config:', e);
        }
    }
}

// Save Quick Setup Configuration
function saveQuickSetupConfiguration() {
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    let configuration = {};

    try {
        if (activeTab === 'dedicated') {
            const dedicatedTab = document.getElementById('dedicatedTab');
            if (dedicatedTab) {
                const selects = dedicatedTab.querySelectorAll('select');
                configuration = {
                    engineerType: selects[0]?.value || 'Senior Engineer',
                    availability: selects[1]?.value || 'Full-time (40 hrs/week)',
                    skillLevel: selects[2]?.value || 'Intermediate',
                    duration: selects[3]?.value || '3 Months',
                    toolAccess: selects[4]?.value || 'Standard Toolset',
                    permissions: selects[5]?.value || 'Limited Write',
                    vpnAccess: selects[6]?.value || 'Standard VPN',
                    training: selects[7]?.value || 'Basic Orientation',
                    security: selects[8]?.value || 'Enhanced',
                    nda: selects[9]?.value || 'Standard NDA',
                    dataAccess: selects[10]?.value || 'Internal Data',
                    audit: selects[11]?.value || 'Quarterly'
                };
            }
        } else if (activeTab === 'project') {
            const projectTab = document.getElementById('projectTab');
            if (projectTab) {
                const inputs = projectTab.querySelectorAll('select, input');
                configuration = {
                    projectType: inputs[0]?.value || 'Implementation',
                    projectDuration: inputs[1]?.value || 'Medium-term (3-6 months)',
                    teamSize: inputs[2]?.value || 'Small Team (2-5)',
                    budget: inputs[3]?.value || '$50K - $100K',
                    startDate: inputs[4]?.value || '2024-02-01',
                    endDate: inputs[5]?.value || '2024-06-30',
                    milestoneFreq: inputs[6]?.value || 'Monthly',
                    reporting: inputs[7]?.value || 'Weekly',
                    documentation: inputs[8]?.value || 'Standard',
                    testing: inputs[9]?.value || 'Standard Testing',
                    qa: inputs[10]?.value || 'Team Lead Review',
                    metrics: inputs[11]?.value || 'On-time Delivery'
                };
            }
        } else if (activeTab === 'svVisit') {
            const svVisitTab = document.getElementById('svVisitTab');
            if (svVisitTab) {
                const selects = svVisitTab.querySelectorAll('select');
                configuration = {
                    visitType: selects[0]?.value || 'Full Day Visit (8 hrs)',
                    visitFrequency: selects[1]?.value || 'One-time',
                    preferredDay: selects[2]?.value || 'Monday',
                    timeSlot: selects[3]?.value || 'Morning (9 AM - 1 PM)',
                    serviceType: selects[4]?.value || 'Preventive Maintenance',
                    skillLevel: selects[5]?.value || 'Certified Technician',
                    toolsRequired: selects[6]?.value || 'Basic Hand Tools',
                    partsRequired: selects[7]?.value || 'No Parts Needed',
                    reportType: selects[8]?.value || 'Basic Summary',
                    customerSignoff: selects[9]?.value || 'Yes',
                    followupRequired: selects[10]?.value || 'No Follow-up',
                    billingMethod: selects[11]?.value || 'Fixed Rate'
                };
            }
        } else if (activeTab === 'dispatch') {
            const dispatchTab = document.getElementById('dispatchTab');
            if (dispatchTab) {
                const selects = dispatchTab.querySelectorAll('select');
                configuration = {
                    dispatchPriority: selects[0]?.value || 'Low (24-48 hrs)',
                    responseTimeSLA: selects[1]?.value || '4 hours',
                    technicianLevel: selects[2]?.value || 'Level 1 - Basic',
                    travelRadius: selects[3]?.value || 'Local (10 miles)',
                    coverageArea: selects[4]?.value || 'Urban Only',
                    multipleSites: selects[5]?.value || 'Single Site',
                    accessRequirements: selects[6]?.value || 'Standard Access',
                    parkingLogistics: selects[7]?.value || 'Standard Parking',
                    customerNotification: selects[8]?.value || 'Email Only',
                    statusUpdates: selects[9]?.value || 'On Arrival Only',
                    escalationProcess: selects[10]?.value || 'Standard Escalation',
                    completionConfirmation: selects[11]?.value || 'Email Confirmation'
                };
            }
        }

        // Save to localStorage
        localStorage.setItem('quickSetupConfig', JSON.stringify(configuration));
        console.log('Quick Setup Configuration Saved:', configuration);
        return configuration;
    } catch (error) {
        console.error('Error saving quick setup configuration:', error);
        return {};
    }
}

// Apply Quick Setup Configuration
function applyQuickSetupConfiguration() {
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    const configuration = saveQuickSetupConfiguration();

    if (Object.keys(configuration).length === 0) {
        alert('Error: Could not save configuration. Please try again.');
        return;
    }

    // Apply configuration based on active tab
    if (activeTab === 'dedicated') {
        alert(`✅ Dedicated Resources configuration applied!\n\n• Engineer Type: ${configuration.engineerType}\n• Availability: ${configuration.availability}\n• Security Clearance: ${configuration.security}\n• Duration: ${configuration.duration}\n\nConfiguration saved and will be used for new assignments.`);
    } else if (activeTab === 'project') {
        alert(`✅ Project configuration applied!\n\n• Project Type: ${configuration.projectType}\n• Duration: ${configuration.projectDuration}\n• Team Size: ${configuration.teamSize}\n• Budget: ${configuration.budget}\n\nConfiguration saved and will be used for new projects.`);
    } else if (activeTab === 'svVisit') {
        alert(`✅ SV Full & Half Day Visit configuration applied!\n\n• Visit Type: ${configuration.visitType}\n• Visit Frequency: ${configuration.visitFrequency}\n• Service Type: ${configuration.serviceType}\n• Billing Method: ${configuration.billingMethod}\n\nConfiguration saved and will be used for service visits.`);
    } else if (activeTab === 'dispatch') {
        alert(`✅ Dispatch configuration applied!\n\n• Dispatch Priority: ${configuration.dispatchPriority}\n• Response Time SLA: ${configuration.responseTimeSLA}\n• Technician Level: ${configuration.technicianLevel}\n• Coverage Area: ${configuration.coverageArea}\n\nConfiguration saved and will be used for dispatch operations.`);
    }
}

// Initialize Quick Setup Modal
function initQuickSetupModal() {
    const modal = document.getElementById('quickSetupModal');
    const openBtn = document.getElementById('quickSetupBtn');
    const closeBtn = document.getElementById('closeQuickSetupModal');
    const cancelBtn = document.getElementById('cancelQuickSetup');
    const saveBtn = document.getElementById('saveQuickSetup');
    const applyBtn = document.getElementById('applyQuickSetup');

    if (!modal || !openBtn) {
        console.error('Quick Setup Modal elements not found!');
        return;
    }

    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        loadQuickSetupConfig(); // Load saved config when opening
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        alert('Quick setup configuration cancelled.');
    });

    saveBtn.addEventListener('click', () => {
        saveQuickSetupConfiguration();
        alert('Quick setup configuration saved.');
    });

    applyBtn.addEventListener('click', () => {
        applyQuickSetupConfiguration();
        modal.classList.remove('active');
    });

    // Initialize tabs
    initQuickSetupTabs();
}

// ==================== MAIN APPLICATION FUNCTIONS ====================

// Initialize step tracker with manual workflow indicators
function initStepTracker() {
    const tracker = document.getElementById('stepTracker');
    if (!tracker) return;

    tracker.innerHTML = '';

    steps.forEach((step, index) => {
        const stepEl = document.createElement('div');
        const hasManual = step.manualCounterpart ? 'requires-manual' : '';
        stepEl.className = `step ${step.status} ${hasManual} ${step.id === currentStep ? 'active' : ''}`;
        stepEl.dataset.stepId = step.id;

        let manualIndicator = '';
        if (step.manualCounterpart) {
            manualIndicator = '<div class="step-manual-indicator"><i class="fas fa-user"></i></div>';
        }

        stepEl.innerHTML = `
            <div class="step-icon">
                <i class="${step.icon}"></i>
                ${manualIndicator}
            </div>
            <div class="step-label">${step.name}</div>
            <div class="step-status ${step.status}">${step.status}</div>
        `;

        // Add tooltip for manual workflow
        if (step.manualCounterpart) {
            stepEl.title = `Manual workflow: ${step.manualCounterpart.name}`;
        }

        stepEl.addEventListener('click', () => selectStep(step.id));
        tracker.appendChild(stepEl);
    });
}

// Initialize column visibility controls
function initColumnVisibility() {
    const columnsMenu = document.getElementById('columnsMenu');
    if (!columnsMenu) return;

    columnsMenu.innerHTML = '';

    tableConfig.columns.forEach(column => {
        const item = document.createElement('div');
        item.className = 'columns-menu-item';
        item.innerHTML = `
            <input type="checkbox" id="col-${column.id}" ${column.visible ? 'checked' : ''}>
            <label for="col-${column.id}">${column.label}</label>
        `;

        item.querySelector('input').addEventListener('change', (e) => {
            column.visible = e.target.checked;
            saveTablePreferences();
            updateTable();
        });

        columnsMenu.appendChild(item);
    });

    // Add actions
    const actions = document.createElement('div');
    actions.className = 'columns-menu-actions';
    actions.innerHTML = `
        <button class="control-btn" id="selectAllColumns" style="padding: 4px 8px; font-size: 12px;">Select All</button>
        <button class="control-btn" id="deselectAllColumns" style="padding: 4px 8px; font-size: 12px;">Deselect All</button>
        <button class="control-btn" id="resetColumns" style="padding: 4px 8px; font-size: 12px;">Reset</button>
    `;
    columnsMenu.appendChild(actions);

    // Add event listeners for actions
    document.getElementById('selectAllColumns')?.addEventListener('click', () => {
        tableConfig.columns.forEach(col => col.visible = true);
        updateColumnCheckboxes();
        saveTablePreferences();
        updateTable();
    });

    document.getElementById('deselectAllColumns')?.addEventListener('click', () => {
        tableConfig.columns.forEach(col => col.visible = false);
        updateColumnCheckboxes();
        saveTablePreferences();
        updateTable();
    });

    document.getElementById('resetColumns')?.addEventListener('click', () => {
        resetTablePreferences();
        updateColumnCheckboxes();
        updateTable();
    });
}

function updateColumnCheckboxes() {
    tableConfig.columns.forEach(column => {
        const checkbox = document.getElementById(`col-${column.id}`);
        if (checkbox) {
            checkbox.checked = column.visible;
        }
    });
}

// Initialize management table with pagination
function initManagementTable() {
    updateTable();
    initColumnVisibility();
    initPagination();
}

function updateTable() {
    const tableBody = document.getElementById('tableBody');
    const thead = document.querySelector('#managementTable thead tr');

    if (!tableBody || !thead) return;

    // Update table header based on column visibility
    thead.innerHTML = '';
    tableConfig.columns.forEach(column => {
        if (!column.visible) return;

        const th = document.createElement('th');
        th.textContent = column.label;
        th.dataset.column = column.id;

        if (column.sortable) {
            th.className = 'sortable';
            if (tableConfig.sortColumn === column.id) {
                th.classList.add(tableConfig.sortDirection);
            }
            th.addEventListener('click', () => sortTable(column.id));
        }

        thead.appendChild(th);
    });

    // Calculate pagination
    const startIndex = (tableConfig.currentPage - 1) * tableConfig.pageSize;
    const endIndex = startIndex + tableConfig.pageSize;
    const pageData = filteredCycles.slice(startIndex, endIndex);

    // Update table body
    tableBody.innerHTML = '';

    pageData.forEach(cycle => {
        const row = document.createElement('tr');
        if (cycle.manualIntervention.required) {
            row.classList.add('requires-manual');
        }

        // Determine status badge class
        let statusClass = 'status-info';
        if (cycle.status.includes('Completed')) statusClass = 'status-success';
        if (cycle.status.includes('Failed')) statusClass = 'status-error';
        if (cycle.status === 'Paused') statusClass = 'status-warning';
        if (cycle.manualIntervention.status === 'manual-pending') statusClass = 'status-manual';
        if (cycle.manualIntervention.status === 'manual-in-progress') statusClass = 'status-manual';

        // Determine SLA timer class
        let slaClass = 'status-success';
        if (cycle.slaFlag === 'warning') slaClass = 'status-warning';
        if (cycle.slaFlag === 'error') slaClass = 'status-error';

        // Manual intervention badge
        let manualBadge = '<span class="status-badge status-success">No</span>';
        let manualStep = '-';

        if (cycle.manualIntervention.required) {
            manualBadge = `<span class="status-badge status-manual">Yes</span>`;
            manualStep = cycle.manualIntervention.step;
        }

        // Build row based on visible columns
        tableConfig.columns.forEach(column => {
            if (!column.visible) return;

            const td = document.createElement('td');

            switch (column.id) {
                case 'cycleId':
                    td.innerHTML = `<strong>${cycle.cycleId}</strong>`;
                    break;
                case 'customer':
                    td.textContent = cycle.customer;
                    break;
                case 'region':
                    td.textContent = cycle.region;
                    break;
                case 'status':
                    td.innerHTML = `<span class="status-badge ${statusClass}">${cycle.status}</span>`;
                    break;
                case 'currentStep':
                    td.textContent = cycle.currentStep;
                    break;
                case 'processed':
                    td.textContent = cycle.processed;
                    break;
                case 'errors':
                    td.innerHTML = `<span class="${cycle.errors > 0 ? 'status-error' : 'status-success'}" style="font-weight:bold;">${cycle.errors}</span>`;
                    break;
                case 'lastAction':
                    td.innerHTML = `<small>${cycle.lastAction}</small>`;
                    break;
                case 'uploadRef':
                    td.textContent = cycle.uploadRef || '-';
                    break;
                case 'slaTimer':
                    td.innerHTML = `<span class="status-badge ${slaClass}">${cycle.slaTimer}</span>`;
                    break;
                case 'manualIntervention':
                    td.innerHTML = manualBadge;
                    break;
                case 'manualStep':
                    td.textContent = manualStep;
                    break;
                case 'actions':
                    td.innerHTML = `
                        <div class="action-buttons">
                            <button class="action-btn btn-view" title="View Details" onclick="viewCycleDetails('${cycle.cycleId}', '${cycle.customer}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn btn-retry" title="Retry Step" onclick="retryCycleStep('${cycle.cycleId}', '${cycle.customer}')">
                                <i class="fas fa-redo"></i>
                            </button>
                            <button class="action-btn btn-pause" title="Pause Cycle" onclick="pauseCycle('${cycle.cycleId}', '${cycle.customer}')">
                                <i class="fas fa-pause"></i>
                            </button>
                            ${cycle.manualIntervention.required ?
                            `<button class="action-btn btn-manual" title="Manual Workflow" onclick="openManualWorkflow('${cycle.cycleId}', '${cycle.customer}')">
                                    <i class="fas fa-hands-helping"></i>
                                </button>` : ''
                        }
                            <button class="action-btn btn-ai" title="AI-Fix" onclick="openAIFix('${cycle.cycleId}', '${cycle.customer}')">
                                <i class="fas fa-robot"></i>
                            </button>
                            <button class="action-btn btn-override" title="Manual Override" onclick="openExceptionEditor('${cycle.cycleId}', '${cycle.customer}')">
                                <i class="fas fa-user-edit"></i>
                            </button>
                        </div>
                    `;
                    break;
            }

            row.appendChild(td);
        });

        tableBody.appendChild(row);
    });

    updatePagination();
}

// Initialize pagination
function initPagination() {
    updatePagination();
}

function updatePagination() {
    const paginationControls = document.getElementById('paginationControls');
    if (!paginationControls) return;

    const totalPages = Math.ceil(filteredCycles.length / tableConfig.pageSize);

    if (filteredCycles.length <= tableConfig.pageSize) {
        paginationControls.innerHTML = `
            <div class="pagination-info">
                Showing ${filteredCycles.length} of ${filteredCycles.length} records
            </div>
        `;
        return;
    }

    const startRecord = (tableConfig.currentPage - 1) * tableConfig.pageSize + 1;
    const endRecord = Math.min(tableConfig.currentPage * tableConfig.pageSize, filteredCycles.length);

    let pageButtons = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, tableConfig.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pageButtons += `
        <button class="page-btn ${tableConfig.currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${tableConfig.currentPage - 1})" 
                ${tableConfig.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // First page
    if (startPage > 1) {
        pageButtons += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            pageButtons += `<span style="padding: 0 8px;">...</span>`;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        pageButtons += `
            <button class="page-btn ${i === tableConfig.currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageButtons += `<span style="padding: 0 8px;">...</span>`;
        }
        pageButtons += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    pageButtons += `
        <button class="page-btn ${tableConfig.currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${tableConfig.currentPage + 1})" 
                ${tableConfig.currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationControls.innerHTML = `
        <div class="pagination-info">
            Showing ${startRecord}-${endRecord} of ${filteredCycles.length} records
        </div>
        <div class="pagination-buttons">
            ${pageButtons}
            <div class="page-size-selector">
                <select id="pageSizeSelect" onchange="changePageSize(this.value)">
                    <option value="10" ${tableConfig.pageSize === 10 ? 'selected' : ''}>10</option>
                    <option value="25" ${tableConfig.pageSize === 25 ? 'selected' : ''}>25</option>
                    <option value="50" ${tableConfig.pageSize === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${tableConfig.pageSize === 100 ? 'selected' : ''}>100</option>
                </select>
            </div>
        </div>
    `;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredCycles.length / tableConfig.pageSize)) return;
    tableConfig.currentPage = page;
    updateTable();
}

function changePageSize(size) {
    tableConfig.pageSize = parseInt(size);
    tableConfig.currentPage = 1;
    saveTablePreferences();
    updateTable();
}

function sortTable(columnId) {
    if (tableConfig.sortColumn === columnId) {
        tableConfig.sortDirection = tableConfig.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        tableConfig.sortColumn = columnId;
        tableConfig.sortDirection = 'asc';
    }

    filteredCycles.sort((a, b) => {
        let aValue = a[columnId];
        let bValue = b[columnId];

        // Handle special cases
        if (columnId === 'slaTimer') {
            aValue = convertTimeToSeconds(aValue);
            bValue = convertTimeToSeconds(bValue);
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return tableConfig.sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return tableConfig.sortDirection === 'asc'
            ? (aValue < bValue ? -1 : 1)
            : (bValue < aValue ? -1 : 1);
    });

    saveTablePreferences();
    updateTable();
}

function convertTimeToSeconds(timeString) {
    const parts = timeString.split(':');
    if (parts.length === 3) {
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
}

// Save table preferences to localStorage
function saveTablePreferences() {
    const preferences = {
        columns: tableConfig.columns.map(col => ({ id: col.id, visible: col.visible })),
        pageSize: tableConfig.pageSize,
        sortColumn: tableConfig.sortColumn,
        sortDirection: tableConfig.sortDirection
    };
    localStorage.setItem('dashboardTablePrefs', JSON.stringify(preferences));
}

// Load table preferences from localStorage
function loadTablePreferences() {
    const saved = localStorage.getItem('dashboardTablePrefs');
    if (saved) {
        try {
            const preferences = JSON.parse(saved);

            // Update column visibility
            preferences.columns.forEach(savedCol => {
                const column = tableConfig.columns.find(col => col.id === savedCol.id);
                if (column) {
                    column.visible = savedCol.visible;
                }
            });

            tableConfig.pageSize = preferences.pageSize || tableConfig.pageSize;
            tableConfig.sortColumn = preferences.sortColumn || tableConfig.sortColumn;
            tableConfig.sortDirection = preferences.sortDirection || tableConfig.sortDirection;
        } catch (e) {
            console.error('Error loading table preferences:', e);
        }
    }
}

function resetTablePreferences() {
    localStorage.removeItem('dashboardTablePrefs');
    tableConfig.columns.forEach(col => col.visible = true);
    tableConfig.pageSize = 10;
    tableConfig.sortColumn = 'lastAction';
    tableConfig.sortDirection = 'desc';
}

// Update step detail panel with manual workflow info
function updateStepPanel(stepId) {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const panelStepName = document.getElementById('panelStepName');
    const panelStepStatus = document.getElementById('panelStepStatus');

    if (panelStepName) panelStepName.textContent = step.name;
    if (panelStepStatus) {
        panelStepStatus.textContent = step.status;
        panelStepStatus.className = `status-badge status-${step.status === 'in-progress' ? 'info' : step.status}`;
    }

    // Update step info
    if (stepId === currentStep) {
        const cycle = cycles.find(c => c.currentStep === step.name);
        if (cycle) {
            document.getElementById('panelStartedAt').textContent = cycle.details.startedAt;
            document.getElementById('panelDuration').textContent = cycle.slaTimer;
            document.getElementById('panelRecords').textContent = `${cycle.details.recordsProcessed}/${cycle.details.recordsTotal}`;
            document.getElementById('panelSuccessRate').textContent = cycle.details.successRate;
        }
    }

    // Update manual workflow section
    const manualSection = document.getElementById('manualWorkflowSection');
    const manualActionsContainer = document.getElementById('manualWorkflowActions');

    if (step.manualCounterpart && manualSection && manualActionsContainer) {
        manualSection.style.display = 'block';
        document.getElementById('manualStepName').textContent = step.manualCounterpart.name;
        document.getElementById('manualStepDescription').textContent = step.manualCounterpart.description;
        document.getElementById('manualRequiredActions').textContent = step.manualCounterpart.requiredControls.join(', ');

        // Add manual action buttons
        manualActionsContainer.innerHTML = '';

        const actionButtons = [
            { icon: 'fa-table', label: 'Open Tracker', action: 'tracker' },
            { icon: 'fa-tasks', label: 'Review Data', action: 'review' },
            { icon: 'fa-check-circle', label: 'Approve', action: 'approve' },
            { icon: 'fa-upload', label: 'Upload Files', action: 'upload' }
        ];

        actionButtons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'manual-action-btn';
            button.innerHTML = `<i class="fas ${btn.icon}"></i> ${btn.label}`;
            button.onclick = () => handleManualAction(btn.action, step.manualCounterpart.name);
            manualActionsContainer.appendChild(button);
        });
    } else if (manualSection) {
        manualSection.style.display = 'none';
    }

    // Update logs
    const logsContainer = document.getElementById('stepLogs');
    if (logsContainer) {
        logsContainer.innerHTML = '';

        if (stepLogs[stepId]) {
            stepLogs[stepId].forEach(log => {
                const logEl = document.createElement('div');
                logEl.className = `log-item ${log.type}`;
                logEl.innerHTML = `
                    <div class="log-time">${log.time}</div>
                    <div class="log-message">${log.message}</div>
                `;
                logsContainer.appendChild(logEl);
            });
        } else {
            logsContainer.innerHTML = '<div class="log-item">No logs available for this step.</div>';
        }
    }
}

// Select a step
function selectStep(stepId) {
    // Update current step
    steps.forEach(step => {
        if (step.id === currentStep) {
            const stepEl = document.querySelector(`.step[data-step-id="${step.id}"]`);
            if (stepEl) stepEl.classList.remove('active');
        }
        if (step.id === stepId) {
            const stepEl = document.querySelector(`.step[data-step-id="${step.id}"]`);
            if (stepEl) stepEl.classList.add('active');
        }
    });

    currentStep = stepId;
    updateStepPanel(stepId);
}

// Handle manual actions
function handleManualAction(action, manualStep) {
    switch (action) {
        case 'tracker':
            alert(`Opening ${manualStep} Tracker...`);
            break;
        case 'review':
            alert(`Reviewing data for ${manualStep}...`);
            break;
        case 'approve':
            alert(`Approving ${manualStep}...`);
            break;
        case 'upload':
            alert(`Uploading files for ${manualStep}...`);
            break;
    }
}

// Open manual workflow for specific cycle
function openManualWorkflow(cycleId, customer) {
    const cycle = cycles.find(c => c.cycleId === cycleId && c.customer === customer);
    if (cycle && cycle.manualIntervention.required) {
        const step = steps.find(s => s.name === cycle.currentStep);
        if (step && step.manualCounterpart) {
            selectStep(step.id);
            alert(`Opening manual workflow for ${customer}: ${step.manualCounterpart.name}`);
        }
    }
}

// Advanced search functionality
function initAdvancedSearch() {
    const modal = document.getElementById('advancedSearchModal');
    const conditionsContainer = document.getElementById('searchConditions');

    if (!modal || !conditionsContainer) return;

    // Initial condition
    addSearchCondition();

    document.getElementById('addCondition')?.addEventListener('click', addSearchCondition);
    document.getElementById('clearAllConditions')?.addEventListener('click', clearAllConditions);
    document.getElementById('applyAdvancedSearch')?.addEventListener('click', applyAdvancedSearch);

    function addSearchCondition() {
        const condition = document.createElement('div');
        condition.className = 'search-condition';
        condition.innerHTML = `
            <select class="condition-column">
                <option value="customer">Customer</option>
                <option value="region">Region</option>
                <option value="status">Status</option>
                <option value="currentStep">Current Step</option>
                <option value="errors">Errors</option>
                <option value="slaTimer">SLA Timer</option>
            </select>
            <select class="condition-operator">
                <option value="contains">contains</option>
                <option value="equals">equals</option>
                <option value="greater">greater than</option>
                <option value="less">less than</option>
            </select>
            <input type="text" class="condition-value" placeholder="Value...">
            <button class="remove-condition" type="button">&times;</button>
        `;

        condition.querySelector('.remove-condition').addEventListener('click', () => {
            condition.remove();
        });

        conditionsContainer.appendChild(condition);
    }

    function clearAllConditions() {
        conditionsContainer.innerHTML = '';
        addSearchCondition();
    }

    function applyAdvancedSearch() {
        const conditions = [];
        const conditionElements = conditionsContainer.querySelectorAll('.search-condition');

        conditionElements.forEach(element => {
            const column = element.querySelector('.condition-column').value;
            const operator = element.querySelector('.condition-operator').value;
            const value = element.querySelector('.condition-value').value;

            if (value.trim()) {
                conditions.push({ column, operator, value });
            }
        });

        const logic = document.getElementById('filterLogic').value;
        advancedFilters = { conditions, logic };

        applyFilters();
        modal.classList.remove('active');
    }
}

function applyFilters() {
    filteredCycles = [...cycles];

    // Apply basic filters
    const regionFilter = document.getElementById('regionFilter')?.value;
    const customerFilter = document.getElementById('customerFilter')?.value;
    const accountFilter = document.getElementById('accountFilter')?.value;
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();

    if (regionFilter) {
        filteredCycles = filteredCycles.filter(cycle => cycle.region === regionFilter);
    }

    if (customerFilter) {
        filteredCycles = filteredCycles.filter(cycle => cycle.customer === customerFilter);
    }

    if (searchTerm) {
        filteredCycles = filteredCycles.filter(cycle =>
            cycle.cycleId.toLowerCase().includes(searchTerm) ||
            cycle.customer.toLowerCase().includes(searchTerm) ||
            (cycle.uploadRef && cycle.uploadRef.toLowerCase().includes(searchTerm))
        );
    }

    // Apply advanced filters
    if (advancedFilters.conditions && advancedFilters.conditions.length > 0) {
        filteredCycles = filteredCycles.filter(cycle => {
            const results = advancedFilters.conditions.map(condition => {
                const value = cycle[condition.column];
                const filterValue = condition.value.toLowerCase();

                switch (condition.operator) {
                    case 'contains':
                        return value.toString().toLowerCase().includes(filterValue);
                    case 'equals':
                        return value.toString().toLowerCase() === filterValue;
                    case 'greater':
                        return parseFloat(value) > parseFloat(filterValue);
                    case 'less':
                        return parseFloat(value) < parseFloat(filterValue);
                    default:
                        return true;
                }
            });

            return advancedFilters.logic === 'AND'
                ? results.every(r => r)
                : results.some(r => r);
        });
    }

    // Reset to first page
    tableConfig.currentPage = 1;
    updateTable();
}

// Open AI Fix modal
function openAIFix(cycleId, customer) {
    const modal = document.getElementById('aiFixModal');
    if (modal) modal.classList.add('active');
}

// Open exception editor
function openExceptionEditor(cycleId, customer) {
    const modal = document.getElementById('exceptionModal');
    const modalBody = modal.querySelector('.modal-body');

    modalBody.innerHTML = `
        <h3>Manual Override for ${customer} - ${cycleId}</h3>
        <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px;">
            <h4>⚠️ Records Requiring Attention (3)</h4>
            <ul style="margin: 10px 0 20px 20px;">
                <li>Ticket TKT-001: Rate mismatch (Consulting - EMEA)</li>
                <li>Ticket TKT-003: Missing travel charge</li>
                <li>Ticket TKT-007: Invalid currency conversion</li>
            </ul>
        </div>
        
        <div style="margin: 20px 0;">
            <h4>Edit Record</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Rate Type</label>
                    <select style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <option>Hourly</option>
                        <option>Fixed</option>
                        <option>Daily</option>
                        <option>Monthly</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Rate Value</label>
                    <input type="number" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" value="120">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Currency</label>
                    <select style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>JPY</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Travel Charge</label>
                    <input type="number" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;" value="50">
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Override Reason</label>
                <textarea style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; min-height: 100px;" placeholder="Describe why this override is necessary..."></textarea>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// View cycle details
function viewCycleDetails(cycleId, customer) {
    alert(`Viewing details for ${customer} - ${cycleId}\n\nThis would open a detailed view with timeline, files, and audit log.`);
}

// Retry cycle step
function retryCycleStep(cycleId, customer) {
    if (confirm(`Retry current step for ${customer}?`)) {
        alert(`Retrying step for ${customer}...`);
        // In a real implementation, this would call an API to retry the step
    }
}

// Pause cycle
function pauseCycle(cycleId, customer) {
    if (confirm(`Pause processing for ${customer}?`)) {
        alert(`Paused ${customer} cycle.`);
        // In a real implementation, this would call an API to pause the cycle
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load saved preferences
    loadTablePreferences();

    // Initialize components
    initStepTracker();
    initManagementTable();
    updateStepPanel(currentStep);
    initAdvancedSearch();
    initQuickSetupModal(); // Initialize Quick Setup Modal with all 4 tabs

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Close columns menu when clicking outside
    document.addEventListener('click', (e) => {
        const columnsMenu = document.getElementById('columnsMenu');
        const toggleBtn = document.getElementById('toggleColumns');

        if (columnsMenu && toggleBtn && !columnsMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
            columnsMenu.classList.remove('active');
        }
    });

    // Toggle columns menu
    const toggleColumnsBtn = document.getElementById('toggleColumns');
    if (toggleColumnsBtn) {
        toggleColumnsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const columnsMenu = document.getElementById('columnsMenu');
            if (columnsMenu) columnsMenu.classList.toggle('active');
        });
    }

    // Advanced search
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    if (advancedSearchBtn) {
        advancedSearchBtn.addEventListener('click', () => {
            const modal = document.getElementById('advancedSearchModal');
            if (modal) modal.classList.add('active');
        });
    }

    // Basic filter functionality
    const regionFilter = document.getElementById('regionFilter');
    const customerFilter = document.getElementById('customerFilter');
    const accountFilter = document.getElementById('accountFilter');
    const searchInput = document.getElementById('searchInput');

    if (regionFilter) regionFilter.addEventListener('change', applyFilters);
    if (customerFilter) customerFilter.addEventListener('change', applyFilters);
    if (accountFilter) accountFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);

    // Modal close buttons
    const closeAIFixModal = document.getElementById('closeAIFixModal');
    if (closeAIFixModal) {
        closeAIFixModal.addEventListener('click', () => {
            const modal = document.getElementById('aiFixModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const closeExceptionModal = document.getElementById('closeExceptionModal');
    if (closeExceptionModal) {
        closeExceptionModal.addEventListener('click', () => {
            const modal = document.getElementById('exceptionModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const closeAdvancedSearchModal = document.getElementById('closeAdvancedSearchModal');
    if (closeAdvancedSearchModal) {
        closeAdvancedSearchModal.addEventListener('click', () => {
            const modal = document.getElementById('advancedSearchModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const closeQuickSetupModal = document.getElementById('closeQuickSetupModal');
    if (closeQuickSetupModal) {
        closeQuickSetupModal.addEventListener('click', () => {
            const modal = document.getElementById('quickSetupModal');
            if (modal) modal.classList.remove('active');
        });
    }

    // Other event listeners (existing functionality)
    const applyAIFix = document.getElementById('applyAIFix');
    if (applyAIFix) {
        applyAIFix.addEventListener('click', () => {
            alert('AI suggestion applied. Workflow will continue automatically.');
            const modal = document.getElementById('aiFixModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const rejectAIFix = document.getElementById('rejectAIFix');
    if (rejectAIFix) {
        rejectAIFix.addEventListener('click', () => {
            alert('AI suggestion rejected. Please use manual override if needed.');
            const modal = document.getElementById('aiFixModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const playPipeline = document.getElementById('playPipeline');
    if (playPipeline) {
        playPipeline.addEventListener('click', () => {
            alert('Pipeline resumed. All active cycles will continue processing.');
        });
    }

    const pausePipeline = document.getElementById('pausePipeline');
    if (pausePipeline) {
        pausePipeline.addEventListener('click', () => {
            alert('Pipeline paused. No new processing will start.');
        });
    }

    const runSelectedStage = document.getElementById('runSelectedStage');
    if (runSelectedStage) {
        runSelectedStage.addEventListener('click', () => {
            const step = steps.find(s => s.id === currentStep);
            alert(`Running ${step.name} stage for all eligible cycles.`);
        });
    }

    const cancelCycle = document.getElementById('cancelCycle');
    if (cancelCycle) {
        cancelCycle.addEventListener('click', () => {
            if (confirm('Cancel current billing cycle? This will stop all processing.')) {
                alert('Billing cycle cancelled. All workflows stopped.');
            }
        });
    }

    const createIncident = document.getElementById('createIncident');
    if (createIncident) {
        createIncident.addEventListener('click', () => {
            alert('Incident ticket created in ops queue. Team has been notified.');
        });
    }

    const exportData = document.getElementById('exportData');
    if (exportData) {
        exportData.addEventListener('click', () => {
            // Export only visible columns
            const visibleColumns = tableConfig.columns.filter(col => col.visible);
            alert(`Exporting ${visibleColumns.length} visible columns to CSV...`);
        });
    }

    const refreshTable = document.getElementById('refreshTable');
    if (refreshTable) {
        refreshTable.addEventListener('click', () => {
            initManagementTable();
            alert('Table data refreshed.');
        });
    }

    const groupByRegion = document.getElementById('groupByRegion');
    if (groupByRegion) {
        groupByRegion.addEventListener('click', () => {
            alert('Grouping table by region...');
            // Implementation would group cycles by region
        });
    }

    // Simulate real-time updates
    simulateUpdates();
});

// Simulate real-time updates
function simulateUpdates() {
    setInterval(() => {
        // Randomly update a step status every 10 seconds
        const randomStep = Math.floor(Math.random() * steps.length);
        const statuses = ['pending', 'in-progress', 'completed', 'failed'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

        steps[randomStep].status = newStatus;

        // Update the UI if this step is visible
        const stepEl = document.querySelector(`.step[data-step-id="${steps[randomStep].id}"]`);
        if (stepEl) {
            stepEl.className = `step ${newStatus} ${steps[randomStep].manualCounterpart ? 'requires-manual' : ''} ${steps[randomStep].id === currentStep ? 'active' : ''}`;
            stepEl.querySelector('.step-status').className = `step-status ${newStatus}`;
            stepEl.querySelector('.step-status').textContent = newStatus;

            // Update icon color
            const icon = stepEl.querySelector('.step-icon');
            icon.style.borderColor = newStatus === 'completed' ? 'var(--success-color)' :
                newStatus === 'failed' ? 'var(--error-color)' :
                    newStatus === 'in-progress' ? 'var(--primary-color)' :
                        steps[randomStep].manualCounterpart ? 'var(--manual-color)' : 'var(--border-color)';
            icon.style.backgroundColor = newStatus === 'completed' ? 'var(--success-color)' :
                newStatus === 'failed' ? 'var(--error-color)' : 'white';
            icon.style.color = (newStatus === 'completed' || newStatus === 'failed') ? 'white' :
                newStatus === 'in-progress' ? 'var(--primary-color)' : 'var(--text-secondary)';
        }
    }, 10000);
}