/**
 * Generates MML_Sales_API_Documentation.xlsx
 * Field names follow frontend (PipelineBoard + AddP0ProspectPage) camelCase 1:1.
 * Run: node docs/generate-pipeline-api-doc.js
 * Requires: exceljs (npm install exceljs --prefix /tmp/xlsx-gen)
 */
const ExcelJS = require("/tmp/xlsx-gen/node_modules/exceljs");
const path = require("path");

const OUT = path.join(__dirname, "MML_Sales_API_Documentation.xlsx");

const HEADERS = [
  "S.No",
  "API Name",
  "HTTP Method",
  "Endpoint",
  "Description",
  "Auth Required",
  "Query / Path Parameters",
  "Request Body (JSON)",
  "Success Response (JSON)",
  "Error Response (JSON)",
  "Frontend Source / UI",
];

const methodColor = {
  GET: "FF2563EB",
  POST: "FF16A34A",
  PUT: "FFF59E0B",
  PATCH: "FFD97706",
  DELETE: "FFDC2626",
};

const commonError = `{
  "success": false,
  "message": "Error description",
  "errors": []
}`;

function thinBorder() {
  const s = { style: "thin", color: { argb: "FFD1D5DB" } };
  return { top: s, left: s, bottom: s, right: s };
}

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7A0A17" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = thinBorder();
  });
  row.height = 32;
}

