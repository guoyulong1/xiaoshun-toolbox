export type Cell = 0 | 1 // 0 empty, 1 wall
export interface Point { x: number; y: number }
export type GridType = Cell[][]

export function inBounds(g: GridType, p: Point) {
  return p.y>=0 && p.y<g.length && p.x>=0 && p.x<g[0].length
}

function neighbors(g: GridType, p: Point, allowDiagonal: boolean = true) {
  const dirs = allowDiagonal ? [
    // 直线方向
    {x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1},
    // 斜线方向
    {x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}
  ] : [
    // 仅直线方向
    {x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}
  ]
  
  const out: Point[] = []
  for (const d of dirs){
    const n = {x:p.x+d.x, y:p.y+d.y}
    if (inBounds(g,n) && g[n.y][n.x]===0) {
      // 对于斜线移动，检查两个相邻的直线方向是否都可通行（避免"切角"）
      if (allowDiagonal && (d.x !== 0 && d.y !== 0)) {
        const horizontal = {x: p.x + d.x, y: p.y}
        const vertical = {x: p.x, y: p.y + d.y}
        if (inBounds(g, horizontal) && g[horizontal.y][horizontal.x] === 0 &&
            inBounds(g, vertical) && g[vertical.y][vertical.x] === 0) {
          out.push(n)
        }
      } else {
        out.push(n)
      }
    }
  }
  return out
}

function pointKey(p: Point){ return `${p.x},${p.y}` }

export interface PathResult {
  path: Point[]
  visited: Set<string>
}

export function bfs(g: GridType, start: Point, goal: Point, allowDiagonal: boolean = true): PathResult {
  const q: Point[] = [start]
  const prev = new Map<string, string | null>()
  const visited = new Set<string>([pointKey(start)])
  while(q.length){
    const cur = q.shift()!
    if (cur.x===goal.x && cur.y===goal.y) break
    for (const nb of neighbors(g,cur,allowDiagonal)){
      const k = pointKey(nb)
      if (!visited.has(k)){
        visited.add(k)
        prev.set(k, pointKey(cur))
        q.push(nb)
      }
    }
  }
  const path = reconstructPath(prev, start, goal)
  return { path, visited }
}

export function dijkstra(g: GridType, start: Point, goal: Point, allowDiagonal: boolean = true): PathResult {
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()
  const pq: {k:string, p:number, pt:Point}[] = []
  const sk = pointKey(start)
  dist.set(sk, 0)
  pq.push({k:sk,p:0,pt:start})
  while(pq.length){
    pq.sort((a,b)=>a.p-b.p)
    const {k, pt} = pq.shift()!
    if (visited.has(k)) continue
    visited.add(k)
    if (pt.x===goal.x && pt.y===goal.y) break
    for(const nb of neighbors(g,pt,allowDiagonal)){
      const nk = pointKey(nb)
      // 斜线移动的代价更高（√2 ≈ 1.414）
      const moveCost = allowDiagonal && Math.abs(nb.x - pt.x) === 1 && Math.abs(nb.y - pt.y) === 1 ? 1.414 : 1
      const nd = (dist.get(k) ?? Infinity) + moveCost
      if (nd < (dist.get(nk) ?? Infinity)){
        dist.set(nk, nd)
        prev.set(nk, k)
        pq.push({k:nk, p:nd, pt:nb})
      }
    }
  }
  const path = reconstructPath(prev, start, goal)
  return { path, visited }
}

function heuristic(a: Point, b: Point, allowDiagonal: boolean = true){
  if (allowDiagonal) {
    // 对角线距离（Chebyshev距离）
    return Math.max(Math.abs(a.x-b.x), Math.abs(a.y-b.y))
  } else {
    // 曼哈顿距离
    return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)
  }
}

export function astar(g: GridType, start: Point, goal: Point, allowDiagonal: boolean = true): PathResult {
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()
  const gScore = new Map<string, number>()
  const fScore = new Map<string, number>()
  const open: {k:string, f:number, pt:Point}[] = []
  const sk = pointKey(start)
  gScore.set(sk, 0)
  fScore.set(sk, heuristic(start, goal, allowDiagonal))
  open.push({k:sk,f:fScore.get(sk)!,pt:start})
  while(open.length){
    open.sort((a,b)=>a.f-b.f)
    const {k, pt} = open.shift()!
    visited.add(k)
    if (pt.x===goal.x && pt.y===goal.y) break
    for(const nb of neighbors(g,pt,allowDiagonal)){
      const nk = pointKey(nb)
      // 斜线移动的代价更高
      const moveCost = allowDiagonal && Math.abs(nb.x - pt.x) === 1 && Math.abs(nb.y - pt.y) === 1 ? 1.414 : 1
      const tentative = (gScore.get(k) ?? Infinity) + moveCost
      if (tentative < (gScore.get(nk) ?? Infinity)){
        prev.set(nk, k)
        gScore.set(nk, tentative)
        fScore.set(nk, tentative + heuristic(nb, goal, allowDiagonal))
        open.push({k:nk, f:fScore.get(nk)!, pt:nb})
      }
    }
  }
  const path = reconstructPath(prev, start, goal)
  return { path, visited }
}

