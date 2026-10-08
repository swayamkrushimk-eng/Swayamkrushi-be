import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cloudinary from './config/cloudinary.js'
import Article from './models/Article.js'
import Accolade from './models/Accolade.js'
import Certificate from './models/Certificate.js'
import Faq from './models/Faq.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

// Helper to safely upload a local image to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'swayamkrushi') => {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found for upload: ${filePath}`)
      return null
    }

    const isSvg = filePath.endsWith('.svg')
    console.log(`Uploading to Cloudinary: ${path.basename(filePath)}...`)
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      use_filename: true,
      unique_filename: false,
      resource_type: isSvg ? 'raw' : 'image'
    })
    return result.secure_url
  } catch (err) {
    console.warn(`Cloudinary upload note for ${path.basename(filePath)}: ${err.message}`)
    return null
  }
}

// ── DATA SOURCES ─────────────────────────────────────────────────────────────

const leftArticlesData = [
  {
    id: "story-thinking",
    title: "Thinking Out of the Box!",
    excerpt: "Short of resources in the early days, Manjula Kalyan started the “DOS” club — Dal, Oil, Sugar — asking neighbours to buy one extra kilo on their monthly grocery run. Then came the collection boxes she left in school assemblies.",
    attribution: "Fun Facts",
    section: "left",
    category: "Fun Facts",
    imageFile: "thinking-box.svg",
    paragraphs: [
      "The going wasn’t easy for Manjula Kalyan when she first set up Swayamkrushi to make her dream of caring for girls with intellectual disabilities a reality. Equipped as she was with tons of experience in the field having worked with various organisations in the same line besides a masters in special education, Manjula realised that she would have to think of ingenuous ways to raise resources to run the organisation. That was when she hit upon the brilliant idea of launching the “DOS” club to tap the women in her neighbourhood for resources. DOS, in case you are scratching your head over what it meant, was just ‘Dal, Oil, Sugar’ - plain and simple.",
      "Manjula asked the womenfolk in her neighbourhood to buy an extra kg of these three commodities or any other kitchen ingredient for that matter when they go shopping for their monthly groceries. The idea was a runaway success!",
      "In another novel initiative, she visited some schools carrying a closed box with an opening on top. She attended the school assemblies, explained to the children the plight of their less fortunate brethren in Swayamkrushi, and asked them to bring something that they used on a daily basis and drop it in the box. It could be a toothbrush, a comb, a cake of soap or a shampoo sachet. And soon enough, the boxes she placed in the school premises were full with such simple stuff which she used for ‘her children’ in the organisation.",
      "How’s that for thinking out of the box?"
    ]
  },
  {
    id: "story-visa",
    title: "Visa to Go Abroad",
    excerpt: "A B.Ed from Swayamkrushi has become something close to a passport. Between 75 and 80 per cent of each graduating batch is placed overseas — thirty-six alumni in Atlanta alone. Which is why the institute has now introduced a three-year bond.",
    attribution: "Academic Feature",
    section: "left",
    category: "Academic Feature",
    imageFile: "visa-abroad.svg",
    paragraphs: [
      "Did you know that obtaining a degree in special education from Swayamkrushi virtually served as a visa to go abroad, particularly the US?",
      "Well, every year, about 75 per cent to 80 per cent of the students graduating from the Institute find placements abroad. This should not come as a surprise as the Institute has been occupying the numero uno position in Osmania University year after year, grabbing the gold medal in special education for intellectual disabilities almost every year since the B.Ed course was introduced in 2007.",
      "“On one of my visits to the US, I found 36 special educators who had graduated from Swayamkrushi working in Atlanta alone. Similarly, you will come across dozens of special educators from Swayamkrushi working in South Carolina and Mississippi,” points out the Institute’s founder-director Manjulaa Kalyaan.",
      "So, what makes graduates from Swayamkrushi stand out in the crowd? “The interview process is that much easier for our graduates since the institute is known for its focus on both academics and practicals, and its insistence on mandatory attendance. They are already well-trained in the field and well-versed with the subject and are job-ready when they leave the institute,” says Dr PVB Sudhakar, Assistant Professor in Special Education and Head of the Department at Swayamkrushi.",
      "While the Institute is not averse to the graduates seeking greener pastures abroad, Manjulaa Kalyaan realized that they were losing out on precious local talent. To check the trend to some extent, the Institute recently introduced a three-year bond for candidates seeking admission for B.Ed course under which they would have to work with Swayamkrushi during the bond period.",
      "Thus began a three-year waiting period for the aspirants, but still worth it!"
    ]
  },
  {
    id: "story-sai-baba",
    title: "The Mysterious Appearance of Shirdi Sai Baba",
    excerpt: "A mysterious wooden crate from Nashik arrived unannounced in 2015, revealing a magnificent six-and-half-foot marble idol of Shirdi Sai Baba that now graces Swayamkrushi’s campus prayer hall.",
    attribution: "Campus Lore",
    section: "left",
    category: "Campus Lore",
    imageFile: "sai-baba.svg",
    paragraphs: [
      "On a warm summer afternoon in 2015, a courier presented himself at the Swayamkrushi office, then located on the first floor of a building in Trimulgherry, and announced that he was there to deliver a ‘parcel.’ The organisation’s founder-director Manjulaa Kalyaan casually remarked “send it up.” “It’s big and heavy,” the courier delivery person said, to which she replied: “Take the lift and bring it up.” He, however, insisted that she come down. Left with no choice, Manjulaa Kalyaan went down and lo and behold was her ‘parcel,’ a huge wooden crate atop a truck parked in front of her office.",
      "Completely stumped by the size of the ‘parcel,’ Manjulaa Kalyaan asked the courier to deliver the crate at the new campus site in Chennapur near Jawahar Nagar, where a crane had to be brought in to bring it down from the truck. The crate was placed in the under-construction building in the five-acre campus.",
      "Manjulaa Kalyaan and her colleagues including then B.Ed principal late Durga Shankar were completely clueless about what was inside the crate. All that they knew was that the parcel had originated in Nashik in neighbouring Maharashtra and had the Swayamkrushi address for delivery. They were unwilling to unravel the mystery of the parcel for some time at least for fear of it being a case of wrong delivery or wrong address. Curiosity, however, got the better of Durga who one day peered through a gap in the wooden crate and jumped back at being met by the piercing gaze from a pair of eyes in an idol.",
      "After holding on to the ‘parcel’ for three months, Manjulaa Kalyaan decided to have the crate dismantled and there it was, a resplendent marble replica of Shirdi Sai Baba, standing all of six-and-half feet!",
      "“After much confabulation over where the majestic idol should be placed, it was decided, as per Vaastu, to have it consecrated in a prayer hall to be built right beside the gate. The consecration was done strictly as per “Shaastra,’ a purohut was hired to conduct daily aarti and special puja is conducted on the occasion of Guru Purnima, when all the children from the institute gather at the prayer hall,” recalls a misty-eyed Manjulaa Kalyaan.",
      "That was how the mysterious ‘visitor’ from Nashik came to reside permanently in Swayamkrushi."
    ]
  },
  {
    id: "story-recipe-success",
    title: "Recipe for Success",
    excerpt: "From delivering milk as a teenager to becoming a lead graphic designer at Tech Mahindra and founding Masterbrush Art Foundation, Vishnu Kondoj's journey is a masterclass in grit and mentorship.",
    attribution: "Success Stories",
    section: "left",
    category: "Success Stories",
    imageFile: "recipe-success.svg",
    paragraphs: [
      "An insatiable hunger to succeed, steely grit to overcome all odds and fire in the belly to fuel ambition - Vishnu Kondoj has all these elements in ample measure and that lifted him from very humble beginnings to steady heights in both career and passion. It may not be the typical, cliched rags-to-riches story, but his journey thus far in 40 years makes a perfect script for what one can achieve if one is focused and hard-working. Vishnu is also quick to acknowledge that had it not been for Manjulaa Kalyaan who played the pivotal role of mentor-motivator in his life, the outcome would have been entirely different.",
      "Son of a carpenter who was associated with Swayamkrushi, Vishnu’s dream was to be successful in life, whatever path it took, and this was evident from his efforts even as a teenager when he supplied milk in his neighbourhood and lent a helping hand to his father, Kumar, in his work. At the core of Vishnu’s heart was art and his passion for it kept popping up at regular intervals.",
      "It was when Vishnu was helping his father in Swayamkrushi that Manjulaa Kalyaan came across the youngster and immediately spotted the talent and zeal in him. The Swayamkrushi founder, who incidentally is perpetually on the lookout for potential talent particularly from the underprivileged sections of society, took Vishnu under her wings to lay the foundation that would transform his life. Like Vishnu’s, there are any number of ‘success stories’ attributed to Manjulaa Kalyaan’s constant efforts to make a difference in people’s lives.",
      "In 2004, Vishnu joined the organization as a vocational trainer and simultaneously did a two-year course in caregivers at the Institute. He was soon promoted as a teacher in special education and won the best teacher award in 2009. Even as he went about his job as a teacher, he also got involved in painting, screen printing and paper bag making units in the organization.",
      "But he had set his sights much higher and went through intermediate, a four-year animation course and a Bachelor’s degree in Fine Arts from JNTU, slogging out at the academics in the evenings.",
      "The next big transformation in his life came in 2009 when he landed a job in Tech Mahindra as a graphic designer. This proved to be the proverbial turning point for Vishnu as the IT major, quick to spot his talent, sent him to Italy on a couple of occasions to further hone his designing skills. The company, impressed by his passion for art and craft, also gave him the opportunity to hold a workshop-cum-exhibition in the company premises. The cherry on the cake was that Mahindra Group chairperson Anand Mahindra was himself present on the occasion!",
      "Vishnu has also held several exhibitions in Delhi, Bengaluru and Hyderabad in the past few years even as he rose to the rank of graphic designer’s team lead in Tech Mahindra.",
      "Vishnu, exposed as he was to persons with intellectual disabilities at Swayamkrushi, always yearned to tap the artistic talent inherent in many persons with disabilities. In 2023, he established the Masterbrush Art Foundation to support the creative talent among the less fortunate people with disabilities. He put together a fabulous management team that has only people with disabilities, be it autism, hearing impaired, Down Syndrome or intellectual disabilities. On July 27 this year, on the occasion of Majulaa Kalyaan’s 85th birthday celebrations, Vishnu launched the Masterbrush Art Foundation website, an initiative that would exclusively further the cause of artists from the disabled community. The website is the only one of its kind in the country and that speaks volumes about Vishnu’s commitment to the cause.",
      "Vishnu’s ultimate goal is to establish a studio-cum-workshop that would serve as an employment platform for the disabled to display and sell their art and craft. He also has plans to launch a Youtube channel in collaboration with Swayamkrushi to bring about awareness on the abundant talent among disabled persons and spread the message on the need for societal inclusiveness.",
      "“Whatever I achieved in life would not have been possible but for the care, attention and motivation I got from Manjulaa Madam,” reiterates the 41-year-old artist in gratitude."
    ]
  },
  {
    id: "story-luck-hardwork",
    title: "Luck, Hard Work and Guardian Angel Spell Success",
    excerpt: "From school ayah to certified special educator — an inspiring story of determination, grit, and life-changing mentorship under Manjula Kalyan.",
    attribution: "Success Stories",
    section: "left",
    category: "Success Stories",
    imageFile: "guardian-angel.svg",
    paragraphs: [
      "Luck, as the adage goes, favours the brave and the hard-working. For J Srilata, it was not merely luck that was on her side but also Manjulaa Kalyaan, the founder-director of Swayamkrushi, and time, that precious and unseen element capable of making or marring a person.",
      "Hailing from an impoverished farmers’ family in Siddipet district, Srilata, one of five siblings, was the only one in the family who was determined to make a mark in life. Struggle was a constant companion for the 33-year-old woman but so were ambition and determination, and this made for a heady concoction of circumstances and emotions that could only end in success. Srilatha is now on the threshold of becoming a special educator at the Swayamkrushi school for persons with intellectual disabilities, a quantum jump from the post of ayah that she currently holds in the school.",
      "Srilata, who has the uncanny knack of spotting an opportunity when it presents itself in the most unforeseeable circumstances, saw one when she was asked to help out Manjulaa Kalyaan at home after a surgery in 2022. Nobody in the organization was aware that she was a degree dropout because of financial constraints and that she had a burning desire, albeit suppressed, to make something of her life.",
      "Initially very hesitant and even scared, Srilata slowly opened up to the octogenarian founder of the organization about her life, circumstances and dreams. Ever willing to take on the role of guardian angel, Manjulaa Kalyaan took to the young woman. “You complete your degree with a minimum of 50 per cent and I will ensure that you get admitted in the B.Ed (Special Education for ID), and I will also protect your salary as ayah while you study. Once you complete B.Ed, you will be absorbed in the school as special educator,” Manjulaa Kalyaan told the mother of two.",
      "An elated Srilata grabbed the offer with both hands and sought leave later to go and fetch her 10th and Intermediate certificates from the Nagarjuna Degree College in Gajwel where she was studying BA and had dropped out way back in 2009. When she reached her college in Gajwel and asked for her certificates, the principal, kind-hearted that he was, pointed out to her that she had just one subject to clear and if she did that, she would have a degree in hand. Again, luck played a dominant role, when the principal informed Srilata that the day happened to be the last date for students to pay examination fee and that he wouldn’t mind extending the time by an hour for Srilata if she was willing to go for it!",
      "Srilata paid the fee, took a little time off work to study, wrote the examination and came out in flying colours, fulfilling the requirement of a minimum of 50 per cent set by Manjulaa Kalyaan. “I never thought that I would see such a major transformation in my life in just a matter of few months. I see Manjulaa Madam virtually as a God who came into my life and changed it forever. I am also grateful to the staff in Swayamkrushi who encouraged and motivated me throughout my struggle,” says a grateful Srilata, who at the time of writing this success story in 2026, was waiting for her B.Ed results.",
      "Srilata, who is confident of getting the B.Ed degree soon, looks forward to teaching the children with intellectual disabilities at the Swayamkrushi school. “I will forever be indebted to Manjulaa Madam not only for the encouragement and motivation but also for bearing the cost of my B.Ed course, continuing to pay my salary and finally, offering me the special educators’ job in the school,” says the young woman, whose supportive mother-in-law also works as an ayah in the organization.",
      "All’s well that ends well, one might say, of Srilata’s journey thus far, but she may just not stop at that. The bubbly and amiable woman, who also worked briefly at McDonald’s, has set her sights on donning the black robe of a lawyer! And she might one day, who knows!"
    ]
  },
  {
    id: "story-kitchen",
    title: "Kitchen — Beehive of Activity",
    excerpt: "A bustling hub from 5 AM, the Swayamkrushi kitchen team prepares nutritious meals daily for over 150 residents and day scholars with care, warmth, and spotless cleanliness.",
    attribution: "Campus Life",
    section: "left",
    category: "Campus Life",
    imageFile: "kitchen.svg",
    paragraphs: [
      "The kitchen in Swayamkrushi is a beehive of activity right from 5 AM in the morning when the cooks and other kitchen staff start arriving. By 5.30 AM, the stoves are lit and fresh, aromatic tea is served to everyone around. The staff, comprising two cooks and three assistants, begin preparation for breakfast for 80-odd persons by 7 AM. Breakfast is typically a south Indian fare – idly, dosa, upma, pongal etc with accompaniments.",
      "“I come in by 5 AM to ensure that breakfast and milk is ready for the residents who start trooping in along with their care-givers by 7 AM. Once breakfast is done with, we immediately start preparations for lunch, which is usually for around 150 persons including the day scholars in schools,” says I Sharada, the person in-charge of the spacious kitchen section. The dining tables and chairs are made of steel and each table can seat six persons. What is impressive is that both the dining hall and the kitchen area are kept clean, with the ayahs and helpers constantly cleaning the place. Dinner is cooked early and kept ready for the 80-odd residents before the cooks leave for the day at around 5 PM.",
      "The lunch is simple but nutritious comprising either sambar or dal, a vegetable side dish, white rice and yoghurt. On festival says and special occasions of course, everyone is treated to special lunch that will typically include a sweet too. “On an average, we cook about 17 kg of rice and use about 10 kg of vegetables for the dishes every day. Besides, there is similar quantity of lentils consumed every day,” says Sarada, who joined Swayamkrushi in 2018 as assistant cook.",
      "Sarada says since enjoys her work and feels very happy when some of the children come to her and appreciate a particular dish. “Nothing is more rewarding for a cook than someone appreciating the dishes, and more so if it comes from a person with intellectual disabilities,” says the head cook."
    ]
  },
  {
    id: "story-kadiam",
    title: "Destination Kadiam, for Plants",
    excerpt: "An 800-km day trip to Kadiam nurseries in Andhra Pradesh transformed the 5-acre Jawahar Nagar campus into a lush, fruit-bearing mini-forest for the children.",
    attribution: "Campus Lore",
    section: "left",
    category: "Campus Lore",
    imageFile: "kadiam.svg",
    paragraphs: [
      "Whenever Manjulaa Kalyaan plans to do something for Swayamkrushi, she ensures that it is the best in the market, so much so that when she wanted to add a little greenery to the newly-acquired five-acre campus in Jawahar Nagar, she drove all the way to Kadiam in Andhra Pradesh to fetch the choicest of saplings. Not many may know that Kadiam is well known all over the country for its numerous nurseries selling the best varieties of fruit-bearing, flowering, ornamental and even some rare plants.",
      "That was in 2016, when the organization decided to construct its own building in the vast new campus. “I wanted to plant all the saplings before the building came up to ensure fully-grown trees all around when the place finally becomes operational. My US-based sister, who was visiting me at that time, wanted to fund the greening operation, and we decided to go to Kadiam which has the country’s biggest and best nurseries to get the saplings” recalls Manjulaa Kalyaan.",
      "The sisters, who picked up Jayalakshmi en route for her knowledge of AP, completed the saplings shopping spree in just one day, covering over 800 kms. They bought various varieties of mangoes, chikus (sapota), pomegranate, sweet lemon, amla, water apple, among other fruit-bearing trees. They also bought several other plants including Maredu (Bilva) which is considered special for Lord Shiva.",
      "They have all grown into huge trees and form a beautiful mini-forest right in front of the main building door. They not only bear delicious fruits but also provide ample shade that has become the ideal spot for many of the staff to spend leisure time or to have lunch. “All the produce including the King of Fruits (mangoes) are strictly meant for in-house consumption, and the children enjoy the fruit season. We also make our own pickles,” says Manjulaa Kalyaan.",
      "“We also got teak and bamboo saplings from the forest department that we planted along the boundary wall,” says Manjulaa Kalyaan, who goes on to add that she may have to make a trip to Kadiam soon to get more plants before the construction of the organisation’s second building is taken up.",
      "Manjulaa Kalyaan also points out that till recently, they were also growing vegetables including brinjal, tomatoes, okra and several leafy varieties. “We had to abandon vegetable cultivation when a small hillock in the campus was demolished, and that threw up unimaginable quantities of rock,” she says.",
      "The garden and the trees are taken care of by T Naveen, a 27-year-old youngster from Mahabubnagar who joined the organization as a watchman in 2023. Today, he is a jack-of-all-trades kind of guy who is willing to lend a helping hand wherever it’s needed."
    ]
  },
  {
    id: "story-dairy",
    title: "Dairy for a Purpose!",
    excerpt: "With six cows and fresh morning milk, the campus dairy provides self-sufficiency while creating therapeutic, purposeful daily engagement for residents.",
    attribution: "Campus Life",
    section: "left",
    category: "Campus Life",
    imageFile: "dairy.svg",
    paragraphs: [
      "If you are a resident of Swayamkrushi or a guest staying in the campus overnight, you will most likely wake up to the mooing by the small herd of cows, a little distance away from the main building in the campus. Ksheerabdi, Laxmi and Ganga are ready to begin the day, waiting for Prabhakar Reddy from the neighbouring village to come and milk them. He is usually in by 5 AM and is ready with two pails containing about six litres of fresh milk which he delivers to the kitchen by 6.30 AM.",
      "“We started the dairy in a small way in 2022 when one Mr Reddy donated two cows. That set the trend and many people came forward to donate cows. We now have a total of six cows and three calves,” says Manjulaa Kalyaan, the founder-director of Swayamkrushi.",
      "The octogenarian founder goes on to point out that the idea is to be self-sufficient in all aspects and dairy is an important component in that direction. “We lost one cow, but then the owner of Gandhian School in Trimulgherry, who had a small dairy farm, donated four cows. We now have enough cows for our needs but I want to expand the dairy farm and make it a revenue generating unit since the organization is constantly in need of funds for its daily functioning,” says Manjulaa, adding that at present, the cows are housed in a shed close to the gate. The plan is to shift them further inside the campus once the new building comes up adjacent to the existing block.",
      "Manjulaa Kalyaan is keen that the residents in the hostel - women with intellectual disabilities – eventually learn to take care of the cows. Incidentally, Ksheerabdi means ‘milk aplenty’ and it was Manjulaa Kalyaan who came up with this name for one of the cows."
    ]
  }
]