function applyDataCell(cell, align = "left") {
  cell.alignment = { vertical: "top", horizontal: align, wrapText: true };
  cell.border = thinBorder();
  cell.font = { size: 10, name: "Calibri" };
}

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "MML Sales";
  wb.created = new Date();

  const ws = wb.addWorksheet("API Documentation", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { width: 8 },
    { width: 30 },
    { width: 12 },
    { width: 44 },
    { width: 44 },
    { width: 12 },
    { width: 40 },
    { width: 50 },
    { width: 56 },
    { width: 40 },
    { width: 38 },
  ];

  let r = 1;

  function mergeNote(text, opts = {}) {
    ws.mergeCells(r, 1, r, 11);
    const c = ws.getCell(r, 1);
    c.value = text;
    c.font = opts.font || { size: 10, color: { argb: "FF4B5563" } };
    c.fill = opts.fill;
    c.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    if (opts.height) ws.getRow(r).height = opts.height;
    r++;
  }

  function addPageHeading(title, subtitle) {
    ws.mergeCells(r, 1, r, 11);
    const c = ws.getCell(r, 1);
    c.value = title;
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } };
    c.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
    c.alignment = { vertical: "middle", horizontal: "left" };
    ws.getRow(r).height = 26;
    r++;
    if (subtitle) {
      mergeNote(subtitle, {
        height: 48,
        font: { size: 10, color: { argb: "FF374151" } },
      });
    }
    r++;
  }

  function addMethodSection(title, color) {
    ws.mergeCells(r, 1, r, 11);
    const c = ws.getCell(r, 1);
    c.value = title;
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    c.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    c.alignment = { vertical: "middle", horizontal: "left" };
    ws.getRow(r).height = 24;
    r++;

    const headerRow = ws.getRow(r);
    HEADERS.forEach((h, i) => {
      headerRow.getCell(i + 1).value = h;
    });
    styleHeaderRow(headerRow);
    r++;
  }

  function addApi(api) {
    const row = ws.getRow(r);
    const values = [
      api.sno,
      api.name,
      api.method,
      api.endpoint,
      api.desc,
      api.auth,
      api.params,
      api.request,
      api.response,
      api.error,
      api.ui,
    ];
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v;
      applyDataCell(cell, i === 0 || i === 2 || i === 5 ? "center" : "left");
      if (i === 2) {
        cell.font = {
          bold: true,
          size: 10,
          color: { argb: methodColor[api.method] || "FF111827" },
        };
      }
    });
    const lines = Math.max(
      String(api.response || "").split("\n").length,
      String(api.request || "").split("\n").length,
      6
    );
    row.height = Math.min(170, Math.max(85, lines * 11));
    if (api.sno % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        };
      });
    }
    r++;
  }

  // ── Title ──
  mergeNote("MML Sales CRM — API Documentation (Client Share)", {
    font: { bold: true, size: 16, color: { argb: "FF111827" } },
    height: 28,
  });
  mergeNote(
    "Base URL: {{BASE_URL}}/api/v1   |   Auth: Bearer JWT   |   Content-Type: application/json",
    { font: { size: 10, italic: true, color: { argb: "FF4B5563" } } }
  );
  mergeNote(
    "FE vs BE SPLIT (v1.3 — important): Frontend owns static UI (page titles, button labels, headings, stage names/colors, routes/redirects, toast copy, perPage options, enums display). Backend owns DYNAMIC data only: KPI counts, searchable/paginated lists, CRUD payloads, computed scores/history, filter master data that comes from DB (owners, branches, sources). Do NOT return href, button text, static labels, or colors from APIs.",
    {
      height: 56,
      font: { size: 10, color: { argb: "FF7A0A17" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCF5F6" } },
    }
  );
  mergeNote(
    "FIELD CONTRACT: camelCase keys match frontend state. Request = only form-collected fields. Response = dynamic entity fields. Star icon uses premium (boolean); Overview stores Premium client as Yes/No in the edit form and maps to premium. Do NOT use a separate starred field.",
    {
      height: 40,
      font: { size: 9, color: { argb: "FF374151" } },
    }
  );
  r++;

  // ═══════════════════════════════════════════════════════════
  // PAGE 1 — Pipeline Board Main
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 1: Sales Pipeline Board (Main Screen) — Route: /pipeline | File: PipelineBoard.jsx",
    "UI: stage strip P0–P6, action banner, Oversight (cross-branch flags), search, filter, perPage (10|25|50), table/board views, Export, row actions (call/message/email/calendar/more). '+ Add Prospect / Lead' opens PAGE 2 (create API lives there)."
  );

  addMethodSection("▶ GET Requests — Pipeline Board (Main)", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Pipeline Stage Summary",
    method: "GET",
    endpoint: "/api/v1/pipeline/summary",
    desc: "DYNAMIC only: lead counts per stageId. FE already has stage label/color in PIPELINE_STAGES — do not return those from API.",
    auth: "Yes",
    params: `Optional query (when filters applied):
branchId
ownerId
dateFrom (YYYY-MM-DD)
dateTo (YYYY-MM-DD)`,
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "counts": {
      "P0": 2,
      "P1": 2,
      "P2": 2,
      "P3": 2,
      "P4": 2,
      "P5": 2,
      "P6": 2
    },
    "totalLeads": 14
  }
}`,
    error: commonError,
    ui: "FE maps counts onto PipelineStageStrip cards",
  });

  addApi({
    sno: 2,
    name: "Get Pipeline Leads List",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads",
    desc: "Paginated DYNAMIC lead rows for table/board. Returns entity fields FE already uses. stageId only (FE maps label/color). Search/debounce/pagination params from FE; BE applies them.",
    auth: "Yes",
    params: `Query (align with BoardToolbar state):
