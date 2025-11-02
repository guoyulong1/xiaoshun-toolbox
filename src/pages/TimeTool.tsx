import { useMemo, useState } from 'react'
import { formatDate, nowTs, parseDateInput, toDateFromTimestamp } from '../utils/time'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function TimeTool() {
  // Timestamp -> Date
  const [tsInput, setTsInput] = useState('')
  const [tsUnit, setTsUnit] = useState<'ms' | 's'>('ms')

  const tsResult = useMemo(() => {
    const v = tsInput.trim()
    if (!v) return null
    const num = Number(v)
    if (!Number.isFinite(num)) return { error: '请输入有效的数字' }
    if (num < 0) return { error: '时间戳不能为负数' }
    if (tsUnit === 'ms' && num > 8640000000000000) return { error: '毫秒时间戳超出范围' }
    if (tsUnit === 's' && num > 8640000000000) return { error: '秒时间戳超出范围' }
    
    try {
      const d = toDateFromTimestamp(num, tsUnit)
      const { iso, local } = formatDate(d)
      return { date: d, iso, local }
    } catch (error) {
      return { error: '时间戳转换失败' }
    }
  }, [tsInput, tsUnit])

  // Date -> Timestamp
  const [dateInput, setDateInput] = useState('')
  const dateResult = useMemo(() => {
    if (!dateInput.trim()) return null
    try {
      const d = parseDateInput(dateInput)
      if (!d) return { error: '请输入有效的日期格式' }
      const ms = d.getTime()
      if (!Number.isFinite(ms)) return { error: '日期转换失败' }
      const s = Math.floor(ms / 1000)
      const { iso, local } = formatDate(d)
      return { ms, s, iso, local }
    } catch (error) {
      return { error: '日期解析失败' }
    }
  }, [dateInput])

  const fillNow = () => {
    const { ms } = nowTs()
    const d = new Date(ms)
    setDateInput(d.toISOString())
    setTsInput(String(ms))
    setTsUnit('ms')
  }

  // 从时间选择器设置时间
  const handleDateTimeChange = (value: string) => {
    if (value) {
      // datetime-local 返回的格式是 YYYY-MM-DDTHH:mm
      // 需要转换为 ISO 格式
      const isoString = new Date(value).toISOString()
      setDateInput(isoString)
    }
  }

  // 获取当前时间用于时间选择器的默认值
  const getCurrentDateTimeLocal = () => {
    const now = new Date()
    // 转换为 datetime-local 需要的格式 YYYY-MM-DDTHH:mm
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text) } catch {}
  }

  return (
    <div className="space-y-8">
      <PageHeader icon={<span>🕒</span>} title="时间戳与时间转换" subtitle="在时间戳和可读时间格式之间进行转换" accent="blue" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timestamp -> Date */}
        <Card className="p-6" title="时间戳 → 时间" icon={<span>📅</span>} accent="blue">
          <div className="flex items-center gap-3 mb-4">
            <input
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="输入时间戳（毫秒或秒）"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
            />
            <select
              className="rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={tsUnit}
              onChange={(e) => setTsUnit(e.target.value as 'ms' | 's')}
            >
              <option value="ms">毫秒</option>
              <option value="s">秒</option>
            </select>
          </div>
          {tsResult ? (
            'error' in tsResult ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="text-red-600 dark:text-red-400 font-medium">{tsResult.error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISO 格式</div>
                  <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{tsResult.iso}</code>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">本地时间</div>
                  <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{tsResult.local}</code>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => copy(tsResult.iso)} size="md">复制 ISO</Button>
                  <Button onClick={() => copy(tsResult.local)} size="md">复制本地</Button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">⏰</div>
              <p>请输入有效的时间戳以查看结果</p>
            </div>
          )}
        </Card>

        {/* Date -> Timestamp */}
        <Card className="p-6" title="时间 → 时间戳" icon={<span>🔢</span>} accent="blue">
          <div className="space-y-4 mb-4">
            {/* 时间选择器 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 选择时间
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => handleDateTimeChange(e.target.value)}
                defaultValue={getCurrentDateTimeLocal()}
              />
            </div>
            
            {/* 手动输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ✏️ 或手动输入时间字符串
              </label>
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="输入时间字符串（如 2025-01-01T12:00:00Z）"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                />
                <Button variant="secondary" size="md" onClick={fillNow}>填入当前时间</Button>
              </div>
            </div>
          </div>
          {dateResult ? (
            'error' in dateResult ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="text-red-600 dark:text-red-400 font-medium">{dateResult.error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">毫秒时间戳</div>
                    <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{dateResult.ms}</code>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">秒时间戳</div>
                    <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{dateResult.s}</code>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISO 格式</div>
                  <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{dateResult.iso}</code>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">本地时间</div>
                  <code className="text-sm bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 rounded border block break-all">{dateResult.local}</code>
                </div>
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button size="md" onClick={() => copy(String(dateResult.ms))}>复制毫秒</Button>
                  <Button size="md" onClick={() => copy(String(dateResult.s))}>复制秒</Button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📅</div>
              <p>请输入有效的时间字符串以查看结果</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}