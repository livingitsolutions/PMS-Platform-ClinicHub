import { apiClient } from '@/lib/apiClient';

export interface GenerateNotesInput {
  input: string;
}

export interface GenerateNotesResponse {
  chief_complaint: string;
  diagnosis: string;
  notes: string;
}

export interface GenerateNotesError {
  error: string;
  details?: string;
  code?: string;
}

export class VisitNotesGenerationError extends Error {
  code?: string;
  details?: string;

  constructor(message: string, code?: string, details?: string) {
    super(message);
    this.name = 'VisitNotesGenerationError';
    this.code = code;
    this.details = details;
  }
}

export async function generateVisitNotes(input: string): Promise<GenerateNotesResponse> {
  const { data: { session } } = await apiClient.auth.getSession();

  if (!session) {
    throw new VisitNotesGenerationError('No active session', 'AUTH_ERROR');
  }

  if (!input || input.trim().length < 10) {
    throw new VisitNotesGenerationError(
      'Input too short',
      'INPUT_TOO_SHORT',
      'Please provide at least 10 characters of visit information'
    );
  }

  const { data, error } = await apiClient.functions.invoke<GenerateNotesResponse>(
    'generate-visit-notes',
    { body: { input } },
  );

  if (error) {
    throw new VisitNotesGenerationError(
      error.message || 'Failed to generate visit notes',
      'GENERATION_ERROR',
    );
  }

  if (!data) throw new VisitNotesGenerationError('No visit notes returned', 'EMPTY_RESPONSE');

  return data;
}
