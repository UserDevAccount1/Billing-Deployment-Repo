/**
 * RATE CARD ASSIGNMENT & VALIDATION LOCK
 * Step 2 JavaScript Functionality
 * Handles rate card assignment, validation, and ticket locking
 */

// ========================================
// STATE MANAGEMENT
// ========================================

const RATE_CARD_STATE = {
  tickets: [],
  rateCards: [],
  filteredTickets: [],
  currentView: 'table', // 'table' or 'form'
  currentFormIndex: 0,
  currentPage: 1,
  pageSize: 25,
  filters: {
    status: 'all',
    service: 'all',
    band: 'all',
    search: ''
  },
  selectedTickets: new Set(),
  currentTicketForAction: null
};

// ========================================
// SAMPLE DATA
// ========================================

const SAMPLE_RATE_CARDS = [
  {
    id: 'RC-HCL-SG-2025-DISP',
    customer: 'HCL',
    account: 'Singapore Office',
    region: 'APAC',
    country: 'Singapore',
    supplier: 'Excis',
    currency: 'SGD',
    serviceType: 'Dispatch',
    bandLevel: 'Band 2',
    baseRate: 120,
    afterHoursMultiplier: 1.5,
    weekendMultiplier: 2.0,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    version: 'v2.1',
    status: 'Active'
  },
  {
    id: 'RC-HCL-SG-2025-DED',
    customer: 'HCL',
    account: 'Singapore Office',
    region: 'APAC',
    country: 'Singapore',
    supplier: 'Excis',
    currency: 'SGD',
    serviceType: 'Dedicated',
    bandLevel: 'Band 3',
    baseRate: 4200,
    afterHoursMultiplier: 1.0,
    weekendMultiplier: 1.0,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    version: 'v1.5',
    status: 'Active'
  },
  {
    id: 'RC-HCL-SG-2025-SV',
    customer: 'HCL',
    account: 'Singapore Office',
    region: 'APAC',
    country: 'Singapore',
    supplier: 'Excis',
    currency: 'SGD',
    serviceType: 'SV Visit',
    bandLevel: 'Band 1',
    baseRate: 650,
    afterHoursMultiplier: 1.3,
    weekendMultiplier: 1.5,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    version: 'v1.0',
    status: 'Active'
  },
  {
    id: 'RC-HCL-SG-2025-PROJ',
    customer: 'HCL',
    account: 'Singapore Office',
    region: 'APAC',
    country: 'Singapore',
    supplier: 'Excis',
    currency: 'SGD',
    serviceType: 'Project',
    bandLevel: 'Band 2',
    baseRate: 5000,
    afterHoursMultiplier: 1.0,
    weekendMultiplier: 1.0,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    version: 'v1.0',
    status: 'Active'
  }
];

// Load tickets from Validation Results (Step 1)
function loadTicketsFromStep1() {
  // Try to get data from DATA_STORE or SAMPLE_DATA_HCL
  if (typeof DATA_STORE !== 'undefined' && DATA_STORE.final_ticket && DATA_STORE.final_ticket.length > 0) {
    return DATA_STORE.final_ticket.map((ticket, index) => convertTicketForRateCard(ticket, index));
  } else if (typeof SAMPLE_DATA_HCL !== 'undefined' && SAMPLE_DATA_HCL.final_ticket && SAMPLE_DATA_HCL.final_ticket.length > 0) {
    return SAMPLE_DATA_HCL.final_ticket.map((ticket, index) => convertTicketForRateCard(ticket, index));
  }
  
  // Fallback sample data
  return generateSampleTickets();
}

function convertTicketForRateCard(ticket, index) {
  return {
    finalTicketId: ticket['Final Ticket ID'] || `FT-2025-${String(index + 1).padStart(3, '0')}`,
    originalTicketId: ticket['Request ID'] || ticket['Ticket ID'] || `TKT-2025-${String(index + 1).padStart(3, '0')}`,
    customer: ticket['Customer'] || 'HCL',
    account: ticket['Account'] || 'Singapore Office',
    serviceType: ticket['Service Type'] || ticket['Worklog Type'] || 'Dispatch',
    bandLevel: ticket['Band Type'] || 'Band 2',
    sla: ticket['SLA / Duration'] || '4 Hours',
    validationDate: ticket['Validation Date'] || new Date().toISOString().split('T')[0],
    rateCardAssigned: ticket['Rate Card Assigned'] || null,
    rateCardVersion: ticket['Rate Card Version'] || null,
    assignmentDate: ticket['Rate Card Assignment Date'] || null,
    assignedBy: ticket['Assigned By'] || null,
    status: ticket['Rate Card Status'] || 'PENDING',
    isLocked: ticket['Is Locked'] || false,
    rawData: ticket
  };
}

