// This will output SQL to stdout
const SPONSOR_ID = '6e048704-504b-474c-93bc-8c1e5feb265d';

function esc(str) {
  if (!str) return null;
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function q(val) {
  return val ? `'${esc(val)}'` : 'NULL';
}

// Generate INSERT VALUE for each attendee
function gen(a, eventName, eventDate) {
  const name = `${a['First Name'] || ''} ${a['Last Name'] || ''}`.trim();
  const notes = a.Linkedin ? `LinkedIn: ${a.Linkedin}` : null;
  return `(${q(SPONSOR_ID)}, ${q(name)}, ${q(a.Email)}, ${q(a.Cellphone)}, ${q(a.Company)}, ${q(a.Title)}, ${q(a.Status)}, ${q(eventName)}, 'forum', ${q(eventDate)}, 'commvault', ${q(notes)})`;
}

console.log('-- Attendees data count');
console.log('-- Will be populated by JavaScript');
