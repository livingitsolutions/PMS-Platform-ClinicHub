import { useState, useEffect } from 'react';
import { Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GenerateNotesButton } from '@/features/ai/components/GenerateNotesButton';
import { useUpdateVisit } from '../hooks/useVisit';
import { type VisitWithDetails } from '../api/visitsApi';
import { type GenerateNotesResponse } from '@/features/ai/api/generateVisitNotes';

interface EditVisitNotesDialogProps {
  visit: VisitWithDetails;
}

export function EditVisitNotesDialog({ visit }: EditVisitNotesDialogProps) {
  const [open, setOpen] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: updateVisit, isPending } = useUpdateVisit();

  useEffect(() => {
    if (open) {
      setChiefComplaint(visit.chief_complaint || '');
      setDiagnosis(visit.diagnosis || '');
      setNotes(visit.notes || '');
    }
  }, [open, visit]);

  const handleSave = () => {
    updateVisit(
      {
        visitId: visit.id,
        payload: {
          chief_complaint: chiefComplaint,
          diagnosis: diagnosis,
          notes: notes,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const handleGenerated = (generated: GenerateNotesResponse) => {
    setChiefComplaint(generated.chief_complaint);
    setDiagnosis(generated.diagnosis);
    setNotes(generated.notes);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4 mr-2" />
          Edit Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Visit Notes</DialogTitle>
          <DialogDescription>
            Update the clinical information for this visit. You can use AI to generate notes or edit manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-end mb-2">
            <GenerateNotesButton onGenerated={handleGenerated} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chief-complaint">Chief Complaint</Label>
            <Input
              id="chief-complaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Patient's main concern"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Preliminary or working diagnosis"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detailed clinical notes including symptoms, examination findings, and recommendations"
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="size-4 mr-2" />
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
