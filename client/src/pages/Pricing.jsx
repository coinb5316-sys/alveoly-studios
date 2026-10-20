import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PLANS = [
  {
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    desc: 'For exploring your creativity',
    features: [
      '5 free credits on signup',
      'Access to all basic tools',
      'Standard generation speed',
      'Community support',
    ],
    cta: 'Get started free',
    ctaLink: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    priceMonthly: 19,
    priceYearly: 15,
    desc: 'For bringing more ideas to life',
    features: [
      '500 credits per month',
      'Priority generation queue',
      'Access to all premium tools',
      'Commercial usage rights',
      'Email support',
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/dashboard/billing',
    highlight: true,
  },
  {
    name: 'Enterprise',
    priceMonthly: 99,
    priceYearly: 79,
    desc: 'For teams and heavy usage',
    features: [
      '5000 credits per month',
      'Highest priority queue',
      'API access',
      'Custom branding',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    highlight: false,
  },
];

const TRUST = [
  { label: 'Cancel anytime', icon: 'shield' },
  { label: 'No hidden fees', icon: 'tag' },
  { label: 'Secure checkout', icon: 'lock' },
];

const FAQ = [
  {
    q: 'What are credits?',
    a: 'One credit = one generation. Image tools typically use 1 credit, video tools use 3–5 depending on length. Free accounts get 5 credits to start.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrade or downgrade anytime from your billing dashboard. Changes take effect at the start of your next cycle.',
  },
  {
    q: 'Do unused credits roll over?',
    a: 'Pro and Enterprise credits reset monthly. We recommend topping up with a credit pack if you have a big project coming.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'We offer a 7-day refund on first-time subscriptions, no questions asked. Contact support@alveolystudios.com.',
  },
];

/* Small inline icons — no dependency */
function TrustIcon({ type }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'shield')
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  if (type === 'tag')
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
        <path d="M20 12l-8 8-8-8 8-8h8v8z" />
        <circle cx="16" cy="8" r="1.2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function CheckIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'

  return (
    <main id="top" className="page-scroll min-h-screen overflow-x-hidden bg-[#fdfbf7] text-[#1a1a1a]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-[var(--coral)] opacity-[0.06] blur-[130px]" />
        <div className="absolute top-[45%] right-[10%] h-[420px] w-[420px] rounded-full bg-[var(--violet)] opacity-[0.05] blur-[130px]" />
      </div>

      <Navbar />

      <section className="mx-auto max-w-[1200px] px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-[11.5px] font-medium text-[#4a4a4a] backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
            Simple pricing, no surprises
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[60px] lg:leading-[1.05]">
            Pick the plan that{' '}
            <span className="font-serif-human italic font-medium text-[var(--coral)]">
              fits you.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[#6b6b6b] sm:text-base">
            Start free. Upgrade when you need more credits. Cancel anytime —
            no hidden fees, ever.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mb-10 flex items-center justify-center">
          <div className="inline-flex items-center rounded-full border border-black/10 bg-white p-1 shadow-sm">
            <button
              onClick={() => setBilling('monthly')}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                billing === 'monthly'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition ${
                billing === 'yearly'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  billing === 'yearly'
                    ? 'bg-[var(--coral)] text-white'
                    : 'bg-[var(--coral)]/10 text-[var(--coral)]'
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border bg-white p-8 transition ${
                  plan.highlight
                    ? 'border-[var(--coral)]/40 shadow-[0_10px_50px_-12px_rgba(255,107,107,0.35)] md:-translate-y-1'
                    : 'border-black/[0.07] shadow-sm hover:shadow-md'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--coral)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    Most Popular
                  </span>
                )}

                <h3 className="text-[15px] font-semibold tracking-tight">{plan.name}</h3>
                <p className="mt-1.5 text-[13px] text-[#6b6b6b]">{plan.desc}</p>

                <div className="mt-7 flex items-baseline gap-1">
                  <span className="text-[44px] font-semibold leading-none tracking-tight">
                    ${price}
                  </span>
                  {price !== 0 && (
                    <span className="ml-1 text-[13px] font-normal text-[#6b6b6b]">
                      /{billing === 'yearly' ? 'mo, billed yearly' : 'month'}
                    </span>
                  )}
                  {price === 0 && (
                    <span className="ml-1 text-[13px] font-normal text-[#6b6b6b]">forever</span>
                  )}
                </div>

                <ul className="mt-8 space-y-3.5 text-[13px] text-[#4a4a4a]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.highlight
                            ? 'bg-[var(--coral)]/10 text-[var(--coral)]'
                            : 'bg-black/[0.04] text-[#1a1a1a]'
                        }`}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaLink}
                  className={`mt-8 block rounded-xl py-3 text-center text-[13.5px] font-semibold transition ${
                    plan.highlight
                      ? 'bg-[#1a1a1a] text-white hover:bg-[#2b2b2b] hover:-translate-y-0.5'
                      : 'border border-black/10 bg-white text-[#1a1a1a] hover:border-black/20 hover:bg-black/[0.03]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12.5px] text-[#6b6b6b]">
          {TRUST.map(({ label, icon }) => (
            <div key={label} className="inline-flex items-center gap-2">
              <span className="text-[var(--coral)]">
                <TrustIcon type={icon} />
              </span>
              {label}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Questions,{' '}
              <span className="font-serif-human italic text-[var(--coral)]">answered.</span>
            </h2>
            <p className="mt-2 text-[14px] text-[#6b6b6b]">
              Everything you need to know before upgrading.
            </p>
          </div>

          <div className="mx-auto max-w-3xl divide-y divide-black/[0.07] rounded-2xl border border-black/[0.07] bg-white">
            {FAQ.map(({ q, a }, i) => (
              <details
                key={q}
                className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
                open={i === 0}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-[14.5px] font-medium text-[#1a1a1a]">
                  {q}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-[#8a8a8a] transition-transform group-open:rotate-45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="mt-3 text-[13.5px] leading-6 text-[#6b6b6b]">{a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 overflow-hidden rounded-[36px] bg-[#1a1a1a] px-6 py-16 text-center text-white sm:px-12">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Still deciding?{' '}
            <span className="font-serif-human italic text-[var(--coral)]">Try it free.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14.5px] text-white/60">
            No credit card required. 5 free credits on signup. Upgrade only when you love it.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-black transition hover:bg-gray-100 hover:-translate-y-0.5"
            >
              Start Creating Free <span>→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-[14px] font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}