search — name / mmlId / mobile / email
stage — P0|P1|P2|P3|P4|P5|P6 (omit = all)
priority — High|Medium|Low
temperature — Hot|Warm|Cold
source
ownerId
branchId
premium — true|false (star icon when premium=true; Overview "Premium client")
page — number (default 1)
perPage — 10|25|50
sortBy — name|score|priority|days|hrs
sortOrder — asc|desc`,
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "items": [
      {
        "id": "p3-1",
        "firstName": "Aditya",
        "lastName": "Sharma",
        "name": "Aditya Sharma",
        "premium": true,
        "mmlId": "MML - D - 10434",
        "mobile": "+91 9876543210",
        "email": "aditya@example.com",
        "temperature": "Cold",
        "score": 8.5,
        "priority": "Medium",
        "completion": 85,
        "days": 8,
        "hrs": 24,
        "source": "Channel Partner",
        "lastDiscussion": "20/08/25, 11:30 AM",
        "nextAction": "29/08/25, 11:30 AM",
        "nextActionNote": "Follow-up call scheduled",
        "followUpStartTime": "12:00",
        "followUpMode": "video",
        "callStatus": "available",
        "stageId": "P3",
        "owner": {
          "id": "u1",
          "name": "Aditya Sharma",
          "role": "Sales Manager",
          "branch": "Rajouri Garden"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 14,
      "totalPages": 2
    }
  }
}`,
    error: commonError,
    ui: "FE maps stageId→label/color; Owner label 'Owner' is FE static",
  });

  addApi({
    sno: 3,
    name: "Get Action Needed Alerts",
    method: "GET",
    endpoint: "/api/v1/pipeline/alerts",
    desc: "DYNAMIC alert rows only. FE builds banner title ('X items need action today') and View button; FE can compose subtitle from items.",
    auth: "Yes",
    params: "limit (optional, default 5)",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "count": 2,
    "items": [
      {
        "id": "a1",
        "type": "stageStuck",
        "leadId": "p4-1",
        "name": "Sanjay Mehta",
        "stageId": "P4",
        "days": 9
      },
      {
        "id": "a2",
        "type": "discountApproval",
        "leadId": "p4-2",
        "status": "pendingSalesHead"
      }
    ]
  }
}`,
    error: commonError,
    ui: "ActionAlertBanner — FE owns wording + View redirect",
  });

  addApi({
    sno: 4,
    name: "Get Oversight Summary",
    method: "GET",
    endpoint: "/api/v1/pipeline/oversight/summary",
    desc: "DYNAMIC KPI number only. Card title 'Oversight', row label 'Cross Branch Flags', and Link to /pipeline/cross-branch stay on FE.",
    auth: "Yes",
    params: "—",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "crossBranchFlagsCount": 3
  }
}`,
    error: commonError,
    ui: "OversightCard badge count only",
  });

  addApi({
    sno: 5,
    name: "Get Lead Score Details",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/score",
    desc: "DYNAMIC scores + history. Modal title, breakdown labels, and rating copy are FE static (map by key / score thresholds).",
    auth: "Yes",
    params: "Path: id (lead id, required)",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "name": "Aditya Sharma",
    "score": 8.5,
    "rating": "High",
    "breakdown": [
      { "key": "profileCompletion", "score": 2.0, "max": 2.0 },
      { "key": "sourceQuality", "score": 2.0, "max": 2.0 },
      { "key": "clientEngagement", "score": 1.5, "max": 2.0 },
      { "key": "timeAtStage", "score": 1.5, "max": 2.0 },
      { "key": "followUpActivity", "score": 1.5, "max": 2.0 }
    ],
    "history": [
      { "date": "2025-08-23", "score": 7.2 },
      { "date": "2025-08-24", "score": 7.5 },
      { "date": "2025-08-25", "score": 7.8 },
      { "date": "2025-08-26", "score": 8.0 },
      { "date": "2025-08-27", "score": 8.2 },
      { "date": "2025-08-28", "score": 8.4 },
      { "date": "2025-08-29", "score": 8.5 }
    ]
  }
}`,
    error: commonError,
    ui: "LeadScoreModal — FE owns labels / ratingMessage",
  });

  addApi({
    sno: 6,
    name: "Get Filter Master Data",
    method: "GET",
    endpoint: "/api/v1/pipeline/filters",
    desc: "DYNAMIC dropdown data from DB only (owners, branches, sources). Stages/priorities/temperatures/perPageOptions stay FE constants.",
    auth: "Yes",
    params: "—",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "sources": [
      "Channel Partner",
      "Outbound Calls",
      "Community Events",
      "Brand Walking",
      "Manual Sourcing",
      "Online - Insta",
      "Reference - Satish",
      "Manual Entry"
    ],
    "owners": [
      {
        "id": "u1",
        "name": "Aditya Sharma",
        "role": "Sales Manager",
        "branch": "Rajouri Garden"
      }
    ],
    "branches": [
      { "id": "b1", "name": "Rajouri Garden" }
    ]
  }
}`,
    error: commonError,
    ui: "Filter modal DB options only",
  });

  addApi({
    sno: 7,
    name: "Export Pipeline Leads",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/export",
    desc: "Export current filtered list. Same query filters as Get Pipeline Leads List. FE Export button currently toasts success only.",
    auth: "Yes",
    params: `Same as list API query filters.
format — xlsx|csv (default xlsx)`,
    request: "— (no body)",
    response: `Binary file download
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="pipeline-leads.xlsx"`,
    error: commonError,
    ui: "Header Export button",
  });

  addApi({
    sno: 8,
    name: "Get Follow-up History",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/follow-ups",
    desc: "Follow-up history for FollowUpHoverCard 'Follow up History' link (FE toast: coming soon).",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "items": [
      {
        "id": "fu-1",
        "at": "20/08/25, 11:30 AM",
        "note": "Meeting Notes/Discussions",
        "type": "discussion"
      }
    ]
  }
}`,
    error: commonError,
    ui: "FollowUpHoverCard → Follow up History",
  });

  r++;

  addMethodSection("▶ POST Requests — Pipeline Board (Main)", "FF16A34A");

  addApi({
    sno: 1,
    name: "Send Message (row action)",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/messages",
    desc: "SendMessageModal fields: message (required), attachment file (optional). Multipart when file present.",
    auth: "Yes",
    params: "Path: id",
    request: `JSON (no file):
{
  "message": "Hello, following up on our discussion."
}

