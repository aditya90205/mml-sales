import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CalendarDays,
  CalendarCheck,
  Building2,
  MapPin,
  Briefcase,
  CircleAlert,
  FileText,
  Eye,
  Trash2,
  Download,
} from "lucide-react";
import { USER } from "../components/layout/TopBar";

const STATUS_STYLES = {
  Active: "bg-[#eafdec] text-[#12a44a]",
  "New Joinee": "bg-[#ecf4ff] text-[#2b7fff]",
  Verified: "bg-[#eafdec] text-[#12a44a]",
};

const TABS = ["Basic Info", "Employment", "Contact", "Banking", "Certifications", "Documents"];

const CURRENT_EMPLOYEE = {
  id: "EMP00116",
  name: USER.name,
  phone: "+91 9836753467",
  avatar: USER.avatar,
  designation: USER.role,
  branch: "South Extension",
  status: "Active",
  profile: {
    email: USER.email,
    dob: "1994-06-12",
    joinedFull: "2023-10-21",
    departmentFull: "Sales",
    employeeType: "Permanent",
    basic: {
      fullName: USER.name,
      employeeId: "EMP00116",
      residentOfIndia: "Yes",
      citizenship: "India",
      aadhar: "8110 9878 4567",
      pan: "BITYU6075C",
      email: USER.email,
      phone: "9856455643",
      employeeCode: "116",
      dob: "1994-06-12",
      gender: "Male",
      joiningDate: "21-10-23",
      status: "Active",
    },
    employment: {
      branch: "South Extension",
      department: "Sales",
      designation: USER.role,
      dateOfJoining: "21-10-23",
      employeeType: "Permanent",
      employmentStatus: "Active",
      shift: "General Shift (9:00 AM - 6:00 PM)",
      attendancePolicy: "Standard Attendance Policy",
    },
    contact: {
      addressLine1: "House no-81",
      addressLine2: "-",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      postal: "110049",
      emergencyName: "Aditya Sharma",
      emergencyRelationship: "Brother",
      emergencyPhone: "9809677896",
    },
    banking: {
      bankName: "State Bank",
      accountHolder: USER.name,
      accountNumber: "2236786540987",
      bic: "VCA567854",
      bankBranch: "South Extension",
      baseSalary: "75,000.00",
      taxPayerId: "TGYUMMUJ7865",
    },
    certifications: [
      { title: "Joining Letter", description: "Official joining letter document" },
      { title: "Experience Certificate", description: "Work experience certificate" },
      { title: "NOC", description: "No Objection Certificate" },
    ],
    documents: [
      { title: "Identity Proof", expires: "2027-07-31", status: "Active", statusTone: "danger" },
      { title: "Address Proof", expires: "2027-07-31", status: "Verified", statusTone: "success" },
      { title: "Experience Letters", expires: "2027-07-31", status: "Verified", statusTone: "success" },
      { title: "Medical Certificate", expires: "2027-07-31", status: "Verified", statusTone: "success" },
    ],
  },
};

function downloadFile(item, fallbackName = "document") {
  const fileName = `${item.title || fallbackName}.txt`;
  const content = [
    item.title || fallbackName,
    item.description ? `Description: ${item.description}` : "",
    item.expires ? `Expires: ${item.expires}` : "",
    item.status ? `Status: ${item.status}` : "",
    "",
    "This is a sample download from Make My Lagan Sales.",
  ]
    .filter(Boolean)
    .join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast.success(`"${item.title || fileName}" download started.`);
}

function InfoField({ label, value, alert }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-[#6f7886]">{label}</p>
      <div className="flex items-center gap-1.5">
        {alert && <CircleAlert size={14} className="text-[#E8395B] shrink-0" />}
        <p className="text-sm font-semibold text-[#111]">{value || "—"}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 flex flex-col gap-6">
      <h3 className="text-base font-semibold text-[#111]">{title}</h3>
      {children}
    </div>
  );
}

