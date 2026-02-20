// ProjectTab.js - Complete Implementation
document.addEventListener('DOMContentLoaded', function () {
    class ProjectTab {
        constructor() {
            this.data = [];
            this.filteredData = [];
            this.currentPage = 1;
            this.pageSize = 10;
            this.totalPages = 0;
            this.currentSortField = 'technicianName';
            this.currentSortOrder = 'asc';
            this.currentView = 'table';
            this.currentRecordIndex = 0;

            this.filters = {
                customer: '',
                partner: '',
                country: '',
                band: '',
                search: ''
            };

            this.initializeElements();
            this.loadSampleData();
            this.initializeEventListeners();
            this.renderTableView();
            this.updatePagination();
            this.renderBandDetails();
        }

        initializeElements() {
            // View elements
            this.tableView = document.getElementById('projectTableView');
            this.formView = document.getElementById('projectFormView');
            this.tableBody = document.getElementById('projectTableBody');
            this.formPageContainer = document.getElementById('projectFormPageContainer');
            this.bandDetailsContainer = document.getElementById('projectBandDetailsContainer');

            // Filter elements
            this.customerSelect = document.getElementById('projectCustomerSelect');
            this.partnerSelect = document.getElementById('projectPartnerSelect');
            this.countrySelect = document.getElementById('projectCountrySelect');
            this.bandSelect = document.getElementById('projectBandSelect');
            this.searchInput = document.getElementById('projectSearchInput');
            this.clearFiltersBtn = document.getElementById('projectClearFiltersBtn');

            // View toggle
            this.viewButtons = document.querySelectorAll('.project-view-btn');

            // Sorting elements
            this.sortField = document.getElementById('projectSortField');
            this.sortOrderRadios = document.querySelectorAll('input[name="projectSortOrder"]');

            // Pagination elements
            this.paginationInfo = document.getElementById('projectPaginationInfo');
            this.pageNumbers = document.getElementById('projectPageNumbers');
            this.firstPageBtn = document.getElementById('projectFirstPage');
            this.prevPageBtn = document.getElementById('projectPrevPage');
            this.nextPageBtn = document.getElementById('projectNextPage');
            this.lastPageBtn = document.getElementById('projectLastPage');
            this.pageSizeSelect = document.getElementById('projectPageSizeSelect');

            // Form navigation elements
            this.formCurrentRecord = document.getElementById('projectFormCurrentRecord');
            this.formRecordDetails = document.getElementById('projectFormRecordDetails');
            this.formFirstRecord = document.getElementById('projectFormFirstRecord');
            this.formPrevRecord = document.getElementById('projectFormPrevRecord');
            this.formNextRecord = document.getElementById('projectFormNextRecord');
            this.formLastRecord = document.getElementById('projectFormLastRecord');
            this.formRecordSelect = document.getElementById('projectFormRecordSelect');
            this.printFormBtn = document.getElementById('projectPrintForm');
            this.exportFormBtn = document.getElementById('projectExportForm');
        }

        loadSampleData() {
            // Sample data with file attachments
            this.data = [
                {
                    id: 1,
                    siteCategory: 'Project',
                    customerName: 'HCL',
                    partnerName: 'HCL Partner Ltd',
                    projectName: 'HCL EUC Support Project',
                    projectStartDate: '8/1/2025',
                    projectEndDate: '8/31/2025',
                    country: 'HUNGARY',
                    state: 'Pest',
                    city: 'Nagytarcsa',
                    siteAddress: 'Szilas utca 4, 2142 Nagytarcsa',
                    zipCode: '2142',
                    poNumber: '9200136102',
                    technicianName: 'Janos Kovacs',
                    band: 'Band 2',
                    variant: 'With Backfill',
                    workingDays: '22',
                    workedDays: '22',
                    monthlyRate: '3324.64',
                    dailyRate: '151.12',
                    actualCost: '3324.64',
                    currency: 'EUR',
                    otHours: '5',
                    otPerHourRate: '25',
                    otHoursCost: '125',
                    weekendOtHours: '0',
                    weekendRate: '0',
                    weekendCost: '0',
                    travelExtraCost: '0',
                    taxPercent: '27',
                    taxCost: '898.65',
                    totalCost: '4348.29',
                    slaPercent: '99',
                    slaMet: 'Yes',
                    slaReason: '',
                    attendanceApproved: 'Yes',
                    serviceMonth: 'Aug-25',
                    remarks: 'Project successfully completed on time',
                    ticketReferences: [
                        { name: 'PRJ-00123.pdf', type: 'pdf', size: '1.4 MB', ticketNumber: 'PRJ-00123', date: '2024-08-01' },
                        { name: 'PRJ-00124.docx', type: 'word', size: '890 KB', ticketNumber: 'PRJ-00124', date: '2024-08-02' },
                        { name: 'PRJ-00125.xlsx', type: 'excel', size: '650 KB', ticketNumber: 'PRJ-00125', date: '2024-08-03' }
                    ],
                    filesForApproval: [
                        { name: 'Project_Timesheet_Aug.pdf', type: 'pdf', size: '2.4 MB', status: 'Pending', submittedDate: '2024-08-31' },
                        { name: 'Project_Approval_Email.docx', type: 'word', size: '1.2 MB', status: 'Approved', approvedDate: '2024-09-01' }
                    ]
                },
                {
                    id: 2,
                    siteCategory: 'Project',
                    customerName: 'HCL',
                    partnerName: 'HCL Partner Ltd',
                    projectName: 'HCL Field Support Project',
                    projectStartDate: '8/1/2025',
                    projectEndDate: '10/31/2025',
                    country: 'SOUTH AFRICA',
                    state: 'Gauteng',
                    city: 'Boksburg',
                    siteAddress: 'Kempton Park',
                    zipCode: '1619',
                    poNumber: '9200135148',
                    technicianName: 'Sipho Dlamini',
                    band: 'Band 2',
                    variant: 'With Backfill',
                    workingDays: '66',
                    workedDays: '63',
                    monthlyRate: '57678.28',
                    dailyRate: '2621.74',
                    actualCost: '57678.28',
                    currency: 'ZAR',
                    otHours: '10',
                    otPerHourRate: '150',
                    otHoursCost: '1500',
                    weekendOtHours: '4',
                    weekendRate: '200',
                    weekendCost: '800',
                    travelExtraCost: '0',
                    taxPercent: '15',
                    taxCost: '8875.24',
                    totalCost: '68853.52',
                    slaPercent: '97',
                    slaMet: 'Yes',
                    slaReason: '',
                    attendanceApproved: 'Yes',
                    serviceMonth: 'Aug-25',
                    remarks: '3-month project with good SLA performance',
                    ticketReferences: [
                        { name: 'PRJ-00201.pdf', type: 'pdf', size: '1.8 MB', ticketNumber: 'PRJ-00201', date: '2024-08-05' },
                        { name: 'PRJ-00202.docx', type: 'word', size: '1.1 MB', ticketNumber: 'PRJ-00202', date: '2024-08-06' }
                    ],
                    filesForApproval: [
                        { name: 'Project_Invoice_Aug25.pdf', type: 'pdf', size: '3.1 MB', status: 'Approved', approvedDate: '2024-09-02' },
                        { name: 'Project_Service_Report.docx', type: 'word', size: '890 KB', status: 'Pending', submittedDate: '2024-08-30' }
                    ]
                },
                {
                    id: 3,
                    siteCategory: 'Project',
                    customerName: 'HCL',
                    partnerName: 'HCL Partner Ltd',
                    projectName: 'HCL Long Term Support',
                    projectStartDate: '8/1/2025',
                    projectEndDate: '2/28/2026',
                    country: 'NIGERIA',
                    state: 'Rivers',
                    city: 'Port Harcourt',
                    siteAddress: 'Port Harcourt Central',
                    zipCode: '500001',
                    poNumber: '9200136102',
                    technicianName: 'Emeka Okoye',
                    band: 'Band 3',
                    variant: 'With Backfill',
                    workingDays: '154',
                    workedDays: '150',
                    monthlyRate: '2500.00',
                    dailyRate: '113.64',
                    actualCost: '2500.00',
                    currency: 'EUR',
                    otHours: '2',
                    otPerHourRate: '20',
                    otHoursCost: '40',
                    weekendOtHours: '0',
                    weekendRate: '0',
                    weekendCost: '0',
                    travelExtraCost: '100',
                    taxPercent: '10',
                    taxCost: '250.00',
                    totalCost: '2890.00',
                    slaPercent: '95',
                    slaMet: 'Yes',
                    slaReason: '',
                    attendanceApproved: 'Yes',
                    serviceMonth: 'Aug-25',
                    remarks: '7-month project with tax considerations',
                    ticketReferences: [
                        { name: 'PRJ-00301.pdf', type: 'pdf', size: '2.1 MB', ticketNumber: 'PRJ-00301', date: '2024-08-10' }
                    ],
                    filesForApproval: [
                        { name: 'Project_Tax_Calculation.xlsx', type: 'excel', size: '450 KB', status: 'Approved', approvedDate: '2024-09-03' },
                        { name: 'Project_VAT_Declaration.docx', type: 'word', size: '780 KB', status: 'Pending', submittedDate: '2024-08-31' }
                    ]
                },
                {
                    id: 4,
                    siteCategory: 'Project',
                    customerName: 'HCL',
                    partnerName: 'HCL Partner Ltd',
                    projectName: 'HCL Dispatch Project',
                    projectStartDate: '8/1/2025',
                    projectEndDate: '8/31/2025',
                    country: 'POLAND',
                    state: 'Silesia',
                    city: 'Sosnowiec',
                    siteAddress: 'Sosnowiec Site',
                    zipCode: '41-200',
                    poNumber: '9200135685',
                    technicianName: 'Piotr Nowak',
                    band: 'Band 2',
                    variant: 'With Backfill',
                    workingDays: '20',
                    workedDays: '18',
                    monthlyRate: '609.05',
                    dailyRate: '30.45',
                    actualCost: '609.05',
                    currency: 'GBP',
                    otHours: '12',
                    otPerHourRate: '25',
                    otHoursCost: '300',
                    weekendOtHours: '2',
                    weekendRate: '40',
                    weekendCost: '80',
                    travelExtraCost: '0',
                    taxPercent: '23',
                    taxCost: '228.08',
                    totalCost: '1217.13',
                    slaPercent: '92',
                    slaMet: 'No',
                    slaReason: 'Resource shortage during peak period',
                    attendanceApproved: 'Yes',
                    serviceMonth: 'Aug-25',
                    remarks: 'Project completed with minor SLA issues',
                    ticketReferences: [
                        { name: 'PRJ-00401.pdf', type: 'pdf', size: '1.5 MB', ticketNumber: 'PRJ-00401', date: '2024-08-12' },
                        { name: 'PRJ-00402.xlsx', type: 'excel', size: '720 KB', ticketNumber: 'PRJ-00402', date: '2024-08-15' }
                    ],
                    filesForApproval: [
                        { name: 'Project_Dispatch_Report.pdf', type: 'pdf', size: '1.9 MB', status: 'Approved', approvedDate: '2024-09-04' },
                        { name: 'Project_Completion_Certificate.docx', type: 'word', size: '1.5 MB', status: 'Pending', submittedDate: '2024-08-28' }
                    ]
                }
            ];

            this.filteredData = [...this.data];
            this.sortData();
        }

        renderBandDetails() {
            if (!this.bandDetailsContainer) return;

            const bandDetails = {
                'Short Term (≤3 months)': {
                    'Band 0': { price: '€0.00', duration: '0 days', minTerm: '0 days', maxTerm: '0 days' },
                    'Band 1': { price: '€50.00', duration: '90 days', minTerm: '30 days', maxTerm: '90 days' },
                    'Band 2': { price: '€75.00', duration: '90 days', minTerm: '30 days', maxTerm: '90 days' },
                    'Band 3': { price: '€100.00', duration: '90 days', minTerm: '30 days', maxTerm: '90 days' },
                    'Band 4': { price: '€125.00', duration: '90 days', minTerm: '30 days', maxTerm: '90 days' }
                },
                'Long Term (>3 months)': {
                    'Band 0': { price: '€0.00', duration: '0 days', minTerm: '0 days', maxTerm: '0 days' },
                    'Band 1': { price: '€45.00', duration: '365 days', minTerm: '91 days', maxTerm: '365 days' },
                    'Band 2': { price: '€70.00', duration: '365 days', minTerm: '91 days', maxTerm: '365 days' },
                    'Band 3': { price: '€95.00', duration: '365 days', minTerm: '91 days', maxTerm: '365 days' },
                    'Band 4': { price: '€120.00', duration: '365 days', minTerm: '91 days', maxTerm: '365 days' }
                }
            };

            let html = `
                <div class="band-details-section">
                    <div class="band-details-header">
                        <h3><i class="fas fa-chart-bar"></i> Project Band Details</h3>
                        <div class="section-subtitle">Pricing for short & long term projects</div>
                    </div>
                    
                    <div class="band-details-grid">
            `;

            // Add both short term and long term band details
            Object.entries(bandDetails).forEach(([groupName, bands]) => {
                const isShortTerm = groupName.includes('Short');
                html += `
                    <div class="band-details-card ${isShortTerm ? 'short-term' : 'long-term'}">
                        <div class="band-details-card-header">
                            <h4><i class="fas fa-calendar-alt"></i> ${groupName}</h4>
                        </div>
                        <div class="table-responsive">
                            <table class="band-details-table">
                                <thead>
                                    <tr>
                                        <th>Band</th>
                                        <th>Price</th>
                                        <th>Duration</th>
                                        <th>Min Term</th>
                                        <th>Max Term</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;

                Object.entries(bands).forEach(([bandName, bandData]) => {
                    const bandClass = bandName.toLowerCase().replace(' ', '-');
                    html += `
                        <tr>
                            <td><span class="band-badge ${bandClass}">${bandName}</span></td>
                            <td>${bandData.price}</td>
                            <td>${bandData.duration}</td>
                            <td>${bandData.minTerm}</td>
                            <td>${bandData.maxTerm}</td>
                        </tr>
                    `;
                });

                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                    
                    <div class="band-notes">
                        <h4><i class="fas fa-info-circle"></i> Notes:</h4>
                        <ul>
                            <li><strong>Short Term:</strong> Projects lasting 3 months or less</li>
                            <li><strong>Long Term:</strong> Projects lasting more than 3 months</li>
                            <li><strong>Min Term:</strong> Minimum commitment period for the rate</li>
                            <li><strong>Max Term:</strong> Maximum period at this rate before review</li>
                            <li>Rates are per day unless otherwise specified</li>
                            <li>All rates are exclusive of taxes and additional costs</li>
                        </ul>
                    </div>
                </div>
            `;

            this.bandDetailsContainer.innerHTML = html;
        }

        initializeEventListeners() {
            // Filter event listeners
            this.customerSelect.addEventListener('change', () => this.handleFilterChange('customer'));
            this.partnerSelect.addEventListener('change', () => this.handleFilterChange('partner'));
            this.countrySelect.addEventListener('change', () => this.handleFilterChange('country'));
            this.bandSelect.addEventListener('change', () => this.handleFilterChange('band'));
            this.searchInput.addEventListener('input', () => this.handleFilterChange('search'));
            this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());

            // View toggle
            this.viewButtons.forEach(btn => {
                btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
            });

            // Sorting
            this.sortField.addEventListener('change', (e) => {
                this.currentSortField = e.target.value;
                this.sortData();
                this.renderTableView();
                this.updatePagination();
            });

            this.sortOrderRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.currentSortOrder = e.target.value;
                    this.sortData();
                    this.renderTableView();
                    this.updatePagination();
                });
            });

            // Pagination
            this.firstPageBtn.addEventListener('click', () => this.goToPage(1));
            this.prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
            this.nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
            this.lastPageBtn.addEventListener('click', () => this.goToPage(this.totalPages));
            this.pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderTableView();
                this.updatePagination();
            });

            // Form navigation
            this.formFirstRecord.addEventListener('click', () => this.navigateToRecord(0));
            this.formPrevRecord.addEventListener('click', () => this.navigateToRecord(this.currentRecordIndex - 1));
            this.formNextRecord.addEventListener('click', () => this.navigateToRecord(this.currentRecordIndex + 1));
            this.formLastRecord.addEventListener('click', () => this.navigateToRecord(this.filteredData.length - 1));
            this.formRecordSelect.addEventListener('change', (e) => this.navigateToRecord(e.target.value));

            // Print and Export
            this.printFormBtn.addEventListener('click', () => this.printForm());
            this.exportFormBtn.addEventListener('click', () => this.exportForm());
        }

        handleFilterChange(filterType) {
            switch (filterType) {
                case 'customer':
                    this.filters.customer = this.customerSelect.value;
                    break;
                case 'partner':
                    this.filters.partner = this.partnerSelect.value;
                    break;
                case 'country':
                    this.filters.country = this.countrySelect.value;
                    break;
                case 'band':
                    this.filters.band = this.bandSelect.value;
                    break;
                case 'search':
                    this.filters.search = this.searchInput.value.toLowerCase();
                    break;
            }

            this.applyFilters();
            this.currentPage = 1;
            this.currentRecordIndex = 0;

            if (this.currentView === 'table') {
                this.renderTableView();
                this.updatePagination();
            } else {
                this.renderFormView();
                this.updateFormNavigation();
            }
        }

        applyFilters() {
            this.filteredData = this.data.filter(item => {
                // Apply customer filter
                if (this.filters.customer && item.customerName !== this.filters.customer) {
                    return false;
                }

                // Apply partner filter
                if (this.filters.partner && item.partnerName !== this.filters.partner) {
                    return false;
                }

                // Apply country filter
                if (this.filters.country && item.country !== this.filters.country) {
                    return false;
                }

                // Apply band filter
                if (this.filters.band && item.band !== this.filters.band) {
                    return false;
                }

                // Apply search filter
                if (this.filters.search) {
                    const searchableFields = [
                        item.siteCategory,
                        item.customerName,
                        item.partnerName,
                        item.projectName,
                        item.country,
                        item.state,
                        item.city,
                        item.technicianName,
                        item.band,
                        item.variant,
                        item.currency,
                        item.slaMet,
                        item.serviceMonth,
                        item.remarks
                    ].join(' ').toLowerCase();

                    if (!searchableFields.includes(this.filters.search)) {
                        return false;
                    }
                }

                return true;
            });

            this.sortData();
        }

        clearFilters() {
            this.customerSelect.value = '';
            this.partnerSelect.value = '';
            this.countrySelect.value = '';
            this.bandSelect.value = '';
            this.searchInput.value = '';

            this.filters = {
                customer: '',
                partner: '',
                country: '',
                band: '',
                search: ''
            };

            this.filteredData = [...this.data];
            this.sortData();
            this.currentPage = 1;
            this.currentRecordIndex = 0;

            if (this.currentView === 'table') {
                this.renderTableView();
                this.updatePagination();
            } else {
                this.renderFormView();
                this.updateFormNavigation();
            }
        }

        sortData() {
            this.filteredData.sort((a, b) => {
                let aValue = a[this.currentSortField];
                let bValue = b[this.currentSortField];

                // Handle numeric fields
                const numericFields = ['totalCost', 'monthlyRate', 'dailyRate', 'actualCost', 'slaPercent'];
                if (numericFields.includes(this.currentSortField)) {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                }

                // Handle date fields
                if (this.currentSortField === 'serviceMonth') {
                    aValue = this.parseServiceMonth(aValue);
                    bValue = this.parseServiceMonth(bValue);
                }

                if (this.currentSortOrder === 'asc') {
                    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
                } else {
                    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
                }
            });
        }

        parseServiceMonth(monthStr) {
            if (!monthStr) return 0;
            const [month, year] = monthStr.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = monthNames.indexOf(month);
            return new Date(year, monthIndex).getTime();
        }

        switchView(viewType) {
            this.currentView = viewType;

            // Update active view buttons
            this.viewButtons.forEach(btn => {
                if (btn.dataset.view === viewType) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Show/hide views
            if (viewType === 'table') {
                this.tableView.classList.add('active');
                this.formView.classList.remove('active');
                this.renderTableView();
                this.updatePagination();
            } else {
                this.tableView.classList.remove('active');
                this.formView.classList.add('active');
                this.renderFormView();
                this.updateFormNavigation();
            }
        }

        renderTableView() {
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = Math.min(startIndex + this.pageSize, this.filteredData.length);
            const pageData = this.filteredData.slice(startIndex, endIndex);

            let tableHTML = '';

            pageData.forEach((item, index) => {
                const highlightClass = item.slaMet === 'No' ? 'highlighted' : '';

                // Generate file counts HTML
                const ticketRefCount = item.ticketReferences?.length || 0;
                const approvalFileCount = item.filesForApproval?.length || 0;
                const pendingApprovalCount = item.filesForApproval?.filter(f => f.status === 'Pending').length || 0;

                const filesHTML = `
                    <div style="display: flex; flex-direction: column; gap: 5px; min-width: 180px;">
                        <div class="file-count-row">
                            <i class="fas fa-ticket-alt" style="color: #17a2b8;"></i>
                            <span style="margin-left: 8px; font-size: 12px;">Tickets: ${ticketRefCount}</span>
                        </div>
                        <div class="file-count-row">
                            <i class="fas fa-file-signature" style="color: ${pendingApprovalCount > 0 ? '#ffc107' : '#28a745'}"></i>
                            <span style="margin-left: 8px; font-size: 12px;">Approval: ${approvalFileCount} (${pendingApprovalCount} pending)</span>
                        </div>
                        <div style="margin-top: 8px;">
                            <button class="project-btn project-btn-sm project-btn-info" onclick="projectTab.viewRecord(${startIndex + index})" title="View Files">
                                <i class="fas fa-eye"></i> View Files
                            </button>
                        </div>
                    </div>
                `;

                tableHTML += `
                    <tr class="${highlightClass}">
                        <td>
                            <button class="project-btn project-btn-sm project-btn-info" 
                                    onclick="projectTab.viewRecord(${startIndex + index})"
                                    title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                        <td>${filesHTML}</td>
                        <td>${item.siteCategory}</td>
                        <td>${item.customerName}</td>
                        <td>${item.partnerName}</td>
                        <td>${item.country}</td>
                        <td>${item.state}</td>
                        <td>${item.city}</td>
                        <td>${item.siteAddress}</td>
                        <td>${item.zipCode}</td>
                        <td>${item.poNumber}</td>
                        <td>${this.highlightSearch(item.technicianName)}</td>
                        <td>
                            <span class="project-status-indicator ${this.getBandClass(item.band)}">
                                ${item.band}
                            </span>
                        </td>
                        <td>${item.variant}</td>
                        <td>${item.workingDays}</td>
                        <td>${item.workedDays}</td>
                        <td>${this.formatCurrency(item.monthlyRate, item.currency)}</td>
                        <td>${this.formatCurrency(item.dailyRate, item.currency)}</td>
                        <td>${this.formatCurrency(item.actualCost, item.currency)}</td>
                        <td>${item.currency}</td>
                        <td>${item.otHours}</td>
                        <td>${this.formatCurrency(item.otPerHourRate, item.currency)}</td>
                        <td>${this.formatCurrency(item.otHoursCost, item.currency)}</td>
                        <td>${item.weekendOtHours}</td>
                        <td>${this.formatCurrency(item.weekendRate, item.currency)}</td>
                        <td>${this.formatCurrency(item.weekendCost, item.currency)}</td>
                        <td>${this.formatCurrency(item.travelExtraCost, item.currency)}</td>
                        <td>${item.taxPercent}%</td>
                        <td>${this.formatCurrency(item.taxCost, item.currency)}</td>
                        <td>${this.formatCurrency(item.totalCost, item.currency)}</td>
                        <td>${item.slaPercent}%</td>
                        <td>
                            <span class="project-status-indicator ${item.slaMet === 'Yes' ? 'success' : 'warning'}">
                                ${item.slaMet}
                            </span>
                        </td>
                        <td>${item.slaReason || '-'}</td>
                        <td>${item.attendanceApproved}</td>
                        <td>${item.serviceMonth}</td>
                        <td>${item.remarks || '-'}</td>
                    </tr>
                `;
            });

            this.tableBody.innerHTML = tableHTML || '<tr><td colspan="36" style="text-align: center;">No data found</td></tr>';
        }

        formatCurrency(value, currency) {
            const num = parseFloat(value);
            if (isNaN(num)) return '-';

            if (currency === 'ZAR') {
                return 'R' + new Intl.NumberFormat('en-ZA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(num);
            }

            if (currency === 'GBP') {
                return '£' + new Intl.NumberFormat('en-GB', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(num);
            }

            if (currency === 'EUR') {
                return '€' + new Intl.NumberFormat('en-DE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(num);
            }

            return currency + ' ' + new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(num);
        }

        getBandClass(band) {
            switch (band) {
                case 'Band 1': return 'project-status-indicator success';
                case 'Band 2': return 'project-status-indicator warning';
                case 'Band 3': return 'project-status-indicator info';
                default: return '';
            }
        }

        highlightSearch(text) {
            if (!this.filters.search) return text;

            const regex = new RegExp(`(${this.filters.search})`, 'gi');
            return text.replace(regex, '<span class="project-search-highlight">$1</span>');
        }

        updatePagination() {
            this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);

            // Update pagination info
            const startIndex = (this.currentPage - 1) * this.pageSize + 1;
            const endIndex = Math.min(startIndex + this.pageSize - 1, this.filteredData.length);
            const totalItems = this.filteredData.length;

            this.paginationInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${totalItems} entries`;

            // Update page numbers
            let pageNumbersHTML = '';
            const maxPagesToShow = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbersHTML += `
                    <button class="project-page-number ${i === this.currentPage ? 'active' : ''}"
                            onclick="projectTab.goToPage(${i})">
                        ${i}
                    </button>
                `;
            }

            this.pageNumbers.innerHTML = pageNumbersHTML;

            // Update button states
            this.firstPageBtn.disabled = this.currentPage === 1;
            this.prevPageBtn.disabled = this.currentPage === 1;
            this.nextPageBtn.disabled = this.currentPage === this.totalPages;
            this.lastPageBtn.disabled = this.currentPage === this.totalPages;
        }

        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;

            this.currentPage = page;
            this.renderTableView();
            this.updatePagination();

            // Scroll to top of table
            this.tableBody.parentElement.parentElement.scrollIntoView({ behavior: 'smooth' });
        }

        viewRecord(index) {
            this.switchView('form');
            this.currentRecordIndex = parseInt(index);
            this.renderFormView();
            this.updateFormNavigation();
        }

        // Only showing the modified renderFormView method in the ProjectTab class
        // Replace the existing renderFormView method with this one:

        renderFormView() {
            if (this.filteredData.length === 0) {
                this.formPageContainer.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #6c757d;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>No records found</h3>
                <p>Try adjusting your filters to see more results.</p>
            </div>
        `;
                return;
            }

            const record = this.filteredData[this.currentRecordIndex];

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
                        <button class="project-btn project-btn-sm project-btn-info" onclick="projectTab.previewFile('${file.name}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="project-btn project-btn-sm project-btn-primary" onclick="projectTab.downloadFile('${file.name}')">
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
                        <button class="project-btn project-btn-sm project-btn-info" onclick="projectTab.previewFile('${file.name}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${file.status === 'Pending' ? `
                        <button class="project-btn project-btn-sm project-btn-success" onclick="projectTab.approveFile('${file.name}', ${record.id})">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="project-btn project-btn-sm project-btn-danger" onclick="projectTab.rejectFile('${file.name}', ${record.id})">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        ` : `
                        <button class="project-btn project-btn-sm project-btn-primary" onclick="projectTab.downloadFile('${file.name}')">
                            <i class="fas fa-download"></i>
                        </button>
                        `}
                    </div>
                </div>
            `;
                }).join('')
                : '<div class="no-files">No files pending approval</div>';

            const formHTML = `
        <div class="project-form-header">
            <h2 class="project-form-title">${record.customerName} - ${record.projectName}</h2>
            <div class="project-form-subtitle">
                <span><i class="fas fa-user"></i> ${record.technicianName}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${record.city}, ${record.country}</span>
                <span><i class="fas fa-calendar-alt"></i> ${record.serviceMonth}</span>
                <span class="project-status-indicator ${record.slaMet === 'Yes' ? 'success' : 'warning'}">
                    <i class="fas fa-chart-line"></i> SLA: ${record.slaPercent}% (${record.slaMet})
                </span>
            </div>
        </div>
        
        <div class="project-form-grid">
            <!-- Project Details Section -->
            <div class="project-form-section">
                <h3 class="project-section-title">
                    <i class="fas fa-info-circle"></i> Project Details
                </h3>
                <div class="project-form-row">
                    <div class="project-form-group">
                        <label class="project-form-label">Site Category</label>
                        <div class="project-form-value">${record.siteCategory}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Customer Name</label>
                        <div class="project-form-value">${record.customerName}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Partner Name</label>
                        <div class="project-form-value">${record.partnerName}</div>
                    </div>
                </div>
                <div class="project-form-row">
                    <div class="project-form-group">
                        <label class="project-form-label">Project Name</label>
                        <div class="project-form-value">${record.projectName}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Project Dates</label>
                        <div class="project-form-value">${record.projectStartDate} to ${record.projectEndDate}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Service Month</label>
                        <div class="project-form-value">${record.serviceMonth}</div>
                    </div>
                </div>
            </div>
            
            <!-- Location Details Section -->
            <div class="project-form-section">
                <h3 class="project-section-title">
                    <i class="fas fa-map-marked-alt"></i> Location Details
                </h3>
                <div class="project-form-row">
                    <div class="project-form-group">
                        <label class="project-form-label">Country</label>
                        <div class="project-form-value">${record.country}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">State/Region</label>
                        <div class="project-form-value">${record.state}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">City</label>
                        <div class="project-form-value">${record.city}</div>
                    </div>
                </div>
                <div class="project-form-row">
                    <div class="project-form-group">
                        <label class="project-form-label">Site Address</label>
                        <div class="project-form-value">${record.siteAddress}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Zip/Postal Code</label>
                        <div class="project-form-value">${record.zipCode}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">PO Number</label>
                        <div class="project-form-value">${record.poNumber}</div>
                    </div>
                </div>
            </div>
            
            <!-- Resource Details Section -->
            <div class="project-form-section">
                <h3 class="project-section-title">
                    <i class="fas fa-users"></i> Resource Details
                </h3>
                <div class="project-form-row">
                    <div class="project-form-group">
                        <label class="project-form-label">Technician Name</label>
                        <div class="project-form-value highlight">${record.technicianName}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Band</label>
                        <div class="project-form-value">
                            <span class="project-status-indicator ${this.getBandClass(record.band)}">
                                ${record.band}
                            </span>
                        </div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Variant</label>
                        <div class="project-form-value">${record.variant}</div>
                    </div>
                </div>
                <div class="project-form-row">
                    <div class="project-form-group">
                        <label class="project-form-label">Working Days</label>
                        <div class="project-form-value">${record.workingDays}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Worked Days</label>
                        <div class="project-form-value">${record.workedDays}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Attendance Approved</label>
                        <div class="project-form-value">
                            <span class="project-status-indicator ${record.attendanceApproved === 'Yes' ? 'success' : 'warning'}">
                                ${record.attendanceApproved}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Cost Summary Section -->
            <div class="project-form-section">
                <h3 class="project-section-title">
                    <i class="fas fa-calculator"></i> Cost Summary
                </h3>
                <div class="project-form-row">
                    <div class="project-form-group">
                        <label class="project-form-label">Currency</label>
                        <div class="project-form-value">${record.currency}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Monthly Rate</label>
                        <div class="project-form-value">${this.formatCurrency(record.monthlyRate, record.currency)}</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">Daily Rate</label>
                        <div class="project-form-value">${this.formatCurrency(record.dailyRate, record.currency)}</div>
                    </div>
                </div>
                
                <div class="project-cost-summary">
                    <div class="project-cost-item">
                        <span class="project-cost-label">Base Cost:</span>
                        <span class="project-cost-value">${this.formatCurrency(record.actualCost, record.currency)}</span>
                    </div>
                    <div class="project-cost-item">
                        <span class="project-cost-label">OT Hours (${record.otHours} hrs @ ${this.formatCurrency(record.otPerHourRate, record.currency)}/hr):</span>
                        <span class="project-cost-value">${this.formatCurrency(record.otHoursCost, record.currency)}</span>
                    </div>
                    <div class="project-cost-item">
                        <span class="project-cost-label">Weekend OT (${record.weekendOtHours} hrs @ ${this.formatCurrency(record.weekendRate, record.currency)}/hr):</span>
                        <span class="project-cost-value">${this.formatCurrency(record.weekendCost, record.currency)}</span>
                    </div>
                    <div class="project-cost-item">
                        <span class="project-cost-label">Travel/Extra Cost:</span>
                        <span class="project-cost-value">${this.formatCurrency(record.travelExtraCost, record.currency)}</span>
                    </div>
                    <div class="project-cost-item">
                        <span class="project-cost-label">Tax (${record.taxPercent}%):</span>
                        <span class="project-cost-value">${this.formatCurrency(record.taxCost, record.currency)}</span>
                    </div>
                    <div class="project-cost-item">
                        <span class="project-cost-label">Total Cost:</span>
                        <span class="project-cost-value highlight">${this.formatCurrency(record.totalCost, record.currency)}</span>
                    </div>
                </div>
            </div>
            
            <!-- SLA Details Section -->
            <div class="project-form-section">
                <h3 class="project-section-title">
                    <i class="fas fa-chart-line"></i> SLA Details
                </h3>
                <div class="project-form-row">
                    <div class="project-form-group">
                        <label class="project-form-label">SLA Percentage</label>
                        <div class="project-form-value">${record.slaPercent}%</div>
                    </div>
                    <div class="project-form-group">
                        <label class="project-form-label">SLA Met</label>
                        <div class="project-form-value">
                            <span class="project-status-indicator ${record.slaMet === 'Yes' ? 'success' : 'warning'}">
                                ${record.slaMet}
                            </span>
                        </div>
                    </div>
                </div>
                ${record.slaReason ? `
                <div class="project-form-row">
                    <div class="project-form-group" style="flex: 2;">
                        <label class="project-form-label">Reason for SLA Not Met</label>
                        <div class="project-form-value">${record.slaReason}</div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <!-- Remarks Section -->
            ${record.remarks ? `
            <div class="project-form-section">
                <h3 class="project-section-title">
                    <i class="fas fa-sticky-note"></i> Remarks
                </h3>
                <div class="project-form-row">
                    <div class="project-form-group" style="flex: 2;">
                        <div class="project-form-value">${record.remarks}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- File Attachments Section - MOVED TO BOTTOM -->
            <div class="file-category-section ticket-reference">
                <div class="file-category-header">
                    <div class="category-title">
                        <i class="fas fa-ticket-alt"></i> Ticket References
                        <span class="category-count">${record.ticketReferences ? record.ticketReferences.length : 0}</span>
                    </div>
                    <button class="project-btn project-btn-sm project-btn-info" onclick="projectTab.uploadTicketReference(${record.id})">
                        <i class="fas fa-plus"></i> Add Ticket
                    </button>
                </div>
                <div class="file-attachments-grid">
                    ${ticketReferencesHTML}
                </div>
            </div>
            
            <div class="file-category-section approval-file">
                <div class="file-category-header">
                    <div class="category-title">
                        <i class="fas fa-file-signature"></i> Files for Approval
                        <span class="category-count">${record.filesForApproval ? record.filesForApproval.length : 0}</span>
                    </div>
                    <button class="project-btn project-btn-sm project-btn-success" onclick="projectTab.uploadApprovalFile(${record.id})">
                        <i class="fas fa-upload"></i> Upload for Approval
                    </button>
                </div>
                <div class="file-attachments-grid">
                    ${filesForApprovalHTML}
                </div>
            </div>
        </div>
    `;

            this.formPageContainer.innerHTML = formHTML;
        }

        updateFormNavigation() {
            const totalRecords = this.filteredData.length;
            const currentRecord = this.currentRecordIndex + 1;

            if (totalRecords === 0) {
                this.formCurrentRecord.textContent = 'No records';
                this.formRecordDetails.textContent = '';
                return;
            }

            const record = this.filteredData[this.currentRecordIndex];
            this.formCurrentRecord.textContent = `Record ${currentRecord} of ${totalRecords}`;
            this.formRecordDetails.textContent = `${record.customerName} - ${record.technicianName} (${record.country})`;

            // Update form record select
            let optionsHTML = '';
            this.filteredData.forEach((item, index) => {
                optionsHTML += `<option value="${index}" ${index === this.currentRecordIndex ? 'selected' : ''}>
                    ${item.customerName} - ${item.technicianName} (${item.country})
                </option>`;
            });

            this.formRecordSelect.innerHTML = optionsHTML;

            // Update button states
            this.formFirstRecord.disabled = this.currentRecordIndex === 0;
            this.formPrevRecord.disabled = this.currentRecordIndex === 0;
            this.formNextRecord.disabled = this.currentRecordIndex === totalRecords - 1;
            this.formLastRecord.disabled = this.currentRecordIndex === totalRecords - 1;
        }

        navigateToRecord(index) {
            const totalRecords = this.filteredData.length;
            if (totalRecords === 0) return;

            let newIndex = parseInt(index);
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= totalRecords) newIndex = totalRecords - 1;

            this.currentRecordIndex = newIndex;
            this.renderFormView();
            this.updateFormNavigation();
        }

        // File handling methods
        approveFile(filename, recordId) {
            const record = this.data.find(item => item.id === recordId);
            if (!record) return;

            const file = record.filesForApproval?.find(f => f.name === filename);
            if (file) {
                if (confirm(`Approve file: ${filename}?`)) {
                    file.status = 'Approved';
                    file.approvedDate = new Date().toISOString().split('T')[0];
                    alert(`File "${filename}" approved successfully!`);
                    this.renderFormView();
                }
            }
        }

        rejectFile(filename, recordId) {
            const record = this.data.find(item => item.id === recordId);
            if (!record) return;

            const file = record.filesForApproval?.find(f => f.name === filename);
            if (file) {
                const reason = prompt(`Enter rejection reason for: ${filename}`);
                if (reason !== null) {
                    file.status = 'Rejected';
                    file.rejectedDate = new Date().toISOString().split('T')[0];
                    file.rejectionReason = reason;
                    alert(`File "${filename}" rejected. Reason: ${reason}`);
                    this.renderFormView();
                }
            }
        }

        uploadTicketReference(recordId) {
            const record = this.data.find(item => item.id === recordId);
            if (!record) return;

            alert(`Upload ticket reference for: ${record.technicianName}\n\nThis would open a file upload dialog for ticket references.`);
            // In real implementation: open file upload, then add to record.ticketReferences
        }

        uploadApprovalFile(recordId) {
            const record = this.data.find(item => item.id === recordId);
            if (!record) return;

            alert(`Upload file for approval: ${record.technicianName}\n\nThis would open a file upload dialog for approval files.`);
            // In real implementation: open file upload, then add to record.filesForApproval
        }

        previewFile(filename) {
            alert(`Previewing file: ${filename}\n\nIn a real application, this would open a file preview.`);
        }

        downloadFile(filename) {
            alert(`Downloading file: ${filename}\n\nIn a real application, this would download the file.`);
        }

        printForm() {
            window.print();
        }

        exportForm() {
            const record = this.filteredData[this.currentRecordIndex];
            if (!record) return;

            const content = `
                Project Configuration Report
                ============================
                
                Customer: ${record.customerName}
                Project: ${record.projectName}
                Technician: ${record.technicianName}
                Location: ${record.city}, ${record.country}
                Service Month: ${record.serviceMonth}
                
                Total Cost: ${this.formatCurrency(record.totalCost, record.currency)}
                SLA: ${record.slaPercent}% (${record.slaMet})
                
                Generated on: ${new Date().toLocaleDateString()}
            `;

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Project-${record.customerName}-${record.technicianName}-${record.serviceMonth}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('Form exported successfully!');
        }
    }

    // Initialize the Project Tab
    window.projectTab = new ProjectTab();
});