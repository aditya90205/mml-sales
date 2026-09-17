const EVENT = "mml-sales-lead-activity";
const CURRENT_USER = "Neha Sharma";

const DEMO_LEAD_IDS = new Set([
  "p0-1",
  "p0-2",
  "p0-ritika",
  "p1-1",
  "p1-2",
  "p2-1",
  "p2-2",
  "p3-1",
  "p3-2",
  "p4-1",
  "p4-2",
  "p5-1",
  "p5-2",
  "p6-1",
  "p6-2",
]);

const STAGE_RANK = {
  P0: 0,
  P1: 2,
  P2: 3,
  P3: 4,
  P4: 5,
  P5: 6,
  P6: 7,
};

/** @type {Record<string, { events: object[] }>} */
let byLead = {};

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

function uid() {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDate(value) {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function activityRank(stageId = "P0", p0Status) {
  if (stageId === "P0") return p0Status === "contacted" ? 1 : 0;
  return STAGE_RANK[stageId] ?? 0;
}

export function normalizeActivity(event = {}) {
  const at = toDate(event.at || Date.now());
  return {
    id: event.id || uid(),
    type: event.type || "note",
    title: event.title || "Activity logged",
    detail: event.detail || "",
    actor: event.actor || CURRENT_USER,
    at: at.toISOString(),
    stage: event.stage || "",
  };
}

function catalogForLead(lead = {}) {
  const name = lead.name || "this lead";
  const actor = lead.owner || lead.assignedTo || CURRENT_USER;
  return [
    {
      min: 0,
      type: "created",
      title: `Lead ${name} created`,
      detail: lead.source ? `Source: ${lead.source}` : "Added to P0 New",
      actor,
      at: "2026-06-24T10:12:00",
      stage: "P0",
    },
    {
      min: 0,
      type: "assignment",
      title: `Lead assigned to ${actor}`,
      actor: "Aditya Sharma",
      at: "2026-06-24T10:18:00",
      stage: "P0",
    },
    {
      min: 1,
      type: "call",
      title: `First contact call logged with ${name}`,
      detail: "Family confirmed interest and shared basic preferences.",
      actor,
      at: "2026-06-25T11:05:00",
      stage: "P0",
    },
    {
      min: 1,
      type: "details",
      title: "Deal details saved — moved to P0 Contacted",
      actor,
      at: "2026-06-25T11:32:00",
      stage: "P0",
    },
    {
      min: 2,
      type: "stage",
      title: "Stage advanced P0 Contacted → P1 Qualified",
      actor,
      at: "2026-06-25T16:40:00",
      stage: "P1",
    },
    {
      min: 2,
      type: "score",
      title: "Lead scored Hot (8.5)",
      actor,
      at: "2026-06-25T16:44:00",
      stage: "P1",
    },
    {
      min: 3,
      type: "stage",
      title: "Stage advanced P1 Qualified → P2 Data Collection",
      actor,
      at: "2026-06-27T10:20:00",
      stage: "P2",
    },
    {
      min: 3,
      type: "document",
      title: "Intake profile / biodata started",
      actor,
      at: "2026-06-27T12:15:00",
      stage: "P2",
    },
    {
      min: 4,
      type: "stage",
      title: "Stage advanced P2 Data Collection → P3 Visit / Video",
      actor,
      at: "2026-07-01T11:00:00",
      stage: "P3",
    },
    {
      min: 4,
      type: "meeting",
      title: "Video call / visit logged",
      detail: "Family meeting completed. Preferences captured.",
      actor,
      at: "2026-07-01T18:30:00",
      stage: "P3",
    },
    {
      min: 5,
      type: "stage",
      title: "Stage advanced P3 Visit / Video → P4 Negotiation",
      actor,
      at: "2026-07-19T12:10:00",
      stage: "P4",
    },
    {
      min: 5,
      type: "quote",
      title: "Package quote shared with family",
      actor,
      at: "2026-07-19T15:22:00",
      stage: "P4",
    },
    {
      min: 6,
      type: "stage",
      title: "Stage advanced P4 Negotiation → P5 Payment",
      actor,
      at: "2026-07-28T09:14:00",
      stage: "P5",
    },
    {
      min: 6,
      type: "payment",
      title: "Registration payment recorded",
      actor,
      at: "2026-07-28T14:05:00",
      stage: "P5",
    },
    {
      min: 6,
      type: "document",
      title: "KYC documents uploaded",
      actor,
      at: "2026-07-29T11:40:00",
      stage: "P5",
    },
    {
      min: 7,
      type: "stage",
      title: "Stage advanced P5 Payment → P6 Handover",
      actor,
      at: "2026-08-02T10:08:00",
      stage: "P6",
    },
    {
      min: 7,
      type: "handover",
      title: "Handover to services completed",
      actor,
      at: "2026-08-02T10:20:00",
      stage: "P6",
    },
  ];
}

export function buildDemoHistory(lead, stageId = "P0") {
  const rank = activityRank(stageId, lead?.p0Status);
  return catalogForLead(lead)
    .filter((item) => item.min <= rank)
    .map((item) => normalizeActivity(item));
}

export function getLeadActivities(leadId) {
  if (!leadId) return [];
  const events = byLead[leadId]?.events || [];
  return [...events].sort((a, b) => toDate(b.at) - toDate(a.at));
}

export function hasLeadHistory(leadId) {
  return Boolean(leadId && byLead[leadId]);
}

export function seedLeadActivity(leadId, events = []) {
  if (!leadId || byLead[leadId]) return getLeadActivities(leadId);
  byLead[leadId] = { events: events.map(normalizeActivity) };
  emit();
  return getLeadActivities(leadId);
}

export function ensureLeadHistory(lead, stageId = "P0") {
  const leadId = lead?.id;
  if (!leadId) return [];
  if (!byLead[leadId]) {
    const events = DEMO_LEAD_IDS.has(leadId) ? buildDemoHistory(lead, stageId) : [];
    byLead[leadId] = { events };
  }
  return getLeadActivities(leadId);
}

export function addLeadActivity(leadId, event = {}) {
  if (!leadId) return null;
  if (!byLead[leadId]) byLead[leadId] = { events: [] };
  const entry = normalizeActivity(event);
  byLead[leadId] = { events: [entry, ...byLead[leadId].events] };
  emit();
  return entry;
}

/** Seed demo history when needed, then append a live event. */
export function recordLeadActivity(lead, stageId, event = {}) {
  if (!lead?.id) return null;
  ensureLeadHistory(lead, stageId);
  return addLeadActivity(lead.id, {
    actor: event.actor || CURRENT_USER,
    stage: event.stage || stageId,
    ...event,
  });
}

export function subscribeLeadActivity(onChange) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export { CURRENT_USER };
