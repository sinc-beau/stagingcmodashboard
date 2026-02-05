-- Import all RingCentral virtual dinners and events to historical leads
-- This script processes all attendees from various vRT and Dinner events

DO $$
DECLARE
  events_json jsonb := '[
  {
    "event_name": "Discover the Future of AI in the Workplace: An Exclusive Virtual Roundtable on the State of AI in Communications (Session 2)",
    "event_type": "vRT",
    "event_date": "2025-01-22",
    "attendees": [
      {"name": "Marc Burckin", "email": "marc.burckin@docusign.com", "phone": "(925) 351-6023", "company": "Docusign", "title": "VP, Customer Support", "status": "Attended"},
      {"name": "Jason Frame", "email": "frame@snhd.org", "phone": "(702) 759-1641", "company": "Southern Nevada Health District", "title": "Cheif Information Officer", "status": "Attended"},
      {"name": "Deron Helgren", "email": "deron.helgren@pacden.com", "phone": "(214) 263-0037", "company": "Pacific Dental", "title": "Director, IT Enterprise Operations", "status": "Attended"},
      {"name": "Ajay Chandramouly", "email": "ajay.chandramouly@oracle.com", "phone": "(650) 350-1198", "company": "Oracle", "title": "VP, Applications", "status": "Attended"},
      {"name": "Shahid Jamal", "email": "sjamal2@mmm.com", "phone": "(507) 261-2642", "company": "3M", "title": "Director | IT Solutions & Architecture (Global Security)", "status": "Attended"},
      {"name": "Dave Burton", "email": "daveburton@fico.com", "phone": "(512) 750-0625", "company": "FICO", "title": "Director Market Leading Technologies", "status": "Attended"},
      {"name": "Dan Hunziker", "email": "dhunziker@mistercarwash.com", "phone": "(503) 899-7110", "company": "Mister Car Wash", "title": "IT Manager", "status": "Attended"},
      {"name": "Kristen Ritter", "email": "kristen.ritter@merkle.com", "phone": "(443) 280-1815", "company": "Merkle Inc", "title": "Sr Manager BSA", "status": "Attended"},
      {"name": "Dennis Wang", "email": "dennis.wang@ul.com", "phone": "(773) 350-4952", "company": "UL Solutions", "title": "Director Enterprise Integration & Content Mgmt Platforms", "status": "Attended"},
      {"name": "Arvind Sahu", "email": "asahu@crayola.com", "phone": "(484) 545-2172", "company": "Crayola Inc", "title": "CIO", "status": "Attended"},
      {"name": "Tom Landsness", "email": "tom.landsness@ja.org", "phone": "(719) 338-8464", "company": "Junior Achievement USA", "title": "VP of Infrastructure & Service Management", "status": "Attended"},
      {"name": "Jerrold Feigenbaum", "email": "jerrold.feigenbaum@terumobct.com", "phone": "(720) 431-3980", "company": "Terumo BCT", "title": "Sr. Manager Network and Telecom", "status": "Attended"},
      {"name": "David Beay", "email": "davidb@alto-shaam.com", "phone": "(262) 327-2174", "company": "Alto-Shaam", "title": "Call Center Manager", "status": "Cancelled"},
      {"name": "Paul Licata", "email": "paul.licata@foundever.com", "phone": "(716) 606-9932", "company": "Foundever", "title": "IT Director", "status": "Cancelled"},
      {"name": "Chris Fluegge", "email": "cfluegge@geminigroup.net", "phone": "(989) 453-2174", "company": "Gemini Group, Inc", "title": "CIO", "status": "Cancelled"},
      {"name": "Reema Anwar", "email": "reema.anwar@pattersoncompanies.com", "phone": "(612) 396-8303", "company": "Patterson Companies", "title": "Director, IT Sourcing", "status": "Cancelled"},
      {"name": "Jane Mazur", "email": "jane.mazur@merkle.com", "phone": "(215) 317-6294", "company": "Merkle", "title": "BSA, Director", "status": "Cancelled"},
      {"name": "Steve Hannah", "email": "shannah@polsinelli.com", "phone": "(816) 360-4190", "company": "Polsinelli LLC", "title": "Director of Information Security", "status": "Cancelled"},
      {"name": "Sanjeev Hasiza", "email": "sanjeev.hasiza@jci.com", "phone": "(312) 964-1256", "company": "Johnson Controls", "title": "Head of Software Development & Architecture", "status": "Cancelled"}
    ]
  },
  {
    "event_name": "Shaping the Future of AI in Banking and Credit Unions: An Exclusive Virtual Roundtable on AI''s Impact in Financial Services",
    "event_type": "vRT",
    "event_date": "2025-02-26",
    "attendees": [
      {"name": "Chris Echezabal", "email": "chris_echezabal@navyfederal.org", "phone": "(561) 629-3274", "company": "Navy Federal Credit Union", "title": "AVP, Analytics Data & Technology", "status": "Attended"},
      {"name": "Ken Viciana", "email": "kviciana@tsys.com", "phone": "(770) 616-3359", "company": "TSYS", "title": "VP", "status": "Attended"},
      {"name": "Daniel Burkard", "email": "security@outdoorsco.com", "phone": "(720) 515-9179", "company": "Premier Members Credit Union", "title": "VP of InfoSec", "status": "Attended"},
      {"name": "Borris Natkovitch", "email": "boris.natkovitch@bofa.com", "phone": "(917) 208-6811", "company": "Bank of America", "title": "Director of IT", "status": "Attended"},
      {"name": "CK Taneja", "email": "ck.taneja@ntrs.com", "phone": "(646) 286-5968", "company": "Northern Trust", "title": "SVP Transformation", "status": "Attended"},
      {"name": "Srikanth Gubba", "email": "sgubba@dtcc.com", "phone": "(551) 777-1877", "company": "DTCC", "title": "Associate Director", "status": "Attended"},
      {"name": "Susheel Bhat", "email": "susheelbhat@gmail.com", "phone": "(586) 362-7993", "company": "Fifth Third Bank", "title": "Sr. IT Manager", "status": "Attended"},
      {"name": "Janak Shah", "email": "janak.shah@pjtpartners.com", "phone": "(201) 563-4701", "company": "PJT Partners", "title": "Senior Vice President of Enterprise Data & Strategic Analytics", "status": "Attended"},
      {"name": "Andrey Raransky", "email": "andrey.raransky@scotiabank.com", "phone": "(416) 568-9125", "company": "Scotiabank", "title": "Senior Manager, Global Security Services", "status": "Attended"},
      {"name": "Laura Kohl", "email": "laura.kohl@morningstar.com", "phone": "(630) 294-4502", "company": "Morningstar", "title": "CIO", "status": "Attended"},
      {"name": "Jonathan Kennedy", "email": "jonathan.kennedy@getevolved.com", "phone": "(901) 260-1446", "company": "Evolve Bank and Trust", "title": "Telecommunications Engineer", "status": "Attended"},
      {"name": "Carlington Bucknor", "email": "cbucknor@communitychoicecu.com", "phone": "(248) 785-5070", "company": "Community Choice Credit Union", "title": "VP of Technology", "status": "Attended"},
      {"name": "Quinn Copeland", "email": "quinn.copeland@parkcommunity.com", "phone": "(502) 815-6032", "company": "Park Federal Credit Union", "title": "VP of IT", "status": "Attended"},
      {"name": "Michael Yu", "email": "michael.yu@stonex.com", "phone": "(949) 412-5384", "company": "StoneX", "title": "VP of Technology Solutions - Wealth Management", "status": "Cancelled"},
      {"name": "Jim Nagata", "email": "jim.nagata@armanino.com", "phone": "(925) 790-2730", "company": "Armanino", "title": "Sr. Director", "status": "Cancelled"},
      {"name": "Jeremy Pryor", "email": "jpryor@dupaco.com", "phone": "(918) 977-1690", "company": "Dupaco Community Credit Union", "title": "SVP, Enterprise Data & Strategic Analytics", "status": "Cancelled"},
      {"name": "Raymond Everson", "email": "raymond.everson@voya.com", "phone": "(904) 791-2584", "company": "Voya Financial", "title": "Director, Information Technology", "status": "Cancelled"},
      {"name": "Ankur Kothari", "email": "ankur.kothari@live.com", "phone": "(224)848-0062", "company": "Northern Trust", "title": "VP", "status": "Cancelled"}
    ]
  }
]'::jsonb;
  event_record jsonb;
  attendee_record jsonb;
