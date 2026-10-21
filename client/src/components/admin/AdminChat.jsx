// components/admin/AdminChat.jsx
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

// Strip trailing "/api" — VITE_API_URL may be "http://localhost:5000/api".
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || API).replace(/\/api\/?$/, '');

export default function AdminChat() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('open');
  const [typingBy, setTypingBy] = useState({});
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  /* ── Fetch list ─────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ status: filter, search, limit: 50 });
        const res = await fetch(`${API}/api/chat/conversations?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error('[AdminChat] list failed:', res.status, await res.text());
          if (!cancelled) setConversations([]);
          return;
        }
        const data = await res.json();
        if (!cancelled) setConversations(data.items || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [filter, search, token]);

  /* ── Realtime socket ────────────────────────── */
  useEffect(() => {
    if (!token) return;
    const s = io(SOCKET_URL, {
      auth: { token, role: 'admin' },
      transports: ['websocket'],
    });
    socketRef.current = s;

    s.on('admin:conversation:new', (conv) => {
      setConversations((prev) => {
        if (prev.some((c) => c._id === conv._id)) return prev;
        return [conv, ...prev];
      });
    });
    s.on('admin:conversation:updated', ({ id, lastMessagePreview, lastMessageAt, unreadByAdmin }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, lastMessagePreview, lastMessageAt, unreadByAdmin: unreadByAdmin ?? c.unreadByAdmin }
            : c
        )
      );
    });
    s.on('admin:presence', ({ id, online }) => {
      setConversations((prev) => prev.map((c) => (c._id === id ? { ...c, online } : c)));
    });
    s.on('admin:typing', ({ conversationId, isTyping }) => {
      setTypingBy((prev) => ({ ...prev, [conversationId]: isTyping }));
    });
    s.on('admin:message:new', ({ conversationId, message }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessagePreview: message.text.slice(0, 140),
                lastMessageAt: message.ts,
                unreadByAdmin: (c.unreadByAdmin || 0) + 1,
              }
            : c
        )
      );
      if (activeId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });
    s.on('admin:conversation:closed', ({ id }) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: 'closed' } : c))
      );
    });

    return () => {
      s.off();
      s.disconnect();
    };
  }, [token, activeId]);

  /* ── Load active conversation ───────────────── */
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const res = await fetch(`${API}/api/chat/conversations/${activeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error('[AdminChat] load failed:', res.status, await res.text());
        return;
      }
      const data = await res.json();
      setMessages(data.messages || []);
      await fetch(`${API}/api/chat/conversations/${activeId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    })();
  }, [activeId, token]);

  /* ── Auto-scroll ────────────────────────────── */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeId) return;
    setInput('');
    try {
      const res = await fetch(`${API}/api/chat/conversations/${activeId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        console.error('[AdminChat] reply failed:', res.status, await res.text());
        setInput(text);
        return;
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      console.error(err);
      setInput(text);
    }
  };

  const closeConv = async () => {
    if (!activeId) return;
    await fetch(`${API}/api/chat/conversations/${activeId}/close`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setActiveId(null);
  };

  const active = conversations.find((c) => c._id === activeId);

  return (
    <div className="grid h-[calc(100dvh-110px)] grid-cols-1 gap-3 sm:gap-4 lg:h-[calc(100vh-140px)] lg:grid-cols-[340px_1fr]">
      {/* ═══ LIST — hidden on mobile when a chat is open ═══ */}
      <div
        className={`${
          active ? 'hidden lg:flex' : 'flex'
        } min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]`}
      >
        {/* Header + search + filter */}
        <div className="space-y-2 border-b border-white/[0.06] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Conversations
            </p>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/50">
              {conversations.length}
            </span>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white placeholder-white/30 outline-none transition focus:border-[#8b5cf6]/50"
          />
          <div className="flex gap-1">
            {['open', 'closed', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex-1 rounded-md px-2 py-1.5 text-[10.5px] font-medium capitalize transition ${
                  filter === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading && <p className="p-4 text-center text-[12px] text-white/40">Loading…</p>}
          {!loading && conversations.length === 0 && (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[12px] text-white/40">No conversations yet.</p>
            </div>
          )}
          {conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveId(c._id)}
              className={`flex w-full items-center gap-3 border-b border-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.04] ${
                activeId === c._id ? 'bg-white/[0.06]' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#8b5cf6] text-[11px] font-semibold text-white">
                  {(c.guestName || 'G').slice(0, 1).toUpperCase()}
                </div>
                {c.online && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0e0d0c] bg-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12.5px] font-medium text-white/90">{c.guestName}</p>
                  {c.unreadByAdmin > 0 && (
                    <span className="shrink-0 rounded-full bg-[#8b5cf6] px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {c.unreadByAdmin}
                    </span>
                  )}
                </div>
                <p className="truncate text-[10.5px] text-white/40">
                  {c.lastMessagePreview || 'No messages'}
                </p>
                <p className="truncate text-[9.5px] text-white/25">
                  {c.guestEmail || c.guestPhone || '—'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CHAT PANEL — hidden on mobile until a chat is selected ═══ */}
      <div
        className={`${
          active ? 'flex' : 'hidden lg:flex'
        } min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]`}
      >
        {active ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5 sm:px-5 sm:py-3">
              <div className="flex min-w-0 items-center gap-2">
                {/* Back (mobile only) */}
                <button
                  onClick={() => setActiveId(null)}
                  className="shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5 text-white/60 transition hover:text-white lg:hidden"
                  aria-label="Back to conversations"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white">{active.guestName}</p>
                  <p className="truncate text-[10.5px] text-white/40 sm:text-[11px]">
                    {[active.guestEmail, active.guestPhone].filter(Boolean).join(' · ') || 'Guest'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {typingBy[active._id] && (
                  <span className="hidden text-[10.5px] text-emerald-400 sm:inline">typing…</span>
                )}
                <button
                  onClick={closeConv}
                  className="rounded-full border border-red-500/30 px-2.5 py-1 text-[10.5px] font-medium text-red-300 transition hover:bg-red-500/10 sm:px-3 sm:text-[11px]"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3 sm:space-y-3 sm:px-5 sm:py-4">
              {messages.length === 0 && (
                <p className="py-8 text-center text-[12px] text-white/30">No messages yet.</p>
              )}
              {messages.map((m) => (
                <div
                  key={m._id || m.ts}
                  className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-5 sm:max-w-[75%] sm:px-4 sm:py-2.5 sm:text-[13px] ${
                      m.from === 'admin'
                        ? 'bg-[#8b5cf6] text-white'
                        : m.from === 'system'
                        ? 'bg-amber-500/10 text-amber-200'
                        : 'bg-white/[0.06] text-white/90'
                    }`}
                  >
                    {m.text}
                    <p
                      className={`mt-1 text-[9.5px] sm:text-[10px] ${
                        m.from === 'admin' ? 'text-white/50' : 'text-white/30'
                      }`}
                    >
                      {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {typingBy[active._id] && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white/[0.06] px-3.5 py-2 text-[11.5px] text-white/50">
                    Guest is typing…
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={send}
              className="flex items-center gap-1.5 border-t border-white/[0.06] p-2 sm:gap-2 sm:p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Reply as Alveoly Support…"
                className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[12.5px] text-white placeholder-white/30 outline-none transition focus:border-[#8b5cf6]/50 sm:px-4 sm:text-[13px]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-full bg-[#8b5cf6] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#7c3aed] disabled:opacity-40 sm:px-5 sm:text-[12.5px]"
                aria-label="Send reply"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          /* Empty state (desktop only — hidden on mobile because the list is visible) */
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-white/70">Select a conversation</p>
            <p className="mt-1 max-w-xs text-[12px] text-white/40">
              Guest conversations will appear here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}