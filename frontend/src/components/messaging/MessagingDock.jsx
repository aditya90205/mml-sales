import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Gift,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Search,
  Send,
  Smile,
  X,
} from "lucide-react";
import { buildContacts, previewOf } from "./messagingData";

const LIST_OPEN_W = 344;
const LIST_CLOSED_W = 272;
const CHAT_W = 400;
const CHAT_MIN_W = 280;
const BAR_H = 52;
const INPUT_LINE_H = 32;
const INPUT_MAX_H = 68;
const EMOJIS = ["😀", "😊", "👍", "🙏", "❤️", "🎉", "✅", "👏", "🔥", "😄", "🤝", "📌"];
const DOCK_SHELL =
  "h-full overflow-hidden rounded-t-xl border border-[#B7BCC6] bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.08)]";

const ME = {
  name: "Ankur Sharma",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
};

function uid() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function clock() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Face({ src, name, online, size = 40 }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const dot = size > 36 ? 10 : 8;

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {src && !failed ? (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <span
          className="grid place-items-center rounded-full bg-[#FDE8E8] font-semibold text-[#7A1230]"
          style={{ width: size, height: size, fontSize: size < 36 ? 11 : 13 }}
        >
          {initials}
        </span>
      )}
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-[#22C55E] ring-2 ring-white"
          style={{ width: dot, height: dot }}
        />
      )}
    </span>
  );
}

