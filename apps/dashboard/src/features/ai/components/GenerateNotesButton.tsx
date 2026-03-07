import { useState } from 'react';
import { Sparkles, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useGenerateVisitNotes } from '../hooks/useGenerateVisitNotes';
import { type GenerateNotesResponse, VisitNotesGenerationError } from '../api/generateVisitNotes';

interface GenerateNotesButtonProps {
  onGenerated: (notes: GenerateNotesResponse) => void;
  disabled?: boolean;
}

export function GenerateNotesButton({ onGenerated, disabled }: GenerateNotesButtonProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const { mutate: generateNotes, isPending } = useGenerateVisitNotes();

  const handleGenerate = () => {
    if (!input.trim()) return;

    setError(null);

    generateNotes(input, {
      onSuccess: (data) => {
        onGenerated(data);
        setOpen(false);
        setInput('');
        setError(null);
      },
      onError: (error) => {
        console.error('Failed to generate notes:', error);

        if (error instanceof VisitNotesGenerationError) {
          setError({
            message: error.message,
            details: error.details
          });
        } else {
          setError({
            message: 'Failed to generate visit notes',
            details: error instanceof Error ? error.message : 'An unexpected error occurred'
          });
        }
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="gap-2"
      >
        <Sparkles className="size-4" />
        Generate Notes
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5" />
              Generate Visit Notes with AI
            </DialogTitle>
            <DialogDescription>
              Describe the patient's visit, symptoms, or concerns. AI will generate structured clinical notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      {error.message}
                    </p>
                    {error.details && (
                      <p className="text-sm text-red-700 mt-1">
                        {error.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="visit-input">Visit Description</Label>
              <textarea
                id="visit-input"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Example: Patient complains of persistent headache for 3 days, worse in the morning, accompanied by nausea. No fever. History of migraines."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to generate
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setInput('');
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!input.trim() || input.trim().length < 10 || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" />
                  Generate Notes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
