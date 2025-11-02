import { useState, useRef, useMemo } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// 地图数据类型
type MapCell = 0 | 1 | 2 | 3 | 4 // 0:空地 1:墙壁 2:门 3:家具 4:地毯
type MapData = MapCell[][]

// 创建真实户型图的函数
function createRealisticFloorPlan(width: number, height: number): MapData {
  const map: MapData = Array(height).fill(null).map(() => Array(width).fill(0))
  
  // 外墙 (厚度约10cm，对应10个栅格)
  const wallThickness = Math.max(8, Math.floor(width * 0.02))
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < wallThickness || x >= width - wallThickness || 
          y < wallThickness || y >= height - wallThickness) {
        map[y][x] = 1
      }
    }
  }
  
  // 根据尺寸设计不同的户型
  if (width >= 800) {
    // 大户型：三室两厅
    createLargeApartment(map, width, height, wallThickness)
  } else if (width >= 600) {
    // 中户型：两室一厅
    createMediumApartment(map, width, height, wallThickness)
  } else {
    // 小户型：一室一厅
    createSmallApartment(map, width, height, wallThickness)
  }
  
  return map
}

// 大户型设计
function createLargeApartment(map: MapData, width: number, height: number, wallThickness: number) {
  const innerWidth = width - 2 * wallThickness
  const innerHeight = height - 2 * wallThickness
  
  // 主卧室 (右上角，约3m x 4m = 300x400栅格)
  const masterBedroomW = Math.floor(innerWidth * 0.35)
  const masterBedroomH = Math.floor(innerHeight * 0.4)
  createRoom(map, width - wallThickness - masterBedroomW, wallThickness, masterBedroomW, masterBedroomH)
  
  // 次卧室 (右下角，约3m x 3m = 300x300栅格)
  const secondBedroomSize = Math.floor(innerWidth * 0.3)
  createRoom(map, width - wallThickness - secondBedroomSize, height - wallThickness - secondBedroomSize, secondBedroomSize, secondBedroomSize)
  
  // 客厅 (左侧中央，约4m x 5m = 400x500栅格)
  const livingRoomW = Math.floor(innerWidth * 0.4)
  const livingRoomH = Math.floor(innerHeight * 0.5)
  const livingRoomX = wallThickness + Math.floor(innerWidth * 0.1)
  const livingRoomY = wallThickness + Math.floor(innerHeight * 0.25)
  
  // 厨房 (左上角，约2.5m x 3m = 250x300栅格)
  const kitchenW = Math.floor(innerWidth * 0.25)
  const kitchenH = Math.floor(innerHeight * 0.3)
  createRoom(map, wallThickness, wallThickness, kitchenW, kitchenH)
  
  // 卫生间 (左下角，约2m x 2.5m = 200x250栅格)
  const bathroomW = Math.floor(innerWidth * 0.2)
  const bathroomH = Math.floor(innerHeight * 0.25)
  createRoom(map, wallThickness, height - wallThickness - bathroomH, bathroomW, bathroomH)
  
  // 添加门
  addDoor(map, wallThickness + kitchenW, Math.floor(wallThickness + kitchenH / 2)) // 厨房门
  addDoor(map, width - wallThickness - masterBedroomW, Math.floor(wallThickness + masterBedroomH / 2)) // 主卧门
  addDoor(map, Math.floor(width - wallThickness - secondBedroomSize / 2), height - wallThickness - secondBedroomSize) // 次卧门
  addDoor(map, Math.floor(wallThickness + bathroomW / 2), height - wallThickness - bathroomH) // 卫生间门
  
  // 添加家具区域
  addFurnitureArea(map, livingRoomX, livingRoomY, livingRoomW, livingRoomH, 3) // 客厅家具
  addFurnitureArea(map, wallThickness + 20, wallThickness + 20, kitchenW - 40, kitchenH - 40, 3) // 厨房设备
  
  // 添加地毯区域
  addCarpetArea(map, livingRoomX + 50, livingRoomY + 50, livingRoomW - 100, livingRoomH - 100) // 客厅地毯
  addCarpetArea(map, width - wallThickness - masterBedroomW + 30, wallThickness + 30, masterBedroomW - 60, masterBedroomH - 60) // 主卧地毯
}

