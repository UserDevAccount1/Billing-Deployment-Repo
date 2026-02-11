// Dedicated Tab JavaScript
const dedicatedData = [
    {

        id: 1,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "Hungary",
        state: "Pest",
        city: "Godollo",
        siteAddress: "Godollo - Gepyar",
        zipCode: "2100",
        poNumber: "9200136102",
        technicianName: "Mark Magyar",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 3591.49,
        dailyRate: 0,
        actualCost: 3324.64,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 3324.64,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "",
        ticketReferences: [
            { name: "TKT-00123.pdf", type: "pdf", size: "1.4 MB", ticketNumber: "TKT-00123", date: "2024-08-01" },
            { name: "TKT-00124.docx", type: "word", size: "890 KB", ticketNumber: "TKT-00124", date: "2024-08-02" },
            { name: "TKT-00125.xlsx", type: "excel", size: "650 KB", ticketNumber: "TKT-00125", date: "2024-08-03" }
        ],
        filesForApproval: [
            { name: "Timesheet_Aug.pdf", type: "pdf", size: "2.4 MB", status: "Pending", submittedDate: "2024-08-31" },
            { name: "Approval_Email.docx", type: "word", size: "1.2 MB", status: "Approved", approvedDate: "2024-09-01" }
        ]
    },
    {
        id: 2,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "South Africa",
        state: "Gauteng",
        city: "Kempton Park",
        siteAddress: "Kempton Park Site",
        zipCode: "1619",
        poNumber: "9200135148",
        technicianName: "Cleo Muchemwas",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 3162.50,
        dailyRate: 0,
        actualCost: 57678.28,
        currency: "ZAR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 57678.28,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "",
        ticketReferences: [
            { name: "TKT-00201.pdf", type: "pdf", size: "1.8 MB", ticketNumber: "TKT-00201", date: "2024-08-05" },
            { name: "TKT-00202.docx", type: "word", size: "1.1 MB", ticketNumber: "TKT-00202", date: "2024-08-06" }
        ],
        filesForApproval: [
            { name: "Invoice_Aug25.pdf", type: "pdf", size: "3.1 MB", status: "Approved", approvedDate: "2024-09-02" },
            { name: "Service_Report.docx", type: "word", size: "890 KB", status: "Pending", submittedDate: "2024-08-30" }
        ]
    },
    {
        id: 3,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "Nigeria",
        state: "Rivers",
        city: "Port Harcourt",
        siteAddress: "Port Harcourt Office",
        zipCode: "500001",
        poNumber: "9200136102",
        technicianName: "Wilson Adams",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 1208.92,
        dailyRate: 0,
        actualCost: 1119.10,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 8,
        taxCost: 89.53,
        totalCost: 1208.63,
        slaPercent: 95,
        slaMet: "Yes",
        slaReason: "UK to Nigeria sales tax",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "Adding 8% sales tax from UK to Nigeria",
        ticketReferences: [
            { name: "TKT-00301.pdf", type: "pdf", size: "2.1 MB", ticketNumber: "TKT-00301", date: "2024-08-10" }
        ],
        filesForApproval: [
            { name: "Tax_Calculation.xlsx", type: "excel", size: "450 KB", status: "Approved", approvedDate: "2024-09-03" },
            { name: "Sales_Tax_Cert.pdf", type: "pdf", size: "1.8 MB", status: "Approved", approvedDate: "2024-09-03" },
            { name: "VAT_Declaration.docx", type: "word", size: "780 KB", status: "Pending", submittedDate: "2024-08-31" }
        ]
    },
    {
        id: 4,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "United Kingdom",
        state: "Cambridgeshire",
        city: "Peterborough",
        siteAddress: "Peterborough Site",
        zipCode: "PE1",
        poNumber: "9200136102",
        technicianName: "Divayansh Prabhker",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 5572.40,
        dailyRate: 0,
        actualCost: 5158.37,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 5158.37,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "",
        results: [
            { name: "Monthly_Report.pdf", type: "pdf", size: "2.7 MB" },
            { name: "Client_Feedback.docx", type: "word", size: "560 KB" }
        ]
    },
    {
        id: 5,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "United Kingdom",
        state: "Leicestershire",
        city: "Desford",
        siteAddress: "Desford Office",
        zipCode: "LE9",
        poNumber: "9200136102",
        technicianName: "Dhaval Bharatbai",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 5572.40,
        dailyRate: 0,
        actualCost: 5158.37,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 5158.37,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "",
        results: [
            { name: "Site_Visit_Report.pdf", type: "pdf", size: "4.2 MB" },
            { name: "Equipment_List.xlsx", type: "excel", size: "320 KB" }
        ]
    },
    {
        id: 6,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "United Kingdom",
        state: "Leicestershire",
        city: "Desford",
        siteAddress: "Desford Office",
        zipCode: "LE9",
        poNumber: "9200136102",
        technicianName: "Jomol Jolly",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 5572.40,
        dailyRate: 0,
        actualCost: 5158.37,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 5158.37,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Sep-25",
        remarks: "Start date 2 Sept 25",
        results: [
            { name: "September_Timesheet.pdf", type: "pdf", size: "2.1 MB" },
            { name: "Start_Date_Confirmation.docx", type: "word", size: "780 KB" }
        ]
    },
    {
        id: 7,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "UAE",
        state: "Dubai",
        city: "Dubai",
        siteAddress: "Dubai Office",
        zipCode: "0",
        poNumber: "9200135425",
        technicianName: "Ahmed Sharaby",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 9,
        workedDays: 9,
        monthlyRate: 1263.21,
        dailyRate: 0,
        actualCost: 4639.14,
        currency: "AED",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 4639.14,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "Start date 19 Aug 25",
        results: [
            { name: "Visa_Documents.pdf", type: "pdf", size: "5.3 MB" },
            { name: "UAE_Contract.docx", type: "word", size: "2.1 MB" },
            { name: "Approval_Form.pdf", type: "pdf", size: "1.2 MB" }
        ]
    },
    {
        id: 8,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "Netherlands",
        state: "North Brabant",
        city: "Den Bosch",
        siteAddress: "Hertogenbosch Office",
        zipCode: "5211",
        poNumber: "9200136102",
        technicianName: "Shamail Ahmad",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 7819.56,
        dailyRate: 0,
        actualCost: 7222.85,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 7222.85,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "",
        results: [
            { name: "Dutch_Report.pdf", type: "pdf", size: "1.9 MB" },
            { name: "Technical_Review.docx", type: "word", size: "1.1 MB" }
        ]
    },
    {
        id: 9,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "Germany",
        state: "Schleswig-Holstein",
        city: "Kiel",
        siteAddress: "Kiel Site",
        zipCode: "24103",
        poNumber: "9200136102",
        technicianName: "Syed Hassan",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 7898.52,
        dailyRate: 0,
        actualCost: 7295.78,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 7295.78,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "",
        results: [
            { name: "German_Compliance.pdf", type: "pdf", size: "3.4 MB" },
            { name: "Site_Audit.xlsx", type: "excel", size: "890 KB" }
        ]
    },
    {
        id: 10,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "Belgium",
        state: "Flemish Brabant",
        city: "Grimbergen",
        siteAddress: "Grimbergen Office",
        zipCode: "1850",
        poNumber: "9200136102",
        technicianName: "Fatih Akay",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 8617.45,
        dailyRate: 0,
        actualCost: 7959.85,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 7959.85,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "",
        results: [
            { name: "EU_Compliance.pdf", type: "pdf", size: "2.8 MB" },
            { name: "Belgian_Taxes.xlsx", type: "excel", size: "650 KB" }
        ]
    },
    {
        id: 11,
        siteCategory: "Dedicated",
        customerName: "HCL",
        partnerName: "HCL Partner",
        country: "Switzerland",
        state: "Ticino",
        city: "Riazzino",
        siteAddress: "Riazzino Site",
        zipCode: "6595",
        poNumber: "9200136102",
        technicianName: "Silvio Melonio",
        band: "Band 2",
        variant: "With Backfill",
        workingDays: 21,
        workedDays: 21,
        monthlyRate: 12499.98,
        dailyRate: 0,
        actualCost: 11546.11,
        currency: "EUR",
        otHours: 0,
        otPerHourRate: 0,
        otHoursCost: 0,
        weekendOtHours: 0,
        weekendRate: 0,
        weekendCost: 0,
        travelExtraCost: 0,
        taxPercent: 0,
        taxCost: 0,
        totalCost: 11546.11,
        slaPercent: 100,
        slaMet: "Yes",
        slaReason: "",
        attendanceApproved: "Yes",
        serviceMonth: "Aug-25",
        remarks: "",
        results: [
            { name: "Swiss_Report.pdf", type: "pdf", size: "4.5 MB" },
            { name: "High_Value_Service.docx", type: "word", size: "2.3 MB" }
        ]
    }
];

