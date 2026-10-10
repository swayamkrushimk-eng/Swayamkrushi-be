import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    excerpt: {
      type: String,
      required: true
    },
    paragraphs: {
      type: [String],
      default: []
    },
    contentHtml: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'Stories & Milestones'
    },
    section: {
      type: String,
      enum: ['left', 'main', 'right', 'feature', 'other'],
      default: 'main'
    },
    attribution: {
      type: String,
      default: 'Swayamkrushi Archives'
    },
    featuredMediaType: {
      type: String,
      enum: ['image', 'video', 'text'],
      default: 'image'
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'text'],
      default: 'image'
    },
    videoUrl: {
      type: String,
      default: ''
    },
    videoThumbnailUrl: {
      type: String,
      default: ''
    },
    videoPosterUrl: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    imageAlt: {
      type: String,
      default: ''
    },
    images: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    imageUrls: {
      type: [String],
      default: []
    },
    hasThumbnail: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('Article', articleSchema)
