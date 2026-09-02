import React, { useState, useEffect } from "react";
import { Paperclip, Upload, X } from "lucide-react";
import StageStepper from "./StageStepper";

export default function MoveToP2Modal({ isOpen, lead, onClose, onMoveToP2 }) {
  const [formData, setFormData] = useState({
    firstName: "Priya",
    lastName: "Raheja",
    mobile: "+91 9888097856",
    alternateContact: "+91 9888096578",
    occupation: "Chartered Accountant",
    incomeBracket: "₹25-50L p.a.",
    city: "Gurugram",
    dob: "Not Set",
    height: "Not Set",
    areaOfHouse: "Locality",
    agreedMeeting: "Not Set",
    partnerNotes: "Not set",
    branch: "South Ex",
    referredBy: "Not Set",
    consent: "Captured on call",
  });

  useEffect(() => {
    if (lead) {
      const parts = lead.name.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: parts[0] || "Priya",
        lastName: parts.slice(1).join(" ") || "Raheja",
        mobile: lead.mobile || "+91 9888097856",
      }));
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onMoveToP2(lead, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FBFBFC] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-black/8 w-full max-w-[1050px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/8 shrink-0">
          <h2 className="text-[19px] font-bold text-[#111]">Add Bio-data to advance to P2</h2>
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
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[#7A0A17] hover:bg-[#640712] rounded-xl transition-colors shadow-sm"
            >
              Move to P3
            </button>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="px-6 py-3 bg-white border-b border-black/6 shrink-0">
          <StageStepper activeStageId="P2" />
        </div>

        {/* Smart Attach Banner */}
        <div className="px-6 pt-4 pb-1 shrink-0">
          <div className="bg-[#F5F3FF] border-2 border-dashed border-[#C7D2FE] rounded-2xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Paperclip size={18} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#312E81]">Smart Attach (Auto Fetch)</h4>
                <p className="text-[11px] text-[#4338CA]">
                  Attach a bio-data document (PDF / Image Docx) and we'll automatically fetch and fill the details for you.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-[#4F46E5] bg-white border border-[#C7D2FE] rounded-xl hover:bg-[#EEF2FF] transition-colors shrink-0 shadow-xs"
            >
              <Upload size={14} /> Attach File
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto scrollbar-thin grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left Main Form Container */}
          <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-xs flex flex-col gap-6">
            {/* Section 1: Already Known */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="size-5 rounded-full bg-[#FFF1F2] text-[#7A0A17] text-[11px] font-bold flex items-center justify-center">1</span>
                <h3 className="text-[13px] font-bold text-[#111]">Already Known - From P0 / P1</h3>
                <span className="text-[10px] text-[#9CA3AF]">Captured earlier</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    First name <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Last name <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Mobile <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Alternate Contact <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="alternateContact"
                    value={formData.alternateContact}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Alternate Contact <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="alternateContact"
                    value={formData.alternateContact}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Family income bracket <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="incomeBracket"
                    value={formData.incomeBracket}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">City/area</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-black/6" />

            {/* Section 2: Bio Data */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="size-5 rounded-full bg-[#FFF1F2] text-[#7A0A17] text-[11px] font-bold flex items-center justify-center">2</span>
                <h3 className="text-[13px] font-bold text-[#111]">Bio Data - From Client</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#374151] mb-1">
                    Date of birth/age <span className="text-[#E8395B]">*</span>
                  </label>
                  <select
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  >
                    <option value="Not Set">Not Set</option>
                    <option value="25 yrs / 1999">25 yrs / 1999</option>
                    <option value="28 yrs / 1996">28 yrs / 1996</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#374151] mb-1">
                    Height <span className="text-[#E8395B]">*</span>
                  </label>
                  <select
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  >
                    <option value="Not Set">Not Set</option>
                    <option value="5' 4&quot;">5' 4"</option>
                    <option value="5' 7&quot;">5' 7"</option>
                    <option value="5' 10&quot;">5' 10"</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#374151] mb-1">
                    Area of house <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="areaOfHouse"
                    placeholder="Locality"
                    value={formData.areaOfHouse}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#374151] mb-1">Agreed to a meeting call</label>
                  <select
                    name="agreedMeeting"
                    value={formData.agreedMeeting}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  >
                    <option value="Not Set">Not Set</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11.5px] font-semibold text-[#374151] mb-1">Partner preference notes</label>
                  <input
                    type="text"
                    name="partnerNotes"
                    placeholder="Not set"
                    value={formData.partnerNotes}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-black/6" />

            {/* Section 3: Assignment & Content */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="size-5 rounded-full bg-[#FFF1F2] text-[#7A0A17] text-[11px] font-bold flex items-center justify-center">3</span>
                <h3 className="text-[13px] font-bold text-[#111]">Assignment & Content</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#374151] mb-1">
                    Branch <span className="text-[#E8395B]">*</span>
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  >
                    <option value="South Ex">South Ex</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Noida">Noida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#374151] mb-1">
                    Referred by <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="referredBy"
                    placeholder="Not Set"
                    value={formData.referredBy}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#374151] mb-1">
                    Consent to contact <span className="text-[#E8395B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="consent"
                    value={formData.consent}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                  />
                </div>
              </div>
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
                  The card moves from P0 New Prospect to P1 Qualified - nothing entered at intake needs re-typing.
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-[#E8395B] mt-1.5 shrink-0" />
                  Income bracket and city feed routing and lead scoring.
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-[#E8395B] mt-1.5 shrink-0" />
                  Next step is requesting bio-data - that's the Move to P2 form on the P1 card.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
