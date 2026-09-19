/** Keep the uploaded biodata file so P2 can View / Download it. */

const PENDING_KEY = "__pending__";
const PREFIX = "mml-biodata-file:";
const MAX_PERSIST_CHARS = 1_400_000;
const memory = new Map();

function storageKey(leadId) {
  return `${PREFIX}${leadId}`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsDataURL(blob);
  });
}

function persist(leadId, record) {
  if (!leadId || !record?.dataUrl || record.dataUrl.length > MAX_PERSIST_CHARS) return;
  try {
    sessionStorage.setItem(storageKey(leadId), JSON.stringify({
      name: record.name,
      type: record.type,
      dataUrl: record.dataUrl,
    }));
  } catch {
    /* quota / private mode */
  }
}

function readPersisted(leadId) {
  try {
    const raw = sessionStorage.getItem(storageKey(leadId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearPersisted(leadId) {
  try {
    sessionStorage.removeItem(storageKey(leadId));
  } catch {
    /* ignore */
  }
}

export function getBiodataFile(leadId) {
  if (!leadId) return null;
  return memory.get(leadId) || readPersisted(leadId);
}

export async function rememberBiodataFile(leadId, file) {
  if (!leadId || !file) return null;
  const dataUrl = file.dataUrl || (file instanceof Blob ? await blobToDataUrl(file) : "");
  if (!dataUrl) return getBiodataFile(leadId);
  const record = {
    name: file.name || "biodata.pdf",
    type: file.type || "application/octet-stream",
    dataUrl,
  };
  memory.set(leadId, record);
  persist(leadId, record);
  return record;
}

export async function rememberPendingBiodataFile(file) {
  return rememberBiodataFile(PENDING_KEY, file);
}

export function assignPendingBiodataFile(leadId) {
  if (!leadId) return null;
  const record = getBiodataFile(PENDING_KEY);
  if (!record) return null;
  memory.set(leadId, record);
  persist(leadId, record);
  memory.delete(PENDING_KEY);
  clearPersisted(PENDING_KEY);
  return record;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const PREVIEW_FIELDS = [
  ["Looking for", "lookingFor"],
  ["NRI", "nri"],
  ["Enquiry made by", "enquiryBy"],
  ["First name", "firstName"],
  ["Middle name", "middleName"],
  ["Last name", "lastName"],
  ["Date of birth", "dob"],
  ["Profession", "profession"],
  ["Mobile", "mobile"],
  ["Email", "email"],
  ["Country", "country"],
  ["City", "city"],
  ["Area / Locality", "area"],
  ["Family income", "familyIncomeBand"],
  ["Source", "leadSource"],
  ["Meeting", "meeting"],
  ["Additional notes", "extraInfo"],
];

export function buildBiodataPreviewHtml(values = {}, fileName = "biodata.html") {
  const name = [values.firstName, values.middleName, values.lastName].filter(Boolean).join(" ") || "Client";
  const rows = PREVIEW_FIELDS
    .map(([label, key]) => [label, values[key]])
    .filter(([, value]) => String(value || "").trim())
    .map(
      ([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(fileName)}</title>
  <style>
    body { font-family: Georgia, serif; color: #111; margin: 40px; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    p { color: #6B7280; margin: 0 0 24px; font-size: 13px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border-bottom: 1px solid #E5E7EB; padding: 8px 0; text-align: left; vertical-align: top; }
    th { width: 220px; color: #6B7280; font-weight: 600; font-size: 13px; }
    td { font-size: 14px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(name)}</h1>
  <p>Uploaded biodata · ${escapeHtml(fileName)}</p>
  <table>${rows || "<tr><td>No fields captured yet.</td></tr>"}</table>
</body>
</html>`;
}

export function resolveBiodataRecord(leadId, values = {}, fileName = "") {
  const stored = getBiodataFile(leadId);
  if (stored?.dataUrl) return stored;
  const sourceName = fileName || stored?.name || "biodata";
  const name = /\.html?$/i.test(sourceName) ? sourceName : `${String(sourceName).replace(/\.[^.]+$/, "") || "biodata"}.html`;
  const html = buildBiodataPreviewHtml(values, sourceName);
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  return { name, type: "text/html", dataUrl, generated: true, html };
}

export function downloadBiodataRecord(record) {
  if (!record?.dataUrl) return;
  const link = document.createElement("a");
  link.href = record.dataUrl;
  link.download = record.name || "biodata";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function isImageBiodata(record) {
  return Boolean(record?.type?.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(record?.name || ""));
}

export function isPdfBiodata(record) {
  return Boolean(record?.type === "application/pdf" || /\.pdf$/i.test(record?.name || ""));
}
