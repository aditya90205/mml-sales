import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AudioLines, FileText, StickyNote, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import StatusPill from "../../../components/common/StatusPill";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import {
  CheckRow,
  DeskTable,
  FIELD,
  Field,
  FilterSelect,
  OutlineButton,
  PrimaryButton,
  ProgressMeter,
  SectionCard,
  StepLabel,
  Td,
} from "../../../components/pipeline/deskUi";
import { dashRow, dashRows } from "./stageContent.jsx";

const CAPTURE_ITEMS = [
  { title: "House / GPS photo", note: "Taken at the door with location accuracy under 15m.", status: "Captured", tone: "green", done: true },
  { title: "Selfie with client", note: "Staff and client in frame. Used for in-person verification.", status: "Captured", tone: "green", done: true },
  { title: "Staff activity form", note: "Who attended, talking points and next action.", status: "Pending", tone: "amber", done: false, pending: true },
  { title: "Advance booking call log", note: "Call confirming the slot is logged against the deal.", status: "Not started", tone: "gray", done: false },
];

const LAST_ACTION_ICONS = [
  { key: "summary", label: "Client summary", Icon: UserRound, color: "#2563EB", hoverBg: "hover:bg-[#E8F2FE]" },
  { key: "notes", label: "Meeting notes", Icon: StickyNote, color: "#F59E0B", hoverBg: "hover:bg-[#FFF3E4]" },
  { key: "recording", label: "Recording", Icon: AudioLines, color: "#DC2626", hoverBg: "hover:bg-[#FEE2E2]" },
  { key: "transcript", label: "Transcript", Icon: FileText, color: "#7C3AED", hoverBg: "hover:bg-[#F3E8FF]" },
];

const VISITS = [
  {
    date: "02 Jul",
    client: "Aditya Verma",
    type: "Home visit",
    executive: "Rohit Khanna",
    capture: "2 of 4",
    captureTone: "amber",
    vehicle: "Yes",
    status: "Scheduled",
    statusTone: "blue",
    lastAction: {
      summary: "Family open to Premium; prefers GK / South Delhi matches",
      notes: "Discussed package options; parents want evening slots",
      recording: "Not recorded yet",
      transcript: "Not available",
    },
  },
  {
    date: "14 Jul",
    client: "Sanjay Mehta",
    type: "Office visit",
    executive: "Pooja Sharma",
    capture: "4 of 4",
    captureTone: "green",
    vehicle: "No",
    status: "Completed",
    statusTone: "green",
    lastAction: {
      summary: "Ready to shortlist 5 profiles this week",
      notes: "Agreed on Classic package; KYC pending",
      recording: "18 min · Office visit",
      transcript: "Full transcript ready (12 pages)",
    },
  },
  {
    date: "26 Jul",
    client: "Shalini Kapoor",
    type: "Home visit",
    executive: "Rohit Khanna",
    capture: "4 of 4",
    captureTone: "green",
    vehicle: "Yes",
    status: "Completed",
    statusTone: "green",
    lastAction: {
      summary: "Warm lead · wants video call with shortlisted matches",
      notes: "Mother preferred caste filters; budget confirmed ₹51k",
      recording: "24 min · Home visit",
      transcript: "Key points extracted",
    },
  },
  {
    date: "30 Jul",
    client: "Vivek Sharma",
    type: "Home visit",
    executive: "Nikhil Bansal",
    capture: "0 of 4",
    captureTone: "gray",
    vehicle: "Yes",
    status: "Scheduled",
    statusTone: "blue",
    lastAction: {
      summary: "Visit not started",
      notes: "No notes yet",
      recording: "Not recorded yet",
      transcript: "Not available",
    },
  },
];

const COLUMNS = [
  { label: "Date", key: "date" },
  { label: "Client", key: "client" },
  { label: "Type", key: "type" },
  { label: "Executive", key: "executive" },
  { label: "Capture", key: "capture" },
  { label: "Vehicle", key: "vehicle" },
  { label: "Status", key: "status" },
  { label: "action", key: "lastAction", unsortable: true },
];

function LastActionIcon({ label, value, Icon, color, hoverBg, flushLeft = false }) {
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const [pos, setPos] = useState(null);

  const open = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = 220;
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const top = r.bottom + 8;
    setPos({ top, left, width });
  };

  const scheduleClose = () => {
    hideTimer.current = setTimeout(() => setPos(null), 100);
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocus={open}
        onBlur={scheduleClose}
        className={`${flushLeft ? "pl-0 pr-1.5 py-1.5" : "p-1.5"} rounded-lg transition-colors ${hoverBg}`}
        style={{ color }}
        aria-label={`${label}: ${value}`}
      >
        <Icon size={14} />
      </button>
      {pos &&
        createPortal(
          <div
            role="tooltip"
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
            className="fixed z-[80] rounded-lg border border-black/10 bg-white px-2.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
            <p className="mt-0.5 text-[11.5px] font-medium leading-snug text-[#111]">{value}</p>
          </div>,
          document.body
        )}
    </>
  );
}

function LastActionIcons({ values = {}, empty = false }) {
  return (
    <div className="flex items-center gap-0.5">
      {LAST_ACTION_ICONS.map(({ key, label, Icon, color, hoverBg }, index) => (
        <LastActionIcon
          key={key}
          label={label}
          value={empty ? "—" : values[key] || "—"}
          Icon={Icon}
          color={color}
          hoverBg={hoverBg}
          flushLeft={index === 0}
        />
      ))}
    </div>
  );
}