function reconstructPath(prev: Map<string, string | null>, start: Point, goal: Point): Point[] {
  const out: Point[] = []
  let curKey = pointKey(goal)
  if (!prev.has(curKey) && !(start.x===goal.x&&start.y===goal.y)) return out
  while(curKey){
    const [x,y] = curKey.split(',').map(Number)
    out.push({x,y})
    const p = prev.get(curKey) ?? null
    if (p===null) break
    curKey = p
  }
  return out.reverse()
}

// RRT (Rapidly-exploring Random Tree) 算法
export function rrt(g: GridType, start: Point, goal: Point): PathResult {
  const maxIterations = 1000
  const stepSize = 2
  const goalRadius = 3
  
  const tree: {point: Point, parent: number | null}[] = [{point: start, parent: null}]
  const visited = new Set<string>([pointKey(start)])
  
  for (let i = 0; i < maxIterations; i++) {
    // 随机采样点
    const randomPoint = Math.random() < 0.1 ? goal : {
      x: Math.floor(Math.random() * g[0].length),
      y: Math.floor(Math.random() * g.length)
    }
    
    // 找到树中最近的节点
    let nearestIdx = 0
    let minDist = distance(tree[0].point, randomPoint)
    for (let j = 1; j < tree.length; j++) {
      const dist = distance(tree[j].point, randomPoint)
      if (dist < minDist) {
        minDist = dist
        nearestIdx = j
      }
    }
    
    // 向随机点扩展
    const nearest = tree[nearestIdx].point
    const newPoint = extend(nearest, randomPoint, stepSize)
    
    // 检查新点是否有效且路径无碰撞
    if (inBounds(g, newPoint) && g[newPoint.y][newPoint.x] === 0 && 
        isPathClear(g, nearest, newPoint)) {
      tree.push({point: newPoint, parent: nearestIdx})
      visited.add(pointKey(newPoint))
      
      // 检查是否到达目标
      if (distance(newPoint, goal) <= goalRadius) {
        const path = reconstructRRTPath(tree, tree.length - 1)
        return { path, visited }
      }
    }
  }
  
  return { path: [], visited }
}

// RRT* (RRT Star) 算法 - 优化版本
export function rrtStar(g: GridType, start: Point, goal: Point): PathResult {
  const maxIterations = 800
  const stepSize = 2
  const goalRadius = 3
  const rewireRadius = 4
  
  const tree: {point: Point, parent: number | null, cost: number}[] = [
    {point: start, parent: null, cost: 0}
  ]
  const visited = new Set<string>([pointKey(start)])
  
  for (let i = 0; i < maxIterations; i++) {
    const randomPoint = Math.random() < 0.15 ? goal : {
      x: Math.floor(Math.random() * g[0].length),
      y: Math.floor(Math.random() * g.length)
    }
    
    // 找到最近节点
    let nearestIdx = 0
    let minDist = distance(tree[0].point, randomPoint)
    for (let j = 1; j < tree.length; j++) {
      const dist = distance(tree[j].point, randomPoint)
      if (dist < minDist) {
        minDist = dist
        nearestIdx = j
      }
    }
    
    const nearest = tree[nearestIdx].point
    const newPoint = extend(nearest, randomPoint, stepSize)
    
    if (inBounds(g, newPoint) && g[newPoint.y][newPoint.x] === 0 && 
        isPathClear(g, nearest, newPoint)) {
      
      // 找到rewire半径内的所有节点
      const nearNodes: number[] = []
      for (let j = 0; j < tree.length; j++) {
        if (distance(tree[j].point, newPoint) <= rewireRadius) {
          nearNodes.push(j)
        }
      }
      
      // 选择最优父节点
      let bestParent = nearestIdx
      let minCost = tree[nearestIdx].cost + distance(nearest, newPoint)
      
      for (const nodeIdx of nearNodes) {
        const node = tree[nodeIdx]
        const newCost = node.cost + distance(node.point, newPoint)
        if (newCost < minCost && isPathClear(g, node.point, newPoint)) {
          bestParent = nodeIdx
          minCost = newCost
        }
      }
      
      const newNodeIdx = tree.length
      tree.push({point: newPoint, parent: bestParent, cost: minCost})
      visited.add(pointKey(newPoint))
      
      // Rewire操作
      for (const nodeIdx of nearNodes) {
        if (nodeIdx === bestParent) continue
        const node = tree[nodeIdx]
        const newCost = minCost + distance(newPoint, node.point)
        if (newCost < node.cost && isPathClear(g, newPoint, node.point)) {
          tree[nodeIdx].parent = newNodeIdx
          tree[nodeIdx].cost = newCost
        }
      }
      
      if (distance(newPoint, goal) <= goalRadius) {
        const path = reconstructRRTPath(tree, newNodeIdx)
        return { path, visited }
      }
    }
  }
  
  return { path: [], visited }
}

