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
  "forum_name": "Northeast",
  "attendees": [
    {
      "first_name": "Wayne",
      "last_name": "Welch",
      "company": "Matters Surfaces Inc",
      "title": "Director of IT Operations",
      "email": "wwelch@matsinc.com",
      "cellphone": "(617) 935-7418"
    },
    {
      "first_name": "Dominic",
      "last_name": "Yu",
      "company": "Rand Worldwide",
      "title": "VP of IT and Business Systems",
      "email": "dyu@rand.com",
      "cellphone": "(617) 312-1403"
    },
    {
      "first_name": "Jacque",
      "last_name": "Rowden",
      "company": "City of Pittsburgh",
      "title": "Assistant Director, Innovation & Performance",
      "email": "jacque.rowden@pittsburghpa.gov",
      "cellphone": "(412) 352-6196"
    },
    {
      "first_name": "Ernst",
      "last_name": "Goldman",
      "company": "Citi",
      "title": "SVP",
      "email": "ernst.goldman@citicorpholding.com",
      "cellphone": "(732) 433-6430"
    },
    {
      "first_name": "Francis",
      "last_name": "Oywech",
      "company": "Northeastern University",
      "title": "Associate Director IT Operations",
      "email": "f.oywech@northeastern.edu",
      "cellphone": "(617) 938-4475"
    },
    {
      "first_name": "Salomon",
      "last_name": "Frangieh",
      "company": "State Street Global Advisors",
      "title": "VP - IT Risk and Resilience",
      "email": "Salomon_Frangieh@statestreet.com",
      "cellphone": "(781) 708-5068"
    },
    {
      "first_name": "Zaid",
      "last_name": "Salbi",
      "company": "Children's National Hospital",
      "title": "Business Technology Partner",
      "email": "zsalbi@childrensnational.org",
      "cellphone": "(202) 361-1411"
    },
    {
      "first_name": "Rob",
      "last_name": "Huang",
      "company": "Mastercard",
      "title": "Director Enterprise Operations",
      "email": "rob.huang@mastercard.com",
      "cellphone": "(913) 634-1922"
    },
    {
      "first_name": "Shravan",
      "last_name": "Duvvuri",
      "company": "State Street Financial Corporation",
      "title": "VP Technical Product Manager",
      "email": "sduvvuri2@statestreet.com",
      "cellphone": "(412) 265-8510"
    },
    {
      "first_name": "Faith",
      "last_name": "Rotimi Ajayi",
      "company": "Morgan Stanley",
      "title": "Assistant Vice President - Operational Risk (Business, Technology, & Cyber Resilience)",
      "email": "faith.rotimi@morganstanley.com",
      "cellphone": "(514) 663-0908"
    },
    {
      "first_name": "Gwendolyn",
      "last_name": "Moorer",
      "company": "City of Pittsburgh",
      "title": "Assistant Director, Business Technology",
      "email": "gwen.moorer@pittsburghpa.gov",
      "cellphone": "(412) 430-1754"
    },
    {
      "first_name": "Charles",
      "last_name": "Sun",
      "company": "Please Use Undisclosed for Badge and marketing/website",
      "title": "Chief, Network Infrastructure Engineering",
      "email": "charlessun1@gmail.com",
      "cellphone": "(202) 810-1112"
    },
    {
      "first_name": "Deshard",
      "last_name": "Stevens",
      "company": "NAACP LDF",
      "title": "Senior Director of Information Technology",
      "email": "dstevens@naacpldf.org",
      "cellphone": "(551) 580-1384"
    },
    {
      "first_name": "Washington Ricardo",
      "last_name": "Izquierdo",
      "company": "Pillar College",
      "title": "CIO/CISO",
      "email": "wrizquierdo@pillar.edu",
      "cellphone": "(973) 498-8416"
    },
    {
      "first_name": "Krishna",
      "last_name": "Sairi",
      "company": "(UNDISCLOSED) Office of the Attorney General for the District of Columbia",
      "title": "CISO",
      "email": "krishna.sairi@dc.gov",
      "cellphone": "(408) 203-9735"
    },
    {
      "first_name": "Lisa",
      "last_name": "Brown",
      "company": "Planned Parenthood Federation of America",
      "title": "Senior Director of IT Operations",
      "email": "lisa.brown@ppfa.org",
      "cellphone": "(240) 346-6991"
    },
    {
      "first_name": "JT",
      "last_name": "Taylor",
      "company": "Planned Parenthood Federation of America",
      "title": "Associate Director, Service Delivery",
      "email": "jt.taylor@ppfa.org",
      "cellphone": "(443) 583-9648"
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
      "first_name": "Lori",
      "last_name": "Hoepner",
      "company": "Columbia University",
      "title": "Deputy Director of Organizational and Analytical Data Management",
      "email": "lah45@columbia.edu",
      "cellphone": "(917) 941-8009"
    },
    {
      "first_name": "Junior",
      "last_name": "Pierre-Toussaint",
      "company": "Sanofi-aventis",
      "title": "Head of Internet Exposure",
      "email": "junior.pierre-toussaint@sanofi.com",
      "cellphone": "(917) 975-4858"
    },
    {
      "first_name": "Eugene",
      "last_name": "Kogan",
      "company": "Population Council",
      "title": "Global Director of IT",
      "email": "ekogan@popcouncil.org",
      "cellphone": "(646) 472-6201"
    },
    {
      "first_name": "Montae",
      "last_name": "Brockett",
      "company": "DC Department of Healthcare Finance",
      "title": "Deputy CIO / CISO",
      "email": "montae.brockett@dc.gov",
      "cellphone": "(301) 787-8997"
    },
    {
      "first_name": "Irving",
      "last_name": "Bruckstein",
      "company": "Washington College",
      "title": "Chief Information Officer",
      "email": "ibruckstein2@washcoll.edu",
      "cellphone": "(570) 236-3837"
    },
    {
      "first_name": "Jelani",
      "last_name": "Campbell",
      "company": "Fannie Mae",
      "title": "Cyber Risk Director",
      "email": "jelani_campbell@fanniemae.com",
      "cellphone": "(646) 359-0318"
    },
    {
      "first_name": "Chukwuka",
      "last_name": "Jiabana",
      "company": "Future Hope Behavioral Health Services Inc",
      "title": "IT Director",
      "email": "cjiabana@futurehopebhs.com",
      "cellphone": "(410) 497-2835"
    },
    {
      "first_name": "Leo",
      "last_name": "Rajapakse",
      "company": "Bimbo Bakeries USA",
      "title": "Global Head of Platform Infrastructure & Advanced Technology",
      "email": "leo.rajapakse@grupobimbo.com",
      "cellphone": "(718) 223-0481"
    },
    {
      "first_name": "Prashant",
      "last_name": "Diggikar",
      "company": "Gainwell Technologies",
      "title": "Director Transformation",
      "email": "prashant.diggikar@gainwelltechnologies.com",
      "cellphone": "(732) 310-5644"
    },
    {
      "first_name": "David",
      "last_name": "Goodpaster",
      "company": "State Street Global Advisors",
      "title": "Managing Director - Head of Data Protection & Insider Risk",
      "email": "Dgoodpaster@statestreet.com",
      "cellphone": "(610) 751-3505"
    },
    {
      "first_name": "Steve",
      "last_name": "Demeritt",
      "company": "Farm Credit Financial Partners",
      "title": "Chief Operations Officer",
      "email": "steve.demeritt@financialpartners.com",
      "cellphone": "(732) 233-9236"
    },
    {
      "first_name": "Natasha",
      "last_name": "Jones",
      "company": "Community Council Health Systems",
      "title": "Director of Communications and Technology",
      "email": "njones@cchss.org",
      "cellphone": "(215) 473-7033"
    },
    {
      "first_name": "Vijay",
      "last_name": "Chawla",
      "company": "AmeriHealth Caritas",
      "title": "Senior Director of Platform Engineering and Cloud Infrastructure",
      "email": "vijay.chawla@amerihealthcaritas.com",
      "cellphone": "(917) 545-1265"
    },
    {
      "first_name": "Shai",
      "last_name": "Perez",
      "company": "Citi",
      "title": "Global Head of Permitting, CISO",
      "email": "Shai.perez@citi.com",
      "cellphone": "(813) 503-7679"
    },
    {
      "first_name": "Jon",
      "last_name": "Garza",
      "company": "PSA BDP",
      "title": "CISO",
      "email": "jon.garza@psabdp.com",
      "cellphone": "(346) 225-4586"
    },
    {
      "first_name": "Nate",
      "last_name": "Lee",
      "company": "Hovnanian Enterprises",
      "title": "Sr. Dir, Data Management and Governance",
      "email": "nlee@khov.com",
      "cellphone": "(714) 401-6920"
    },
    {
      "first_name": "Edward",
      "last_name": "Zhang",
      "company": "Synchrony",
      "title": "VP/Strategy & Transformation",
      "email": "edward.zhang@syf.com",
      "cellphone": "(475) 232-4982"
    },
    {
      "first_name": "Colleen",
      "last_name": "Rush",
      "company": "BAYADA Home Health Care",
      "title": "Director, Application Support",
      "email": "crush@bayada.com",
      "cellphone": "(215) 873-3840"
    },
    {
      "first_name": "Tanweer",
      "last_name": "Surve",
      "company": "PNC",
      "title": "CTO Cloud COE & Solutions Engineering",
      "email": "tanweer.surve@pnc.com",
      "cellphone": "(972) 839-4581"
    },
    {
      "first_name": "Allwyn",
      "last_name": "Saldanha",
      "company": "CSC Global",
      "title": "Global Head of Product Security",
      "email": "allwyn.saldanha@cscglobal.com",
      "cellphone": "(302) 383-2792"
    },
    {
      "first_name": "Harold",
      "last_name": "Takyi",
      "company": "University of Pittsburgh",
      "title": "Director IT Operations",
      "email": "hkt2@pitt.edu",
      "cellphone": "(412) 620-3562"
    },
    {
      "first_name": "Steve",
      "last_name": "Biggins",
      "company": "Bluecross Blueshield Massachusetts",
      "title": "Senior Director of Information Technology",
      "email": "steven.biggins@bcbsma.com",
      "cellphone": "(617) 246-3892"
    },
    {
      "first_name": "Bernard",
      "last_name": "Garcia",
      "company": "CRF - Children's Rescue Fund",
      "title": "Vice President of Information Security",
      "email": "garciab@icahnhouse.org",
      "cellphone": "(929) 526-1964"
    },
    {
      "first_name": "Hemant",
      "last_name": "Gandre",
      "company": "Deutsche Bank",
      "title": "Vice President",
      "email": "hemant.gandre@db.com",
      "cellphone": "(917) 588-5678"
    },
    {
      "first_name": "James",
      "last_name": "Weems",
      "company": "A Second Chance, Inc.",
      "title": "Director IV FACE - Data Analytics",
      "email": "jamesw@asecondchance-kinship.com",
      "cellphone": "(412) 849-4788"
    },
    {
      "first_name": "Nish",
      "last_name": "Majmudar",
      "company": "Mathematica",
      "title": "VP, CISO",
      "email": "nmajmudar@mathematica-mpr.com",
      "cellphone": "(240) 899-6104"
    },
    {
      "first_name": "Anil",
      "last_name": "Katarki",
      "company": "Peraton",
      "title": "Sr Director Cybersecurity Services",
      "email": "anil.katarki@peraton.com",
      "cellphone": "(703) 599-7244"
    },
    {
      "first_name": "Tamika",
      "last_name": "Bass",
      "company": "Gannett Fleming Transystems",
      "title": "Cybersecurity Director",
      "email": "tbass@gfnet.com",
      "cellphone": "(404) 904-8459"
    },
    {
      "first_name": "Eddie",
      "last_name": "Tsai",
      "company": "Apple Bank",
      "title": "ISO",
      "email": "etsai@applebank.com",
      "cellphone": "(917) 651-1446"
    },
    {
      "first_name": "Richard",
      "last_name": "Tsai",
      "company": "IBM",
      "title": "DevSecOps Engineer",
      "email": "richtxo@gmail.com",
      "cellphone": "516-444-5091"
    },
    {
      "first_name": "Reshma",
      "last_name": "Raturi",
      "company": "JP Morgan Chase",
      "title": "VP",
      "email": "reshma.raturi@gmail.com",
      "cellphone": "(610) 550-9571"
    },
    {
      "first_name": "Rajendra",
      "last_name": "Gupta",
      "company": "REGENERON Pharmaceuticals",
      "title": "Head of Enterprise Architecture, IOPS IT",
      "email": "rajendra.gupta@regeneron.com",
      "cellphone": "(860) 834-0344"
    },
    {
      "first_name": "Jeremy",
      "last_name": "Gatens",
      "company": "University of Pennsylvania",
      "title": "IT Director",
      "email": "jgatens@upenn.edu",
      "cellphone": "(484) 451-8675"
    },
    {
      "first_name": "Glen",
      "last_name": "Gomez Zuazo",
      "company": "Etrade",
      "title": "Senior Director IT Architecture",
      "email": "glen.gomezzuazo@etrade.com",
      "cellphone": "(512) 694-3924"
    },
    {
      "first_name": "Joe",
      "last_name": "Bonifaz",
      "company": "Boston Scientific",
      "title": "Director",
      "email": "joe.bonifaz@bsci.com",
      "cellphone": "(551) 265-8742"
    },
    {
      "first_name": "Timothy",
      "last_name": "Fazio",
      "company": "Danaher",
      "title": "Director Enterprise Identity",
      "email": "timothy.fazio@danaher.com",
      "cellphone": "484-477-9222"
    },
    {
      "first_name": "Craig",
      "last_name": "Taflin",
      "company": "Sandoz (FORMER)",
      "title": "Associate Director, AI and Data Science",
      "email": "cmtaflin@gmail.com",
      "cellphone": "(323) 806-5752"
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

  let startNumber = 780;
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
