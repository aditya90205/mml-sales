/** Map biodata upload → Create Lead fields + Profile Create (P2) values. */

import { extractBiodata } from "./biodataExtract.js";
import { splitName } from "./leadFields.js";

let pending = null;

function digitsMobile(value = "") {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

function mapLookingFor(value) {
  const v = String(value || "").toLowerCase();
  if (!v) return "";
  if (v.includes("bride") || v.includes("girl") || v === "no") return "Bride";
  if (v.includes("groom") || v.includes("boy") || v === "yes") return "Groom";
  return String(value || "").trim();
}

function mapEnquiryBy(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("self")) return "Self";
  if (v.includes("parent")) return "Parent";
  if (v.includes("sibling")) return "Sibling";
  if (v.includes("relative")) return "Relative";
  if (v.includes("friend")) return "Friend";
  if (v.includes("other")) return "Other";
  return String(value || "").trim();
}

function mapNriYesNo(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v || v === "-") return "";
  if (v === "yes" || v === "nri" || v.includes("nri")) return "Yes";
  if (v === "no" || v === "indian" || v.includes("resident")) return "No";
  if (v === "yes") return "Yes";
  return "";
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
    out.city = out.city || f.city;
    out.placeOfBirth = out.placeOfBirth || city;
    out.addrCity = out.addrCity || city;
    out.currentCity = city;
  }
  if (f.area) {
    out.area = out.area || f.area;
    out.addrAreaLocality = out.addrAreaLocality || f.area;
    out.currentLocality = f.area;
  }
  if (f.lookingFor) out.lookingFor = mapLookingFor(f.lookingFor);
  if (f.relation) out.enquiryBy = out.enquiryBy || mapEnquiryBy(f.relation);
  if (f.occupation) out.occupation = out.occupation || f.occupation;
  if (f.profession) {
    out.profession = out.profession || f.profession;
    out.occupation = out.occupation || f.profession;
  }
  if (f.nri) out.nri = out.nri || mapNriYesNo(f.nri) || f.nri;
  if (f.country) out.country = out.country || f.country;
  if (f.familyIncomeBand || f.income) {
    out.familyIncomeBand = out.familyIncomeBand || f.familyIncomeBand || f.income;
  }
  if (f.source || f.leadSource) out.leadSource = out.leadSource || f.source || f.leadSource;
  if (f.meeting) out.meeting = out.meeting || f.meeting;
  if (f.community) out.community = out.community || f.community;

  if (alsoMap.height) out.height = out.height || alsoMap.height;
  if (alsoMap.community) out.community = out.community || alsoMap.community;
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

const OCCUPATION_PILLS = [
  "Independent",
  "Business (joint / nuclear)",
  "Professional",
  "Self employed",
  "Industrialist",
  "Bureaucrat",
  "Private sector",
  "Student",
];

function isFilledValue(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.values(value).some(isFilledValue);
  return String(value).trim() !== "" && String(value).trim() !== "-" && String(value).trim() !== "—";
}

/** Overlay filled keys onto a base object. Empty overlay values never wipe existing data. */
export function mergeFilledValues(base = {}, overlay = {}) {
  const out = { ...(base || {}) };
  for (const [key, value] of Object.entries(overlay || {})) {
    if (isFilledValue(value)) out[key] = value;
  }
  return out;
}

function pickFilled(...vals) {
  for (const value of vals) {
    if (isFilledValue(value)) return value;
  }
  return "";
}

function splitCityState(raw) {
  const text = String(raw || "").trim();
  if (!text) return { city: "", state: "" };
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  return { city: parts[0] || "", state: parts.slice(1).join(", ") };
}

function mapResidentialStatus(nri) {
  const v = String(nri || "").trim().toLowerCase();
  if (!v || v === "-") return "";
  if (v === "yes" || v === "nri" || v.includes("nri")) return "NRI";
  if (v === "no" || v === "indian" || v.includes("resident")) return "Indian";
  return "";
}

function mapClientType(lead = {}, details = {}) {
  const pkg = String(pickFilled(lead.packageInterest, details.packageInterest)).toLowerCase();
  if (pkg.includes("exclusive")) return "Exclusive";
  if (pkg.includes("premium")) return "Premium";
  if (pkg.includes("classic") || pkg.includes("economic")) return "Classic";
  if (lead.starred || lead.premium === true || lead.premium === "Yes" || details.premium === "Yes") {
    return "Premium";
  }
  return "";
}

