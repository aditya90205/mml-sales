/** Map biodata upload → Create Lead fields + Profile Create (P2) values. */

import { extractBiodata } from "./biodataExtract.js";
import { splitName } from "./leadFields.js";

let pending = null;

function digitsMobile(value = "") {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

function mapLookingFor(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("bride") || v === "no") return "Bride";
  if (v.includes("groom") || v === "yes") return "Groom";
  return String(value || "").trim();
}

function mapEnquiryBy(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("self")) return "Self";
  if (v.includes("parent")) return "Parent";
  if (v.includes("sibling")) return "Sibling";
  if (v.includes("relative") || v.includes("friend")) return "Relative";
  return String(value || "").trim();
}

function mapManglik(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (v === "no" || v.includes("non")) return "Non Manglik";
  if (v.includes("slight")) return "Slightly Manglik";
  if (v.includes("don't") || v.includes("dont") || v.includes("unknown")) return "Don't know";
  if (v === "yes" || v === "manglik") return "Manglik";
  return String(value || "").trim();
}

/** Map extracted biodata fields (+ alsoRead chips + intake) into P2 intake form keys. */
export function mapBiodataToIntake(payload = {}) {
  const f = payload.fields || {};
  const intake = payload.intake || payload.intakeFields || {};
  const also = Array.isArray(payload.alsoRead) ? payload.alsoRead : [];
  const alsoMap = Object.fromEntries(
    also.map((c) => [String(c.label || "").toLowerCase(), c.value])
  );

  const out = { ...intake };

  if (f.firstName) out.firstName = f.firstName;
  if (f.lastName) out.lastName = f.lastName;
  if (f.dob) out.dob = f.dob;
  if (f.mobile) out.mobile = digitsMobile(f.mobile);
  if (f.email) out.email = f.email;
  if (f.city) {
    const city = String(f.city).split(",")[0].trim();
    out.placeOfBirth = out.placeOfBirth || city;
    out.addrCity = out.addrCity || city;
    out.currentCity = city;
  }
  if (f.area) {
    out.addrAreaLocality = out.addrAreaLocality || f.area;
    out.currentLocality = f.area;
  }
  if (f.lookingFor) out.lookingFor = mapLookingFor(f.lookingFor);
  if (f.relation) out.enquiryBy = out.enquiryBy || mapEnquiryBy(f.relation);

  if (alsoMap.height) out.height = out.height || alsoMap.height;
  if (alsoMap.community) out.sectCaste = out.sectCaste || alsoMap.community;
  if (alsoMap.caste) out.sectCaste = out.sectCaste || alsoMap.caste;
  if (alsoMap.education && !out.courses?.some((row) => row?.course)) {
    out.courses = [
      {
        level: "Post graduate",
        course: alsoMap.education,
        stream: "",
        institution: "",
        year: "",
        pct: "",
      },
    ];
  }
  if (alsoMap.occupation) out.designation = out.designation || alsoMap.occupation;
  if (alsoMap.income) out.personalAnnualIncome = out.personalAnnualIncome || alsoMap.income;
  if (alsoMap.manglik) out.manglik = out.manglik || mapManglik(alsoMap.manglik);
  if (alsoMap["family details"]) out.familyHistory = out.familyHistory || alsoMap["family details"];
  if (alsoMap.father) out.fatherName = out.fatherName || alsoMap.father;
  if (alsoMap.mother) out.motherName = out.motherName || alsoMap.mother;

  if (out.manglik) out.manglik = mapManglik(out.manglik);
  out.profileStatus = out.profileStatus || "Under review";
  return out;
}

/** Prefill P2 from the pipeline lead contact only. */
export function mapLeadToIntake(lead = {}) {
  if (!lead) return {};
  const names =
    lead.firstName || lead.lastName
      ? { firstName: lead.firstName || "", lastName: lead.lastName || "" }
      : splitName(lead.name);
  return {
    firstName: names.firstName || "",
    lastName: names.lastName || "",
    mobile: digitsMobile(lead.mobile || lead.phone),
    email: lead.email || "",
    lookingFor: mapLookingFor(lead.lookingFor),
    enquiryBy: mapEnquiryBy(lead.relation),
    addrCity: lead.city ? String(lead.city).split(",")[0].trim() : "",
    addrAreaLocality: lead.area || "",
    dob: lead.dob || "",
  };
}

export function setPendingBiodata(payload) {
  pending = payload || null;
}

export function takePendingBiodata() {
  const next = pending;
  pending = null;
  return next;
}

export function peekPendingBiodata() {
  return pending;
}

/** Merge Create Lead save + uploaded biodata into one payload for P2. */
export function buildLeadIntakePayload(leadForm = {}, payload = {}) {
  const srcFields = payload.fields || {};
  const fields = {
    firstName: leadForm.firstName || srcFields.firstName || "",
    lastName: leadForm.lastName || srcFields.lastName || "",
    dob: leadForm.dob || srcFields.dob || "",
    mobile: leadForm.mobile || srcFields.mobile || "",
    email: leadForm.email || srcFields.email || "",
    city: leadForm.city || srcFields.city || "",
    area: leadForm.area || srcFields.area || "",
    lookingFor: leadForm.lookingFor || srcFields.lookingFor || "",
    relation: leadForm.relation || srcFields.relation || "",
  };
  const alsoRead = leadForm.alsoRead || payload.alsoRead || [];
  const intake = leadForm.intake || payload.intake || {};
  const fileName = leadForm.fileName || payload.fileName || "";
  return {
    fields,
    alsoRead,
    intake,
    fileName,
    intakeValues: mapBiodataToIntake({ fields, alsoRead, intake }),
  };
}

export { extractBiodata };
