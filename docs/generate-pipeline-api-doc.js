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

  // ═══════════════════════════════════════════════════════════
  // PAGE 4 — Profile Create / Intake (P2)
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 4: Deal Detail — Profile Create / Intake (P2) — Files: IntakeFormTab.jsx + intake/intakeFormData.js",
    "Default tab when stageId=P2 (STAGE_TO_TAB). Two FE views (toggle is FE-only): Fill the form + Client record. Booklet sections (FE labels): personal, education, residency, family, siblings, match, essential, medical, declaration, communication, casesheet. Field keys = intakeFormData.js (e.g. firstName, mobile, courses[]). Client-record / personal saves require OTP (send → verify → commit). Move P2→P3 uses existing PATCH .../stage."
  );

  addMethodSection("▶ GET Requests — Intake / Profile Create (P2)", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Intake Form (full booklet)",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/intake",
    desc: "DYNAMIC intake state for both Fill form + Client record. values = flat map of field keys from SECTION_BLOCKS; chips holds upload chip lists (e.g. aadhaarFiles). Progress numbers for Form filled card / section sidebar. Schema labels stay on FE (SECTIONS_META).",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p2-1",
    "stageId": "P2",
    "personalUnlocked": false,
    "overallFilledFields": 145,
    "overallTotalFields": 270,
    "overallPercent": 54,
    "sections": [
      {
        "key": "personal",
        "filled": 28,
        "total": 40,
        "percent": 70
      },
      {
        "key": "education",
        "filled": 12,
        "total": 25,
        "percent": 48
      }
    ],
    "values": {
      "gender": "Female",
      "firstName": "Priya",
      "middleName": "",
      "lastName": "Raheja",
      "clientType": "Exclusive",
      "profileStatus": "Under review",
      "maritalStatus": "Never married",
      "lookingFor": "Groom",
      "enquiryBy": "Parent",
      "panNo": "AHXPR••••K",
      "aadhaarNo": "•••• •••• 4417",
      "mobile": "98••• ••164",
      "alternateContact": "",
      "email": "priya.raheja@gmail.com",
      "dob": "14 Jul 1995",
      "timeOfBirth": "04:20",
      "placeOfBirth": "Delhi",
      "height": "5 ft 4 in / 163 cms",
      "occupation": "Professional",
      "courses": [
        {
          "level": "Professional",
          "course": "CA — 4 yrs",
          "stream": "Audit & taxation",
          "institution": "ICAI",
          "year": "2019",
          "pct": "AIR 214"
        }
      ]
    },
    "chips": {
      "aadhaarFiles": ["aadhaar-front.jpg", "aadhaar-back.jpg"]
    },
    "changeLog": [
      {
        "id": "demo-mobile-1",
        "fieldKey": "mobile",
        "label": "Mobile",
        "from": "98••• ••771",
        "to": "98••• ••164",
        "at": "07 Sep 2026, 11:24 am",
        "by": "Neha Sharma",
        "via": "OTP verified"
      }
    ]
  }
}

Note: values may include any key from intakeFormData SECTION_BLOCKS (personal→casesheet). Do not invent alternate names. Empty P0 intake returns values: {} and chips: {}.`,
    error: commonError,
    ui: "IntakeFormTab values/chips/changeLog + Fill form progress",
  });

  addApi({
    sno: 2,
    name: "Get Intake Section",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/intake/sections/{sectionKey}",
    desc: "Optional slice for one booklet section. sectionKey = SECTIONS_META.key (personal|education|residency|family|siblings|match|essential|medical|declaration|communication|casesheet).",
    auth: "Yes",
    params: `Path:
id
sectionKey`,
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "sectionKey": "personal",
    "filled": 28,
    "total": 40,
    "percent": 70,
    "values": {
      "firstName": "Priya",
      "lastName": "Raheja",
      "mobile": "98••• ••164",
      "email": "priya.raheja@gmail.com"
    },
    "chips": {
      "aadhaarFiles": ["aadhaar-front.jpg", "aadhaar-back.jpg"]
    }
  }
}`,
    error: commonError,
    ui: "Active booklet section / SectionEditModal load",
  });

  addApi({
    sno: 3,
    name: "Get Intake Change Log",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/intake/change-log",
    desc: "OTP-verified field history shown on Client record Change summary. Keys match DEMO_CHANGE_LOG / handleOtpVerified log entries.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "items": [
      {
        "id": "demo-email-1",
        "fieldKey": "email",
        "label": "E-mail",
        "from": "priya.r@outlook.com",
        "to": "priya.raheja@gmail.com",
        "at": "05 Sep 2026, 04:12 pm",
        "by": "Neha Sharma",
        "via": "OTP verified"
      }
    ]
  }
}`,
    error: commonError,
    ui: "ClientRecordView changeLog",
  });

  r++;

  addMethodSection("▶ PUT / PATCH Requests — Intake / Profile Create (P2)", "FFD97706");

  addApi({
    sno: 1,
    name: "Save Intake Section Draft (Fill form)",
    method: "PUT",
    endpoint: "/api/v1/pipeline/leads/{id}/intake/sections/{sectionKey}",
    desc: "Persists section field values while filling (draft). Body values keys must match intakeFormData field keys for that section. chips optional (upload filenames / ids). Personal final commit from Client record still goes through OTP verify API.",
    auth: "Yes",
    params: `Path:
