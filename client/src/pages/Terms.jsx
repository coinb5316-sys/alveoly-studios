import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Terms() {
  return (
    <main id="top" className="page-scroll min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)]">
      <Navbar />
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-20 sm:px-8">
        <h1 className="mb-2 text-3xl font-semibold">Terms of Service</h1>
        <p className="mb-8 text-xs text-[var(--text-tertiary)]">Last updated: October 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="mt-2 text-sm leading-6">By accessing or using Alveoly Studios, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Description of Service</h2>
            <p className="mt-2 text-sm leading-6">Alveoly Studios provides AI-powered image, video, and audio generation tools. We reserve the right to modify or discontinue any part of the service at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. User Accounts</h2>
            <p className="mt-2 text-sm leading-6">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Credits and Payments</h2>
            <p className="mt-2 text-sm leading-6">Credits are non-refundable and non-transferable. All payments are processed securely through Paystack. Prices are subject to change with notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Content Rights</h2>
            <p className="mt-2 text-sm leading-6">You retain ownership of the content you generate. On paid plans, you have full commercial rights to use the generated content for any purpose.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Prohibited Uses</h2>
            <p className="mt-2 text-sm leading-6">You may not use our services to generate illegal content, deepfakes without consent, or content that infringes on the rights of others.</p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}