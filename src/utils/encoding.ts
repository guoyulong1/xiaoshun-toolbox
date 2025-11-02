import pako from 'pako'

export function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach(b => bin += String.fromCharCode(b))
  return btoa(bin)
}

export function base64Decode(b64: string): string | null {
  try {
    const bin = atob(b64)
    const bytes = new Uint8Array([...bin].map(ch => ch.charCodeAt(0)))
    return new TextDecoder().decode(bytes)
  } catch { return null }
}

export function urlEncode(str: string): string { return encodeURIComponent(str) }
export function urlDecode(str: string): string { try { return decodeURIComponent(str) } catch { return '' } }

export function gzipCompressToBase64(str: string): string {
  const input = new TextEncoder().encode(str)
  const out = pako.gzip(input)
  return toBase64(out)
}

export function gzipDecompressFromBase64(b64: string): string | null {
  try {
    const bytes = fromBase64(b64)
    const out = pako.ungzip(bytes)
    return new TextDecoder().decode(out)
  } catch { return null }
}

export function zlibCompressToBase64(str: string): string {
  const input = new TextEncoder().encode(str)
  const out = pako.deflate(input)
  return toBase64(out)
}

export function zlibDecompressFromBase64(b64: string): string | null {
  try {
    const bytes = fromBase64(b64)
    const out = pako.inflate(bytes)
    return new TextDecoder().decode(out)
  } catch { return null }
}

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach(b => bin += String.fromCharCode(b))
  return btoa(bin)
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  return new Uint8Array([...bin].map(ch => ch.charCodeAt(0)))
}