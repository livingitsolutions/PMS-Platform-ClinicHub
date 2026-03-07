import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Hop as Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Crumb {
  label: string;
  href?: string;
}

function useBreadcrumbs(): Crumb[] | null {
  const location = useLocation();
  const params = useParams();
  const pathname = location.pathname;

  const patientId = params.patientId as string | undefined;
  const visitId = params.visitId as string | undefined;

  const { data: patientName } = useQuery({
    queryKey: ['breadcrumb-patient', patientId],
    queryFn: async () => {
      const { data } = await supabase
        .from('patients')
        .select('first_name, last_name')
        .eq('id', patientId!)
        .maybeSingle();
      return data ? `${data.first_name} ${data.last_name}` : 'Patient';
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: visitLabel } = useQuery({
    queryKey: ['breadcrumb-visit', visitId],
    queryFn: async () => {
      const { data } = await supabase
        .from('visits')
        .select('visit_date, patients(first_name, last_name)')
        .eq('id', visitId!)
        .maybeSingle();
      if (!data) return 'Visit';
      const date = new Date(data.visit_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const patient = data.patients as unknown as { first_name: string; last_name: string } | null;
      return patient ? `${patient.first_name} ${patient.last_name} — ${date}` : date;
    },
    enabled: !!visitId,
    staleTime: 1000 * 60 * 5,
  });

  if (patientId && pathname.startsWith('/patients/')) {
    return [
      { label: 'Patients', href: '/patients' },
      { label: patientName || '...' },
    ];
  }

  if (visitId && pathname.startsWith('/visits/')) {
    return [
      { label: 'Visits', href: '/visits' },
      { label: visitLabel || '...' },
    ];
  }

  return null;
}

export function Breadcrumbs() {
  const crumbs = useBreadcrumbs();

  if (!crumbs) return null;

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-2">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          >
            <Home className="size-3.5" />
            <span>Home</span>
          </Link>

          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="size-3.5 text-gray-400" />
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
