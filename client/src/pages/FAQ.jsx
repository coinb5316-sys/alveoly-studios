import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─────────────────────────────────────────────
   FAQ content — grouped by category
   ───────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'general', label: 'General', icon: 'sparkles' },
  { id: 'tools',   label: 'Tools & Features', icon: 'wand' },
  { id: 'billing', label: 'Billing & Credits', icon: 'card' },
  { id: 'account', label: 'Account & Access', icon: 'user' },
];

const FAQS = [
  {
    id: 'what-is-alveoly',
    category: 'general',
    q: 'What is Alveoly Studios?',
    a: 'Alveoly Studios is a creative space for exploring AI-powered image, video, and audio tools. We combine the best generative models into one seamless platform — so you can go from an idea to a finished piece without juggling five different apps.',
  },
  {
    id: 'design-experience',
    category: 'general',
    q: 'Do I need design experience?',
    a: 'No. Start with an idea or a text prompt and experiment with the available tools. Our interface is designed for beginners and professionals alike — you bring the vision, we handle the craft.',
  },
  {
    id: 'free-trial',
    category: 'general',
    q: 'Can I try it for free?',
    a: 'Yes. Create an account and you get free credits on signup — no credit card required. You can upgrade to a paid plan anytime you need more credits or premium features.',
  },
  {
    id: 'commercial-use',
    category: 'general',
    q: 'Can I use the generated content commercially?',
    a: 'Yes. On paid plans, you have full commercial rights to everything you generate. Free plans are for personal and evaluation use — see our Terms of Service for the exact scope.',
  },
  {
    id: 'which-tools',
    category: 'tools',
    q: 'What tools are included?',
    a: '18 professional tools across three studios: Visual (image generation, editing, upscaling, background removal, headshots, colorization), Motion (text-to-video, image-to-video, video-to-video, talking photos, lip sync, face swap, animation, GIFs), and Audio (voiceover, voice cloning, subtitle generation, translation).',
  },
  {
    id: 'output-resolution',
    category: 'tools',
    q: 'What resolution are the outputs?',
    a: 'Image outputs default to 1024×1024 but can be upscaled to 4K with our Upscaler. Video outputs render in 720p or 1080p depending on the tool and plan tier. Enterprise plans unlock 4K video.',
  },
  {
    id: 'file-formats',
    category: 'tools',
    q: 'What file formats can I download?',
    a: 'Images export as PNG, JPG, or WEBP. Videos export as MP4 (H.264). Audio exports as MP3 or WAV. All downloads are watermark-free on paid plans.',
  },
  {
    id: 'how-credits-work',
    category: 'billing',
    q: 'How do credits work?',
    a: 'Credits are the currency of Alveoly Studios. Each generation costs a small number of credits (images typically 1, videos 3–5 depending on length). You can buy more credits anytime from the Billing page, or upgrade to a monthly plan for a recurring allowance.',
  },
  {
    id: 'payment-methods',
    category: 'billing',
    q: 'What payment methods do you accept?',
    a: 'We use Paystack for secure payments. You can pay with a local debit or credit card. Prices are listed in USD and converted to your local currency at checkout. Mobile money is supported in select African countries.',
  },
  {
    id: 'refunds',
    category: 'billing',
    q: 'Do you offer refunds?',
    a: 'Yes — we offer a 7-day refund on first-time subscriptions, no questions asked. Email support@alveolystudios.com with your account email and we\'ll process it within 2 business days.',
  },
  {
    id: 'cancel-anytime',
    category: 'billing',
    q: 'Can I cancel my subscription?',
    a: 'Absolutely. Cancel anytime from your Billing dashboard. You keep access until the end of your current billing cycle, and unused credits stay valid for 30 days after cancellation.',
  },
  {
    id: 'roll-over',
    category: 'billing',
    q: 'Do unused credits roll over?',
    a: 'Monthly plan credits reset at the start of each cycle. Top-up credit packs (purchased separately) do roll over for 12 months. Enterprise plans can request rollover limits.',
  },
  {
    id: 'reset-password',
    category: 'account',
    q: 'How do I reset my password?',
    a: 'On the login page, click "Forgot password?" and enter your account email. You\'ll receive a reset link within a minute. If it doesn\'t arrive, check your spam folder or contact support.',
  },
  {
    id: 'delete-account',
    category: 'account',
    q: 'How do I delete my account?',
    a: 'Go to Dashboard → Settings → Danger Zone → Delete Account. All your data is permanently removed within 30 days. Active subscriptions must be cancelled first — we\'ll walk you through it.',
  },
  {
    id: 'team-accounts',
    category: 'account',
    q: 'Do you support team accounts?',
    a: 'Yes. Enterprise plans include up to 10 team members with shared credit pools, role-based access, and a shared asset library. Contact sales for larger teams.',
  },
  {
    id: 'data-privacy',
    category: 'account',
    q: 'How is my data handled?',
    a: 'Your prompts and generations are private to your account. We never train models on your content. Uploaded files are deleted from our servers 30 days after generation unless you save them to your Library. See our Privacy Policy for full details.',
  },
];

