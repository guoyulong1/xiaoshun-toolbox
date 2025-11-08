import { useMemo, useRef, useState } from 'react'

type Segment = {
  type: 'equal' | 'add' | 'remove'
  text: string
}

function diffChars(left: string, right: string) {
  const m = left.length
  const n = right.length
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const ops: { type: Segment['type']; char?: string }[] = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (left[i - 1] === right[j - 1]) {
      ops.push({ type: 'equal', char: left[i - 1] })
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'remove', char: left[i - 1] })
      i--
    } else {
      ops.push({ type: 'add', char: right[j - 1] })
      j--
    }
  }
  while (i > 0) {
    ops.push({ type: 'remove', char: left[i - 1] })
    i--
  }
  while (j > 0) {
    ops.push({ type: 'add', char: right[j - 1] })
    j--
  }

  ops.reverse()

  // Merge contiguous ops into segments
  const leftSegments: Segment[] = []
  const rightSegments: Segment[] = []

  const pushSeg = (arr: Segment[], seg: Segment) => {
    const last = arr[arr.length - 1]
    if (last && last.type === seg.type) {
      last.text += seg.text
    } else {
      arr.push(seg)
    }
  }

  for (const op of ops) {
    if (op.type === 'equal') {
      pushSeg(leftSegments, { type: 'equal', text: op.char || '' })
      pushSeg(rightSegments, { type: 'equal', text: op.char || '' })
    } else if (op.type === 'remove') {
      pushSeg(leftSegments, { type: 'remove', text: op.char || '' })
    } else if (op.type === 'add') {
      pushSeg(rightSegments, { type: 'add', text: op.char || '' })
    }
  }

  return { leftSegments, rightSegments }
}