id
sectionKey — personal|education|residency|family|siblings|match|essential|medical|declaration|communication|casesheet`,
    request: `{
  "values": {
    "firstName": "Priya",
    "lastName": "Raheja",
    "mobile": "9876543210",
    "email": "priya.raheja@gmail.com",
    "gender": "Female",
    "maritalStatus": "Never married",
    "lookingFor": "Groom",
    "dob": "14 Jul 1995",
    "placeOfBirth": "Delhi",
    "religion": "Hindu",
    "sectCaste": "Agarwal",
    "height": "5 ft 4 in / 163 cms"
  },
  "chips": {
    "aadhaarFiles": ["aadhaar-front.jpg", "aadhaar-back.jpg"]
  }
}`,
    response: `{
  "success": true,
  "data": {
    "sectionKey": "personal",
    "filled": 28,
    "total": 40,
    "percent": 70,
    "overallFilledFields": 145,
    "overallTotalFields": 270,
    "overallPercent": 54,
    "updatedAt": "2025-09-10T12:00:00Z"
  }
}`,
    error: `{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "firstName", "message": "First name is required" }
  ]
}`,
    ui: "IntakeFillFormView setField / section navigation persistence",
  });

  r++;

  addMethodSection("▶ POST Requests — Intake / Profile Create (P2)", "FF16A34A");

  addApi({
    sno: 1,
    name: "Send Intake OTP",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/intake/otp/send",
    desc: "PersonalChangeOtpModal Step 1. mode=unlock (edit personal) or mode=commit (save personal / section after changes). FE shows Send OTP → client mobile.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "mode": "commit",
  "sectionKey": "personal",
  "sectionLabel": "Personal details"
}`,
    response: `{
  "success": true,
  "data": {
    "sent": true,
    "expiresInSeconds": 300,
    "maskedMobile": "98••• ••164"
  }
}`,
    error: commonError,
    ui: "PersonalChangeOtpModal handleSend",
  });

  addApi({
    sno: 2,
    name: "Verify Intake OTP & Commit Changes",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/intake/otp/verify",
    desc: "PersonalChangeOtpModal Step 2 + handleOtpVerified. unlock: sets personalUnlocked. commit: applies values/chips, appends changeLog entries (fieldKey, label, from, to, at, by, via).",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "mode": "commit",
  "otp": "123456",
  "sectionKey": "personal",
  "sectionLabel": "Personal details",
  "changes": [
    {
      "key": "mobile",
      "label": "Mobile",
      "from": "98••• ••771",
      "to": "9876543210"
    }
  ],
  "values": {
    "mobile": "9876543210",
    "email": "priya.raheja@gmail.com"
  },
  "chips": {
    "aadhaarFiles": ["aadhaar-front.jpg", "aadhaar-back.jpg"]
  }
}`,
    response: `{
  "success": true,
  "data": {
    "personalUnlocked": false,
    "applied": true,
    "changeLogEntries": [
      {
        "id": "cl-1",
        "fieldKey": "mobile",
        "label": "Mobile",
        "from": "98••• ••771",
        "to": "9876543210",
        "at": "10 Sep 2026, 06:12 pm",
        "by": "Neha Sharma",
        "via": "OTP verified"
      }
    ],
    "overallFilledFields": 146,
    "overallTotalFields": 270,
    "overallPercent": 54
  }
}`,
    error: `{
  "success": false,
  "message": "Enter the OTP sent to the client.",
  "errors": [
    { "field": "otp", "message": "Enter the OTP sent to the client." }
  ]
}`,
    ui: "PersonalChangeOtpModal Verify & update / SectionEditModal Save & send OTP flow",
  });

  addApi({
    sno: 3,
    name: "Upload Intake Document Chip",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/intake/uploads",
    desc: "Upload for fields with type=upload (e.g. panNo, aadhaarNo). Returns filename/id pushed into chips[chipsKey] (FE: aadhaarFiles).",
    auth: "Yes",
    params: "Path: id",
    request: `multipart/form-data:
fieldKey: aadhaarNo
chipsKey: aadhaarFiles
file: (binary)`,
    response: `{
  "success": true,
  "data": {
    "fieldKey": "aadhaarNo",
    "chipsKey": "aadhaarFiles",
    "fileName": "aadhaar-front.jpg",
    "fileId": "file-123"
  }
}`,
    error: commonError,
    ui: "Intake upload fields / removeChip list",
  });

  mergeNote(
    "Intake note: Full field catalog lives in frontend intakeFormData.js (SECTION_BLOCKS). API stores/returns the same camelCase keys — do not rename (firstName stays firstName, not client_name). Section tips, booklet labels, Fill/Record toggle are FE-static. Advance P2→P3 = PATCH /pipeline/leads/{id}/stage with fromStage P2, toStage P3 (already on PAGE 1).",
    {
      height: 44,
      font: { size: 10, italic: true, color: { argb: "FF6B7280" } },
    }
  );

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 5 — Visits / Video Call (P3)
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 5: Deal Detail — Visits & Meetings (P3) — File: deal-tabs/VisitsMeetingsTab.jsx",
    "Default tab when stageId=P3. Same design as desk/HomeOfficeVisitsPage.jsx. Dynamic: visit details form (visitType, date, slot, client, attend, vehicle), mandatory capture checklist, visits list + lastAction (summary/notes/recording/transcript). Filters period + typeFilter. FE-only: section titles, ProgressMeter colors, StatusPill tones can be mapped from status. Move P3→P4 = existing PATCH .../stage."
  );

  addMethodSection("▶ GET Requests — Visits & Meetings (P3)", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Visits Tab (deal)",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/visits",
    desc: "Loads VisitsMeetingsTab: active/scheduled visit details, capture checklist, and upcoming/recent visits list. Field names match FE state + VISITS / CAPTURE_ITEMS objects.",
    auth: "Yes",
    params: `Path: id

Query (list filters — FE: period, typeFilter):
period — month|quarter
type — all|Home visit|Office visit`,
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p3-1",
    "stageId": "P3",
    "dealCode": "MML-D-10434",
    "locationNote": "Greater Kailash · GPS required",
    "activeVisit": {
      "id": "visit-1",
      "visitType": "Home visit",
      "date": "2026-07-02",
      "slot": "11:00 AM – 1:00 PM",
      "client": "Aditya Verma",
      "attend": "Client + both parents",
      "vehicle": "Yes — branch car",
      "status": "Scheduled",
      "progressPercent": 35
    },
    "capture": [
      {
        "title": "House / GPS photo",
        "note": "Taken at the door with location accuracy under 15m.",
        "status": "Captured",
        "done": true
      },
      {
        "title": "Selfie with client",
        "note": "Staff and client in frame. Used for in-person verification.",
        "status": "Captured",
        "done": true
      },
      {
        "title": "Staff activity form",
        "note": "Who attended, talking points and next action.",
        "status": "Pending",
        "done": false,
        "pending": true
      },
      {
        "title": "Advance booking call log",
        "note": "Call confirming the slot is logged against the deal.",
        "status": "Not started",
        "done": false
      }
    ],
    "captureDone": 2,
    "captureTotal": 4,
    "visits": [
      {
        "id": "visit-1",
        "date": "02 Jul",
        "client": "Aditya Verma",
        "type": "Home visit",
        "executive": "Rohit Khanna",
        "capture": "2 of 4",
        "vehicle": "Yes",
        "status": "Scheduled",
        "lastAction": {
          "summary": "Family open to Premium; prefers GK / South Delhi matches",
          "notes": "Discussed package options; parents want evening slots",
          "recording": "Not recorded yet",
          "transcript": "Not available"
        }
      },
      {
        "id": "visit-2",
        "date": "14 Jul",
        "client": "Sanjay Mehta",
        "type": "Office visit",
        "executive": "Pooja Sharma",
        "capture": "4 of 4",
        "vehicle": "No",
        "status": "Completed",
        "lastAction": {
          "summary": "Ready to shortlist 5 profiles this week",
          "notes": "Agreed on Classic package; KYC pending",
          "recording": "18 min · Office visit",
          "transcript": "Full transcript ready (12 pages)"
        }
      }
    ]
  }
}`,
    error: commonError,
    ui: "VisitsMeetingsTab — details form + capture + DeskTable",
  });

  addApi({
    sno: 2,
    name: "Get Visit by Id",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/visits/{visitId}",
    desc: "Single visit with capture + lastAction detail (hover icons: summary, notes, recording, transcript).",
    auth: "Yes",
    params: "Path: id, visitId",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "visit-2",
    "date": "14 Jul",
    "client": "Sanjay Mehta",
    "type": "Office visit",
    "executive": "Pooja Sharma",
    "capture": "4 of 4",
    "vehicle": "No",
    "status": "Completed",
    "visitType": "Office visit",
    "slot": "2:00 PM – 4:00 PM",
    "attend": "Client only",
    "lastAction": {
      "summary": "Ready to shortlist 5 profiles this week",
      "notes": "Agreed on Classic package; KYC pending",
      "recording": "18 min · Office visit",
      "transcript": "Full transcript ready (12 pages)"
    },
    "captureItems": [
      {
        "title": "House / GPS photo",
        "status": "Captured",
        "done": true
      }
    ]
  }
}`,
    error: commonError,
    ui: "LastActionIcons hover / visit row open",
  });

  r++;

  addMethodSection("▶ POST Requests — Visits & Meetings (P3)", "FF16A34A");

  addApi({
    sno: 1,
    name: "Schedule / Create Visit",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/visits",
    desc: "Creates a visit from Visit details form fields (same keys as FE useState: visitType, date, slot, client, attend, vehicle).",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "visitType": "Home visit",
  "date": "2026-07-02",
  "slot": "11:00 AM – 1:00 PM",
  "client": "Aditya Verma",
  "attend": "Client + both parents",
  "vehicle": "Yes — branch car"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "visit-3",
    "visitType": "Home visit",
    "date": "2026-07-02",
    "slot": "11:00 AM – 1:00 PM",
    "client": "Aditya Verma",
    "attend": "Client + both parents",
    "vehicle": "Yes — branch car",
    "status": "Scheduled",
    "executive": "Rohit Khanna",
    "capture": "0 of 4",
    "lastAction": {
      "summary": "Visit not started",
      "notes": "No notes yet",
      "recording": "Not recorded yet",
      "transcript": "Not available"
    }
  }
}`,
    error: `{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "date", "message": "Date is required" },
    { "field": "slot", "message": "Time slot is required" }
  ]
}`,
    ui: "Visit details form save / schedule",
  });

  addApi({
    sno: 2,
    name: "Start Visit",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/visits/{visitId}/start",
    desc: "PrimaryButton Start Visit — marks visit in progress and unlocks capture checklist (FE toast: Visit started. Capture checklist is live.).",
    auth: "Yes",
    params: "Path: id, visitId",
    request: "— (no body) or {}",
    response: `{
  "success": true,
  "data": {
    "id": "visit-1",
    "status": "In progress",
    "captureLive": true
  }
}`,
    error: commonError,
    ui: "PrimaryButton Start Visit",
  });

  addApi({
    sno: 3,
    name: "Reschedule Visit",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/visits/{visitId}/reschedule",
    desc: "OutlineButton Reschedule — updates date and/or slot (FE: Reschedule slot opened).",
    auth: "Yes",
    params: "Path: id, visitId",
    request: `{
  "date": "2026-07-05",
  "slot": "2:00 PM – 4:00 PM"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "visit-1",
    "date": "2026-07-05",
    "slot": "2:00 PM – 4:00 PM",
    "status": "Scheduled"
  }
}`,
    error: commonError,
    ui: "OutlineButton Reschedule",
  });

  r++;

  addMethodSection("▶ PUT / PATCH Requests — Visits & Meetings (P3)", "FFD97706");

  addApi({
    sno: 1,
    name: "Update Visit Details",
    method: "PUT",
    endpoint: "/api/v1/pipeline/leads/{id}/visits/{visitId}",
    desc: "Updates active visit form fields (visitType, date, slot, client, attend, vehicle).",
    auth: "Yes",
    params: "Path: id, visitId",
    request: `{
  "visitType": "Office visit",
  "date": "2026-07-02",
  "slot": "5:00 PM – 7:00 PM",
  "client": "Aditya Verma",
  "attend": "Client + both parents",
  "vehicle": "No — staff travel"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "visit-1",
    "visitType": "Office visit",
    "date": "2026-07-02",
    "slot": "5:00 PM – 7:00 PM",
    "client": "Aditya Verma",
    "attend": "Client + both parents",
    "vehicle": "No — staff travel",
    "status": "Scheduled"
  }
}`,
    error: commonError,
    ui: "Visit details Field inputs",
  });

  addApi({
    sno: 2,
    name: "Toggle Capture Checklist Item",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/visits/{visitId}/capture",
    desc: "CheckRow toggleCapture(title). Matches CAPTURE_ITEMS: title + done; BE sets status Captured|Pending (FE also maps tone).",
    auth: "Yes",
    params: "Path: id, visitId",
    request: `{
  "title": "Staff activity form",
  "done": true
}`,
    response: `{
  "success": true,
  "data": {
    "id": "visit-1",
    "capture": [
      {
        "title": "House / GPS photo",
        "status": "Captured",
        "done": true
      },
      {
        "title": "Selfie with client",
        "status": "Captured",
        "done": true
      },
      {
        "title": "Staff activity form",
        "status": "Captured",
        "done": true,
        "pending": false
      },
      {
        "title": "Advance booking call log",
        "status": "Not started",
        "done": false
      }
    ],
    "captureDone": 3,
    "captureTotal": 4,
    "captureLabel": "3 of 4"
  }
}`,
    error: commonError,
    ui: "Mandatory capture CheckRow onToggle",
  });

  addApi({
    sno: 3,
    name: "Update Visit Last Action / Notes",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/visits/{visitId}/last-action",
    desc: "Updates lastAction object keys used by LastActionIcons: summary, notes, recording, transcript.",
    auth: "Yes",
    params: "Path: id, visitId",
    request: `{
  "summary": "Family open to Premium; prefers GK / South Delhi matches",
  "notes": "Discussed package options; parents want evening slots",
  "recording": "Not recorded yet",
  "transcript": "Not available"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "visit-1",
    "lastAction": {
      "summary": "Family open to Premium; prefers GK / South Delhi matches",
      "notes": "Discussed package options; parents want evening slots",
      "recording": "Not recorded yet",
      "transcript": "Not available"
    }
  }
}`,
    error: commonError,
    ui: "Meeting notes / recording / transcript data behind action icons",
  });

  mergeNote(
    "P3 note: Visit type options = Home visit | Office visit. Slot options = 11:00 AM – 1:00 PM | 2:00 PM – 4:00 PM | 5:00 PM – 7:00 PM (FE select). Capture titles must match CAPTURE_ITEMS exactly. Table columns: date, client, type, executive, capture, vehicle, status, lastAction. Advance P3→P4 = PATCH /pipeline/leads/{id}/stage.",
    {
      height: 40,
      font: { size: 10, italic: true, color: { argb: "FF6B7280" } },
    }
  );

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 6 — Package & Quote (P4)
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 6: Deal Detail — Package & Quote (P4) — File: deal-tabs/PackageQuoteTab.jsx",
    "Default tab when stageId=P4. Sections: package catalogue (PACKAGES), Discount Approvals (embedded), Upsell banner (mostly FE/AI later), Quotation, Progressive data reveal, Cross-branch price check. Selected package key comes from DealDetailPage selectedPackage.key (basic|premium|exclusive). Move P4→P5 requires package selected (FE gate) then PATCH .../stage."
  );

  addMethodSection("▶ GET Requests — Package & Quote (P4)", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Package & Quote Tab",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/package",
    desc: "Full P4 tab payload. packages[] keys match PACKAGES (key, name, price, subtitle, features[], upsellBadge). selectedKey = selected package. quote + discountApprovals + dataReveal + crossBranchPriceCheck from QuotationCard / DiscountApprovalsCard / DataRevealCard.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p4-1",
    "stageId": "P4",
    "dealCode": "MML-D-10428",
    "currency": "INR",
    "selectedKey": "premium",
    "packages": [
      {
        "key": "basic",
        "name": "Basic",
        "price": "₹25,000",
        "subtitle": "6 months · junior RM",
        "features": [
          { "label": "Profile creation & curation", "included": true },
          { "label": "Verified Report", "included": false }
        ]
      },
      {
        "key": "premium",
        "name": "Premium",
        "price": "₹51,000",
        "subtitle": "12 months, senior RM only",
        "features": [
          { "label": "Everything in Classic", "included": true },
          { "label": "Dedicated senior RM", "included": false }
        ]
      },
      {
        "key": "exclusive",
        "name": "Exclusive",
        "price": "₹1,25,000",
        "subtitle": "12 months, senior RM only",
        "upsellBadge": "+74,000",
        "features": [
          { "label": "Everything in Premium", "included": true },
          { "label": "Founder-approved special access", "included": true }
        ]
      }
    ],
    "discountApprovals": [
      {
        "id": "da-1",
        "raised": "28 July",
        "requested": "₹51,000",
        "discount": "14.7%",
        "approver": "Pooja Sharma",
        "level": "Branch Head",
        "status": "Pending"
      },
      {
        "id": "da-2",
        "raised": "v2",
        "requested": "₹48,000",
        "discount": "5.9%",
        "approver": "Vinay Gupta",
        "level": "Team Lead",
        "status": "Approved"
      }
    ],
    "quote": {
      "versionLabel": "Draft v2",
      "items": [
        {
          "item": "Premium Package",
          "note": "12 months membership",
          "type": "Base",
          "qty": 1,
          "quoted": "₹51,000",
          "rate": "₹51,000"
        },
        {
          "item": "Kundli / horoscope service",
          "note": "Redeemable against wallet credits",
          "type": "Base",
          "qty": 1,
          "quoted": "₹51,000",
          "rate": "₹2,500"
        },
        {
          "item": "Verified Profile Report",
          "note": "Included in Premium – no charge",
          "type": "Base",
          "qty": 1,
          "quoted": "₹51,000",
          "rate": "₹0"
        }
      ],
      "summary": [
        { "label": "Subtotal", "value": "₹53,500" },
        { "label": "Approved discount", "value": "-₹7,500" },
        { "label": "Wallet credits applied (referral)", "value": "-₹1000" },
        { "label": "GST @ 18%", "value": "₹8,100" }
      ],
      "totalPayable": "₹53,100"
    },
    "dataReveal": [
      {
        "label": "Level 1 — Photo",
        "note": "All packages · on shortlist",
        "done": true
      },
      {
        "label": "Level 2 — Basic details",
        "note": "All packages · age, height, education",
        "done": true
      },
      {
        "label": "Level 3 — Contact",
        "note": "Premium & Exclusive · RM approval required",
        "done": true
      },
      {
        "label": "Level 4 — Address",
        "note": "Exclusive only · Branch Head approval",
        "done": false
      }
    ],
    "crossBranchPriceCheck": {
      "title": "Client contacted Rajouri branch.",
      "detail": "Quoted ₹51,000 there too. Flagged to your Branch Head on 29 Jun"
    }
  }
}`,
    error: commonError,
    ui: "PackageQuoteTab full layout",
  });

  addApi({
    sno: 2,
    name: "Get Discount Approvals",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/discounts",
    desc: "Discount approval rows only (same shape as PackageQuoteTab DiscountApprovalsCard / DiscountApprovalsTab INITIAL_APPROVALS).",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "items": [
      {
        "id": "da-1",
        "raised": "28 July",
        "requested": "₹51,000",
        "discount": "14.7%",
        "approver": "Pooja Sharma",
        "level": "Branch Head",
        "status": "Pending"
      }
    ]
  }
}`,
    error: commonError,
    ui: "Discount Approvals table",
  });

  addApi({
    sno: 3,
    name: "Preview Quote PDF",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/quote/preview",
    desc: "Preview PDF button — returns file or download URL (FE toast: Generating quote PDF preview...).",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `Binary PDF
OR
{
  "success": true,
  "data": {
    "downloadUrl": "https://...",
    "expiresAt": "2026-07-02T12:00:00Z"
  }
}`,
    error: commonError,
    ui: "QuotationCard Preview PDF",
  });

  r++;

  addMethodSection("▶ POST Requests — Package & Quote (P4)", "FF16A34A");

  addApi({
    sno: 1,
    name: "Select Package",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/package/select",
    desc: "PackageCard Select → onPackageSelect(pkg). Body key matches PACKAGES.key (basic|premium|exclusive). Required before Move to P5 in DealDetailPage.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "key": "premium"
}`,
    response: `{
  "success": true,
  "data": {
    "selectedKey": "premium",
    "name": "Premium",
    "price": "₹51,000"
  }
}`,
    error: `{
  "success": false,
  "message": "Invalid package key"
}`,
    ui: "PackageCard Select / DealDetailPage selectedPackage",
  });

  addApi({
    sno: 2,
    name: "Request Discount",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/discounts",
    desc: "Request discount modal fields: requested, discount, level (Team Lead|Branch Head|Founder). Creates row status Pending; approver assigned by level matrix.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "requested": "51000",
  "discount": "10",
  "level": "Team Lead"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "da-3",
    "raised": "Just now",
    "requested": "₹51,000",
    "discount": "10%",
    "approver": "Vinay Gupta",
    "level": "Team Lead",
    "status": "Pending"
  }
}`,
    error: `{
  "success": false,
  "message": "Please add requested amount and discount.",
  "errors": [
    { "field": "requested", "message": "Please add requested amount and discount." }
  ]
}`,
    ui: "DiscountApprovalsCard Request discount form",
  });

  addApi({
    sno: 3,
    name: "Add Quote Add-on",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/quote/items",
    desc: "Add add-on modal: itemName → item, quoted → quoted/rate, type Add-on, qty 1 (QuotationCard handleSave).",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "item": "Photo reshoot",
  "quoted": "2500"
}`,
    response: `{
  "success": true,
  "data": {
    "item": "Photo reshoot",
    "note": "Added to this quote",
    "type": "Add-on",
    "qty": 1,
    "quoted": "₹2,500",
    "rate": "₹2,500",
    "totalPayable": "₹55,600"
  }
}`,
    error: `{
  "success": false,
  "message": "Please add an item and amount."
}`,
    ui: "QuotationCard Add add-on",
  });

  addApi({
    sno: 4,
    name: "Send Quote to Client",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/quote/send",
    desc: "Send quote to client button (FE toast: Quote sent to client.). Typically allowed after discount approved.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "channel": "email"
}`,
    response: `{
  "success": true,
  "data": {
    "sent": true,
    "sentAt": "2026-07-02T11:00:00Z"
  }
}`,
    error: commonError,
    ui: "QuotationCard Send quote to client",
  });

  addApi({
    sno: 5,
    name: "Create Payment Link",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/quote/payment-link",
    desc: "Payment link button — returns shareable URL (FE: Payment link copied and ready to share).",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body) or {}",
    response: `{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.example/mml/...",
    "amount": "₹53,100"
  }
}`,
    error: commonError,
    ui: "QuotationCard Payment link",
  });

  r++;

  addMethodSection("▶ PUT / PATCH Requests — Package & Quote (P4)", "FFD97706");

  addApi({
    sno: 1,
    name: "Toggle Data Reveal Level",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/package/data-reveal",
    desc: "DataRevealCard toggleLevel(label). Keys: label + done (DATA_REVEAL_LEVELS).",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "label": "Level 4 — Address",
  "done": true
}`,
    response: `{
  "success": true,
  "data": {
    "dataReveal": [
      {
        "label": "Level 1 — Photo",
        "note": "All packages · on shortlist",
        "done": true
      },
      {
        "label": "Level 2 — Basic details",
        "note": "All packages · age, height, education",
        "done": true
      },
      {
        "label": "Level 3 — Contact",
        "note": "Premium & Exclusive · RM approval required",
        "done": true
      },
      {
        "label": "Level 4 — Address",
        "note": "Exclusive only · Branch Head approval",
        "done": true
      }
    ]
  }
}`,
    error: commonError,
    ui: "Progressive data reveal checklist",
  });

  addApi({
    sno: 2,
    name: "Update Discount Approval Status",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/discounts/{discountId}",
    desc: "Approver action — status Pending|Approved (and reject if product adds it). Updates quote Approved discount line when approved.",
    auth: "Yes",
    params: "Path: id, discountId",
    request: `{
  "status": "Approved"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "da-1",
    "status": "Approved",
    "approver": "Pooja Sharma",
    "level": "Branch Head"
  }
}`,
    error: commonError,
    ui: "Discount approval workflow (authority matrix)",
  });

  mergeNote(
    "P4 note: Package keys = basic|premium|exclusive. Discount levels = Team Lead|Branch Head|Founder. Quote line keys = item, note, type, qty, quoted, rate. AI pitch buttons are FE toast/coming soon — optional later. Currency INR / NRI USD toggle: INR live; USD coming soon on FE. Advance P4→P5 = select package then PATCH .../stage.",
    {
      height: 42,
      font: { size: 10, italic: true, color: { argb: "FF6B7280" } },
    }
  );

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 7 — Documents & KYC
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 7: Deal Detail — Documents & KYC — File: deal-tabs/DocumentsKycTab.jsx",
    "Also embedded in Intake Documents & KYC modal (getSelectedDocs = docs where done=true). Doc row keys: id, label, fileName, done, mandatory."
  );

  addMethodSection("▶ GET Requests — Documents & KYC", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Documents & KYC List",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/documents",
    desc: "Document checklist rows matching INITIAL_DOCUMENTS.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "items": [
      {
        "id": "doc-1",
        "label": "Aadhaar card — client",
        "fileName": "",
        "done": false,
        "mandatory": true
      },
      {
        "id": "doc-2",
        "label": "PAN card — client",
        "fileName": "pan-front.jpg",
        "done": true,
        "mandatory": true
      }
    ]
  }
}`,
    error: commonError,
    ui: "DocumentsKycTab list / Intake selected docs",
  });

  r++;
  addMethodSection("▶ POST Requests — Documents & KYC", "FF16A34A");

  addApi({
    sno: 1,
    name: "Add Document Row",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/documents",
    desc: "Add Row modal: nameDraft → label, mandatoryDraft → mandatory.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "label": "Passport — client",
  "mandatory": false
}`,
    response: `{
  "success": true,
  "data": {
    "id": "doc-8",
    "label": "Passport — client",
    "fileName": "",
    "done": false,
    "mandatory": false
  }
}`,
    error: `{
  "success": false,
  "message": "Please enter a document name."
}`,
    ui: "Add document modal",
  });

  addApi({
    sno: 2,
    name: "Upload Document File",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/documents/{docId}/upload",
    desc: "Attach & Upload — sets fileName and done=true (handleFileChosen).",
    auth: "Yes",
    params: "Path: id, docId",
    request: `multipart/form-data:
file: (binary)`,
    response: `{
  "success": true,
  "data": {
    "id": "doc-1",
    "fileName": "aadhaar-front.jpg",
    "done": true
  }
}`,
    error: commonError,
    ui: "Attach & Upload button",
  });

  r++;
  addMethodSection("▶ PUT / PATCH / DELETE — Documents & KYC", "FFD97706");

  addApi({
    sno: 1,
    name: "Update Document Row",
    method: "PUT",
    endpoint: "/api/v1/pipeline/leads/{id}/documents/{docId}",
    desc: "Edit modal: label + mandatory.",
    auth: "Yes",
    params: "Path: id, docId",
    request: `{
  "label": "Aadhaar card — client",
  "mandatory": true
}`,
    response: `{
  "success": true,
  "data": {
    "id": "doc-1",
    "label": "Aadhaar card — client",
    "mandatory": true
  }
}`,
    error: commonError,
    ui: "Edit document pencil",
  });

  addApi({
    sno: 2,
    name: "Toggle Document Done",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/documents/{docId}/done",
    desc: "ChecklistCheck toggleDoc(id).",
    auth: "Yes",
    params: "Path: id, docId",
    request: `{
  "done": true
}`,
    response: `{
  "success": true,
  "data": {
    "id": "doc-1",
    "done": true
  }
}`,
    error: commonError,
    ui: "Document checklist checkbox",
  });

  addApi({
    sno: 3,
    name: "Delete Document Row",
    method: "DELETE",
    endpoint: "/api/v1/pipeline/leads/{id}/documents/{docId}",
    desc: "deleteDoc(id).",
    auth: "Yes",
    params: "Path: id, docId",
    request: "—",
    response: `{
  "success": true,
  "data": {
    "id": "doc-3",
    "deleted": true
  }
}`,
    error: commonError,
    ui: "Trash delete button",
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 8 — Notes & RM Flags
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 8: Deal Detail — Notes & RM Flags — File: deal-tabs/NotesRmFlagsTab.jsx",
    "Note object keys: title, note, tag (RM note|Flag), tone (blue|amber), alert (boolean for Flag)."
  );

  addMethodSection("▶ GET Requests — Notes & RM Flags", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Notes & RM Flags",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/notes",
    desc: "List matching INITIAL_NOTES shape.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "items": [
      {
        "id": "note-1",
        "title": "Family dynamics",
        "note": "Father is the decision maker and the payer.",
        "tag": "RM note",
        "tone": "blue",
        "alert": false
      },
      {
        "id": "note-2",
        "title": "Preference mismatch",
        "note": "Client wants a doctor in NCR, parents will consider Punjab.",
        "tag": "Flag",
        "tone": "amber",
        "alert": true
      }
    ]
  }
}`,
    error: commonError,
    ui: "NotesRmFlagsTab list",
  });

  r++;
  addMethodSection("▶ POST Requests — Notes & RM Flags", "FF16A34A");

  addApi({
    sno: 1,
    name: "Add Note / Flag",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/notes",
    desc: "Add note form: title, body→note, kind→tag (RM note|Flag). Flag sets tone amber + alert true.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "title": "Family dynamics",
  "note": "Father is the decision maker and the payer.",
  "kind": "RM note"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "note-3",
    "title": "Family dynamics",
    "note": "Father is the decision maker and the payer.",
    "tag": "RM note",
    "tone": "blue",
    "alert": false
  }
}`,
    error: `{
  "success": false,
  "message": "Please add a title and note."
}`,
    ui: "Add note modal (title, kind, note/body)",
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 9 — Audit
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 9: Deal Detail — Audit — File: deal-tabs/AuditTab.jsx",
    "Immutable log. Row keys: timestamp, actor, action, object, source. FE may mask rows by stage (maskAuditLog)."
  );

  addMethodSection("▶ GET Requests — Audit", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Audit Log",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/audit",
    desc: "Audit table rows. Optional stage query for progressive reveal like maskAuditLog(currentStage).",
    auth: "Yes",
    params: `Path: id
