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
    strokeWidth="1.8"
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
            The ground rules
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[58px] lg:leading-[1.05]">
            Terms of{' '}
            <span className="font-serif-human italic font-medium text-[var(--coral)]">
              Service.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[#6b6b6b] sm:text-base">
            What you can expect from us, and what we ask of you in return. Written
            to be read — not skimmed.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3 text-[12px] text-[#8a8a8a]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Last updated: October 2026
            </span>
            <span className="h-3 w-px bg-black/10" />
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
                  id="acceptance"
                  number={1}
                  title="Acceptance of terms"
                  icon={ICONS.shield}
                  accent="#6b5b95"
                >
                  <p>
                    By accessing or using Alveoly Studios, you agree to be bound by
                    these Terms of Service. If you don’t agree, please don’t use the
                    platform — no hard feelings.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="service"
                  number={2}
                  title="Description of service"
                  icon={ICONS.sparkles}
                  accent="#ff6b6b"
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

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="accounts"
                  number={3}
                  title="User accounts"
                  icon={ICONS.user}
                  accent="#2a9d8f"
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
                      className="font-medium text-[var(--coral)] underline-offset-2 hover:underline"
                    >
                      support@alveoly.studio
                    </a>
                    .
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="payments"
                  number={4}
                  title="Credits & payments"
                  icon={ICONS.creditCard}
                  accent="#e07a5f"
                >
                  <p>
                    Credits are the currency of the studio. They’re{' '}
                    <span className="font-medium text-[#1a1a1a]">non-refundable</span> and{' '}
                    <span className="font-medium text-[#1a1a1a]">non-transferable</span>{' '}
                    once purchased.
                  </p>
                  <p>
                    All payments are processed securely through Paystack. Prices may
                    change — when they do, we’ll give existing subscribers at least 14
                    days’ notice before the change applies to them.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="content"
                  number={5}
                  title="Content rights"
                  icon={ICONS.copyright}
                  accent="#d96a4a"
                >
                  <p>
                    You <span className="font-medium text-[#1a1a1a]">own</span> everything
                    you generate with Alveoly Studios.
                  </p>
                  <p>
                    On paid plans, you have full commercial rights to use your generated
                    content for any lawful purpose — ads, films, products, anything.
                    Free-plan content is licensed for personal, non-commercial use.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="prohibited"
                  number={6}
                  title="Prohibited uses"
                  icon={ICONS.alert}
                  accent="#d93636"
                >
                  <p>You may not use Alveoly Studios to generate or distribute:</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#d93636]" />
                      Illegal content of any kind.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#d93636]" />
                      Deepfakes or likenesses of real people without their consent.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#d93636]" />
                      Content that infringes someone else’s copyright or trademarks.
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#d93636]" />
                      Harassment, hate speech, or content that harms minors.
                    </li>
                  </ul>
                  <p className="text-[#8a8a8a]">
                    Accounts that violate these rules may be suspended without refund.
                  </p>
                </PolicySection>

                <div className="h-px bg-black/[0.06]" />

                <PolicySection
                  id="contact"
                  number={7}
                  title="Contact us"
                  icon={ICONS.mail}
                  accent="#6b5b95"
                >
                  <p>
                    Questions about these terms? Email{' '}
                    <a
                      href="mailto:legal@alveoly.studio"
                      className="font-medium text-[var(--coral)] underline-offset-2 hover:underline"
                    >
                      legal@alveoly.studio
                    </a>{' '}
                    and we’ll get back to you.
                  </p>
                </PolicySection>
              </div>
            </div>

            {/* Related */}
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <div>
                <p className="text-[13px] font-medium text-[#1a1a1a]">Also worth a read</p>
                <p className="text-[12px] text-[#6b6b6b]">
                  How we handle your data, in plain English.
                </p>
              </div>
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium text-[#1a1a1a] transition hover:border-black/20 hover:bg-black/[0.03]"
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