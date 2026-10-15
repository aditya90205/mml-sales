import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
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

/** Demo success / roka-closure stories — filtered by lead area on Overview. */
const AREA_SUCCESS_STORIES = [
  {
    id: "ss-gk-1",
    area: "Greater Kailash II",
    couple: "Aarav & Meera",
    age: "29 & 27",
    profession: "Software Eng. · Marketing",
    package: "Premium",
    closedOn: "12 Mar 2026",
    note: "Matched within 45 days. Both families from GK-II.",
    quote: "MML helped us find our perfect match. The profiles were genuine and the process was very smooth.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=240&h=240&fit=crop&crop=faces",
    gallery: [
      {
        id: "ss-gk-1-g1",
        kind: "image",
        name: "Ceremony photo",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=450&fit=crop",
      },
      {
        id: "ss-gk-1-g2",
        kind: "image",
        name: "Family moment",
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=450&fit=crop",
      },
    ],
  },
  {
    id: "ss-gk-2",
    area: "Greater Kailash II",
    couple: "Kabir & Ananya",
    age: "31 & 28",
    profession: "CA · Doctor",
    package: "Exclusive",
    closedOn: "28 Jan 2026",
    note: "Home visit closed the deal after two shortlists.",
    quote: "We were impressed by how carefully they understood our preferences. Highly recommend!",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=240&h=240&fit=crop&crop=faces",
    gallery: [
      {
        id: "ss-gk-2-g1",
        kind: "image",
        name: "Reception",
        url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=450&fit=crop",
      },
    ],
  },
  {
    id: "ss-gk-3",
    area: "Greater Kailash II",
    couple: "Rohan & Priya",
    age: "28 & 26",
    profession: "MBA · Teacher",
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
    age: "30 & 27",
    profession: "Banking · Designer",
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
    age: "32 & 29",
    profession: "Entrepreneur · HR",
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
    age: "27 & 25",
    profession: "Engineer · Architect",
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
    age: "33 & 30",
    profession: "Govt. Officer · Lawyer",
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
    age: "29 & 27",
    profession: "Product Mgr · CA",
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
    age: "30 & 28",
    profession: "Doctor · Consultant",
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
    age: "28 & 26",
    profession: "B.Tech · MBA",
    package: "Exclusive",
    closedOn: "07 Jan 2026",
    note: "South Ex office walk-in converted in 30 days.",
    quote: "Professional, warm, and very clear about next steps. We felt looked after.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=240&h=240&fit=crop&crop=faces",
  },
  {
    id: "ss-rj-1",
    area: "Rajouri Garden",
    couple: "Manish & Neha",
    age: "31 & 28",
    profession: "Business · Teacher",
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
    age: "27 & 25",
    profession: "Software · Designer",
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

function locationTokens(locationStr) {
  return String(locationStr || "")
    .toLowerCase()
    .split(/[,/|&]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => {
      if (part.includes("ncr") || part.includes("delhi")) {
        return [
          "delhi",
          "ncr",
          "gurgaon",
          "noida",
          "gurugram",
          "south extension",
          "rohini",
          "vasant",
          "defence",
          "rajouri",
          "greater kailash",
          "kailash",
        ];
      }
      if (part.includes("mumbai")) return ["mumbai", "bombay"];
      if (part.includes("kailash") || part.includes("gk")) {
        return ["greater kailash", "kailash", "gk"];
      }
      return part.split(/\s+/).filter((w) => w.length > 2);
    });
}

function parseAgeNums(ageStr) {
  return String(ageStr || "")
    .match(/\d+/g)
    ?.map(Number)
    .filter((n) => Number.isFinite(n) && n > 0 && n < 120) || [];
}

function parsePreferenceAgeRange(ageFrom, ageTo, fallback = "26 - 31") {
  const from = Number(ageFrom);
  const to = Number(ageTo);
  if (Number.isFinite(from) && Number.isFinite(to)) return { from, to };
  if (Number.isFinite(from)) return { from, to: from };
  if (Number.isFinite(to)) return { from: to, to };
  const match = String(fallback || "").match(/(\d+)\s*[-–—]\s*(\d+)/);
  if (match) return { from: Number(match[1]), to: Number(match[2]) };
  return { from: 26, to: 31 };
}

/**
 * Roka / closure couple profiles for pitching — location-first, then age & profession.
 */
export function getClosureProfiles(deal) {
  const leadArea = shown(deal?.area || deal?.areaOfHouse);
  const preferredLocation = shown(
    deal?.intakeValues?.outOfCitySpecify || deal?.preferredLocation || leadArea
  );
  const locTokens = [
    ...locationTokens(leadArea),
    ...locationTokens(preferredLocation),
  ];
  const uniqueTokens = [...new Set(locTokens)];
  const ageRange = parsePreferenceAgeRange(
    deal?.intakeValues?.desiredAgeFrom || deal?.desiredAgeFrom,
    deal?.intakeValues?.desiredAgeTo || deal?.desiredAgeTo
  );
  const professionHint = String(
    deal?.profession || deal?.intakeValues?.profession || deal?.intakeValues?.minimumEducation || ""
  ).toLowerCase();

  return AREA_SUCCESS_STORIES.map((story) => {
    const reasons = [];
    let score = 20;
    const locBlob = String(story.area || "").toLowerCase();
    const locHit =
      (leadArea && areasMatch(story.area, leadArea)) ||
      uniqueTokens.some((token) => locBlob.includes(token));

    if (locHit) {
      score += 45;
      reasons.push(story.area || "Preferred location");
    }

    const ages = parseAgeNums(story.age);
    const ageHit = ages.some((age) => age >= ageRange.from && age <= ageRange.to);
    if (ageHit) {
      score += 18;
      reasons.push(`Age ${story.age}`);
    }

    const profBlob = String(story.profession || "").toLowerCase();
    const profTokens = professionHint
      .split(/[,/|&·\s]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);
    const profHit = profTokens.some((token) => profBlob.includes(token));
    if (profHit) {
      score += 14;
      reasons.push(story.profession);
    }

    return {
      ...story,
      location: story.area,
      matchScore: Math.min(98, Math.max(35, score)),
      matchReasons: reasons.slice(0, 3),
      locHit,
    };
  })
    .sort(
      (a, b) =>
        Number(b.locHit) - Number(a.locHit) ||
        b.matchScore - a.matchScore ||
        String(a.couple).localeCompare(String(b.couple))
    );
}

export function closureProfileCount(deal) {
  const all = getClosureProfiles(deal);
  const local = all.filter((p) => p.locHit);
  return local.length || all.length;
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

/** Card thumbnail — couple profile photo only (not gallery media). */
function getStoryProfileImage(story) {
  if (story?.profileImage) return story.profileImage;
  // Legacy: `image` was the card photo (unless it was saved as video-only media)
  if (story?.image && story.mediaKind !== "video") return story.image;
  return "";
}

/** Extra images/videos shown inside the detail modal — separate from profile photo. */
function getStoryGallery(story) {
  if (Array.isArray(story?.gallery) && story.gallery.length) {
    return story.gallery.filter((item) => item?.url);
  }
  const items = [];
  // Legacy single uploads that were NOT the profile card photo
  if (story?.video) {
    items.push({ id: "legacy-video", kind: "video", url: story.video, name: story.videoName });
  } else if (story?.mediaKind === "video" && story?.image) {
    items.push({ id: "legacy-video", kind: "video", url: story.image, name: story.mediaName });
  }
  if (story?.mediaKind === "both" && story?.image && story?.profileImage && story.image !== story.profileImage) {
    items.push({ id: "legacy-image", kind: "image", url: story.image, name: story.imageName });
  }
  return items;
}

function SuccessStoryCard({ story, onOpen, onShare, className = "", ...rest }) {
  const profileImage = getStoryProfileImage(story);
  const gallery = getStoryGallery(story);
  const hasGalleryVideo = gallery.some((item) => item.kind === "video");
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
          {profileImage ? (
            <img
              src={profileImage}
              alt={story.couple}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="size-full grid place-items-center text-[#D1D5DB]">
              <Heart size={22} strokeWidth={1.8} />
            </div>
          )}
          {hasGalleryVideo ? (
            <span className="absolute bottom-1.5 right-1.5 size-6 rounded-md bg-black/55 text-white grid place-items-center pointer-events-none">
              <Video size={12} strokeWidth={2.4} />
            </span>
          ) : null}
        </div>
        <div className="flex-1 min-w-0 px-3 py-2.5 pr-8 flex flex-col gap-1">
          <p className="text-[13px] font-bold text-[#7A0A17] leading-tight truncate">{story.couple}</p>
          <SuccessStoryStars rating={story.rating || 5} />
          <p className="mt-0.5 text-[11.5px] text-[#6B7280] leading-snug line-clamp-3">
            {shown(story.quote) || shown(story.note) || "No review yet."}
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
  const profileImage = getStoryProfileImage(story);
  const gallery = getStoryGallery(story);
  const review = shown(story.quote) || shown(story.note) || "No review text added.";
  const sourceLabel =
    story.source === "google" ? "Google Review" : story.source === "inapp" ? "In-app Review" : "Testimonial";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={story.couple}
      subtitle="Testimonial"
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
        <div className="rounded-2xl border border-[#F3D5DA] bg-[#FDF8F9] px-4 py-4">
          <div className="flex items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt={story.couple}
                className="size-12 rounded-xl object-cover border border-[#F3D5DA] shrink-0"
              />
            ) : (
              <span className="size-12 rounded-xl bg-white border border-[#F3D5DA] text-[#7A0A17] grid place-items-center shrink-0">
                <Heart size={18} strokeWidth={2.2} />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#7A0A17] truncate">{story.couple}</p>
              <div className="mt-1">
                <SuccessStoryStars rating={story.rating || 5} size={16} />
              </div>
            </div>
          </div>
          <p className="mt-3.5 text-[14.5px] text-[#374151] leading-relaxed">“{review}”</p>
          <p className="mt-2 text-[11.5px] font-semibold text-[#9CA3AF]">{sourceLabel}</p>
        </div>

        {gallery.length ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-[12.5px] font-bold text-[#111]">Photos &amp; videos</p>
            <div className="flex flex-col gap-2.5">
              {gallery.map((item) => (
                <div
                  key={item.id || item.url}
                  className="rounded-xl overflow-hidden border border-[#EEF1F4] bg-[#111] aspect-video"
                >
                  {item.kind === "video" ? (
                    <video
                      src={item.url}
                      className="size-full object-contain bg-black"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name || story.couple}
                      className="size-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function ClosureProfileCard({ profile, onOpen, onShare }) {
  return (
    <li>
      <article className="relative rounded-xl border border-[#EEF1F4] bg-white overflow-hidden hover:border-[#7A0A17]/25 hover:bg-[#FDFCFC] transition-colors flex">
        <button
          type="button"
          onClick={() => onOpen?.(profile)}
          className="flex flex-1 min-w-0 text-left"
          aria-label={`Open ${profile.couple} closure profile`}
        >
          <div className="relative w-[88px] shrink-0 self-stretch bg-[#F3F4F6]">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.couple}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="size-full grid place-items-center text-[#D1D5DB]">
                <Heart size={22} strokeWidth={1.8} />
              </div>
            )}
            {profile.locHit ? (
              <span className="absolute top-1.5 left-1.5 h-5 px-1.5 rounded-md bg-[#7A0A17] text-white text-[9px] font-bold uppercase tracking-wide grid place-items-center">
                Near
              </span>
            ) : null}
          </div>
          <div className="flex-1 min-w-0 px-3 py-2.5 pr-8 flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13.5px] font-bold text-[#7A0A17] leading-tight truncate">
                {profile.couple}
              </p>
              <span className="shrink-0 text-[10px] font-semibold text-[#7A0A17] bg-[#F6E4E8] px-1.5 py-0.5 rounded-md">
                Roka
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-[11.5px] text-[#6B7280] leading-snug">
              <p className="truncate">
                <span className="font-semibold text-[#4B5563]">Age:</span> {profile.age || "—"}
              </p>
              <p className="truncate">
                <span className="font-semibold text-[#4B5563]">Profession:</span>{" "}
                {profile.profession || "—"}
              </p>
              <p className="truncate inline-flex items-center gap-1 min-w-0">
                <MapPin size={11} className="text-[#9CA3AF] shrink-0" />
                <span className="truncate">
                  <span className="font-semibold text-[#4B5563]">Location:</span>{" "}
                  {profile.area || profile.location || "—"}
                </span>
              </p>
            </div>
            {profile.closedOn ? (
              <p className="text-[10.5px] text-[#9CA3AF] mt-0.5">Closed {profile.closedOn}</p>
            ) : null}
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShare?.(profile);
          }}
          className="absolute bottom-2 right-2 size-6 rounded-md text-[#9CA3AF] hover:text-[#7A0A17] hover:bg-[#FDF2F3] grid place-items-center transition-colors z-[1]"
          aria-label={`Share ${profile.couple} closure profile`}
          title="Share"
        >
          <Share2 size={13} strokeWidth={2.2} />
        </button>
      </article>
    </li>
  );
}

function preferenceSummaryFromDeal(deal) {
  const intake = deal?.intakeValues || {};
  const ageFrom = shown(intake.desiredAgeFrom || deal?.desiredAgeFrom);
  const ageTo = shown(intake.desiredAgeTo || deal?.desiredAgeTo);
  const age =
    ageFrom && ageTo ? `${ageFrom} - ${ageTo}` : ageFrom || ageTo || "26 - 31";
  const location =
    shown(intake.outOfCitySpecify || deal?.preferredLocation || deal?.area || deal?.areaOfHouse) ||
    "Delhi NCR";
  const profession = shown(deal?.profession || intake.profession || intake.minimumEducation);
  return { age, location, profession };
}

function ClosureProfilesModal({ open, onClose, deal, onOpenProfile, onShare }) {
  const preference = preferenceSummaryFromDeal(deal);
  const leadArea = shown(deal?.area || deal?.areaOfHouse) || preference.location;
  const profiles = useMemo(() => (open ? getClosureProfiles(deal) : []), [open, deal]);
  const localCount = profiles.filter((p) => p.locHit).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Closure Profiles"
      subtitle={
        localCount > 0
          ? `${localCount} roka closures near ${leadArea}`
          : `${profiles.length} roka closures · Age · Profession · Location`
      }
      icon={<Heart size={18} />}
      iconBg="#F6E4E8"
      iconColor="#7A0A17"
      width="max-w-2xl"
      zClass="z-[85]"
      contain
    >
      <p className="mb-4 text-[12px] leading-relaxed text-[#6B7280] bg-[#FDF2F3] border border-[#7A0A17]/12 rounded-xl px-3 py-2.5">
        <span className="font-semibold text-[#7A0A17]">Matched on: </span>
        Age {preference.age} · {preference.location}
        {preference.profession ? ` · ${preference.profession}` : ""} — location first
      </p>

      {profiles.length === 0 ? (
        <div className="py-10 text-center">
          <Heart size={28} className="mx-auto text-[#D1D5DB] mb-2" />
          <p className="text-[14px] font-semibold text-[#374151]">No closure profiles yet</p>
          <p className="text-[12.5px] text-[#9CA3AF] mt-1">
            Try another area or widen partner location preference.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {profiles.map((profile) => (
            <ClosureProfileCard
              key={profile.id}
              profile={profile}
              onOpen={(item) => {
                onClose?.();
                onOpenProfile?.(item);
              }}
              onShare={(item) => {
                onClose?.();
                onShare?.(item);
              }}
            />
          ))}
        </ul>
      )}
    </Modal>
  );
}

function SuccessStoriesTestimonials({ stories, onAdd, onViewAll, onOpen, onShare, onClosure, closureCount }) {
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
          {onClosure ? (
            <button
              type="button"
              onClick={onClosure}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-[#7A0A17]/35 bg-white text-[#7A0A17] text-[12.5px] font-semibold hover:bg-[#FDF2F3] transition-colors shrink-0"
            >
              Closure Profiles
              {Number(closureCount) > 0 ? (
                <span className="text-[11px] font-bold tabular-nums">({closureCount})</span>
              ) : null}
            </button>
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
  const [closureOpen, setClosureOpen] = useState(false);
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
  const closureCount = useMemo(() => closureProfileCount(deal), [deal]);

  return (
    <>
      <div className={className || undefined}>
        <SuccessStoriesTestimonials
          stories={areaSuccessStories}
          onAdd={() => setAddSuccessStoryOpen(true)}
          onViewAll={() => setSuccessStoriesOpen(true)}
          onOpen={setViewingSuccessStory}
          onShare={setSharingSuccessStory}
          onClosure={deal ? () => setClosureOpen(true) : undefined}
          closureCount={closureCount}
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
                        {[
                          shown(story.age) ? `Age ${story.age}` : null,
                          shown(story.profession) || null,
                          story.package ? `${story.package}` : null,
                          story.closedOn ? `Closed ${story.closedOn}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
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

      <ClosureProfilesModal
        open={closureOpen}
        onClose={() => setClosureOpen(false)}
        deal={deal}
        onOpenProfile={setViewingSuccessStory}
        onShare={setSharingSuccessStory}
      />
    </>
  );
}