// 中户型设计
function createMediumApartment(map: MapData, width: number, height: number, wallThickness: number) {
  const innerWidth = width - 2 * wallThickness
  const innerHeight = height - 2 * wallThickness
  
  // 卧室 (右侧，约3m x 3.5m)
  const bedroomW = Math.floor(innerWidth * 0.4)
  const bedroomH = Math.floor(innerHeight * 0.6)
  createRoom(map, width - wallThickness - bedroomW, wallThickness, bedroomW, bedroomH)
  
  // 客厅 (左上，约3.5m x 4m)
  const livingRoomW = Math.floor(innerWidth * 0.5)
  const livingRoomH = Math.floor(innerHeight * 0.6)
  
  // 厨房 (左下，约2.5m x 2m)
  const kitchenW = Math.floor(innerWidth * 0.35)
  const kitchenH = Math.floor(innerHeight * 0.3)
  createRoom(map, wallThickness, height - wallThickness - kitchenH, kitchenW, kitchenH)
  
  // 卫生间 (右下角)
  const bathroomSize = Math.floor(innerWidth * 0.25)
  createRoom(map, width - wallThickness - bathroomSize, height - wallThickness - bathroomSize, bathroomSize, bathroomSize)
  
  // 添加门和家具
  addDoor(map, width - wallThickness - bedroomW, Math.floor(wallThickness + bedroomH / 2))
  addDoor(map, Math.floor(wallThickness + kitchenW / 2), height - wallThickness - kitchenH)
  addDoor(map, Math.floor(width - wallThickness - bathroomSize / 2), height - wallThickness - bathroomSize)
  
  // 家具和地毯
  addFurnitureArea(map, wallThickness + 30, wallThickness + 30, livingRoomW - 60, livingRoomH - 60, 3)
  addCarpetArea(map, wallThickness + 50, wallThickness + 50, livingRoomW - 100, livingRoomH - 100)
  addCarpetArea(map, width - wallThickness - bedroomW + 30, wallThickness + 30, bedroomW - 60, bedroomH - 60)
}

// 小户型设计
function createSmallApartment(map: MapData, width: number, height: number, wallThickness: number) {
  const innerWidth = width - 2 * wallThickness
  const innerHeight = height - 2 * wallThickness
  
  // 卧室区域 (右侧)
  const bedroomW = Math.floor(innerWidth * 0.45)
  const bedroomH = Math.floor(innerHeight * 0.7)
  createRoom(map, width - wallThickness - bedroomW, wallThickness, bedroomW, bedroomH)
  
  // 厨房 (左下)
  const kitchenW = Math.floor(innerWidth * 0.4)
  const kitchenH = Math.floor(innerHeight * 0.35)
  createRoom(map, wallThickness, height - wallThickness - kitchenH, kitchenW, kitchenH)
  
  // 卫生间 (右下)
  const bathroomW = Math.floor(innerWidth * 0.3)
  const bathroomH = Math.floor(innerHeight * 0.25)
  createRoom(map, width - wallThickness - bathroomW, height - wallThickness - bathroomH, bathroomW, bathroomH)
  
  // 添加门
  addDoor(map, width - wallThickness - bedroomW, Math.floor(wallThickness + bedroomH / 2))
  addDoor(map, Math.floor(wallThickness + kitchenW / 2), height - wallThickness - kitchenH)
  addDoor(map, Math.floor(width - wallThickness - bathroomW / 2), height - wallThickness - bathroomH)
  
  // 客厅家具和地毯
  const livingAreaX = wallThickness + 20
  const livingAreaY = wallThickness + 20
  const livingAreaW = Math.floor(innerWidth * 0.4)
  const livingAreaH = Math.floor(innerHeight * 0.5)
  
  addFurnitureArea(map, livingAreaX, livingAreaY, livingAreaW, livingAreaH, 3)
  addCarpetArea(map, livingAreaX + 20, livingAreaY + 20, livingAreaW - 40, livingAreaH - 40)
}