function mapOccupation(profession) {
  const raw = String(profession || "").trim();
  if (!raw) return { occupation: "", designation: "" };
  const match = OCCUPATION_PILLS.find((opt) => opt.toLowerCase() === raw.toLowerCase());
  if (match) return { occupation: match, designation: "" };
  return { occupation: "", designation: raw };
}

/**
 * Prefill P2 Profile Create from the same lead record used on Overview
 * (Create Lead + P0/P1 details). One source — do not make the client re-type.
 */
export function mapLeadToIntake(lead = {}) {
  if (!lead) return {};
  const details = lead.overviewDetails && typeof lead.overviewDetails === "object" ? lead.overviewDetails : {};
  const names =
    lead.firstName || lead.lastName || details.firstName || details.lastName
      ? {
          firstName: pickFilled(lead.firstName, details.firstName),
          lastName: pickFilled(lead.lastName, details.lastName),
        }
      : splitName(pickFilled(lead.name, details.name));

  const lookingFor = mapLookingFor(pickFilled(lead.lookingFor, details.lookingFor));
  const enquiryBy = mapEnquiryBy(pickFilled(lead.enquiryBy, lead.relation, details.enquiryBy, details.relation));
  const mobile = digitsMobile(pickFilled(lead.mobile, lead.phone, details.mobile, details.phone));
  const email = pickFilled(lead.email, details.email);
  const dob = pickFilled(lead.dob, details.dob);
  const cityRaw = pickFilled(lead.city, details.city);
  const { city, state } = splitCityState(cityRaw);
  const area = pickFilled(lead.area, details.area, lead.areaOfHouse, details.areaOfHouse);
  const nri = pickFilled(lead.nri, details.nri);
  const nriYesNo = mapNriYesNo(nri);
  const residentialStatus = mapResidentialStatus(nri);
  const country = pickFilled(
    lead.country,
    details.country,
    nriYesNo === "No" || residentialStatus === "Indian" ? "India" : ""
  );
  const profession = pickFilled(lead.profession, lead.occupation, details.profession, details.occupation);
  const { occupation, designation } = mapOccupation(profession);
  const familyIncome = pickFilled(lead.familyIncomeBand, lead.income, details.familyIncomeBand);
  const notes = pickFilled(lead.notes, details.notes);
  const clientType = mapClientType(lead, details);
  const leadSource = pickFilled(lead.leadSource, lead.source, details.leadSource, details.source);
  const meeting = pickFilled(lead.meeting, details.meeting);

  const out = {};
  if (names.firstName) out.firstName = names.firstName;
  if (names.lastName) out.lastName = names.lastName;
  if (mobile) out.mobile = mobile;
  if (email) out.email = email;
  if (dob) out.dob = dob;
  if (lookingFor) {
    out.lookingFor = lookingFor;
    if (lookingFor === "Groom") out.gender = "Female";
    if (lookingFor === "Bride") out.gender = "Male";
  }
  if (enquiryBy) out.enquiryBy = enquiryBy;
  if (nriYesNo) out.nri = nriYesNo;
  if (city) {
    out.city = cityRaw || city;
    out.addrCity = city;
    out.addrResidingCity = city;
    out.currentCity = city;
  }
  if (state) out.addrState = state;
  if (area) {
    out.area = area;
    out.addrAreaLocality = area;
    out.currentLocality = area;
  }
  if (residentialStatus) out.residentialStatus = residentialStatus;
  if (country) {
    out.country = country;
    out.addrCountry = country;
    out.addrResidingCountry = country;
  }
  if (profession) out.profession = profession;
  if (occupation) out.occupation = occupation;
  if (designation) out.designation = designation;
  if (familyIncome) {
    out.familyIncomeBand = familyIncome;
    out.annualFamilyIncome = familyIncome;
  }
  if (leadSource) out.leadSource = leadSource;
  if (meeting) out.meeting = meeting;
  if (notes) out.extraInfo = notes;
  if (clientType) out.clientType = clientType;
  return out;
}

/** Keep P2 intakeValues aligned with P0/P1 lead + Overview fields. */
export function syncIntakeValues(lead = {}) {
  return mergeFilledValues(lead.intakeValues || {}, mapLeadToIntake(lead));
}

