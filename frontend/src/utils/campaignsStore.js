const STORAGE_KEY = "mml_campaigns";

const DEFAULT_CAMPAIGNS = [
  {
    id: 1,
    name: "Search for Matrimony",
    tag: "UTM: gads_delhi_intent",
    target: "Common Pool",
    channel: "SMS",
    start: "Manual",
    end: "Manual",
    owner: "Nikhil Bansal",
    status: "Not Started",
    description: "",
  },
  {
    id: 2,
    name: "South Ex Hoarding · Cycle 4",
    tag: "Ring Road site",
    target: "Jalandhar",
    channel: "WhatsApp",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Pooja Sharma",
    status: "Active",
    description: "",
  },
  {
    id: 3,
    name: "30% Offer",
    tag: "dsp",
    target: "Doctors",
    channel: "Email, SMS",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Vinti Malhotra",
    status: "Completed",
    description: "",
  },
  {
    id: 4,
    name: "Community sabha · Rohini",
    tag: "On-ground stall",
    target: "IIT, IIM",
    channel: "Push",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Nikhil Bansal",
    status: "Active",
    description: "",
  },
  {
    id: 5,
    name: "Jul-26 Monsoon Offer",
    tag: "UTM: ig_jul26_monsoon",
    target: "P3 Pipeline",
    channel: "SMS",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Vinti Malhotra",
    status: "Scheduled",
    description: "",
  },
  {
    id: 6,
    name: "Sep-26 NRI Dubai teaser",
    tag: "Muslim matrimony pilot",
    target: "New Opportunity",
    channel: "WhatsApp, Push",
    start: "01 Aug 21 - 09:32 PM",
    end: "01 Aug 21 - 09:32 PM",
    owner: "Nikhil Bansal",
    status: "Stop Manually",
    description: "",
  },
];

function writeCampaigns(campaigns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch {
    /* ignore */
  }
}

export function readCampaigns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeCampaigns(DEFAULT_CAMPAIGNS);
      return [...DEFAULT_CAMPAIGNS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_CAMPAIGNS];
  } catch {
    return [...DEFAULT_CAMPAIGNS];
  }
}

export function saveCampaigns(campaigns) {
  writeCampaigns(campaigns);
  return campaigns;
}

const CHANNEL_LABELS = {
  email: "Email",
  whatsapp: "WhatsApp",
  push: "Push",
  sms: "SMS",
};

export function channelsFromSelection(selectedChannels = {}) {
  return Object.entries(selectedChannels)
    .filter(([, on]) => on)
    .map(([key]) => CHANNEL_LABELS[key] || key)
    .join(", ");
}

/** Format create-campaign schedule { date, time } → "01 Aug 26 - 09:32 PM". */
export function formatScheduleLabel(schedule) {
  if (!schedule?.date || !schedule?.time) return null;
  const [year, month, day] = schedule.date.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  const [hhRaw, mmRaw] = schedule.time.split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 || 12;
  const timePart = `${String(h12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${period}`;
  return `${datePart} - ${timePart}`;
}

function resolveStartLabel(payload) {
  if (payload.start) return payload.start;
  if (payload.startMode === "Time based") {
    return formatScheduleLabel(payload.startSchedule) || "Time based";
  }
  return payload.startMode || "Manual";
}

function resolveEndLabel(payload) {
  if (payload.end) return payload.end;
  if (payload.stopMode === "Time based") {
    return formatScheduleLabel(payload.endSchedule) || "Time based";
  }
  if (payload.stopMode === "Customer Action") return "Customer Action";
  return payload.stopMode || "Manual";
}

export function addCampaign(payload) {
  const list = readCampaigns();
  const id = list.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0) + 1;
  const channel =
    payload.channel ||
    channelsFromSelection(payload.selectedChannels) ||
    "SMS";
  const created = {
    id,
    name: payload.name?.trim() || "Untitled Campaign",
    tag: payload.tag || payload.description?.trim() || "New campaign",
    target: payload.target || payload.group || "Common Pool",
    channel,
    start: resolveStartLabel(payload),
    end: resolveEndLabel(payload),
    startSchedule: payload.startMode === "Time based" ? payload.startSchedule || null : null,
    endSchedule: payload.stopMode === "Time based" ? payload.endSchedule || null : null,
    startMode: payload.startMode || null,
    stopMode: payload.stopMode || null,
    owner: payload.owner || "You",
    status: payload.status || "Not Started",
    description: payload.description || "",
    country: payload.country || "",
    maxRetry: payload.maxRetry || "",
  };
  const next = [created, ...list];
  writeCampaigns(next);
  return created;
}

export function updateCampaign(id, patch) {
  const next = readCampaigns().map((c) => (c.id === id ? { ...c, ...patch } : c));
  writeCampaigns(next);
  return next.find((c) => c.id === id) || null;
}

export function removeCampaign(id) {
  const next = readCampaigns().filter((c) => c.id !== id);
  writeCampaigns(next);
  return next;
}
