import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import nodemailer from 'nodemailer'
import { Readable } from 'stream'
import { connectDB } from './config/db.js'
import cloudinary from './config/cloudinary.js'
import Article from './models/Article.js'
import Accolade from './models/Accolade.js'
import Certificate from './models/Certificate.js'
import Faq from './models/Faq.js'
import ContactMessage from './models/ContactMessage.js'
import SiteSetting from './models/SiteSetting.js'
import Visitor from './models/Visitor.js'
import Subscriber from './models/Subscriber.js'
import EmailCampaign from './models/EmailCampaign.js'
import Insider from './models/Insider.js'
import CommitteeMember from './models/CommitteeMember.js'
import MediaBuzz from './models/MediaBuzz.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'swayamkrushi2026'

// Trust proxy for accurate client IP detection
app.set('trust proxy', true)

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

// Multer memory storage for image and video uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Helper: Extract clean client IP
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1'
}

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Swayamkrushi NGO Backend API',
    database: 'MongoDB Atlas'
  })
})

// ─── VISITOR ANALYTICS API (IP-BASED UNIQUE TRACKING) ─────────────────────
app.post('/api/analytics/track', async (req, res) => {
  try {
    const ip = getClientIp(req)
    const { page, userAgent, referrer } = req.body
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD

    // Detect device
    const ua = (userAgent || req.headers['user-agent'] || '').toLowerCase()
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|opera mini/i.test(ua)
    const device = isMobile ? 'mobile' : 'desktop'

    const visit = new Visitor({
      ip,
      page: page || '/',
      userAgent: userAgent || req.headers['user-agent'] || '',
      device,
      referrer: referrer || req.headers['referer'] || '',
      dateStr
    })
    await visit.save()

    res.json({ success: true, tracked: true })
  } catch (err) {
    // Non-blocking for frontend
    res.status(200).json({ success: false, error: err.message })
  }
})

app.get('/api/analytics/summary', async (req, res) => {
  try {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // 1. Total page views
    const totalPageViews = await Visitor.countDocuments()

    // 2. Total unique visitors (distinct IPs across all time)
    const uniqueIpsTotal = await Visitor.distinct('ip')
    const totalUniqueVisitors = uniqueIpsTotal.length

    // 3. Today's unique visitors
    const todayUniqueIps = await Visitor.distinct('ip', { dateStr: todayStr })
    const todayUniqueVisitors = todayUniqueIps.length

    // 4. Today's page views
    const todayPageViews = await Visitor.countDocuments({ dateStr: todayStr })

    // 5. Last 7 days breakdown
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const sevenDaysData = await Visitor.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: '$dateStr',
          views: { $sum: 1 },
          uniqueIps: { $addToSet: '$ip' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueIps' }
        }
      }
    ])

    // 6. Top visited pages
    const topPages = await Visitor.aggregate([
      { $group: { _id: '$page', views: { $sum: 1 }, uniqueIps: { $addToSet: '$ip' } } },
      { $sort: { views: -1 } },
      { $limit: 6 },
      {
        $project: {
          page: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueIps' }
        }
      }
    ])

    // 7. Device breakdown
    const devices = await Visitor.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ])

    // 8. Recent visitor logs
    const recentVisits = await Visitor.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('ip page device createdAt dateStr')

    res.json({
      totalUniqueVisitors,
      totalPageViews,
      todayUniqueVisitors,
      todayPageViews,
      sevenDaysData,
      topPages,
      devices,
      recentVisits
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message })
  }
})

