import { useState, useEffect } from 'react'
import { yamlToJson, jsonToYaml, yamlToXml, yamlToCsv, yamlToTsv } from '../utils/yaml'

type OutputFormat = 'json' | 'xml' | 'csv' | 'tsv'
type ConversionMode = 'yaml-to-others' | 'json-to-yaml'

export default function YamlTool() {
  // 状态管理
  const [mode, setMode] = useState<ConversionMode>('yaml-to-others')
  const [yamlInput, setYamlInput] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [activeFormat, setActiveFormat] = useState<OutputFormat>('json')
  
  // 输出结果
  const [jsonOutput, setJsonOutput] = useState('')
  const [xmlOutput, setXmlOutput] = useState('')
  const [csvOutput, setCsvOutput] = useState('')
  const [tsvOutput, setTsvOutput] = useState('')
  const [yamlOutput, setYamlOutput] = useState('')
  
  // 错误状态
  const [yamlError, setYamlError] = useState('')
  const [jsonError, setJsonError] = useState('')
  
  // 统计信息
  const [stats, setStats] = useState({
    inputChars: 0,
    outputChars: 0,
    conversionTime: 0,
    status: '待转换'
  })

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // 可以添加成功提示
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // YAML转其他格式
  const convertYamlToOthers = (yamlStr: string) => {
    const startTime = Date.now()
    
    if (!yamlStr.trim()) {
      setJsonOutput('')
      setXmlOutput('')
      setCsvOutput('')
      setTsvOutput('')
      setYamlError('')
      setStats(prev => ({ ...prev, status: '待转换', outputChars: 0, conversionTime: 0 }))
      return
    }

    // 转换为JSON
    const jsonResult = yamlToJson(yamlStr)
    setJsonOutput(jsonResult.result)
    
    // 转换为XML
    const xmlResult = yamlToXml(yamlStr)
    setXmlOutput(xmlResult.result)
    
    // 转换为CSV
    const csvResult = yamlToCsv(yamlStr)
    setCsvOutput(csvResult.result)
    
    // 转换为TSV
    const tsvResult = yamlToTsv(yamlStr)
    setTsvOutput(tsvResult.result)

    // 设置错误状态
    if (jsonResult.error) {
      setYamlError(jsonResult.error)
      setStats(prev => ({ 
        ...prev, 
        status: '转换失败', 
        conversionTime: Date.now() - startTime 
      }))
    } else {
      setYamlError('')
      const currentOutput = getCurrentOutput()
      setStats({
        inputChars: yamlStr.length,
        outputChars: currentOutput.length,
        conversionTime: Date.now() - startTime,
        status: '转换成功'
      })
    }
  }

  // JSON转YAML
  const convertJsonToYaml = (jsonStr: string) => {
    const startTime = Date.now()
    
    if (!jsonStr.trim()) {
      setYamlOutput('')
      setJsonError('')
      setStats(prev => ({ ...prev, status: '待转换', outputChars: 0, conversionTime: 0 }))
      return
    }

    const result = jsonToYaml(jsonStr)
    setYamlOutput(result.result)

    if (result.error) {
      setJsonError(result.error)
      setStats(prev => ({ 
        ...prev, 
        status: '转换失败', 
        conversionTime: Date.now() - startTime 
      }))
    } else {
      setJsonError('')
      setStats({
        inputChars: jsonStr.length,
        outputChars: result.result.length,
        conversionTime: Date.now() - startTime,
        status: '转换成功'
      })
    }
  }

  // 获取当前输出内容
  const getCurrentOutput = () => {
    switch (activeFormat) {
      case 'json': return jsonOutput
      case 'xml': return xmlOutput
      case 'csv': return csvOutput
      case 'tsv': return tsvOutput
      default: return ''
    }
  }

  // 监听输入变化
  useEffect(() => {
    if (mode === 'yaml-to-others') {
      convertYamlToOthers(yamlInput)
    }
  }, [yamlInput, mode])

  useEffect(() => {
    if (mode === 'json-to-yaml') {
      convertJsonToYaml(jsonInput)
    }
  }, [jsonInput, mode])

  // 更新统计信息中的输出字符数
  useEffect(() => {
    if (mode === 'yaml-to-others') {
      const currentOutput = getCurrentOutput()
      setStats(prev => ({ ...prev, outputChars: currentOutput.length }))
    }
  }, [activeFormat, jsonOutput, xmlOutput, csvOutput, tsvOutput])

  // 示例数据
  const sampleYaml = `# 用户配置示例
user:
  name: "张三"
  age: 28
  email: "zhangsan@example.com"
  skills:
    - "JavaScript"
    - "Python"
    - "React"
  address:
    city: "北京"
    district: "朝阳区"
    zipcode: "100000"
  active: true`

  const sampleJson = `{
  "user": {
    "name": "张三",
    "age": 28,
    "email": "zhangsan@example.com",
    "skills": ["JavaScript", "Python", "React"],
    "address": {
      "city": "北京",
      "district": "朝阳区",
      "zipcode": "100000"
    },
    "active": true
  }
}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            YAML 格式转换工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            支持 YAML ↔ JSON 双向转换，以及 YAML → XML、CSV、TSV 等多种格式转换。
            实时转换，格式验证，一键复制结果。
          </p>
        </div>

        {/* 模式切换 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('yaml-to-others')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'yaml-to-others'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              YAML → 其他格式
            </button>
            <button
              onClick={() => setMode('json-to-yaml')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'json-to-yaml'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              JSON → YAML
            </button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 输入区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {mode === 'yaml-to-others' ? 'YAML 输入' : 'JSON 输入'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (mode === 'yaml-to-others') {
                        setYamlInput(sampleYaml)
                      } else {
                        setJsonInput(sampleJson)
                      }
                    }}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    示例数据
                  </button>
                  <button
                    onClick={() => {
                      if (mode === 'yaml-to-others') {
                        setYamlInput('')
                      } else {
                        setJsonInput('')
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    清空
                  </button>
                </div>
              </div>
              
              <textarea
                className="w-full h-80 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder={mode === 'yaml-to-others' ? '请输入 YAML 格式数据...' : '请输入 JSON 格式数据...'}
                value={mode === 'yaml-to-others' ? yamlInput : jsonInput}
                onChange={(e) => {
                  if (mode === 'yaml-to-others') {
                    setYamlInput(e.target.value)
                  } else {
                    setJsonInput(e.target.value)
                  }
                }}
              />
              
              {/* 错误提示 */}
              {((mode === 'yaml-to-others' && yamlError) || (mode === 'json-to-yaml' && jsonError)) && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {mode === 'yaml-to-others' ? yamlError : jsonError}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 输出区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {mode === 'yaml-to-others' ? '转换结果' : 'YAML 输出'}
                </h2>
                <button
                  onClick={() => {
                    const output = mode === 'yaml-to-others' ? getCurrentOutput() : yamlOutput
                    copyToClipboard(output)
                  }}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  disabled={!((mode === 'yaml-to-others' && getCurrentOutput()) || (mode === 'json-to-yaml' && yamlOutput))}
                >
                  复制结果
                </button>
              </div>

              {/* 格式选择标签页 (仅在 YAML → 其他格式模式下显示) */}
              {mode === 'yaml-to-others' && (
                <div className="flex mb-4 border-b border-gray-200 dark:border-gray-600">
                  {[
                    { key: 'json', label: 'JSON' },
                    { key: 'xml', label: 'XML' },
                    { key: 'csv', label: 'CSV' },
                    { key: 'tsv', label: 'TSV' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveFormat(key as OutputFormat)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeFormat === key
                          ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-80 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                  {mode === 'yaml-to-others' ? (
                    getCurrentOutput() || '转换结果将在此显示...'
                  ) : (
                    yamlOutput || 'YAML 结果将在此显示...'
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">转换统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.inputChars}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">输入字符数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.outputChars}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">输出字符数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.conversionTime}ms
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">转换时间</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                stats.status === '转换成功' ? 'text-green-600 dark:text-green-400' :
                stats.status === '转换失败' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {stats.status}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">状态</div>
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">功能特性</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">支持的格式</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• YAML ↔ JSON：双向转换</li>
                <li>• YAML → XML：结构化XML文档</li>
                <li>• YAML → CSV：逗号分隔值</li>
                <li>• YAML → TSV：制表符分隔值</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">功能特性</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 实时转换和格式化</li>
                <li>• 一键复制转换结果</li>
                <li>• 支持复杂嵌套结构</li>
                <li>• 错误提示和验证</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}