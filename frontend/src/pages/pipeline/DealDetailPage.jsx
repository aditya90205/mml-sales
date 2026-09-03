import { useMemo, useState } from "react";
import { Flag, MessageCircle, Minus, Phone, Plus } from "lucide-react";
import { toast } from "react-toastify";
import TopBar from "../../components/layout/TopBar";
import StageStepper from "../../components/pipeline/StageStepper";
import DealTabs from "../../components/pipeline/DealTabs";
import OverviewTab from "./deal-tabs/OverviewTab";
import IntakeFormTab from "./deal-tabs/IntakeFormTab";
import VisitsMeetingsTab from "./deal-tabs/VisitsMeetingsTab";
import PackageQuoteTab from "./deal-tabs/PackageQuoteTab";
import DiscountApprovalsTab from "./deal-tabs/DiscountApprovalsTab";
import DocumentsKycTab from "./deal-tabs/DocumentsKycTab";
import NotesRmFlagsTab from "./deal-tabs/NotesRmFlagsTab";
import AuditTab from "./deal-tabs/AuditTab";
import PaymentsTab from "./deal-tabs/PaymentsTab";
import P6ChecklistTab from "./deal-tabs/P6ChecklistTab";
import ComingSoonTab from "./deal-tabs/ComingSoonTab";

const TABS = [
  { key: "overview",  label: "Overview" },
  { key: "intake",    label: "Intake Form" },
  { key: "visits",    label: "Visits & Meetings" },
  { key: "package",   label: "Package & Quote" },
  { key: "discounts", label: "Discount Approvals" },
  { key: "documents", label: "Documents & KYC" },
  { key: "notes",     label: "Notes & RM Flags" },
  { key: "audit",     label: "Audit" },
  { key: "payments",  label: "Payments",     locked: true },
  { key: "p6",        label: "P6 Checklist", locked: true },
];

/** Tabs with no dependency on `deal` — Overview is handled separately since it needs deal data. */
const TAB_CONTENT = {
  intake:    <IntakeFormTab />,
  visits:    <VisitsMeetingsTab />,
  package:   <PackageQuoteTab />,
  discounts: <DiscountApprovalsTab />,
  documents: <DocumentsKycTab />,
  notes:     <NotesRmFlagsTab />,
  audit:     <AuditTab />,
  payments:  <PaymentsTab />,
  p6:        <P6ChecklistTab />,
};

/** Static demo fields shown on the overview tab, layered over the lead's board data. */
const DEAL_DEFAULTS = {
  dealValue: "₹51,000",
  leadSource: "Instagram Ads",
  leadScore: "Warm",
  enquiryBy: "Parent (father)",
  lookingFor: "Girl · 26–30 · NCR",
  areaOfHouse: "Greater Kailash II",
  profession: "Chartered Accountant",
  familyIncomeBand: "₹60L–₹1Cr p.a.",
  nextAction: "First contact call",
  packageInterest: "—",
  weightedValueLabel: "Weighted value at P0",
  weightedValue: "₹30,600",
  weightedValueNote:
    "60% probability at P4 Negotiation. Rises to 90% once the discount is approved and the quote is accepted.",
  stageGate: [
    { label: "Intake form complete", done: false },
    { label: "Video call or visit logged", done: true },
    { label: "Package selected & quoted", done: true },
    { label: "Discount approved (if any)", done: false },
    { label: "KYC documents uploaded", done: false },
  ],
  rmFlags: [
    { label: "Preference mismatch", tone: "amber" },
    { label: "High-demand criteria", tone: "red" },
    { label: "Parent is decision maker", tone: "blue" },
    { label: "Cross-branch price enquiry", tone: "amber" },
  ],
  stageHistory: [
    { stage: "P0 Prospect",       entered: "24 Jun", exited: "25 Jun", duration: "1d",  sla: "3d", status: "Within SLA" },
    { stage: "P1 Qualified",      entered: "25 Jun", exited: "27 Jun", duration: "2d",  sla: "5d", status: "Within SLA" },
    { stage: "P2 Data Collection", entered: "27 Jun", exited: "1 Jul", duration: "4d",  sla: "7d", status: "Within SLA" },
    { stage: "P3 Visit / Video",  entered: "1 Jul",  exited: "19 Jul", duration: "18d", sla: "10d", status: "Breached" },
    { stage: "P4 Negotiation",    entered: "19 Jul", exited: "-",      duration: "9d",  sla: "7d", status: "Breached - escalated" },
  ],
  fieldsFilledNote: "11 of 14 mandatory fields filled. P1 remains locked until all sections show Complete",
};

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/**
 * Deal detail screen shown when advancing a P4 Negotiation deal to P5
 * Payment. Renders the stage progress bar, deal header and the tabbed
 * detail views (Overview today; remaining tabs land as they're built).
 */
