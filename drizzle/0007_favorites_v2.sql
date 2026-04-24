-- 0007_favorites_v2.sql — rebuild favorites table for multi-category listings + Clerk user id.
-- Idempotent so it runs whether or not the old table existed.

DROP TABLE IF EXISTS favorites CASCADE;

CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);
CREATE UNIQUE INDEX ux_favorites_user_listing ON favorites(user_id, listing_id);
