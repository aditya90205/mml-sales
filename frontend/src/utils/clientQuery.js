export const FIELD_OPTIONS = ["Gender", "Area", "Branch", "Status", "Education / College", "Income (LPA)"];

export const OPERATOR_OPTIONS = ["is", "is not", "contains", "greater than", "less than"];

const FIELD_KEY_MAP = {
  Gender: "gender",
  Area: "area",
  Branch: "branch",
  Status: "status",
  "Education / College": "education",
  "Income (LPA)": "incomeLpa",
};

export function makeCondition() {
  return { id: `c${Date.now()}${Math.random().toString(16).slice(2)}`, field: "Gender", operator: "is", value: "" };
}

export function matchesCondition(client, condition) {
  const key = FIELD_KEY_MAP[condition.field];
  if (!key || !condition.value) return true;
  const raw = client[key];

  if (key === "incomeLpa") {
    const target = parseFloat(condition.value);
    if (Number.isNaN(target)) return true;
    if (condition.operator === "greater than") return raw > target;
    if (condition.operator === "less than") return raw < target;
    return raw === target;
  }

  const fieldVal = String(raw ?? "").toLowerCase();
  const val = String(condition.value).toLowerCase();

  switch (condition.operator) {
    case "is not":
      return fieldVal !== val;
    case "contains":
      return fieldVal.includes(val);
    default:
      return fieldVal === val || fieldVal.includes(val);
  }
}

export function matchesAll(client, conditions, mode = "ALL") {
  const active = conditions.filter((c) => c.value?.trim());
  if (active.length === 0) return true;
  return mode === "ALL" ? active.every((c) => matchesCondition(client, c)) : active.some((c) => matchesCondition(client, c));
}

/** Very small heuristic parser turning a natural-language description into structured conditions. */
export function parseDescription(text) {
  const lower = text.toLowerCase();
  const conditions = [];

  if (/\bgirls?\b|\bfemale\b|\bwomen\b/.test(lower)) {
    conditions.push({ ...makeCondition(), field: "Gender", operator: "is", value: "Female" });
  } else if (/\bboys?\b|\bmale\b|\bmen\b/.test(lower)) {
    conditions.push({ ...makeCondition(), field: "Gender", operator: "is", value: "Male" });
  }

  const fromMatch = lower.match(/from\s+([a-z\s]+?)(?:\s+who|\s+with|\s*$)/);
  if (fromMatch) {
    conditions.push({ ...makeCondition(), field: "Area", operator: "is", value: fromMatch[1].trim().replace(/\b\w/g, (c) => c.toUpperCase()) });
  }

  const collegeMatch = lower.match(/\b(iim|iit|mba|mbbs|b\.?tech)\b/);
  if (collegeMatch) {
    conditions.push({ ...makeCondition(), field: "Education / College", operator: "contains", value: collegeMatch[1].toUpperCase() });
  }

  const incomeMatch = lower.match(/(\d+)\s*\+?\s*lpa/);
  if (incomeMatch) {
    conditions.push({ ...makeCondition(), field: "Income (LPA)", operator: "greater than", value: incomeMatch[1] });
  }

  return conditions;
}
