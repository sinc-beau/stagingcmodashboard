/*
  # Add Event Configuration Fields
  
  1. New Columns Added to sponsor_events
    - `minimum_attendees` (integer) - Target minimum number of attendees for the event
    - `solution_provider_topic` (text) - What the solution provider will discuss/present
    - `event_notes` (text) - Internal notes visible to all logged-in users
    - `one_on_one_meetings` (jsonb) - Store 1:1 meeting assignments for forum events
      Structure: { "attendee_id": { "status": "requested|confirmed|scheduled", "time_slot": "...", "notes": "..." } }
    - `last_synced_at` (timestamptz) - Track when event data was last synced from external sources
  
  2. Purpose
    - Enable admins/account managers to set minimum attendee targets
    - Track solution provider presentation topics
    - Add internal notes for event planning
    - Manage 1:1 meeting schedules for forum events
    - Track data freshness from external database syncs
*/

-- Add new columns to sponsor_events table
ALTER TABLE sponsor_events
ADD COLUMN IF NOT EXISTS minimum_attendees integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS solution_provider_topic text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS event_notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS one_on_one_meetings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_synced_at timestamptz DEFAULT NULL;

-- Add comment to explain the one_on_one_meetings structure
COMMENT ON COLUMN sponsor_events.one_on_one_meetings IS 'JSON structure: { "attendee_id": { "status": "requested|confirmed|scheduled", "time_slot": "optional", "notes": "optional" } }';
