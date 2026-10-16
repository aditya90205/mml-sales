import { findLeadById } from "./pipelineStore.js";

/**
 * Demo replies mapped to known pipeline lead IDs (same seed as Dashboard).
 * Used only when those campaigns still exist — counts stay consistent across UI.
 */
export const DEMO_CAMPAIGN_RESPONSES = [
  {
    leadId: "p0-1",
    campaignId: 2,
    channel: "WhatsApp",
    respondedAtLabel: "12 min ago",
    reply: "Hi, saw your hoarding near South Ex. Interested in Premium package — please share details.",
  },
  {
    leadId: "p0-2",
    campaignId: 2,
    channel: "WhatsApp",
    respondedAtLabel: "28 min ago",
    reply: "Yes, call me after 7 PM. Looking for a match in Delhi NCR.",
  },
  {
    leadId: "p1-2",
    campaignId: 2,
    channel: "SMS",
    respondedAtLabel: "1 hr ago",
    reply: "Got your SMS. Can we schedule a visit this weekend?",
  },
  {
    leadId: "p2-2",
    campaignId: 2,
    channel: "WhatsApp",
    respondedAtLabel: "3 hrs ago",
    reply: "Please send the brochure. Budget around ₹50k–₹1L.",
  },
  {
    leadId: "p3-1",
    campaignId: 3,
    channel: "Email",
    respondedAtLabel: "2 hrs ago",
    reply: "Interested in the 30% offer. Is it valid for existing negotiation deals?",
  },
  {
    leadId: "p4-1",
    campaignId: 3,
    channel: "Email",
    respondedAtLabel: "Yesterday",
    reply: "Confirming — ready to close if the discount applies to Premium.",
  },
  {
    leadId: "p1-1",
    campaignId: 4,
    channel: "Push",
    respondedAtLabel: "Yesterday",
    reply: "Attended the Rohini sabha. Please follow up with profiles.",
  },
];

/** Explicit send count from Send Campaign, else attached leadIds. */
export function campaignSentCount(campaign) {
  const explicit = Number(campaign?.lastSentCount);
  if (!Number.isNaN(explicit) && explicit > 0) return explicit;
  const leads = Array.isArray(campaign?.leadIds) ? campaign.leadIds.length : 0;
  return leads > 0 ? leads : 0;
}

function leadHasCampaignReply(lead) {
  if (!lead) return false;
  if (String(lead.campaignResponse || "").toLowerCase() === "yes") return true;
  return Boolean(String(lead.campaignResponseText || "").trim());
}

