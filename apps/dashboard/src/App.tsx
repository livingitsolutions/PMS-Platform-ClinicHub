import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { CreateClinicPage } from '@/features/onboarding/pages/CreateClinicPage';
import { SelectPlanPage } from '@/features/billing/pages/SelectPlanPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { useUserClinics } from '@/hooks/useUserClinics';
import { VisitPage } from '@/features/visits/pages/VisitPage';
import { VisitsListPage } from '@/features/visits/pages/VisitsListPage';
import { PatientsPage } from '@/features/patients/pages/PatientsPage';
import { AppointmentsPage } from '@/features/appointments/pages/AppointmentsPage';
import { ProviderSchedulePage } from '@/features/providers/pages/ProviderSchedulePage';
import { ProceduresPage } from '@/features/procedures/pages/ProceduresPage';
import { GlobalSearchDialog } from '@/features/search/components/GlobalSearchDialog';
import { SystemBackupsPage } from '@/features/backups/pages/SystemBackupsPage';
import { InvoicesPage } from '@/features/invoices/pages/InvoicesPage';
import { ProvidersPage } from '@/features/providers/pages/ProvidersPage';
import { PatientProfilePage } from '@/features/patients/pages/PatientProfilePage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { RemindersPage } from '@/features/reminders/pages/RemindersPage';
import { LandingPage } from '@/features/marketing/pages/LandingPage';
import { PricingPage } from '@/features/marketing/pages/PricingPage';
import { SignupPage } from '@/features/marketing/pages/SignupPage';
import { useAuthStore } from '@/store/auth-store';

function App() {
  useAuthBootstrap();
  useUserClinics();
  const { user } = useAuthStore();

  return (
    <>
      <GlobalSearchDialog />
      <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/onboarding"
        element={
          <AuthGuard requireClinic={false} requireSubscription={false}>
            <CreateClinicPage />
          </AuthGuard>
        }
      />

      <Route
        path="/select-plan"
        element={
          <AuthGuard requireSubscription={false}>
            <SelectPlanPage />
          </AuthGuard>
        }
      />

      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        }
      />

      <Route
        path="/visits"
        element={
          <AuthGuard>
            <VisitsListPage />
          </AuthGuard>
        }
      />

      <Route
        path="/visits/:visitId"
        element={
          <AuthGuard>
            <VisitPage />
          </AuthGuard>
        }
      />

      <Route
        path="/patients"
        element={
          <AuthGuard>
            <PatientsPage />
          </AuthGuard>
        }
      />

      <Route
        path="/procedures"
        element={
          <AuthGuard>
            <ProceduresPage />
          </AuthGuard>
        }
      />

      <Route
        path="/appointments"
        element={
          <AuthGuard>
            <AppointmentsPage />
          </AuthGuard>
        }
      />

      <Route
        path="/providers/schedule"
        element={
          <AuthGuard>
            <ProviderSchedulePage />
          </AuthGuard>
        }
      />

      <Route
        path="/providers"
        element={
          <AuthGuard>
            <ProvidersPage />
          </AuthGuard>
        }
      />

      <Route
        path="/invoices"
        element={
          <AuthGuard>
            <InvoicesPage />
          </AuthGuard>
        }
      />

      <Route
        path="/backups"
        element={
          <AuthGuard>
            <SystemBackupsPage />
          </AuthGuard>
        }
      />

      <Route
        path="/patients/:patientId"
        element={
          <AuthGuard>
            <PatientProfilePage />
          </AuthGuard>
        }
      />

      <Route
        path="/settings"
        element={
          <AuthGuard>
            <SettingsPage />
          </AuthGuard>
        }
      />

      <Route
        path="/reminders"
        element={
          <AuthGuard>
            <RemindersPage />
          </AuthGuard>
        }
      />
      </Routes>
    </>
  );
}

export default App;
