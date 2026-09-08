import { PromotionsTransfersSection } from "../components/hrms/PromotionTransferSection.jsx";
import { USER } from "../components/layout/TopBar";

export default function PromotionsTransfersPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F7F8FA] text-[#111827] font-sans">
      <div className="p-4 sm:p-5 lg:p-6 flex flex-col gap-5 w-full max-w-none">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#E8395B]">
            YOU ARE VIEWING
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mt-1">
            Promotion and Transfers
          </h1>
          <p className="text-[13.5px] text-[#6B7280] mt-1">
            View promotion history and submit or track transfer requests.
          </p>
        </div>

        <PromotionsTransfersSection
          employee={{
            name: USER.name,
            id: "MML-E-1001",
            email: USER.email,
            branch: "South Extension",
            department: "Sales",
            designation: USER.role,
          }}
        />
      </div>
    </div>
  );
}
