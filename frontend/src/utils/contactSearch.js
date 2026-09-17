import { readClients } from "./clientsData.js";
import { readLeads } from "./pipelineStore.js";

/** Digits only — used for mobile compare. */
export function digitsOnly(value = "") {
  return String(value).replace(/\D/g, "");
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function nameToEmail(name = "") {
  const slug = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return slug ? `${slug}@email.com` : "";
}

/** Demo mobiles for pipeline leads so name/mobile/email search works. */
const LEAD_CONTACT_EXTRA = {
  "p0-1": { mobile: "9812345678", email: "kuhu.sharma@email.com", owner: "Rohit Kumar" },
  "p0-2": { mobile: "9823456789", email: "ankit.sharma@email.com", owner: "Rohit Kumar" },
  "p1-1": { mobile: "9876544598", email: "harshit.sharma@email.com", owner: "Rohit Kumar" },
  "p1-2": { mobile: "9811122233", email: "arjun.rampal@email.com", owner: "Pooja Sharma" },
  "p2-1": { mobile: "9898989898", email: "ankur.sharma@email.com", owner: "Rohit Kumar" },
  "p2-2": { mobile: "9876501234", email: "priya.raheja@email.com", owner: "Neha Bhatia" },
  "p3-1": { mobile: "9810012345", email: "aditya.sharma@email.com", owner: "Rohit Kumar" },
  "p3-2": { mobile: "9876501235", email: "priya.raheja2@email.com", owner: "Neha Bhatia" },
  "p4-1": { mobile: "9812341111", email: "vivek.sharma@email.com", owner: "Nikhil Bansal" },
  "p4-2": { mobile: "9876501236", email: "priya.raheja3@email.com", owner: "Neha Bhatia" },
  "p5-1": { mobile: "9820098765", email: "rohit.sharma@email.com", owner: "Rohit Kumar" },
  "p5-2": { mobile: "9876501237", email: "priya.raheja4@email.com", owner: "Neha Bhatia" },
  "p6-1": { mobile: "9810061550", email: "virat.sharma@email.com", owner: "Rohit Kumar" },
  "p6-2": { mobile: "9876501238", email: "priya.raheja5@email.com", owner: "Neha Bhatia" },
};

/** Extra CRM rows for biodata mismatch demos (not always on the board). */
const EXTRA_CONTACTS = [
  {
    id: "crm-aman",
    type: "lead",
    name: "Aman Gupta",
    mobile: "9811004521",
    email: "aman.gupta@email.com",
    owner: "Neha Bhatia",
    stageId: "P1",
    mmlId: "MML - D - 10501",
    recordId: "crm-aman",
  },
  {
    id: "crm-ritika",
    type: "lead",
    name: "Ritika Sharma",
    mobile: "9876543210",
    email: "ritika@example.com",
    owner: "Rohit Kumar",
    stageId: "P0",
    mmlId: "MML - D - 10502",
    recordId: "crm-ritika",
  },
];

function flattenLeads() {
  const byStage = readLeads();
  const rows = [];
  for (const [stageId, list] of Object.entries(byStage || {})) {
    for (const lead of list || []) {
      const extra = LEAD_CONTACT_EXTRA[lead.id] || {};
      rows.push({
        id: `lead:${lead.id}`,
        type: "lead",
        recordId: lead.id,
        name: lead.name || "",
        mobile: lead.mobile || extra.mobile || "",
        email: lead.email || extra.email || nameToEmail(lead.name),
        owner: lead.owner || extra.owner || "Unassigned",
        stageId,
        mmlId: lead.mmlId || "",
      });
    }
  }
  return rows;
}

function flattenClients() {
  return (readClients() || []).map((c) => {
    const last4 = digitsOnly(c.phone).slice(-4);
    const mobile = last4 ? `98${String(100000 + (c.id || 0)).slice(-6)}${last4}`.slice(0, 10) : "";
    return {
      id: `client:${c.id}`,
      type: "client",
      recordId: String(c.id),
      name: c.name || "",
      mobile: c.mobile || mobile,
      phoneMask: c.phone || "",
      email: c.email || nameToEmail(c.name),
      owner: c.owner || "Unassigned",
      stageId: null,
      mmlId: c.clientId || "",
      status: c.status,
      branch: c.branch,
      linkedLeadId: c.linkedLeadId || null,
    };
  });
}

export function listAllContacts() {
  const seen = new Set();
  const out = [];
  for (const row of [...EXTRA_CONTACTS, ...flattenLeads(), ...flattenClients()]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

/**
 * Search leads + clients by name, mobile, and/or email.
 * Returns rows with match flags: nameOk, mobileOk, emailOk, matched (any hit).
 */
export function searchContacts({ name = "", mobile = "", email = "" } = {}) {
  const qName = String(name).trim().toLowerCase();
  const qMobile = digitsOnly(mobile);
  const qEmail = normalizeEmail(email);
  const hasQuery = Boolean(qName || qMobile || qEmail);

  if (!hasQuery) {
    return { hasQuery: false, results: [] };
  }

  const results = [];
  for (const row of listAllContacts()) {
    const rowMobile = digitsOnly(row.mobile);
    const rowEmail = normalizeEmail(row.email);
    const rowName = row.name.toLowerCase();

    const nameOk = qName ? rowName.includes(qName) : null;
    const mobileOk = qMobile
      ? rowMobile.includes(qMobile) ||
        qMobile.includes(rowMobile) ||
        (row.phoneMask && qMobile.endsWith(digitsOnly(row.phoneMask).slice(-4)))
      : null;
    const emailOk = qEmail ? rowEmail.includes(qEmail) || qEmail.includes(rowEmail) : null;

    const checks = [nameOk, mobileOk, emailOk].filter((v) => v !== null);
    const matched = checks.length > 0 && checks.some(Boolean);
    if (!matched) continue;

    const score =
      (nameOk ? 3 : 0) +
      (mobileOk ? 5 : 0) +
      (emailOk ? 4 : 0) +
      (nameOk && mobileOk ? 2 : 0);

    results.push({
      ...row,
      nameOk, // true | false | null (null = not searched)
      mobileOk,
      emailOk,
      matched: true,
      score,
    });
  }

  results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return { hasQuery: true, results };
}

/** Mock AI extraction from an uploaded biodata file (frontend demo). */
export function mockExtractBiodata(file) {
  const fileName = file?.name || "biodata.pdf";
  const sizeMb = file?.size ? (file.size / (1024 * 1024)).toFixed(1) : "1.4";

  const fields = [
    { key: "firstName", label: "First name", value: "Ritika", confidence: 99 },
    { key: "lastName", label: "Last name", value: "Sharma", confidence: 98 },
    { key: "dob", label: "Date of birth", value: "1996-04-12", confidence: 95 },
    { key: "mobile", label: "Mobile number", value: "9876543210", confidence: 99 },
    { key: "email", label: "Email", value: "ritika@example.com", confidence: 92 },
    { key: "city", label: "City", value: "Gurugram", confidence: 94 },
    { key: "area", label: "Area / locality", value: "Sector 54", confidence: 78 },
    { key: "lookingFor", label: "Looking for", value: "Groom", confidence: 88 },
    { key: "relation", label: "Relation to prospect", value: "Self", confidence: 71 },
  ];

  return {
    fileName,
    sizeLabel: `${sizeMb} MB`,
    pages: 2,
    hasTextLayer: true,
    senderMobile: "9811004521",
    biodataName: "Ritika Sharma",
    fields,
    alsoRead: [
      { label: "Height", value: "5' 4\"" },
      { label: "Community", value: "Aggarwal" },
      { label: "Education", value: "MBA — IIM Indore" },
      { label: "Occupation", value: "Product Manager" },
      { label: "Income", value: "₹ 28 LPA" },
      { label: "Family details", value: "Father retired banker · 1 sibling" },
      { label: "Manglik", value: "No" },
    ],
  };
}

export function formatDisplayMobile(mobile = "") {
  const d = digitsOnly(mobile);
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (d.length > 10) return `+${d}`;
  return mobile || "—";
}
