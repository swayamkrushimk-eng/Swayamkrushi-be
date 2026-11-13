import { createHash } from 'crypto'
import { Readable } from 'stream'
import { CARTESIA_LOCKED_CONFIG as CONFIG, CARTESIA_LIMITS as LIMITS } from '../config/cartesia.js'
import cloudinary from '../config/cloudinary.js'
import Article from '../models/Article.js'

const audioCache = new Map()
const chunkBufferCache = new Map()
const durableUrlCache = new Map()
const MAX_CACHE_ENTRIES = 20
const MAX_CHUNK_CACHE_ENTRIES = 80
const CACHE_TTL_MS = 30 * 60 * 1000

export function getCartesiaApiKey() {
  return (process.env.CARTESIA_API_KEY || '').trim().replace(/^["']|["']$/g, '')
}

export function isCartesiaConfigured() {
  return Boolean(getCartesiaApiKey())
}

export function cleanTextForSpeech(rawText = '') {
  if (!rawText) return ''
  return String(rawText)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/—|–/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function splitTextIntoChunks(text, maxChunkSize = LIMITS.chunkSize) {
  const clean = cleanTextForSpeech(text)
  if (!clean) return []
  if (clean.length <= maxChunkSize) return [clean]

  const sentences = clean.match(/[^.!?]+[.!?]+|\S+$/g) || [clean]
  const chunks = []
  let currentChunk = ''

  for (const sentence of sentences) {
    const next = (currentChunk + ' ' + sentence).trim()
    if (next.length <= maxChunkSize) {
      currentChunk = next
    } else {
      if (currentChunk) chunks.push(currentChunk)
      if (sentence.trim().length <= maxChunkSize) {
        currentChunk = sentence.trim()
      } else {
        const parts = splitOversizedSentence(sentence.trim(), maxChunkSize)
        chunks.push(...parts.slice(0, -1))
        currentChunk = parts[parts.length - 1] || ''
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk)
  return chunks
}

function splitOversizedSentence(sentence, maxChunkSize) {
  const words = sentence.split(/\s+/).filter(Boolean)
  const parts = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxChunkSize) {
      current = next
    } else {
      if (current) parts.push(current)
      current = word.length <= maxChunkSize ? word : word.slice(0, maxChunkSize)
    }
  }
  if (current) parts.push(current)
  return parts
}

export function hashTranscript(text) {
  return createHash('sha256').update(cleanTextForSpeech(text)).digest('hex')
}

function cacheKeyFor(text) {
  return createHash('sha256').update(text).digest('hex')
}

function readCache(key) {
  const entry = audioCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    audioCache.delete(key)
    return null
  }
  return entry.buffer
}

function writeCache(key, buffer) {
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = audioCache.keys().next().value
    audioCache.delete(oldestKey)
  }
  audioCache.set(key, { buffer, createdAt: Date.now() })
}

function readChunkCache(key) {
  const entry = chunkBufferCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    chunkBufferCache.delete(key)
    return null
  }
  return entry.buffer
}

function writeChunkCache(key, buffer) {
  if (chunkBufferCache.size >= MAX_CHUNK_CACHE_ENTRIES) {
    const oldestKey = chunkBufferCache.keys().next().value
    chunkBufferCache.delete(oldestKey)
  }
  chunkBufferCache.set(key, { buffer, createdAt: Date.now() })
}

let creditsExhaustedUntil = 0

function markCreditsExhausted() {
  creditsExhaustedUntil = Date.now() + 15 * 60 * 1000
}

function creditsAreExhausted() {
  return Date.now() < creditsExhaustedUntil
}

function isCreditsError(status, details = '') {
  const text = String(details).toLowerCase()
  return (
    status === 402 ||
    text.includes('credit') ||
    text.includes('payment required') ||
    text.includes('upgrade your subscription')
  )
}

function userSafeCartesiaError(status, details = '') {
  if (isCreditsError(status, details)) {
    return 'Voice narration credits have run out. Please add Cartesia credits and try again.'
  }
  if (status === 401 || status === 403) {
    return 'Voice narration is temporarily unavailable.'
  }
  if (status === 429) {
    return 'Voice service is busy. Please try again in a moment.'
  }
  if (status === 408 || status === 504) {
    return 'Voice generation timed out. Please try again.'
  }
  if (details.toLowerCase().includes('duration')) {
    return 'This article is too long to narrate in one pass. Please try again.'
  }
  return 'Failed to generate voice narration. Please try again.'
}

