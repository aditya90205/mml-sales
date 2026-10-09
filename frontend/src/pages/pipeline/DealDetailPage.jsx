import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  RotateCcw,
  Snowflake,
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
import {
  formatHoldDate,
  isSampleLead,
  monthLabel,
  p0StatusOf,
  reactivateColdLead,
  SAMPLE_CLIENT_PROFILE,
  updateLead,
} from "../../utils/pipelineStore.js";
import { buildDemoHistory, ensureLeadHistory, recordLeadActivity } from "../../utils/leadActivityStore.js";
import { formatLookingForLabel, leadHasMobileNumber, P2_MOBILE_REQUIRED_MESSAGE, splitName } from "../../utils/leadFields.js";
import { addExtraEvent, taskFormToCalendarItem } from "../../utils/calendarStore.js";
import { pushNotification } from "../../utils/notifications.js";

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
  enquiryBy: SAMPLE_CLIENT_PROFILE.enquiryBy,
  lookingFor: "no",
  dob: SAMPLE_CLIENT_PROFILE.dob,
  areaOfHouse: SAMPLE_CLIENT_PROFILE.areaOfHouse,
  profession: SAMPLE_CLIENT_PROFILE.profession,
  familyIncomeBand: SAMPLE_CLIENT_PROFILE.familyIncomeBand,
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
  fieldsFilledNote: "0 of 17 mandatory fields filled. please fill/edit all the details to move to Contacted",
};

const STAGE_LABELS = {
  P0: "P0 New",
  "P0-contacted": "P0 Contacted",
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

/** Opening or moving a lead from any stage stays on the overview dashboard. */
const STAGE_TO_TAB = {
  P0: "overview",
  P1: "overview",
  P2: "overview",
  P3: "overview",
  P4: "overview",
  P5: "overview",
  P6: "overview",
};

function formatStageDays(duration) {
  const text = String(duration || "").trim();
  if (!text || text === "-" || text === "—" || text === "–") return "";
  const hours = text.match(/(\d+)\s*h/i);
  if (hours) {
    const count = Number(hours[1]);
    if (!count) return "same day";
    return count === 1 ? "1 hr" : `${count} hrs`;
  }
  const match = text.match(/(\d+)\s*d/i);
  if (!match) return text;
  const days = Number(match[1]);
  if (!days) return "same day";
  return `${days} day${days === 1 ? "" : "s"}`;
}

function formatElapsed(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "same day";
  const hours = Math.max(1, Math.round(ms / 36e5));
  if (hours < 24) return hours === 1 ? "1 hr" : `${hours} hrs`;
  const days = Math.max(1, Math.round(hours / 24));
  return `${days} day${days === 1 ? "" : "s"}`;
}

const STAGE_STARTS = [
  { id: "P0-new", history: "P0 New", test: (title) => /created/i.test(title) },
  { id: "P0-contacted", history: "P0 Contacted", test: (title) => /moved to P0 Contacted/i.test(title) },
  { id: "P1", history: "P1 Qualified", test: (title) => /→ P1/i.test(title) },
  { id: "P2", history: "P2 Data Collection", test: (title) => /→ P2/i.test(title) },
  { id: "P3", history: "P3 Visit / Video", test: (title) => /→ P3/i.test(title) },
  { id: "P4", history: "P4 Negotiation", test: (title) => /→ P4/i.test(title) },
  { id: "P5", history: "P5 Payment", test: (title) => /→ P5/i.test(title) },
  { id: "P6", history: "P6 Handover", test: (title) => /→ P6/i.test(title) },
];

function durationsFromHistory(rows = [], events = []) {
  const ordered = [...events].sort((a, b) => new Date(a.at) - new Date(b.at));
  const starts = STAGE_STARTS.map((stage) => {
    const hit = ordered.find((event) => stage.test(event.title || ""));
    const at = hit ? new Date(hit.at).getTime() : NaN;
    return Number.isNaN(at) ? null : at;
  });
  const labels = {};
  STAGE_STARTS.forEach((stage, index) => {
    const row = rows.find((item) => item.stage === stage.history);
    const started = starts[index];
    const ended = starts[index + 1];
    if (started && ended && ended > started) {
      labels[stage.id] = formatElapsed(ended - started);
      return;
    }
    labels[stage.id] = formatStageDays(row?.duration);
  });
  return labels;
}

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
  const email = String(lead?.email || "").trim();
  const phone = String(lead?.phone || lead?.mobile || "").trim();
  if (email || phone) {
    return { email: email || "—", phone: phone || "—" };
  }
  if (!isSampleLead(lead)) {
    return { email: "—", phone: "—" };
  }
  const parts = (name || lead?.name || "client").trim().split(/\s+/);
  const first = (parts[0] || "client").toLowerCase();
  const last = (parts.slice(1).join("") || "user").toLowerCase();
  const digits = String(lead?.id || "10471").replace(/\D/g, "").slice(-5).padStart(5, "4");
  return {
    email: `${first}.${last}@gmail.com`,
    phone: `+91 98765 ${digits}`,
  };
}

