import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import PipelineBoard from "./pages/PipelineBoard";

// ── Placeholder for pages not yet built ──────────────────────────────────────
function Placeholder({ title }) {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-center flex-1 min-h-[60vh]">
        <div className="text-center">
          <p className="text-4xl mb-3">🚧</p>
          <p className="text-lg font-semibold text-[#1a1a1a]">{title}</p>
          <p className="text-sm text-[#8f95a5] mt-1">This page is coming soon.</p>
        </div>
      </div>
    </div>
  );
}

// ── Route helpers ─────────────────────────────────────────────────────────────
function LayoutRoute({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  const basename = import.meta.env.BASE_URL?.replace(/\/$/, "") || undefined;

  return (
    <BrowserRouter basename={basename}>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          },
          success: {
            style: {
              background: "#eafdec",
              color: "#12a44a",
              border: "1px solid #c8f0d4",
            },
            iconTheme: { primary: "#12a44a", secondary: "#eafdec" },
          },
          error: {
            style: {
              background: "#fef1f4",
              color: "#df264f",
              border: "1px solid #f7d3d9",
            },
            iconTheme: { primary: "#df264f", secondary: "#fef1f4" },
          },
        }}
      />

      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <LayoutRoute>
              <Dashboard />
            </LayoutRoute>
          }
        />

        {/* ── Sales ── */}
        <Route
          path="/clients"
          element={<LayoutRoute><Placeholder title="My Clients" /></LayoutRoute>}
        />
        <Route
          path="/sales/funnel"
          element={<LayoutRoute><Placeholder title="Sales Funnel" /></LayoutRoute>}
        />
        <Route
          path="/sales/leads"
          element={<LayoutRoute><Placeholder title="Lead Management" /></LayoutRoute>}
        />
        <Route
          path="/sales/proposals"
          element={<LayoutRoute><Placeholder title="Proposals" /></LayoutRoute>}
        />
        <Route
          path="/follow-ups"
          element={<LayoutRoute><Placeholder title="Follow-Ups" /></LayoutRoute>}
        />
        <Route
          path="/profiles"
          element={<LayoutRoute><Placeholder title="Profiles" /></LayoutRoute>}
        />
        <Route
          path="/matches"
          element={<LayoutRoute><Placeholder title="Matches" /></LayoutRoute>}
        />

        {/* ── Sidebar nav pages ── */}
        <Route path="/hrms"         element={<LayoutRoute><Placeholder title="HRMS" /></LayoutRoute>} />
        <Route path="/calendar"     element={<LayoutRoute><Placeholder title="Calendar" /></LayoutRoute>} />
        <Route path="/tasks"        element={<LayoutRoute><Placeholder title="Tasks" /></LayoutRoute>} />
        <Route path="/bulk-upload"  element={<LayoutRoute><Placeholder title="Bulk Upload" /></LayoutRoute>} />
        <Route path="/pipeline"     element={<LayoutRoute><PipelineBoard /></LayoutRoute>} />
        <Route path="/leaderboard"  element={<LayoutRoute><Placeholder title="Leaderboard" /></LayoutRoute>} />
        <Route path="/contest"      element={<LayoutRoute><Placeholder title="Contest" /></LayoutRoute>} />

        {/* ── Activities ── */}
        <Route
          path="/meetings"
          element={<LayoutRoute><Placeholder title="Meetings" /></LayoutRoute>}
        />
        <Route
          path="/announcements"
          element={<LayoutRoute><Placeholder title="Announcements" /></LayoutRoute>}
        />

        {/* ── Reports & Media ── */}
        <Route
          path="/reports"
          element={<LayoutRoute><Placeholder title="Reports" /></LayoutRoute>}
        />
        <Route
          path="/targets"
          element={<LayoutRoute><Placeholder title="Targets" /></LayoutRoute>}
        />
        <Route
          path="/reviews"
          element={<LayoutRoute><Placeholder title="Reviews" /></LayoutRoute>}
        />
        <Route
          path="/media"
          element={<LayoutRoute><Placeholder title="Media Library" /></LayoutRoute>}
        />
        <Route
          path="/documents"
          element={<LayoutRoute><Placeholder title="Documents" /></LayoutRoute>}
        />

        {/* ── System ── */}
        <Route
          path="/settings"
          element={<LayoutRoute><Placeholder title="Settings" /></LayoutRoute>}
        />
        <Route
          path="/support"
          element={<LayoutRoute><Placeholder title="Help & Support" /></LayoutRoute>}
        />
        <Route
          path="/profile"
          element={<LayoutRoute><Placeholder title="Profile Settings" /></LayoutRoute>}
        />
        <Route
          path="/notifications"
          element={<LayoutRoute><Placeholder title="Notifications" /></LayoutRoute>}
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={<LayoutRoute><Placeholder title="Page Not Found" /></LayoutRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}
