import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import StatusPill from "../components/common/StatusPill";
import {
  AppPage,
  MetricCard,
  NativeSelect,
  OutlineBtn,
  Panel,
  PrimaryBtn,
  Td,
  Th,
} from "../components/common/AppPage.jsx";
import Modal from "../components/ui/Modal.jsx";

const TABS = [
  { k: "overview", label: "Overview" },
  { k: "payment", label: "Payment Collection", count: 14 },
  { k: "followup", label: "Final Payment Follow-up", count: 6 },
  { k: "testimonial", label: "Testimonials", count: 9 },
  { k: "review", label: "Google Reviews", count: 7 },
  { k: "cross", label: "Cross-sell", count: 11 },
  { k: "upsell", label: "Upsell", count: 8 },
  { k: "referral", label: "Referral" },
];

const MODES = ["UPI", "Card", "NEFT", "Cheque", "Cash"];
const CHANNELS = ["WhatsApp", "Phone call", "SMS", "Email"];
const COMPLETION_STEPS = ["Payment", "Testimonial", "Review", "Cross-sell", "Upsell", "Feedback"];

const BANNER_CLASS = {
  bad: "bg-[#FDECEE] border-[#E8395B]/25 text-[#B42318]",
  warn: "bg-[#FFF3E4] border-[#F59E0B]/30 text-[#B45309]",
  info: "bg-[#E8F2FE] border-[#3B82F6]/25 text-[#1D4ED8]",
  gold: "bg-[#FFF8E8] border-[#D97706]/25 text-[#92400E]",
  ok: "bg-[#E7F8EF] border-[#16A34A]/25 text-[#166534]",
};

const KIND_TO_TONE = { ok: "green", warn: "amber", bad: "red", info: "blue", neu: "gray" };

function num(s) {
  return parseInt(String(s).replace(/[^0-9]/g, ""), 10) || 0;
}

function inr(n) {
  const s = String(Math.round(n));
  if (s.length <= 3) return `₹${s}`;
  return `₹${s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${s.slice(-3)}`;
}

const INITIAL_PAYMENTS = [
  { name: "Dr. Arjun Nair", code: "MML-C-10419", pkg: "Exclusive", contract: "₹1,00,000", collectedNum: 60000, balanceNum: 40000, due: "2 Sep 2026", status: "Due in 2 days", kind: "warn", owner: "Rohit K.", action: "Record" },
  { name: "Shalini Kapoor", code: "MML-C-10402", pkg: "Exclusive Privé", contract: "₹5,00,000", collectedNum: 375000, balanceNum: 125000, due: "1 Aug 2026", status: "34 days overdue", kind: "bad", owner: "Neha S.", action: "Follow up" },
  { name: "Sanjay Mehta", code: "MML-C-10428", pkg: "Premium", contract: "₹51,000", collectedNum: 51000, balanceNum: 0, due: "Closed", status: "Fully paid", kind: "ok", owner: "Rohit K.", action: "Receipt" },
  { name: "Ritu Saxena", code: "MML-C-10425", pkg: "Classic", contract: "₹25,000", collectedNum: 15000, balanceNum: 10000, due: "8 Sep 2026", status: "Instalment 2 of 3", kind: "info", owner: "Rohit K.", action: "Record" },
  { name: "Vikram Ahluwalia", code: "MML-C-10396", pkg: "Signature", contract: "₹10,00,000", collectedNum: 700000, balanceNum: 300000, due: "15 Sep 2026", status: "Milestone based", kind: "info", owner: "Pooja S.", action: "Record" },
  { name: "Aditya Verma", code: "MML-C-10444", pkg: "Premium", contract: "₹51,000", collectedNum: 25500, balanceNum: 25500, due: "28 Aug 2026", status: "7 days overdue", kind: "bad", owner: "Neha S.", action: "Follow up" },
  { name: "Priya Raheja", code: "MML-C-10437", pkg: "Classic", contract: "₹25,000", collectedNum: 25000, balanceNum: 0, due: "Closed", status: "Fully paid", kind: "ok", owner: "Neha S.", action: "Receipt" },
  { name: "Karan Malhotra", code: "MML-C-10462", pkg: "Premium", contract: "₹51,000", collectedNum: 30000, balanceNum: 21000, due: "12 Sep 2026", status: "Refund requested", kind: "warn", owner: "Rohit K.", action: "Review" },
];

const FOLLOWUP_ROWS = [
  { name: "Shalini Kapoor", code: "MML-C-10402", balance: "₹1,25,000", overdue: "34 days", last: "2 Sep · phone call", attempt: 3, response: "Asked to split into 2 instalments", next: "Escalate to Branch Head", kind: "bad", action: "Escalate" },
  { name: "Aditya Verma", code: "MML-C-10444", balance: "₹25,500", overdue: "7 days", last: "3 Sep · WhatsApp", attempt: 2, response: "Promised payment by 8 Sep", next: "Confirm on 8 Sep", kind: "warn", action: "Remind" },
  { name: "Karan Malhotra", code: "MML-C-10462", balance: "₹21,000", overdue: "12 days", last: "1 Sep · phone call", attempt: 2, response: "Unhappy with profile quality", next: "Retention call with RM", kind: "bad", action: "Call" },
  { name: "Rahul Sethi", code: "MML-C-10470", balance: "₹12,500", overdue: "5 days", last: "4 Sep · SMS", attempt: 1, response: "No response yet", next: "Call today evening", kind: "warn", action: "Call" },
  { name: "Ananya Gupta", code: "MML-C-10471", balance: "₹18,000", overdue: "3 days", last: "4 Sep · WhatsApp", attempt: 1, response: "Travelling, will pay on return", next: "Reminder on 9 Sep", kind: "info", action: "Schedule" },
  { name: "Manish Tandon", code: "MML-C-10388", balance: "₹12,000", overdue: "21 days", last: "28 Aug · email", attempt: 3, response: "Disputing an add-on charge", next: "Finance to review invoice", kind: "bad", action: "Escalate" },
];

