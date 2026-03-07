import { useMutation } from '@tanstack/react-query';
import { generateVisitNotes } from '../api/generateVisitNotes';

export function useGenerateVisitNotes() {
  return useMutation({
    mutationFn: (input: string) => generateVisitNotes(input),
  });
}