const mainArticlesData = [
  {
    id: "home-of-care",
    title: "Home of Care & Dignity",
    excerpt: "Thirty-five years of building self-reliance, inclusive community homes, and professional educators for persons with intellectual disabilities.",
    attribution: "Institutional Feature",
    section: "main",
    category: "Mission & Vision",
    imageFile: "birthday-courtyard.jpg",
    paragraphs: [
      "Founded in 1989 by visionary special educator Ms. Manjula Kalyan, Swayamkrushi was established with a singular, transformative vision: to provide persons with intellectual disabilities the education, life skills, and dignity required to thrive within the mainstream community.",
      "Starting from humble beginnings with neighborhood resource drives, Swayamkrushi has grown into a renowned national institution comprising residential Group Homes, day care programs, specialized vocational workshops, and an Osmania University-affiliated B.Ed college in Special Education."
    ]
  },
  {
    id: "group-homes",
    title: "The Group Homes Model — A National Pioneer",
    excerpt: "Conceived 16 years before the UN Inclusion Act, Swayamkrushi's eight group homes integrated women with intellectual disabilities into regular residential colonies.",
    attribution: "Special Report",
    section: "main",
    category: "Group Homes",
    imageFile: "grouphome-residents.jpg",
    paragraphs: [
      "In 1991, Manjula Kalyan pioneered the Group Homes concept in India. Each home accommodated eight adult women with varying degrees of intellectual challenges living together like an extended family in standard neighborhood residential apartments.",
      "Residents manage daily chores, attend vocational training, celebrate festivals together, and build genuine bonds with neighbors — proving that true rehabilitation occurs through community inclusion, not isolation."
    ]
  },
  {
    id: "bed-hotspot",
    title: "The B.Ed Hotspot — A Global Passport",
    excerpt: "How a specialized degree in intellectual disabilities affiliated with Osmania University became an international benchmark for excellence.",
    attribution: "Academic Spotlight",
    section: "main",
    category: "Academic Feature",
    imageFile: "national-trust-event.jpg",
    paragraphs: [
      "Recognized by Osmania University and certified by the Rehabilitation Council of India (RCI), Swayamkrushi’s B.Ed in Special Education has consistently produced university gold medalists and top-tier professionals.",
      "Graduates from Swayamkrushi now lead special education programs in public school districts across the United States, Europe, and India, bringing world-class methodology back to the community."
    ]
  },
  {
    id: "building-blocks",
    title: "Building Blocks of Empowerment",
    excerpt: "The vocational floor is designed for hands-on, therapeutic skill development: screen printing, arts, culinary units, and sustainable paper crafts.",
    attribution: "Vocational Focus",
    section: "main",
    category: "Main Feature",
    imageFile: "building-blocks.svg",
    paragraphs: [
      "At the Chennapur campus, vocational training is tailored to individual abilities. From creating eco-friendly paper bags to screen printing wedding cards and mastering culinary tasks, each activity promotes motor skills, cognitive development, and financial self-worth."
    ]
  }
]

