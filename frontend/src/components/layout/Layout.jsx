import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Sidebar />
      {/* ml-[64px] matches the 64px icon-only sidebar */}
      <main className="ml-[64px] min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
