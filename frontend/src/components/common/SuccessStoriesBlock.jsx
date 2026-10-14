import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Link2,
  MapPin,
  Plus,
  Share2,
  Star,
  Video,
} from "lucide-react";
import Modal from "../ui/Modal";
import AddSuccessStoryModal from "../pipeline/AddSuccessStoryModal";
import ShareSuccessStoryModal from "./ShareSuccessStoryModal.jsx";

function shown(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "-" || text === "—" || text === "–") return "";
  return text;
}

function normalizeAreaKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Demo success stories — filtered by lead area on Overview. */
const AREA_SUCCESS_STORIES = [
  {
    id: "ss-gk-1",
    area: "Greater Kailash II",
    couple: "Aarav & Meera",
    package: "Premium",
    closedOn: "12 Mar 2026",
    note: "Matched within 45 days. Both families from GK-II.",
    quote: "MML helped us find our perfect match. The profiles were genuine and the process was very smooth.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-gk-2",
    area: "Greater Kailash II",
    couple: "Kabir & Ananya",
    package: "Exclusive",
    closedOn: "28 Jan 2026",
    note: "Home visit closed the deal after two shortlists.",
    quote: "We were impressed by how carefully they understood our preferences. Highly recommend!",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-gk-3",
    area: "Greater Kailash II",
    couple: "Rohan & Priya",
    package: "Premium",
    closedOn: "09 Nov 2025",
    note: "Same society network — GK-II referrals.",
    quote: "From the first meeting to the final match, everything felt personal and professional.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-gk-5",
    area: "Greater Kailash II",
    couple: "Aditya & Ishita",
    package: "Premium",
    closedOn: "21 Sep 2025",
    note: "Both families within 2 km of GK-II market.",
    quote: "Shortlists felt curated, not random. We said yes within three meetings.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-gk-6",
    area: "Greater Kailash II",
    couple: "Dev & Kiara",
    package: "Exclusive",
    closedOn: "14 Jun 2025",
    note: "Closed after branch manager home visit.",
    quote: "The counsellor listened to both families equally. That trust made everything easier.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-gk-7",
    area: "Greater Kailash II",
    couple: "Yash & Rhea",
    package: "Classic",
    closedOn: "03 Apr 2025",
    note: "Referral from a GK-II closed client.",
    quote: "Clear timelines, honest feedback, and beautiful matches. Grateful to the MML team.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-gk-4",
    area: "Greater Kailash I",
    couple: "Vikram & Sneha",
    package: "Classic",
    closedOn: "02 Aug 2025",
    note: "Sibling referral from GK-I.",
    quote: "Genuine profiles and thoughtful guidance. We found our life partner through MML.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-gk-i-2",
    area: "Greater Kailash I",
    couple: "Nikhil & Pooja",
    package: "Premium",
    closedOn: "19 Oct 2025",
    note: "GK-I society introduction via RM.",
    quote: "Every profile shared matched what we asked for. No time wasted.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-sx-1",
    area: "South Extension",
    couple: "Arjun & Diya",
    package: "Premium",
    closedOn: "18 Feb 2026",
    note: "Cross-branch shortlist accepted in week 3.",
    quote: "The team was patient with our families and never pushed. That made all the difference.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-sx-2",
    area: "South Extension",
    couple: "Harsh & Simran",
    package: "Exclusive",
    closedOn: "07 Jan 2026",
    note: "South Ex office walk-in converted in 30 days.",
    quote: "Professional, warm, and very clear about next steps. We felt looked after.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1460978813357-27c3a8a4e4cd?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-rj-1",
    area: "Rajouri Garden",
    couple: "Manish & Neha",
    package: "Premium",
    closedOn: "05 Dec 2025",
    note: "NRI family closed after video intros.",
    quote: "Even as an NRI family, video intros and clear updates made the journey easy.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-rj-2",
    area: "Rajouri Garden",
    couple: "Kunal & Aisha",
    package: "Classic",
    closedOn: "22 Nov 2025",
    note: "West Delhi network match.",
    quote: "Beautiful matches and respectful conversations throughout. Thank you MML!",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=240&h=240&fit=crop&crop=faces",
  },
];

