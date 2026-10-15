import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Globe,
  Handshake,
  Hash,
  Heart,
  IndianRupee,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  User,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import {
  coerceCreateLeadValue,
  formatLookingForLabel,
  formatYesNoLabel,
  isLookingToggleValue,
  splitName,
} from "../../utils/leadFields.js";

const TEMPERATURE_TONES = {
  Hot: { color: "#E8395B", bg: "#FDECEE" },
  Warm: { color: "#F59E0B", bg: "#FFF3E4" },
  Cold: { color: "#3B82F6", bg: "#E8F2FE" },
  Lost: { color: "#7A0A17", bg: "#FCF5F6" },
};

export function toIsoDate(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "-") return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const slash = raw.match(/^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/);
  if (slash) {
    return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDob(value) {
  const iso = toIsoDate(value);
  if (!iso) return value && value !== "-" ? value : "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function viewInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ViewField({ icon: Icon, label, value, children, full }) {
  return (
    <div className={`flex items-start gap-2.5 min-w-0 ${full ? "sm:col-span-2" : ""}`}>
      {Icon ? (
        <span className="size-8 rounded-xl bg-[#FCF5F6] text-[#7A0A17] grid place-items-center shrink-0 mt-0.5">
          <Icon size={14} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
        {children || (
          <p className="text-[13px] font-semibold text-[#111] mt-1 break-words leading-snug">{value || "-"}</p>
        )}
      </div>
    </div>
  );
}

function ViewPill({ children, color = "#7A0A17", bg = "#FCF5F6" }) {
  if (!children) return <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>;
  return (
    <span
      className="inline-block mt-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

function AssignedView({ label, name }) {
  const text = String(name || "").trim();
  return (
    <ViewField icon={User} label={label}>
      {text ? (
        <div className="flex items-center gap-2 mt-1 min-w-0">
          <span className="size-7 rounded-full bg-[#7A0A17] text-white text-[10px] font-bold grid place-items-center shrink-0">
            {viewInitials(text) || "—"}
          </span>
          <p className="text-[13px] font-semibold text-[#111] truncate">{text}</p>
        </div>
      ) : (
        <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
      )}
    </ViewField>
  );
}

function dashToEmpty(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "-" || raw === "—") return "";
  return String(value);
}

function namesFromDeal(deal) {
  const first = dashToEmpty(deal.firstName);
  const last = dashToEmpty(deal.lastName);
  if (first || last) return { firstName: first, lastName: last };
  return splitName(deal.name);
}

export function detailsFromDeal(deal) {
  const lookingRaw = deal.lookingFor || "";
  const lookingToggle = isLookingToggleValue(lookingRaw);
  const names = namesFromDeal(deal);
  return {
    dealCode: deal.dealCode || "",
    stageLabel: deal.stageLabel || "",
    packageInterest: deal.packageInterest || "",
    premium: deal.premium === true || deal.premium === "Yes" ? "Yes" : "No",
    dealValue: dashToEmpty(deal.dealValue),
    leadSource: dashToEmpty(deal.leadSource || deal.source),
    leadScore: dashToEmpty(deal.leadScore),
    enquiryBy: dashToEmpty(deal.enquiryBy),
    firstName: names.firstName,
    lastName: names.lastName,
    lookingFor: lookingToggle ? coerceCreateLeadValue("lookingFor", lookingRaw) || "yes" : lookingRaw,
    lookingCustom: lookingToggle ? "" : lookingRaw,
    nri: (() => {
      const raw = String(deal.nri ?? "").trim().toLowerCase();
      if (!raw || raw === "-") return "";
      if (raw === "yes") return "yes";
      if (raw === "no") return "no";
      return raw;
    })(),
    country: dashToEmpty(deal.country),
    city: dashToEmpty(deal.city),
    area: dashToEmpty(deal.area || deal.areaOfHouse),
    mobile: dashToEmpty(deal.mobile || deal.phone),
    email: dashToEmpty(deal.email),
    notes: deal.notes || "",
    dob: toIsoDate(deal.dob) || "",
    areaOfHouse: dashToEmpty(deal.areaOfHouse || deal.area),
    profession: dashToEmpty(deal.profession || deal.occupation),
    familyIncomeBand: dashToEmpty(deal.familyIncomeBand),
    meeting: dashToEmpty(deal.meeting),
    nextMeeting: dashToEmpty(deal.nextMeeting),
    winLossReasons: dashToEmpty(deal.winLossReasons),
    winLossTone: deal.winLossTone || "Cold",
    lastDiscussionAt: dashToEmpty(deal.lastDiscussionAt),
    lastDiscussionNote: dashToEmpty(deal.lastDiscussionNote),
    nextActionAt: dashToEmpty(deal.nextActionAt),
    nextAction: dashToEmpty(deal.nextAction),
    nextActionUrgency: deal.nextActionUrgency || "",
    assignedTo: dashToEmpty(deal.assignedTo),
    assignedBy: dashToEmpty(deal.assignedBy),
  };
}

export function ProfileDetailsView({ details, onFollowUp }) {
  const lookingLabel = formatLookingForLabel(details.lookingCustom || details.lookingFor) || details.lookingFor;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="rounded-2xl border border-black/8 overflow-hidden bg-white shadow-[0_8px_24px_rgba(122,10,23,0.04)]">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#FCF5F6] border-b border-[#7A0A17]/10">
          <User size={15} className="text-[#7A0A17]" />
          <h3 className="text-[13px] font-bold text-[#7A0A17]">Personal Details</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          <ViewField icon={Heart} label="Looking for a bride or groom">
            {lookingLabel ? (
              <ViewPill color="#7A0A17" bg="#FCF5F6">{lookingLabel}</ViewPill>
            ) : (
              <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
            )}
          </ViewField>
          <ViewField icon={Globe} label="NRI">
            {formatYesNoLabel(details.nri) ? (
              <ViewPill
                color={details.nri === "yes" ? "#16A34A" : "#4B5563"}
                bg={details.nri === "yes" ? "#E7F8EF" : "#F3F4F6"}
              >
                {formatYesNoLabel(details.nri)}
              </ViewPill>
            ) : (
              <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
            )}
          </ViewField>
          <ViewField icon={Users} label="Enquiry made by" value={details.enquiryBy} full />
          <ViewField icon={User} label="First name" value={details.firstName} />
          <ViewField icon={User} label="Last name" value={details.lastName} />
          <ViewField icon={Calendar} label="Date of birth" value={formatDob(details.dob)} />
          <ViewField icon={Briefcase} label="Profession" value={details.profession} />
          <ViewField icon={Phone} label="Mobile number" value={details.mobile} />
          <ViewField icon={Mail} label="Email" value={details.email} />
          <ViewField icon={Globe} label="Country" value={details.nri === "no" ? "India" : details.country} />
          <ViewField icon={Building2} label="City" value={details.city} />
          <ViewField icon={MapPin} label="Area / Locality" value={details.area || details.areaOfHouse} />
          <ViewField icon={Wallet} label="Family income bracket" value={details.familyIncomeBand} />
          <ViewField icon={Layers} label="Source" value={details.leadSource} />
          <ViewField icon={Calendar} label="Agree to a meeting or call">
            {details.meeting ? (
              <ViewPill>{details.meeting}</ViewPill>
            ) : (
              <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
            )}
          </ViewField>
          <ViewField icon={FileText} label="Additional notes" value={details.notes} full />
        </div>
      </section>

      <section className="rounded-2xl border border-black/8 overflow-hidden bg-white shadow-[0_8px_24px_rgba(122,10,23,0.04)]">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#FCF5F6] border-b border-[#7A0A17]/10">
          <Handshake size={15} className="text-[#7A0A17]" />
          <h3 className="text-[13px] font-bold text-[#7A0A17]">Deal Information</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          <ViewField icon={Hash} label="Deal code" value={details.dealCode} />
          <ViewField icon={Layers} label="Stage">
            <ViewPill>{details.stageLabel}</ViewPill>
          </ViewField>
          <ViewField icon={Star} label="Package interest" value={details.packageInterest} />
          <ViewField icon={Star} label="Premium client">
            {details.premium === "Yes" ? (
              <span className="inline-flex items-center gap-1 mt-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-md text-[#16A34A] bg-[#E7F8EF]">
                <Star size={11} fill="#16A34A" strokeWidth={0} />
                Yes
              </span>
            ) : (
              <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
            )}
          </ViewField>
          <ViewField icon={IndianRupee} label="Deal value" value={details.dealValue} />
          <ViewField icon={Star} label="Lead score">
            {details.leadScore ? (
              <ViewPill color="#16A34A" bg="#E7F8EF">{details.leadScore}</ViewPill>
            ) : (
              <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
            )}
          </ViewField>
          <ViewField icon={Video} label="Next schedule meeting" value={details.nextMeeting} />
          <ViewField icon={MessageSquare} label="Win / loss analysis - reasons" full>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                style={{
                  color: (TEMPERATURE_TONES[details.winLossTone] || TEMPERATURE_TONES.Cold).color,
                  backgroundColor: (TEMPERATURE_TONES[details.winLossTone] || TEMPERATURE_TONES.Cold).bg,
                }}
              >
                {details.winLossTone || "Cold"}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-[#111] mt-1">{details.winLossReasons || "-"}</p>
          </ViewField>
          <ViewField icon={MessageSquare} label="Last discussion">
            <p className="text-[13px] font-semibold text-[#111] mt-1">{details.lastDiscussionAt || "-"}</p>
            {details.lastDiscussionNote ? (
              <p className="text-[12px] text-[#4B5563] mt-0.5">{details.lastDiscussionNote}</p>
            ) : null}
            <button
              type="button"
              onClick={onFollowUp}
              className="text-[11.5px] font-semibold text-[#2563EB] hover:underline mt-1"
            >
              Follow up History
            </button>
          </ViewField>
          <ViewField icon={Calendar} label="Next action">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-[#111] mt-1">{details.nextActionAt || "-"}</p>
              {details.nextActionUrgency ? (
                <span className="text-[11px] font-bold text-[#E8395B] shrink-0">{details.nextActionUrgency}</span>
              ) : null}
            </div>
            {details.nextAction ? (
              <p className="text-[12px] text-[#4B5563] mt-0.5">{details.nextAction}</p>
            ) : null}
          </ViewField>
          <AssignedView label="Assigned to" name={details.assignedTo} />
          <AssignedView label="Assigned by" name={details.assignedBy} />
        </div>
      </section>
    </div>
  );
}
