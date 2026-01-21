/*
  # Add additional fields to sponsors table

  1. Changes
    - Add `logo_url` field to store sponsor logos
    - Add `about` field for longer descriptions (in addition to business_description)
    - Add `domain` field to store extracted domain for easier matching
    - Add index on domain for faster lookups

  2. Notes
    - These fields will help us sync and match sponsors from external databases
    - Domain field will be key for deduplication across data sources
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'about'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN about text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsors' AND column_name = 'domain'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN domain text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sponsors_domain ON sponsors(domain) WHERE domain IS NOT NULL;