import { useMemo, useState } from 'react'
import { crc16, crc32, hexToBytesSafe } from '../utils/crc'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function RoboticsTool(){
  const [hex, setHex] = useState('')
  const bytes = useMemo(()=> hexToBytesSafe(hex), [hex])
  const [ascii, setAscii] = useState('')

  const crcRes = useMemo(()=>{
    if (bytes === null) return null
    const c16 = crc16(bytes)
    const c32 = crc32(bytes)
    return { c16: '0x' + c16.toString(16).padStart(4,'0'), c32: '0x' + c32.toString(16).padStart(8,'0') }
  }, [bytes])

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t) } catch {} }

  return (
    <div className="space-y-8">
      <PageHeader icon={<span>🤖</span>} title="机器人调试工具" subtitle="CRC 校验与十六进制数据查看" accent="red" />

      <Card className="p-6" title="CRC16 / CRC32 计算器" accent="red">
        <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent" rows={4} placeholder="输入十六进制（如 0x01020304 或 01 02 03 04）" value={hex} onChange={(e)=>setHex(e.target.value)} />
        {bytes === null ? (
          <p className="text-sm text-red-600 mt-2">十六进制格式错误</p>
        ) : (
          <div className="text-sm mt-3 space-y-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">字节长度</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{bytes.length}</div>
            </div>
            {crcRes && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CRC16-IBM</div>
                  <code className="block bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border break-all">{crcRes.c16}</code>
                  <div className="mt-2"><Button variant="danger" size="sm" onClick={()=>copy(crcRes.c16)}>复制</Button></div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CRC32-IEEE</div>
                  <code className="block bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border break-all">{crcRes.c32}</code>
                  <div className="mt-2"><Button variant="danger" size="sm" onClick={()=>copy(crcRes.c32)}>复制</Button></div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6" title="Hex 查看器" accent="red">
        <textarea className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent" rows={4} placeholder="输入 ASCII 文本" value={ascii} onChange={(e)=>setAscii(e.target.value)} />
        <Viewer text={ascii} />
      </Card>
    </div>
  )
}

function Viewer({ text }: { text: string }){
  const bytes = new TextEncoder().encode(text)
  const hex = Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join(' ')
  const dec = Array.from(bytes).map(b=>b.toString(10)).join(' ')
  const ascii = text
  return (
    <div className="mt-2 text-sm space-y-2">
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">长度</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{bytes.length} 字节</div>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hex</div>
        <code className="bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border break-all block">{hex}</code>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dec</div>
        <code className="bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border break-all block">{dec}</code>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ASCII</div>
        <code className="bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border break-all block">{ascii}</code>
      </div>
    </div>
  )
}