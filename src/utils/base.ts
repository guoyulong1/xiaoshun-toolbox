export function parseNumber(input: string, base: 2|8|10|16): bigint | null {
  const s = input.trim().toLowerCase()
  if (!s) return null
  const sign = s.startsWith('-') ? -1n : 1n
  const body = s.startsWith('-') ? s.slice(1) : s
  const digits = body.replace(/^0x|^0o|^0b/, '')
  const map: Record<string, number> = {
    '0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,
    '8':8,'9':9,'a':10,'b':11,'c':12,'d':13,'e':14,'f':15
  }
  const b = BigInt(base)
  let v = 0n
  for (const ch of digits) {
    const d = map[ch]
    if (d === undefined || d >= base) return null
    v = v * b + BigInt(d)
  }
  return v * sign
}

export function toBaseString(value: bigint, base: 2|8|10|16): string {
  if (base === 10) return value.toString(10)
  const prefix = base === 16 ? '0x' : base === 8 ? '0o' : '0b'
  const abs = value < 0n ? -value : value
  const s = abs.toString(Number(base))
  return value < 0n ? '-' + prefix + s : prefix + s
}

export function asciiToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

export function hexToBytes(hex: string): Uint8Array | null {
  const clean = hex.trim().replace(/^0x/,'').replace(/\s+/g,'')
  if (clean.length % 2 !== 0) return null
  const out = new Uint8Array(clean.length/2)
  for (let i=0;i<out.length;i++){
    const byte = Number.parseInt(clean.slice(i*2,i*2+2), 16)
    if (Number.isNaN(byte)) return null
    out[i] = byte
  }
  return out
}

export function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('')
}

export function bytesToAscii(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}