import { RemindersPanel } from '../components/RemindersPanel';

export function RemindersPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Appointment Reminders</h1>
        <p className="text-muted-foreground mt-1">
          Manage automated appointment reminders sent to patients
        </p>
      </div>

      <RemindersPanel />

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How Appointment Reminders Work</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">•</span>
            <span>
              Reminders are automatically created 24 hours before each appointment when the appointment is scheduled
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">•</span>
            <span>
              Patients receive an email reminder with appointment details including date, time, provider, and location
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">•</span>
            <span>
              Click "Process Reminders" to send all pending reminders that are due
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">•</span>
            <span>
              Cancelled appointments will not trigger reminder emails
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold mt-0.5">•</span>
            <span>
              Patients without email addresses will be automatically skipped
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
