/*
  # Create cache table for API responses

  1. New Tables
    - `cache`
      - `key` (text, primary key)
      - `data` (jsonb)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `cache` table
    - Add policy for service role to manage cache
*/

CREATE TABLE IF NOT EXISTS cache (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage cache"
  ON cache
  USING (true)
  WITH CHECK (true);

-- Create index for expires_at to help with cleanup
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM cache WHERE expires_at < now();
END;
$$;