function generateSampleTickets() {
  const services = ['Dispatch', 'Dedicated', 'SV Visit', 'Project'];
  const bands = ['Band 1', 'Band 2', 'Band 3', 'Band 4'];
  const statuses = ['ASSIGNED', 'PENDING', 'MISSING', 'CONFLICT'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const service = services[i % services.length];
    const band = bands[i % bands.length];
    const status = i < 30 ? 'ASSIGNED' : statuses[(i - 30) % statuses.length];
    
    let rateCard = null;
    let version = null;
    let assignedBy = null;
    let assignmentDate = null;
    
    if (status === 'ASSIGNED') {
      const matchingCard = SAMPLE_RATE_CARDS.find(rc => 
        rc.serviceType === service && rc.bandLevel === band
      );
      if (matchingCard) {
        rateCard = matchingCard.id;
        version = matchingCard.version;
        assignedBy = i % 2 === 0 ? 'System (Auto)' : 'admin@excis.com';
        assignmentDate = new Date(2025, 11, 20 + (i % 5)).toISOString();
      }
    }
    
    return {
      finalTicketId: `FT-2025-${String(i + 1).padStart(3, '0')}`,
      originalTicketId: `TKT-2025-${String(i + 1).padStart(3, '0')}`,
      customer: 'HCL',
      account: 'Singapore Office',
      serviceType: service,
      bandLevel: band,
      sla: service === 'Dedicated' ? '1 Month' : '4 Hours',
      validationDate: new Date(2025, 11, 15 + (i % 10)).toISOString().split('T')[0],
      rateCardAssigned: rateCard,
      rateCardVersion: version,
      assignmentDate: assignmentDate,
      assignedBy: assignedBy,
      status: status,
      isLocked: status === 'ASSIGNED'
    };
  });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('Rate Card Assignment System Initializing...');
  
  // Load data
  RATE_CARD_STATE.tickets = loadTicketsFromStep1();
  RATE_CARD_STATE.rateCards = SAMPLE_RATE_CARDS;
  RATE_CARD_STATE.filteredTickets = [...RATE_CARD_STATE.tickets];
  
  // Initialize UI
  updateStatistics();
  renderTableView();
  setupEventListeners();
  
  console.log(`Loaded ${RATE_CARD_STATE.tickets.length} tickets and ${RATE_CARD_STATE.rateCards.length} rate cards`);
});

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Action buttons
  document.getElementById('auto-assign-all')?.addEventListener('click', autoAssignAll);
  document.getElementById('refresh-data')?.addEventListener('click', refreshData);
  document.getElementById('rate-card-library')?.addEventListener('click', openRateCardLibrary);
  document.getElementById('toggle-view')?.addEventListener('click', toggleView);
  document.getElementById('export-data')?.addEventListener('click', exportData);
  
  // Search and filters
  document.getElementById('search-input')?.addEventListener('input', handleSearch);
  document.getElementById('status-filter')?.addEventListener('change', handleFilter);
  document.getElementById('service-filter')?.addEventListener('change', handleFilter);
  document.getElementById('band-filter')?.addEventListener('change', handleFilter);
  
  // Pagination
  document.getElementById('first-page')?.addEventListener('click', () => goToPage(1));
  document.getElementById('prev-page')?.addEventListener('click', () => goToPage(RATE_CARD_STATE.currentPage - 1));
  document.getElementById('next-page')?.addEventListener('click', () => goToPage(RATE_CARD_STATE.currentPage + 1));
  document.getElementById('last-page')?.addEventListener('click', () => goToPage(getTotalPages()));
  document.getElementById('page-size')?.addEventListener('change', handlePageSizeChange);
  
  // Select all checkbox
  document.getElementById('select-all')?.addEventListener('change', handleSelectAll);
  
  // Form navigation
  document.getElementById('form-prev')?.addEventListener('click', () => navigateForm(-1));
  document.getElementById('form-next')?.addEventListener('click', () => navigateForm(1));
  
  // Modal close buttons
  document.getElementById('close-library-modal')?.addEventListener('click', () => closeModal('rate-card-library-modal'));
  document.getElementById('close-assignment-modal')?.addEventListener('click', () => closeModal('manual-assignment-modal'));
  document.getElementById('close-unlock-modal')?.addEventListener('click', () => closeModal('unlock-modal'));
  document.getElementById('close-details-modal')?.addEventListener('click', () => closeModal('rate-card-details-modal'));
  document.getElementById('close-import-modal')?.addEventListener('click', () => closeModal('import-modal'));
  
  // Modal actions
  document.getElementById('cancel-assignment')?.addEventListener('click', () => closeModal('manual-assignment-modal'));
  document.getElementById('confirm-assignment')?.addEventListener('click', confirmManualAssignment);
  document.getElementById('cancel-unlock')?.addEventListener('click', () => closeModal('unlock-modal'));
  document.getElementById('confirm-unlock')?.addEventListener('click', confirmUnlock);
  
  // Rate card library actions
  document.getElementById('add-rate-card')?.addEventListener('click', addNewRateCard);
  document.getElementById('import-rate-card')?.addEventListener('click', () => openModal('import-modal'));
  document.getElementById('export-library')?.addEventListener('click', exportRateCardLibrary);
  document.getElementById('library-search-input')?.addEventListener('input', handleLibrarySearch);
  
  // Import actions
  document.getElementById('browse-file')?.addEventListener('click', () => document.getElementById('file-input')?.click());
  document.getElementById('file-input')?.addEventListener('change', handleFileSelect);
  document.getElementById('remove-file')?.addEventListener('click', removeFile);
  document.getElementById('cancel-import')?.addEventListener('click', () => closeModal('import-modal'));
  document.getElementById('confirm-import')?.addEventListener('click', confirmImport);
  
  // Rate card selection preview
  document.getElementById('rate-card-select')?.addEventListener('change', previewRateCard);
  
  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal(this.id);
      }
    });
  });
}

