import mongoose from 'mongoose'

const emailCampaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'Newsletter & Updates'
    },
    contentHtml: {
      type: String,
      required: true
    },
    contentText: {
      type: String,
      default: ''
    },
    recipientCount: {
      type: Number,
      default: 0
    },
    recipients: {
      type: [String],
      default: []
    },
    sentBy: {
      type: String,
      default: 'admin'
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('EmailCampaign', emailCampaignSchema)
