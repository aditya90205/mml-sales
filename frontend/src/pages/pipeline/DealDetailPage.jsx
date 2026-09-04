import { useMemo, useState } from "react";
import { Flag, MessageCircle, Minus, Phone, Plus } from "lucide-react";
import { toast } from "react-toastify";
// TopBar is provided by Layout
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
import { EMPTY, atLeast, historyUntil, maybeDash, stageGateFor } from "./deal-tabs/stageContent.jsx";

const BASE_TABS = [
  { key: "overview",  label: "Overview" },
  { key: "intake",    label: "Intake Form" },
  { key: "visits",    label: "Visits & Meetings" },
  { key: "package",   label: "Package & Quote" },
  { key: "discounts", label: "Discount Approvals" },
  { key: "documents", label: "Documents & KYC" },
  { key: "notes",     label: "Notes & RM Flags" },
  { key: "audit",     label: "Audit" },
  { key: "payments",  label: "Payments" },
  { key: "p6",        label: "P6 Checklist" },
];

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
  packageInterest: "Premium",
  weightedValueLabel: "Weighted value",
  weightedValue: "₹30,600",
  weightedValueNote:
    "60% probability at P4 Negotiation. Rises to 90% once the discount is approved and the quote is accepted.",
  rmFlags: [
    { label: "Preference mismatch", tone: "amber" },
    { label: "High-demand criteria", tone: "red" },
    { label: "Parent is decision maker", tone: "blue" },
    { label: "Cross-branch price enquiry", tone: "amber" },
  ],
  fieldsFilledNote: "11 of 14 mandatory fields filled. P1 remains locked until all sections show Complete",
};

const STAGE_LABELS = {
  P0: "P0 Prospect",
  P1: "P1 Qualified",
  P2: "P2 Data Collection",
  P3: "P3 Visit / Video",
  P4: "P4 Negotiation",
  P5: "P5 Payment",
  P6: "P6 Handover",
};

const NEXT_STAGE = {
  P0: "P1",
  P1: "P2",
  P2: "P3",
  P3: "P4",
  P4: "P5",
  P5: "P6",
};

const LOCK_NOTES = {
  P0: "Qualify the lead and capture intent before this deal can move to P1.",
  P1: "Complete data collection requirements before this deal can move to P2.",
  P2: "Log a visit or video call before this deal can move to P3.",
  P3: "Finish negotiation checks before this deal can move to P4.",
  P4: "The approved discount has not been applied to a quote yet, and one KYC document is outstanding.",
  P5: "Complete payment and the handover checklist before this deal can move to P6.",
};

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/**
 * Deal detail opened by clicking any pipeline card (P0–P6).
 * Tab data fills in by stage. Payments and P6 Checklist stay blurred until P5.
 */
