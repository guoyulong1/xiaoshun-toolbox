import { useState, useEffect, useRef } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// 地图数据类型
type MapCell = 0 | 1 | 2 | 3 | 4 // 0:空地 1:墙壁 2:门 3:家具 4:地毯
type MapData = MapCell[][]





// 解析上传的地图文件
const parseMapFile = (content: string): { data: MapData; width: number; height: number } | null => {
  try {
    const lines = content.trim().split('\n')
    if (lines.length === 0) return null
    
    // 支持两种格式：
    // 1. JSON格式：{"width": 400, "height": 400, "data": [[0,1,0...], ...]}
    // 2. 简单格式：每行为数字，用空格或逗号分隔
    
    if (content.trim().startsWith('{')) {
      // JSON格式
      const parsed = JSON.parse(content)
      if (parsed.data && parsed.width && parsed.height) {
        return {
          data: parsed.data,
          width: parsed.width,
          height: parsed.height
        }
      }
    } else {
      // 简单格式
      const data: MapData = []
      for (const line of lines) {
        if (line.trim()) {
          const row = line.split(/[,\s]+/).map(n => {
            const num = parseInt(n.trim())
            return isNaN(num) ? 0 : Math.max(0, Math.min(4, num)) as MapCell
          })
          if (row.length > 0) {
            data.push(row)
          }
        }
      }
      
      if (data.length > 0) {
        const height = data.length
        const width = Math.max(...data.map(row => row.length))
        
        // 标准化所有行的长度
        data.forEach(row => {
          while (row.length < width) {
            row.push(0)
          }
        })
        
        return { data, width, height }
      }
    }
  } catch (error) {
    console.error('解析地图文件失败:', error)
  }
  return null
}