// ========================================
// STATISTICS
// ========================================

function updateStatistics() {
  const total = RATE_CARD_STATE.tickets.length;
  const assigned = RATE_CARD_STATE.tickets.filter(t => t.status === 'ASSIGNED').length;
  const pending = RATE_CARD_STATE.tickets.filter(t => t.status === 'PENDING').length;
  const missing = RATE_CARD_STATE.tickets.filter(t => t.status === 'MISSING').length;
  
  document.getElementById('total-tickets').textContent = total;
  document.getElementById('assigned-tickets').textContent = assigned;
  document.getElementById('pending-tickets').textContent = pending;
  document.getElementById('missing-tickets').textContent = missing;
}

// ========================================
// TABLE VIEW
// ========================================

function renderTableView() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;
  
  const startIndex = (RATE_CARD_STATE.currentPage - 1) * RATE_CARD_STATE.pageSize;
  const endIndex = startIndex + RATE_CARD_STATE.pageSize;
  const pageTickets = RATE_CARD_STATE.filteredTickets.slice(startIndex, endIndex);
  
  tbody.innerHTML = pageTickets.map(ticket => `
    <tr>
      <td><input type="checkbox" class="ticket-checkbox" data-ticket-id="${ticket.finalTicketId}" ${RATE_CARD_STATE.selectedTickets.has(ticket.finalTicketId) ? 'checked' : ''}></td>
      <td><strong>${ticket.finalTicketId}</strong></td>
      <td>${ticket.customer}</td>
      <td>${ticket.account}</td>
      <td>${ticket.serviceType}</td>
      <td><span class="status-badge">${ticket.bandLevel}</span></td>
      <td>${ticket.rateCardAssigned || '<span style="color: #9ca3af;">Not Assigned</span>'}</td>
      <td>${ticket.rateCardVersion || '-'}</td>
      <td>${ticket.assignedBy || '-'}</td>
      <td>${getStatusBadge(ticket.status)}</td>
      <td>
        <div class="action-buttons">
          ${ticket.status !== 'ASSIGNED' ? `
            <button class="btn-icon assign" onclick="openManualAssignment('${ticket.finalTicketId}')" title="Assign Rate Card">
              <i class="fas fa-link"></i> Assign
            </button>
          ` : ''}
          ${ticket.rateCardAssigned ? `
            <button class="btn-icon view" onclick="viewRateCardDetails('${ticket.rateCardAssigned}')" title="View Rate Card">
              <i class="fas fa-eye"></i> View
            </button>
          ` : ''}
          ${ticket.isLocked ? `
            <button class="btn-icon unlock" onclick="openUnlockModal('${ticket.finalTicketId}')" title="Unlock Ticket">
              <i class="fas fa-lock"></i> Unlock
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
  
  // Add event listeners to checkboxes
  tbody.querySelectorAll('.ticket-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleTicketSelect);
  });
  
  updatePagination();
}

function getStatusBadge(status) {
  const badges = {
    'ASSIGNED': '<span class="status-badge assigned">✅ Assigned</span>',
    'PENDING': '<span class="status-badge pending">⚠️ Pending</span>',
    'MISSING': '<span class="status-badge missing">❌ Missing</span>',
    'CONFLICT': '<span class="status-badge conflict">⚠️ Conflict</span>',
    'READY FOR PRICING': '<span class="status-badge locked">🔒 Ready for Pricing</span>'
  };
  return badges[status] || status;
}

