/*
  # Fix File Upload Types for Forum Events

  This migration corrects intake item types for forum events where file uploads
  should be used but text fields were created instead.

  ## Changes
  
  1. Updates item_type and item_description for file upload fields:
     - Company Logo: text → file
     - Wishlist CSV: text → file
     - Speaker Headshot: text → file
     - Digital Assets for Landing Page: text → multi_file

  2. Only updates forum events where these items exist as text type

  ## Safety
  
  - Only updates existing records, doesn't create new ones
  - Preserves all other data (completed status, notes, etc.)
  - Only affects forum event intake items
*/

-- Update Company Logo to file type
UPDATE event_intake_items
SET 
  item_type = 'file',
  item_description = 'Upload your company logo (high resolution, transparent background preferred)',
  updated_at = NOW()
WHERE event_type = 'forum'
  AND item_label = 'Company Logo'
  AND item_type = 'text';

-- Update Wishlist CSV to file type
UPDATE event_intake_items
SET 
  item_type = 'file',
  item_description = 'Upload a CSV file with your target attendee wishlist (include columns: company, title, location)',
  updated_at = NOW()
WHERE event_type = 'forum'
  AND item_label = 'Wishlist CSV'
  AND item_type = 'text';

-- Update Digital Assets for Landing Page to multi_file type
UPDATE event_intake_items
SET 
  item_type = 'multi_file',
  item_description = 'Upload digital assets (PDFs, images, videos) to be featured on your landing page',
  updated_at = NOW()
WHERE event_type = 'forum'
  AND item_label = 'Digital Assets for Landing Page'
  AND item_type = 'text';

-- Update Speaker Headshot to file type
UPDATE event_intake_items
SET 
  item_type = 'file',
  item_description = 'Upload a professional headshot of your speaker (high resolution, 1:1 aspect ratio preferred)',
  updated_at = NOW()
WHERE event_type = 'forum'
  AND item_label = 'Speaker Headshot'
  AND item_type = 'text';
