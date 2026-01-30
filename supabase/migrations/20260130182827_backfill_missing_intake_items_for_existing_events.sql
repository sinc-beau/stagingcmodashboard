/*
  # Backfill Missing Intake Items for Existing Forum Events

  ## Problem
  Two new intake item templates were added to the forum event type:
  - "Session Title(s) and Abstract(s)" (display_order: 12)
  - "Solution Provider Topic" (display_order: 13)
  
  However, existing forum events only have 11 intake items per sponsor because they were 
  created before these templates were added. The loadIntakeItems logic only creates items 
  from templates if NO items exist, so new templates never get backfilled to existing events.

  ## Solution
  This migration identifies all forum event-sponsor combinations that are missing items 
  12 and 13, then inserts them with the correct template data.

  ## Changes
  1. For each existing forum event-sponsor combination in event_intake_items
  2. Check if intake items with labels "Session Title(s) and Abstract(s)" and "Solution Provider Topic" exist
  3. If missing, insert them with proper template configuration
  4. Maintains display_order and item_type from templates

  ## Important Notes
  - Uses INSERT ... ON CONFLICT DO NOTHING to safely handle cases where items already exist
  - Preserves the unique constraint on (event_id, sponsor_id, item_label)
  - Sets items as not completed and with no notes (matching initial template behavior)
  - Only affects forum events, other event types are unaffected
*/

-- Backfill missing intake items for existing forum event-sponsor combinations
INSERT INTO event_intake_items (
  event_id,
  sponsor_id,
  event_name,
  event_type,
  item_label,
  item_description,
  item_type,
  display_order,
  is_completed,
  notes
)
SELECT DISTINCT
  ei.event_id,
  ei.sponsor_id,
  e.event_name,
  e.event_type,
  t.item_label,
  t.item_description,
  t.item_type,
  t.display_order,
  false as is_completed,
  '' as notes
FROM event_intake_items ei
JOIN events e ON ei.event_id = e.id
CROSS JOIN intake_item_templates t
WHERE e.event_type = 'forum'
  AND t.event_type = 'forum'
  AND t.item_label IN ('Session Title(s) and Abstract(s)', 'Solution Provider Topic')
  AND NOT EXISTS (
    SELECT 1 
    FROM event_intake_items ei2 
    WHERE ei2.event_id = ei.event_id 
      AND ei2.sponsor_id = ei.sponsor_id 
      AND ei2.item_label = t.item_label
  )
ON CONFLICT (event_id, sponsor_id, item_label) DO NOTHING;
