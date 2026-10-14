/** Mock Google + in-app reviews for Add Success Story (demo — no live API). */

const GOOGLE_REVIEW_SAMPLES = [
  {
    couple: "Aarav & Meera",
    quote:
      "MML helped us find our perfect match. The profiles were genuine and the process was very smooth.",
    rating: 5,
  },
  {
    couple: "Kabir & Ananya",
    quote:
      "We were impressed by how carefully they understood our preferences. Highly recommend!",
    rating: 5,
  },
  {
    couple: "Rohan & Priya",
    quote:
      "From the first meeting to the final match, everything felt personal and professional.",
    rating: 5,
  },
  {
    couple: "Vikram & Sneha",
    quote: "Genuine profiles and thoughtful guidance. We found our life partner through MML.",
    rating: 4,
  },
];

export const INAPP_REVIEWS = [
  {
    id: "inapp-1",
    couple: "Aarav & Meera",
    quote: "Matched within 45 days. Both families felt heard every step of the way.",
    rating: 5,
    area: "Greater Kailash II",
    completedOn: "12 Mar 2026",
  },
  {
    id: "inapp-2",
    couple: "Kabir & Ananya",
    quote: "Home visit closed the deal after two shortlists. Very professional team.",
    rating: 5,
    area: "Greater Kailash II",
    completedOn: "28 Jan 2026",
  },
  {
    id: "inapp-3",
    couple: "Rohan & Priya",
    quote: "Same society network referrals made everything faster. Grateful to MML.",
    rating: 5,
    area: "Greater Kailash II",
    completedOn: "09 Nov 2025",
  },
  {
    id: "inapp-4",
    couple: "Vikram & Sneha",
    quote: "Sibling referral from GK-I. Clear communication throughout.",
    rating: 4,
    area: "Greater Kailash I",
    completedOn: "02 Aug 2025",
  },
  {
    id: "inapp-5",
    couple: "Arjun & Diya",
    quote: "Cross-branch shortlist accepted in week 3. The RM was patient with our families.",
    rating: 5,
    area: "South Extension",
    completedOn: "18 Feb 2026",
  },
  {
    id: "inapp-6",
    couple: "Manish & Neha",
    quote: "Even as an NRI family, video intros and clear updates made the journey easy.",
    rating: 5,
    area: "Rajouri Garden",
    completedOn: "05 Dec 2025",
  },
  {
    id: "inapp-7",
    couple: "Ishaan & Kavya",
    quote: "App notifications kept us updated. Left our review right after engagement.",
    rating: 5,
    area: "Defence Colony",
    completedOn: "22 Feb 2026",
  },
  {
    id: "inapp-8",
    couple: "Dev & Riya",
    quote: "In-app chat with the counselor helped settle family questions quickly.",
    rating: 4,
    area: "Lajpat Nagar",
    completedOn: "14 Jan 2026",
  },
  {
    id: "inapp-9",
    couple: "Aditya & Sara",
    quote: "Smooth onboarding in the app. We recommended MML to two friends already.",
    rating: 5,
    area: "Vasant Kunj",
    completedOn: "03 Mar 2026",
  },
  {
    id: "inapp-10",
    couple: "Nikhil & Pooja",
    quote: "Left 5 stars in the app the day we confirmed the match. Thank you team!",
    rating: 5,
    area: "Pitampura",
    completedOn: "19 Feb 2026",
  },
];

function hashString(value) {
  const s = String(value || "");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function isValidHttpUrl(value) {
  return /^https?:\/\/.+/i.test(String(value || "").trim());
}

/**
 * Mock fetch: simulates pulling a client's Google review from a pasted link.
 * @param {string} url
 * @returns {Promise<{ couple: string, quote: string, rating: number, googleLink: string }>}
 */
export function fetchGoogleReviewFromLink(url) {
  const link = String(url || "").trim();
  return new Promise((resolve, reject) => {
    if (!isValidHttpUrl(link)) {
      reject(new Error("Enter a valid Google review link."));
      return;
    }
    window.setTimeout(() => {
      const sample = GOOGLE_REVIEW_SAMPLES[hashString(link) % GOOGLE_REVIEW_SAMPLES.length];
      resolve({
        couple: sample.couple,
        quote: sample.quote,
        rating: sample.rating,
        googleLink: link,
      });
    }, 650);
  });
}

/**
 * Case-insensitive search over completed in-app reviews (couple name + quote).
 * @param {string} query
 * @returns {typeof INAPP_REVIEWS}
 */
export function searchInAppReviews(query) {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return INAPP_REVIEWS.slice(0, 6);
  return INAPP_REVIEWS.filter(
    (r) =>
      r.couple.toLowerCase().includes(q) ||
      r.quote.toLowerCase().includes(q) ||
      (r.area || "").toLowerCase().includes(q)
  );
}
