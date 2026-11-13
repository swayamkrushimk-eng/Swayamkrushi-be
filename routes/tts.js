import { Router } from 'express'
import {
  isCartesiaConfigured,
  synthesizeSpeech,
  synthesizeSpeechChunk,
  getCachedNarration,
  finalizeNarrationCache,
  hashTranscript,
  splitTextIntoChunks,
  cleanTextForSpeech,
} from '../services/cartesiaTts.js'

const router = Router()

function sendAudioBuffer(res, audioBuffer, contentType = 'audio/mpeg', extraHeaders = {}) {
  res.set({
    'Content-Type': contentType,
    'Content-Length': audioBuffer.length,
    'Cache-Control': 'private, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  })
  return res.status(200).send(audioBuffer)
}

function handleTtsError(res, err, label = 'Cartesia TTS') {
  const status = Number(err.status) || 502
  console.error(`[${label}]`, err.message)
  return res.status(status).json({
    error: err.message || 'Failed to generate voice narration. Please try again.',
    code: err.code || 'TTS_FAILED',
  })
}

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

    const result = await synthesizeSpeech(text)
    if (result.url && !result.audioBuffer) {
      return res.status(200).json({
        audioUrl: result.url,
        cached: true,
        hash: result.hash || hashTranscript(text),
      })
    }

    return sendAudioBuffer(res, result.audioBuffer, result.contentType, {
      'X-TTS-Cached': result.cached ? '1' : '0',
      'X-TTS-Hash': result.hash || hashTranscript(text),
    })
  } catch (err) {
    return handleTtsError(res, err)
  }
})

/** Progressive playback: synthesize one chunk only. */
router.post('/speech-chunk', async (req, res) => {
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

    const chunkIndex = Number(req.body?.chunkIndex) || 0
    const { audioBuffer, contentType, cached } = await synthesizeSpeechChunk(text)

    return sendAudioBuffer(res, audioBuffer, contentType, {
      'X-TTS-Cached': cached ? '1' : '0',
      'X-TTS-Chunk-Index': String(chunkIndex),
    })
  } catch (err) {
    return handleTtsError(res, err, 'Cartesia TTS chunk')
  }
})

/** Look up durable/memory narration for articleId + transcript hash. */
router.get('/cached', async (req, res) => {
  try {
    const articleId = typeof req.query.articleId === 'string' ? req.query.articleId : ''
    let hash = typeof req.query.hash === 'string' ? req.query.hash : ''
    const text = typeof req.query.text === 'string' ? req.query.text : ''

    if (!hash && text) {
      hash = hashTranscript(text)
    }

    if (!hash) {
      return res.status(400).json({ error: 'Missing narration hash.' })
    }

    const cached = await getCachedNarration(articleId, hash)
    if (!cached) {
      return res.status(404).json({ error: 'No cached narration found.', hash })
    }

    if (cached.url) {
      return res.status(200).json({
        audioUrl: cached.url,
        cached: true,
        hash,
        source: cached.source,
      })
    }

    return sendAudioBuffer(res, cached.audioBuffer, cached.contentType, {
      'X-TTS-Cached': '1',
      'X-TTS-Hash': hash,
    })
  } catch (err) {
    return handleTtsError(res, err, 'Cartesia TTS cache get')
  }
})

/**
 * Finalize progressive narration: concat chunk buffers (reuse in-memory chunk
 * cache when possible), upload to Cloudinary, persist on article.
 */
router.put('/cached', async (req, res) => {
  try {
    if (!isCartesiaConfigured()) {
      return res.status(503).json({
        error: 'Voice narration is not available right now.',
        code: 'TTS_NOT_CONFIGURED',
      })
    }

    const articleId = typeof req.body?.articleId === 'string' ? req.body.articleId : ''
    let hash = typeof req.body?.hash === 'string' ? req.body.hash : ''
    const text = typeof req.body?.text === 'string' ? req.body.text : ''
    let chunks = Array.isArray(req.body?.chunks) ? req.body.chunks : null

    if (!chunks && text) {
      chunks = splitTextIntoChunks(text)
      if (!hash) hash = hashTranscript(text)
    }

    if (!hash && text) {
      hash = hashTranscript(cleanTextForSpeech(text))
    }

    if (!hash || !chunks?.length) {
      return res.status(400).json({ error: 'Missing hash or narration chunks.' })
    }

    const result = await finalizeNarrationCache({ articleId, hash, chunks })

    if (result.url) {
      return res.status(200).json({
        audioUrl: result.url,
        cached: Boolean(result.cached),
        hash: result.hash,
      })
    }

    if (result.audioBuffer) {
      return sendAudioBuffer(res, result.audioBuffer, result.contentType || 'audio/mpeg', {
        'X-TTS-Cached': result.cached ? '1' : '0',
        'X-TTS-Hash': result.hash,
      })
    }

    return res.status(200).json({ cached: true, hash: result.hash })
  } catch (err) {
    return handleTtsError(res, err, 'Cartesia TTS cache put')
  }
})

export default router
