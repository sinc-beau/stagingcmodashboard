/*
  # Restructure event architecture with central reference table
  
  ## Problem
  Current architecture creates duplicate event records per sponsor, making it
  difficult to maintain consistency and sync attendees properly.
  
  ## New Architecture
  1. **events** table - Central reference table with ONE record per external event
     - Stores event metadata and minimum attendees
     - References external database events via source_event_id + source_database
  
  2. **sponsor_events** - Junction table linking sponsors to events
     - References central events table
     - Stores sponsor-specific configuration only
  
  3. **sponsor_leads** - Attendee data accessible to sponsors
     - References central events table
     - Filtered per sponsor based on targeting rules
  
  4. **event_intake_items** - Intake checklist items
     - References central events table
  
  ## Changes
  1. Create new central events table
  2. Restructure sponsor_events as junction table
  3. Update foreign keys in related tables
  4. Update RLS policies
*/

-- Create central events reference table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('forum', 'dinner', 'vrt', 'learn_go', 'activation', 'veb', 'other')),
  event_date date,
  event_location text,
  event_venue text,
  event_brand text,
  source_event_id uuid NOT NULL,
  source_database text NOT NULL CHECK (source_database IN ('forum_event', 'non_forum_event')),
  minimum_attendees integer DEFAULT 8,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(source_event_id, source_database)
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS policies for events table
CREATE POLICY "Admins can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Account managers can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

CREATE POLICY "Anyone can view events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop old sponsor_events table and recreate as junction table
DROP TABLE IF EXISTS sponsor_events CASCADE;

CREATE TABLE sponsor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  solution_provider_topic text,
  event_notes text,
  one_on_one_meetings boolean DEFAULT false,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sponsor_id, event_id)
);

ALTER TABLE sponsor_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for sponsor_events junction table
CREATE POLICY "Admins can manage sponsor events"
  ON sponsor_events
  FOR ALL
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

CREATE POLICY "Account managers can manage sponsor events"
  ON sponsor_events
  FOR ALL
  TO authenticated
  USING (has_management_access())
  WITH CHECK (has_management_access());

CREATE POLICY "Sponsors can view own events"
  ON sponsor_events
  FOR SELECT
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id());

CREATE POLICY "Sponsors can update own event config"
  ON sponsor_events
  FOR UPDATE
  TO authenticated
  USING (sponsor_id = get_user_sponsor_id())
  WITH CHECK (sponsor_id = get_user_sponsor_id());

-- Update sponsor_leads to reference events table
ALTER TABLE sponsor_leads DROP CONSTRAINT IF EXISTS sponsor_leads_event_id_fkey;
ALTER TABLE sponsor_leads ALTER COLUMN event_id TYPE uuid USING NULL;
ALTER TABLE sponsor_leads ADD CONSTRAINT sponsor_leads_event_id_fkey 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Update event_intake_items to reference events table
ALTER TABLE event_intake_items DROP CONSTRAINT IF EXISTS event_intake_items_event_id_fkey;
ALTER TABLE event_intake_items ALTER COLUMN event_id TYPE uuid USING NULL;
ALTER TABLE event_intake_items ADD CONSTRAINT event_intake_items_event_id_fkey 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source_event_id, source_database);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_sponsor ON sponsor_events(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_event ON sponsor_events(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_event ON sponsor_leads(event_id);
CREATE INDEX IF NOT EXISTS idx_intake_items_event ON event_intake_items(event_id);
