/*
  # Fix West 2 Forum event type

  1. Changes
    - Update event_type from 'other' to 'forum' for West 2 Forum
    - This event had null event_type during import and was defaulted to 'other'

  2. Notes
    - Makes the event type consistent with other forum events
*/

-- Update West 2 Forum to correct event type
UPDATE historical_attendees
SET event_type = 'forum'
WHERE event_name = 'SINC 2025 West 2 IT & Security Leaders Forum'
  AND event_type = 'other';
