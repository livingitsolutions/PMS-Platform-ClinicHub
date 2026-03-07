import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { backup_id, clinic_id } = await req.json();

    if (!backup_id || !clinic_id) {
      return new Response(
        JSON.stringify({ error: "backup_id and clinic_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase
      .from("backups")
      .update({ backup_status: "in_progress" })
      .eq("id", backup_id);

    const tables = [
      "patients",
      "appointments",
      "providers",
      "visits",
      "visit_procedures",
      "procedures",
      "invoices",
      "payments",
    ];

    const exportData: Record<string, unknown[]> = {};

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("clinic_id", clinic_id);

      if (error) {
        console.error(`Error fetching ${table}:`, error.message);
        exportData[table] = [];
      } else {
        exportData[table] = data || [];
      }
    }

    const { data: clinicData } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", clinic_id)
      .maybeSingle();

    const payload = {
      exported_at: new Date().toISOString(),
      clinic: clinicData,
      data: exportData,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const bytes = new TextEncoder().encode(jsonString);
    const backupSize = bytes.byteLength;

    const fileName = `${clinic_id}/${backup_id}.json`;

    const { error: uploadError } = await supabase.storage
      .from("clinic-backups")
      .upload(fileName, bytes, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      await supabase
        .from("backups")
        .update({
          backup_status: "failed",
          error_message: uploadError.message,
        })
        .eq("id", backup_id);

      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: signedData } = await supabase.storage
      .from("clinic-backups")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    await supabase
      .from("backups")
      .update({
        backup_status: "completed",
        backup_size: backupSize,
        storage_url: signedData?.signedUrl || null,
      })
      .eq("id", backup_id);

    return new Response(
      JSON.stringify({ success: true, backup_id, size: backupSize }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
