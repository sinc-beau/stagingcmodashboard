/*
  # Remove Duplicate CISO 2 National Forum Attendees for Commvault
  
  1. Problem
    - SINC 2025 CISO 2 National Forum has duplicate attendees for Commvault
    - Currently: 158 attended + 56 cancelled = 214 total
    - Should be: 70 attended + 28 cancelled = 98 total
    - Each attendee appears exactly twice
  
  2. Changes
    - Remove duplicate records for Commvault sponsor
    - Keep only one record per unique email + attendance_status combination
    - Use row_number() to identify duplicates, keeping the first occurrence
  
  3. Expected Result
    - 79 attended records removed (158 → 79)
    - 28 cancelled records removed (56 → 28)
    - Total: 107 duplicate records removed
*/

-- Delete duplicate records, keeping only the first occurrence based on ID
DELETE FROM historical_attendees
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY email, attendance_status 
        ORDER BY id
      ) as row_num
    FROM historical_attendees
    WHERE event_name = 'SINC 2025 CISO 2 National Forum'
      AND sponsor_id = '6e048704-504b-474c-93bc-8c1e5feb265d' -- Commvault
  ) duplicates
  WHERE row_num > 1
);
