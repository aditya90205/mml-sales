export const INITIAL_SECTIONS = [
  {
    n: 1,
    heading: "Identity & verification documents",
    items: [
      {
        id: "aadhaar",
        title: "Aadhaar card",
        note: "Enter Aadhaar number, submit OTP, then upload front and back to verify.",
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
        note: "Enter PAN number, submit OTP, then upload front and back to verify.",
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
        note: "Enter father's Aadhaar number, submit OTP, then upload front and back.",
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
        note: "Enter father's PAN number, submit OTP, then upload front and back.",
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
        note: "Enter mother's Aadhaar number, submit OTP, then upload front and back.",
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
        note: "Enter mother's PAN number, submit OTP, then upload front and back.",
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
        note: "Third-party request raised 24 Jul.",
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
    return names ? `${shown} verified. Uploaded ${names}.` : `${shown} verified. Front and back uploaded.`;
  }
  if (item.idType === "pan") {
    const pan = String(payload.number || "PAN").replace(/\s/g, "");
    return names ? `${pan} verified. Uploaded ${names}.` : `${pan} verified. Front and back uploaded.`;
  }
  return names ? `Uploaded ${names}.` : "Document uploaded.";
}

export function applyItemUpload(sections, itemId, payload) {
  const next = Array.isArray(payload) ? { files: payload } : payload || {};
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        done: true,
        status: "Verified",
        tone: "green",
        files: next.files || [],
        number: next.number || item.number,
        details: next.details || item.details,
        note: formatUploadedNote(item, next),
      };
    }),
  }));
}
