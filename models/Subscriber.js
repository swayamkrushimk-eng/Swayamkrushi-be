import mongoose from 'mongoose'

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active'
    },
    source: {
      type: String,
      default: 'website_footer'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('Subscriber', subscriberSchema)
