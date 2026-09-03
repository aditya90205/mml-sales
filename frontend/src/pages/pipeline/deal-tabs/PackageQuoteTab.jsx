import { Check, TrendingUp, X } from "lucide-react";
import { toast } from "react-toastify";

const PACKAGES = [
  {
    key: "basic",
    name: "Basic",
    price: "₹25,000",
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
    subtitle: "12 months, senior RM only",
    selected: true,
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

const UPSELL_TAGS = ["Intake form", "Visit notes - 2", "Shortlist - 5 families", "Cross-branch flag", "Wallet history"];

const QUOTE_ITEMS = [
  { item: "Premium Package", note: "12 months membership", type: "Base", qty: 1, quoted: "₹51,000", rate: "₹51,000" },
  { item: "Kundli / horoscope service", note: "Redeemable against wallet credits", type: "Base", qty: 1, quoted: "₹51,000", rate: "₹2,500" },
  { item: "Verified Profile Report", note: "Included in Premium – no charge", type: "Base", qty: 1, quoted: "₹51,000", rate: "₹0" },
];

const QUOTE_SUMMARY = [
  { label: "Subtotal", value: "₹53,500" },
  { label: "Approved discount", value: "-₹7,500" },
  { label: "Wallet credits applied (referral)", value: "-₹1000" },
  { label: "GST @ 18%", value: "₹8,100" },
];

const DATA_REVEAL_LEVELS = [
  { label: "Level 1 — Photo", note: "All packages · on shortlist", done: true },
  { label: "Level 2 — Basic details", note: "All packages · age, height, education", done: true },
  { label: "Level 3 — Contact", note: "Premium & Exclusive · RM approval required", done: true },
  { label: "Level 4 — Address", note: "Exclusive only · Branch Head approval", done: false },
];

function PackageCard({ pkg, onSelect }) {
  const isHighlighted = pkg.selected;
  return (
    <div
      className={`relative rounded-2xl border p-5 flex flex-col ${
        isHighlighted ? "bg-[#FEF4F5] border-[#F7C9CF]" : "bg-white border-black/8"
      }`}
    >
      {pkg.upsellBadge && (
        <span className="absolute -top-3 right-4 inline-flex items-center gap-1 text-[10.5px] font-bold text-white bg-[#7A0A17] rounded-full px-2.5 py-1">
          <TrendingUp size={11} /> UPSELL · {pkg.upsellBadge}
        </span>
      )}

      <h3 className="text-[15px] font-bold text-[#111]">{pkg.name}</h3>
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
            disabled
            className="w-full h-10 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold"
          >
            Selected
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(pkg)}
            className="w-full h-10 rounded-xl bg-white border border-black/12 text-[#111] text-[12.5px] font-semibold hover:bg-[#FAFAFB] transition-colors"
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

function UpsellBanner() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 flex items-center justify-between gap-5 flex-wrap">
      <div className="min-w-0 flex-1">
        <h4 className="text-[14px] font-bold text-[#111]">Upsell from Premium — what can actually be pitched</h4>
        <p className="text-[12.5px] text-[#4B5563] mt-1.5 leading-relaxed">
          She is on Premium at ₹51,000. Ask for the angles her own record supports, ranked, with the objection you
          will get and the words to use.
        </p>
        <p className="text-[11.5px] text-[#9CA3AF] mt-1.5">
          It reads her intake form, visit notes, shortlist and the cross-branch flag — nothing is pitched that the
          record does not support.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {UPSELL_TAGS.map((tag) => (
            <span key={tag} className="text-[10.5px] font-medium text-[#6B7280] bg-[#F9FAFB] border border-black/8 rounded-full px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => toast.info("AI pitch suggestions coming soon.")}
        className="shrink-0 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
      >
        Ask AI what to pitch
      </button>
    </div>
  );
}

function QuotationCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h3 className="text-[14px] font-bold text-[#111]">Quotation — MML-D-10428</h3>
        <span className="text-[10.5px] font-semibold text-[#6B7280] bg-[#F1F2F4] rounded-full px-2.5 py-1">Draft v2</span>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full border-collapse min-w-[480px]">
          <thead>
            <tr className="bg-[#FAF3F2]">
              {["Item", "Type", "Quantity", "Quoted", "Rate"].map((col, i) => (
                <th
                  key={col}
                  className={`px-3 py-2 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap ${
                    i === 0 ? "rounded-l-lg" : ""
                  } ${i === 4 ? "rounded-r-lg" : ""}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUOTE_ITEMS.map((row) => (
              <tr key={row.item} className="border-b border-black/5">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <p className="text-[12.5px] font-semibold text-[#111]">{row.item}</p>
                  <p className="text-[10.5px] text-[#9CA3AF]">{row.note}</p>
                </td>
                <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.type}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.qty}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.quoted}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-black/6">
        {QUOTE_SUMMARY.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-[12.5px] text-[#4B5563]">
            <span>{row.label}</span>
            <span className="font-medium text-[#111]">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-[13.5px] font-bold text-[#111] pt-2 border-t border-black/6 mt-1">
          <span>Total payable</span>
          <span>₹53,100</span>
        </div>
      </div>

      <p className="text-[11.5px] text-[#9CA3AF] mt-4">Quote can be sent once the discount is approved.</p>

      <div className="flex items-center gap-2.5 mt-3 flex-wrap">
        <button
          type="button"
          onClick={() => toast.info("Generating quote PDF preview...")}
          className="h-10 px-4 rounded-xl bg-white border border-black/12 text-[#111] text-[12.5px] font-semibold hover:bg-[#FAFAFB] transition-colors"
        >
          Preview PDF
        </button>
        <button
          type="button"
          onClick={() => toast.success("Quote sent to client.")}
          className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
        >
          Send quote to client
        </button>
      </div>
    </div>
  );
}

function DataRevealCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 flex flex-col gap-5 min-w-0">
      <div>
        <h3 className="text-[14px] font-bold text-[#111] mb-3.5">Progressive data reveal by package</h3>
        <div className="flex flex-col gap-3.5">
          {DATA_REVEAL_LEVELS.map((level) => (
            <div key={level.label} className="flex items-start gap-2.5">
              <span
                className={`size-[18px] rounded-full grid place-items-center shrink-0 mt-0.5 ${
                  level.done ? "bg-[#16A34A]" : "bg-white border border-black/15"
                }`}
              >
                {level.done && <Check size={12} className="text-white" strokeWidth={3} />}
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-[#111]">{level.label}</p>
                <p className="text-[11px] text-[#9CA3AF]">{level.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-black/6" />

      <div>
        <h4 className="text-[13px] font-bold text-[#111] mb-2.5">Cross-branch price check</h4>
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5">
          <p className="text-[12.5px] font-semibold text-[#111]">Client contacted Rajouri branch.</p>
          <p className="text-[11.5px] text-[#6B7280] mt-1 leading-relaxed">
            Quoted ₹51,000 there too. Flagged to your Branch Head on 29 Jun
          </p>
        </div>
      </div>
    </div>
  );
}

/** Package & Quote tab — package catalogue, upsell prompt and the live quotation. */
export default function PackageQuoteTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-[16px] font-bold text-[#111]">Package catalogue</h2>
        <div className="flex items-center gap-2">
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
          <PackageCard key={pkg.key} pkg={pkg} onSelect={(p) => toast.success(`${p.name} package selected.`)} />
        ))}
      </div>

      <UpsellBanner />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        <QuotationCard />
        <DataRevealCard />
      </div>
    </div>
  );
}
