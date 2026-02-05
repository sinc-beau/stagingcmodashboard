/*
  # Make event_id nullable for historical leads

  1. Changes
    - Drop the foreign key constraint on sponsor_leads.event_id
    - Recreate it with a CHECK constraint that allows NULL for historical leads
    - This allows historical leads to exist without a real event association

  2. Security
    - Maintains all existing RLS policies
    - No changes to data access patterns
*/

-- Drop the existing foreign key constraint
ALTER TABLE sponsor_leads
DROP CONSTRAINT IF EXISTS sponsor_leads_event_id_fkey;

-- Add it back with a conditional check - event_id can be NULL if is_historical = true
ALTER TABLE sponsor_leads
ADD CONSTRAINT sponsor_leads_event_id_fkey
FOREIGN KEY (event_id)
REFERENCES events(id)
ON DELETE CASCADE
NOT VALID;

-- Make event_id nullable
ALTER TABLE sponsor_leads
ALTER COLUMN event_id DROP NOT NULL;

-- Add a check constraint: if not historical, event_id must be present
ALTER TABLE sponsor_leads
ADD CONSTRAINT sponsor_leads_event_id_required_check
CHECK (is_historical = true OR event_id IS NOT NULL);

-- Now update all historical leads with placeholder event_id to NULL
UPDATE sponsor_leads
SET event_id = NULL
WHERE is_historical = true
  AND event_id = '00000000-0000-0000-0000-000000000001';