// Table configuration for dedicated tab
let dedicatedConfig = {
    pageSize: 10,
    currentPage: 1,
    sortField: 'technicianName',
    sortOrder: 'asc',
    filteredData: [...dedicatedData]
};

// Initialize dedicated tab
function initDedicatedTab() {
    console.log('Initializing dedicated tab...');
    initFilters();
    initViewToggle();
    initTable();
    initFormView();
    initPagination();
    initFormPagination();

    // Initial render
    applyFilters();
}

// Initialize filters
function initFilters() {
    console.log('Initializing filters...');

    const customerSelect = document.getElementById('customerSelect');
    const partnerSelect = document.getElementById('partnerSelect');
    const countrySelect = document.getElementById('countrySelect');
    const bandSelect = document.getElementById('bandSelect');
    const searchInput = document.getElementById('searchInput');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const sortField = document.getElementById('sortField');
    const sortOrderRadios = document.querySelectorAll('input[name="sortOrder"]');

    // Filter event listeners
    [customerSelect, partnerSelect, countrySelect, bandSelect].forEach(select => {
        if (select) {
            select.addEventListener('change', applyFilters);
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (customerSelect) customerSelect.value = '';
            if (partnerSelect) partnerSelect.value = '';
            if (countrySelect) countrySelect.value = '';
            if (bandSelect) bandSelect.value = '';
            if (searchInput) searchInput.value = '';
            applyFilters();
        });
    }

    // Sort event listeners
    if (sortField) {
        sortField.addEventListener('change', () => {
            dedicatedConfig.sortField = sortField.value;
            applyFilters();
        });
    }

    if (sortOrderRadios.length > 0) {
        sortOrderRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                dedicatedConfig.sortOrder = radio.value;
                applyFilters();
            });
        });
    }
}

