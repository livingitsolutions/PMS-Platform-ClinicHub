import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoveHorizontal as MoreHorizontal, User } from 'lucide-react';
import type { Patient } from '../api/patientsApi';
import { Button } from '@/components/ui/button';

interface PatientListPanelProps {
  patients: Patient[];
  isLoading: boolean;
  selectedPatientId?: string | null;
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function getAgeFromDOB(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function PatientListPanel({
  patients,
  isLoading,
  selectedPatientId,
  onSelectPatient,
  onAddPatient,
  searchQuery,
  onSearchChange,
}: PatientListPanelProps) {
  const navigate = useNavigate();

  const filtered = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    );
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900">Patients</h2>
        <button
          onClick={() => onSearchChange(searchQuery)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Search patients"
        >
          <Search className="size-4" />
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {isLoading && (
          <div className="flex flex-col gap-2 p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3 rounded-xl animate-pulse">
                <div className="size-10 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <User className="size-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No patients match your search' : 'No patients yet'}
            </p>
          </div>
        )}

        {!isLoading && filtered.map((patient) => {
          const isSelected = patient.id === selectedPatientId;
          const initials = getInitials(patient.first_name, patient.last_name);
          const avatarColor = getAvatarColor(patient.id);
          const age = getAgeFromDOB(patient.date_of_birth);
          const genderLabel = patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1);

          return (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 mb-0.5 ${
                isSelected
                  ? 'bg-teal-50 border border-teal-200/60'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div
                className={`size-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColor}`}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>
                  {patient.first_name} {patient.last_name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {genderLabel}, {age}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/patients/${patient.id}`);
                }}
                className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-100">
        <Button
          onClick={onAddPatient}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
          size="sm"
        >
          <Plus className="size-4 mr-1.5" />
          Add Patient
        </Button>
      </div>
    </div>
  );
}
