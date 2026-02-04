#!/bin/bash

echo "Starting import of RingCentral historical leads..."
echo ""

total=0
success=0
errors=0

for file in rc-batch-*; do
  count=$(grep -c "INSERT INTO" "$file")
  total=$((total + count))
  echo "Processing $file ($count records)..."

  # Read the file contents
  sql=$(cat "$file")

  # The actual execution will be done via the MCP tool in another script
  # For now just count
  success=$((success + count))
done

echo ""
echo "=== Summary ==="
echo "Total batches: $(ls rc-batch-* | wc -l)"
echo "Total records to import: $total"
echo "Ready to execute"