const rightArticlesData = [
  {
    id: "story-encounter",
    title: "Chance Encounter That Changed My Life",
    excerpt: "A chance encounter with Dr Maria Egg-Benes, a renowned special educator from Switzerland, at a workshop in Bengaluru, turned out to be the turning point in my life, and a defining moment which revealed the path I was to take to serve the less fortunate in society.",
    attribution: "Special Feature",
    section: "right",
    category: "Director’s Voice",
    imageFile: "chance-encounter.svg",
    paragraphs: [
      "A chance encounter with Dr Maria Egg-Benes, a renowned special educator from Switzerland, at a workshop in Bengaluru, turned out to be the turning point in my life, and a defining moment which revealed the path I was to take to serve the less fortunate ones in society. That was in 1969, and being married to an Air Force officer took me to various cities including New Delhi, Chennai and Hyderabad.",
      "My transition from a teacher in a regular school teaching normal children to that of a special educator caring for the intellectually challenged took shape in New Delhi where I joined Amrit Kaur Bal Vihar, popularly known as Okhla Centre. The seven years that I spent at the Centre laid a strong foundation and prepared me for the tough journey that I would be facing in the years ahead.",
      "Thus was born Swayamkrushi in 1989 that finally allowed me to realise my dream of not only fostering independent and dignified living of the intellectually-challenged but also integrate them with the community in general and society at large."
    ]
  },
  {
    id: "story-fifteen-years",
    title: "15 Years for One Word, and Then the Exhilaration!",
    excerpt: "When 15-year-old Sai uttered the word 'Amma' one day, tears of joy rolled down the cheeks of D Dora Babu, the speech therapist at Swayamkrushi after weeks of patient, mirror-guided vocal exercises.",
    attribution: "Special Feature",
    section: "right",
    category: "Stories & Milestones",
    imageFile: "speech-therapy.svg",
    paragraphs: [
      "When 15-year-old Sai uttered the word ‘Amma” one day, tears of joy rolled down the cheeks of D Dora Babu, the speech therapist at Swayamkrushi. This was the reward he was waiting for after weeks of effort put in to help Sai, who besides having hearing impairment also suffers from intellectual disabilities. This was the first word to tumble out of Sai’s mouth in 15 years and Babu’s exhilaration was justifiably palpable.",
      "The speech therapy unit in Swayamkrushi at present has 10 students, all of them with intellectual disabilities and hearing impairment. Babu uses flash cards, mirror, picture cards, toys and story books, among other things, as tools to help the children say a few words if not sentences."
    ]
  },
  {
    id: "story-art-equaliser",
    title: "Art — The Great Equaliser",
    excerpt: "Drawing and painting with her elbow stumps, 25-year-old artist Bharati Saini inspires and trains special children at Swayamkrushi in self-expression and creative confidence.",
    attribution: "Special Feature",
    section: "right",
    category: "Stories & Milestones",
    imageFile: "art-studio.svg",
    paragraphs: [
      "Art, they say, is the great equalizer. Nothing describes better the creative expressions of Bharati Saini, a 25-year-old bubbly girl, an artist from Uttarakhand, who draws and paints using just her elbow stumps. Fate changed the path for Bharati when she, as a playful 11-year-old girl, picked up an object that turned out to be an explosive device apparently meant to scare away animals.",
      "Completely undeterred by the loss of her limbs, Bharati joined Nainital University for her Bachelor’s degree in Fine Art and later Master’s from Kurukshetra University. Today, she teaches drawing and painting to 25 special students at Swayamkrushi."
    ]
  },
  {
    id: "story-exercise",
    title: "Exercise of a Different Kind",
    excerpt: "“Their unqualified innocence and unconditional love conquered my heart,” says physiotherapist J Priyadarshini, transforming mobility for children with cerebral palsy and Down syndrome.",
    attribution: "Special Feature",
    section: "right",
    category: "Stories & Milestones",
    imageFile: "physiotherapy.svg",
    paragraphs: [
      "“Their unqualified innocence and unconditional love for me conquered my heart,” says J Priyadarshini, the physiotherapist at Swayamkrushi, of the special children she has been treating, putting them through a set of daily exercises.",
      "The physiotherapy unit is well equipped with treadmill, static cycle, shoulder pulleys, finger ladder and other instruments that help children strengthen muscles, correct posture, and achieve independent mobility."
    ]
  },
  {
    id: "story-hard-work",
    title: "Hard Work Never Goes Unrewarded!",
    excerpt: "From campus gardener to certified special educator and MBA graduate — G Aruna's inspiring journey of perseverance and mentorship at Swayamkrushi.",
    attribution: "Success Stories",
    section: "right",
    category: "Success Stories",
    imageFile: "gardening.svg",
    paragraphs: [
      "When G Aruna joined Swayamkrushi as a gardener in 2020, little would she have known then that her decision would prove to be a game-changer in her life. Raised by a single mother in Siddipet, Aruna was put through the grind of poverty.",
      "Manjula Kalyan spotted her sincerity, funded her B.Ed in Special Education, and supported her through her MBA. Today Aruna is a full-time teacher inspiring the next generation of students."
    ]
  },
  {
    id: "story-paper-bag",
    title: "Eco-Friendly Paper Bags Unit",
    excerpt: "Special students craft thousands of biodegradable, hand-printed paper bags monthly, supplying leading retail stores while earning stipends.",
    attribution: "Vocational Unit",
    section: "right",
    category: "Stories & Milestones",
    imageFile: "paper-bag.svg",
    paragraphs: [
      "The paper bag unit at Swayamkrushi represents vocational training at its best. Students learn paper cutting, creasing, folding, gluing, and attaching cotton handles.",
      "The bags are purchased by boutique shops and community events, generating income that is distributed directly back to the student creators as monthly stipends."
    ]
  },
  {
    id: "story-nios",
    title: "NIOS Open Schooling Success",
    excerpt: "Through the National Institute of Open Schooling (NIOS) curriculum, students at Swayamkrushi clear secondary board examinations at their own pace.",
    attribution: "Academic Stream",
    section: "right",
    category: "Academic Feature",
    imageFile: "nios-education.svg",
    paragraphs: [
      "Swayamkrushi serves as an accredited study center for NIOS, allowing children with learning challenges to write exams with scribes and flexible subject combinations.",
      "Dozens of students have successfully passed standard 10th and 12th board exams, creating pathways to higher education and formal vocational diplomas."
    ]
  },
  {
    id: "story-champions",
    title: "Special Olympics Champions",
    excerpt: "Swayamkrushi athletes have represented Telangana and India in national and international Special Olympics, bringing home gold and silver medals in athletics and badminton.",
    attribution: "Sports & Accolades",
    section: "right",
    category: "Success Stories",
    imageFile: "champions.svg",
    paragraphs: [
      "Physical fitness and sports are core pillars of daily life at Swayamkrushi. Regular coaching in athletics, bocce, table tennis, and badminton has enabled students to excel on national podiums.",
      "Their medals stand as proud reminders of what dedicated coaching and self-belief can accomplish."
    ]
  },
  {
    id: "story-sowing-seeds",
    title: "Sowing Seeds of Independence: Tailoring Unit",
    excerpt: "Mastering sewing machines, embroidery, and cloth craft, the tailoring unit empowers young women with vocational independence.",
    attribution: "Vocational Unit",
    section: "right",
    category: "Stories & Milestones",
    imageFile: "tailoring.svg",
    paragraphs: [
      "The tailoring and textile section teaches basic to advanced garment stitching, cushion covers, cloth bags, and festive decorative items.",
      "The pride on each student’s face when completing a finished garment is unmatched, paving a reliable path toward livelihood."
    ]
  }
]

