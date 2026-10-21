// pages/Privacy.jsx
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/* ─────────────────────────────────────────────
   Inline icons
   ───────────────────────────────────────────── */
const Icon = ({ path, className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  lock: 'M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2zM7 11V7a5 5 0 0110 0v4',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z',
  server: 'M20 9H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 3h16a2 2 0 012 2v2H2V5a2 2 0 012-2zM6 15h.01M6 19h.01',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  mail: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6',
  arrow: 'M5 12h14M12 5l7 7-7 7',
};

/* ─────────────────────────────────────────────
   Policy section — cream theme
   ───────────────────────────────────────────── */
function PolicySection({ id, number, title, icon, accent, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-start gap-4">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ color: accent, backgroundColor: `${accent}14` }}
        >
          <Icon path={icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15.5px] font-semibold text-[#1a1a1a]">
            <span className="mr-2 font-mono text-[11px] font-medium text-[#b8b0a3]">
              {String(number).padStart(2, '0')}
            </span>
            {title}
          </h2>
          <div className="mt-2.5 space-y-3 text-[13.5px] leading-7 text-[#4a4a4a]">{children}</div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main
   ───────────────────────────────────────────── */
export default function Privacy() {
  const sections = [
    { id: 'collect', label: 'Information we collect' },
    { id: 'use', label: 'How we use it' },
    { id: 'security', label: 'Data security' },
    { id: 'third-party', label: 'Third-party services' },
    { id: 'rights', label: 'Your rights' },
    { id: 'contact', label: 'Contact us' },
  ];

  return (
    <main
      id="top"
      className="page-scroll min-h-screen overflow-x-hidden bg-[#fdfbf7] text-[#1a1a1a]"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-[var(--coral)] opacity-[0.06] blur-[130px]" />
        <div className="absolute top-[45%] right-[10%] h-[420px] w-[420px] rounded-full bg-[var(--violet)] opacity-[0.05] blur-[130px]" />
      </div>

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative px-5 pt-28 pb-12 sm:px-8 sm:pt-32">
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-[11.5px] font-medium text-[#4a4a4a] backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
            Your privacy matters
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[58px] lg:leading-[1.05]">
            Privacy{' '}
            <span className="font-serif-human italic font-medium text-[var(--coral)]">
              Policy.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[#6b6b6b] sm:text-base">
            Plain-English summary of what we collect, why we collect it, and the
            control you have over your data. No legalese, no surprises.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3 text-[12px] text-[#8a8a8a]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Last updated: October 2026
            </span>
            <span className="h-3 w-px bg-black/10" />
            <span>~4 min read</span>
          </div>
        </div>
      </section>

      {/* ── Body: TOC + content ── */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sticky TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#b8b0a3]">
                On this page
              </p>
              <ul className="space-y-0.5">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] text-[#6b6b6b] transition hover:bg-black/[0.03] hover:text-[#1a1a1a]"
                    >
                      <span className="font-mono text-[10px] font-medium text-[#c8c0b3] group-hover:text-[var(--coral)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/[0.07] bg-white p-7 shadow-sm sm:p-10">
              <div className="space-y-8">
                <PolicySection
                  id="collect"
                  number={1}
                  title="Information we collect"
                  icon={ICONS.eye}
                  accent="#ff6b6b"
                >
                  <p>
                    We collect the minimum we need to run the studio well: your{' '}
                    <span className="font-medium text-[#1a1a1a]">email address</span>, an{' '}
                    <span className="font-medium text-[#1a1a1a]">encrypted password</span>{' '}
                    (never stored in plain text), and lightweight usage data such as which
                    tools you use and when. That’s it.
                  </p>
                  <p>
                    We do <span className="font-medium text-[#1a1a1a]">not</span> sell,
                    rent, or trade your personal information with anyone — ever.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="use"
                  number={2}
                  title="How we use your information"
                  icon={ICONS.users}
                  accent="#2a9d8f"
                >
                  <p>Your information helps us:</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#2a9d8f]" />
                      Authenticate you securely and keep your account safe.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#2a9d8f]" />
                      Process payments through Paystack and issue credits correctly.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#2a9d8f]" />
                      Improve the product based on what actually helps creators.
                    </li>
                  </ul>
                  <p>
                    We only send transactional emails (receipts, security notices,
                    account updates) — never marketing spam.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="security"
                  number={3}
                  title="Data security"
                  icon={ICONS.lock}
                  accent="#6b5b95"
                >
                  <p>
                    We use industry-standard encryption in transit and at rest, plus
                    hardened infrastructure and least-privilege access controls. Your
                    password is hashed with bcrypt and never leaves our servers.
                  </p>
                  <p className="text-[#8a8a8a]">
                    No method of transmission over the internet is 100% secure — but we
                    treat your data the way we’d want ours treated.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="third-party"
                  number={4}
                  title="Third-party services"
                  icon={ICONS.server}
                  accent="#e07a5f"
                >
                  <p>We work with a small, trusted set of partners:</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#e07a5f]" />
                      <span>
                        <span className="font-medium text-[#1a1a1a]">Magic Hour</span> — powers
                        image, video & audio generation.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#e07a5f]" />
                      <span>
                        <span className="font-medium text-[#1a1a1a]">Cloudinary</span> — stores
                        your generated assets.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#e07a5f]" />
                      <span>
                        <span className="font-medium text-[#1a1a1a]">Paystack</span> — handles
                        payments securely.
                      </span>
                    </li>
                  </ul>
                  <p className="text-[#8a8a8a]">
                    Each has its own privacy policy and independent security posture.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="rights"
                  number={5}
                  title="Your rights"
                  icon={ICONS.shield}
                  accent="#d96a4a"
                >
                  <p>You can, at any time:</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#d96a4a]" />
                      Request a copy of the personal data we hold about you.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#d96a4a]" />
                      Ask us to correct anything that’s inaccurate.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#d96a4a]" />
                      Delete your account and associated data.
                    </li>
                  </ul>
                  <p>
                    Just email us — we respond within 30 days, usually much faster.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="contact"
                  number={6}
                  title="Contact us"
                  icon={ICONS.mail}
                  accent="#6b5b95"
                >
                  <p>
                    Questions about your data? Reach out anytime at{' '}
                    <a
                      href="mailto:privacy@alveoly.studio"
                      className="font-medium text-[var(--coral)] underline-offset-2 hover:underline"
                    >
                      privacy@alveoly.studio
                    </a>
                    . We read every message.
                  </p>
                </PolicySection>
              </div>
            </div>

            {/* Related */}
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <div>
                <p className="text-[13px] font-medium text-[#1a1a1a]">Also worth a read</p>
                <p className="text-[12px] text-[#6b6b6b]">
                  Our Terms explain the rules of using the studio.
                </p>
              </div>
              <Link
                to="/terms"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium text-[#1a1a1a] transition hover:border-black/20 hover:bg-black/[0.03]"
              >
                Terms of Service
                <Icon path={ICONS.arrow} className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}