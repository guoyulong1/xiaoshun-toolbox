import { useMemo, useState } from 'react'
import { base64Encode, base64Decode, urlEncode, urlDecode, gzipCompressToBase64, gzipDecompressFromBase64, zlibCompressToBase64, zlibDecompressFromBase64 } from '../utils/encoding'

export default function EncodingTool() {
  const [text, setText] = useState('')

  const b64 = useMemo(() => ({
    enc: base64Encode(text),
    dec: base64Decode(base64Encode(text)) ?? ''
  }), [text])

  const url = useMemo(() => ({
    enc: urlEncode(text),
    dec: urlDecode(urlEncode(text))
  }), [text])

  const [b64Input, setB64Input] = useState('')
  const [gzipOut, setGzipOut] = useState<string>('')
  const [gzipIn, setGzipIn] = useState('')
  const [gzipDec, setGzipDec] = useState<string>('')
  const [zlibOut, setZlibOut] = useState<string>('')
  const [zlibIn, setZlibIn] = useState('')
  const [zlibDec, setZlibDec] = useState<string>('')

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t) } catch {} }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">🔐</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">编码/解码工具</h1>
          <p className="text-gray-600">Base64、URL 编码解码，以及 Gzip/Zlib 压缩与解压</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-lg font-semibold mb-2">Base64 与 URL 编码/解码</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <strong>注意：</strong>Base64 是编码方式，不是加密！任何人都可以轻松解码，不提供安全保护。
        </p>
        <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={4} placeholder="输入文本" value={text} onChange={(e)=>setText(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-1">Base64 编码</div>
            <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 break-all">{b64.enc}</code>
            <div className="mt-2">
              <button className="px-3 py-1.5 rounded bg-purple-500 text-white text-xs hover:bg-purple-600" onClick={()=>copy(b64.enc)}>复制</button>
            </div>
            <div className="mt-3 font-medium mb-1">Base64 解码</div>
            <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 break-all">{b64.dec}</code>
            <div className="mt-2">
              <button className="px-3 py-1.5 rounded bg-purple-500 text-white text-xs hover:bg-purple-600" onClick={()=>copy(b64.dec)}>复制</button>
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">URL 编码</div>
            <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 break-all">{url.enc}</code>
            <div className="mt-2">
              <button className="px-3 py-1.5 rounded bg-purple-500 text-white text-xs hover:bg-purple-600" onClick={()=>copy(url.enc)}>复制</button>
            </div>
            <div className="mt-3 font-medium mb-1">URL 解码</div>
            <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 break-all">{url.dec}</code>
            <div className="mt-2">
              <button className="px-3 py-1.5 rounded bg-purple-500 text-white text-xs hover:bg-purple-600" onClick={()=>copy(url.dec)}>复制</button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-lg font-semibold">Gzip 压缩/解压（Base64）</h2>
        <div className="flex gap-2">
          <textarea className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={4} placeholder="输入文本以压缩" value={b64Input} onChange={(e)=>setB64Input(e.target.value)} />
          <button className="px-4 py-3 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors" onClick={()=>setGzipOut(gzipCompressToBase64(b64Input))}>压缩 → Base64</button>
        </div>
        {gzipOut && (
          <div>
            <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 break-all">{gzipOut}</code>
            <div className="mt-2">
              <button className="px-3 py-1.5 rounded bg-purple-500 text-white text-xs hover:bg-purple-600" onClick={()=>copy(gzipOut)}>复制</button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <textarea className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3} placeholder="输入 Gzip Base64 以解压" value={gzipIn} onChange={(e)=>setGzipIn(e.target.value)} />
          <button className="px-4 py-3 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors" onClick={()=>setGzipDec(gzipDecompressFromBase64(gzipIn) ?? '')}>解压</button>
        </div>
        {gzipDec && (
          <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 break-all">{gzipDec}</code>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-lg font-semibold">Zlib 压缩/解压（Base64）</h2>
        <div className="flex gap-2">
          <textarea className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={4} placeholder="输入文本以压缩" value={zlibIn} onChange={(e)=>setZlibIn(e.target.value)} />
          <button className="px-4 py-3 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors" onClick={()=>setZlibOut(zlibCompressToBase64(zlibIn))}>压缩 → Base64</button>
        </div>
        {zlibOut && (
          <div>
            <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 break-all">{zlibOut}</code>
            <div className="mt-2">
              <button className="px-3 py-1.5 rounded bg-purple-500 text-white text-xs hover:bg-purple-600" onClick={()=>copy(zlibOut)}>复制</button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <textarea className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3} placeholder="输入 Zlib Base64 以解压" value={zlibIn} onChange={(e)=>setZlibIn(e.target.value)} />
          <button className="px-4 py-3 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors" onClick={()=>setZlibDec(zlibDecompressFromBase64(zlibIn) ?? '')}>解压</button>
        </div>
        {zlibDec && (
          <code className="block bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 break-all">{zlibDec}</code>
        )}
      </section>
    </div>
  )
}