/*
  # Update Intake Templates with File Upload Fields

  1. Changes
    - Add file upload fields for all event types
    - Remove PDF Logo LockUp field
    - Split speaker details to separate headshot
    - Add logo upload field
    - Add wishlist CSV and digital assets fields
    
  2. Field Types
    - Regular text fields: item_type = 'text'
    - File upload fields: item_type = 'file'
    - Multiple file upload: item_type = 'multi_file'
*/

-- Add item_type column to templates and items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'intake_item_templates' AND column_name = 'item_type'
  ) THEN
    ALTER TABLE intake_item_templates ADD COLUMN item_type text DEFAULT 'text';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_intake_items' AND column_name = 'item_type'
  ) THEN
    ALTER TABLE event_intake_items ADD COLUMN item_type text DEFAULT 'text';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'intake_item_templates' AND column_name = 'file_accept'
  ) THEN
    ALTER TABLE intake_item_templates ADD COLUMN file_accept text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'intake_item_templates' AND column_name = 'max_file_size_mb'
  ) THEN
    ALTER TABLE intake_item_templates ADD COLUMN max_file_size_mb integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'intake_item_templates' AND column_name = 'max_files'
  ) THEN
    ALTER TABLE intake_item_templates ADD COLUMN max_files integer DEFAULT 1;
  END IF;
END $$;

-- Delete old templates to rebuild with new structure
DELETE FROM intake_item_templates;

-- Forum event templates
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('forum', 'Company Name', 'Enter your company name as you would like it displayed', 1, 'text', NULL, NULL, 1),
('forum', 'Company Logo', 'Upload your company logo (PNG or JPG, max 5MB)', 2, 'file', 'image/png,image/jpeg', 5, 1),
('forum', 'Company URL', 'Enter your company website URL', 3, 'text', NULL, NULL, 1),
('forum', 'About Company', 'Provide a brief description of your company', 4, 'text', NULL, NULL, 1),
('forum', 'Wishlist CSV', 'Upload a CSV file containing your wishlist of attendees', 5, 'file', 'text/csv,.csv', 10, 1),
('forum', 'Digital Assets for Landing Page', 'Upload up to 2 digital assets (images, PDFs) for the landing page (max 10MB each)', 6, 'multi_file', 'image/*,.pdf', 10, 2),
('forum', 'Speaker Full Name', 'Enter the speaker''s full name', 7, 'text', NULL, NULL, 1),
('forum', 'Speaker Title', 'Enter the speaker''s title', 8, 'text', NULL, NULL, 1),
('forum', 'Speaker Email', 'Enter the speaker''s email address', 9, 'text', NULL, NULL, 1),
('forum', 'Speaker Headshot', 'Upload speaker headshot (JPG or PNG, max 5MB)', 10, 'file', 'image/jpeg,image/png', 5, 1);

-- VRT templates
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('vrt', 'Company Name', 'Enter your company name as you would like it displayed', 1, 'text', NULL, NULL, 1),
('vrt', 'Company Logo', 'Upload your company logo (PNG or JPG, max 5MB)', 2, 'file', 'image/png,image/jpeg', 5, 1),
('vrt', 'Company URL', 'Enter your company website URL', 3, 'text', NULL, NULL, 1),
('vrt', 'About Company', 'Provide a brief description of your company', 4, 'text', NULL, NULL, 1),
('vrt', 'Wishlist CSV', 'Upload a CSV file containing your wishlist of attendees', 5, 'file', 'text/csv,.csv', 10, 1),
('vrt', 'Digital Assets for Landing Page', 'Upload up to 2 digital assets (images, PDFs) for the landing page (max 10MB each)', 6, 'multi_file', 'image/*,.pdf', 10, 2),
('vrt', 'Speaker Full Name', 'Enter the speaker''s full name', 7, 'text', NULL, NULL, 1),
('vrt', 'Speaker Title', 'Enter the speaker''s title', 8, 'text', NULL, NULL, 1),
('vrt', 'Speaker Email', 'Enter the speaker''s email address', 9, 'text', NULL, NULL, 1),
('vrt', 'Speaker Headshot', 'Upload speaker headshot (JPG or PNG, max 5MB)', 10, 'file', 'image/jpeg,image/png', 5, 1);

