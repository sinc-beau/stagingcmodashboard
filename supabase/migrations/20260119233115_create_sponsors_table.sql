/*
  # Create sponsors table

  1. New Tables
    - `sponsors`
      - `id` (uuid, primary key) - Unique identifier for each sponsor
      - `name` (text, required) - Company/sponsor name
      - `url` (text) - Sponsor website URL
      - `business_description` (text) - Description of the sponsor's business
      - `poc_name` (text) - Point of contact name
      - `poc_email` (text) - Point of contact email
      - `poc_phone` (text) - Point of contact phone number
      - `sinc_rep` (text) - SINC representative name
      - `created_at` (timestamptz) - Timestamp when record was created
      - `updated_at` (timestamptz) - Timestamp when record was last updated

  2. Security
    - Enable RLS on `sponsors` table
    - Add policy for authenticated users to read all sponsors
    - Add policy for authenticated users to insert sponsors
    - Add policy for authenticated users to update sponsors
    - Add policy for authenticated users to delete sponsors

  3. Notes
    - POC fields are nullable as not all sponsors may have this information yet
    - Using timestamptz for proper timezone handling
*/

CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text,
  business_description text DEFAULT '',
  poc_name text,
  poc_email text,
  poc_phone text,
  sinc_rep text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all sponsors"
  ON sponsors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sponsors"
  ON sponsors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sponsors"
  ON sponsors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sponsors"
  ON sponsors
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();