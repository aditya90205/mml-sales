const STAGE_IDS = ["P0", "P1", "P2", "P3", "P4", "P5", "P6"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TARGETS = {
  visits: 15,
  revenue: 800000,
  calls: 80,
  registrations: 50,
  followup: 100,
};

/** Same payment book as Post-Sales → Payment Collection. */
const PAYMENTS = [
  { name: "Dr. Arjun Nair", collectedNum: 60000, balanceNum: 40000, pkg: "Exclusive" },
  { name: "Shalini Kapoor", collectedNum: 375000, balanceNum: 125000, pkg: "Exclusive Privé" },
  { name: "Sanjay Mehta", collectedNum: 51000, balanceNum: 0, pkg: "Premium" },
  { name: "Ritu Saxena", collectedNum: 15000, balanceNum: 10000, pkg: "Classic" },
  { name: "Vikram Ahluwalia", collectedNum: 700000, balanceNum: 300000, pkg: "Signature" },
  { name: "Aditya Verma", collectedNum: 25500, balanceNum: 25500, pkg: "Premium" },
  { name: "Priya Raheja", collectedNum: 25000, balanceNum: 0, pkg: "Classic" },
  { name: "Karan Malhotra", collectedNum: 30000, balanceNum: 21000, pkg: "Premium" },
];

const PERIOD_SPAN = {
  today: "today",
  this_week: "this week",
  this_month: "this month",
  this_quarter: "this quarter",
  this_year: "this year",
};

function flattenLeads(leadsByStage = {}) {
  return STAGE_IDS.flatMap((stageId) =>
    (leadsByStage[stageId] || []).map((lead) => ({ ...lead, stageId }))
  );
}

function mergeLeadBooks(leadsByStage, myLeads = []) {
  const pipeline = flattenLeads(leadsByStage);
  const lostByName = new Set(myLeads.filter((l) => l.lost).map((l) => l.name));
  const known = new Set(pipeline.map((l) => l.name));
  const extras = myLeads
    .filter((l) => !known.has(l.name))
    .map((lead) => ({
      ...lead,
      stageId: String(lead.stage || "").slice(0, 2),
      hrs: parseFollowUpHours(lead.followUp) ?? 24,
      lost: Boolean(lead.lost),
    }));
  return [
    ...pipeline.map((lead) => ({ ...lead, lost: lostByName.has(lead.name) })),
    ...extras,
  ];
}

function parseFollowUpHours(label) {
  const n = parseInt(String(label || ""), 10);
  return Number.isFinite(n) ? n : null;
}

function workingDaysLeft(from = new Date()) {
  const end = new Date(from.getFullYear(), from.getMonth() + 1, 0);
  let n = 0;
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  while (d <= end) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) n += 1;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

function formatLakhs(n) {
  const abs = Math.max(0, Number(n) || 0);
  const L = abs / 100000;
  if (L >= 10) return `₹${Math.round(L)}L`;
  if (L >= 1) return `₹${Number(L.toFixed(1)).toString().replace(/\.0$/, "")}L`;
  if (abs >= 1000) return `₹${Math.round(abs / 1000)}k`;
  return `₹${Math.round(abs)}`;
}

function formatInr(n) {
  return `₹${Math.round(Math.max(0, Number(n) || 0)).toLocaleString("en-IN")}`;
}

function weekdayFromVisitDate(value) {
  const parsed = new Date(`${value} 2026`);
  if (Number.isNaN(parsed.getTime())) return "";
  return WEEKDAYS[parsed.getDay()];
}

function hourLabel(hour) {
  const h = ((Number(hour) % 24) + 24) % 24;
  const next = (h + 1) % 24;
  const fmt = (n) => {
    const suffix = n >= 12 ? "PM" : "AM";
    const twelve = n % 12 === 0 ? 12 : n % 12;
    return `${twelve} ${suffix}`;
  };
  return `${fmt(h)} – ${fmt(next)}`;
}

function classifyCalendarEvent(ev) {
  const type = String(ev.meta?.meetingType || ev.meta?.meetingTypes?.[0] || "").toLowerCase();
  const title = String(ev.title || "").toLowerCase();
  if (type === "telephonic" || (/\bcall\b/.test(title) && !/video/.test(title))) return "call";
  if (type === "video" || /video/.test(title)) return "video";
  if (type === "face" || /home/.test(title)) return "home";
  if (/office/.test(title)) return "office";
  if (ev.category === "meeting") return "office";
  return null;
}

function eventClient(ev) {
  return ev.meta?.client || String(ev.title || "").replace(/^(video call|office visit|home visit)\s*[—-]\s*/i, "").trim();
}

function eventWeekday(ev) {
  const date = ev.date instanceof Date ? ev.date : new Date(ev.date);
  if (Number.isNaN(date.getTime())) return "";
  return WEEKDAYS[date.getDay()];
}

export function buildPerformanceReport({
  leadsByStage,
  myLeads = [],
  events = [],
  tasks = [],
  visits = [],
  period = "this_month",
} = {}) {
  const span = PERIOD_SPAN[period] || "this month";
  const leads = mergeLeadBooks(leadsByStage, myLeads);
  const byStage = Object.fromEntries(STAGE_IDS.map((id) => [id, leads.filter((l) => l.stageId === id)]));
  const totalLeads = leads.length;
  const p5 = byStage.P5 || [];
  const p6 = byStage.P6 || [];
  const p3 = byStage.P3 || [];

  const followup = buildFollowup(leads, span);
  const visitStats = buildVisits({ p3, events, visits, span });
  const calls = buildCalls({ leads, events, tasks, span });
  const conversion = buildConversion({ byStage, totalLeads, p6Count: p6.length, span });
  const registrations = buildRegistrations({ p5, p6, span });
  const revenue = buildRevenue({ p5, span });

  const scores = [
    pct(visitStats.done, TARGETS.visits),
    pct(revenue.booked, TARGETS.revenue),
    pct(calls.made, TARGETS.calls),
    conversion.rate,
    pct(registrations.count, TARGETS.registrations),
    followup.score,
  ];
  const overall = Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length);

  return {
    overall,
    segments: {
      visits: { value: String(visitStats.done), target: String(TARGETS.visits) },
      revenue: { value: formatLakhs(revenue.booked), target: "8L" },
      calls: { value: String(calls.made), target: String(TARGETS.calls) },
      conversion: { value: `${conversion.rate}%`, target: null },
      registrations: {
        value: String(registrations.count),
        target: String(TARGETS.registrations),
        note: `${pct(registrations.count, TARGETS.registrations)}% of target`,
      },
      followup: { value: String(followup.score), target: "100" },
    },
    details: {
      followup: followup.detail,
      visits: visitStats.detail,
      calls: calls.detail,
      conversion: conversion.detail,
      registrations: registrations.detail,
      revenue: revenue.detail,
    },
  };
}

