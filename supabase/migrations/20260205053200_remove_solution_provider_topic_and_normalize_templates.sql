/*
  # Remove Solution Provider Topic and Normalize File Upload Templates

  1. Changes
    - Delete "Solution Provider Topic" from all event types in intake_item_templates
    - Add missing file upload fields to "other" event type
    - Add missing file upload fields to "veb" event type if it exists
    
  2. Purpose
    - Remove deprecated Solution Provider Topic field (replaced by Session Titles and Abstracts)
    - Ensure all event types have consistent file upload fields
*/

-- Remove Solution Provider Topic from all event types
DELETE FROM intake_item_templates WHERE item_label = 'Solution Provider Topic';

-- Add missing intake items for "other" event type (delete existing and re-add for consistency)
DELETE FROM intake_item_templates WHERE event_type = 'other';

INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order)
VALUES
  ('other', 'Company Name', 'Enter your company name as you would like it displayed', 1),
  ('other', 'Company Logo', 'Upload your company logo (PNG or JPG, max 5MB)', 2),
  ('other', 'Company URL', 'Enter your company website URL', 3),
  ('other', 'About Company', 'Provide a brief description of your company', 4),
  ('other', 'ICP Description', 'Describe your ICP and what''s important to them', 5),
  ('other', 'Wishlist CSV', 'Upload a CSV file containing your wishlist of attendees', 6),
  ('other', 'Digital Assets for Landing Page', 'Upload up to 2 PDF files for the landing page (max 10MB each)', 7),
  ('other', 'Speaker Full Name', 'Enter the speaker''s full name', 8),
  ('other', 'Speaker Title', 'Enter the speaker''s title', 9),
  ('other', 'Speaker Email', 'Enter the speaker''s email address', 10),
  ('other', 'Speaker Headshot', 'Upload speaker headshot (JPG or PNG, max 5MB)', 11),
  ('other', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 12);

-- Add all intake items for "veb" event type
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order)
VALUES
  ('veb', 'Company Name', 'Enter your company name as you would like it displayed', 1),
  ('veb', 'Company Logo', 'Upload your company logo (PNG or JPG, max 5MB)', 2),
  ('veb', 'Company URL', 'Enter your company website URL', 3),
  ('veb', 'About Company', 'Provide a brief description of your company', 4),
  ('veb', 'ICP Description', 'Describe your ICP and what''s important to them', 5),
  ('veb', 'Wishlist CSV', 'Upload a CSV file containing your wishlist of attendees', 6),
  ('veb', 'Digital Assets for Landing Page', 'Upload up to 2 PDF files for the landing page (max 10MB each)', 7),
  ('veb', 'Speaker Full Name', 'Enter the speaker''s full name', 8),
  ('veb', 'Speaker Title', 'Enter the speaker''s title', 9),
  ('veb', 'Speaker Email', 'Enter the speaker''s email address', 10),
  ('veb', 'Speaker Headshot', 'Upload speaker headshot (JPG or PNG, max 5MB)', 11),
  ('veb', 'Session Title(s) and Abstract(s)', 'Enter the session titles and abstracts for your presentation(s)', 12);