function eventStart(ev) {
  if (!ev?.date || ev.startH == null) return null;
  const start = new Date(ev.date);
  if (Number.isNaN(start.getTime())) return null;
  start.setHours(Number(ev.startH) || 0, Number(ev.startM) || 0, 0, 0);
  return start;
}

function eventEnd(ev) {
  const start = eventStart(ev);
  if (!start) return null;
  const end = new Date(start);
  const due = ev?.meta?.dueDate ? new Date(ev.meta.dueDate) : null;
  if (due && !Number.isNaN(due.getTime())) {
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    if (dueDay.getTime() > startDay.getTime()) {
      end.setFullYear(due.getFullYear(), due.getMonth(), due.getDate());
    }
  }
  const endH = ev.endH == null ? start.getHours() + 1 : Number(ev.endH);
  const endM = Number(ev.endM) || 0;
  end.setHours(Number.isNaN(endH) ? start.getHours() + 1 : endH, Number.isNaN(endM) ? 0 : endM, 0, 0);
  if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
  return end;
}

const DONE = new Set(["completed", "done", "complete"]);

/** due | completed — anything still open stays due until the end time passes or status is Done. */
export function calendarItemLifecycle(ev, now = Date.now()) {
  const raw = String(ev?.meta?.status || ev?.meta?.stage || "").toLowerCase().trim();
  if (DONE.has(raw)) return "completed";
  const end = eventEnd(ev);
  if (end && end.getTime() <= now) return "completed";
  return "due";
}

export function lifecycleLabel(lifecycle, fallback = "New") {
  if (lifecycle === "completed") return "Completed";
  return fallback || "New";
}

function peopleOf(ev) {
  const meta = ev?.meta || {};
  const list = Array.isArray(meta.people) && meta.people.length ? meta.people : meta.assignees;
  return (Array.isArray(list) ? list : []).filter(Boolean);
}

function generatedSummary(ev) {
  const meta = ev?.meta || {};
  const title = ev?.title || "this session";
  const people = peopleOf(ev);
  const who = people.length ? people.join(" and ") : "The team";
  const client = meta.client ? ` with ${meta.client}` : "";
  const about = String(meta.description || meta.formDescription || meta.notes || "").trim().replace(/\.$/, "");
  if (!about) return `${who} finished ${title}${client}. Open points were closed and the next follow-up was locked.`;
  return `${who} finished ${title}${client}. ${about}. Owners and the next follow-up were confirmed.`;
}

function generatedTranscript(ev) {
  const meta = ev?.meta || {};
  const title = ev?.title || "this session";
  const people = peopleOf(ev);
  const host = people[0] || "Host";
  const other = people[1] || meta.client || "Team";
  const about = String(meta.description || meta.formDescription || `We need to close ${title}.`).trim();
  return [
    `${host}: Thanks for joining. Let’s wrap ${title}.`,
    `${other}: ${about}`,
    `${host}: Agreed. I’ll send this summary and we’ll pick up the follow-up from here.`,
  ].join("\n");
}

/** Stored AI notes when present, otherwise a recap built from this meeting or task. */
export function aiInsightsForItem(ev) {
  const meta = ev?.meta || {};
  const summary = String(meta.aiSummary || meta.meetingSummary || meta.clientSummary || "").trim();
  const transcript = String(meta.transcript || meta.aiTranscript || "").trim();
  return {
    summary: summary || generatedSummary(ev),
    transcript: transcript || generatedTranscript(ev),
  };
}