/** Fallback testimonials when the lead area has no tagged stories yet. */
const FALLBACK_TESTIMONIALS = AREA_SUCCESS_STORIES.slice(0, 6);

function areasMatch(a, b) {
  const ka = normalizeAreaKey(a);
  const kb = normalizeAreaKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  const shorter = ka.length <= kb.length ? ka : kb;
  const longer = ka.length <= kb.length ? kb : ka;
  return longer.startsWith(`${shorter} `);
}

function successStoriesForArea(area) {
  if (!shown(area)) return [];
  return AREA_SUCCESS_STORIES.filter((story) => areasMatch(story.area, area));
}

function SuccessStoryStars({ rating = 5, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
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

function storyHasMedia(story) {
  return Boolean(story?.image);
}

function SuccessStoryCard({ story, onOpen, onShare, className = "", ...rest }) {
  const isVideo = story.mediaKind === "video";
  return (
    <article
      {...rest}
      className={`relative min-w-0 flex rounded-xl border border-[#EEF1F4] bg-white overflow-hidden hover:border-[#E2E6EB] transition-colors ${className}`.trim()}
    >
      <button
        type="button"
        onClick={() => onOpen?.(story)}
        className="flex flex-1 min-w-0 text-left"
        aria-label={`Open ${story.couple} review`}
      >
        <div className="relative w-[88px] shrink-0 self-stretch bg-[#F3F4F6]">
          {storyHasMedia(story) ? (
            isVideo ? (
              <video
                src={story.image}
                className="size-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={story.image}
                alt={story.couple}
                className="size-full object-cover"
                loading="lazy"
              />
            )
          ) : (
            <div className="size-full grid place-items-center text-[#D1D5DB]">
              <Heart size={22} strokeWidth={1.8} />
            </div>
          )}
          {isVideo && storyHasMedia(story) ? (
            <span className="absolute inset-0 grid place-items-center bg-black/25 pointer-events-none">
              <Video size={18} className="text-white" strokeWidth={2.2} />
            </span>
          ) : null}
        </div>
        <div className="flex-1 min-w-0 px-3 py-2.5 pr-8 flex flex-col gap-1">
          <p className="text-[13px] font-bold text-[#7A0A17] leading-tight truncate">{story.couple}</p>
          <SuccessStoryStars rating={story.rating || 5} />
          <p className="text-[11.5px] text-[#6B7280] leading-snug line-clamp-3">
            {story.quote || story.note}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onShare?.(story);
        }}
        className="absolute bottom-2 right-2 size-6 rounded-md text-[#9CA3AF] hover:text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center transition-colors z-[1]"
        aria-label={`Share ${story.couple} success story`}
        title="Share"
      >
        <Share2 size={13} strokeWidth={2.2} />
      </button>
    </article>
  );
}