// 辅助函数：创建房间
function createRoom(map: MapData, x: number, y: number, w: number, h: number) {
  const wallThickness = 3
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (y + dy < map.length && x + dx < map[0].length) {
        if (dx < wallThickness || dx >= w - wallThickness || 
            dy < wallThickness || dy >= h - wallThickness) {
          map[y + dy][x + dx] = 1 // 内墙
        }
      }
    }
  }
}

// 辅助函数：添加门
function addDoor(map: MapData, x: number, y: number) {
  const doorWidth = 8 // 约80cm门宽
  // 确保门是水平放置的
  for (let i = 0; i < doorWidth; i++) {
    const doorX = Math.floor(x) + i
    const doorY = Math.floor(y)
    if (doorY >= 0 && doorY < map.length && doorX >= 0 && doorX < map[0].length) {
      map[doorY][doorX] = 2
    }
  }
}

// 辅助函数：添加家具区域
function addFurnitureArea(map: MapData, x: number, y: number, w: number, h: number, furnitureType: number) {
  // 创建成片的家具区域，模拟沙发、床、桌子等
  const blockSize = 15 // 家具块大小约1.5m
  for (let dy = 0; dy < h; dy += blockSize + 5) {
    for (let dx = 0; dx < w; dx += blockSize + 5) {
      if (Math.random() > 0.6) { // 60%概率放置家具
        for (let by = 0; by < blockSize && dy + by < h; by++) {
          for (let bx = 0; bx < blockSize && dx + bx < w; bx++) {
            const mapY = y + dy + by
            const mapX = x + dx + bx
            if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
              if (map[mapY][mapX] === 0) {
                map[mapY][mapX] = furnitureType
              }
            }
          }
        }
      }
    }
  }
}

// 辅助函数：添加地毯区域
function addCarpetArea(map: MapData, x: number, y: number, w: number, h: number) {
  // 创建大片地毯区域
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const mapY = y + dy
      const mapX = x + dx
      if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
        if (map[mapY][mapX] === 0) {
          map[mapY][mapX] = 4 // 地毯
        }
      }
    }
  }
}

// 预设的家庭地图数据
const sampleMaps = {
  medium: {
    name: '标准户型 (4m×4m)',
    size: { width: 400, height: 400 },
    data: createRealisticFloorPlan(400, 400)
  },
  large: {
    name: '大户型 (6m×6m)',
    size: { width: 600, height: 600 },
    data: createRealisticFloorPlan(600, 600)
  },
  xlarge: {
    name: '豪华户型 (8m×8m)',
    size: { width: 800, height: 800 },
    data: createRealisticFloorPlan(800, 800)
  },
  xxlarge: {
    name: '超大户型 (10m×10m)',
    size: { width: 1000, height: 1000 },
    data: createRealisticFloorPlan(1000, 1000)
  }
}

// 地图单元格样式
const getCellStyle = (cell: MapCell) => {
  switch (cell) {
    case 0: return 'bg-gray-100 dark:bg-gray-800' // 空地
    case 1: return 'bg-gray-900 dark:bg-gray-700' // 墙壁
    case 2: return 'bg-yellow-400 dark:bg-yellow-600' // 门
    case 3: return 'bg-blue-400 dark:bg-blue-600' // 家具
    case 4: return 'bg-purple-400 dark:bg-purple-600' // 地毯
    default: return 'bg-gray-100 dark:bg-gray-800'
  }
}

