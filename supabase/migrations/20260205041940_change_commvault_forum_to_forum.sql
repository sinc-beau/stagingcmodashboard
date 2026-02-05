/*
  # Update Commvault Sponsored Forum to Forum

  1. Changes
    - Update all event_type values from "Commvault Sponsored Forum" to "Forum" in historical_attendees table
    - This normalizes the event type naming for better consistency
*/

UPDATE historical_attendees
SET event_type = 'Forum'
WHERE event_type = 'Commvault Sponsored Forum';
