/*
  # Remove West 2 forum duplicate imports

  1. Changes
    - Delete 59 West 2 forum attendees that were imported from forum_event source
    - These are duplicates as the same attendees already exist in other RingCentral historical events
    - Keep only the original RingCentral source records

  2. Notes
    - The 59 records were imported separately via forum_event source
    - The same people appear in the original RingCentral historical data
    - After removal, total records will be 990 (973 other + 17 West 2 original)
*/

-- Delete the 59 duplicate West 2 forum imports
DELETE FROM historical_attendees
WHERE sponsor_id = '93110e75-235b-4586-91f2-196deca40133'
  AND event_name = 'SINC 2025 West 2 IT & Security Leaders Forum'
  AND source_database = 'forum_event';
