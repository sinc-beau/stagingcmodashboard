/*
  # Unify CISO 2 National Forum Source Database
  
  1. Problem
    - CISO 2 National Forum records still appear split because they have different source_database values
    - RingCentral records: source_database = 'ringcentral'
    - Commvault records: source_database = 'commvault'
  
  2. Changes
    - Update all RingCentral records to have source_database = 'commvault'
    - This will fully consolidate all records under one event entry
  
  3. Expected Result
    - All 107 CISO 2 National Forum attendees appear as one unified event
    - Event date: 2025-03-17
    - Source database: commvault
*/

-- Update source_database for RingCentral records to match Commvault
UPDATE historical_attendees
SET source_database = 'commvault'
WHERE event_name = 'SINC 2025 CISO 2 National Forum'
  AND sponsor_id = '6e048704-504b-474c-93bc-8c1e5feb265d' -- Commvault
  AND source_database = 'ringcentral';
