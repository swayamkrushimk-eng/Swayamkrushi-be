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
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('EventImage', eventImageSchema)
