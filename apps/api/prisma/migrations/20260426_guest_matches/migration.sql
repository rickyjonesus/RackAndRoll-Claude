-- Make awayPlayerId optional and add guestName to support guest matches
ALTER TABLE "matches" ALTER COLUMN "away_player_id" DROP NOT NULL;
ALTER TABLE "matches" ADD COLUMN "guest_name" TEXT;
