/** Persist payment-link send + offline verify (txn + screenshot) per deal. */

import { useSyncExternalStore } from "react";

const PREFIX = "mml-payment-verify:";
const memory = new Map();
const listeners = new Set();

function storageKey(dealId) {
  return `${PREFIX}${dealId}`;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function readPersisted(dealId) {
  try {
    const raw = sessionStorage.getItem(storageKey(dealId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(dealId, record) {
  if (!dealId || !record) return;
  try {
    sessionStorage.setItem(storageKey(dealId), JSON.stringify(record));
  } catch {
    /* quota / private mode */
  }
}

function normalizeDealId(dealId) {
  const id = String(dealId || "").trim();
  return id && id !== "-" && id !== "—" ? id : "";
}

export function getPaymentVerify(dealId) {
  const id = normalizeDealId(dealId);
  if (!id) return null;
  if (memory.has(id)) return memory.get(id);
  const persisted = readPersisted(id);
  if (persisted) {
    memory.set(id, persisted);
    return persisted;
  }
  return null;
}

function write(dealId, patch) {
  const id = normalizeDealId(dealId);
  if (!id) return null;
  const prev = getPaymentVerify(id) || {};
  const next = { ...prev, ...patch, dealId: id };
  memory.set(id, next);
  persist(id, next);
  emit();
  return next;
}

export function markPaymentLinkSent(dealId) {
  return write(dealId, {
    linkSent: true,
    linkSentAt: new Date().toISOString(),
  });
}

function monthsForPackageName(name) {
  const text = String(name || "").toLowerCase();
  if (text.includes("basic") || text.includes("classic")) return 6;
  return 12;
}

function addMonthsIso(iso, months) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + Number(months || 0));
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date.toISOString();
}

export function packageTerm(record) {
  if (!record) return null;
  const months = Number(record.months) || monthsForPackageName(record.packageName);
  const validFrom = record.validFrom || record.verifiedAt || null;
  const validUntil = record.validUntil || (validFrom ? addMonthsIso(validFrom, months) : null);
  return { months, validFrom, validUntil };
}

export function markPaymentVerified(dealId, { transactionId, screenshotName, amount, packageName, clientName, months } = {}) {
  const verifiedAt = new Date().toISOString();
  const tenure = Number(months) || monthsForPackageName(packageName);
  const invoiceNo = `INV-MML-${String(Date.now()).slice(-8)}`;
  return write(dealId, {
    linkSent: true,
    verified: true,
    verifiedAt,
    transactionId: String(transactionId || "").trim(),
    screenshotName: String(screenshotName || "").trim(),
    amount: amount ?? null,
    packageName: packageName || "",
    clientName: clientName || "",
    invoiceNo,
    months: tenure,
    validFrom: verifiedAt,
    validUntil: addMonthsIso(verifiedAt, tenure),
  });
}

export function subscribePaymentVerify(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getServerSnapshot() {
  return null;
}

export function usePaymentVerify(dealId) {
  const id = normalizeDealId(dealId);
  return useSyncExternalStore(
    subscribePaymentVerify,
    () => (id ? getPaymentVerify(id) : null),
    getServerSnapshot
  );
}