const TESTIMONIAL_ROWS = [
  { name: "Sanjay Mehta", code: "MML-C-10428", milestone: "Engagement · 24 Aug", format: "Video", requested: "28 Aug 2026", consent: "Signed", status: "Shoot scheduled 6 Sep", kind: "info", usage: "Website + Instagram", action: "Schedule" },
  { name: "Vikram Ahluwalia", code: "MML-C-10396", milestone: "Marriage · 12 Jul", format: "Video", requested: "18 Jul 2026", consent: "Signed", status: "Collected & edited", kind: "ok", usage: "Website + sales deck", action: "View" },
  { name: "Priya Raheja", code: "MML-C-10437", milestone: "Engagement · 2 Aug", format: "Written", requested: "5 Aug 2026", consent: "Signed", status: "Collected", kind: "ok", usage: "Website", action: "View" },
  { name: "Dr. Arjun Nair", code: "MML-C-10419", milestone: "Match confirmed", format: "Written", requested: "1 Sep 2026", consent: "Pending", status: "Awaiting client reply", kind: "warn", usage: "Not decided", action: "Remind" },
  { name: "Ritu Saxena", code: "MML-C-10425", milestone: "Engagement · 30 Aug", format: "Video", requested: "2 Sep 2026", consent: "Pending", status: "Family wants no photos", kind: "warn", usage: "Text only", action: "Call" },
  { name: "Gupta family", code: "MML-C-10471", milestone: "Marriage · 20 Aug", format: "Written", requested: "24 Aug 2026", consent: "Pending", status: "Draft shared for approval", kind: "info", usage: "Instagram", action: "Follow up" },
  { name: "Neelam Bhasin", code: "MML-C-10371", milestone: "Marriage · 5 Jun", format: "Video", requested: "8 Jun 2026", consent: "Signed", status: "Published 20 Jun", kind: "ok", usage: "Website hero", action: "View" },
  { name: "Rohit Anand", code: "MML-C-10355", milestone: "Engagement · 18 May", format: "Written", requested: "20 May 2026", consent: "Declined", status: "Client opted out", kind: "neu", usage: "None", action: "Close" },
];

const REVIEW_ROWS = [
  { name: "Vikram Ahluwalia", code: "MML-C-10396", sent: "18 Jul 2026", channel: "WhatsApp", reminders: "1", posted: "21 Jul 2026", rating: "5 ★", status: "Posted", kind: "ok", action: "View" },
  { name: "Priya Raheja", code: "MML-C-10437", sent: "5 Aug 2026", channel: "WhatsApp", reminders: "0", posted: "6 Aug 2026", rating: "5 ★", status: "Posted", kind: "ok", action: "View" },
  { name: "Neelam Bhasin", code: "MML-C-10371", sent: "8 Jun 2026", channel: "SMS", reminders: "2", posted: "14 Jun 2026", rating: "4 ★", status: "Posted", kind: "ok", action: "View" },
  { name: "Sanjay Mehta", code: "MML-C-10428", sent: "28 Aug 2026", channel: "WhatsApp", reminders: "1", posted: "—", rating: "—", status: "Link opened, not posted", kind: "warn", action: "Remind" },
  { name: "Dr. Arjun Nair", code: "MML-C-10419", sent: "—", channel: "—", reminders: "0", posted: "—", rating: "—", status: "Not sent yet", kind: "neu", action: "Send" },
  { name: "Ananya Gupta", code: "MML-C-10471", sent: "2 Sep 2026", channel: "WhatsApp", reminders: "0", posted: "—", rating: "—", status: "Awaiting response", kind: "info", action: "Remind" },
  { name: "Manish Tandon", code: "MML-C-10388", sent: "12 Aug 2026", channel: "SMS", reminders: "2", posted: "15 Aug 2026", rating: "3 ★", status: "Needs a reply", kind: "bad", action: "Respond" },
  { name: "Rahul Sethi", code: "MML-C-10470", sent: "—", channel: "—", reminders: "0", posted: "—", rating: "—", status: "Not sent yet", kind: "neu", action: "Send" },
];

const CROSS_ROWS = [
  { name: "Dr. Arjun Nair", code: "MML-C-10419", service: "Wedding decor", partner: "Aashirwad Decor", value: "₹4,20,000", commission: "₹33,600", status: "Order confirmed", kind: "ok", next: "Raise commission invoice", action: "Invoice" },
  { name: "Ritu Saxena", code: "MML-C-10425", service: "Photography", partner: "Kalyan Studios", value: "₹1,80,000", commission: "₹14,400", status: "Quote shared", kind: "info", next: "Follow up on 7 Sep", action: "Follow up" },
  { name: "Sanjay Mehta", code: "MML-C-10428", service: "Venue booking", partner: "The Grand Ballroom", value: "₹6,50,000", commission: "₹32,500", status: "Site visit booked", kind: "info", next: "Visit on 9 Sep", action: "Confirm" },
  { name: "Vikram Ahluwalia", code: "MML-C-10396", service: "Jewellery", partner: "Tanvi Jewels", value: "₹12,00,000", commission: "₹60,000", status: "Order confirmed", kind: "ok", next: "Delivery tracking", action: "View" },
  { name: "Priya Raheja", code: "MML-C-10437", service: "Honeymoon package", partner: "Voyage Travels", value: "₹2,40,000", commission: "₹19,200", status: "Interested", kind: "warn", next: "Share 3 itineraries", action: "Send" },
  { name: "Shalini Kapoor", code: "MML-C-10402", service: "Bridal styling", partner: "Studio Noor", value: "₹95,000", commission: "₹9,500", status: "On hold", kind: "neu", next: "Blocked by overdue balance", action: "Open" },
  { name: "Aditya Verma", code: "MML-C-10444", service: "Photography", partner: "Kalyan Studios", value: "₹1,20,000", commission: "₹9,600", status: "Declined", kind: "neu", next: "Family has own photographer", action: "Close" },
  { name: "Gupta family", code: "MML-C-10471", service: "Catering", partner: "Anand Caterers", value: "₹3,10,000", commission: "₹18,600", status: "Quote requested", kind: "info", next: "Partner to send quote", action: "Chase" },
];

