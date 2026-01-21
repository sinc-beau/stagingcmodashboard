/*
  # Allow sponsor_id to be nullable in sponsor_events

  ## Overview
  Updates the sponsor_events table to allow sponsor_id to be NULL, enabling events to exist without being linked to a specific sponsor. This allows for manual event linking/unlinking from the UI.

  ## Changes
  1. Alter sponsor_events table
    - Make sponsor_id nullable
    - Update foreign key constraint to handle nulls properly

  ## Notes
  This allows events to be temporarily unlinked from sponsors while still preserving the event data.
*/

-- Make sponsor_id nullable in sponsor_events table
ALTER TABLE sponsor_events 
  ALTER COLUMN sponsor_id DROP NOT NULL;