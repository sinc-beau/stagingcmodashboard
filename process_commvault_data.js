import fs from 'fs';

const COMMVAULT_SPONSOR_ID = '6e048704-504b-474c-93bc-8c1e5feb265d';

// Full JSON data from user
const jsonData = {
  "total_events": 3,
  "total_attendees_all_events": 261,
  "total_attended_all_events": 208,
  "total_cancelled_all_events": 53,
  "events": [
    {
      "forum_name": "SINC 2025 Canada IT & Security Leaders Forum",
      "event_date": "2025-02-15",
      "total_attendees": 72,
      "attended_count": 60,
      "cancelled_count": 12,
      "attendees": [
        {"First Name": "Sasha", "Last Name": "Einwechter", "Company": "Magnet Forensics", "Title": "Director, IT Operations", "Email": "sasha.einwechter@magnetforensics.com", "Cellphone": "(519) 613-3933", "Linkedin": "https://www.linkedin.com/in/sashaeinwechter/", "Company Size": "1k-5k", "Industry": "Software Development", "Status": "attended"},
        {"First Name": "Varjinder", "Last Name": "Chane", "Company": "City of Edmonton", "Title": "Director, Business Integration", "Email": "varjinder.chane@edmonton.ca", "Cellphone": "(780) 554-2113", "Linkedin": "https://www.linkedin.com/in/varjinder-chane-016416274/", "Company Size": "10k+", "Industry": "Government Administration", "Status": "attended"},
        {"First Name": "Sylvie", "Last Name": "Martineau", "Company": "Hema Quebec", "Title": "IT Senior Director Enterprise Applications, Development and Analytics", "Email": "sylvie.martineau@hema-quebec.qc.ca", "Cellphone": "(514) 213-6414", "Linkedin": "https://www.linkedin.com/in/sylvie-martineau-192224/", "Company Size": "1k-5k", "Industry": "Healthcare", "Status": "attended"},
        {"First Name": "Lia", "Last Name": "Sana", "Company": "Fraser Health Authority", "Title": "Director, Information Security", "Email": "lia.sana@fraserhealth.ca", "Cellphone": "(604) 613-9472", "Linkedin": "https://www.linkedin.com/in/lia-sana/", "Company Size": "10k+", "Industry": "Healthcare", "Status": "attended"},
        {"First Name": "Shreyans", "Last Name": "Sethia", "Company": "TD", "Title": "AVP, Technology Delivery for Digital Customer Channels", "Email": "shreyans.sethia@td.com", "Cellphone": "(437) 869-5473", "Linkedin": "https://www.linkedin.com/in/shreyans-sethia-02091984/", "Company Size": "10k+", "Industry": "Banking", "Status": "attended"},
        {"First Name": "Sam", "Last Name": "Kosh", "Company": "VetStrategy", "Title": "Director, Data Integrity & Insights", "Email": "sam.kosh@vetstrategy.com", "Cellphone": "(289) 680-5585", "Linkedin": "https://www.linkedin.com/in/sam-kosh-01b0a595/", "Company Size": "5k-10k", "Industry": "Veterinary Services", "Status": "attended"},
        {"First Name": "Dan", "Last Name": "Di Nardo", "Company": "GIP Inc", "Title": "Vice President, IT", "Email": "ddinardo@gipi.com", "Cellphone": "(647) 388-5134", "Linkedin": "https://www.linkedin.com/in/dan-di-nardo-05503912/", "Company Size": "1k-5k", "Industry": "Manufacturing/CPG", "Status": "attended"},
        {"First Name": "Andrew", "Last Name": "Davies", "Company": "Shared Services Canada", "Title": "Director of National Hosting, Policing Infrastructure and Operations", "Email": "andrew.davies@ssc-spc.gc.ca", "Cellphone": "(613) 710-2302", "Linkedin": "https://www.linkedin.com/in/andrew-davies-cd-cet-94650b21a", "Company Size": "5k-10k", "Industry": "Government Administration", "Status": "attended"},
        {"First Name": "Andrey", "Last Name": "Raransky", "Company": "ScotiaBank", "Title": "Regional CISO", "Email": "andrey.raransky@scotiabank.com", "Cellphone": "(416) 602-7568", "Linkedin": "https://www.linkedin.com/in/andrey-raransky-phd-cissp-ccsp-cdpse-4509522/", "Company Size": "10k+", "Industry": "Banking", "Status": "attended"},
        {"First Name": "Nabil", "Last Name": "Mian", "Company": "Roots Corporation", "Title": "Sr. Manager Network & security", "Email": "nzia@roots.com", "Cellphone": "(647) 770-1840", "Linkedin": "https://www.linkedin.com/in/nabil-z-mian/", "Company Size": "1k-5k", "Industry": "Retail Apparel and Fashion", "Status": "attended"},
        {"First Name": "Adam", "Last Name": "Zimmerman", "Company": "Gateway Casinos", "Title": "CISO", "Email": "adam.zimmerman@gatewaycasinos.ca", "Cellphone": "(905) 758-6279", "Linkedin": "https://www.linkedin.com/in/adam-zimmerman-9233912a/", "Company Size": "1k-5k", "Industry": "Gambling Facilities and Casinos", "Status": "attended"},
        {"First Name": "Richard", "Last Name": "Henderson", "Company": "Alberta Health Services", "Title": "CISO", "Email": "richard.henderson@albertahealthservices.ca", "Cellphone": "(604) 354-7424", "Linkedin": "https://www.linkedin.com/in/richsentme", "Company Size": "10k+", "Industry": "Healthcare", "Status": "attended"},
        {"First Name": "Guido", "Last Name": "Dell'Unto", "Company": "The Co-operators", "Title": "Sr Manager, IT Control Testing & Monitoring", "Email": "guido_dellunto@cooperators.ca", "Cellphone": "(249) 288-0058", "Linkedin": "https://www.linkedin.com/in/guidodelluntocissp/", "Company Size": "5k-10k", "Industry": "Financial Services", "Status": "attended"},
        {"First Name": "Ashroff", "Last Name": "Khan", "Company": "NORR", "Title": "VP, Information Technology", "Email": "ashroff.khan@norr.com", "Cellphone": "(416) 274-6260", "Linkedin": "https://www.linkedin.com/in/ashroffkhan/", "Company Size": "1k-5k", "Industry": "Architecture and Planning", "Status": "attended"},
        {"First Name": "Greg", "Last Name": "Widmeyer", "Company": "Dialog", "Title": "Director of Technology", "Email": "gwidmeyer@dialogdesign.ca", "Cellphone": "(403) 671-0015", "Linkedin": "https://www.linkedin.com/in/greg-w-91935929/", "Company Size": "1k-5k", "Industry": "Professional, Scientific, Technical Services", "Status": "attended"},
        {"First Name": "Stephane", "Last Name": "Methot", "Company": "SunLife", "Title": "Director, Software Engineering", "Email": "stephane.methot@sunlife.com", "Cellphone": "(514) 891-2840", "Linkedin": "https://www.linkedin.com/in/stephanemethot/", "Company Size": "10k+", "Industry": "Financial Services", "Status": "attended"},
        {"First Name": "Vishal", "Last Name": "Chaskar", "Company": "Four Seasons", "Title": "Director - Salesforce Platform", "Email": "vishal.chaskar@fourseasons.com", "Cellphone": "(416) 505-9522", "Linkedin": "https://www.linkedin.com/in/neversaydie/", "Company Size": "10k+", "Industry": "Hospitality", "Status": "attended"},
        {"First Name": "Varun", "Last Name": "Vashishat", "Company": "Equitable Bank", "Title": "Director, Technology Risk", "Email": "vvashishat@eqbank.ca", "Cellphone": "(647) 551-8910", "Linkedin": "https://www.linkedin.com/in/varunvashishat/", "Company Size": "1k-5k", "Industry": "Banking & Insurance", "Status": "attended"},
        {"First Name": "Dhara", "Last Name": "Desai", "Company": "St. Joseph's Healthcare Hamilton", "Title": "Director of Digital Solutions", "Email": "ddesai@stjoes.ca", "Cellphone": "(905) 379-6700", "Linkedin": "https://www.linkedin.com/in/desai-dhara/", "Company Size": "5k-10k", "Industry": "Healthcare", "Status": "attended"},
        {"First Name": "Rob", "Last Name": "Martin", "Company": "Calgary Exhibition And Stampede Ltd", "Title": "Director, Business Services (IT/IS)", "Email": "rmartin@calgarystampede.com", "Cellphone": "(403) 261-0345", "Linkedin": "https://www.linkedin.com/in/robmartinyyc/", "Company Size": "1k-5k", "Industry": "Hospitality", "Status": "attended"},
        {"First Name": "Wayne", "Last Name": "Cross", "Company": "BLG LLP", "Title": "Director Cyber Security Infrastructure", "Email": "wcross@blg.com", "Cellphone": "(416) 350-2650", "Linkedin": "https://www.linkedin.com/in/waynelcross/", "Company Size": "1k-5k", "Industry": "Legal Solutions", "Status": "attended"},
        {"First Name": "Liese", "Last Name": "Coroy", "Company": "Mother Parkers Tea and Coffee Inc.", "Title": "CIO (Sr. Director BTS)", "Email": "lcoroy@mother-parkers.com", "Cellphone": "(905) 281-4340", "Linkedin": "https://www.linkedin.com/in/coroy/", "Company Size": "1k-5k", "Industry": "Food and Beverage Services", "Status": "attended"},
        {"First Name": "Dodii", "Last Name": "Villareal", "Company": "Dometic Marine Canada Inc.", "Title": "Director of IT", "Email": "dodii.villareal@dometic.com", "Cellphone": "(604) 358-7344", "Linkedin": "https://www.linkedin.com/in/cornelio-villareal-8243bb32/", "Company Size": "5k-10k", "Industry": "Manufacturing", "Status": "attended"},
        {"First Name": "Simon", "Last Name": "Sulyma", "Company": "Manulife", "Title": "Assistant VP, Information Risk", "Email": "simon_sulyma@manulife.com", "Cellphone": "(613) 558-2358", "Linkedin": "https://www.linkedin.com/in/simonsulyma/", "Company Size": "10k+", "Industry": "Financial Services", "Status": "attended"},
        {"First Name": "Antonio", "Last Name": "Albeshelani", "Company": "PSL Group", "Title": "CTO", "Email": "antonio.albeshelani@pslgroup.com", "Cellphone": "(514) 300-1414", "Linkedin": "https://www.linkedin.com/in/antonioalbeshelani/", "Company Size": "1k-5k", "Industry": "Medical Devices", "Status": "attended"},
        {"First Name": "Loredana", "Last Name": "Marconi", "Company": "GardaWorld", "Title": "Director Cybersecurity Awareness and Training", "Email": "loredana.marconi@garda.com", "Cellphone": "(514) 566-7950", "Linkedin": "https://www.linkedin.com/in/loredana-m-a0688472/", "Company Size": "10k+", "Industry": "Security and Investigations", "Status": "attended"},
        {"First Name": "Ammar", "Last Name": "Yousef", "Company": "Canada Life", "Title": "Director, Technology Resiliency, Recovery, Risk and Business Continuity", "Email": "ammar.yousef@canadalife.com", "Cellphone": "(416) 805-8955", "Linkedin": "https://www.linkedin.com/in/ammarresilience/", "Company Size": "10k+", "Industry": "Financial Services", "Status": "attended"},
        {"First Name": "Mohammad", "Last Name": "Pilehvari", "Company": "CIBC Mellon", "Title": "Head of Enterprise Architecture and Solution Delivery", "Email": "mohammad.pilehvari@cibcmellon.com", "Cellphone": "(416) 903-2685", "Linkedin": "https://www.linkedin.com/in/mpilehvari/", "Company Size": "1k-5k", "Industry": "Financial Services", "Status": "attended"},
        {"First Name": "Gursharan", "Last Name": "Arora", "Company": "FGF Brands Inc.", "Title": "VP, IT Operations", "Email": "garora@fgfbrands.com", "Cellphone": "(416) 988-7612", "Linkedin": "https://www.linkedin.com/in/gursharan-arora-596935159/", "Company Size": "1k-5k", "Industry": "Manufacturing/CPG", "Status": "attended"},
        {"First Name": "Hardik", "Last Name": "Pandya", "Company": "FGF Brands Inc.", "Title": "VP, IT Service Excellence", "Email": "hardik.pandya@fgfbrands.com", "Cellphone": "(416) 671-6211", "Linkedin": "https://www.linkedin.com/in/hardik-pandya-ph-d-b23671b2/", "Company Size": "1k-5k", "Industry": "Manufacturing/CPG", "Status": "attended"},
        {"First Name": "Mushtaq", "Last Name": "Ahmed", "Company": "FGF Brands Inc.", "Title": "VP, IT Risk Management", "Email": "mushtaq@fgfbrands.com", "Cellphone": "(647) 972-2220", "Linkedin": "https://www.linkedin.com/in/mushtaq-ahmed-cigo-64095010/", "Company Size": "1k-5k", "Industry": "Manufacturing/CPG", "Status": "attended"},
        {"First Name": "Momchil", "Last Name": "Karov", "Company": "Vancouver Community College", "Title": "Director, Information Security", "Email": "mkarov@vcc.ca", "Cellphone": "(236) 833-9687", "Linkedin": "https://www.linkedin.com/in/momchil-karov/", "Company Size": "1k-5k", "Industry": "Higher Education", "Status": "attended"},
        {"First Name": "Gaetano", "Last Name": "Mazzuca", "Company": "The City of Red Deer", "Title": "CIO", "Email": "gaetano.mazzuca@reddeer.ca", "Cellphone": "(403) 350-2686", "Linkedin": "https://www.linkedin.com/in/gaetanomazzuca/", "Company Size": "1k-5k", "Industry": "Government, Municipal", "Status": "attended"},
        {"First Name": "Marvin", "Last Name": "Wong", "Company": "SECURE Waste Infrastructure", "Title": "VP - Technology", "Email": "mwong@secure.ca", "Cellphone": "(403) 771-4861", "Linkedin": "https://www.linkedin.com/in/marvin-wong-p-eng-29703614/", "Company Size": "1k-5k", "Industry": "Energy", "Status": "attended"},
        {"First Name": "Geoffrey", "Last Name": "Ren", "Company": "Canadian Red Cross", "Title": "CIO", "Email": "geoffrey.ren@redcross.ca", "Cellphone": "(438) 334-0228", "Linkedin": "https://www.linkedin.com/in/geoffrey-ren-96b89216/", "Company Size": "10k+", "Industry": "Non-profit Organizations", "Status": "attended"},
        {"First Name": "Farrukh", "Last Name": "Aman", "Company": "Scotiabank", "Title": "Head Commercial Transformation and Technology", "Email": "farrukh.aman@scotiabank.com", "Cellphone": "(647) 919-9681", "Linkedin": "https://www.linkedin.com/in/farrukhaman/", "Company Size": "10k+", "Industry": "Banking", "Status": "attended"},
        {"First Name": "Robin", "Last Name": "Mathew", "Company": "Canada Life", "Title": "Associate Vice President - Business Information Security", "Email": "robin.mathew@canadalife.com", "Cellphone": "(647) 469-8477", "Linkedin": "https://www.linkedin.com/in/mathewrobn/", "Company Size": "10k+", "Industry": "Insurance", "Status": "attended"},
        {"First Name": "Kunal", "Last Name": "Nayar", "Company": "KPMG", "Title": "Director", "Email": "kunalnayar@kpmg.ca", "Cellphone": "(416) 346-2673", "Linkedin": "https://www.linkedin.com/in/kunalnayar/", "Company Size": "10k+", "Industry": "Computers & Technology", "Status": "attended"},
        {"First Name": "Marjorie", "Last Name": "Hachavarria", "Company": "Manulife", "Title": "Director Information Security", "Email": "marjorie_hechavarria@manulife.com", "Cellphone": "(416) 786-4054", "Linkedin": "https://www.linkedin.com/in/marjorie-hechavarria-3a64455/", "Company Size": "10k+", "Industry": "Financial Services", "Status": "attended"},
        {"First Name": "Saravana", "Last Name": "Balaratnam", "Company": "Sheridan College", "Title": "Director of Technology Infrastructure & Cloud Services", "Email": "saravana.balaratnam@sheridancollege.ca", "Cellphone": "(905) 580-9207", "Linkedin": "https://www.linkedin.com/in/sbalaratnam/", "Company Size": "5k-10k", "Industry": "Higher Education", "Status": "attended"},
        {"First Name": "Peipei", "Last Name": "Shi", "Company": "CIBC", "Title": "Director, Data Protection Services", "Email": "peipei.shi@cibc.com", "Cellphone": "(416) 738-0286", "Linkedin": "https://www.linkedin.com/in/peipei-shi-04069b27/", "Company Size": "10k+", "Industry": "Banking & Insurance", "Status": "attended"},
        {"First Name": "Joyce", "Last Name": "Ip", "Company": "Capilano University", "Title": "Associate Vice President - Strategy, Analytics and Transformation", "Email": "joyceip@capilanou.ca", "Cellphone": "(236) 988-9359", "Linkedin": "https://www.linkedin.com/in/ipjoyce/", "Company Size": "1k-5k", "Industry": "Education & Training", "Status": "attended"},
        {"First Name": "Charles", "Last Name": "Loui-Ying", "Company": "QuadReal Property Group", "Title": "VP IT", "Email": "charles.loui-ying@quadreal.com", "Cellphone": "(604) 218-5972", "Linkedin": "https://www.linkedin.com/in/charles-loui-ying/", "Company Size": "1k-5k", "Industry": "Real Estate", "Status": "attended"},
        {"First Name": "Hanson", "Last Name": "Akpan", "Company": "TD", "Title": "Information Security Specialist", "Email": "hanson.akpan@td.com", "Cellphone": "(613) 400-1380", "Linkedin": "https://www.linkedin.com/in/hanson-udy-akpan-4b47909/", "Company Size": "10k+", "Industry": "Banking", "Status": "attended"},
        {"First Name": "Shawn", "Last Name": "Serson", "Company": "Farm Boy", "Title": "Director of IT", "Email": "sserson@farmboy.ca", "Cellphone": "(613)229-9627", "Linkedin": "https://www.linkedin.com/in/shawn-serson/", "Company Size": "5k-10k", "Industry": "Retail", "Status": "attended"},
        {"First Name": "Nastaran", "Last Name": "Bisheban", "Company": "VP CIO Association of Canada", "Title": "CIO", "Email": "nbisheban@yahoo.com", "Cellphone": "(647) 962-5505", "Linkedin": "https://www.linkedin.com/in/nastaranb/", "Company Size": "5k-10k", "Industry": "Healthcare", "Status": "attended"},
        {"First Name": "Umar", "Last Name": "Hossain", "Company": "Mattr", "Title": "Global Head of IT Infrastructure & Cybersecurity", "Email": "umar.hossain@mattr.com", "Cellphone": "(647) 821-7346", "Linkedin": "https://www.linkedin.com/in/uhossain/", "Company Size": "1k-5k", "Industry": "Manufacturing", "Status": "attended"},
        {"First Name": "Scott", "Last Name": "Lowell", "Company": "St Joseph's Healthcare Hamilton", "Title": "Chief Technology & Information Security Officer", "Email": "slowell@stjoes.ca", "Cellphone": "(289) 983-5439", "Linkedin": "https://www.linkedin.com/in/scottlowell/", "Company Size": "5k-10k", "Industry": "Healthcare", "Status": "attended"},
        {"First Name": "Yashu", "Last Name": "Kalia", "Company": "RBC", "Title": "Director of Internet Security", "Email": "yashu.kalia@rbc.com", "Cellphone": "(647) 962-1712", "Linkedin": "https://www.linkedin.com/in/yashu-kalia-a345b630/", "Company Size": "10k+", "Industry": "Financial Services", "Status": "attended"},
        {"First Name": "Derek", "Last Name": "Cullen", "Company": "Stikeman Elliott LLP", "Title": "CIO", "Email": "dcullen@stikeman.com", "Cellphone": "(416) 938-2143", "Linkedin": "https://www.linkedin.com/in/cullenderek/", "Company Size": "1k-5k", "Industry": "Law Practice", "Status": "attended"},
        {"First Name": "Richard", "Last Name": "Freilich", "Company": "Lynx Equity Limited", "Title": "Vice President - IT & Security", "Email": "rf@lynxequity.com", "Cellphone": "(416) 918-8549", "Linkedin": "https://www.linkedin.com/in/rfreilich/", "Company Size": "1k-5k", "Industry": "Other", "Status": "attended"},
        {"First Name": "Zain", "Last Name": "Haq", "Company": "Manulife", "Title": "Senior Director – Technology, Cybersecurity & Infrastructure Audits", "Email": "Zain_haq@manulife.com", "Cellphone": "(647) 501-2417", "Linkedin": "https://www.linkedin.com/in/zainhaq25/", "Company Size": "10k+", "Industry": "Financial Services", "Status": "attended"},
        {"First Name": "Priya", "Last Name": "Mouli", "Company": "Sheridan College", "Title": "Director - IT Security & information Security Officer", "Email": "priya.mouli@sheridancollege.ca", "Cellphone": "(647) 995-9787", "Linkedin": "https://www.linkedin.com/in/priya-mouli/", "Company Size": "1k-5k", "Industry": "Higher Education", "Status": "attended"},
        {"First Name": "Manny", "Last Name": "Kandola", "Company": "Ontario Tech University", "Title": "CTO", "Email": "manny@mannykandola.com", "Cellphone": "(416) 550-1388", "Linkedin": "https://www.linkedin.com/in/mkandola/", "Company Size": "1k-5k", "Industry": "Education & Training", "Status": "attended"},
        {"First Name": "Steve", "Last Name": "Rotella", "Company": "Woodbine Entertainment", "Title": "Sr. Security Manager", "Email": "srotella@woodbine.com", "Cellphone": "(416) 937-2361", "Linkedin": "https://www.linkedin.com/in/steve-rotella-4a4a7276/", "Company Size": "1k-5k", "Industry": "Entertainment", "Status": "attended"},
        {"First Name": "Cassondra", "Last Name": "Fonseca", "Company": "Four Seasons", "Title": "Director, GRC", "Email": "cassondra.fonseca@fourseasons.com", "Cellphone": "(647) 826-4022", "Linkedin": "https://www.linkedin.com/in/cassondrafonseca/", "Company Size": "10k+", "Industry": "Hospitality", "Status": "attended"},
        {"First Name": "Dele", "Last Name": "Sailu", "Company": "Aviva Canada", "Title": "Head, IT GRC Centre of Excellence", "Email": "dele.saliu@aviva.com", "Cellphone": "(647) 460-2176", "Linkedin": "https://www.linkedin.com/in/delesaliu/", "Company Size": "1k-5k", "Industry": "Insurance", "Status": "attended"},
        {"First Name": "Andrew", "Last Name": "Barnhardt", "Company": "Woodbine Entertainment", "Title": "Director, IT Operations", "Email": "abarnhardt@woodbine.com", "Cellphone": "(416) 788-0005", "Linkedin": "https://www.linkedin.com/in/abarnhardt/", "Company Size": "1k-5k", "Industry": "Entertainment", "Status": "attended"},
        {"First Name": "Alain", "Last Name": "Briere", "Company": "WSP Canada INC", "Title": "VP, OT Cybersecurity National Practice", "Email": "alain.briere@wsp.com", "Cellphone": "(514) 265-4143", "Linkedin": "https://www.linkedin.com/in/alain-briere-2483b513a/", "Company Size": "10k+", "Industry": "Professional Services", "Status": "attended"},
        {"First Name": "Joyce", "Last Name": "Fortin", "Company": "Shared Services Canada", "Title": "Director", "Email": "joyce.fortin@ssc-spc.gc.ca", "Cellphone": "(613) 266-7884", "Linkedin": "", "Company Size": "", "Industry": "", "Status": "attended"},
        {"First Name": "Alfio", "Last Name": "Constantino", "Company": "Canada Cartage", "Title": "Director, IT Infrastructure, Operations and Security", "Email": "alfio_costantino@canadacartage.com", "Cellphone": "(416) 669-6046", "Linkedin": "https://www.linkedin.com/in/alfiocostantino/", "Company Size": "1k-5k", "Industry": "Truck Transportation", "Status": "cancelled"},
        {"First Name": "Mark", "Last Name": "Bosca", "Company": "Adentra", "Title": "Director of IT & Cybersecurity", "Email": "mbasco@adentragroup.com", "Cellphone": "(604) 512-3247", "Linkedin": "https://www.linkedin.com/in/mark-basco-22a13327/", "Company Size": "1k-5k", "Industry": "Wholesale Building Materials", "Status": "cancelled"},
        {"First Name": "Flavio", "Last Name": "Soares", "Company": "Vertex Resource Group", "Title": "Head of IT", "Email": "fsoares@vertex.ca", "Cellphone": "(780) 937-2352", "Linkedin": "https://www.linkedin.com/in/fso-tech/", "Company Size": "1k-5k", "Industry": "Environmental Services", "Status": "cancelled"},
        {"First Name": "Ali", "Last Name": "Shahidi", "Company": "Toronto Community Housing", "Title": "CISO", "Email": "ali.shahidi@torontohousing.ca", "Cellphone": "(416) 981-5056", "Linkedin": "https://www.linkedin.com/in/ali-shahidi-cybersecurity-senior-leader/", "Company Size": "1k-5k", "Industry": "Government Administration", "Status": "cancelled"},
        {"First Name": "Ijaaz", "Last Name": "Ullah", "Company": "OSL Retail Services", "Title": "Vice president, Information Technology", "Email": "Iullah@osrlrs.com", "Cellphone": "(416)566-6880", "Linkedin": "", "Company Size": "5k-10k", "Industry": "Retail & Wholesale", "Status": "cancelled"},
        {"First Name": "Angela", "Last Name": "Mccarthy", "Company": "NSCC (Nova Scotia Community College)", "Title": "Senior Manager Infrastructure and Enterprise Service", "Email": "angela.mccarthy@nscc.ca", "Cellphone": "(902) 717-1208", "Linkedin": "https://www.linkedin.com/in/angela-mccarthy-8078676/", "Company Size": "1k-5k", "Industry": "Higher Education", "Status": "cancelled"},
        {"First Name": "Alistair", "Last Name": "Forsyth", "Company": "VHA Home Healthcare", "Title": "VP Digital Health & CIO", "Email": "aforsyth@vha.ca", "Cellphone": "(416) 346-8338", "Linkedin": "https://www.linkedin.com/in/alistair-forsyth-36b81378/", "Company Size": "1k-5k", "Industry": "Healthcare", "Status": "cancelled"},
        {"First Name": "Harneek", "Last Name": "Khurana", "Company": "Parkland Corp", "Title": "Dir IT Planning and Architecture", "Email": "harneek.khurana@parkland.ca", "Cellphone": "(587) 917-2552", "Linkedin": "https://www.linkedin.com/in/harneek-khurana/", "Company Size": "5k-10k", "Industry": "Oil and Gas", "Status": "cancelled"},
        {"First Name": "Zulqurnain", "Last Name": "Khan", "Company": "Parkland Corp", "Title": "CISO", "Email": "zkhan@parkland.ca", "Cellphone": "(587) 890-7171", "Linkedin": "https://www.linkedin.com/in/zulqurnainkhan", "Company Size": "5k-10k", "Industry": "Oil and Gas", "Status": "cancelled"},
        {"First Name": "Charlie", "Last Name": "Charalambous", "Company": "Amica Senior Lifestyles", "Title": "VP, Information Technology", "Email": "c.charalambous@amica.ca", "Cellphone": "(416) 951-3852", "Linkedin": "https://www.linkedin.com/in/cccharlie/", "Company Size": "1k-5k", "Industry": "Healthcare", "Status": "cancelled"},
        {"First Name": "Saumyata", "Last Name": "Kaushik", "Company": "Government of British Columbia", "Title": "Director IM/IT", "Email": "saumyata.kaushik@gov.bc.ca", "Cellphone": "(250) 580-8197", "Linkedin": "https://www.linkedin.com/in/saumyata-kaushik-b896016/", "Company Size": "10k+", "Industry": "Government Administration", "Status": "cancelled"},
        {"First Name": "Shaun", "Last Name": "Guthrie", "Company": "RJC Engineers", "Title": "Vice President of Technical Services", "Email": "shaun.guthrie@gmail.com", "Cellphone": "(780) 718-2150", "Linkedin": "https://www.linkedin.com/in/shaunguthrie", "Company Size": "1k-5k", "Industry": "Civil Engineering", "Status": "cancelled"}
      ]
    }
  ]
};

