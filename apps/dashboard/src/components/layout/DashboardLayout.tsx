import type { ReactNode } from 'react';
import { TopNavbar } from './TopNavbar';
import { SidebarNavigation } from './SidebarNavigation';
import { GlobalSearchDialog } from '@/features/search/components/GlobalSearchDialog';
import { useClinicStore } from '@/store/clinic-store';

interface DashboardLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function DashboardLayout({ children, rightPanel }: DashboardLayoutProps) {
  const clinicId = useClinicStore((s) => s.clinicId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar />
      <GlobalSearchDialog />

      <div className="flex flex-1 overflow-hidden">
        {clinicId && <SidebarNavigation />}

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className={`flex ${rightPanel ? 'gap-0' : ''} min-h-full`}>
            <div className="flex-1 min-w-0 p-6">
              {children}
            </div>
            {rightPanel && (
              <aside className="w-[320px] shrink-0 border-l border-gray-100 bg-white p-6 overflow-y-auto">
                {rightPanel}
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 ml-4">{actions}</div>
      )}
    </div>
  );
}
