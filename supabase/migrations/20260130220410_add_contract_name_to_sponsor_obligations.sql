/*
  # Add Contract Name to Sponsor Obligations

  1. Changes
    - Add `contract_name` column to `sponsor_obligations` table
      - Type: text (NOT NULL)
      - Default: 'CONTRACT NAME'
      - Required field to identify each obligation by name
  
  2. Data Migration
    - Set all existing obligations to 'CONTRACT NAME' as default
    - Ensures existing records display properly without breaking
  
  3. Notes
    - This field is required to improve obligation identification
    - Users can update the placeholder 'CONTRACT NAME' to meaningful names
    - Makes it easier to distinguish between different contracts at a glance
*/

-- Add contract_name column with default value
ALTER TABLE sponsor_obligations 
ADD COLUMN IF NOT EXISTS contract_name text NOT NULL DEFAULT 'CONTRACT NAME';
