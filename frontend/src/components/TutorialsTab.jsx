import { useMemo, useState } from "react";
import {
  BookOpen,
  Clock,
  Filter,
  Play,
  Search,
  GraduationCap,
} from "lucide-react";
import Modal from "./ui/Modal";

const CATEGORIES = ["All", "Getting Started", "Sales Pipeline", "Calendar", "HRMS", "Documents"];

const TUTORIALS = [
  {
    id: 1,
    title: "Getting Started with MML Sales",
    category: "Getting Started",
    duration: "8:42",
    level: "Beginner",
    description:
      "Walk through the dashboard, sidebar navigation, and how to find leads, tasks, and your daily priorities.",
    videoId: "M7lc1UVf-VE",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
    steps: ["Open Dashboard", "Review today’s tasks", "Check pipeline summary", "Set your first follow-up"],
  },
  {
    id: 2,
    title: "Create & Qualify a Lead (P0–P2)",
    category: "Sales Pipeline",
    duration: "12:15",
    level: "Beginner",
    description:
      "Learn how to add a lead, fill intake fields, and move the deal through early pipeline stages correctly.",
    videoId: "aqz-KE-bpKQ",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    steps: ["Add lead via Bulk Upload or form", "Complete basic profile", "Log first contact", "Advance to P2"],
  },
  {
    id: 3,
    title: "Video Calls & Home Visits",
    category: "Sales Pipeline",
    duration: "10:05",
    level: "Intermediate",
    description:
      "Schedule P3 video calls and home/office visits, capture outcomes, and keep the deal timeline accurate.",
    videoId: "LXb3EKWsInQ",
    thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop",
    steps: ["Schedule meeting", "Attach meeting notes", "Update stage", "Set next action"],
  },
  {
    id: 4,
    title: "Calendar & Meetings Setup",
    category: "Calendar",
    duration: "7:30",
    level: "Beginner",
    description:
      "Create meetings, choose video/telephonic/face-to-face types, and manage follow-ups from the calendar.",
    videoId: "hY7m5jjJ9mM",
    thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=450&fit=crop",
    steps: ["Open Calendar", "Create meeting event", "Add participants", "Confirm reminder"],
  },
  {
    id: 5,
    title: "Attendance & Timesheet in HRMS",
    category: "HRMS",
    duration: "9:18",
    level: "Beginner",
    description:
      "Mark attendance, submit timesheets, and raise regularization requests when punches are missing.",
    videoId: "EngW7tLk6R8",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop",
    steps: ["Open HRMS", "Go to Attendance", "Submit timesheet", "Track approval status"],
  },
  {
    id: 6,
    title: "Documents & Media Library",
    category: "Documents",
    duration: "6:50",
    level: "Beginner",
    description:
      "Upload company media, organize folders, and find published HR documents for download.",
    videoId: "tgbNymZ7vqY",
    thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=450&fit=crop",
    steps: ["Open Documents & Media", "Browse documents", "Upload to Media", "Create folders"],
  },
  {
    id: 7,
    title: "Pipeline Handover to Post-Sales",
    category: "Sales Pipeline",
    duration: "11:22",
    level: "Advanced",
    description:
      "Complete P6 checklist items, verify photos/KYC, and hand over a closed deal cleanly to post-sales.",
    videoId: "C0DPdy98e4c",
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop",
    steps: ["Open P6 checklist", "Verify documents", "Confirm handover fields", "Mark deal complete"],
  },
  {
    id: 8,
    title: "Incentives & Performance Tracking",
    category: "HRMS",
    duration: "8:05",
    level: "Intermediate",
    description:
      "Understand registration, meeting, and performance incentives and how counts map to payout.",
    videoId: "jNQXAC9IVRw",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop",
    steps: ["Open Incentives tab", "Review registration rows", "Check meeting incentives", "Validate totals"],
  },
];

const LEVEL_STYLES = {
  Beginner: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20",
  Intermediate: "bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/20",
  Advanced: "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20",
};

function TutorialPlayerModal({ tutorial, onClose }) {
  if (!tutorial) return null;

  return (
    <Modal
      open={!!tutorial}
      onClose={onClose}
      title={tutorial.title}
      subtitle={`${tutorial.category} · ${tutorial.duration} · ${tutorial.level}`}
      icon={<Play size={18} />}
      iconBg="#fbebec"
      iconColor="#7A0A17"
      width="max-w-[980px]"
    >
      <div className="flex flex-col gap-5">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            title={tutorial.title}
            src={`https://www.youtube.com/embed/${tutorial.videoId}?autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          <div>
            <p className="text-sm font-bold text-[#111827] mb-1.5">About this tutorial</p>
            <p className="text-sm text-[#6B7280] leading-relaxed">{tutorial.description}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-[#FAFAFB] p-4">
            <p className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
              <BookOpen size={15} className="text-[#7A0A17]" />
              What you’ll cover
            </p>
            <ol className="flex flex-col gap-2">
              {tutorial.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-2.5 text-sm text-[#374151]">
                  <span className="size-5 rounded-md bg-[#7A0A17] text-white text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function TutorialsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TUTORIALS.filter((t) => {
      const catOk = category === "All" || t.category === category;
      const searchOk =
        !q ||
        `${t.title} ${t.category} ${t.level} ${t.description}`.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [search, category]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutorials..."
            className="w-full bg-white border border-black/12 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-[#7A0A17]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6B7280] mr-1">
            <Filter size={13} /> Category
          </span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                category === c
                  ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                  : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
        <GraduationCap size={14} className="text-[#7A0A17]" />
        {filtered.length} tutorial{filtered.length !== 1 ? "s" : ""} available
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((tutorial) => (
          <button
            key={tutorial.id}
            type="button"
            onClick={() => setActive(tutorial)}
            className="group text-left bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-black/20 transition-all"
          >
            <div className="relative aspect-video bg-[#f4f4f6] overflow-hidden">
              <img
                src={tutorial.thumbnail}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="size-12 rounded-full bg-white/95 text-[#7A0A17] grid place-items-center shadow-lg group-hover:scale-105 transition-transform">
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                </span>
              </span>
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                <Clock size={11} /> {tutorial.duration}
              </span>
            </div>

            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFEDD5] text-[#C2410C] border border-[#EA580C]/20">
                  {tutorial.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    LEVEL_STYLES[tutorial.level] || LEVEL_STYLES.Beginner
                  }`}
                >
                  {tutorial.level}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-[#111827] leading-snug group-hover:text-[#7A0A17] transition-colors">
                {tutorial.title}
              </h3>
              <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                {tutorial.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7A0A17] mt-1">
                <Play size={12} fill="currentColor" /> Watch tutorial
              </span>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-[#8a8a8a] py-14">
            No tutorials match your search.
          </p>
        )}
      </div>

      <TutorialPlayerModal tutorial={active} onClose={() => setActive(null)} />
    </div>
  );
}
