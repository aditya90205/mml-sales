const RANK = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4, P5: 5, P6: 6 };

export function stageRank(stage) {
  return RANK[stage] ?? 0;
}

export function atLeast(stage, minStage) {
  return stageRank(stage) >= stageRank(minStage);
}

export const FULL_STAGE_HISTORY = [
  { stage: "P0 Prospect",        entered: "24 Jun", exited: "25 Jun", duration: "1d",  sla: "3d",  status: "Within SLA" },
  { stage: "P1 Qualified",       entered: "25 Jun", exited: "27 Jun", duration: "2d",  sla: "5d",  status: "Within SLA" },
  { stage: "P2 Data Collection", entered: "27 Jun", exited: "1 Jul",  duration: "4d",  sla: "7d",  status: "Within SLA" },
  { stage: "P3 Visit / Video",   entered: "1 Jul",  exited: "19 Jul", duration: "18d", sla: "10d", status: "Breached" },
  { stage: "P4 Negotiation",     entered: "19 Jul", exited: "28 Jul", duration: "9d",  sla: "7d",  status: "Breached - escalated" },
  { stage: "P5 Payment",         entered: "28 Jul", exited: "02 Aug", duration: "5d",  sla: "5d",  status: "Within SLA" },
  { stage: "P6 Handover",        entered: "02 Aug", exited: "-",      duration: "1d",  sla: "3d",  status: "Within SLA" },
];

export const EMPTY = "-";

export function maybeDash(hasValue, value) {
  return hasValue ? value : EMPTY;
}

/** Keep row shape; replace values with "-" except keys listed in `keep`. */
export function dashRow(row, keep = []) {
  const next = { ...row };
  for (const key of Object.keys(next)) {
    if (keep.includes(key)) continue;
    const value = next[key];
    if (typeof value === "boolean") next[key] = false;
    else if (key === "tone" || key.endsWith("Tone")) next[key] = "gray";
    else if (value && typeof value === "object") continue;
    else next[key] = EMPTY;
  }
  return next;
}

export function dashRows(rows, empty, keep = []) {
  if (!empty) return rows;
  return rows.map((row) => dashRow(row, keep));
}

export function historyUntil(stage) {
  const current = stageRank(stage);
  return FULL_STAGE_HISTORY.map((row, i) => {
    if (i < current) return row;
    if (i === current) return { ...row, exited: EMPTY };
    return dashRow(row, ["stage"]);
  });
}

export function stageGateFor(stage) {
  const r = stageRank(stage);
  return [
    { label: "Intake form complete", done: r >= 1 },
    { label: "Video call or visit logged", done: r >= 3 },
    { label: "Package selected & quoted", done: r >= 4 },
    { label: "Discount approved (if any)", done: r >= 5 },
    { label: "KYC documents uploaded", done: r >= 5 },
  ];
}

export function auditRowsFor(stage) {
  if (stageRank(stage) <= 1) return [0];
  if (stageRank(stage) <= 3) return [0, 4];
  if (stage === "P4") return [0, 1, 3, 4];
  return [0, 1, 2, 3, 4];
}

export function maskAuditLog(stage, log) {
  const keep = new Set(auditRowsFor(stage));
  return log.map((row, i) => (keep.has(i) ? row : dashRow(row)));
}