async function fetchChunkAudio(chunkText, apiKey) {
  const payload = {
    model_id: CONFIG.modelId,
    transcript: chunkText,
    voice: CONFIG.voiceId,
    output_format: {
      container: CONFIG.outputContainer,
      sample_rate: CONFIG.sampleRate,
      bit_rate: CONFIG.bitRate,
    },
    locale: CONFIG.locale,
    normalization: CONFIG.normalization,
    generation_config: {
      speed: CONFIG.speed,
      volume: CONFIG.volume,
    },
  }

  let lastError = null
  const attempts = LIMITS.retryAttempts + 1

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Cartesia-Version': CONFIG.apiVersion,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(LIMITS.requestTimeoutMs),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        if (isCreditsError(response.status, errorText)) {
          markCreditsExhausted()
        }
        const retryable = response.status === 429 || response.status >= 500
        lastError = Object.assign(new Error(userSafeCartesiaError(response.status, errorText)), {
          status: isCreditsError(response.status, errorText)
            ? 402
            : response.status >= 500
              ? 502
              : response.status,
          code: isCreditsError(response.status, errorText) ? 'TTS_CREDITS_EXHAUSTED' : undefined,
          retryable,
        })
        if (!retryable || attempt === attempts) throw lastError
        await delay(400 * attempt)
        continue
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (err) {
      if (err.status) throw err
      const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError'
      lastError = Object.assign(
        new Error(
          timedOut
            ? 'Voice generation timed out. Please try again.'
            : 'Unable to reach the voice service. Please try again.'
        ),
        { status: timedOut ? 504 : 502, retryable: true }
      )
      if (attempt === attempts) throw lastError
      await delay(400 * attempt)
    }
  }

  throw lastError || new Error('Failed to generate voice narration. Please try again.')
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function mapPool(items, limit, mapper) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex
      nextIndex += 1
      results[current] = await mapper(items[current], current)
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

function assertConfigured() {
  const apiKey = getCartesiaApiKey()
  if (!apiKey) {
    const err = new Error('Voice narration is not available right now.')
    err.status = 503
    err.code = 'TTS_NOT_CONFIGURED'
    throw err
  }
  return apiKey
}

function assertCreditsAvailable() {
  if (creditsAreExhausted()) {
    const err = new Error(
      'Voice narration credits have run out. Please add Cartesia credits and try again.'
    )
    err.status = 402
    err.code = 'TTS_CREDITS_EXHAUSTED'
    throw err
  }
}

/**
 * Synthesize a single cleaned text chunk for progressive playback.
 */
export async function synthesizeSpeechChunk(rawText) {
  const apiKey = assertConfigured()
  const transcript = cleanTextForSpeech(rawText)
  if (!transcript) {
    const err = new Error('No readable text available to narrate.')
    err.status = 400
    throw err
  }

  if (transcript.length > LIMITS.chunkSize * 2) {
    const err = new Error('This narration chunk is too long. Please try again.')
    err.status = 413
    throw err
  }

  const key = cacheKeyFor(transcript)
  const cached = readChunkCache(key) || readCache(key)
  if (cached) {
    return { audioBuffer: cached, cached: true, contentType: 'audio/mpeg', chunkKey: key }
  }

  assertCreditsAvailable()

  const audioBuffer = await fetchChunkAudio(transcript, apiKey)
  writeChunkCache(key, audioBuffer)
  writeCache(key, audioBuffer)

  return { audioBuffer, cached: false, contentType: 'audio/mpeg', chunkKey: key }
}

/**
 * Synthesize speech with the locked Cartesia voice.
 * Client-provided voice/model/speed/volume values are ignored.
 */
export async function synthesizeSpeech(rawText) {
  assertConfigured()
  const apiKey = getCartesiaApiKey()

  const transcript = cleanTextForSpeech(rawText)
  if (!transcript) {
    const err = new Error('No readable text available to narrate.')
    err.status = 400
    throw err
  }

  if (transcript.length > LIMITS.maxTranscriptChars) {
    const err = new Error('This article is too long to narrate in one request.')
    err.status = 413
    throw err
  }

  const key = cacheKeyFor(transcript)
  const cached = readCache(key)
  if (cached) {
    return { audioBuffer: cached, cached: true, contentType: 'audio/mpeg', hash: key }
  }

  const durableUrl = durableUrlCache.get(key)
  if (durableUrl) {
    return { url: durableUrl, cached: true, contentType: 'audio/mpeg', hash: key }
  }

  assertCreditsAvailable()

  const chunks = splitTextIntoChunks(transcript)
  const buffers = await mapPool(chunks, LIMITS.chunkConcurrency || 3, async (chunk) => {
    const chunkKey = cacheKeyFor(chunk)
    const existing = readChunkCache(chunkKey)
    if (existing) return existing
    const buffer = await fetchChunkAudio(chunk, apiKey)
    writeChunkCache(chunkKey, buffer)
    return buffer
  })
  const audioBuffer = buffers.length === 1 ? buffers[0] : Buffer.concat(buffers)
  writeCache(key, audioBuffer)

  return { audioBuffer, cached: false, contentType: 'audio/mpeg', hash: key }
}