function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#7A1230] px-1 text-[10px] font-bold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function ChatPane({ contact, draft, setDraft, onSend, onClose, onToggle, minimized }) {
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const imageRef = useRef(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || minimized) return;
    el.scrollTop = el.scrollHeight;
  }, [contact.id, contact.messages.length, minimized]);

  useEffect(() => {
    if (!minimized) inputRef.current?.focus({ preventScroll: true });
  }, [contact.id, minimized]);

  useEffect(() => {
    const el = inputRef.current;
    const box = el?.parentElement;
    if (!el || !box) return undefined;

    const fit = () => {
      const resting = minimized || !draft || el.clientWidth < 160;
      if (resting) {
        el.style.height = `${INPUT_LINE_H}px`;
        el.style.overflowY = "hidden";
        return;
      }
      el.style.height = `${INPUT_LINE_H}px`;
      const next = Math.min(Math.max(el.scrollHeight, INPUT_LINE_H), INPUT_MAX_H);
      const height = next > INPUT_LINE_H + 8 ? next : INPUT_LINE_H;
      el.style.height = `${height}px`;
      el.style.overflowY = height >= INPUT_MAX_H ? "auto" : "hidden";
    };

    fit();
    let lastWidth = box.clientWidth;
    const observer = new ResizeObserver(() => {
      if (box.clientWidth === lastWidth) return;
      lastWidth = box.clientWidth;
      fit();
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [draft, minimized]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend({ text });
    setEmojiOpen(false);
  };

  const insertEmoji = (emoji) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const next = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`;
    setDraft(next);
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus({ preventScroll: true });
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const readFile = (file, asImage) => {
    if (!file) return;
    if (asImage) {
      const reader = new FileReader();
      reader.onload = () => onSend({ text: "", image: String(reader.result || "") });
      reader.readAsDataURL(file);
      return;
    }
    onSend({ text: "", file: file.name });
  };

  return (
    <div key={contact.id} className="mml-chat-swap flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <div
        className={`flex h-[52px] shrink-0 items-center bg-white ${
          minimized ? "" : "border-b border-[#E8EAEE]"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex h-full min-w-0 flex-1 items-center gap-2.5 px-3 text-left"
        >
          <Face src={contact.avatar} name={contact.name} online={contact.online} size={36} />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold leading-tight text-[#1F2937]">
              {contact.name}
            </span>
            <span
              className={`mt-0.5 flex items-center gap-1.5 text-[11.5px] leading-none ${
                contact.online ? "text-[#16A34A]" : "text-[#9CA3AF]"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${contact.online ? "bg-[#16A34A]" : "bg-[#D1D5DB]"}`}
              />
              {contact.online ? "Messaging" : "Offline"}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={minimized ? "Expand chat" : "Minimize chat"}
          className="grid size-8 place-items-center rounded-lg text-[#6B7280] hover:bg-[#F4F5F7]"
        >
          {minimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="mr-1.5 grid size-8 place-items-center rounded-lg text-[#6B7280] hover:bg-[#F4F5F7]"
        >
          <X size={18} />
        </button>
      </div>

      <div
        ref={scrollerRef}
        inert={minimized}
        className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto bg-[#F7F8FA] px-3 py-4"
      >
        {contact.messages.map((message) => {
          const mine = message.from === "me";
          const hasMedia = Boolean(message.image || message.file || message.voice);
          const bubble = (
            <div
              className={`min-w-0 max-w-full rounded-2xl text-[13px] leading-[1.45] ${
                hasMedia ? "p-1.5" : "px-3 py-2"
              }`}
              style={
                mine
                  ? { backgroundColor: "#7A1230", color: "#fff" }
                  : { backgroundColor: "#D6EBFF", color: "#1F2937" }
              }
            >
              {message.image && (
                <img src={message.image} alt="" className="mb-1 max-h-40 w-full rounded-xl object-cover" />
              )}
              {message.file && (
                <div
                  className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px]"
                  style={{ backgroundColor: mine ? "rgba(255,255,255,0.16)" : "#fff" }}
                >
                  <span
                    className="rounded px-1 py-0.5 text-[10px] font-bold"
                    style={
                      mine
                        ? { backgroundColor: "rgba(255,255,255,0.22)" }
                        : { backgroundColor: "#FDE8E8", color: "#7A1230" }
                    }
                  >
                    FILE
                  </span>
                  <span className="min-w-0 flex-1 truncate">{message.file}</span>
                </div>
              )}
              {message.voice && (
                <div className="flex items-center gap-2 px-1 py-1">
                  <Mic size={14} />
                  <span className="h-1 w-24 rounded-full bg-current opacity-40" />
                  <span className="text-[11px]">0:04</span>
                </div>
              )}
              {message.text && (
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              )}
              {mine && (
                <span className="mt-1 flex items-center justify-end gap-1 text-[10px] leading-none text-white/80">
                  {message.time}
                  <CheckCheck size={12} />
                </span>
              )}
            </div>
          );

          if (mine) {
            return (
              <div key={message.id} className="flex w-full min-w-0 items-end justify-end gap-2">
                <div className="min-w-0 max-w-[calc(100%-40px)]">{bubble}</div>
                <Face src={ME.avatar} name={ME.name} online={false} size={32} />
              </div>
            );
          }

          return (
            <div key={message.id} className="flex w-full min-w-0 items-end gap-2">
              <Face src={contact.avatar} name={contact.name} online={false} size={32} />
              <div className="min-w-0 max-w-[calc(100%-40px)]">
                {bubble}
                <p className="mt-1 px-1 text-[11px] leading-none text-[#8B93A1]">{message.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div inert={minimized} className="relative grid w-full min-w-0 shrink-0 grid-cols-[minmax(0,1fr)_40px] items-center gap-2 border-t border-[#E8EAEE] bg-white px-3 py-2">
        {emojiOpen && (
          <div className="absolute bottom-full left-3 z-10 mb-2 grid grid-cols-6 gap-1 rounded-xl border border-[#E6E7EB] bg-white p-2 shadow-dropdown">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="grid size-8 place-items-center rounded-lg text-[18px] hover:bg-[#F4F5F7]"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div className="min-w-0 self-center rounded-2xl border border-[#E5E7EB] bg-white focus-within:border-[#7A1230]/40">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type a message..."
            style={{ height: INPUT_LINE_H }}
            className="mml-chat-input block max-h-[68px] w-full resize-none overflow-hidden bg-transparent px-3 py-1.5 text-[13px] leading-5 text-[#1F2937] outline-none placeholder:text-[#9CA3AF]"
          />
          <div className="flex items-center gap-1 px-1.5 pb-1">
            <button
              type="button"
              aria-label="Attach file"
              onClick={() => fileRef.current?.click()}
              className="grid size-7 place-items-center rounded-lg text-[#8AA0BE] hover:bg-[#F4F7FB]"
            >
              <Paperclip size={16} />
            </button>
            <button
              type="button"
              aria-label="Send image"
              onClick={() => imageRef.current?.click()}
              className="grid size-7 place-items-center rounded-lg text-[#8AA0BE] hover:bg-[#F4F7FB]"
            >
              <ImageIcon size={16} />
            </button>
            <button
              type="button"
              aria-label="Send gift"
              onClick={() => onSend({ text: "🎁" })}
              className="grid size-7 place-items-center rounded-lg text-[#8AA0BE] hover:bg-[#F4F7FB]"
            >
              <Gift size={16} />
            </button>
            <button
              type="button"
              aria-label="Add emoji"
              onClick={() => setEmojiOpen((open) => !open)}
              className={`grid size-7 place-items-center rounded-lg hover:bg-[#F4F7FB] ${
                emojiOpen ? "text-[#7A1230]" : "text-[#8AA0BE]"
              }`}
            >
              <Smile size={16} />
            </button>
            <button
              type="button"
              aria-label="Voice message"
              onClick={() => onSend({ text: "", voice: true })}
              className="grid size-7 place-items-center rounded-lg text-[#8AA0BE] hover:bg-[#F4F7FB]"
            >
              <Mic size={16} />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="grid size-10 place-items-center justify-self-end self-center rounded-full bg-[#7A1230] text-white transition-colors hover:bg-[#641026] disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            readFile(e.target.files?.[0], false);
            e.target.value = "";
          }}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            readFile(e.target.files?.[0], true);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export default function MessagingDock() {
  const [contacts, setContacts] = useState(buildContacts);
  const [listOpen, setListOpen] = useState(false);
  const [tab, setTab] = useState("employee");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [chatShown, setChatShown] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [draft, setDraft] = useState("");
  const [openH, setOpenH] = useState(560);
  const [chatW, setChatW] = useState(CHAT_W);
  const activeIdRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const fit = () => {
      setOpenH(Math.min(560, Math.max(380, window.innerHeight - 68)));
      const space = window.innerWidth - LIST_OPEN_W - 48;
      setChatW(Math.max(300, Math.min(CHAT_W, space)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    if (!activeId) return undefined;
    const frame = requestAnimationFrame(() => setChatShown(true));
    return () => cancelAnimationFrame(frame);
  }, [activeId]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const closeChat = useCallback(() => {
    setChatShown(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setActiveId(null);
      setChatMinimized(false);
      closeTimer.current = null;
    }, 300);
  }, []);

  const openChat = useCallback((id) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (activeIdRef.current) setChatShown(true);
    activeIdRef.current = id;
    setActiveId(id);
    setChatMinimized(false);
    setDraft("");
    setContacts((prev) => prev.map((contact) => (
      contact.id === id ? { ...contact, unread: 0 } : contact
    )));
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (activeIdRef.current) {
        closeChat();
        return;
      }
      setListOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeChat]);

  const send = useCallback((partial) => {
    const id = activeIdRef.current;
    if (!id) return;
    const message = {
      id: uid(),
      from: "me",
      time: clock(),
      text: partial.text || "",
      image: partial.image,
      file: partial.file,
      voice: partial.voice,
    };
    setContacts((prev) => {
      const index = prev.findIndex((contact) => contact.id === id);
      if (index < 0) return prev;
      const updated = {
        ...prev[index],
        unread: 0,
        messages: [...prev[index].messages, message],
      };
      const rest = prev.filter((contact) => contact.id !== id);
      const insertAt = rest.findIndex((contact) => contact.kind === updated.kind);
      const at = insertAt < 0 ? rest.length : insertAt;
      return [...rest.slice(0, at), updated, ...rest.slice(at)];
    });
    if (partial.text) setDraft("");
  }, []);

  const unreadTotal = contacts.reduce((sum, contact) => sum + contact.unread, 0);
  const active = contacts.find((contact) => contact.id === activeId) || null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (contact.kind !== tab) return false;
      if (!q) return true;
      const preview = previewOf(contact).text.toLowerCase();
      return (
        contact.name.toLowerCase().includes(q)
        || contact.role.toLowerCase().includes(q)
        || preview.includes(q)
      );
    });
  }, [contacts, tab, query]);

  const listW = listOpen ? LIST_OPEN_W : LIST_CLOSED_W;
  const listH = listOpen ? openH : BAR_H;
  const chatOpen = Boolean(activeId && chatShown);
  const paneW = chatMinimized ? CHAT_MIN_W : chatW;
  const paneH = chatMinimized ? BAR_H : openH;

  return (
    <div className="pointer-events-none fixed bottom-0 right-3 z-40 flex items-end">
      <div
        className={`mml-dock-motion ${chatOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        style={{
          width: chatOpen ? paneW : 0,
          height: active ? paneH : 0,
          opacity: chatOpen ? 1 : 0,
          marginRight: chatOpen ? 12 : 0,
        }}
        aria-hidden={!chatOpen}
      >
        <div className={DOCK_SHELL}>
          <div className="h-full">
            {active && (
              <section
                aria-label={`Chat with ${active.name}`}
                className="flex h-full w-full min-w-0 flex-col"
                style={{ height: openH }}
              >
                <ChatPane
                  key={active.id}
                  contact={active}
                  draft={draft}
                  setDraft={setDraft}
                  onSend={send}
                  onClose={closeChat}
                  onToggle={() => setChatMinimized((value) => !value)}
                  minimized={chatMinimized}
                />
              </section>
            )}
          </div>
        </div>
      </div>

      <section
        aria-label="Messaging"
        className="mml-dock-motion pointer-events-auto"
        style={{ width: listW, height: listH }}
      >
        <div className={DOCK_SHELL}>
          <div className="flex h-full flex-col">
        <button
          type="button"
          onClick={() => setListOpen((open) => !open)}
          aria-expanded={listOpen}
          className={`flex h-[52px] w-full shrink-0 items-center gap-2 bg-[#FAFBFC] px-3 text-left hover:bg-[#F3F4F6] ${
            listOpen ? "border-b border-[#E1E4EA]" : ""
          }`}
        >
          <span
            className="mml-dock-motion inline-flex overflow-hidden"
            style={{ width: listOpen ? 0 : 42, opacity: listOpen ? 0 : 1 }}
          >
            <span className="inline-flex w-[42px] shrink-0">
              <Face src={ME.avatar} name={ME.name} online size={32} />
            </span>
          </span>
          <span className="truncate text-[15px] font-semibold text-[#1F2937]">Messaging</span>
          <UnreadBadge count={unreadTotal} />
          <span className="ml-auto text-[#6B7280]">
            {listOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </span>
        </button>

        <div inert={!listOpen} className="flex min-h-0 flex-1 flex-col">
          <div className="px-3 pb-2 pt-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages..."
                className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#FAFBFC] pl-9 pr-8 text-[13px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:border-[#7A1230]/45 focus:bg-white"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-[#9CA3AF] hover:text-[#4B5563]"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 px-3 pb-2" role="tablist">
            {[
              ["employee", "Employee"],
              ["client", "Client"],
            ].map(([key, label]) => {
              const selected = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(key)}
                  className={`h-9 rounded-lg text-[13px] font-semibold transition-colors ${
                    selected
                      ? "bg-[#7A1230] text-white"
                      : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#FAFBFC]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-2">
            {visible.length === 0 && (
              <p className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]">No profiles found</p>
            )}
            {visible.map((contact) => {
              const preview = previewOf(contact);
              const selected = contact.id === activeId;
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => openChat(contact.id)}
                  className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors ${
                    selected ? "bg-[#FDF2F4]" : "hover:bg-[#F7F8FA]"
                  }`}
                >
                  <Face src={contact.avatar} name={contact.name} online={contact.online} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold leading-tight text-[#1F2937]">
                      {contact.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] leading-tight text-[#9CA3AF]">
                      {contact.role}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] leading-tight text-[#6B7280]">
                      {preview.text}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5 self-start pt-0.5">
                    <span className="text-[11px] leading-none text-[#9CA3AF]">{preview.time}</span>
                    <span className="flex items-center gap-1">
                      <UnreadBadge count={contact.unread} />
                      <ChevronRight size={14} className="text-[#C4C8D0]" />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
          </div>
        </div>
      </section>
    </div>
  );
}
