/*
  # Move historical records to RingCentral sponsor

  1. Changes
    - Move all 1,007 historical records from "Historical Event Attendees" placeholder sponsor to actual "RingCentral" sponsor
    - Update sponsor_id from f050a185-e395-489e-a46d-83e21e1efa0a to 93110e75-235b-4586-91f2-196deca40133

  2. Notes
    - "Historical Event Attendees" was a placeholder sponsor created during data import
    - All records belong to RingCentral and should be associated with the actual sponsor
*/

-- Update all historical records to point to the correct RingCentral sponsor
UPDATE historical_attendees
SET sponsor_id = '93110e75-235b-4586-91f2-196deca40133'
WHERE sponsor_id = 'f050a185-e395-489e-a46d-83e21e1efa0a';
