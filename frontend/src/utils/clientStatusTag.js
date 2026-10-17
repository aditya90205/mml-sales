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
 * Priority: Hold > Lost > Subscription Expired > "".
 * Hold / Lost stack under the status badge (same layout); expired → Inactive + label.
 * @returns {"Hold"|"Lost"|"Subscription Expired"|""}
 */
export function resolveClientSubLabel(client, leadHit = null) {
  const hit = leadHit || findLeadForClient(client);
  const lead = hit?.lead || null;
  const deal = String(lead?.dealStatus || "").toLowerCase();
  if (deal === "cold" || client?.onHold === true) return "Hold";
  if (deal === "lost" || lead?.lost === true) return "Lost";
  if (isPackageExpired(lead, client) || client?.subscriptionExpired === true) {
    return "Subscription Expired";
  }
  return "";
}

/**
 * Common pool column: "Yes" only for lost / cold / hold; otherwise "".
 * @returns {"Yes"|""}
 */
export function commonPoolLabel(client, leadHit = null) {
  const hit = leadHit || findLeadForClient(client);
  const lead = hit?.lead || null;
  const deal = String(lead?.dealStatus || "").toLowerCase();

  if (deal === "lost" || lead?.lost === true) return "Yes";
  if (deal === "cold" || client?.onHold === true) return "Yes";
  return "";
}

/** Common pool: cold / on hold / lost leads. */
export function isInCommonPool(client, leadHit = null) {
  return Boolean(commonPoolLabel(client, leadHit));
}

/** Lead id for overview deep-link (pipeline hit, else client.linkedLeadId). */
export function overviewLeadIdForClient(client, leadHit = null) {
  const hit = leadHit || findLeadForClient(client);
  return hit?.lead?.id || client?.linkedLeadId || null;
}

/** Row can open pipeline overview when a Sales Pipeline lead is linked (any status). */
export function canOpenClientOverview(client, leadHit = null) {
  const hit = leadHit || findLeadForClient(client);
  return Boolean(overviewLeadIdForClient(client, hit));
}
