/*
  # Add Publishing System for Sponsor Events

  1. Changes to `sponsor_events` table
    - Add `is_published` (boolean, default false) - Controls if sponsor can see this event
    - Add `published_at` (timestamptz, nullable) - When admin published this event
    - Add `published_by` (uuid, nullable) - Admin who published the event

  2. New Tables
    - `sponsor_published_attendees`
      - `id` (uuid, primary key)
      - `sponsor_id` (uuid, not null) - Which sponsor this is for
      - `event_id` (text, not null) - Event ID from external system
      - `attendee_id` (text, not null) - Attendee ID from external system
      - `attendee_data` (jsonb, not null) - Snapshot of attendee data at publish time
      - `published_at` (timestamptz, not null) - When this snapshot was created
      - `published_by` (uuid, not null) - Admin who published this data

  3. Security
    - Enable RLS on `sponsor_published_attendees` table
    - Admins can view and manage all published attendees
    - Sponsors can only view published attendees for their sponsor_id and published events

  4. Important Notes
    - is_published flag controls sponsor visibility of events
    - sponsor_published_attendees stores frozen snapshot of attendee data
    - Admins can unpublish by setting is_published to false
    - Sponsors only see attendee snapshots, not live data
*/

-- Add columns to sponsor_events table
DO $$
BEGIN
  -- Add is_published column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_events' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE sponsor_events ADD COLUMN is_published boolean DEFAULT false;
  END IF;

  -- Add published_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_events' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE sponsor_events ADD COLUMN published_at timestamptz;
  END IF;

  -- Add published_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_events' AND column_name = 'published_by'
  ) THEN
    ALTER TABLE sponsor_events ADD COLUMN published_by uuid;
  END IF;
END $$;

-- Create sponsor_published_attendees table
CREATE TABLE IF NOT EXISTS sponsor_published_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  attendee_id text NOT NULL,
  attendee_data jsonb NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid NOT NULL,
  UNIQUE(sponsor_id, event_id, attendee_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_published_attendees_sponsor_id ON sponsor_published_attendees(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_published_attendees_event_id ON sponsor_published_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_published_attendees_sponsor_event ON sponsor_published_attendees(sponsor_id, event_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_events_is_published ON sponsor_events(sponsor_id, is_published);

-- Enable RLS
ALTER TABLE sponsor_published_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all published attendees
CREATE POLICY "Admins can view all published attendees"
  ON sponsor_published_attendees
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Sponsors can only view their own published attendees
CREATE POLICY "Sponsors can view own published attendees"
  ON sponsor_published_attendees
  FOR SELECT
  TO authenticated
  USING (
    sponsor_id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

-- Policy: Admins can insert published attendees
CREATE POLICY "Admins can insert published attendees"
  ON sponsor_published_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy: Admins can delete published attendees (for unpublishing)
CREATE POLICY "Admins can delete published attendees"
  ON sponsor_published_attendees
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Function to publish event to sponsor (creates attendee snapshots)
CREATE OR REPLACE FUNCTION publish_event_to_sponsor(
  p_sponsor_id uuid,
  p_event_id text,
  p_attendees jsonb
)
RETURNS void AS $$
DECLARE
  attendee jsonb;
BEGIN
  -- Must be admin to publish
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can publish events';
  END IF;

  -- Update sponsor_events to mark as published
  UPDATE sponsor_events
  SET is_published = true,
      published_at = now(),
      published_by = auth.uid()
  WHERE sponsor_id = p_sponsor_id
    AND event_id = p_event_id;

  -- Delete existing published attendees for this sponsor/event
  DELETE FROM sponsor_published_attendees
  WHERE sponsor_id = p_sponsor_id
    AND event_id = p_event_id;

  -- Insert new attendee snapshots
  FOR attendee IN SELECT * FROM jsonb_array_elements(p_attendees)
  LOOP
    INSERT INTO sponsor_published_attendees (
      sponsor_id,
      event_id,
      attendee_id,
      attendee_data,
      published_by
    ) VALUES (
      p_sponsor_id,
      p_event_id,
      attendee->>'id',
      attendee,
      auth.uid()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unpublish event from sponsor
CREATE OR REPLACE FUNCTION unpublish_event_from_sponsor(
  p_sponsor_id uuid,
  p_event_id text
)
RETURNS void AS $$
BEGIN
  -- Must be admin to unpublish
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can unpublish events';
  END IF;

  -- Update sponsor_events to mark as not published
  UPDATE sponsor_events
  SET is_published = false,
      published_at = NULL,
      published_by = NULL
  WHERE sponsor_id = p_sponsor_id
    AND event_id = p_event_id;

  -- Delete published attendees for this sponsor/event
  DELETE FROM sponsor_published_attendees
  WHERE sponsor_id = p_sponsor_id
    AND event_id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
