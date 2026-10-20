import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UpgradeBanner() {
  const { user } = useAuth();
  // Hide banner for admins and paid users
  if (user?.plan !== 'free' || user?.role === 'admin') return null;

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/10 to-transparent p-5 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-[15px] font-semibold text-white">Upgrade to Pro</h3>
        <p className="text-[12px] text-white/60">Unlock 500 credits and faster generations.</p>
      </div>
      <Link
        to="/dashboard/billing"
        className="rounded-xl bg-white px-5 py-2.5 text-[12px] font-semibold text-black transition hover:bg-white/90"
      >
        View Plans
      </Link>
    </div>
  );
}