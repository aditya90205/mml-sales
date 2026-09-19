export const INITIAL_SECTIONS = [
  {
    n: 1,
    heading: "Identity & verification documents",
    items: [
      {
        id: "aadhaar",
        title: "Aadhaar card",
        note: "Upload the document first. Verify appears after upload.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "aadhaar",
        otp: true,
      },
      {
        id: "pan",
        title: "PAN card",
        note: "Upload the document first. Verify appears after upload.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "pan",
        otp: true,
      },
      {
        id: "father-aadhaar",
        title: "Father Aadhaar",
        note: "Upload father's Aadhaar first. Verify appears after upload.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "aadhaar",
        otp: true,
      },
      {
        id: "father-pan",
        title: "Father PAN",
        note: "Upload father's PAN first. Verify appears after upload.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "pan",
        otp: true,
      },
      {
        id: "mother-aadhaar",
        title: "Mother Aadhaar",
        note: "Upload mother's Aadhaar first. Verify appears after upload.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "aadhaar",
        otp: true,
      },
      {
        id: "mother-pan",
        title: "Mother PAN",
        note: "Upload mother's PAN first. Verify appears after upload.",
        status: "Pending",
        tone: "amber",
        done: false,
        upload: "id-card",
        idType: "pan",
        otp: true,
      },
      {
        id: "police",
        title: "Police verification",
        note: "Upload the report first. Verify appears after upload.",
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
        note: "Captured at home visit, 02 Jul · GPS ±8m.",
        status: "Verified",
        tone: "green",
        done: true,
        upload: "files",
        files: [{ name: "house-gps.jpg" }],
      },
      {
        id: "selfie",
        title: "Selfie with client",
        note: "Captured at home visit, 02 Jul.",
        status: "Verified",
        tone: "green",
        done: true,
        upload: "files",
        files: [{ name: "selfie-with-client.jpg" }],
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

export function formatUploadedNote(item, payload = {}) {
  const files = payload.files || [];
  const names = files.map((f) => f.name).filter(Boolean).join(", ");
  if (item.idType === "aadhaar" || item.upload === "aadhaar") {
    const shown = maskAadhaar(payload.number) || "Aadhaar";
    return names ? `${shown} uploaded ${names}. Click Verify.` : `${shown} uploaded. Click Verify.`;
  }
  if (item.idType === "pan") {
    const pan = String(payload.number || "PAN").replace(/\s/g, "");
    return names ? `${pan} uploaded ${names}. Click Verify.` : `${pan} uploaded. Click Verify.`;
  }
  return names ? `Uploaded ${names}. Click Verify.` : "Document uploaded. Click Verify.";
}

export function formatVerifiedNote(item) {
  const files = item.files || [];
  const names = files.map((f) => f.name).filter(Boolean).join(", ");
  if (item.idType === "aadhaar" || item.upload === "aadhaar") {
    const shown = maskAadhaar(item.number) || "Aadhaar";
    return names ? `${shown} verified. Uploaded ${names}.` : `${shown} verified.`;
  }
  if (item.idType === "pan") {
    const pan = String(item.number || "PAN").replace(/\s/g, "");
    return names ? `${pan} verified. Uploaded ${names}.` : `${pan} verified.`;
  }
  return names ? `Verified. Uploaded ${names}.` : "Document verified.";
}

export function applyItemUpload(sections, itemId, payload) {
  const next = Array.isArray(payload) ? { files: payload } : payload || {};
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.id !== itemId) return item;
      const files = next.files || [];
      return {
        ...item,
        done: false,
        status: "Uploaded",
        tone: "blue",
        files,
        number: next.number || item.number,
        details: next.details || item.details,
        note: formatUploadedNote(item, next),
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
