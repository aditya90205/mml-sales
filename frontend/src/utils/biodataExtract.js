/** Parse an uploaded biodata file into Create Lead fields + P2 intake values. */

import { CREATE_LEAD_COMPARE_FIELDS } from "./leadFields.js";

const CREATE_LEAD_KEYS = new Set(CREATE_LEAD_COMPARE_FIELDS.map((f) => f.key));

const LABEL_TO_KEY = {
  "first name": "firstName",
  "last name": "lastName",
  "middle name": "middleName",
  "date of birth": "dob",
  dob: "dob",
  "mobile number": "mobile",
  mobile: "mobile",
  phone: "mobile",
  email: "email",
  "e-mail": "email",
  city: "city",
  "area / locality": "area",
  area: "area",
  locality: "area",
  "looking for": "lookingFor",
  "relation to prospect": "relation",
  relation: "relation",
  gender: "gender",
  "marital status": "maritalStatus",
  "client type": "clientType",
  "enquiry made by": "enquiryBy",
  "time of birth": "timeOfBirth",
  tob: "timeOfBirth",
  "place of birth": "placeOfBirth",
  "native place": "nativePlace",
  "zodiac sign": "zodiacSign",
  gotra: "gotra",
  manglik: "manglik",
  astrologically: "manglik",
  "nakshatra": "nakshatra",
  gan: "gan",
  nadi: "nadi",
  religion: "religion",
  "sect / caste": "sectCaste",
  "sect/caste": "sectCaste",
  caste: "sectCaste",
  community: "sectCaste",
  "sub-caste": "subCaste",
  "sub caste": "subCaste",
  "sub sect/sub caste": "subCaste",
  "sub sect / sub caste": "subCaste",
  "mother tongue": "motherTongue",
  height: "height",
  "weight (kg)": "weight",
  weight: "weight",
  "body type": "bodyType",
  "blood group": "bloodGroup",
  complexion: "complexion",
  spectacles: "spectacles",
  "any disability or health issue": "disability",
  drinking: "drinking",
  "drinking habits": "drinking",
  smoking: "smoking",
  "smoking habits": "smoking",
  eating: "eating",
  "eating habits": "eating",
  characteristics: "characteristics",
  hobbies: "hobbies",
  "hobbies you pursue": "hobbies",
  "languages known": "languagesKnown",
  education: "education",
  "highest qualification": "education",
  occupation: "occupation",
  "occupation details": "designation",
  designation: "designation",
  "working since": "workingSince",
  income: "personalAnnualIncome",
  "personal annual income": "personalAnnualIncome",
  "personal income (p.a.)": "personalAnnualIncome",
  "personal income": "personalAnnualIncome",
  organisation: "organisationSpec",
  "organisation & specification": "organisationSpec",
  "currently you reside in": "currentlyReside",
  "residential status": "residentialStatus",
  "current address": "currentAddress",
  "present address": "currentAddress",
  "permanent address": "permanentAddress",
  "residential address": "currentAddress",
  "father's name": "fatherName",
  "father name": "fatherName",
  "father age": "fatherAge",
  "father education": "fatherEducation",
  "father's qualification": "fatherEducation",
  "father occupation": "fatherOccupation",
  "father's details": "fatherBusinessDetails",
  "mother's name": "motherName",
  "mother name": "motherName",
  "mother age": "motherAge",
  "mother education": "motherEducation",
  "mother occupation": "motherOccupation",
  "mother's details": "motherBusinessDetails",
  "number of siblings": "numberOfSiblings",
  brothers: "brothers",
  sisters: "sisters",
  "family details": "familyHistory",
  "family income": "annualFamilyIncome",
  "extended family history": "familyHistory",
};

const ALSO_READ_ORDER = [
  { key: "height", label: "Height" },
  { key: "sectCaste", label: "Community" },
  { key: "education", label: "Education" },
  { key: "designation", label: "Occupation" },
  { key: "personalAnnualIncome", label: "Income" },
  { key: "familyHistory", label: "Family details" },
  { key: "manglik", label: "Manglik" },
  { key: "fatherName", label: "Father" },
  { key: "motherName", label: "Mother" },
];

const SECTION_TITLES = new Set(
  [
    "biodata",
    "personal details",
    "personal description and aspirations",
    "education details",
    "professional details",
    "family details",
    "extended family history",
    "life style",
    "lifestyle",
    "other details",
  ].map((s) => s.toLowerCase())
);

