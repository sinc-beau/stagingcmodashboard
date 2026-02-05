/*
  # Consolidate Duplicate SINC 2025 Canada Forum Events
  
  1. Problem
    - Two duplicate entries for "SINC 2025 Canada IT & Security Leaders Forum"
    - 72 attendees correctly recorded with date 2025-01-15 (from ringcentral)
    - 2 attendees incorrectly recorded with date 2025-02-15 (from commvault)
  
  2. Changes
    - Update the 2 commvault attendees to use the correct date: 2025-01-15
    - This consolidates all attendees under a single event date
  
  3. Affected Records
    - Sasha Einwechter (Magnet Forensics)
    - Varjinder Chane (City of Edmonton)
*/

-- Update the 2 commvault attendees to the correct event date
UPDATE historical_attendees
SET 
  event_date = '2025-01-15',
  updated_at = now()
WHERE event_name = 'SINC 2025 Canada IT & Security Leaders Forum'
  AND event_date = '2025-02-15'
  AND source_database = 'commvault';
