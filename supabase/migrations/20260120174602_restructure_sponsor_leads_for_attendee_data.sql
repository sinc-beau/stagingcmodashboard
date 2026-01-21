/*
  # Restructure sponsor_leads table to properly store attendee data

  1. Changes to sponsor_leads table
    - Add first_name and last_name columns (split from name)
    - Add alternative_email column (Email 2)
    - Rename phone to register_number
    - Add alternative_number column (Phone 2)
    - Add wishlist column
    - Rename approval_status to attendance_status with proper check constraint
    - Add no_show_reason column
    - Add lead_status column (for sponsor's internal workflow: 'new', 'contacted', 'qualified', 'converted', 'rejected')
    
  2. Data Migration
    - Split existing name data into first_name and last_name where possible
    - Rename phone column to register_number
    - Move approval_status data to attendance_status
    
  3. Notes
    - The stage field remains for sales pipeline tracking
    - The notes field remains for sponsor's private notes
    - The lead_status field is for sponsor's internal lead management workflow
    - The attendance_status field is the source data from the event (pending/attended/no_show)
*/

-- Add new columns
ALTER TABLE sponsor_leads
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS alternative_email text,
  ADD COLUMN IF NOT EXISTS register_number text,
  ADD COLUMN IF NOT EXISTS alternative_number text,
  ADD COLUMN IF NOT EXISTS wishlist text,
  ADD COLUMN IF NOT EXISTS attendance_status text CHECK (attendance_status IN ('pending', 'attended', 'no_show')),
  ADD COLUMN IF NOT EXISTS no_show_reason text,
  ADD COLUMN IF NOT EXISTS lead_status text CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')) DEFAULT 'new';

-- Migrate existing phone data to register_number
UPDATE sponsor_leads
SET register_number = phone
WHERE phone IS NOT NULL AND register_number IS NULL;

-- Migrate existing approval_status to attendance_status where it matches valid values
UPDATE sponsor_leads
SET attendance_status = CASE 
  WHEN approval_status IN ('pending', 'attended', 'no_show') THEN approval_status
  ELSE 'attended'
END
WHERE attendance_status IS NULL;

-- Split name into first_name and last_name (simple split on first space)
UPDATE sponsor_leads
SET 
  first_name = CASE 
    WHEN position(' ' in name) > 0 THEN substring(name from 1 for position(' ' in name) - 1)
    ELSE name
  END,
  last_name = CASE 
    WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL;

-- Drop the old approval_status column as it's been migrated to attendance_status
ALTER TABLE sponsor_leads DROP COLUMN IF EXISTS approval_status;

-- We'll keep the phone column for backward compatibility but new syncs should use register_number
-- Future syncs will populate register_number instead

-- Create index on attendance_status for filtering
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_attendance_status ON sponsor_leads(attendance_status);
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_lead_status ON sponsor_leads(lead_status);