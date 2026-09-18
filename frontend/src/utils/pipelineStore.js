import { addLeadActivity } from "./leadActivityStore.js";
import { syncIntakeValues } from "./biodataDraftStore.js";
import { splitName, lookingForFromGender } from "./leadFields.js";

const EVENT = "mml-sales-pipeline";
const STORAGE_KEY = "mml-sales-pipeline-leads";

/** One dummy client record shared by Overview and P2 Profile Create. */
export const SAMPLE_CLIENT_PROFILE = {
  enquiryBy: "Parent",
  relation: "Parent",
  dob: "1992-09-30",
  nri: "no",
  country: "India",
  city: "Delhi, NCR",
  area: "Greater Kailash II",
  areaOfHouse: "Greater Kailash II",
  profession: "Professional",
  familyIncomeBand: "₹50 Lakh to ₹1 Crore",
  packageInterest: "Premium",
  meeting: "Meeting Agreed",
};

/** Sample Overview fields carried from P0 New → P0 Contacted. */
const SAMPLE_P0_CONTACTED_DETAILS = {
  dealCode: "MML-D-10429",
  stageLabel: "P0 Contacted",
  packageInterest: SAMPLE_CLIENT_PROFILE.packageInterest,
  premium: "Yes",
  dealValue: "₹51,000",
  leadSource: "Outbound Calls",
  leadScore: "Warm",
  enquiryBy: SAMPLE_CLIENT_PROFILE.enquiryBy,
  lookingFor: "no",
  dob: SAMPLE_CLIENT_PROFILE.dob,
  nri: SAMPLE_CLIENT_PROFILE.nri,
  country: SAMPLE_CLIENT_PROFILE.country,
  city: SAMPLE_CLIENT_PROFILE.city,
  areaOfHouse: SAMPLE_CLIENT_PROFILE.areaOfHouse,
  profession: SAMPLE_CLIENT_PROFILE.profession,
  familyIncomeBand: SAMPLE_CLIENT_PROFILE.familyIncomeBand,
  meeting: SAMPLE_CLIENT_PROFILE.meeting,
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

/** Dummy roster contacts — every profile keeps at least one of mobile or email. */
const DUMMY_CONTACTS = {
  "p0-1": { mobile: "9812345678", email: "kuhu.sharma@email.com" },
  "p0-2": { mobile: "9823456789", email: "ankit.sharma@email.com" },
  "p0-ritika": { mobile: "9876543210", email: "ritika.sharma@email.com" },
  "p1-1": { mobile: "9876544598", email: "harshit.sharma@email.com" },
  "p1-2": { mobile: "9811122233", email: "arjun.rampal@email.com" },
  "p2-1": { mobile: "9898989898", email: "ankur.sharma@email.com" },
  "p2-2": { mobile: "9876501234", email: "priya.raheja@email.com" },
  "p3-1": { mobile: "9810012345", email: "aditya.sharma@email.com" },
  "p3-2": { mobile: "9876501235", email: "priya.raheja2@email.com" },
  "p4-1": { mobile: "9812341111", email: "vivek.sharma@email.com" },
  "p4-2": { mobile: "9876501236", email: "priya.raheja3@email.com" },
  "p5-1": { mobile: "9820098765", email: "rohit.sharma@email.com" },
  "p5-2": { mobile: "9876501237", email: "priya.raheja4@email.com" },
  "p6-1": { mobile: "9810061550", email: "virat.sharma@email.com" },
  "p6-2": { mobile: "9876501238", email: "priya.raheja5@email.com" },
};

function withDummyContact(lead) {
  const contact = DUMMY_CONTACTS[lead.id];
  if (!contact) return lead;
  return {
    ...lead,
    mobile: lead.mobile || contact.mobile,
    email: lead.email || contact.email,
  };
}

const SKIP_SAMPLE_PROFILE_IDS = new Set(["p0-1", "p0-ritika"]);
const SAMPLE_FEMALE_FIRST = new Set(["kuhu", "ritika", "priya", "ananya"]);

function sampleGender(lead = {}) {
  const first = String(lead.firstName || lead.name || "")
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();
  return SAMPLE_FEMALE_FIRST.has(first) ? "Female" : "Male";
}

function isLegacyDummyLookingFor(value) {
  const v = String(value || "").toLowerCase();
  return v.includes("girl ·") || v.includes("26–30") || v.includes("26-30");
}

/** Keep Overview dummy personal details on the same lead P2 reads. */
function withSampleClient(lead) {
  const names =
    lead.firstName || lead.lastName
      ? { firstName: lead.firstName || "", lastName: lead.lastName || "" }
      : splitName(lead.name);
  const gender = sampleGender({ ...lead, firstName: names.firstName, name: lead.name });
  const lookingFor =
    lead.lookingFor && !isLegacyDummyLookingFor(lead.lookingFor)
      ? lead.lookingFor
      : lookingForFromGender(gender, "lead");
  const profession =
    lead.profession === "Chartered Accountant" || !lead.profession
      ? SAMPLE_CLIENT_PROFILE.profession
      : lead.profession;
  const familyIncomeBand =
    lead.familyIncomeBand === "₹60L–₹1Cr p.a." || !lead.familyIncomeBand
      ? SAMPLE_CLIENT_PROFILE.familyIncomeBand
      : lead.familyIncomeBand;
  const enquiryBy = String(lead.enquiryBy || lead.relation || "").includes("father")
    ? SAMPLE_CLIENT_PROFILE.enquiryBy
    : lead.enquiryBy || lead.relation || SAMPLE_CLIENT_PROFILE.enquiryBy;
  const next = {
    ...SAMPLE_CLIENT_PROFILE,
    ...lead,
    firstName: lead.firstName || names.firstName,
    lastName: lead.lastName || names.lastName,
    lookingFor,
    enquiryBy,
    relation: enquiryBy,
    nri: lead.nri || SAMPLE_CLIENT_PROFILE.nri,
    country: lead.country || (String(lead.nri || SAMPLE_CLIENT_PROFILE.nri).toLowerCase() === "no" ? "India" : lead.country),
    city: lead.city || SAMPLE_CLIENT_PROFILE.city,
    dob: lead.dob || SAMPLE_CLIENT_PROFILE.dob,
    area: lead.area || lead.areaOfHouse || SAMPLE_CLIENT_PROFILE.area,
    areaOfHouse: lead.areaOfHouse || lead.area || SAMPLE_CLIENT_PROFILE.areaOfHouse,
    profession,
    familyIncomeBand,
    meeting: lead.meeting || SAMPLE_CLIENT_PROFILE.meeting,
    packageInterest: lead.packageInterest || SAMPLE_CLIENT_PROFILE.packageInterest,
    overviewDetails: {
      ...SAMPLE_P0_CONTACTED_DETAILS,
      premium: lead.starred ? "Yes" : "No",
      leadSource: lead.source || SAMPLE_P0_CONTACTED_DETAILS.leadSource,
      ...(lead.overviewDetails || {}),
      lookingFor,
      enquiryBy,
      firstName: lead.firstName || names.firstName,
      lastName: lead.lastName || names.lastName,
      nri: lead.nri || SAMPLE_CLIENT_PROFILE.nri,
      country: lead.country || SAMPLE_CLIENT_PROFILE.country,
      city: lead.city || SAMPLE_CLIENT_PROFILE.city,
      profession,
      familyIncomeBand,
      meeting: lead.meeting || SAMPLE_CLIENT_PROFILE.meeting,
      dob: lead.dob || lead.overviewDetails?.dob || SAMPLE_CLIENT_PROFILE.dob,
      areaOfHouse: lead.areaOfHouse || lead.area || SAMPLE_CLIENT_PROFILE.areaOfHouse,
    },
  };
  next.intakeValues = syncIntakeValues(next);
  return next;
}

function sampleLead(lead, { profile = true } = {}) {
  const withContact = withDummyContact(lead);
  if (!profile || SKIP_SAMPLE_PROFILE_IDS.has(lead.id)) return withContact;
  return withSampleClient(withContact);
}

function leadHasContact(lead) {
  const mobile = String(lead?.mobile || "").replace(/\D/g, "");
  const email = String(lead?.email || "").trim();
  return mobile.length >= 8 || email.includes("@");
}

/** Two sample cards per stage, mirroring the pipeline board roster. */
export const LEADS_BY_STAGE = {
  P0: [
    sampleLead({ id: "p0-1", name: "Kuhu Sharma",  starred: true,  mmlId: "MML - D - 10428", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2,  hrs: 6,  source: "Outbound Calls",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", p0Status: "new" }, { profile: false }),
    sampleLead({ id: "p0-2", name: "Ankit Sharma", starred: true,  mmlId: "MML - D - 10429", temperature: "Hot",  score: 8.5, priority: "High",   completion: 50,  days: 2,  hrs: 6,  source: "Outbound Calls",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM", p0Status: "contacted", overviewDetails: SAMPLE_P0_CONTACTED_DETAILS }),
    sampleLead({
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
      city: "",
      area: "",
      dob: "",
      lookingFor: "yes",
      relation: "Parent",
    }, { profile: false }),
  ],
  P1: [
    sampleLead({ id: "p1-1", name: "Harshit Sharma", starred: false, mmlId: "MML - D - 10430", temperature: "Hot",  score: 8.5, priority: "High",   completion: 40,  days: 4,  hrs: 24, source: "Brand Walking",     lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
    sampleLead({ id: "p1-2", name: "Arjun Rampal",   starred: false, mmlId: "MML - D - 10431", temperature: "Hot",  score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 24, source: "Brand Walking",     lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
  ],
  P2: [
    sampleLead({ id: "p2-1", name: "Ankur Sharma",   firstName: "Ankur", lastName: "Sharma", starred: false, mmlId: "MML - D - 10432", temperature: "Cold", score: 7.5, priority: "Medium", completion: 75,  days: 6,  hrs: 24, source: "Community Events",  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
    sampleLead({ id: "p2-2", name: "Priya Raheja",   firstName: "Priya", lastName: "Raheja", starred: true,  mmlId: "MML - D - 10433", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 6,  source: "Community Events",  lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
  ],
  P3: [
    sampleLead({ id: "p3-1", name: "Aditya Sharma",  starred: true,  mmlId: "MML - D - 10434", temperature: "Cold", score: 8.5, priority: "Medium", completion: 85,  days: 8,  hrs: 24, source: "Channel Partner",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
    sampleLead({ id: "p3-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10435", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Channel Partner",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
  ],
  P4: [
    sampleLead({ id: "p4-1", name: "Vivek Sharma",   starred: true,  mmlId: "MML - D - 10436", temperature: "Cold", score: 9.0, priority: "Low",    completion: 90,  days: 10, hrs: 6,  source: "Reference - Satish", lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
    sampleLead({ id: "p4-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10437", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Reference - Satish", lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
  ],
  P5: [
    sampleLead({ id: "p5-1", name: "Rohit Sharma",   starred: true,  mmlId: "MML - D - 10438", temperature: "Warm", score: 7.5, priority: "Medium", completion: 60,  days: 12, hrs: 24, source: "Manual Sourcing",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
    sampleLead({ id: "p5-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10439", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Manual Sourcing",   lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
  ],
  P6: [
    sampleLead({ id: "p6-1", name: "Virat Sharma",   starred: true,  mmlId: "MML - D - 10440", temperature: "Warm", score: 8.5, priority: "Low",    completion: 55,  days: 14, hrs: 24, source: "Online - Insta",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
    sampleLead({ id: "p6-2", name: "Priya Raheja",   starred: true,  mmlId: "MML - D - 10441", temperature: "Cold", score: 8.5, priority: "High",   completion: 100, days: 2,  hrs: 8,  source: "Online - Insta",    lastDiscussion: "20/08/25, 11:30 AM", nextAction: "29/08/25, 11:30 AM" }),
  ],
};

const STAGE_IDS = Object.keys(LEADS_BY_STAGE);
const SAMPLE_LEAD_IDS = new Set(
  STAGE_IDS.flatMap((stageId) => (LEADS_BY_STAGE[stageId] || []).map((lead) => lead.id))
);

/** Board roster leads keep dummy overview values. Created clients do not. */
export function isSampleLead(lead) {
  const id = typeof lead === "string" ? lead : lead?.id;
  return SAMPLE_LEAD_IDS.has(id);
}

function cloneLeads(data = LEADS_BY_STAGE) {
  const next = {};
  for (const id of STAGE_IDS) {
    next[id] = Array.isArray(data?.[id])
      ? data[id].map((lead) => ({
          ...lead,
          overviewDetails: lead.overviewDetails ? { ...lead.overviewDetails } : lead.overviewDetails,
          intakeValues: lead.intakeValues ? { ...lead.intakeValues } : lead.intakeValues,
        }))
      : [];
  }
  return next;
}

function hydrateMissingContacts(data) {
  const next = cloneLeads(data);
  let changed = false;
  for (const stageId of STAGE_IDS) {
    const seedList = LEADS_BY_STAGE[stageId] || [];
    next[stageId] = (next[stageId] || []).map((lead) => {
      if (leadHasContact(lead)) return lead;
      const seed = seedList.find((row) => row.id === lead.id);
      const contact = DUMMY_CONTACTS[lead.id] || seed || null;
      if (!contact || !leadHasContact(contact)) return lead;
      changed = true;
      return {
        ...lead,
        mobile: lead.mobile || contact.mobile || "",
        email: lead.email || contact.email || "",
      };
    });
  }
  return { next, changed };
}

function hydrateSampleProfiles(data) {
  const next = cloneLeads(data);
  let changed = false;
  for (const stageId of STAGE_IDS) {
    next[stageId] = (next[stageId] || []).map((lead) => {
      if (!SAMPLE_LEAD_IDS.has(lead.id) || SKIP_SAMPLE_PROFILE_IDS.has(lead.id)) return lead;
      if (lead.p0Status === "new" && !lead.overviewDetails) return lead;
      const synced = withSampleClient(lead);
      const same =
        lead.lookingFor === synced.lookingFor &&
        lead.profession === synced.profession &&
        lead.familyIncomeBand === synced.familyIncomeBand &&
        lead.enquiryBy === synced.enquiryBy;
      if (same && lead.dob && lead.intakeValues) return lead;
      changed = true;
      return synced;
    });
  }
  return { next, changed };
}

function loadLeads() {
  if (typeof window === "undefined") return cloneLeads(LEADS_BY_STAGE);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneLeads(LEADS_BY_STAGE);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return cloneLeads(LEADS_BY_STAGE);
    const contacts = hydrateMissingContacts(parsed);
    const profiles = hydrateSampleProfiles(contacts.next);
    const next = profiles.next;
    if (contacts.changed || profiles.changed) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
    }
    return next;
  } catch {
    return cloneLeads(LEADS_BY_STAGE);
  }
}

function persistLeads() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    /* ignore quota */
  }
}

/** P0 sub-status: New until details are saved / the lead is marked Contacted. */
export function p0StatusOf(lead) {
  if (!lead) return "new";
  if (lead.p0Status === "contacted" || lead.overviewDetails) return "contacted";
  return "new";
}

let leads = loadLeads();

function emit() {
  persistLeads();
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
  return addLeadToStage("P0", { p0Status: lead?.p0Status || "new", ...lead });
}

export function addLeadToStage(stageId, lead = {}) {
  const stage = STAGE_IDS.includes(stageId) ? stageId : "P0";
  const id = lead?.id || `${stage.toLowerCase()}-${Date.now()}`;
  leads = cloneLeads(leads);
  const next = { ...lead, id };
  if (stage === "P0") next.p0Status = lead?.p0Status || "new";
  if (stage === "P2") {
    next.completion = Math.max(Number(next.completion) || 0, 70);
    next.score = Math.max(Number(next.score) || 0, 9);
    next.temperature = next.temperature || "Hot";
  }
  next.intakeValues = syncIntakeValues(next);
  leads[stage] = [next, ...(leads[stage] || [])];
  emit();
  addLeadActivity(next.id, {
    type: "created",
    title: `Lead ${next.name || "client"} created`,
    detail:
      stage === "P2"
        ? "Created from biodata in Profile Create (P2)"
        : next.source
          ? `Source: ${next.source}`
          : `Added to ${stage}`,
    stage,
  });
  return next;
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
      updated.intakeValues = syncIntakeValues(updated);
      foundStage = stageId;
      return updated;
    });
  }
  if (!updated) return null;
  emit();
  return { lead: { ...updated }, stageId: foundStage };
}

/** Move a lead to another pipeline column. Same-stage calls just patch in place. */
export function moveLeadToStage(leadId, toStage, patch = {}) {
  if (!leadId || !STAGE_IDS.includes(toStage)) return null;
  const found = findLeadById(leadId);
  if (!found) return null;
  if (found.stageId === toStage) {
    return updateLead(leadId, patch) || { lead: found.lead, stageId: toStage, fromStage: toStage };
  }

  leads = cloneLeads(leads);
  leads[found.stageId] = (leads[found.stageId] || []).filter((l) => l.id !== leadId);
  let updated = { ...found.lead, ...patch, id: found.lead.id };
  if (toStage === "P2") {
    updated.temperature = updated.temperature || "Hot";
    updated.score = Math.max(Number(updated.score) || 0, 9);
    updated.completion = Math.max(Number(updated.completion) || 0, 70);
  }
  updated.intakeValues = syncIntakeValues(updated);
  leads[toStage] = [updated, ...(leads[toStage] || [])];
  emit();
  addLeadActivity(updated.id, {
    type: "stage",
    title: `Stage advanced ${found.stageId} → ${toStage}`,
    detail: toStage === "P2" ? "Biodata uploaded — moved to Profile Create (P2)" : "",
    stage: toStage,
  });
  return { lead: { ...updated }, stageId: toStage, fromStage: found.stageId };
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

/** Match a pipeline lead by exact mobile (last 10) and/or email — not by name. */
export function findLeadByMobileOrEmail({ mobile = "", email = "" } = {}) {
  const qMobile = String(mobile || "").replace(/\D/g, "").slice(-10);
  const qEmail = String(email || "").trim().toLowerCase();
  const hasMobile = qMobile.length >= 8;
  const hasEmail = qEmail.includes("@");
  if (!hasMobile && !hasEmail) return null;
  for (const stageId of STAGE_IDS) {
    for (const lead of leads[stageId] || []) {
      const extra = DUMMY_CONTACTS[lead.id] || {};
      const leadMobile = String(lead.mobile || extra.mobile || lead.intakeValues?.mobile || "")
        .replace(/\D/g, "")
        .slice(-10);
      const leadEmail = String(lead.email || extra.email || lead.intakeValues?.email || "")
        .trim()
        .toLowerCase();
      const mobileOk = hasMobile && leadMobile.length >= 8 && leadMobile === qMobile;
      const emailOk = hasEmail && Boolean(leadEmail) && leadEmail === qEmail;
      if (mobileOk || emailOk) return { lead: { ...lead }, stageId };
    }
  }
  return null;
}
