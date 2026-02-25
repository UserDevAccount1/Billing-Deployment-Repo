// // ════════════════════════════════════════════════════════════════════════════
// // VALIDATION RESULTS LOGIC
// // ════════════════════════════════════════════════════════════════════════════
// // Global Validation State;
// let validationResults = [];
// document.addEventListener('DOMContentLoaded', () => {
//     // Attach Event Listeners
//     const validateBtn = document.getElementById('validateFilesBtn');
//     if (validateBtn) {
//         validateBtn.addEventListener('click', runValidationProcess);
//     }

//     // Search Input Listener
//     const searchInput = document.getElementById('searchInput');
//     if (searchInput) {
//         searchInput.addEventListener('keyup', (e) => filterValidationResults(e.target.value));
//     }

//     // View Toggles
//     document.getElementById('tableViewBtn')?.addEventListener('click', () => toggleView('table'));
//     document.getElementById('formViewBtn')?.addEventListener('click', () => toggleView('card'));
// });

// /**
//  * Main Function: Triggers validation on loaded records
//  */
// function runValidationProcess() {
//     // Access global variable explicitly
//     const records = window.loadedImportRecords;

//     if (!records || records.length === 0) {
//         window.showToast("No records loaded to validate.", "error");
//         return;
//     }

//     window.showToast("Running validation rules...", "info");

//     // Process Records
//     validationResults = records.map((record, index) => validateSingleRecord(record, index));

//     // Update UI
//     updateValidationDashboard(validationResults);

//     window.showToast("Validation complete!", "success");
// }

// /**
//  * Validates a single row object against FIELD_DEFINITIONS
//  */
// function validateSingleRecord(rawRecord, index) {
//     const mappedRecord = mapRecordToSystemFields(rawRecord);
//     let messages = [];
//     let status = 'VALID'; // VALID, WARNING, ERROR

//     // Iterate through defined fields
//     Object.entries(FIELD_DEFINITIONS).forEach(([fieldKey, def]) => {
//         const value = mappedRecord[fieldKey];

//         // 1. Check Required
//         if (def.required) {
//             if (!value || String(value).trim() === '') {
//                 status = 'ERROR';
//                 messages.push(`Missing required field: ${def.label}`);
//             }
//         }

//         // 2. Check Data Types (Basic checks)
//         if (value && String(value).trim() !== '') {
//             if (def.type === 'NUMBER' || def.type === 'CURRENCY') {
//                 // Remove currency symbols and commas for check
//                 const cleanNum = String(value).replace(/[^0-9.-]+/g, "");
//                 if (isNaN(parseFloat(cleanNum))) {
//                     status = (status === 'ERROR') ? 'ERROR' : 'WARNING';
//                     messages.push(`Invalid format for ${def.label} (Expected Number)`);
//                 }
//             }

//             if (def.type === 'DATE') {
//                 // Simple Date Check
//                 const date = Date.parse(value);
//                 // Also check for Excel serial numbers (numbers > 20000)
//                 const isExcelSerial = !isNaN(value) && Number(value) > 20000;

//                 if (isNaN(date) && !isExcelSerial) {
//                     status = (status === 'ERROR') ? 'ERROR' : 'WARNING';
//                     messages.push(`Invalid Date format for ${def.label}`);
//                 }
//             }

//             if (fieldKey === 'contact_email' || mappedRecord['contact_email']) {
//                 // specific email check if value looks like email
//                 if (value.includes('@') && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
//                     messages.push(`Invalid Email format`);
//                 }
//             }
//         }
//     });

//     return {
//         id: index + 1,
//         original: rawRecord,
//         mapped: mappedRecord,
//         status: status,
//         messages: messages
//     };
// }


// /**
//  * Maps raw records to System Field IDs using FIELD_SYNONYMS.
//  * PRIORITY: 
//  * 1. Direct System Key (e.g., record['customer']) - From Manual Edits/Context
//  * 2. CSV Synonym (e.g., record['Customer Name']) - From File Upload
//  */
// function mapRecordToSystemFields(rawRecord) {
//     let mapped = {};

