/*
  # Add Company Information to Templates

  1. Changes
    - Add company_name, company_url, and company_about columns to intake_form_templates
    - Add company_name, company_url, and company_about columns to target_profile_templates
    
  2. Purpose
    - Allow templates to auto-populate with sponsor company information
    - Templates will remember company details for easier reuse
*/

ALTER TABLE intake_form_templates
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_url text,
ADD COLUMN IF NOT EXISTS company_about text;

ALTER TABLE target_profile_templates
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_url text,
ADD COLUMN IF NOT EXISTS company_about text;