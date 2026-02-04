import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const RINGCENTRAL_SPONSOR_ID = '93110e75-235b-4586-91f2-196deca40133';
const HISTORICAL_EVENT_ID = '00000000-0000-0000-0000-000000000001';

const forumData = {
  "forum_name": "TOLA",
  "attendees": [
    {
      "first_name": "Marlon",
      "last_name": "Shears",
      "company": "IDEA Public Schools",
      "title": "Chief Information Officer",
      "email": "marlon.shears@ideapublicschools.org",
      "cellphone": "818-807-0906"
    },
    {
      "first_name": "Ross",
      "last_name": "Tucker",
      "company": "Texas United Corporation",
      "title": "Chief Information Officer",
      "email": "rtucker@tum.com",
      "cellphone": "(281) 460-6036"
    },
    {
      "first_name": "Jeff",
      "last_name": "Green",
      "company": "Strike",
      "title": "Chief Information Officer",
      "email": "jeff.green@strikeusa.com",
      "cellphone": "(469) 682-4211"
    },
    {
      "first_name": "Scott",
      "last_name": "Shultz",
      "company": "Exeter Finance",
      "title": "SVP, Infrastructure & TechOps",
      "email": "scott.shultz@exeterfinance.com",
      "cellphone": "(972) 207-4000"
    },
    {
      "first_name": "Dan",
      "last_name": "Durkin",
      "company": "YES Prep Public School",
      "title": "Managing Director of Technology",
      "email": "daniel.durkin@yesprep.org",
      "cellphone": "(281) 650-2098"
    },
    {
      "first_name": "Ray",
      "last_name": "Texter",
      "company": "Texas United Corporation",
      "title": "CISO",
      "email": "rtexter@tum.com",
      "cellphone": "(713) 306-9507"
    },
    {
      "first_name": "Surya",
      "last_name": "Chavali",
      "company": "Kimberly-Clark Corporation",
      "title": "IT Director",
      "email": "surya.chavali@kcc.com",
      "cellphone": "(302) 230-6360"
    },
    {
      "first_name": "Rishi",
      "last_name": "Toshniwal",
      "company": "Signifyhealth, CVS",
      "title": "Director Data Intelligence",
      "email": "rtoshniwal@signifyhealth.com",
      "cellphone": "(608) 345-0045"
    },
    {
      "first_name": "Billy",
      "last_name": "Sainz",
      "company": "Citizens Medical Center",
      "title": "CISO",
      "email": "bsainz@cmcvtx.org",
      "cellphone": "(361) 389-5209"
    },
    {
      "first_name": "Charles",
      "last_name": "Ahn",
      "company": "Kimberly-Clark",
      "title": "Director of Technology and Integration and SAP COE Head",
      "email": "charles.ahn@kcc.com",
      "cellphone": "(678) 764-7768"
    },
    {
      "first_name": "Ravi",
      "last_name": "Guram",
      "company": "Dell",
      "title": "IT Director",
      "email": "ravindra_gurram@dell.com",
      "cellphone": "(512) 658-4135"
    },
    {
      "first_name": "Wei",
      "last_name": "Dong",
      "company": "Michaels Stores",
      "title": "VP, Chief of Information Security Officer",
      "email": "wei8@michaels.com",
      "cellphone": "(469) 544-5838"
    },
    {
      "first_name": "Sureshbabu",
      "last_name": "Sreeramulu",
      "company": "Michaels Stores",
      "title": "Vice President, Infra Operations",
      "email": "suresh2@michaels.com",
      "cellphone": "(479) 420-4909"
    },
    {
      "first_name": "Javier",
      "last_name": "Rangel",
      "company": "NorthStar Memorial Group",
      "title": "Director of Software Development",
      "email": "javier.rangel@nsmg.com",
      "cellphone": "(619) 847-3383"
    },
    {
      "first_name": "Daniel",
      "last_name": "Ochoa",
      "company": "Thrive Pet Healthcare",
      "title": "IT Director",
      "email": "daniel.ochoa@pathwayvets.com",
      "cellphone": "(512) 817-9679"
    },
    {
      "first_name": "Quang",
      "last_name": "Ton",
      "company": "SLB",
      "title": "Head of Data Science & AI",
      "email": "qton@slb.com",
      "cellphone": "(832) 213-6184"
    },
    {
      "first_name": "Derek",
      "last_name": "Stephens",
      "company": "LHC Group",
      "title": "Chief Information Security Officer & Office of the CIO",
      "email": "derek.stephens@lhcgroup.com",
      "cellphone": "(214) 250-3040"
    },
    {
      "first_name": "Cynthia",
      "last_name": "Dixon",
      "company": "PepsiCo Inc",
      "title": "Sr. IT Director",
      "email": "cynthia.d.dixon@pepsico.com",
      "cellphone": "(940) 735-0740"
    },
    {
      "first_name": "Heather",
      "last_name": "Phelps",
      "company": "Ribbon Communications",
      "title": "Director IT & Information Security",
      "email": "hphelps@rbbn.com",
      "cellphone": "(808) 348-0262"
    },
    {
      "first_name": "Ad",
      "last_name": "Ghauri",
      "company": "Baker Hughes",
      "title": "Director (FORMER)",
      "email": "adghauri786@gmail.com",
      "cellphone": "(817) 808-1046"
    },
    {
      "first_name": "John",
      "last_name": "Joe",
      "company": "St Luke's Health",
      "title": "Director",
      "email": "jcjoe@stlukeshealth.org",
      "cellphone": "(832) 494-8396"
    },
    {
      "first_name": "Lionel",
      "last_name": "Bailey",
      "company": "Mr Cooper",
      "title": "AVP Information Security",
      "email": "lionel.bailey@mrcooper.com",
      "cellphone": "(225) 266-8932"
    },
    {
      "first_name": "George",
      "last_name": "Kanyotu",
      "company": "General Motors Financial",
      "title": "AVP Global Infrastructure Services",
      "email": "george.kanyotu@gmfinancial.com",
      "cellphone": "(678) 525-6947"
    },
    {
      "first_name": "Terry",
      "last_name": "Roberts",
      "company": "McClatchy Retail Network",
      "title": "VP Bi & Analytics",
      "email": "troberts@accelerate360.com",
      "cellphone": "(972) 670-5229"
    },
    {
      "first_name": "Todd",
      "last_name": "Beebe",
      "company": "Freeport LNG",
      "title": "Information Security Officer",
      "email": "tvbeebe@freeportlng.com",
      "cellphone": "(281) 957-5095"
    },
    {
      "first_name": "Aaron",
      "last_name": "Hilton",
      "company": "EssilorLuxottica",
      "title": "VP of Software Engineering (Rx MFG Solutions)",
      "email": "aaron.hilton@essilorusa.com",
      "cellphone": "(512) 634-6945"
    },
    {
      "first_name": "David",
      "last_name": "Sains",
      "company": "Tenet Healthcare",
      "title": "Director, IT Service Management",
      "email": "davidsains@gmail.com",
      "cellphone": "(469) 401-6138"
    },
    {
      "first_name": "Zane",
      "last_name": "Donahoo",
      "company": "P. Terry's Burger Stand",
      "title": "VP of Technology",
      "email": "zane.donahoo@pterrys.com",
      "cellphone": "(402) 802-8844"
    },
    {
      "first_name": "Tony",
      "last_name": "Zaheer",
      "company": "Weatherford International",
      "title": "Senior Director Enterprise Security / CISO",
      "email": "tony.zaheer@weatherford.com",
      "cellphone": "(832) 488-3464"
    },
    {
      "first_name": "Chakrapani",
      "last_name": "Maturi",
      "company": "AIG",
      "title": "Vice President",
      "email": "cmaturi@gmail.com",
      "cellphone": "(940) 465-9395"
    },
    {
      "first_name": "Robert",
      "last_name": "Pace",
      "company": "Invitation Homes",
      "title": "VP/CISO",
      "email": "robert.pace@invitationhomes.com",
      "cellphone": "(214) 909-3412"
    },
    {
      "first_name": "Steven",
      "last_name": "Whitfield",
      "company": "Data Axle",
      "title": "Director of Security",
      "email": "steven.whitfield@data-axle.com",
      "cellphone": "(949) 228-0448"
    },
    {
      "first_name": "Damian",
      "last_name": "Mobley",
      "company": "Immunotec Research Inc",
      "title": "CTO",
      "email": "dmobley@immunotec.com",
      "cellphone": "(940) 218-0324"
    },
    {
      "first_name": "Thomas",
      "last_name": "Zachariah",
      "company": "Corebridge Financial",
      "title": "Head Of Strategic IT",
      "email": "thomas.zachariah@corebridgefinancial.com",
      "cellphone": "(832) 987-4590"
    },
    {
      "first_name": "Boyd",
      "last_name": "Nolan",
      "company": "Tyler Technologies",
      "title": "Director of Security, ERP & Civic Division",
      "email": "boyd.nolan@tylertech.com",
      "cellphone": "(405) 889-0010"
    },
    {
      "first_name": "Melissa",
      "last_name": "Bruner",
      "company": "Populus Financial Group",
      "title": "SVP & CIO",
      "email": "mbruner@populusfinancial.com",
      "cellphone": "(718) 915-3370"
    },
    {
      "first_name": "David",
      "last_name": "Keckley",
      "company": "AT&T",
      "title": "Associate Director",
      "email": "dk4714@att.com",
      "cellphone": "(925) 389-4358"
    },
    {
      "first_name": "Alexander",
      "last_name": "Rosca",
      "company": "RNWBL",
      "title": "IT Director",
      "email": "a.rosca@rnwbl.com",
      "cellphone": "(281) 831-2133"
    },
    {
      "first_name": "Doug",
      "last_name": "Williams",
      "company": "American Airlines Center",
      "title": "CTO",
      "email": "dwilliams@aacntr.com",
      "cellphone": "(214) 886-5548"
    },
    {
      "first_name": "Jon",
      "last_name": "Murphy",
      "company": "American Campus Communities",
      "title": "CISO",
      "email": "jmurphy@americancampus.com",
      "cellphone": "(940) 368-9620"
    },
    {
      "first_name": "Chandan",
      "last_name": "Kochhar",
      "company": "C&S Wholesale",
      "title": "Head of Cybersecurity Operations & GRC",
      "email": "chandankochher2003@gmail.com",
      "cellphone": "(817) 983-1989"
    },
    {
      "first_name": "Cliff",
      "last_name": "Donathan",
      "company": "AWS",
      "title": "Principal Technologist for Responsible AI (FORMER)",
      "email": "cdonathan@gmail.com",
      "cellphone": "(206) 679-1685"
    },
    {
      "first_name": "Vipul",
      "last_name": "Gupta",
      "company": "Frost Bank",
      "title": "SVP, Director of Information Security",
      "email": "vipul.gupta@frostbank.com",
      "cellphone": "(469) 987-8084"
    },
    {
      "first_name": "Clif",
      "last_name": "Triplett",
      "company": "Kearney",
      "title": "Executive Director for Cybersecurity and Risk Management",
      "email": "clif.triplett@kearney.com",
      "cellphone": "(713) 775-6395"
    },
    {
      "first_name": "Khamonte",
      "last_name": "Johnson",
      "company": "Surveying & Mapping (SAM) LLC.",
      "title": "Sr. Mgr, Information Security",
      "email": "khamonte.johnson@sam.biz",
      "cellphone": "(512) 971-0723"
    },
    {
      "first_name": "Donna",
      "last_name": "Hale",
      "company": "5P Consulting",
      "title": "Managing Partner, CIO",
      "email": "dhale@5pconsulting.biz",
      "cellphone": "(858) 437-1166"
    },
    {
      "first_name": "Rajeev",
      "last_name": "Prabhu",
      "company": "Spectrum Global Payment Solutions, Inc",
      "title": "CISO (FORMER)",
      "email": "prabhu.rajeev@gmail.com",
      "cellphone": "(630) 750-8561"
    },
    {
      "first_name": "Rob",
      "last_name": "Strickland",
      "company": "Infovista",
      "title": "CIO",
      "email": "rob@m37ventures.com",
      "cellphone": ""
    },
    {
      "first_name": "Praveen",
      "last_name": "Kamsetti",
      "company": "Aviat Networks",
      "title": "Sr Director, Head of Information Technology",
      "email": "Pkamsetti@gmail.com",
      "cellphone": "(908) 300 -4114"
    },
    {
      "first_name": "Jose",
      "last_name": "Mathew",
      "company": "Harris Health",
      "title": "Administrative Director IT",
      "email": "jose.mathew2@harrishealth.org",
      "cellphone": "(713) 377-3319"
    },
    {
      "first_name": "Tony",
      "last_name": "Wilkins",
      "company": "Cantex Continuing Care Network",
      "title": "Chief Information Officer & Chief Information Security Officer",
      "email": "twilkins@cantexcc.com",
      "cellphone": "(972) 754-3095"
    },
    {
      "first_name": "Ben",
      "last_name": "Lowrance",
      "company": "Department of Texas Veterans of Foreign Wars",
      "title": "Adjutant/Quartermaster",
      "email": "ben@texasvfw.org",
      "cellphone": "(806) 433-1639"
    },
    {
      "first_name": "Raja",
      "last_name": "Vemulapalli",
      "company": "Visa",
      "title": "Director",
      "email": "rvemulap@visa.com",
      "cellphone": "(512) 593-9570"
    }
  ]
};

