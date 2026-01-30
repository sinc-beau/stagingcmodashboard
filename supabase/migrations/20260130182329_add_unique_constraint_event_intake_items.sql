/*
  # Add Unique Constraint to Event Intake Items

  1. Changes
    - Adds a unique constraint on (sponsor_id, event_id, item_label) to prevent duplicate intake items
    - Ensures each sponsor can only have one intake item per label per event
  
  2. Security
    - No RLS changes, constraint only prevents data duplication
    
  3. Notes
    - This prevents the bug where multiple sponsors' intake items were showing up for a single sponsor
    - The constraint will prevent INSERT operations that would create duplicates
*/

-- Add unique constraint to prevent duplicate intake items for the same sponsor/event/label combination
ALTER TABLE event_intake_items
ADD CONSTRAINT event_intake_items_sponsor_event_label_unique 
UNIQUE (sponsor_id, event_id, item_label);
