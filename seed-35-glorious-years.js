import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import mongoose from 'mongoose'
import Article from './models/Article.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadEnv() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m) return
      const key = m[1]
      let val = m[2]
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    })
  } catch {}
}
loadEnv()

const paragraphs = [
  "Swayamkrushi celebrated its Coral Jubilee (35th anniversary) at a grand function on Monday, November 16, on its Jawahar Nagar campus. The function was well attended and several VVIPs graced the occasion, reflecting not only the organization's popularity but also the magnetic charisma of its founder-director Manjulaa Kalyaan.",
  "Former Vice President M Venkaiah Naidu delivered a moving, inspiring and motivating speech while Telangana Minister for Panchayat Raj, Rural Development and Women and Child Welfare Seethakka visited the campus, went around the school, saw the products made by students with intellectual disabilities and interacted with staff and students. The Minister appreciated the excellent work and said she was amazed by the skills displayed by the students, all of them with intellectual disabilities. She, along with Manjulaa Kalyaan and Group Captain T Suresh, Swayamkrushi's Secretary, then cut a cake to mark the milestone occasion. She also lit a series of 35 lamps signifying the 35 years of the organization's service to persons with intellectual disabilities at the main venue on Coral Ground before leaving for her other engagements. The Minister promised Manjulaa Kalyaan that she would return to the institute at a later date and spend more time with everyone.",
  "Guests of Honour D Amar, a veteran journalist and former advisor, Inter-State Relations and National Media, Government of Andhra Pradesh, and V V Lakshminarayana, former Joint Director, CBI, who led the investigations into several prominent cases, and now a social activist, were present throughout the two-hour programme. They also delivered brief speeches highlighting the cause of care, welfare and integration of persons with intellectual disabilities with mainstream society besides lauding the efforts of Manjulaa Kalyaan. Amar also rolled out the new website of Swayamkrushi while Lakshminarayana released the souvenir brought out on the occasion.",
  "The programme then kick-started with Vande Mataram and the special Swayamkrushi song, a kind of anthem for the organization penned by Manjulaa Kalyaan. Then followed a variety of cultural programmes put up by children with intellectual disabilities, teachers and other staff. The cultural programmes included a short skit on Ramayana by children with intellectual disabilities and choreographed by Sucherita, a musical entertainment aptly called 'Kitchen Orchestra' using only kitchen utensils, again by a group of children with intellectual disabilities trained by teachers Suhasini and Jayasri, and 'Kollatam,' a high-energy folk-dance performance put up by teachers and other staff. All the programmes were highly appreciated by the guests with thunderous applause. A battery of mediapersons also descended on the venue and the media coverage that followed was stupendous.",
  "Group Captain Suresh presented the Secretary's report while Principal Dr Sarada delivered the welcome address, both capturing the organization's journey and progress over the years. Head of Department Dr PVB Sudhakar brought the curtains down with a vote of thanks.",
  "Read on, see and hear for a complete picture of the happenings and speeches on that memorable Monday.",
  "Former Vice President M Venkaiah Naidu has emphasised on the need to inspire the youth of the country to participate in meaningful social initiatives such as providing equal opportunities, respect and dignity to persons with intellectual disabilities on par with other members of society.",
  '"Young people must understand that nation-building is not confined to economic growth or technological advancement. It also involves building a compassionate, caring and inclusive society. Service to persons who need additional support is among the noblest expressions of social responsibility," he said.',
  "Mr Naidu was speaking at the Coral Jubilee (35th anniversary) celebrations of Swayamkrushi, a Secunderabad-based not-for-profit organisation involved in the care, welfare, rehabilitation and integration of persons with intellectual disabilities here on Monday.",
  'In his virtual address to the gathering, Mr Naidu said: "Our responsibility as a society is to create an environment in which they can realise their potential and lead fulfilling lives. They have their own abilities, aspirations and potential. This is something that Swayamkrushi founder-director Ms. Manjulaa Kalyaan recognised in 1991, when she founded the organisation."',
  "The former Vice President pointed out that what persons with intellectual disabilities needed was not sympathy, but understanding, encouragement, appropriate support and opportunities to develop their capabilities.",
  'Stating that one must recognise the fact that 35 years of dedicated service was a significant milestone for Swayamkrushi, he said it does not merely represent the passage of time, but three and a half decades of commitment, compassion and an unwavering belief in the potential of every individual. "I wholeheartedly congratulate Ms. Manjulaa Kalyaan, Group Captain Suresh, other members of the management, the dedicated staff and volunteers, and all those who have contributed to this inspiring journey," he added.',
  'Commending Swayamkrushi for its emphasis on personalised education to each and every person with intellectual disabilities, Mr Naidu said: "Every individual, as we know, is unique. Each person has different abilities, learning capacities and developmental needs. Therefore, education and training must be designed to recognise these differences and respond to individual requirements."',
  "Swayamkrushi by adopting this approach has helped individuals acquire knowledge, develop practical skills and gain greater confidence in themselves, he observed.",
  '"Over the past 35 years, I am told it has done pioneering work in empowering Persons with Intellectual Disabilities. Its comprehensive range of programmes, I learn, addresses their diverse needs through personalised educational programmes, vocational skill development and training in independent living skills," he said.',
  'Pointing out that Swayamkrushi\'s focus on vocational training and independent living skills was equally important, Mr Naidu said these initiatives go beyond imparting technical abilities. "They prepare individuals to participate more meaningfully in everyday life. They promote self-reliance, encourage decision-making and enable persons with intellectual disabilities to contribute to their families and communities. Every skill acquired, every milestone achieved and every step towards independence is a significant personal victory," he said.',
  'Stating that the larger significance of Swayamkrushi\'s work lies in its vision of creating an inclusive society, the former Vice President said inclusion must become a reality in our homes, educational institutions, workplaces and public spaces. "We must build a society in which persons with intellectual disabilities are accepted, respected and provided equal opportunities to learn, grow and participate," he added.',
  '"An inclusive society is one that recognises abilities rather than limitations. It is one that values every individual and ensures that nobody is left behind. The dignity and self-esteem of persons with intellectual disabilities must remain at the heart of all our efforts," he said.',
  'Mr Naidu said: "While Swayamkrushi has every reason to be proud of its achievements over these 35 years, in the larger scheme of things, much more remains to be done. We need greater public awareness, stronger community participation and wider institutional support. Families, educational institutions, employers, civil society organisations and governments must work together to advance this cause."',
  "Pointing out to the several awards bestowed on Ms Manjulaa Kalyaan, Mr Naidu said she was recognised for the pioneering work she had done, particularly in promoting the Group Homes concept in 1991, much ahead of it being ratified by the Government of India.",
  "Besides running a school and hostel for girls with intellectual disabilities (above the age of 18 years), Swayamkrushi also offers a B Ed course in Special Education (affiliated to Osmania University) and is getting ready to introducing a Masters course too.",
  'Commending Swayamkrushi\'s management and all the others associated with the organisation for their outstanding contribution, Mr Naidu said: "Your commitment has transformed lives, strengthened families and given hope to countless individuals. May you continue this noble mission with the same passion, perseverance and purpose for many more decades besides continuing to inspire the youth and motivating society to take up such work."',
  "Meanwhile, the Telangana Minister for Panchayatraj and Rural Development and Women and Child Welfare Seethakka visited the Swayamkrushi campus and interacted with founder-director Manjulaa Kalyaan, staff and students. Going around the stalls set up to display the products made by persons with intellectual disabilities, the Minister said she was amazed by the skills developed by the students. She appreciated the work being carried out by the organization, and particularly commended the dedication and compassion of Manjulaa Kalyaan.",
  'Speaking on the occasion, JD Lakshminarayana, former IPS officer and social activist, lauded the yeoman services being rendered by Swayamkrushi and described Manjulaa Kalyaan as the "pillar of India" for her unique contribution to the society.',
  "Recalling his family's close association with Swayamkrushi's mission, particularly his elder sister late Kanaka Durga's role as the principal of the institution, he said it was heartwarming to learn about the founder's proposal to set up a university in memory of his sister.",
  '"You are achieving excellence in the field because of your dedicated work over decades," Lakshminarayana said.',
  "In his address, veteran journalist and former advisor, Inter-State relations and National Media to Government of Andhra Pradesh Devulapalli Amar lamented that the media was largely failing in its duty to highlight the selfless work being done by organizations like Swayamkrushi. He called upon journalists to turn their attention to the social issues and acts of empathy and compassion, instead of getting obsessed over political and crime news.",
  '"If the media focuses on the work being done by organizations like Swayamkrushi, it will inspire more and more people to take up such missions," he said.'
]

