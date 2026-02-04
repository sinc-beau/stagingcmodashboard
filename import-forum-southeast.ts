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
  "forum_name": "Southeast",
  "attendees": [
    {
      "first_name": "Xavier",
      "last_name": "Dominguez",
      "company": "Carestream Dental",
      "title": "Director of Information Security",
      "email": "xadominguez19@gmail.com",
      "cellphone": "(813) 919-5912"
    },
    {
      "first_name": "Richard",
      "last_name": "Zhu",
      "company": "TN Department of Mental Health",
      "title": "CIO",
      "email": "Richard.zhu@tn.gov",
      "cellphone": "(615) 521-0813"
    },
    {
      "first_name": "Mitch",
      "last_name": "Kincaid",
      "company": "NHC",
      "title": "Director",
      "email": "mkincaid@nhccare.com",
      "cellphone": "(615) 427-3952"
    },
    {
      "first_name": "Ben",
      "last_name": "Hicks",
      "company": "National HealthCare Corporation",
      "title": "CISO",
      "email": "bhicks@nhccare.com",
      "cellphone": "(615) 429-1681"
    },
    {
      "first_name": "Steven",
      "last_name": "Collins",
      "company": "United Veterinary Care",
      "title": "CIO",
      "email": "steve.collins@unitedvetcare.com",
      "cellphone": "(313) 618-5074"
    },
    {
      "first_name": "Keith",
      "last_name": "Deininger",
      "company": "Truist",
      "title": "VP, Enterprise Technology, Third party Vendor Risk",
      "email": "keith.a.deininger@truist.com",
      "cellphone": "(404) 465-6244"
    },
    {
      "first_name": "Kevin",
      "last_name": "Gowen",
      "company": "Synovus Financial Corp",
      "title": "CISO",
      "email": "kevingowen@synovus.com",
      "cellphone": "(706) 593-1254"
    },
    {
      "first_name": "Joseph",
      "last_name": "Pontillo",
      "company": "City of Miami Police",
      "title": "IT Director",
      "email": "26744@miami-police.org",
      "cellphone": "(786) 371-7738"
    },
    {
      "first_name": "Jerin",
      "last_name": "Lalu",
      "company": "LabCorp",
      "title": "Sr. Director, Architecture and Enterprise Shared Services",
      "email": "jerinkl@gmail.com",
      "cellphone": "(610) 357-9030"
    },
    {
      "first_name": "Gregory",
      "last_name": "Hobbs",
      "company": "School District of Osceola County",
      "title": "Director of Network and Information security",
      "email": "gregory.hobbs@osceolaschools.net",
      "cellphone": "(321) 624-1619"
    },
    {
      "first_name": "Bryan",
      "last_name": "Green",
      "company": "Raymond James",
      "title": "Director, IT Security",
      "email": "bdgreen@gmail.com",
      "cellphone": "(847) 902-4247"
    },
    {
      "first_name": "Nadeem",
      "last_name": "Iftikhar",
      "company": "Kirkland & Ellis",
      "title": "Cyber Security Governance & Risk Management Leader",
      "email": "nadeem.iftikhar@kirkland.com",
      "cellphone": "(630) 822-3323"
    },
    {
      "first_name": "Sreenivasa",
      "last_name": "Pokuri",
      "company": "Rentokil Terminix",
      "title": "IT Director, Software Engineering",
      "email": "sreenivasa.pokuri@gmail.com",
      "cellphone": "(919) 619-2434"
    },
    {
      "first_name": "Wes",
      "last_name": "Nugent",
      "company": "PS Logistics",
      "title": "Director of IT",
      "email": "wesnugent@gmail.com",
      "cellphone": "(205) 321-9353, cellphone 205-275-3528"
    },
    {
      "first_name": "Michael",
      "last_name": "Marsilio",
      "company": "Paradies Lagardere",
      "title": "CISO",
      "email": "michael.marsilio@paradies-na.com",
      "cellphone": "(770) 309-0778"
    },
    {
      "first_name": "Megan",
      "last_name": "Wyatt",
      "company": "Allergy Partners",
      "title": "Director of Training and Transition Operations",
      "email": "mnwyatt@allergypartners.com",
      "cellphone": "(828) 400-2971"
    },
    {
      "first_name": "Cody",
      "last_name": "Proctor",
      "company": "Allergy Partners",
      "title": "Director, Application Services",
      "email": "cody.proctor@allergypartners.com",
      "cellphone": "(828) 989-7235"
    },
    {
      "first_name": "Junius",
      "last_name": "Rowland",
      "company": "St. Jude Children's Research Hospital - ALSAC",
      "title": "Director IT PMO & Agile Delivery",
      "email": "junius.rowland@gmail.com",
      "cellphone": "(512) 993-4463"
    },
    {
      "first_name": "Hemanta",
      "last_name": "Jena",
      "company": "Rentokil Terminix",
      "title": "VP, Digital Products, North America",
      "email": "hemanta.jena@rentokil-terminix.com",
      "cellphone": "(561) 303-9693"
    },
    {
      "first_name": "Leonard",
      "last_name": "Niebo",
      "company": "The Citadel Military College",
      "title": "CIO",
      "email": "lniebo@citadel.edu",
      "cellphone": "(732) 425-7361"
    },
    {
      "first_name": "Brett",
      "last_name": "Hinson",
      "company": "Lipscomb University",
      "title": "VP of IT and CIO",
      "email": "bahinson@lipscomb.edu",
      "cellphone": "(803) 493-6030"
    },
    {
      "first_name": "Ken",
      "last_name": "Foster",
      "company": "Candescent (new company)",
      "title": "CISO",
      "email": "kenrfoster@hotmail.com",
      "cellphone": "(706) 455-1701"
    },
    {
      "first_name": "Shilpi",
      "last_name": "Ganguly",
      "company": "The Weather Channel (Allen Media Group)",
      "title": "SVP, IT & Cybersecurity",
      "email": "shilpi.ganguly@allenmedia.com",
      "cellphone": "(404) 452-0401"
    },
    {
      "first_name": "MasterofCeremonies- Brian",
      "last_name": "Benn",
      "company": "Clark Atlanta University",
      "title": "CIO",
      "email": "bbenn@cau.edu",
      "cellphone": "(770) 891-5190"
    },
    {
      "first_name": "Aaron",
      "last_name": "Welch",
      "company": "City of Chattanooga",
      "title": "Director IT Security and Chief AI Officer",
      "email": "awelch@chattanooga.gov",
      "cellphone": "(423) 505-9999"
    },
    {
      "first_name": "Robert",
      "last_name": "Neiberger",
      "company": "NEIHS",
      "title": "CIO",
      "email": "rob.neiberger@nih.gov",
      "cellphone": "(919) 799-0120"
    },
    {
      "first_name": "Randy",
      "last_name": "Temple",
      "company": "Freedom Mortgage",
      "title": "CIO",
      "email": "randy.temple@freedommortgage.com",
      "cellphone": "(248) 310-1731"
    },
    {
      "first_name": "Rusty",
      "last_name": "Williams",
      "company": "Vaco",
      "title": "Global Line of Business Leader, Technology",
      "email": "rwilliams@vaco.com",
      "cellphone": "(912) 541-3060"
    },
    {
      "first_name": "Felicia",
      "last_name": "Hedgebeth",
      "company": "Georgia Dept of Banking and Finance",
      "title": "CIO",
      "email": "fhedgebeth@dbf.state.ga.us",
      "cellphone": "(678) 616-5100"
    },
    {
      "first_name": "Nathan",
      "last_name": "Allen",
      "company": "Mckenney's",
      "title": "Director of Infrastructure",
      "email": "nathan.allen@mckenneys.com",
      "cellphone": "7706335071"
    },
    {
      "first_name": "Kevin",
      "last_name": "Berry",
      "company": "Nasco / Blue Cross Blue Shield",
      "title": "Director of Infrastructure Cloud and Security Engineering",
      "email": "kevin.berry@nasco.com",
      "cellphone": "(770) 545-5076"
    },
    {
      "first_name": "Juliano",
      "last_name": "Avigliano",
      "company": "Barings LLC",
      "title": "Director - Global IT Services",
      "email": "juliano.avigliano@barings.com",
      "cellphone": "(704) 575-5573"
    },
    {
      "first_name": "Subho",
      "last_name": "Nath",
      "company": "Georgia-Pacific",
      "title": "Director",
      "email": "subhankar.nath@gmail.com",
      "cellphone": "(678) 823-5738"
    },
    {
      "first_name": "Mike",
      "last_name": "Christoferson",
      "company": "Vaco",
      "title": "Sr. Director, Technology",
      "email": "mchristoferson@vaco.com",
      "cellphone": "(310) 413-4253"
    },
    {
      "first_name": "Jim",
      "last_name": "Hicks",
      "company": "Global Crossing Airlines",
      "title": "VP, IT & Digital",
      "email": "jim.hicks@globalxair.com",
      "cellphone": "(786) 973-6979"
    },
    {
      "first_name": "Sanjay",
      "last_name": "Suri",
      "company": "CHS",
      "title": "VP Digital Technology",
      "email": "sanjay_suri@chs.net",
      "cellphone": "(520) 329-9020"
    },
    {
      "first_name": "Srikanth",
      "last_name": "Rajan",
      "company": "Global Payments",
      "title": "Director of IAM",
      "email": "srikanth.rajan@globalpay.com",
      "cellphone": "(312) 369-0109"
    },
    {
      "first_name": "Edward",
      "last_name": "Morando",
      "company": "Convey Health Solutions",
      "title": "VP, IT Infrastructure & Cloud Services",
      "email": "emorando@conveyhs.com",
      "cellphone": "(561) 564-6201"
    },
    {
      "first_name": "Melissa",
      "last_name": "Jenkins",
      "company": "One Call",
      "title": "Senior Director Security Risk Governance",
      "email": "melissa_jenkins@onecallcm.com",
      "cellphone": "(904) 612-0432"
    },
    {
      "first_name": "Ian",
      "last_name": "Reid",
      "company": "Truist",
      "title": "SVP Group Cyber",
      "email": "ian.reid@truist.com; ianarreid@gmail.com",
      "cellphone": "(980) 210-2863"
    },
    {
      "first_name": "Bingdong",
      "last_name": "Li",
      "company": "Tennessee State University",
      "title": "CISO",
      "email": "bli@tnstate.edu",
      "cellphone": "(775) 843-6781"
    },
    {
      "first_name": "Deena",
      "last_name": "Swatzie",
      "company": "Truist Financial",
      "title": "SVP, Cyber Security Strategy & Digital Innovation",
      "email": "deenaj35@gmail.com",
      "cellphone": "(678) 230-8017"
    },
    {
      "first_name": "Tim",
      "last_name": "Huggins",
      "company": "North Greenville University",
      "title": "CIO",
      "email": "tim.huggins@ngu.edu",
      "cellphone": "(678) 464-4436"
    },
    {
      "first_name": "Cory",
      "last_name": "Anderson",
      "company": "Ingevity",
      "title": "Director of Information Security",
      "email": "cory.anderson@ingevity.com",
      "cellphone": "(843) 870-1841"
    },
    {
      "first_name": "Steve",
      "last_name": "Kraus",
      "company": "Syneos Health",
      "title": "Director, IT",
      "email": "steve.kraus@syneoshealth.com",
      "cellphone": ","
    },
    {
      "first_name": "Tameka",
      "last_name": "Neely-Dudley",
      "company": "City of Atlanta",
      "title": "It Director, Operations & Service Delivery",
      "email": "tneely@atlantaga.gov",
      "cellphone": "(404) 567-0786"
    },
    {
      "first_name": "Justin",
      "last_name": "Haire",
      "company": "Ryder System Inc.",
      "title": "Enterprise Information Security Architect",
      "email": "justin@justinhaire.com",
      "cellphone": "(727) 460-5553"
    },
    {
      "first_name": "Clayton",
      "last_name": "Phillips",
      "company": "West Tennessee Healthcare",
      "title": "VP/CIO",
      "email": "clayton.phillips@wth.org",
      "cellphone": "(731) 225-7260"
    },
    {
      "first_name": "Erich",
      "last_name": "Gazaui",
      "company": "Papa, Inc.",
      "title": "CIO",
      "email": "erich@gazaui.com",
      "cellphone": "(619) 518-5023"
    },
    {
      "first_name": "Amir",
      "last_name": "St. Clair",
      "company": "Advocate Health",
      "title": "Associate Vice President, Enterprise Risk Management",
      "email": "amir.stclair@aah.org",
      "cellphone": "(630) 234-2630"
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

  let startNumber = 888;
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