//     // Iterate over all defined system fields
//     for (const [systemKey, synonyms] of Object.entries(FIELD_SYNONYMS)) {

//         let foundValue = "";

//         // 1. CHECK FOR DIRECT SYSTEM KEY (Manual Edits / Context)
//         if (rawRecord.hasOwnProperty(systemKey) && rawRecord[systemKey] !== undefined && rawRecord[systemKey] !== "") {
//             mapped[systemKey] = rawRecord[systemKey];
//             continue; // We found the authoritative value, skip synonyms
//         }

//         // 2. CHECK SYNONYMS (Original CSV Data)
//         for (const synonym of synonyms) {
//             if (rawRecord.hasOwnProperty(synonym)) {
//                 const val = rawRecord[synonym];
//                 if (val !== undefined && val !== null && String(val).trim() !== "") {
//                     foundValue = val;
//                     break; // Stop at first match
//                 }
//             }
//         }

//         mapped[systemKey] = foundValue;
//     }

//     // Also include dynamic fields that aren't in FIELD_SYNONYMS
//     // This covers fields added via "Append" mode
//     Object.keys(rawRecord).forEach(key => {
//         if (!mapped[key] && !FIELD_SYNONYMS[key]) {
//             mapped[key] = rawRecord[key];
//         }
//     });

//     return mapped;
// }
// /**
//  * Updates Counts, Table, and Cards based on results
//  */
// function updateValidationDashboard(results) {
//     // 1. Calculate Stats
//     const total = results.length;
//     const valid = results.filter(r => r.status === 'VALID').length;
//     const warning = results.filter(r => r.status === 'WARNING').length;
//     const error = results.filter(r => r.status === 'ERROR').length;

//     // 2. Update Summary Cards
//     animateValue("validCount", valid);
//     animateValue("warningCount", warning);
//     animateValue("errorCount", error);
//     animateValue("totalCount", total);

//     // 3. Render Table
//     renderValidationTable(results);

//     // 4. Render Cards (Hidden by default)
//     renderValidationCards(results);
// }

// /**
//  * Renders the HTML Table
//  */
// function renderValidationTable(results) {
//     const tbody = document.getElementById('tableBody');
//     const thead = document.getElementById('tableHeader');

//     if (!tbody || !thead) return;

//     // Set Headers
//     thead.innerHTML = `
//         <tr>
//             <th>Status</th>
//             <th>Row #</th>
//             <th>Ticket Number</th>
//             <th>Customer</th>
//             <th>Technician</th>
//             <th>Validation Messages</th>
//             <th>Actions</th>
//         </tr>
//     `;

//     // Set Rows
//     tbody.innerHTML = results.map(row => {
//         const statusClass = row.status === 'VALID' ? 'status-valid' :
//             row.status === 'WARNING' ? 'status-warning' : 'status-error';

//         const icon = row.status === 'VALID' ? '<i class="fas fa-check-circle text-success"></i>' :
//             row.status === 'WARNING' ? '<i class="fas fa-exclamation-triangle text-warning"></i>' :
//                 '<i class="fas fa-times-circle text-danger"></i>';

//         const messagesHtml = row.messages.length > 0
//             ? `<ul class="msg-list">${row.messages.map(m => `<li>${m}</li>`).join('')}</ul>`
//             : '<span class="text-muted">No issues found</span>';

//         return `
//             <tr class="${statusClass}">
//                 <td class="text-center">${icon}</td>
//                 <td>${row.id}</td>
//                 <td><strong>${row.mapped.ticket_number || 'N/A'}</strong></td>
//                 <td>${row.mapped.customer || 'N/A'}</td>
//                 <td>${row.mapped.technician_name || 'N/A'}</td>
//                 <td>${messagesHtml}</td>
//                 <td>
//                     <button class="btn-icon-small" onclick="viewTicketDetails(${row.id - 1})">
//                         <i class="fas fa-eye"></i>
//                     </button>
//                 </td>
//             </tr>
//         `;
//     }).join('');
// }

