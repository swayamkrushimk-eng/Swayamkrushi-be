import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }))
  const all = await Article.find()
  for (const a of all) {
    const s = JSON.stringify(a)
    if (s.includes('p2lfxtvjc') || s.includes('swayamkrushi_campus_building') || s.includes('ge24b7evibo')) {
      console.log('FOUND MATCH:', a._id, a.id, a.title)
      console.log('Images:', a.images)
    }
  }
  process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
