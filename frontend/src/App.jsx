import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import PipelineBoard from "./pages/PipelineBoard";
import HrmsPage from "./pages/HrmsPage";
import BulkImportPage from "./pages/BulkImportPage";
import TasksPage from "./pages/TasksPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CalendarPage from "./pages/CalendarPage";
import LoginPage from "./pages/LoginPage";
import CampaignManagementPage from "./pages/CampaignManagementPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import ClientDatabasePage from "./pages/ClientDatabasePage";
import CreateGroupPage from "./pages/CreateGroupPage";
import WinLossAnalysisPage from "./pages/WinLossAnalysisPage";
import PackagesPlansPage from "./pages/PackagesPlansPage";
import IncentiveStatementPage from "./pages/IncentiveStatementPage";
import ColdCommonPoolPage from "./pages/ColdCommonPoolPage";
import PostSalesPage from "./pages/PostSalesPage";
import ProfileSettings from "./pages/ProfileSettings";
import HomeOfficeVisitsPage from "./pages/pipeline/desk/HomeOfficeVisitsPage";
import CrossBranchFlagsPage from "./pages/pipeline/desk/CrossBranchFlagsPage";
import QuotationsPage from "./pages/pipeline/desk/QuotationsPage";
import DiscountRequestsPage from "./pages/pipeline/desk/DiscountRequestsPage";
import ContractPaymentPage from "./pages/pipeline/desk/ContractPaymentPage";
import P6HandoverPage from "./pages/pipeline/desk/P6HandoverPage";

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
      {/* Toast notifications with close button & progress timer bar */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: "13.5px",
          fontWeight: 500,
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        }}
      />

      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

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
          element={<LayoutRoute><ClientDatabasePage /></LayoutRoute>}
        />
        <Route
          path="/clients/create-group"
          element={<LayoutRoute><CreateGroupPage /></LayoutRoute>}
        />
        <Route
          path="/win-loss"
          element={<LayoutRoute><WinLossAnalysisPage /></LayoutRoute>}
        />
        <Route
          path="/packages"
          element={<LayoutRoute><PackagesPlansPage /></LayoutRoute>}
        />
        <Route
          path="/incentives"
          element={<LayoutRoute><IncentiveStatementPage /></LayoutRoute>}
        />
        <Route
          path="/cold-pool"
          element={<LayoutRoute><ColdCommonPoolPage /></LayoutRoute>}
        />
        <Route
          path="/post-sales"
          element={<LayoutRoute><PostSalesPage /></LayoutRoute>}
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
        <Route path="/hrms"         element={<LayoutRoute><HrmsPage /></LayoutRoute>} />
        <Route path="/calendar"     element={<LayoutRoute><CalendarPage /></LayoutRoute>} />
        <Route path="/tasks"        element={<LayoutRoute><TasksPage /></LayoutRoute>} />
        <Route path="/bulk-upload"  element={<LayoutRoute><BulkImportPage /></LayoutRoute>} />
        <Route path="/pipeline"     element={<LayoutRoute><PipelineBoard /></LayoutRoute>} />
        <Route path="/pipeline/visits"             element={<LayoutRoute><HomeOfficeVisitsPage /></LayoutRoute>} />
        <Route path="/pipeline/cross-branch"       element={<LayoutRoute><CrossBranchFlagsPage /></LayoutRoute>} />
        <Route path="/pipeline/quotations"         element={<LayoutRoute><QuotationsPage /></LayoutRoute>} />
        <Route path="/pipeline/discount-requests"  element={<LayoutRoute><DiscountRequestsPage /></LayoutRoute>} />
        <Route path="/pipeline/contract-payment"   element={<LayoutRoute><ContractPaymentPage /></LayoutRoute>} />
        <Route path="/pipeline/p6-handover"        element={<LayoutRoute><P6HandoverPage /></LayoutRoute>} />
        <Route path="/leaderboard"  element={<LayoutRoute><LeaderboardPage /></LayoutRoute>} />
        <Route path="/contest"      element={<LayoutRoute><Placeholder title="Contest" /></LayoutRoute>} />
        <Route path="/campaign/management" element={<LayoutRoute><CampaignManagementPage /></LayoutRoute>} />
        <Route path="/campaign/create"     element={<LayoutRoute><CreateCampaignPage /></LayoutRoute>} />

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
          element={<LayoutRoute><ProfileSettings /></LayoutRoute>}
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
