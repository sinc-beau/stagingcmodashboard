#!/bin/bash

# Create migration with header
cat > ringcentral-import-migration.sql << 'EOF'
/*
  # Import RingCentral Historical Leads

  1. Changes
    - Import 525 historical lead records for RingCentral sponsor
    - Covers 27 events from January 2025 through November 2025
    - Includes virtual roundtables and dinner events across multiple cities

  2. Data
    - Event types: vRT (virtual roundtables), Dinner (in-person dinners)
    - Status values: Attended, Cancelled, Declined by client, Waitlisted
    - All records linked to placeholder event ID for historical data

  3. Purpose
    - Provide sponsors access to historical attendee data
    - Support lead tracking and relationship management
    - Enable filtering and analysis of past event participation
*/

EOF

# Append all SQL inserts
cat ringcentral-import-all.sql >> ringcentral-import-migration.sql

echo "Migration file created: ringcentral-import-migration.sql"
wc -l ringcentral-import-migration.sql
