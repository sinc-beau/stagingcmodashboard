/*
  # Remove Date from CISO National Forum
  
  1. Changes
    - Set event_date to NULL for:
      - SINC 2025 CISO National Forum (82 attendees)
  
  2. Expected Result
    - This event will appear without a date in the historical view
*/

-- Remove date from CISO National Forum
UPDATE historical_attendees
SET event_date = NULL
WHERE event_name = 'SINC 2025 CISO National Forum';