// Jump Point Search (JPS) 算法
export function jps(g: GridType, start: Point, goal: Point): PathResult {
  const visited = new Set<string>()
  const openSet: {point: Point, g: number, f: number, parent: Point | null}[] = []
  const gScore = new Map<string, number>()
  const parent = new Map<string, Point | null>()
  
  const startKey = pointKey(start)
  gScore.set(startKey, 0)
  parent.set(startKey, null)
  openSet.push({
    point: start,
    g: 0,
    f: heuristic(start, goal, true), // JPS总是允许斜线移动
    parent: null
  })
  
  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f)
    const current = openSet.shift()!
    const currentKey = pointKey(current.point)
    
    if (visited.has(currentKey)) continue
    visited.add(currentKey)
    
    if (current.point.x === goal.x && current.point.y === goal.y) {
      const path = reconstructJPSPath(parent, start, goal)
      return { path, visited }
    }
    
    const successors = getJumpPoints(g, current.point, current.parent, goal)
    
    for (const successor of successors) {
      const successorKey = pointKey(successor)
      if (visited.has(successorKey)) continue
      
      const tentativeG = current.g + distance(current.point, successor)
      
      if (!gScore.has(successorKey) || tentativeG < gScore.get(successorKey)!) {
        gScore.set(successorKey, tentativeG)
        parent.set(successorKey, current.point)
        openSet.push({
          point: successor,
          g: tentativeG,
          f: tentativeG + heuristic(successor, goal, true), // JPS总是允许斜线移动
          parent: current.point
        })
      }
    }
  }
  
  return { path: [], visited }
}

// 辅助函数
function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function extend(from: Point, to: Point, stepSize: number): Point {
  const dist = distance(from, to)
  if (dist <= stepSize) return to
  
  const ratio = stepSize / dist
  return {
    x: Math.round(from.x + (to.x - from.x) * ratio),
    y: Math.round(from.y + (to.y - from.y) * ratio)
  }
}

function isPathClear(g: GridType, from: Point, to: Point): boolean {
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  const steps = Math.max(dx, dy)
  
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps
    const x = Math.round(from.x + (to.x - from.x) * t)
    const y = Math.round(from.y + (to.y - from.y) * t)
    
    if (!inBounds(g, {x, y}) || g[y][x] === 1) {
      return false
    }
  }
  return true
}

function reconstructRRTPath(tree: {point: Point, parent: number | null}[], nodeIdx: number): Point[] {
  const path: Point[] = []
  let current: number | null = nodeIdx
  
  // 收集树路径上的关键节点
  const keyPoints: Point[] = []
  while (current !== null) {
    keyPoints.push(tree[current].point)
    current = tree[current].parent
  }
  keyPoints.reverse()
  
  // 在关键节点之间插入中间点形成连续路径
  for (let i = 0; i < keyPoints.length - 1; i++) {
    const from = keyPoints[i]
    const to = keyPoints[i + 1]
    
    // 添加起始点
    path.push(from)
    
    // 在两点之间插入中间点
    const dx = to.x - from.x
    const dy = to.y - from.y
    const steps = Math.max(Math.abs(dx), Math.abs(dy))
    
    for (let step = 1; step < steps; step++) {
      const t = step / steps
      const intermediatePoint = {
        x: Math.round(from.x + dx * t),
        y: Math.round(from.y + dy * t)
      }
      path.push(intermediatePoint)
    }
  }
  
  // 添加最后一个点
  if (keyPoints.length > 0) {
    path.push(keyPoints[keyPoints.length - 1])
  }
  
  return path
}

