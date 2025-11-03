import * as yaml from 'js-yaml'

// YAML 转 JSON
export function yamlToJson(yamlStr: string): { result: string; error: string } {
  try {
    const parsed = yaml.load(yamlStr)
    const jsonStr = JSON.stringify(parsed, null, 2)
    return { result: jsonStr, error: '' }
  } catch (error) {
    return { result: '', error: `YAML解析错误: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

// JSON 转 YAML
export function jsonToYaml(jsonStr: string): { result: string; error: string } {
  try {
    const parsed = JSON.parse(jsonStr)
    const yamlStr = yaml.dump(parsed, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    })
    return { result: yamlStr, error: '' }
  } catch (error) {
    return { result: '', error: `JSON解析错误: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

// YAML 转 XML
export function yamlToXml(yamlStr: string): { result: string; error: string } {
  try {
    const parsed = yaml.load(yamlStr)
    const xmlStr = objectToXml(parsed, 'root')
    return { result: xmlStr, error: '' }
  } catch (error) {
    return { result: '', error: `YAML解析错误: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

// 对象转XML的递归函数
function objectToXml(obj: any, rootName: string = 'root', indent: number = 0): string {
  const spaces = '  '.repeat(indent)
  
  if (obj === null || obj === undefined) {
    return `${spaces}<${rootName}></${rootName}>`
  }
  
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return `${spaces}<${rootName}>${escapeXml(String(obj))}</${rootName}>`
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return `${spaces}<${rootName}></${rootName}>`
    }
    
    let result = `${spaces}<${rootName}>\n`
    obj.forEach((item, index) => {
      result += objectToXml(item, 'item', indent + 1) + '\n'
    })
    result += `${spaces}</${rootName}>`
    return result
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 0) {
      return `${spaces}<${rootName}></${rootName}>`
    }
    
    let result = `${spaces}<${rootName}>\n`
    keys.forEach(key => {
      result += objectToXml(obj[key], key, indent + 1) + '\n'
    })
    result += `${spaces}</${rootName}>`
    return result
  }
  
  return `${spaces}<${rootName}>${escapeXml(String(obj))}</${rootName}>`
}

// XML字符转义
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// YAML 转 CSV
export function yamlToCsv(yamlStr: string): { result: string; error: string } {
  try {
    const parsed = yaml.load(yamlStr)
    const csvStr = objectToCsv(parsed)
    return { result: csvStr, error: '' }
  } catch (error) {
    return { result: '', error: `YAML解析错误: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

// YAML 转 TSV
export function yamlToTsv(yamlStr: string): { result: string; error: string } {
  try {
    const parsed = yaml.load(yamlStr)
    const tsvStr = objectToTsv(parsed)
    return { result: tsvStr, error: '' }
  } catch (error) {
    return { result: '', error: `YAML解析错误: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

// 对象转CSV
function objectToCsv(obj: any): string {
  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
    // 数组对象转CSV表格
    const headers = Object.keys(obj[0])
    const csvRows = [headers.join(',')]
    
    obj.forEach(item => {
      const row = headers.map(header => {
        const value = item[header]
        if (value === null || value === undefined) return ''
        const str = String(value)
        // 如果包含逗号、引号或换行符，需要用引号包围
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      csvRows.push(row.join(','))
    })
    
    return csvRows.join('\n')
  } else {
    // 简单键值对转CSV
    return objectToKeyValueCsv(obj)
  }
}

// 对象转TSV
function objectToTsv(obj: any): string {
  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
    // 数组对象转TSV表格
    const headers = Object.keys(obj[0])
    const tsvRows = [headers.join('\t')]
    
    obj.forEach(item => {
      const row = headers.map(header => {
        const value = item[header]
        if (value === null || value === undefined) return ''
        return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ')
      })
      tsvRows.push(row.join('\t'))
    })
    
    return tsvRows.join('\n')
  } else {
    // 简单键值对转TSV
    return objectToKeyValueTsv(obj)
  }
}

// 键值对转CSV
function objectToKeyValueCsv(obj: any, prefix: string = ''): string {
  const rows: string[] = []
  
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        rows.push(...objectToKeyValueCsv(value, fullKey).split('\n'))
      } else {
        const valueStr = Array.isArray(value) ? JSON.stringify(value) : String(value)
        const escapedValue = valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n') 
          ? `"${valueStr.replace(/"/g, '""')}"` 
          : valueStr
        rows.push(`${fullKey},${escapedValue}`)
      }
    })
  } else {
    rows.push(`value,${String(obj)}`)
  }
  
  return rows.join('\n')
}

// 键值对转TSV
function objectToKeyValueTsv(obj: any, prefix: string = ''): string {
  const rows: string[] = []
  
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        rows.push(...objectToKeyValueTsv(value, fullKey).split('\n'))
      } else {
        const valueStr = Array.isArray(value) ? JSON.stringify(value) : String(value)
        const cleanValue = valueStr.replace(/\t/g, ' ').replace(/\n/g, ' ')
        rows.push(`${fullKey}\t${cleanValue}`)
      }
    })
  } else {
    rows.push(`value\t${String(obj)}`)
  }
  
  return rows.join('\n')
}

// 验证YAML格式
export function validateYaml(yamlStr: string): { isValid: boolean; error: string } {
  try {
    yaml.load(yamlStr)
    return { isValid: true, error: '' }
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

// 验证JSON格式
export function validateJson(jsonStr: string): { isValid: boolean; error: string } {
  try {
    JSON.parse(jsonStr)
    return { isValid: true, error: '' }
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}