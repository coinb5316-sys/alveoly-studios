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
    strokeWidth="2"
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

const GradientText = ({ children }) => (
  <span className="bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#818cf8] bg-clip-text text-transparent">
    {children}
  </span>
);

/* ─────────────────────────────────────────────
   Section renderer
   ───────────────────────────────────────────── */
function PolicySection({ id, number, title, icon, accent, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ color: accent, backgroundColor: `${accent}1f` }}
        >
          <Icon path={icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-white">
            <span className="mr-2 font-mono text-[11px] text-white/30">
              {String(number).padStart(2, '0')}
            </span>
            {title}
          </h2>
          <div className="mt-2 space-y-3 text-[13px] leading-7 text-white/55">{children}</div>
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
      className="page-scroll min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)]"
    >
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pt-32 pb-12 sm:px-8">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/12 via-sky-500/8 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-200">
            <Icon path={ICONS.shield} className="h-3 w-3" />
            Your privacy matters
          </span>

          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Privacy <GradientText>Policy</GradientText>
          </h1>

          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-white/55">
            Plain-English summary of what we collect, why we collect it, and the
            control you have over your data. No legalese, no surprises.
          </p>

          <div className="mt-4 flex items-center gap-3 text-[11px] text-white/35">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Last updated: October 2026
            </span>
            <span className="h-3 w-px bg-white/10" />
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
              <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-white/35">
                On this page
              </p>
              <ul className="space-y-1">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-white/45 transition hover:bg-white/[0.03] hover:text-white/80"
                    >
                      <span className="font-mono text-[10px] text-white/25 group-hover:text-violet-300">
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
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6 sm:p-8">
              <div className="space-y-8">
                <PolicySection
                  id="collect"
                  number={1}
                  title="Information we collect"
                  icon={ICONS.eye}
                  accent="#a78bfa"
                >
                  <p>
                    We collect the minimum we need to run the studio well: your{' '}
                    <span className="font-medium text-white/80">email address</span>, an{' '}
                    <span className="font-medium text-white/80">encrypted password</span>{' '}
                    (never stored in plain text), and lightweight usage data such as which
                    tools you use and when. That’s it.
                  </p>
                  <p>
                    We do <span className="font-medium text-white/80">not</span> sell,
                    rent, or trade your personal information with anyone — ever.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="use"
                  number={2}
                  title="How we use your information"
                  icon={ICONS.users}
                  accent="#34d399"
                >
                  <p>Your information helps us:</p>
                  <ul className="ml-1 space-y-1.5">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                      Authenticate you securely and keep your account safe.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                      Process payments through Paystack and issue credits correctly.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                      Improve the product based on what actually helps creators.
                    </li>
                  </ul>
                  <p>
                    We only send transactional emails (receipts, security notices,
                    account updates) — never marketing spam.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="security"
                  number={3}
                  title="Data security"
                  icon={ICONS.lock}
                  accent="#38bdf8"
                >
                  <p>
                    We use industry-standard encryption in transit and at rest, plus
                    hardened infrastructure and least-privilege access controls. Your
                    password is hashed with bcrypt and never leaves our servers.
                  </p>
                  <p className="text-white/40">
                    No method of transmission over the internet is 100% secure — but we
                    treat your data the way we’d want ours treated.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="third-party"
                  number={4}
                  title="Third-party services"
                  icon={ICONS.server}
                  accent="#fbbf24"
                >
                  <p>We work with a small, trusted set of partners:</p>
                  <ul className="ml-1 space-y-1.5">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                      <span>
                        <span className="font-medium text-white/80">Magic Hour</span> — powers
                        image, video & audio generation.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                      <span>
                        <span className="font-medium text-white/80">Cloudinary</span> — stores
                        your generated assets.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                      <span>
                        <span className="font-medium text-white/80">Paystack</span> — handles
                        payments securely.
                      </span>
                    </li>
                  </ul>
                  <p className="text-white/40">
                    Each has its own privacy policy and independent security posture.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="rights"
                  number={5}
                  title="Your rights"
                  icon={ICONS.shield}
                  accent="#fb7185"
                >
                  <p>You can, at any time:</p>
                  <ul className="ml-1 space-y-1.5">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                      Request a copy of the personal data we hold about you.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                      Ask us to correct anything that’s inaccurate.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                      Delete your account and associated data.
                    </li>
                  </ul>
                  <p>
                    Just email us — we respond within 30 days, usually much faster.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="contact"
                  number={6}
                  title="Contact us"
                  icon={ICONS.mail}
                  accent="#818cf8"
                >
                  <p>
                    Questions about your data? Reach out anytime at{' '}
                    <a
                      href="mailto:privacy@alveoly.studio"
                      className="font-medium text-violet-300 underline-offset-2 hover:underline"
                    >
                      privacy@alveoly.studio
                    </a>
                    . We read every message.
                  </p>
                </PolicySection>
              </div>
            </div>

            {/* Related */}
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[12.5px] font-medium text-white">Also worth a read</p>
                <p className="text-[11.5px] text-white/45">
                  Our Terms explain the rules of using the studio.
                </p>
              </div>
              <Link
                to="/terms"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11.5px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
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