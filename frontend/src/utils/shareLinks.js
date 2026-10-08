export const SHARE_BASE = "https://mml.com";

const SLUGS = {
  payment: "pay",
  biodata: "biodata",
  quote: "quote",
};

export function clientShareId(deal) {
  const raw = String(deal?.mmlId || deal?.dealCode || deal?.id || "MML-D-10428").replace(/\s+/g, "");
  return raw && raw !== "-" && raw !== "—" ? raw : "MML-D-10428";
}

export function shareUrl(deal, linkType) {
  const slug = SLUGS[linkType] || "pay";
  return `${SHARE_BASE}/${slug}/${encodeURIComponent(clientShareId(deal))}`;
}

export function defaultLinkMessage(deal, linkType) {
  const name = String(deal?.name || "there").trim() || "there";
  const link = shareUrl(deal, linkType);
  if (linkType === "biodata") {
    return `Hi ${name}, please upload your biodata using this link:\n${link}`;
  }
  if (linkType === "quote") {
    return `Hi ${name}, your quotation is ready. Please review it here:\n${link}`;
  }
  return `Hi ${name}, please complete your payment using this link:\n${link}`;
}
