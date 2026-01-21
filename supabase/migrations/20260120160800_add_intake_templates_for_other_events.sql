/*
  # Add Intake Templates for Other Event Types

  1. Changes
    - Add intake item templates for 'other' event type
    - This ensures that events that don't match standard types still have an onboarding form

  2. Notes
    - Uses generic fields that apply to any event type
    - Display order continues from existing templates
*/

-- Insert intake templates for 'other' event type
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order) VALUES
  ('other', 'Company Name', 'Official name of your company', 1),
  ('other', 'Company Website', 'Your company website URL', 2),
  ('other', 'Company Synopsis', 'Brief description of your company and what you do (2-3 sentences)', 3),
  ('other', 'Primary Contact Name', 'Name of the main contact person for this event', 4),
  ('other', 'Primary Contact Email', 'Email address of the primary contact', 5),
  ('other', 'Primary Contact Phone', 'Phone number of the primary contact', 6),
  ('other', 'Event Goals', 'What are your goals for participating in this event?', 7),
  ('other', 'Target Audience', 'Who is your ideal attendee for this event?', 8),
  ('other', 'Special Requirements', 'Any special requirements, dietary restrictions, or accessibility needs', 9),
  ('other', 'Additional Notes', 'Any other information we should know', 10)
ON CONFLICT DO NOTHING;