function pct(part, whole) {
  if (!whole) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}

function buildFollowup(leads, span) {
  const total = leads.length;
  const missed = leads.filter((l) => l.lost);
  const late = leads.filter((l) => !l.lost && Number(l.hrs) <= 8);
  const onTime = leads.filter((l) => !l.lost && Number(l.hrs) > 8);
  const delayHrs = late.map((l) => Math.max(0, 24 - Number(l.hrs || 0)));
  const avgDelay = delayHrs.length
    ? (delayHrs.reduce((sum, n) => sum + n, 0) / delayHrs.length).toFixed(1)
    : "0";
  const score = total ? Math.round((onTime.length / total) * 100) : 100;

  const items = [
    ...missed.map((l) => `${l.name} · missed`),
    ...late.map((l) => `${l.name} · ${Math.max(1, 24 - Number(l.hrs || 0))} h late`),
  ].slice(0, 4);

  return {
    score,
    detail: {
      title: "How the score is made",
      subtitle: `On time on ${onTime.length} of ${total} follow-ups ${span}`,
      score: String(score),
      target: "100",
      metric: "Follow-up Discipline",
      rows: [
        { label: "On time", value: String(onTime.length) },
        { label: "Missed", value: String(missed.length) },
        { label: "Avg delay", value: `${avgDelay} h` },
      ],
      items,
    },
  };
}

