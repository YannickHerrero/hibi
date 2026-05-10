CREATE TABLE "word_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lemma" text NOT NULL,
	"reading" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "word_statuses_user_lemma_reading_uq" ON "word_statuses" USING btree ("user_id","lemma","reading");--> statement-breakpoint
CREATE INDEX "word_statuses_user_id_idx" ON "word_statuses" USING btree ("user_id");