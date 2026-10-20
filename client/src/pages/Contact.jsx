// pages/Contact.jsx
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// VITE_API_URL may be "http://localhost:5000/api" in this project.
// Strip a trailing "/api" so fetch(`${API}/api/chat/...`) never becomes "/api/api/...".
// SOCKET_URL must be the bare host — Socket.IO connects to the server root.
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || API).replace(/\/api\/?$/, '');

export default function Contact() {
  const [session, setSession] = useState(null); // { sessionToken, conversation }
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);

  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimeout = useRef(null);

  // Resume existing session from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('alveoly:chat');
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Connect socket when we have a session
  useEffect(() => {
    if (!session?.sessionToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: session.sessionToken, role: 'guest' },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('chat:history', (history) => setMessages(history));
    socket.on('chat:message', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('chat:closed', () => {
      setError('This conversation was closed by support. Start a new chat if you need more help.');
      setConnected(false);
    });
    socket.on('admin:typing', ({ isTyping }) => setTyping(isTyping));

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [session?.sessionToken]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Start a new session
  const startSession = async (e) => {
    e.preventDefault();
    setError('');
    setStarting(true);
    try {
      const res = await fetch(`${API}/api/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start chat');
      setSession(data);
      sessionStorage.setItem('alveoly:chat', JSON.stringify(data));
      setMessages(data.conversation?.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socketRef.current || sending) return;
    setSending(true);
    socketRef.current.emit('chat:send', { text }, (ack) => {
      setSending(false);
      if (ack?.success) setInput('');
      else setError(ack?.error || 'Failed to send');
    });
  };

  const onInputChange = (e) => {
    setInput(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('chat:typing', true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing', false);
    }, 1200);
  };

  const resetSession = () => {
    sessionStorage.removeItem('alveoly:chat');
    setSession(null);
    setMessages([]);
    setInput('');
    setConnected(false);
  };

  return (
    <main id="top" className="page-scroll min-h-screen overflow-x-hidden bg-[#fdfbf7] text-[#1a1a1a]">
      <Navbar scrolled={false} openLogin={() => {}} openRegister={() => {}} />

      <section className="mx-auto max-w-3xl px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-[11.5px] font-medium text-[#4a4a4a] backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
            About & Support
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
            Built for creators.{' '}
            <span className="font-serif-human italic font-medium text-[var(--coral)]">
              By creators.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#6b6b6b] sm:text-base">
            We're a small team in Ghana building the creative studio we always wanted.
            Talk to us live — we read every message.
          </p>
        </div>

        {/* Values */}
        <div className="mb-12 grid gap-3 sm:grid-cols-3">
          {[
            { t: 'Speed with taste', d: 'Fast generations, never at the cost of quality.' },
            { t: 'Fair for everyone', d: 'Affordable plans, transparent credits.' },
            { t: 'Built in Africa', d: 'Designed in Ghana, used worldwide.' },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
              <h3 className="text-[13.5px] font-semibold">{v.t}</h3>
              <p className="mt-1.5 text-[12.5px] leading-5 text-[#6b6b6b]">{v.d}</p>
            </div>
          ))}
        </div>

        {/* Chat card */}
        <div className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight">
                Live <span className="font-serif-human italic text-[var(--coral)]">support.</span>
              </h2>
              <p className="mt-0.5 text-[12px] text-[#6b6b6b]">
                {session
                  ? `Chatting as ${session.conversation?.guestName || 'Guest'}`
                  : 'Start by telling us who you are.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {session && (
                <button
                  onClick={resetSession}
                  className="text-[11.5px] font-medium text-[#8a8a8a] hover:text-[#1a1a1a]"
                >
                  New chat
                </button>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium ${
                  connected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                {connected ? 'Live' : session ? 'Connecting…' : 'Offline'}
              </span>
            </div>
          </div>

          {/* No session yet → guest form */}
          {!session ? (
            <form onSubmit={startSession} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#4a4a4a]">
                  Your name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ama Mensah"
                  className="w-full rounded-xl border border-black/10 bg-[#faf8f4] px-4 py-3 text-[13.5px] outline-none transition focus:border-[var(--coral)]/40 focus:ring-4 focus:ring-[var(--coral)]/10"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#4a4a4a]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-black/10 bg-[#faf8f4] px-4 py-3 text-[13.5px] outline-none transition focus:border-[var(--coral)]/40 focus:ring-4 focus:ring-[var(--coral)]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#4a4a4a]">
                    Phone (optional)
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+233 …"
                    className="w-full rounded-xl border border-black/10 bg-[#faf8f4] px-4 py-3 text-[13.5px] outline-none transition focus:border-[var(--coral)]/40 focus:ring-4 focus:ring-[var(--coral)]/10"
                  />
                </div>
              </div>
              <p className="text-[11.5px] text-[#8a8a8a]">
                Provide an email or phone so we can follow up if we miss you.
              </p>
              {error && <p className="text-[12px] text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={starting}
                className="w-full rounded-xl bg-[#1a1a1a] py-3 text-[13.5px] font-semibold text-white transition hover:bg-[#2b2b2b] disabled:opacity-50"
              >
                {starting ? 'Starting…' : 'Start chat'}
              </button>
            </form>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="h-[360px] space-y-3 overflow-y-auto px-6 py-5">
                {messages.map((m) => (
                  <div
                    key={m._id || m.ts + m.text}
                    className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-5 ${
                        m.from === 'user'
                          ? 'bg-[#1a1a1a] text-white'
                          : m.from === 'system'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-[#f5f3ef] text-[#1a1a1a]'
                      }`}
                    >
                      {m.from === 'admin' && (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--coral)]">
                          Alveoly Support
                        </p>
                      )}
                      {m.text}
                      <p
                        className={`mt-1 text-[10px] ${
                          m.from === 'user' ? 'text-white/40' : 'text-[#8a8a8a]'
                        }`}
                      >
                        {new Date(m.ts).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-[#f5f3ef] px-4 py-2 text-[12px] text-[#6b6b6b]">
                      Support is typing…
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="border-t border-black/[0.06] px-6 py-2 text-[12px] text-red-500">
                  {error}
                </p>
              )}

              {/* Input */}
              <form onSubmit={send} className="flex items-center gap-2 border-t border-black/[0.06] p-3">
                <input
                  value={input}
                  onChange={onInputChange}
                  placeholder={connected ? 'Type a message…' : 'Reconnecting…'}
                  disabled={!connected}
                  maxLength={2000}
                  className="flex-1 rounded-full border border-black/10 bg-[#faf8f4] px-4 py-3 text-[13.5px] outline-none transition focus:border-[var(--coral)]/40 focus:ring-4 focus:ring-[var(--coral)]/10 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || !connected || sending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-[12.5px] text-[#8a8a8a]">
          Prefer email? Reach us at{' '}
          <a href="mailto:support@alveolystudios.com" className="font-semibold text-[var(--coral)] hover:underline">
            support@alveolystudios.com
          </a>
        </p>
      </section>

      <Footer />
    </main>
  );
}