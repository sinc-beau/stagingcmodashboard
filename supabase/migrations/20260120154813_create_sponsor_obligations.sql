/*
  # Create Sponsor Obligations System

  1. New Tables
    - `sponsor_obligations`
      - `id` (uuid, primary key)
      - `sponsor_id` (uuid, FK to sponsors)
      - `total_amount` (numeric) - total contract amount
      - `discount_amount` (numeric, nullable) - discount applied
      - `dinner_count` (integer) - number of dinner events
      - `learn_go_count` (integer) - number of learn & go events
      - `vrt_count` (integer) - number of VRT events
      - `veb_count` (integer) - number of VEB events
      - `forum_count` (integer) - number of forum events
      - `activation_count` (integer) - number of activation events
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, FK to auth.users) - admin/account manager who created it
  
  2. Calculated Fields
    - The UI will calculate total minimum engagements based on:
      - Dinner: 8 minimum
      - Learn & Go: 8 minimum
      - VRT: 8 minimum
      - VEB: 8 minimum
      - Forum: 60 minimum
      - Activation: 30 minimum

  3. Security
    - Enable RLS on sponsor_obligations table
    - Sponsors can read their own obligations
    - Only admins and account managers can create/update obligations
*/

-- Create sponsor_obligations table
CREATE TABLE IF NOT EXISTS sponsor_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  dinner_count integer NOT NULL DEFAULT 0,
  learn_go_count integer NOT NULL DEFAULT 0,
  vrt_count integer NOT NULL DEFAULT 0,
  veb_count integer NOT NULL DEFAULT 0,
  forum_count integer NOT NULL DEFAULT 0,
  activation_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE sponsor_obligations ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin or account manager
CREATE OR REPLACE FUNCTION is_admin_or_account_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sponsor_users
    WHERE id = auth.uid()
    AND role IN ('admin', 'account_manager')
    AND is_approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for sponsor_obligations
CREATE POLICY "Sponsors can view their own obligations"
  ON sponsor_obligations
  FOR SELECT
  TO authenticated
  USING (
    sponsor_id IN (
      SELECT sponsor_id FROM sponsor_users
      WHERE id = auth.uid()
    )
    OR is_admin_or_account_manager()
  );

CREATE POLICY "Admins and account managers can insert obligations"
  ON sponsor_obligations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_account_manager());

CREATE POLICY "Admins and account managers can update obligations"
  ON sponsor_obligations
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_account_manager())
  WITH CHECK (is_admin_or_account_manager());

CREATE POLICY "Admins and account managers can delete obligations"
  ON sponsor_obligations
  FOR DELETE
  TO authenticated
  USING (is_admin_or_account_manager());

-- Create index for sponsor lookups
CREATE INDEX IF NOT EXISTS sponsor_obligations_sponsor_id_idx ON sponsor_obligations(sponsor_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sponsor_obligations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sponsor_obligations_updated_at_trigger
BEFORE UPDATE ON sponsor_obligations
FOR EACH ROW
EXECUTE FUNCTION update_sponsor_obligations_updated_at();