const accoladesSeedData = [
  {
    id: 'national-award-2002',
    year: '2002',
    badge: 'NATIONAL AWARD',
    title: 'National Award for the Welfare of People with Disabilities',
    presenter: 'Government of India · Ministry of Social Justice & Empowerment',
    presentedBy: 'Presented by President Dr. A.P.J. Abdul Kalam',
    shortDesc: 'On 3rd December 2002, the Government of India conferred the National Award for the Welfare of People with Disabilities upon Swayamkrushi — personally presented by President Dr. A.P.J. Abdul Kalam.',
    fullDesc: 'On 3rd December 2002, the Government of India — through the Ministry of Social Justice & Empowerment — conferred the National Award for the Welfare of People with Disabilities upon Swayamkrushi, Secunderabad. This award was personally presented by President Dr. A.P.J. Abdul Kalam in recognition of Swayamkrushi\'s outstanding performance in the field of welfare of persons with disabilities. A defining moment in Swayamkrushi\'s history — national recognition at the highest level of the country.',
    imageFile: 'To_go_in_menu_-_Accolades_image1.jpeg',
    imageLabel: 'Official Certificate — Govt. of India',
    isFeatured: true,
    order: 0
  },
  {
    id: 'award-2000-shakunthala',
    year: '2000',
    badge: 'STATE RECOGNITION',
    title: 'Dr. Shakunthala Devi Medical & Health Award',
    presenter: 'Dr. K. Shakunthala Devi · Konda Lakshman Bapuji Foundation',
    presentedBy: 'Konda Lakshman Bapuji Foundation',
    shortDesc: 'Presented jointly to Swayamkrushi and founder Mrs. Manjula Kalyan for dedicated medical, health, and rehabilitation voluntary services.',
    fullDesc: 'Presented jointly to Swayamkrushi and its founder Mrs. Manjula Kalyan on 19th November 2000, in recognition of outstanding and dedicated Medical, Health and other voluntary services rendered to mentally challenged persons — aiming to help them lead an independent life within the community.',
    imageFile: 'To_go_in_menu_-_Accolades_image3.jpeg',
    imageLabel: 'Dr. Shakunthala Devi Medical & Health Award Certificate',
    isFeatured: false,
    order: 1
  },
  {
    id: 'award-2002-gnanananda',
    year: '2002',
    badge: 'HUMANITARIAN AWARD',
    title: 'Sadguru Gnanananda Award',
    presenter: 'Swami Nityananda Giri · Manava Seva Dharma Samvardhani, Chennai',
    presentedBy: 'Manava Seva Dharma Samvardhani, Chennai',
    shortDesc: 'Conferred by Manava Seva Dharma Samvardhani in deep appreciation of pioneering efforts in establishing Swayamkrushi in 1991.',
    fullDesc: 'Awarded by Manava Seva Dharma Samvardhani — a Charitable Trust for Promotion of Social Service Consciousness — in deep appreciation of Ms. Manjula Kalyan\'s outstanding and pioneering efforts in establishing Swayamkrushi in 1991 in Secunderabad, dedicated to the rehabilitation and integration of adults with developmental disabilities.',
    imageFile: 'To_go_in_menu_-_Accolades_image4.jpeg',
    imageLabel: 'Sadguru Gnanananda Award Citation',
    isFeatured: false,
    order: 2
  },
  {
    id: 'award-2005-national-trust',
    year: '2005',
    badge: 'PROFESSIONAL CITATION',
    title: 'National Trust — Outstanding Professional Certificate',
    presenter: 'Mrs. Poonam Natarajan · The National Trust, New Delhi',
    presentedBy: 'The National Trust for Welfare of Persons with Autism, CP, MR',
    shortDesc: 'Certified by The National Trust for Welfare of Persons with Autism, Cerebral Palsy, Mental Retardation and Multiple Disabilities.',
    fullDesc: 'Certified by The National Trust for the Welfare of Persons with Autism, Cerebral Palsy, Mental Retardation and Multiple Disabilities on 20th August 2005. Manjula Kalyan completed a Training Workshop on Fund Raising and Resource Mobilization at the Spastics Society of Tamilnadu, Taramani, Chennai.',
    imageFile: 'To_go_in_menu_-_Accolades_image5.jpeg',
    imageLabel: 'National Trust Professional Certificate',
    isFeatured: false,
    order: 3
  },
  {
    id: 'award-2006-smart-118',
    year: '2006',
    badge: 'SPECIAL RECOGNITION',
    title: 'Certificate of Special Recognition',
    presenter: 'Tr. Ambareesh Pittie & Cr. Madhavi Chandra · SMART 118 / SMLC 49',
    presentedBy: 'SMART 118 / SMLC 49',
    shortDesc: 'Presented to Smt. Manjula Kalyan in recognition of exemplary dedication and commitment towards training for special children.',
    fullDesc: 'Presented on 4th March 2006 to Smt. Manjula Kalyan in recognition of her exemplary dedication and commitment towards providing facilities and training for mentally challenged children. Signed by the Chairman of SMART 118 and the Chairperson of Secunderabad Metropolitan Ladies Circle 49.',
    imageFile: 'To_go_in_menu_-_Accolades_image6.jpeg',
    imageLabel: 'Special Recognition Certificate — SMART 118',
    isFeatured: false,
    order: 4
  },
  {
    id: 'award-2012-unsung-hero',
    year: '2012',
    badge: 'COMMUNITY HONOUR',
    title: 'Unsung Hero Award — Special Education',
    presenter: 'Divya Balder · Secunderabad Metropolitan Ladies Circle 49',
    presentedBy: 'Secunderabad Metropolitan Ladies Circle 49',
    shortDesc: 'Recognised the remarkable lifetime contribution made by Ms. Manjula Kalyan in the field of Special Education.',
    fullDesc: 'The Secunderabad Metropolitan Ladies Circle 49 (Member — Ladies Circle India) recognised the remarkable contribution made by Ms. Manjula Kalyan of Swayamkrushi in the field of Special Education. Presented on 5th September 2012 by the Chairperson of SMLC 49 (2012–13).',
    imageFile: 'To_go_in_menu_-_Accolades_image7.jpeg',
    imageLabel: 'Unsung Hero Award Citation',
    isFeatured: false,
    order: 5
  },
  {
    id: 'award-2014-pratibha',
    year: '2014',
    badge: 'PIONEER AWARD',
    title: 'Pratibha Award 2014',
    presenter: 'F.A.M.E. India · Bengaluru',
    presentedBy: 'F.A.M.E. India',
    shortDesc: 'Presented for outstanding pioneering efforts in establishing Swayamkrushi and spearheading the Group Homes model.',
    fullDesc: 'Presented on 1st March 2014 to Ms. Manjulaa Kalyaan, Director, Swayamkrushi — for her outstanding and pioneering efforts in establishing Swayamkrushi in 1991 and for her outstanding contribution in the field of Neuro Developmental Disabilities. Swayamkrushi\'s path-breaking "Group Homes" concept in India is recognised for its visionary impact.',
    imageFile: 'To_go_in_menu_-_Accolades_image8.jpeg',
    imageLabel: 'Pratibha Award Plaque — F.A.M.E. India',
    isFeatured: false,
    order: 6
  }
]