// ========================================
// FORM VIEW
// ========================================

function renderFormView() {
  const formContainer = document.getElementById('ticket-form');
  if (!formContainer || RATE_CARD_STATE.filteredTickets.length === 0) return;
  
  const ticket = RATE_CARD_STATE.filteredTickets[RATE_CARD_STATE.currentFormIndex];
  
  formContainer.innerHTML = `
    <div class="form-section">
      <h3>📋 Ticket Information</h3>
      <div class="form-grid">
        <div class="form-field">
          <label>Final Ticket ID</label>
          <div class="field-value locked">${ticket.finalTicketId}</div>
        </div>
        <div class="form-field">
          <label>Original Ticket ID</label>
          <div class="field-value">${ticket.originalTicketId}</div>
        </div>
        <div class="form-field">
          <label>Customer</label>
          <div class="field-value">${ticket.customer}</div>
        </div>
        <div class="form-field">
          <label>Account</label>
          <div class="field-value">${ticket.account}</div>
        </div>
        <div class="form-field">
          <label>Service Type</label>
          <div class="field-value">${ticket.serviceType}</div>
        </div>
        <div class="form-field">
          <label>Band Level</label>
          <div class="field-value">${ticket.bandLevel}</div>
        </div>
        <div class="form-field">
          <label>SLA / Duration</label>
          <div class="field-value">${ticket.sla}</div>
        </div>
        <div class="form-field">
          <label>Validation Date</label>
          <div class="field-value">${ticket.validationDate}</div>
        </div>
      </div>
    </div>
    
    <div class="form-section">
      <h3>💳 Rate Card Assignment</h3>
      <div class="form-grid">
        <div class="form-field">
          <label>Rate Card Assigned</label>
          <div class="field-value ${ticket.rateCardAssigned ? 'locked' : ''}">${ticket.rateCardAssigned || 'Not Assigned'}</div>
        </div>
        <div class="form-field">
          <label>Rate Card Version</label>
          <div class="field-value">${ticket.rateCardVersion || '-'}</div>
        </div>
        <div class="form-field">
          <label>Assignment Date</label>
          <div class="field-value">${ticket.assignmentDate ? new Date(ticket.assignmentDate).toLocaleString() : '-'}</div>
        </div>
        <div class="form-field">
          <label>Assigned By</label>
          <div class="field-value">${ticket.assignedBy || '-'}</div>
        </div>
        <div class="form-field">
          <label>Status</label>
          <div class="field-value">${getStatusBadge(ticket.status)}</div>
        </div>
        <div class="form-field">
          <label>Lock Status</label>
          <div class="field-value">${ticket.isLocked ? '🔒 Locked' : '🔓 Unlocked'}</div>
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      ${ticket.status !== 'ASSIGNED' ? `
        <button class="btn btn-primary" onclick="openManualAssignment('${ticket.finalTicketId}')">
          <i class="fas fa-link"></i> Assign Rate Card
        </button>
      ` : ''}
      ${ticket.rateCardAssigned ? `
        <button class="btn btn-secondary" onclick="viewRateCardDetails('${ticket.rateCardAssigned}')">
          <i class="fas fa-eye"></i> View Rate Card Details
        </button>
      ` : ''}
      ${ticket.isLocked ? `
        <button class="btn btn-warning" onclick="openUnlockModal('${ticket.finalTicketId}')">
          <i class="fas fa-unlock"></i> Unlock Ticket
        </button>
      ` : ''}
    </div>
  `;
  
  updateFormNavigation();
}

function updateFormNavigation() {
  document.getElementById('current-form-index').textContent = RATE_CARD_STATE.currentFormIndex + 1;
  document.getElementById('total-form-count').textContent = RATE_CARD_STATE.filteredTickets.length;
  
  const prevBtn = document.getElementById('form-prev');
  const nextBtn = document.getElementById('form-next');
  
  if (prevBtn) prevBtn.disabled = RATE_CARD_STATE.currentFormIndex === 0;
  if (nextBtn) nextBtn.disabled = RATE_CARD_STATE.currentFormIndex === RATE_CARD_STATE.filteredTickets.length - 1;
}

function navigateForm(direction) {
  const newIndex = RATE_CARD_STATE.currentFormIndex + direction;
  if (newIndex >= 0 && newIndex < RATE_CARD_STATE.filteredTickets.length) {
    RATE_CARD_STATE.currentFormIndex = newIndex;
    renderFormView();
  }
}

// ========================================
// VIEW TOGGLE
// ========================================

