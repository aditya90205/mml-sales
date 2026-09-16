import useAppFitScale, { DESIGN_WIDTH, supportsCssZoom } from "../../hooks/useAppFitScale";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Layout({ children }) {
  const scale = useAppFitScale();
  const needsTransformFallback = scale < 1 && !supportsCssZoom();

  return (
    <div
      className="min-h-screen bg-[#F7F8FA] overflow-x-hidden"
      style={
        needsTransformFallback
          ? {
              width: DESIGN_WIDTH,
              minHeight: "var(--app-vh)",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }
          : undefined
      }
    >
      <Sidebar />
      {/* ml matches the 58px icon-only rail */}
      <main className="ml-[58px] pt-[56px] min-h-screen flex flex-col overflow-x-hidden">
        <TopBar />
        {children}
      </main>
    </div>
  );
}
