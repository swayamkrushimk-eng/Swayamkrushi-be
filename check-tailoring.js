import 'dotenv/config'
import mongoose from 'mongoose'

async function check() {
  await mongoose.connect(process.env.MONGO_URI)
  const db = mongoose.connection.db
  const doc = await db.collection('articles').findOne({
    $or: [{ id: 'story-sowing-seeds' }, { id: 'story-tailoring' }]
  })
  console.log('ID:', doc?.id)
  console.log('Title:', doc?.title)
  console.log('videoUrl:', doc?.videoUrl)
  console.log('featuredMediaType:', doc?.featuredMediaType)
  console.log('imageUrl:', doc?.imageUrl)
  console.log('images:', doc?.images)
  console.log('--- contentHtml ---')
  console.log(doc?.contentHtml)
  await mongoose.disconnect()
}

check().catch(console.error)
