import { addLeadActivity } from "./leadActivityStore.js";

const EVENT = "mml-sales-pipeline";

/** Sample Overview fields carried from P0 New → P0 Contacted. */
const SAMPLE_P0_CONTACTED_DETAILS = {
  dealCode: "MML-D-10429",
  stageLabel: "P0 Contacted",
  packageInterest: "Premium",
  premium: "Yes",
  dealValue: "₹51,000",
  leadSource: "Outbound Calls",
  leadScore: "Warm",
  enquiryBy: "Parent (father)",
  lookingFor: "Girl · 26–30 · NCR",
  areaOfHouse: "Greater Kailash II",
  profession: "Chartered Accountant",
  familyIncomeBand: "₹60L–₹1Cr p.a.",
  nextMeeting: "04/09/26",
  winLossReasons: "No decision / Think about it, Competitor / Existing solution",
  winLossTone: "Hot",
  lastDiscussionAt: "20/08/25, 11:30 AM",
  lastDiscussionNote: "Meeting Notes/Discussions",
  nextActionAt: "29/08/25, 11:30 AM",
  nextAction: "Call Client for pricing confirmation at 8 PM",
  nextActionUrgency: "6 Hrs Left",
  assignedTo: "Rohit K.",
  assignedBy: "Aditya Sharma",
};

/** Two sample cards per stage, mirroring the pipeline board roster. */
export const LEADS_BY_STAGE = {
  P0: [
    { id: "p0-1", name: "Kuhu Sharma",  starred: true,  mmlId: "MML - D - 10428", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2,  hrs: 6,  source: "Outbound Calls",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", p0Status: "new" },
    { id: "p0-2", name: "Ankit Sharma", starred: true,  mmlId: "MML - D - 10429", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2,  hrs: 6,  source: "Outbound Calls",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", p0Status: "contacted", profession: SAMPLE_P0_CONTACTED_DETAILS.profession, familyIncomeBand: SAMPLE_P0_CONTACTED_DETAILS.familyIncomeBand, areaOfHouse: SAMPLE_P0_CONTACTED_DETAILS.areaOfHouse, overviewDetails: SAMPLE_P0_CONTACTED_DETAILS },
    {
      id: "p0-ritika",
      name: "Ritika Sharma",
      firstName: "Ritika",
      lastName: "Sharma",
      starred: false,
      mmlId: "MML - D - 10502",
      temperature: "Warm",
      score: 7.8,
      priority: "Medium",
      completion: 35,
      days: 1,
      hrs: 18,
      source: "Biodata Upload",
      lastDiscussion: "16/09/26, 4:10 PM",
      nextAction: "Review biodata",
      p0Status: "new",
      mobile: "9876543210",
      email: "ritika.sharma@email.com",
      city: "",
      area: "",
      dob: "",
      lookingFor: "yes",
      relation: "Parent",
    },
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
    next[id] = Array.isArray(data?.[id])
      ? data[id].map((lead) => ({
          ...lead,
          overviewDetails: lead.overviewDetails ? { ...lead.overviewDetails } : lead.overviewDetails,
        }))
      : [];
  }
  return next;
}

/** P0 sub-status: New until details are saved / the lead is marked Contacted. */
export function p0StatusOf(lead) {
  if (!lead) return "new";
  if (lead.p0Status === "contacted" || lead.overviewDetails) return "contacted";
  return "new";
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
  leads.P0 = [{ ...lead, id, p0Status: lead?.p0Status || "new" }, ...(leads.P0 || [])];
  const created = leads.P0[0];
  emit();
  addLeadActivity(created.id, {
    type: "created",
    title: `Lead ${created.name} created`,
    detail: created.source ? `Source: ${created.source}` : "Added to P0 New",
    stage: "P0",
  });
  return created;
}

export function findLeadById(leadId) {
  if (!leadId) return null;
  for (const stageId of STAGE_IDS) {
    const lead = (leads[stageId] || []).find((l) => l.id === leadId);
    if (lead) return { lead: { ...lead }, stageId };
  }
  return null;
}

export function updateLead(leadId, patch = {}) {
  if (!leadId) return null;
  let updated = null;
  let foundStage = null;
  leads = cloneLeads(leads);
  for (const stageId of STAGE_IDS) {
    leads[stageId] = (leads[stageId] || []).map((l) => {
      if (l.id !== leadId) return l;
      updated = { ...l, ...patch, id: l.id };
      foundStage = stageId;
      return updated;
    });
  }
  if (!updated) return null;
  emit();
  return { lead: { ...updated }, stageId: foundStage };
}

export function findLeadByName(name) {
  const q = String(name || "").trim().toLowerCase();
  if (!q) return null;
  for (const stageId of STAGE_IDS) {
    const lead = (leads[stageId] || []).find((l) => String(l.name || "").toLowerCase() === q);
    if (lead) return { lead: { ...lead }, stageId };
  }
  return null;
}