const certificatesSeedData = [
  {
    title: 'National Award for the Welfare of People with Disabilities',
    caption: 'Official Citation & Certificate presented by President Dr. A.P.J. Abdul Kalam · New Delhi',
    year: '2002',
    imageFile: 'To_go_in_menu_-_Accolades_image1.jpeg',
    order: 1
  },
  {
    title: 'Receiving National Award from President Kalam',
    caption: 'President Dr. A.P.J. Abdul Kalam felicitating Ms. Manjula Kalyan on World Disability Day · Vigyan Bhavan, New Delhi',
    year: '2002',
    imageFile: 'To_go_in_menu_-_Accolades_image2.jpeg',
    order: 2
  },
  {
    title: 'Dr. Shakunthala Devi Medical & Health Award',
    caption: 'Presented by Konda Lakshman Bapuji Foundation for dedicated voluntary services',
    year: '2000',
    imageFile: 'To_go_in_menu_-_Accolades_image3.jpeg',
    order: 3
  },
  {
    title: 'Sadguru Gnanananda National Award Citation',
    caption: 'Conferred by Manava Seva Dharma Samvardhani, Chennai for pioneering group homes',
    year: '2002',
    imageFile: 'To_go_in_menu_-_Accolades_image4.jpeg',
    order: 4
  },
  {
    title: 'National Trust Certificate of Training',
    caption: 'Certified by The National Trust for Welfare of Autism, CP, MR and Multiple Disabilities',
    year: '2005',
    imageFile: 'To_go_in_menu_-_Accolades_image5.jpeg',
    order: 5
  },
  {
    title: 'Special Recognition Certificate — SMART 118',
    caption: 'Presented by SMART 118 & SMLC 49 for exemplary commitment to special children',
    year: '2006',
    imageFile: 'To_go_in_menu_-_Accolades_image6.jpeg',
    order: 6
  },
  {
    title: 'Unsung Hero Award Citation',
    caption: 'Conferred by Secunderabad Metropolitan Ladies Circle 49 in recognition of lifetime special education services',
    year: '2012',
    imageFile: 'To_go_in_menu_-_Accolades_image7.jpeg',
    order: 7
  },
  {
    title: 'Pratibha Award Plaque — F.A.M.E. India',
    caption: 'Awarded by F.A.M.E. India, Bengaluru for pioneering efforts in Neuro Developmental Disabilities & Group Homes',
    year: '2014',
    imageFile: 'To_go_in_menu_-_Accolades_image8.jpeg',
    order: 8
  }
]

