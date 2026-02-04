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
  "forum_name": "East",
  "attendees": [
    {
      "first_name": "Ken",
      "last_name": "DeWitt",
      "company": "Navajo County, AZ",
      "title": "Chief Information Officer",
      "email": "kenneth.dewitt@navajocountyaz.gov",
      "cellphone": "(224)406-1744"
    },
    {
      "first_name": "Jason",
      "last_name": "Frame",
      "company": "Southern Nevada Health District",
      "title": "Chief Information Officer",
      "email": "frame@snhd.org",
      "cellphone": "(702) 759-1641"
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
      "first_name": "Bert",
      "last_name": "Talley",
      "company": "Healthtrackrx",
      "title": "CISO",
      "email": "bert.talley@gmail.com",
      "cellphone": "(623) 224-1712"
    },
    {
      "first_name": "Jacob",
      "last_name": "Combs",
      "company": "Tandem Diabetes",
      "title": "CISO",
      "email": "jacombs@tandemdiabetes.com",
      "cellphone": "(973) 348-5988"
    },
    {
      "first_name": "Imad",
      "last_name": "Banna",
      "company": "Acorns",
      "title": "CISO",
      "email": "ibanna@acorns.com",
      "cellphone": "(714) 614-7120"
    },
    {
      "first_name": "Sandeep",
      "last_name": "Desai",
      "company": "Arizona Department of Education",
      "title": "CISO",
      "email": "sandeep.desai@azed.gov",
      "cellphone": "(602) 300-2517"
    },
    {
      "first_name": "Jack",
      "last_name": "Satterfield",
      "company": "Pima Community College",
      "title": "CTO",
      "email": "jcsatterfield@pima.edu",
      "cellphone": "(520) 429-2017"
    },
    {
      "first_name": "Emilia",
      "last_name": "Mack",
      "company": "New Mexico Department of Health",
      "title": "Deputy CISO",
      "email": "emilia.mack@doh.nm.gov",
      "cellphone": "505-490-5007"
    },
    {
      "first_name": "William",
      "last_name": "Stirling",
      "company": "University of Washington",
      "title": "Director",
      "email": "wstirlin@uw.edu",
      "cellphone": "(206) 499-9828"
    },
    {
      "first_name": "Ebenezer",
      "last_name": "Arumai",
      "company": "Inogen",
      "title": "Director - IT Infrastructure and Security",
      "email": "ebenezer.arumai@inogen.net",
      "cellphone": "(847) 217-2946"
    },
    {
      "first_name": "Tina",
      "last_name": "Lampe",
      "company": "DIRECTV",
      "title": "Director - IT Software Engineering",
      "email": "tina.lampe@mydirectv.com",
      "cellphone": "(618) 334-7272"
    },
    {
      "first_name": "Marc",
      "last_name": "Mackey",
      "company": "Nike",
      "title": "Director Global Technology PMO",
      "email": "marc.mackey@nike.com",
      "cellphone": "(650) 454-4171"
    },
    {
      "first_name": "Sylvia",
      "last_name": "Jessen",
      "company": "University of Utah School of Medicine",
      "title": "Director IT SFESOM",
      "email": "sylvia.jessen@hsc.utah.edu",
      "cellphone": "(801) 860-3115"
    },
    {
      "first_name": "Dave",
      "last_name": "Burton",
      "company": "FICO",
      "title": "Director Market Leading Capabilities",
      "email": "daveburton@fico.com",
      "cellphone": "(512) 750-0625"
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
      "first_name": "Hari",
      "last_name": "Tatrakal",
      "company": "Live Nation Entertainment",
      "title": "Director of Enterprise Apps",
      "email": "hari.tatrakal@livenation.com",
      "cellphone": "(832) 212-6528"
    },
    {
      "first_name": "Tung",
      "last_name": "Nguyen",
      "company": "Denver Water",
      "title": "Director of Information Security",
      "email": "tung.nguyen@denverwater.org",
      "cellphone": "(303) 725-1663"
    },
    {
      "first_name": "Noah",
      "last_name": "Wallace",
      "company": "Progress Residential",
      "title": "Director of InfoSec",
      "email": "nwallace@progressresidential.com",
      "cellphone": "(602) 284-4732"
    },
    {
      "first_name": "Mehrdad",
      "last_name": "Rasoli",
      "company": "Universal Electronics",
      "title": "Director of Program Management",
      "email": "mrasoli@uei.com",
      "cellphone": "(657) 264-4853"
    },
    {
      "first_name": "Umashankar",
      "last_name": "Meda",
      "company": "SAP Labs",
      "title": "Director of Risk Management",
      "email": "umashankar.meda@sap.com",
      "cellphone": "(925)321-0665"
    },
    {
      "first_name": "Richard",
      "last_name": "Nader",
      "company": "MultiCare Health Systems",
      "title": "Director, Cybersecurity",
      "email": "richard.nader@multicare.org",
      "cellphone": "(989) 297-0975"
    },
    {
      "first_name": "Naidu",
      "last_name": "Gandham",
      "company": "Pacific Life",
      "title": "Director, Data Management",
      "email": "naidu.gandham@pacificlife.com",
      "cellphone": "(949) 279-3809"
    },
    {
      "first_name": "Jay",
      "last_name": "Spreitzer",
      "company": "Wells Fargo",
      "title": "Executive Director",
      "email": "jay.p.spreitzer@wellsfargo.com",
      "cellphone": "(906) 299-0528"
    },
    {
      "first_name": "Angela",
      "last_name": "McGuire",
      "company": "East West Bank",
      "title": "First Vice President | Cybersecurity Program Management",
      "email": "angela.mcguire@eastwestbank.com",
      "cellphone": "(214) 280-7939"
    },
    {
      "first_name": "GS",
      "last_name": "Jha",
      "company": "QuantumScape",
      "title": "Global CIO and CISO",
      "email": "gjha@quantumscape.com",
      "cellphone": "(650) 880-5915"
    },
    {
      "first_name": "Nitin",
      "last_name": "Goyal",
      "company": "Skyworks",
      "title": "Global Director - ERP & Data Analytics",
      "email": "nitin.goyal@skyworksinc.com",
      "cellphone": "(949)241-1473"
    },
    {
      "first_name": "Cory",
      "last_name": "Hopple",
      "company": "Sunstate Equipment",
      "title": "Head of Cybersecurity",
      "email": "cory.hopple@sunstateequip.com",
      "cellphone": "(480) 645-1399"
    },
    {
      "first_name": "Huy",
      "last_name": "Ly",
      "company": "Monolithic Power Systems",
      "title": "Head of Global IT Security/Infrastructure",
      "email": "huy.ly@monolithicpower.com",
      "cellphone": "(408) 504-4871"
    },
    {
      "first_name": "Romulo",
      "last_name": "Lozada",
      "company": "Glydways",
      "title": "Head of IT (Director)",
      "email": "alberto.lozada@gmail.com",
      "cellphone": "(408) 618-1655"
    },
    {
      "first_name": "Peter",
      "last_name": "Hoffman",
      "company": "Alumus",
      "title": "IT Director",
      "email": "peter.hoffman@alumus.com",
      "cellphone": "(480) 750-2241"
    },
    {
      "first_name": "David",
      "last_name": "Ma",
      "company": "IDEC",
      "title": "IT Manager",
      "email": "david.ma@idec.com",
      "cellphone": "(669) 268-4448"
    },
    {
      "first_name": "Craig",
      "last_name": "Elario",
      "company": "SAP",
      "title": "IT Manager",
      "email": "cmelario@prodigy.net",
      "cellphone": "(650) 793-2026"
    },
    {
      "first_name": "Eric",
      "last_name": "Hjelm",
      "company": "Silver Bay Seafoods",
      "title": "IT Support Manager",
      "email": "eric.hjelm@silverbayseafoods.com",
      "cellphone": "(650) 391-4244"
    },
    {
      "first_name": "Ryan",
      "last_name": "Dunn",
      "company": "Specialized Bicycles",
      "title": "Leader - Product and Supply Chain Technology",
      "email": "ryan.dunn@specialized.com",
      "cellphone": "(303) 981-5937"
    },
    {
      "first_name": "Kurian",
      "last_name": "Thattampurath",
      "company": "Prudential Financial",
      "title": "Manager , IAM",
      "email": "kurian.thattampurath@prudential.com",
      "cellphone": "(623) 273-3468"
    },
    {
      "first_name": "Tavio",
      "last_name": "Dossou",
      "company": "Sweetgreen",
      "title": "Manager, IT Ops",
      "email": "tavio.dossou@sweetgreen.com",
      "cellphone": "(310) 402-1727"
    },
    {
      "first_name": "Jeanette",
      "last_name": "Bennett",
      "company": "Sunstate Equipment",
      "title": "Network Operations Manager",
      "email": "jbennett@sunstateequip.com",
      "cellphone": "(480) 826-9702"
    },
    {
      "first_name": "Hemant",
      "last_name": "Saraf",
      "company": "T-Mobile( former )",
      "title": "Principal Cybersecurity Architect",
      "email": "hemant.saraf@gmail.com",
      "cellphone": "(425) 286-7726"
    },
    {
      "first_name": "Thao",
      "last_name": "Vo",
      "company": "Zillow Group",
      "title": "Principal Security Engineer",
      "email": "thaov@zillowgroup.com",
      "cellphone": "(206) 482-8091"
    },
    {
      "first_name": "Neil",
      "last_name": "Schloss",
      "company": "Perdue Farms",
      "title": "Procurement Manager IT",
      "email": "neil.schloss@perdue.com",
      "cellphone": "(480) 521-9782"
    },
    {
      "first_name": "Gregory",
      "last_name": "Blair",
      "company": "eXp Realty",
      "title": "Senior Director IT Security & IAM",
      "email": "gregory.blair@exprealty.net",
      "cellphone": "(651) 269-4264"
    },
    {
      "first_name": "Sue",
      "last_name": "Acuna",
      "company": "Ascent Aviation Services",
      "title": "Senior Director of IT & Internal Controls",
      "email": "sacuna@ascentmro.com",
      "cellphone": "(520) 982-6394"
    },
    {
      "first_name": "Miguel",
      "last_name": "Villasana",
      "company": "Buck Design",
      "title": "Senior Director of Studio Technologies",
      "email": "mike.villasana@buck.co",
      "cellphone": "(424) 330-5634"
    },
    {
      "first_name": "Pavel",
      "last_name": "Kroshner",
      "company": "five9",
      "title": "Sr IT Director of Cloud Operations",
      "email": "pkroshner@five9.com",
      "cellphone": "(650) 450-0970"
    },
    {
      "first_name": "Robert",
      "last_name": "Thomas",
      "company": "Anduril Industries",
      "title": "Sr. Director of ERP Systems",
      "email": "robfthomas@outlook.com",
      "cellphone": "(650) 892-5481"
    },
    {
      "first_name": "Stanley",
      "last_name": "Charles",
      "company": "Aristocrat Gaming",
      "title": "Sr. Manager, Info Protection & AppSec",
      "email": "stanley.charles@aristocrat.com",
      "cellphone": "(385) 220-2580"
    },
    {
      "first_name": "Joe",
      "last_name": "Pensiero",
      "company": "Footprint",
      "title": "VP of IT",
      "email": "joe.pensiero@footprintus.com",
      "cellphone": "(704) 989-3990"
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
      "first_name": "Christo",
      "last_name": "Tonev",
      "company": "Salesforce",
      "title": "VP Software Engineering",
      "email": "ctonev@salesforce.com",
      "cellphone": "(408) 406-3854"
    },
    {
      "first_name": "Andy",
      "last_name": "Kwan",
      "company": "Careismatic Brands",
      "title": "VP, Infrastructure and Security",
      "email": "akwan@careismatic.com",
      "cellphone": "(626) 429-9171"
    },
    {
      "first_name": "Mitch",
      "last_name": "Taylor",
      "company": "Pacific Southwest Container (Former)",
      "title": "VP of IT",
      "email": "mtaylor@taylor-technologies.net",
      "cellphone": "(209) 993-1530"
    },
    {
      "first_name": "Tom",
      "last_name": "McDonald",
      "company": "Barrow Brain and Spine",
      "title": "IT Director",
      "email": "thomas.mcdonald@barrowbrainandspine.com",
      "cellphone": "(808) 225-4980"
    },
    {
      "first_name": "Aaron",
      "last_name": "Gette",
      "company": "EōS Fitness",
      "title": "CIO",
      "email": "agette@eosfitness.com",
      "cellphone": "(602) 975-4041"
    },
    {
      "first_name": "Dustin",
      "last_name": "Milic",
      "company": "Vertex Education",
      "title": "Director of IT",
      "email": "dustin.milic@vertexeducation.com",
      "cellphone": "(480) 331-8215"
    },
    {
      "first_name": "Ricky",
      "last_name": "Reed",
      "company": "Universal Electronics",
      "title": "IT Systems Engineer",
      "email": "rreed@uei.com",
      "cellphone": "(714) 501-8778"
    },
    {
      "first_name": "Trevor",
      "last_name": "Klinger",
      "company": "SBM Management Services",
      "title": "Mgr, Infrastructure & Security Operations",
      "email": "tklinger@sbmcorp.com",
      "cellphone": "(314) 920-6211"
    },
    {
      "first_name": "April",
      "last_name": "Halm",
      "company": "eXp Realty",
      "title": "Senior Director Data Privacy",
      "email": "april.halm@exprealty.net",
      "cellphone": "(404) 637-7356"
    },
    {
      "first_name": "Chris",
      "last_name": "Cloutier",
      "company": "SBM Management Services",
      "title": "Senior Director IT Systems",
      "email": "ccloutier@sbmcorp.com",
      "cellphone": "(310) 648-9768"
    }
  ]
};