function ProfileSidebar({ emp }) {
  const p = emp.profile;
  const items = [
    { icon: User, text: `Employee ID: ${emp.id}` },
    { icon: Mail, text: p.email },
    { icon: Phone, text: emp.phone },
    { icon: CalendarDays, text: `DOB: ${p.dob}` },
    { icon: CalendarCheck, text: `Joined: ${p.joinedFull}` },
    { icon: Building2, text: p.departmentFull },
    { icon: MapPin, text: emp.branch },
    { icon: Briefcase, text: p.employeeType },
  ];

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 flex flex-col items-center gap-4 shrink-0 w-full xl:w-[280px]">
      <img src={emp.avatar} alt={emp.name} className="size-[120px] rounded-full object-cover" />
      <div className="text-center">
        <p className="text-lg font-semibold text-[#111]">{emp.name}</p>
        <p className="text-sm text-[#6f7886] mt-0.5">{emp.designation}</p>
      </div>
      <span className={`text-xs font-medium rounded-lg px-3 py-1 ${STATUS_STYLES[emp.status] ?? "bg-gray-100 text-gray-600"}`}>
        {emp.status}
      </span>
      <div className="w-full flex flex-col gap-4 pt-2">
        {items.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <Icon size={16} className="text-[#8f95a5] shrink-0" strokeWidth={1.75} />
            <p className="text-sm text-[#4a4a4a]">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BasicInfoTab({ basic }) {
  const [joiningDate, setJoiningDate] = useState(basic.joiningDate);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
          <InfoField label="Full Name" value={basic.fullName} />
          <InfoField label="Employee ID" value={basic.employeeId} />
          <InfoField label="Resident of India" value={basic.residentOfIndia} />
          <InfoField label="Citizenship" value={basic.citizenship} />
          <InfoField label="Aadhar Card" value={basic.aadhar} />
          <InfoField label="Pan Card" value={basic.pan} />
          <InfoField label="Email" value={basic.email} />
          <InfoField label="Phone Number" value={basic.phone} />
          <InfoField label="Employee Code" value={basic.employeeCode} />
          <InfoField label="Date of Birth" value={basic.dob} alert={!basic.dob} />
          <InfoField label="Gender" value={basic.gender} />
        </div>
      </SectionCard>

      <SectionCard title="Status">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-[#6f7886]">Enter Joining Date</p>
              <CircleAlert size={14} className="text-[#E8395B]" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="h-10 px-3 rounded-lg border border-black/10 text-sm font-semibold text-[#111] w-[140px] outline-none focus:border-[#7A0A17]"
              />
              <button
                type="button"
                onClick={() => toast.success("Joining date verified.")}
                className="h-10 px-5 rounded-lg border border-[#F7C9CF] bg-[#FEF1F4] text-sm font-semibold text-[#7A0A17] hover:bg-[#FDE8EC] transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-[#6f7886]">Status</p>
            <span className={`text-xs font-medium rounded-lg px-3 py-1 w-fit ${STATUS_STYLES[basic.status] ?? "bg-gray-100 text-gray-600"}`}>
              {basic.status}
            </span>
          </div>
        </div>
        <p className="text-sm text-[#2b7fff]">
          Verify and update details for new joinees and enter joining date for make it active{" "}
          <span className="text-[#E8395B]">*</span>
        </p>
      </SectionCard>
    </div>
  );
}

function EmploymentTab({ employment }) {
  return (
    <SectionCard title="Employment Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
        <InfoField label="Branch" value={employment.branch} />
        <InfoField label="Department" value={employment.department} />
        <InfoField label="Designation" value={employment.designation} />
        <InfoField label="Date of Joining" value={employment.dateOfJoining} />
        <InfoField label="Employee Type" value={employment.employeeType} />
        <InfoField label="Employment Status" value={employment.employmentStatus} />
        <InfoField label="Shift" value={employment.shift} />
        <InfoField label="Attendance Policy" value={employment.attendancePolicy} />
      </div>
    </SectionCard>
  );
}

function ContactTab({ contact }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
          <InfoField label="Address Line 1" value={contact.addressLine1} />
          <InfoField label="Address Line 2" value={contact.addressLine2} />
          <InfoField label="City" value={contact.city} />
          <InfoField label="State" value={contact.state} />
          <InfoField label="Country" value={contact.country} />
          <InfoField label="Postal" value={contact.postal} />
        </div>
      </SectionCard>

      <SectionCard title="Emergency Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
          <InfoField label="Name" value={contact.emergencyName} />
          <InfoField label="Relationship" value={contact.emergencyRelationship} />
          <InfoField label="Phone Number" value={contact.emergencyPhone} />
        </div>
      </SectionCard>
    </div>
  );
}

function BankingTab({ banking }) {
  return (
    <SectionCard title="Banking Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
        <InfoField label="Bank Name" value={banking.bankName} />
        <InfoField label="Account Holder Name" value={banking.accountHolder} />
        <InfoField label="Account Number" value={banking.accountNumber} />
        <InfoField label="Bank Identifier Code (BIC/SWIFT)" value={banking.bic} />
        <InfoField label="Bank Branch" value={banking.bankBranch} />
        <InfoField label="Base Salary" value={banking.baseSalary} />
        <InfoField label="Tax Payer ID" value={banking.taxPayerId} />
      </div>
    </SectionCard>
  );
}

function CertificationsTab({ certifications }) {
  const [items, setItems] = useState(() => [...(certifications || [])]);

  return (
    <SectionCard title="Certifications">
      {items.length === 0 ? (
        <p className="text-sm text-[#6f7886]">No certificates available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((cert, index) => (
            <div key={`${cert.title}-${index}`} className="border border-black/10 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#111]">{cert.title}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => toast.info(`Viewing ${cert.title}`)} className="text-[#e8b400] hover:opacity-80" title="View">
                    <Eye size={18} />
                  </button>
                  <button type="button" onClick={() => downloadFile(cert, "certificate")} className="text-[#305cde] hover:opacity-80" title="Download">
                    <Download size={18} />
                  </button>
                  <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))} className="text-[#E8395B] hover:opacity-80" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#F7F8FA] grid place-items-center shrink-0">
                  <FileText size={20} className="text-[#8f95a5]" />
                </div>
                <p className="text-xs text-[#6f7886]">{cert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function DocumentsTab({ documents }) {
  const [items, setItems] = useState(() => [...(documents || [])]);
  const docStatusStyles = {
    danger: "bg-[#fef1f4] text-[#df264f]",
    success: "bg-[#eafdec] text-[#12a44a]",
  };

  return (
    <SectionCard title="Documents">
      {items.length === 0 ? (
        <p className="text-sm text-[#6f7886]">No documents available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((doc, index) => (
            <div key={`${doc.title}-${index}`} className="border border-black/10 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#111]">{doc.title}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => toast.info(`Viewing ${doc.title}`)} className="text-[#e8b400] hover:opacity-80" title="View">
                    <Eye size={18} />
                  </button>
                  <button type="button" onClick={() => downloadFile(doc, "document")} className="text-[#305cde] hover:opacity-80" title="Download">
                    <Download size={18} />
                  </button>
                  <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))} className="text-[#E8395B] hover:opacity-80" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#F7F8FA] grid place-items-center shrink-0">
                  <FileText size={20} className="text-[#8f95a5]" />
                </div>
                <div>
                  <p className="text-xs text-[#6f7886]">Expires: {doc.expires}</p>
                  <span className={`text-xs font-medium rounded-lg px-2.5 py-0.5 mt-1 inline-block ${docStatusStyles[doc.statusTone] ?? "bg-gray-100 text-gray-600"}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Basic Info");
  const emp = CURRENT_EMPLOYEE;
  const p = emp.profile;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Basic Info":
        return <BasicInfoTab basic={p.basic} />;
      case "Employment":
        return <EmploymentTab employment={p.employment} />;
      case "Contact":
        return <ContactTab contact={p.contact} />;
      case "Banking":
        return <BankingTab banking={p.banking} />;
      case "Certifications":
        return <CertificationsTab certifications={p.certifications} />;
      case "Documents":
        return <DocumentsTab documents={p.documents} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-12 max-w-[1400px] w-full mx-auto">
      <div className="flex items-center justify-end mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 h-10 px-5 rounded-lg border border-black/10 bg-white text-sm font-medium text-[#111] hover:bg-[#FAFAFB] transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <ProfileSidebar emp={emp} />

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="bg-[#EEF0F4] rounded-xl p-1 flex items-center gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    isActive ? "bg-white text-[#111] shadow-sm" : "text-[#6f7886] hover:text-[#111]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
