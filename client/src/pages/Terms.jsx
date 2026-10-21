// pages/Terms.jsx
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
  scroll: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  sparkles: 'M12 3l1.9 5.7L20 10l-5.7 1.9L12 18l-1.9-5.7L4 10l5.7-1.9L12 3z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  creditCard: 'M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22',
  copyright: 'M12 22a10 10 0 100-20 10 10 0 000 20zM15 9.5A3.5 3.5 0 1015 14.5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
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
export default function Terms() {
  const sections = [
    { id: 'acceptance', label: 'Acceptance of terms' },
    { id: 'service', label: 'Description of service' },
    { id: 'accounts', label: 'User accounts' },
    { id: 'payments', label: 'Credits & payments' },
    { id: 'content', label: 'Content rights' },
    { id: 'prohibited', label: 'Prohibited uses' },
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
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-500/12 via-violet-500/10 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-medium text-fuchsia-200">
            <Icon path={ICONS.scroll} className="h-3 w-3" />
            The ground rules
          </span>

          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Terms of <GradientText>Service</GradientText>
          </h1>

          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-white/55">
            What you can expect from us, and what we ask of you in return. Written
            to be read — not skimmed.
          </p>

          <div className="mt-4 flex items-center gap-3 text-[11px] text-white/35">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Last updated: October 2026
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span>~5 min read</span>
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
                      <span className="font-mono text-[10px] text-white/25 group-hover:text-fuchsia-300">
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
                  id="acceptance"
                  number={1}
                  title="Acceptance of terms"
                  icon={ICONS.shield}
                  accent="#a78bfa"
                >
                  <p>
                    By accessing or using Alveoly Studios, you agree to be bound by
                    these Terms of Service. If you don’t agree, please don’t use the
                    platform — no hard feelings.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="service"
                  number={2}
                  title="Description of service"
                  icon={ICONS.sparkles}
                  accent="#34d399"
                >
                  <p>
                    Alveoly Studios provides AI-powered image, video, and audio
                    generation tools through a single, unified studio.
                  </p>
                  <p>
                    We may update, improve, or occasionally retire parts of the service
                    as the underlying models evolve. When something meaningful changes,
                    we’ll tell you in advance.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="accounts"
                  number={3}
                  title="User accounts"
                  icon={ICONS.user}
                  accent="#38bdf8"
                >
                  <p>
                    You’re responsible for keeping your login credentials confidential
                    and for any activity that happens under your account.
                  </p>
                  <p>
                    If you notice anything suspicious — an unexpected login, a charge you
                    don’t recognize — tell us immediately at{' '}
                    <a
                      href="mailto:support@alveoly.studio"
                      className="font-medium text-violet-300 underline-offset-2 hover:underline"
                    >
                      support@alveoly.studio
                    </a>
                    .
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="payments"
                  number={4}
                  title="Credits & payments"
                  icon={ICONS.creditCard}
                  accent="#fbbf24"
                >
                  <p>
                    Credits are the currency of the studio. They’re{' '}
                    <span className="font-medium text-white/80">non-refundable</span> and{' '}
                    <span className="font-medium text-white/80">non-transferable</span>{' '}
                    once purchased.
                  </p>
                  <p>
                    All payments are processed securely through Paystack. Prices may
                    change — when they do, we’ll give existing subscribers at least 14
                    days’ notice before the change applies to them.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="content"
                  number={5}
                  title="Content rights"
                  icon={ICONS.copyright}
                  accent="#fb7185"
                >
                  <p>
                    You <span className="font-medium text-white/80">own</span> everything
                    you generate with Alveoly Studios.
                  </p>
                  <p>
                    On paid plans, you have full commercial rights to use your generated
                    content for any lawful purpose — ads, films, products, anything.
                    Free-plan content is licensed for personal, non-commercial use.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="prohibited"
                  number={6}
                  title="Prohibited uses"
                  icon={ICONS.alert}
                  accent="#f43f5e"
                >
                  <p>You may not use Alveoly Studios to generate or distribute:</p>
                  <ul className="ml-1 space-y-1.5">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                      Illegal content of any kind.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                      Deepfakes or likenesses of real people without their consent.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                      Content that infringes someone else’s copyright or trademarks.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                      Harassment, hate speech, or content that harms minors.
                    </li>
                  </ul>
                  <p className="text-white/40">
                    Accounts that violate these rules may be suspended without refund.
                  </p>
                </PolicySection>

                <div className="h-px bg-white/[0.05]" />

                <PolicySection
                  id="contact"
                  number={7}
                  title="Contact us"
                  icon={ICONS.mail}
                  accent="#818cf8"
                >
                  <p>
                    Questions about these terms? Email{' '}
                    <a
                      href="mailto:legal@alveoly.studio"
                      className="font-medium text-violet-300 underline-offset-2 hover:underline"
                    >
                      legal@alveoly.studio
                    </a>{' '}
                    and we’ll get back to you.
                  </p>
                </PolicySection>
              </div>
            </div>

            {/* Related */}
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[12.5px] font-medium text-white">Also worth a read</p>
                <p className="text-[11.5px] text-white/45">
                  How we handle your data, in plain English.
                </p>
              </div>
              <Link
                to="/privacy"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11.5px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Privacy Policy
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