export default function DealDetailPage({ lead, onBack, currentStage = "P4", onAdvance }) {
  const [activeTab, setActiveTab] = useState("overview");
  const lateTabsUnlocked = atLeast(currentStage, "P5");
  const nextStage = NEXT_STAGE[currentStage];
  const tabs = BASE_TABS.map((tab) =>
    tab.key === "payments" || tab.key === "p6" ? { ...tab, locked: !lateTabsUnlocked } : tab
  );

  const deal = useMemo(() => {
    const dealCode = (lead?.mmlId || "MML - D - 10471").replace(/\s*-\s*/g, "-");
    const detailsFilled = atLeast(currentStage, "P1");
    const flagsFilled = atLeast(currentStage, "P2");
    return {
      ...DEAL_DEFAULTS,
      dealCode,
      stageLabel: STAGE_LABELS[currentStage] || STAGE_LABELS.P4,
      name: lead?.name || "Ananya Gupta",
      dealValue: currentStage === "P0" ? "₹25,000" : DEAL_DEFAULTS.dealValue,
      packageInterest: maybeDash(detailsFilled, DEAL_DEFAULTS.packageInterest),
      leadScore: maybeDash(detailsFilled, DEAL_DEFAULTS.leadScore),
      enquiryBy: maybeDash(detailsFilled, DEAL_DEFAULTS.enquiryBy),
      lookingFor: maybeDash(detailsFilled, DEAL_DEFAULTS.lookingFor),
      areaOfHouse: maybeDash(detailsFilled, DEAL_DEFAULTS.areaOfHouse),
      profession: maybeDash(detailsFilled, DEAL_DEFAULTS.profession),
      familyIncomeBand: maybeDash(detailsFilled, DEAL_DEFAULTS.familyIncomeBand),
      nextAction: maybeDash(detailsFilled, DEAL_DEFAULTS.nextAction),
      rmFlags: DEAL_DEFAULTS.rmFlags.map((flag) =>
        flagsFilled ? flag : { ...flag, label: EMPTY }
      ),
      stageGate: stageGateFor(currentStage),
      stageHistory: historyUntil(currentStage),
      fieldsFilledNote: detailsFilled
        ? DEAL_DEFAULTS.fieldsFilledNote
        : "0 of 14 mandatory fields filled. P1 remains locked until intake is complete",
      weightedValue: maybeDash(detailsFilled, DEAL_DEFAULTS.weightedValue),
      weightedValueNote: maybeDash(detailsFilled, DEAL_DEFAULTS.weightedValueNote),
    };
  }, [lead, currentStage]);

  const handleMarkLost = () => toast.info(`${deal.name} marked as lost.`);
  const handleMoveToCold = () => toast.info(`${deal.name} moved to Cold.`);
  const handleConfirmMove = () => {
    if (!nextStage) return;
    onAdvance?.(lead, currentStage);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab deal={deal} />;
      case "intake":
        return <IntakeFormTab empty={currentStage === "P0"} />;
      case "visits":
        return <VisitsMeetingsTab empty={!atLeast(currentStage, "P3")} />;
      case "package":
        return <PackageQuoteTab empty={!atLeast(currentStage, "P4")} />;
      case "discounts":
        return <DiscountApprovalsTab empty={!atLeast(currentStage, "P4")} />;
      case "documents":
        return <DocumentsKycTab empty={!atLeast(currentStage, "P5")} />;
      case "notes":
        return <NotesRmFlagsTab empty={!atLeast(currentStage, "P2")} />;
      case "audit":
        return <AuditTab currentStage={currentStage} />;
      case "payments":
        return (
          <PaymentsTab
            locked={!lateTabsUnlocked}
            empty={!atLeast(currentStage, "P5")}
          />
        );
      case "p6":
        return (
          <P6ChecklistTab
            locked={!lateTabsUnlocked}
            allUnchecked={!atLeast(currentStage, "P5")}
          />
        );
      default:
        return <ComingSoonTab label={tabs.find((t) => t.key === activeTab)?.label || "This tab"} />;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#F8F9FA]">
      {/* TopBar is provided by Layout */}

      <div className="p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
        {/* Locked-stage banner */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl px-4 py-3.5 flex items-center gap-3 flex-wrap">
          <p className="text-[13px] text-[#111] min-w-0 flex-1">
            {nextStage ? (
              <>
                <span className="font-bold">{nextStage} is locked.</span>{" "}
                <span className="text-[#6B7280]">
                  {LOCK_NOTES[currentStage] || "Complete the required steps for this stage before advancing."}
                </span>
              </>
            ) : (
              <>
                <span className="font-bold">Onboarding complete.</span>{" "}
                <span className="text-[#6B7280]">This deal is at P6 handover. No further pipeline move is required.</span>
              </>
            )}
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
              onClick={onBack}
              className="h-9 px-4 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            {nextStage && (
              <button
                type="button"
                onClick={handleConfirmMove}
                className="h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
              >
                Move to {nextStage}
              </button>
            )}
          </div>
        </div>

        {/* Stage progress */}
        <StageStepper activeStageId={currentStage} />

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
            <DealTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        {/* Tab content */}
        <div key={`${currentStage}-${activeTab}`}>{renderTab()}</div>
      </div>
    </div>
  );
}
