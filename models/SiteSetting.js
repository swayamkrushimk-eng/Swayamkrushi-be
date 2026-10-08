import mongoose from 'mongoose'

const siteSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main_settings'
    },
    orgName: {
      type: String,
      default: 'Swayamkrushi'
    },
    tagline: {
      type: String,
      default: 'A Haven for the Mentally Challenged Since 1987'
    },
    phone1: {
      type: String,
      default: '+91 9704245454'
    },
    phone2: {
      type: String,
      default: '+91 9963766729'
    },
    email: {
      type: String,
      default: 'swayamkrushimk@gmail.com'
    },
    address: {
      type: String,
      default: 'Survey No.687, 688, Jawaharnagar Village, Chennapur, Shamirpet Mandal, Secunderabad, Telangana.'
    },
    regNo: {
      type: String,
      default: 'Registered under Societies Registration Act & National Trust Act'
    },
    founderQuote: {
      type: String,
      default: 'From small beginnings in 1987 with 3 adults to a thriving lifelong residential sanctuary and vocational hub.'
    },
    bankName: {
      type: String,
      default: 'State Bank of India'
    },
    accountNumber: {
      type: String,
      default: '30248492048'
    },
    ifscCode: {
      type: String,
      default: 'SBIN0011662'
    },
    upiId: {
      type: String,
      default: 'swayamkrushi@sbi'
    },
    circleLeftImage: {
      type: String,
      default: ''
    },
    circleCenterImage: {
      type: String,
      default: ''
    },
    circleRightImage: {
      type: String,
      default: ''
    },
    joinUsBadgeImage: {
      type: String,
      default: ''
    },
    circleLeftPos: {
      type: String,
      default: 'center 50%'
    },
    circleCenterPos: {
      type: String,
      default: 'center 50%'
    },
    circleRightPos: {
      type: String,
      default: 'center 52%'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('SiteSetting', siteSettingSchema)