function fromLeadOrDummy(leadValue, dummyValue, sample, allowDummy) {
  const raw = String(leadValue ?? "").trim();
  if (raw && raw !== "-") return leadValue;
  return sample ? maybeDash(allowDummy, dummyValue) : EMPTY;
}

const MANDATORY_OVERVIEW_KEYS = [
  "lookingFor",
  "nri",
  "enquiryBy",
  "firstName",
  "lastName",
  "dob",
  "country",
  "mobile",
  "city",
  "email",
  "leadSource",
  "familyIncomeBand",
  "profession",
  "meeting",
  "packageInterest",
  "dealValue",
  "leadScore",
];

function countFilledKeys(obj, keys) {
  return keys.filter((key) => {
    const value = String(obj?.[key] ?? "").trim();
    return value && value !== "-" && value !== "—";
  }).length;
}

function holdFromLead(lead) {
  if (lead?.dealStatus !== "lost" && lead?.dealStatus !== "cold") return null;
  return {
    reasons: lead.winLossReasons || "",
    tone: lead.dealStatus === "cold" ? "Cold" : "Lost",
    briefNote: lead.winLossNote || "",
    heldStage: lead.winLossStage || "",
    followUps: Array.isArray(lead.winLossFollowUps) ? lead.winLossFollowUps : [],
    reactivateMode: lead.reactivateMode || "",
    reactivateMonths: lead.reactivateMonths || "",
    reactivateAt: lead.reactivateAt || "",
    coldHeldAt: lead.coldHeldAt || "",
  };
}

function holdTimingLabel(hold) {
  if (!hold?.reactivateAt) return "";
  const date = formatHoldDate(hold.reactivateAt);
  const span = monthLabel(hold.reactivateMonths);
  if (date && span) return `${date} (${span})`;
  return date || span;
}

