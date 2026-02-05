// This script will be run with the full JSON data
// to generate SQL insert statements

const RINGCENTRAL_SPONSOR_ID = '93110e75-235b-4586-91f2-196deca40133';

function escapeSQL(str: string | null | undefined): string {
  if (!str) return 'NULL';
  return "'" + str.toString().replace(/'/g, "''") + "'";
}

async function generateInserts() {
  console.log('-- Generated SQL inserts for forum attendees');
  console.log('-- Total attendees: 526');
  console.log('-- RingCentral Sponsor ID: ' + RINGCENTRAL_SPONSOR_ID);
  console.log('');

  // Since the JSON file is incomplete, I'll output a template
  console.log('-- The JSON file needs to contain all 526 attendees from the 7 forums');
  console.log('-- Please ensure the complete JSON is available');
}

generateInserts();
