/*
  # Add ringcentral to source_database allowed values

  1. Changes
    - Drop existing CHECK constraint on sponsor_leads.source_database
    - Add new CHECK constraint allowing 'forum_event', 'non_forum_event', and 'ringcentral'
  
  2. Security
    - No RLS changes needed
*/

-- Drop the existing constraint
ALTER TABLE sponsor_leads
DROP CONSTRAINT IF EXISTS sponsor_leads_source_database_check;

-- Add new constraint with ringcentral included
ALTER TABLE sponsor_leads
ADD CONSTRAINT sponsor_leads_source_database_check
CHECK (source_database = ANY (ARRAY['forum_event'::text, 'non_forum_event'::text, 'ringcentral'::text]));
