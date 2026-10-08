import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import mammoth from 'mammoth'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import Article from './models/Article.js'
import Faq from './models/Faq.js'

dotenv.config()

const docsDir = 'C:\\Users\\lenovo\\Downloads\\docs\\docs'

// Local and upload image fallback mapping
const imageMap = {}

// Explicit clean metadata & titles
const fileMetadata = {
  'SK - Mission Statement.docx': {
    id: 'home-of-care',
    title: 'A Home of Care, Growth and Hope',
    section: 'main',
    category: 'Mission & Life at Swayamkrushi',
    order: 1,
    featured: true
  },
  'Group Homes.docx': {
    id: 'group-homes',
    title: 'Group Home — A Pioneering Initiative Ahead of Time',
    section: 'main',
    category: 'Community & Independence',
    order: 2,
    featured: false
  },
  'Swayamkrushi – The B.Ed Hotspot.docx': {
    id: 'bed-hotspot',
    title: 'Swayamkrushi — The B.Ed Hotspot',
    section: 'main',
    category: 'Education & Training',
    order: 3,
    featured: false
  },
  'A Game of Building Blocks.docx': {
    id: 'building-blocks',
    title: 'A Game of Building Blocks',
    section: 'main',
    category: 'Care Philosophy',
    order: 4,
    featured: false
  },
  'thinking out of the box!.docx': {
    id: 'story-thinking',
    title: 'Thinking Out of the Box!',
    section: 'left',
    category: 'Foundational Grit',
    order: 1,
    featured: false
  },
  'Visa to go abroad.docx': {
    id: 'story-visa',
    title: 'Visa to Go Abroad',
    section: 'left',
    category: 'Academic Impact',
    order: 2,
    featured: false
  },
  'Direct Speak - Chance Encounter.docx': {
    id: 'story-encounter',
    title: 'Chance Encounter That Changed My Life',
    section: 'right',
    category: "Director's Voice",
    order: 1,
    featured: false
  },
  'Direct Speak.docx': {
    id: 'story-direct-speak',
    title: 'Direct Speak: Reflections on Thirty-Five Years of Service',
    section: 'right',
    category: "Director's Column",
    order: 2,
    featured: false
  },
  'Mysterious appearance of Sai Baba.docx': {
    id: 'story-sai-baba',
    title: 'The Mysterious ‘Appearance’ of Shirdi Sai Baba',
    section: 'left',
    category: 'Fun Facts & Lore',
    order: 3,
    featured: false
  },
  '15 years for one word, and then the exhilaration!.docx': {
    id: 'story-15-years',
    title: '15 Years for One Word, and Then the Exhilaration!',
    section: 'left',
    category: 'Speech Therapy',
    order: 4,
    featured: false
  },
  'Art – The Great Equaliser.docx': {
    id: 'story-art-equaliser',
    title: 'Art — The Great Equaliser',
    section: 'left',
    category: 'Creative Arts',
    order: 5,
    featured: false
  },
  'Destination Kadiam, for plants.docx': {
    id: 'story-kadiam',
    title: 'Destination Kadiam, for Plants',
    section: 'left',
    category: 'Horticulture & Greenery',
    order: 6,
    featured: false
  },
  'Exercise of a different kind.docx': {
    id: 'story-exercise',
    title: 'Exercise of a Different Kind',
    section: 'left',
    category: 'Physiotherapy & Health',
    order: 7,
    featured: false
  },
  'Dairy for a purpose!.docx': {
    id: 'story-dairy',
    title: 'Dairy for a Purpose!',
    section: 'left',
    category: 'Dairy & Vocational',
    order: 8,
    featured: false
  },
  'The Covid Years – Opportunities to serve.docx': {
    id: 'story-covid',
    title: 'The Covid Years — Opportunities to Serve',
    section: 'right',
    category: 'Resilience & Service',
    order: 3,
    featured: false
  },
  'Hard work never goes unrewarded!.docx': {
    id: 'story-hard-work',
    title: 'Hard Work Never Goes Unrewarded!',
    section: 'feature',
    category: 'Success Stories',
    order: 1,
    featured: true
  },
  'Luck, hard work and guardian angel spell success.docx': {
    id: 'story-luck-hardwork',
    title: 'Luck, Hard Work and Guardian Angel Spell Success',
    section: 'feature',
    category: 'Mentorship & Grit',
    order: 2,
    featured: false
  },
  'Champions all the way.docx': {
    id: 'story-champions',
    title: 'Champions All the Way — Special Olympics',
    section: 'feature',
    category: 'Global Glory & Special Olympics',
    order: 3,
    featured: false
  },
  'Recipe for success.docx': {
    id: 'story-recipe-success',
    title: 'Recipe for Success!',
    section: 'right',
    category: 'Vocational Triumph',
    order: 4,
    featured: false
  },
  'NIOS – Boon for Persons with Intellectual Disabilities.docx': {
    id: 'story-nios',
    title: 'NIOS — Boon for Persons with Intellectual Disabilities',
    section: 'right',
    category: 'Special Education',
    order: 5,
    featured: false
  },
  'Paper bag making – It’s a ‘mild’ job.docx': {
    id: 'story-paper-bag',
    title: 'Paper Bag Making — It’s a ‘Mild’ Job',
    section: 'right',
    category: 'Vocational Skills',
    order: 6,
    featured: false
  },
  'Sowing seeds of creativity….docx': {
    id: 'story-tailoring',
    title: 'Sowing Seeds of Creativity…',
    section: 'right',
    category: 'Tailoring & Craft',
    order: 7,
    featured: false
  },
  'Kitchen – Beehive of Activity.docx': {
    id: 'story-kitchen',
    title: 'Kitchen — Beehive of Activity',
    section: 'right',
    category: 'Community Life',
    order: 8,
    featured: false
  }
}

