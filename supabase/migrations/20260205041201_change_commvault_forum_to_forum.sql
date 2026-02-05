/*
  # Update Commvault Sponsored Forum to Forum

  1. Changes
    - Updates all event_type values from "commvault sponsored forum" to "Forum" in historical_attendees table
  
  2. Notes
    - This normalizes the event type naming for better consistency
*/

UPDATE historical_attendees
SET event_type = 'Forum'
WHERE event_type = 'commvault sponsored forum';