// Apply filters
function applyFilters() {
    console.log('Applying filters...');

    const customerSelect = document.getElementById('customerSelect');
    const partnerSelect = document.getElementById('partnerSelect');
    const countrySelect = document.getElementById('countrySelect');
    const bandSelect = document.getElementById('bandSelect');
    const searchInput = document.getElementById('searchInput');

    const filters = {
        customer: customerSelect ? customerSelect.value : '',
        partner: partnerSelect ? partnerSelect.value : '',
        country: countrySelect ? countrySelect.value : '',
        band: bandSelect ? bandSelect.value : '',
        search: searchInput ? searchInput.value.toLowerCase() : ''
    };

    dedicatedConfig.filteredData = dedicatedData.filter(item => {
        // Apply dropdown filters
        if (filters.customer && item.customerName !== filters.customer) return false;
        if (filters.partner && item.partnerName !== filters.partner) return false;
        if (filters.country && item.country !== filters.country) return false;
        if (filters.band && item.band !== filters.band) return false;

        // Apply search filter
        if (filters.search) {
            const searchableFields = [
                item.technicianName,
                item.city,
                item.state,
                item.country,
                item.siteAddress,
                item.poNumber,
                item.serviceMonth,
                item.remarks
            ].map(field => field ? field.toString().toLowerCase() : '');

            return searchableFields.some(field => field.includes(filters.search));
        }

        return true;
    });

    // Apply sorting
    sortData();

    // Reset to first page
    dedicatedConfig.currentPage = 1;

    // Update views based on active view
    if (document.getElementById('tableView') && document.getElementById('tableView').classList.contains('active')) {
        console.log('Updating table view...');
        updateTable();
        updatePagination();
    } else if (document.getElementById('formView') && document.getElementById('formView').classList.contains('active')) {
        console.log('Updating form view...');
        updateFormView();
        updateFormPagination();
    }
}

// Sort data
function sortData() {
    dedicatedConfig.filteredData.sort((a, b) => {
        const field = dedicatedConfig.sortField;
        const order = dedicatedConfig.sortOrder === 'asc' ? 1 : -1;

        // Get the field value
        let aValue = a[field];
        let bValue = b[field];

        // Handle nested fields
        if (field === 'totalCost') {
            aValue = a.totalCost;
            bValue = b.totalCost;
        }

        // Handle numeric fields
        if (['monthlyRate', 'actualCost', 'totalCost', 'workingDays', 'workedDays'].includes(field)) {
            return order * (parseFloat(aValue) - parseFloat(bValue));
        }

        // Handle string fields
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            if (aValue.toLowerCase() < bValue.toLowerCase()) return -1 * order;
            if (aValue.toLowerCase() > bValue.toLowerCase()) return 1 * order;
        }
        return 0;
    });
}

// Initialize view toggle
function initViewToggle() {
    console.log('Initializing view toggle...');

    const viewBtns = document.querySelectorAll('.view-btn');
    const tableView = document.getElementById('tableView');
    const formView = document.getElementById('formView');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show/hide views
            const view = btn.dataset.view;
            if (tableView) tableView.classList.remove('active');
            if (formView) formView.classList.remove('active');

            if (view === 'table' && tableView) {
                tableView.classList.add('active');
                updateTable();
                updatePagination();
            } else if (formView) {
                formView.classList.add('active');
                updateFormView();
                updateFormPagination();
            }
        });
    });
}

// Initialize table
function initTable() {
    console.log('Initializing table...');
    updateTable();
}