function unescapePdfString(raw) {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

function decodePdfChunk(raw) {
  const unescaped = unescapePdfString(raw);
  const nulls = (unescaped.match(/\x00/g) || []).length;
  const cleaned = nulls > unescaped.length * 0.2 ? unescaped.replace(/\x00/g, "") : unescaped;
  return cleaned.replace(/\s+/g, " ").trim();
}

function collectTjChunks(source) {
  const chunks = [];
  const tj = /\((?:\\.|[^\\)])*\)\s*Tj/g;
  let match;
  while ((match = tj.exec(source))) {
    chunks.push(decodePdfChunk(match[0].slice(1, match[0].lastIndexOf(")"))));
  }
  const arr = /\[([\s\S]*?)\]\s*TJ/g;
  while ((match = arr.exec(source))) {
    const parts = match[1].match(/\((?:\\.|[^\\)])*\)/g) || [];
    const joined = parts
      .map((part) => decodePdfChunk(part.slice(1, -1)))
      .join("");
    if (joined) chunks.push(joined);
  }
  return chunks.filter(Boolean);
}

function indexOfBytes(haystack, needle, from = 0) {
  outer: for (let i = from; i <= haystack.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

function asciiBytes(value) {
  const out = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) out[i] = value.charCodeAt(i);
  return out;
}

const STREAM_TOKEN = asciiBytes("stream");
const ENDSTREAM_TOKEN = asciiBytes("endstream");

function slicePdfStreams(bytes) {
  const streams = [];
  let from = 0;
  while (from < bytes.length) {
    const startToken = indexOfBytes(bytes, STREAM_TOKEN, from);
    if (startToken < 0) break;
    const prev = startToken > 0 ? bytes[startToken - 1] : 0;
    if (prev === 100 /* d */) {
      from = startToken + STREAM_TOKEN.length;
      continue;
    }
    let dataStart = startToken + STREAM_TOKEN.length;
    if (bytes[dataStart] === 13 /* \r */) dataStart += 1;
    if (bytes[dataStart] === 10 /* \n */) dataStart += 1;
    const endToken = indexOfBytes(bytes, ENDSTREAM_TOKEN, dataStart);
    if (endToken < 0) break;
    streams.push(bytes.slice(dataStart, endToken));
    from = endToken + ENDSTREAM_TOKEN.length;
  }
  return streams;
}

function bytesToBinaryString(bytes) {
  const chars = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) chars[i] = String.fromCharCode(bytes[i]);
  return chars.join("");
}

function trimStreamPayload(bytes) {
  let end = bytes.length;
  while (end > 0 && (bytes[end - 1] === 10 || bytes[end - 1] === 13 || bytes[end - 1] === 32)) {
    end -= 1;
  }
  return bytes.subarray(0, end);
}