/* Small inline icons */
function CategoryIcon({ type }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'sparkles')
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
        <path d="M12 3l1.9 5.7L20 10l-5.7 1.9L12 18l-1.9-5.7L4 10l5.7-1.9L12 3z" />
      </svg>
    );
  if (type === 'wand')
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
        <path d="M15 4V2M15 10V8M11 6H9M21 6h-2M17.5 8.5L19 7M17.5 3.5L19 5M4 20l9-9" />
      </svg>
    );
  if (type === 'card')
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openId, setOpenId] = useState(FAQS[0].id);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQS.filter((faq) => {
      const matchesCategory =
        activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch =
        !q ||
        faq.q.toLowerCase().includes(q) ||
        faq.a.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  // Group filtered results by category (for the "all" view)
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((faq) => {
      if (!map[faq.category]) map[faq.category] = [];
      map[faq.category].push(faq);
    });
    return map;
  }, [filtered]);

  const isFiltering = search.trim() !== '' || activeCategory !== 'all';

  return (
    <main id="top" className="page-scroll min-h-screen overflow-x-hidden bg-[#fdfbf7] text-[#1a1a1a]">
      {/* Ambient glows — same palette as Landing/Features */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-[var(--coral)] opacity-[0.06] blur-[130px]" />
        <div className="absolute top-[40%] right-[10%] h-[420px] w-[420px] rounded-full bg-[var(--violet)] opacity-[0.05] blur-[130px]" />
      </div>

      <Navbar />

      <section className="mx-auto max-w-3xl px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-[11.5px] font-medium text-[#4a4a4a] backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
            Support Center
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
            Questions,{' '}
            <span className="font-serif-human italic font-medium text-[var(--coral)]">
              answered.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#6b6b6b] sm:text-base">
            Everything you need to know about Alveoly Studios. Can't find what you're
            looking for? We're one message away.
          </p>
        </div>

        {/* Search */}
        <div className="relative mx-auto mb-6 max-w-xl">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-11 text-[14px] text-[#1a1a1a] placeholder-[#8a8a8a] shadow-sm outline-none transition focus:border-[var(--coral)]/40 focus:ring-4 focus:ring-[var(--coral)]/10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#8a8a8a] transition hover:bg-black/[0.04] hover:text-[#1a1a1a]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filter chips */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
              activeCategory === 'all'
                ? 'bg-[#1a1a1a] text-white'
                : 'border border-black/10 bg-white text-[#4a4a4a] hover:border-black/20 hover:text-[#1a1a1a]'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                activeCategory === cat.id
                  ? 'bg-[#1a1a1a] text-white'
                  : 'border border-black/10 bg-white text-[#4a4a4a] hover:border-black/20 hover:text-[#1a1a1a]'
              }`}
            >
              <CategoryIcon type={cat.icon} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white px-6 py-14 text-center">
            <p className="text-[15px] font-medium text-[#1a1a1a]">No matches found</p>
            <p className="mt-2 text-[13.5px] text-[#6b6b6b]">
              Try a different search or{' '}
              <button
                onClick={() => {
                  setSearch('');
                  setActiveCategory('all');
                }}
                className="font-semibold text-[var(--coral)] hover:underline"
              >
                clear filters
              </button>
              .
            </p>
          </div>
        ) : activeCategory === 'all' && !search ? (
          /* Grouped view — one section per category */
          <div className="space-y-10">
            {CATEGORIES.map((cat) => {
              const items = grouped[cat.id];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat.id} id={cat.id}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[var(--coral)]">
                      <CategoryIcon type={cat.icon} />
                    </span>
                    <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6b6b6b]">
                      {cat.label}
                    </h2>
                  </div>
                  <div className="divide-y divide-black/[0.07] overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
                    {items.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        faq={faq}
                        open={openId === faq.id}
                        onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Filtered flat view */
          <div className="divide-y divide-black/[0.07] overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            {filtered.map((faq) => (
              <AccordionItem
                key={faq.id}
                faq={faq}
                open={openId === faq.id}
                onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        )}

        {/* Still need help? */}
        <div className="mt-16 overflow-hidden rounded-[32px] border border-black/[0.07] bg-white px-6 py-10 text-center shadow-sm sm:px-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--coral)]/10 text-[var(--coral)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Still{' '}
            <span className="font-serif-human italic text-[var(--coral)]">
              curious?
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[#6b6b6b]">
            Can't find the answer you're looking for? Our team responds within
            one business day.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3 text-[13.5px] font-semibold text-white transition hover:bg-[#2b2b2b] hover:-translate-y-0.5"
            >
              Contact support <span>→</span>
            </Link>
            <a
              href="mailto:support@alveolystudios.com"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-[13.5px] font-medium text-[#1a1a1a] transition hover:border-black/20 hover:bg-black/[0.03]"
            >
              support@alveolystudios.com
            </a>
          </div>
        </div>

        {/* CTA strip */}
        <div className="mt-16 overflow-hidden rounded-[32px] bg-[#1a1a1a] px-6 py-14 text-center text-white sm:px-10">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ready to{' '}
            <span className="font-serif-human italic text-[var(--coral)]">
              try it?
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] text-white/60">
            Start free — no credit card required.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[13.5px] font-semibold text-black transition hover:bg-gray-100 hover:-translate-y-0.5"
          >
            Start Creating Free <span>→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ─────────────────────────────────────────────
   AccordionItem — animated open/close
   Uses max-height transition (works with dynamic content)
   ───────────────────────────────────────────── */
function AccordionItem({ faq, open, onToggle }) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-panel-${faq.id}`}
        className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-black/[0.02]"
      >
        <span className="text-[14.5px] font-medium text-[#1a1a1a] group-hover:text-black">
          {faq.q}
        </span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            open
              ? 'rotate-45 border-[var(--coral)]/30 bg-[var(--coral)]/10 text-[var(--coral)]'
              : 'border-black/10 bg-white text-[#8a8a8a] group-hover:border-black/20 group-hover:text-[#1a1a1a]'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div
        id={`faq-panel-${faq.id}`}
        role="region"
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-[13.5px] leading-6 text-[#6b6b6b]">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}