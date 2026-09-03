import { AlertTriangle } from "lucide-react";
import StatusPill from "../../../components/pipeline/StatusPill";

const NOTES = [
  {
    title: "Family dynamics",
    note: "Father is the decision maker and the payer. Client defers on budget but is firm on profession fit.",
    tag: "RM note", tone: "blue",
  },
  {
    title: "Preference mismatch",
    note: "Client wants a doctor in NCR, parents will consider Punjab. Flagged for the service team.",
    tag: "Flag", tone: "amber",
  },
  {
    title: "High-demand criteria",
    note: "Clinical specialisation requested is thin in the paid database. Cross-branch search likely.",
    tag: "Flag", tone: "amber", alert: true,
  },
  {
    title: "Photography coaching",
    note: "Current photos are poor quality. Reshoot suggested before profiles go out.",
    tag: "RM note", tone: "blue",
  },
  {
    title: "Counselling",
    note: "Parent questionnaire completed 14 Jul. Candidate questionnaire still pending.",
    tag: "RM note", tone: "blue",
  },
];

/** Notes & RM Flags tab — qualitative context that carries into service handover. */
export default function NotesRmFlagsTab() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111]">Notes &amp; RM Flags</h3>
      <p className="text-[12px] text-[#9CA3AF] mt-0.5 mb-1">Qualitative context that carries into service</p>

      <div className="flex flex-col divide-y divide-black/5">
        {NOTES.map((n) => (
          <div key={n.title} className="flex items-start gap-3 py-3.5 flex-wrap sm:flex-nowrap">
            <span
              className={`size-[18px] rounded-full grid place-items-center shrink-0 mt-0.5 ${
                n.alert ? "bg-[#E8395B]" : "bg-white border border-black/15"
              }`}
            >
              {n.alert && <AlertTriangle size={11} className="text-white" strokeWidth={2.5} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#111]">{n.title}</p>
              <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-relaxed">{n.note}</p>
            </div>
            <StatusPill tone={n.tone}>{n.tag}</StatusPill>
          </div>
        ))}
      </div>
    </div>
  );
}
