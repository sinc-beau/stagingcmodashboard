/*
  # Create Intake Checklist System

  1. New Tables
    - `intake_item_templates`
      - Stores template checklist items for each event type
      - `id` (uuid, primary key)
      - `event_type` (text) - 'dinner', 'learn_go', 'vrt', 'veb', 'forum', 'activation'
      - `item_label` (text) - the label for the checklist item
      - `item_description` (text, nullable) - additional details/instructions
      - `display_order` (int) - order to display items
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `event_intake_items`
      - Stores actual checklist items for each sponsor event
      - `id` (uuid, primary key)
      - `sponsor_id` (uuid, FK to sponsors)
      - `event_id` (text) - the identifier from external events
      - `event_name` (text) - name of the event for display
      - `event_type` (text) - 'dinner', 'learn_go', 'vrt', 'veb', 'forum', 'activation'
      - `item_label` (text)
      - `item_description` (text, nullable)
      - `is_completed` (boolean)
      - `completed_at` (timestamptz, nullable)
      - `notes` (text, nullable) - for additional context
      - `display_order` (int)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow public read access (unauthenticated users can view)
    - Allow public write access (for external forms to update)

  3. Initial Data
    - Populate intake_item_templates with default items for each event type
*/

-- Create intake_item_templates table
CREATE TABLE IF NOT EXISTS intake_item_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  item_label text NOT NULL,
  item_description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_intake_items table
CREATE TABLE IF NOT EXISTS event_intake_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES sponsors(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  event_name text NOT NULL,
  event_type text NOT NULL,
  item_label text NOT NULL,
  item_description text,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  notes text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE intake_item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_intake_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intake_item_templates
CREATE POLICY "Allow public read access to intake templates"
  ON intake_item_templates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to intake templates"
  ON intake_item_templates
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to intake templates"
  ON intake_item_templates
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for event_intake_items
CREATE POLICY "Allow public read access to intake items"
  ON event_intake_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to intake items"
  ON event_intake_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to intake items"
  ON event_intake_items
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to intake items"
  ON event_intake_items
  FOR DELETE
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS intake_item_templates_event_type_idx ON intake_item_templates(event_type);
CREATE INDEX IF NOT EXISTS event_intake_items_sponsor_id_idx ON event_intake_items(sponsor_id);
CREATE INDEX IF NOT EXISTS event_intake_items_event_id_idx ON event_intake_items(event_id);

-- Insert default templates for Dinner & Learn and Go (and Activations)
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order) VALUES
  ('dinner', 'Company Name', NULL, 1),
  ('dinner', 'URL', NULL, 2),
  ('dinner', 'About (150 words or less)', 'Description of the company', 3),
  ('dinner', 'Point of Contact(s)', 'Name, Phone, Email', 4),
  ('dinner', 'CSV of wishlist upload', NULL, 5),
  ('dinner', 'PDF upload of Logo LockUp', NULL, 6),
  ('dinner', 'ICP Description', NULL, 7),
  ('dinner', 'Confirmation of the City & Date', NULL, 8),
  ('dinner', 'Content - Topic and 150-word synopsis', 'Please send over your title and synopsis, my team will create the landing page and I will send it back to you for your review and approval.', 9),
  ('dinner', 'Details of up to 4 Reps to attend', 'Full name, title, email, and phone number (We don''t need this right away, just as we get closer to the event)', 10);

INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order) VALUES
  ('learn_go', 'Company Name', NULL, 1),
  ('learn_go', 'URL', NULL, 2),
  ('learn_go', 'About (150 words or less)', 'Description of the company', 3),
  ('learn_go', 'Point of Contact(s)', 'Name, Phone, Email', 4),
  ('learn_go', 'CSV of wishlist upload', NULL, 5),
  ('learn_go', 'PDF upload of Logo LockUp', NULL, 6),
  ('learn_go', 'ICP Description', NULL, 7),
  ('learn_go', 'Confirmation of the City & Date', NULL, 8),
  ('learn_go', 'Content - Topic and 150-word synopsis', 'Please send over your title and synopsis, my team will create the landing page and I will send it back to you for your review and approval.', 9),
  ('learn_go', 'Details of up to 4 Reps to attend', 'Full name, title, email, and phone number (We don''t need this right away, just as we get closer to the event)', 10);

INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order) VALUES
  ('activation', 'Company Name', NULL, 1),
  ('activation', 'URL', NULL, 2),
  ('activation', 'About (150 words or less)', 'Description of the company', 3),
  ('activation', 'Point of Contact(s)', 'Name, Phone, Email', 4),
  ('activation', 'CSV of wishlist upload', NULL, 5),
  ('activation', 'PDF upload of Logo LockUp', NULL, 6),
  ('activation', 'ICP Description', NULL, 7),
  ('activation', 'Confirmation of the City & Date', NULL, 8),
  ('activation', 'Content - Topic and 150-word synopsis', 'Please send over your title and synopsis, my team will create the landing page and I will send it back to you for your review and approval.', 9),
  ('activation', 'Details of up to 4 Reps to attend', 'Full name, title, email, and phone number (We don''t need this right away, just as we get closer to the event)', 10);

-- Insert default templates for VRT & VEB
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order) VALUES
  ('vrt', 'Company Name', NULL, 1),
  ('vrt', 'URL', NULL, 2),
  ('vrt', 'About (150 words or less)', 'Description of the company', 3),
  ('vrt', 'Point of Contact(s)', 'Name, Phone, Email', 4),
  ('vrt', 'CSV of wishlist upload', NULL, 5),
  ('vrt', 'PDF upload of Logo LockUp', NULL, 6),
  ('vrt', 'ICP Description', NULL, 7),
  ('vrt', 'Confirmation of the Date & Time', NULL, 8),
  ('vrt', 'Content - Topic and 150-word synopsis', 'Please send over your title and synopsis, my team will create the landing page and I will send it back to you for your review and approval.', 9),
  ('vrt', 'Confirmation of the speaker/reps', NULL, 10);

INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order) VALUES
  ('veb', 'Company Name', NULL, 1),
  ('veb', 'URL', NULL, 2),
  ('veb', 'About (150 words or less)', 'Description of the company', 3),
  ('veb', 'Point of Contact(s)', 'Name, Phone, Email', 4),
  ('veb', 'CSV of wishlist upload', NULL, 5),
  ('veb', 'PDF upload of Logo LockUp', NULL, 6),
  ('veb', 'ICP Description', NULL, 7),
  ('veb', 'Confirmation of the Date & Time', NULL, 8),
  ('veb', 'Content - Topic and 150-word synopsis', 'Please send over your title and synopsis, my team will create the landing page and I will send it back to you for your review and approval.', 9),
  ('veb', 'Confirmation of the speaker/reps', NULL, 10);

-- Insert default templates for Forum
INSERT INTO intake_item_templates (event_type, item_label, item_description, display_order) VALUES
  ('forum', 'Company Name', NULL, 1),
  ('forum', 'URL', NULL, 2),
  ('forum', 'About (150 words or less)', 'Description of the company', 3),
  ('forum', 'Point of Contact(s)', 'Name, Phone, Email', 4),
  ('forum', 'CSV of wishlist upload', NULL, 5),
  ('forum', 'PDF upload of Logo LockUp', NULL, 6),
  ('forum', 'ICP Description', NULL, 7),
  ('forum', 'Option to provide (2) digital assets for the landing page', NULL, 8),
  ('forum', 'Presentation title and synopsis for agenda', NULL, 9),
  ('forum', 'Speaker details', 'Full name, title, email address, and headshot', 10),
  ('forum', 'Details of the (2) representatives to attend', 'Full Name, Title, Email Address, Cell Phone, Arrival/Departure Date & Time', 11),
  ('forum', 'Confirmation on branded item for welcome bags', NULL, 12),
  ('forum', 'Confirmation on prize for Monday night raffle', '$100-$200 value', 13),
  ('forum', 'Scheduling of the pre-event call', 'Schedule for the week prior to the event', 14),
  ('forum', 'Scheduling of the post-event call', 'Schedule for the week following the event', 15);