// Meta line cleaner: strip editorial tags that editors put in headers
function isMetaLine(text) {
  const t = text.toLowerCase().trim()
  if (t.startsWith('(') && t.endsWith(')')) return true
  if (t.includes('shoulder') || t.includes('main body') || t.includes('fun facts') || t.includes('to go in') || t.includes('long form')) return true
  if (t.startsWith('works to be highlighted')) return true
  return false
}

async function seedAllCompleteDocx() {
  await connectDB()
  console.log('\n======================================================')
  console.log('🚀 SEEDING 100% UNABRIDGED ARTICLES & RICH TIPTAP HTML')
  console.log('======================================================\n')

  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.docx'))
  const seededArticles = []
  const articlesMap = {}

  for (const file of files) {
    const meta = fileMetadata[file]
    if (!meta) continue

    const filePath = path.join(docsDir, file)
    const rawResult = await mammoth.extractRawText({ path: filePath })
    const htmlResult = await mammoth.convertToHtml({ path: filePath })

    let rawLines = rawResult.value.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    
    // Filter out meta header instructions
    const cleanLines = rawLines.filter((l) => !isMetaLine(l))

    // Determine clean title and paragraphs
    let title = meta.title
    let paragraphs = cleanLines

    // If first clean line is identical or very similar to title, remove it from paragraphs
    if (paragraphs.length > 0 && paragraphs[0].toLowerCase() === title.toLowerCase()) {
      paragraphs = paragraphs.slice(1)
    }

    const excerpt = paragraphs[0] || 'A story of care, dignity and empowerment at Swayamkrushi.'

    // Build rich HTML formatted for Tiptap and readers
    const contentHtml = `
      <h2>${title}</h2>
      <p class="article-lede"><strong>${excerpt}</strong></p>
      ${paragraphs.slice(1).map((p) => `<p>${p}</p>`).join('\n')}
    `.trim()

    const articleDoc = {
      id: meta.id,
      title,
      excerpt,
      paragraphs,
      contentHtml,
      category: meta.category,
      section: meta.section,
      attribution: 'Swayamkrushi Archives',
      imageUrl: imageMap[meta.id] || '',
      imageAlt: title,
      featured: meta.featured,
      order: meta.order
    }

    // Upsert into MongoDB Atlas
    await Article.findOneAndUpdate(
      { id: meta.id },
      { $set: articleDoc },
      { upsert: true, new: true }
    )

    seededArticles.push(articleDoc)
    articlesMap[meta.id] = articleDoc
    console.log(`✓ [${meta.section.toUpperCase().padEnd(7)}] "${title}" -> ${paragraphs.length} full paragraphs seeded!`)
  }

  // Update frontend data files
  const frontendDataDir = 'c:\\Users\\lenovo\\Desktop\\NGO swayamkrushi\\swayamkrushi\\src\\data'
  if (fs.existsSync(frontendDataDir)) {
    fs.writeFileSync(
      path.join(frontendDataDir, 'articles_complete.json'),
      JSON.stringify(seededArticles, null, 2),
      'utf-8'
    )
    console.log(`\n✓ Generated swayamkrushi/src/data/articles_complete.json with ${seededArticles.length} full articles!`)
  }

  // Also update allArticles.js in frontend with complete paragraphs
  const allArticlesJsPath = path.join(frontendDataDir, 'allArticles.js')
  if (fs.existsSync(allArticlesJsPath)) {
    const jsContent = `// Autogenerated with 100% complete unabridged content from docx archives
export const allArticles = ${JSON.stringify(seededArticles, null, 2)}

export function getArticleById(id) {
  return allArticles.find((a) => a.id === id) || null
}

export const articleImagesMap = ${JSON.stringify(imageMap, null, 2)}
`
    fs.writeFileSync(allArticlesJsPath, jsContent, 'utf-8')
    console.log(`✓ Updated swayamkrushi/src/data/allArticles.js with 100% full content!`)
  }

  console.log(`\n🎉 SUCCESS! All ${seededArticles.length} articles are 100% seeded with complete paragraphs in MongoDB Atlas and local fallback files!`)
  process.exit(0)
}

seedAllCompleteDocx().catch((err) => {
  console.error('Fatal seed error:', err)
  process.exit(1)
})
