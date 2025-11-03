import { useMemo, useState } from 'react'
import { parseNumber, toBaseString, asciiToBytes, hexToBytes, bytesToHex, bytesToAscii } from '../utils/base'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'

export default function BaseConvertTool() {
  const [input, setInput] = useState('')
  const [inputBase, setInputBase] = useState<2|8|10|16>(10)

  const numberResult = useMemo(() => {
    if (!input.trim()) return null;
    
    try {
      const b = parseNumber(input, inputBase)
      if (b === null) {
        return { error: '输入的数字格式不正确' };
      }
      
      // 检查输入是否包含超出进制范围的字符
      const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, inputBase);
      const upperInput = input.toUpperCase();
      for (let char of upperInput) {
        if (!validChars.includes(char) && char !== '-' && char !== 'X' && char !== 'O' && char !== 'B') {
          return { error: `输入包含超出${inputBase}进制范围的字符: ${char}` };
        }
      }
      
      return {
        bin: toBaseString(b, 2),
        oct: toBaseString(b, 8),
        dec: toBaseString(b, 10),
        hex: toBaseString(b, 16),
      }
    } catch (error) {
      return { error: '数字转换失败，请检查输入格式' };
    }
  }, [input, inputBase])

  // 字符串 / Hex ↔ 字节
  const [textInput, setTextInput] = useState('')
  const [mode, setMode] = useState<'ascii'|'hex'>('ascii')
  const bytesResult = useMemo(() => {
    if (!textInput.trim()) return null
    const bytes = mode === 'ascii' ? asciiToBytes(textInput) : hexToBytes(textInput)
    if (!bytes) return null
    return {
      len: bytes.length,
      hex: bytesToHex(bytes),
      ascii: bytesToAscii(bytes),
    }
  }, [textInput, mode])

  return (
    <div className="space-y-8">
      <PageHeader icon={<span>🔢</span>} title="进制转换" subtitle="在不同进制之间转换数字和字符串" accent="green" />
      
      <Card className="p-6" title="数字进制互转（支持 BigInt/负数）" icon={<span>🔄</span>} accent="green">
        <div className="flex items-center gap-3 mb-4">
          <input 
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
            placeholder="输入数字，如 -123 或 0xff" 
            value={input} 
            onChange={(e)=>setInput(e.target.value)} 
          />
          <select 
            className="rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            value={inputBase} 
            onChange={(e)=>setInputBase(Number(e.target.value) as 2|8|10|16)}
          >
            <option value={2}>二进制</option>
            <option value={8}>八进制</option>
            <option value={10}>十进制</option>
            <option value={16}>十六进制</option>
          </select>
        </div>
        {numberResult ? (
          'error' in numberResult ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-600 dark:text-red-400 font-medium">{numberResult.error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">二进制</div>
                <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{numberResult.bin}</code>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">八进制</div>
                <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{numberResult.oct}</code>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">十进制</div>
                <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{numberResult.dec}</code>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">十六进制</div>
                <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{numberResult.hex}</code>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🔢</div>
            <p>请输入有效数字（支持 0x/0o/0b 前缀与负数）</p>
          </div>
        )}
      </Card>

      <Card className="p-6" title="字符串/Hex 与字节视图" icon={<span>📝</span>} accent="green">
        <div className="flex items-center gap-3 mb-4">
          <input 
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
            placeholder={mode==='ascii'? '输入字符串' : '输入十六进制，如 0x48656c6c6f'} 
            value={textInput} 
            onChange={(e)=>setTextInput(e.target.value)} 
          />
          <select 
            className="rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            value={mode} 
            onChange={(e)=>setMode(e.target.value as 'ascii'|'hex')}
          >
            <option value="ascii">ASCII</option>
            <option value="hex">Hex</option>
          </select>
        </div>
        {bytesResult ? (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">字节长度</div>
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-200">{bytesResult.len} 字节</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">十六进制</div>
              <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{bytesResult.hex}</code>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ASCII 字符</div>
              <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{bytesResult.ascii}</code>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p>请输入字符串或十六进制以查看字节视图</p>
          </div>
        )}
      </Card>
    </div>
  )
}