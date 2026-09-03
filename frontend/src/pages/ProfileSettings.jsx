import { useState } from "react";
import { toast } from "react-toastify";
import { User, Lock, Camera } from "lucide-react";
import { USER } from "../components/layout/TopBar";

function SectionCard({ id, title, subtitle, children }) {
  return (
    <div id={id} className="bg-white border border-black/8 rounded-2xl p-6 max-w-[900px] scroll-mt-24">
      <h2 className="text-[17px] font-bold text-[#111]">{title}</h2>
      <p className="text-[13px] text-[#6B7280] mt-1">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ProfileTab() {
  const [name, setName] = useState(USER.name);
  const [email, setEmail] = useState(USER.email);
  const [avatar, setAvatar] = useState(USER.avatar);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller.");
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatar(url);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    toast.success("Profile updated successfully.");
  };

  return (
    <SectionCard id="profile" title="Profile Information" subtitle="Update your account's profile information and email address">
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <img src={avatar} alt={name} className="size-20 rounded-full object-cover" />
          <div className="flex flex-col gap-1.5">
            <label className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-black/10 text-[13px] font-medium text-[#111] hover:bg-[#FAFAFB] cursor-pointer w-fit">
              <Camera size={16} /> Change Avatar
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            <p className="text-[11px] text-[#9CA3AF]">JPG, PNG, GIF up to 2MB</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-[#111]">Name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 px-4 rounded-xl border border-black/10 text-[15px] outline-none focus:border-[#7A0A17]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-[#111]">Email address</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 px-4 rounded-xl border border-black/10 text-[15px] outline-none focus:border-[#7A0A17]/40"
          />
        </div>

        <button
          type="submit"
          className="self-start h-11 px-6 rounded-xl bg-[#16A34A] text-white text-[13px] font-semibold hover:bg-[#15803D] transition-colors"
        >
          Save
        </button>
      </form>
    </SectionCard>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.current || !form.next || !form.confirm) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (form.next !== form.confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    toast.success("Password updated successfully.");
    setForm({ current: "", next: "", confirm: "" });
  };

  return (
    <SectionCard id="password" title="Update Password" subtitle="Ensure your account is using a long, random password to stay secure">
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-[#111]">Current Password</p>
          <input
            type="password"
            value={form.current}
            onChange={(e) => set("current")(e.target.value)}
            className="h-12 px-4 rounded-xl border border-black/10 text-[15px] outline-none focus:border-[#7A0A17]/40"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-[#111]">New Password</p>
          <input
            type="password"
            value={form.next}
            onChange={(e) => set("next")(e.target.value)}
            className="h-12 px-4 rounded-xl border border-black/10 text-[15px] outline-none focus:border-[#7A0A17]/40"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-[#111]">Confirm Password</p>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => set("confirm")(e.target.value)}
            className="h-12 px-4 rounded-xl border border-black/10 text-[15px] outline-none focus:border-[#7A0A17]/40"
          />
        </div>
        <button
          type="submit"
          className="self-start h-11 px-6 rounded-xl bg-[#16A34A] text-white text-[13px] font-semibold hover:bg-[#15803D] transition-colors"
        >
          Save
        </button>
      </form>
    </SectionCard>
  );
}

export default function ProfileSettings() {
  const [tab, setTab] = useState("profile");

  const goTo = (id) => {
    setTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="px-5 pt-5 pb-12">
      <h1 className="text-[22px] font-bold text-[#111] tracking-tight mb-6">Profile Settings</h1>

      <div className="flex gap-6 items-start flex-col md:flex-row">
        <div className="w-full md:w-[220px] shrink-0 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => goTo("profile")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
              tab === "profile" ? "bg-[#F1F2F4] text-[#111] font-semibold" : "text-[#6B7280] hover:bg-black/4"
            }`}
          >
            <User size={16} /> Profile
          </button>
          <button
            type="button"
            onClick={() => goTo("password")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
              tab === "password" ? "bg-[#F1F2F4] text-[#111] font-semibold" : "text-[#6B7280] hover:bg-black/4"
            }`}
          >
            <Lock size={16} /> Password
          </button>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          <ProfileTab />
          <PasswordTab />
        </div>
      </div>
    </div>
  );
}