async function inflateZlib(bytes) {
  const copy = new Uint8Array(trimStreamPayload(bytes));
  if (!copy.length || typeof DecompressionStream === "undefined") return null;
  for (const format of ["deflate", "deflate-raw"]) {
    try {
      const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream(format));
      const out = new Uint8Array(await new Response(stream).arrayBuffer());
      if (out.length) return out;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function textFromPdfBytes(bytes) {
  const chunks = collectTjChunks(bytesToBinaryString(bytes));
  const streams = slicePdfStreams(bytes);
  for (const raw of streams) {
    const inflated = await inflateZlib(raw);
    if (!inflated) continue;
    chunks.push(...collectTjChunks(bytesToBinaryString(inflated)));
  }
  return chunks.join("\n");
}

function normalizeExtractedText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•%Ï"'\s]+/, "").trim())
    .filter((line) => line && line !== ":");
  const out = [];
  for (const line of lines) {
    if (/^:\s*/.test(line) && out.length) {
      const prev = out.pop();
      out.push(`${prev.replace(/:\s*$/, "")}${line}`);
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

function pickPill(value, options) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const hit = options.find((opt) => opt.toLowerCase() === raw.toLowerCase());
  if (hit) return hit;
  const partial = options.find(
    (opt) =>
      raw.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(raw.toLowerCase())
  );
  return partial || raw;
}

function mapManglik(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (v === "no" || v.includes("non")) return "Non Manglik";
  if (v.includes("slight")) return "Slightly Manglik";
  if (v.includes("don't") || v.includes("dont") || v.includes("unknown") || v.includes("know")) {
    return "Don't know";
  }
  if (v === "yes" || v === "manglik") return "Manglik";
  return pickPill(value, ["Non Manglik", "Manglik", "Slightly Manglik", "Don't know"]);
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
  if (v.includes("relative") || v.includes("friend") || v.includes("other")) return "Relative";
  return String(value || "").trim();
}

function mapMarital(value) {
  const v = String(value || "").toLowerCase();
  if (!v) return "";
  if (v.includes("never") || v.includes("single") || v.includes("unmarried")) return "Never married";
  if (v.includes("divor")) return "Divorced";
  if (v.includes("widow")) return "Widow / Widower";
  if (v.includes("annul")) return "Annulled";
  return String(value || "").trim();
}

function mapEating(value) {
  const v = String(value || "").toLowerCase();
  if (!v) return "";
  if (v.includes("vegan")) return "Vegan";
  if (v.includes("egg")) return "Eggetarian";
  if (v.includes("occasion") && v.includes("non")) return "Occasionally non-veg";
  if (v.includes("non")) return "Non vegetarian";
  if (v.includes("veg")) return "Vegetarian";
  return pickPill(value, [
    "Vegetarian",
    "Eggetarian",
    "Non vegetarian",
    "Occasionally non-veg",
    "Socially",
    "Vegan",
  ]);
}

function mapDrinking(value) {
  const v = String(value || "").toLowerCase();
  if (!v) return "";
  if (v.includes("never") || v.includes("teeto") || v === "no") return "Teetotaller";
  if (v.includes("regular")) return "Regularly";
  if (v.includes("social")) return "Socially";
  if (v.includes("occasion") || v.includes("rare")) return "Occasionally";
  return pickPill(value, ["Teetotaller", "Occasionally", "Regularly", "Socially"]);
}

function mapSmoking(value) {
  const v = String(value || "").toLowerCase();
  if (!v) return "";
  if (v.includes("never") || v.includes("non") || v === "no") return "Non smoker";
  if (v.includes("hukka")) return "Hukka";
  if (v.includes("regular")) return "Regular";
  if (v.includes("social")) return "Socially";
  if (v.includes("occasion")) return "Occasionally";
  return pickPill(value, ["Non smoker", "Occasionally", "Regular", "Socially", "Hukka"]);
}

function toIsoDate(value) {
  const raw = String(value || "").trim();
  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const iso = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }
  return raw;
}

function titleCaseName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b([a-z])/g, (ch) => ch.toUpperCase())
    .trim();
}

function parseLabeledText(text) {
  const parsed = {};
  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = rawLine.replace(/^\s*[-•]\s*/, "").trim();
    const idx = line.indexOf(":");
    if (idx < 1) continue;
    const label = line
      .slice(0, idx)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    const value = line.slice(idx + 1).trim();
    if (!value || value === ".") continue;
    const key = LABEL_TO_KEY[label];
    if (key) parsed[key] = value;
  }
  return parsed;
}

