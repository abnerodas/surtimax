import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public')

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}

const SIZE = 512
const px = new Float32Array(SIZE * SIZE * 4)

function lerp(a, b, t) { return a + (b - a) * t }
function mix(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]
}

const bgTop = [13, 27, 46]
const bgBot = [15, 61, 58]
const sColor = [52, 211, 153]
const sColor2 = [20, 184, 166]
const glow = [16, 185, 129]

function inRoundedRect(x, y, r) {
  const rr = 112
  if (x >= r && x <= SIZE - r && y >= rr && y <= SIZE - rr) return true
  if (y >= rr && y <= SIZE - rr && x >= r && x <= SIZE - r) return true
  const cx = Math.min(Math.max(x, rr), SIZE - rr)
  const cy = Math.min(Math.max(y, rr), SIZE - rr)
  return (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr
}

function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
  ]
}

const curves = [
  { p: [[220, 300], [170, 300], [170, 258], [186, 258]] },
  { p: [[186, 258], [215, 258], [215, 288], [258, 288]] },
  { p: [[258, 288], [300, 288], [300, 252], [258, 252]] },
  { p: [[258, 252], [218, 252], [190, 252], [150, 252]] },
  { p: [[150, 252], [150, 178], [180, 150], [220, 150]] },
  { p: [[220, 150], [270, 150], [300, 158], [300, 190]] },
  { p: [[300, 190], [300, 208], [285, 214], [272, 214]] }
]

const stroke = 30
const samples = []
for (const c of curves) {
  for (let i = 0; i <= 40; i++) {
    const pt = bezier(c.p[0], c.p[1], c.p[2], c.p[3], i / 40)
    samples.push(pt)
  }
}

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4
    let c
    if (!inRoundedRect(x + 0.5, y + 0.5, 16)) {
      c = [0, 0, 0]
    } else {
      const t = (x + y) / (2 * SIZE)
      c = mix(bgTop, bgBot, t)
      const gx = x - 412
      const gy = y - 104
      const gd = Math.sqrt(gx * gx + gy * gy)
      if (gd < 90) {
        const f = (1 - gd / 90) * 0.16
        c = mix(c, glow, f)
      }
    }
    let dMin = 1e9
    for (const s of samples) {
      const dx = x - s[0]
      const dy = y - s[1]
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < dMin) dMin = d
    }
    if (dMin < stroke) {
      const f = Math.min(1, (stroke - dMin) / stroke)
      const sc = mix(sColor2, sColor, f)
      c = [sc[0] * (0.55 + 0.45 * f), sc[1] * (0.55 + 0.45 * f), sc[2] * (0.55 + 0.45 * f)]
    }
    px[i] = c[0]
    px[i + 1] = c[1]
    px[i + 2] = c[2]
    px[i + 3] = 255
  }
}

function downscale(src, size) {
  const out = new Float32Array(size * size * 4)
  const step = SIZE / size
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.floor(x * step)
      const sy = Math.floor(y * step)
      const s = (sy * SIZE + sx) * 4
      const d = (y * size + x) * 4
      for (let k = 0; k < 4; k++) out[d + k] = src[s + k]
    }
  }
  return out
}

mkdirSync(outDir, { recursive: true })
for (const size of [192, 512]) {
  const data = size === 512 ? px : downscale(px, size)
  const buf = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i++) buf[i] = Math.round(data[i])
  writeFileSync(resolve(outDir, `icon-${size}.png`), encodePng(size, size, buf))
  console.log(`icon-${size}.png generado`)
}