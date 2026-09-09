import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckSquare,
  ChevronDown,
  Flag,
  FileText,
  MessageSquare,
  Minus,
  MoreVertical,
  Phone,
  PhoneOff,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
// TopBar is provided by Layout
import StageStepper from "../../components/pipeline/StageStepper";
import WinLossReasonsModal from "../../components/pipeline/WinLossReasonsModal";
import BranchManagerAssignedModal, {
  DUMMY_MANAGER,
} from "../../components/pipeline/BranchManagerAssignedModal";
import DealTabs from "../../components/pipeline/DealTabs";
import EmailActivityButton from "../../components/common/EmailActivityButton.jsx";
import SendMessageModal from "../../components/common/SendMessageModal.jsx";
import Modal from "../../components/ui/Modal.jsx";
import CreateTaskModal from "../../components/calendar/CreateTaskModal";
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
  { key: "overview",  label: "Overview (P0-P1)" },
  { key: "intake",    label: "Profile Create (P2)" },
  { key: "visits",    label: "Video Call / Visits(P3)" },
  { key: "package",   label: "Negotiation / Package & Quote (P4)" },
  { key: "payments",  label: "Payments (P5)" },
  { key: "p6",        label: "Handover to services (P6)" },
  { key: "notes",     label: "Notes & RM Flags" },
  { key: "audit",     label: "Audit" },
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
  assignedTo: "Rohit K.",
  assignedBy: "Aditya Sharma",
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
  fieldsFilledNote: "0 of 14 mandatory fields filled. please fill/edit all the details to move to P1",
};

const STAGE_LABELS = {
  P0: "P0 Prospect",
  P1: "P1 Qualified",
  P2: "P2 Data Collection",
  P3: "P3 Visit / Video",
  P4: "P4 Negotiation",
  P5: "P5 Payment",
  P6: "P6 Handover to services",
};

const NEXT_STAGE = {
  P0: "P1",
  P1: "P2",
  P2: "P3",
  P3: "P4",
  P4: "P5",
  P5: "P6",
};

