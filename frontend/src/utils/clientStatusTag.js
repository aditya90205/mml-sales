/** Resolve Hold / Subscription Expired / Pipeline stage secondary label for client status badge. */

import { readClients, updateClient } from "./clientsData.js";
import { getPaymentVerifyForDeal, packageTerm } from "./paymentVerifyStore.js";
import { findLeadForClient, p0StatusOf } from "./pipelineStore.js";

/** Compact stage names under the Pipeline badge (updates as the lead moves). */
const PIPELINE_STAGE_LABELS = {
  P0: "P0 New",
  P1: "P1 Qualified",
  P2: "P2 Profile Creation",
  P3: "P3 Video Call/Visit",
  P4: "P4 Negotiation",
  P5: "P5 Closed",
  P6: "P6 Handover",
};

function pipelineStageSubLabel(stageId, lead) {
  const id = String(stageId || "").toUpperCase();
  if (id === "P0") {
    return p0StatusOf(lead) === "contacted" ? "P0 Contacted" : "P0 New";
  }
  return PIPELINE_STAGE_LABELS[id] || (id ? id : "");
}

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

/** After renewal payment is verified — restore Active status and clear expiry flags. */
export function clearSubscriptionExpiredForLead(lead) {
  const client = clientForLead(lead);
  if (!client?.id) return null;
  return updateClient(client.id, {
    subscriptionExpired: false,
    subscriptionExpiredAt: null,
    status: "Active",
    reason: "Package renewed",
  });
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
 * Priority: Hold > Lost > Subscription Expired > Pipeline stage > "".
 * Hold / Lost / stage stack under the status badge (same layout); expired → Inactive + label.
 * Pipeline rows show the current board stage until the lead leaves unpaid/committed
 * (status flips to Active / Inactive and this label clears).
 * @returns {"Hold"|"Lost"|"Subscription Expired"|string|""}
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
  // Unpaid / committed leads stay Pipeline — show live stage under the badge
  if (String(client?.status || "") === "Pipeline" && hit?.stageId) {
    return pipelineStageSubLabel(hit.stageId, lead);
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
