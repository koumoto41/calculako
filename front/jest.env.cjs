process.env.VITE_API_BASE_URL = '/api'

// jsdom does not provide these globals, but react-router-dom needs them.
const { TextEncoder, TextDecoder } = require('node:util')
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
}
