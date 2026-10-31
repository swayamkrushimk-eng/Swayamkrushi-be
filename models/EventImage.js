import mongoose from 'mongoose'

const eventImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      required: true
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    videoThumbnailUrl: {
      type: String,
      default: ''
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

function isVideoMedia(url) {
  if (!url || typeof url !== 'string') return false
  const clean = url.toLowerCase()
  return clean.includes('/video/upload/') || /\.(mp4|webm|mov|m4v|ogg|ogv|mkv)$/i.test(clean)
}

eventImageSchema.pre('save', function (next) {
  if (isVideoMedia(this.imageUrl)) {
    this.mediaType = 'video'
  } else if (!this.mediaType) {
    this.mediaType = 'image'
  }
  next()
})

export default mongoose.model('EventImage', eventImageSchema)
