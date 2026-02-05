/*
  # Consolidate CISO 2 National Forum Event Entries
  
  1. Problem
    - SINC 2025 CISO 2 National Forum appears as 2 separate events for Commvault
    - Split by different event dates:
      - RingCentral source: 2025-01-15 (50 attendees)
      - Commvault source: 2025-03-17 (57 attendees)
    - Should appear as a single event in the backoffice
  
  2. Changes
    - Update RingCentral records to use the Commvault event date (2025-03-17)
    - This will consolidate all 107 attendees under one event entry
  
  3. Expected Result
    - All CISO 2 National Forum attendees for Commvault appear under one event
    - Event date: 2025-03-17
    - Total: 107 attendees (79 attended + 28 cancelled)
*/

-- Update RingCentral records to use the Commvault date
UPDATE historical_attendees
SET event_date = '2025-03-17'
WHERE event_name = 'SINC 2025 CISO 2 National Forum'
  AND sponsor_id = '6e048704-504b-474c-93bc-8c1e5feb265d' -- Commvault
  AND event_date = '2025-01-15'
  AND source_database = 'ringcentral';
