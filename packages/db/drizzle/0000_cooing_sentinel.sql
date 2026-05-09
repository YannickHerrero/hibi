CREATE TYPE "public"."card_state" AS ENUM('new', 'learning', 'review', 'relearning');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key_hash" text NOT NULL,
	"name" text NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "card_states" (
	"card_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"due" timestamp with time zone NOT NULL,
	"stability" double precision NOT NULL,
	"difficulty" double precision NOT NULL,
	"elapsed_days" double precision DEFAULT 0 NOT NULL,
	"scheduled_days" double precision DEFAULT 0 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"learning_steps" integer DEFAULT 0 NOT NULL,
	"state" "card_state" DEFAULT 'new' NOT NULL,
	"last_review" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sentence" text NOT NULL,
	"focus_word" text NOT NULL,
	"focus_word_reading" text NOT NULL,
	"furigana" jsonb NOT NULL,
	"english" text NOT NULL,
	"glosses" text[] NOT NULL,
	"grammar_note" text,
	"kanji_list" jsonb NOT NULL,
	"image_key" text,
	"audio_key" text,
	"source" text NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"api_key_id" uuid,
	"name" text NOT NULL,
	"platform" text,
	"version" text,
	"request_count" bigint DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"elapsed_days" double precision NOT NULL,
	"scheduled_days" double precision NOT NULL,
	"state_before" "card_state" NOT NULL,
	"state_after" "card_state" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card_states" ADD CONSTRAINT "card_states_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_key_hash_uidx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "card_states_user_due_idx" ON "card_states" USING btree ("user_id","due");--> statement-breakpoint
CREATE INDEX "card_states_due_idx" ON "card_states" USING btree ("due");--> statement-breakpoint
CREATE INDEX "cards_user_id_idx" ON "cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cards_user_created_idx" ON "cards" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "clients_user_id_idx" ON "clients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_user_reviewed_idx" ON "reviews" USING btree ("user_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "reviews_card_id_idx" ON "reviews" USING btree ("card_id");