async function importForumAttendees() {
  console.log(`Starting import of RingCentral ${forumData.forum_name} Forum historical attendees...\n`);
  console.log(`Total attendees to import: ${forumData.attendees.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  const { data: allIds } = await supabase
    .from('sponsor_leads')
    .select('attendee_id')
    .eq('sponsor_id', RINGCENTRAL_SPONSOR_ID)
    .eq('is_historical', true)
    .like('attendee_id', 'hist_rc_%');

  let startNumber = 835;
  if (allIds && allIds.length > 0) {
    const numbers = allIds
      .map(row => {
        const match = row.attendee_id.match(/hist_rc_(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    if (numbers.length > 0) {
      startNumber = Math.max(...numbers) + 1;
    }
  }

  console.log(`Starting attendee ID numbering at: hist_rc_${String(startNumber).padStart(4, '0')}\n`);

  for (let i = 0; i < forumData.attendees.length; i++) {
    const attendee = forumData.attendees[i];
    const attendeeId = `hist_rc_${String(startNumber + i).padStart(4, '0')}`;
    const fullName = `${attendee.first_name} ${attendee.last_name}`;

    try {
      const { error } = await supabase
        .from('sponsor_leads')
        .insert({
          sponsor_id: RINGCENTRAL_SPONSOR_ID,
          event_id: HISTORICAL_EVENT_ID,
          attendee_id: attendeeId,
          source_database: 'non_forum_event',
          is_historical: true,
          name: fullName,
          email: attendee.email || '',
          phone: attendee.cellphone || '',
          company: attendee.company || '',
          title: attendee.title || '',
          historical_event_name: `RingCentral ${forumData.forum_name} Forum`,
          historical_event_type: 'Forum',
          historical_event_city: null,
          historical_event_venue: null,
          historical_event_date: null,
          historical_status: 'Member'
        });

      if (error) {
        console.error(`  Error inserting ${fullName}:`, error.message);
        errorCount++;
      } else {
        successCount++;
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`.${i + 1}`);
        }
      }
    } catch (err) {
      console.error(`  Error inserting ${fullName}:`, err);
      errorCount++;
    }
  }

  console.log('\n\n=== Import Complete ===');
  console.log(`Forum: ${forumData.forum_name}`);
  console.log(`Total successful: ${successCount}`);
  console.log(`Total errors: ${errorCount}\n`);

  const { count } = await supabase
    .from('sponsor_leads')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', RINGCENTRAL_SPONSOR_ID)
    .eq('is_historical', true);

  console.log(`Total historical leads for RingCentral in database: ${count}`);
}

importForumAttendees()
  .then(() => {
    console.log('Import completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
