import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { plantUmlUrlFromText, type PlantUmlFormat } from '../utils/plantuml'
import mermaid from 'mermaid'
// BPMN viewer assets
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'

type TabKey = 'plantuml' | 'mermaid' | 'bpmn'
type MermaidThemeKey = 'beauty' | 'default' | 'forest' | 'neutral' | 'dark'

const DEFAULT_PUML = `@startuml
Alice -> Bob: Hello
Bob --> Alice: Hi!
@enduml`

const DEFAULT_MERMAID = `graph TD
  A[开始] --> B{是否通过?}
  B -- 是 --> C[继续处理]
  B -- 否 --> D[终止]
  C --> E[结束]
  D --> E[结束]`

export default function DiagramTool() {
  const [activeTab, setActiveTab] = useState<TabKey>('plantuml')

  // PlantUML state
  const [pumlText, setPumlText] = useState(DEFAULT_PUML)
  const [pumlFormat, setPumlFormat] = useState<PlantUmlFormat>('png')
  const [pumlUrl, setPumlUrl] = useState<string>('')
  const [pumlAutoWrap, setPumlAutoWrap] = useState<boolean>(true)
  const [pumlBeautify, setPumlBeautify] = useState<boolean>(true)

  // Mermaid state
  const [mermaidText, setMermaidText] = useState(DEFAULT_MERMAID)
  const [mermaidSvg, setMermaidSvg] = useState<string>('')
  const [mermaidError, setMermaidError] = useState<string>('')
  const [mermaidTheme, setMermaidTheme] = useState<MermaidThemeKey>('beauty')

  // (Removed) Graphviz DOT state

  // BPMN state
  const [bpmnXml, setBpmnXml] = useState<string>(`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="开始" />
    <bpmn:userTask id="Task_1" name="处理任务" />
    <bpmn:endEvent id="EndEvent_1" name="结束" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="260" y="78" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="400" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="216" y="118" />
        <di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="260" y="118" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="360" y="118" />
        <di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="400" y="118" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`)
  const [bpmnError, setBpmnError] = useState<string>('')
  const [bpmnSvg, setBpmnSvg] = useState<string>('')
  const bpmnContainerId = 'bpmn-container'

  // Helper: build effective PlantUML text with auto-wrap and beautify
  const buildEffectivePuml = (raw: string) => {
    let t = raw.trim()
    const hasStart = /@startuml/i.test(t)
    const hasEnd = /@enduml/i.test(t)
    const beautifyBlock = pumlBeautify ? `skinparam backgroundColor transparent
skinparam shadowing true
skinparam roundcorner 15
skinparam ArrowColor #6366F1
skinparam ClassBorderColor #6366F1
skinparam ClassBackgroundColor #EEF2FF
skinparam ActivityBorderColor #6366F1
skinparam ActivityBackgroundColor #EEF2FF
skinparam ActorBorderColor #6366F1
skinparam ActorFontColor #111827
` : ''

    if (hasStart) {
      // 插入美化块到 @startuml 之后
      if (pumlBeautify) {
        t = t.replace(/@startuml\s*/i, (m) => `${m}\n${beautifyBlock}`)
      }
      // 如果缺少 @enduml，则补上
      if (!hasEnd) {
        t = `${t}\n@enduml`
      }
      return t
    }
    if (pumlAutoWrap) {
      return `@startuml\n${beautifyBlock}${t}\n${hasEnd ? '' : '@enduml'}`
    }
    return t
  }

  // Build Mermaid config by theme key
  const mermaidConfig = useMemo(() => {
    if (mermaidTheme === 'beauty') {
      return {
        startOnLoad: false,
        theme: 'neutral',
        themeVariables: {
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"',
          fontSize: '16px',
          background: 'transparent',
          primaryColor: '#6366F1', // indigo-500
          secondaryColor: '#A78BFA', // violet-400
          tertiaryColor: '#60A5FA', // blue-400
          lineColor: '#64748B', // slate-500
          textColor: '#111827', // gray-900
          primaryTextColor: '#111827',
          secondaryTextColor: '#111827',
          edgeLabelBackground: '#F1F5F9', // slate-100
          nodeBorder: '#4338CA', // indigo-700
          clusterBkg: '#EEF2FF', // indigo-50
          clusterBorder: '#6366F1',
          borderRadius: '8px'
        },
        flowchart: {
          curve: 'basis',
          nodeSpacing: 60,
          rankSpacing: 70
        }
      } as mermaid.Config
    }
    // Predefined themes
    return {
      startOnLoad: false,
      theme: mermaidTheme,
      flowchart: { curve: 'basis', nodeSpacing: 50, rankSpacing: 60 }
    } as mermaid.Config
  }, [mermaidTheme])

  // Init mermaid & apply theme
  useEffect(() => {
    mermaid.initialize(mermaidConfig)
  }, [mermaidConfig])

  // (Removed) Graphviz DOT rendering effect

  // Render BPMN XML to SVG (dynamic import viewer)
  useEffect(() => {
    if (activeTab !== 'bpmn') return
    const render = async () => {
      const containerEl = document.getElementById(bpmnContainerId)
      if (!containerEl) return
      if (!bpmnXml.trim()) { 
        setBpmnSvg(''); setBpmnError(''); 
        containerEl.innerHTML = ''
        return 
      }
      try {
        const { default: NavigatedViewer } = await import('bpmn-js/lib/NavigatedViewer')
        const viewer = new NavigatedViewer({ container: containerEl })
        await viewer.importXML(bpmnXml)
        const { svg } = await viewer.saveSVG()
        setBpmnSvg(svg)
        setBpmnError('')
      } catch (err: any) {
        console.error('BPMN 渲染失败', err)
        setBpmnError(String(err?.message || err) || '渲染失败')
        setBpmnSvg('')
      }
    }
    const handle = setTimeout(render, 300)
    return () => clearTimeout(handle)
  }, [bpmnXml, activeTab])

  // Update PlantUML preview
  useEffect(() => {
    if (!pumlText.trim()) {
      setPumlUrl('')
      return
    }
    try {
      const effective = buildEffectivePuml(pumlText)
      const url = plantUmlUrlFromText(effective, pumlFormat)
      setPumlUrl(url)
    } catch (err) {
      console.error('PlantUML 编码失败', err)
      setPumlUrl('')
    }
  }, [pumlText, pumlFormat, pumlAutoWrap, pumlBeautify])

  // Update Mermaid preview (debounced)
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!mermaidText.trim()) {
        setMermaidSvg('')
        setMermaidError('')
        return
      }
      try {
        // 先解析验证
        mermaid.parse(mermaidText)
        const id = 'mermaid-diagram-' + Date.now()
        const { svg } = await mermaid.render(id, mermaidText)
        setMermaidSvg(svg)
        setMermaidError('')
      } catch (err: any) {
        console.error('Mermaid 渲染失败', err)
        setMermaidError(String(err?.message || err) || '渲染失败')
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [mermaidText, mermaidConfig])

  const downloadMermaidSvg = () => {
    if (!mermaidSvg) return
    const blob = new Blob([mermaidSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const pumlControls = (
    <div className="flex items-center gap-2">
      <label className="text-sm">输出格式:</label>
      <select 
        className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        value={pumlFormat}
        onChange={e => setPumlFormat(e.target.value as PlantUmlFormat)}
      >
        <option value="png">PNG</option>
        <option value="svg">SVG</option>
      </select>
      <label className="text-sm ml-2">自动包裹</label>
      <input type="checkbox" checked={pumlAutoWrap} onChange={e => setPumlAutoWrap(e.target.checked)} />
      <label className="text-sm ml-2">美化</label>
      <input type="checkbox" checked={pumlBeautify} onChange={e => setPumlBeautify(e.target.checked)} />
      {pumlUrl && (
        <a 
          href={pumlUrl} 
          download={pumlFormat === 'png' ? 'diagram.png' : 'diagram.svg'}
          className="text-sm px-2 py-1 rounded bg-brand-600 text-white hover:bg-brand-700"
        >下载</a>
      )}
    </div>
  )

  const mermaidControls = (
    <div className="flex items-center gap-2">
      <label className="text-sm">主题:</label>
      <select 
        className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        value={mermaidTheme}
        onChange={e => setMermaidTheme(e.target.value as MermaidThemeKey)}
      >
        <option value="beauty">美化主题</option>
        <option value="neutral">Neutral</option>
        <option value="forest">Forest</option>
        <option value="default">Default</option>
        <option value="dark">Dark</option>
      </select>
      <Button size="sm" variant="primary" onClick={downloadMermaidSvg}>下载 SVG</Button>
    </div>
  )

  // (Removed) Graphviz DOT templates and controls

  const bpmnControls = (
    <div className="flex items-center gap-2">
      {bpmnSvg && (
        <Button size="sm" variant="primary" onClick={() => {
          const blob = new Blob([bpmnSvg], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'diagram-bpmn.svg'
          a.click()
          URL.revokeObjectURL(url)
        }}>下载 SVG</Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={<span>📊</span>} 
        title="图表/流程图"
        subtitle="支持 PlantUML (puml) 转图片 和 Mermaid(graph TD) 渲染"
        accent="indigo"
      />

      {/* Tab */}
      <Card className="p-2" accent="indigo">
        <div className="flex items-center gap-2">
          <Button 
            variant={activeTab === 'plantuml' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('plantuml')}
          >PlantUML</Button>
          <Button 
            variant={activeTab === 'mermaid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('mermaid')}
          >Mermaid</Button>
          <Button 
            variant={activeTab === 'bpmn' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('bpmn')}
          >BPMN</Button>
        </div>
      </Card>

      {/* Content */}
      {activeTab === 'plantuml' ? (
        <Card className="p-4" accent="indigo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左侧输入 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">输入 puml 文本</h3>
                {pumlControls}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm">模板:</label>
                <select
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  onChange={(e) => {
                    const t = pumlTemplates[e.target.value]
                    if (t) setPumlText(t)
                  }}
                >
                  <option value="">选择模板</option>
                  {Object.keys(pumlTemplates).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <textarea 
                className="w-full h-[280px] md:h-[420px] p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                value={pumlText}
                onChange={e => setPumlText(e.target.value)}
                placeholder="@startuml\nAlice -> Bob: Hello\n@enduml"
              />
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">图像由 PlantUML 官方服务器在线渲染</div>
            </div>

            {/* 右侧输出 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">输出图片预览</h3>
              </div>
              <div className="min-h-[280px] md:min-h-[420px] bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2">
                {pumlUrl ? (
                  pumlFormat === 'png' ? (
                    <img src={pumlUrl} alt="PlantUML Diagram" className="max-w-full max-h-full" />
                  ) : (
                    <object data={pumlUrl} type="image/svg+xml" className="w-full h-full"></object>
                  )
                ) : (
                  <div className="text-sm text-gray-500">请输入 puml 文本以生成图片</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : activeTab === 'mermaid' ? (
        <Card className="p-4" accent="indigo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左侧输入 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">输入 Mermaid（graph TD）代码</h3>
                {mermaidControls}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm">模板:</label>
                <select
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  onChange={(e) => {
                    const t = mermaidTemplates[e.target.value]
                    if (t) setMermaidText(t)
                  }}
                >
                  <option value="">选择模板</option>
                  {Object.keys(mermaidTemplates).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <textarea 
                className="w-full h-[280px] md:h-[420px] p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                value={mermaidText}
                onChange={e => setMermaidText(e.target.value)}
                placeholder="graph TD\nA[开始] --> B{是否通过?}\nB -- 是 --> C[继续处理]\nB -- 否 --> D[终止]"
              />
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">SVG 在本地浏览器内渲染，无需联网</div>
              {mermaidError && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-300">错误: {mermaidError}</div>
              )}
            </div>

            {/* 右侧输出 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">输出图形预览</h3>
              </div>
              <div className="min-h-[280px] md:min-h-[420px] bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2">
                {mermaidSvg ? (
                  <div className="w-full h-full overflow-auto" dangerouslySetInnerHTML={{ __html: mermaidSvg }} />
                ) : (
                  <div className="text-sm text-gray-500">请输入 Mermaid 代码以生成图形</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4" accent="indigo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左侧输入 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">输入 BPMN XML</h3>
                {bpmnControls}
              </div>
              <textarea 
                className="w-full h-[280px] md:h-[420px] p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                value={bpmnXml}
                onChange={e => setBpmnXml(e.target.value)}
                placeholder="粘贴 BPMN 2.0 XML"
              />
              {bpmnError && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-300">错误: {bpmnError}</div>
              )}
            </div>

            {/* 右侧输出 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">输出图形预览</h3>
              </div>
              <div className="min-h-[280px] md:min-h-[420px] bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2">
                {/* inner container for bpmn-js viewer */}
                <div id={bpmnContainerId} className="w-full h-full" />
                {!bpmnSvg && (
                  <div className="text-sm text-gray-500">请输入 BPMN XML 以生成图形</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
  // Templates
  const pumlTemplates: Record<string, string> = {
    '序列图 (Sequence)': `@startuml
title 支付流程
actor 用户
participant 商城
participant 支付网关
用户 -> 商城: 提交订单
商城 -> 支付网关: 创建支付订单
支付网关 --> 用户: 跳转支付页面
用户 -> 支付网关: 完成支付
支付网关 -> 商城: 支付结果通知
商城 --> 用户: 支付成功
@enduml`,
    '类图 (Class)': `@startuml
title 订单类关系
class Order {
  +id: string
  +items: OrderItem[]
  +total(): number
}
class OrderItem {
  +productId: string
  +quantity: number
}
Order "1" *-- "many" OrderItem
@enduml`,
    '活动图 (Activity)': `@startuml
title 发货流程
start
:订单校验;
if (库存充足?) then (是)
  :生成发货单;
  :打包;
  :快递出库;
else (否)
  :通知缺货;
endif
stop
@enduml`,
    '用例图 (UseCase)': `@startuml
title 登录与下单用例
actor 用户
usecase 登录
usecase 下单
用户 --> 登录
用户 --> 下单
@enduml`,
    '状态图 (State)': `@startuml
title 订单状态机
[*] --> 待支付
待支付 --> 已支付: 支付成功
已支付 --> 已发货: 发货
已发货 --> 已完成: 收货
已支付 --> 已取消: 退款
@enduml`
  }

  const mermaidTemplates: Record<string, string> = {
    '流程图 (Flowchart TD)': DEFAULT_MERMAID,
    '序列图 (Sequence)': `sequenceDiagram
  participant A as 用户
  participant B as 商城
  participant C as 支付网关
  A->>B: 下单
  B->>C: 创建支付订单
  C-->>A: 跳转支付页面
  A->>C: 完成支付
  C-->>B: 支付通知
  B-->>A: 支付成功`,
    '类图 (Class)': `classDiagram
  class Order {
    +id: string
    +items: OrderItem[]
    +total(): number
  }
  class OrderItem {
    +productId: string
    +quantity: number
  }
  Order "1" *-- "many" OrderItem`,
    '状态图 (State)': `stateDiagram-v2
  [*] --> 待支付
  待支付 --> 已支付: 支付成功
  已支付 --> 已发货: 发货
  已发货 --> 已完成: 收货
  已支付 --> 已取消: 退款`,
    '甘特图 (Gantt)': `gantt
  title 项目计划
  dateFormat  YYYY-MM-DD
  section 开发
  需求分析     :done,    des1, 2025-01-01, 2025-01-05
  功能实现     :active,  des2, 2025-01-06, 2025-01-20
  section 测试
  单元测试     :         des3, 2025-01-15, 2025-01-22
  集成测试     :         des4, 2025-01-23, 2025-01-28`
  }

  // Helper: build effective PlantUML text with auto-wrap and beautify
  const buildEffectivePuml = (raw: string) => {
    let t = raw.trim()
    const hasStart = /@startuml/i.test(t)
    const hasEnd = /@enduml/i.test(t)
    const beautifyBlock = pumlBeautify ? `skinparam backgroundColor transparent
skinparam shadowing true
skinparam roundcorner 15
skinparam ArrowColor #6366F1
skinparam ClassBorderColor #6366F1
skinparam ClassBackgroundColor #EEF2FF
skinparam ActivityBorderColor #6366F1
skinparam ActivityBackgroundColor #EEF2FF
skinparam ActorBorderColor #6366F1
skinparam ActorFontColor #111827
` : ''

    if (hasStart) {
      // 插入美化块到 @startuml 之后
      if (pumlBeautify) {
        t = t.replace(/@startuml\s*/i, (m) => `${m}\n${beautifyBlock}`)
      }
      return t
    }
    if (pumlAutoWrap) {
      return `@startuml\n${beautifyBlock}${t}\n${hasEnd ? '' : '@enduml'}`
    }
    return t
  }