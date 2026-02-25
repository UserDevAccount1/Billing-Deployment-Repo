// Function_TestData.js (LOCAL / browser)
// Designed to work with your Ticket_matching_matrix.js after you export globals:
// window.STATE, window.DATA_STORE, window.TABLE_SCHEMAS, window.FIELD_DEFINITIONS, etc.

(function () {
  const NA_RE = /^(na|n\/a|null|none|blank|nan|\-|\.)$/i;

  function show(msg, type = "info") {
    if (typeof window.showToast === "function") window.showToast(msg, type);
    else console.log(`[${type}] ${msg}`);
  }

  function normHeader(s) {
    return String(s ?? "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function normValue(v) {
    if (v === undefined || v === null) return "";
    const s = String(v).trim();
    if (!s) return "";
    if (NA_RE.test(s)) return "";
    return s;
  }

  function globalsReady() {
    return (
      typeof window.STATE !== "undefined" &&
      typeof window.DATA_STORE !== "undefined" &&
      typeof window.TABLE_SCHEMAS !== "undefined" &&
      typeof window.FIELD_DEFINITIONS !== "undefined" &&
      typeof window.renderMatrixBody === "function"
    );
  }

  async function waitForGlobals(timeoutMs = 6000) {
    const start = Date.now();
    while (!globalsReady()) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(
          "Globals not ready. Ensure script order is: Ticket_matching_matrix.js, Ticket_matching_matrix_control.js, Function_TestData.js " +
          "AND Ticket_matching_matrix.js exports window.STATE/DATA_STORE/TABLE_SCHEMAS/FIELD_DEFINITIONS."
        );
      }
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  function resolveTargetTableKeyFromUI(value) {
    switch (value) {
      case "AllTable": return "all";
      case "ticket": return "ticket_data";
      case "rate": return "rate_card";
      case "dispatch": return "dispatch";
      case "standby": return "standby";
      case "dedicated": return "dedicated";
      case "sv": return "sv_visit";
      case "project": return "project";
      case "final": return "final_ticket";
      default: return "all";
    }
  }

  // Map CSV headers to YOUR schema field keys
  const HEADER_ALIASES = new Map([
    // Identity / customer
    ["partner ticket number", "ticket_number"],
    ["customer ticket number", "ticket_number"],

    ["customer name", "customer"],
    ["partner name", "account"],

    // Geo
    ["country", "country"],
    ["state", "region"],            // you don't have 'state' field, region closest
    ["city", "city"],
    ["site address", "site_name"],
    ["zip code", "postal_code"],

    // Ticket details
    ["activity details", "subject"],
    ["dispatch category", "service_type"],
    ["ticket priority", "priority"],
    ["customer ticket created date (mm/dd/yyyy)", "created_date"],
    ["eta date (mm/dd/yyyy)", "scheduled_date"],

    // Dispatch-specific time fields
    ["technician name", "technician_name"],
    ["technician in date (mm/dd/yyyy)", "dispatch_date"], // IMPORTANT
    ["technician in time", "arrival_time"],
    ["technician out time", "departure_time"],

    // Totals
    ["total hours", "total_hours"],
    ["total cost", "total_cost"],
    ["currency", "currency"],
    ["sla met", "sla_met"],

    // Notes
    ["remarks", "notes"],
    ["service month (mm/yyyy)", "notes"],
  ]);

  function buildLabelToFieldKeyIndex() {
    const map = new Map();
    Object.entries(window.FIELD_DEFINITIONS || {}).forEach(([key, def]) => {
      if (def?.label) map.set(normHeader(def.label), key);
    });
    return map;
  }

  function detectDelimiter(sample) {
    const candidates = [",", "|", "\t", ";"];
    const scores = new Map(candidates.map((d) => [d, 0]));
    const lines = sample.split(/\r?\n/).slice(0, 12).filter(Boolean);

    for (const line of lines) {
      for (const d of candidates) {
        const count = (line.match(new RegExp(`\\${d}`, "g")) || []).length;
        scores.set(d, scores.get(d) + count);
      }
    }

    let best = ",";
    let bestScore = -1;
    for (const [d, s] of scores.entries()) {
      if (s > bestScore) { bestScore = s; best = d; }
    }
    return best;
  }

  function collapsePipesLine(raw) {
    const parts = raw.split("|").map((p) => p.trim());
    while (parts.length && parts[0] === "") parts.shift();
    while (parts.length && parts[parts.length - 1] === "") parts.pop();
    return parts;
  }

  function parseDelimited(text, delimiter) {
    const rows = [];
    const lines = text.split(/\r?\n/);

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      // skip markdown separator row like: |:----|:----|
      if (delimiter === "|" && /^\|?\s*:?-{2,}/.test(line)) continue;

      let row;
      if (delimiter === "|") {
        row = collapsePipesLine(raw);
      } else {
        // basic quoted CSV parsing
        row = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < raw.length; i++) {
          const ch = raw[i];
          const next = raw[i + 1];
          if (inQuotes) {
            if (ch === '"' && next === '"') { cur += '"'; i++; }
            else if (ch === '"') inQuotes = false;
            else cur += ch;
          } else {
            if (ch === '"') inQuotes = true;
            else if (ch === delimiter) { row.push(cur.trim()); cur = ""; }
            else cur += ch;
          }
        }
        row.push(cur.trim());
      }

      rows.push(row.map((c) => String(c ?? "").trim()));
    }

    return rows;
  }

  function looksLikeHeaderRow(row) {
    const r = (row || []).map(normHeader);
    const mustHits = ["site category", "customer name", "partner ticket number", "country"];
    const hits = mustHits.filter((k) => r.some((c) => c.includes(k)));
    return hits.length >= 3;
  }

  function rowsEqual(a, b) {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (normHeader(a[i]) !== normHeader(b[i])) return false;
    }
    return true;
  }

  async function parseCSVFile(file) {
    const text = await file.text();
    const delimiter = detectDelimiter(text.slice(0, 8000));
    const rows = parseDelimited(text, delimiter);
    if (!rows.length) return { headers: [], rows: [], delimiter };

    let headerIdx = 0;
    for (let i = 0; i < Math.min(rows.length, 40); i++) {
      if (looksLikeHeaderRow(rows[i])) { headerIdx = i; break; }
    }

    const headers = rows[headerIdx].map((h) => String(h ?? "").trim());
    const dataRows = [];

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      if (rowsEqual(r, headers)) continue; // repeated header
      const any = r.some((c) => !!normValue(c));
      if (!any) continue;
      dataRows.push(r);
    }

    return { headers, rows: dataRows, delimiter };
  }

  function mapHeadersToTableFields(headers, tableKey, importMode) {
    const schema = window.TABLE_SCHEMAS?.[tableKey] || [];
    const schemaSet = new Set(schema);
    const labelToKey = buildLabelToFieldKeyIndex();

    const mapped = {}; // colIndex -> fieldKey
    const conflicts = [];
    const unmapped = [];
    const created = [];
    const used = new Set();

    headers.forEach((h, idx) => {
      const h0 = normHeader(h);
      if (!h0) { unmapped.push({ header: h, reason: "empty_header" }); return; }

      const alias = HEADER_ALIASES.get(h0) || h0;
      const candidates = [];

      if (schemaSet.has(alias)) candidates.push(alias);

      const byLabel = labelToKey.get(alias);
      if (byLabel && schemaSet.has(byLabel)) candidates.push(byLabel);

      const byLabel2 = labelToKey.get(h0);
      if (byLabel2 && schemaSet.has(byLabel2)) candidates.push(byLabel2);

      const uniq = Array.from(new Set(candidates));
      if (uniq.length === 1) {
        const fk = uniq[0];
        if (used.has(fk)) {
          conflicts.push({ header: h, candidates: [fk], reason: "duplicate_target_field" });
          return;
        }
        used.add(fk);
        mapped[idx] = fk;
        return;
      }

      if (uniq.length > 1) {
        conflicts.push({ header: h, candidates: uniq, reason: "ambiguous_match" });
        return;
      }

      if (importMode === "append") {
        const safeKey = alias.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        if (!safeKey) { unmapped.push({ header: h, reason: "cannot_create_key" }); return; }
        if (!window.TABLE_SCHEMAS[tableKey].includes(safeKey)) {
          window.TABLE_SCHEMAS[tableKey].push(safeKey);
          created.push({ tableKey, fieldKey: safeKey, sourceHeader: h });
        }
        mapped[idx] = safeKey;
        return;
      }

      unmapped.push({ header: h, reason: "unknown_header" });
    });

    return { mapped, conflicts, unmapped, created };
  }

  function safeSet(tableKey, fieldKey, value) {
    const v = normValue(value);
    if (!v) return;
    const store = window.DATA_STORE?.[tableKey];
    if (!store) return;

    const existing = store[fieldKey];
    const emptyExisting = existing === undefined || existing === null || String(existing).trim() === "";
    if (!emptyExisting) return;

    store[fieldKey] = v;

    if (window.STATE?.smartAddEnabled && typeof window.smartAddToOtherTables === "function") {
      window.smartAddToOtherTables(fieldKey, v);
    }
  }

  function applyRowToTable(tableKey, headers, row, importMode) {
    const hm = mapHeadersToTableFields(headers, tableKey, importMode);
    if (hm.conflicts.length) return { ok: false, headerMap: hm };

    Object.entries(hm.mapped).forEach(([idxStr, fieldKey]) => {
      safeSet(tableKey, fieldKey, row[Number(idxStr)]);
    });

    return { ok: true, headerMap: hm };
  }

  function pickFirstRow(rows) {
    for (const r of rows) {
      if (r.some((c) => !!normValue(c))) return r;
    }
    return null;
  }

  function routeServiceFromSiteCategory(headers, row) {
    const idx = headers.findIndex((h) => normHeader(h) === "site category");
    const v = idx >= 0 ? normHeader(row[idx]) : "";
    if (!v) return null;
    if (v.includes("dispatch")) return "dispatch";
    if (v.includes("dedicated")) return "dedicated";
    if (v.includes("standby")) return "standby";
    if (v.includes("project")) return "project";
    if (v.includes("sv") || v.includes("scheduled")) return "sv_visit";
    return null;
  }

  async function importCSV(file, targetKey, importMode) {
    const parsed = await parseCSVFile(file);
    if (!parsed.headers.length) throw new Error("No headers found.");
    if (!parsed.rows.length) throw new Error("No data rows found.");

    const row = pickFirstRow(parsed.rows);
    if (!row) throw new Error("No valid data row found.");

    const errors = [];

    if (targetKey === "dispatch") {
      const r1 = applyRowToTable("dispatch", parsed.headers, row, importMode);
      if (!r1.ok) errors.push({ table: "dispatch", conflicts: r1.headerMap.conflicts });

      const r2 = applyRowToTable("ticket_data", parsed.headers, row, importMode);
      if (!r2.ok) errors.push({ table: "ticket_data", conflicts: r2.headerMap.conflicts });

      const r3 = applyRowToTable("final_ticket", parsed.headers, row, importMode);
      if (!r3.ok) errors.push({ table: "final_ticket", conflicts: r3.headerMap.conflicts });

      if (errors.length) {
        console.error("[Import blocked]", errors);
        throw new Error("Import blocked: ambiguous/duplicate header mapping. Check console.");
      }

      show(`Imported (first row) → dispatch + ticket_data + final_ticket (delim: ${parsed.delimiter})`, "success");
      return;
    }

    if (targetKey === "all") {
      const rTicket = applyRowToTable("ticket_data", parsed.headers, row, importMode);
      if (!rTicket.ok) errors.push({ table: "ticket_data", conflicts: rTicket.headerMap.conflicts });

      const routed = routeServiceFromSiteCategory(parsed.headers, row);
      if (routed) {
        const rServ = applyRowToTable(routed, parsed.headers, row, importMode);
        if (!rServ.ok) errors.push({ table: routed, conflicts: rServ.headerMap.conflicts });
      }

      const rFinal = applyRowToTable("final_ticket", parsed.headers, row, importMode);
      if (!rFinal.ok) errors.push({ table: "final_ticket", conflicts: rFinal.headerMap.conflicts });

      if (errors.length) {
        console.error("[Import blocked]", errors);
        throw new Error("Import blocked: ambiguous/duplicate header mapping. Check console.");
      }

      show(`Imported (first row) → ticket_data + ${routed || "(no service routed)"} + final_ticket`, "success");
      return;
    }

    // Other target
    const primary = targetKey;
    const rPrim = applyRowToTable(primary, parsed.headers, row, importMode);
    if (!rPrim.ok) errors.push({ table: primary, conflicts: rPrim.headerMap.conflicts });

    if (primary !== "ticket_data") {
      const rTicket = applyRowToTable("ticket_data", parsed.headers, row, importMode);
      if (!rTicket.ok) errors.push({ table: "ticket_data", conflicts: rTicket.headerMap.conflicts });
    }
    if (primary !== "final_ticket") {
      const rFinal = applyRowToTable("final_ticket", parsed.headers, row, importMode);
      if (!rFinal.ok) errors.push({ table: "final_ticket", conflicts: rFinal.headerMap.conflicts });
    }

    if (errors.length) {
      console.error("[Import blocked]", errors);
      throw new Error("Import blocked: ambiguous/duplicate header mapping. Check console.");
    }

    show(`Imported (first row) → ${primary} (+ ticket_data/final_ticket)`, "success");
  }

  async function importFile(file) {
    await waitForGlobals();

    if (!file || typeof file.size !== "number") throw new Error("No file provided.");
    if (file.size === 0) throw new Error(`File "${file.name}" is empty (0 bytes).`);

    const targetUI = document.getElementById("tmm_targetTable")?.value || "AllTable";
    const modeUI = document.getElementById("tmm_importMode")?.value || "smart";
    const targetKey = resolveTargetTableKeyFromUI(targetUI);
    const importMode = modeUI === "append" ? "append" : "smart";

    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".csv") || name.endsWith(".tsv") || file.type === "text/plain") {
  await importCSV(file, targetKey, importMode); // importCSV already auto-detects delimiter in my version
} else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
  throw new Error("XLSX/XLS not implemented yet. Convert to CSV/TSV for now.");
} else if (name.endsWith(".pdf")) {
  throw new Error("PDF import not supported yet (needs PDF.js checking mode).");
} else {
  throw new Error("Unsupported file type.");
}

    // Ensure matrix is in data mode so values are visible
    window.STATE.matrixMode = "data";
    const toggle = document.getElementById("matrixModeToggle");
    if (toggle) toggle.checked = true;

    window.renderMatrixBody();
    window.applyColumnVisibility?.();
    window.updateStatistics?.();
    window.updateFinalTablePreview?.();
  }

  function initUploadArea() {
    const uploadArea = document.getElementById("tmm_uploadArea");
    const fileInput = document.getElementById("tmm_fileInput");
    if (!uploadArea || !fileInput) {
      console.warn("[TMM_IMPORT] upload area or file input not found");
      return;
    }

    uploadArea.addEventListener("click", (e) => {
      const interactive = e.target.closest("select, option, label, input, button, a, .tmm-upload-controls, .tmm-upload-control");
      if (interactive) return;
      fileInput.click();
    });

    const controls = uploadArea.querySelector(".tmm-upload-controls");
    if (controls) {
      controls.addEventListener("click", (e) => e.stopPropagation());
      controls.addEventListener("mousedown", (e) => e.stopPropagation());
    }

    fileInput.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        try {
          await importFile(f);
        } catch (err) {
          console.error(err);
          show(err.message || String(err), "error");
        }
      }
      fileInput.value = "";
    });

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });
    uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
    uploadArea.addEventListener("drop", async (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      const files = Array.from(e.dataTransfer?.files || []);
      for (const f of files) {
        try {
          await importFile(f);
        } catch (err) {
          console.error(err);
          show(err.message || String(err), "error");
        }
      }
    });

    show("Importer ready. Upload CSV to populate the matrix (first row only).", "info");
  }

  window.TMM_IMPORT = { initUploadArea, importFile };

  document.addEventListener("DOMContentLoaded", () => {
    initUploadArea();
  });
})();