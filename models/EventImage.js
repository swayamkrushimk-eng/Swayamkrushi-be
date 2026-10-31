import mongoose from 'mongoose'

function isVideoMedia(url) {
  if (!url || typeof url !== 'string') return false
  const clean = url.toLowerCase()
  return clean.includes('/video/upload/') || /\.(mp4|webm|mov|m4v|ogg|ogv|mkv)$/i.test(clean)
}

const eventMediaSchema = new mongoose.Schema(
  {
    url: {
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
    }
  },
  { _id: true }
)

const eventImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      default: ''
    },
    media: {
      type: [eventMediaSchema],
      default: []
    },
    imageUrl: {
      type: String,
      default: ''
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

eventImageSchema.pre('save', function (next) {
  if ((!this.media || this.media.length === 0) && this.imageUrl) {
    this.media = [
      {
        url: this.imageUrl,
        mediaType: this.mediaType === 'video' || isVideoMedia(this.imageUrl) ? 'video' : 'image',
        videoThumbnailUrl: this.videoThumbnailUrl || ''
      }
    ]
  }

  if (Array.isArray(this.media)) {
    this.media.forEach((item) => {
      if (isVideoMedia(item.url)) {
        item.mediaType = 'video'
      } else if (!item.mediaType) {
        item.mediaType = 'image'
      }
    })
    if (this.media[0]?.url) {
      this.imageUrl = this.media[0].url
      this.mediaType = this.media[0].mediaType || 'image'
      this.videoThumbnailUrl = this.media[0].videoThumbnailUrl || ''
    }
  }

  next()
})

export default mongoose.model('EventImage', eventImageSchema)