// ─── SUBSCRIBERS & NEWSLETTER API ──────────────────────────────────────────
// Subscribe to newsletter from footer
app.post('/api/subscribers', async (req, res) => {
  try {
    const { email, name, source } = req.body
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    let subscriber = await Subscriber.findOne({ email: cleanEmail })

    if (subscriber) {
      if (subscriber.status === 'unsubscribed') {
        subscriber.status = 'active'
        await subscriber.save()
        return res.json({ success: true, message: 'Welcome back! You have re-subscribed to Swayamkrushi updates.' })
      }
      return res.json({ success: true, message: 'You are already subscribed to Swayamkrushi updates!' })
    }

    subscriber = new Subscriber({
      email: cleanEmail,
      name: name || '',
      source: source || 'website_footer'
    })
    await subscriber.save()

    // Send automated welcome email via SMTP
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `"Swayamkrushi NGO" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: 'Welcome to the Swayamkrushi Circle! 🌿',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 25px; color: #1b1418; background: #fbf9f5; border: 1px solid #e0d8cc; border-radius: 8px; max-width: 600px; margin: auto;">
              <h2 style="color: #6e1e38; margin-top: 0; font-family: Georgia, serif;">Thank You for Subscribing!</h2>
              <p>Hello${name ? ` ${name}` : ''},</p>
              <p>You are now connected with <strong>Swayamkrushi</strong>. We will keep you updated on our residents’ milestones, special events, annual reports, and stories of growth and hope.</p>
              <div style="background: #ffffff; border-left: 4px solid #6e1e38; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <em>"From small beginnings in 1987 with 3 adults to a thriving lifelong residential sanctuary and vocational hub."</em>
              </div>
              <p>You can reply directly to this email at any time if you'd like to visit or support our work.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #777;">
                Swayamkrushi NGO · Survey No.687, 688, Jawaharnagar Village, Secunderabad, Telangana.<br/>
                Phone: +91 9704245454 · +91 9963766729 · Email: swayamkrushimk@gmail.com
              </p>
            </div>
          `
        })
      } catch (mailErr) {
        console.warn('Welcome email error (non-fatal):', mailErr.message)
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! A confirmation email has been sent.'
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to process subscription', details: err.message })
  }
})

// GET all subscribers (for Admin)
app.get('/api/subscribers', async (req, res) => {
  try {
    const { search, status } = req.query
    const filter = {}
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { email: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') }
      ]
    }

    const subscribers = await Subscriber.find(filter).sort({ createdAt: -1 })
    res.json(subscribers)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscribers', details: err.message })
  }
})

// DELETE subscriber
app.delete('/api/subscribers/:id', async (req, res) => {
  try {
    const sub = await Subscriber.findByIdAndDelete(req.params.id)
    if (!sub) return res.status(404).json({ error: 'Subscriber not found' })
    res.json({ message: 'Subscriber removed successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subscriber', details: err.message })
  }
})

// PATCH subscriber status
app.patch('/api/subscribers/:id/status', async (req, res) => {
  try {
    const sub = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status || 'active' },
      { new: true }
    )
    if (!sub) return res.status(404).json({ error: 'Subscriber not found' })
    res.json(sub)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update subscriber status', details: err.message })
  }
})

