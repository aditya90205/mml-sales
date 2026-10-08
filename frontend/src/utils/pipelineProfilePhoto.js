import { useSyncExternalStore } from "react";

const STORAGE_KEY = "mml_pipeline_profile_photos";
const EVENT = "mml-pipeline-profile-photo";

function readMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function readPipelineProfilePhoto(leadId) {
  if (!leadId) return "";
  return readMap()[leadId] || "";
}

export function savePipelineProfilePhoto(leadId, dataUrl) {
  if (!leadId || !dataUrl) return;
  const map = readMap();
  map[leadId] = dataUrl;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onStoreChange) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function usePipelineProfilePhoto(leadId) {
  return useSyncExternalStore(
    subscribe,
    () => readPipelineProfilePhoto(leadId),
    () => ""
  );
}
