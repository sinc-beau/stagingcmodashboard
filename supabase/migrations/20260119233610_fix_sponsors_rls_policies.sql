/*
  # Fix RLS policies for sponsors table

  1. Changes
    - Drop existing restrictive policies that require authentication
    - Add new policies that allow anon access for all operations
    - This enables the platform to work without authentication setup

  2. Security Notes
    - These policies allow anonymous access for development
    - Consider adding authentication and more restrictive policies for production
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view all sponsors" ON sponsors;
DROP POLICY IF EXISTS "Authenticated users can insert sponsors" ON sponsors;
DROP POLICY IF EXISTS "Authenticated users can update sponsors" ON sponsors;
DROP POLICY IF EXISTS "Authenticated users can delete sponsors" ON sponsors;

-- Create new policies that allow anon access
CREATE POLICY "Allow anon to view all sponsors"
  ON sponsors
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert sponsors"
  ON sponsors
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update sponsors"
  ON sponsors
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete sponsors"
  ON sponsors
  FOR DELETE
  TO anon
  USING (true);