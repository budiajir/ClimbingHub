CREATE TYPE "public"."ascent_style" AS ENUM('redpoint', 'flash', 'onsight', 'repeat');--> statement-breakpoint
CREATE TYPE "public"."booking_slot" AS ENUM('morning', 'afternoon', 'evening');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."join_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."route_discipline" AS ENUM('sport', 'multipitch', 'bouldering');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('guest', 'registered', 'gym_admin', 'super_admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ascent_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"route_id" text NOT NULL,
	"ascent_type" "ascent_style" DEFAULT 'redpoint' NOT NULL,
	"grade_opinion" text,
	"notes" text,
	"rating" integer,
	"image_url" text,
	"video_url" text,
	"climber_name" text,
	"attempts" text,
	"duration" text,
	"belayer" text,
	"photographer" text,
	"wall_angle" text,
	"wall_height" text,
	"bolts_count" text,
	"location_label" text,
	"province_country" text,
	"markers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"logged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"gym_id" text NOT NULL,
	"slot" "booking_slot" NOT NULL,
	"date" date NOT NULL,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"ticket_code" text,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"addons" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_ticket_code_unique" UNIQUE("ticket_code")
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"homebase" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"members" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_join_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" text NOT NULL,
	"user_id" text,
	"climber_name" text NOT NULL,
	"level" text DEFAULT '' NOT NULL,
	"note" text,
	"ig_handle" text,
	"status" "join_request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"user_id" text,
	"image_url" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"uploader_name" text NOT NULL,
	"uploader_avatar_url" text,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_name" text NOT NULL,
	"user_handle" text DEFAULT '' NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"hometown" text DEFAULT 'Indonesia' NOT NULL,
	"activity" text NOT NULL,
	"location" text NOT NULL,
	"grade" text,
	"caption" text NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"author_type" text DEFAULT 'climber' NOT NULL,
	"shared_url" text,
	"comments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crag_regions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"province" text NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sector_count" integer DEFAULT 0 NOT NULL,
	"problem_count" integer DEFAULT 0 NOT NULL,
	"coordinates" jsonb,
	"gmaps_url" text,
	"rock_type" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"logo_url" text,
	"gallery_image_urls" text[] DEFAULT '{}'::text[] NOT NULL,
	"rating" numeric(2, 1) DEFAULT '0' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"slots_morning" integer DEFAULT 0 NOT NULL,
	"slots_afternoon" integer DEFAULT 0 NOT NULL,
	"slots_evening" integer DEFAULT 0 NOT NULL,
	"max_slots_morning" integer DEFAULT 20 NOT NULL,
	"max_slots_afternoon" integer DEFAULT 20 NOT NULL,
	"max_slots_evening" integer DEFAULT 25 NOT NULL,
	"facilities" text[] DEFAULT '{}'::text[] NOT NULL,
	"price_per_session" integer DEFAULT 0 NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"route_setters" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"gmaps_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" text PRIMARY KEY NOT NULL,
	"sector_id" text NOT NULL,
	"name" text NOT NULL,
	"discipline" "route_discipline" NOT NULL,
	"grade" text NOT NULL,
	"font_grade" text DEFAULT '' NOT NULL,
	"setter" text DEFAULT '' NOT NULL,
	"fa" text DEFAULT '' NOT NULL,
	"fa_date" date,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text,
	"beta_video_url" text,
	"access_info" text DEFAULT '' NOT NULL,
	"local_contact" text DEFAULT '' NOT NULL,
	"ascent_count" integer DEFAULT 0 NOT NULL,
	"grade_votes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"markers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pitch_length" text,
	"bolt_count" integer,
	"anchor_type" text,
	"total_pitches" integer,
	"total_height" text,
	"pitch_breakdown" jsonb,
	"descent_info" text,
	"pad_recommendation" text,
	"landing_quality" text,
	"start_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" text PRIMARY KEY NOT NULL,
	"crag_id" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" "user_role" DEFAULT 'registered' NOT NULL,
	"handle" text,
	"grade_max" text,
	"ascents_count" integer DEFAULT 0 NOT NULL,
	"hometown" text,
	"country_of_origin" text DEFAULT 'Indonesia' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'jalur.world' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ascent_logs" ADD CONSTRAINT "ascent_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ascent_logs" ADD CONSTRAINT "ascent_logs_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_join_requests" ADD CONSTRAINT "community_join_requests_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_join_requests" ADD CONSTRAINT "community_join_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_photos" ADD CONSTRAINT "community_photos_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_photos" ADD CONSTRAINT "community_photos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gyms" ADD CONSTRAINT "gyms_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sectors" ADD CONSTRAINT "sectors_crag_id_crag_regions_id_fk" FOREIGN KEY ("crag_id") REFERENCES "public"."crag_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ascent_logs_user" ON "ascent_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ascent_logs_route" ON "ascent_logs" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_user" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_gym" ON "bookings" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_date" ON "bookings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_community_join_requests_community" ON "community_join_requests" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "idx_community_photos_community" ON "community_photos" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "idx_community_posts_user" ON "community_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_routes_sector" ON "routes" USING btree ("sector_id");--> statement-breakpoint
CREATE INDEX "idx_routes_discipline" ON "routes" USING btree ("discipline");--> statement-breakpoint
CREATE INDEX "idx_sectors_crag" ON "sectors" USING btree ("crag_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");