// /**
//  * Renders Card View
//  */
// function renderValidationCards(results) {
//     const container = document.getElementById('ticketCards');
//     if (!container) return;

//     container.innerHTML = results.map(row => {
//         const borderClass = row.status === 'ERROR' ? 'border-danger' :
//             row.status === 'WARNING' ? 'border-warning' : 'border-success';

//         return `
//             <div class="ticket-card ${borderClass}">
//                 <div class="card-header">
//                     <span class="card-id">#${row.id}</span>
//                     <span class="card-status status-${row.status.toLowerCase()}">${row.status}</span>
//                 </div>
//                 <div class="card-body">
//                     <h4>${row.mapped.ticket_number || 'Unknown Ticket'}</h4>
//                     <p><i class="fas fa-user"></i> ${row.mapped.technician_name || 'Unassigned'}</p>
//                     <p><i class="fas fa-building"></i> ${row.mapped.customer || 'No Customer'}</p>
                    
//                     ${row.messages.length > 0 ?
//                 `<div class="card-issues">${row.messages.length} Issues Found</div>` : ''}
//                 </div>
//             </div>
//         `;
//     }).join('');
// }

// /**
//  * Helper: Animate number counting
//  */
// function animateValue(id, end) {
//     const obj = document.getElementById(id);
//     if (!obj) return;

//     // Quick reset
//     obj.innerHTML = end;

//     // Optional: Add simple flash effect
//     obj.classList.add('updated');
//     setTimeout(() => obj.classList.remove('updated'), 500);
// }

// /**
//  * Toggle between Table and Card view
//  */
// function toggleView(viewType) {
//     const tableDisplay = document.getElementById('tableDisplay');
//     const formDisplay = document.getElementById('formViewContainer');
//     const btnTable = document.getElementById('tableViewBtn');
//     const btnForm = document.getElementById('formViewBtn');

//     if (viewType === 'table') {
//         tableDisplay.style.display = 'block';
//         formDisplay.style.display = 'none';
//         btnTable.classList.add('active');
//         btnForm.classList.remove('active');
//     } else {
//         tableDisplay.style.display = 'none';
//         formDisplay.style.display = 'grid'; // Grid for cards
//         btnTable.classList.remove('active');
//         btnForm.classList.add('active');
//     }
// }

// /**
//  * Filter results table
//  */
// function filterValidationResults(query) {
//     const lowerQ = query.toLowerCase();
//     const rows = document.querySelectorAll('#tableBody tr');

//     rows.forEach(row => {
//         const text = row.innerText.toLowerCase();
//         row.style.display = text.includes(lowerQ) ? '' : 'none';
//     });
// }

// // Modal View Details
// function viewTicketDetails(index) {
//     // Implementation for popup modal showing full details
//     const result = validationResults[index];
//     if (!result) return;

//     const container = document.getElementById('viewDetailsContainer');
//     const modal = document.getElementById('viewWindow');
//     const overlay = document.getElementById('viewOverlay');

//     let html = '<table class="details-table">';
//     for (const [key, val] of Object.entries(result.mapped)) {
//         if (val) {
//             html += `<tr><th>${key.replace(/_/g, ' ')}</th><td>${val}</td></tr>`;
//         }
//     }
//     html += '</table>';

//     container.innerHTML = html;
//     modal.classList.add('active');
//     overlay.classList.add('active');
// }

// // Close Modal Logic
// document.getElementById('closeViewWindow')?.addEventListener('click', () => {
//     document.getElementById('viewWindow').classList.remove('active');
//     document.getElementById('viewOverlay').classList.remove('active');
// });