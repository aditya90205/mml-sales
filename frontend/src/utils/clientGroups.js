const STORAGE_KEY = "mml_client_saved_groups";

const DEFAULT_GROUPS = [
  { id: "g1", name: "IIM alumni" },
  { id: "g2", name: "Female - Rohini" },
  { id: "g3", name: "High earners 40+ LPA" },
  { id: "g4", name: "IIT engineers" },
];

export function readSavedGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
      return DEFAULT_GROUPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_GROUPS;
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

export function addSavedGroup(name) {
  const next = [...readSavedGroups(), { id: `g${Date.now()}`, name }];
  writeSavedGroups(next);
  return next;
}

export function removeSavedGroup(id) {
  const next = readSavedGroups().filter((g) => g.id !== id);
  writeSavedGroups(next);
  return next;
}