/** Resolve reply rows for all campaigns, or one campaign when campaignId is set. */
export function resolveCampaignResponseRows(campaigns = [], { campaignId } = {}) {
  const list = Array.isArray(campaigns) ? campaigns : [];
  const byId = new Map(list.map((c) => [c.id, c]));
  const seen = new Set();
  const rows = [];

  const allowCampaign = (id) =>
    campaignId == null || String(id) === String(campaignId);

  for (const entry of DEMO_CAMPAIGN_RESPONSES) {
    if (!allowCampaign(entry.campaignId)) continue;
    const campaign = byId.get(entry.campaignId);
    if (!campaign) continue;
    const found = findLeadById(entry.leadId);
    if (!found?.lead) continue;
    const key = `${entry.leadId}-${entry.campaignId}-${entry.channel || "any"}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      ...entry,
      campaignName: campaign.name || `Campaign ${entry.campaignId}`,
      lead: found.lead,
      stageId: found.stageId,
    });
  }

  list.forEach((campaign) => {
    if (!allowCampaign(campaign.id)) return;
    const ids = Array.isArray(campaign.leadIds) ? campaign.leadIds : [];
    ids.forEach((leadId) => {
      const found = findLeadById(leadId);
      if (!found?.lead || !leadHasCampaignReply(found.lead)) return;
      const key = `${leadId}-${campaign.id}-live`;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({
        leadId,
        campaignId: campaign.id,
        channel: campaign.channel || "",
        respondedAtLabel: campaign.lastSentAt ? "Just now" : "Recently",
        reply: found.lead.campaignResponseText || "Campaign reply received",
        campaignName: campaign.name || `Campaign ${campaign.id}`,
        lead: found.lead,
        stageId: found.stageId,
      });
    });
  });

  return rows;
}

export function campaignResponseCount(campaigns = [], campaignId) {
  return resolveCampaignResponseRows(campaigns, { campaignId }).length;
}

/**
 * Effective sent for a campaign: store send count, or at least the replies we know about
 * (so seeded demos aren't stuck at 0 Sent with Responses > 0).
 */
export function effectiveCampaignSent(campaign, responseCount = 0) {
  return Math.max(campaignSentCount(campaign), Number(responseCount) || 0);
}

function formatKpiValue(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

/** Aggregate KPIs for Campaign Management page — only from store + available replies. */
export function buildCampaignPageKpis(campaigns = []) {
  const list = Array.isArray(campaigns) ? campaigns : [];
  const allResponses = resolveCampaignResponseRows(list);
  const responsesByCampaign = new Map();
  allResponses.forEach((row) => {
    const id = row.campaignId;
    responsesByCampaign.set(id, (responsesByCampaign.get(id) || 0) + 1);
  });

  const leadIds = new Set();
  let sent = 0;
  let delivered = 0;
  let opened = 0;

  list.forEach((campaign) => {
    const replyCount = responsesByCampaign.get(campaign.id) || 0;
    const sentCount = effectiveCampaignSent(campaign, replyCount);
    sent += sentCount;

    if (Array.isArray(campaign.leadIds)) {
      campaign.leadIds.forEach((id) => leadIds.add(String(id)));
    }

    const status = campaign.status;
    if (status === "Active" || status === "Completed" || status === "Stop Manually") {
      delivered += sentCount;
    }
    if (status === "Completed" || status === "Active") {
      // Opened tracking isn't stored — use replies as the only real open/engage signal.
      opened += replyCount;
    }
  });

  allResponses.forEach((row) => leadIds.add(String(row.leadId)));

  const active = list.filter((c) => c.status === "Active").length;
  const responses = allResponses.length;

  return {
    leads: leadIds.size,
    active,
    sent,
    delivered,
    opened,
    responses,
    labels: {
      leads: formatKpiValue(leadIds.size),
      active: formatKpiValue(active),
      sent: formatKpiValue(sent),
      delivered: formatKpiValue(delivered),
      opened: formatKpiValue(opened),
      responses: formatKpiValue(responses),
    },
  };
}

/** Per-campaign KPI snapshot for the view modal. */
export function buildCampaignDetailKpis(campaign, campaigns = []) {
  if (!campaign) {
    return { sent: 0, delivered: 0, opened: 0, responses: 0 };
  }
  const list = Array.isArray(campaigns) && campaigns.length ? campaigns : [campaign];
  const responses = campaignResponseCount(list, campaign.id);
  const sent = effectiveCampaignSent(campaign, responses);
  const status = campaign.status;
  const delivered =
    status === "Active" || status === "Completed" || status === "Stop Manually" ? sent : 0;
  const opened =
    status === "Completed" || status === "Active" ? responses : Math.min(responses, sent);

  return {
    sent,
    delivered,
    opened,
    responses,
    labels: {
      sent: formatKpiValue(sent),
      delivered: formatKpiValue(delivered),
      opened: formatKpiValue(opened),
      responses: formatKpiValue(responses),
    },
  };
}

export function campaignHasResponses(campaign, campaigns = []) {
  if (!campaign) return false;
  const list = Array.isArray(campaigns) && campaigns.length ? campaigns : [campaign];
  return campaignResponseCount(list, campaign.id) > 0;
}
