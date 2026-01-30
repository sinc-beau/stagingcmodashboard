/*
  # Add Solution Provider Topic to Intake Templates

  1. Changes
    - Add "Solution Provider Topic" text field to all event type intake templates
    - This field will capture what the solution provider is presenting about
    - Field will be added as display_order 13 (after Session Title(s) and Abstract(s))
    - For 'other' event type, it will be display_order 12

  2. Event Types Updated
    - forum
    - vrt
    - dinner
    - learn_go
    - activation
    - other

  3. Notes
    - Text field type for free-form entry
    - Replaces the standalone field in Event Config tab
*/

-- Add solution provider topic field to all existing event types
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('forum', 'Solution Provider Topic', 'What is the solution provider presenting about?', 13, 'text', NULL, NULL, 1),
('vrt', 'Solution Provider Topic', 'What is the solution provider presenting about?', 13, 'text', NULL, NULL, 1),
('dinner', 'Solution Provider Topic', 'What is the solution provider presenting about?', 13, 'text', NULL, NULL, 1),
('learn_go', 'Solution Provider Topic', 'What is the solution provider presenting about?', 13, 'text', NULL, NULL, 1),
('activation', 'Solution Provider Topic', 'What is the solution provider presenting about?', 13, 'text', NULL, NULL, 1)
ON CONFLICT DO NOTHING;

-- Add solution provider topic field to 'other' event type
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('other', 'Solution Provider Topic', 'What is the solution provider presenting about?', 12, 'text', NULL, NULL, 1)
ON CONFLICT DO NOTHING;
