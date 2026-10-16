/** Resolve Hold / Subscription Expired secondary label for client status badge. */

import { readClients } from "./clientsData.js";
import { getPaymentVerifyForDeal, packageTerm } from "./paymentVerifyStore.js";
import { findLeadForClient } from "./pipelineStore.js";

function clientForLead(lead) {
  const name = String(lead?.name || "").trim().toLowerCase();
  if (!name) return null;
  return readClients().find((c) => String(c.name || "").trim().toLowerCase() === name) || null;
}

function formatExpiryDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const asText = String(value).trim();
    return asText || "";
  }
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function isPackageExpired(lead, client) {
  if (client?.subscriptionExpired === true) return true;
  if (!lead) return false;
  const term = packageTerm(getPaymentVerifyForDeal(lead));
  const until = term?.validUntil ? new Date(term.validUntil).getTime() : NaN;
  return Number.isFinite(until) && until < Date.now();
}

/** Overview banner helper: expired payment term or matching client flag. */
export function isSubscriptionExpiredForLead(lead) {
  if (!lead) return false;
  const client = clientForLead(lead);
  if (isPackageExpired(lead, client)) return true;
  return Boolean(client?.subscriptionExpired);
}

/**
 * Plan + expiry details for the overview banner (Hold-style meta).
 * @returns {{ packageName: string, expiredOn: string, months: number|null }}
 */
export function getSubscriptionExpiryMeta(lead) {
  const client = clientForLead(lead);
  const record = lead ? getPaymentVerifyForDeal(lead) : null;
  const term = packageTerm(record);

  const packageName =
    String(record?.packageName || "").trim() ||
    String(client?.packageName || "").trim() ||
    "Subscription plan";

  const expiredRaw =
    term?.validUntil ||
    client?.subscriptionExpiredAt ||
    client?.packageExpiredAt ||
    "";

  const months =
    Number(term?.months) ||
    Number(client?.packageMonths) ||
    null;

  return {
    packageName,
    expiredOn: formatExpiryDate(expiredRaw),
    months: Number.isFinite(months) && months > 0 ? months : null,
  };
}

/**
 * Priority: Hold > Subscription Expired > "".
 * @returns {"Hold"|"Subscription Expired"|""}
 */
export function resolveClientSubLabel(client, leadHit = null) {
  const hit = leadHit || findLeadForClient(client);
  const lead = hit?.lead || null;
  if (lead?.dealStatus === "cold") return "Hold";
  if (isPackageExpired(lead, client)) return "Subscription Expired";
  return "";
}

/** Row can open pipeline overview when Active, or Inactive with Hold/Expired + linked lead. */
export function canOpenClientOverview(client, leadHit = null) {
  const hit = leadHit || findLeadForClient(client);
  if (!hit?.lead?.id) return false;
  if (client?.status === "Active") return true;
  const sub = resolveClientSubLabel(client, hit);
  return sub === "Hold" || sub === "Subscription Expired";
}
