import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlarmClock, ArrowLeft, ArrowRight, ChevronDown, Flag, MessageCircle, Minus, Phone, Plus, Star } from "lucide-react";
import { toast } from "react-toastify";
// TopBar is provided by Layout
import StageStepper from "../../components/pipeline/StageStepper";
import WinLossReasonsModal from "../../components/pipeline/WinLossReasonsModal";
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
import eyeIcon from "../../assets/eye.png";

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
  nextAction: "Call Client for pricing confirmation at 8 PM",
  nextMeeting: "04/09/26",
  winLossReasons: "No decision / Think about it, Competitor / Existing solution",
  lastDiscussionAt: "01/09/26, 4:55 PM",
  lastDiscussionNote: "Meeting Notes/Discussions",
  nextActionAt: "05/09/26, 4:55 PM",
  nextActionUrgency: "6 Hrs Left",
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
export default function DealDetailPage({ lead, onBack, currentStage = "P4", onAdvance, initialTab = "overview", onPremiumChange }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [winLossModal, setWinLossModal] = useState({ open: false, mode: "lost" });
  const [winLossOverride, setWinLossOverride] = useState(null);
  const [isPremium, setIsPremium] = useState(() => Boolean(lead?.starred));
  const lateTabsUnlocked = atLeast(currentStage, "P5");
  const nextStage = NEXT_STAGE[currentStage];
  const tabs = BASE_TABS.map((tab) =>
    tab.key === "payments" || tab.key === "p6" ? { ...tab, locked: !lateTabsUnlocked } : tab
  );

  useEffect(() => {
    setIsPremium(Boolean(lead?.starred));
  }, [lead?.id, lead?.starred]);

  const handlePremiumChange = (premium) => {
    setIsPremium(premium);
    onPremiumChange?.(premium);
  };

  const deal = useMemo(() => {
    const dealCode = (lead?.mmlId || "MML - D - 10471").replace(/\s*-\s*/g, "-");
    const detailsFilled = atLeast(currentStage, "P1");
    const flagsFilled = atLeast(currentStage, "P2");
    return {
      ...DEAL_DEFAULTS,
      dealCode,
      stageLabel: STAGE_LABELS[currentStage] || STAGE_LABELS.P4,
      name: lead?.name || "Ananya Gupta",
      premium: isPremium,
      dealValue: currentStage === "P0" ? "₹25,000" : DEAL_DEFAULTS.dealValue,
      packageInterest: maybeDash(detailsFilled, DEAL_DEFAULTS.packageInterest),
      leadScore: maybeDash(detailsFilled, DEAL_DEFAULTS.leadScore),
      enquiryBy: maybeDash(detailsFilled, DEAL_DEFAULTS.enquiryBy),
      lookingFor: maybeDash(detailsFilled, DEAL_DEFAULTS.lookingFor),
      areaOfHouse: maybeDash(detailsFilled, DEAL_DEFAULTS.areaOfHouse),
      profession: maybeDash(detailsFilled, DEAL_DEFAULTS.profession),
      familyIncomeBand: maybeDash(detailsFilled, DEAL_DEFAULTS.familyIncomeBand),
      nextAction: maybeDash(detailsFilled, DEAL_DEFAULTS.nextAction),
      nextMeeting: maybeDash(detailsFilled, DEAL_DEFAULTS.nextMeeting),
      winLossReasons: winLossOverride?.reasons ?? maybeDash(detailsFilled, DEAL_DEFAULTS.winLossReasons),
      winLossTone: winLossOverride?.tone ?? (lead?.temperature || "Cold"),
      lastDiscussionAt: maybeDash(detailsFilled, lead?.lastDiscussion || DEAL_DEFAULTS.lastDiscussionAt),
      lastDiscussionNote: maybeDash(detailsFilled, DEAL_DEFAULTS.lastDiscussionNote),
      nextActionAt: maybeDash(detailsFilled, lead?.nextAction || DEAL_DEFAULTS.nextActionAt),
      nextActionUrgency: detailsFilled ? (lead?.hrs != null ? `${lead.hrs} Hrs Left` : DEAL_DEFAULTS.nextActionUrgency) : null,
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
  }, [lead, currentStage, winLossOverride, isPremium]);

  const openWinLossModal = (mode) => setWinLossModal({ open: true, mode });

  const handleWinLossSave = ({ reasons, briefNote, mode }) => {
    setWinLossOverride({
      reasons,
      tone: mode === "cold" ? "Cold" : "Lost",
      briefNote,
    });
    setWinLossModal({ open: false, mode });
    setActiveTab("overview");
    toast.success(
      mode === "cold"
        ? `${deal.name} moved to Cold & Hold. Win / loss reasons updated.`
        : `${deal.name} marked as lost. Win / loss reasons updated.`
    );
  };

  const handleConfirmMove = () => {
    if (!nextStage) return;
    onAdvance?.(lead, currentStage);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab deal={deal} onPremiumChange={handlePremiumChange} />;
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
        {/* Lock note + actions (same button chrome as pipeline board) */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
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
              className="shrink-0 h-8 px-3.5 rounded-lg bg-white border border-[#FDE68A] text-[12px] font-semibold text-[#92400E] hover:bg-[#FFFBEB] transition-colors"
            >
              See blockers
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
              aria-label="Back to pipeline"
            >
              <ArrowLeft size={15} />
              Back
            </button>
            <button
              type="button"
              onClick={() => openWinLossModal("lost")}
              className="inline-flex items-center gap-1.5 h-[38px] px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              <Flag size={14} /> Mark lost
            </button>
            <button
              type="button"
              onClick={() => openWinLossModal("cold")}
              className="inline-flex items-center gap-1.5 h-[38px] px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Move to Cold &amp; Hold
              <ChevronDown size={14} className="text-[#9CA3AF]" />
            </button>
            {nextStage && (
              <button
                type="button"
                onClick={handleConfirmMove}
                className="inline-flex items-center gap-1.5 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
              >
                Move to {nextStage} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Action alert + oversight — same as pipeline board */}
        <div className="flex items-stretch gap-3 flex-wrap lg:flex-nowrap">
          <div className="flex-1 min-w-0 bg-[#FDECEE] border border-[#F7D3D9] rounded-2xl px-4 py-3.5 flex items-center gap-3.5 flex-wrap">
            <span className="size-9 rounded-xl bg-[#FFE1CC] grid place-items-center shrink-0">
              <AlarmClock size={18} className="text-[#F97316]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-[#111]">2 items need action today</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Sanjay Mehta has been in P4 for 9 days, 1 discount request is awaiting sales head approval.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 h-9 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              View
            </button>
          </div>
          <Link
            to="/pipeline/cross-branch"
            className="shrink-0 w-full lg:w-[230px] bg-white border border-black/8 rounded-2xl px-4 py-3.5 hover:bg-[#FAFAFB] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2.5 whitespace-nowrap">
              <img src={eyeIcon} alt="Oversight" style={{ width: 15, height: 15, objectFit: "contain" }} />
              <p className="text-[13px] font-bold text-[#111]">Oversight</p>
            </div>
            <span className="flex items-center justify-between gap-2 w-full text-[11.5px] font-medium rounded-lg px-2.5 py-[9px] text-[#111] bg-[#E7F8EF]">
              Cross Branch Flags
              <span className="shrink-0 text-[10px] font-semibold bg-white/70 rounded px-1.5 py-0.5 text-[#111]">3</span>
            </span>
          </Link>
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
                  {isPremium && (
                    <Star size={14} className="text-[#F59E0B] shrink-0" fill="#F59E0B" strokeWidth={0} />
                  )}
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

      <WinLossReasonsModal
        open={winLossModal.open}
        mode={winLossModal.mode}
        onClose={() => setWinLossModal((prev) => ({ ...prev, open: false }))}
        onSave={handleWinLossSave}
      />
    </div>
  );
}