function toggleView() {
  const tableView = document.getElementById('table-view');
  const formView = document.getElementById('form-view');
  const toggleBtn = document.getElementById('toggle-view');
  
  if (RATE_CARD_STATE.currentView === 'table') {
    RATE_CARD_STATE.currentView = 'form';
    tableView.style.display = 'none';
    formView.style.display = 'block';
    toggleBtn.innerHTML = '<i class="fas fa-table"></i> Switch to Table View';
    renderFormView();
  } else {
    RATE_CARD_STATE.currentView = 'table';
    tableView.style.display = 'block';
    formView.style.display = 'none';
    toggleBtn.innerHTML = '<i class="fas fa-th-list"></i> Switch to Form View';
  }
}

// ========================================
// SEARCH AND FILTER
// ========================================

function handleSearch(e) {
  RATE_CARD_STATE.filters.search = e.target.value.toLowerCase();
  applyFilters();
}

function handleFilter() {
  RATE_CARD_STATE.filters.status = document.getElementById('status-filter').value;
  RATE_CARD_STATE.filters.service = document.getElementById('service-filter').value;
  RATE_CARD_STATE.filters.band = document.getElementById('band-filter').value;
  applyFilters();
}

function applyFilters() {
  RATE_CARD_STATE.filteredTickets = RATE_CARD_STATE.tickets.filter(ticket => {
    // Status filter
    if (RATE_CARD_STATE.filters.status !== 'all' && ticket.status.toLowerCase() !== RATE_CARD_STATE.filters.status) {
      return false;
    }
    
    // Service filter
    if (RATE_CARD_STATE.filters.service !== 'all' && ticket.serviceType.toLowerCase() !== RATE_CARD_STATE.filters.service) {
      return false;
    }
    
    // Band filter
    if (RATE_CARD_STATE.filters.band !== 'all' && ticket.bandLevel !== RATE_CARD_STATE.filters.band) {
      return false;
    }
    
    // Search filter
    if (RATE_CARD_STATE.filters.search) {
      const searchStr = RATE_CARD_STATE.filters.search;
      return (
        ticket.finalTicketId.toLowerCase().includes(searchStr) ||
        ticket.originalTicketId.toLowerCase().includes(searchStr) ||
        ticket.customer.toLowerCase().includes(searchStr) ||
        ticket.account.toLowerCase().includes(searchStr) ||
        ticket.serviceType.toLowerCase().includes(searchStr) ||
        ticket.bandLevel.toLowerCase().includes(searchStr) ||
        (ticket.rateCardAssigned && ticket.rateCardAssigned.toLowerCase().includes(searchStr))
      );
    }
    
    return true;
  });
  
  RATE_CARD_STATE.currentPage = 1;
  RATE_CARD_STATE.currentFormIndex = 0;
  
  if (RATE_CARD_STATE.currentView === 'table') {
    renderTableView();
  } else {
    renderFormView();
  }
}

// ========================================
// PAGINATION
// ========================================

function getTotalPages() {
  return Math.ceil(RATE_CARD_STATE.filteredTickets.length / RATE_CARD_STATE.pageSize);
}

function goToPage(page) {
  const totalPages = getTotalPages();
  if (page >= 1 && page <= totalPages) {
    RATE_CARD_STATE.currentPage = page;
    renderTableView();
  }
}

function handlePageSizeChange(e) {
  RATE_CARD_STATE.pageSize = parseInt(e.target.value);
  RATE_CARD_STATE.currentPage = 1;
  renderTableView();
}

function updatePagination() {
  const totalPages = getTotalPages();
  const startIndex = (RATE_CARD_STATE.currentPage - 1) * RATE_CARD_STATE.pageSize;
  const endIndex = Math.min(startIndex + RATE_CARD_STATE.pageSize, RATE_CARD_STATE.filteredTickets.length);
  
  document.getElementById('showing-start').textContent = RATE_CARD_STATE.filteredTickets.length > 0 ? startIndex + 1 : 0;
  document.getElementById('showing-end').textContent = endIndex;
  document.getElementById('total-records').textContent = RATE_CARD_STATE.filteredTickets.length;
  
  // Update page buttons
  document.getElementById('first-page').disabled = RATE_CARD_STATE.currentPage === 1;
  document.getElementById('prev-page').disabled = RATE_CARD_STATE.currentPage === 1;
  document.getElementById('next-page').disabled = RATE_CARD_STATE.currentPage === totalPages;
  document.getElementById('last-page').disabled = RATE_CARD_STATE.currentPage === totalPages;
  
  // Render page numbers
  renderPageNumbers(totalPages);
}

