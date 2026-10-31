import { Router } from 'express'
import { isCartesiaConfigured, synthesizeSpeech } from '../services/cartesiaTts.js'

const router = Router()

router.post('/speech', async (req, res) => {
  try {
    if (!isCartesiaConfigured()) {
      return res.status(503).json({
        error: 'Voice narration is not available right now.',
        code: 'TTS_NOT_CONFIGURED',
      })
    }

    const text = req.body?.text
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'No readable text available to narrate.' })
    }

    const { audioBuffer, contentType } = await synthesizeSpeech(text)

    res.set({
      'Content-Type': contentType,
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    })
    return res.status(200).send(audioBuffer)
  } catch (err) {
    const status = Number(err.status) || 502
    console.error('[Cartesia TTS]', err.message)
    return res.status(status).json({
      error: err.message || 'Failed to generate voice narration. Please try again.',
      code: err.code || 'TTS_FAILED',
    })
  }
})

export default router
