export const INITIAL_SECTIONS = [
  {
    n: 1,
    heading: "Identity & verification documents",
    items: [
      {
        id: "aadhaar",
        title: "Aadhaar card",
        note: "Upload the card. View will extract details and compare with the profile.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "aadhaar",
      },
      {
        id: "pan",
        title: "PAN card",
        note: "Upload the card. View will extract details and compare with the profile.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "pan",
      },
      {
        id: "father-aadhaar",
        title: "Father Aadhaar",
        note: "Upload father's Aadhaar. View will extract and compare with family details.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "aadhaar",
      },
      {
        id: "father-pan",
        title: "Father PAN",
        note: "Upload father's PAN. View will extract and compare with family details.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "pan",
      },
      {
        id: "mother-aadhaar",
        title: "Mother Aadhaar",
        note: "Upload mother's Aadhaar. View will extract and compare with family details.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "aadhaar",
      },
      {
        id: "mother-pan",
        title: "Mother PAN",
        note: "Upload mother's PAN. View will extract and compare with family details.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "pan",
      },
      {
        id: "police",
        title: "Police verification",
        note: "Upload the report first. View appears after upload.",
        status: "In progress",
        tone: "blue",
        done: false,
        upload: "files",
      },
    ],
  },
  {
    n: 2,
    heading: "In-person verified data — the MML USP",
    items: [
      {
        id: "house-gps",
        title: "House / GPS photo",
        note: "Click from the camera at the house. View will show the GPS address to compare with the profile.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "camera-gps",
        cameraFacing: "environment",
      },
      {
        id: "selfie",
        title: "Selfie with client",
        note: "Open the camera and click at the visit. View will show the GPS address to compare with the profile.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "camera-gps",
        cameraFacing: "user",
      },
      {
        id: "staff-activity",
        title: "Staff activity form",
        note: "Completed by Rohit Khanna after the visit.",
        status: "Verified",
        tone: "green",
        done: true,
        upload: "files",
        files: [{ name: "staff-activity-form.pdf" }],
      },
      {
        id: "booking-call",
        title: "Advance booking call log",
        note: "Logged 01 Jul, 6:14 PM.",
        status: "Verified",
        tone: "green",
        done: true,
        upload: "files",
        files: [{ name: "booking-call-log.pdf" }],
      },
    ],
  },
  {
    n: 3,
    heading: "Profile & data completeness",
    items: [
      { id: "biodata", title: "Bio-data complete", note: "All mandatory fields filled.", status: "Verified", tone: "green", done: true },
      {
        id: "photos-video",
        title: "Photos & video",
        note: "Verified. Reshoot flagged by executive.",
        status: "Verified",
        tone: "green",
        done: true,
        upload: "files",
        files: [{ name: "profile-photos.zip" }],
      },
      { id: "candidate-pref", title: "Candidate preferences", note: "Profession, city and community locked.", status: "Verified", tone: "green", done: true },
      { id: "parent-pref", title: "Parent preferences", note: "Questionnaire completed 14 Jul.", status: "Verified", tone: "green", done: true },
      {
        id: "kundli",
        title: "Kundli / horoscope",
        note: "Uploaded and attached to the profile.",
        status: "Verified",
        tone: "green",
        done: true,
        upload: "files",
        files: [{ name: "kundli.pdf" }],
      },
    ],
  },
  {
    n: 4,
    heading: "Commercial & consent",
    items: [
      { id: "payment", title: "Payment cleared in full", note: "₹18,100 balance outstanding.", status: "Pending", tone: "amber", done: false },
      { id: "contract-otp", title: "Contract signed with OTP", note: "Signed 29 Jun, 6:18 PM.", status: "Verified", tone: "green", done: true },
      { id: "visibility", title: "Client self-approval of visibility", note: "Client confirmed what may be shown to matches.", status: "Verified", tone: "green", done: true },
    ],
  },
];

export const QUEUE = [
  { deal: "MML-D-10428", client: "Sanjay Mehta", pkg: "Premium", verified: "13/16", verifiedPct: 81, blocking: "Balance payment", owner: "Rohit Khanna", status: "Blocked", tone: "red", bar: "#E8395B" },
  { deal: "MML-D-10412", client: "Shalini Kapoor", pkg: "Exclusive Privé", verified: "15/16", verifiedPct: 94, blocking: "Police verification", owner: "Pooja Sharma", status: "Exception raised", tone: "amber", bar: "#F59E0B" },
  { deal: "MML-D-10388", client: "Aditya Verma", pkg: "Signature", verified: "16/16", verifiedPct: 100, blocking: "—", owner: "Nikhil Bansal", status: "Ready for RM", tone: "green", bar: "#16A34A" },
];