function renderPageNumbers(totalPages) {
  const pageNumbersContainer = document.getElementById('page-numbers');
  if (!pageNumbersContainer) return;
  
  const maxVisible = 5;
  let startPage = Math.max(1, RATE_CARD_STATE.currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  let html = '';
  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="btn-page ${i === RATE_CARD_STATE.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  
  pageNumbersContainer.innerHTML = html;
}

// ========================================
// SELECTION
// ========================================

function handleSelectAll(e) {
  const checkboxes = document.querySelectorAll('.ticket-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = e.target.checked;
    const ticketId = checkbox.dataset.ticketId;
    if (e.target.checked) {
      RATE_CARD_STATE.selectedTickets.add(ticketId);
    } else {
      RATE_CARD_STATE.selectedTickets.delete(ticketId);
    }
  });
}

function handleTicketSelect(e) {
  const ticketId = e.target.dataset.ticketId;
  if (e.target.checked) {
    RATE_CARD_STATE.selectedTickets.add(ticketId);
  } else {
    RATE_CARD_STATE.selectedTickets.delete(ticketId);
  }
  
  // Update select all checkbox
  const selectAllCheckbox = document.getElementById('select-all');
  const allCheckboxes = document.querySelectorAll('.ticket-checkbox');
  const checkedCheckboxes = document.querySelectorAll('.ticket-checkbox:checked');
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = allCheckboxes.length === checkedCheckboxes.length;
  }
}

// ========================================
// AUTO ASSIGNMENT
// ========================================

function autoAssignAll() {
  let assignedCount = 0;
  let failedCount = 0;
  
  RATE_CARD_STATE.tickets.forEach(ticket => {
    if (ticket.status !== 'ASSIGNED') {
      const result = autoAssignRateCard(ticket);
      if (result.success) {
        assignedCount++;
      } else {
        failedCount++;
      }
    }
  });
  
  updateStatistics();
  renderTableView();
  
  showToast('success', `Auto-assignment complete: ${assignedCount} assigned, ${failedCount} failed`);
}

function autoAssignRateCard(ticket) {
  // Find matching rate cards
  const matches = RATE_CARD_STATE.rateCards.filter(rc => {
    return (
      rc.customer === ticket.customer &&
      rc.account === ticket.account &&
      rc.serviceType === ticket.serviceType &&
      rc.bandLevel === ticket.bandLevel &&
      rc.status === 'Active' &&
      new Date(rc.validFrom) <= new Date(ticket.validationDate) &&
      new Date(rc.validTo) >= new Date(ticket.validationDate)
    );
  });
  
  if (matches.length === 0) {
    ticket.status = 'MISSING';
    return { success: false, reason: 'No matching rate card found' };
  }
  
  if (matches.length > 1) {
    ticket.status = 'CONFLICT';
    return { success: false, reason: 'Multiple rate cards match' };
  }
  
  // Assign the rate card
  const rateCard = matches[0];
  ticket.rateCardAssigned = rateCard.id;
  ticket.rateCardVersion = rateCard.version;
  ticket.assignmentDate = new Date().toISOString();
  ticket.assignedBy = 'System (Auto)';
  ticket.status = 'ASSIGNED';
  ticket.isLocked = true;
  
  return { success: true, rateCard: rateCard };
}

// ========================================
// MANUAL ASSIGNMENT
// ========================================

function openManualAssignment(ticketId) {
  const ticket = RATE_CARD_STATE.tickets.find(t => t.finalTicketId === ticketId);
  if (!ticket) return;
  
  RATE_CARD_STATE.currentTicketForAction = ticket;
  
  // Populate ticket info
  document.getElementById('modal-ticket-id').textContent = ticket.finalTicketId;
  document.getElementById('modal-customer').textContent = ticket.customer;
  document.getElementById('modal-account').textContent = ticket.account;
  document.getElementById('modal-service').textContent = ticket.serviceType;
  document.getElementById('modal-band').textContent = ticket.bandLevel;
  
  // Populate rate card dropdown
  const select = document.getElementById('rate-card-select');
  const matchingCards = RATE_CARD_STATE.rateCards.filter(rc => 
    rc.customer === ticket.customer &&
    rc.account === ticket.account &&
    rc.status === 'Active'
  );
  
  select.innerHTML = '<option value="">-- Select Rate Card --</option>' +
    matchingCards.map(rc => `
      <option value="${rc.id}" ${rc.serviceType === ticket.serviceType && rc.bandLevel === ticket.bandLevel ? 'selected' : ''}>
        ${rc.id} - ${rc.serviceType} ${rc.bandLevel} (${rc.currency} ${rc.baseRate})
      </option>
    `).join('');
  
  openModal('manual-assignment-modal');
}

