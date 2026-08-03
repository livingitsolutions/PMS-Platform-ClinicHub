import type { Config } from '@netlify/functions';
import { getCurrentUser } from './_shared/auth.mjs';
import { errorResponse, json, readJson } from './_shared/http.mjs';

export default async (request: Request) => {
  try {
    await getCurrentUser(request);
    const { input } = await readJson<{ input?: string }>(request);
    if (!input || input.trim().length < 10) return json({ error: 'Input too short', code: 'INPUT_TOO_SHORT' }, { status: 400 });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Convert clinical visit information into concise structured notes. Return JSON with chief_complaint, diagnosis, and notes. Do not invent facts; mark uncertain details clearly.' },
          { role: 'user', content: input },
        ],
      }),
    });
    if (!response.ok) return json({ error: 'AI service error', details: await response.text(), code: 'AI_SERVICE_ERROR' }, { status: 502 });
    const payload = await response.json() as { choices?: { message?: { content?: string } }[] };
    const result = JSON.parse(payload.choices?.[0]?.message?.content || '{}') as Record<string, unknown>;
    if (typeof result.chief_complaint !== 'string' || typeof result.diagnosis !== 'string' || typeof result.notes !== 'string') {
      return json({ error: 'Failed to parse AI response', code: 'PARSE_ERROR' }, { status: 502 });
    }
    return json(result);
  } catch (error) { return errorResponse(error); }
};

export const config: Config = { path: '/api/generate-visit-notes' };