export default function MapTool() {
  const [uploadedMap, setUploadedMap] = useState<{ data: MapData; width: number; height: number } | null>(null)
  const [showUploaded, setShowUploaded] = useState(false)
  const [mapText, setMapText] = useState('')
  const [parseError, setParseError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Base64 图片显示相关状态
  const [base64Text, setBase64Text] = useState('')
  const [imageType, setImageType] = useState<'png' | 'jpeg' | 'gif'>('png')
  const [dataUrl, setDataUrl] = useState('')
  const [imageError, setImageError] = useState('')
  const [imgSize, setImgSize] = useState<{ width: number; height: number } | null>(null)

  // 协议 JSON（gzip+base64 的 baseData）解析与绘制
  const [protocolText, setProtocolText] = useState('')
  const [protocolError, setProtocolError] = useState('')
  const [grid, setGrid] = useState<number[][]>([])
  const [meta, setMeta] = useState<{
    width: number
    height: number
    origin: { x: number; y: number }
    resolution: number
    charge: { x: number; y: number; yaw?: number }
  } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Base64 → Uint8Array
  const base64ToBytes = (b64: string): Uint8Array => {
    const clean = b64.replace(/\s+/g, '')
    const bin = atob(clean)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }

  // 使用浏览器原生 DecompressionStream 进行 gzip 解压
  const ungzip = async (bytes: Uint8Array): Promise<Uint8Array> => {
    if ((window as any).DecompressionStream) {
      const ds = new (window as any).DecompressionStream('gzip')
      const stream = new Response(new Blob([bytes]).stream().pipeThrough(ds))
      const ab = await stream.arrayBuffer()
      return new Uint8Array(ab)
    }
    throw new Error('当前浏览器不支持 gzip 解压 (DecompressionStream)。请使用新版 Chrome/Edge 或提供解压后的数据。')
  }

  // 解析 grid 文本为二维数组（支持逗号/空格分隔）
  const parseGridText = (text: string): number[][] => {
    const lines = text.trim().split(/\r?\n+/)
    const data: number[][] = []
    for (const line of lines) {
      if (!line.trim()) continue
      const row = line.split(/[\s,]+/).map(t => {
        const n = parseInt(t, 10)
        return isNaN(n) ? 0 : n
      })
      if (row.length) data.push(row)
    }
    return data
  }

  // 处理协议 JSON 文本
  const handleProtocolParse = async () => {
    setProtocolError('')
    try {
      const obj = JSON.parse(protocolText)
      const { baseData, width, height, origin, resolution, charge } = obj
      if (!baseData || !width || !height) {
        throw new Error('缺少必要字段：baseData/width/height')
      }
      const bytes = base64ToBytes(baseData)
      const decompressed = await ungzip(bytes)

      // 优先尝试文本解析（JSON 数组或纯文本行）
      const text = new TextDecoder('utf-8').decode(decompressed)
      let gridParsed: number[][] | null = null
      const looksJsonArray = text.trim().startsWith('[')
      const looksTextNumbers = /[0-9]/.test(text) && /[\s,\n]/.test(text)
      try {
        if (looksJsonArray) {
          const j = JSON.parse(text)
          gridParsed = j as number[][]
        } else if (looksTextNumbers) {
          gridParsed = parseGridText(text)
        }
      } catch {
        // 文本解析失败则走二进制解析
        gridParsed = null
      }

      // 如果文本解析失败或得到空数据，尝试二进制解析
      if (!gridParsed || !Array.isArray(gridParsed) || gridParsed.length === 0) {
        const total = width * height
        const len = decompressed.length

        const parseBinaryGrid = (buf: Uint8Array, w: number, h: number): number[][] => {
          const out: number[][] = []
          for (let r = 0; r < h; r++) {
            const row: number[] = []
            for (let c = 0; c < w; c++) {
              const idx = r * w + c
              const v = buf[idx] ?? 0
              // 0=空白，1=墙，2=不可到达，>=3 为房间编号，保留
              row.push(v === 0 || v === 1 || v === 2 || v >= 3 ? v : 0)
            }
            out.push(row)
          }
          return out
        }

        const parseNibbleGrid = (buf: Uint8Array, w: number, h: number): number[][] => {
          const out: number[][] = []
          let i = 0
          for (let r = 0; r < h; r++) {
            const row: number[] = []
            for (let c = 0; c < w; c++) {
              // 每字节两个 4bit 值：高半字节在前，低半字节在后
              const byteIndex = Math.floor((r * w + c) / 2)
              const isHigh = ((r * w + c) % 2) === 0
              const b = buf[byteIndex] ?? 0
              const nib = isHigh ? ((b >> 4) & 0xF) : (b & 0xF)
              // 0=空白，1=墙，2=不可到达，>=3 为房间编号，保留
              row.push(nib === 0 || nib === 1 || nib === 2 || nib >= 3 ? nib : 0)
              i++
            }
            out.push(row)
          }
          return out
        }

        if (len === total) {
          gridParsed = parseBinaryGrid(decompressed, width, height)
        } else if (len === Math.floor(total / 2)) {
          gridParsed = parseNibbleGrid(decompressed, width, height)
        } else {
          throw new Error(`解压后字节长度(${len})与期望(${total})不匹配，无法解析为 ${width}×${height} 网格。`)
        }
      }

      if (!Array.isArray(gridParsed) || gridParsed.length === 0) {
        throw new Error('解压后地图数据为空或格式不正确')
      }
      // 标准化行宽
      const w = Math.max(...gridParsed.map(r => r.length))
      gridParsed = gridParsed.map(r => (r.length === w ? r : [...r, ...Array(w - r.length).fill(0)]))
      setGrid(gridParsed)
      setMeta({
        width: width,
        height: height,
        origin: origin || { x: Math.floor(w / 2), y: Math.floor(gridParsed.length / 2) },
        resolution: resolution || 1,
        charge: charge || { x: 0, y: 0, yaw: 0 }
      })
    } catch (e: any) {
      console.error(e)
      setProtocolError(e?.message || '协议解析失败，请检查 JSON 与 baseData 内容')
    }
  }

  // 绘制到 Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !grid.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gh = grid.length
    const gw = Math.max(...grid.map(r => r.length))
    const targetWidth = 820 // 目标容器宽度
    const cell = Math.max(2, Math.floor(targetWidth / gw))
    canvas.width = gw * cell
    canvas.height = gh * cell

    // 背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 区域配色：1=墙(深灰)、2=不可到达(灰)、>=3=房间（柔和色）、0=空白(白)
    const colorFor = (v: number) => {
      if (v === 1) return '#1f2937' // gray-800（墙）
      if (v === 2) return '#9ca3af' // gray-400（不可到达）
      if (v === 0 || v == null) return '#ffffff' // 空白
      if (v >= 3) {
        // 为房间生成柔和色：用黄金角分布产生均匀的色相，降低饱和度、提高亮度
        const hue = (v * 137.508) % 360
        const sat = 62
        const light = 82
        return `hsl(${hue}deg ${sat}% ${light}%)`
      }
      return '#ffffff'
    }

    for (let y = 0; y < gh; y++) {
      const row = grid[y]
      for (let x = 0; x < gw; x++) {
        const v = row[x] ?? 0
        ctx.fillStyle = colorFor(v)
        ctx.fillRect(x * cell, y * cell, cell, cell)
      }
    }

    // 标记 origin（十字）
    if (meta?.origin) {
      const { x: ox, y: oy } = meta.origin
      if (ox >= 0 && oy >= 0 && ox < gw && oy < gh) {
        ctx.strokeStyle = '#2563eb' // blue-600
        ctx.lineWidth = Math.max(1, Math.floor(cell / 5))
        // 横线
        ctx.beginPath()
        ctx.moveTo(ox * cell, oy * cell + cell / 2)
        ctx.lineTo(ox * cell + cell, oy * cell + cell / 2)
        ctx.stroke()
        // 竖线
        ctx.beginPath()
        ctx.moveTo(ox * cell + cell / 2, oy * cell)
        ctx.lineTo(ox * cell + cell / 2, oy * cell + cell)
        ctx.stroke()
      }
    }

    // 标记充电座基站并标明方向（坐标默认按“相对 origin 的格子偏移”解释）
    if (meta?.charge) {
      const yawRad = (meta.charge.yaw ?? 0) * (Math.PI / 180)
      const cx = Math.round((meta.origin?.x ?? 0) + meta.charge.x)
      const cy = Math.round((meta.origin?.y ?? 0) + meta.charge.y)
      if (cx >= 0 && cy >= 0 && cx < gw && cy < gh) {
        const px = cx * cell + cell / 2
        const py = cy * cell + cell / 2

        // 绘制基站底座（圆形底，内置“充”字）
        ctx.save()
        ctx.translate(px, py)
        ctx.fillStyle = '#0ea5e9' // sky-500
        ctx.strokeStyle = '#0284c7' // sky-600
        ctx.lineWidth = Math.max(1, Math.floor(cell / 6))
        const baseR = Math.max(5, Math.floor(cell * 0.45))
        ctx.beginPath()
        ctx.arc(0, 0, baseR, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // 中心标识文字（可根据需要替换为图形）
        ctx.fillStyle = '#ffffff'
        const fontSize = Math.max(10, Math.floor(cell * 0.5))
        ctx.font = `${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('充', 0, 0)

        // 绘制方向箭头（以 x 正方向为基准，旋转 yaw）
        ctx.rotate(yawRad)
        const arrowLen = Math.max(cell, Math.floor(cell * 1.6))
        ctx.strokeStyle = '#ef4444' // red-500
        ctx.fillStyle = '#ef4444'
        ctx.lineWidth = Math.max(1, Math.floor(cell / 5))
        // 箭杆
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(arrowLen, 0)
        ctx.stroke()
        // 箭头
        const headL = Math.max(6, Math.floor(cell * 0.4))
        const headW = Math.max(4, Math.floor(cell * 0.25))
        ctx.beginPath()
        ctx.moveTo(arrowLen, 0)
        ctx.lineTo(arrowLen - headL, headW)
        ctx.lineTo(arrowLen - headL, -headW)
        ctx.closePath()
        ctx.fill()

        ctx.restore()

        // 标签文字：充电座
        ctx.fillStyle = '#334155' // slate-700
        const labelFontSize = Math.max(10, Math.floor(cell * 0.5))
        ctx.font = `${labelFontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('充电座', px, py + baseR + Math.max(6, Math.floor(cell * 0.15)))
      }
    }
  }, [grid, meta])

  const currentMapData = showUploaded && uploadedMap ? uploadedMap.data 
    : []
  const currentSize = showUploaded && uploadedMap ? { width: uploadedMap.width, height: uploadedMap.height }
    : { width: 0, height: 0 }

  // 解析粘贴的地图文本
  const handleMapTextParse = () => {
    if (!mapText.trim()) {
      setParseError('请输入地图数据')
      return
    }

    setIsLoading(true)
    const parsed = parseMapFile(mapText)
    if (parsed) {
      setUploadedMap(parsed)
      setShowUploaded(true)
      setParseError('')
    } else {
      setParseError('地图数据格式不正确，请检查格式')
    }
    setIsLoading(false)
  }

  // 清空地图文本
  const clearMapText = () => {
    setMapText('')
    setParseError('')
    setShowUploaded(false)
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        icon={<span>🏠</span>} 
        title="地图显示工具" 
        subtitle="地图可视化工具：支持粘贴协议 JSON（gzip+Base64）与 Base64 图片预览" 
        accent="indigo" 
      />



      {/* 地图 Base64 输入区域 */}
      <Card className="p-4" accent="indigo">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">粘贴地图 Base64</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              地图图片 Base64 字符串（支持 data:image/*;base64, 前缀 或 纯 Base64）
            </label>
            <textarea
              className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical font-mono text-sm"
              placeholder="粘贴 Base64 图片字符串，例如: data:image/png;base64,iVBORw0K... 或 直接 iVBORw0K..."
              value={base64Text}
              onChange={(e) => setBase64Text(e.target.value)}
            />
          </div>

          {!base64Text.trim().startsWith('data:image') && (
            <div className="flex items-center gap-2">
              <label className="text-sm">图片格式:</label>
              <select 
                className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                value={imageType}
                onChange={e => setImageType(e.target.value as any)}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="gif">GIF</option>
              </select>
              <span className="text-xs text-gray-500">自动识别常见类型，也可手动指定</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => {
                setImageError('')
                setImgSize(null)
                const text = base64Text.trim()
                if (!text) {
                  setImageError('请输入 Base64 字符串')
                  setDataUrl('')
                  return
                }
                if (text.startsWith('data:image')) {
                  setDataUrl(text)
                } else {
                  const s = text.substring(0, 10)
                  const autoType = s.includes('iVBOR') ? 'png' : s.includes('/9j/') ? 'jpeg' : s.includes('R0lGOD') ? 'gif' : imageType
                  setImageType(autoType as any)
                  setDataUrl(`data:image/${autoType};base64,${text}`)
                }
              }}
              disabled={!base64Text.trim()}
            >
              🗺️ 显示图片
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setBase64Text(''); setDataUrl(''); setImageError(''); setImgSize(null); }}
            >
              🗑️ 清空
            </Button>
          </div>

          {imageError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">错误: {imageError}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 已移除图例说明与数据格式说明 */}

      {/* 协议 JSON 输入区域 */}
      <Card className="p-4" accent="indigo">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">粘贴协议 JSON（gzip+Base64）</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              协议示例字段：baseData（gzip+Base64）、width、height、origin、resolution、charge
            </label>
            <textarea
              className="w-full h-40 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical font-mono text-sm"
              placeholder="粘贴完整 JSON（包含 baseData/width/height/origin/resolution/charge 等字段）"
              value={protocolText}
              onChange={(e) => setProtocolText(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleProtocolParse}
              disabled={!protocolText.trim()}
            >
              🧭 解析并绘制
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setProtocolText(''); setProtocolError(''); setGrid([]); setMeta(null); }}
            >
              🗑️ 清空
            </Button>
          </div>

          {protocolError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">错误: {protocolError}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 协议地图预览（Canvas） */}
      <Card className="p-6" accent="indigo">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">协议地图预览（Canvas）</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {meta ? (
              <>尺寸: {meta.width} × {meta.height} · 原点: ({meta.origin?.x},{meta.origin?.y}) · 分辨率: {meta.resolution} · 充电座: ({meta.charge?.x},{meta.charge?.y}) yaw={meta.charge?.yaw ?? 0}°</>
            ) : (
              <>未解析</>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 min-h-[240px] overflow-auto">
          {grid.length ? (
            <canvas ref={canvasRef} className="max-w-full" />
          ) : (
            <div className="text-sm text-gray-500">请在上方粘贴协议 JSON 并点击“解析并绘制”</div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          {grid.length ? (
            <Button size="sm" variant="primary" onClick={() => {
              if (!canvasRef.current) return
              const url = canvasRef.current.toDataURL('image/png')
              const a = document.createElement('a')
              a.href = url
              a.download = 'protocol-map.png'
              a.click()
            }}>下载预览 PNG</Button>
          ) : null}
          {grid.length ? (
            <span className="text-xs text-gray-500">说明：充电座坐标按“相对 origin 的格子偏移”解释。如 x/y 为真实单位，可按 x/分辨率, y/分辨率 转换为格子偏移。</span>
          ) : null}
        </div>
      </Card>

      {/* 图片预览 */}
      <Card className="p-6" accent="indigo">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">地图图片预览</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {imgSize ? (
              <>尺寸: {imgSize.width} × {imgSize.height}</>
            ) : (
              <>未加载</>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 min-h-[240px] flex items-center justify-center overflow-auto">
          {dataUrl ? (
            <img 
              src={dataUrl} 
              alt="地图图片"
              className="max-w-full h-auto"
              onLoad={(e) => {
                const el = e.currentTarget
                setImgSize({ width: el.naturalWidth, height: el.naturalHeight })
                setImageError('')
              }}
              onError={() => {
                setImageError('图片加载失败，请确认 Base64 是否有效以及图片格式是否正确')
              }}
            />
          ) : (
            <div className="text-sm text-gray-500">请在上方粘贴 Base64 并点击“显示图片”</div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          {dataUrl && (
            <Button size="sm" variant="primary" onClick={() => {
              const a = document.createElement('a')
              a.href = dataUrl
              const ext = imageType === 'jpeg' ? 'jpg' : imageType
              a.download = `map.${ext}`
              a.click()
            }}>下载图片</Button>
          )}
          {dataUrl && (
            <Button size="sm" variant="ghost" onClick={async () => {
              try {
                await navigator.clipboard.writeText(dataUrl)
              } catch (e) {
                setImageError('复制失败，请手动复制或在安全上下文下重试')
              }
            }}>复制图片链接</Button>
          )}
        </div>
      </Card>
    </div>
  )
}