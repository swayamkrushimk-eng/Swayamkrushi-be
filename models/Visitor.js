import mongoose from 'mongoose'

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      index: true
    },
    page: {
      type: String,
      default: '/'
    },
    userAgent: {
      type: String,
      default: ''
    },
    device: {
      type: String,
      default: 'desktop'
    },
    referrer: {
      type: String,
      default: ''
    },
    dateStr: {
      type: String, // YYYY-MM-DD for easy daily unique aggregation
      index: true
    }
  },
  {
    timestamps: true
  }
)

// Index for fast unique visitor queries
visitorSchema.index({ ip: 1, dateStr: 1 })

export default mongoose.model('Visitor', visitorSchema)
