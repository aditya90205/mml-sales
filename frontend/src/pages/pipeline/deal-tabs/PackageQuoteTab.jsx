import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, MessageSquare, Package, Trash2, TrendingUp, X } from "lucide-react";
import { toast } from "react-toastify";
import ChecklistCheck from "../../../components/common/ChecklistCheck";
import { SortableTh, useTableSort } from "../../../components/common/useTableSort.jsx";
import TableCard from "../../../components/common/TableCard";
import StatusPill from "../../../components/common/StatusPill";
import SendLinkModal from "../../../components/common/SendLinkModal";
import SendMessageModal from "../../../components/common/SendMessageModal";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";
import { addCustomAddon, getAddonCatalog, useAddonCatalog } from "../../../utils/addonCatalog";
import { clientShareId } from "../../../utils/shareLinks";
import { markPaymentLinkSent, paymentVerifyKey } from "../../../utils/paymentVerifyStore";
import { atLeast, dashRows, EMPTY } from "./stageContent.jsx";

export const PACKAGES = [
  {
    key: "basic",
    name: "Basic",
    price: "₹25,000",
    months: 6,
    subtitle: "6 months · junior RM",
    features: [
      { label: "Profile creation & curation", included: true },
      { label: "Up to 10 profiles / month", included: true },
      { label: "Photo + basic details reveal", included: true },
      { label: "Verified Report", included: false },
      { label: "Horoscope matching on request", included: false },
      { label: "Dedicated senior RM", included: false },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "₹51,000",
    months: 12,
    subtitle: "12 months, senior RM only",
    features: [
      { label: "Everything in Classic", included: true },
      { label: "Unlimited profiles", included: true },
      { label: "Contact reveal after RM approval", included: true },
      { label: "Verified Report included", included: true },
      { label: "Horoscope matching on request", included: true },
      { label: "Dedicated senior RM", included: false },
    ],
  },
  {
    key: "exclusive",
    name: "Exclusive",
    price: "₹1,25,000",
    months: 12,
    subtitle: "12 months, senior RM only",
    upsellBadge: "+74,000",
    features: [
      { label: "Everything in Premium", included: true },
      { label: "Senior RM + Branch Head oversight", included: true },
      { label: "Full progressive reveal incl. address", included: true },
      { label: "Privacy mode — restricted staff", included: true },
      { label: "Priority matchmaking queue", included: true },
      { label: "Founder-approved special access", included: true },
    ],
  },
];

const INITIAL_APPROVALS = [
  { raised: "28 July", requested: "₹51,000", discount: "14.7%", approver: "Pooja Sharma", level: "Branch Head", status: "Pending" },
  { raised: "v2",      requested: "₹48,000", discount: "5.9%",  approver: "Vinay Gupta",  level: "Team Lead",   status: "Approved" },
];

const APPROVAL_STATUS_TONES = { Pending: "amber", Approved: "green" };

const APPROVAL_COLUMNS = [
  { label: "Raised", key: "raised", width: "14%" },
  { label: "Requested", key: "requested", width: "17%" },
  { label: "Discount", key: "discount", width: "13%" },
  { label: "Approver", key: "approver", width: "24%" },
  { label: "Status", key: "status", width: "32%" },
];

const SALESPERSON_DISCOUNT_CAP = 5;
const WALLET_CREDITS = 1000;
const GST_RATE = 0.18;

function parseMoney(value) {
  const n = Number(String(value ?? "").replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function packagePrice(pkg) {
  return parseMoney(pkg?.price);
}

function buildBaseQuoteItem(pkg) {
  const price = packagePrice(pkg);
  return {
    id: "base-package",
    item: `${pkg.name} Package`,
    note: pkg.subtitle || "Membership",
    type: "Base",
    qty: 1,
    quoted: price,
    rate: price,
  };
}

export function quoteAddonLine(addon, pkg) {
  const included = Array.isArray(addon?.includedIn) && addon.includedIn.includes(pkg?.key);
  const price = included ? 0 : Number(addon?.price) || 0;
  let note = addon?.note || "Added to this quote";
  if (included) note = `Included in ${pkg?.name || "package"} – no charge`;
  else if (addon?.id === "verified") note = "Not included in this package";
  return {
    id: addon.id,
    item: addon.name,
    note,
    type: "Add-on",
    qty: 1,
    quoted: price,
    rate: price,
  };
}

function buildQuoteItemsForPackage(pkg, existingItems = [], { seedDefaults = false } = {}) {
  const catalog = getAddonCatalog();
  const byId = new Map(catalog.map((addon) => [addon.id, addon]));
  const addons = existingItems
    .filter((item) => item.type === "Add-on")
    .map((item) => {
      const addon = byId.get(item.id);
      if (!addon) {
        const rate = Number(item.rate) || 0;
        return { ...item, quoted: rate, rate };
      }
      return quoteAddonLine(addon, pkg);
    });

  if (seedDefaults) {
    catalog
      .filter((addon) => addon.defaultOnQuote)
      .forEach((addon) => {
        if (!addons.some((item) => item.id === addon.id)) addons.push(quoteAddonLine(addon, pkg));
      });
  }

  return [buildBaseQuoteItem(pkg), ...addons];
}

const DEFAULT_PACKAGE = PACKAGES.find((pkg) => pkg.key === "premium") || PACKAGES[0];
const DEFAULT_QUOTE_ITEMS = buildQuoteItemsForPackage(DEFAULT_PACKAGE, [], { seedDefaults: true });

let quoteSnapshot = {
  items: DEFAULT_QUOTE_ITEMS,
  discountPercent: 0,
  packageKey: DEFAULT_PACKAGE.key,
};
const quoteListeners = new Set();

function emitQuote() {
  quoteListeners.forEach((listener) => listener());
}

function subscribeQuote(listener) {
  quoteListeners.add(listener);
  return () => quoteListeners.delete(listener);
}

function getQuoteSnapshot() {
  return quoteSnapshot;
}

export function useQuote() {
  return useSyncExternalStore(subscribeQuote, getQuoteSnapshot, getQuoteSnapshot);
}

function formatInr(amount) {
  return `₹${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;
}

function formatDeduction(amount) {
  return `-${formatInr(amount)}`;
}

function quoteTotals(items, discountPercent) {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.rate) || 0) * (Number(item.qty) || 1), 0);
  const discount = Math.round((subtotal * (Number(discountPercent) || 0)) / 100);
  const afterDiscount = Math.max(subtotal - discount, 0);
  const wallet = Math.min(WALLET_CREDITS, afterDiscount);
  const taxable = afterDiscount - wallet;
  const gst = Math.round(taxable * GST_RATE);
  return { subtotal, discount, wallet, gst, total: taxable + gst };
}

function applyPackageToQuote(pkg) {
  if (!pkg) return;
  if (quoteSnapshot.packageKey === pkg.key) {
    const base = quoteSnapshot.items.find((item) => item.type === "Base");
    if (base && base.item === `${pkg.name} Package` && Number(base.rate) === packagePrice(pkg)) return;
  }
  quoteSnapshot = {
    ...quoteSnapshot,
    packageKey: pkg.key,
    items: buildQuoteItemsForPackage(pkg, quoteSnapshot.items),
  };
  emitQuote();
}

function addQuoteItem(item) {
  quoteSnapshot = { ...quoteSnapshot, items: [...quoteSnapshot.items, item] };
  emitQuote();
}

export function addCatalogAddonToQuote(addon, amount) {
  if (!addon?.id) return;
  if (quoteSnapshot.items.some((item) => item.id === addon.id && item.type === "Add-on")) return;
  const pkg = PACKAGES.find((item) => item.key === quoteSnapshot.packageKey) || DEFAULT_PACKAGE;
  const line = quoteAddonLine(addon, pkg);
  const included = Array.isArray(addon.includedIn) && addon.includedIn.includes(pkg.key);
  const price = Number(amount);
  if (!included && Number.isFinite(price) && price >= 0) {
    line.quoted = price;
    line.rate = price;
  }
  addQuoteItem(line);
}

export function removeQuoteAddon(id) {
  quoteSnapshot = {
    ...quoteSnapshot,
    items: quoteSnapshot.items.filter((item) => !(item.id === id && item.type === "Add-on")),
  };
  emitQuote();
}

function setQuoteDiscount(percent) {
  quoteSnapshot = { ...quoteSnapshot, discountPercent: percent };
  emitQuote();
}

const DATA_REVEAL_LEVELS = [
  { label: "Level 1 — Photo", note: "All packages · on shortlist", done: true },
  { label: "Level 2 — Basic details", note: "All packages · age, height, education", done: true },
  { label: "Level 3 — Contact", note: "Premium & Exclusive · RM approval required", done: true },
  { label: "Level 4 — Address", note: "Exclusive only · Branch Head approval", done: false },
];

const UPSELL_SOURCES = ["Intake form", "Visit notes · 2", "Shortlist · 5 families", "Cross-branch flag", "Wallet history"];

function UpsellPitchCard({ pkg, clientName = "" }) {
  const from = pkg?.name || "Premium";
  const price = pkg?.price || "₹51,000";
  const who = clientName.trim() || "Client";
  return (
    <div className="rounded-2xl border border-black/8 bg-white px-4 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-[#111]">Upsell from {from} — what can actually be pitched</h3>
          <p className="text-[12.5px] text-[#4B5563] mt-1 leading-relaxed">
            {who} is on {from} at {price}. Ask for the angles their own record supports, ranked, with the objection you will get and the words to use.
          </p>
          <p className="text-[12px] text-[#6B7280] mt-1 leading-relaxed">
            It reads the intake form, visit notes, shortlist and the cross-branch flag — nothing is pitched that the record does not support.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info("AI pitch angles coming soon.")}
          className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
        >
          Ask AI what to pitch
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {UPSELL_SOURCES.map((label) => (
          <span
            key={label}
            className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563] whitespace-nowrap"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function PackageCard({ pkg, empty = false, selected = false, current = false, onSelect }) {
  const isHighlighted = !empty && selected;
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col transition-colors ${
        isHighlighted ? "bg-[#FEF4F5] border-[#F7C9CF]" : "bg-white border-black/8"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-bold text-[#111]">{pkg.name}</h3>
        {pkg.upsellBadge && (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-white bg-[#7A0A17] rounded-md px-2 py-0.5 shrink-0 whitespace-nowrap">
            <TrendingUp size={11} /> UPSELL · {pkg.upsellBadge}
          </span>
        )}
      </div>
      <p className="text-[24px] font-bold text-[#111] mt-1">{pkg.price}</p>
      <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">{pkg.subtitle}</p>

      <ul className="flex flex-col gap-2 mt-4 flex-1">
        {pkg.features.map((f) => (
          <li key={f.label} className="flex items-start gap-2 text-[12px] text-[#374151]">
            {f.included ? (
              <Check size={14} className="text-[#16A34A] shrink-0 mt-0.5" />
            ) : (
              <X size={14} className="text-[#E8395B] shrink-0 mt-0.5" />
            )}
            <span className={f.included ? "" : "text-[#9CA3AF]"}>{f.label}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 mt-5">
        {isHighlighted ? (
          <button
            type="button"
            className="w-full h-10 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold"
          >
            {current ? "Current package" : "Selected"}
          </button>
        ) : current ? (
          <button
            type="button"
            disabled={empty}
            onClick={() => onSelect?.(pkg)}
            className="w-full h-10 rounded-xl bg-white border border-[#7A0A17]/30 text-[#7A0A17] text-[12.5px] font-semibold hover:bg-[#FCF5F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Current package
          </button>
        ) : (
          <button
            type="button"
            disabled={empty}
            onClick={() => onSelect?.(pkg)}
            className="w-full h-10 rounded-xl bg-white border border-black/12 text-[#111] text-[12.5px] font-semibold hover:bg-[#FAFAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select
          </button>
        )}
        {pkg.upsellBadge && (
          <button
            type="button"
            onClick={() => toast.info("AI pitch angles coming soon.")}
            className="w-full h-10 rounded-xl bg-white border border-[#7A0A17]/30 text-[#7A0A17] text-[12.5px] font-semibold hover:bg-[#FCF5F6] transition-colors"
          >
            Ask AI how to pitch this
          </button>
        )}
      </div>
    </div>
  );
}

function DiscountApprovalsCard() {
  const [rows, setRows] = useState(INITIAL_APPROVALS);
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "raised" });
  const [open, setOpen] = useState(false);
  const [commentFor, setCommentFor] = useState(null);
  const [requested, setRequested] = useState("");
  const [discount, setDiscount] = useState("");
  const [level, setLevel] = useState("Team Lead");

  const handleSave = (e) => {
    e.preventDefault();
    if (!requested.trim() || !discount.trim()) {
      toast.error("Please add requested amount and discount.");
      return;
    }
    setRows((prev) => [
      {
        raised: "Just now",
        requested: requested.trim().startsWith("₹") ? requested.trim() : `₹${requested.trim()}`,
        discount: discount.includes("%") ? discount : `${discount}%`,
        approver: level === "Founder" ? "Founder desk" : level === "Branch Head" ? "Pooja Sharma" : "Vinay Gupta",
        level,
        status: "Pending",
      },
      ...prev,
    ]);
    toast.success("Discount request raised.");
    setRequested("");
    setDiscount("");
    setLevel("Team Lead");
    setOpen(false);
  };

  return (
    <>
      <TableCard
        title="Discount Approvals"
        subtitle="Routed by the authority matrix — team level, not individual"
        action={<TabHeaderButton onClick={() => setOpen(true)}>Request discount</TabHeaderButton>}
        columns={APPROVAL_COLUMNS}
        sort={sort}
        onSort={toggle}
        compact
        footnote="Up to 10% — Team Lead. 10-20% — Branch Head. Above 20% — Founder."
      >
        {sorted.map((row, i) => (
          <tr key={`${row.raised}-${i}`} className="border-b border-black/5 last:border-0">
            <td className="px-1.5 py-2 text-[12px] font-semibold text-[#111] whitespace-nowrap">{row.raised}</td>
            <td className="px-1.5 py-2 text-[12px] text-[#4B5563] whitespace-nowrap">{row.requested}</td>
            <td className="px-1.5 py-2 text-[12px] text-[#4B5563] whitespace-nowrap">{row.discount}</td>
            <td className="px-1.5 py-2 whitespace-nowrap">
              <p className="text-[12px] font-semibold text-[#111]">{row.approver}</p>
              {row.level ? <p className="text-[10.5px] text-[#9CA3AF]">{row.level}</p> : null}
            </td>
            <td className="py-2 pl-1 pr-0 whitespace-nowrap">
              {row.status === "-" ? (
                <span className="text-[12px] text-[#9CA3AF]">-</span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <StatusPill tone={APPROVAL_STATUS_TONES[row.status] || "gray"} className="w-[4.5rem]">{row.status}</StatusPill>
                  <button
                    type="button"
                    onClick={() => setCommentFor(row)}
                    className="size-7 rounded-lg bg-[#FDF2F3] text-[#7A0A17] grid place-items-center shrink-0 hover:bg-[#F6E4E8] transition-colors"
                    aria-label={`Comment on ${row.raised}`}
                  >
                    <MessageSquare size={14} />
                  </button>
                </span>
              )}
            </td>
          </tr>
        ))}
      </TableCard>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request discount"
        subtitle="Routed by the authority matrix"
        zClass="z-[100]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="package-discount-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Submit request
            </button>
          </>
        }
      >
        <form id="package-discount-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Requested amount</label>
            <input value={requested} onChange={(e) => setRequested(e.target.value)} placeholder="51000" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Discount %</label>
            <input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="10" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Approval level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={FIELD}>
              <option>Team Lead</option>
              <option>Branch Head</option>
              <option>Founder</option>
            </select>
          </div>
        </form>
      </Modal>

      <SendMessageModal
        open={!!commentFor}
        onClose={() => setCommentFor(null)}
        title={commentFor ? `Comment · ${commentFor.raised}` : "Comment"}
        zClass="z-[120]"
      />
    </>
  );
}

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

function QuotationCard({ clientName = "", deal, currentStage, showSend = true, viewOnly = false, onChangePackage }) {
  const paymentReady = atLeast(currentStage, "P1");
  const quote = useQuote();
  const items = quote.items;
  const totals = quoteTotals(items, quote.discountPercent);
  const { sorted, sort, toggle } = useTableSort(items, { defaultKey: "item" });
  const catalog = useAddonCatalog();
  const pkg = PACKAGES.find((item) => item.key === quote.packageKey) || DEFAULT_PACKAGE;
  const onQuote = new Set(items.filter((item) => item.type === "Add-on").map((item) => item.id));
  const available = catalog.filter((addon) => !onQuote.has(addon.id));
  const [open, setOpen] = useState(false);
  const [sendType, setSendType] = useState(null);
  const [pickedIds, setPickedIds] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [quoted, setQuoted] = useState("");
  const [discountDraft, setDiscountDraft] = useState(quote.discountPercent ? String(quote.discountPercent) : "");
  const client = deal?.name ? deal : { ...deal, name: clientName || deal?.name || "Client" };
  const quoteCode = clientShareId(client);

  useEffect(() => {
    setDiscountDraft(quote.discountPercent ? String(quote.discountPercent) : "");
  }, [quote.discountPercent]);

  const openAddonModal = () => {
    setPickedIds([]);
    setPickerOpen(false);
    setItemName("");
    setQuoted("");
    setOpen(true);
  };

  const togglePicked = (id) => {
    setPickedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setItemName("");
    setQuoted("");
  };

  const pickedAddons = available.filter((addon) => pickedIds.includes(addon.id));
  const pickerLabel = pickedAddons.length
    ? pickedAddons.map((addon) => addon.name).join(", ")
    : "Select add-ons";

  const handleSave = (e) => {
    e.preventDefault();
    const customName = itemName.trim();
    const selected = available.filter((addon) => pickedIds.includes(addon.id));
    if (!customName && !selected.length) {
      toast.error("Select add-ons, or add a custom one.");
      return;
    }
    if (customName) {
      const amount = parseMoney(quoted);
      if (!quoted.trim() || !Number.isFinite(amount) || amount < 0) {
        toast.error("Please add an amount for the custom add-on.");
        return;
      }
      const addon = addCustomAddon({ name: customName, price: amount });
      addCatalogAddonToQuote(addon);
    }
    selected.forEach((addon) => addCatalogAddonToQuote(addon));
    const count = selected.length + (customName ? 1 : 0);
    toast.success(count === 1 ? "Add-on added to this quotation." : `${count} add-ons added to this quotation.`);
    setPickedIds([]);
    setPickerOpen(false);
    setItemName("");
    setQuoted("");
    setOpen(false);
  };

  const handleRemoveAddon = (row) => {
    if (row.type !== "Add-on") return;
    removeQuoteAddon(row.id);
    toast.success(`${row.item} removed. Quotation total updated.`);
  };

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    const raw = discountDraft.trim().replace("%", "");
    if (!raw) {
      setQuoteDiscount(0);
      toast.success("Discount cleared.");
      return;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a valid discount percent.");
      return;
    }
    if (value > SALESPERSON_DISCOUNT_CAP) {
      toast.error(`Salesperson can approve discount only up to ${SALESPERSON_DISCOUNT_CAP}%.`);
      return;
    }
    setQuoteDiscount(value);
    toast.success(value === 0 ? "Discount cleared." : `${value}% discount applied.`);
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h3 className="text-[14px] font-bold text-[#111]">
          Quotation — {clientName ? `${clientName} · ` : ""}{quoteCode}
        </h3>
        <div className="flex items-center gap-2">
          <span className="inline-block text-[10.5px] font-semibold text-[#6B7280] bg-[#F1F2F4] rounded-md px-2 py-0.5 whitespace-nowrap">
            Draft v2
          </span>
          {viewOnly ? null : <TabHeaderButton onClick={openAddonModal}>Add add-on</TabHeaderButton>}
        </div>
      </div>

      {viewOnly ? null : (
      <Modal    
        open={open}
        onClose={() => setOpen(false)}
        title="Add add-on"
        subtitle="Catalogue add-ons not already on this quotation"
        zClass="z-[100]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addon-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              {pickedIds.length + (itemName.trim() ? 1 : 0) > 1 ? "Add items" : "Add item"}
            </button>
          </>
        }
      >
        <form id="addon-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Add-ons</label>
            {available.length ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen((open) => !open)}
                  aria-expanded={pickerOpen}
                  className={`${FIELD} bg-white flex items-center justify-between gap-2 text-left`}
                >
                  <span className={`truncate ${pickedAddons.length ? "text-[#111]" : "text-[#9CA3AF]"}`}>{pickerLabel}</span>
                  <ChevronDown size={16} className={`shrink-0 text-[#6B7280] transition-transform duration-300 ease-out ${pickerOpen ? "rotate-180" : ""}`} />
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    pickerOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className={`mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-black/12 bg-white ${pickerOpen ? "" : "pointer-events-none"}`}>
                      {available.map((addon) => {
                        const line = quoteAddonLine(addon, pkg);
                        const price = Number(line.quoted) || 0;
                        const on = pickedIds.includes(addon.id);
                        return (
                          <button
                            key={addon.id}
                            type="button"
                            tabIndex={pickerOpen ? 0 : -1}
                            onClick={() => togglePicked(addon.id)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#FAFAFB]"
                          >
                            <span
                              className={`size-4 rounded border grid place-items-center shrink-0 transition-colors duration-200 ${
                                on ? "border-[#7A0A17] bg-[#7A0A17] text-white" : "border-[#D1D5DB] bg-white"
                              }`}
                            >
                              {on ? <Check size={10} strokeWidth={3} /> : null}
                            </span>
                            <span className="min-w-0 flex-1 text-[13px] font-semibold text-[#111] truncate">{line.item}</span>
                            {price ? <span className="text-[12.5px] font-semibold text-[#111] shrink-0">{formatInr(price)}</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[12.5px] text-[#6B7280] leading-relaxed">
                Every catalogue add-on is already on this quotation. Remove one from the quote and it will show here again.
              </p>
            )}
          </div>
          <div className="border-t border-black/8 pt-4">
            <p className="text-[13px] font-bold text-[#111]">Custom add-on</p>
            <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 mb-3">
              Saved to the catalogue, so it also shows on the package add-ons list.
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Item</label>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Photo reshoot"
                  className={FIELD}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Quoted</label>
                <input
                  value={quoted}
                  onChange={(e) => setQuoted(e.target.value)}
                  placeholder="2500"
                  className={FIELD}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
      )}

      <div className="min-w-0">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col />
            <col className="w-[4.25rem]" />
            <col className="w-11" />
            <col className="w-[4.75rem]" />
            <col className="w-[4.75rem]" />
            <col className="w-8" />
          </colgroup>
          <thead>
            <tr className="bg-[#FAF3F2]">
              {[
                { label: "Item", key: "item" },
                { label: "Type", key: "type" },
                { label: "Qty.", key: "qty" },
                { label: "Quoted", key: "quoted" },
                { label: "Rate", key: "rate" },
              ].map((col, i) => (
                <SortableTh
                  key={col.key}
                  label={col.label}
                  sortKey={col.key}
                  sort={sort}
                  onSort={toggle}
                  className={`px-2 py-2 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide ${
                    i === 0 ? "rounded-l-lg" : ""
                  }`}
                />
              ))}
              <th className="px-1 py-2 rounded-r-lg" aria-label="Row actions" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className="border-b border-black/5">
                <td className="px-2 py-2.5">
                  <p className="text-[12.5px] font-semibold text-[#111] leading-snug">{row.item}</p>
                  <p className="text-[10.5px] text-[#9CA3AF] leading-snug">{row.note}</p>
                </td>
                <td className="px-2 py-2.5 text-[12px] text-[#4B5563]">{row.type}</td>
                <td className="px-2 py-2.5 text-[12px] text-[#4B5563]">{row.qty}</td>
                <td className="px-2 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{formatInr(row.quoted)}</td>
                <td className="px-2 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{formatInr(row.rate)}</td>
                <td className="px-1 py-2.5 text-right">
                  {row.type === "Base" && onChangePackage ? (
                    <button
                      type="button"
                      onClick={onChangePackage}
                      className="size-7 rounded-lg text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center ml-auto"
                      aria-label="Change package"
                      title="Change package"
                    >
                      <Package size={14} />
                    </button>
                  ) : row.type === "Add-on" ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveAddon(row)}
                      className="size-7 rounded-lg text-[#E8395B] hover:bg-[#FEF2F2] grid place-items-center ml-auto"
                      aria-label={`Remove ${row.item}`}
                      title="Remove add-on"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-black/6">
        <form onSubmit={handleApplyDiscount} className="flex items-center justify-between gap-3 flex-wrap text-[12.5px] text-[#4B5563]">
          <span className="shrink-0">Approved discount</span>
          <span className="flex items-center gap-2 flex-wrap justify-end">
            <input
              value={discountDraft}
              onChange={(e) => setDiscountDraft(e.target.value)}
              inputMode="decimal"
              placeholder="0–5"
              aria-label="Discount percent"
              className="w-[4.5rem] h-8 rounded-lg border border-black/12 px-2 text-[12.5px] text-[#111] text-right outline-none focus:border-[#7A0A17]"
            />
            <span className="text-[12px] text-[#6B7280]">%</span>
            <button
              type="submit"
              className="h-8 px-2.5 rounded-lg bg-[#7A0A17] text-white text-[12px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Apply
            </button>
            <span className="font-medium text-[#111] min-w-[4.5rem] text-right">{formatDeduction(totals.discount)}</span>
          </span>
        </form>
        <p className="text-[11px] text-[#9CA3AF] -mt-0.5">Salesperson can approve discount only up to {SALESPERSON_DISCOUNT_CAP}%.</p>
        <div className="flex items-center justify-between text-[12.5px] text-[#4B5563]">
          <span>Subtotal</span>
          <span className="font-medium text-[#111]">{formatInr(totals.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-[12.5px] text-[#4B5563]">
          <span>Wallet credits applied (referral)</span>
          <span className="font-medium text-[#111]">{formatDeduction(totals.wallet)}</span>
        </div>
        <div className="flex items-center justify-between text-[12.5px] text-[#4B5563]">
          <span>GST @ 18%</span>
          <span className="font-medium text-[#111]">{formatInr(totals.gst)}</span>
        </div>
        <div className="flex items-center justify-between text-[13.5px] font-bold text-[#111] pt-2 border-t border-black/6 mt-1">
          <span>Total payable</span>
          <span>{formatInr(totals.total)}</span>
        </div>
      </div>

      <p className="text-[11.5px] text-[#9CA3AF] mt-4">
        {quote.discountPercent > 0
          ? `${quote.discountPercent}% salesperson discount is applied. Higher than ${SALESPERSON_DISCOUNT_CAP}% needs a discount request.`
          : `Enter a discount up to ${SALESPERSON_DISCOUNT_CAP}%. A higher discount needs approval before the quote can be sent.`}
      </p>

      {viewOnly && !showSend ? null : (
      <div className="flex items-center gap-2.5 mt-3 flex-wrap">
        {viewOnly ? null : (
          <button
            type="button"
            onClick={() => toast.info("Generating quote PDF preview...")}
            className="h-10 px-4 rounded-xl bg-white border border-black/12 text-[#111] text-[12.5px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Preview PDF
          </button>
        )}
        {showSend ? (
          <button
            type="button"
            onClick={() => setSendType("quote")}
            className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Send quote to client
          </button>
        ) : null}
        {showSend && paymentReady ? (
          <button
            type="button"
            onClick={() => setSendType("payment")}
            className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Payment link
          </button>
        ) : null}
      </div>
      )}

      {showSend ? (
        <SendLinkModal
          open={Boolean(sendType)}
          onClose={() => setSendType(null)}
          deal={client}
          currentStage={currentStage}
          linkTypes={paymentReady ? ["quote", "payment"] : ["quote"]}
          initialType={sendType || "quote"}
          title="Send message"
          subtitle="Quotation and payment links use a fixed mml.com address"
          zClass="z-[110]"
        />
      ) : null}
    </div>
  );
}

function DataRevealCard({ empty = false }) {
  const [levels, setLevels] = useState(DATA_REVEAL_LEVELS);
  const visibleLevels = dashRows(levels, empty, ["label"]);

  const toggleLevel = (label) => {
    setLevels((prev) => prev.map((level) => (level.label === label ? { ...level, done: !level.done } : level)));
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 flex flex-col gap-5 min-w-0">
      <div>
        <h3 className="text-[14px] font-bold text-[#111] mb-3.5">Progressive data reveal by package</h3>
        <div className="flex flex-col gap-3.5">
          {visibleLevels.map((level) => (
            <button
              key={level.label}
              type="button"
              onClick={() => toggleLevel(level.label)}
              className="flex items-start gap-2.5 text-left cursor-pointer"
            >
              <ChecklistCheck done={level.done} className="mt-0.5" />
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-[#111]">{level.label}</p>
                <p className="text-[11px] text-[#9CA3AF]">{level.note}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-black/6" />

      <div>
        <h4 className="text-[13px] font-bold text-[#111] mb-2.5">Cross-branch price check</h4>
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5">
          <p className="text-[12.5px] font-semibold text-[#111]">{empty ? EMPTY : "Client contacted Rajouri branch."}</p>
          <p className="text-[11.5px] text-[#6B7280] mt-1 leading-relaxed">
            {empty ? EMPTY : "Quoted ₹51,000 there too. Flagged to your Branch Head on 29 Jun"}
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentLinkPanel({ deal, clientName = "", currentStage, onLinkSent }) {
  const client = deal?.name ? deal : { ...deal, name: clientName };
  const dealKey = paymentVerifyKey(client);

  return (
    <SendLinkModal
      embedded
      open
      hideHeader
      deal={client}
      currentStage={currentStage}
      linkTypes={["payment"]}
      initialType="payment"
      closeOnSend={false}
      onSent={() => {
        markPaymentLinkSent(dealKey);
        onLinkSent?.();
      }}
      beforeSend={
        <button
          type="button"
          onClick={() => toast.info("Generating quote PDF preview...")}
          className="h-10 px-4 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
        >
          Preview PDF
        </button>
      }
    />
  );
}

/** Package & Quote tab — package catalogue, quotation, and discount approvals. */
export default function PackageQuoteTab({ empty = false, selectedKey = null, onPackageSelect, onBindSave, variant = "full", clientName = "", deal, currentStage, onPaymentLinkSent, onChangePackage }) {
  const [pendingKey, setPendingKey] = useState(selectedKey);
  const onBindSaveRef = useRef(onBindSave);
  onBindSaveRef.current = onBindSave;

  useEffect(() => {
    setPendingKey(selectedKey);
  }, [selectedKey]);

  const pending = PACKAGES.find((pkg) => pkg.key === pendingKey) || null;
  const saved = PACKAGES.find((pkg) => pkg.key === selectedKey) || null;
  const dirty = Boolean(pendingKey && pendingKey !== selectedKey);
  const saveDisabled = empty || !pending;
  const activePackage = pending || saved;

  useEffect(() => {
    if (empty || !activePackage) return;
    applyPackageToQuote(activePackage);
  }, [empty, activePackage]);

  const handleSelect = (pkg) => {
    if (empty) return;
    setPendingKey(pkg.key);
    applyPackageToQuote(pkg);
  };

  const handleSavePackage = () => {
    if (saveDisabled) return;
    if (!dirty) {
      toast.success(`${pending.name} package is already saved.`);
      return;
    }
    applyPackageToQuote(pending);
    onPackageSelect?.(pending);
    toast.success(`${pending.name} package saved.`);
  };

  const saveHint = dirty
    ? `${pending.name} selected. Save to change the package.`
    : saved
      ? `${saved.name} is the current package.`
      : "Pick a package, then save.";
  const saveRef = useRef(handleSavePackage);
  saveRef.current = handleSavePackage;

  useEffect(() => {
    onBindSaveRef.current?.({
      disabled: saveDisabled,
      onSave: () => saveRef.current(),
      subtitle: dirty
        ? `Save to change the package to ${pending.name}`
        : saved
          ? `${saved.name} is the current package`
          : "Select a package, then save",
    });
  }, [saveDisabled, dirty, pending, saved]);

  const upsellPkg = pending || saved || PACKAGES.find((pkg) => pkg.key === "premium");
  const upsellCard = <UpsellPitchCard pkg={upsellPkg} clientName={clientName} />;

  if (variant === "pay") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="min-w-0">
          <QuotationCard
            clientName={clientName}
            deal={deal}
            currentStage={currentStage}
            showSend={false}
            viewOnly
            onChangePackage={onChangePackage}
          />
        </div>
        <div className="min-w-0">
          <PaymentLinkPanel
            deal={deal}
            clientName={clientName}
            currentStage={currentStage}
            onLinkSent={onPaymentLinkSent}
          />
        </div>
      </div>
    );
  }

  if (variant === "discount") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="min-w-0">
          <QuotationCard clientName={clientName} deal={deal} currentStage={currentStage} />
        </div>
        <div className="min-w-0">
          <DiscountApprovalsCard />
        </div>
      </div>
    );
  }

  const catalogueOnly = variant === "catalogue";

  return (
    <div className="flex flex-col gap-5">
      {!onBindSave && <p className="text-[12.5px] font-medium text-[#6B7280]">{saveHint}</p>}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-[16px] font-bold text-[#111]">Package catalogue</h2>
        <div className="flex items-center gap-2">
          {!onBindSave && (
            <button
              type="button"
              disabled={saveDisabled}
              onClick={handleSavePackage}
              className="h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          )}
          <button
            type="button"
            className="h-9 px-4 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            Currency INR
          </button>
          <button
            type="button"
            onClick={() => toast.info("NRI pricing (USD) coming soon.")}
            className="h-9 px-4 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            NRI pricing (USD)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.key}
            pkg={pkg}
            empty={empty}
            selected={pendingKey === pkg.key}
            current={selectedKey === pkg.key}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {catalogueOnly ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="min-w-0">
            <QuotationCard clientName={clientName} deal={deal} currentStage={currentStage} />
          </div>
          <div className="min-w-0 flex flex-col gap-5">
            <DiscountApprovalsCard />
            {upsellCard}
          </div>
        </div>
      )}
    </div>
  );
}