BEGIN
  FOR event_record IN SELECT * FROM jsonb_array_elements(events_json)
  LOOP
    FOR attendee_record IN SELECT * FROM jsonb_array_elements(event_record->'attendees')
    LOOP
      INSERT INTO sponsor_leads (
        sponsor_id,
        event_id,
        attendee_id,
        name,
        first_name,
        last_name,
        email,
        company,
        title,
        phone,
        is_historical,
        historical_event_name,
        historical_event_type,
        historical_event_date,
        historical_status,
        attendance_status,
        source_database,
        created_at
      ) VALUES (
        'f050a185-e395-489e-a46d-83e21e1efa0a',
        '00000000-0000-0000-0000-000000000001',
        gen_random_uuid()::text,
        attendee_record->>'name',
        split_part(attendee_record->>'name', ' ', 1),
        substring(attendee_record->>'name' from position(' ' in attendee_record->>'name') + 1),
        attendee_record->>'email',
        attendee_record->>'company',
        attendee_record->>'title',
        attendee_record->>'phone',
        true,
        event_record->>'event_name',
        event_record->>'event_type',
        (event_record->>'event_date')::date,
        attendee_record->>'status',
        CASE
          WHEN attendee_record->>'status' = 'Attended' THEN 'attended'
          ELSE 'no_show'
        END,
        'ringcentral',
        now()
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