const UPSELL_ROWS = [
  { name: "Aditya Verma", code: "MML-C-10444", current: "Premium · 4 mo left", suggested: "Exclusive", value: "+₹49,000", why: "6 profiles shared, none shortlisted", status: "Quote sent", kind: "info", action: "Follow up" },
  { name: "Ritu Saxena", code: "MML-C-10425", current: "Classic · 2 mo left", suggested: "Premium", value: "+₹26,000", why: "Wants contact reveal and horoscope match", status: "Interested", kind: "warn", action: "Quote" },
  { name: "Karan Malhotra", code: "MML-C-10462", current: "Premium · 5 mo left", suggested: "Tenure extension 6 mo", value: "+₹18,000", why: "Search paused twice, needs more runway", status: "Retention first", kind: "neu", action: "Call" },
  { name: "Dr. Arjun Nair", code: "MML-C-10419", current: "Exclusive · 9 mo left", suggested: "Verified Report add-on ×2", value: "+₹16,000", why: "Family asked for background checks", status: "Quote sent", kind: "info", action: "Follow up" },
  { name: "Sanjay Mehta", code: "MML-C-10428", current: "Premium · 7 mo left", suggested: "Cross-branch search add-on", value: "+₹12,000", why: "Open to Mumbai and Pune profiles", status: "Interested", kind: "warn", action: "Quote" },
  { name: "Priya Raheja", code: "MML-C-10437", current: "Classic · 1 mo left", suggested: "Renewal — Classic", value: "+₹22,000", why: "Package expires 30 Sep, search active", status: "Renewal due", kind: "bad", action: "Renew" },
  { name: "Shalini Kapoor", code: "MML-C-10402", current: "Exclusive Privé", suggested: "Family counselling ×2", value: "+₹24,000", why: "Two sessions used, family wants more", status: "On hold", kind: "neu", action: "Open" },
  { name: "Vikram Ahluwalia", code: "MML-C-10396", current: "Signature", suggested: "Post-marriage ecosystem", value: "+₹75,000", why: "Marriage confirmed, wants concierge support", status: "Won", kind: "ok", action: "View" },
];

const TAB_META = {
  overview: ["Post-Sales Desk", "Everything owed after the match is confirmed — balance payments, testimonials, reviews, cross-sell and upsell."],
  payment: ["Payment Collection", "Instalments and balance amounts due after matchmaking begins. Receipts post to Finance automatically."],
  followup: ["Final Payment Follow-up", "Reminder cadence for overdue balances, with escalation to Branch Head after the third attempt."],
  testimonial: ["Testimonial Collection", "Written and video testimonials requested after engagement or marriage confirmation. Consent required before publishing."],
  review: ["Google Reviews", "Review requests sent by WhatsApp and SMS, tracked to the posted review."],
  cross: ["Cross-sell", "Partner services offered to matched clients — photography, decor, venue, jewellery, travel. Commission tracked per deal."],
  upsell: ["Upsell", "Package upgrades, tenure extensions and add-on services for existing clients."],
  referral: ["Referral", "Referrals from matched clients — requests sent, conversions, and follow-up. Full desk content will be added here."],
};

const TAB_ACTIONS = {
  overview: ["Export desk report", "Log post-sales activity"],
  payment: ["Payment plan", "Record payment"],
  followup: ["Escalate to Branch Head", "Send reminder"],
  testimonial: ["Templates", "Request testimonial"],
  review: ["Review link", "Send review request"],
  cross: ["Partner catalogue", "Create cross-sell offer"],
  upsell: ["Upgrade pricing", "Create upgrade quote"],
  referral: ["Referral rules", "Log referral"],
};

