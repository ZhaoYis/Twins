CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"tokens_per_month" integer,
	"max_team_members" integer DEFAULT 1,
	"can_add_own_providers" boolean DEFAULT false,
	"features" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "token_usage_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subscription_id" uuid,
	"provider_id" uuid,
	"tokens_used" integer NOT NULL,
	"model" text,
	"request_type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"tokens_used" integer DEFAULT 0,
	"tokens_remaining" integer DEFAULT 0,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "global_provider" ADD COLUMN "model_name" text;--> statement-breakpoint
ALTER TABLE "global_provider" ADD COLUMN "display_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "global_provider" ADD COLUMN "allowed_tiers" jsonb DEFAULT '["free","pro","enterprise"]'::jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_tier" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "token_usage_log" ADD CONSTRAINT "token_usage_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage_log" ADD CONSTRAINT "token_usage_log_subscription_id_user_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscription"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage_log" ADD CONSTRAINT "token_usage_log_provider_id_global_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."global_provider"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_plan_id_subscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plan"("id") ON DELETE no action ON UPDATE no action;