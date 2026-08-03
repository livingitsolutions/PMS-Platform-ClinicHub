CREATE TABLE "stripe_webhook_events" (
	"event_id" text PRIMARY KEY,
	"event_type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