function previewRateCard() {
  const select = document.getElementById('rate-card-select');
  const preview = document.getElementById('rate-card-preview');
  
  if (!select.value) {
    preview.style.display = 'none';
    return;
  }
  
  const rateCard = RATE_CARD_STATE.rateCards.find(rc => rc.id === select.value);
  if (!rateCard) return;
  
  preview.innerHTML = `
    <h4 style="margin: 0 0 10px 0; color: #059669;">✓ Rate Card Preview</h4>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px;">
      <div><strong>Service Type:</strong> ${rateCard.serviceType}</div>
      <div><strong>Band Level:</strong> ${rateCard.bandLevel}</div>
      <div><strong>Base Rate:</strong> ${rateCard.currency} ${rateCard.baseRate}</div>
      <div><strong>Version:</strong> ${rateCard.version}</div>
      <div><strong>Valid Period:</strong> ${rateCard.validFrom} to ${rateCard.validTo}</div>
      <div><strong>Status:</strong> ${rateCard.status}</div>
    </div>
  `;
  preview.style.display = 'block';
}

function confirmManualAssignment() {
  const select = document.getElementById('rate-card-select');
  const reason = document.getElementById('assignment-reason-input').value.trim();
  
  if (!select.value) {
    showToast('error', 'Please select a rate card');
    return;
  }
  
  if (!reason) {
    showToast('error', 'Please provide a reason for manual assignment');
    return;
  }
  
  const rateCard = RATE_CARD_STATE.rateCards.find(rc => rc.id === select.value);
  const ticket = RATE_CARD_STATE.currentTicketForAction;
  
  ticket.rateCardAssigned = rateCard.id;
  ticket.rateCardVersion = rateCard.version;
  ticket.assignmentDate = new Date().toISOString();
  ticket.assignedBy = 'admin@excis.com';
  ticket.status = 'ASSIGNED';
  ticket.isLocked = true;
  ticket.assignmentReason = reason;
  
  updateStatistics();
  if (RATE_CARD_STATE.currentView === 'table') {
    renderTableView();
  } else {
    renderFormView();
  }
  
  closeModal('manual-assignment-modal');
  showToast('success', `Rate card ${rateCard.id} assigned to ${ticket.finalTicketId}`);
  
  // Clear form
  document.getElementById('assignment-reason-input').value = '';
}

// ========================================
// UNLOCK TICKET
// ========================================

function openUnlockModal(ticketId) {
  const ticket = RATE_CARD_STATE.tickets.find(t => t.finalTicketId === ticketId);
  if (!ticket) return;
  
  RATE_CARD_STATE.currentTicketForAction = ticket;
  document.getElementById('unlock-ticket-id').textContent = ticket.finalTicketId;
  document.getElementById('unlock-reason-input').value = '';
  
  openModal('unlock-modal');
}

function confirmUnlock() {
  const reason = document.getElementById('unlock-reason-input').value.trim();
  
  if (!reason) {
    showToast('error', 'Please provide a reason for unlocking this ticket');
    return;
  }
  
  const ticket = RATE_CARD_STATE.currentTicketForAction;
  ticket.isLocked = false;
  ticket.unlockReason = reason;
  ticket.unlockedBy = 'admin@excis.com';
  ticket.unlockTimestamp = new Date().toISOString();
  
  if (RATE_CARD_STATE.currentView === 'table') {
    renderTableView();
  } else {
    renderFormView();
  }
  
  closeModal('unlock-modal');
  showToast('warning', `Ticket ${ticket.finalTicketId} has been unlocked`);
}

// ========================================
// RATE CARD LIBRARY
// ========================================

function openRateCardLibrary() {
  renderRateCardLibrary();
  openModal('rate-card-library-modal');
}

