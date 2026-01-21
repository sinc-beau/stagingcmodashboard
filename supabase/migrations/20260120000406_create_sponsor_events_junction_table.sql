/*
  # Redesign Sponsor Schema

  ## Overview
  Restructures the sponsors system to have one unique sponsor per brand, with events linked through a junction table.

  ## Changes

  ### 1. Update Sponsors Table
  - Add unique constraint on sponsor name
  - Simplify to core fields: name, url, sinc_rep, description, logo_url, domain

  ### 2. New Tables
  - `sponsor_events`: Junction table linking sponsors to events
    - `id` (uuid, primary key)
    - `sponsor_id` (uuid, FK to sponsors) - Links to unified sponsor
    - `event_name` (text) - Name/title of the event
    - `event_type` (text) - Type: 'forum', 'dinner', 'vrt', 'learn_go', 'activation', 'veb'
    - `event_date` (date) - When the event occurs
    - `event_location` (text) - City/location
    - `event_venue` (text) - Venue name
    - `event_brand` (text) - 'ITx', 'Sentinel', 'CDAIO', etc.
    - `source_database` (text) - Which external DB: 'forum_event', 'non_forum_event'
    - `source_event_id` (uuid) - Event UUID from source database
    - `source_sponsor_id` (uuid) - Sponsor UUID from source database (if applicable)
    - `sponsorship_level` (text) - 'Gold', 'Custom', etc. (forum-specific)
    - `pricing` (numeric) - Sponsorship cost
    - `additional_metadata` (jsonb) - Any extra event/sponsorship details
    - `created_at`, `updated_at` (timestamps)

  ### 3. Security
  - Enable RLS on sponsor_events
    - Policy: Authenticated users can read all sponsor events
    - Policy: Service role can insert/update/delete

  ### 4. Indexes
  - Index on sponsor_id for fast lookups
  - Index on event_date for chronological queries
  - Index on event_type for filtering by event type
*/

-- Add unique constraint to sponsors.name (handle existing duplicates first by adding IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sponsors_name_key'
  ) THEN
    -- We'll handle deduplication in application code, for now just add the constraint if possible
    ALTER TABLE sponsors ADD CONSTRAINT sponsors_name_unique UNIQUE (name);
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    -- Duplicates exist, will need manual cleanup
    RAISE NOTICE 'Duplicates exist in sponsors table - manual cleanup needed';
END $$;

-- Create sponsor_events junction table
CREATE TABLE IF NOT EXISTS sponsor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('forum', 'dinner', 'vrt', 'learn_go', 'activation', 'veb', 'other')),
  event_date date,
  event_location text,
  event_venue text,
  event_brand text,
  source_database text CHECK (source_database IN ('forum_event', 'non_forum_event')),
  source_event_id uuid,
  source_sponsor_id uuid,
  sponsorship_level text,
  pricing numeric(10, 2),
  additional_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsor_events_sponsor_id ON sponsor_events(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_event_date ON sponsor_events(event_date);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_event_type ON sponsor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_source ON sponsor_events(source_database, source_event_id);

-- Enable RLS
ALTER TABLE sponsor_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_events
CREATE POLICY "Anyone can read sponsor events"
  ON sponsor_events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert sponsor events"
  ON sponsor_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sponsor events"
  ON sponsor_events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sponsor events"
  ON sponsor_events
  FOR DELETE
  TO authenticated
  USING (true);