async function importForumAttendees() {
  console.log(`Starting import of RingCentral ${forumData.forum_name} Forum historical attendees...\n`);
  console.log(`Total attendees to import: ${forumData.attendees.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  // Get current max attendee ID number
  const { data: allIds } = await supabase
    .from('sponsor_leads')
    .select('attendee_id')
    .eq('sponsor_id', RINGCENTRAL_SPONSOR_ID)
    .eq('is_historical', true)
    .like('attendee_id', 'hist_rc_%');

  let startNumber = 526; // Start after the 525 virtual dinner/roundtable records
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
    const fullName = `${attendee.first_name} ${attendee.last_name}`.trim();

    try {
      const { error } = await supabase.from('sponsor_leads').insert({
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
        historical_status: 'Member',
      });

      if (error) {
        console.error(`  Error inserting ${fullName}: ${error.message}`);
        errorCount++;
      } else {
        successCount++;
        if (successCount % 10 === 0) {
          process.stdout.write(`.${successCount}`);
        }
      }
    } catch (err: any) {
      console.error(`  Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n\n=== Import Complete ===`);
  console.log(`Forum: ${forumData.forum_name}`);
  console.log(`Total successful: ${successCount}`);
  console.log(`Total errors: ${errorCount}`);

  const { count } = await supabase
    .from('sponsor_leads')
    .select('id', { count: 'exact', head: true })
    .eq('sponsor_id', RINGCENTRAL_SPONSOR_ID)
    .eq('is_historical', true);

  if (count !== null) {
    console.log(`\nTotal historical leads for RingCentral in database: ${count}`);
  }
}

importForumAttendees().catch(console.error);