multipart/form-data (with file):
message: string (required)
attachment: file (optional; pdf|image|doc|docx)`,
    response: `{
  "success": true,
  "message": "Message sent.",
  "data": {
    "messageId": "msg-1",
    "id": "p3-1",
    "sentAt": "2025-08-29T11:00:00Z"
  }
}`,
    error: `{
  "success": false,
  "message": "Please type a message.",
  "errors": [
    { "field": "message", "message": "Please type a message." }
  ]
}`,
    ui: "SendMessageModal (MessageSquare action)",
  });

  addApi({
    sno: 2,
    name: "Send Email (row action)",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/emails",
    desc: "SendEmailModal fields: subject, message required; ccList optional; attachment optional. Recipient from lead name/email.",
    auth: "Yes",
    params: "Path: id",
    request: `JSON (no file):
{
  "to": "aditya@example.com",
  "ccList": ["manager@mml.com"],
  "subject": "Follow up on your profile",
  "message": "Hi Aditya, ..."
}

multipart/form-data (with file):
to, subject, message, ccList[], attachment`,
    response: `{
  "success": true,
  "message": "Email sent to Aditya Sharma.",
  "data": {
    "emailId": "em-1",
    "id": "p3-1",
    "sentAt": "2025-08-29T11:05:00Z"
  }
}`,
    error: `{
  "success": false,
  "message": "Please enter an email subject.",
  "errors": [
    { "field": "subject", "message": "Please enter an email subject." }
  ]
}`,
    ui: "EmailActivityButton / SendEmailModal (recipientName = lead.name)",
  });

  mergeNote(
    "Note: Calendar icon navigates to /calendar?client={lead.name} (FE navigate) — no pipeline create API on this click. Call icons are UI status for now. '+ Add Prospect / Lead' → PAGE 2 create API.",
    {
      height: 34,
      font: { size: 10, italic: true, color: { argb: "FF6B7280" } },
    }
  );
  r++;

  addMethodSection("▶ PUT / PATCH Requests — Pipeline Board (Main)", "FFD97706");

  addApi({
    sno: 1,
    name: "Move Lead Stage",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/stage",
    desc: "Board move actions use stageKey (P0–P5). Body uses same stage ids as PIPELINE_STAGES. P0/P1 in FE often open deal detail first; endpoint still supports direct move.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "fromStage": "P3",
  "toStage": "P4",
  "reason": "Optional note"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "name": "Aditya Sharma",
    "fromStage": "P3",
    "stageId": "P4",
    "days": 0,
    "completion": 90,
    "temperature": "Cold",
    "updatedAt": "2025-08-29T11:15:00Z"
  }
}`,
    error: `{
  "success": false,
  "message": "Invalid stage transition from P3 to P5"
}`,
    ui: "handleMoveStage — FE shows toast / stage label",
  });

  addApi({
    sno: 2,
    name: "Update Premium Client",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/premium",
    desc: "Updates premium boolean. FE shows Star when premium=true (board list + deal header + Overview Premium client). Same as Overview edit field premium Yes/No → boolean.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "premium": true
}`,
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "premium": true
  }
}`,
    error: commonError,
    ui: "handlePremiumChange / details.premium === Yes → Star",
  });

  addApi({
    sno: 3,
    name: "Update Lead Priority",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/priority",
    desc: "Updates lead.priority enum used by PRIORITY_STYLES: High | Medium | Low.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "priority": "High"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "priority": "High",
    "updatedAt": "2025-08-29T11:20:00Z"
  }
}`,
    error: commonError,
    ui: "Priority column / more-options (⋮)",
  });

  r++;

  addMethodSection("▶ DELETE Requests — Pipeline Board (Main)", "FFDC2626");

  addApi({
    sno: 1,
    name: "Archive / Delete Lead",
    method: "DELETE",
    endpoint: "/api/v1/pipeline/leads/{id}",
    desc: "Soft-archive preferred (audit). From row more-options (⋮). FE menu not fully wired yet — contract ready for BE.",
    auth: "Yes",
    params: `Path: id