async function uploadNarrationToCloudinary(buffer, articleId, hash) {
  const safeId = String(articleId || 'article')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 80)

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'swayamkrushi/narration',
        resource_type: 'video',
        public_id: `narration_${safeId}_${String(hash).slice(0, 16)}`,
        overwrite: true,
        format: 'mp3',
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result?.secure_url || null)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function persistArticleNarration(articleId, url, hash) {
  if (!articleId || !url || !hash) return
  try {
    await Article.findOneAndUpdate(
      { id: articleId },
      { $set: { narrationAudioUrl: url, narrationHash: hash } },
      { new: false }
    )
  } catch (err) {
    console.warn('[TTS cache] Failed to persist article narration fields:', err.message)
  }
}

/**
 * Look up durable or memory-cached narration for an article transcript hash.
 */
export async function getCachedNarration(articleId, hash) {
  if (!hash) return null

  const mem = readCache(hash)
  if (mem) {
    return { audioBuffer: mem, source: 'memory', contentType: 'audio/mpeg', hash }
  }

  const durableUrl = durableUrlCache.get(hash)
  if (durableUrl) {
    return { url: durableUrl, source: 'durable', contentType: 'audio/mpeg', hash }
  }

  if (articleId) {
    try {
      const article = await Article.findOne({ id: articleId })
        .select('narrationAudioUrl narrationHash')
        .lean()
      if (article?.narrationAudioUrl && article.narrationHash === hash) {
        durableUrlCache.set(hash, article.narrationAudioUrl)
        return {
          url: article.narrationAudioUrl,
          source: 'article',
          contentType: 'audio/mpeg',
          hash,
        }
      }
    } catch (err) {
      console.warn('[TTS cache] Article lookup failed:', err.message)
    }
  }

  return null
}

/**
 * Concatenate already-generated chunk buffers (or synthesize missing ones),
 * then store the finished MP3 in memory + Cloudinary + article fields.
 */
export async function finalizeNarrationCache({ articleId, hash, chunks }) {
  if (!hash || !Array.isArray(chunks) || chunks.length === 0) {
    const err = new Error('Missing narration chunks to cache.')
    err.status = 400
    throw err
  }

  const apiKey = assertConfigured()
  const cleanedChunks = chunks.map((c) => cleanTextForSpeech(c)).filter(Boolean)
  if (cleanedChunks.length === 0) {
    const err = new Error('No readable text available to narrate.')
    err.status = 400
    throw err
  }

  const existing = await getCachedNarration(articleId, hash)
  if (existing?.url) {
    return { url: existing.url, cached: true, hash }
  }
  if (existing?.audioBuffer) {
    let url = null
    try {
      url = await uploadNarrationToCloudinary(existing.audioBuffer, articleId, hash)
      if (url) {
        durableUrlCache.set(hash, url)
        await persistArticleNarration(articleId, url, hash)
      }
    } catch (err) {
      console.warn('[TTS cache] Cloudinary upload failed:', err.message)
    }
    return { url, audioBuffer: existing.audioBuffer, cached: true, hash, contentType: 'audio/mpeg' }
  }

  assertCreditsAvailable()

  const buffers = await mapPool(cleanedChunks, LIMITS.chunkConcurrency || 3, async (chunk) => {
    const chunkKey = cacheKeyFor(chunk)
    const cachedChunk = readChunkCache(chunkKey) || readCache(chunkKey)
    if (cachedChunk) return cachedChunk
    const buffer = await fetchChunkAudio(chunk, apiKey)
    writeChunkCache(chunkKey, buffer)
    return buffer
  })

  const audioBuffer = buffers.length === 1 ? buffers[0] : Buffer.concat(buffers)
  writeCache(hash, audioBuffer)

  let url = null
  try {
    url = await uploadNarrationToCloudinary(audioBuffer, articleId, hash)
    if (url) {
      durableUrlCache.set(hash, url)
      await persistArticleNarration(articleId, url, hash)
    }
  } catch (err) {
    console.warn('[TTS cache] Cloudinary upload failed, keeping memory cache only:', err.message)
  }

  return { url, audioBuffer, cached: false, hash, contentType: 'audio/mpeg' }
}
