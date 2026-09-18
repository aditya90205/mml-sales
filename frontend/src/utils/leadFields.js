function digitsOnly(value = "") {
  return String(value).replace(/\D/g, "");
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Create Lead fields we extract / compare / require after biodata upload. */
export const CREATE_LEAD_COMPARE_FIELDS = [
  { key: "firstName", label: "First name", required: true },
  { key: "lastName", label: "Last name", required: true },
  { key: "mobile", label: "Mobile number", required: false },
  { key: "email", label: "Email", required: false },
  { key: "city", label: "City", required: true },
  { key: "area", label: "Area / locality", required: false },
  { key: "dob", label: "Date of birth", required: false },
  { key: "lookingFor", label: "Looking for", required: false },
  { key: "relation", label: "Relation to prospect", required: false },
];

export const CONTACT_REQUIRED_MESSAGE = "Enter at least one valid mobile number or email.";

export const FIELD_DUMMY_HINTS = {
  firstName: "e.g. Ritika",
  lastName: "e.g. Sharma",
  mobile: "e.g. 9876543210",
  email: "e.g. ritika@example.com",
  city: "e.g. Gurugram, Haryana",
  area: "e.g. Sector 54",
  dob: "e.g. 1996-04-12",
  lookingFor: "e.g. Groom / Bride",
  relation: "e.g. Self / Parent",
};

export const FIELD_STATUS = {
  match: "match",
  mismatch: "mismatch",
  neu: "new",
  missing: "missing",
  keep: "keep",
  empty: "empty",
};

export const FIELD_STATUS_META = {
  match: { label: "Existing", className: "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]" },
  mismatch: { label: "Different", className: "bg-[#FFFBEB] text-[#92400E] border-[#FCD34D]" },
  new: { label: "New", className: "bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]" },
  missing: { label: "Blank", className: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
  keep: { label: "Existing", className: "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]" },
  empty: { label: "Blank", className: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
};

export function isValidEmail(value) {
  const raw = String(value || "").trim();
  return Boolean(raw) && EMAIL_RE.test(raw);
}

export function isValidMobile(value) {
  return digitsOnly(value).length >= 8;
}

/** Profile / lead contact rule: at least one of mobile or email. */
export function hasValidMobileOrEmail(form = {}) {
  return isValidMobile(form.mobile) || isValidEmail(form.email);
}

export function splitName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** Normalize Create Lead + biodata + CRM values for equality checks. */
export function normalizeField(key, value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (key === "mobile") return digitsOnly(raw).slice(-10);

  if (key === "email") return raw.toLowerCase();

  if (key === "lookingFor") {
    const v = raw.toLowerCase();
    if (v === "yes" || v.includes("groom")) return "yes";
    if (v === "no" || v.includes("bride")) return "no";
    return v;
  }

  if (key === "relation") {
    const v = raw.toLowerCase();
    if (v.includes("self")) return "self";
    if (v.includes("parent")) return "parent";
    if (v.includes("sibling")) return "sibling";
    if (v.includes("relative")) return "relative";
    if (v.includes("friend")) return "friend";
    return v;
  }

  if (key === "city") {
    return raw.toLowerCase().split(",")[0].trim();
  }

  return raw.toLowerCase();
}

export function displayFieldValue(key, value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";
  if (key === "lookingFor") {
    const v = raw.toLowerCase();
    if (v === "yes" || v.includes("groom")) return "Groom";
    if (v === "no" || v.includes("bride")) return "Bride";
  }
  if (key === "mobile") {
    const d = digitsOnly(raw);
    if (d.length >= 10) return d.slice(-10);
  }
  return raw;
}

export function contactToLeadFields(row) {
  if (!row || typeof row !== "object") return {};
  const names =
    row.firstName || row.lastName
      ? { firstName: row.firstName || "", lastName: row.lastName || "" }
      : splitName(row.name);
  return {
    firstName: names.firstName || "",
    lastName: names.lastName || "",
    mobile: row.mobile || "",
    email: row.email || "",
    city: row.city || "",
    area: row.area || "",
    dob: row.dob || "",
    lookingFor: row.lookingFor || "",
    relation: row.relation || "",
  };
}

export function formToLeadFields(form) {
  if (!form || typeof form !== "object") return {};
  return {
    firstName: form.firstName || "",
    lastName: form.lastName || "",
    mobile: form.mobile || "",
    email: form.email || "",
    city: form.city || "",
    area: form.area || "",
    dob: form.dob || "",
    lookingFor: form.lookingFor || "",
    relation: form.relation || "",
  };
}

export function classifyField(key, importedValue, existingValue) {
  const imported = normalizeField(key, importedValue);
  const existing = normalizeField(key, existingValue);
  if (!imported && !existing) return FIELD_STATUS.empty;
  if (imported && !existing) return FIELD_STATUS.neu;
  if (!imported && existing) return FIELD_STATUS.keep;
  if (imported === existing) return FIELD_STATUS.match;
  return FIELD_STATUS.mismatch;
}

export function classifyLeadFields(imported = {}, existing = {}) {
  const out = {};
  for (const field of CREATE_LEAD_COMPARE_FIELDS) {
    out[field.key] = classifyField(field.key, imported[field.key], existing[field.key]);
  }
  return out;
}

/** Coerce a CRM / biodata value into Create Lead form shape. */
export function coerceCreateLeadValue(key, value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (key === "mobile") return digitsOnly(raw).replace(/^91/, "").slice(-10);
  if (key === "lookingFor") {
    const v = raw.toLowerCase();
    if (v.includes("no") || v.includes("bride")) return "no";
    return "yes";
  }
  if (key === "relation") {
    const v = raw.toLowerCase();
    if (v.includes("self")) return "Self / Prospect";
    if (v.includes("parent")) return "Parent";
    if (v.includes("sibling")) return "Sibling";
    if (v.includes("relative")) return "Relative";
    if (v.includes("friend")) return "Friend";
    return raw;
  }
  return raw;
}

/** Pending Create Lead diffs: existing record vs current / biodata values. */
export function listLeadFieldChanges(nextValues = {}, existingValues = {}) {
  const changes = [];
  for (const field of CREATE_LEAD_COMPARE_FIELDS) {
    const status = classifyField(field.key, nextValues[field.key], existingValues[field.key]);
    if (status !== FIELD_STATUS.mismatch && status !== FIELD_STATUS.neu) continue;
    changes.push({
      key: field.key,
      label: field.label,
      status,
      from: displayFieldValue(field.key, existingValues[field.key]),
      to: displayFieldValue(field.key, nextValues[field.key]),
    });
  }
  return changes;
}

/** Same rules as Create Lead submit. Returns { fieldKey: message }. */
export function validateCreateLeadFields(form = {}) {
  const errors = {};
  if (!String(form.firstName || "").trim()) {
    errors.firstName = "Prospect's first name is required.";
  }
  if (!String(form.lastName || "").trim()) {
    errors.lastName = "Prospect's last name is required.";
  }
  const mobile = String(form.mobile || "").trim();
  const email = String(form.email || "").trim();
  if (mobile && !isValidMobile(mobile)) {
    errors.mobile = "Enter a valid mobile number.";
  }
  if (email && !isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!hasValidMobileOrEmail(form)) {
    errors.mobile = CONTACT_REQUIRED_MESSAGE;
    errors.email = CONTACT_REQUIRED_MESSAGE;
  }
  if (!String(form.city || "").trim()) {
    errors.city = "City is required.";
  }
  return errors;
}

export function firstValidationMessage(errors = {}) {
  const order = CREATE_LEAD_COMPARE_FIELDS.map((f) => f.key);
  for (const key of order) {
    if (errors[key]) return errors[key];
  }
  return Object.values(errors)[0] || "";
}

export function missingRequiredLabels(form = {}) {
  const errors = validateCreateLeadFields(form);
  return CREATE_LEAD_COMPARE_FIELDS.filter((f) => errors[f.key]).map((f) => f.label);
}
