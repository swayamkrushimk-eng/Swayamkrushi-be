import mongoose from 'mongoose'

const accoladeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    year: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    presenter: {
      type: String,
      default: ''
    },
    presentedBy: {
      type: String,
      default: ''
    },
    badge: {
      type: String,
      default: ''
    },
    shortDesc: {
      type: String,
      required: true
    },
    fullDesc: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    imageLabel: {
      type: String,
      default: ''
    },
    isFeatured: {
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

export default mongoose.model('Accolade', accoladeSchema)
