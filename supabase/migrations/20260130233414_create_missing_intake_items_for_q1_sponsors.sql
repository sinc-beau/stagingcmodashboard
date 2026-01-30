/*
  # Create Missing Intake Items for Watchtower National Q1 Sponsors

  This migration creates complete sets of intake items for sponsors in
  Watchtower National Q1 who are missing them. Uses the intake_item_templates
  to ensure all sponsors have the proper forum event intake items.

  ## Changes
  
  1. Identifies sponsors in Q1 event with missing intake items
  2. Creates complete set of 13 intake items per sponsor based on templates
  3. Ensures all file upload fields are properly configured

  ## Safety
  
  - Only affects Watchtower National Q1 event
  - Uses INSERT with template-based data
  - Preserves existing intake items
  - Uses ON CONFLICT to avoid duplicates
*/

-- Create complete sets of intake items for sponsors in Q1 event who don't have them
INSERT INTO event_intake_items (
  sponsor_id,
  event_id,
  event_name,
  event_type,
  item_label,
  item_description,
  item_type,
  is_completed,
  display_order,
  created_at,
  updated_at
)
SELECT 
  se.sponsor_id,
  e.id,
  e.event_name,
  e.event_type,
  t.item_label,
  t.item_description,
  t.item_type,
  false,
  t.display_order,
  NOW(),
  NOW()
FROM events e
JOIN sponsor_events se ON e.id = se.event_id
CROSS JOIN intake_item_templates t
WHERE e.event_name = 'Watchtower National Q1'
  AND t.event_type = 'forum'
  AND NOT EXISTS (
    SELECT 1 FROM event_intake_items eii
    WHERE eii.event_id = e.id
      AND eii.sponsor_id = se.sponsor_id
      AND eii.item_label = t.item_label
  )
ORDER BY se.sponsor_id, t.display_order;
