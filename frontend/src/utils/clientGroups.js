import { parseDescription } from "./clientQuery.js";

const STORAGE_KEY = "mml_client_saved_groups";

const DEFAULT_GROUPS = [
  {
    id: "g1",
    name: "IIM alumni",
    matchMode: "ALL",
    conditions: [{ field: "Education / College", operator: "contains", value: "IIM" }],
  },
  {
    id: "g2",
    name: "Female - Rohini",
    matchMode: "ALL",
    conditions: [
      { field: "Gender", operator: "is", value: "Female" },
      { field: "Area", operator: "is", value: "Rohini" },
    ],
  },
  {
    id: "g3",
    name: "High earners 40+ LPA",
    matchMode: "ALL",
    conditions: [{ field: "Income (LPA)", operator: "greater than", value: "40" }],
  },
  {
    id: "g4",
    name: "IIT engineers",
    matchMode: "ALL",
    conditions: [{ field: "Education / College", operator: "contains", value: "IIT" }],
  },
];

function hydrateGroup(group) {
  if (Array.isArray(group.conditions) && group.conditions.length) return group;
  const def = DEFAULT_GROUPS.find((d) => d.name === group.name);
  if (def) return { ...group, conditions: def.conditions, matchMode: def.matchMode };
  return group;
}

export function readSavedGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
      return DEFAULT_GROUPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(hydrateGroup) : DEFAULT_GROUPS;
  } catch {
    return DEFAULT_GROUPS;
  }
}

function writeSavedGroups(groups) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    /* ignore */
  }
}

export function addSavedGroup({ name, conditions = [], matchMode = "ALL" }) {
  const next = [...readSavedGroups(), { id: `g${Date.now()}`, name, conditions, matchMode }];
  writeSavedGroups(next);
  return next;
}

export function removeSavedGroup(id) {
  const next = readSavedGroups().filter((g) => g.id !== id);
  writeSavedGroups(next);
  return next;
}

export function groupQuery(group) {
  if (Array.isArray(group?.conditions) && group.conditions.length) {
    return { conditions: group.conditions, matchMode: group.matchMode || "ALL" };
  }
  return { conditions: parseDescription(group?.name || ""), matchMode: "ALL" };
}
