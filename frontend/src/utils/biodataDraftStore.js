/** Session drafts from biodata upload → applied on Pipeline intake / Client record. */

const EVENT = "mml-sales-biodata-draft";
const drafts = new Map();

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

/** Map extracted biodata fields (+ alsoRead chips) into intake form keys. */
export function mapBiodataToIntake(payload = {}) {
  const f = payload.fields || payload;
  const also = Array.isArray(payload.alsoRead) ? payload.alsoRead : [];
  const alsoMap = Object.fromEntries(
    also.map((c) => [String(c.label || "").toLowerCase(), c.value])
  );

  const out = {};
  if (f.firstName) out.firstName = f.firstName;
  if (f.lastName) out.lastName = f.lastName;
  if (f.dob) out.dob = f.dob;
  if (f.mobile) out.mobile = String(f.mobile).replace(/\D/g, "").slice(-10);
  if (f.email) out.email = f.email;
  if (f.city) {
    out.placeOfBirth = out.placeOfBirth || f.city;
    out.currentCity = f.city;
  }
  if (f.area) out.currentLocality = f.area;
  if (f.lookingFor) {
    const lf = String(f.lookingFor);
    out.lookingFor = /bride/i.test(lf) ? "Bride" : /groom/i.test(lf) ? "Groom" : lf;
  }
  if (f.relation) {
    const r = String(f.relation);
    if (/self/i.test(r)) out.enquiryBy = "Self";
    else if (/parent/i.test(r)) out.enquiryBy = "Parent";
    else if (/sibling/i.test(r)) out.enquiryBy = "Sibling";
    else out.enquiryBy = "Relative";
  }

  if (alsoMap.height) out.height = alsoMap.height;
  if (alsoMap.community) out.community = alsoMap.community;
  if (alsoMap.education) out.highestQualification = alsoMap.education;
  if (alsoMap.occupation) out.occupation = alsoMap.occupation;
  if (alsoMap.income) out.income = alsoMap.income;
  if (alsoMap.manglik) out.manglik = alsoMap.manglik;
  if (alsoMap["family details"]) out.familyDetails = alsoMap["family details"];

  out.profileStatus = "Under review";
  return out;
}

export function setBiodataDraft(leadId, payload) {
  if (!leadId) return;
  drafts.set(String(leadId), {
    ...payload,
    savedAt: Date.now(),
  });
  emit();
}

export function peekBiodataDraft(leadId) {
  if (!leadId) return null;
  return drafts.get(String(leadId)) || null;
}

/** Read and remove draft so it applies once when opening client detail. */
export function consumeBiodataDraft(leadId) {
  if (!leadId) return null;
  const key = String(leadId);
  const next = drafts.get(key) || null;
  if (next) drafts.delete(key);
  return next;
}

export function subscribeBiodataDrafts(onChange) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
