import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function About() {
  return (
    <main id="top" className="page-scroll min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)]">
      <Navbar />
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-20 sm:px-8">
        <h1 className="mb-6 text-4xl font-semibold">About Alveoly Studios</h1>
        <div className="space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
          <p>Alveoly Studios is a creative studio built in Ghana 🇬🇭 with a simple mission: to make professional AI tools accessible to everyone.</p>
          <p>We believe that the future of creativity is AI-assisted. Our platform brings together the world's best generative models into one seamless studio, so you can focus on creating rather than managing tools.</p>
          <p>Whether you're a content creator, marketer, or just exploring AI for the first time, Alveoly Studios gives you the power to bring your ideas to life.</p>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white">Our Tech Stack</h2>
          <ul className="mt-4 grid gap-2 text-xs text-[var(--text-tertiary)] sm:grid-cols-2">
            <li>• Magic Hour AI (Video/Image/Audio)</li>
            <li>• Cloudinary (Storage)</li>
            <li>• Paystack (Payments)</li>
            <li>• React + Vite (Frontend)</li>
            <li>• Node.js + Express (Backend)</li>
            <li>• MongoDB (Database)</li>
          </ul>
        </div>
      </section>
      <Footer />
    </main>
  );
}