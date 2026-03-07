import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const { stripe_invoice_id, return_url } = await req.json();

    if (!stripe_invoice_id) {
      return new Response(
        JSON.stringify({ error: "stripe_invoice_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invoice = await stripe.invoices.retrieve(stripe_invoice_id);

    if (!invoice || invoice.status === "paid") {
      return new Response(
        JSON.stringify({ error: "Invoice is already paid or not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invoice.hosted_invoice_url) {
      return new Response(
        JSON.stringify({ checkout_url: invoice.hosted_invoice_url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id ?? undefined;

    const lineItems = (invoice.lines?.data ?? []).map((line) => ({
      price_data: {
        currency: invoice.currency ?? "usd",
        product_data: {
          name: line.description ?? "Subscription",
        },
        unit_amount: line.amount,
      },
      quantity: 1,
    }));

    if (lineItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "No line items found on invoice" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = return_url ?? "https://app.example.com/settings";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: lineItems,
      success_url: `${baseUrl}?payment=success`,
      cancel_url: `${baseUrl}?payment=cancelled`,
      metadata: {
        stripe_invoice_id: invoice.id,
      },
    });

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-invoice-payment-session error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to create payment session",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