export default function DealDetailPage({ lead, onBack, onMoveToP5 }) {
  const [activeTab, setActiveTab] = useState("overview");

  const deal = useMemo(() => {
    const dealCode = (lead?.mmlId || "MML - D - 10471").replace(/\s*-\s*/g, "-");
    return {
      ...DEAL_DEFAULTS,
      dealCode,
      stageLabel: "P0 Prospect",
      name: lead?.name || "Ananya Gupta",
    };
  }, [lead]);

  const handleMarkLost = () => toast.info(`${deal.name} marked as lost.`);
  const handleMoveToCold = () => toast.info(`${deal.name} moved to Cold.`);
  const handleMoveToP5 = () => {
    onMoveToP5?.(lead);
    toast.success(`${deal.name} moved to P5 Payment!`);
    onBack?.();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#F8F9FA]">
      <TopBar page={`Pipeline Board / ${deal.name}`} />

      <div className="p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
        {/* Locked-stage banner */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl px-4 py-3.5 flex items-center gap-3 flex-wrap">
          <p className="text-[13px] text-[#111] min-w-0 flex-1">
            <span className="font-bold">P5 is locked.</span>{" "}
            <span className="text-[#6B7280]">
              The approved discount has not been applied to a quote yet, and one KYC document is outstanding.
            </span>
          </p>
          <button
            type="button"
            className="shrink-0 h-8 px-3.5 rounded-lg bg-white border border-black/10 text-[12px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            See blockers
          </button>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleMarkLost}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              <Flag size={13} /> Mark lost
            </button>
            <button
              type="button"
              onClick={handleMoveToCold}
              className="h-9 px-4 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Move to Cold
            </button>
            <button
              type="button"
              onClick={handleMoveToP5}
              className="h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Advance to P5 →
            </button>
          </div>
        </div>

        {/* Stage progress */}
        <StageStepper activeStageId="P4" />

        {/* Deal header + tabs */}
        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="size-11 rounded-full bg-[#7A0A17] text-white font-bold grid place-items-center shrink-0 text-[14px]">
                {initials(deal.name)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[16px] font-bold text-[#111] truncate">{deal.name}</h1>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-md text-[#F59E0B] bg-[#FFF3E4]">
                    <Minus size={10} /> interest
                  </span>
                </div>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                  {deal.dealCode} · Source: {deal.leadSource} · Created 24 Jun 2026 · Owner: Rohit K.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toast.info("Calling via masked number...")}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[12.5px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
              >
                <Phone size={14} /> Call (masked)
              </button>
              <button
                type="button"
                onClick={() => toast.info("Opening WhatsApp...")}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[12.5px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => toast.success("Activity logged.")}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[12.5px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
              >
                <Plus size={14} /> Log activity
              </button>
            </div>
          </div>

          <div className="px-5">
            <DealTabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "overview" ? (
          <OverviewTab deal={deal} />
        ) : (
          TAB_CONTENT[activeTab] || (
            <ComingSoonTab label={TABS.find((t) => t.key === activeTab)?.label || "This tab"} />
          )
        )}
      </div>
    </div>
  );
}
