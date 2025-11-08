import { useEffect, useMemo, useRef, useState } from 'react'
import cloud from 'd3-cloud'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

type Entry = {
  id: string
  name: string
  email?: string
  tags: string[]
  message?: string
  createdAt: number
}

function normalizeTags(input: string): string[] {
  // 支持逗号、空格、中文顿号、分号分隔
  const raw = input
    .replace(/[\n\r]+/g, ' ')
    .split(/[\s,，、；;]+/)
    .map(t => t.trim())
    .filter(Boolean)
  // 统一大小写，去重
  const set = new Set(raw.map(t => t.toLowerCase()))
  return Array.from(set)
}

function formatDate(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const raw = localStorage.getItem('guestbook_entries')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [message, setMessage] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('guestbook_entries', JSON.stringify(entries))
  }, [entries])

  const tagStats = useMemo(() => {
    const stats: Record<string, number> = {}
    for (const e of entries) {
      for (const t of e.tags) {
        stats[t] = (stats[t] || 0) + 1
      }
    }
    const list = Object.entries(stats).map(([tag, count]) => ({ tag, count }))
    list.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    const max = Math.max(1, ...list.map(i => i.count))
    const min = Math.min(1, ...list.map(i => i.count))
    return { list, max, min }
  }, [entries])

  const filtered = useMemo(() => {
    if (!activeTag) return entries
    return entries.filter(e => e.tags.includes(activeTag))
  }, [entries, activeTag])

  function validateEmail(v: string) {
    if (!v) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tags = normalizeTags(tagsInput)
    if (tags.length === 0) {
      alert('请至少填写一个“功能关键词”用于生成词云')
      return
    }
    if (!validateEmail(email)) {
      alert('邮箱格式不正确，请检查')
      return
    }
    const entry: Entry = {
      id: Math.random().toString(36).slice(2),
      name: name.trim() || '匿名用户',
      email: email.trim() || undefined,
      tags,
      message: message.trim() || undefined,
      createdAt: Date.now(),
    }
    setEntries(prev => [entry, ...prev])
    setName('')
    setEmail('')
    setTagsInput('')
    setMessage('')
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function clearAll() {
    if (confirm('确定清空所有留言与词云数据吗？此操作不可恢复')) {
      setEntries([])
      localStorage.removeItem('guestbook_entries')
    }
  }

  // d3-cloud: 生成词云布局
  const cloudRef = useRef<HTMLDivElement | null>(null)
  const [cloudWords, setCloudWords] = useState<Array<{ text: string; size: number; x: number; y: number; rotate: number }>>([])

  // 将统计数据映射为 d3-cloud 的输入格式
  const cloudInput = useMemo(() => {
    if (tagStats.list.length === 0) return [] as { text: string; size: number }[]
    const range = Math.max(1, tagStats.max - tagStats.min)
    return tagStats.list.map(({ tag, count }) => {
      const weight = (count - tagStats.min) / range
      const size = 12 + Math.round(22 * weight) // 12px ~ 34px
      return { text: tag, size }
    })
  }, [tagStats])

  useEffect(() => {
    function layout() {
      const el = cloudRef.current
      if (!el || cloudInput.length === 0) {
        setCloudWords([])
        return
      }
      const rect = el.getBoundingClientRect()
      const width = Math.max(300, Math.floor(rect.width))
      const height = Math.max(160, Math.floor(rect.height))
      cloud()
        .size([width, height])
        .words(cloudInput.map(d => ({ ...d })))
        .padding(4)
        .rotate(() => 0)
        .font('system-ui')
        .fontSize(d => (d as any).size)
        .on('end', (words: any[]) => {
          setCloudWords(words.map(w => ({ text: w.text, size: w.size, x: w.x, y: w.y, rotate: 0 })))
        })
        .start()
    }
    layout()
    const onResize = () => layout()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [cloudInput])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto w-full py-4">
        <PageHeader
          icon={<span>💬</span>}
          title="留言板"
          subtitle="添加你希望增加的功能，支持选择用户名和邮箱；我们会将关键词汇总生成词云，可按词筛选浏览相关留言"
          accent="violet"
        />

        {/* 主体栅格：左表单 右词云与列表 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：提交表单 */}
          <div className="lg:col-span-1">
            <Card className="p-5" accent="violet">
              <h3 className="text-base font-semibold mb-4">提交你的建议</h3>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">用户名</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    placeholder="例如：小顺用户"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">邮箱（可选）</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">功能关键词（多个词以空格或逗号分隔）</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    placeholder="例：词云, 留言板, 文本比较"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">留言内容（可选）</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm min-h-[100px]"
                    placeholder="详细描述你的需求或场景..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" variant="primary" size="md">提交</Button>
                  <Button type="button" variant="tertiary" size="md" onClick={clearAll}>清空全部</Button>
                </div>
              </form>
            </Card>
          </div>

          {/* 右侧：词云与留言列表 */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5" accent="indigo">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">需求</h3>
                {activeTag && (
                  <Button size="sm" variant="secondary" onClick={() => setActiveTag(null)}>清除筛选</Button>
                )}
              </div>
              <div ref={cloudRef} className="relative min-h-[180px] rounded-lg bg-gray-50 dark:bg-gray-900/40 overflow-hidden">
                {cloudWords.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-400">暂无数据，提交后将自动生成词云</div>
                ) : (
                  <CloudRender 
                    words={cloudWords} 
                    activeTag={activeTag} 
                    onToggle={(t) => setActiveTag(activeTag === t ? null : t)} 
                    tagStats={tagStats} 
                  />
                )}
              </div>
            </Card>

            <Card className="p-5" accent="blue">
              <h3 className="text-base font-semibold mb-4">留言列表{activeTag ? `（筛选：${activeTag}）` : ''}</h3>
              {filtered.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">暂无留言</div>
              ) : (
                <ul className="space-y-4">
                  {filtered.map(e => (
                    <li key={e.id} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          <span className="mr-2">👤 {e.name}</span>
                          {e.email && (
                            <a className="text-brand-600 dark:text-brand-300 hover:underline" href={`mailto:${e.email}`}>{e.email}</a>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(e.createdAt)}</div>
                      </div>
                      {e.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {e.tags.map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">{t}</span>
                          ))}
                        </div>
                      )}
                      {e.message && (
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{e.message}</p>
                      )}
                      <div className="mt-3 text-right">
                        <Button size="sm" variant="danger" onClick={() => removeEntry(e.id)}>删除</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function CloudRender({ words, activeTag, onToggle, tagStats }: {
  words: Array<{ text: string; size: number; x: number; y: number; rotate: number }>
  activeTag: string | null
  onToggle: (t: string) => void
  tagStats: { list: { tag: string; count: number }[], max: number, min: number }
}) {
  const countsMap = useMemo(() => {
    const m: Record<string, number> = {}
    for (const { tag, count } of tagStats.list) m[tag] = count
    return m
  }, [tagStats])

  const palette = [
    '#ef4444', // red-500
    '#f59e0b', // amber-500
    '#22c55e', // green-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
    '#a3e635', // lime-400
  ]

  const range = Math.max(1, tagStats.max - tagStats.min)
  const pickColor = (text: string) => {
    const count = countsMap[text] ?? tagStats.min
    const weight = (count - tagStats.min) / range
    const idx = Math.min(palette.length - 1, Math.max(0, Math.round(weight * (palette.length - 1))))
    return palette[idx]
  }

  return (
    <div className="absolute inset-0">
      {words.map((w) => {
        const isActive = activeTag === w.text
        const color = pickColor(w.text)
        return (
          <button
            key={`${w.text}-${w.x}-${w.y}`}
            onClick={() => onToggle(w.text)}
            className={`absolute transition hover:scale-[1.03]`}
            style={{
              left: `calc(50% + ${w.x}px)`,
              top: `calc(50% + ${w.y}px)`,
              transform: `translate(-50%, -50%)`,
              fontSize: `${w.size}px`,
              opacity: 0.92,
              whiteSpace: 'nowrap',
              color,
              fontWeight: isActive ? 700 as any : 600 as any,
              textDecoration: isActive ? 'underline' : 'none',
            }}
            title={w.text}
          >
            {w.text}
          </button>
        )
      })}
    </div>
  )
}