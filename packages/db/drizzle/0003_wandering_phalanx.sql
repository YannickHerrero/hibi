CREATE TABLE "openrouter_credentials" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"encrypted_key" text NOT NULL,
	"key_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