Query: stage — P0|P1|...|P6 (optional)`,
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "items": [
      {
        "timestamp": "28 Jul 09:14",
        "actor": "Rohit Khanna",
        "action": "Viewed masked mobile",
        "object": "Client contact",
        "source": "CRM Web"
      },
      {
        "timestamp": "26 Jul 17:02",
        "actor": "Rohit Khanna",
        "action": "Raised discount request",
        "object": "Quote v2",
        "source": "CRM Web"
      }
    ]
  }
}`,
    error: commonError,
    ui: "AuditTab table",
  });

  addApi({
    sno: 2,
    name: "Export Audit Log",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/audit/export",
    desc: "Export log button.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: `Binary file download (xlsx/csv)
OR { "success": true, "data": { "downloadUrl": "https://..." } }`,
    error: commonError,
    ui: "TabHeaderButton Export log",
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 10 — Payments (P5)
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 10: Deal Detail — Payments / Contract (P5) — File: deal-tabs/PaymentsTab.jsx",
    "Unlocked at P5 (locked overlay before). Consents: title, note, status, done, pending. Payments: date, mode, reference, amount, collectedBy, status, invoice{name,shared,sharedNote}. Contract timeline: tone, title, note, time. Filters: dealFilter, modeFilter."
  );

  addMethodSection("▶ GET Requests — Payments (P5)", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get Payments Tab",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/payments",
    desc: "Consents + payments list + contractTimeline + totals footnote fields.",
    auth: "Yes",
    params: `Path: id
Query:
mode — all|UPI|Cheque|Payment link
scope — deal|all (FE dealFilter)`,
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p5-1",
    "stageId": "P5",
    "dealCode": "MML-D-10428",
    "totals": {
      "totalIncludingGst": "₹53,100",
      "collected": "₹35,000",
      "outstanding": "₹18,100"
    },
    "consents": [
      {
        "title": "Data privacy notification",
        "note": "Accepted by the client on 29 Jun, 4:02 PM.",
        "status": "Accepted",
        "done": true
      },
      {
        "title": "Marketing consent",
        "note": "Opted in to WhatsApp and email · opted out of SMS.",
        "status": "Partial",
        "done": false,
        "pending": true
      }
    ],
    "payments": [
      {
        "date": "29 Jun 2026",
        "mode": "UPI",
        "reference": "MML-R-88213",
        "amount": "₹15,000",
        "collectedBy": "Payment link",
        "status": "Received",
        "invoice": {
          "name": "Invoice-MML-R-88213.pdf",
          "shared": true,
          "sharedNote": "Sent by Rohit K. · 29 Jun, 4:18 PM"
        }
      },
      {
        "date": "Due 02 Aug",
        "mode": "Payment link",
        "reference": "MML-R-88512",
        "amount": "₹18,100",
        "collectedBy": "—",
        "status": "Awaiting",
        "invoice": {
          "name": "Invoice-MML-R-88512.pdf",
          "shared": false,
          "sharedNote": "Not shared yet"
        }
      }
    ],
    "contractTimeline": [
      {
        "title": "OTP verified & signed",
        "note": "OTP sent to +91 98•• •• 4412.",
        "time": "29 Jun 2026, 6:18 PM — client",
        "tone": "green"
      },
      {
        "title": "Contract generated from quote v2",
        "note": "Premium package — ₹53,100 after approved discount and GST.",
        "time": "29 Jun 2026, 5:40 PM — you",
        "tone": "green"
      }
    ]
  }
}`,
    error: commonError,
    ui: "PaymentsTab full screen",
  });

  addApi({
    sno: 2,
    name: "Download Invoice PDF",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/payments/{reference}/invoice",
    desc: "Per-row invoice Download (invoice.name).",
    auth: "Yes",
    params: "Path: id, reference (e.g. MML-R-88213)",
    request: "— (no body)",
    response: "Binary PDF download",
    error: commonError,
    ui: "InvoiceCell Download",
  });

  addApi({
    sno: 3,
    name: "Download Consolidated Invoice",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/payments/invoice-pdf",
    desc: "Header Invoice PDF button.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: "Binary PDF download",
    error: commonError,
    ui: "OutlineButton Invoice PDF",
  });

  r++;
  addMethodSection("▶ POST / PATCH — Payments (P5)", "FF16A34A");

  addApi({
    sno: 1,
    name: "Share / Reshare Invoice",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/payments/{reference}/invoice/share",
    desc: "InvoiceCell Send/Reshare — sets invoice.shared true + sharedNote.",
    auth: "Yes",
    params: "Path: id, reference",
    request: `{
  "channel": "whatsapp"
}`,
    response: `{
  "success": true,
  "data": {
    "reference": "MML-R-88512",
    "invoice": {
      "name": "Invoice-MML-R-88512.pdf",
      "shared": true,
      "sharedNote": "Sent & shared by sales · just now"
    }
  }
}`,
    error: commonError,
    ui: "InvoiceCell Send / Reshare",
  });

  addApi({
    sno: 2,
    name: "Toggle Consent Item",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/payments/consents",
    desc: "toggleConsent(title) — done + status Accepted|Pending.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "title": "Marketing consent",
  "done": true
}`,
    response: `{
  "success": true,
  "data": {
    "title": "Marketing consent",
    "done": true,
    "status": "Accepted"
  }
}`,
    error: commonError,
    ui: "Consent & compliance CheckRow",
  });

  addApi({
    sno: 3,
    name: "Advance to P6 (from Payments)",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/payments/advance-p6",
    desc: "Advance to P6 button. FE blocks while outstanding balance exists. On success stageId becomes P6 (or call existing PATCH stage).",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body) or {}",
    response: `{
  "success": true,
  "data": {
    "stageId": "P6",
    "outstanding": "₹0"
  }
}`,
    error: `{
  "success": false,
  "message": "P6 stays locked until the balance clears."
}`,
    ui: "PrimaryButton Advance to P6",
  });

  mergeNote(
    "Payments note: Payment history button is FE navigate/toast for now. Status values: Received|Cleared|Awaiting. Modes: UPI|Cheque|Payment link.",
    { height: 28, font: { size: 10, italic: true, color: { argb: "FF6B7280" } } }
  );

  r += 2;

  // ═══════════════════════════════════════════════════════════
  // PAGE 11 — P6 Handover Checklist
  // ═══════════════════════════════════════════════════════════
  addPageHeading(
    "PAGE 11: Deal Detail — Handover to Services (P6) — File: deal-tabs/P6ChecklistTab.jsx",
    "Checklist sections (n, heading, items[{title,note,status,done}]). Handover queue rows: deal, client, pkg, verified, verifiedPct, blocking, owner, status. Handover assigns service manager (DealDetailPage DUMMY_MANAGER → serviceAssigned {manager, branch})."
  );

  addMethodSection("▶ GET Requests — P6 Checklist", "FF2563EB");

  addApi({
    sno: 1,
    name: "Get P6 Handover Checklist",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/p6",
    desc: "Sections + progress + serviceAssigned + queue (optional branch-wide).",
    auth: "Yes",
    params: `Path: id
Query:
sortMode — blocked|ready
period — month|quarter`,
    request: "— (no body)",
    response: `{
  "success": true,
  "data": {
    "id": "p6-1",
    "stageId": "P6",
    "clientName": "Sanjay Mehta",
    "doneCount": 13,
    "totalCount": 16,
    "percent": 81,
    "checklistReady": false,
    "serviceAssigned": null,
    "sections": [
      {
        "n": 1,
        "heading": "Identity & verification documents",
        "items": [
          {
            "title": "Aadhaar card",
            "note": "Auto-verified via KYC API on 29 Jun.",
            "status": "Verified",
            "done": true
          },
          {
            "title": "Police verification",
            "note": "Third-party request raised 24 Jul.",
            "status": "In progress",
            "done": false
          }
        ]
      },
      {
        "n": 4,
        "heading": "Commercial & consent",
        "items": [
          {
            "title": "Payment cleared in full",
            "note": "₹18,100 balance outstanding.",
            "status": "Pending",
            "done": false
          },
          {
            "title": "Contract signed with OTP",
            "note": "Signed 29 Jun, 6:18 PM.",
            "status": "Verified",
            "done": true
          }
        ]
      }
    ],
    "queue": [
      {
        "deal": "MML-D-10428",
        "client": "Sanjay Mehta",
        "pkg": "Premium",
        "verified": "13/16",
        "verifiedPct": 81,
        "blocking": "Balance payment",
        "owner": "Rohit Khanna",
        "status": "Blocked"
      }
    ]
  }
}`,
    error: commonError,
    ui: "P6ChecklistTab",
  });

  r++;
  addMethodSection("▶ POST / PATCH — P6 Checklist", "FF16A34A");

  addApi({
    sno: 1,
    name: "Toggle P6 Checklist Item",
    method: "PATCH",
    endpoint: "/api/v1/pipeline/leads/{id}/p6/items",
    desc: "toggleItem(title) — done + status Verified|Pending.",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "title": "Payment cleared in full",
  "done": true
}`,
    response: `{
  "success": true,
  "data": {
    "title": "Payment cleared in full",
    "done": true,
    "status": "Verified",
    "doneCount": 14,
    "totalCount": 16,
    "percent": 88,
    "checklistReady": false
  }
}`,
    error: commonError,
    ui: "P6 CheckRow onToggle",
  });

  addApi({
    sno: 2,
    name: "Verify All Documents",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/p6/verify-all",
    desc: "verifyAll() — marks every checklist item done/Verified.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body) or {}",
    response: `{
  "success": true,
  "data": {
    "doneCount": 16,
    "totalCount": 16,
    "percent": 100,
    "checklistReady": true
  }
}`,
    error: commonError,
    ui: "PrimaryButton Verify all documents",
  });

  addApi({
    sno: 3,
    name: "Handover to Services",
    method: "POST",
    endpoint: "/api/v1/pipeline/leads/{id}/p6/handover",
    desc: "Handover to services / assign service manager. Returns serviceAssigned {manager, branch} (FE BranchManagerAssignedModal).",
    auth: "Yes",
    params: "Path: id",
    request: `{
  "managerId": "u-mgr-1"
}`,
    response: `{
  "success": true,
  "data": {
    "serviceAssigned": {
      "manager": "Anita Kapoor",
      "branch": "Rajouri Garden"
    },
    "stageId": "P6",
    "handedOver": true
  }
}`,
    error: `{
  "success": false,
  "message": "Checklist incomplete — handover blocked."
}`,
    ui: "Handover to services / Service manager is assigned",
  });

  addApi({
    sno: 4,
    name: "Download Checklist Template",
    method: "GET",
    endpoint: "/api/v1/pipeline/leads/{id}/p6/checklist-template",
    desc: "Checklist template button download.",
    auth: "Yes",
    params: "Path: id",
    request: "— (no body)",
    response: "Binary file download",
    error: commonError,
    ui: "OutlineButton Checklist template",
  });

  mergeNote(
    "P6 note: Queue filters sortMode blocked|ready and period month|quarter are query params on GET. Founder exception release can be a later PATCH — FE footnote only today. Stage moves still use PATCH .../stage where applicable.",
    { height: 36, font: { size: 10, italic: true, color: { argb: "FF6B7280" } } }
  );

  r += 2;

  mergeNote("DOCUMENT COMPLETE — Pipeline deal detail tabs covered", {
    font: { bold: true, size: 11, color: { argb: "FF111827" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7F8EF" } },
  });
  mergeNote(
    "Covered pages: 1 Board · 2 Add P0 · 3 Overview · 4 Intake P2 · 5 Visits P3 · 6 Package P4 · 7 Documents · 8 Notes · 9 Audit · 10 Payments P5 · 11 P6 Checklist. Optional later: Cross-branch flags detail page, Calendar CreateTask from deal header, Call logging. Same rules throughout: FE static UI; BE dynamic camelCase fields from frontend.",
    { height: 44 }
  );
  mergeNote(
    "Document version: 2.0  |  Full deal-detail pipeline API set  |  Status: Ready for client / backend review",
    { font: { size: 9, italic: true, color: { argb: "FF9CA3AF" } } }
  );

  await wb.xlsx.writeFile(OUT);
  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
