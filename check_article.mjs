import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  const a = await mongoose.connection.db.collection('articles').findOne({ id: 'home-of-care' })
  console.log('--- START ARTICLE ---')
  console.log(JSON.stringify(a, null, 2))
  console.log('--- END ARTICLE ---')
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
