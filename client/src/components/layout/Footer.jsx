import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/showcase', label: 'Showcase' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-[#fdfbf7] px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand block */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-[#1a1a1a] hover:opacity-80"
              aria-label="Alveoly Studios home"
            >
              <img
                src={logo}
                alt=""
                className="h-7 w-7 rounded-lg object-contain"
              />
              <span className="text-[15.5px]">Alveoly Studios</span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-6 text-[#6b6b6b]">
              A creative studio for turning imagination into images, videos, and visual stories.
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-[#8a8a8a]">
              Built with creativity in Ghana
              <span aria-hidden="true">🇬🇭</span>
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a8a]">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-[13px] text-[#4a4a4a] transition hover:text-[var(--coral)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-black/[0.06] pt-6 text-[11.5px] text-[#8a8a8a] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Alveoly Studios. All rights reserved.</span>
          <div className="flex gap-5">
            <a
              href="mailto:hello@alveolystudios.com"
              className="transition hover:text-[var(--coral)]"
            >
              Contact
            </a>
            <a href="#top" className="transition hover:text-[var(--coral)]">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}