function escapeSQL(str) {
  if (!str) return null;
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function generateSQL() {
  let sqlStatements = [];

  for (const event of jsonData.events) {
    for (const attendee of event.attendees) {
      const firstName = escapeSQL(attendee['First Name'] || '');
      const lastName = escapeSQL(attendee['Last Name'] || '');
      const fullName = `${attendee['First Name'] || ''} ${attendee['Last Name'] || ''}`.trim();
      const email = escapeSQL(attendee.Email);
      const phone = escapeSQL(attendee.Cellphone);
      const company = escapeSQL(attendee.Company);
      const title = escapeSQL(attendee.Title);
      const status = attendee.Status === 'cancelled' ? 'cancelled' : attendee.Status;
      const eventName = escapeSQL(event.forum_name);
      const eventDate = event.event_date || '2025-02-15';
      const linkedin = escapeSQL(attendee.Linkedin);
      const notes = linkedin ? `LinkedIn: ${linkedin}` : null;

      sqlStatements.push(
        `('${COMMVAULT_SPONSOR_ID}', '${escapeSQL(fullName)}', ${email ? `'${email}'` : 'NULL'}, ${phone ? `'${phone}'` : 'NULL'}, ${company ? `'${company}'` : 'NULL'}, ${title ? `'${title}'` : 'NULL'}, '${status}', '${eventName}', 'forum', '${eventDate}', 'commvault', ${notes ? `'${escapeSQL(notes)}'` : 'NULL'})`
      );
    }
  }

  return sqlStatements.join(',\n');
}

const sql = `/*
  # Import Commvault Historical Attendees

  1. Summary
    - Imports 261 historical attendees for Commvault across 3 forum events
    - Events: Canada IT & Security Leaders Forum, CISO National Forum, CISO 2 National Forum
    - Source: Commvault attendee database export

  2. Details
    - Sponsor: Commvault (6e048704-504b-474c-93bc-8c1e5feb265d)
    - Total records: 261 (208 attended, 53 cancelled)
    - Event types: Forum
    - Source database: commvault
*/

INSERT INTO historical_attendees (sponsor_id, name, email, phone, company, title, attendance_status, event_name, event_type, event_date, source_database, notes)
VALUES
${generateSQL()};
`;

fs.writeFileSync('supabase/migrations/20260205034000_import_commvault_historical_attendees.sql', sql);
console.log('Migration file created successfully!');
console.log(`Total attendees to be imported: ${jsonData.total_attendees_all_events}`);
