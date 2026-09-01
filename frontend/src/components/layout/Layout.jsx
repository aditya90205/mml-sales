import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      {/* ml matches the 58px icon-only rail */}
      <main className="ml-[58px] min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}