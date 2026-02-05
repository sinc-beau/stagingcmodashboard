/*
  # Update pending status to waitlisted
  
  1. Changes
    - Update all records with attendance_status = 'pending' to 'waitlisted'
    - This provides clearer labeling for historical lead data
*/

UPDATE historical_attendees
SET attendance_status = 'waitlisted'
WHERE attendance_status = 'pending';
