/*
  # Add Session Title(s) and Abstract(s) to Intake Templates

  1. Changes
    - Add "Session Title(s) and Abstract(s)" text field to all event type intake templates
    - This field will capture presentation topics and descriptions for all event types
    - Field will be added as display_order 12 for existing event types
    - Field will be added as display_order 11 for 'other' event type (which doesn't have speaker fields)

  2. Event Types Updated
    - forum
    - vrt
    - dinner
    - learn_go
    - activation
    - other

  3. Notes
    - Text field type for free-form entry
    - Applies to all event types uniformly
*/

-- Add session titles and abstracts field to all existing event types
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('forum', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 12, 'text', NULL, NULL, 1),
('vrt', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 12, 'text', NULL, NULL, 1),
('dinner', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 12, 'text', NULL, NULL, 1),
('learn_go', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 12, 'text', NULL, NULL, 1),
('activation', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 12, 'text', NULL, NULL, 1)
ON CONFLICT DO NOTHING;

-- Add session titles and abstracts field to 'other' event type (display order 11 since it doesn't have speaker fields)
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('other', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 11, 'text', NULL, NULL, 1)
ON CONFLICT DO NOTHING;
