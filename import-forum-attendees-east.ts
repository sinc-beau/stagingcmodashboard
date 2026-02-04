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
      "first_name": "Ravi",
      "last_name": "Chitturi",
      "company": "Depository Trust & Clearing Corp",
      "title": "IT Director",
      "email": "rchitturi@dtcc.com",
      "cellphone": "(571) 465-6090"
    },
    {
      "first_name": "Claudia",
      "last_name": "Visini",
      "company": "Depository Trust & Clearing Corp- DTCC",
      "title": "Director of Program Management",
      "email": "cvisini@dtcc.com",
      "cellphone": "(339) 203-1931"
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
      "first_name": "Randy",
      "last_name": "Temple",
      "company": "Freedom Mortgage",
      "title": "CIO",
      "email": "randy.temple@freedommortgage.com",
      "cellphone": "(248) 310-1731"
    },
    {
      "first_name": "Garrett",
      "last_name": "Smiley",
      "company": "Maximus",
      "title": "CDIO Chief of Staff / VP of Digital Infrastructure & Tech Strategy",
      "email": "garrettsmiley@maximus.com",
      "cellphone": "(703) 868-4819"
    },
    {
      "first_name": "Charles",
      "last_name": "Cooper",
      "company": "Meharry Medical College",
      "title": "CIO",
      "email": "cfcooper@mmc.edu",
      "cellphone": "(615) 968-1734"
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
      "first_name": "Michael",
      "last_name": "Yun",
      "company": "State Street Corporation (UNDISCLOSED)",
      "title": "VP, Global Cybersecurity",
      "email": "myun@statestreet.com",
      "cellphone": "(617) 985-4339"
    },
    {
      "first_name": "Chayan",
      "last_name": "Chakravarti",
      "company": "Altria",
      "title": "BISO",
      "email": "chayan.chakravarti@gmail.com",
      "cellphone": "(678) 525-9013"
    },
    {
      "first_name": "Warren",
      "last_name": "D'Mello",
      "company": "UBS",
      "title": "Executive Director",
      "email": "warren.dmello@ubs.com",
      "cellphone": "(919) 523-1445"
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
      "first_name": "Mandouh",
      "last_name": "Csintalan",
      "company": "RenaissanceRe",
      "title": "VP, Security GRC Manager",
      "email": "mcs@renre.com",
      "cellphone": "(347) 268-5612"
    },
    {
      "first_name": "Deepak",
      "last_name": "Agarwal",
      "company": "The School District of Palm Beach County",
      "title": "CIO",
      "email": "deepak.agarwal@palmbeachschools.org",
      "cellphone": "(561) 889-1599"
    },
    {
      "first_name": "Ray",
      "last_name": "Usler",
      "company": "The School District of Palm Beach County",
      "title": "Director of IT Security",
      "email": "raymond.usler@palmbeachschools.org",
      "cellphone": "(561) 662-3228"
    },
    {
      "first_name": "Rusty",
      "last_name": "Williams",
      "company": "VACO",
      "title": "Global Line of Business Leader, Technology",
      "email": "rusty.williams@vaco.com",
      "cellphone": "(912) 541-3060"
    },
    {
      "first_name": "Shay",
      "last_name": "Langroudi",
      "company": "(UNDISCLOSED) U.S. Department of Transportation",
      "title": "UNDISCLOSED- Division Chief, IT Ops & Business Intelligence",
      "email": "shaylangroudi@hotmail.com",
      "cellphone": "(617) 519-6587"
    },
    {
      "first_name": "Jie",
      "last_name": "Yu",
      "company": "Johnson & Johnson",
      "title": "Head of Digital & Data Science Product Management",
      "email": "yujieut@yahoo.com",
      "cellphone": "(732) 608-3967"
    },
    {
      "first_name": "Joseph",
      "last_name": "Hernandez",
      "company": "FEAM Aero",
      "title": "CIO",
      "email": "joehernandez@feam.aero",
      "cellphone": "(305) 767-0195"
    },
    {
      "first_name": "Srini",
      "last_name": "Tatapudi",
      "company": "Global Payments",
      "title": "VP - Technology",
      "email": "srini.tatapudi@globalpay.com",
      "cellphone": "(972) 834-9899"
    },
    {
      "first_name": "Mayur",
      "last_name": "Patel",
      "company": "Columbia University",
      "title": "Director, Information Technology Audit",
      "email": "mayur.patel@columbia.edu",
      "cellphone": "(917) 612-6197"
    },
    {
      "first_name": "Dan",
      "last_name": "Rocco",
      "company": "Cenveo",
      "title": "CIO",
      "email": "dan.rocco@cenveo.com",
      "cellphone": "(914) 720-4182"
    },
    {
      "first_name": "Neeti",
      "last_name": "Adlakha",
      "company": "Healthfirst",
      "title": "Director, Application Development",
      "email": "nadlakha@healthfirst.org",
      "cellphone": "(732) 500-7731"
    },
    {
      "first_name": "Renee",
      "last_name": "Smith",
      "company": "Global Payments",
      "title": "Director of Application",
      "email": "renee.young@globalpay.com",
      "cellphone": "(706) 527-2213"
    },
    {
      "first_name": "Brian",
      "last_name": "Benn",
      "company": "Clark Atlanta University",
      "title": "CIO",
      "email": "bbenn@cau.edu",
      "cellphone": "(770) 891-5190"
    },
    {
      "first_name": "Tanweer",
      "last_name": "Surve",
      "company": "PNC",
      "title": "CTO Cloud COE & Solutions Engineering",
      "email": "tanweer.surve@pnc.com",
      "cellphone": "(703) 868-4819"
    },
    {
      "first_name": "Traig",
      "last_name": "Friedrich",
      "company": "Gordon College",
      "title": "CIO",
      "email": "traig.friedrich@gordon.edu",
      "cellphone": "(605) 645-8762"
    },
    {
      "first_name": "Rameshwar",
      "last_name": "Balanagu",
      "company": "UNFI",
      "title": "Chief Enterprise Architect",
      "email": "gmadhuri28@gmail.com",
      "cellphone": "(214) 475-6492"
    },
    {
      "first_name": "Michael",
      "last_name": "Vigneau",
      "company": "Allegro MicroSystems",
      "title": "Director of Cybersecurity",
      "email": "mvigneau@allegromicro.com",
      "cellphone": "(774) 289-2594"
    },
    {
      "first_name": "Nate",
      "last_name": "Lee",
      "company": "K Hovnanian",
      "title": "Director of Data Management and Governance",
      "email": "nlee@khov.com",
      "cellphone": "(714) 401-6920"
    },
    {
      "first_name": "Aung",
      "last_name": "Moe",
      "company": "Harvard Kennedy School",
      "title": "Assistant Director Information System",
      "email": "amoe@hks.harvard.edu",
      "cellphone": "(409) 276-5837"
    },
    {
      "first_name": "Alan",
      "last_name": "Cook",
      "company": "University of Alabama at Birmingham",
      "title": "Director Of Information Technology",
      "email": "acook40@uab.edu",
      "cellphone": "(205) 842-1632"
    },
    {
      "first_name": "Kevin",
      "last_name": "Madsen",
      "company": "Honey Baked Ham Company",
      "title": "Senior Director Security and IT Operations",
      "email": "KMadsen@HBHam.com",
      "cellphone": "(770) 596-5143"
    },
    {
      "first_name": "Donald",
      "last_name": "Major Jr",
      "company": "Aprio",
      "title": "Senior Director of IT Support",
      "email": "donald.major@aprio.com",
      "cellphone": "(912) 678-3622"
    },
    {
      "first_name": "Rajesh",
      "last_name": "Halarnkar",
      "company": "Penske Logistics",
      "title": "Director of Technology",
      "email": "rhalarnkar@penskevehicleservices.com",
      "cellphone": "(813) 442-1272"
    },
    {
      "first_name": "Muthukumar",
      "last_name": "Devadoss",
      "company": "Tradeweb",
      "title": "Director, Information Security",
      "email": "muthukumar.devadoss@tradeweb.com",
      "cellphone": "(818) 404-6009"
    },
    {
      "first_name": "Polina",
      "last_name": "Ware",
      "company": "PPG",
      "title": "Global AI Strategy Director",
      "email": "pware@ppg.com",
      "cellphone": "(774) 462-7759"
    },
    {
      "first_name": "Jiju",
      "last_name": "Nair",
      "company": "Fannie Mae",
      "title": "Associate Director, Cloud Engineering",
      "email": "nairjiju@gmail.com",
      "cellphone": "(703) 855-0300"
    },
    {
      "first_name": "Jogen",
      "last_name": "Mehta",
      "company": "ION Group",
      "title": "Director",
      "email": "jogen.mehta@iongroup.com",
      "cellphone": "(646) 895-3885"
    },
    {
      "first_name": "Yvonne",
      "last_name": "Chen",
      "company": "BNP Paribas",
      "title": "Head of PAAS",
      "email": "yvonne.chen@us.bnpparibas.com",
      "cellphone": "(914) 886-2129"
    },
    {
      "first_name": "Kenny",
      "last_name": "Cunningham",
      "company": "OneDigital",
      "title": "Director, IT Security",
      "email": "Kenneth.cunningham@onedigital.com",
      "cellphone": "(770) 355-1169"
    },
    {
      "first_name": "Patrick",
      "last_name": "Neborg",
      "company": "Berkadia",
      "title": "VP, Data Architecture",
      "email": "pneborg@berkadia.com",
      "cellphone": "(215) 479-4463"
    },
    {
      "first_name": "David",
      "last_name": "Prater",
      "company": "Maximus",
      "title": "Sr. Dir IT Business Relationship Management",
      "email": "davidwprater@maximus.com",
      "cellphone": "(864) 885-2938"
    },
    {
      "first_name": "Tim",
      "last_name": "Renicks",
      "company": "International Paper",
      "title": "Sr IT Manager - Information Security",
      "email": "timothy.renicks@ipaper.com",
      "cellphone": "(901) 573-6386"
    },
    {
      "first_name": "Marnee",
      "last_name": "Klein",
      "company": "Suffolk University",
      "title": "Director of Enterprise Applications",
      "email": "marnee.klein@suffolk.edu",
      "cellphone": "(610) 316-2449"
    },
    {
      "first_name": "Tanvir",
      "last_name": "Raihan",
      "company": "Bank Of China",
      "title": "Vice President",
      "email": "raihant@acm.org",
      "cellphone": "(516) 259-2555"
    },
    {
      "first_name": "Adrian",
      "last_name": "Williams",
      "company": "Edible Brands",
      "title": "Director of Global Corporate Saftey & Secuirty",
      "email": "adrianwilliams@edible.com",
      "cellphone": "(404) 668-3608"
    },
    {
      "first_name": "Marian",
      "last_name": "Holiday-White",
      "company": "North Carolina Central University",
      "title": "Director Client Services",
      "email": "mwhite@nccu.edu",
      "cellphone": "(919) 943-8093"
    },
    {
      "first_name": "Kaseem",
      "last_name": "Mabry",
      "company": "Tampa International Airport",
      "title": "Director, Enterprise Applications & PMO",
      "email": "kmabry@tampaairport.com",
      "cellphone": "(813) 215-9254"
    },
    {
      "first_name": "Ian",
      "last_name": "Reid",
      "company": "Truist",
      "title": "SVP Group Cyber",
      "email": "ian.reid@truist.com",
      "cellphone": "(980) 210-2863"
    },
    {
      "first_name": "Clark",
      "last_name": "Rainer",
      "company": "State of Georgia Attorney General",
      "title": "CIO",
      "email": "crainer@law.ga.gov",
      "cellphone": "(770) 342-9461"
    },
    {
      "first_name": "Shalabh",
      "last_name": "Kumar",
      "company": "Fidelity",
      "title": "Director - Architecture",
      "email": "shalabh.kumar@fmr.com",
      "cellphone": "(508) 314-9676"
    },
    {
      "first_name": "Aashitha",
      "last_name": "Koushik",
      "company": "Harvard Business School",
      "title": "Product Management, AI Strategy and Innovation",
      "email": "akoushik@hbs.edu",
      "cellphone": "(508) 309-5776"
    },
    {
      "first_name": "Frank",
      "last_name": "Martinez",
      "company": "Nova Southeastern University",
      "title": "AVP / CISO",
      "email": "fmartin1@nova.edu",
      "cellphone": "(954) 262-4826"
    },
    {
      "first_name": "Astride",
      "last_name": "Lisenby",
      "company": "Harvard Business School",
      "title": "Director, Cloud & Systems Engineering",
      "email": "alisenby@hbs.edu",
      "cellphone": "(617) 212-3473"
    },
    {
      "first_name": "Kashish",
      "last_name": "Jain",
      "company": "Citizens Bank",
      "title": "AVP Cyber Defense-Risk & Oversight/Corporate Security",
      "email": "erkashishjain@gmail.com",
      "cellphone": "(980) 287-9139"
    },
    {
      "first_name": "Bhavesh",
      "last_name": "Jani",
      "company": "Citi",
      "title": "Director - Global Head of Cybersecurity for Markets Business",
      "email": "bhavesh.jani@citi.com",
      "cellphone": "(732) 261-7923"
    },
    {
      "first_name": "Viktoriya",
      "last_name": "Smith",
      "company": "Citibank",
      "title": "SVP, Chief Data Office, Independent Risk Management",
      "email": "viktoriya.k.smith@citi.com",
      "cellphone": "(917) 826-6768"
    },
    {
      "first_name": "Ken",
      "last_name": "Foster",
      "company": "Candescent",
      "title": "CISO",
      "email": "ken.foster@candescent.com",
      "cellphone": "(706) 455-1701"
    },
    {
      "first_name": "Henry",
      "last_name": "Sanchez",
      "company": "Life Extension",
      "title": "Director of IT",
      "email": "hsanchez@lifeextension.com",
      "cellphone": "(305) 798-6767"
    },
    {
      "first_name": "Kiran",
      "last_name": "More",
      "company": "Daiichi Sakyo",
      "title": "Associate Director, Data Programming, Analytics and Reporting",
      "email": "kiran.more@daiichisankyo.com",
      "cellphone": "(302) 290-0232"
    },
    {
      "first_name": "Neha",
      "last_name": "Agarwal",
      "company": "DTCC ( Undisclosed )",
      "title": "Director, Data Services",
      "email": "nagarwal2@dtcc.com",
      "cellphone": "(732) 447-6101"
    },
    {
      "first_name": "Scott",
      "last_name": "Main",
      "company": "Groundworks",
      "title": "CISO",
      "email": "scott.main@groundworks.com",
      "cellphone": "(757) 266-5918"
    },
    {
      "first_name": "RJ",
      "last_name": "Libunao",
      "company": "University of North Carolina",
      "title": "Assistant Dean for Informational and Instructional Technologies",
      "email": "rjlibunao@unc.edu",
      "cellphone": "(845) 709-1706"
    },
    {
      "first_name": "Julia",
      "last_name": "Flaksin",
      "company": "Cantor Fitzgerald",
      "title": "Global Head of IT Audit",
      "email": "julia.flaksin@cantor.com",
      "cellphone": "(347) 351-7467"
    },
    {
      "first_name": "Keith",
      "last_name": "Deininger",
      "company": "Truist Financial Corp",
      "title": "VP, Enterprise Technology, TPRM",
      "email": "keith.a.deininger@truist.com",
      "cellphone": "(404) 465-6244"
    },
    {
      "first_name": "Pedro",
      "last_name": "Gonzalez",
      "company": "Flanigan's Enterprises",
      "title": "IT Director",
      "email": "pgonzalez@flanigans.net",
      "cellphone": "(786) 256-2959"
    },
    {
      "first_name": "Charles",
      "last_name": "Orgbon",
      "company": "Federal Bureau of Investigation (FBI)",
      "title": "DSAC Coordinator",
      "email": "corgbon@fbi.gov",
      "cellphone": "(678) 431-4230"
    },
    {
      "first_name": "Jay",
      "last_name": "Jones",
      "company": "Public Partnerships LLC",
      "title": "Director of Information Security",
      "email": "jayjones@pplfirst.com",
      "cellphone": "(414) 530-1400"
    },
    {
      "first_name": "Rafael",
      "last_name": "Cruz",
      "company": "Comcast NBC Universal",
      "title": "VP of Technology - Global Quality Engineering",
      "email": "rafael.cruz1@nbcuni.com",
      "cellphone": "(813) 789-8817"
    },
    {
      "first_name": "Melissa",
      "last_name": "Jenkins",
      "company": "One Call",
      "title": "Sr. Director Security Risk Governance",
      "email": "melissa_jenkins@onecallcm.com",
      "cellphone": "(904) 612-0432"
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
      "first_name": "Priya",
      "last_name": "Balasubramaniam",
      "company": "Ciena",
      "title": "Head of Innovation Center, Product Security",
      "email": "pbalasub@ciena.com",
      "cellphone": "(469) 992-9270"
    },
    {
      "first_name": "Ernst",
      "last_name": "Goldman",
      "company": "Citi",
      "title": "SVP, Tech & Ops",
      "email": "ernst.goldman@citicorpholding.com",
      "cellphone": "(732) 433-6430"
    },
    {
      "first_name": "Sanjay",
      "last_name": "Ramchandani",
      "company": "Owens & Minor",
      "title": "Vice President, IT",
      "email": "sanjay.ramchandani@owens-minor.com",
      "cellphone": "(516) 884-8851"
    },
    {
      "first_name": "Angelica",
      "last_name": "Gomez",
      "company": "Goodwill Industries of South Florida",
      "title": "VP of IT",
      "email": "agomez@goodwillmiami.org",
      "cellphone": "(786) 731-7756"
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
