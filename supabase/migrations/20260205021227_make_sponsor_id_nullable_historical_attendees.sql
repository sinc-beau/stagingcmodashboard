/*
  # Make sponsor_id nullable in historical_attendees

  1. Schema Changes
    - Make sponsor_id nullable to allow historical records without matched sponsors
*/

ALTER TABLE historical_attendees 
ALTER COLUMN sponsor_id DROP NOT NULL;
