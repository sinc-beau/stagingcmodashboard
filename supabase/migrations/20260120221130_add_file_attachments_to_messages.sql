/*
  # Add File Attachments to Messages

  1. Changes
    - Add `file_url` column to `sponsor_messages` table for single file attachments
    - Add `file_name` column to store the original filename
    - Add `file_type` column to store the MIME type

  2. Notes
    - Supports images (png, jpg) and PDF files
    - Files will be stored in Supabase Storage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_messages' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE sponsor_messages ADD COLUMN file_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_messages' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE sponsor_messages ADD COLUMN file_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_messages' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE sponsor_messages ADD COLUMN file_type text;
  END IF;
END $$;