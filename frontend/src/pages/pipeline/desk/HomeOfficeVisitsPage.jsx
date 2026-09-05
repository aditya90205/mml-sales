import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import StatusPill from "../../../components/common/StatusPill";
import { useTableSort } from "../../../components/common/useTableSort.jsx";
import {
  CheckRow,
  DeskPage,
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

const CAPTURE_ITEMS = [
  { title: "House / GPS photo", note: "Taken at the door with location accuracy under 15m.", status: "Captured", tone: "green", done: true },
  { title: "Selfie with client", note: "Staff and client in frame. Used for in-person verification.", status: "Captured", tone: "green", done: true },
  { title: "Staff activity form", note: "Who attended, talking points and next action.", status: "Pending", tone: "amber", done: false, pending: true },
  { title: "Advance booking call log", note: "Call confirming the slot is logged against the deal.", status: "Not started", tone: "gray", done: false },
];

const VISITS = [
  { date: "02 Jul", client: "Aditya Verma", type: "Home visit", executive: "Rohit Khanna", capture: "2 of 4", captureTone: "amber", vehicle: "Yes", status: "Scheduled", statusTone: "blue" },
  { date: "14 Jul", client: "Sanjay Mehta", type: "Office visit", executive: "Pooja Sharma", capture: "4 of 4", captureTone: "green", vehicle: "No", status: "Completed", statusTone: "green" },
  { date: "26 Jul", client: "Shalini Kapoor", type: "Home visit", executive: "Rohit Khanna", capture: "4 of 4", captureTone: "green", vehicle: "Yes", status: "Completed", statusTone: "green" },
  { date: "30 Jul", client: "Vivek Sharma", type: "Home visit", executive: "Nikhil Bansal", capture: "0 of 4", captureTone: "gray", vehicle: "Yes", status: "Scheduled", statusTone: "blue" },
];

const COLUMNS = [
  { label: "Date", key: "date" },
  { label: "Client", key: "client" },
  { label: "Type", key: "type" },
  { label: "Executive", key: "executive" },
  { label: "Capture", key: "capture" },
  { label: "Vehicle", key: "vehicle" },
  { label: "Status", key: "status" },
];

export default function HomeOfficeVisitsPage() {
  const [visitType, setVisitType] = useState("Home visit");
  const [date, setDate] = useState("2026-07-02");
  const [slot, setSlot] = useState("11:00 AM – 1:00 PM");
  const [client, setClient] = useState("Aditya Verma");
  const [attend, setAttend] = useState("Client + both parents");
  const [vehicle, setVehicle] = useState("Yes — branch car");
  const [period, setPeriod] = useState("month");
  const [typeFilter, setTypeFilter] = useState("all");
  const [capture, setCapture] = useState(CAPTURE_ITEMS);

  const captureDone = capture.filter((i) => i.done).length;
  const captureTotal = capture.length;

  const toggleCapture = (title) => {
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
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "date" });

  return (
    <DeskPage
      title="Home & Office Visits"
      actions={
        <>
          <OutlineButton onClick={() => toast.info("Reschedule slot opened.")}>Reschedule</OutlineButton>
          <PrimaryButton onClick={() => toast.success("Visit started. Capture checklist is live.")}>Start Visit</PrimaryButton>
        </>
      }
    >
      <SectionCard
        title="Home visit — Aditya Verma"
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
        {capture.map((item) => (
          <CheckRow key={item.title} {...item} onToggle={() => toggleCapture(item.title)} />
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
          {sorted.map((row) => (
            <tr key={`${row.date}-${row.client}`} className="border-b border-black/5 last:border-0">
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
            </tr>
          ))}
        </DeskTable>
      </SectionCard>
    </DeskPage>
  );
}
