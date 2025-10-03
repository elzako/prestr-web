import { TransformStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}

if (!global.TransformStream) {
  global.TransformStream = TransformStream as typeof global.TransformStream
}
