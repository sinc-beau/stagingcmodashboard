/*
  # Create Attendees Table

  1. New Tables
    - `attendees`
      - `id` (uuid, primary key) - Unique identifier for each attendee
      - `name` (text) - Attendee's full name
      - `email` (text) - Attendee's email address
      - `company` (text, nullable) - Attendee's company name
      - `title` (text, nullable) - Attendee's job title
      - `stage` (text, nullable) - Stage field from forum database
      - `approval_status` (text, nullable) - Approval status from non-forum database
      - `source_database` (text) - Which external database this attendee came from ('forum_event' or 'non_forum_event')
      - `source_attendee_id` (uuid, nullable) - Original ID from source database
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

    - `event_attendees` (junction table)
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to sponsor_events) - The event
      - `attendee_id` (uuid, foreign key to attendees) - The attendee
      - `source_event_id` (uuid, nullable) - Original event ID from source database
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (since this is a CRM tool)
*/

-- Create attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  title text,
  stage text,
  approval_status text,
  source_database text CHECK (source_database IN ('forum_event', 'non_forum_event')),
  source_attendee_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_attendees junction table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES sponsor_events(id) ON DELETE CASCADE,
  attendee_id uuid NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
  source_event_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, attendee_id)
);

-- Enable RLS
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view attendees"
  ON attendees FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view event attendees"
  ON event_attendees FOR SELECT
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_source ON attendees(source_database, source_attendee_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_attendee ON event_attendees(attendee_id);
