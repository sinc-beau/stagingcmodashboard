/*
  # Remove duplicate historical attendees

  1. Changes
    - Remove duplicate records where same email appears multiple times for same event
    - Keep the oldest record (earliest created_at) for each email+event_name combination
    - Removes approximately 24 duplicate records

  2. Notes
    - Duplicates were created during multiple import processes
    - Some records have empty emails (8 records from Toronto Dinner) - these are kept
*/

-- Delete duplicates, keeping only the oldest record for each email+event_name combination
DELETE FROM historical_attendees
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY sponsor_id, email, event_name 
        ORDER BY created_at ASC, id ASC
      ) as rn
    FROM historical_attendees
    WHERE email != ''  -- Don't deduplicate empty emails
  ) sub
  WHERE rn > 1
);