-- Dinner templates
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('dinner', 'Company Name', 'Enter your company name as you would like it displayed', 1, 'text', NULL, NULL, 1),
('dinner', 'Company Logo', 'Upload your company logo (PNG or JPG, max 5MB)', 2, 'file', 'image/png,image/jpeg', 5, 1),
('dinner', 'Company URL', 'Enter your company website URL', 3, 'text', NULL, NULL, 1),
('dinner', 'About Company', 'Provide a brief description of your company', 4, 'text', NULL, NULL, 1),
('dinner', 'Wishlist CSV', 'Upload a CSV file containing your wishlist of attendees', 5, 'file', 'text/csv,.csv', 10, 1),
('dinner', 'Digital Assets for Landing Page', 'Upload up to 2 digital assets (images, PDFs) for the landing page (max 10MB each)', 6, 'multi_file', 'image/*,.pdf', 10, 2),
('dinner', 'Speaker Full Name', 'Enter the speaker''s full name', 7, 'text', NULL, NULL, 1),
('dinner', 'Speaker Title', 'Enter the speaker''s title', 8, 'text', NULL, NULL, 1),
('dinner', 'Speaker Email', 'Enter the speaker''s email address', 9, 'text', NULL, NULL, 1),
('dinner', 'Speaker Headshot', 'Upload speaker headshot (JPG or PNG, max 5MB)', 10, 'file', 'image/jpeg,image/png', 5, 1);

-- Learn & Go templates
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('learn_go', 'Company Name', 'Enter your company name as you would like it displayed', 1, 'text', NULL, NULL, 1),
('learn_go', 'Company Logo', 'Upload your company logo (PNG or JPG, max 5MB)', 2, 'file', 'image/png,image/jpeg', 5, 1),
('learn_go', 'Company URL', 'Enter your company website URL', 3, 'text', NULL, NULL, 1),
('learn_go', 'About Company', 'Provide a brief description of your company', 4, 'text', NULL, NULL, 1),
('learn_go', 'Wishlist CSV', 'Upload a CSV file containing your wishlist of attendees', 5, 'file', 'text/csv,.csv', 10, 1),
('learn_go', 'Digital Assets for Landing Page', 'Upload up to 2 digital assets (images, PDFs) for the landing page (max 10MB each)', 6, 'multi_file', 'image/*,.pdf', 10, 2),
('learn_go', 'Speaker Full Name', 'Enter the speaker''s full name', 7, 'text', NULL, NULL, 1),
('learn_go', 'Speaker Title', 'Enter the speaker''s title', 8, 'text', NULL, NULL, 1),
('learn_go', 'Speaker Email', 'Enter the speaker''s email address', 9, 'text', NULL, NULL, 1),
('learn_go', 'Speaker Headshot', 'Upload speaker headshot (JPG or PNG, max 5MB)', 10, 'file', 'image/jpeg,image/png', 5, 1);

-- Community Activation templates
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order, item_type, file_accept, max_file_size_mb, max_files) VALUES
('activation', 'Company Name', 'Enter your company name as you would like it displayed', 1, 'text', NULL, NULL, 1),
('activation', 'Company Logo', 'Upload your company logo (PNG or JPG, max 5MB)', 2, 'file', 'image/png,image/jpeg', 5, 1),
('activation', 'Company URL', 'Enter your company website URL', 3, 'text', NULL, NULL, 1),
('activation', 'About Company', 'Provide a brief description of your company', 4, 'text', NULL, NULL, 1),
('activation', 'Wishlist CSV', 'Upload a CSV file containing your wishlist of attendees', 5, 'file', 'text/csv,.csv', 10, 1),
('activation', 'Digital Assets for Landing Page', 'Upload up to 2 digital assets (images, PDFs) for the landing page (max 10MB each)', 6, 'multi_file', 'image/*,.pdf', 10, 2),
('activation', 'Speaker Full Name', 'Enter the speaker''s full name', 7, 'text', NULL, NULL, 1),
('activation', 'Speaker Title', 'Enter the speaker''s title', 8, 'text', NULL, NULL, 1),
('activation', 'Speaker Email', 'Enter the speaker''s email address', 9, 'text', NULL, NULL, 1),
('activation', 'Speaker Headshot', 'Upload speaker headshot (JPG or PNG, max 5MB)', 10, 'file', 'image/jpeg,image/png', 5, 1);