function buildVisits({ p3, events, visits = [], span }) {
  const extra = (events || [])
    .map((ev) => ({ ev, kind: classifyCalendarEvent(ev) }))
    .filter(({ kind }) => kind === "home" || kind === "office" || kind === "video")
    .map(({ ev, kind }) => ({
      client: eventClient(ev),
      type: kind === "home" ? "Home visit" : kind === "office" ? "Office" : "Video call",
      weekday: eventWeekday(ev),
      status: "Scheduled",
    }));

  const fromTab = visits.map((v) => ({
    client: v.client,
    type: v.type === "Home visit" ? "Home visit" : v.type === "Office visit" ? "Office" : v.type,
    weekday: weekdayFromVisitDate(v.date),
    status: v.status,
  }));

  const fromP3 = p3.map((lead) => ({
    client: lead.name,
    type: "Video call",
    weekday: "",
    status: "Scheduled",
  }));

  const seen = new Set();
  const all = [...fromTab, ...extra, ...fromP3].filter((row) => {
    const key = `${row.client}|${row.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const home = all.filter((v) => /home/i.test(v.type)).length;
  const office = all.filter((v) => /office/i.test(v.type)).length;
  const video = all.filter((v) => /video/i.test(v.type)).length;
  const done = all.filter((v) => /complete/i.test(v.status)).length;
  const upcoming = all.length - done;

  const items = all
    .filter((v) => !/complete/i.test(v.status))
    .slice(0, 4)
    .map((v) => [v.client, v.type, v.weekday].filter(Boolean).join(" · "));

  return {
    done,
    detail: {
      title: `Visits & meetings ${span}`,
      subtitle: `${done} done of ${TARGETS.visits} · ${upcoming} still to happen`,
      score: String(done),
      target: String(TARGETS.visits),
      metric: "Monthly visits / Meetings",
      rows: [
        { label: "Home visits", value: String(home) },
        { label: "Office meetings", value: String(office) },
        { label: "Video calls", value: String(video) },
      ],
      items,
    },
  };
}

function buildCalls({ leads, events, tasks, span }) {
  const callLeads = leads.filter((l) =>
    /call|outbound/i.test(`${l.source || ""} ${l.nextAction || ""} ${l.nextActionNote || ""}`)
  );
  const extraCalls = (events || []).filter((ev) => classifyCalendarEvent(ev) === "call");
  const callTasks = (tasks || []).filter((t) => /call|follow up/i.test(t.title || ""));
  const connected = callLeads.filter((l) => !l.lost && (l.lastDiscussion || Number(l.hrs) > 8)).length
    + extraCalls.length
    + callTasks.filter((t) => t.stage === "Done").length;
  const noAnswer = callLeads.filter((l) => l.lost).length
    + callTasks.filter((t) => t.stage === "Blocked" || /no response/i.test(t.title || "")).length;
  const made = Math.max(connected + noAnswer, callLeads.length + extraCalls.length + callTasks.length);
  const owed = Math.max(0, TARGETS.calls - made);

  const hours = [
    ...extraCalls.map((ev) => ev.startH).filter((h) => Number.isFinite(h)),
    ...callLeads.map((l) => {
      const m = String(l.followUpNote || "").match(/(\d{1,2})/);
      return m ? Number(m[1]) : null;
    }).filter((h) => Number.isFinite(h)),
  ];
  const hourCounts = hours.reduce((acc, h) => {
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});
  const bestHour = Object.keys(hourCounts).sort((a, b) => hourCounts[b] - hourCounts[a])[0];

  return {
    made,
    detail: {
      title: periodTitle("Calls", span),
      subtitle: `${made} made · ${owed} still owed against the daily bar`,
      score: String(made),
      target: String(TARGETS.calls),
      metric: "Calls per Day",
      rows: [
        { label: "Connected", value: String(connected) },
        { label: "No answer", value: String(noAnswer) },
        { label: "Best hour", value: bestHour != null ? hourLabel(bestHour) : "—" },
      ],
    },
  };
}

function periodTitle(noun, span) {
  if (span === "today") return `${noun} today`;
  return `${noun} ${span}`;
}

function buildConversion({ byStage, totalLeads, p6Count, span }) {
  const current = STAGE_IDS.map((id) => (byStage[id] || []).length);
  const reached = current.map((_, i) => current.slice(i).reduce((sum, n) => sum + n, 0));
  const steps = [];
  for (let i = 0; i < STAGE_IDS.length - 1; i += 1) {
    const from = reached[i];
    const to = reached[i + 1];
    const rate = from ? Math.round((to / from) * 100) : 0;
    steps.push({ from: STAGE_IDS[i], to: STAGE_IDS[i + 1], rate });
  }
  const weakest = steps.reduce((a, b) => (b.rate < a.rate ? b : a), steps[0]);
  const strongest = steps.reduce((a, b) => (b.rate > a.rate ? b : a), steps[0]);
  const rate = totalLeads ? Math.round((p6Count / totalLeads) * 100) : 0;

  return {
    rate,
    detail: {
      title: `Where ${rate}% comes from`,
      subtitle: `${p6Count} conversions from ${totalLeads} leads worked ${span}`,
      score: `${rate}%`,
      target: null,
      metric: "Conversion Rate",
      rows: [
        { label: "Weakest step", value: weakest ? `${weakest.from} → ${weakest.to} · ${weakest.rate}%` : "—" },
        { label: "Strongest step", value: strongest ? `${strongest.from} → ${strongest.to} · ${strongest.rate}%` : "—" },
        { label: "Closed (P6)", value: String(p6Count) },
      ],
    },
  };
}

function isPremiumPackage(lead) {
  return Boolean(lead.starred) || /premium|exclusive|signature/i.test(lead.pkg || "");
}

function buildRegistrations({ p5, p6, span }) {
  const registered = [...p5, ...p6];
  const count = registered.length;
  const remaining = Math.max(0, TARGETS.registrations - count);
  const daysLeft = Math.max(1, workingDaysLeft());
  const needed = (remaining / daysLeft).toFixed(1);
  const premium = registered.filter(isPremiumPackage).length;
  const basic = count - premium;

  return {
    count,
    detail: {
      title: "Registration pace",
      subtitle: `${remaining} to go with ${daysLeft} working days left`,
      score: String(count),
      target: String(TARGETS.registrations),
      metric: "No. of registrations",
      rows: [
        { label: "Needed per day", value: needed },
        { label: "Basic / Standard", value: String(basic) },
        { label: "Premium & above", value: String(premium) },
      ],
    },
  };
}

function buildRevenue({ p5 }) {
  const collected = PAYMENTS.reduce((sum, r) => sum + r.collectedNum, 0);
  const unpaid = PAYMENTS.reduce((sum, r) => sum + r.balanceNum, 0);
  const sitting = p5.length * 51000;
  const booked = collected + unpaid;
  const items = PAYMENTS
    .filter((r) => r.balanceNum > 0)
    .sort((a, b) => b.balanceNum - a.balanceNum)
    .slice(0, 3)
    .map((r) => `${r.name} · ${formatInr(r.balanceNum)} due`);

  return {
    booked,
    detail: {
      title: `Revenue against ${formatLakhs(TARGETS.revenue)}`,
      subtitle: `${formatLakhs(collected)} in the bank, ${formatLakhs(unpaid)} invoiced but unpaid`,
      score: formatLakhs(booked),
      target: "8L",
      metric: "Revenue",
      rows: [
        { label: "Collected", value: formatLakhs(collected) },
        { label: "Invoiced unpaid", value: formatLakhs(unpaid) },
        { label: "Sitting in P5", value: formatLakhs(sitting) },
      ],
      items,
    },
  };
}