function renderRateCardLibrary() {
  const tbody = document.getElementById('library-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = RATE_CARD_STATE.rateCards.map(rc => `
    <tr>
      <td><strong>${rc.id}</strong></td>
      <td>${rc.customer}</td>
      <td>${rc.account}</td>
      <td>${rc.serviceType}</td>
      <td>${rc.bandLevel}</td>
      <td>${rc.currency} ${rc.baseRate}</td>
      <td>${rc.currency}</td>
      <td>${rc.version}</td>
      <td>${rc.validFrom} to ${rc.validTo}</td>
      <td><span class="status-badge ${rc.status.toLowerCase()}">${rc.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon view" onclick="viewRateCardDetails('${rc.id}')" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon" onclick="editRateCard('${rc.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function handleLibrarySearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#library-table-body tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function viewRateCardDetails(rateCardId) {
  const rateCard = RATE_CARD_STATE.rateCards.find(rc => rc.id === rateCardId);
  if (!rateCard) return;
  
  const detailsBody = document.getElementById('rate-card-details-body');
  detailsBody.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
      <div class="form-field">
        <label>Rate Card ID</label>
        <div class="field-value">${rateCard.id}</div>
      </div>
      <div class="form-field">
        <label>Version</label>
        <div class="field-value">${rateCard.version}</div>
      </div>
      <div class="form-field">
        <label>Customer</label>
        <div class="field-value">${rateCard.customer}</div>
      </div>
      <div class="form-field">
        <label>Account</label>
        <div class="field-value">${rateCard.account}</div>
      </div>
      <div class="form-field">
        <label>Region</label>
        <div class="field-value">${rateCard.region}</div>
      </div>
      <div class="form-field">
        <label>Country</label>
        <div class="field-value">${rateCard.country}</div>
      </div>
      <div class="form-field">
        <label>Supplier</label>
        <div class="field-value">${rateCard.supplier}</div>
      </div>
      <div class="form-field">
        <label>Currency</label>
        <div class="field-value">${rateCard.currency}</div>
      </div>
      <div class="form-field">
        <label>Service Type</label>
        <div class="field-value">${rateCard.serviceType}</div>
      </div>
      <div class="form-field">
        <label>Band Level</label>
        <div class="field-value">${rateCard.bandLevel}</div>
      </div>
      <div class="form-field">
        <label>Base Rate</label>
        <div class="field-value">${rateCard.currency} ${rateCard.baseRate}</div>
      </div>
      <div class="form-field">
        <label>After Hours Multiplier</label>
        <div class="field-value">${rateCard.afterHoursMultiplier}x</div>
      </div>
      <div class="form-field">
        <label>Weekend Multiplier</label>
        <div class="field-value">${rateCard.weekendMultiplier}x</div>
      </div>
      <div class="form-field">
        <label>Valid From</label>
        <div class="field-value">${rateCard.validFrom}</div>
      </div>
      <div class="form-field">
        <label>Valid To</label>
        <div class="field-value">${rateCard.validTo}</div>
      </div>
      <div class="form-field">
        <label>Status</label>
        <div class="field-value">${rateCard.status}</div>
      </div>
    </div>
  `;
  
  openModal('rate-card-details-modal');
}

function addNewRateCard() {
  showToast('info', 'Add New Rate Card feature coming soon');
}

function editRateCard(rateCardId) {
  showToast('info', 'Edit Rate Card feature coming soon');
}

function exportRateCardLibrary() {
  showToast('info', 'Export Rate Card Library feature coming soon');
}

// ========================================
// IMPORT
// ========================================

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  document.getElementById('file-name').textContent = file.name;
  document.getElementById('file-info').style.display = 'flex';
  document.getElementById('upload-area').style.display = 'none';
  document.getElementById('confirm-import').disabled = false;
  
  // Preview would go here
  showToast('info', 'File selected. Click "Import Rate Cards" to proceed.');
}

function removeFile() {
  document.getElementById('file-input').value = '';
  document.getElementById('file-info').style.display = 'none';
  document.getElementById('upload-area').style.display = 'block';
  document.getElementById('confirm-import').disabled = true;
}

function confirmImport() {
  showToast('success', 'Rate cards imported successfully');
  closeModal('import-modal');
  removeFile();
}

// ========================================
// EXPORT
// ========================================

function exportData() {
  showToast('info', 'Export feature coming soon');
}

// ========================================
// REFRESH
// ========================================

function refreshData() {
  RATE_CARD_STATE.tickets = loadTicketsFromStep1();
  RATE_CARD_STATE.filteredTickets = [...RATE_CARD_STATE.tickets];
  RATE_CARD_STATE.currentPage = 1;
  RATE_CARD_STATE.currentFormIndex = 0;
  
  updateStatistics();
  if (RATE_CARD_STATE.currentView === 'table') {
    renderTableView();
  } else {
    renderFormView();
  }
  
  showToast('success', 'Data refreshed successfully');
}

// ========================================
// MODAL UTILITIES
// ========================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showToast(type, message) {
  const toast = document.getElementById('toast-notification');
  const icon = toast.querySelector('.toast-icon');
  const messageEl = toast.querySelector('.toast-message');
  
  // Set icon based on type
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  
  icon.className = `toast-icon ${icons[type]}`;
  messageEl.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ========================================
// GLOBAL FUNCTIONS (for onclick handlers)
// ========================================

window.openManualAssignment = openManualAssignment;
window.viewRateCardDetails = viewRateCardDetails;
window.openUnlockModal = openUnlockModal;
window.goToPage = goToPage;
window.editRateCard = editRateCard;

console.log('Rate Card Assignment System Loaded');