function reconstructJPSPath(parent: Map<string, Point | null>, start: Point, goal: Point): Point[] {
  const keyPoints: Point[] = []
  let current: Point | null = goal
  
  // 收集关键跳点
  while (current) {
    keyPoints.push(current)
    current = parent.get(pointKey(current)) || null
    if (current && current.x === start.x && current.y === start.y) {
      keyPoints.push(start)
      break
    }
  }
  
  keyPoints.reverse()
  
  // 在关键点之间插入中间点形成连续路径
  const path: Point[] = []
  for (let i = 0; i < keyPoints.length - 1; i++) {
    const from = keyPoints[i]
    const to = keyPoints[i + 1]
    
    // 添加起始点
    path.push(from)
    
    // 在两点之间插入中间点
    const dx = to.x - from.x
    const dy = to.y - from.y
    const steps = Math.max(Math.abs(dx), Math.abs(dy))
    
    for (let step = 1; step < steps; step++) {
      const t = step / steps
      const intermediatePoint = {
        x: Math.round(from.x + dx * t),
        y: Math.round(from.y + dy * t)
      }
      path.push(intermediatePoint)
    }
  }
  
  // 添加最后一个点
  if (keyPoints.length > 0) {
    path.push(keyPoints[keyPoints.length - 1])
  }
  
  return path
}

function getJumpPoints(g: GridType, point: Point, parent: Point | null, goal: Point): Point[] {
  const directions = parent ? 
    getPrunedDirections(point, parent) : 
    // 初始时搜索所有8个方向
    [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1},
     {x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}]
  
  const jumpPoints: Point[] = []
  
  for (const dir of directions) {
    const jp = jump(g, point, dir, goal)
    if (jp) jumpPoints.push(jp)
  }
  
  return jumpPoints
}

function getPrunedDirections(point: Point, parent: Point): Point[] {
  const dx = Math.sign(point.x - parent.x)
  const dy = Math.sign(point.y - parent.y)
  
  if (dx === 0) return [{x: 0, y: dy}]
  if (dy === 0) return [{x: dx, y: 0}]
  
  return [{x: dx, y: 0}, {x: 0, y: dy}, {x: dx, y: dy}]
}

function jump(g: GridType, point: Point, direction: Point, goal: Point): Point | null {
  const next = {x: point.x + direction.x, y: point.y + direction.y}
  
  // 检查边界和障碍物
  if (!inBounds(g, next) || g[next.y][next.x] === 1) {
    return null
  }
  
  // 到达目标
  if (next.x === goal.x && next.y === goal.y) {
    return next
  }
  
  // 检查强制邻居
  if (hasForceNeighbor(g, next, direction)) {
    return next
  }
  
  // 斜线移动时，递归搜索水平和垂直方向
  if (direction.x !== 0 && direction.y !== 0) {
    if (jump(g, next, {x: direction.x, y: 0}, goal) || 
        jump(g, next, {x: 0, y: direction.y}, goal)) {
      return next
    }
  }
  
  // 继续跳跃
  return jump(g, next, direction, goal)
}

function hasForceNeighbor(g: GridType, point: Point, direction: Point): boolean {
  const {x, y} = point
  const {x: dx, y: dy} = direction
  
  // 水平移动
  if (dx !== 0 && dy === 0) {
    return (inBounds(g, {x, y: y - 1}) && g[y - 1][x] === 1 && 
            inBounds(g, {x: x + dx, y: y - 1}) && g[y - 1][x + dx] === 0) ||
           (inBounds(g, {x, y: y + 1}) && g[y + 1][x] === 1 && 
            inBounds(g, {x: x + dx, y: y + 1}) && g[y + 1][x + dx] === 0)
  }
  
  // 垂直移动
  if (dx === 0 && dy !== 0) {
    return (inBounds(g, {x: x - 1, y}) && g[y][x - 1] === 1 && 
            inBounds(g, {x: x - 1, y: y + dy}) && g[y + dy][x - 1] === 0) ||
           (inBounds(g, {x: x + 1, y}) && g[y][x + 1] === 1 && 
            inBounds(g, {x: x + 1, y: y + dy}) && g[y + dy][x + 1] === 0)
  }
  
  // 斜线移动
  if (dx !== 0 && dy !== 0) {
    return (inBounds(g, {x: x - dx, y}) && g[y][x - dx] === 1 && 
            inBounds(g, {x: x - dx, y: y + dy}) && g[y + dy][x - dx] === 0) ||
           (inBounds(g, {x, y: y - dy}) && g[y - dy][x] === 1 && 
            inBounds(g, {x: x + dx, y: y - dy}) && g[y - dy][x + dx] === 0)
  }
  
  return false
}

export function createGrid(rows: number, cols: number): GridType {
  return Array.from({length: rows}, ()=> Array.from({length: cols}, ()=>0 as Cell))
}