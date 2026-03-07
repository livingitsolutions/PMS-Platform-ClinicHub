import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.5.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

async function syncClinic(
  supabaseAdmin: ReturnType<typeof createClient>,
  clinicId: string,
  fields: { plan?: string; subscription_status?: string }
) {
  await supabaseAdmin
    .from("clinics")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", clinicId);
}

async function getClinicIdBySubscription(
  supabaseAdmin: ReturnType<typeof createClient>,
  stripeSubscriptionId: string
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("clinic_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();
  return data?.clinic_id ?? null;
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
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        let clinicId = session.metadata?.clinic_id;

        if (!clinicId && session.customer) {
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer.id;
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted) {
            clinicId = (customer as Stripe.Customer).metadata?.clinic_id;
          }
        }

        if (!clinicId) {
          console.error("Missing clinic_id in session and customer metadata");
          break;
        }

        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq("clinic_id", clinicId);

          await syncClinic(supabaseAdmin, clinicId, { subscription_status: "active" });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscriptionId =
            typeof invoice.subscription === "string"
              ? invoice.subscription
              : invoice.subscription.id;

          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);

          const clinicId = await getClinicIdBySubscription(supabaseAdmin, subscriptionId);
          if (clinicId) {
            await syncClinic(supabaseAdmin, clinicId, { subscription_status: "active" });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscriptionId =
            typeof invoice.subscription === "string"
              ? invoice.subscription
              : invoice.subscription.id;

          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);

          const clinicId = await getClinicIdBySubscription(supabaseAdmin, subscriptionId);
          if (clinicId) {
            await syncClinic(supabaseAdmin, clinicId, { subscription_status: "past_due" });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const clinicId = await getClinicIdBySubscription(supabaseAdmin, subscription.id);

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (clinicId) {
          await syncClinic(supabaseAdmin, clinicId, { subscription_status: "canceled" });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price?.id;

        const priceToplan: Record<string, string> = {
          [Deno.env.get("STRIPE_PRICE_STARTER") ?? ""]: "starter",
          [Deno.env.get("STRIPE_PRICE_PROFESSIONAL") ?? ""]: "professional",
          [Deno.env.get("STRIPE_PRICE_ENTERPRISE") ?? ""]: "enterprise",
        };

        const plan = priceId ? priceToplan[priceId] : undefined;

        const clinicId = await getClinicIdBySubscription(supabaseAdmin, subscription.id);

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
            ...(plan ? { plan } : {}),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (clinicId) {
          await syncClinic(supabaseAdmin, clinicId, {
            subscription_status: subscription.status,
            ...(plan ? { plan } : {}),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook processing failed",
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
