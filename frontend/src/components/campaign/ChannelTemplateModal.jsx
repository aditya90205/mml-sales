import { useEffect, useState } from "react";
import { Bookmark, Copy, Eye, PenSquare, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

const CHANNEL_META = {
  push: { title: "Notifications Template", templateLabel: "Notification Template" },
  email: { title: "Email Template", templateLabel: "E-mail Template" },
  whatsapp: { title: "Whatsapp Template", templateLabel: "WhatsApp Template" },
  sms: { title: "SMS Template", templateLabel: "SMS Template" },
};

const DEFAULT_DESCRIPTION = `< Client_name > We are pleased to offer. Please find attach offer and kindly review.
 Please Click on the link <https//sharejobprofile.mml> and give your acceptance. You are requested to review all the details and revert in case of query.

Regards,
< Sales_name >< Mobile_no >< Email_id >< Branch >
MML Sales & Marketing Team`;

export default function ChannelTemplateModal({ open, onClose, channel = "email" }) {
  const meta = CHANNEL_META[channel] || CHANNEL_META.email;
  const [attachments, setAttachments] = useState("Yes");
  const [templateName, setTemplateName] = useState("30% Offer");
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);

  useEffect(() => {
    if (!open) return;
    setAttachments("Yes");
    setTemplateName("30% Offer");
    setDescription(DEFAULT_DESCRIPTION);
  }, [open, channel]);

  if (!open) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText("https//sharejobprofile.mml").catch(() => {});
    toast.info("Link copied.");
  };

  const handleSave = () => {
    toast.success(`${meta.title} saved.`);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh]">
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <h2 className="text-xl font-bold text-[#111]">{meta.title}</h2>
          <span className="text-[11px] font-medium text-[#9CA3AF] mt-1 shrink-0">MML-CAMPN-ID</span>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-2 flex flex-col gap-4">
          <p className="text-xs text-[#6B7280] -mt-2">
            Client name and variable name will be picked up automatically from the selected database or target group.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#111] mb-1.5">Client Name</label>
              <input
                readOnly
                placeholder="Ankit Gupta"
                className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#111] mb-1.5">Phone Number</label>
              <input
                readOnly
                placeholder="******7854"
                className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#111] mb-1.5">Attachments</label>
              <div className="flex items-center gap-2.5">
                {["Yes", "No"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAttachments(opt)}
                    className={`h-11 flex-1 rounded-xl text-[13px] font-semibold border transition-colors ${
                      attachments === opt
                        ? "border-[#E8395B] text-[#E8395B] bg-[#FCF5F6]"
                        : "border-black/12 text-[#6B7280] hover:bg-[#FAFAFB]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {attachments === "Yes" && (
                <div className="flex items-center gap-2 mt-2.5 text-[13px] text-[#374151]">
                  <span className="text-[#DC2626] font-bold text-[11px] border border-[#DC2626]/30 rounded px-1">PDF</span>
                  <span className="truncate">File - &lt;Candidate name&gt; MML offer.pdf</span>
                  <Eye size={16} className="text-[#CA8A04] shrink-0 cursor-pointer" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#111] mb-1.5">Paste link</label>
              <div className="flex items-center gap-2 h-11 border border-black/12 rounded-xl px-3.5">
                <input
                  readOnly
                  placeholder="https//sharejobprofile.mml"
                  className="flex-1 min-w-0 bg-transparent text-[13px] text-[#9CA3AF] outline-none"
                />
                <button type="button" onClick={handleCopyLink} aria-label="Copy link">
                  <Copy size={15} className="text-[#6B7280]" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-[13px] font-bold text-[#111] mb-1.5">Name of the Template</label>
              <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#111] mb-1.5">Select Template</label>
              <div className="flex items-center gap-2">
                <select className="flex-1 min-w-0 h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none bg-white">
                  <option>{meta.templateLabel}</option>
                </select>
                <button
                  type="button"
                  onClick={() => toast.info("Create a new template.")}
                  className="shrink-0 inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-white border border-[#7A0A17]/30 text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors"
                >
                  + Create
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Generating a smart suggestion...")}
                  className="shrink-0 inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
                >
                  <Sparkles size={14} /> Ask AI
                </button>
              </div>
            </div>
          </div>

          {channel === "email" && (
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-bold text-[#111]">Subject -</span>
              <span className="text-[#6B7280] flex-1">Special discount of 30% approved for you</span>
              <PenSquare size={15} className="text-[#2563EB] cursor-pointer shrink-0" />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-bold text-[#111]">Description</label>
              <div className="flex items-center gap-2.5">
                <Eye size={15} className="text-[#CA8A04] cursor-pointer" />
                <Bookmark size={15} className="text-[#16A34A] cursor-pointer" />
                <PenSquare size={15} className="text-[#2563EB] cursor-pointer" />
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              className="w-full border border-black/12 rounded-xl px-3.5 py-3 text-[13px] text-[#6B7280] outline-none focus:border-[#7A0A17]/40 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-black/8 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Save & Update
          </button>
        </div>
      </div>
    </div>
  );
}
