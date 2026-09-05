import { useState } from "react";
import { Check, Minus, Pencil, Plus, TrendingUp, X } from "lucide-react";
import { toast } from "react-toastify";
import { AppPage, MetricCard, OutlineBtn, Panel, PrimaryBtn, Td } from "../components/common/AppPage.jsx";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";
import StatusPill from "../components/common/StatusPill";

const STATS = [
  { label: "Active subscriptions", value: "517", note: "▲ 34 this month", noteTone: "green" },
  { label: "Active plan value", value: "₹2.14Cr", note: "Sum of live packages", noteTone: "grey" },
  { label: "Most popular plan", value: "Premium", note: "66% of new sign-ups", noteTone: "grey" },
  { label: "Avg. upsell value", value: "₹28,400", note: "Basic/Premium → Exclusive", noteTone: "grey" },
  { label: "Upgrade rate", value: "18.6%", note: "▲ 3.1% vs last quarter", noteTone: "green" },
];

const PACKAGES = [
  {
    key: "basic",
    name: "Basic",
    price: "₹25,000",
    priceUsd: "$310",
    subtitle: "6 months · junior RM",
    active: 128,
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
    priceUsd: "$630",
    subtitle: "12 months, senior RM only",
    highlighted: true,
    active: 342,
    features: [
      { label: "Everything in Basic", included: true },
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
    priceUsd: "$1,540",
    subtitle: "12 months, senior RM only",
    upsellBadge: "+74,000",
    active: 47,
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

const COMPARISON_ROWS = [
  { label: "Profile creation & curation", basic: true, premium: true, exclusive: true },
  { label: "Monthly profile limit", basic: "10 / month", premium: "Unlimited", exclusive: "Unlimited" },
  { label: "Photo + basic details reveal", basic: true, premium: true, exclusive: true },
  { label: "Contact reveal", basic: false, premium: "After RM approval", exclusive: "Progressive, incl. address" },
  { label: "Verified Report", basic: false, premium: true, exclusive: true },
  { label: "Horoscope matching", basic: "On request", premium: "On request", exclusive: "Included" },
  { label: "Dedicated senior RM", basic: false, premium: false, exclusive: true },
  { label: "Branch Head oversight", basic: false, premium: false, exclusive: true },
  { label: "Priority matchmaking queue", basic: false, premium: false, exclusive: true },
];

const ADDONS = [
  { item: "Kundli / horoscope service", note: "Redeemable against wallet credits", price: "₹2,500", availableOn: "All packages" },
  { item: "Photo reshoot (studio)", note: "Professional shoot at branch studio", price: "₹3,500", availableOn: "All packages" },
  { item: "Verified Profile Report", note: "Background + document verification", price: "₹0", availableOn: "Included in Premium & Exclusive" },
  { item: "Priority matchmaking boost", note: "7-day featured placement", price: "₹6,000", availableOn: "Premium & Exclusive" },
  { item: "Additional city search", note: "Per extra city beyond home branch", price: "₹4,000", availableOn: "All packages" },
];

const PLAN_CHANGES = [
  { client: "Ritu Malhotra", from: "Basic", to: "Premium", date: "01 Sep 2026", rm: "Aman Verma", uplift: "₹26,000" },
  { client: "Karan Bhatia", from: "Premium", to: "Exclusive", date: "29 Aug 2026", rm: "Sneha Rao", uplift: "₹74,000" },
  { client: "Divya Nair", from: "Basic", to: "Premium", date: "27 Aug 2026", rm: "Aman Verma", uplift: "₹26,000" },
  { client: "Yash Kapoor", from: "Premium", to: "Exclusive", date: "22 Aug 2026", rm: "Ritika Shah", uplift: "₹74,000" },
];

const PLAN_CHANGE_COLS = [
  { label: "Client", key: "client" },
  { label: "From", key: "from" },
  { label: "To", key: "to" },
  { label: "Date", key: "date" },
  { label: "RM", key: "rm" },
  { label: "Revenue uplift", key: "uplift" },
];

function PackageCard({ pkg, currency, onEdit }) {
  const price = currency === "usd" ? pkg.priceUsd : pkg.price;
  return (
    <div
      className={`relative rounded-2xl border p-5 flex flex-col ${
        pkg.highlighted ? "bg-[#FEF4F5] border-[#F7C9CF]" : "bg-white border-black/8"
      }`}
    >
      {pkg.upsellBadge && (
        <span className="absolute -top-3 right-4 inline-flex items-center gap-1 text-[10.5px] font-bold text-white bg-[#7A0A17] rounded-full px-2.5 py-1">
          <TrendingUp size={11} /> UPSELL · {pkg.upsellBadge}
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-bold text-[#111]">{pkg.name}</h3>
        <StatusPill tone={pkg.highlighted ? "red" : "gray"}>{pkg.active} active</StatusPill>
      </div>
      <p className="text-[24px] font-bold text-[#111] mt-1">{price}</p>
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

      <button
        type="button"
        onClick={() => onEdit(pkg)}
        className="w-full h-10 mt-5 rounded-xl bg-white border border-black/12 text-[#111] text-[12.5px] font-semibold hover:bg-[#FAFAFB] transition-colors inline-flex items-center justify-center gap-1.5"
      >
        <Pencil size={13} /> Edit package
      </button>
    </div>
  );
}

function ComparisonCell({ value }) {
  if (value === true) return <Check size={15} className="text-[#16A34A] mx-auto" />;
  if (value === false) return <Minus size={15} className="text-[#D1D5DB] mx-auto" />;
  return <span className="text-[12px] text-[#374151]">{value}</span>;
}

export default function PackagesPlansPage() {
  const [currency, setCurrency] = useState("inr");
  const { sorted, sort, toggle } = useTableSort(PLAN_CHANGES, { defaultKey: null });

  return (
    <AppPage
      title="Packages & Plans"
      subtitle="Manage the package catalogue, add-on pricing and upgrade activity across all branches."
      actions={
        <>
          <OutlineBtn onClick={() => setCurrency((c) => (c === "inr" ? "usd" : "inr"))}>
            {currency === "inr" ? "Currency INR" : "NRI pricing (USD)"}
          </OutlineBtn>
          <PrimaryBtn onClick={() => toast.info("Add package flow coming soon.")}>
            <Plus size={14} /> Add package
          </PrimaryBtn>
        </>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {STATS.map((s) => (
          <MetricCard key={s.label} compact className="shadow-[0_1px_2px_rgba(0,0,0,0.04)]" {...s} />
        ))}
      </div>

      <Panel title="Package catalogue" subtitle="Live pricing and active client count per package">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PACKAGES.map((pkg) => (
            <PackageCard
              key={pkg.key}
              pkg={pkg}
              currency={currency}
              onEdit={(p) => toast.info(`Editing ${p.name} package — coming soon.`)}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Feature comparison" subtitle="What each package includes, side by side">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-black/8 bg-[#FAFAFB]">
                <th className="px-4 py-3 text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap">
                  Feature
                </th>
                {PACKAGES.map((pkg) => (
                  <th
                    key={pkg.key}
                    className="px-4 py-3 text-center text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap"
                  >
                    {pkg.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-black/6 last:border-0 hover:bg-[#FAFAFB]">
                  <Td strong>{row.label}</Td>
                  <td className="px-4 py-3 text-center">
                    <ComparisonCell value={row.basic} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ComparisonCell value={row.premium} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ComparisonCell value={row.exclusive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <Panel
          title="Add-on services"
          subtitle="Priced separately from the base package"
          action={<OutlineBtn onClick={() => toast.info("Add-on creation coming soon.")}>+ New add-on</OutlineBtn>}
        >
          <div className="flex flex-col gap-3">
            {ADDONS.map((a) => (
              <div key={a.item} className="flex items-center justify-between gap-3 py-2.5 border-b border-black/6 last:border-0">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#111]">{a.item}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{a.note}</p>
                  <StatusPill tone="gray">{a.availableOn}</StatusPill>
                </div>
                <span className="shrink-0 text-[13px] font-bold text-[#111]">{a.price}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent plan upgrades" subtitle="Package changes across all branches, most recent first">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-black/8 bg-[#FAFAFB]">
                  {PLAN_CHANGE_COLS.map((col) => (
                    <SortableTh
                      key={col.key}
                      label={col.label}
                      sortKey={col.key}
                      sort={sort}
                      onSort={toggle}
                      className="px-4 py-3 text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap"
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={`${row.client}-${row.date}`} className="border-b border-black/6 last:border-0 hover:bg-[#FAFAFB]">
                    <Td strong>{row.client}</Td>
                    <Td muted>{row.from}</Td>
                    <Td>{row.to}</Td>
                    <Td muted>{row.date}</Td>
                    <Td>{row.rm}</Td>
                    <Td strong>{row.uplift}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppPage>
  );
}