/** Which deal-detail tab belongs to each pipeline stage. */
const STAGE_TO_TAB = {
  P0: "overview",
  P1: "overview",
  P2: "intake",
  P3: "visits",
  P4: "package",
  P5: "payments",
  P6: "p6",
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

function summaryValue(value) {
  if (value == null) return "not yet captured";
  const text = String(value).trim();
  if (!text || text === "-" || text === "—" || text === "–") return "not yet captured";
  return text;
}

function buildClientSummaryPoints(deal) {
  const points = [
    `Current stage is ${summaryValue(deal.stageLabel)}.`,
    `Deal value stands at ${summaryValue(deal.dealValue)}.`,
    `Package interest: ${summaryValue(deal.packageInterest)}.`,
    `Lead score: ${summaryValue(deal.leadScore)}.`,
    `Looking for: ${summaryValue(deal.lookingFor)}.`,
  ];

  const nextAction = summaryValue(deal.nextAction);
  if (nextAction === "not yet captured") {
    points.push("Next action has not been set yet.");
  } else {
    points.push(
      deal.nextActionUrgency
        ? `Next action: ${nextAction} (${deal.nextActionUrgency}).`
        : `Next action: ${nextAction}.`
    );
  }

  return points;
}

function getDealContact(lead, name) {
  const parts = (name || lead?.name || "client").trim().split(/\s+/);
  const first = (parts[0] || "client").toLowerCase();
  const last = (parts.slice(1).join("") || "user").toLowerCase();
  const digits = String(lead?.id || "10471").replace(/\D/g, "").slice(-5).padStart(5, "4");
  return {
    email: lead?.email || `${first}.${last}@gmail.com`,
    phone: lead?.phone || lead?.mobile || `+91 98765 ${digits}`,
  };
}

/**
 * Deal detail opened by clicking any pipeline card (P0–P6).
 * Tab data fills in by stage. Payments and P6 Checklist stay blurred until P5.
 */
export default function DealDetailPage({
  lead,
  onBack,
  currentStage = "P4",
  onAdvance,
  onP0DetailsSaved,
  initialTab = "overview",
  onPremiumChange,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    () => STAGE_TO_TAB[currentStage] || initialTab || "overview"
  );
  const [winLossModal, setWinLossModal] = useState({ open: false, mode: "lost" });
  const [winLossOverride, setWinLossOverride] = useState(null);
  const [isPremium, setIsPremium] = useState(() => Boolean(lead?.starred));
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [serviceAssignOpen, setServiceAssignOpen] = useState(false);
  const [serviceAssigned, setServiceAssigned] = useState(null);
  const [savedDetails, setSavedDetails] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const lateTabsUnlocked = atLeast(currentStage, "P5");
  const nextStage = NEXT_STAGE[currentStage];
  const tabs = BASE_TABS.map((tab) =>
    tab.key === "payments" || tab.key === "p6" ? { ...tab, locked: !lateTabsUnlocked } : tab
  );
  const isLost = (winLossOverride?.tone || lead?.temperature) === "Lost";

  useEffect(() => {
    setIsPremium(Boolean(lead?.starred));
  }, [lead?.id, lead?.starred]);

  useEffect(() => {
    setSelectedPackage(null);
  }, [lead?.id]);

  // Keep the open tab aligned with the current pipeline stage (Move to P2 → Profile Create, etc.).
  useEffect(() => {
    const tabForStage = STAGE_TO_TAB[currentStage];
    if (tabForStage) setActiveTab(tabForStage);
  }, [currentStage]);

  const handlePremiumChange = (premium) => {
    setIsPremium(premium);
    onPremiumChange?.(premium);
  };

  const deal = useMemo(() => {
    const dealCode = (lead?.mmlId || "MML - D - 10471").replace(/\s*-\s*/g, "-");
    const detailsFilled = atLeast(currentStage, "P1") || Boolean(savedDetails);
    const flagsFilled = atLeast(currentStage, "P2");
    const name = lead?.name || "Ananya Gupta";
    const contact = getDealContact(lead, name);
    const base = {
      ...DEAL_DEFAULTS,
      dealCode,
      stageLabel: STAGE_LABELS[currentStage] || STAGE_LABELS.P4,
      name,
      email: contact.email,
      phone: contact.phone,
      premium: isPremium,
      dealValue: currentStage === "P0" && !savedDetails ? "₹25,000" : DEAL_DEFAULTS.dealValue,
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
      assignedTo: maybeDash(detailsFilled, lead?.owner || DEAL_DEFAULTS.assignedTo),
      assignedBy: maybeDash(detailsFilled, DEAL_DEFAULTS.assignedBy),
      rmFlags: DEAL_DEFAULTS.rmFlags.map((flag) =>
        flagsFilled ? flag : { ...flag, label: EMPTY }
      ),
      stageGate: stageGateFor(currentStage),
      stageHistory: historyUntil(currentStage),
      fieldsFilledNote:
        currentStage === "P0" && !savedDetails
          ? "0 of 14 mandatory fields filled. please fill/edit all the details to move to P1"
          : "14 of 14 mandatory fields filled.",
      weightedValue: maybeDash(detailsFilled, DEAL_DEFAULTS.weightedValue),
      weightedValueNote: maybeDash(detailsFilled, DEAL_DEFAULTS.weightedValueNote),
    };

    if (!savedDetails) return base;

    return {
      ...base,
      dealCode: savedDetails.dealCode || base.dealCode,
      stageLabel: STAGE_LABELS[currentStage] || savedDetails.stageLabel || base.stageLabel,
      packageInterest: savedDetails.packageInterest || base.packageInterest,
      premium: savedDetails.premium === "Yes",
      dealValue: savedDetails.dealValue || base.dealValue,
      leadSource: savedDetails.leadSource || base.leadSource,
      leadScore: savedDetails.leadScore || base.leadScore,
      enquiryBy: savedDetails.enquiryBy || base.enquiryBy,
      lookingFor: savedDetails.lookingFor || base.lookingFor,
      areaOfHouse: savedDetails.areaOfHouse || base.areaOfHouse,
      profession: savedDetails.profession || base.profession,
      familyIncomeBand: savedDetails.familyIncomeBand || base.familyIncomeBand,
      nextMeeting: savedDetails.nextMeeting || base.nextMeeting,
      winLossReasons: savedDetails.winLossReasons || base.winLossReasons,
      winLossTone: savedDetails.winLossTone || base.winLossTone,
      lastDiscussionAt: savedDetails.lastDiscussionAt || base.lastDiscussionAt,
      lastDiscussionNote: savedDetails.lastDiscussionNote || base.lastDiscussionNote,
      nextActionAt: savedDetails.nextActionAt || base.nextActionAt,
      nextAction: savedDetails.nextAction || base.nextAction,
      nextActionUrgency: savedDetails.nextActionUrgency || base.nextActionUrgency,
      assignedTo: savedDetails.assignedTo || base.assignedTo,
      assignedBy: savedDetails.assignedBy || base.assignedBy,
    };
  }, [lead, currentStage, winLossOverride, isPremium, savedDetails]);

  const openHandoverSuccess = () => {
    setServiceAssigned({
      manager: DUMMY_MANAGER.name,
      branch: DUMMY_MANAGER.branch,
    });
    setServiceAssignOpen(true);
  };

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
    if (currentStage === "P4" && !selectedPackage) {
      setActiveTab("package");
      toast.error("Select a package before moving to P5.");
      return;
    }
    const tabForNext = STAGE_TO_TAB[nextStage];
    if (tabForNext) setActiveTab(tabForNext);
    onAdvance?.(lead, currentStage);
  };

  const handleDetailsSaved = (draft) => {
    setSavedDetails(draft);
    handlePremiumChange(draft.premium === "Yes");
    if (currentStage === "P0") {
      onP0DetailsSaved?.(lead, draft);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            deal={deal}
            currentStage={currentStage}
            onPremiumChange={handlePremiumChange}
            onDetailsSaved={handleDetailsSaved}
          />
        );
      case "intake":
        return <IntakeFormTab empty={currentStage === "P0"} />;
      case "visits":
        return <VisitsMeetingsTab empty={!atLeast(currentStage, "P3")} />;
      case "package":
        return (
          <PackageQuoteTab
            empty={!atLeast(currentStage, "P4")}
            selectedKey={selectedPackage?.key ?? null}
            onPackageSelect={setSelectedPackage}
          />
        );
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
            onHandoverToServices={openHandoverSuccess}
            serviceAssigned={serviceAssigned}
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
              ) : serviceAssigned ? (
                <>
                  <span className="font-bold">Service manager is assigned.</span>{" "}
                  <span className="text-[#6B7280]">
                    {serviceAssigned.manager} · {serviceAssigned.branch}. Deal handed over to services.
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold">Handover to services.</span>{" "}
                  <span className="text-[#6B7280]">
                    P6 checklist is complete. Assign a service manager to finish handover.
                  </span>
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
            {nextStage ? (
              <button
                type="button"
                onClick={handleConfirmMove}
                className="inline-flex items-center gap-1.5 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
              >
                Move to {nextStage} <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={openHandoverSuccess}
                className="inline-flex items-center gap-1.5 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
              >
                Handover to services
                <ArrowRight size={14} />
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
                <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                  <span className="lowercase">{deal.email}</span>
                  <span className="text-[#D1D5DB]"> · </span>
                  <span>{deal.phone}</span>
                </p>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                  {deal.dealCode} · Source: {deal.leadSource} · Created 24 Jun 2026 · Owner: Rohit K.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFollowUpOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[12.5px] font-medium leading-none text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
              >
                <CheckSquare size={14} className="shrink-0 block" aria-hidden />
                <span className="leading-none">Follow Up/Task</span>
              </button>
              <button
                type="button"
                onClick={() => setSummaryOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[12.5px] font-medium leading-none text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
              >
                <FileText size={14} className="shrink-0 block" aria-hidden />
                <span className="leading-none">Summary</span>
              </button>
              <div
                role="toolbar"
                aria-label="Deal actions"
                className="inline-flex items-center gap-1 h-9 rounded-xl border border-black/10 bg-white px-1.5"
              >
                {isLost ? (
                  <button
                    type="button"
                    onClick={() => toast.info("Dropped call logged.")}
                    className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                    title="Dropped Call"
                    aria-label="Dropped Call"
                  >
                    <PhoneOff size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toast.info("Calling via masked number...")}
                    className="p-1.5 rounded-lg text-[#16A34A] hover:bg-[#E7F8EF] transition-colors"
                    title="Call"
                    aria-label="Call"
                  >
                    <Phone size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMessageOpen(true)}
                  className="p-1.5 rounded-lg text-[#F59E0B] hover:bg-[#FFF3E4] transition-colors"
                  title="Message"
                  aria-label="Message"
                >
                  <MessageSquare size={14} />
                </button>
                <EmailActivityButton
                  className="relative p-1.5 rounded-lg text-[#2563EB] hover:bg-[#E8F2FE] transition-colors"
                  hasUnread
                  recipientName={deal.name || lead?.name || "Client"}
                />
                <button
                  type="button"
                  onClick={() => {
                    const client = deal.name || lead?.name || "";
                    const params = new URLSearchParams();
                    if (client) params.set("client", client);
                    const qs = params.toString();
                    navigate(qs ? `/calendar?${qs}` : "/calendar");
                  }}
                  className="p-1.5 rounded-lg text-[#D97706] hover:bg-[#FEF3C7] transition-colors"
                  title="Schedule"
                  aria-label="Schedule"
                >
                  <Calendar size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("More options coming soon.")}
                  className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-black/5 transition-colors"
                  title="More Options"
                  aria-label="More Options"
                >
                  <MoreVertical size={14} />
                </button>
              </div>
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

      <BranchManagerAssignedModal
        open={serviceAssignOpen}
        onClose={() => setServiceAssignOpen(false)}
        clientName={deal.name}
        dealCode={deal.dealCode}
      />

      <SendMessageModal open={messageOpen} onClose={() => setMessageOpen(false)} />

      <Modal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Client Summary"
        subtitle={deal.dealCode}
        icon={<FileText size={18} />}
        iconBg="#FDF2F3"
        iconColor="#7A0A17"
        width="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSummaryOpen(false)}
              className="h-9 px-4 rounded-xl bg-white border border-black/12 text-[#374151] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => toast.info("Ask AI is drafting a deeper client summary…")}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#5F0812] transition-colors"
            >
              <Sparkles size={14} /> Ask AI
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="size-11 rounded-full bg-[#7A0A17] text-white font-bold grid place-items-center shrink-0 text-[14px]">
              {initials(deal.name)}
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#111] truncate">{deal.name}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                <span className="lowercase">{deal.email}</span>
                <span className="text-[#D1D5DB]"> · </span>
                <span>{deal.phone}</span>
              </p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">Owner: Rohit K. · Source: {deal.leadSource}</p>
            </div>
          </div>

          <div className="rounded-xl border border-black/8 bg-[#FAFAFB] px-4 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A0A17] mb-2.5">
              AI summary
            </p>
            <p className="text-[13px] text-[#374151] leading-relaxed">
              Here is a quick point-wise summary for{" "}
              <span className="font-semibold text-[#111]">{deal.name}</span> (
              {deal.dealCode}):
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {buildClientSummaryPoints(deal).map((point) => (
                <li key={point} className="flex items-start gap-2 text-[13px] text-[#374151] leading-relaxed">
                  <span className="mt-2 size-1.5 rounded-full bg-[#7A0A17] shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>

      <CreateTaskModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        defaultDate={new Date()}
        initial={{
          isClientRelated: true,
          client: deal.name || lead?.name || "",
          title: `Follow up — ${deal.name || lead?.name || "client"}`,
          description: `Follow-up task from pipeline for ${deal.name || lead?.name || "client"}.`,
        }}
        onSave={() => {}}
      />
    </div>
  );
}
