import React, { useState } from "react";
import { Phone, CheckCircle2, Clock, User, X } from "lucide-react";
import StageStepper from "./StageStepper";

export default function AddP0ProspectModal({ isOpen, onClose, onAddProspect }) {
  const [formData, setFormData] = useState({
    source: "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });

  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      setError("First Name is required");
      return;
    }
    if (!formData.mobile.trim() && !formData.email.trim()) {
      setError("Filling details of either Mobile or Email is compulsory");
      return;
    }

    const newLead = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      mmlId: `MML-${Math.floor(10000 + Math.random() * 90000)}`,
      temperature: "Warm",
      priority: "High",
      score: 8.0,
      completion: 25,
      days: 0,
      source: formData.source || "Manual Entry",
      hrs: 24,
      lastDiscussion: "Lead Created",
      nextAction: "Initial Contact",
      mobile: formData.mobile,
      email: formData.email,
    };

    onAddProspect(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FBFBFC] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-black/8 w-full max-w-[1000px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/8 shrink-0">
          <h2 className="text-[19px] font-bold text-[#111]">Add P0 Prospect</h2>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold text-[#4B5563] bg-white border border-black/10 rounded-xl hover:bg-[#F3F4F6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-[13px] font-semibold text-[#374151] bg-white border border-black/10 rounded-xl hover:bg-[#F3F4F6] transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[#7A0A17] hover:bg-[#640712] rounded-xl transition-colors shadow-sm"
            >
              Add Prospect
            </button>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="px-6 py-3 bg-white border-b border-black/6 shrink-0">
          <StageStepper activeStageId="P0" />
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto scrollbar-thin grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left Form Area */}
          <div className="flex flex-col gap-6">
            {/* Quick Capture Card */}
            <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-xs">
              <div className="mb-4">
                <h3 className="text-[13px] font-bold text-[#111]">Quick capture</h3>
                <p className="text-[11px] text-[#9CA3AF]">Log whatever the lead shared on first contact</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider mb-1.5">
                  SOURCE <span className="text-[#E8395B]">*</span>
                </label>
                <input
                  type="text"
                  name="source"
                  placeholder="if known"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full max-w-[320px] h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17] transition-colors"
                />
              </div>
            </div>

            {/* Whatever You Have Card */}
            <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="mb-4">
                  <h3 className="text-[13px] font-bold text-[#111] uppercase tracking-wider">WHATEVER YOU HAVE</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                      First Name <span className="text-[#E8395B]">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Full Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                      Last Name <span className="text-[#E8395B]">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-[12px] text-[#E8395B] font-semibold mt-3">{error}</p>}

              <p className="text-[11px] text-[#E8395B] font-medium text-right mt-6">
                Filling details of either one of Mobile or Email is Compulsory*
              </p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-4">
            {/* What happens on save Card */}
            <div className="bg-[#FFF5F6] border border-[#FDE8EA] rounded-2xl p-4">
              <h4 className="text-[13px] font-bold text-[#111] mb-2.5">What happens on save</h4>
              <ul className="flex flex-col gap-2 text-[11.5px] text-[#4B5563] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-[#E8395B] mt-1.5 shrink-0" />
                  A card lands in P0 Prospect on the Pipeline Board - unqualified, no scoring yet.
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-[#E8395B] mt-1.5 shrink-0" />
                  Duplicate check runs only on the fields you fill; a blank field is skipped, not flagged.
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-[#E8395B] mt-1.5 shrink-0" />
                  The executive follows up to fill the rest, then opens Add deal to capture bio-data and move the lead to P1 Qualified.
                </li>
              </ul>
            </div>

            {/* Data Analysis for Telecaller */}
            <div className="bg-white border border-black/8 rounded-2xl p-4">
              <h4 className="text-[13px] font-bold text-[#111] mb-3">Data analysis for telecaller</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="border border-black/6 rounded-xl p-3 bg-[#FAFAFB]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-[#EEF2FF] text-[#4F46E5]">
                      <Phone size={13} />
                    </div>
                    <span className="text-[16px] font-bold text-[#111]">32</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280]">Total Calls Today</p>
                </div>

                <div className="border border-black/6 rounded-xl p-3 bg-[#FAFAFB]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-[#E7F8EF] text-[#16A34A]">
                      <CheckCircle2 size={13} />
                    </div>
                    <span className="text-[16px] font-bold text-[#111]">12</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280]">Connected (37.5%)</p>
                </div>

                <div className="border border-black/6 rounded-xl p-3 bg-[#FAFAFB]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#D97706]">
                      <Clock size={13} />
                    </div>
                    <span className="text-[16px] font-bold text-[#111]">18</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280]">Avg. Call Duration 02:48 mins</p>
                </div>

                <div className="border border-black/6 rounded-xl p-3 bg-[#FAFAFB]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-[#E8F2FE] text-[#2563EB]">
                      <User size={13} />
                    </div>
                    <span className="text-[16px] font-bold text-[#111]">5</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280]">Prospects Added Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
