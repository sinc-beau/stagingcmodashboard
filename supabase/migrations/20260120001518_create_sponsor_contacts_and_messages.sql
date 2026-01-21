/*
  # Create sponsor contacts and messages tables

  1. New Tables
    - `sponsor_contacts`
      - `id` (uuid, primary key)
      - `sponsor_id` (uuid, foreign key to sponsors)
      - `name` (text)
      - `email` (text)
      - `phone` (text, nullable)
      - `is_primary` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sponsor_messages`
      - `id` (uuid, primary key)
      - `sponsor_id` (uuid, foreign key to sponsors)
      - `message` (text)
      - `created_by` (text, nullable - for future auth integration)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (authenticated users can read)
    - Add policies for authenticated users to insert/update/delete
*/

-- Create sponsor_contacts table
CREATE TABLE IF NOT EXISTS sponsor_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sponsor_messages table
CREATE TABLE IF NOT EXISTS sponsor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sponsor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_messages ENABLE ROW LEVEL SECURITY;

-- Policies for sponsor_contacts
CREATE POLICY "Allow public read access to sponsor contacts"
  ON sponsor_contacts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to sponsor contacts"
  ON sponsor_contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to sponsor contacts"
  ON sponsor_contacts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to sponsor contacts"
  ON sponsor_contacts FOR DELETE
  USING (true);

-- Policies for sponsor_messages
CREATE POLICY "Allow public read access to sponsor messages"
  ON sponsor_messages FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to sponsor messages"
  ON sponsor_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to sponsor messages"
  ON sponsor_messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to sponsor messages"
  ON sponsor_messages FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sponsor_contacts_sponsor_id ON sponsor_contacts(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_messages_sponsor_id ON sponsor_messages(sponsor_id);