// 地图单元格图标
const getCellIcon = (cell: MapCell) => {
  switch (cell) {
    case 0: return '' // 空地
    case 1: return '⬛' // 墙壁
    case 2: return '🚪' // 门
    case 3: return '🪑' // 家具
    case 4: return '🟣' // 地毯
    default: return ''
  }
}

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
  const [selectedMap, setSelectedMap] = useState<keyof typeof sampleMaps>('medium')
  const [customSize, setCustomSize] = useState({ width: 400, height: 400 })
  const [showCustom, setShowCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [performanceWarning, setPerformanceWarning] = useState('')
  const [customMap, setCustomMap] = useState<MapData>([])
  const [uploadedMap, setUploadedMap] = useState<{ data: MapData; width: number; height: number } | null>(null)
  const [showUploaded, setShowUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 加载预设地图
  const loadSampleMap = (key: keyof typeof sampleMaps) => {
    const totalCells = sampleMaps[key].size.width * sampleMaps[key].size.height
    
    // 性能警告
    if (totalCells > 640000) { // 800x800
      setPerformanceWarning('⚠️ 大尺寸地图可能影响性能，建议使用较小尺寸或等待加载完成')
    } else if (totalCells > 360000) { // 600x600
      setPerformanceWarning('💡 中等尺寸地图，加载可能需要几秒钟')
    } else {
      setPerformanceWarning('')
    }
    
    setIsLoading(true)
    
    // 使用 setTimeout 来模拟异步加载，避免阻塞UI
    setTimeout(() => {
      setSelectedMap(key)
      setShowCustom(false)
      setShowUploaded(false)
      setIsLoading(false)
    }, 100)
  }

  const currentMapData = showUploaded && uploadedMap ? uploadedMap.data 
    : showCustom ? customMap 
    : sampleMaps[selectedMap].data
  const currentSize = showUploaded && uploadedMap ? { width: uploadedMap.width, height: uploadedMap.height }
    : showCustom ? customSize 
    : sampleMaps[selectedMap].size

  const createCustomMap = () => {
    const totalCells = customSize.width * customSize.height
    
    // 性能警告
    if (totalCells > 640000) {
      setPerformanceWarning('⚠️ 大尺寸地图可能影响性能，建议使用较小尺寸')
    } else if (totalCells > 360000) {
      setPerformanceWarning('💡 中等尺寸地图，加载可能需要几秒钟')
    } else {
      setPerformanceWarning('')
    }
    
    setIsLoading(true)
    
    setTimeout(() => {
      const newMap: MapData = Array(customSize.height).fill(null).map(() => 
        Array(customSize.width).fill(0)
      )
      // 添加边界墙壁
      for (let y = 0; y < customSize.height; y++) {
        for (let x = 0; x < customSize.width; x++) {
          if (x === 0 || x === customSize.width - 1 || y === 0 || y === customSize.height - 1) {
            newMap[y][x] = 1
          }
        }
      }
      setCustomMap(newMap)
      setShowCustom(true)
      setShowUploaded(false)
      setIsLoading(false)
    }, 50)
  }

  const toggleCell = (x: number, y: number) => {
    if (!showCustom) return
    setCustomMap(prev => {
      const newMap = prev.map(row => [...row])
      newMap[y][x] = (newMap[y][x] + 1) % 5
      return newMap
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const parsed = parseMapFile(content)
      if (parsed) {
        setUploadedMap(parsed)
        setShowUploaded(true)
        setShowCustom(false)
      } else {
        alert('地图文件格式不正确，请检查文件内容')
      }
    }
    reader.readAsText(file)
  }

  const downloadSample = () => {
    const sampleData = {
      width: 10,
      height: 8,
      data: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,2,0,0,0,0,1],
        [1,0,3,0,0,0,3,4,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,2,1,0,1],
        [1,0,3,0,1,4,4,1,0,1],
        [1,0,0,0,1,0,0,1,0,1],
        [1,1,1,1,1,1,1,1,1,1]
      ]
    }
    
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-map.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 根据地图尺寸动态调整单元格大小，大地图使用更大的单元格以提升性能
  const cellSize = useMemo(() => {
    const totalCells = currentSize.width * currentSize.height
    if (totalCells > 160000) return 1 // 400x400以上
    if (totalCells > 40000) return 2   // 200x200以上
    if (currentSize.width > 600) return 3
    if (currentSize.width > 400) return 4
    return 6
  }, [currentSize.width, currentSize.height])

  return (
    <div className="space-y-8">
      <PageHeader 
        icon={<span>🏠</span>} 
        title="地图显示工具" 
        subtitle="大尺寸地图可视化展示，支持文件上传和自定义编辑" 
        accent="indigo" 
      />

      {/* 控制面板 */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">预设地图：</label>
            <select 
              className="rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 text-sm"
              value={selectedMap || ''}
              onChange={(e) => loadSampleMap(e.target.value as keyof typeof sampleMaps)}
              disabled={isLoading}
            >
              <option value="">选择预设地图</option>
              <option value="medium">标准户型 (4m×4m)</option>
              <option value="large">大户型 (6m×6m)</option>
              <option value="xlarge">豪华户型 (8m×8m)</option>
              <option value="xxlarge">超大户型 (10m×10m)</option>
            </select>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              📁 上传地图
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadSample} disabled={isLoading}>
              📥 下载样例
            </Button>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">宽度：</label>
            <input 
              type="number" 
              min="400" 
              max="1000"
              step="50"
              className="rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-2 py-1 w-24 text-sm"
              value={customSize.width}
              onChange={(e) => setCustomSize(prev => ({ ...prev, width: Number(e.target.value) }))}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">高度：</label>
            <input 
              type="number" 
              min="400" 
              max="1000"
              step="50"
              className="rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-2 py-1 w-24 text-sm"
              value={customSize.height}
              onChange={(e) => setCustomSize(prev => ({ ...prev, height: Number(e.target.value) }))}
              disabled={isLoading}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={createCustomMap} disabled={isLoading}>
            创建自定义地图
          </Button>
        </div>

        {/* 性能警告 */}
        {performanceWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{performanceWarning}</p>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-sm text-blue-800 dark:text-blue-200">正在加载地图...</p>
            </div>
          </div>
        )}
      </div>

      {/* 图例 */}
      <Card className="p-4" accent="indigo">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">图例说明</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"></div>
            <span>空地</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 dark:bg-gray-700 rounded"></div>
            <span>墙壁 ⬛</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-600 rounded"></div>
            <span>门 🚪</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 dark:bg-blue-600 rounded"></div>
            <span>家具 🪑</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-400 dark:bg-purple-600 rounded"></div>
            <span>地毯 🟣</span>
          </div>
        </div>
        
        {/* 文件格式说明 */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium mb-2">支持的文件格式：</h4>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <div><strong>JSON格式：</strong> {"{"}"width": 400, "height": 400, "data": [[0,1,0...], ...]{"}"}</div>
            <div><strong>简单格式：</strong> 每行数字用空格或逗号分隔，0=空地 1=墙壁 2=门 3=家具 4=地毯</div>
          </div>
        </div>
      </Card>

      {/* 地图显示 - 暂时隐藏以优化性能 */}
      <Card className="p-6" accent="indigo">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            地图预览
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            尺寸: {currentSize.width} × {currentSize.height}
          </div>
        </div>
        
        {/* 性能优化提示 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-xl">🚀</div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                性能优化中
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                为了提升应用性能，地图可视化功能正在优化中。您仍可以：
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• 上传和下载地图文件</li>
                <li>• 创建自定义尺寸的地图</li>
                <li>• 查看地图统计信息</li>
              </ul>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                💡 未来版本将支持PNG格式预览，敬请期待！
              </p>
            </div>
          </div>
        </div>

        {/* 地图统计信息 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">地图统计</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentSize.width * currentSize.height}
              </div>
              <div className="text-gray-600 dark:text-gray-300">总单元格</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {currentMapData.flat().filter(c => c === 1).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">墙壁 ⬛</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentMapData.flat().filter(c => c === 2).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">门 🚪</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentMapData.flat().filter(c => c === 3).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">家具 🪑</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currentMapData.flat().filter(c => c === 4).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">地毯 🟣</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                {currentMapData.flat().filter(c => c === 0).length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">空地 ⬜</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}