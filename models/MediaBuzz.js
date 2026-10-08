import mongoose from 'mongoose'

const mediaBuzzSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    outlet: { type: String, required: true },
    outletType: {
      type: String,
      enum: ['Print & Newspapers', 'Digital & Magazines'],
      default: 'Print & Newspapers'
    },
    date: { type: String, default: '' },
    category: { type: String, default: 'General Coverage' },
    badge: { type: String, default: 'MEDIA SPOTLIGHT' },
    image: { type: String, default: '' },
    isClipping: { type: Boolean, default: false },
    excerpt: { type: String, default: '' },
    readTime: { type: String, default: 'Read Report' },
    tags: [{ type: String }],
    articleUrl: { type: String, default: '' },
    shareUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
)

export default mongoose.model('MediaBuzz', mediaBuzzSchema)
