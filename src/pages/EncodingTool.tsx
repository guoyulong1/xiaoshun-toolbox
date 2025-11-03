import { useState } from 'react'
import { base64Encode, base64Decode, gzipCompressToBase64, gzipDecompressFromBase64, zlibCompressToBase64, zlibDecompressFromBase64 } from '../utils/encoding'

export default function EncodingTool() {
  // Base64 编码解码 - 使用独立的输入输出变量
  const [base64Input, setBase64Input] = useState('')
  const [base64Output, setBase64Output] = useState('')
  const [base64DecInput, setBase64DecInput] = useState('')
  const [base64DecOutput, setBase64DecOutput] = useState('')
  const [encodeError, setEncodeError] = useState('')
  const [decodeError, setDecodeError] = useState('')



  // Gzip 压缩解压
  const [gzipInput, setGzipInput] = useState('')
  const [gzipOutput, setGzipOutput] = useState('')
  const [gzipDecInput, setGzipDecInput] = useState('')
  const [gzipDecOutput, setGzipDecOutput] = useState('')

  // Zlib 压缩解压
  const [zlibInput, setZlibInput] = useState('')
  const [zlibOutput, setZlibOutput] = useState('')
  const [zlibDecInput, setZlibDecInput] = useState('')
  const [zlibDecOutput, setZlibDecOutput] = useState('')

  const copy = async (t: string) => { 
    try { 
      await navigator.clipboard.writeText(t)
      // 可以添加一个简单的提示
    } catch {} 
  }

  // Base64 编码
  const handleEncode = () => {
    try {
      setEncodeError('')
      const result = base64Encode(base64Input)
      setBase64Output(result)
    } catch (error) {
      setEncodeError('编码失败，请检查输入内容')
      setBase64Output('')
    }
  }

  // Base64 解码
  const handleDecode = () => {
    try {
      setDecodeError('')
      const result = base64Decode(base64DecInput)
      if (result === null) {
        setDecodeError('解码失败，请检查Base64格式是否正确')
        setBase64DecOutput('')
      } else {
        setBase64DecOutput(result)
      }
    } catch (error) {
      setDecodeError('解码失败，请检查Base64格式是否正确')
      setBase64DecOutput('')
    }
  }



  // Gzip 压缩
  const handleGzipCompress = () => {
    try {
      const result = gzipCompressToBase64(gzipInput)
      setGzipOutput(result)
    } catch (error) {
      setGzipOutput('压缩失败')
    }
  }

  // Gzip 解压
  const handleGzipDecompress = () => {
    try {
      const result = gzipDecompressFromBase64(gzipDecInput)
      setGzipDecOutput(result ?? '解压失败，请检查格式')
    } catch (error) {
      setGzipDecOutput('解压失败，请检查格式')
    }
  }

  // Zlib 压缩
  const handleZlibCompress = () => {
    try {
      const result = zlibCompressToBase64(zlibInput)
      setZlibOutput(result)
    } catch (error) {
      setZlibOutput('压缩失败')
    }
  }

  // Zlib 解压
  const handleZlibDecompress = () => {
    try {
      const result = zlibDecompressFromBase64(zlibDecInput)
      setZlibDecOutput(result ?? '解压失败，请检查格式')
    } catch (error) {
      setZlibDecOutput('解压失败，请检查格式')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">🔐</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">编码/解码工具</h1>
          <p className="text-gray-600 dark:text-gray-400">Base64 编码解码，以及 Gzip/Zlib 压缩与解压</p>
        </div>
      </div>

      {/* Base64 编码解码 */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Base64 编码/解码</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          <strong>注意：</strong>Base64 是编码方式，不是加密！任何人都可以轻松解码，不提供安全保护。
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 编码部分 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                原始文本 (Plain Text)
              </label>
              <textarea 
                className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" 
                placeholder="输入要编码的文本..."
                value={base64Input} 
                onChange={(e) => setBase64Input(e.target.value)} 
              />
            </div>
            <button 
              className="w-full px-4 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors font-medium"
              onClick={handleEncode}
            >
              🔒 编码为 Base64
            </button>
            {encodeError && (
              <p className="text-red-500 text-sm">{encodeError}</p>
            )}
          </div>

          {/* 解码部分 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base64 编码文本
              </label>
              <textarea 
                className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" 
                placeholder="输入要解码的Base64文本..."
                value={base64DecInput} 
                onChange={(e) => setBase64DecInput(e.target.value)} 
              />
            </div>
            <button 
              className="w-full px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-medium"
              onClick={handleDecode}
            >
              🔓 解码 Base64
            </button>
            {decodeError && (
              <p className="text-red-500 text-sm">{decodeError}</p>
            )}
          </div>
        </div>

        {/* 结果显示 */}
        {(base64Output || base64DecOutput) && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Base64 编码结果</span>
                <button 
                  className="px-3 py-1 rounded bg-gray-500 text-white text-xs hover:bg-gray-600"
                  onClick={() => copy(base64Output)}
                >
                  复制
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700 min-h-[80px] break-all text-sm font-mono">
                {base64Output || '点击编码按钮生成结果'}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">解码结果</span>
                <button 
                  className="px-3 py-1 rounded bg-gray-500 text-white text-xs hover:bg-gray-600"
                  onClick={() => copy(base64DecOutput)}
                >
                  复制
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700 min-h-[80px] break-all text-sm">
                {base64DecOutput || '点击解码按钮生成结果'}
              </div>
            </div>
          </div>
        )}
      </section>



      {/* Gzip 压缩解压 */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Gzip 压缩/解压（Base64）</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gzip压缩部分 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                原始文本
              </label>
              <textarea 
                className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
                placeholder="输入要压缩的文本..."
                value={gzipInput} 
                onChange={(e) => setGzipInput(e.target.value)} 
              />
            </div>
            <button 
              className="w-full px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
              onClick={handleGzipCompress}
            >
              🗜️ Gzip 压缩
            </button>
          </div>

          {/* Gzip解压部分 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gzip Base64 文本
              </label>
              <textarea 
                className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
                placeholder="输入要解压的Gzip Base64文本..."
                value={gzipDecInput} 
                onChange={(e) => setGzipDecInput(e.target.value)} 
              />
            </div>
            <button 
              className="w-full px-4 py-3 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors font-medium"
              onClick={handleGzipDecompress}
            >
              📦 Gzip 解压
            </button>
          </div>
        </div>

        {/* Gzip结果显示 */}
        {(gzipOutput || gzipDecOutput) && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gzip 压缩结果 (Base64)</span>
                <button 
                  className="px-3 py-1 rounded bg-gray-500 text-white text-xs hover:bg-gray-600"
                  onClick={() => copy(gzipOutput)}
                >
                  复制
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700 min-h-[60px] break-all text-sm font-mono">
                {gzipOutput || '点击压缩按钮生成结果'}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gzip 解压结果</span>
                <button 
                  className="px-3 py-1 rounded bg-gray-500 text-white text-xs hover:bg-gray-600"
                  onClick={() => copy(gzipDecOutput)}
                >
                  复制
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700 min-h-[60px] break-all text-sm">
                {gzipDecOutput || '点击解压按钮生成结果'}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Zlib 压缩解压 */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Zlib 压缩/解压（Base64）</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zlib压缩部分 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                原始文本
              </label>
              <textarea 
                className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" 
                placeholder="输入要压缩的文本..."
                value={zlibInput} 
                onChange={(e) => setZlibInput(e.target.value)} 
              />
            </div>
            <button 
              className="w-full px-4 py-3 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors font-medium"
              onClick={handleZlibCompress}
            >
              🗜️ Zlib 压缩
            </button>
          </div>

          {/* Zlib解压部分 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zlib Base64 文本
              </label>
              <textarea 
                className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" 
                placeholder="输入要解压的Zlib Base64文本..."
                value={zlibDecInput} 
                onChange={(e) => setZlibDecInput(e.target.value)} 
              />
            </div>
            <button 
              className="w-full px-4 py-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors font-medium"
              onClick={handleZlibDecompress}
            >
              📦 Zlib 解压
            </button>
          </div>
        </div>

        {/* Zlib结果显示 */}
        {(zlibOutput || zlibDecOutput) && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zlib 压缩结果 (Base64)</span>
                <button 
                  className="px-3 py-1 rounded bg-gray-500 text-white text-xs hover:bg-gray-600"
                  onClick={() => copy(zlibOutput)}
                >
                  复制
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700 min-h-[60px] break-all text-sm font-mono">
                {zlibOutput || '点击压缩按钮生成结果'}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zlib 解压结果</span>
                <button 
                  className="px-3 py-1 rounded bg-gray-500 text-white text-xs hover:bg-gray-600"
                  onClick={() => copy(zlibDecOutput)}
                >
                  复制
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700 min-h-[60px] break-all text-sm">
                {zlibDecOutput || '点击解压按钮生成结果'}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}