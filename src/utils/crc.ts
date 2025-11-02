// CRC32 (IEEE 802.3) 标准实现
export function crc32(bytes: Uint8Array): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i]
    for (let j = 0; j < 8; j++) {
      const mask = (crc & 1) ? 0xEDB88320 : 0
      crc = (crc >>> 1) ^ mask
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

// CRC16-IBM (CRC-16/ANSI, 多项式 0xA001)
export function crc16(bytes: Uint8Array): number {
  let crc = 0xFFFF
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i]
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xA001
      } else {
        crc = crc >>> 1
      }
    }
  }
  return crc & 0xFFFF
}

export function hexToBytesSafe(hex: string): Uint8Array | null {
  const clean = hex.trim().replace(/^0x/,'').replace(/\s+/g,'')
  if (!clean) return new Uint8Array()
  if (clean.length % 2 !== 0) return null
  const out = new Uint8Array(clean.length/2)
  for (let i=0;i<out.length;i++){
    const byte = Number.parseInt(clean.slice(i*2,i*2+2), 16)
    if (Number.isNaN(byte)) return null
    out[i] = byte
  }
  return out
}