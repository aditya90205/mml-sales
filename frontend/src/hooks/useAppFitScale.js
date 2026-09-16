import { useEffect, useState } from "react";

/** Layout matches this width at 100%. Narrower screens scale down instead of crowding. */
export const DESIGN_WIDTH = 1440;
const MIN_SCALE = 0.75;

function readScale() {
  if (typeof window === "undefined") return 1;
  const width = window.innerWidth || DESIGN_WIDTH;
  if (width >= DESIGN_WIDTH) return 1;
  return Math.max(MIN_SCALE, Number((width / DESIGN_WIDTH).toFixed(4)));
}

function supportsCssZoom() {
  if (typeof window === "undefined") return false;
  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("zoom", "1");
  }
  return "zoom" in document.documentElement.style;
}

function applyScale(scale) {
  const root = document.documentElement;
  root.style.setProperty("--app-scale", String(scale));
  root.style.setProperty("--app-vh", `${(100 / scale).toFixed(4)}vh`);

  if (!supportsCssZoom()) {
    root.style.removeProperty("zoom");
    root.style.removeProperty("width");
    root.style.removeProperty("overflow-x");
    return;
  }

  if (scale < 1) {
    root.style.zoom = String(scale);
    root.style.width = `${DESIGN_WIDTH}px`;
    root.style.overflowX = "hidden";
  } else {
    root.style.removeProperty("zoom");
    root.style.removeProperty("width");
    root.style.removeProperty("overflow-x");
  }
}

function clearScale() {
  const root = document.documentElement;
  root.style.setProperty("--app-scale", "1");
  root.style.setProperty("--app-vh", "100vh");
  root.style.removeProperty("zoom");
  root.style.removeProperty("width");
  root.style.removeProperty("overflow-x");
}

/**
 * Keeps the authenticated shell looking like the 1440px / 100% design.
 * Smaller laptops and 125–150% OS scaling shrink uniformly instead of overflowing.
 */
export default function useAppFitScale() {
  const [scale, setScale] = useState(readScale);

  useEffect(() => {
    const update = () => {
      const next = readScale();
      setScale((prev) => (prev === next ? prev : next));
      applyScale(next);
    };

    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      clearScale();
    };
  }, []);

  return scale;
}

export { supportsCssZoom };