Query: hard (boolean, default false)`,
    request: `{
  "reason": "Duplicate entry"
}`,
    response: `{
  "success": true,
  "message": "Lead archived successfully",
  "data": {
    "id": "p3-1",
    "status": "archived"
  }
}`,
    error: commonError,
    ui: "MoreVertical (⋮) menu",
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 2 — Add P0 Prospect
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 2: Add P0 Prospect (Quick Capture) — File: pipeline/AddP0ProspectPage.jsx",
    "Opened from Pipeline Board '+ Add Prospect / Lead'. form state keys: source, firstName, lastName, mobile, email. Validation: firstName required; UI marks source + lastName required; either mobile OR email compulsory. On save FE also sets defaults: temperature Warm, priority High, score 8.0, completion 25, days 0, hrs 24, source fallback Manual Entry — those are RESPONSE/system fields, not request fields."
  );

  addMethodSection("▶ POST Requests — Add P0 Prospect", "FF16A34A");

  addApi({
    sno: 1,
    name: "Create P0 Prospect (Quick Capture)",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads",
    desc: "Request body = ONLY AddP0ProspectPage formData fields (same names). Backend generates id, mmlId, name (= firstName + lastName), stage P0, and default score/priority/temperature/completion/days/hrs like FE handleSubmit.",
    auth: "Yes",
    params: "—",
    request: `{
  "source": "Outbound Calls",
  "firstName": "Kuhu",
  "lastName": "Sharma",
  "mobile": "+91XXXXXXXXXX",
  "email": "kuhu@example.com"
}