/** Shared P2 fields written back onto the pipeline lead / Overview. */
export function leadPatchFromIntake(values = {}) {
  const looking = mapLookingFor(values.lookingFor);
  const city = [values.addrCity, values.addrState].filter(Boolean).join(", ") || values.addrCity || "";
  const nri =
    values.residentialStatus === "NRI" ? "yes" : values.residentialStatus === "Indian" ? "no" : "";
  const name = [values.firstName, values.lastName].filter(Boolean).join(" ").trim();
  const patch = {};
  if (values.firstName) patch.firstName = values.firstName;
  if (values.lastName) patch.lastName = values.lastName;
  if (name) patch.name = name;
  if (values.mobile) patch.mobile = digitsMobile(values.mobile);
  if (values.email) patch.email = values.email;
  if (values.dob) patch.dob = values.dob;
  if (looking) patch.lookingFor = looking === "Groom" ? "yes" : looking === "Bride" ? "no" : looking;
  if (values.enquiryBy) {
    patch.enquiryBy = values.enquiryBy;
    patch.relation = values.enquiryBy;
  }
  if (city || values.city) patch.city = values.city || city;
  if (values.area || values.addrAreaLocality) {
    patch.area = values.area || values.addrAreaLocality;
    patch.areaOfHouse = values.area || values.addrAreaLocality;
  }
  if (values.occupation || values.designation || values.profession) {
    patch.profession = values.profession || values.occupation || values.designation;
  }
  if (values.familyIncomeBand || values.annualFamilyIncome) {
    patch.familyIncomeBand = values.familyIncomeBand || values.annualFamilyIncome;
  }
  if (values.nri === "Yes" || values.nri === "yes") {
    patch.nri = "yes";
  } else if (values.nri === "No" || values.nri === "no") {
    patch.nri = "no";
    patch.country = "India";
  } else if (nri) {
    patch.nri = nri;
    if (nri === "no") patch.country = "India";
  }
  if (patch.nri !== "no" && (values.country || values.addrCountry || values.addrResidingCountry)) {
    patch.country = values.country || values.addrCountry || values.addrResidingCountry;
  }
  if (values.leadSource) patch.source = values.leadSource;
  if (values.meeting) patch.meeting = values.meeting;
  if (values.extraInfo) patch.notes = values.extraInfo;
  return patch;
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
    occupation: leadForm.profession || leadForm.occupation || srcFields.occupation || srcFields.profession || "",
  };
  const alsoRead = leadForm.alsoRead || payload.alsoRead || [];
  const intake = leadForm.intake || payload.intake || {};
  const fileName = leadForm.fileName || payload.fileName || "";
  const fromBiodata = mapBiodataToIntake({ fields, alsoRead, intake });
  const fromLead = mapLeadToIntake({
    ...leadForm,
    ...fields,
    profession: leadForm.profession || fields.occupation,
    income: leadForm.income,
    nri: leadForm.nri,
    country: leadForm.country,
    notes: leadForm.notes,
    familyIncomeBand: leadForm.income || leadForm.familyIncomeBand,
  });
  return {
    fields,
    alsoRead,
    intake,
    fileName,
    intakeValues: mergeFilledValues(
      mergeFilledValues(fromBiodata, fromLead),
      leadForm.intakeValues || {}
    ),
  };
}

/** Create Lead / CRM compare fields → P2 intake keys. */
export function leadFieldsToIntake(fields = {}) {
  const looking = mapLookingFor(fields.lookingFor);
  const enquiry = mapEnquiryBy(fields.relation || fields.enquiryBy);
  const nri = mapNriYesNo(fields.nri) || String(fields.nri || "").trim();
  const out = {};
  if (fields.firstName) out.firstName = fields.firstName;
  if (fields.lastName) out.lastName = fields.lastName;
  if (fields.dob) out.dob = fields.dob;
  if (fields.mobile) out.mobile = digitsMobile(fields.mobile);
  if (fields.email) out.email = fields.email;
  if (fields.city) out.city = fields.city;
  if (fields.area) out.area = fields.area;
  if (looking) out.lookingFor = looking;
  if (enquiry) out.enquiryBy = enquiry;
  if (fields.profession) out.profession = fields.profession;
  if (fields.occupation) out.occupation = out.occupation || fields.occupation;
  if (nri) out.nri = nri === "yes" ? "Yes" : nri === "no" ? "No" : nri;
  if (fields.country) out.country = fields.country;
  if (fields.source || fields.leadSource) out.leadSource = fields.source || fields.leadSource;
  if (fields.meeting) out.meeting = fields.meeting;
  if (fields.income || fields.familyIncomeBand) {
    out.familyIncomeBand = fields.income || fields.familyIncomeBand;
  }
  if (fields.community) out.community = fields.community;
  return out;
}

