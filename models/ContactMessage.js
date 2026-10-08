import mongoose from 'mongoose'

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: ''
    },
    subject: {
      type: String,
      default: 'General Inquiry'
    },
    type: {
      type: String,
      enum: ['inquiry', 'volunteer', 'donation', 'admission', 'other'],
      default: 'inquiry'
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('ContactMessage', contactMessageSchema)
