CREATE TABLE "bingo_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"player_id" text NOT NULL,
	"status" text NOT NULL,
	"timestamp" bigint NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bingo_game_state" (
	"key" text PRIMARY KEY NOT NULL,
	"state" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bingo_players" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bingo_claims_timestamp_idx" ON "bingo_claims" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "bingo_claims_player_id_idx" ON "bingo_claims" USING btree ("player_id");