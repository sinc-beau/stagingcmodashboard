/*
  # Remove Dates from CISO 2 and Canada IT & Security Leaders Events
  
  1. Changes
    - Set event_date to NULL for:
      - SINC 2025 CISO 2 National Forum
      - SINC 2025 Canada IT & Security Leaders Forum
  
  2. Expected Result
    - These events will appear without dates in the historical view
*/

-- Remove date from CISO 2 National Forum
UPDATE historical_attendees
SET event_date = NULL
WHERE event_name = 'SINC 2025 CISO 2 National Forum';

-- Remove date from Canada IT & Security Leaders Forum
UPDATE historical_attendees
SET event_date = NULL
WHERE event_name = 'SINC 2025 Canada IT & Security Leaders Forum';
