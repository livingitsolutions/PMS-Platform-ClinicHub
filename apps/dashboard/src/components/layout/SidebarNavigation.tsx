import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, DollarSign, Stethoscope, UserCog, UserRound, ChartBar as BarChart2, Settings, Bell, Database, CalendarClock } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { usePermissions } from '@/hooks/usePermissions';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerOnly?: boolean;
  requiresPermission?: 'canManageStaff' | 'canManageSettings';
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Visits', href: '/visits', icon: FileText },
  { name: 'Providers', href: '/providers', icon: UserRound },
  { name: 'Provider Schedule', href: '/providers/schedule', icon: CalendarClock },
  { name: 'Procedures', href: '/procedures', icon: Stethoscope },
  { name: 'Invoices', href: '/invoices', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Reminders', href: '/reminders', icon: Bell },
  { name: 'Staff', href: '/staff', icon: UserCog, requiresPermission: 'canManageStaff' },
  { name: 'Settings', href: '/settings', icon: Settings, requiresPermission: 'canManageSettings' },
  { name: 'Backups', href: '/backups', icon: Database, ownerOnly: true },
];

export function SidebarNavigation() {
  const location = useLocation();
  const clinicId = useClinicStore((s) => s.clinicId);
  const permissions = usePermissions();

  if (!clinicId) return null;

  const isActive = (href: string) => {
    if (href === '/providers') return location.pathname === '/providers';
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const visibleItems = navItems.filter((item) => {
    if (item.ownerOnly && permissions.role !== 'owner') return false;
    if (item.requiresPermission === 'canManageStaff' && !permissions.canManageStaff) return false;
    if (item.requiresPermission === 'canManageSettings' && !permissions.canManageSettings) return false;
    return true;
  });

  return (
    <aside className="w-[260px] shrink-0 flex flex-col bg-white border-r border-gray-100 min-h-screen">
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`size-4 shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`}
              />
              <span>{item.name}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
