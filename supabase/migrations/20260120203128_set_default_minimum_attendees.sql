/*
  # Set Default Minimum Attendees by Event Type

  1. Changes
    - Creates a function to return default minimum attendees based on event type
    - Updates existing sponsor_events records with NULL minimum_attendees to use defaults
    - Creates a trigger to automatically set defaults on INSERT when minimum_attendees is NULL

  2. Default Values
    - Forums: 60 attendees
    - VRTs (vrt): 8 attendees
    - Dinners: 8 attendees
    - Learn and Gos (learn_go): 8 attendees
    - Community Activations (activation): 30 attendees

  3. Notes
    - Function uses COALESCE to preserve explicitly set values
    - Trigger only fires when minimum_attendees is NULL
*/

-- Create function to get default minimum attendees based on event type
CREATE OR REPLACE FUNCTION get_default_minimum_attendees(event_type text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE event_type
    WHEN 'forum' THEN 60
    WHEN 'vrt' THEN 8
    WHEN 'dinner' THEN 8
    WHEN 'learn_go' THEN 8
    WHEN 'activation' THEN 30
    ELSE 8
  END;
END;
$$;

-- Update existing records with NULL minimum_attendees
UPDATE sponsor_events
SET minimum_attendees = get_default_minimum_attendees(event_type)
WHERE minimum_attendees IS NULL;

-- Create trigger function to set defaults on INSERT
CREATE OR REPLACE FUNCTION set_default_minimum_attendees()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.minimum_attendees IS NULL THEN
    NEW.minimum_attendees := get_default_minimum_attendees(NEW.event_type);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_default_minimum_attendees ON sponsor_events;
CREATE TRIGGER trigger_set_default_minimum_attendees
  BEFORE INSERT OR UPDATE ON sponsor_events
  FOR EACH ROW
  EXECUTE FUNCTION set_default_minimum_attendees();