export const QUEUE_COLUMNS = [
  { label: "Deal", key: "deal" },
  { label: "Client", key: "client" },
  { label: "Package", key: "pkg" },
  { label: "Verified", key: "verified" },
  { label: "Blocking item", key: "blocking" },
  { label: "Owner", key: "owner" },
  { label: "Status", key: "status" },
];

function maskAadhaar(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 4) return "";
  return `•••• ${digits.slice(-4)}`;
}

const ID_PROFILES = {
  self: {
    name: "Sanjay Mehta",
    dob: "30 Sep 1992",
    address: "Greater Kailash II, New Delhi, Delhi",
    fatherName: "Ramesh Mehta",
    gender: "Male",
    aadhaar: "123456789012",
    pan: "ABCDE1234F",
  },
  father: {
    name: "Ramesh Mehta",
    dob: "12 Mar 1964",
    address: "Greater Kailash II, New Delhi, Delhi",
    fatherName: "Mohan Lal Mehta",
    gender: "Male",
    aadhaar: "234567890123",
    pan: "FGHIJ5678K",
  },
  mother: {
    name: "Kavita Mehta",
    dob: "08 Aug 1968",
    address: "Greater Kailash II, New Delhi, Delhi",
    fatherName: "Suresh Khanna",
    gender: "Female",
    aadhaar: "345678901234",
    pan: "LMNOP9012Q",
  },
};

function profileFor(itemId, clientName) {
  const key = String(itemId || "").startsWith("father")
    ? "father"
    : String(itemId || "").startsWith("mother")
      ? "mother"
      : "self";
  const profile = ID_PROFILES[key];
  if (key === "self" && clientName) return { ...profile, name: clientName };
  return profile;
}

