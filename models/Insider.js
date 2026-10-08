import mongoose from 'mongoose'

const insiderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Educators & Staff',
      trim: true
    },
    tag: {
      type: String,
      default: 'INSIDER STORY',
      trim: true
    },
    orgBadge: {
      type: String,
      default: 'SWAYAMKRUSHI',
      trim: true
    },
    duration: {
      type: String,
      default: '2:30',
      trim: true
    },
    thumbnail: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    quote: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

const Insider = mongoose.model('Insider', insiderSchema)
export default Insider
