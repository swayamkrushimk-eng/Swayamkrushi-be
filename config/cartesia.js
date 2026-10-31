/**
 * Locked Cartesia voice configuration.
 * These values are the only TTS settings the application may use.
 * Do not accept client overrides for voice, model, speed, volume, or sample rate.
 */
export const CARTESIA_LOCKED_CONFIG = Object.freeze({
  voiceId: '5a98515d-ec43-45de-a8aa-d998030a76f3',
  voiceName: 'jay sir no audio noise',
  modelId: 'sonic-3.6',
  sampleRate: 44100,
  speed: 1.0,
  volume: 1.0,
  apiVersion: '2026-08-14',
  endpoint: 'https://api.cartesia.ai/tts/bytes',
  locale: 'en',
  normalization: 'en-IN',
  outputContainer: 'mp3',
  bitRate: 128000,
})

export const CARTESIA_LIMITS = Object.freeze({
  maxTranscriptChars: 100000,
  chunkSize: 4500,
  chunkConcurrency: 3,
  requestTimeoutMs: 45000,
  retryAttempts: 1,
})
