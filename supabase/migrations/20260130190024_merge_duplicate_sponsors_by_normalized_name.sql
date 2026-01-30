/*
  # Merge Duplicate Sponsors Based on Normalized Names

  1. Purpose
    - Consolidate sponsors that differ only by spacing in their names
    - Examples: "Ping Identity" and "PingIdentity" should be treated as the same sponsor
    - Update all related records to reference the consolidated sponsor

  2. Changes
    - Identify duplicate sponsors using normalized names (lowercase, no spaces)
    - For each group of duplicates, keep the first record and merge all references
    - Update foreign key references in:
      - sponsor_events
      - sponsor_leads
      - sponsor_users
      - sponsor_messages
    - Delete duplicate sponsor records

  3. Safety
    - Uses transaction-like logic with DO blocks
    - Preserves all data by updating references before deletion
    - Only affects true duplicates (same name with different spacing)

  4. Notes
    - This is a one-time data cleanup migration
    - Future syncs will use the updated normalizeName function
*/

DO $$
DECLARE
  duplicate_record RECORD;
  kept_sponsor_id uuid;
  duplicate_sponsor_id uuid;
  sponsor_group RECORD;
BEGIN
  -- Create a temporary table to store normalized sponsor names and their IDs
  CREATE TEMP TABLE sponsor_normalized AS
  SELECT 
    id,
    name,
    LOWER(REGEXP_REPLACE(name, '\s+', '', 'g')) as norm_name,
    created_at
  FROM sponsors
  ORDER BY created_at ASC;

  -- Find groups of sponsors with the same normalized name
  FOR sponsor_group IN 
    SELECT 
      sn.norm_name,
      array_agg(sn.id ORDER BY sn.created_at ASC) as sponsor_ids,
      COUNT(*) as duplicate_count
    FROM sponsor_normalized sn
    GROUP BY sn.norm_name
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the first sponsor (oldest by created_at)
    kept_sponsor_id := sponsor_group.sponsor_ids[1];
    
    RAISE NOTICE 'Merging % duplicate sponsors for normalized name: %', 
      sponsor_group.duplicate_count, sponsor_group.norm_name;
    
    -- Loop through all duplicate sponsors (skip the first one we're keeping)
    FOR i IN 2..array_length(sponsor_group.sponsor_ids, 1) LOOP
      duplicate_sponsor_id := sponsor_group.sponsor_ids[i];
      
      RAISE NOTICE 'Merging sponsor % into %', duplicate_sponsor_id, kept_sponsor_id;
      
      -- Update sponsor_events references
      UPDATE sponsor_events 
      SET sponsor_id = kept_sponsor_id
      WHERE sponsor_id = duplicate_sponsor_id
        AND NOT EXISTS (
          SELECT 1 FROM sponsor_events se2
          WHERE se2.sponsor_id = kept_sponsor_id 
            AND se2.event_id = sponsor_events.event_id
        );
      
      -- Delete any remaining duplicate sponsor_events entries
      DELETE FROM sponsor_events 
      WHERE sponsor_id = duplicate_sponsor_id;
      
      -- Update sponsor_leads references
      UPDATE sponsor_leads 
      SET sponsor_id = kept_sponsor_id
      WHERE sponsor_id = duplicate_sponsor_id
        AND NOT EXISTS (
          SELECT 1 FROM sponsor_leads sl2
          WHERE sl2.sponsor_id = kept_sponsor_id 
            AND sl2.event_id = sponsor_leads.event_id
            AND sl2.email = sponsor_leads.email
        );
      
      -- Delete any remaining duplicate sponsor_leads entries
      DELETE FROM sponsor_leads 
      WHERE sponsor_id = duplicate_sponsor_id;
      
      -- Update sponsor_users references
      UPDATE sponsor_users 
      SET sponsor_id = kept_sponsor_id
      WHERE sponsor_id = duplicate_sponsor_id
        AND NOT EXISTS (
          SELECT 1 FROM sponsor_users su2
          WHERE su2.sponsor_id = kept_sponsor_id 
            AND su2.email = sponsor_users.email
        );
      
      -- Delete any remaining duplicate sponsor_users entries
      DELETE FROM sponsor_users 
      WHERE sponsor_id = duplicate_sponsor_id;
      
      -- Update sponsor_messages references
      UPDATE sponsor_messages 
      SET sponsor_id = kept_sponsor_id
      WHERE sponsor_id = duplicate_sponsor_id;
      
      -- Delete the duplicate sponsor record
      DELETE FROM sponsors WHERE id = duplicate_sponsor_id;
      
      RAISE NOTICE 'Successfully merged sponsor % into %', duplicate_sponsor_id, kept_sponsor_id;
    END LOOP;
  END LOOP;
  
  -- Drop the temporary table
  DROP TABLE sponsor_normalized;
  
  RAISE NOTICE 'Duplicate sponsor merge complete';
END $$;
