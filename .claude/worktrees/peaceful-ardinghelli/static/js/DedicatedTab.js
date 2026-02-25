// DedicatedTab.js - logic for Dedicated resources tab in Quick Setup
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
            { name: "TKT-00123.pdf", type: "pdf", size: "1.4 MB", ticketNumber: "TKT-00123", date: "2024-08-01" }
        ],
        filesForApproval: [
            { name: "Timesheet_Aug.pdf", type: "pdf", size: "2.4 MB", status: "Pending", submittedDate: "2024-08-31" }
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
        remarks: ""
    }
];

let dedicatedConfig = {
    pageSize: 10,
    currentPage: 1,
    sortField: 'technicianName',
    sortOrder: 'asc',
    filteredData: [...dedicatedData]
};

function initDedicatedTab() {
    console.log('Initializing dedicated tab...');
    initDedicatedFilters();
    initDedicatedTable();
    initDedicatedPagination();
    applyDedicatedFilters();
}

function initDedicatedFilters() {
    const ids = ['dedicatedCustomerSelect', 'dedicatedPartnerSelect', 'dedicatedCountrySelect', 'dedicatedBandSelect'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyDedicatedFilters);
    });

    const searchI = document.getElementById('dedicatedSearchInput');
    if (searchI) searchI.addEventListener('input', applyDedicatedFilters);

    const clearBtn = document.getElementById('dedicatedClearFiltersBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            if (searchI) searchI.value = '';
            applyDedicatedFilters();
        });
    }
}

function applyDedicatedFilters() {
    const customer = document.getElementById('dedicatedCustomerSelect')?.value;
    const partner = document.getElementById('dedicatedPartnerSelect')?.value;
    const country = document.getElementById('dedicatedCountrySelect')?.value;
    const band = document.getElementById('dedicatedBandSelect')?.value;
    const search = document.getElementById('dedicatedSearchInput')?.value.toLowerCase();

    dedicatedConfig.filteredData = dedicatedData.filter(item => {
        if (customer && item.customerName !== customer) return false;
        if (partner && item.partnerName !== partner) return false;
        if (country && item.country !== country) return false;
        if (band && item.band !== band) return false;
        if (search) {
            const text = `${item.technicianName} ${item.siteAddress} ${item.city}`.toLowerCase();
            if (!text.includes(search)) return false;
        }
        return true;
    });

    dedicatedConfig.currentPage = 1;
    renderDedicatedTable();
}

function renderDedicatedTable() {
    const tableBody = document.getElementById('dedicatedTableBody');
    if (!tableBody) return;

    const startIndex = (dedicatedConfig.currentPage - 1) * dedicatedConfig.pageSize;
    const endIndex = startIndex + dedicatedConfig.pageSize;
    const pageData = dedicatedConfig.filteredData.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="36" style="text-align:center;">No records found</td></tr>';
        return;
    }

    pageData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn btn-sm btn-info" onclick="alert('Viewing ${item.id}')"><i class="fas fa-eye"></i></button>
            </td>
            <td>-</td>
            <td>${item.siteCategory}</td>
            <td>${item.customerName}</td>
            <td>${item.partnerName}</td>
            <td>${item.country}</td>
            <td>${item.state}</td>
            <td>${item.city}</td>
            <td>${item.siteAddress}</td>
            <td>${item.zipCode}</td>
            <td>${item.poNumber}</td>
            <td><strong>${item.technicianName}</strong></td>
            <td><span class="status-badge status-info">${item.band}</span></td>
            <td>${item.variant}</td>
            <td>${item.workingDays}</td>
            <td>${item.workedDays}</td>
            <td>${item.monthlyRate}</td>
            <td>${item.dailyRate}</td>
            <td>${item.actualCost}</td>
            <td>${item.currency}</td>
            <td>${item.otHours}</td>
            <td>${item.otPerHourRate || '-'}</td>
            <td>${item.otHoursCost || '-'}</td>
            <td>${item.weekendOtHours || '0'}</td>
            <td>${item.weekendRate || '-'}</td>
            <td>${item.weekendCost || '-'}</td>
            <td>${item.travelExtraCost || '-'}</td>
            <td>${item.taxPercent || '-'}</td>
            <td>${item.taxCost || '-'}</td>
            <td><strong>${item.totalCost}</strong></td>
            <td>${item.slaPercent}%</td>
            <td>${item.slaMet}</td>
            <td>${item.slaReason || '-'}</td>
            <td>${item.attendanceApproved}</td>
            <td>${item.serviceMonth}</td>
            <td>${item.remarks || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
    updateDedicatedPaginationUI();
}

function initDedicatedPagination() {
    const nextBtn = document.getElementById('dedicatedNextPage');
    const prevBtn = document.getElementById('dedicatedPrevPage');
    if (nextBtn) nextBtn.onclick = () => {
        if (dedicatedConfig.currentPage < Math.ceil(dedicatedConfig.filteredData.length / dedicatedConfig.pageSize)) {
            dedicatedConfig.currentPage++;
            renderDedicatedTable();
        }
    };
    if (prevBtn) prevBtn.onclick = () => {
        if (dedicatedConfig.currentPage > 1) {
            dedicatedConfig.currentPage--;
            renderDedicatedTable();
        }
    };
}

function updateDedicatedPaginationUI() {
    const info = document.getElementById('dedicatedPaginationInfo');
    if (info) {
        const total = dedicatedConfig.filteredData.length;
        const start = total === 0 ? 0 : (dedicatedConfig.currentPage - 1) * dedicatedConfig.pageSize + 1;
        const end = Math.min(dedicatedConfig.currentPage * dedicatedConfig.pageSize, total);
        info.textContent = `Showing ${start} to ${end} of ${total} entries`;
    }
}

function initDedicatedTable() {
    renderDedicatedTable();
}

document.addEventListener('DOMContentLoaded', () => {
    const dedicatedTab = document.getElementById('dedicatedTab');
    if (dedicatedTab) {
        initDedicatedTab();
    }
});


// Add this mapping function to handle the API structure
function transformApiData(apiData) {
    return apiData.map(item => {
        const dt = item.data_table || {};
        return {
            id: item.uuid,
            siteCategory: dt.site_name || "Dedicated",
            customerName: item.customer || dt.customer,
            partnerName: dt.account || "N/A",
            country: dt.country,
            state: dt.status, // API uses status for state in your example
            city: dt.city,
            siteAddress: dt.address,
            zipCode: dt.postal_code,
            poNumber: dt.vendor_po,
            technicianName: dt.technician_name || "Unknown",
            band: dt.band || "N/A",
            variant: dt.variant || "Standard",
            workingDays: dt.working_days || 0,
            workedDays: dt.worked_days || 0,
            monthlyRate: parseFloat(dt.monthly_rate) || 0,
            totalCost: parseFloat(dt.total_cost) || 0,
            currency: dt.currency,
            // ... map other fields as needed
        };
    });
}

// When you fetch data, pass it through the transformer
// Replace your hardcoded dedicatedData with the result of this function