function compact(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function dateKey(value) {
  const text = String(value || "").trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`;
  const dmy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) return `${dmy[3]}${dmy[2].padStart(2, "0")}${dmy[1].padStart(2, "0")}`;
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const named = text.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i);
  if (named) {
    const month = months.findIndex((m) => named[2].toLowerCase().startsWith(m));
    if (month >= 0) return `${named[3]}${String(month + 1).padStart(2, "0")}${named[1].padStart(2, "0")}`;
  }
  return compact(text);
}

function compareField(extracted, profile, kind = "text") {
  if (!extracted) return "missing";
  if (!profile) return "document-only";
  if (kind === "date") return dateKey(extracted) === dateKey(profile) ? "match" : "mismatch";
  const a = compact(extracted);
  const b = compact(profile);
  if (!a || !b) return "missing";
  if (a === b) return "match";
  if (a.includes(b) || b.includes(a)) return "partial";
  return "mismatch";
}

/** Placeholder OCR — production will read the card. Demo values match the sample profile. */
export function extractIdPlaceholder(item, clientName) {
  const profile = profileFor(item.id, clientName);
  if (item.idType === "aadhaar" || item.upload === "aadhaar") {
    return {
      name: profile.name,
      dob: profile.dob,
      gender: profile.gender,
      address: `${profile.gender === "Female" ? "D/O" : "S/O"} ${profile.fatherName}, H.No. 14, Greater Kailash-II, New Delhi - 110048`,
      number: profile.aadhaar,
    };
  }
  if (item.idType === "pan") {
    return {
      name: profile.name,
      dob: profile.dob,
      fatherName: profile.fatherName,
      number: profile.pan,
    };
  }
  return null;
}

export function isCameraGpsItem(item) {
  return item?.upload === "camera-gps";
}

export function formatGpsCoords(gps) {
  if (gps?.lat == null || gps?.lng == null) return "";
  const acc = gps.accuracy != null ? ` · ±${Math.round(gps.accuracy)}m` : "";
  return `${Number(gps.lat).toFixed(5)}, ${Number(gps.lng).toFixed(5)}${acc}`;
}

export function compareGpsWithProfile(item, gps, clientName) {
  const profile = profileFor("self", clientName);
  const address = gps?.address || "";
  return [
    {
      key: "address",
      label: "Address",
      extracted: address,
      profile: profile.address,
      status: compareField(address, profile.address),
    },
  ];
}

export function compareIdWithProfile(item, extracted, clientName) {
  const profile = profileFor(item.id, clientName);
  if (!extracted) return [];
  if (item.idType === "aadhaar" || item.upload === "aadhaar") {
    return [
      { key: "name", label: "Name", extracted: extracted.name, profile: profile.name, status: compareField(extracted.name, profile.name) },
      { key: "dob", label: "Date of birth", extracted: extracted.dob, profile: profile.dob, status: compareField(extracted.dob, profile.dob, "date") },
      { key: "address", label: "Address", extracted: extracted.address, profile: profile.address, status: compareField(extracted.address, profile.address) },
      { key: "gender", label: "Gender", extracted: extracted.gender, profile: profile.gender, status: compareField(extracted.gender, profile.gender) },
      { key: "number", label: "Aadhaar number", extracted: maskAadhaar(extracted.number) || extracted.number, profile: "Not stored on profile", status: "document-only" },
    ];
  }
  if (item.idType === "pan") {
    return [
      { key: "name", label: "Name", extracted: extracted.name, profile: profile.name, status: compareField(extracted.name, profile.name) },
      { key: "dob", label: "Date of birth", extracted: extracted.dob, profile: profile.dob, status: compareField(extracted.dob, profile.dob, "date") },
      { key: "fatherName", label: "Father's name", extracted: extracted.fatherName, profile: profile.fatherName, status: compareField(extracted.fatherName, profile.fatherName) },
      { key: "number", label: "PAN number", extracted: extracted.number, profile: "Not stored on profile", status: "document-only" },
    ];
  }
  return [];
}

export function comparisonSummary(rows = []) {
  const match = rows.filter((row) => row.status === "match").length;
  const review = rows.filter((row) => row.status === "partial" || row.status === "mismatch").length;
  const total = rows.length;
  if (!total) return "";
  if (review === 0) return `${match} of ${total} fields match the profile.`;
  if (review === 1) return `${match} of ${total} fields match. 1 field needs a quick review.`;
  return `${match} of ${total} fields match. ${review} fields need a quick review.`;
}

export function formatUploadedNote(item, payload = {}) {
  const files = payload.files || [];
  const names = files.map((f) => f.name).filter(Boolean).join(", ");
  if (item.idType === "aadhaar" || item.upload === "aadhaar") {
    const shown = maskAadhaar(payload.number) || "Aadhaar";
    return `${shown} extracted. Open View to compare with the profile, then Verify.`;
  }
  if (item.idType === "pan") {
    const pan = String(payload.number || "PAN").replace(/\s/g, "");
    return `${pan} extracted. Open View to compare with the profile, then Verify.`;
  }
  if (item.upload === "camera-gps") {
    const addr = payload.gps?.address;
    return addr
      ? `Captured at ${addr}. Open View to compare with the profile address, then Verify.`
      : "Photo captured. Open View to compare with the profile address, then Verify.";
  }
  return names ? `Uploaded ${names}. Open View, then Verify.` : "Document uploaded. Open View, then Verify.";
}

export function formatVerifiedNote(item) {
  const files = item.files || [];
  const names = files.map((f) => f.name).filter(Boolean).join(", ");
  if (item.idType === "aadhaar" || item.upload === "aadhaar") {
    const shown = maskAadhaar(item.number) || "Aadhaar";
    return names ? `${shown} verified against the profile. Uploaded ${names}.` : `${shown} verified against the profile.`;
  }
  if (item.idType === "pan") {
    const pan = String(item.number || "PAN").replace(/\s/g, "");
    return names ? `${pan} verified against the profile. Uploaded ${names}.` : `${pan} verified against the profile.`;
  }
  if (item.upload === "camera-gps") {
    const addr = item.gps?.address;
    return addr ? `Verified against the profile address. Captured at ${addr}.` : "Verified against the profile address.";
  }
  return names ? `Verified. Uploaded ${names}.` : "Document verified.";
}

export function applyItemUpload(sections, itemId, payload, clientName) {
  const next = Array.isArray(payload) ? { files: payload } : payload || {};
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.id !== itemId) return item;
      const files = next.files || [];
      if (item.upload === "camera-gps") {
        const gps = next.gps || {};
        return {
          ...item,
          done: false,
          status: "Uploaded",
          tone: "blue",
          files,
          gps,
          extracted: gps,
          comparison: compareGpsWithProfile(item, gps, clientName),
          note: formatUploadedNote(item, { ...next, gps }),
        };
      }
      const extracted = extractIdPlaceholder(item, clientName);
      const comparison = compareIdWithProfile(item, extracted, clientName);
      return {
        ...item,
        done: false,
        status: "Uploaded",
        tone: "blue",
        files,
        extracted,
        comparison,
        number: extracted?.number || next.number || item.number,
        details: next.details || item.details,
        note: formatUploadedNote(item, { ...next, number: extracted?.number || next.number }),
      };
    }),
  }));
}

export function applyItemVerify(sections, itemId) {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        done: true,
        status: "Verified",
        tone: "green",
        note: formatVerifiedNote(item),
      };
    }),
  }));
}
