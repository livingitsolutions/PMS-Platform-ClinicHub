import { supabase } from '@/lib/supabase';

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
  const { data: { session } } = await supabase.auth.getSession();

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

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-visit-notes`;

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });
  } catch (error) {
    throw new VisitNotesGenerationError(
      'Network error',
      'NETWORK_ERROR',
      'Unable to connect to the AI service. Please check your connection and try again.'
    );
  }

  if (!response.ok) {
    let errorData: GenerateNotesError;
    try {
      errorData = await response.json();
    } catch {
      throw new VisitNotesGenerationError(
        'Failed to generate visit notes',
        'UNKNOWN_ERROR',
        `Server returned status ${response.status}`
      );
    }

    throw new VisitNotesGenerationError(
      errorData.error || 'Failed to generate visit notes',
      errorData.code,
      errorData.details
    );
  }

  const data = await response.json();
  return data;
}
