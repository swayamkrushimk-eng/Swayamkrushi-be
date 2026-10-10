import mongoose from 'mongoose'

const committeeMemberSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Committee Member' },
    roleCategory: {
      type: String,
      enum: ['Founder', 'Patron', 'Presidency', 'Secretariat', 'Executive', 'General'],
      default: 'General'
    },
    designation: { type: String, default: 'Committee Member' },
    credentials: { type: String, default: '' },
    badge: { type: String, default: '' },
    colorTheme: { type: String, default: 'burgundy' },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    tags: [{ type: String }],
    initials: { type: String, default: '' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
)

export default mongoose.model('CommitteeMember', committeeMemberSchema)
