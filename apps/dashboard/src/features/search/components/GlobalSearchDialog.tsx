import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGlobalSearch } from '@/features/search/hooks/useGlobalSearch';

export function GlobalSearchDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { results, isLoading } = useGlobalSearch(searchQuery);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleResultClick = (type: string, id: string) => {
    setOpen(false);
    setSearchQuery('');

    switch (type) {
      case 'patient':
        navigate(`/patients/${id}`);
        break;
      case 'visit':
        navigate(`/visits/${id}`);
        break;
      case 'appointment':
        navigate('/appointments');
        break;
      case 'provider':
        navigate('/providers');
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    }

    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const hasResults =
    results.patients.length > 0 ||
    results.visits.length > 0 ||
    results.appointments.length > 0 ||
    results.providers.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search for patients, visits, appointments, and providers
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b">
          <Input
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto max-h-[400px] px-6 py-4">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Searching...
            </div>
          )}

          {!isLoading && searchQuery.trim().length < 2 && (
            <div className="text-center py-8 text-muted-foreground">
              Type at least 2 characters to search
            </div>
          )}

          {!isLoading && searchQuery.trim().length >= 2 && !hasResults && (
            <div className="text-center py-8 text-muted-foreground">
              No results found
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="space-y-6">
              {results.patients.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Patients
                  </h3>
                  <div className="space-y-1">
                    {results.patients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => handleResultClick('patient', patient.id)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="font-medium">
                          {patient.first_name} {patient.last_name}
                        </div>
                        {(patient.email || patient.phone) && (
                          <div className="text-sm text-muted-foreground">
                            {patient.email || patient.phone}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.visits.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Visits
                  </h3>
                  <div className="space-y-1">
                    {results.visits.map((visit) => (
                      <button
                        key={visit.id}
                        onClick={() => handleResultClick('visit', visit.id)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="font-medium">
                          {visit.patients
                            ? `${visit.patients.first_name} ${visit.patients.last_name}`
                            : 'Unknown Patient'}{' '}
                          — {formatDate(visit.visit_date)}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {visit.status.replace('_', ' ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.appointments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Appointments
                  </h3>
                  <div className="space-y-1">
                    {results.appointments.map((appointment) => (
                      <button
                        key={appointment.id}
                        onClick={() =>
                          handleResultClick('appointment', appointment.id)
                        }
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="font-medium">
                          {appointment.patients
                            ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
                            : 'Unknown Patient'}{' '}
                          — {formatDate(appointment.start_time)}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {appointment.status.replace('_', ' ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.providers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Providers
                  </h3>
                  <div className="space-y-1">
                    {results.providers.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleResultClick('provider', provider.id)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="font-medium">{provider.name}</div>
                        {provider.specialization && (
                          <div className="text-sm text-muted-foreground">
                            {provider.specialization}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Press Ctrl+K to open search</span>
            <span>ESC to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