const faqsSeedData = [
  {
    id: 'faq-enrollment',
    question: 'How do I enroll my child at Swayamkrushi?',
    answer: 'Contact us by phone or email to arrange an initial visit and assessment. Our team will guide you through the admission process and available programmes.',
    category: 'Admissions & Care',
    order: 1
  },
  {
    id: 'faq-age-groups',
    question: 'What age groups do you serve?',
    answer: 'We serve children from school age through adulthood. Our programmes are tailored to the individual\'s developmental stage, not strictly by age.',
    category: 'Admissions & Care',
    order: 2
  },
  {
    id: 'faq-residential',
    question: 'Are there residential facilities?',
    answer: 'Yes, we offer 24/7 residential care with full supervision, meals, healthcare support, and participation in all programmes.',
    category: 'Residential & Support',
    order: 3
  },
  {
    id: 'faq-volunteer',
    question: 'Can I volunteer at Swayamkrushi?',
    answer: 'Absolutely. We welcome volunteers with skills in education, therapy, arts, administration, and more. Fill the contact form and select "Volunteer" to get started.',
    category: 'Volunteering & Community',
    order: 4
  },
  {
    id: 'faq-donations',
    question: 'How are donations used?',
    answer: 'A minimum of 80 per cent of every donation goes directly to programmes and care. Full details are published in our Annual Reports.',
    category: 'Donations & Governance',
    order: 5
  },
  {
    id: 'faq-bed-recognition',
    question: 'Is the B.Ed programme government recognised?',
    answer: 'Yes, the B.Ed Special Education programme is affiliated with Osmania University and certified by the Rehabilitation Council of India (RCI).',
    category: 'Academics & Degrees',
    order: 6
  }
]

