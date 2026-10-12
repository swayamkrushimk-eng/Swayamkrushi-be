import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import MediaBuzz from './models/MediaBuzz.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const MEDIA_BUZZ_DATA = [
  {
    id: 'deccan-chronicle-35-years',
    title: 'Swayamkrushi Marks 35 Years Of Empowering Persons With Disabilities',
    outlet: 'Deccan Chronicle',
    outletType: 'Digital & Magazines',
    date: 'August 2026',
    category: 'Digital Press',
    badge: 'DECCAN CHRONICLE',
    image: '',
    isClipping: false,
    excerpt: 'Deccan Chronicle spotlights Swayamkrushi’s milestone 35th anniversary, celebrating more than three decades of pioneering residential care, vocational skill building, and dedicated support for persons with intellectual disabilities.',
    readTime: '3 min read',
    tags: ['Deccan Chronicle', '35 Years', 'Milestone Celebration', 'Special Education'],
    articleUrl: 'https://www.deccanchronicle.com/southern-states/telangana/swayamkrushi-marks-35-years-of-empowering-persons-with-disabilities-1975055',
    featured: true,
    order: 1
  },
  {
    id: 'telangana-today-35-years',
    title: 'Swayamkrushi Marks 35 Years of Empowering Persons with Intellectual Disabilities',
    outlet: 'Telangana Today',
    outletType: 'Digital & Magazines',
    date: 'August 2026',
    category: 'Online Edition',
    badge: 'TELANGANA TODAY',
    image: '',
    isClipping: false,
    excerpt: 'Telangana Today spotlights the 35th-anniversary celebration of Swayamkrushi, highlighting the school, women’s group homes, and university-affiliated collegiate institution empowering persons with intellectual disabilities.',
    readTime: '4 min read',
    tags: ['Telangana Today', '35 Years', 'Hyderabad', 'Special Education'],
    articleUrl: 'https://telanganatoday.com/swayamkrushi-marks-35-years-of-empowering-persons-with-intellectual-disabilities',
    featured: true,
    order: 2
  },
  {
    id: 'newsmeter-classrooms-to-careers',
    title: 'From Classrooms to Careers, Hyderabad’s Swayamkrushi Has Been Empowering Lives for Over 3 Decades',
    outlet: 'NewsMeter',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'In-Depth Feature',
    badge: 'FEATURE STORY',
    image: '',
    isClipping: false,
    excerpt: 'A comprehensive investigation into how Swayamkrushi nurtures children with intellectual challenges into self-reliant adults equipped with job skills, emotional independence, and dignified careers across corporate and creative fields.',
    readTime: '5 min read',
    tags: ['NewsMeter', 'Career Transitions', 'Vocational Training', '3 Decades'],
    articleUrl: 'https://newsmeter.in/hyderabad/from-classrooms-to-careers-hyderabads-swayamkrushi-has-been-empowering-lives-for-over-3-decades-772608',
    featured: true,
    order: 3
  },
  {
    id: 'mana-telangana-35-years',
    title: 'Mana Telangana: 35 ఏళ్ల స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Mana Telangana',
    outletType: 'Print & Newspapers',
    date: '04/08/2026',
    category: 'Regional Press',
    badge: 'MANA TELANGANA E-PAPER',
    image: '',
    isClipping: false,
    excerpt: 'మన తెలంగాణ దినపత్రిక కథనం: మూడున్నర దశాబ్దాల పాటు మేధో వైకల్యం కలిగిన వ్యక్తుల విద్య, జీవనోపాధి, సాధికారతకు విశేష కృషి చేస్తున్న స్వయంకృషి సంస్థ ప్రస్థానం.',
    readTime: 'Telugu E-Paper',
    tags: ['Mana Telangana', '35 Years', 'Telugu E-Paper', 'Hyderabad'],
    articleUrl: 'https://epaper.manatelangana.news/4183407/HYDERABAD/04-08-2026#issue/4/2',
    featured: false,
    order: 4
  },
  {
    id: 'telangana-today-epaper-35-years',
    title: 'Telangana Today E-Paper: Swayamkrushi 35 Years Milestone Coverage',
    outlet: 'Telangana Today',
    outletType: 'Print & Newspapers',
    date: 'August 2026',
    category: 'E-Paper & Print',
    badge: 'TELANGANA TODAY E-PAPER',
    image: '',
    isClipping: false,
    excerpt: 'Telangana Today print & e-paper edition feature on Swayamkrushi’s 35th milestone, celebrating founder Manjulaa Kalyaan and the journey of special education in Secunderabad.',
    readTime: 'E-Paper Edition',
    tags: ['Telangana Today', 'E-Paper', 'Hyderabad District', 'Special Education'],
    articleUrl: 'https://epaper.telanganatoday.com/article/Hyderabad?OrgId=30830d8e731&imageview=1&standalone=1&device=desktop',
    featured: false,
    order: 5
  },
  {
    id: 'newsmeter-bharati-saini-art',
    title: 'Art Without Limits: Uttarakhand Artist Bharati Saini Turns Elbow Stumps into Tools for Painting',
    outlet: 'NewsMeter',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Fine Arts & Inclusion',
    badge: 'HUMAN IMPACT',
    image: '',
    isClipping: false,
    excerpt: 'An inspiring profile on artist Bharati Saini, who triumphed over adversity to produce breathtaking paintings, highlighting the boundless creative potential fostered within the Swayamkrushi family.',
    readTime: '4 min read',
    tags: ['Fine Arts', 'Inspiring Story', 'NewsMeter', 'Creative Vocational'],
    articleUrl: 'https://newsmeter.in/lifestyle/art-without-limits-uttarakhand-artist-bharati-saini-turns-elbow-stumps-into-tools-for-painting-774531',
    featured: false,
    order: 6
  },
  {
    id: 'sakshi-hyderabad-district',
    title: 'Sakshi Hyderabad District Edition: 35 ఏళ్ల స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Sakshi Telugu Daily',
    outletType: 'Print & Newspapers',
    date: '09/08/2026',
    category: 'Regional Press',
    badge: 'SAKSHI E-PAPER',
    image: '',
    isClipping: false,
    excerpt: 'సాక్షి హైదరాబాద్ ఎడిషన్ కథనం: మూడున్నర దశాబ్దాలుగా మానసిక వికలాంగుల వికాసం, విద్యాబోధన, జీవనోపాధి కల్పిస్తున్న స్వయంకృషి సంస్థ సేవలు ఆదర్శనీయం.',
    readTime: 'Telugu E-Paper',
    tags: ['Sakshi Daily', 'Telugu E-Paper', 'District Edition', 'Residential Care'],
    articleUrl: 'https://epaper.sakshi.com/login/loginpage?ReturnUrl=%2fHyderabad_Main%3feid%3d123%26edate%3d09%2f08%2f2026%26pgid%3d916473%26device%3dmobile%26view%3d0%26sedId%3d0%26uemail%3d&eid=123&edate=09/08/2026&pgid=916473&device=mobile&view=0&sedId=0&uemail=',
    featured: false,
    order: 7
  },
  {
    id: 'hindu-35-years-milestone',
    title: 'NGO Celebrates 35 Years of Serving Persons with Intellectual Disabilities',
    outlet: 'The Hindu',
    outletType: 'Print & Newspapers',
    date: 'August 2026',
    category: 'Newspaper Clipping',
    badge: 'THE HINDU SPOTLIGHT',
    image: '',
    isClipping: true,
    excerpt: 'Swayamkrushi, a Hyderabad-based non-profit organisation working for persons with intellectual disabilities, is celebrating 35 years of service with a focus on education, vocational training and independent living. Founder Manjulaa Kalyaan was felicitated by dignitaries.',
    readTime: 'Newspaper Report',
    tags: ['The Hindu', '35th Anniversary', 'Founder Felicitation', 'Special Education'],
    articleUrl: 'https://share.google/YhznuCLOlokk6iVY6',
    featured: true,
    order: 8
  },
  {
    id: 'eenadu-epaper-2026-10-10',
    title: 'Eenadu E-Paper: 35 ఏళ్ల స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Eenadu Telugu Daily',
    outletType: 'Print & Newspapers',
    date: '10/10/2026',
    category: 'Regional Press',
    badge: 'EENADU E-PAPER',
    image: '',
    isClipping: false,
    excerpt: 'ఈనాడు దినపత్రిక కథనం: మేధో వైకల్యం కలిగిన వ్యక్తుల సాధికారత, విద్యాబోధన, జీవనోపాధి మరియు సంరక్షణకు విశేష కృషి చేస్తున్న స్వయంకృషి సంస్థ ప్రస్థానం.',
    readTime: 'Telugu E-Paper',
    tags: ['Eenadu', 'Telugu E-Paper', 'Regional Press', 'Special Education'],
    articleUrl: 'https://epaper.eenadu.net/Home/Index?date=10/10/2026&eid=239&pid=3613532',
    featured: false,
    order: 9
  },
  {
    id: 'ninadam-telangana-2026-10-10',
    title: 'Ninadam Telangana: స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Ninadam News',
    outletType: 'Print & Newspapers',
    date: '10/10/2026',
    category: 'Regional Press',
    badge: 'NINADAM E-PAPER',
    image: '',
    isClipping: false,
    excerpt: 'నినాదం తెలంగాణ దినపత్రిక కథనం: ప్రత్యేక అవసరాలు గల వ్యక్తుల అభ్యున్నతి, సంరక్షణ మరియు జీవనోపాధి కల్పిస్తున్న స్వయంకృషి సంస్థ విశేష సేవా కథనం.',
    readTime: 'Telugu E-Paper',
    tags: ['Ninadam News', 'Telugu E-Paper', 'Telangana', 'Community Care'],
    articleUrl: 'https://epaper.ninadamnews.com/paper.php?date=2026-10-10&edition=80',
    featured: false,
    order: 10
  },
  {
    id: 'andhra-prabha-rangareddy-2026-10-10',
    title: 'Andhra Prabha Rangareddy Edition: స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Andhra Prabha',
    outletType: 'Print & Newspapers',
    date: '10/10/2026',
    category: 'Regional Press',
    badge: 'ANDHRA PRABHA E-PAPER',
    image: '',
    isClipping: false,
    excerpt: 'ఆంధ్రప్రభ రంగారెడ్డి జిల్లా ఎడిషన్ కథనం: మేధోపరమైన సవాళ్లు ఉన్న వ్యక్తులకు విద్యాబోధన, వృత్తి శిక్షణ మరియు పునరావాస సేవలందిస్తున్న స్వయంకృషి సంస్థ ప్రస్థానం.',
    readTime: 'Telugu E-Paper',
    tags: ['Andhra Prabha', 'Rangareddy District', 'Telugu E-Paper', 'Vocational Training'],
    articleUrl: 'https://epaper.prabhanews.com/viewer/?date=2026-10-10&section=Telangana+Districts&edition=Rangareddy&page=2',
    featured: false,
    order: 11
  },
  {
    id: 'andhra-jyothy-uppal-malkajgiri-2026-10-10',
    title: 'Andhra Jyothy Uppal-Malkajgiri Edition: స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Andhra Jyothy',
    outletType: 'Print & Newspapers',
    date: '10/10/2026',
    category: 'Regional Press',
    badge: 'ANDHRA JYOTHY E-PAPER',
    image: '',
    isClipping: false,
    excerpt: 'ఆంధ్రజ్యోతి ఉప్పల్-మల్కాజ్‌గిరి ఎడిషన్ కథనం: మూడున్నర దశాబ్దాలుగా మానసిక వికలాంగుల వికాసం, విద్యాబోధన, సంరక్షణ మరియు జీవనోపాధి కల్పిస్తున్న స్వయంకృషి సంస్థ.',
    readTime: 'Telugu E-Paper',
    tags: ['Andhra Jyothy', 'Uppal Malkajgiri', 'Telugu E-Paper', 'Special Education'],
    articleUrl: 'https://epaper.andhrajyothy.com/Hyd_Uppal_Malkajgiri?eid=122&edate=10/10/2026&pgid=1524855&device=desktop&view=3',
    featured: false,
    order: 12
  }
]

async function seedMediaBuzz() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swayamkrushi'
  console.log('Connecting to MongoDB:', mongoUri)
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    for (const item of MEDIA_BUZZ_DATA) {
      await MediaBuzz.findOneAndUpdate(
        { id: item.id },
        { $set: item },
        { upsert: true, new: true }
      )
    }
    console.log(`Successfully seeded ${MEDIA_BUZZ_DATA.length} Media Buzz articles into MongoDB.`)
  } catch (err) {
    console.error('Error seeding Media Buzz:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
  }
}

seedMediaBuzz()
