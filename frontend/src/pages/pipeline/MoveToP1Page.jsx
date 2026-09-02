import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import StageStepper from "../../components/pipeline/StageStepper";
import TopBar from "../../components/layout/TopBar";

export default function MoveToP1Page({ lead, onBack, onMoveToP1 }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "+91 ",
    alternateContact: "",
    email: "",
    source: "Newspaper",
    occupation: "Not Set",
    incomeBracket: "Not Set",
    city: "Not set",
    agreedMeeting: "Not Set",
    lookingFor: "Boy/Girl/Not asked",
    enquiryBy: "Not Set",
    isNri: "Not Set",
    country: "Not Set",
    nriCity: "Not set",
  });

  useEffect(() => {
    if (lead) {
      const parts = (lead.name || "").split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        mobile: lead.mobile || "+91 9888097856",
        email: lead.email || "name@example.com",
        source: lead.source || "Newspaper",
      }));
    }
  }, [lead]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onMoveToP1(lead, formData);
    onBack();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#F8F9FA]">
      <TopBar page="Pipeline Board / Move to P1" />

      {/* Page Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/8 shrink-0 flex-wrap gap-4">
        <h1 className="text-[20px] font-bold text-[#111] tracking-tight">
          Complete the details to proceed for P1
        </h1>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
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
            Move to P2
          </button>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="px-6 py-3 bg-white border-b border-black/6 shrink-0">
        <StageStepper activeStageId="P1" />
      </div>

      {/* Main Form Content Area */}
      <div className="p-6 overflow-y-auto scrollbar-thin grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 max-w-[1450px]">
        {/* Left Main Form Container */}
        <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          {/* Section 1: Already Known */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="size-5 rounded-full bg-[#FFF1F2] text-[#7A0A17] text-[11px] font-bold flex items-center justify-center">1</span>
              <h3 className="text-[13.5px] font-bold text-[#111]">Already Known - From P0</h3>
              <span className="text-[10.5px] text-[#9CA3AF]">Captured at intake</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  First Name <span className="text-[#E8395B]">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Last Name <span className="text-[#E8395B]">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Mobile <span className="text-[#E8395B]">*</span>
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Alternate Contact <span className="text-[#E8395B]">*</span>
                </label>
                <input
                  type="text"
                  name="alternateContact"
                  placeholder="Add number"
                  value={formData.alternateContact}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Source <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Newspaper">Newspaper</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-black/6" />

          {/* Section 2: Qualifying Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="size-5 rounded-full bg-[#FFF1F2] text-[#7A0A17] text-[11px] font-bold flex items-center justify-center">2</span>
              <h3 className="text-[13.5px] font-bold text-[#111]">Qualifying Details - From this Call</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Occupation <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Not Set">Not Set</option>
                  <option value="Chartered Accountant">Chartered Accountant</option>
                  <option value="Business">Business</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Engineer">Engineer</option>
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Family Income Bracket <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  name="incomeBracket"
                  value={formData.incomeBracket}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Not Set">Not Set</option>
                  <option value="₹15-25L p.a.">₹15-25L p.a.</option>
                  <option value="₹25-50L p.a.">₹25-50L p.a.</option>
                  <option value="₹50L-1Cr p.a.">₹50L-1Cr p.a.</option>
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  City / area <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Not set">Not set</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Delhi - South Ex">Delhi - South Ex</option>
                  <option value="Noida">Noida</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">Agreed to a meeting call</label>
                <select
                  name="agreedMeeting"
                  value={formData.agreedMeeting}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Not Set">Not Set</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">Whom are you looking for</label>
                <select
                  name="lookingFor"
                  value={formData.lookingFor}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Boy/Girl/Not asked">Boy/Girl/Not asked</option>
                  <option value="Boy">Boy</option>
                  <option value="Girl">Girl</option>
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">Enquiry made by</label>
                <select
                  name="enquiryBy"
                  value={formData.enquiryBy}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Not Set">Not Set</option>
                  <option value="Self">Self</option>
                  <option value="Parent">Parent</option>
                  <option value="Relative">Relative</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-black/6" />

          {/* Section 3: NRI */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="size-5 rounded-full bg-[#FFF1F2] text-[#7A0A17] text-[11px] font-bold flex items-center justify-center">3</span>
              <h3 className="text-[13.5px] font-bold text-[#111]">NRI</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Are you a NRI <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  name="isNri"
                  value={formData.isNri}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Not Set">Not Set</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Country <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Not Set">Not Set</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  City / area <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  name="nriCity"
                  value={formData.nriCity}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 text-[13px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
                >
                  <option value="Not set">Not set</option>
                  <option value="New York">New York</option>
                  <option value="London">London</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-5">
          {/* What happens on save Card */}
          <div className="bg-[#FFF5F6] border border-[#FDE8EA] rounded-2xl p-5">
            <h4 className="text-[13.5px] font-bold text-[#111] mb-3">What happens on save</h4>
            <ul className="flex flex-col gap-2.5 text-[12px] text-[#4B5563] leading-relaxed">
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

          {/* Ask AI Card */}
          <div className="bg-white border border-[#E0E7FF] rounded-2xl p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-[13.5px] font-bold text-[#111] leading-snug">
                Draft a mail to request the missing details from the client - Ask AI
              </h4>
              <Sparkles size={18} className="text-[#6366F1] shrink-0 mt-0.5" />
            </div>

            <p className="text-[11.5px] text-[#6B7280]">
              AI will draft a personalized email requesting the missing or incomplete details from the client.
            </p>

            <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-3.5">
              <p className="text-[11px] font-semibold text-[#6D28D9] mb-2">Missing details detected</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#EDE9FE] text-[#6D28D9] text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                  Alternate Contact
                </span>
                <span className="bg-[#EDE9FE] text-[#6D28D9] text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                  City / Area
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-[#6366F1] text-[#4F46E5] text-[13px] font-semibold hover:bg-[#EEF2FF] transition-colors mt-1"
            >
              <Sparkles size={15} /> Ask AI to Draft Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