// ── SEEDING EXECUTION ────────────────────────────────────────────────────────

const runSeed = async () => {
  try {
    console.log(' Connecting to MongoDB Atlas...')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✓ Connected to MongoDB Atlas.')

    const assetsDir = path.join(__dirname, '..', 'swayamkrushi', 'src', 'assets', 'images')
    const mocksDir = path.join(assetsDir, 'mocks')
    const docsMediaDir = path.join(__dirname, '..', 'swayamkrushi', 'public', 'docs_media')

    // Find local image path
    const resolveImagePath = (filename) => {
      if (!filename) return null
      const inMocks = path.join(mocksDir, filename)
      if (fs.existsSync(inMocks)) return inMocks
      const inAssets = path.join(assetsDir, filename)
      if (fs.existsSync(inAssets)) return inAssets
      const inDocs = path.join(docsMediaDir, filename)
      if (fs.existsSync(inDocs)) return inDocs
      return null
    }

    console.log('\n--- 1. UPLOADING MEDIA & SEEDING ARTICLES ---')
    await Article.deleteMany({})

    const allArticlesRaw = [
      ...leftArticlesData.map((a, idx) => ({ ...a, order: idx })),
      ...mainArticlesData.map((a, idx) => ({ ...a, order: 10 + idx, featured: true })),
      ...rightArticlesData.map((a, idx) => ({ ...a, order: 20 + idx }))
    ]

    const uploadedUrls = {}

    for (const art of allArticlesRaw) {
      let imageUrl = ''
      if (art.imageFile) {
        if (uploadedUrls[art.imageFile]) {
          imageUrl = uploadedUrls[art.imageFile]
        } else {
          const localPath = resolveImagePath(art.imageFile)
          if (localPath) {
            const cdnUrl = await uploadToCloudinary(localPath, 'swayamkrushi/articles')
            imageUrl = cdnUrl || `/src/assets/images/${art.imageFile.endsWith('.svg') ? 'mocks/' + art.imageFile : art.imageFile}`
            uploadedUrls[art.imageFile] = imageUrl
          }
        }
      }

      await Article.create({
        id: art.id,
        title: art.title,
        excerpt: art.excerpt,
        paragraphs: art.paragraphs,
        attribution: art.attribution || 'Swayamkrushi Archives',
        category: art.category,
        section: art.section,
        imageUrl: imageUrl,
        imageAlt: art.title,
        featured: art.featured || false,
        order: art.order
      })
      console.log(`  ✓ Seeded Article: ${art.title} (${art.section})`)
    }

    console.log('\n--- 2. SEEDING ACCOLADES & RECOGNITIONS ---')
    await Accolade.deleteMany({})
    for (const acc of accoladesSeedData) {
      let imageUrl = ''
      if (acc.imageFile) {
        if (uploadedUrls[acc.imageFile]) {
          imageUrl = uploadedUrls[acc.imageFile]
        } else {
          const localPath = resolveImagePath(acc.imageFile)
          if (localPath) {
            const cdnUrl = await uploadToCloudinary(localPath, 'swayamkrushi/accolades')
            imageUrl = cdnUrl || `/docs_media/${acc.imageFile}`
            uploadedUrls[acc.imageFile] = imageUrl
          }
        }
      }

      await Accolade.create({
        id: acc.id,
        year: acc.year,
        badge: acc.badge,
        title: acc.title,
        presenter: acc.presenter,
        presentedBy: acc.presentedBy,
        shortDesc: acc.shortDesc,
        fullDesc: acc.fullDesc,
        imageUrl: imageUrl,
        imageLabel: acc.imageLabel,
        isFeatured: acc.isFeatured,
        order: acc.order
      })
      console.log(`  ✓ Seeded Accolade: ${acc.title}`)
    }

    console.log('\n--- 3. SEEDING CERTIFICATE GALLERY ---')
    await Certificate.deleteMany({})
    for (const cert of certificatesSeedData) {
      let imageUrl = ''
      if (cert.imageFile) {
        if (uploadedUrls[cert.imageFile]) {
          imageUrl = uploadedUrls[cert.imageFile]
        } else {
          const localPath = resolveImagePath(cert.imageFile)
          if (localPath) {
            const cdnUrl = await uploadToCloudinary(localPath, 'swayamkrushi/certificates')
            imageUrl = cdnUrl || `/docs_media/${cert.imageFile}`
            uploadedUrls[cert.imageFile] = imageUrl
          }
        }
      }

      await Certificate.create({
        title: cert.title,
        caption: cert.caption,
        year: cert.year,
        imageUrl: imageUrl,
        order: cert.order
      })
      console.log(`  ✓ Seeded Certificate: ${cert.title}`)
    }

    console.log('\n--- 4. SEEDING FAQS ---')
    await Faq.deleteMany({})
    for (const faq of faqsSeedData) {
      await Faq.create(faq)
      console.log(`  ✓ Seeded FAQ: ${faq.question}`)
    }

    console.log('\n SUCCESS: MongoDB database and Cloudinary media seeding completed successfully!')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Seeding Error:', err)
    process.exit(1)
  }
}

runSeed()