/** Same design and data as the standalone "Smart Home & Office Visits" page. */
export default function VisitsMeetingsTab({ empty = false }) {
  const [visitType, setVisitType] = useState("Home visit");
  const [date, setDate] = useState("2026-07-02");
  const [slot, setSlot] = useState("11:00 AM – 1:00 PM");
  const [client, setClient] = useState("Aditya Verma");
  const [attend, setAttend] = useState("Client + both parents");
  const [vehicle, setVehicle] = useState("Yes — branch car");
  const [period, setPeriod] = useState("month");
  const [typeFilter, setTypeFilter] = useState("all");
  const [capture, setCapture] = useState(CAPTURE_ITEMS);

  const captureItems = empty ? capture.map((item) => dashRow({ ...item, done: false, tone: "gray" }, ["title", "note"])) : capture;
  const captureDone = captureItems.filter((i) => i.done).length;
  const captureTotal = captureItems.length;

  const toggleCapture = (title) => {
    if (empty) return;
    setCapture((prev) =>
      prev.map((item) => {
        if (item.title !== title) return item;
        const done = !item.done;
        return { ...item, done, status: done ? "Captured" : "Pending", tone: done ? "green" : "amber" };
      })
    );
  };

  const rows = useMemo(
    () => VISITS.filter((r) => typeFilter === "all" || r.type === typeFilter),
    [typeFilter]
  );
  const { sorted, sort, toggle } = useTableSort(dashRows(rows, empty, ["client", "lastAction"]), { defaultKey: "date" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-[16px] font-bold text-[#111]">Visits & Meetings</h2>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={() => toast.info("Reschedule slot opened.")}>Reschedule</OutlineButton>
          <PrimaryButton onClick={() => toast.success("Visit started. Capture checklist is live.")}>Start Visit</PrimaryButton>
        </div>
      </div>

      <SectionCard
        title={`Home visit — ${empty ? "-" : "Aditya Verma"}`}
        subtitle="MML-D-10434 · Greater Kailash · GPS required"
        action={<ProgressMeter label="Scheduled" percent={35} color="#F59E0B" />}
      >
        <StepLabel n={1}>Visit details</StepLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Visit type" required>
            <select value={visitType} onChange={(e) => setVisitType(e.target.value)} className={FIELD}>
              <option>Home visit</option>
              <option>Office visit</option>
            </select>
          </Field>
          <Field label="Date" required>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
          </Field>
          <Field label="Time slot" required>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} className={FIELD}>
              <option>11:00 AM – 1:00 PM</option>
              <option>2:00 PM – 4:00 PM</option>
              <option>5:00 PM – 7:00 PM</option>
            </select>
          </Field>
          <Field label="Client" required>
            <input value={client} onChange={(e) => setClient(e.target.value)} className={FIELD} />
          </Field>
          <Field label="Who will attend" required>
            <input value={attend} onChange={(e) => setAttend(e.target.value)} className={FIELD} />
          </Field>
          <Field label="Vehicle required">
            <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className={FIELD}>
              <option>Yes — branch car</option>
              <option>No — staff travel</option>
            </select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Mandatory capture"
        subtitle="House photo, selfie, activity form and booking call. Incomplete visits do not count to KPI."
        action={<ProgressMeter label={`${captureDone} of ${captureTotal}`} percent={captureTotal ? (captureDone / captureTotal) * 100 : 0} color={captureDone === captureTotal ? "#16A34A" : "#F59E0B"} />}
      >
        {captureItems.map((item, i) => (
          <CheckRow key={`${item.title}-${i}`} {...item} onToggle={() => toggleCapture(item.title)} />
        ))}
      </SectionCard>

      <SectionCard
        title="Upcoming and recent visits"
        subtitle="Home and office visits logged against the pipeline."
        action={
          <>
            <FilterSelect
              value={period}
              onChange={setPeriod}
              options={[
                { value: "month", label: "This month" },
                { value: "quarter", label: "This quarter" },
              ]}
            />
            <FilterSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "Type: All" },
                { value: "Home visit", label: "Home visit" },
                { value: "Office visit", label: "Office visit" },
              ]}
            />
          </>
        }
        footnote="Visits without complete capture do not count towards the KPI scorecard."
      >
        <DeskTable columns={COLUMNS} sort={sort} onSort={toggle}>
          {sorted.map((row, i) => (
            <tr key={`${row.date}-${row.client}-${i}`} className="border-b border-black/5 last:border-0">
              <Td muted>{row.date}</Td>
              <Td strong>{row.client}</Td>
              <Td>{row.type}</Td>
              <Td>{row.executive}</Td>
              <Td>
                <StatusPill tone={row.captureTone}>{row.capture}</StatusPill>
              </Td>
              <Td>{row.vehicle}</Td>
              <Td>
                <StatusPill tone={row.statusTone}>{row.status}</StatusPill>
              </Td>
              <Td>
                <LastActionIcons values={row.lastAction} empty={empty} />
              </Td>
            </tr>
          ))}
        </DeskTable>
      </SectionCard>
    </div>
  );
}