function SuccessStoryDetailModal({ story, open, onClose, onShare }) {
  if (!story) return null;
  const isVideo = story.mediaKind === "video";
  const hasMedia = storyHasMedia(story);
  const sourceLabel =
    story.source === "google" ? "Google Review" : story.source === "inapp" ? "In-app Review" : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={story.couple}
      subtitle={[sourceLabel, story.area, story.closedOn ? `Closed ${story.closedOn}` : null]
        .filter(Boolean)
        .join(" · ")}
      icon={<Heart size={18} />}
      iconBg="#F6E4E8"
      iconColor="#7A0A17"
      width="max-w-lg"
      zClass="z-[95]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onShare?.(story)}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            <Share2 size={14} strokeWidth={2.2} />
            Share
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {hasMedia ? (
          <div className="rounded-xl overflow-hidden border border-[#EEF1F4] bg-[#111] aspect-video">
            {isVideo ? (
              <video
                src={story.image}
                className="size-full object-contain bg-black"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={story.image}
                alt={story.couple}
                className="size-full object-cover"
              />
            )}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <SuccessStoryStars rating={story.rating || 5} size={18} />
          <p className="text-[14px] text-[#374151] leading-relaxed">
            {story.quote || story.note || "No review text added."}
          </p>
          {story.note && story.quote && story.note !== story.quote ? (
            <p className="text-[12.5px] text-[#6B7280] leading-snug">{story.note}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {story.package ? (
            <span className="inline-flex items-center h-7 px-2.5 rounded-lg bg-[#F3F4F6] text-[11.5px] font-semibold text-[#4B5563]">
              {story.package}
            </span>
          ) : null}
          {sourceLabel ? (
            <span className="inline-flex items-center h-7 px-2.5 rounded-lg bg-[#F6E4E8] text-[11.5px] font-semibold text-[#7A0A17]">
              {sourceLabel}
            </span>
          ) : null}
          {story.mediaName ? (
            <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#EEF2FF] text-[11.5px] font-semibold text-[#4338CA]">
              {isVideo ? <Video size={12} /> : <Camera size={12} />}
              {story.mediaName}
            </span>
          ) : null}
        </div>

        {story.googleLink ? (
          <a
            href={story.googleLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#7A0A17] hover:underline"
          >
            <Link2 size={14} strokeWidth={2.2} />
            Open Google review
          </a>
        ) : null}
      </div>
    </Modal>
  );
}

function SuccessStoriesTestimonials({ stories, onAdd, onViewAll, onOpen, onShare }) {
  const list = stories?.length ? stories : FALLBACK_TESTIMONIALS;
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(maxScroll - el.scrollLeft > 2);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(syncArrows);
    el.addEventListener("scroll", syncArrows, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncArrows) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", syncArrows);
      ro?.disconnect();
    };
  }, [list.length]);

  const scrollByCard = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-success-story-card]");
    const gap = 10;
    const step = (card?.getBoundingClientRect().width || el.clientWidth / 3.5) + gap;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const showArrows = list.length > 3 || canPrev || canNext;

  return (
    <section className="bg-white border border-[#EEF1F4] rounded-2xl p-4 min-w-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)] h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-2 min-w-0 text-left hover:opacity-90 transition-opacity"
        >
          <Heart size={16} className="text-[#7A0A17] shrink-0" strokeWidth={2.2} fill="#7A0A17" />
          <h3 className="text-[15px] font-bold text-[#111] truncate">Success Stories</h3>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {showArrows ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canPrev}
                className="size-8 rounded-lg border border-[#EEF1F4] bg-white text-[#7A0A17] grid place-items-center hover:bg-[#FDF2F3] hover:border-[#E8D0D4] transition-colors disabled:opacity-35 disabled:pointer-events-none disabled:hover:bg-white"
                aria-label="Previous success stories"
              >
                <ChevronLeft size={16} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canNext}
                className="size-8 rounded-lg border border-[#EEF1F4] bg-white text-[#7A0A17] grid place-items-center hover:bg-[#FDF2F3] hover:border-[#E8D0D4] transition-colors disabled:opacity-35 disabled:pointer-events-none disabled:hover:bg-white"
                aria-label="Next success stories"
              >
                <ChevronRight size={16} strokeWidth={2.4} />
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
          >
            <Plus size={14} strokeWidth={2.4} />
            Add
          </button>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 min-w-0">
        <div
          ref={scrollerRef}
          className="flex gap-2.5 overflow-x-auto overflow-y-hidden h-full min-w-0 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((story) => (
            <SuccessStoryCard
              key={story.id}
              story={story}
              onOpen={onOpen}
              onShare={onShare}
              className="shrink-0 snap-start w-[calc((100%-30px)/3.5)]"
              data-success-story-card=""
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Exact Success Stories block from pipeline Overview — carousel + view-all / detail / share / add modals.
 * Pass `area` + `deal` on deal overview; omit on Dashboard to show fallback testimonials.
 */
export default function SuccessStoriesBlock({ area = "", deal = null, className = "" }) {
  const leadArea = shown(area);
  const [successStoriesOpen, setSuccessStoriesOpen] = useState(false);
  const [addSuccessStoryOpen, setAddSuccessStoryOpen] = useState(false);
  const [customSuccessStories, setCustomSuccessStories] = useState([]);
  const [viewingSuccessStory, setViewingSuccessStory] = useState(null);
  const [sharingSuccessStory, setSharingSuccessStory] = useState(null);

  const areaSuccessStories = useMemo(() => {
    const tagged = leadArea ? successStoriesForArea(leadArea) : FALLBACK_TESTIMONIALS;
    const custom = customSuccessStories.filter(
      (story) => !leadArea || areasMatch(story.area, leadArea) || story.area === "General"
    );
    return [...custom, ...tagged];
  }, [leadArea, customSuccessStories]);
  const areaSuccessCount = areaSuccessStories.length;

  return (
    <>
      <div className={className || undefined}>
        <SuccessStoriesTestimonials
          stories={areaSuccessStories}
          onAdd={() => setAddSuccessStoryOpen(true)}
          onViewAll={() => setSuccessStoriesOpen(true)}
          onOpen={setViewingSuccessStory}
          onShare={setSharingSuccessStory}
        />
      </div>

      <Modal
        open={successStoriesOpen}
        onClose={() => setSuccessStoriesOpen(false)}
        title="Success Stories"
        subtitle={
          leadArea
            ? areaSuccessCount > 0
              ? `${areaSuccessCount} closed matches in ${leadArea}`
              : `No closed matches found for ${leadArea}`
            : "Area success stories"
        }
        icon={<Heart size={18} />}
        iconBg="#F6E4E8"
        iconColor="#7A0A17"
        width="max-w-lg"
        zClass="z-[80]"
        headerActions={
          <button
            type="button"
            onClick={() => {
              setSuccessStoriesOpen(false);
              setAddSuccessStoryOpen(true);
            }}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
          >
            <Plus size={14} strokeWidth={2.4} />
            Add
          </button>
        }
      >
        {areaSuccessStories.length ? (
          <ul className="flex flex-col gap-2.5">
            {areaSuccessStories.map((story) => (
              <li key={story.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessStoriesOpen(false);
                    setViewingSuccessStory(story);
                  }}
                  className="w-full text-left rounded-xl border border-[#EEF1F4] bg-[#FAFBFC] px-3.5 py-3 hover:border-[#E2E6EB] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-[#1F2937] leading-tight">{story.couple}</p>
                      <p className="text-[12px] text-[#6B7280] mt-0.5 leading-snug">
                        {story.package} · Closed {story.closedOn}
                        {story.source === "google"
                          ? " · Google"
                          : story.source === "inapp"
                            ? " · In-app"
                            : ""}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 shrink-0 text-[11px] font-semibold text-[#7A0A17] bg-[#F6E4E8] px-2 py-0.5 rounded-md">
                      <MapPin size={11} strokeWidth={2.4} />
                      {story.area}
                    </span>
                  </div>
                  {story.quote || story.note ? (
                    <p className="text-[12.5px] text-[#4B5563] mt-2 leading-snug line-clamp-2">
                      {story.quote || story.note}
                    </p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-[#6B7280] leading-relaxed">
            {leadArea
              ? `No success stories are tagged for ${leadArea} yet. Use nearby branch wins when pitching this lead.`
              : "Add an area on the lead profile to see matching success stories."}
          </p>
        )}
      </Modal>

      <SuccessStoryDetailModal
        story={viewingSuccessStory}
        open={Boolean(viewingSuccessStory)}
        onClose={() => setViewingSuccessStory(null)}
        onShare={setSharingSuccessStory}
      />

      <ShareSuccessStoryModal
        open={Boolean(sharingSuccessStory)}
        onClose={() => setSharingSuccessStory(null)}
        story={sharingSuccessStory}
        deal={deal}
      />

      <AddSuccessStoryModal
        open={addSuccessStoryOpen}
        onClose={() => setAddSuccessStoryOpen(false)}
        area={leadArea || ""}
        defaultCouple={deal?.name || ""}
        onSave={(story) => {
          setCustomSuccessStories((current) => [story, ...current]);
          setViewingSuccessStory(story);
        }}
      />
    </>
  );
}