function formatFollowUpDate(value) {
  if (!value) return "";
  const asHold = formatHoldDate(value);
  if (asHold) return asHold;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return String(value);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function stageLabelForHold(stageId, contactedP0 = false) {
  if (stageId === "P0") return contactedP0 ? "P0 Contacted" : "P0 New";
  return STAGE_LABELS[stageId] || stageId || "Unknown stage";
}

function buildHoldNotificationMessage({
  stageLabel,
  reasons,
  briefNote,
  mode,
  reactivation,
  followUps = [],
}) {
  const parts = [`Stage: ${stageLabel}`];
  if (reasons) parts.push(`Why: ${reasons}`);
  if (briefNote) parts.push(`Note: ${briefNote}`);
  if (mode === "cold") {
    if (reactivation?.mode === "manual") {
      parts.push("Next steps: Reactivate manually");
    } else {
      const when = formatHoldDate(reactivation?.reactivateAt) || "later";
      const span = monthLabel(reactivation?.months);
      parts.push(
        `Next steps: Automatic follow-up on ${when}${span ? ` (after ${span})` : ""}`
      );
    }
  }
  followUps.forEach((item) => {
    const when = formatFollowUpDate(item.date);
    if (when) parts.push(`Follow-up (${item.label}): ${when}`);
  });
  return parts.join(" · ");
}

/**
 * Deal detail opened by clicking any pipeline card (P0–P6).
 * Tab data fills in by stage. Payments and P6 Checklist stay blurred until P5.
 */
export default function DealDetailPage({
  lead,
  onBack,
  currentStage: stageFromBoard = "P4",
  onAdvance,
  onPaymentVerified,
  onP0DetailsSaved,
  initialTab = "overview",
  onPremiumChange,
}) {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(stageFromBoard);
  const [p0Contacted, setP0Contacted] = useState(
    () => p0StatusOf(lead) === "contacted" || Boolean(lead?.overviewDetails)
  );
  const [activeTab, setActiveTab] = useState(
    () => initialTab || STAGE_TO_TAB[stageFromBoard] || "overview"
  );
  const [winLossModal, setWinLossModal] = useState({ open: false, mode: "lost" });
  const [winLossOverride, setWinLossOverride] = useState(() => holdFromLead(lead));
  const [isPremium, setIsPremium] = useState(() => Boolean(lead?.starred));
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [serviceAssignOpen, setServiceAssignOpen] = useState(false);
  const [serviceAssigned, setServiceAssigned] = useState(null);
  const [savedDetails, setSavedDetails] = useState(() => lead?.overviewDetails || null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const lateTabsUnlocked = atLeast(currentStage, "P5");
  const isContactedP0 =
    currentStage === "P0" &&
    (p0Contacted || p0StatusOf(lead) === "contacted" || Boolean(savedDetails));
  const p0StageLabel = isContactedP0 || atLeast(currentStage, "P1") ? "P0 Contacted" : "P0 New";
  const nextStage = currentStage === "P0" && !isContactedP0 ? "Contacted" : NEXT_STAGE[currentStage];
  const tabs = BASE_TABS.map((tab) =>
    tab.key === "payments" || tab.key === "p6" ? { ...tab, locked: !lateTabsUnlocked } : tab
  );
  const holdStatus = winLossOverride
    ? winLossOverride.tone === "Cold"
      ? "cold"
      : "lost"
    : null;
  const isLost = holdStatus === "lost";
  const holdMetaItems = holdStatus
    ? [
        {
          label: "Stage",
          value: winLossOverride?.heldStage || stageLabelForHold(currentStage, isContactedP0),
        },
        winLossOverride?.reasons ? { label: "Why", value: winLossOverride.reasons } : null,
        winLossOverride?.briefNote ? { label: "Note", value: winLossOverride.briefNote } : null,
        ...(winLossOverride?.followUps || []).map((item) => ({
          label: "Follow-up",
          value: `${item.label} on ${formatFollowUpDate(item.date)}`,
        })),
        holdStatus === "cold"
          ? {
              label: "Next steps",
              value: [
                winLossOverride?.reactivateMode === "scheduled"
                  ? `Automatic follow-up after ${monthLabel(winLossOverride.reactivateMonths) || "a set time"}`
                  : "Reactivate manually",
                holdTimingLabel(winLossOverride) ? `Date: ${holdTimingLabel(winLossOverride)}` : "",
              ]
                .filter(Boolean)
                .join(" · "),
            }
          : null,
      ].filter(Boolean)
    : [];

  useEffect(() => {
    setCurrentStage(stageFromBoard);
  }, [stageFromBoard]);

  useEffect(() => {
    if (!lead?.id || lead.dealStatus !== "cold" || lead.reactivateMode !== "scheduled" || !lead.reactivateAt) return;
    const at = new Date(lead.reactivateAt).getTime();
    if (Number.isNaN(at) || at > Date.now()) return;
    const result = reactivateColdLead(lead.id, { automatic: true });
    if (!result) return;
    setWinLossOverride(null);
    toast.success(`${lead.name || "This lead"} is back in the pipeline. The hold period has ended.`);
  }, [lead?.id, lead?.dealStatus, lead?.reactivateMode, lead?.reactivateAt, lead?.name]);

  useEffect(() => {
    const dueAt = lead?.reactivateAt ? new Date(lead.reactivateAt).getTime() : NaN;
    const dueScheduled =
      lead?.dealStatus === "cold" &&
      lead?.reactivateMode === "scheduled" &&
      !Number.isNaN(dueAt) &&
      dueAt <= Date.now();
    if (dueScheduled) return;
    setWinLossOverride(holdFromLead(lead));
  }, [
    lead?.id,
    lead?.dealStatus,
    lead?.winLossReasons,
    lead?.winLossNote,
    lead?.reactivateMode,
    lead?.reactivateMonths,
    lead?.reactivateAt,
    lead?.coldHeldAt,
  ]);

  useEffect(() => {
    setIsPremium(Boolean(lead?.starred));
  }, [lead?.id, lead?.starred]);

  useEffect(() => {
    setSelectedPackage(null);
  }, [lead?.id]);

  useEffect(() => {
    if (lead?.overviewDetails) {
      setSavedDetails((prev) => prev || lead.overviewDetails);
    }
  }, [lead]);

  useEffect(() => {
    ensureLeadHistory(lead, currentStage);
  }, [lead, currentStage]);

  const skipStageTabSync = useRef(Boolean(initialTab && initialTab !== STAGE_TO_TAB[currentStage]));

  // Any stage opens the overview dashboard.
  useEffect(() => {
    if (skipStageTabSync.current) {
      skipStageTabSync.current = false;
      return;
    }
    const tabForStage = STAGE_TO_TAB[currentStage];
    if (tabForStage) setActiveTab(tabForStage);
  }, [currentStage]);

  const handlePremiumChange = (premium) => {
    setIsPremium(premium);
    onPremiumChange?.(premium);
  };

  const deal = useMemo(() => {
    const dealCode = String(lead?.mmlId || "").replace(/\s+/g, "") || "-";
    const sample = isSampleLead(lead);
    const detailsFilled = atLeast(currentStage, "P1") || Boolean(savedDetails);
    const flagsFilled = atLeast(currentStage, "P2");
    const name = lead?.name || (sample ? "Ananya Gupta" : "");
    const names =
      lead?.firstName || lead?.lastName
        ? { firstName: lead.firstName || "", lastName: lead.lastName || "" }
        : splitName(name);
    const contact = getDealContact(lead, name);
    const pick = (leadValue, dummyValue) => fromLeadOrDummy(leadValue, dummyValue, sample, detailsFilled);
    const lookingFromLead = formatLookingForLabel(lead?.lookingFor) || lead?.lookingFor || "";
    const cityFromLead = lead?.city || "";
    const areaFromLead = lead?.areaOfHouse || lead?.area || "";
    const mobileFromLead = lead?.mobile || lead?.phone || contact.phone;
    const emailFromLead = lead?.email || contact.email;
    const sourceFromLead = lead?.source || "";

    const base = {
      ...DEAL_DEFAULTS,
      id: lead?.id,
      mmlId: lead?.mmlId,
      sample,
      source: sourceFromLead || (sample ? DEAL_DEFAULTS.leadSource : EMPTY),
      leadSource: sourceFromLead || pick("", DEAL_DEFAULTS.leadSource),
      p0Status: p0StatusOf(lead),
      owner: lead?.owner,
      dealCode,
      stageLabel: currentStage === "P0" ? p0StageLabel : STAGE_LABELS[currentStage] || STAGE_LABELS.P4,
      name,
      email: emailFromLead,
      phone: mobileFromLead,
      mobile: mobileFromLead,
      premium: isPremium,
      dealValue: sample
        ? currentStage === "P0" && !savedDetails
          ? "₹25,000"
          : DEAL_DEFAULTS.dealValue
        : lead?.dealValue || lead?.overviewDetails?.dealValue || EMPTY,
      packageInterest: pick(lead?.packageInterest, DEAL_DEFAULTS.packageInterest),
      leadScore: pick(lead?.leadScore ?? (lead?.score != null ? String(lead.score) : ""), DEAL_DEFAULTS.leadScore),
      enquiryBy: pick(lead?.enquiryBy || lead?.relation, DEAL_DEFAULTS.enquiryBy),
      firstName: names.firstName || EMPTY,
      lastName: names.lastName || EMPTY,
      lookingFor: pick(lookingFromLead, DEAL_DEFAULTS.lookingFor),
      nri: pick(lead?.nri, SAMPLE_CLIENT_PROFILE.nri),
      country: pick(
        lead?.country || (String(lead?.nri).toLowerCase() === "no" ? "India" : ""),
        SAMPLE_CLIENT_PROFILE.country
      ),
      city: pick(cityFromLead, SAMPLE_CLIENT_PROFILE.city),
      meeting: pick(lead?.meeting || lead?.overviewDetails?.meeting, SAMPLE_CLIENT_PROFILE.meeting),
      dob: pick(lead?.dob || lead?.intakeValues?.dob, DEAL_DEFAULTS.dob),
      areaOfHouse: pick(areaFromLead, DEAL_DEFAULTS.areaOfHouse),
      area: cityFromLead ? areaFromLead : pick(areaFromLead, DEAL_DEFAULTS.areaOfHouse),
      profession: pick(lead?.profession || lead?.occupation, DEAL_DEFAULTS.profession),
      familyIncomeBand: pick(lead?.familyIncomeBand || lead?.income, DEAL_DEFAULTS.familyIncomeBand),
      notes: lead?.notes || lead?.overviewDetails?.notes || "",
      nextAction: sample ? pick("", DEAL_DEFAULTS.nextAction) : (lead?.nextActionNote || EMPTY),
      nextMeeting: pick(lead?.nextMeeting, DEAL_DEFAULTS.nextMeeting),
      winLossReasons: winLossOverride?.reasons ?? pick("", DEAL_DEFAULTS.winLossReasons),
      winLossTone: winLossOverride?.tone ?? (lead?.temperature || "Cold"),
      lastDiscussionAt: pick(lead?.lastDiscussion, DEAL_DEFAULTS.lastDiscussionAt),
      lastDiscussionNote: pick(lead?.lastDiscussionNote, DEAL_DEFAULTS.lastDiscussionNote),
      nextActionAt: sample ? pick(lead?.nextAction, DEAL_DEFAULTS.nextActionAt) : (lead?.nextAction || EMPTY),
      nextActionUrgency: detailsFilled
        ? lead?.hrs != null
          ? `${lead.hrs} Hrs Left`
          : sample
            ? DEAL_DEFAULTS.nextActionUrgency
            : null
        : null,
      assignedTo: pick(lead?.owner, DEAL_DEFAULTS.assignedTo),
      assignedBy: pick("", DEAL_DEFAULTS.assignedBy),
      rmFlags: DEAL_DEFAULTS.rmFlags.map((flag) =>
        flagsFilled ? flag : { ...flag, label: EMPTY }
      ),
      stageGate: stageGateFor(currentStage),
      stageHistory: historyUntil(currentStage, { p0Contacted: isContactedP0 }),
      weightedValue: pick("", DEAL_DEFAULTS.weightedValue),
      weightedValueNote: pick("", DEAL_DEFAULTS.weightedValueNote),
    };

    const merged = savedDetails
      ? {
          ...base,
          dealCode: base.dealCode,
          stageLabel:
            currentStage === "P0"
              ? p0StageLabel
              : STAGE_LABELS[currentStage] || savedDetails.stageLabel || base.stageLabel,
          packageInterest: savedDetails.packageInterest || base.packageInterest,
          premium: savedDetails.premium === "Yes",
          dealValue: savedDetails.dealValue || base.dealValue,
          leadSource: savedDetails.leadSource || savedDetails.source || base.leadSource,
          source: savedDetails.leadSource || savedDetails.source || base.source,
          leadScore: savedDetails.leadScore || base.leadScore,
          enquiryBy: savedDetails.enquiryBy || base.enquiryBy,
          firstName: savedDetails.firstName || base.firstName,
          lastName: savedDetails.lastName || base.lastName,
          name:
            [savedDetails.firstName, savedDetails.lastName].filter(Boolean).join(" ").trim() ||
            base.name,
          lookingFor: savedDetails.lookingFor || base.lookingFor,
          nri: savedDetails.nri || base.nri,
          country: savedDetails.country || base.country,
          city: savedDetails.city || base.city,
          mobile: savedDetails.mobile || base.mobile,
          email: savedDetails.email || base.email,
          notes: savedDetails.notes ?? base.notes,
          dob: savedDetails.dob || base.dob,
          areaOfHouse: savedDetails.area || savedDetails.areaOfHouse || base.areaOfHouse,
          area: savedDetails.area || savedDetails.areaOfHouse || base.area,
          profession: savedDetails.profession || base.profession,
          familyIncomeBand: savedDetails.familyIncomeBand || base.familyIncomeBand,
          meeting: savedDetails.meeting || base.meeting,
          nextMeeting: savedDetails.nextMeeting || base.nextMeeting,
          winLossReasons: winLossOverride?.reasons || savedDetails.winLossReasons || base.winLossReasons,
          winLossTone: winLossOverride?.tone || savedDetails.winLossTone || base.winLossTone,
          lastDiscussionAt: savedDetails.lastDiscussionAt || base.lastDiscussionAt,
          lastDiscussionNote: savedDetails.lastDiscussionNote || base.lastDiscussionNote,
          nextActionAt: savedDetails.nextActionAt || base.nextActionAt,
          nextAction: savedDetails.nextAction || base.nextAction,
          nextActionUrgency: savedDetails.nextActionUrgency || base.nextActionUrgency,
          assignedTo: savedDetails.assignedTo || base.assignedTo,
          assignedBy: savedDetails.assignedBy || base.assignedBy,
        }
      : base;

    const totalMandatory = MANDATORY_OVERVIEW_KEYS.length;
    const filled = sample
      ? detailsFilled
        ? totalMandatory
        : 0
      : countFilledKeys(merged, MANDATORY_OVERVIEW_KEYS);
    merged.fieldsFilledNote =
      currentStage === "P0" && !savedDetails
        ? `${filled} of ${totalMandatory} mandatory fields filled. please fill/edit all the details to move to Contacted`
        : currentStage === "P0"
          ? `${Math.max(filled, 1)} of ${totalMandatory} mandatory fields filled. Move to P1 when ready.`
          : `${Math.max(filled, 1)} of ${totalMandatory} mandatory fields filled.`;
    merged.profileCompletion =
      lead?.completion != null && lead.completion !== ""
        ? Number(lead.completion)
        : Math.round((filled / totalMandatory) * 100);
    merged.priority = lead?.priority || "";
    merged.scoreValue = lead?.score ?? "";
    merged.maritalStatus = lead?.intakeValues?.maritalStatus || lead?.maritalStatus || "";

    return merged;
  }, [lead, currentStage, winLossOverride, isPremium, savedDetails, p0StageLabel, isContactedP0]);

  const stageDurations = useMemo(() => {
    const events = buildDemoHistory(
      {
        ...lead,
        p0Status: isContactedP0 || atLeast(currentStage, "P1") ? "contacted" : p0StatusOf(lead),
      },
      currentStage
    );
    return durationsFromHistory(deal.stageHistory, events);
  }, [deal.stageHistory, lead, currentStage, isContactedP0]);

  const openHandoverSuccess = () => {
    setServiceAssigned({
      manager: DUMMY_MANAGER.name,
      branch: DUMMY_MANAGER.branch,
    });
    setServiceAssignOpen(true);
    recordLeadActivity(lead, currentStage, {
      type: "handover",
      title: `Handover assigned to ${DUMMY_MANAGER.name}`,
      detail: DUMMY_MANAGER.branch,
      stage: "P6",
    });
  };

  const openWinLossModal = (mode) => setWinLossModal({ open: true, mode });

  const handleWinLossSave = ({ reasons, briefNote, mode, reactivation, followUps = [] }) => {
    const tone = mode === "cold" ? "Cold" : "Lost";
    const dealStatus = mode === "cold" ? "cold" : "lost";
    const heldStage = stageLabelForHold(currentStage, isContactedP0);
    const holdPatch =
      mode === "cold" && reactivation
        ? {
            reactivateMode: reactivation.mode,
            reactivateMonths: reactivation.months,
            reactivateAt: reactivation.reactivateAt,
            coldHeldAt: reactivation.heldAt,
            temperatureBeforeHold:
              lead?.dealStatus === "cold"
                ? lead?.temperatureBeforeHold || "Warm"
                : lead?.temperature && lead.temperature !== "Cold"
                  ? lead.temperature
                  : "Warm",
          }
        : {
            reactivateMode: "",
            reactivateMonths: "",
            reactivateAt: "",
            coldHeldAt: "",
            temperatureBeforeHold: "",
          };
    setWinLossOverride({
      reasons,
      tone,
      briefNote,
      heldStage,
      followUps,
      reactivateMode: holdPatch.reactivateMode,
      reactivateMonths: holdPatch.reactivateMonths,
      reactivateAt: holdPatch.reactivateAt,
      coldHeldAt: holdPatch.coldHeldAt,
    });
    setWinLossModal({ open: false, mode });
    setActiveTab("overview");
    if (lead?.id) {
      updateLead(lead.id, {
        dealStatus,
        temperature: tone,
        winLossReasons: reasons,
        winLossNote: briefNote,
        winLossStage: heldStage,
        winLossFollowUps: followUps,
        lost: dealStatus === "lost",
        ...holdPatch,
      });
    }
    const timing = mode === "cold" ? holdTimingLabel(holdPatch) : "";
    const detailMessage = buildHoldNotificationMessage({
      stageLabel: heldStage,
      reasons,
      briefNote,
      mode,
      reactivation,
      followUps,
    });
    recordLeadActivity(lead, currentStage, {
      type: mode === "cold" ? "flag" : "stage",
      title:
        mode === "cold"
          ? `${deal.name} moved to Cold & Hold`
          : `${deal.name} marked as lost`,
      detail: detailMessage,
    });

    const leadPath = lead?.id ? `/pipeline?openLead=${encodeURIComponent(lead.id)}` : "/pipeline";
    pushNotification({
      actor: "Pipeline",
      title:
        mode === "cold"
          ? `${deal.name} moved to Cold & Hold`
          : `${deal.name} marked as lost`,
      message: detailMessage,
      type: mode === "cold" ? "Follow-up" : "Lead",
      to: leadPath,
    });

    if (mode === "cold" && reactivation?.mode === "scheduled" && reactivation?.reactivateAt) {
      const when = formatHoldDate(reactivation.reactivateAt) || "the review date";
      pushNotification({
        actor: "Follow-up",
        title: `Follow up ${deal.name}`,
        message: `Automatic Cold & Hold review on ${when}. Stage was ${heldStage}. Why: ${reasons || "—"}.`,
        type: "Follow-up",
        to: leadPath,
      });
    }

    followUps.forEach((item) => {
      const when = formatFollowUpDate(item.date);
      if (!when) return;
      pushNotification({
        actor: "Follow-up",
        title: `Follow up ${deal.name}`,
        message: `${item.label} — next follow-up on ${when}. Stage: ${heldStage}.`,
        type: "Follow-up",
        to: leadPath,
      });
    });

    toast.success(
      mode === "cold"
        ? reactivation?.mode === "manual"
          ? `${deal.name} moved to Cold & Hold at ${heldStage}. Reactivate manually.`
          : `${deal.name} moved to Cold & Hold at ${heldStage}. Automatic follow-up on ${timing || "the review date"}.`
        : `${deal.name} marked as lost at ${heldStage}. Win / loss reasons saved.`
    );
  };

  const handleReactivate = () => {
    if (!lead?.id) {
      setWinLossOverride(null);
      toast.success(`${deal.name} reactivated and is back in the pipeline.`);
      return;
    }
    const result = reactivateColdLead(lead.id);
    if (!result) return;
    setWinLossOverride(null);
    toast.success(`${deal.name} reactivated and is back in the pipeline.`);
  };

  const handleConfirmMove = () => {
    if (holdStatus || !nextStage) return;
    if (currentStage === "P1" && !leadHasMobileNumber({
      ...lead,
      mobile: savedDetails?.mobile || lead?.mobile,
      phone: savedDetails?.phone || lead?.phone,
      overviewDetails: savedDetails || lead?.overviewDetails,
    })) {
      toast.error(P2_MOBILE_REQUIRED_MESSAGE);
      return;
    }
    const fromStage = currentStage;
    if (nextStage === "Contacted") {
      setP0Contacted(true);
      setActiveTab("overview");
    } else {
      setCurrentStage(nextStage);
      const tabForNext = STAGE_TO_TAB[nextStage];
      if (tabForNext) setActiveTab(tabForNext);
    }
    onAdvance?.(
      {
        ...lead,
        ...(savedDetails || {}),
        p0Status: nextStage === "Contacted" || isContactedP0 ? "contacted" : lead?.p0Status,
        overviewDetails: savedDetails || lead?.overviewDetails,
        intakeValues: lead?.intakeValues,
      },
      fromStage
    );
  };

  const handleDetailsSaved = (draft) => {
    setSavedDetails(draft);
    handlePremiumChange(draft.premium === "Yes");
    if (lead?.id) {
      updateLead(lead.id, {
        firstName: draft.firstName || "",
        lastName: draft.lastName || "",
        name: draft.name || `${draft.firstName || ""} ${draft.lastName || ""}`.replace(/\s+/g, " ").trim(),
        dob: draft.dob || "",
        lookingFor: draft.lookingFor || "",
        nri: draft.nri || "",
        country: draft.country || "",
        city: draft.city || "",
        area: draft.area || draft.areaOfHouse || "",
        areaOfHouse: draft.area || draft.areaOfHouse || "",
        relation: draft.enquiryBy || "",
        enquiryBy: draft.enquiryBy || "",
        mobile: draft.mobile || "",
        email: draft.email || "",
        source: draft.leadSource || draft.source || "",
        profession: draft.profession || "",
        familyIncomeBand: draft.familyIncomeBand || "",
        meeting: draft.meeting || "",
        notes: draft.notes || "",
        overviewDetails: draft,
      });
    }
    if (currentStage === "P0") {
      setP0Contacted(true);
      onP0DetailsSaved?.({ ...lead, p0Status: "contacted", dob: draft.dob, overviewDetails: draft }, draft);
    } else {
      recordLeadActivity(lead, currentStage, {
        type: "details",
        title: "Deal details updated",
      });
    }
  };

  const intakeLead = useMemo(() => {
    if (!lead && !deal) return lead;
    return {
      ...lead,
      lookingFor: deal?.lookingFor || lead?.lookingFor,
      nri: deal?.nri || lead?.nri,
      country: deal?.country || lead?.country,
      city: deal?.city || lead?.city,
      area: deal?.area || deal?.areaOfHouse || lead?.area,
      areaOfHouse: deal?.areaOfHouse || deal?.area || lead?.areaOfHouse,
      enquiryBy: deal?.enquiryBy || lead?.enquiryBy,
      relation: deal?.enquiryBy || lead?.relation,
      firstName: deal?.firstName || lead?.firstName,
      lastName: deal?.lastName || lead?.lastName,
      meeting: deal?.meeting || lead?.meeting,
      mobile: deal?.mobile || deal?.phone || lead?.mobile,
      email: deal?.email || lead?.email,
      dob: deal?.dob || lead?.dob,
      profession: deal?.profession || lead?.profession,
      familyIncomeBand: deal?.familyIncomeBand || lead?.familyIncomeBand,
      notes: deal?.notes ?? lead?.notes,
      packageInterest: deal?.packageInterest || lead?.packageInterest,
      premium: deal?.premium ?? lead?.premium,
      starred: deal?.premium || lead?.starred,
      name: deal?.name || lead?.name,
      leadSource: deal?.leadSource || deal?.source || lead?.leadSource || lead?.source,
      source: deal?.leadSource || deal?.source || lead?.source,
      overviewDetails: savedDetails || lead?.overviewDetails,
      intakeValues: lead?.intakeValues,
    };
  }, [lead, deal, savedDetails]);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    if (pkg?.name) {
      recordLeadActivity(lead, currentStage, {
        type: "quote",
        title: `${pkg.name} package selected`,
      });
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
            onCreateTask={() => setFollowUpOpen(true)}
            selectedPackageKey={selectedPackage?.key ?? null}
            onPackageSelect={handlePackageSelect}
            onPaymentVerified={() => onPaymentVerified?.(lead)}
          />
        );
      case "intake":
        return (
          <IntakeFormTab
            empty={currentStage === "P0" && !lead?.intakeValues && !savedDetails}
            lead={intakeLead}
          />
        );
      case "visits":
        return <VisitsMeetingsTab empty={!atLeast(currentStage, "P3")} lead={lead} currentStage={currentStage} />;
      case "package":
        return (
          <PackageQuoteTab
            empty={!atLeast(currentStage, "P4")}
            selectedKey={selectedPackage?.key ?? null}
            onPackageSelect={handlePackageSelect}
            clientName={deal?.name || ""}
            deal={deal}
            currentStage={currentStage}
          />
        );
      case "discounts":
        return <DiscountApprovalsTab />;
      case "documents":
        return <DocumentsKycTab empty={!atLeast(currentStage, "P5")} />;
      case "notes":
        return <NotesRmFlagsTab empty={!atLeast(currentStage, "P2")} lead={lead} currentStage={currentStage} />;
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
            clientName={deal.name}
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
        <div className="flex flex-col gap-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
              aria-label="Back to pipeline"
            >
              <ArrowLeft size={15} />
              Back
            </button>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => openWinLossModal("lost")}
                className="inline-flex items-center gap-1.5 h-[38px] px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
              >
                <Flag size={14} /> Mark lost
              </button>
              {holdStatus === "cold" ? (
                winLossOverride?.reactivateMode === "scheduled" ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1.5 h-[38px] px-4 rounded-xl bg-[#FCF5F6] border border-[#E8D4D8] text-[13px] font-semibold text-[#7A0A17] cursor-default"
                  >
                    <Snowflake size={14} />
                    Reactivates {formatHoldDate(winLossOverride?.reactivateAt) || "later"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReactivate}
                    className="inline-flex items-center gap-1.5 h-[38px] px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#7A0A17] transition-colors"
                  >
                    <RotateCcw size={14} />
                    Reactivate
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => openWinLossModal("cold")}
                  className="inline-flex items-center gap-1.5 h-[38px] px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
                >
                  Move to Cold &amp; Hold
                  <ChevronDown size={14} className="text-[#9CA3AF]" />
                </button>
              )}
            </div>
          </div>

          {holdStatus ? (
            <div
              role="status"
              className={`flex flex-wrap items-start gap-3 rounded-xl border px-4 py-3 ${
                holdStatus === "cold"
                  ? "border-[#E8D4D8] bg-[#FCF5F6]"
                  : "border-[#E8D4D8] bg-[#F8EEF0]"
              }`}
            >
              <span className="size-8 rounded-lg bg-white grid place-items-center shrink-0 text-[#7A0A17]">
                {holdStatus === "cold" ? <Snowflake size={16} /> : <Flag size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#7A0A17]">
                  {holdStatus === "cold" ? "Moved to Cold & Hold" : "Marked as Lost"}
                </p>
                <p className="text-[12px] text-[#6B7280] mt-0.5 leading-snug">
                  {holdStatus === "cold"
                    ? "This deal is on hold. P0 to P6 are inactive."
                    : "This deal is closed as lost. P0 to P6 are inactive."}
                </p>
                {holdMetaItems.length ? (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] leading-snug text-[#374151]">
                    {holdMetaItems.map((item, index) => (
                      <p key={`${item.label}-${index}`} className="min-w-0 flex items-start gap-2">
                        {index % 2 === 1 ? (
                          <span className="hidden sm:inline text-[#D1D5DB] font-normal shrink-0" aria-hidden>
                            |
                          </span>
                        ) : null}
                        <span className="min-w-0">
                          <span className="font-semibold text-[#7A0A17]">{item.label}:</span>{" "}
                          <span className="break-words">{item.value}</span>
                        </span>
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-1 min-w-0">
              <StageStepper
                variant="overview"
                durations={stageDurations}
                muted={Boolean(holdStatus)}
                activeStageId={
                  currentStage !== "P0"
                    ? currentStage
                    : isContactedP0
                      ? "P0-contacted"
                      : "P0-new"
                }
              />
            </div>
            {holdStatus ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 h-[38px] px-5 rounded-xl bg-[#E5E7EB] text-[#9CA3AF] text-[13px] font-semibold cursor-not-allowed shrink-0"
              >
                {holdStatus === "cold" ? "On hold" : "Marked lost"}
              </button>
            ) : nextStage ? (
              <button
                type="button"
                onClick={handleConfirmMove}
                className="inline-flex items-center gap-1.5 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors shrink-0"
              >
                Move to {nextStage} <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={openHandoverSuccess}
                className="inline-flex items-center gap-1.5 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors shrink-0"
              >
                Handover to services
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Deal header + tabs — hidden on the overview dashboard */}
        {activeTab !== "overview" && (
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
                    <span className="inline-flex shrink-0" title="Premium client" aria-label="Premium client">
                      <Star size={14} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />
                    </span>
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
                  className="p-1.5 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] transition-colors"
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
        )}

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
        onSave={(form) => {
          const item = addExtraEvent(taskFormToCalendarItem(form));
          recordLeadActivity(lead, currentStage, {
            type: "task",
            title: item.title || "Task assigned",
            stage: currentStage,
          });
        }}
      />
    </div>
  );
}
