import { useSyncExternalStore } from "react";

/** Catalogue add-ons shared by the quotation and the package add-ons panel. */
export const DEFAULT_ADDONS = [
  {
    id: "kundli",
    name: "Kundli / horoscope service",
    note: "Redeemable against wallet credits",
    price: 2500,
    icon: "sun",
    bg: "#FFF4E5",
    color: "#F59E0B",
    defaultOnQuote: true,
  },
  {
    id: "verified",
    name: "Verified Profile Report",
    note: "Profile verification report",
    price: 0,
    icon: "shield",
    bg: "#E7F8EF",
    color: "#16A34A",
    defaultOnQuote: true,
    includedIn: ["premium", "exclusive"],
  },
  {
    id: "nri",
    name: "NRI Matching",
    note: "NRI matchmaking",
    price: 5000,
    icon: "globe",
    bg: "#E8F2FE",
    color: "#2563EB",
  },
  {
    id: "studio-photo",
    name: "Studio Photo shoot",
    note: "Studio photography session",
    price: 2500,
    icon: "camera",
    bg: "#FDF2F3",
    color: "#7A0A17",
  },
  {
    id: "priority",
    name: "Priority Matchmaking",
    note: "Faster shortlist queue",
    price: 8000,
    icon: "infinity",
    bg: "#F3E8FF",
    color: "#7C3AED",
  },
];

const STORAGE_KEY = "mml-custom-addons";

const CUSTOM_TONES = [
  { icon: "sparkles", bg: "#FDF2F3", color: "#7A0A17" },
  { icon: "gift", bg: "#FFF2E0", color: "#E8B400" },
  { icon: "star", bg: "#FFF6E8", color: "#E8B923" },
];

function readCustom() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((addon) => addon && addon.id && addon.name);
  } catch {
    return [];
  }
}

let customAddons = readCustom();
let catalogSnapshot = [...DEFAULT_ADDONS, ...customAddons];
const listeners = new Set();

function emit() {
  catalogSnapshot = [...DEFAULT_ADDONS, ...customAddons];
  listeners.forEach((listener) => listener());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customAddons));
  } catch {
    /* quota / private mode */
  }
}

export function getAddonCatalog() {
  return catalogSnapshot;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAddonCatalog() {
  return useSyncExternalStore(subscribe, getAddonCatalog, getAddonCatalog);
}

export function addCustomAddon({ name, price, note }) {
  const tone = CUSTOM_TONES[customAddons.length % CUSTOM_TONES.length];
  const addon = {
    id: `custom-${Date.now()}`,
    name: String(name || "").trim(),
    note: String(note || "").trim() || "Custom add-on",
    price: Number(price) || 0,
    custom: true,
    ...tone,
  };
  customAddons = [...customAddons, addon];
  persist();
  emit();
  return addon;
}