Rules (match FE):
- source: required (UI *)
- firstName: required
- lastName: required (UI *)
- mobile / email: at least one required
- Do NOT send: name, mmlId, score, priority, temperature, completion, days, hrs, owner, client_name, phone, notes`,
    response: `{
  "success": true,
  "data": {
    "id": "p0-1720000000000",
    "firstName": "Kuhu",
    "lastName": "Sharma",
    "name": "Kuhu Sharma",
    "mmlId": "MML - D - 10442",
    "mobile": "+91XXXXXXXXXX",
    "email": "kuhu@example.com",
    "source": "Outbound Calls",
    "premium": false,
    "temperature": "Warm",
    "priority": "High",
    "score": 8.0,
    "completion": 25,
    "days": 0,
    "hrs": 24,
    "lastDiscussion": "Lead Created",
    "nextAction": "Initial Contact",
    "stageId": "P0",
    "owner": {
      "id": "u1",
      "name": "Aditya Sharma",
      "role": "Sales Manager",
      "branch": "Rajouri Garden"
    },
    "createdAt": "2025-08-29T10:00:00Z"
  }
}`,
    error: `{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "firstName", "message": "First Name is required" },
    { "field": "mobile", "message": "Filling details of either Mobile or Email is compulsory" }
  ]
}`,
    ui: "AddP0ProspectPage — FE owns toast / Cancel / Save labels",
  });

  addMethodSection("▶ GET Requests — Add P0 Prospect", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Lead Sources (optional)",
    method: "GET",
    endpoint: "/api/v1/pipeline/sources",
    desc: "Optional DYNAMIC source list from DB if SOURCE becomes a dropdown. Today FE is free-text — no API required until then. Same data can come from /pipeline/filters.",
    auth: "Yes",
    params: "—",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "sources": [
      "Outbound Calls",
      "Channel Partner",
      "Community Events",
      "Brand Walking",
      "Manual Entry",
      "Online - Insta",
      "Reference - Satish",
      "Manual Sourcing"
    ]
  }
}`,
    error: commonError,
    ui: "Only if Source dropdown is wired; else skip",
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 3 — Deal Detail / Overview Tab
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 3: Deal Detail — Overview Tab — Files: DealDetailPage.jsx + deal-tabs/OverviewTab.jsx",
    "Opened from Pipeline Board row/card click. Tabs (FE static): Overview, Profile Create, Visits, Package, Payments, P6, Notes, Audit. THIS SECTION = Overview only. Star icon = premium===true (not a separate 'starred' field). Personal Assistant copy/chips are FE-static for now. Dynamic: deal details, stageGate, weightedValue, rmFlags, stageHistory."
  );

  addMethodSection("▶ GET Requests — Deal Detail / Overview", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Deal Overview",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/overview",
    desc: "Loads Overview tab dynamic data. Field names match OverviewTab EDIT_FIELDS / DealDetailPage deal object. FE maps stageId→stageLabel if needed; stageLabel also editable in form.",
    auth: "Yes",
    params: "Path: id (lead id)",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "name": "Aditya Sharma",
    "email": "aditya.sharma@gmail.com",
    "phone": "+91 98765 10434",
    "mobile": "+91 98765 10434",
    "dealCode": "MML-D-10434",
    "stageId": "P3",
    "stageLabel": "P3 Visit / Video",
    "leadSource": "Instagram Ads",
    "premium": true,
    "packageInterest": "Premium",
    "dealValue": "₹51,000",
    "leadScore": "Warm",
    "enquiryBy": "Parent (father)",
    "lookingFor": "Girl · 26–30 · NCR",
    "areaOfHouse": "Greater Kailash II",
    "profession": "Chartered Accountant",
    "familyIncomeBand": "₹60L–₹1Cr p.a.",
    "nextMeeting": "04/09/26",
    "winLossReasons": "No decision / Think about it, Competitor / Existing solution",
    "winLossTone": "Cold",
    "lastDiscussionAt": "01/09/26, 4:55 PM",
    "lastDiscussionNote": "Meeting Notes/Discussions",
    "nextActionAt": "05/09/26, 4:55 PM",
    "nextAction": "Call Client for pricing confirmation at 8 PM",
    "nextActionUrgency": "6 Hrs Left",
    "assignedTo": "Rohit K.",
    "assignedBy": "Aditya Sharma",
    "mandatoryFieldsFilled": 14,
    "mandatoryFieldsTotal": 14,
    "weightedValue": "₹30,600",
    "weightedValueNote": "60% probability at P4 Negotiation. Rises to 90% once the discount is approved and the quote is accepted.",
    "rmFlags": [
      { "label": "Preference mismatch", "tone": "amber" },
      { "label": "High-demand criteria", "tone": "red" },
      { "label": "Parent is decision maker", "tone": "blue" },
      { "label": "Cross-branch price enquiry", "tone": "amber" }
    ],
    "stageGate": [
      { "label": "Profile Created & Intake", "done": true },
      { "label": "KYC documents uploaded", "done": true },
      { "label": "Video call or visit logged", "done": false },
      { "label": "Package selected & quoted", "done": false },
      { "label": "Discount approved (if any)", "done": false },
      { "label": "Handover Checklist Complete", "done": false }
    ],
    "stageHistory": [
      {
        "stage": "P0 Prospect",
        "entered": "24 Jun",
        "exited": "25 Jun",
        "duration": "1d",
        "sla": "3d",
        "status": "Within SLA"
      },
      {
        "stage": "P3 Visit / Video",
        "entered": "1 Jul",
        "exited": "-",
        "duration": "18d",
        "sla": "10d",
        "status": "Breached"
      }
    ],
    "createdAt": "24 Jun 2026",
    "owner": {
      "id": "u1",
      "name": "Rohit K.",
      "role": "Sales Manager",
      "branch": "Rajouri Garden"
    }
  }
}`,
    error: commonError,
    ui: "OverviewTab DealDetailsCard + right column cards",
  });

  addApi({
    sno: 2,
    name: "Get Follow-up History (deal)",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/follow-ups",
    desc: "Same follow-up history used from Overview Last discussion → Follow up History link.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "items": [
      {
        "id": "fu-1",
        "at": "01/09/26, 4:55 PM",
        "note": "Meeting Notes/Discussions",
        "type": "discussion"
      }
    ]
  }
}`,
    error: commonError,
    ui: "DiscussionField onFollowUp on Overview",
  });

  r++;

  addMethodSection("▶ PUT / PATCH Requests — Deal Detail / Overview", "FFD97706");

  addApi({
    sno: 1,
    name: "Update Deal Details (Overview Edit)",
    method: "PUT",
    endpoint: "/api/v1/pipeline/leads/{id}/overview",
    desc: "Saves Edit details modal. Body keys = OverviewTab EDIT_FIELDS. premium as Yes|No in form; BE stores boolean (or accept Yes/No and convert). Setting premium Yes shows Star on board + header + overview.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "dealCode": "MML-D-10434",
  "stageLabel": "P3 Visit / Video",
  "packageInterest": "Premium",
  "premium": "Yes",
  "dealValue": "₹51,000",
  "leadSource": "Instagram Ads",
  "leadScore": "Warm",
  "enquiryBy": "Parent (father)",
  "lookingFor": "Girl · 26–30 · NCR",
  "areaOfHouse": "Greater Kailash II",
  "profession": "Chartered Accountant",
  "familyIncomeBand": "₹60L–₹1Cr p.a.",
  "nextMeeting": "04/09/26",
  "winLossReasons": "No decision / Think about it, Competitor / Existing solution",
  "winLossTone": "Cold",
  "lastDiscussionAt": "01/09/26, 4:55 PM",
  "lastDiscussionNote": "Meeting Notes/Discussions",
  "nextActionAt": "05/09/26, 4:55 PM",
  "nextAction": "Call Client for pricing confirmation at 8 PM",
  "nextActionUrgency": "6 Hrs Left",
  "assignedTo": "Rohit K.",
  "assignedBy": "Aditya Sharma"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "premium": true,
    "dealCode": "MML-D-10434",
    "stageLabel": "P3 Visit / Video",
    "packageInterest": "Premium",
    "dealValue": "₹51,000",
    "leadSource": "Instagram Ads",
    "leadScore": "Warm",
    "enquiryBy": "Parent (father)",
    "lookingFor": "Girl · 26–30 · NCR",
    "areaOfHouse": "Greater Kailash II",
    "profession": "Chartered Accountant",
    "familyIncomeBand": "₹60L–₹1Cr p.a.",
    "nextMeeting": "04/09/26",
    "winLossReasons": "No decision / Think about it, Competitor / Existing solution",
    "winLossTone": "Cold",
    "lastDiscussionAt": "01/09/26, 4:55 PM",
    "lastDiscussionNote": "Meeting Notes/Discussions",
    "nextActionAt": "05/09/26, 4:55 PM",
    "nextAction": "Call Client for pricing confirmation at 8 PM",
    "nextActionUrgency": "6 Hrs Left",
    "assignedTo": "Rohit K.",
    "assignedBy": "Aditya Sharma",
    "mandatoryFieldsFilled": 14,
    "mandatoryFieldsTotal": 14,
    "updatedAt": "2025-09-10T10:00:00Z"
  }
}`,
    error: `{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "dealCode", "message": "Deal code is required" }
  ]
}`,
    ui: "DealDetailsCard Edit details → Save (onDetailsSaved)",
  });

  addApi({
    sno: 2,
    name: "Update Premium Client (from Overview)",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/premium",
    desc: "Same endpoint as board. Overview Premium client Yes/No → premium boolean → Star visibility.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "premium": true
}`,
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "premium": true
  }
}`,
    error: commonError,
    ui: "onPremiumChange when premium select changes / saved",
  });

  addApi({
    sno: 3,
    name: "Update Stage Gate Item",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/stage-gate",
    desc: "Toggles a stage gate checklist item. Keys match stageGateFor(): label + done.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "label": "Video call or visit logged",
  "done": true
}`,
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "stageGate": [
      { "label": "Profile Created & Intake", "done": true },
      { "label": "KYC documents uploaded", "done": true },
      { "label": "Video call or visit logged", "done": true },
      { "label": "Package selected & quoted", "done": false },
      { "label": "Discount approved (if any)", "done": false },
      { "label": "Handover Checklist Complete", "done": false }
    ]
  }
}`,
    error: commonError,
    ui: "StageGateCard toggleItem",
  });

  addApi({
    sno: 4,
    name: "Update Win / Loss Analysis",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/win-loss",
    desc: "From Mark lost / Move to Cold & Hold modal. Updates Overview winLossReasons + winLossTone (Hot|Warm|Cold|Lost).",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "mode": "cold",
  "reasons": "No decision / Think about it, Competitor / Existing solution",
  "winLossTone": "Cold",
  "briefNote": "Optional brief note"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "winLossReasons": "No decision / Think about it, Competitor / Existing solution",
    "winLossTone": "Cold",
    "briefNote": "Optional brief note"
  }
}`,
    error: commonError,
    ui: "WinLossReasonsModal → handleWinLossSave (header actions, Overview fields)",
  });

  r++;

  addMethodSection("▶ POST Requests — Deal Detail / Overview", "FF16A34A");

  addApi({
    sno: 1,
    name: "Ask Personal Assistant (optional)",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/assistant/ask",
    desc: "Optional. Overview PersonalAssistantCard sends message text only. Priority chips/links are FE-static today; wire this when AI backend exists.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "message": "What should I follow up on today?"
}`,
    response: `{
  "success": true,
  "data": {
    "reply": "Response coming soon.",
    "askedAt": "2025-09-10T10:05:00Z"
  }
}`,
    error: `{
  "success": false,
  "message": "Type a question for MML first.",
  "errors": [
    { "field": "message", "message": "Type a question for MML first." }
  ]
}`,
    ui: "PersonalAssistantCard Ask anything (message state)",
  });

  r += 2;

  mergeNote("UPCOMING (append in this same sheet — no separate tabs)", {
    font: { bold: true, size: 11, color: { argb: "FF111827" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } },
  });
  mergeNote(
    "Next tabs one-by-one: Profile Create / Intake (P2) → Visits (P3) → Package (P4) → Discounts → Documents → Notes & RM Flags → Audit → Payments (P5) → P6 Checklist. Same rules: FE static UI; BE dynamic fields matching frontend keys; premium (not starred) for Star.",
    { height: 40 }
  );
  mergeNote(
    "Document version: 1.4  |  Pages: Pipeline Board + Add P0 + Deal Overview  |  Field fix: starred → premium  |  Status: Ready for review",
    { font: { size: 9, italic: true, color: { argb: "FF9CA3AF" } } }
  );

  await wb.xlsx.writeFile(OUT);
  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
