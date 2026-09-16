const EVENT = "mml-sales-pipeline";

/** Two sample cards per stage, mirroring the pipeline board roster. */
export const LEADS_BY_STAGE = {
  P0: [
    { id: "p0-1", name: "Kuhu Sharma",    starred: true,  mmlId: "MML - D - 10428", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2,  hrs: 6,  source: "Outbound Calls",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p0-2", name: "Ankit Sharma",   starred: true,  mmlId: "MML - D - 10429", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2,  hrs: 6,  source: "Outbound Calls",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P1: [
    { id: "p1-1", name: "Harshit Sharma", starred: false, mmlId: "MML - D - 10430", temperature: "Hot",  score: 8.5, priority: "High",   completion: 40,  days: 4,  hrs: 24, source: "Brand Walking",     lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p1-2", name: "Arjun Rampal",   starred: false, mmlId: "MML - D - 10431", temperature: "Hot",  score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 24, source: "Brand Walking",     lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P2: [
    { id: "p2-1", name: "Ankur Sharma",   starred: false, mmlId: "MML - D - 10432", temperature: "Cold", score: 7.5, priority: "Medium", completion: 75,  days: 6,  hrs: 24, source: "Community Events",  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p2-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10433", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 6,  source: "Community Events",  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P3: [
    { id: "p3-1", name: "Aditya Sharma",  starred: true,  mmlId: "MML - D - 10434", temperature: "Cold", score: 8.5, priority: "Medium", completion: 85,  days: 8,  hrs: 24, source: "Channel Partner",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p3-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10435", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Channel Partner",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P4: [
    { id: "p4-1", name: "Vivek Sharma",   starred: true,  mmlId: "MML - D - 10436", temperature: "Cold", score: 9.0, priority: "Low",    completion: 90,  days: 10, hrs: 6,  source: "Reference - Satish", lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p4-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Reference - Satish", lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P5: [
    { id: "p5-1", name: "Rohit Sharma",   starred: true,  mmlId: "MML - D - 10438", temperature: "Warm", score: 7.5, priority: "Medium", completion: 60,  days: 12, hrs: 24, source: "Manual Sourcing",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p5-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10439", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Manual Sourcing",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
  P6: [
    { id: "p6-1", name: "Virat Sharma",   starred: true,  mmlId: "MML - D - 10440", temperature: "Warm", score: 8.5, priority: "Low",    completion: 55,  days: 14, hrs: 24, source: "Online - Insta",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
    { id: "p6-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10441", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Online - Insta",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" },
  ],
};

const STAGE_IDS = Object.keys(LEADS_BY_STAGE);

function cloneLeads(data = LEADS_BY_STAGE) {
  const next = {};
  for (const id of STAGE_IDS) {
    next[id] = Array.isArray(data?.[id]) ? data[id].map((lead) => ({ ...lead })) : [];
  }
  return next;
}

let leads = cloneLeads(LEADS_BY_STAGE);

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

export function readLeads() {
  return cloneLeads(leads);
}

export function writeLeads(next) {
  leads = cloneLeads(next);
  emit();
  return readLeads();
}

export function subscribePipeline(onChange) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function countStageLeads(stageId = "P0") {
  return (leads[stageId] || []).length;
}

export function addP0Lead(lead) {
  const id = lead?.id || `p0-${Date.now()}`;
  leads = cloneLeads(leads);
  leads.P0 = [{ ...lead, id }, ...(leads.P0 || [])];
  emit();
  return leads.P0[0];
}

export function findLeadById(leadId) {
  if (!leadId) return null;
  for (const stageId of STAGE_IDS) {
    const lead = (leads[stageId] || []).find((l) => l.id === leadId);
    if (lead) return { lead: { ...lead }, stageId };
  }
  return null;
}