// Update table with data
function updateTable() {
    console.log('Updating table...', dedicatedConfig.filteredData.length, 'items');

    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }

    const startIndex = (dedicatedConfig.currentPage - 1) * dedicatedConfig.pageSize;
    const endIndex = startIndex + dedicatedConfig.pageSize;
    const pageData = dedicatedConfig.filteredData.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    pageData.forEach(item => {
        const row = document.createElement('tr');

        // Format currency values
        const formatCurrency = (value) => {
            if (value === undefined || value === null) return '-';
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        };

        // Get file icon based on type
        const getFileIcon = (type) => {
            switch (type) {
                case 'pdf': return 'fa-file-pdf';
                case 'word': return 'fa-file-word';
                case 'excel': return 'fa-file-excel';
                default: return 'fa-file';
            }
        };

        // Generate file attachments HTML
        const filesHTML = item.results && item.results.length > 0
            ? item.results.map(file => `
                <div class="file-attachment" title="${file.name} (${file.size})">
                    <i class="fas ${getFileIcon(file.type)} file-icon"></i>
                    <span class="file-name">${file.name}</span>
                    <div class="file-actions">
                        <button class="file-btn" onclick="downloadFile('${file.name}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="file-btn" onclick="previewFile('${file.name}')" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            `).join('')
            : '<span style="color: #6c757d; font-size: 12px;">No files</span>';

        row.innerHTML = `
            <td>
                <button class="btn btn-sm btn-info" onclick="viewDetails(${item.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="editRecord(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td style="min-width: 200px;">
                <div class="file-attachments" style="display: flex; flex-direction: column; gap: 5px;">
                    ${filesHTML}
                </div>
            </td>
            <td>${item.siteCategory || '-'}</td>
            <td>${item.customerName || '-'}</td>
            <td>${item.partnerName || '-'}</td>
            <td>${item.country || '-'}</td>
            <td>${item.state || '-'}</td>
            <td>${item.city || '-'}</td>
            <td>${item.siteAddress || '-'}</td>
            <td>${item.zipCode || '-'}</td>
            <td>${item.poNumber || '-'}</td>
            <td><strong>${item.technicianName || '-'}</strong></td>
            <td><span class="status-badge status-info">${item.band || '-'}</span></td>
            <td>${item.variant || '-'}</td>
            <td>${item.workingDays || '-'}</td>
            <td>${item.workedDays || '-'}</td>
            <td>${formatCurrency(item.monthlyRate)}</td>
            <td>${item.dailyRate > 0 ? formatCurrency(item.dailyRate) : '-'}</td>
            <td>${formatCurrency(item.actualCost)}</td>
            <td>${item.currency || '-'}</td>
            <td>${item.otHours || '0'}</td>
            <td>${item.otPerHourRate > 0 ? formatCurrency(item.otPerHourRate) : '-'}</td>
            <td>${item.otHoursCost > 0 ? formatCurrency(item.otHoursCost) : '-'}</td>
            <td>${item.weekendOtHours || '0'}</td>
            <td>${item.weekendRate > 0 ? formatCurrency(item.weekendRate) : '-'}</td>
            <td>${item.weekendCost > 0 ? formatCurrency(item.weekendCost) : '-'}</td>
            <td>${item.travelExtraCost > 0 ? formatCurrency(item.travelExtraCost) : '-'}</td>
            <td>${item.taxPercent > 0 ? item.taxPercent + '%' : '-'}</td>
            <td>${item.taxCost > 0 ? formatCurrency(item.taxCost) : '-'}</td>
            <td><strong>${formatCurrency(item.totalCost)}</strong></td>
            <td>${item.slaPercent || '0'}%</td>
            <td><span class="status-badge ${item.slaMet === 'Yes' ? 'status-success' : 'status-error'}">${item.slaMet || 'No'}</span></td>
            <td>${item.slaReason || '-'}</td>
            <td><span class="status-badge ${item.attendanceApproved === 'Yes' ? 'status-success' : 'status-warning'}">${item.attendanceApproved || 'No'}</span></td>
            <td>${item.serviceMonth || '-'}</td>
            <td>${item.remarks || '-'}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Form View State
let currentFormIndex = 0;
let formRecords = [...dedicatedData];

// Initialize form view
function initFormView() {
    console.log('Initializing form view...');
    updateFormView();
    initFormNavigation();
    populateRecordSelect();
}

// Update the updateFormView function
function updateFormView() {
    const container = document.getElementById('formPageContainer');
    if (!container || formRecords.length === 0) {
        console.error('Form container not found or no records');
        return;
    }

    const record = formRecords[currentFormIndex];
    console.log('Displaying record:', record.id, record.technicianName);

    // Format currency
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Get file icon and class
    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': return { icon: 'fa-file-pdf', class: 'pdf', color: '#dc3545' };
            case 'word': return { icon: 'fa-file-word', class: 'word', color: '#2b579a' };
            case 'excel': return { icon: 'fa-file-excel', class: 'excel', color: '#217346' };
            default: return { icon: 'fa-file', class: 'default', color: '#6c757d' };
        }
    };

    // Generate ticket references HTML
    const ticketReferencesHTML = record.ticketReferences && record.ticketReferences.length > 0
        ? record.ticketReferences.map(file => {
            const fileType = getFileIcon(file.type);
            return `
                <div class="file-attachment-card">
                    <div class="file-icon-large" style="color: ${fileType.color}">
                        <i class="fas ${fileType.icon}"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="ticket-info">
                            <div class="ticket-number">${file.ticketNumber}</div>
                            <div class="ticket-date">${file.date}</div>
                        </div>
                        <div class="file-metadata">
                            <span class="file-size">${file.size}</span>
                        </div>
                    </div>
                    <div class="file-actions-horizontal">
                        <button class="btn btn-sm btn-info" onclick="previewFile('${file.name}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="downloadFile('${file.name}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('')
        : '<div class="no-files">No ticket references</div>';

    // Generate files for approval HTML
    const filesForApprovalHTML = record.filesForApproval && record.filesForApproval.length > 0
        ? record.filesForApproval.map(file => {
            const fileType = getFileIcon(file.type);
            const statusClass = file.status === 'Approved' ? 'status-approved' :
                file.status === 'Rejected' ? 'status-rejected' : 'status-pending';
            const dateText = file.status === 'Approved' ? `Approved: ${file.approvedDate}` :
                file.status === 'Rejected' ? `Rejected: ${file.rejectedDate || 'N/A'}` :
                    `Submitted: ${file.submittedDate}`;

            return `
                <div class="file-attachment-card">
                    <div class="file-icon-large" style="color: ${fileType.color}">
                        <i class="fas ${fileType.icon}"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-status-badge ${statusClass}">
                            <i class="fas ${file.status === 'Approved' ? 'fa-check-circle' :
                    file.status === 'Rejected' ? 'fa-times-circle' : 'fa-clock'}"></i>
                            ${file.status}
                        </div>
                        <div class="file-metadata">
                            <span class="file-size">${file.size}</span>
                            <span class="file-date">${dateText}</span>
                        </div>
                    </div>
                    <div class="file-actions-horizontal">
                        <button class="btn btn-sm btn-info" onclick="previewFile('${file.name}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${file.status === 'Pending' ? `
                        <button class="btn btn-sm btn-success" onclick="approveFile('${file.name}', ${record.id})">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="rejectFile('${file.name}', ${record.id})">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        ` : `
                        <button class="btn btn-sm btn-primary" onclick="downloadFile('${file.name}')">
                            <i class="fas fa-download"></i>
                        </button>
                        `}
                    </div>
                </div>
            `;
        }).join('')
        : '<div class="no-files">No files pending approval</div>';

    // Generate SLA status indicator
    const slaStatus = record.slaMet === 'Yes'
        ? '<span class="status-indicator success"><i class="fas fa-check-circle"></i> SLA Met</span>'
        : '<span class="status-indicator warning"><i class="fas fa-exclamation-triangle"></i> SLA Not Met</span>';

    // Generate attendance status
    const attendanceStatus = record.attendanceApproved === 'Yes'
        ? '<span class="status-indicator success"><i class="fas fa-check-circle"></i> Approved</span>'
        : '<span class="status-indicator warning"><i class="fas fa-clock"></i> Pending</span>';

    container.innerHTML = `
        <!-- Form Header -->
        <div class="form-header">
            <div class="form-title">
                ${record.technicianName} - ${record.siteAddress}
            </div>
            <div class="form-subtitle">
                <span><i class="fas fa-building"></i> ${record.customerName}</span>
                <span><i class="fas fa-handshake"></i> ${record.partnerName}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${record.city}, ${record.state}, ${record.country}</span>
                <span><i class="fas fa-calendar-alt"></i> ${record.serviceMonth}</span>
            </div>
        </div>

        <!-- Basic Information Section -->
        <div class="form-section">
            <div class="section-title">
                <i class="fas fa-info-circle"></i> Basic Information
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <div class="form-label">Technician Name</div>
                    <div class="form-value highlight">${record.technicianName}</div>
                </div>
                <div class="form-group">
                    <div class="form-label">Band Level</div>
                    <div class="form-value">
                        <span class="status-indicator info">${record.band} - ${record.variant}</span>
                    </div>
                </div>
                <div class="form-group">
                    <div class="form-label">PO Number</div>
                    <div class="form-value">${record.poNumber}</div>
                </div>
                <div class="form-group">
                    <div class="form-label">Zip Code</div>
                    <div class="form-value">${record.zipCode || 'N/A'}</div>
                </div>
            </div>
        </div>

        <!-- Work Details Section -->
        <div class="form-section">
            <div class="section-title">
                <i class="fas fa-calendar-check"></i> Work Details
            </div>
            <div class="form-row">
                <div class="form-group">
                    <div class="form-label">Working Days (Planned)</div>
                    <div class="form-value">${record.workingDays} days</div>
                </div>
                <div class="form-group">
                    <div class="form-label">Worked Days (Actual)</div>
                    <div class="form-value">${record.workedDays} days</div>
                </div>
                <div class="form-group">
                    <div class="form-label">Attendance Status</div>
                    <div class="form-value">${attendanceStatus}</div>
                </div>
            </div>
        </div>

        <!-- Cost Details Section -->
        <div class="form-section">
            <div class="section-title">
                <i class="fas fa-money-bill-wave"></i> Cost Details
            </div>
            <div class="cost-summary">
                <div class="cost-item">
                    <span class="cost-label">Monthly Rate</span>
                    <span class="cost-value">${record.currency} ${formatCurrency(record.monthlyRate)}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-label">Actual Cost</span>
                    <span class="cost-value">${record.currency} ${formatCurrency(record.actualCost)}</span>
                </div>
                ${record.otHours > 0 ? `
                <div class="cost-item">
                    <span class="cost-label">OT Hours (${record.otHours} hrs @ ${formatCurrency(record.otPerHourRate)}/hr)</span>
                    <span class="cost-value">${record.currency} ${formatCurrency(record.otHoursCost)}</span>
                </div>
                ` : ''}
                ${record.weekendOtHours > 0 ? `
                <div class="cost-item">
                    <span class="cost-label">Weekend OT (${record.weekendOtHours} hrs)</span>
                    <span class="cost-value">${record.currency} ${formatCurrency(record.weekendCost)}</span>
                </div>
                ` : ''}
                ${record.travelExtraCost > 0 ? `
                <div class="cost-item">
                    <span class="cost-label">Travel/Extra Cost</span>
                    <span class="cost-value">${record.currency} ${formatCurrency(record.travelExtraCost)}</span>
                </div>
                ` : ''}
                ${record.taxPercent > 0 ? `
                <div class="cost-item">
                    <span class="cost-label">Tax (${record.taxPercent}%)</span>
                    <span class="cost-value">${record.currency} ${formatCurrency(record.taxCost)}</span>
                </div>
                ` : ''}
                <div class="cost-item">
                    <span class="cost-label">Total Cost</span>
                    <span class="cost-value highlight">${record.currency} ${formatCurrency(record.totalCost)}</span>
                </div>
            </div>
        </div>

        <!-- SLA & Quality Section -->
        <div class="form-section">
            <div class="section-title">
                <i class="fas fa-chart-line"></i> SLA & Quality
            </div>
            <div class="form-row">
                <div class="form-group">
                    <div class="form-label">SLA Percentage</div>
                    <div class="form-value">${record.slaPercent}%</div>
                </div>
                <div class="form-group">
                    <div class="form-label">SLA Status</div>
                    <div class="form-value">${slaStatus}</div>
                </div>
                <div class="form-group">
                    <div class="form-label">SLA Reason</div>
                    <div class="form-value">${record.slaReason || 'N/A'}</div>
                </div>
            </div>
        </div>

        <!-- File Attachments Section -->
        <div class="form-section">
            <div class="section-title">
                <i class="fas fa-paperclip"></i> File Attachments
            </div>
            
            <!-- Ticket References -->
            <div class="file-category-section ticket-reference">
                <div class="file-category-header">
                    <div class="category-title">
                        <i class="fas fa-ticket-alt"></i> Ticket References
                        <span class="category-count">${record.ticketReferences ? record.ticketReferences.length : 0}</span>
                    </div>
                    <button class="btn btn-sm btn-info" onclick="uploadTicketReference(${record.id})">
                        <i class="fas fa-plus"></i> Add Ticket
                    </button>
                </div>
                <div class="file-attachments-grid">
                    ${ticketReferencesHTML}
                </div>
            </div>
            
            <!-- Files for Approval -->
            <div class="file-category-section approval-file">
                <div class="file-category-header">
                    <div class="category-title">
                        <i class="fas fa-file-signature"></i> Files for Approval
                        <span class="category-count">${record.filesForApproval ? record.filesForApproval.length : 0}</span>
                    </div>
                    <button class="btn btn-sm btn-success" onclick="uploadApprovalFile(${record.id})">
                        <i class="fas fa-upload"></i> Upload for Approval
                    </button>
                </div>
                <div class="file-attachments-grid">
                    ${filesForApprovalHTML}
                </div>
            </div>
        </div>

        <!-- Remarks Section -->
        ${record.remarks ? `
        <div class="form-section">
            <div class="section-title">
                <i class="fas fa-sticky-note"></i> Remarks
            </div>
            <div class="form-value" style="padding: 15px; background: #fff3cd; border-left-color: #ffc107;">
                <i class="fas fa-comment-alt" style="margin-right: 10px; color: #e0a800;"></i>
                ${record.remarks}
            </div>
        </div>
        ` : ''}
    `;

    // Update navigation info
    updateFormNavigationInfo();
}

// Add new file handling functions
function approveFile(filename, recordId) {
    const record = dedicatedData.find(item => item.id === recordId);
    if (!record) return;

    const file = record.filesForApproval?.find(f => f.name === filename);
    if (file) {
        if (confirm(`Approve file: ${filename}?`)) {
            file.status = 'Approved';
            file.approvedDate = new Date().toISOString().split('T')[0];
            alert(`File "${filename}" approved successfully!`);
            updateFormView(); // Refresh the view
        }
    }
}

function rejectFile(filename, recordId) {
    const record = dedicatedData.find(item => item.id === recordId);
    if (!record) return;

    const file = record.filesForApproval?.find(f => f.name === filename);
    if (file) {
        const reason = prompt(`Enter rejection reason for: ${filename}`);
        if (reason !== null) {
            file.status = 'Rejected';
            file.rejectedDate = new Date().toISOString().split('T')[0];
            file.rejectionReason = reason;
            alert(`File "${filename}" rejected. Reason: ${reason}`);
            updateFormView(); // Refresh the view
        }
    }
}

function uploadTicketReference(recordId) {
    const record = dedicatedData.find(item => item.id === recordId);
    if (!record) return;

    alert(`Upload ticket reference for: ${record.technicianName}\n\nThis would open a file upload dialog for ticket references.`);
    // In real implementation: open file upload, then add to record.ticketReferences
}

function uploadApprovalFile(recordId) {
    const record = dedicatedData.find(item => item.id === recordId);
    if (!record) return;

    alert(`Upload file for approval: ${record.technicianName}\n\nThis would open a file upload dialog for approval files.`);
    // In real implementation: open file upload, then add to record.filesForApproval
}

// Update the table view to show file counts
function updateTable() {
    console.log('Updating table...', dedicatedConfig.filteredData.length, 'items');

    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }

    const startIndex = (dedicatedConfig.currentPage - 1) * dedicatedConfig.pageSize;
    const endIndex = startIndex + dedicatedConfig.pageSize;
    const pageData = dedicatedConfig.filteredData.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    pageData.forEach(item => {
        const row = document.createElement('tr');

        // Format currency values
        const formatCurrency = (value) => {
            if (value === undefined || value === null) return '-';
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        };

        // Generate file counts HTML
        const ticketRefCount = item.ticketReferences?.length || 0;
        const approvalFileCount = item.filesForApproval?.length || 0;
        const pendingApprovalCount = item.filesForApproval?.filter(f => f.status === 'Pending').length || 0;

        const filesHTML = `
            <div style="display: flex; flex-direction: column; gap: 5px; min-width: 200px;">
                <div class="file-count-row">
                    <i class="fas fa-ticket-alt" style="color: #17a2b8;"></i>
                    <span style="margin-left: 8px; font-size: 12px;">Tickets: ${ticketRefCount}</span>
                </div>
                <div class="file-count-row">
                    <i class="fas fa-file-signature" style="color: ${pendingApprovalCount > 0 ? '#ffc107' : '#28a745'}"></i>
                    <span style="margin-left: 8px; font-size: 12px;">Approval: ${approvalFileCount} (${pendingApprovalCount} pending)</span>
                </div>
                <div style="margin-top: 8px;">
                    <button class="btn btn-sm btn-info" onclick="viewFormRecord(${item.id})" title="View Files">
                        <i class="fas fa-eye"></i> View Files
                    </button>
                </div>
            </div>
        `;

        row.innerHTML = `
            <td>
                <button class="btn btn-sm btn-info" onclick="viewDetails(${item.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="editRecord(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td style="min-width: 200px;">
                ${filesHTML}
            </td>
            <td>${item.siteCategory || '-'}</td>
            <td>${item.customerName || '-'}</td>
            <td>${item.partnerName || '-'}</td>
            <td>${item.country || '-'}</td>
            <td>${item.state || '-'}</td>
            <td>${item.city || '-'}</td>
            <td>${item.siteAddress || '-'}</td>
            <td>${item.zipCode || '-'}</td>
            <td>${item.poNumber || '-'}</td>
            <td><strong>${item.technicianName || '-'}</strong></td>
            <td><span class="status-badge status-info">${item.band || '-'}</span></td>
            <td>${item.variant || '-'}</td>
            <td>${item.workingDays || '-'}</td>
            <td>${item.workedDays || '-'}</td>
            <td>${formatCurrency(item.monthlyRate)}</td>
            <td>${item.dailyRate > 0 ? formatCurrency(item.dailyRate) : '-'}</td>
            <td>${formatCurrency(item.actualCost)}</td>
            <td>${item.currency || '-'}</td>
            <td>${item.otHours || '0'}</td>
            <td>${item.otPerHourRate > 0 ? formatCurrency(item.otPerHourRate) : '-'}</td>
            <td>${item.otHoursCost > 0 ? formatCurrency(item.otHoursCost) : '-'}</td>
            <td>${item.weekendOtHours || '0'}</td>
            <td>${item.weekendRate > 0 ? formatCurrency(item.weekendRate) : '-'}</td>
            <td>${item.weekendCost > 0 ? formatCurrency(item.weekendCost) : '-'}</td>
            <td>${item.travelExtraCost > 0 ? formatCurrency(item.travelExtraCost) : '-'}</td>
            <td>${item.taxPercent > 0 ? item.taxPercent + '%' : '-'}</td>
            <td>${item.taxCost > 0 ? formatCurrency(item.taxCost) : '-'}</td>
            <td><strong>${formatCurrency(item.totalCost)}</strong></td>
            <td>${item.slaPercent || '0'}%</td>
            <td><span class="status-badge ${item.slaMet === 'Yes' ? 'status-success' : 'status-error'}">${item.slaMet || 'No'}</span></td>
            <td>${item.slaReason || '-'}</td>
            <td><span class="status-badge ${item.attendanceApproved === 'Yes' ? 'status-success' : 'status-warning'}">${item.attendanceApproved || 'No'}</span></td>
            <td>${item.serviceMonth || '-'}</td>
            <td>${item.remarks || '-'}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Add helper function to view a specific record in form view
function viewFormRecord(recordId) {
    // Switch to form view
    const formViewBtn = document.querySelector('.view-btn[data-view="form"]');
    if (formViewBtn) formViewBtn.click();

    // Find the record index
    const index = formRecords.findIndex(item => item.id === recordId);
    if (index !== -1) {
        goToFormRecord(index);
    }
}

// Initialize form navigation
function initFormNavigation() {
    const firstBtn = document.getElementById('formFirstRecord');
    const prevBtn = document.getElementById('formPrevRecord');
    const nextBtn = document.getElementById('formNextRecord');
    const lastBtn = document.getElementById('formLastRecord');
    const printBtn = document.getElementById('printForm');
    const exportBtn = document.getElementById('exportForm');
    const recordSelect = document.getElementById('formRecordSelect');

    if (firstBtn) firstBtn.addEventListener('click', () => goToFormRecord(0));
    if (prevBtn) prevBtn.addEventListener('click', () => goToFormRecord(currentFormIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToFormRecord(currentFormIndex + 1));
    if (lastBtn) lastBtn.addEventListener('click', () => goToFormRecord(formRecords.length - 1));

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const record = formRecords[currentFormIndex];
            alert(`Exporting record for ${record.technicianName} as PDF...\n\nIn a real application, this would generate a PDF.`);
        });
    }

    if (recordSelect) {
        recordSelect.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (!isNaN(index)) {
                goToFormRecord(index);
            }
        });
    }
}

// Populate record select dropdown
function populateRecordSelect() {
    const select = document.getElementById('formRecordSelect');
    if (!select) return;

    select.innerHTML = '';
    formRecords.forEach((record, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${record.technicianName} - ${record.siteAddress} (${record.serviceMonth})`;
        select.appendChild(option);
    });

    select.value = currentFormIndex;
}

// Go to specific form record
function goToFormRecord(index) {
    if (index < 0 || index >= formRecords.length) return;

    currentFormIndex = index;
    updateFormView();

    // Update select dropdown
    const select = document.getElementById('formRecordSelect');
    if (select) {
        select.value = currentFormIndex;
    }
}

// Update form navigation info
function updateFormNavigationInfo() {
    const record = formRecords[currentFormIndex];
    const currentRecordEl = document.getElementById('formCurrentRecord');
    const recordDetailsEl = document.getElementById('formRecordDetails');

    if (currentRecordEl) {
        currentRecordEl.textContent = `Record ${currentFormIndex + 1} of ${formRecords.length}`;
    }

    if (recordDetailsEl) {
        recordDetailsEl.textContent = `${record.customerName} - ${record.technicianName} (${record.country})`;
    }

    // Enable/disable navigation buttons
    const firstBtn = document.getElementById('formFirstRecord');
    const prevBtn = document.getElementById('formPrevRecord');
    const nextBtn = document.getElementById('formNextRecord');
    const lastBtn = document.getElementById('formLastRecord');

    if (firstBtn) firstBtn.disabled = currentFormIndex === 0;
    if (prevBtn) prevBtn.disabled = currentFormIndex === 0;
    if (nextBtn) nextBtn.disabled = currentFormIndex === formRecords.length - 1;
    if (lastBtn) lastBtn.disabled = currentFormIndex === formRecords.length - 1;
}

// Update the applyFilters function to handle form view
function applyFilters() {
    console.log('Applying filters...');

    const customerSelect = document.getElementById('customerSelect');
    const partnerSelect = document.getElementById('partnerSelect');
    const countrySelect = document.getElementById('countrySelect');
    const bandSelect = document.getElementById('bandSelect');
    const searchInput = document.getElementById('searchInput');

    const filters = {
        customer: customerSelect ? customerSelect.value : '',
        partner: partnerSelect ? partnerSelect.value : '',
        country: countrySelect ? countrySelect.value : '',
        band: bandSelect ? bandSelect.value : '',
        search: searchInput ? searchInput.value.toLowerCase() : ''
    };

    // Filter data
    const filtered = dedicatedData.filter(item => {
        // Apply dropdown filters
        if (filters.customer && item.customerName !== filters.customer) return false;
        if (filters.partner && item.partnerName !== filters.partner) return false;
        if (filters.country && item.country !== filters.country) return false;
        if (filters.band && item.band !== filters.band) return false;

        // Apply search filter
        if (filters.search) {
            const searchableFields = [
                item.technicianName,
                item.city,
                item.state,
                item.country,
                item.siteAddress,
                item.poNumber,
                item.serviceMonth,
                item.remarks
            ].map(field => field ? field.toString().toLowerCase() : '');

            return searchableFields.some(field => field.includes(filters.search));
        }

        return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
        const field = dedicatedConfig.sortField;
        const order = dedicatedConfig.sortOrder === 'asc' ? 1 : -1;

        // Get the field value
        let aValue = a[field];
        let bValue = b[field];

        // Handle numeric fields
        if (['monthlyRate', 'actualCost', 'totalCost', 'workingDays', 'workedDays'].includes(field)) {
            return order * (parseFloat(aValue) - parseFloat(bValue));
        }

        // Handle string fields
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            if (aValue.toLowerCase() < bValue.toLowerCase()) return -1 * order;
            if (aValue.toLowerCase() > bValue.toLowerCase()) return 1 * order;
        }
        return 0;
    });

    // Update both table and form data
    dedicatedConfig.filteredData = [...filtered];
    formRecords = [...filtered];

    // Reset to first page/record
    dedicatedConfig.currentPage = 1;
    currentFormIndex = 0;

    // Update views based on active view
    if (document.getElementById('tableView') && document.getElementById('tableView').classList.contains('active')) {
        console.log('Updating table view...');
        updateTable();
        updatePagination();
    } else {
        console.log('Updating form view...');
        updateFormView();
        populateRecordSelect();
        updateFormNavigationInfo();
    }
}

