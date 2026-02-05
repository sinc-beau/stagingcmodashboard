/*
  # Normalize Forum event type capitalization

  1. Changes
    - Update all lowercase "forum" event_type values to "Forum" for consistency
    - Ensures all event types follow consistent capitalization (Dinner, Forum, vRT)
*/

UPDATE historical_attendees
SET event_type = 'Forum'
WHERE LOWER(event_type) = 'forum' AND event_type != 'Forum';
