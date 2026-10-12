import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

async function sync() {
  await mongoose.connect(process.env.MONGO_URI)
  const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }))
  const res = await Article.updateOne(
    { id: 'home-of-care' },
    {
      $set: {
        images: [
          {
            url: 'https://res.cloudinary.com/ll9equhn/image/upload/v1791531289/swayamkrushi/xg9qemgyszqdhbsjymy8.jpg',
            caption: 'The heart and soul of Swayamkrushi: Manjulaa Kalyaan, Founder-Director',
            alt: 'The heart and soul of Swayamkrushi: Manjulaa Kalyaan, Founder-Director',
            placement: 'right',
            size: 'small'
          }
        ]
      }
    }
  )
  console.log('Successfully synced home-of-care images:', res)
  process.exit(0)
}

sync().catch(e => { console.error(e); process.exit(1) })
