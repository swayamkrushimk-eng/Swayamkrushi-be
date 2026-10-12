import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import Insider from './models/Insider.js'

dotenv.config()

const initialInsiders = [
  {
    id: 'manjula-kalyan',
    name: 'Ms Manjulaa Kalyaan',
    role: 'Founder & Director, Swayamkrushi',
    category: 'Educators & Staff',
    tag: 'FOUNDER REFLECTIONS',
    orgBadge: 'DIRECTOR',
    duration: '3:45',
    thumbnail: '',
    videoUrl: '',
    quote: 'Every child deserves to live their best life. We don’t just teach them daily routines; we give them dignity, pride, and an eternal family.',
    description: 'Founder-director Manjulaa Kalyaan recounts the journey from starting with just two girls in a rented house in 1991 to building five-acre group homes, four national awards, and a university-affiliated B.Ed college.',
    order: 1,
    active: true
  },
  {
    id: 'd-dora-babu',
    name: 'D Dora Babu',
    role: 'Speech Therapist & Special Educator',
    category: 'Therapists',
    tag: 'SPEECH THERAPY INSIGHT',
    orgBadge: 'CLINIC',
    duration: '2:18',
    thumbnail: '',
    videoUrl: '',
    quote: 'My lifelong effort is to defeat silence in these children. When 15-year-old Sai uttered "Amma" for the first time, tears rolled down my cheeks.',
    description: 'Dora Babu explains the intensive oral motor exercises, phonetics, and mirror tools used at Swayamkrushi to help children with dual hearing and intellectual challenges discover their voice.',
    order: 2,
    active: true
  },
  {
    id: 'vishnu-kondoj',
    name: 'Vishnu Kondoj',
    role: 'Lead Graphic Designer at Tech Mahindra & Founder, Masterbrush',
    category: 'Alumni & Trainees',
    tag: 'ALUMNI SPOTLIGHT',
    orgBadge: 'ALUMNUS',
    duration: '3:13',
    thumbnail: '',
    videoUrl: '',
    quote: 'From delivering milk as a teenager to designing across Europe with Tech Mahindra — Manjula Madam gave me wings and taught me that grit conquers every hurdle.',
    description: 'Vishnu shares how Swayamkrushi nurtured his artistic spark, leading to international design projects, a career at Tech Mahindra, and the founding of Masterbrush Art Foundation for disabled artists.',
    order: 3,
    active: true
  },
  {
    id: 'sarada-sudhakar',
    name: 'M Sarada & Dr PVB Sudhakar',
    role: 'Principal & HOD, B.Ed Special Education College',
    category: 'Educators & Staff',
    tag: 'ACADEMIC EXCELLENCE',
    orgBadge: 'B.ED COLLEGE',
    duration: '2:06',
    thumbnail: '',
    videoUrl: '',
    quote: 'Our B.Ed degree is virtually a visa to go abroad. 75% to 80% of our graduates are placed across the United States and top institutions worldwide.',
    description: 'The faculty leadership describe the rigorous 80% mandatory attendance, daily hands-on classroom training, and Osmania University gold medals that distinguish Swayamkrushi educators globally.',
    order: 4,
    active: true
  },
  {
    id: 'g-aruna',
    name: 'G Aruna',
    role: 'Campus Gardener to Certified Special Educator',
    category: 'Educators & Staff',
    tag: 'TRANSFORMATION STORY',
    orgBadge: 'STAFF STORY',
    duration: '2:20',
    thumbnail: '',
    videoUrl: '',
    quote: 'I joined in 2020 as a humble campus gardener to feed my child. Today, thanks to full sponsorship and training from Swayamkrushi, I am a proud certified teacher.',
    description: 'Aruna shares her deeply inspiring journey overcoming extreme poverty as a single mother to earning her special education credentials and shaping young minds.',
    order: 5,
    active: true
  },
  {
    id: 'bharati-saini',
    name: 'Bharati Saini',
    role: 'Fine Artist & Art Educator from Uttarakhand',
    category: 'Therapists',
    tag: 'CREATIVE ARTS',
    orgBadge: 'ART STUDIO',
    duration: '2:46',
    thumbnail: '',
    videoUrl: '',
    quote: 'Art is the great equalizer. Painting with my elbow stumps, I see my 25 students open their hearts and express their purest imagination without fear.',
    description: 'Bharati demonstrates how art therapy transcends verbal barriers, enabling trainees with intellectual disabilities to create radiant canvases and craft pieces.',
    order: 6,
    active: true
  },
  {
    id: 'j-srilata',
    name: 'J Srilata',
    role: 'Former School Ayah to Special Educator',
    category: 'Educators & Staff',
    tag: 'MENTORSHIP & GRIT',
    orgBadge: 'STAFF STORY',
    duration: '2:32',
    thumbnail: '',
    videoUrl: '',
    quote: 'These children shower you with unconditional love every single day. Swayamkrushi showed me that compassion and perseverance can conquer any life challenge.',
    description: 'Hailing from an agricultural family in Siddipet, Srilata explains how mentorship and determination transformed her from an attendant to an inspiring classroom leader.',
    order: 7,
    active: true
  },
  {
    id: 'group-home-care',
    name: 'Group Home Caregivers & Residents',
    role: 'Residential Independent Living Program',
    category: 'Parents & Families',
    tag: 'INDEPENDENT LIVING',
    orgBadge: 'GROUP HOMES',
    duration: '3:02',
    thumbnail: '',
    videoUrl: '',
    quote: 'Living in small family clusters of eight, our girls learn to cook, commute, manage money, and build real friendships within the neighborhood community.',
    description: 'A close-up look into Swayamkrushi’s five pioneering Group Homes where adult women with intellectual challenges achieve true self-reliance.',
    order: 8,
    active: true
  }
]

const seedInsiders = async () => {
  try {
    await connectDB()
    console.log('✓ Connected to MongoDB Atlas')

    for (const item of initialInsiders) {
      await Insider.findOneAndUpdate(
        { id: item.id },
        { $set: item },
        { upsert: true, new: true }
      )
      console.log(`✓ Seeded Insider Video: ${item.name} (${item.tag})`)
    }

    console.log('🎉 Successfully seeded all Insiders video stories!')
    process.exit(0)
  } catch (err) {
    console.error('Error seeding Insiders:', err)
    process.exit(1)
  }
}

seedInsiders()
