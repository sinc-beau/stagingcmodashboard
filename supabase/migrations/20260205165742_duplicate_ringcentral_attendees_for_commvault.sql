/*
  # Duplicate RingCentral Forum Attendees for Commvault
  
  1. Problem
    - 5 SINC 2025 Forum events have attendees only assigned to RingCentral
    - Commvault should also see these attendees in their historical view
  
  2. Events Affected
    - SINC 2025 West IT & Security Leaders Forum (82 attendees)
    - SINC 2025 Northeast IT & Security Leaders Forum (72 attendees)
    - SINC 2025 East IT & Security Leaders Forum (91 attendees)
    - SINC 2025 Central IT & Security Leaders Forum (82 attendees)
    - SINC 2025 West 2 IT & Security Leaders Forum (76 attendees)
    - Total: 403 attendees to duplicate
  
  3. Changes
    - Insert duplicate records for each attendee
    - Change sponsor_id from RingCentral to Commvault
    - Generate new UUIDs for the duplicates
    - Keep all other data identical
*/

-- Duplicate all attendees from the 5 events and assign to Commvault
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
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  '6e048704-504b-474c-93bc-8c1e5feb265d'::uuid as sponsor_id, -- Commvault
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
  now() as created_at,
  now() as updated_at
FROM historical_attendees
WHERE event_name IN (
  'SINC 2025 West IT & Security Leaders Forum',
  'SINC 2025 Northeast IT & Security Leaders Forum',
  'SINC 2025 East IT & Security Leaders Forum',
  'SINC 2025 Central IT & Security Leaders Forum',
  'SINC 2025 West 2 IT & Security Leaders Forum'
)
AND sponsor_id = '93110e75-235b-4586-91f2-196deca40133'::uuid; -- RingCentral
