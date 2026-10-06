import { CLIENTS } from "../../utils/clientsData";

const face = (img) => `https://i.pravatar.cc/96?img=${img}`;

const MALE_FACES = [11, 12, 13, 15, 33, 52, 60, 68];
const FEMALE_FACES = [5, 9, 20, 25, 36, 44, 45, 47];

function script(lines) {
  return lines.map(([from, text, time]) => ({ from, text, time }));
}

const EMPLOYEES = [
  {
    id: "emp-rohit",
    name: "Rohit Verma",
    role: "Sales Executive",
    avatar: face(12),
    online: true,
    unread: 0,
    messages: script([
      ["them", "Hi Ankur, I have shared the client details in the Google Sheet. Please check and let me know if you need anything else.", "10:12 AM"],
      ["me", "Got it, thanks! I'll review it now.", "10:15 AM"],
      ["them", "Also, the client is interested in a meeting next week. Can you confirm your availability?", "10:20 AM"],
      ["me", "Yes, I'm available on 28th April. Please go ahead and fix the slot.", "10:22 AM"],
      ["them", "Great! I'll update the calendar and share the invite shortly.", "10:24 AM"],
    ]),
  },
  {
    id: "emp-priya",
    name: "Priya Singh",
    role: "Team Lead",
    avatar: face(47),
    online: true,
    unread: 1,
    messages: script([
      ["me", "Priya, can you review the South Extension pipeline before standup?", "Yesterday"],
      ["them", "On it. Two deals are waiting on biodata.", "Yesterday"],
      ["them", "Okay, got it 👍", "Yesterday"],
    ]),
  },
  {
    id: "emp-amit",
    name: "Amit Kumar",
    role: "Sales Manager",
    avatar: face(15),
    online: true,
    unread: 0,
    messages: script([
      ["them", "Sharing the weekly conversion sheet.", "Yesterday"],
      ["me", "Thanks Amit, I'll add the P3 notes.", "Yesterday"],
      ["them", "Please check the document.", "Yesterday"],
    ]),
  },
  {
    id: "emp-neha",
    name: "Neha Sharma",
    role: "Telecaller",
    avatar: face(45),
    online: true,
    unread: 2,
    messages: script([
      ["them", "Harshit didn't pick up the first call.", "23 Apr, 2026"],
      ["them", "Call you in 5 mins.", "23 Apr, 2026"],
    ]),
  },
  {
    id: "emp-sandeep",
    name: "Sandeep Yadav",
    role: "Marketing Executive",
    avatar: face(33),
    online: false,
    unread: 0,
    messages: script([
      ["me", "The campaign creative is approved.", "22 Apr, 2026"],
      ["them", "Thanks for the update.", "22 Apr, 2026"],
    ]),
  },
  {
    id: "emp-rakesh",
    name: "Rakesh Patel",
    role: "Operations",
    avatar: face(52),
    online: false,
    unread: 0,
    messages: script([
      ["them", "Home visit for Aslesha is pencilled for Thursday.", "20 Apr, 2026"],
      ["me", "Please lock the slot with the branch.", "20 Apr, 2026"],
      ["them", "Noted.", "20 Apr, 2026"],
    ]),
  },
  {
    id: "emp-pooja",
    name: "Pooja Mehta",
    role: "HR Executive",
    avatar: face(44),
    online: false,
    unread: 0,
    messages: script([
      ["them", "Shared the onboarding doc.", "19 Apr, 2026"],
      ["me", "Received, I'll sign it today.", "19 Apr, 2026"],
    ]),
  },
  {
    id: "emp-vikash",
    name: "Vikash Kumar",
    role: "IT Support",
    avatar: face(60),
    online: false,
    unread: 0,
    messages: script([
      ["me", "The client portal upload is failing for PDFs.", "18 Apr, 2026"],
      ["them", "Will do it today.", "18 Apr, 2026"],
    ]),
  },
];

const CLIENT_SCRIPTS = [
  script([
    ["them", "Hi, I wanted to go through the package once more.", "10:05 AM"],
    ["me", "Sure Harshit, I'll send a simpler comparison.", "10:18 AM"],
    ["them", "Please share the revised quotation.", "10:40 AM"],
  ]),
  script([
    ["me", "Aditi, your biodata draft is ready for a look.", "Yesterday"],
    ["them", "Thanks, the biodata looks good.", "Yesterday"],
  ]),
  script([
    ["them", "We liked the profiles you shared last week.", "21 Apr, 2026"],
    ["them", "Can we schedule a home visit?", "21 Apr, 2026"],
  ]),
  script([
    ["me", "Aanchal, the advance link is on the payment tab.", "18 Apr, 2026"],
    ["them", "I'll confirm the advance by Friday.", "18 Apr, 2026"],
  ]),
  script([
    ["them", "Shared my preferences in the form.", "16 Apr, 2026"],
    ["me", "Got them. I'll shortlist matches today.", "16 Apr, 2026"],
  ]),
  script([
    ["me", "Disha, shall I hold the Premium plan for you?", "14 Apr, 2026"],
    ["them", "Need a little more time to decide.", "14 Apr, 2026"],
  ]),
  script([
    ["them", "Please call me after 6 PM.", "12 Apr, 2026"],
    ["me", "I'll call you this evening.", "12 Apr, 2026"],
  ]),
  script([
    ["me", "Niharika, the balance link is active till Sunday.", "09 Apr, 2026"],
    ["them", "Received the payment link, thank you.", "09 Apr, 2026"],
  ]),
];

const CLIENT_UNREAD = [1, 0, 1, 0, 0, 0, 0, 0];
const CLIENT_ONLINE = [true, true, false, false, true, false, false, true];

export function buildContacts() {
  let n = 1;
  const withIds = (messages) =>
    messages.map((message) => ({ ...message, id: `seed-${n++}` }));

  const employees = EMPLOYEES.map((person) => ({
    ...person,
    kind: "employee",
    messages: withIds(person.messages),
  }));

  const clients = CLIENTS.slice(0, 8).map((client, index) => {
    const pool = client.gender === "Female" ? FEMALE_FACES : MALE_FACES;
    return {
      id: `client-${client.id}`,
      kind: "client",
      name: client.name,
      role: `Client · ${client.branch}`,
      avatar: face(pool[index % pool.length]),
      online: CLIENT_ONLINE[index] ?? false,
      unread: CLIENT_UNREAD[index] ?? 0,
      messages: withIds(CLIENT_SCRIPTS[index] || script([["them", "Hello.", "Today"]])),
    };
  });

  return [...employees, ...clients];
}

export function previewOf(contact) {
  const message = contact.messages[contact.messages.length - 1];
  if (!message) return { text: "No messages yet", time: "" };
  const prefix = message.from === "me" ? "You: " : "";
  let body = message.text || "";
  if (message.voice) body = "Voice message";
  else if (message.image) body = "Photo";
  else if (message.file) body = message.file;
  return { text: `${prefix}${body}`.trim(), time: message.time || "" };
}
