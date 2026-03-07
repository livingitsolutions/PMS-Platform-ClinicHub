import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useClinicStore } from '@/store/clinic-store';
import { ClinicSelector } from '@/components/clinic/ClinicSelector';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { Button } from '@/components/ui/button';

export function TopNavbar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clinicId = useClinicStore((s) => s.clinicId);
  const { clinics } = useClinicStore();
  const currentClinic = clinics.find((c) => c.id === clinicId);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  const openSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    );
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 sticky top-0 z-40 flex items-center px-4 gap-4 shadow-sm">
      <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
          <Stethoscope className="size-4" />
        </div>
        <span className="text-base font-bold text-gray-900 tracking-tight">
          {currentClinic?.name || 'PMS'}
        </span>
      </Link>

      <div className="flex-1" />

      {clinicId && (
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-colors"
        >
          <Search className="size-3.5" />
          <span>Search</span>
          <kbd className="ml-1 text-[10px] font-mono bg-white border border-gray-200 px-1 rounded">
            ⌘K
          </kbd>
        </button>
      )}

      <div className="flex items-center gap-2">
        {clinicId && <NotificationBell />}
        <ClinicSelector />
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
            {initials}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => { await logout(); navigate('/login'); }}
            className="text-gray-500 hover:text-gray-900 px-2"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
