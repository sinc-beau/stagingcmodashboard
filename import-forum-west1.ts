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
  "forum_name": "West 1",
  "attendees": [
    {
      "first_name": "Marc",
      "last_name": "Mackey",
      "company": "Nike",
      "title": "Director Global Technology PMO",
      "email": "marc.mackey@nike.com",
      "cellphone": "(650) 454-4171"
    },
    {
      "first_name": "Shawn",
      "last_name": "O'Shea",
      "company": "Dutch Bros",
      "title": "CISO",
      "email": "shawn.oshea@gmail.com",
      "cellphone": "(585) 721-5552"
    },
    {
      "first_name": "Thiago",
      "last_name": "Roque",
      "company": "Slalom",
      "title": "Director of Data and Technology",
      "email": "thiago.roque@slalom.com",
      "cellphone": "(801) 919-5889"
    },
    {
      "first_name": "Duran",
      "last_name": "Holycross",
      "company": "City of Albuquerque",
      "title": "Deputy Director, DTI Operations",
      "email": "dholycross@cabq.gov",
      "cellphone": "(505) 328-6556"
    },
    {
      "first_name": "Vijay",
      "last_name": "Nair",
      "company": "Gilead Sciences",
      "title": "Director R&D IT - Research Global Capability Lead;Head of Research IT",
      "email": "vijay.nair2@gilead.com",
      "cellphone": "(650) 283-4818"
    },
    {
      "first_name": "Joel",
      "last_name": "Ruiz",
      "company": "Dine Brands Global",
      "title": "Director Cybersecurity",
      "email": "joel.ruiz@dinebrands.com",
      "cellphone": "(818) 357-9571"
    },
    {
      "first_name": "Taylor",
      "last_name": "Jolin",
      "company": "Nisqually Red Wind Casino",
      "title": "I.T. Operations Manager",
      "email": "tjolin@redwind.net",
      "cellphone": "(253) 666-5700"
    },
    {
      "first_name": "Charles",
      "last_name": "Luneza",
      "company": "LAS Airport, Clark Co., Dept of Aviation",
      "title": "Airport Senior Manager Cybersecurity",
      "email": "charleslu@lasairport.com",
      "cellphone": "(702) 261-5003"
    },
    {
      "first_name": "Antonio",
      "last_name": "Taylor",
      "company": "Mission Healthcare",
      "title": "VP of IT",
      "email": "ataylor@missionhh.com",
      "cellphone": "(901) 326-5330"
    },
    {
      "first_name": "Suhail",
      "last_name": "Khan",
      "company": "City National Bank ( undisclosed )",
      "title": "VP Data & Analytics",
      "email": "suhail80@hotmail.com",
      "cellphone": "(562)673-2148"
    },
    {
      "first_name": "Brian",
      "last_name": "Armstrong",
      "company": "Providence Health Systems",
      "title": "Executive Director, Cybersecurity Governance",
      "email": "brian.p.armstrong@providence.org",
      "cellphone": "(503) 915-3777"
    },
    {
      "first_name": "Naga Vinod",
      "last_name": "Duggirala",
      "company": "Visa ( undisclosed )",
      "title": "Chief Security Architect",
      "email": "nagavinod@gmail.com",
      "cellphone": "(432) 271-6639"
    },
    {
      "first_name": "Gaja",
      "last_name": "Nagarajan",
      "company": "Blackline",
      "title": "Sr Director IT",
      "email": "gaja.nagarajan@blackline.com",
      "cellphone": "(408) 761-5298"
    },
    {
      "first_name": "Brent",
      "last_name": "Dillon",
      "company": "Sportsman's Warehouse",
      "title": "Director, Information Security and Compliance",
      "email": "bdillon@sportsmans.com",
      "cellphone": "(801) 870-7401"
    },
    {
      "first_name": "Josh",
      "last_name": "Pugmire",
      "company": "Awardco",
      "title": "CISO and VP of IT",
      "email": "josh.pugmire@awardco.com",
      "cellphone": "(801) 602-8933"
    },
    {
      "first_name": "Scott",
      "last_name": "Francis",
      "company": "Primary Residential Mortgage",
      "title": "Director of Information Security",
      "email": "sfrancis@primeres.com",
      "cellphone": "(385) 522-3566"
    },
    {
      "first_name": "Dr. Greg",
      "last_name": "Williams",
      "company": "State of Colorado - Colorado Secretary of State's Office",
      "title": "CISO",
      "email": "greg.williams@coloradosos.gov",
      "cellphone": "(720) 675-0657"
    },
    {
      "first_name": "Noah",
      "last_name": "Wallace",
      "company": "Progress Residential",
      "title": "VP of Information Security",
      "email": "nwallace@progressresidential.com",
      "cellphone": "(602) 284-4732"
    },
    {
      "first_name": "Hari",
      "last_name": "Tatrakal",
      "company": "Live Nation Entertainment",
      "title": "Director Of Database Services",
      "email": "HariTatrakal@LiveNation.com",
      "cellphone": "(832) 212-6528"
    },
    {
      "first_name": "Jay",
      "last_name": "Spreitzer",
      "company": "Wells Fargo Bank",
      "title": "Executive Director",
      "email": "jay.p.spreitzer@wellsfargo.com",
      "cellphone": "(906) 299-0528"
    },
    {
      "first_name": "Shawnna",
      "last_name": "DelHierro",
      "company": "SoundHound AI",
      "title": "CIO",
      "email": "sdelhierro@soundhound.com",
      "cellphone": "(210) 601-7998"
    },
    {
      "first_name": "Pavel",
      "last_name": "Kroshner",
      "company": "Five9",
      "title": "Sr IT Director of Cloud Operations",
      "email": "pkroshner@five9.com",
      "cellphone": "(650) 450-0970"
    },
    {
      "first_name": "Charles",
      "last_name": "Markarian",
      "company": "PACCAR",
      "title": "CISO",
      "email": "chuck.markarian@paccar.com",
      "cellphone": "(206) 856-3712"
    },
    {
      "first_name": "Steen",
      "last_name": "Nielsen",
      "company": "Homestreet Bank",
      "title": "CIO",
      "email": "steen.nielsen@homestreet.com",
      "cellphone": "(360) 421-8092"
    },
    {
      "first_name": "Raja",
      "last_name": "Vemulapalli",
      "company": "Visa",
      "title": "Director, IAM - Cybersecurity",
      "email": "rajavemulapalli@hotmail.com",
      "cellphone": "(512) 593-9570"
    },
    {
      "first_name": "Mark",
      "last_name": "Marcelline",
      "company": "Multnomah Athletic Club",
      "title": "Director Of Technology",
      "email": "mmarcelline@themac.com",
      "cellphone": "(971) 930-9376"
    },
    {
      "first_name": "John",
      "last_name": "Gunter Jr.",
      "company": "Electronic Arts",
      "title": "Head of TVM",
      "email": "jgunter@ea.com",
      "cellphone": "(512) 413-2124"
    },
    {
      "first_name": "Nilay",
      "last_name": "Naik",
      "company": "Wells Fargo Bank",
      "title": "Executive Director - Digital Delivery Leader",
      "email": "nilay.a.naik@gmail.com",
      "cellphone": "(704) 900-3137"
    },
    {
      "first_name": "Harry",
      "last_name": "Cometa",
      "company": "New American Funding",
      "title": "Sr. Director of End User Services",
      "email": "harry.cometa@nafinc.com",
      "cellphone": "(949) 229-9327"
    },
    {
      "first_name": "Robert",
      "last_name": "Cantrell",
      "company": "San Ysidro Health",
      "title": "Director Engineering and Information Security",
      "email": "robert.cantrell@syhealth.org",
      "cellphone": "(619) 977-8269"
    },
    {
      "first_name": "James",
      "last_name": "Danforth",
      "company": "Pacific Gas and Electric Company",
      "title": "Cybersecurity Manager",
      "email": "jim.danforth@outlook.com",
      "cellphone": "(408) 707-6548"
    },
    {
      "first_name": "Deepa",
      "last_name": "Vulupala",
      "company": "Genentech",
      "title": "Director, Data Management & Architecture",
      "email": "deepav@gene.com",
      "cellphone": "(650) 273-3694"
    },
    {
      "first_name": "Emilia",
      "last_name": "Mack",
      "company": "New Mexico Department of Health",
      "title": "Deputy CISO",
      "email": "emilia.mack@doh.nm.gov",
      "cellphone": "(575) 495-5006"
    },
    {
      "first_name": "Allen",
      "last_name": "Ohanian",
      "company": "Los Angeles - DCFS",
      "title": "CISO",
      "email": "allengo24@yahoo.com",
      "cellphone": "(818) 482-9341"
    },
    {
      "first_name": "Keith",
      "last_name": "Ward",
      "company": "YES Communities",
      "title": "Vice President of IT",
      "email": "gkwardjr@gmail.com",
      "cellphone": "(303) 929-1164"
    },
    {
      "first_name": "Timothy",
      "last_name": "Dzierzek",
      "company": "Aya Healthcare (Former)",
      "title": "CISO",
      "email": "timd@cox.net",
      "cellphone": "(760) 815-0919"
    },
    {
      "first_name": "Marcel",
      "last_name": "Spitalnik",
      "company": "Danone",
      "title": "Director Business Transformation",
      "email": "marcel.spitalnik@danone.com",
      "cellphone": "(720) 772-0308"
    },
    {
      "first_name": "Terry",
      "last_name": "Williams",
      "company": "Opendoor Community Health Center",
      "title": "CIO",
      "email": "terrylwilliams44@hotmail.com",
      "cellphone": "(425) 800-9040"
    },
    {
      "first_name": "Jason",
      "last_name": "Frame",
      "company": "Southern Nevada Health District",
      "title": "CIO",
      "email": "frame@snhd.org",
      "cellphone": "(702) 427-2937"
    },
    {
      "first_name": "Dan",
      "last_name": "Adams",
      "company": "4Wall Entertainment",
      "title": "VP of Information Technology, CISO",
      "email": "dadams@4wall.com",
      "cellphone": "(636) 744-5050"
    },
    {
      "first_name": "Garrett",
      "last_name": "Poelman",
      "company": "Empire Southwest",
      "title": "System Development Manager",
      "email": "garrett.poelman@empire-cat.com",
      "cellphone": "(949) 212-8373"
    },
    {
      "first_name": "Brent",
      "last_name": "Chelgren",
      "company": "Medtronic",
      "title": "IT Leader, and Business Unit CIO",
      "email": "brent.philip.chelgren@gmail.com",
      "cellphone": "(612) 812-5849"
    },
    {
      "first_name": "Rohit",
      "last_name": "Gupta",
      "company": "City and County of San Francisco",
      "title": "CTO",
      "email": "rohit.gupta@uci.edu",
      "cellphone": "(949) 394-6281"
    },
    {
      "first_name": "Mark",
      "last_name": "Ramirez",
      "company": "Pacific Gas and Electric Company",
      "title": "Sr. Manager, Cybersecurity Architecture & Engineering",
      "email": "mark.ramirez@pge.com",
      "cellphone": "(707) 330-6115"
    },
    {
      "first_name": "Wyatt",
      "last_name": "Banks",
      "company": "MGM Resorts",
      "title": "VP Cyber Defense",
      "email": "wbanks@mgmresorts.com",
      "cellphone": "(425) 985-2227"
    },
    {
      "first_name": "Jasmine",
      "last_name": "Hicks",
      "company": "Light & Wonder",
      "title": "CISO",
      "email": "jhicks2@lnw.com",
      "cellphone": "(702) 927-5904"
    },
    {
      "first_name": "Sasha",
      "last_name": "Pereira",
      "company": "Wash",
      "title": "VP Infrastructure & Security, CISO",
      "email": "wpereira@washlaundry.com",
      "cellphone": "(424) 220-9528"
    },
    {
      "first_name": "Carol",
      "last_name": "Nguyen",
      "company": "MUFG Bank, Ltd",
      "title": "Information Security Architect at MUFG Union Bank",
      "email": "cnguyen@us.mufg.jp",
      "cellphone": "(323) 720-2195"
    },
    {
      "first_name": "Jonathan",
      "last_name": "Chan",
      "company": "Episource",
      "title": "Head of IT and Security",
      "email": "jonathan.chan@episource.com",
      "cellphone": "(510) 673-8170"
    },
    {
      "first_name": "Kathleen",
      "last_name": "Dulay",
      "company": "Jade Global",
      "title": "Senior Manager, Enterprise Cloud Applications",
      "email": "kathleen.dulay@jadeglobal.com",
      "cellphone": "(408) 476-7016"
    },
    {
      "first_name": "Raj",
      "last_name": "Siddam",
      "company": "LifeVantage",
      "title": "Director IT",
      "email": "rsiddam@lifevantage.com",
      "cellphone": "(801) 512-6791"
    },
    {
      "first_name": "Sabrina",
      "last_name": "Hurst",
      "company": "LPL Financial",
      "title": "VP IT Governance and Compliance",
      "email": "sabrina.hurst@lplfinancial.com",
      "cellphone": "(737) 825-3386"
    },
    {
      "first_name": "Brad",
      "last_name": "Spackman",
      "company": "CHG Healthcare",
      "title": "Director of IT",
      "email": "brad.spackman@chghealthcare.com",
      "cellphone": "(801) 580-1897"
    },
    {
      "first_name": "Adam",
      "last_name": "Waldron",
      "company": "California Casualty Company",
      "title": "CIO",
      "email": "awaldron@calcas.com",
      "cellphone": "(208) 406-3326"
    },
    {
      "first_name": "Martin",
      "last_name": "Wagner",
      "company": "Silver Bay Seafoods",
      "title": "Director of IT",
      "email": "martin.wagner@silverbayseafoods.com",
      "cellphone": "(509) 393-8166"
    },
    {
      "first_name": "Blake",
      "last_name": "Entrekin",
      "company": "HackerOne",
      "title": "Deputy CISO",
      "email": "blake@hackerone.com",
      "cellphone": "(520) 247-8747"
    },
    {
      "first_name": "Poonam",
      "last_name": "Khemwani",
      "company": "Microsoft",
      "title": "Senior Director - Security Microsoft Identity and Network Division",
      "email": "poonamkhemwani@gmail.com",
      "cellphone": "(412) 320-9583"
    },
    {
      "first_name": "Rishma",
      "last_name": "Khimji",
      "company": "LAS Airport, Clark Co., Dept of Aviation",
      "title": "Chief Information Technology Officer",
      "email": "rishmak@lasairport.com",
      "cellphone": "(775) 857-5983"
    },
    {
      "first_name": "Rob",
      "last_name": "Strickland",
      "company": "Infovista",
      "title": "Interim CIO",
      "email": "rob@m37ventures.com",
      "cellphone": ""
    },
    {
      "first_name": "Vijay",
      "last_name": "Santhanakrishnan",
      "company": "Williams Sonoma",
      "title": "Director of Technology Audit",
      "email": "vijaysds@gmail.com",
      "cellphone": "(925) 416-9545"
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

  let startNumber = 526;
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
