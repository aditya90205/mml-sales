import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Bell, Check, Heart, ImagePlus, Loader2, Search, Star, Upload, Video, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import { STATIC_SHARE_URLS } from "../../utils/shareLinks";
import {
  fetchGoogleReviewFromLink,
  isValidHttpUrl,
  searchInAppReviews,
} from "../../utils/successStoryReviews";

const IMAGE_ACCEPT = "image/*";
const VIDEO_ACCEPT = "video/*";
const GALLERY_ACCEPT = "image/*,video/*";

const SOURCE_OPTIONS = [
  { id: "google", label: "Google Review", icon: Star },
  { id: "inapp", label: "In-app Review", icon: Bell },
];

function isVideoFile(file) {
  return Boolean(file?.type?.startsWith("video/"));
}

function isImageFile(file) {
  return Boolean(file?.type?.startsWith("image/"));
}

function StarsRow({ rating = 5, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          className={index < rating ? "text-[#F5B400]" : "text-[#E5E7EB]"}
          fill={index < rating ? "#F5B400" : "#E5E7EB"}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

export default function AddSuccessStoryModal({
  open,
  onClose,
  area = "",
  defaultCouple = "",
  onSave,
  zClass = "z-[90]",
}) {
  const formId = `add-success-story-${useId().replace(/:/g, "")}`;
  const profileRef = useRef(null);
  const galleryRef = useRef(null);
  const [source, setSource] = useState("google");
  const [googleLink, setGoogleLink] = useState(STATIC_SHARE_URLS.review);
  const [googleFetched, setGoogleFetched] = useState(false);
  const [fetchingGoogle, setFetchingGoogle] = useState(false);
  const [couple, setCouple] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [inAppQuery, setInAppQuery] = useState("");
  const [selectedInAppId, setSelectedInAppId] = useState("");

  const resetForm = (nextSource = "google") => {
    setSource(nextSource);
    setGoogleLink(STATIC_SHARE_URLS.review);
    setGoogleFetched(false);
    setFetchingGoogle(false);
    setCouple(defaultCouple || "");
    setQuote("");
    setRating(5);
    setProfileFile(null);
    setGalleryItems((current) => {
      current.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
      return [];
    });
    setInAppQuery(defaultCouple || "");
    setSelectedInAppId("");
    if (profileRef.current) profileRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  useEffect(() => {
    if (!open) return;
    resetForm("google");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when modal opens
  }, [open]);

  useEffect(() => {
    if (!profileFile) {
      setProfilePreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(profileFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  const inAppResults = useMemo(() => searchInAppReviews(inAppQuery), [inAppQuery]);

  const clearProfile = () => {
    setProfileFile(null);
    if (profileRef.current) profileRef.current.value = "";
  };

  const clearGallery = () => {
    setGalleryItems((current) => {
      current.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
      return [];
    });
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const removeGalleryItem = (id) => {
    setGalleryItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });
  };

  const addGalleryFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const nextItems = [];
    for (const file of files) {
      if (!isImageFile(file) && !isVideoFile(file)) {
        toast.error(`${file.name} is not an image or video.`);
        continue;
      }
      nextItems.push({
        id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        kind: isVideoFile(file) ? "video" : "image",
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }
    if (nextItems.length) {
      setGalleryItems((current) => [...current, ...nextItems]);
    }
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const handleSourceChange = (next) => {
    if (next === source) return;
    setSource(next);
    setGoogleFetched(false);
    setFetchingGoogle(false);
    setSelectedInAppId("");
    setCouple(defaultCouple || "");
    setQuote("");
    setRating(5);
    setInAppQuery(defaultCouple || "");
    clearProfile();
    clearGallery();
    if (next === "google") {
      setGoogleLink(STATIC_SHARE_URLS.review);
    }
  };

  const handleFetchGoogle = async () => {
    const link = googleLink.trim();
    if (!link) {
      toast.error("Add a Google review link.");
      return;
    }
    if (!isValidHttpUrl(link)) {
      toast.error("Enter a valid Google review link.");
      return;
    }
    setFetchingGoogle(true);
    setGoogleFetched(false);
    try {
      const review = await fetchGoogleReviewFromLink(link);
      setCouple(review.couple);
      setQuote(review.quote);
      setRating(review.rating);
      setGoogleLink(review.googleLink);
      setGoogleFetched(true);
      toast.success("Google review fetched.");
    } catch (err) {
      toast.error(err?.message || "Could not fetch Google review.");
    } finally {
      setFetchingGoogle(false);
    }
  };

  const selectInAppReview = (review) => {
    setSelectedInAppId(review.id);
    setCouple(review.couple);
    setQuote(review.quote);
    setRating(review.rating);
    setInAppQuery(review.couple);
  };

  const clearInAppSelection = () => {
    setSelectedInAppId("");
    setCouple(defaultCouple || "");
    setQuote("");
    setRating(5);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = couple.trim();

    if (source === "google") {
      const link = googleLink.trim();
      if (!link) {
        toast.error("Add a Google review link.");
        return;
      }
      if (!isValidHttpUrl(link)) {
        toast.error("Enter a valid Google review link.");
        return;
      }
      if (!googleFetched) {
        toast.error("Fetch the Google review before adding the story.");
        return;
      }
      if (!name) {
        toast.error("Enter the couple name.");
        return;
      }
      if (!profileFile) {
        toast.error("Upload a profile photo for the card.");
        return;
      }
    } else {
      if (!selectedInAppId) {
        toast.error("Search and select an in-app review.");
        return;
      }
      if (!name) {
        toast.error("Enter the couple name.");
        return;
      }
    }

    if (profileFile && !isImageFile(profileFile)) {
      toast.error("Profile photo must be an image.");
      return;
    }

    const profileUrl = profileFile ? URL.createObjectURL(profileFile) : "";
    const gallery = galleryItems.map((item) => ({
      id: item.id,
      kind: item.kind,
      url: item.preview || URL.createObjectURL(item.file),
      name: item.name,
    }));

    const story = {
      id: `ss-local-${Date.now()}`,
      area: area || "General",
      couple: name,
      package: "Custom",
      closedOn: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      note:
        source === "google"
          ? `Google review · ${googleLink.trim()}`
          : "In-app review",
      quote: quote.trim() || "Shared a success story with MML.",
      rating,
      /** Card thumbnail */
      image: profileUrl || undefined,
      profileImage: profileUrl || undefined,
      /** Extra photos/videos for the detail modal only */
      gallery,
      source,
      googleLink: source === "google" ? googleLink.trim() : "",
      inAppReviewId: source === "inapp" ? selectedInAppId : "",
    };

    onSave?.(story);
    toast.success("Success story added.");
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Success Story"
      subtitle="Profile photo on the card · extra photos & videos open in the story"
      icon={<Heart size={18} />}
      iconBg="#F6E4E8"
      iconColor="#7A0A17"
      width="max-w-lg"
      zClass={zClass}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Add story
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-bold text-[#111] mb-1.5">Review source</p>
          <div className="flex items-center gap-2 flex-wrap">
            {SOURCE_OPTIONS.map((opt) => {
              const active = source === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleSourceChange(opt.id)}
                  className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${
                    active
                      ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                      : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
                  }`}
                >
                  <Icon size={14} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {source === "google" ? (
          <div>
            <label htmlFor={`${formId}-google`} className="block text-[13px] font-bold text-[#111] mb-1.5">
              Google review link <span className="text-[#E8395B]">*</span>
            </label>
            <div className="flex items-stretch gap-2">
              <input
                id={`${formId}-google`}
                value={googleLink}
                onChange={(e) => {
                  setGoogleLink(e.target.value);
                  setGoogleFetched(false);
                }}
                placeholder="https://g.page/r/..."
                className="flex-1 min-w-0 h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]"
              />
              <button
                type="button"
                onClick={handleFetchGoogle}
                disabled={fetchingGoogle}
                className="inline-flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors disabled:opacity-60 shrink-0"
              >
                {fetchingGoogle ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Fetching…
                  </>
                ) : (
                  "Fetch review"
                )}
              </button>
            </div>
            {googleFetched ? (
              <p className="mt-1.5 text-[12px] text-[#16A34A] inline-flex items-center gap-1 font-medium">
                <Check size={12} strokeWidth={2.4} />
                Review loaded — edit fields below if needed, then add media.
              </p>
            ) : (
              <p className="mt-1.5 text-[12px] text-[#6B7280] leading-snug">
                Paste the client&apos;s Google review link and fetch to load name, quote, and rating.
              </p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor={`${formId}-inapp-search`} className="block text-[13px] font-bold text-[#111] mb-1.5">
              Search in-app review <span className="text-[#E8395B]">*</span>
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
              />
              <input
                id={`${formId}-inapp-search`}
                value={inAppQuery}
                onChange={(e) => {
                  setInAppQuery(e.target.value);
                  if (selectedInAppId) clearInAppSelection();
                }}
                placeholder="Search by couple name or keywords…"
                className="w-full h-11 border border-black/12 rounded-xl pl-9 pr-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]"
              />
            </div>

            {selectedInAppId ? (
              <div className="mt-2 rounded-xl border border-[#7A0A17]/25 bg-[#FDF2F3] px-3.5 py-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#7A0A17] truncate">{couple}</p>
                  <div className="mt-1">
                    <StarsRow rating={rating} />
                  </div>
                  <p className="mt-1.5 text-[12px] text-[#4B5563] leading-snug line-clamp-2">{quote}</p>
                </div>
                <button
                  type="button"
                  onClick={clearInAppSelection}
                  className="size-7 rounded-lg grid place-items-center text-[#6B7280] hover:bg-white hover:text-[#111] shrink-0"
                  aria-label="Clear selected review"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <ul className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-[#EEF1F4] divide-y divide-[#EEF1F4] bg-white">
                {inAppResults.length ? (
                  inAppResults.map((review) => (
                    <li key={review.id}>
                      <button
                        type="button"
                        onClick={() => selectInAppReview(review)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#FAFBFC] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold text-[#111] truncate">{review.couple}</p>
                          <StarsRow rating={review.rating} size={11} />
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-[#6B7280] line-clamp-1">{review.quote}</p>
                        {review.area ? (
                          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                            {review.area}
                            {review.completedOn ? ` · ${review.completedOn}` : ""}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-3.5 py-4 text-[12.5px] text-[#9CA3AF] text-center">
                    No in-app reviews match your search.
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

        <div>
          <label htmlFor={`${formId}-couple`} className="block text-[13px] font-bold text-[#111] mb-1.5">
            Couple / client name <span className="text-[#E8395B]">*</span>
          </label>
          <input
            id={`${formId}-couple`}
            value={couple}
            onChange={(e) => setCouple(e.target.value)}
            placeholder="e.g. Aarav & Meera"
            className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-quote`} className="block text-[13px] font-bold text-[#111] mb-1.5">
            Quote / review text
          </label>
          <textarea
            id={`${formId}-quote`}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={3}
            placeholder="Short testimonial or review note..."
            className="w-full border border-black/12 rounded-xl px-3.5 py-3 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17] resize-none"
          />
        </div>

        <div>
          <p className="text-[13px] font-bold text-[#111] mb-1.5">Rating</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              const active = value <= rating;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="size-8 rounded-lg grid place-items-center hover:bg-[#FDF2F3] transition-colors"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={active}
                >
                  <Star
                    size={18}
                    className={active ? "text-[#F5B400]" : "text-[#E5E7EB]"}
                    fill={active ? "#F5B400" : "#E5E7EB"}
                    strokeWidth={0}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[13px] font-bold text-[#111] mb-1.5">
            Profile photo
            {source === "google" ? <span className="text-[#E8395B]"> *</span> : (
              <span className="text-[#9CA3AF] font-medium"> (optional)</span>
            )}
          </p>
          <p className="text-[11.5px] text-[#9CA3AF] mb-2 leading-snug">
            Shows on the Success Stories card only.
          </p>
          <input
            ref={profileRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const next = e.target.files?.[0] || null;
              if (next && !isImageFile(next)) {
                toast.error("Profile photo must be an image.");
                e.target.value = "";
                return;
              }
              setProfileFile(next);
            }}
          />
          {profileFile ? (
            <div className="rounded-xl border border-black/12 bg-[#FAFAFB] p-3 flex items-center gap-3">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile"
                  className="size-16 rounded-xl object-cover border border-black/8 bg-white shrink-0"
                />
              ) : (
                <span className="size-16 rounded-xl bg-white border border-black/8 grid place-items-center shrink-0">
                  <ImagePlus size={18} className="text-[#7A0A17]" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-[#111] truncate">{profileFile.name}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">Card profile photo</p>
              </div>
              <button
                type="button"
                onClick={clearProfile}
                className="size-7 rounded-lg grid place-items-center text-[#6B7280] hover:bg-white hover:text-[#111] shrink-0"
                aria-label="Remove profile photo"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => profileRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-black/15 bg-[#FAFAFB] px-4 py-5 flex flex-col items-center gap-1.5 hover:bg-[#F5F5F6] transition-colors"
            >
              <span className="size-9 rounded-full bg-[#FDF2F3] text-[#7A0A17] grid place-items-center">
                <ImagePlus size={16} />
              </span>
              <span className="text-[13px] font-semibold text-[#111]">Upload profile photo</span>
              <span className="text-[11.5px] text-[#9CA3AF]">JPG, PNG — card thumbnail</span>
            </button>
          )}
        </div>

        <div>
          <p className="text-[13px] font-bold text-[#111] mb-1.5">
            Story photos &amp; videos
            <span className="text-[#9CA3AF] font-medium"> (optional)</span>
          </p>
          <p className="text-[11.5px] text-[#9CA3AF] mb-2 leading-snug">
            Separate from profile — open inside the story modal. Add images and videos together.
          </p>
          <input
            ref={galleryRef}
            type="file"
            accept={GALLERY_ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => addGalleryFiles(e.target.files)}
          />

          {galleryItems.length ? (
            <div className="flex flex-col gap-2">
              <ul className="flex flex-col gap-2">
                {galleryItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-black/12 bg-[#FAFAFB] p-2.5 flex items-center gap-3"
                  >
                    {item.kind === "video" ? (
                      <video
                        src={item.preview}
                        className="size-14 rounded-lg object-cover border border-black/8 bg-black shrink-0"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="size-14 rounded-lg object-cover border border-black/8 bg-white shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-[#111] truncate flex items-center gap-1.5">
                        {item.kind === "video" ? <Video size={12} /> : <ImagePlus size={12} />}
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5 capitalize">{item.kind}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(item.id)}
                      className="size-7 rounded-lg grid place-items-center text-[#6B7280] hover:bg-white hover:text-[#111] shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="h-10 rounded-xl border border-dashed border-[#7A0A17]/30 text-[#7A0A17] text-[12.5px] font-semibold hover:bg-[#FDF2F3] transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                Add more photos / videos
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-black/15 bg-[#FAFAFB] px-4 py-5 flex flex-col items-center gap-1.5 hover:bg-[#F5F5F6] transition-colors"
            >
              <span className="size-9 rounded-full bg-[#FDF2F3] text-[#7A0A17] grid place-items-center">
                <Upload size={16} />
              </span>
              <span className="text-[13px] font-semibold text-[#111]">Upload photos &amp; videos</span>
              <span className="text-[11.5px] text-[#9CA3AF]">Multi-select · JPG, PNG, MP4…</span>
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
