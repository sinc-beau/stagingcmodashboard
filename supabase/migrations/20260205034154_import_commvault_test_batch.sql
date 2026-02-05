/*
  # Test Import Commvault Historical Attendees (First 5 records)

  1. Summary
    - Test import of 5 Commvault historical attendees
    - Tests RLS permissions for bulk insert

  2. Details
    - Sponsor: Commvault (6e048704-504b-474c-93bc-8c1e5feb265d)
    - Using security definer function to bypass RLS
*/

-- Temporary function to insert historical attendees with elevated privileges
CREATE OR REPLACE FUNCTION insert_commvault_attendees()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO historical_attendees (sponsor_id, name, email, phone, company, title, attendance_status, event_name, event_type, event_date, source_database, notes)
  VALUES
    ('6e048704-504b-474c-93bc-8c1e5feb265d', 'Sasha Einwechter', 'sasha.einwechter@magnetforensics.com', '(519) 613-3933', 'Magnet Forensics', 'Director, IT Operations', 'attended', 'SINC 2025 Canada IT & Security Leaders Forum', 'forum', '2025-02-15', 'commvault', 'LinkedIn: https://www.linkedin.com/in/sashaeinwechter/'),
    ('6e048704-504b-474c-93bc-8c1e5feb265d', 'Varjinder Chane', 'varjinder.chane@edmonton.ca', '(780) 554-2113', 'City of Edmonton', 'Director, Business Integration', 'attended', 'SINC 2025 Canada IT & Security Leaders Forum', 'forum', '2025-02-15', 'commvault', 'LinkedIn: https://www.linkedin.com/in/varjinder-chane-016416274/'),
    ('6e048704-504b-474c-93bc-8c1e5feb265d', 'Sylvie Martineau', 'sylvie.martineau@hema-quebec.qc.ca', '(514) 213-6414', 'Hema Quebec', 'IT Senior Director Enterprise Applications, Development and Analytics', 'attended', 'SINC 2025 Canada IT & Security Leaders Forum', 'forum', '2025-02-15', 'commvault', 'LinkedIn: https://www.linkedin.com/in/sylvie-martineau-192224/'),
    ('6e048704-504b-474c-93bc-8c1e5feb265d', 'Lia Sana', 'lia.sana@fraserhealth.ca', '(604) 613-9472', 'Fraser Health Authority', 'Director, Information Security', 'attended', 'SINC 2025 Canada IT & Security Leaders Forum', 'forum', '2025-02-15', 'commvault', 'LinkedIn: https://www.linkedin.com/in/lia-sana/'),
    ('6e048704-504b-474c-93bc-8c1e5feb265d', 'Shreyans Sethia', 'shreyans.sethia@td.com', '(437) 869-5473', 'TD', 'AVP, Technology Delivery for Digital Customer Channels', 'attended', 'SINC 2025 Canada IT & Security Leaders Forum', 'forum', '2025-02-15', 'commvault', 'LinkedIn: https://www.linkedin.com/in/shreyans-sethia-02091984/');
END;
$$;

-- Execute the function
SELECT insert_commvault_attendees();

-- Drop the function after use
DROP FUNCTION insert_commvault_attendees();