export default function CompareTool() {
  const [left, setLeft] = useState('Hello, world!\nThis is XiaoShun Toolbox.')
  const [right, setRight] = useState('Hello, World!\nThis is XiaoShun Tools.')

  const { leftSegments, rightSegments } = useMemo(() => diffChars(left, right), [left, right])

  // 将连续片段按行拆分，用于显示行号
  const segmentsToLines = (segments: Segment[]) => {
    const lines: Segment[][] = [[]]
    for (const seg of segments) {
      const parts = seg.text.split('\n')
      for (let idx = 0; idx < parts.length; idx++) {
        if (parts[idx].length > 0) {
          lines[lines.length - 1].push({ type: seg.type, text: parts[idx] })
        }
        if (idx < parts.length - 1) {
          // 遇到换行，开启新行
          lines.push([])
        }
      }
    }
    return lines
  }

  const leftLines = useMemo(() => segmentsToLines(leftSegments), [leftSegments])
  const rightLines = useMemo(() => segmentsToLines(rightSegments), [rightSegments])

  // 同步滚动
  const leftRef = useRef<HTMLDivElement | null>(null)
  const rightRef = useRef<HTMLDivElement | null>(null)
  const isSyncing = useRef(false)

  const syncScroll = (source: 'left' | 'right') => {
    if (isSyncing.current) return
    isSyncing.current = true
    const a = leftRef.current
    const b = rightRef.current
    if (a && b) {
      if (source === 'left') {
        b.scrollTop = a.scrollTop
      } else {
        a.scrollTop = b.scrollTop
      }
    }
    // 结束同步标记
    requestAnimationFrame(() => {
      isSyncing.current = false
    })
  }

  // 输入区行号与文本同步滚动
  const leftEditorRef = useRef<HTMLTextAreaElement | null>(null)
  const rightEditorRef = useRef<HTMLTextAreaElement | null>(null)
  const leftGutterRef = useRef<HTMLDivElement | null>(null)
  const rightGutterRef = useRef<HTMLDivElement | null>(null)

  const onEditorScroll = (side: 'left' | 'right') => {
    const ta = side === 'left' ? leftEditorRef.current : rightEditorRef.current
    const gutter = side === 'left' ? leftGutterRef.current : rightGutterRef.current
    if (ta && gutter) gutter.scrollTop = ta.scrollTop
  }

  const leftEditorLineCount = useMemo(() => left.split('\n').length, [left])
  const rightEditorLineCount = useMemo(() => right.split('\n').length, [right])

  const swap = () => {
    setLeft(right)
    setRight(left)
  }
  const clear = () => {
    setLeft('')
    setRight('')
  }

  const segClass = (type: Segment['type']) => {
    switch (type) {
      case 'equal':
        return ''
      case 'remove':
        return 'bg-red-200/60 dark:bg-red-800/40 text-red-800 dark:text-red-200 line-through'
      case 'add':
        return 'bg-emerald-200/60 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">文本比较（Compare）</h2>
        <div className="space-x-2">
          <button onClick={swap} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">交换左右</button>
          <button onClick={clear} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">清空</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">左侧文本（带行号）</label>
          <div className="grid grid-cols-[48px_1fr] gap-0">
            <div
              ref={leftGutterRef}
              className="h-40 overflow-auto select-none text-xs text-gray-500 dark:text-gray-400 border border-r-0 rounded-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <div className="leading-6">
                {Array.from({ length: leftEditorLineCount }).map((_, i) => (
                  <div key={i} className="px-2 text-right">{i + 1}</div>
                ))}
              </div>
            </div>
            <textarea
              ref={leftEditorRef}
              className="w-full h-40 rounded-r border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 font-mono text-sm leading-6"
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              onScroll={() => onEditorScroll('left')}
              placeholder="输入左侧文本"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">右侧文本（带行号）</label>
          <div className="grid grid-cols-[48px_1fr] gap-0">
            <div
              ref={rightGutterRef}
              className="h-40 overflow-auto select-none text-xs text-gray-500 dark:text-gray-400 border border-r-0 rounded-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <div className="leading-6">
                {Array.from({ length: rightEditorLineCount }).map((_, i) => (
                  <div key={i} className="px-2 text-right">{i + 1}</div>
                ))}
              </div>
            </div>
            <textarea
              ref={rightEditorRef}
              className="w-full h-40 rounded-r border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 font-mono text-sm leading-6"
              value={right}
              onChange={(e) => setRight(e.target.value)}
              onScroll={() => onEditorScroll('right')}
              placeholder="输入右侧文本"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">左侧差异（含行号，滚动与右侧同步）</div>
          <div
            ref={leftRef}
            onScroll={() => syncScroll('left')}
            className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 font-mono text-sm leading-6 overflow-auto h-80"
          >
            <div className="min-w-full">
              {leftLines.map((line, lineIdx) => (
                <div key={lineIdx} className="flex">
                  <div className="select-none w-12 shrink-0 text-right pr-3 py-0.5 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">{lineIdx + 1}</div>
                  <div className="px-3 py-0.5 whitespace-pre-wrap break-words">
                    {line.length === 0 ? (
                      <span className="text-transparent">.</span>
                    ) : (
                      line.map((seg, idx) => (
                        <span key={idx} className={segClass(seg.type)}>{seg.text}</span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">右侧差异（含行号，滚动与左侧同步）</div>
          <div
            ref={rightRef}
            onScroll={() => syncScroll('right')}
            className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0 font-mono text-sm leading-6 overflow-auto h-80"
          >
            <div className="min-w-full">
              {rightLines.map((line, lineIdx) => (
                <div key={lineIdx} className="flex">
                  <div className="select-none w-12 shrink-0 text-right pr-3 py-0.5 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">{lineIdx + 1}</div>
                  <div className="px-3 py-0.5 whitespace-pre-wrap break-words">
                    {line.length === 0 ? (
                      <span className="text-transparent">.</span>
                    ) : (
                      line.map((seg, idx) => (
                        <span key={idx} className={segClass(seg.type)}>{seg.text}</span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">说明：左侧用红色划线表示删除的字符，右侧用绿色表示新增的字符；相同字符不高亮。支持行号与两侧同步滚动，便于长文本比较。</p>
    </div>
  )
}