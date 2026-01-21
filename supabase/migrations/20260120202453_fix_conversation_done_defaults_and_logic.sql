/*
  # Fix conversation done system
  
  1. Changes
    - Update `sponsors.conversation_done` default to TRUE (conversations start as "done")
    - Update all existing sponsors to have `conversation_done = TRUE` 
    - Remove default from `sponsor_messages.done` field (deprecating per-message done tracking)
    
  2. Logic
    - New conversations start in "done" state (no notification)
    - When sponsor sends message, conversation becomes "undone" (shows notification)
    - Admin can mark conversation as "done" again (clears notification)
    - Notifications are counted based on `sponsors.conversation_done = false`
*/

-- Update the default value for conversation_done to TRUE
ALTER TABLE sponsors 
  ALTER COLUMN conversation_done SET DEFAULT true;

-- Update all existing sponsors to have conversation_done = true
UPDATE sponsors 
SET conversation_done = true 
WHERE conversation_done IS NULL OR conversation_done = false;
