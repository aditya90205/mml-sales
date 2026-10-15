import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Eye } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import {
  detailsFromDeal,
  ProfileDetailsView,
} from "../pipeline/ProfileDetailsView.jsx";
import LeadActivityHistory from "../../pages/pipeline/deal-tabs/LeadActivityHistory.jsx";
import { lookingForFromGender, splitName } from "../../utils/leadFields.js";
import {
  findLeadForClient,
  pipelineOverviewPath,
  SAMPLE_CLIENT_PROFILE,
} from "../../utils/pipelineStore.js";

const STAGE_LABELS = {
  P0: "P0 New",
  P1: "P1 Qualified",
  P2: "P2 Data Collection",
  P3: "P3 Visit / Video",
  P4: "P4 Negotiation",
  P5: "P5 Payment",
  P6: "P6 Handover to services",
};

function incomeBandFromClient(client) {
  const lpa = Number(client?.incomeLpa);
  if (!Number.isFinite(lpa) || lpa <= 0) return SAMPLE_CLIENT_PROFILE.familyIncomeBand;
  if (lpa < 15) return "Under ₹15 Lakh";
  if (lpa < 30) return "₹15 Lakh to ₹30 Lakh";
  if (lpa < 50) return "₹30 Lakh to ₹50 Lakh";
  if (lpa < 100) return "₹50 Lakh to ₹1 Crore";
  return "Above ₹1 Crore";
}

function cityFromClient(client) {
  if (client?.city) return client.city;
  const tail = String(client?.address || "")
    .split(",")
    .pop()
    ?.replace(/\*/g, "")
    .trim();
  return tail || SAMPLE_CLIENT_PROFILE.city;
}

/** Build the same Profile modal payload used on pipeline Overview. */
export function profileDetailsFromClient(client) {
  if (!client) return detailsFromDeal({});
  const hit = findLeadForClient(client);
  const lead = hit?.lead || {};
  const stageId = hit?.stageId || "";
  const od = lead.overviewDetails || {};
  const names =
    lead.firstName || lead.lastName
      ? { firstName: lead.firstName || "", lastName: lead.lastName || "" }
      : splitName(client.name || lead.name || "");

  const lookingFor =
    lead.lookingFor ||
    od.lookingFor ||
    lookingForFromGender(client.gender || lead.gender, "lead");

  return detailsFromDeal({
    ...SAMPLE_CLIENT_PROFILE,
    ...lead,
    ...od,
    name: client.name || lead.name,
    firstName: names.firstName,
    lastName: names.lastName,
    lookingFor,
    nri: lead.nri || od.nri || SAMPLE_CLIENT_PROFILE.nri,
    enquiryBy: lead.enquiryBy || lead.relation || od.enquiryBy || SAMPLE_CLIENT_PROFILE.enquiryBy,
    dob: lead.dob || od.dob || SAMPLE_CLIENT_PROFILE.dob,
    profession: lead.profession || od.profession || SAMPLE_CLIENT_PROFILE.profession,
    mobile: lead.mobile || lead.phone || client.mobile || client.phone,
    email: lead.email || client.email,
    country: lead.country || od.country || client.country || SAMPLE_CLIENT_PROFILE.country,
    city: lead.city || od.city || cityFromClient(client),
    area: lead.area || lead.areaOfHouse || od.areaOfHouse || client.area,
    areaOfHouse: lead.areaOfHouse || lead.area || client.area || SAMPLE_CLIENT_PROFILE.areaOfHouse,
    familyIncomeBand: lead.familyIncomeBand || od.familyIncomeBand || incomeBandFromClient(client),
    leadSource: lead.source || od.leadSource,
    dealCode: lead.mmlId || od.dealCode || client.clientId,
    stageLabel:
      od.stageLabel ||
      (stageId === "P0" && lead.p0Status === "contacted"
        ? "P0 Contacted"
        : STAGE_LABELS[stageId] || "—"),
    packageInterest: lead.packageInterest || od.packageInterest || SAMPLE_CLIENT_PROFILE.packageInterest,
    premium: lead.starred || od.premium === "Yes" || od.premium === true ? "Yes" : od.premium || "No",
    dealValue: lead.dealValue || od.dealValue || "₹51,000",
    leadScore: lead.leadScore || (lead.score != null ? String(lead.score) : null) || od.leadScore || "Warm",
    nextMeeting: lead.nextMeeting || od.nextMeeting || "04/09/26",
    winLossReasons:
      lead.winLossReasons ||
      od.winLossReasons ||
      "No decision / Think about it, Competitor / Existing solution",
    winLossTone: lead.temperature || od.winLossTone || "Hot",
    lastDiscussionAt: lead.lastDiscussion || od.lastDiscussionAt || "01/09/26, 4:55 PM",
    lastDiscussionNote: lead.lastDiscussionNote || od.lastDiscussionNote || "Meeting Notes/Discussions",
    nextActionAt: lead.nextAction || od.nextActionAt || "05/09/26, 4:55 PM",
    nextAction: lead.nextActionNote || od.nextAction || "Call Client for pricing confirmation at 8 PM",
    nextActionUrgency:
      lead.hrs != null ? `${lead.hrs} Hrs Left` : od.nextActionUrgency || "6 Hrs Left",
    assignedTo: lead.owner || client.owner || od.assignedTo || "Rohit K.",
    assignedBy: od.assignedBy || "Aditya Sharma",
    meeting: lead.meeting || od.meeting || SAMPLE_CLIENT_PROFILE.meeting,
    notes: lead.notes || od.notes || "",
  });
}

export default function ClientProfileModal({ open, onClose, client }) {
  const navigate = useNavigate();
  const [historyOpen, setHistoryOpen] = useState(false);

  const hit = useMemo(() => (client ? findLeadForClient(client) : null), [client]);
  const details = useMemo(() => profileDetailsFromClient(client), [client]);

  const goEdit = () => {
    onClose?.();
    // Only open pipeline overview when this client is linked to a deal.
    if (hit?.lead?.id) navigate(pipelineOverviewPath(hit.lead.id));
  };

  return (
    <>
      <Modal
        open={open && Boolean(client)}
        onClose={onClose}
        title="Profile"
        subtitle="Full profile details"
        icon={<Eye size={18} />}
        iconBg="#FFF6E8"
        iconColor="#C2410C"
        width="max-w-5xl"
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Close
            </button>
            {hit?.lead?.id ? (
              <button
                type="button"
                onClick={goEdit}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
              >
                <Edit2 size={13} />
                Edit
              </button>
            ) : null}
          </>
        }
      >
        <ProfileDetailsView details={details} onFollowUp={() => setHistoryOpen(true)} />
      </Modal>

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Lead History"
        width="max-w-3xl"
        zClass="z-[90]"
      >
        <LeadActivityHistory
          lead={hit?.lead || { name: client?.name, id: client?.linkedLeadId }}
          currentStage={hit?.stageId || "P0"}
        />
      </Modal>
    </>
  );
}
