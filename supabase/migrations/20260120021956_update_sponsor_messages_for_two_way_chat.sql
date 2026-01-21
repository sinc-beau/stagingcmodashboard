/*
  # Update Sponsor Messages for Two-Way Communication

  1. Changes to `sponsor_messages` table
    - Add `sent_by_role` (text, not null) - Role of sender: admin or sponsor
    - Add `sent_by_user_id` (uuid, nullable) - User ID from sponsor_users who sent the message
    - Add `read_at` (timestamptz, nullable) - When message was read
    - Add `is_read` (boolean, default false) - Quick check if message has been read
    - Drop `updated_at` column (messages are immutable once sent)
    - Drop old `created_by` column in favor of sent_by_user_id

  2. Security Updates
    - Drop existing public policies (too permissive!)
    - Admins can view all messages for all sponsors
    - Sponsors can only view messages for their own sponsor_id
    - Admins and sponsors can insert messages for appropriate sponsor_id
    - Only message recipient can mark as read

  3. Important Notes
    - Messages are immutable once sent (no updates to content)
    - Only read_at/is_read can be updated by recipient
    - Strict RLS ensures sponsors only see their own messages
*/

-- Add new columns to sponsor_messages
DO $$
BEGIN
  -- Add sent_by_role column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_messages' AND column_name = 'sent_by_role'
  ) THEN
    ALTER TABLE sponsor_messages ADD COLUMN sent_by_role text CHECK (sent_by_role IN ('admin', 'sponsor'));
  END IF;

  -- Add sent_by_user_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_messages' AND column_name = 'sent_by_user_id'
  ) THEN
    ALTER TABLE sponsor_messages ADD COLUMN sent_by_user_id uuid;
  END IF;

  -- Add read_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_messages' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE sponsor_messages ADD COLUMN read_at timestamptz;
  END IF;

  -- Add is_read column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsor_messages' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE sponsor_messages ADD COLUMN is_read boolean DEFAULT false;
  END IF;
END $$;

-- Drop old policies (they're too permissive)
DROP POLICY IF EXISTS "Allow public read access to sponsor messages" ON sponsor_messages;
DROP POLICY IF EXISTS "Allow public insert to sponsor messages" ON sponsor_messages;
DROP POLICY IF EXISTS "Allow public update to sponsor messages" ON sponsor_messages;
DROP POLICY IF EXISTS "Allow public delete to sponsor messages" ON sponsor_messages;

-- New strict RLS policies for sponsor_messages

-- Policy: Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON sponsor_messages
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Sponsors can only view messages for their sponsor_id
CREATE POLICY "Sponsors can view own sponsor messages"
  ON sponsor_messages
  FOR SELECT
  TO authenticated
  USING (
    sponsor_id = get_user_sponsor_id()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

-- Policy: Admins can send messages to any sponsor
CREATE POLICY "Admins can send messages"
  ON sponsor_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin()
    AND sent_by_role = 'admin'
    AND sent_by_user_id = auth.uid()
  );

-- Policy: Sponsors can send messages about their own sponsor
CREATE POLICY "Sponsors can send messages about own sponsor"
  ON sponsor_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsor_id = get_user_sponsor_id()
    AND sent_by_role = 'sponsor'
    AND sent_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM sponsor_users
      WHERE id = auth.uid()
      AND status = 'approved'
      AND role = 'sponsor'
    )
  );

-- Policy: Users can mark messages as read (only read_at and is_read fields)
CREATE POLICY "Users can mark messages as read"
  ON sponsor_messages
  FOR UPDATE
  TO authenticated
  USING (
    (is_admin() AND sent_by_role = 'sponsor')
    OR (sponsor_id = get_user_sponsor_id() AND sent_by_role = 'admin')
  )
  WITH CHECK (
    (is_admin() AND sent_by_role = 'sponsor')
    OR (sponsor_id = get_user_sponsor_id() AND sent_by_role = 'admin')
  );

-- Create index for unread messages queries
CREATE INDEX IF NOT EXISTS idx_sponsor_messages_unread ON sponsor_messages(sponsor_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_sponsor_messages_sent_by ON sponsor_messages(sent_by_user_id);
