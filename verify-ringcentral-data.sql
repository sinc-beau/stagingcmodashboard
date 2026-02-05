-- Verification script for RingCentral historical leads
-- Run this to confirm all data is present

-- Total summary
SELECT
  'TOTAL' as category,
  COUNT(DISTINCT historical_event_name)::text as events,
  COUNT(*)::text as leads,
  COUNT(*) FILTER (WHERE attendance_status = 'attended')::text as attended,
  COUNT(*) FILTER (WHERE attendance_status = 'no_show')::text as cancelled
FROM sponsor_leads
WHERE sponsor_id = 'f050a185-e395-489e-a46d-83e21e1efa0a'
  AND is_historical = true

UNION ALL

-- Breakdown by type
SELECT
  historical_event_type,
  COUNT(DISTINCT historical_event_name)::text,
  COUNT(*)::text,
  COUNT(*) FILTER (WHERE attendance_status = 'attended')::text,
  COUNT(*) FILTER (WHERE attendance_status = 'no_show')::text
FROM sponsor_leads
WHERE sponsor_id = 'f050a185-e395-489e-a46d-83e21e1efa0a'
  AND is_historical = true
GROUP BY historical_event_type
ORDER BY category;

-- List all events with counts
SELECT
  ROW_NUMBER() OVER (ORDER BY historical_event_type, historical_event_name) as num,
  historical_event_type as type,
  historical_event_name as event,
  historical_event_date as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE attendance_status = 'attended') as attended
FROM sponsor_leads
WHERE sponsor_id = 'f050a185-e395-489e-a46d-83e21e1efa0a'
  AND is_historical = true
GROUP BY historical_event_type, historical_event_name, historical_event_date
ORDER BY type, event;
