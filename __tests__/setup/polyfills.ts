import fetch, { Headers, Request, Response } from 'cross-fetch'
import { TransformStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'

if (!global.fetch) {
  global.fetch = fetch as typeof global.fetch
}

if (!global.Headers) {
  global.Headers = Headers as typeof global.Headers
}

if (!global.Request) {
  global.Request = Request as typeof global.Request
}

if (!global.Response) {
  global.Response = Response as typeof global.Response
}

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}

if (!global.TransformStream) {
  global.TransformStream = TransformStream as typeof global.TransformStream
}