function Chip({ label, on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-3 rounded-lg text-[12.5px] font-semibold border transition-colors ${
        on ? "bg-[#7A0A17] text-white border-[#7A0A17]" : "bg-white text-[#4B5563] border-black/10 hover:bg-[#FAFAFB]"
      }`}
    >
      {label}
    </button>
  );
}

function ClientCell({ name, code }) {
  return (
    <Td>
      <p className="font-semibold text-[#111]">{name}</p>
      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{code}</p>
    </Td>
  );
}

function RowAction({ label, onClick }) {
  const solid = ["Record", "Remind", "Escalate", "Call", "Schedule", "Send", "Quote", "Renew", "Invoice", "Confirm", "Chase"].includes(label);
  return (
    <Td className="text-right">
      <button
        type="button"
        onClick={onClick}
        className={`h-8 px-3 rounded-lg text-[12px] font-semibold border transition-colors ${
          solid
            ? "bg-[#7A0A17] text-white border-[#7A0A17] hover:bg-[#640712]"
            : "bg-white text-[#4B5563] border-black/10 hover:bg-[#FAFAFB]"
        }`}
      >
        {label}
      </button>
    </Td>
  );
}

function Playbook({ title, sub, items }) {
  return (
    <Panel title={title} subtitle={sub}>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-black/8 p-4 bg-[#FAFAFB]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-extrabold tracking-wide" style={{ color: item.tagColor }}>
                {item.tag}
              </span>
              <span className="text-[11px] text-[#9CA3AF] font-medium">{item.meta}</span>
            </div>
            <p className="text-[13.5px] font-bold text-[#111] mb-1">{item.title}</p>
            <p className="text-[12.5px] text-[#6B7280] leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function PostSalesPage() {
  const [tab, setTab] = useState("overview");
  const [role, setRole] = useState("exec");
  const [rec, setRec] = useState({});
  const [fu, setFu] = useState({});
  const [lbl, setLbl] = useState({});
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const head = role === "head";
  const [pageTitle, pageSub] = TAB_META[tab];
  const [outlineLabel, primaryLabel] = TAB_ACTIONS[tab];

  const payments = useMemo(
    () =>
      INITIAL_PAYMENTS.map((r) => {
        const o = rec[r.code] || {};
        const collectedNum = o.collected != null ? o.collected : r.collectedNum;
        const balanceNum = o.balance != null ? o.balance : r.balanceNum;
        return {
          ...r,
          collectedNum,
          balanceNum,
          status: o.status || r.status,
          kind: o.kind || r.kind,
        };
      }),
    [rec]
  );

  const openRecord = (cl) => {
    setModal({ kind: "record", cl });
    setForm({ amount: inr(cl.balanceNum), mode: "UPI", date: "4 Sep 2026", ref: "" });
  };

  const openRemind = (cl) => {
    setModal({ kind: "remind", cl });
    setForm({
      channel: "WhatsApp",
      promise: "",
      message: `Dear ${cl.name.split(" ")[0]}, a balance of ${cl.balance} on your ${cl.pkg || "MatchMakers"} package is pending. You can clear it in one tap using the secure payment link below. Do let us know if you would prefer an instalment plan.`,
    });
  };

  const saveRecord = () => {
    const cl = modal?.cl;
    if (!cl) return;
    const amt = Math.min(num(form.amount), cl.balanceNum);
    if (!amt) {
      toast.error("Enter an amount above ₹0 to record a payment.");
      return;
    }
    const balance = cl.balanceNum - amt;
    const collected = cl.collectedNum + amt;
    setRec((prev) => ({
      ...prev,
      [cl.code]: {
        collected,
        balance,
        status: balance === 0 ? "Fully paid" : `Part paid · ${form.date}`,
        kind: balance === 0 ? "ok" : "info",
      },
    }));
    setLbl((prev) => ({ ...prev, [`payment:${cl.code}`]: balance === 0 ? "Receipt" : "Record" }));
    const receipt = `MML-R-${10480 + Math.floor(Math.random() * 90)}`;
    setModal(null);
    toast.success(`${inr(amt)} recorded for ${cl.name} by ${form.mode} · receipt ${receipt} sent, Finance updated.`);
  };

  const sendReminder = () => {
    const cl = modal?.cl;
    if (!cl) return;
    const sent = (fu[cl.code] || 0) + 1;
    const n = Math.min((cl.attempt || 1) + sent, 3);
    setFu((prev) => ({ ...prev, [cl.code]: sent }));
    setLbl((prev) => ({ ...prev, [`${tab}:${cl.code}`]: n >= 3 ? "Escalate" : "Reminded" }));
    setModal(null);
    toast.success(
      `Reminder ${n} of 3 sent to ${cl.name} via ${form.channel}${form.promise ? ` · promise to pay ${form.promise} logged` : ""}${
        n >= 3 ? " · escalation to Branch Head unlocked." : "."
      }`
    );
  };

  const paymentAction = (row) => {
    const label = lbl[`payment:${row.code}`] || row.action;
    const cl = { name: row.name, code: row.code, pkg: row.pkg, collectedNum: row.collectedNum, balanceNum: row.balanceNum, balance: inr(row.balanceNum), attempt: 1 };
    if (label === "Record") return openRecord(cl);
    if (label === "Receipt") return toast.info(`Receipt for ${row.name} downloaded as PDF.`);
    if (label === "Review") return toast.info(`Refund request for ${row.name} opened with Finance.`);
    if (label === "Follow up") {
      setTab("followup");
      return;
    }
    return openRemind(cl);
  };

  const followupAction = (row) => {
    const sent = fu[row.code] || 0;
    const label = lbl[`followup:${row.code}`] || row.action;
    const cl = { name: row.name, code: row.code, pkg: "", balance: row.balance, balanceNum: num(row.balance), collectedNum: 0, attempt: row.attempt + sent };
    if (label === "Escalate") {
      toast.info(`${row.name} escalated to Branch Head · revised instalment plan requested.`);
      return;
    }
    openRemind(cl);
  };

  const genericAction = (name, label) => {
    toast.info(`${label} — ${name}`);
  };

  const kpis = head
    ? [
        { label: "Balance outstanding", value: "₹18.4L", note: "6 clients overdue", noteTone: "red", detail: "Across 14 active payment plans" },
        { label: "Collected this month", value: "₹24.6L", note: "+18% vs last month", noteTone: "green", detail: "Balance and instalment receipts" },
        { label: "Testimonials", value: "21", note: "4 awaiting consent", noteTone: "amber", detail: "12 video · 9 written" },
        { label: "Google reviews", value: "34", note: "4.6 average rating", noteTone: "green", detail: "7 requests sent, not posted" },
        { label: "Cross-sell & upsell", value: "₹9.8L", note: "₹68,400 commission", noteTone: "green", detail: "19 offers open this quarter" },
        { label: "Referral", value: "17", note: "9 converted to deals", noteTone: "green", detail: "From matched clients" },
      ]
    : [
        { label: "Balance outstanding", value: "₹6.2L", note: "6 clients overdue", noteTone: "red", detail: "Across 14 active payment plans" },
        { label: "Collected this month", value: "₹8.1L", note: "+18% vs last month", noteTone: "green", detail: "Balance and instalment receipts" },
        { label: "Testimonials", value: "9", note: "4 awaiting consent", noteTone: "amber", detail: "12 video · 9 written" },
        { label: "Google reviews", value: "11", note: "4.6 average rating", noteTone: "green", detail: "7 requests sent, not posted" },
        { label: "Cross-sell & upsell", value: "₹3.4L", note: "₹68,400 commission", noteTone: "green", detail: "19 offers open this quarter" },
        { label: "Referral", value: "6", note: "3 converted to deals", noteTone: "green", detail: "From matched clients" },
      ];

  const tasks = [
    { time: "10:00", kind: "PAYMENT", tone: "red", title: "Dr. Arjun Nair — collect balance ₹40,000", sub: "Exclusive · due 2 Sep · UPI link opened twice", value: "₹40,000", cta: "Record", go: "payment" },
    { time: "11:30", kind: "FOLLOW-UP", tone: "amber", title: "Shalini Kapoor — reminder attempt 3", sub: "₹1,25,000 pending 34 days · escalation available", value: "₹1,25,000", cta: "Call", go: "followup" },
    { time: "01:00", kind: "TESTIMONIAL", tone: "blue", title: "Mehta family — record video testimonial", sub: "Engagement confirmed 24 Aug · consent signed", value: "—", cta: "Schedule", go: "testimonial" },
    { time: "03:00", kind: "CROSS-SELL", tone: "green", title: "Ritu Saxena — share photography partner quote", sub: "Kalyan Studios · ₹1,80,000 · 8% commission", value: "₹14,400", cta: "Send", go: "cross" },
    { time: "04:30", kind: "UPSELL", tone: "amber", title: "Aditya Verma — Premium to Exclusive upgrade", sub: "6 profiles shared, none shortlisted · senior RM pitch", value: "₹49,000", cta: "Quote", go: "upsell" },
    { time: "05:15", kind: "REVIEW", tone: "gray", title: "Send Google review request to 3 clients", sub: "Nair, Gupta, Sethi · WhatsApp template R2", value: "—", cta: "Send", go: "review" },
  ];

  const completion = [
    ["Dr. Arjun Nair", "MML-C-10419", [1, 1, 1, 1, 0, 1], "83%"],
    ["Shalini Kapoor", "MML-C-10402", [0, 0, 0, 1, 1, 0], "33%"],
    ["Sanjay Mehta", "MML-C-10428", [1, 1, 0, 1, 0, 1], "67%"],
    ["Ritu Saxena", "MML-C-10425", [1, 0, 1, 0, 0, 1], "50%"],
    ["Vikram Ahluwalia", "MML-C-10396", [1, 1, 1, 1, 1, 1], "100%"],
  ];

  const collectDone = head ? "₹24.6L" : "₹8.1L";
  const collectGoal = head ? "₹36L" : "₹12L";
  const collectPct = head ? 68 : 67;

  const banners = {
    overview: { k: "info", strong: head ? "38 open post-sales tasks in the branch." : "14 open post-sales tasks assigned to you.", text: "Tasks are created automatically when a deal reaches P6 Handover.", cta: "How this works" },
    payment: { k: "bad", strong: "₹2.14L overdue across 6 clients.", text: "Matchmaking access pauses automatically when a balance crosses 30 days overdue.", cta: "View overdue" },
    followup: { k: "warn", strong: "Attempt 3 reached for 2 clients.", text: head ? "Both are waiting on your approval to offer a revised instalment plan." : "Escalation to Branch Head is now available for these two.", cta: "Escalate" },
    testimonial: { k: "info", strong: "4 testimonials are awaiting consent.", text: "Written consent must be recorded before a testimonial can be used in campaigns.", cta: "Collect consent" },
    review: { k: "gold", strong: "Google rating is 4.6 from 218 reviews.", text: "7 clients matched last month have not been sent a review request yet.", cta: "Send batch" },
    cross: { k: "ok", strong: "₹68,400 commission earned this quarter.", text: "Partner offers only go out after the client confirms the match is progressing.", cta: "See rules" },
    upsell: { k: "warn", strong: "3 packages expire within 30 days.", text: "Renewal or tenure extension quotes should reach the client before expiry.", cta: "View expiring" },
    referral: { k: "info", strong: head ? "17 referrals received in the branch." : "6 referrals received from matched clients.", text: "Ask after engagement or marriage confirmation. Conversion is tracked against the referring client.", cta: "Open referral desk" },
  };

  const tablePack = {
    payment: {
      stats: [
        { label: "Total contracted", value: head ? "₹64.2L" : "₹21.4L", note: "14 active plans" },
        { label: "Collected", value: head ? "₹45.8L" : "₹15.2L", note: "71% of contracted" },
        { label: "Balance due", value: head ? "₹18.4L" : "₹6.2L", note: "Next 30 days: ₹9.1L" },
        { label: "Overdue", value: "₹2.14L", note: "6 clients past due date" },
      ],
      title: "Payment schedule",
      sub: "Instalments after booking amount",
      count: "14 payment plans",
      footer: head ? "Showing 8 of 38 plans" : "Showing 8 of 14 plans",
      playbook: {
        title: "Collection rules",
        sub: "Applied automatically",
        items: [
          { tag: "PAYMENT MODES", tagColor: "#3b6fd4", meta: "Finance owned", title: "UPI, card, NEFT, cheque, cash", body: "Cash above ₹20,000 needs Branch Head counter-signature. Receipt is generated the moment the payment is recorded." },
          { tag: "ACCESS HOLD", tagColor: "#E8395B", meta: "30 days", title: "Matchmaking pauses on overdue", body: "Profile sharing stops when a balance crosses 30 days. Only the Branch Head can lift the hold." },
          { tag: "INCENTIVE", tagColor: "#8a6110", meta: "1.5%", title: "Paid on collection, not on booking", body: "Executive incentive is released after the balance is realised, so collection stays with the person who closed the deal." },
        ],
      },
    },
    followup: {
      stats: [
        { label: "Overdue balance", value: "₹2.14L", note: "6 clients" },
        { label: "Reminders sent", value: "23", note: "Last 7 days" },
        { label: "Promise to pay", value: "4", note: "Dates committed by client" },
        { label: "Escalated", value: "2", note: "With Branch Head" },
      ],
      title: "Follow-up queue",
      sub: "Sorted by days overdue",
      count: "6 clients in follow-up",
      footer: "Showing 6 of 6 clients",
      playbook: {
        title: "Reminder cadence",
        sub: "Three attempts, then escalation",
        items: [
          { tag: "ATTEMPT 1", tagColor: "#3b6fd4", meta: "Day 3", title: "WhatsApp with payment link", body: "Polite reminder with the outstanding amount, due date and a one-tap UPI link. Logged against the client record." },
          { tag: "ATTEMPT 2", tagColor: "#a8760f", meta: "Day 10", title: "Phone call by the executive", body: "Call outcome and any promise-to-pay date must be logged. A committed date creates a task automatically." },
          { tag: "ATTEMPT 3", tagColor: "#E8395B", meta: "Day 20", title: "Branch Head escalation", body: "Branch Head decides between a revised instalment plan, an access hold, or moving the case to Finance recovery." },
        ],
      },
    },
    testimonial: {
      stats: [
        { label: "Requests sent", value: head ? "26" : "11", note: "Since 1 Aug" },
        { label: "Collected", value: head ? "21" : "9", note: "12 video · 9 written" },
        { label: "Consent recorded", value: head ? "17" : "5", note: "4 pending signature" },
        { label: "Published", value: head ? "13" : "4", note: "Website, Instagram, decks" },
      ],
      title: "Testimonial pipeline",
      sub: "Requested after engagement or marriage",
      count: "9 in progress",
      footer: "Showing 8 of 9 testimonials",
      playbook: {
        title: "When to ask",
        sub: "Timing decides the answer",
        items: [
          { tag: "TRIGGER", tagColor: "#3b6fd4", meta: "Automatic", title: "Engagement or marriage confirmed", body: "A testimonial task is created for the executive within 48 hours of the milestone being marked in the client record." },
          { tag: "CONSENT", tagColor: "#E8395B", meta: "Mandatory", title: "Written consent before any use", body: "Consent captures the channels allowed — website, social, sales decks — and whether names and photographs can be shown." },
          { tag: "FORMAT", tagColor: "#8a6110", meta: "Preference", title: "Video first, written as fallback", body: "A 60-90 second video shot at the venue converts best. Written testimonials are collected when the family declines filming." },
        ],
      },
    },
    review: {
      stats: [
        { label: "Google rating", value: "4.6", note: "218 reviews · South Ex branch" },
        { label: "Requests sent", value: head ? "31" : "13", note: "Since 1 Aug" },
        { label: "Reviews posted", value: head ? "19" : "7", note: "61% conversion" },
        { label: "Below 4 stars", value: "2", note: "Response drafted by Branch Head" },
      ],
      title: "Review requests",
      sub: "WhatsApp and SMS with a direct Google link",
      count: "13 requests",
      footer: "Showing 8 of 13 requests",
      playbook: {
        title: "Review discipline",
        sub: "Ask once, ask well",
        items: [
          { tag: "TIMING", tagColor: "#3b6fd4", meta: "Day 2", title: "Right after a happy moment", body: "Requests go out within two days of engagement, marriage, or a testimonial being recorded, while the sentiment is fresh." },
          { tag: "LIMIT", tagColor: "#8a6110", meta: "Max 2", title: "Two reminders, then stop", body: "No more than two reminders per client. Further nudging is blocked by the system to protect the relationship." },
          { tag: "LOW RATING", tagColor: "#E8395B", meta: "Escalate", title: "Under 4 stars goes to Branch Head", body: "The executive cannot reply publicly. The Branch Head drafts the response and opens a service ticket." },
        ],
      },
    },
    cross: {
      stats: [
        { label: "Offers open", value: head ? "27" : "11", note: "Across 6 partners" },
        { label: "Order value booked", value: head ? "₹9.8L" : "₹3.4L", note: "This quarter" },
        { label: "Commission earned", value: "₹68,400", note: "Average 8.5%" },
        { label: "Conversion", value: "34%", note: "Offers to confirmed orders" },
      ],
      title: "Cross-sell offers",
      sub: "Partner services for matched clients",
      count: "11 open offers",
      footer: "Showing 8 of 11 offers",
      playbook: {
        title: "Cross-sell guardrails",
        sub: "Service first, selling second",
        items: [
          { tag: "ELIGIBILITY", tagColor: "#3b6fd4", meta: "Automatic", title: "Only after the match progresses", body: "Partner offers unlock when the client confirms a shortlist or engagement. Nothing goes out while matchmaking is still early." },
          { tag: "HOLD", tagColor: "#E8395B", meta: "Blocked", title: "No offers on overdue accounts", body: "Clients with a balance past due date are excluded until the payment is settled." },
          { tag: "COMMISSION", tagColor: "#8a6110", meta: "5-8%", title: "Recorded against the executive", body: "Commission is booked when the partner confirms the order and is paid out with the next incentive cycle." },
        ],
      },
    },
    upsell: {
      stats: [
        { label: "Upgrade opportunities", value: head ? "19" : "8", note: "Flagged by the system" },
        { label: "Quotes sent", value: head ? "11" : "5", note: "This month" },
        { label: "Upgrade revenue", value: head ? "₹6.4L" : "₹2.1L", note: "Realised this quarter" },
        { label: "Expiring in 30 days", value: head ? "7" : "3", note: "Renewal window open" },
      ],
      title: "Upsell opportunities",
      sub: "Upgrades, tenure extensions and add-ons",
      count: "8 opportunities",
      footer: "Showing 8 of 8 opportunities",
      playbook: {
        title: "Upsell triggers",
        sub: "System flags, executive judges",
        items: [
          { tag: "LOW TRACTION", tagColor: "#3b6fd4", meta: "Auto flag", title: "No shortlist after 6 profiles", body: "A client seeing profiles without shortlisting usually needs a senior RM or a wider search, not more of the same." },
          { tag: "EXPIRY", tagColor: "#8a6110", meta: "Day 30", title: "Renewal window before expiry", body: "A renewal or extension quote goes out 30 days before the package ends, while the search is still active." },
          { tag: "RESTRAINT", tagColor: "#E8395B", meta: "Rule", title: "No upsell to unhappy clients", body: "Clients with an open complaint or a refund request are excluded until the service issue is closed." },
        ],
      },
    },
  };

  const pack = tablePack[tab];
  const banner = banners[tab];
  const attemptNext = modal ? Math.min((modal.cl.attempt || 1) + (fu[modal.cl.code] || 0) + 1, 3) : 1;

  const onPrimary = () => {
    if (tab === "payment") {
      const due = payments.find((p) => p.balanceNum > 0);
      if (due) openRecord(due);
      else toast.info("No open balances to record.");
      return;
    }
    if (tab === "followup") {
      const row = FOLLOWUP_ROWS[1];
      followupAction(row);
      return;
    }
    toast.success(`${primaryLabel} opened.`);
  };

  return (
    <AppPage
      title={pageTitle}
      actions={
        <>
          <NativeSelect
            value={role}
            onChange={setRole}
            options={[
              { value: "exec", label: "Sales Executive" },
              { value: "head", label: "Branch Head" },
            ]}
          />
          <OutlineBtn onClick={() => toast.info(`${outlineLabel}…`)}>{outlineLabel}</OutlineBtn>
          <PrimaryBtn onClick={onPrimary}>{primaryLabel}</PrimaryBtn>
        </>
      }
    >
      <p className="-mt-2 text-[13.5px] text-[#6B7280] max-w-3xl">{pageSub}</p>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((t) => {
          const on = tab === t.k;
          return (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k)}
              className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                on ? "bg-[#7A0A17] text-white" : "bg-white text-[#4B5563] border border-black/8 hover:bg-[#FAFAFB]"
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${on ? "bg-white/20 text-white" : "bg-[#F1F2F4] text-[#6B7280]"}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className={`rounded-2xl border px-4 py-3 text-[13.5px] ${BANNER_CLASS[banner.k]}`}>
        <span className="font-bold">{banner.strong}</span>{" "}
        <span className="opacity-90">{banner.text}</span>{" "}
        <button
          type="button"
          className="font-bold underline underline-offset-2"
          onClick={() => {
            if (banner.cta === "Open referral desk") setTab("referral");
            else toast.info(banner.cta);
          }}
        >
          {banner.cta}
        </button>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {kpis.map((k) => (
              <MetricCard
                key={k.label}
                compact
                label={k.label}
                value={k.value}
                note={k.note}
                noteTone={k.noteTone}
                detail={k.detail}
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 min-w-0">
            <Panel
              title="Today’s post-sales tasks"
              subtitle={head ? "11 tasks across 4 executives" : "6 tasks · Rohit Khanna"}
            >
              <div className="flex flex-col divide-y divide-black/6 -mx-1">
                {tasks.map((task) => (
                  <div key={task.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="text-[11px] font-bold text-[#9CA3AF] w-12 shrink-0 pt-0.5">{task.time}</span>
                    <div className="min-w-0 flex-1">
                      <StatusPill tone={task.tone}>{task.kind}</StatusPill>
                      <p className="text-[13.5px] font-semibold text-[#111] mt-1">{task.title}</p>
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5">{task.sub}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold text-[#111] mb-1.5">{task.value}</p>
                      <button
                        type="button"
                        onClick={() => setTab(task.go)}
                        className="h-8 px-3 rounded-lg text-[12px] font-semibold bg-[#7A0A17] text-white hover:bg-[#640712]"
                      >
                        {task.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Panel title="Collection target — September" subtitle={head ? "Branch collection" : "My collection"}>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-[22px] font-bold text-[#111]">
                    {collectDone} <span className="text-[13px] font-medium text-[#9CA3AF]">of {collectGoal}</span>
                  </p>
                  <p className="text-[13px] font-bold text-[#16A34A]">{collectPct}%</p>
                </div>
                <div className="h-2.5 rounded-full bg-[#F1F2F4] overflow-hidden">
                  <div className="h-full rounded-full bg-[#7A0A17]" style={{ width: `${collectPct}%` }} />
                </div>
                <p className="text-[12px] text-[#6B7280] mt-3 leading-relaxed">
                  {head
                    ? "Incentive unlocks at 85%. ₹11.4L still to collect with 26 days left."
                    : "Post-sales incentive is 1.5% of collected balance. ₹3.9L left this month."}
                </p>
              </Panel>
              <Panel title="Escalations" subtitle="Needs a decision">
                <div className="flex flex-col gap-3">
                  {[
                    { dot: "#E8395B", title: "Shalini Kapoor — 34 days overdue", body: "₹1,25,000 of ₹5,00,000 pending. Client asked to split into two instalments." },
                    { dot: "#a8760f", title: "Karan Malhotra — refund request", body: "Requested partial refund after 3 months with no shortlist. Retention call pending." },
                    { dot: "#3b6fd4", title: "Gupta family — testimonial consent", body: "Family agreed to a written testimonial but not to photographs being used." },
                    { dot: "#16A34A", title: "Nair wedding — decor partner", body: "₹4,20,000 decor order confirmed. Commission invoice to be raised to partner." },
                  ].map((e) => (
                    <div key={e.title} className="flex gap-3">
                      <span className="mt-1.5 size-2 rounded-full shrink-0" style={{ background: e.dot }} />
                      <div>
                        <p className="text-[13px] font-semibold text-[#111]">{e.title}</p>
                        <p className="text-[12px] text-[#6B7280] mt-0.5 leading-relaxed">{e.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          <Panel title="Post-sales completion" subtitle="Payment · Testimonial · Review · Cross-sell · Upsell · Feedback">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-black/8">
                    <Th>Client</Th>
                    {COMPLETION_STEPS.map((s) => (
                      <Th key={s}>{s}</Th>
                    ))}
                    <Th>Done</Th>
                  </tr>
                </thead>
                <tbody>
                  {completion.map(([name, code, steps, pct]) => (
                    <tr key={code} className="border-b border-black/6 last:border-0">
                      <ClientCell name={name} code={code} />
                      {steps.map((done, i) => (
                        <Td key={COMPLETION_STEPS[i]}>
                          <div className="h-1.5 w-16 rounded-full" style={{ background: done ? "#16A34A" : "#F1F2F4" }} />
                        </Td>
                      ))}
                      <Td strong>{pct}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Advocacy" subtitle="Referrals and feedback from matched clients">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                ["Referrals received from matched clients", head ? "17" : "6"],
                ["Referrals converted to deals", head ? "9" : "3"],
                ["Average rating in collected feedback", "4.7 / 5"],
                ["Clients who declined to be contacted", head ? "5" : "2"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-black/8 p-4">
                  <p className="text-[12px] text-[#6B7280] font-medium">{label}</p>
                  <p className="text-[22px] font-bold text-[#111] mt-1">{value}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      {tab === "referral" && (
        <Panel title="Referral desk" subtitle="Content for this tab will be added next">
          <p className="text-[13.5px] text-[#6B7280] leading-relaxed">
            This is a placeholder. Referral requests, conversions, and follow-up will show here once the page content is provided.
          </p>
        </Panel>
      )}

      {tab !== "overview" && pack && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {pack.stats.map((s) => (
              <MetricCard key={s.label} label={s.label} value={s.value} note={s.note} />
            ))}
          </div>

          <Panel
            title={pack.title}
            subtitle={pack.sub}
            action={<span className="text-[12px] font-semibold text-[#9CA3AF]">{pack.count}</span>}
            footnote={pack.footer}
          >
            <div className="overflow-x-auto -mx-5">
              {tab === "payment" && (
                <table className="w-full min-w-[960px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Client</Th>
                      <Th>Package</Th>
                      <Th>Contract value</Th>
                      <Th>Collected</Th>
                      <Th>Balance</Th>
                      <Th>Due date</Th>
                      <Th>Status</Th>
                      <Th>Owner</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((r) => (
                      <tr key={r.code} className="border-b border-black/6 last:border-0">
                        <ClientCell name={r.name} code={r.code} />
                        <Td>{r.pkg}</Td>
                        <Td strong>{r.contract}</Td>
                        <Td>{inr(r.collectedNum)}</Td>
                        <Td strong>{inr(r.balanceNum)}</Td>
                        <Td>{r.due}</Td>
                        <Td>
                          <StatusPill tone={KIND_TO_TONE[r.kind]}>{r.status}</StatusPill>
                        </Td>
                        <Td muted>{head ? r.owner : "Me"}</Td>
                        <RowAction label={lbl[`payment:${r.code}`] || r.action} onClick={() => paymentAction(r)} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "followup" && (
                <table className="w-full min-w-[1040px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Client</Th>
                      <Th>Balance</Th>
                      <Th>Overdue</Th>
                      <Th>Last contact</Th>
                      <Th>Attempt</Th>
                      <Th>Client response</Th>
                      <Th>Next step</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {FOLLOWUP_ROWS.map((r) => {
                      const sent = fu[r.code] || 0;
                      const attempt = Math.min(r.attempt + sent, 3);
                      return (
                        <tr key={r.code} className="border-b border-black/6 last:border-0">
                          <ClientCell name={r.name} code={r.code} />
                          <Td strong>{r.balance}</Td>
                          <Td>
                            <StatusPill tone={KIND_TO_TONE[r.kind]}>{r.overdue}</StatusPill>
                          </Td>
                          <Td>{sent ? `4 Sep · ${form.channel || "WhatsApp"}` : r.last}</Td>
                          <Td>{attempt} of 3</Td>
                          <Td>{r.response}</Td>
                          <Td>{r.next}</Td>
                          <RowAction label={lbl[`followup:${r.code}`] || r.action} onClick={() => followupAction(r)} />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {tab === "testimonial" && (
                <table className="w-full min-w-[1040px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Client</Th>
                      <Th>Milestone</Th>
                      <Th>Format</Th>
                      <Th>Requested</Th>
                      <Th>Consent</Th>
                      <Th>Status</Th>
                      <Th>Usage</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {TESTIMONIAL_ROWS.map((r) => (
                      <tr key={r.code} className="border-b border-black/6 last:border-0">
                        <ClientCell name={r.name} code={r.code} />
                        <Td>{r.milestone}</Td>
                        <Td>{r.format}</Td>
                        <Td>{r.requested}</Td>
                        <Td>{r.consent}</Td>
                        <Td>
                          <StatusPill tone={KIND_TO_TONE[r.kind]}>{r.status}</StatusPill>
                        </Td>
                        <Td>{r.usage}</Td>
                        <RowAction label={r.action} onClick={() => genericAction(r.name, r.action)} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "review" && (
                <table className="w-full min-w-[960px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Client</Th>
                      <Th>Sent on</Th>
                      <Th>Channel</Th>
                      <Th>Reminders</Th>
                      <Th>Posted</Th>
                      <Th>Rating</Th>
                      <Th>Status</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {REVIEW_ROWS.map((r) => (
                      <tr key={r.code} className="border-b border-black/6 last:border-0">
                        <ClientCell name={r.name} code={r.code} />
                        <Td>{r.sent}</Td>
                        <Td>{r.channel}</Td>
                        <Td>{r.reminders}</Td>
                        <Td>{r.posted}</Td>
                        <Td strong>{r.rating}</Td>
                        <Td>
                          <StatusPill tone={KIND_TO_TONE[r.kind]}>{r.status}</StatusPill>
                        </Td>
                        <RowAction label={r.action} onClick={() => genericAction(r.name, r.action)} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "cross" && (
                <table className="w-full min-w-[1040px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Client</Th>
                      <Th>Service</Th>
                      <Th>Partner</Th>
                      <Th>Order value</Th>
                      <Th>Commission</Th>
                      <Th>Status</Th>
                      <Th>Next step</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {CROSS_ROWS.map((r) => (
                      <tr key={r.code} className="border-b border-black/6 last:border-0">
                        <ClientCell name={r.name} code={r.code} />
                        <Td>{r.service}</Td>
                        <Td>{r.partner}</Td>
                        <Td strong>{r.value}</Td>
                        <Td>
                          <span className="font-semibold text-[#16A34A]">{r.commission}</span>
                        </Td>
                        <Td>
                          <StatusPill tone={KIND_TO_TONE[r.kind]}>{r.status}</StatusPill>
                        </Td>
                        <Td>{r.next}</Td>
                        <RowAction label={r.action} onClick={() => genericAction(r.name, r.action)} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "upsell" && (
                <table className="w-full min-w-[960px] border-collapse">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Client</Th>
                      <Th>Current</Th>
                      <Th>Suggested</Th>
                      <Th>Upgrade value</Th>
                      <Th>Why now</Th>
                      <Th>Status</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {UPSELL_ROWS.map((r) => (
                      <tr key={r.code} className="border-b border-black/6 last:border-0">
                        <ClientCell name={r.name} code={r.code} />
                        <Td>{r.current}</Td>
                        <Td strong>{r.suggested}</Td>
                        <Td strong>{r.value}</Td>
                        <Td>{r.why}</Td>
                        <Td>
                          <StatusPill tone={KIND_TO_TONE[r.kind]}>{r.status}</StatusPill>
                        </Td>
                        <RowAction label={r.action} onClick={() => genericAction(r.name, r.action)} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>

          <Playbook title={pack.playbook.title} sub={pack.playbook.sub} items={pack.playbook.items} />
        </>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.kind === "record" ? "Record payment" : "Send payment reminder"}
        subtitle={
          modal?.kind === "record"
            ? "Posts a receipt to Finance and updates the balance immediately."
            : `Logged as attempt ${attemptNext} of 3 against the client record.`
        }
        footer={
          <>
            <OutlineBtn onClick={() => setModal(null)}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={modal?.kind === "record" ? saveRecord : sendReminder}>
              {modal?.kind === "record" ? "Record payment" : "Send reminder"}
            </PrimaryBtn>
          </>
        }
      >
        {modal && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-xl bg-[#FAFAFB] border border-black/8 px-4 py-3">
              <div>
                <p className="text-[14px] font-bold text-[#111]">{modal.cl.name}</p>
                <p className="text-[12px] text-[#9CA3AF]">{modal.cl.code}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                  {modal.kind === "record" ? "Balance due" : "Outstanding"}
                </p>
                <p className="text-[16px] font-bold text-[#111]">{modal.cl.balance}</p>
              </div>
            </div>

            {modal.kind === "record" ? (
              <>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#6B7280]">Amount</span>
                  <input
                    value={form.amount || ""}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
                  />
                </label>
                <div>
                  <p className="text-[12px] font-semibold text-[#6B7280] mb-2">Mode</p>
                  <div className="flex flex-wrap gap-2">
                    {MODES.map((m) => (
                      <Chip key={m} label={m} on={form.mode === m} onClick={() => setForm((f) => ({ ...f, mode: m }))} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#6B7280]">Date</span>
                    <input
                      value={form.date || ""}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-[13px] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-semibold text-[#6B7280]">Reference</span>
                    <input
                      value={form.ref || ""}
                      onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))}
                      placeholder="Optional"
                      className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-[13px] outline-none"
                    />
                  </label>
                </div>
                <p className="text-[12px] text-[#9CA3AF]">Cash above ₹20,000 needs Branch Head sign-off.</p>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[12px] font-semibold text-[#6B7280] mb-2">Channel</p>
                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((c) => (
                      <Chip key={c} label={c} on={form.channel === c} onClick={() => setForm((f) => ({ ...f, channel: c }))} />
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#6B7280]">Promise to pay</span>
                  <input
                    value={form.promise || ""}
                    onChange={(e) => setForm((f) => ({ ...f, promise: e.target.value }))}
                    placeholder="Optional date"
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-[13px] outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#6B7280]">Message</span>
                  <textarea
                    value={form.message || ""}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    rows={5}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-black/10 text-[13px] outline-none resize-y"
                  />
                </label>
                <p className="text-[12px] text-[#9CA3AF]">
                  {attemptNext >= 3 ? "Attempt 3 unlocks Branch Head escalation." : "Two more attempts before escalation."}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>
    </AppPage>
  );
}
