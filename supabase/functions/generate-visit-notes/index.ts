import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateNotesRequest {
  input: string;
}

interface GenerateNotesResponse {
  chief_complaint: string;
  diagnosis: string;
  notes: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

const MIN_INPUT_LENGTH = 10;
const MAX_INPUT_LENGTH = 5000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    let requestBody: GenerateNotesRequest;

    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Invalid JSON in request body:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid request format",
          details: "Request body must be valid JSON",
          code: "INVALID_JSON"
        } as ErrorResponse),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { input } = requestBody;

    if (!input || typeof input !== 'string') {
      console.error("Input validation failed: missing or invalid input field");
      return new Response(
        JSON.stringify({
          error: "Input is required",
          details: "The 'input' field must be a non-empty string",
          code: "MISSING_INPUT"
        } as ErrorResponse),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const trimmedInput = input.trim();

    if (trimmedInput.length < MIN_INPUT_LENGTH) {
      console.error(`Input too short: ${trimmedInput.length} characters`);
      return new Response(
        JSON.stringify({
          error: "Input too short",
          details: `Input must be at least ${MIN_INPUT_LENGTH} characters`,
          code: "INPUT_TOO_SHORT"
        } as ErrorResponse),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (trimmedInput.length > MAX_INPUT_LENGTH) {
      console.error(`Input too long: ${trimmedInput.length} characters`);
      return new Response(
        JSON.stringify({
          error: "Input too long",
          details: `Input must not exceed ${MAX_INPUT_LENGTH} characters`,
          code: "INPUT_TOO_LONG"
        } as ErrorResponse),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return new Response(
        JSON.stringify({
          error: "AI service unavailable",
          details: "OpenAI API key is not configured. Please contact system administrator.",
          code: "AI_NOT_CONFIGURED"
        } as ErrorResponse),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prompt = `You are a medical assistant helping to structure clinical visit notes. Based on the following input, generate structured clinical notes in JSON format.

Input: "${trimmedInput}"

Generate a JSON response with the following fields:
- chief_complaint: A concise statement of the patient's main concern (1-2 sentences)
- diagnosis: The preliminary or working diagnosis based on the information provided
- notes: Detailed clinical notes including relevant symptoms, examination findings, and recommendations

Respond ONLY with valid JSON in this exact format:
{
  "chief_complaint": "...",
  "diagnosis": "...",
  "notes": "..."
}`;

    console.log("Sending request to OpenAI API");

    let openAIResponse: Response;
    try {
      openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a medical assistant that structures clinical notes. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
    } catch (fetchError) {
      console.error("Network error calling OpenAI API:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Failed to connect to AI service",
          details: fetchError instanceof Error ? fetchError.message : "Network error",
          code: "NETWORK_ERROR"
        } as ErrorResponse),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error(`OpenAI API error (${openAIResponse.status}):`, errorText);

      let errorDetails = "OpenAI API request failed";
      let errorCode = "OPENAI_ERROR";

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorDetails = errorJson.error.message;
        }
        if (errorJson.error?.type === "insufficient_quota") {
          errorCode = "QUOTA_EXCEEDED";
          errorDetails = "AI service quota exceeded. Please contact system administrator.";
        }
      } catch {
        // Use default error message
      }

      return new Response(
        JSON.stringify({
          error: "AI generation failed",
          details: errorDetails,
          code: errorCode
        } as ErrorResponse),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let openAIData;
    try {
      openAIData = await openAIResponse.json();
    } catch (jsonError) {
      console.error("Failed to parse OpenAI response as JSON:", jsonError);
      return new Response(
        JSON.stringify({
          error: "Invalid AI response format",
          details: "Unable to parse response from AI service",
          code: "INVALID_AI_RESPONSE"
        } as ErrorResponse),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const generatedText = openAIData.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error("No content in OpenAI response:", openAIData);
      return new Response(
        JSON.stringify({
          error: "Empty AI response",
          details: "AI service returned no content",
          code: "EMPTY_AI_RESPONSE"
        } as ErrorResponse),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let result: GenerateNotesResponse;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(generatedText);
      }

      if (!result.chief_complaint || !result.diagnosis || !result.notes) {
        throw new Error("Missing required fields in AI response");
      }

      if (typeof result.chief_complaint !== 'string' ||
          typeof result.diagnosis !== 'string' ||
          typeof result.notes !== 'string') {
        throw new Error("Invalid field types in AI response");
      }

    } catch (parseError) {
      console.error("Failed to parse AI response:", generatedText);
      console.error("Parse error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response",
          details: "AI service returned invalid structured data",
          code: "PARSE_ERROR"
        } as ErrorResponse),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Successfully generated visit notes");

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Unexpected error in generate-visit-notes:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
        code: "INTERNAL_ERROR"
      } as ErrorResponse),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
