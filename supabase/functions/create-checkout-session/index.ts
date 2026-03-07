import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.5.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  clinicId: string;
  plan: string;
  successUrl: string;
  cancelUrl: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { clinicId, plan, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    const { data: clinicUser, error: clinicUserError } = await supabaseClient
      .from("user_clinics")
      .select("role")
      .eq("clinic_id", clinicId)
      .eq("user_id", user.id)
      .single();

    if (clinicUserError || !clinicUser) {
      throw new Error("Not authorized for this clinic");
    }

    if (clinicUser.role !== "owner") {
      throw new Error("Only clinic owners can manage subscriptions");
    }

    const { data: clinic, error: clinicError } = await supabaseClient
      .from("clinics")
      .select("name, email")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      throw new Error("Clinic not found");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let stripeCustomerId: string;
    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("clinic_id", clinicId)
      .maybeSingle();

    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: clinic.email,
        metadata: {
          clinic_id: clinicId,
        },
      });
      stripeCustomerId = customer.id;

      await supabaseAdmin.from("subscriptions").insert({
        clinic_id: clinicId,
        stripe_customer_id: stripeCustomerId,
        plan,
        status: "incomplete",
      });
    }

    const priceMap: Record<string, string> = {
      starter: Deno.env.get("STRIPE_PRICE_STARTER") || "",
      professional: Deno.env.get("STRIPE_PRICE_PROFESSIONAL") || "",
      enterprise: Deno.env.get("STRIPE_PRICE_ENTERPRISE") || "",
    };

    const priceId = priceMap[plan];
    if (!priceId) {
      throw new Error("Invalid plan selected");
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clinic_id: clinicId,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Checkout session error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