function normalizeReviewValues(values = {}) {
  const next = { ...values };
  if (next.kundliShown === "Shared") next.kundliShown = "Yes";
  if (next.kundliShown === "On request only") next.kundliShown = "No";
  return next;
}

/**
 * Imported biodata vs existing CRM/P2 values, plus the seeded review form.
 * Imported filled keys win; empty biodata never wipes existing.
 */
export function buildBiodataIntakeSnapshots(initial = {}, existingLead = null) {
  const imported = normalizeReviewValues(
    mergeFilledValues(
      mapBiodataToIntake({
        fields: initial.importedFields || initial.fields || initial,
        alsoRead: initial.alsoRead,
        intake: initial.intake,
      }),
      leadFieldsToIntake(initial.importedFields || initial)
    )
  );
  const existing = normalizeReviewValues(
    mergeFilledValues(
      mergeFilledValues(mapLeadToIntake(existingLead || {}), existingLead?.intakeValues || {}),
      leadFieldsToIntake(initial.existingValues || {})
    )
  );
  const values = mergeFilledValues(
    mergeFilledValues(
      {
        nri: "No",
        country: "India",
        enquiryBy: "Self",
        leadSource: "Biodata Upload",
        meeting: "Meeting Agreed",
      },
      existing
    ),
    imported
  );
  if (String(values.nri).toLowerCase() === "no") values.country = values.country || "India";
  return { imported, existing, values: normalizeReviewValues(values) };
}

const COUNTRY_DIAL = {
  India: "+91",
  USA: "+1",
  UK: "+44",
  Canada: "+1",
  UAE: "+971",
  Australia: "+61",
  Singapore: "+65",
  Other: "+",
};

function habitForP2(key, value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (key === "drinking" && /^no$/i.test(raw)) return "Teetotaller";
  if (key === "smoking" && /^no$/i.test(raw)) return "Non smoker";
  return raw;
}

/** Review-modal P2 values → Create Lead submit shape (extra keys stay on intakeValues). */
export function intakeToLeadForm(values = {}, extra = {}) {
  const looking = mapLookingFor(values.lookingFor);
  const nriYes = String(values.nri || "").toLowerCase() === "yes";
  const digits = digitsMobile(values.mobile);
  const country = nriYes ? values.country || "India" : "India";
  const dial = COUNTRY_DIAL[country] || "+91";
  const kundliShown =
    String(values.kundliShown || "").toLowerCase() === "yes"
      ? "Shared"
      : String(values.kundliShown || "").toLowerCase() === "no"
        ? "On request only"
        : values.kundliShown || "";
  const intakeValues = {
    ...values,
    lookingFor: looking || values.lookingFor,
    nri: nriYes ? "Yes" : "No",
    country,
    mobile: digits,
    kundliShown,
    drinking: habitForP2("drinking", values.drinking) || values.drinking,
    smoking: habitForP2("smoking", values.smoking) || values.smoking,
  };
  return {
    lookingFor: looking === "Groom" ? "yes" : looking === "Bride" ? "no" : "yes",
    nri: nriYes ? "yes" : "no",
    relation: values.enquiryBy || "Self",
    firstName: values.firstName || "",
    lastName: values.lastName || "",
    dob: values.dob || "",
    mobile: digits ? `${dial} ${digits}` : "",
    email: values.email || "",
    city: values.city || values.addrCity || "",
    area: values.area || values.addrAreaLocality || "",
    source: values.leadSource || "Biodata Upload",
    country,
    profession: values.profession || values.occupation || "",
    meeting: values.meeting || "Meeting Agreed",
    income: values.familyIncomeBand || "",
    notes: values.extraInfo || "",
    name: [values.firstName, values.lastName].filter(Boolean).join(" ").trim(),
    intakeValues,
    fileName: extra.fileName || "",
    alsoRead: extra.alsoRead,
    intake: extra.intake || intakeValues,
    existingLeadId: extra.existingLeadId,
    clientId: extra.clientId,
    mode: extra.mode,
  };
}

export { extractBiodata };
