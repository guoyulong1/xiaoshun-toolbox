import { useMemo, useState, useRef } from 'react'
import { astar, bfs, createGrid, dijkstra, rrt, rrtStar, jps, type GridType, type Point } from '../utils/pathfinding'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

type Mode = 'wall' | 'start' | 'goal'

export default function PathPlanningTool(){
  const [rows, setRows] = useState(20)
  const [cols, setCols] = useState(20)
  const [grid, setGrid] = useState<GridType>(()=>createGrid(20,20))
  const [mode, setMode] = useState<Mode>('wall')
  const [start, setStart] = useState<Point>({x:0,y:0})
  const [goal, setGoal] = useState<Point>({x:19,y:19})
  const [algo, setAlgo] = useState<'BFS'|'Dijkstra'|'A*'|'RRT'|'RRT*'|'JPS'>('A*')
  const [allowDiagonal, setAllowDiagonal] = useState(true) // 是否允许斜线移动
  const [isRunning, setIsRunning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [animationSteps, setAnimationSteps] = useState<{visited: Set<string>, path: Point[]}>({visited: new Set(), path: []})
  const [isAnimating, setIsAnimating] = useState(false)
  const isDragging = useRef(false)
  const dragMode = useRef<'add' | 'remove'>('add')

  const reset = () => {
    setGrid(createGrid(rows, cols))
    setStart({x:0,y:0})
    setGoal({x:cols-1,y:rows-1})
    setShowResult(false)
    setIsRunning(false)
    setIsAnimating(false)
    setAnimationSteps({visited: new Set(), path: []})
  }

  const resize = () => {
    setGrid(createGrid(rows, cols))
    setStart({x:0,y:0})
    setGoal({x:cols-1,y:rows-1})
    setShowResult(false)
    setIsRunning(false)
    setIsAnimating(false)
    setAnimationSteps({visited: new Set(), path: []})
  }

  const startPathfinding = async () => {
    setIsRunning(true)
    setShowResult(false)
    setIsAnimating(true)
    setAnimationSteps({visited: new Set(), path: []})
    
    // 立即计算完整结果
    const fullResult = (() => {
      switch(algo){
        case 'BFS': return bfs(grid, start, goal, allowDiagonal)
        case 'Dijkstra': return dijkstra(grid, start, goal, allowDiagonal)
        case 'A*': return astar(grid, start, goal, allowDiagonal)
        case 'RRT': return rrt(grid, start, goal)
        case 'RRT*': return rrtStar(grid, start, goal)
        case 'JPS': return jps(grid, start, goal)
      }
    })()
    
    // 动画显示访问过程
    const visitedArray = Array.from(fullResult.visited)
    for (let i = 0; i < visitedArray.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 25)) // 每25ms显示一个节点
      setAnimationSteps(prev => ({
        ...prev,
        visited: new Set([...prev.visited, visitedArray[i]])
      }))
    }
    
    // 动画显示路径
    if (fullResult.path.length > 0) {
      for (let i = 0; i < fullResult.path.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 60)) // 每60ms显示一个路径节点
        setAnimationSteps(prev => ({
          ...prev,
          path: fullResult.path.slice(0, i + 1)
        }))
      }
    }
    
    setIsAnimating(false)
    setShowResult(true)
    setIsRunning(false)
  }

  const exportGif = async () => {
    if (!showResult) return
    
    setIsRunning(true)
    
    try {
      // 动态导入gif.js
      const GIF = await import('gif.js').then(m => m.default) as any
      
      // 创建GIF实例
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: cols * 20,
        height: rows * 20,
        workerScript: '/gif.worker.js',
        repeat: 0, // 0 = 无限循环
        transparent: null
      })
      
      // 创建画布
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const cellSize = 20
      canvas.width = cols * cellSize
      canvas.height = rows * cellSize
      
      // 绘制帧的函数
      const drawFrame = (visitedNodes: Set<string>, pathNodes: Point[]) => {
        // 清空画布 - 使用白色背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // 绘制网格
        grid.forEach((row, y) => {
          row.forEach((cell, x) => {
            const isStart = start.x === x && start.y === y
            const isGoal = goal.x === x && goal.y === y
            const isPath = pathNodes.some(p => p.x === x && p.y === y)
            const visited = visitedNodes.has(`${x},${y}`)
            
            let color = '#ffffff'
            if (cell === 1) color = '#374151' // 障碍物
            else if (isStart) color = '#10b981' // 起点
            else if (isGoal) color = '#ef4444' // 终点
            else if (isPath) color = '#fb923c' // 路径
            else if (visited) color = '#fed7aa' // 访问过的节点
            
            ctx.fillStyle = color
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
            
            // 绘制网格线
            ctx.strokeStyle = '#e5e7eb'
            ctx.lineWidth = 1
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)
          })
        })
      }
      
      // 重新计算结果以获取完整数据
      const fullResult = (() => {
        switch(algo){
          case 'BFS': return bfs(grid, start, goal, allowDiagonal)
          case 'Dijkstra': return dijkstra(grid, start, goal, allowDiagonal)
          case 'A*': return astar(grid, start, goal, allowDiagonal)
          case 'RRT': return rrt(grid, start, goal)
          case 'RRT*': return rrtStar(grid, start, goal)
          case 'JPS': return jps(grid, start, goal)
        }
      })()
      
      // 生成访问过程帧
      const visitedArray = Array.from(fullResult.visited)
      const animatedVisited = new Set<string>()
      
      // 初始帧 - 只显示起点和终点，持续800ms
      drawFrame(new Set(), [])
      gif.addFrame(canvas, {delay: 800, copy: true})
      
      // 访问过程帧 - 逐步显示访问的节点
      for (let i = 0; i < visitedArray.length; i += 1) { // 每个节点一帧
        animatedVisited.add(visitedArray[i])
        drawFrame(animatedVisited, [])
        gif.addFrame(canvas, {delay: 80, copy: true}) // 80ms每帧
      }
      
      // 路径显示帧 - 逐步显示路径
      if (fullResult.path.length > 0) {
        for (let i = 0; i < fullResult.path.length; i++) {
          const pathSoFar = fullResult.path.slice(0, i + 1)
          drawFrame(fullResult.visited, pathSoFar)
          gif.addFrame(canvas, {delay: 150, copy: true}) // 150ms每帧
        }
        
        // 最终帧 - 显示完整结果，持续2秒
        drawFrame(fullResult.visited, fullResult.path)
        gif.addFrame(canvas, {delay: 2000, copy: true})
      }
      
      // 渲染GIF
      gif.on('finished', function(blob: any) {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `pathfinding_${algo}_${Date.now()}.gif`
        link.click()
        setIsRunning(false)
      })
      
      gif.on('progress', function(p: any) {
        console.log('GIF生成进度:', Math.round(p * 100) + '%')
      })
      
      gif.render()
      
    } catch (error: any) {
      console.error('GIF导出失败:', error)
      setIsRunning(false)
      alert('GIF导出失败: ' + (error?.message || '未知错误'))
    }
  }

  const result = useMemo(()=>{
    if (isAnimating) {
      return { path: animationSteps.path, visited: animationSteps.visited }
    }
    if (!showResult) return { path: [], visited: new Set() }
    switch(algo){
      case 'BFS': return bfs(grid, start, goal, allowDiagonal)
      case 'Dijkstra': return dijkstra(grid, start, goal, allowDiagonal)
      case 'A*': return astar(grid, start, goal, allowDiagonal)
      case 'RRT': return rrt(grid, start, goal)
      case 'RRT*': return rrtStar(grid, start, goal)
      case 'JPS': return jps(grid, start, goal)
    }
  }, [grid, start, goal, algo, allowDiagonal, showResult, isAnimating, animationSteps])

  const pathSet = useMemo(()=> new Set(result.path.map(p=>`${p.x},${p.y}`)), [result])

  const onCellClick = (x:number,y:number) => {
    if (isAnimating) return // 动画期间禁用点击
    if (mode==='start') { setStart({x,y}); return }
    if (mode==='goal') { setGoal({x,y}); return }
    setGrid(g=>{
      const ng = g.map(row=>row.slice())
      ng[y][x] = ng[y][x]===1 ? 0 : 1
      return ng
    })
    setShowResult(false)
    setAnimationSteps({visited: new Set(), path: []})
  }

  const onCellMouseDown = (x:number, y:number, e: React.MouseEvent) => {
    if (mode !== 'wall' || isAnimating) return // 动画期间禁用拖拽
    e.preventDefault()
    isDragging.current = true
    const currentCell = grid[y][x]
    dragMode.current = currentCell === 1 ? 'remove' : 'add'
    
    setGrid(g=>{
      const ng = g.map(row=>row.slice())
      ng[y][x] = dragMode.current === 'add' ? 1 : 0
      return ng
    })
    setShowResult(false)
  }

  const onCellMouseEnter = (x:number, y:number) => {
    if (!isDragging.current || mode !== 'wall') return
    
    setGrid(g=>{
      const ng = g.map(row=>row.slice())
      ng[y][x] = dragMode.current === 'add' ? 1 : 0
      return ng
    })
  }

  const onMouseUp = () => {
    isDragging.current = false
  }

  return (
    <div className="space-y-8" onMouseUp={onMouseUp}>
      <PageHeader icon={<span>🗺️</span>} title="路径规划模拟" subtitle="交互式网格编辑，支持 BFS / Dijkstra / A* 算法" accent="orange" />
      
      {/* 控制面板 */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">行：</label>
          <input 
            type="number" 
            className="rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-2 py-1 w-20 text-sm" 
            value={rows} 
            onChange={e=>setRows(Number(e.target.value))} 
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">列：</label>
          <input 
            type="number" 
            className="rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-2 py-1 w-20 text-sm" 
            value={cols} 
            onChange={e=>setCols(Number(e.target.value))} 
          />
        </div>
        <Button variant="secondary" size="sm" onClick={resize}>调整大小</Button>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
        
        <select 
          className="rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 text-sm" 
          value={algo} 
          onChange={e=>setAlgo(e.target.value as any)}
        >
          <option>BFS</option>
          <option>Dijkstra</option>
          <option>A*</option>
          <option>RRT</option>
          <option>RRT*</option>
          <option>JPS</option>
        </select>
        
        <select 
          className="rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 text-sm" 
          value={allowDiagonal ? 'diagonal' : 'straight'} 
          onChange={e=>setAllowDiagonal(e.target.value === 'diagonal')}
        >
          <option value="diagonal">🔄 允许斜线</option>
          <option value="straight">➡️ 仅直线</option>
        </select>
        
        <select 
          className="rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 text-sm" 
          value={mode} 
          onChange={e=>setMode(e.target.value as Mode)}
        >
          <option value="wall">编辑障碍</option>
          <option value="start">设置起点</option>
          <option value="goal">设置终点</option>
        </select>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={startPathfinding}
          disabled={isRunning || isAnimating}
          className="font-bold"
        >
          {isRunning ? '寻路中...' : '开始寻路'}
        </Button>
        <Button variant="secondary" size="sm" onClick={reset}>重置</Button>
        {showResult && result.path.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={exportGif}
            disabled={isRunning}
          >
            {isRunning ? '生成GIF中...' : '📸 导出GIF'}
          </Button>
        )}
      </div>

      {/* 操作提示 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>操作提示：</strong>
          {mode === 'wall' && ' 点击或拖拽鼠标设置/清除障碍物'}
          {mode === 'start' && ' 点击设置起点（绿色）'}
          {mode === 'goal' && ' 点击设置终点（红色）'}
        </div>
      </div>

      <Card className="p-4" accent="orange">
      <div className="overflow-auto max-h-[70vh] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div 
          className="inline-grid select-none" 
          style={{gridTemplateColumns: `repeat(${cols}, 24px)`}}
        >
          {grid.map((row, y)=> row.map((cell, x)=>{
            const isStart = start.x===x && start.y===y
            const isGoal = goal.x===x && goal.y===y
            const isPath = pathSet.has(`${x},${y}`)
            const visited = result.visited.has(`${x},${y}`)
            const bg = cell===1 
              ? 'bg-gray-800 dark:bg-gray-700' 
              : isStart 
                ? 'bg-green-500' 
                : isGoal 
                  ? 'bg-red-500' 
                  : isPath 
                    ? 'bg-orange-400 dark:bg-orange-500' 
                    : visited 
                      ? 'bg-orange-100 dark:bg-orange-900/20' 
                      : 'bg-white dark:bg-gray-900'
            return (
              <div
                key={`${x},${y}`}
                onClick={()=>onCellClick(x,y)}
                onMouseDown={(e)=>onCellMouseDown(x,y,e)}
                onMouseEnter={()=>onCellMouseEnter(x,y)}
                className={`w-6 h-6 border border-gray-200 dark:border-gray-700 ${bg} cursor-pointer transition-colors hover:opacity-80`}
                title={`${x},${y}`}
              />
            )
          }))}
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-4 flex items-center gap-4">
        <span>路径长度：<strong>{result.path.length}</strong></span>
        <span>访问节点：<strong>{result.visited.size}</strong></span>
        {showResult && result.path.length === 0 && (
          <span className="text-red-600 dark:text-red-400">❌ 无法找到路径</span>
        )}
      </div>
      </Card>
    </div>
  )
}