// Update the view toggle handler
function initViewToggle() {
    console.log('Initializing view toggle...');

    const viewBtns = document.querySelectorAll('.view-btn');
    const tableView = document.getElementById('tableView');
    const formView = document.getElementById('formView');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show/hide views
            const view = btn.dataset.view;
            if (tableView) tableView.classList.remove('active');
            if (formView) formView.classList.remove('active');

            if (view === 'table' && tableView) {
                tableView.classList.add('active');
                updateTable();
                updatePagination();
            } else if (formView) {
                formView.classList.add('active');
                updateFormView();
                populateRecordSelect();
                updateFormNavigationInfo();
            }
        });
    });
}

// Initialize when the tab is shown
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, checking for dedicated tab...');

    // Check if dedicated tab exists on the page
    const dedicatedTab = document.getElementById('dedicatedTab');
    if (dedicatedTab) {
        console.log('Dedicated tab found, initializing...');

        // Initialize immediately if tab is active
        if (dedicatedTab.classList.contains('active')) {
            initDedicatedTab();
        }

        // Also initialize when tab becomes active (if using tab switching)
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (dedicatedTab.classList.contains('active')) {
                        console.log('Dedicated tab became active, initializing...');
                        initDedicatedTab();
                    }
                }
            });
        });

        observer.observe(dedicatedTab, { attributes: true });
    }

    // Alternative: Trigger initialization when Load Data button is clicked
    const loadDataBtn = document.getElementById('loadDataBtn');
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', function () {
            console.log('Load Data button clicked');
            initDedicatedTab();
        });
    }

    // Or simply initialize after a short delay to ensure DOM is ready
    setTimeout(function () {
        if (document.getElementById('dedicatedTab') && document.getElementById('dedicatedTab').classList.contains('active')) {
            console.log('Auto-initializing dedicated tab after delay...');
            initDedicatedTab();
        }
    }, 500);
});