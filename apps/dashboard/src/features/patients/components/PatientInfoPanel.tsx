import { useNavigate } from 'react-router-dom';
import { Calendar, Phone, Mail, MapPin, User, ArrowRight, Pencil } from 'lucide-react';
import type { Patient } from '../api/patientsApi';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { EditPatientDialog } from './EditPatientDialog';

interface PatientInfoPanelProps {
  patient: Patient;
  clinicId: string;
  onPatientUpdated: () => void;
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
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-teal-400 to-teal-600',
  'from-orange-400 to-orange-600',
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function PatientInfoPanel({ patient, clinicId, onPatientUpdated }: PatientInfoPanelProps) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const age = getAgeFromDOB(patient.date_of_birth);
  const genderLabel = patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1);
  const initials = getInitials(patient.first_name, patient.last_name);
  const gradient = getGradient(patient.id);

  const dob = new Date(patient.date_of_birth).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const infoRows = [
    {
      icon: Calendar,
      label: 'Date of Birth',
      value: dob,
    },
    {
      icon: User,
      label: 'Gender',
      value: genderLabel,
    },
    ...(patient.phone
      ? [{ icon: Phone, label: 'Phone', value: patient.phone }]
      : []),
    ...(patient.email
      ? [{ icon: Mail, label: 'Email', value: patient.email }]
      : []),
    ...(patient.address
      ? [{ icon: MapPin, label: 'Address', value: patient.address }]
      : []),
  ];

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-5">
        <div className="flex flex-col items-center text-center mb-5">
          <div
            className={`size-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md`}
          >
            {initials}
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {patient.first_name} {patient.last_name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {genderLabel}, {age} years old
          </p>
        </div>

        <div className="space-y-3 mb-5">
          {infoRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="size-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="size-3.5 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm text-gray-800 font-medium break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
            size="sm"
          >
            View Full Profile
            <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="w-full rounded-xl border-gray-200"
            size="sm"
          >
            <Pencil className="size-3.5 mr-1.5" />
            Edit Patient
          </Button>
        </div>
      </div>

      {editOpen && (
        <EditPatientDialog
          patient={patient}
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) onPatientUpdated();
          }}
          clinicId={clinicId}
        />
      )}
    </div>
  );
}
