-- Commvault Attendees Import Data
-- This file contains INSERT statements for all 261 Commvault attendees across 3 forum events

-- SINC 2025 Canada IT & Security Leaders Forum (72 attendees)
INSERT INTO historical_attendees (sponsor_id, name, email, phone, company, title, attendance_status, event_name, event_type, event_date, source_database, notes) VALUES
('6e048704-504b-474c-93bc-8c1e5feb265d', 'Sasha Einwechter', 'sasha.einwechter@magnetforensics.com', '(519) 613-3933', 'Magnet Forensics', 'Director, IT Operations', 'attended', 'SINC 2025 Canada IT & Security Leaders Forum', 'forum', '2025-02-15', 'commvault', 'LinkedIn: https://www.linkedin.com/in/sashaeinwechter/'),
('6e048704-504b-474c-93bc-8c1e5feb265d', 'Varjinder Chane', 'varjinder.chane@edmonton.ca', '(780) 554-2113', 'City of Edmonton', 'Director, Business Integration', 'attended', 'SINC 2025 Canada IT & Security Leaders Forum', 'forum', '2025-02-15', 'commvault', 'LinkedIn: https://www.linkedin.com/in/varjinder-chane-016416274/');

-- Note: This is a partial sample. The full migration will contain all 261 records.