// ─── EMAIL BROADCAST & CAMPAIGN DISPATCH API ──────────────────────────────
app.post('/api/newsletter/send', async (req, res) => {
  try {
    const { subject, category, contentHtml, selectedEmails } = req.body

    if (!subject || !contentHtml) {
      return res.status(400).json({ error: 'Subject and email message content are required' })
    }

    // Determine recipient emails
    let recipientList = []
    if (selectedEmails && Array.isArray(selectedEmails) && selectedEmails.length > 0) {
      recipientList = selectedEmails
    } else {
      const activeSubs = await Subscriber.find({ status: 'active' }).select('email')
      recipientList = activeSubs.map((s) => s.email)
    }

    if (recipientList.length === 0) {
      return res.status(400).json({ error: 'No recipients selected or available for sending' })
    }

    // Format rich HTML template matching Swayamkrushi theme
    const formattedEmailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f7f5f0; padding: 30px 15px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #2d161e; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="background: #2d161e; padding: 20px; text-align: center; border-bottom: 3px solid #6e1e38;">
            <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 22px; margin: 0; letter-spacing: 1px;">SWAYAMKRUSHI</h1>
            <p style="color: #d4af37; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">${category || 'Official Update'}</p>
          </div>
          
          <div style="padding: 28px 24px; color: #2b2528; line-height: 1.6; font-size: 15px;">
            <h2 style="font-family: Georgia, serif; color: #6e1e38; margin-top: 0; font-size: 20px;">${subject}</h2>
            
            <div style="margin: 20px 0;">
              ${contentHtml}
            </div>

            <hr style="border: none; border-top: 1px solid #e2ddd3; margin: 30px 0 20px 0;" />

            <div style="background: #fbf9f5; border-left: 4px solid #6e1e38; padding: 14px; border-radius: 4px; font-size: 13px; color: #554a40;">
              <strong>Swayamkrushi NGO</strong><br/>
              Survey No.687, 688, Jawaharnagar Village, Chennapur, Shamirpet Mandal, Secunderabad, Telangana.<br/>
              Phone: +91 9704245454 · +91 9963766729 · Email: swayamkrushimk@gmail.com
            </div>
          </div>

          <div style="background: #2d161e; color: #c5bcb0; padding: 14px 20px; font-size: 11px; text-align: center;">
            You received this update because you are subscribed to Swayamkrushi updates.
          </div>
        </div>
      </div>
    `

    // Extract plain text
    const textContent = contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

    // Send emails via SMTP in batch / BCC
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Swayamkrushi Updates" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Main sender
        bcc: recipientList,        // All subscribers in BCC for privacy
        subject: `[Swayamkrushi] ${subject}`,
        text: textContent,
        html: formattedEmailHtml
      })
    }

    // Record campaign in database
    const campaign = new EmailCampaign({
      subject,
      category: category || 'Newsletter & Updates',
      contentHtml,
      contentText: textContent,
      recipientCount: recipientList.length,
      recipients: recipientList,
      status: 'sent'
    })
    await campaign.save()

    res.status(201).json({
      success: true,
      message: `Email broadcast sent successfully to ${recipientList.length} subscriber(s)!`,
      recipientCount: recipientList.length,
      campaignId: campaign._id
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to send broadcast email', details: err.message })
  }
})

// GET sent campaigns
app.get('/api/newsletter/campaigns', async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find().sort({ createdAt: -1 })
    res.json(campaigns)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns', details: err.message })
  }
})

// ─── ADMIN AUTH & STATS ────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body
  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: 'admin-authenticated-token-' + Date.now(),
      message: 'Admin authentication successful'
    })
  }
  return res.status(401).json({ success: false, error: 'Invalid admin credentials' })
})

app.get('/api/admin/stats', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]

    const [
      articlesCount,
      accoladesCount,
      certificatesCount,
      faqsCount,
      inquiriesCount,
      unreadInquiries,
      subscribersCount,
      uniqueIpsTotal,
      todayUniqueIps,
      totalViews,
      campaignsCount,
      insidersCount
    ] = await Promise.all([
      Article.countDocuments(),
      Accolade.countDocuments(),
      Certificate.countDocuments(),
      Faq.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: { $ne: 'read' } }),
      Subscriber.countDocuments({ status: 'active' }),
      Visitor.distinct('ip'),
      Visitor.distinct('ip', { dateStr: todayStr }),
      Visitor.countDocuments(),
      EmailCampaign.countDocuments(),
      Insider.countDocuments()
    ])

    res.json({
      articles: articlesCount,
      accolades: accoladesCount,
      certificates: certificatesCount,
      faqs: faqsCount,
      inquiries: inquiriesCount,
      unreadInquiries,
      subscribers: subscribersCount,
      uniqueVisitors: uniqueIpsTotal.length,
      todayUniqueVisitors: todayUniqueIps.length,
      totalViews,
      campaigns: campaignsCount,
      insiders: insidersCount
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: err.message })
  }
})

// ─── SITE SETTINGS CMS API ────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await SiteSetting.findOne({ key: 'main_settings' })
    if (!settings) {
      settings = await SiteSetting.create({
        key: 'main_settings',
        orgName: 'Swayamkrushi',
        tagline: 'A Haven for the Mentally Challenged Since 1987',
        phone1: '+91 9704245454',
        phone2: '+91 9963766729',
        email: 'swayamkrushimk@gmail.com',
        address: 'Survey No.687, 688, Jawaharnagar Village, Chennapur, Shamirpet Mandal, Secunderabad, Telangana.',
        regNo: 'Registered under Societies Registration Act & National Trust Act',
        founderQuote: 'From small beginnings in 1987 with 3 adults to a thriving lifelong residential sanctuary and vocational hub.',
        bankName: 'State Bank of India',
        accountNumber: '30248492048',
        ifscCode: 'SBIN0011662',
        upiId: 'swayamkrushi@sbi'
      })
    }
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message })
  }
})

app.put('/api/settings', async (req, res) => {
  try {
    const settings = await SiteSetting.findOneAndUpdate(
      { key: 'main_settings' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    )
    res.json(settings)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update settings', details: err.message })
  }
})

// ─── ARTICLES API ──────────────────────────────────────────────────────────
// GET all articles
app.get('/api/articles', async (req, res) => {
  try {
    const { section, category, search, limit } = req.query
    const filter = {}

    if (section) filter.section = section
    if (category) filter.category = new RegExp(category, 'i')
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { paragraphs: new RegExp(search, 'i') }
      ]
    }

    let query = Article.find(filter).sort({ order: 1, createdAt: 1 })
    if (limit) query = query.limit(Number(limit))

    const articles = await query.exec()
    res.json(articles)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles', details: err.message })
  }
})

// GET single article by ID or MongoDB _id
app.get('/api/articles/:id', async (req, res) => {
  try {
    let article = await Article.findOne({ id: req.params.id })
    if (!article && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(req.params.id)
    }
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }
    res.json(article)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article', details: err.message })
  }
})

// POST create article
app.post('/api/articles', async (req, res) => {
  try {
    const payload = { ...req.body }
    if (!payload.id) {
      payload.id = 'art-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    }
    const article = new Article(payload)
    await article.save()
    res.status(201).json(article)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create article', details: err.message })
  }
})

// PUT update article
app.put('/api/articles/:id', async (req, res) => {
  try {
    let article = await Article.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!article && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
    }
    if (!article) return res.status(404).json({ error: 'Article not found' })
    res.json(article)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update article', details: err.message })
  }
})

// DELETE article
app.delete('/api/articles/:id', async (req, res) => {
  try {
    let article = await Article.findOneAndDelete({ id: req.params.id })
    if (!article && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findByIdAndDelete(req.params.id)
    }
    if (!article) return res.status(404).json({ error: 'Article not found' })
    res.json({ message: 'Article deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article', details: err.message })
  }
})

// ─── ACCOLADES & RECOGNITION API ───────────────────────────────────────────
app.get('/api/accolades', async (req, res) => {
  try {
    const featured = await Accolade.findOne({ isFeatured: true })
    const timeline = await Accolade.find({ isFeatured: { $ne: true } }).sort({ order: 1 })
    const certificates = await Certificate.find().sort({ order: 1 })

    res.json({
      featured,
      timeline,
      certificates
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accolades', details: err.message })
  }
})

app.post('/api/accolades', async (req, res) => {
  try {
    const payload = { ...req.body }
    if (!payload.id) {
      payload.id = 'acc-' + Date.now()
    }
    if (payload.isFeatured) {
      await Accolade.updateMany({}, { isFeatured: false })
    }
    const item = new Accolade(payload)
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create accolade', details: err.message })
  }
})

app.put('/api/accolades/:id', async (req, res) => {
  try {
    if (req.body.isFeatured) {
      await Accolade.updateMany({ id: { $ne: req.params.id } }, { isFeatured: false })
    }
    const item = await Accolade.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ error: 'Accolade not found' })
    res.json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update accolade', details: err.message })
  }
})

app.delete('/api/accolades/:id', async (req, res) => {
  try {
    const item = await Accolade.findOneAndDelete({ id: req.params.id })
    if (!item) return res.status(404).json({ error: 'Accolade not found' })
    res.json({ message: 'Accolade deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete accolade', details: err.message })
  }
})

// ─── CERTIFICATES API ──────────────────────────────────────────────────────
app.get('/api/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ order: 1 })
    res.json(certificates)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates', details: err.message })
  }
})

app.post('/api/certificates', async (req, res) => {
  try {
    const item = new Certificate(req.body)
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create certificate', details: err.message })
  }
})

app.delete('/api/certificates/:id', async (req, res) => {
  try {
    const item = await Certificate.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Certificate not found' })
    res.json({ message: 'Certificate deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete certificate', details: err.message })
  }
})

// ─── FAQS API ──────────────────────────────────────────────────────────────
app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ order: 1 })
    res.json(faqs)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch FAQs', details: err.message })
  }
})

app.post('/api/faqs', async (req, res) => {
  try {
    const item = new Faq(req.body)
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create FAQ', details: err.message })
  }
})

app.put('/api/faqs/:id', async (req, res) => {
  try {
    const item = await Faq.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ error: 'FAQ not found' })
    res.json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update FAQ', details: err.message })
  }
})

app.delete('/api/faqs/:id', async (req, res) => {
  try {
    const item = await Faq.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'FAQ not found' })
    res.json({ message: 'FAQ deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete FAQ', details: err.message })
  }
})

// ─── INQUIRIES & CONTACT MESSAGES API ──────────────────────────────────────
app.get('/api/inquiries', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiries', details: err.message })
  }
})

app.patch('/api/inquiries/:id/status', async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status || 'read' },
      { new: true }
    )
    if (!message) return res.status(404).json({ error: 'Message not found' })
    res.json(message)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update status', details: err.message })
  }
})

app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id)
    if (!message) return res.status(404).json({ error: 'Message not found' })
    res.json({ message: 'Message deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message', details: err.message })
  }
})

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, type, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' })
    }

    // Save to database
    const contactMsg = new ContactMessage({
      name,
      email,
      phone,
      subject: subject || `${type ? type.toUpperCase() : 'GENERAL'}: Message from ${name}`,
      type: type || 'inquiry',
      message
    })
    await contactMsg.save()

    // Send email notification via SMTP
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `"Swayamkrushi Portal" <${process.env.SMTP_USER}>`,
          to: process.env.SMTP_RECEIVER || process.env.SMTP_USER,
          replyTo: email,
          subject: `[Website Inquiry] ${subject || 'New Contact Form Submission'} from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nType: ${type || 'General'}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1b1418; background: #f7f5f2;">
              <h2 style="color: #6e1e38; border-bottom: 2px solid #6e1e38; padding-bottom: 8px;">New Swayamkrushi Website Inquiry</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
              <p><strong>Inquiry Type:</strong> ${type || 'Inquiry'}</p>
              <p><strong>Message:</strong></p>
              <div style="background: #ffffff; padding: 15px; border-left: 4px solid #6e1e38; border-radius: 4px;">
                ${message.replace(/\n/g, '<br/>')}
              </div>
            </div>
          `
        })
      } catch (mailErr) {
        console.warn('SMTP notification error (non-fatal):', mailErr.message)
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received and our team will get back to you soon.',
      id: contactMsg._id
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to process inquiry', details: err.message })
  }
})

// ─── INSIDERS VIDEO STORIES & TESTIMONIALS CMS API ────────────────────────
// GET all active insiders for public website
app.get('/api/insiders', async (req, res) => {
  try {
    const { category, search, limit } = req.query
    const filter = { active: true }

    if (category && category !== 'All Voices') {
      filter.category = new RegExp(category, 'i')
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { role: new RegExp(search, 'i') },
        { tag: new RegExp(search, 'i') },
        { quote: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ]
    }

    let query = Insider.find(filter).sort({ order: 1, createdAt: 1 })
    if (limit) query = query.limit(Number(limit))

    const insiders = await query.exec()
    res.json(insiders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch insiders', details: err.message })
  }
})

// GET all insiders for Admin portal (including inactive)
app.get('/api/insiders/admin', async (req, res) => {
  try {
    const insiders = await Insider.find().sort({ order: 1, createdAt: -1 })
    res.json(insiders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch insiders for admin', details: err.message })
  }
})

// GET single insider by id or _id
app.get('/api/insiders/:id', async (req, res) => {
  try {
    let item = await Insider.findOne({ id: req.params.id })
    if (!item && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Insider.findById(req.params.id)
    }
    if (!item) return res.status(404).json({ error: 'Insider story not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch insider story', details: err.message })
  }
})

// POST create new insider story / video
app.post('/api/insiders', async (req, res) => {
  try {
    const payload = { ...req.body }
    if (!payload.id) {
      payload.id = 'insider-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    }
    const item = new Insider(payload)
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create insider story', details: err.message })
  }
})

// PUT update insider story / video
app.put('/api/insiders/:id', async (req, res) => {
  try {
    let item = await Insider.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    )
    if (!item && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Insider.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      )
    }
    if (!item) return res.status(404).json({ error: 'Insider story not found' })
    res.json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update insider story', details: err.message })
  }
})

// DELETE insider story
app.delete('/api/insiders/:id', async (req, res) => {
  try {
    let item = await Insider.findOneAndDelete({ id: req.params.id })
    if (!item && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Insider.findByIdAndDelete(req.params.id)
    }
    if (!item) return res.status(404).json({ error: 'Insider story not found' })
    res.json({ message: 'Insider story deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete insider story', details: err.message })
  }
})

// ─── MANAGING COMMITTEE API (CRUD) ──────────────────────────────────────────
// GET all committee members
app.get('/api/committee', async (req, res) => {
  try {
    const members = await CommitteeMember.find().sort({ order: 1, createdAt: 1 })
    res.json(members)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch committee members', details: err.message })
  }
})

// POST create committee member
app.post('/api/committee', async (req, res) => {
  try {
    const data = req.body
    if (!data.id) {
      data.id = (data.name || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)
    }
    const member = new CommitteeMember(data)
    await member.save()
    res.status(201).json(member)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create committee member', details: err.message })
  }
})

// PUT update committee member
app.put('/api/committee/:id', async (req, res) => {
  try {
    let member = await CommitteeMember.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!member && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      member = await CommitteeMember.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      )
    }
    if (!member) return res.status(404).json({ error: 'Committee member not found' })
    res.json(member)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update committee member', details: err.message })
  }
})

// DELETE committee member
app.delete('/api/committee/:id', async (req, res) => {
  try {
    let member = await CommitteeMember.findOneAndDelete({ id: req.params.id })
    if (!member && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      member = await CommitteeMember.findByIdAndDelete(req.params.id)
    }
    if (!member) return res.status(404).json({ error: 'Committee member not found' })
    res.json({ message: 'Committee member deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete committee member', details: err.message })
  }
})

// ─── MEDIA BUZZ & PRESS API (CRUD) ──────────────────────────────────────────
// GET all media buzz articles
app.get('/api/media-buzz', async (req, res) => {
  try {
    const articles = await MediaBuzz.find().sort({ order: 1, createdAt: -1 })
    res.json(articles)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch media buzz articles', details: err.message })
  }
})

// POST create media buzz article
app.post('/api/media-buzz', async (req, res) => {
  try {
    const data = req.body
    if (!data.id) {
      data.id = (data.title || 'media').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)
    }
    const item = new MediaBuzz(data)
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create media buzz article', details: err.message })
  }
})

// PUT update media buzz article
app.put('/api/media-buzz/:id', async (req, res) => {
  try {
    let item = await MediaBuzz.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!item && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await MediaBuzz.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      )
    }
    if (!item) return res.status(404).json({ error: 'Media buzz article not found' })
    res.json(item)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update media buzz article', details: err.message })
  }
})

// DELETE media buzz article
app.delete('/api/media-buzz/:id', async (req, res) => {
  try {
    let item = await MediaBuzz.findOneAndDelete({ id: req.params.id })
    if (!item && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await MediaBuzz.findByIdAndDelete(req.params.id)
    }
    if (!item) return res.status(404).json({ error: 'Media buzz article not found' })
    res.json({ message: 'Media buzz article deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media buzz article', details: err.message })
  }
})

// ─── CLOUDINARY DIRECT UPLOAD API (Images & Videos) ─────────────────────────
app.post('/api/upload', upload.any(), async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0])
    if (!file) {
      return res.status(400).json({ error: 'No media file provided for upload' })
    }

    const ext = file.originalname ? file.originalname.toLowerCase().split('.').pop() : ''
    const videoExtensions = ['mp4', 'webm', 'mov', 'm4v', 'avi', 'mkv', 'ogg', '3gp', 'flv', 'wmv', 'ts']
    const isVideo =
      req.body?.resourceType === 'video' ||
      (file.mimetype && file.mimetype.startsWith('video/')) ||
      videoExtensions.includes(ext)

    const uploadStream = (buffer, options) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        })
        Readable.from(buffer).pipe(stream)
      })
    }

    const uploadOptions = {
      folder: 'swayamkrushi',
      resource_type: isVideo ? 'video' : 'auto'
    }

    if (isVideo) {
      uploadOptions.chunk_size = 6000000
    }

    const uploadRes = await uploadStream(file.buffer, uploadOptions)

    const finalUrl = uploadRes.secure_url
    let videoThumbnailUrl = null
    if (isVideo && finalUrl) {
      videoThumbnailUrl = finalUrl.replace(/\.(mp4|webm|mov|m4v|mkv|avi|ogg|3gp|flv|ts)$/i, '.jpg')
      if (!videoThumbnailUrl.endsWith('.jpg')) {
        videoThumbnailUrl += '.jpg'
      }
    }

    res.json({
      success: true,
      url: finalUrl,
      videoUrl: isVideo ? finalUrl : null,
      thumbnailUrl: videoThumbnailUrl,
      videoThumbnailUrl: videoThumbnailUrl,
      publicId: uploadRes.public_id,
      format: uploadRes.format,
      resourceType: uploadRes.resource_type || (isVideo ? 'video' : 'image')
    })
  } catch (err) {
    console.error('Cloudinary media upload error:', err)
    res.status(500).json({ error: 'Cloudinary media upload failed', details: err.message })
  }
})

// ─── START SERVER ──────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`✓ Swayamkrushi Backend Server running on port ${PORT}`)
    console.log(`  API Health: http://localhost:${PORT}/api/health`)
    console.log(`  Analytics: http://localhost:${PORT}/api/analytics/summary`)
    console.log(`  Subscribers: http://localhost:${PORT}/api/subscribers`)
  })
}

startServer()