const contentHtml = [
  `<p class="article-lede"><strong>${paragraphs[0]}</strong></p>`,
  ...paragraphs.slice(1, 6).map((p) => `<p>${p}</p>`),
  '<h2>Participate in meaningful social initiatives: Venkaiah Naidu tells youth</h2>',
  ...paragraphs.slice(6, 22).map((p) => `<p>${p}</p>`),
  '<h2>Seethakka visits campus, appreciates work</h2>',
  ...paragraphs.slice(22).map((p) => `<p>${p}</p>`)
].join('\n')

export const gloriousYearsArticle = {
  id: '35-glorious-years',
  title: '35 years of glory!',
  excerpt: paragraphs[0],
  paragraphs,
  contentHtml,
  category: 'Stories & Milestones',
  section: 'main',
  attribution: 'Swayamkrushi Archives',
  featuredMediaType: 'text',
  mediaType: 'text',
  videoUrl: '',
  videoThumbnailUrl: '',
  videoPosterUrl: '',
  imageUrl: '',
  imageAlt: '',
  hasThumbnail: false,
  featured: true,
  order: 8
}

async function run() {
  const completePath = path.join(__dirname, '../swayamkrushi/src/data/articles_complete.json')
  const articles = JSON.parse(fs.readFileSync(completePath, 'utf8'))
  const existingIdx = articles.findIndex((a) => a.id === '35-glorious-years')
  if (existingIdx !== -1) articles.splice(existingIdx, 1)
  const insertAt = articles.findIndex((a) => a.id === 'building-blocks')
  const localDoc = {
    _id: '6ac7f2c1c0ea93c488f735de',
    ...gloriousYearsArticle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0
  }
  if (insertAt === -1) articles.unshift(localDoc)
  else articles.splice(insertAt, 0, localDoc)
  fs.writeFileSync(completePath, JSON.stringify(articles, null, 2))
  console.log('Updated articles_complete.json')

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI
  if (!mongoUri) {
    console.warn('No MONGO_URI — skipped DB seed')
    return
  }
  await mongoose.connect(mongoUri)
  await Article.findOneAndUpdate(
    { id: gloriousYearsArticle.id },
    { $set: gloriousYearsArticle },
    { upsert: true, new: true }
  )
  console.log('Seeded 35-glorious-years into MongoDB')
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