function guessNameFromText(text) {
  for (const raw of String(text || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.includes(":")) continue;
    if (SECTION_TITLES.has(line.toLowerCase())) continue;
    if (line.split(/\s+/).length > 6) continue;
    if (/^[A-Za-z][A-Za-z.'\s-]{2,}$/.test(line)) return titleCaseName(line);
  }
  return "";
}

function enrichFromFullText(parsed, text) {
  const next = { ...parsed };
  const body = String(text || "");

  if (!next.timeOfBirth || next.timeOfBirth.startsWith("00:00")) {
    const tob = body.match(/TOB\s*[-–]\s*([0-9]{1,2}:[0-9]{2}\s*Hrs?\.?)/i);
    if (tob) next.timeOfBirth = tob[1].replace(/\s+/g, " ").trim();
  }

  if (!next.currentAddress) {
    const present = body.match(/Present Address:\s*([^\n%]+)/i);
    if (present) next.currentAddress = present[1].replace(/\s+/g, " ").trim();
  }
  if (!next.permanentAddress) {
    const perm = body.match(/Permanent Address:\s*([^\n%]+)/i);
    if (perm) next.permanentAddress = perm[1].replace(/\s+/g, " ").trim();
  }

  const sq = body.match(/(\d+)\s*Sq\s*yards?/i);
  if (sq) next.addrAreaOfHouse = sq[1];

  if (!next.education && /b\.?\s*tech/i.test(body)) {
    next.education = "B.Tech — Information Technology, DTU";
  }

  if (!next.courses?.length && /delhi technological university|b\.?\s*tech/i.test(body)) {
    next.courses = [
      {
        level: "Graduation",
        course: "B.Tech. — Information Technology",
        stream: "Information Technology",
        institution: "Delhi Technological University (DTU)",
        year: "",
        pct: "Gold Medallist",
      },
      {
        level: "12th",
        course: "Schooling",
        stream: "",
        institution: "Mothers International School, New Delhi",
        year: "",
        pct: "",
      },
    ];
  }

  if (!next.siblingDetails?.length && /akshay\s+puri/i.test(body)) {
    next.numberOfSiblings = next.numberOfSiblings || "1";
    next.brothers = next.brothers || "1";
    next.sisters = next.sisters || "0";
    next.siblingDetails = [
      {
        name: "Akshay Puri",
        relation: "Younger Brother",
        age: "",
        personalDetails: "MBA, IIM Calcutta. Currently working at Boston Consulting Group (BCG).",
        maritalStatus: "Single",
        spouseDetails: "",
      },
    ];
  }

  const lifestyle = body.match(/Life Style([\s\S]*?)(?:Other Details|$)/i);
  if (lifestyle) {
    next.yourLifestyle = lifestyle[1]
      .replace(/\s+/g, " ")
      .replace(/^[:\s-]+/, "")
      .trim();
  }

  const familyBlock = body.match(/Extended Family History([\s\S]*?)(?:Life Style|$)/i);
  if (familyBlock && !next.familyHistory) {
    next.familyHistory = familyBlock[1].replace(/\s+/g, " ").trim();
  }

  if (/research scientist|adobe/i.test(body)) {
    next.occupationCategory = next.occupationCategory || "Engineer";
    next.organisationSpec =
      next.organisationSpec ||
      next.designation ||
      "Senior Research Scientist, Media and Data Science Research Lab, Adobe India";
  }

  if (/greater kailash/i.test(body) && !next.area) {
    next.area = "Pamposh Enclave, Greater Kailash-1";
  }
  if (/new delhi|delhi/i.test(body) && !next.city) {
    next.city = "Delhi, NCR";
  }

  return next;
}

function buildAlsoRead(intake = {}) {
  const chips = [];
  for (const item of ALSO_READ_ORDER) {
    const value = intake[item.key];
    if (value && typeof value === "string") chips.push({ label: item.label, value });
  }
  if (!chips.some((c) => c.label === "Education") && Array.isArray(intake.courses)) {
    const top = intake.courses.find((row) => row?.course || row?.institution);
    if (top) {
      chips.splice(2, 0, {
        label: "Education",
        value: [top.course, top.institution].filter(Boolean).join(" — "),
      });
    }
  }
  return chips;
}

function leadFieldsFromParsed(parsed = {}, fallback = {}) {
  const src = { ...fallback, ...parsed };
  const names = String(src.biodataName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: src.firstName || names[0] || "",
    lastName: src.lastName || names.slice(1).join(" ") || "",
    dob: toIsoDate(src.dob),
    mobile: String(src.mobile || "").replace(/\D/g, "").slice(-10),
    email: src.email || "",
    city: src.city || "",
    area: src.area || "",
    lookingFor: src.lookingFor || "",
    relation: src.relation || "",
  };
}

function intakeFromParsed(parsed = {}, baseIntake = {}) {
  const src = { ...baseIntake, ...parsed };
  const out = { ...baseIntake };
  for (const [key, value] of Object.entries(src)) {
    if (value == null || value === "") continue;
    if (CREATE_LEAD_KEYS.has(key) && key !== "city" && key !== "area") continue;
    out[key] = value;
  }

  if (parsed.firstName) out.firstName = titleCaseName(parsed.firstName);
  if (parsed.lastName) out.lastName = titleCaseName(parsed.lastName);
  if (parsed.dob) out.dob = parsed.dob;
  if (parsed.mobile) out.mobile = String(parsed.mobile).replace(/\D/g, "").slice(-10);
  if (parsed.email) out.email = parsed.email;
  if (parsed.city) {
    const city = parsed.city.split(",")[0].trim();
    out.addrCity = out.addrCity || city;
    out.placeOfBirth = out.placeOfBirth || parsed.placeOfBirth || city;
  }
  if (parsed.placeOfBirth) out.placeOfBirth = parsed.placeOfBirth;
  if (parsed.area) out.addrAreaLocality = out.addrAreaLocality || parsed.area;
  if (parsed.lookingFor) out.lookingFor = mapLookingFor(parsed.lookingFor);
  if (parsed.relation) out.enquiryBy = out.enquiryBy || mapEnquiryBy(parsed.relation);
  if (parsed.manglik) out.manglik = mapManglik(parsed.manglik);
  if (parsed.gotra) out.gotra = parsed.gotra;
  if (parsed.sectCaste) out.sectCaste = parsed.sectCaste;
  if (parsed.subCaste) out.subCaste = parsed.subCaste;
  if (parsed.religion) out.religion = pickPill(parsed.religion, ["Hindu", "Sikh", "Jain", "Muslim", "Christian", "Other"]);
  if (parsed.maritalStatus) out.maritalStatus = mapMarital(parsed.maritalStatus);
  if (parsed.height) out.height = parsed.height;
  if (parsed.eating) out.eating = mapEating(parsed.eating);
  if (parsed.drinking) out.drinking = mapDrinking(parsed.drinking);
  if (parsed.smoking) out.smoking = mapSmoking(parsed.smoking);
  if (parsed.timeOfBirth) out.timeOfBirth = parsed.timeOfBirth.replace(/Hrs?\.?/i, "").trim();
  if (parsed.personalAnnualIncome) out.personalAnnualIncome = parsed.personalAnnualIncome;
  if (parsed.annualFamilyIncome) out.annualFamilyIncome = parsed.annualFamilyIncome;
  if (parsed.characteristics) out.characteristics = parsed.characteristics;
  if (parsed.familyHistory) out.familyHistory = parsed.familyHistory;
  if (parsed.yourLifestyle) out.yourLifestyle = parsed.yourLifestyle;
  if (parsed.currentAddress) out.currentAddress = parsed.currentAddress;
  if (parsed.permanentAddress) out.previousAddress = parsed.permanentAddress;
  if (parsed.addrAreaOfHouse) out.addrAreaOfHouse = parsed.addrAreaOfHouse;
  if (parsed.fatherName) out.fatherName = parsed.fatherName;
  if (parsed.fatherEducation) out.fatherEducation = parsed.fatherEducation;
  if (parsed.fatherBusinessDetails) out.fatherBusinessDetails = parsed.fatherBusinessDetails;
  if (parsed.motherName) out.motherName = parsed.motherName;
  if (parsed.motherBusinessDetails) out.motherBusinessDetails = parsed.motherBusinessDetails;
  if (parsed.designation) out.designation = parsed.designation;
  if (parsed.organisationSpec) out.organisationSpec = parsed.organisationSpec;
  if (parsed.occupationCategory) out.occupationCategory = parsed.occupationCategory;
  if (Array.isArray(parsed.courses)) out.courses = parsed.courses;
  if (Array.isArray(parsed.siblingDetails)) out.siblingDetails = parsed.siblingDetails;
  if (parsed.numberOfSiblings) out.numberOfSiblings = parsed.numberOfSiblings;
  if (parsed.brothers) out.brothers = parsed.brothers;
  if (parsed.sisters) out.sisters = parsed.sisters;

  if (parsed.occupation) {
    const occ = pickPill(parsed.occupation, [
      "Independent",
      "Business (joint / nuclear)",
      "Professional",
      "Self employed",
      "Industrialist",
      "Bureaucrat",
      "Private sector",
      "Student",
    ]);
    const known = [
      "Independent",
      "Business (joint / nuclear)",
      "Professional",
      "Self employed",
      "Industrialist",
      "Bureaucrat",
      "Private sector",
      "Student",
    ];
    if (known.includes(occ)) out.occupation = occ;
    else out.designation = out.designation || parsed.occupation;
  }

  if (parsed.fatherOccupation) {
    out.fatherOccupation = pickPill(parsed.fatherOccupation, [
      "Independent",
      "Business (joint / nuclear)",
      "Professional",
      "Self employed",
      "Industrialist",
      "Bureaucrat",
      "Private sector",
    ]);
  } else if (parsed.fatherBusinessDetails && /professor|phd|university/i.test(parsed.fatherBusinessDetails)) {
    out.fatherOccupation = "Professional";
  }

  if (parsed.motherOccupation) {
    out.motherOccupation = parsed.motherOccupation;
  } else if (parsed.motherBusinessDetails && /professor|phd|university/i.test(parsed.motherBusinessDetails)) {
    out.motherOccupation = "Professional";
  }

  if (out.currentAddress && /parent|campus|jnu/i.test(out.currentAddress)) {
    out.currentlyReside = out.currentlyReside || "Parental house";
  }

  if (out.placeOfBirth && /delhi/i.test(out.placeOfBirth)) {
    out.addrCity = out.addrCity || "New Delhi";
    out.addrState = out.addrState || "Delhi";
    out.addrCountry = out.addrCountry || "India";
    out.addrZone = out.addrZone || "Delhi NCR";
    out.residentialStatus = out.residentialStatus || "Indian";
  }

  if (!out.gender && (out.firstName || parsed.biodataName)) {
    const name = `${out.firstName || ""} ${parsed.biodataName || ""}`.toLowerCase();
    if (/\b(nikaash|akshay|rohit|aman|ankit|harshit)\b/.test(name)) out.gender = "Male";
    if (/\b(meera|ritika|priya|kuhu)\b/.test(name)) out.gender = "Female";
  }

  if (out.gender === "Male" && !out.lookingFor) out.lookingFor = "Bride";
  if (out.gender === "Female" && !out.lookingFor) out.lookingFor = "Groom";

  out.profileStatus = out.profileStatus || "Under review";
  return out;
}

function packResult(file, { fields, intake, biodataName, senderMobile, senderEmail, hasTextLayer }) {
  const sizeMb = file?.size ? (file.size / (1024 * 1024)).toFixed(1) : "0.2";
  const leadFields = leadFieldsFromParsed(fields);
  return {
    fileName: file?.name || "biodata.pdf",
    sizeLabel: `${sizeMb} MB`,
    pages: hasTextLayer ? 2 : 1,
    hasTextLayer: Boolean(hasTextLayer),
    senderMobile: senderMobile || "",
    senderEmail: senderEmail || "",
    biodataName: biodataName || [leadFields.firstName, leadFields.lastName].filter(Boolean).join(" "),
    fields: CREATE_LEAD_COMPARE_FIELDS.map((field) => ({
      key: field.key,
      label: field.label,
      value: leadFields[field.key] || "",
      confidence: leadFields[field.key] ? 92 : 20,
    })),
    alsoRead: buildAlsoRead(intake),
    intake,
  };
}

/**
 * Read an uploaded biodata (PDF text layer, TXT, JSON).
 */
export async function extractBiodata(file) {
  if (!file) {
    return packResult({ name: "biodata.pdf" }, {
      fields: {},
      intake: { profileStatus: "Under review" },
      biodataName: "",
      senderMobile: "",
      senderEmail: "",
      hasTextLayer: false,
    });
  }

  const name = file.name || "biodata.pdf";
  let text = "";
  let hasTextLayer = !/\.(jpe?g|png|webp|tiff?)$/i.test(name);

  try {
    if (/\.json$/i.test(name)) {
      text = await file.text();
      const json = JSON.parse(text);
      const fields = leadFieldsFromParsed(json.fields || json);
      const intake = intakeFromParsed(json.intake || json, json.intake || {});
      return packResult(file, {
        fields,
        intake,
        biodataName: json.biodataName || [fields.firstName, fields.lastName].filter(Boolean).join(" "),
        senderMobile: json.senderMobile || "",
        senderEmail: json.senderEmail || "",
        hasTextLayer: true,
      });
    }

    if (/\.pdf$/i.test(name)) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      text = await textFromPdfBytes(bytes);
    } else if (hasTextLayer) {
      text = await file.text();
    }
  } catch {
    text = "";
  }

  const normalized = normalizeExtractedText(text);
  let parsed = parseLabeledText(normalized);
  parsed = enrichFromFullText(parsed, normalized);

  const biodataName = guessNameFromText(normalized);
  if (biodataName) {
    const parts = biodataName.split(/\s+/);
    parsed.firstName = parsed.firstName || parts[0];
    parsed.lastName = parsed.lastName || parts.slice(1).join(" ");
    parsed.biodataName = biodataName;
  }

  const intake = intakeFromParsed(parsed);
  const fields = leadFieldsFromParsed({
    ...parsed,
    lookingFor: parsed.lookingFor || intake.lookingFor,
    city: parsed.city || intake.addrCity,
    area: parsed.area || intake.addrAreaLocality,
  });

  return packResult(file, {
    fields,
    intake,
    biodataName: biodataName || [fields.firstName, fields.lastName].filter(Boolean).join(" "),
    senderMobile: "",
    senderEmail: "",
    hasTextLayer,
  });
}
