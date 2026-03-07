import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useClinicStore } from '@/store/clinic-store';
import { ClinicSelector } from '@/components/clinic/ClinicSelector';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Stethoscope,
  LogOut,
  Database,
  UserCog,
  BarChart2,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const clinicId = useClinicStore((s) => s.clinicId);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Visits', href: '/visits', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: DollarSign },
    { name: 'Procedures', href: '/procedures', icon: Stethoscope },
    { name: 'Staff', href: '/staff', icon: UserCog },
    { name: 'Reports', href: '/reports', icon: BarChart2 },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Stethoscope className="size-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">PMS</span>
              </Link>

              {clinicId && (
                <nav className="hidden md:flex items-center gap-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="size-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link
                to="/backups"
                className={`p-2 rounded-lg transition-colors ${
                  isActive('/backups')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="System Backups"
              >
                <Database className="size-6" />
              </Link>
              <ClinicSelector />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-gray-700 hover:text-gray-900"
              >
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
