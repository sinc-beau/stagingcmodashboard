/*
  # Unify Intake Item Templates

  1. Changes
    - Remove all event-type-specific intake item templates
    - Create a single unified set of intake items for all events
    - Event type is now only used in intake_form_templates and target_profile_templates

  2. Purpose
    - Simplify template management by having one consistent form for all events
    - Reduce database clutter and make template system more maintainable
    - Intake items should be the same across all event types
*/

-- Delete all existing intake item templates
DELETE FROM intake_item_templates;

-- Insert the unified intake item template set
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order)
VALUES
  ('all', 'Company Name', 'Enter your company name as you would like it displayed', 1),
  ('all', 'Company Logo', 'Upload your company logo or enter logo URL (PNG or JPG, max 5MB)', 2),
  ('all', 'Company URL', 'Enter your company website URL', 3),
  ('all', 'About Company', 'Provide a brief description of your company', 4),
  ('all', 'ICP Description', 'Describe your ICP and what''s important to them', 5),
  ('all', 'Wishlist CSV', 'Upload a CSV file containing your wishlist of attendees', 6),
  ('all', 'Digital Assets for Landing Page', 'Upload up to 2 PDF files for the landing page (max 10MB each)', 7),
  ('all', 'Speaker Full Name', 'Enter the speaker''s full name', 8),
  ('all', 'Speaker Title', 'Enter the speaker''s title', 9),
  ('all', 'Speaker Email', 'Enter the speaker''s email address', 10),
  ('all', 'Speaker Headshot', 'Upload speaker headshot (JPG or PNG, max 5MB)', 11),
  ('all', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 12);
