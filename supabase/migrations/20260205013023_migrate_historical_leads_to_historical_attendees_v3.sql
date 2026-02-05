/*
  # Migrate historical leads to historical_attendees

  1. Changes
    - Copy all historical leads from sponsor_leads to historical_attendees
    - Maps historical_event_name to event_name
    - Maps historical_event_type to event_type (defaults to 'forum' if null)
    - Maps historical_event_date to event_date
    - Preserves all other data

  2. Notes
    - Data is copied, not moved (deletion happens in next migration)
    - 59 records have null historical_event_type, defaulting to 'other'
*/

-- Insert all historical leads into historical_attendees
INSERT INTO historical_attendees (
  id,
  sponsor_id,
  name,
  email,
  phone,
  company,
  title,
  attendance_status,
  event_name,
  event_type,
  event_date,
  source_database,
  notes,
  created_at
)
SELECT 
  id,
  sponsor_id,
  name,
  email,
  phone,
  company,
  title,
  attendance_status,
  historical_event_name,
  COALESCE(historical_event_type, 'other'),
  historical_event_date,
  COALESCE(source_database, 'ringcentral'),
  notes,
  created_at
FROM sponsor_leads
WHERE is_historical = true
ON CONFLICT (id) DO NOTHING;
