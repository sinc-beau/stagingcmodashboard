/*
  # Update Intake Templates with Better Labels

  1. Changes
    - Update "Presentation title and synopsis for agenda" to "Presentation Title & Synopsis"
    - Update "Confirmation on branded item for welcome bags" to "Do you have items to include in the welcome bags? (if part of your package)"
    - Update "Confirmation on prize for Monday night raffle" to "Do you have a prize for the Monday night raffle? ($100-$200 value)"
    - Remove items 14 and 15 (scheduling of pre-event and post-event calls)
  
  2. Security
    - No security changes needed
*/

-- Update forum presentation title label
UPDATE intake_item_templates
SET 
  item_label = 'Presentation Title & Synopsis',
  item_description = 'Please provide your presentation title and a 150-word synopsis. We will create the landing page and send it to you for review and approval.'
WHERE event_type = 'forum'
  AND item_label = 'Presentation title and synopsis for agenda';

-- Update forum welcome bags label
UPDATE intake_item_templates
SET 
  item_label = 'Do you have items to include in the welcome bags? (if part of your package)',
  item_description = NULL
WHERE event_type = 'forum'
  AND item_label = 'Confirmation on branded item for welcome bags';

-- Update forum raffle prize label
UPDATE intake_item_templates
SET 
  item_label = 'Do you have a prize for the Monday night raffle?',
  item_description = '$100-$200 value'
WHERE event_type = 'forum'
  AND item_label = 'Confirmation on prize for Monday night raffle';

-- Delete forum items 14 and 15 (scheduling calls)
DELETE FROM intake_item_templates
WHERE event_type = 'forum'
  AND (
    item_label = 'Scheduling of the pre-event call'
    OR item_label = 'Scheduling of the post-event call'
  );

-- Update display order for remaining items (renumber after deletion)
UPDATE intake_item_templates
SET display_order = 13
WHERE event_type = 'forum'
  AND display_order = 14;

-- Update content field labels for other event types
UPDATE intake_item_templates
SET 
  item_label = 'Presentation Title & Synopsis',
  item_description = 'Please provide your title and a 150-word synopsis. We will create the landing page and send it to you for review and approval.'
WHERE event_type IN ('dinner', 'learn_go', 'activation', 'vrt', 'veb')
  AND item_label = 'Content - Topic and 150-word synopsis';
