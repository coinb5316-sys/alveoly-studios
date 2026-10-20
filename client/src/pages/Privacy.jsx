import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Privacy() {
  return (
    <main id="top" className="page-scroll min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)]">
      <Navbar />
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-20 sm:px-8">
        <h1 className="mb-2 text-3xl font-semibold">Privacy Policy</h1>
        <p className="mb-8 text-xs text-[var(--text-tertiary)]">Last updated: October 2026</p>

        <div className="space-y-6 text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
            <p className="mt-2 text-sm leading-6">We collect your email address, encrypted password, and usage data to provide our services. We do not sell your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
            <p className="mt-2 text-sm leading-6">Your information is used to authenticate you, process payments, and improve our services. We may send you transactional emails related to your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Data Security</h2>
            <p className="mt-2 text-sm leading-6">We use industry-standard encryption and security practices to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Third-Party Services</h2>
            <p className="mt-2 text-sm leading-6">We use Magic Hour and Cloudinary for generation and storage, and Paystack for payments. These services have their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Your Rights</h2>
            <p className="mt-2 text-sm leading-6">You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}