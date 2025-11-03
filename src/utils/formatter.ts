// 格式化工具核心函数库
// 支持多种编程语言和文本格式的格式化

export interface FormatOptions {
  indentSize: number;
  indentType: 'spaces' | 'tabs';
  maxLineLength: number;
  insertFinalNewline: boolean;
  trimTrailingWhitespace: boolean;
}

export interface FormatResult {
  formatted: string;
  success: boolean;
  error?: string;
  language: string;
  changes: number;
}

// 支持的语言类型
export const SUPPORTED_LANGUAGES = {
  // 前端语言
  javascript: { name: 'JavaScript', extensions: ['.js', '.mjs'], icon: '🟨' },
  typescript: { name: 'TypeScript', extensions: ['.ts'], icon: '🔷' },
  html: { name: 'HTML', extensions: ['.html', '.htm'], icon: '🌐' },
  css: { name: 'CSS', extensions: ['.css'], icon: '🎨' },
  scss: { name: 'SCSS', extensions: ['.scss'], icon: '💜' },
  vue: { name: 'Vue', extensions: ['.vue'], icon: '💚' },
  react: { name: 'React JSX', extensions: ['.jsx', '.tsx'], icon: '⚛️' },
  
  // 后端语言
  python: { name: 'Python', extensions: ['.py'], icon: '🐍' },
  java: { name: 'Java', extensions: ['.java'], icon: '☕' },
  cpp: { name: 'C++', extensions: ['.cpp', '.cc', '.cxx'], icon: '⚡' },
  csharp: { name: 'C#', extensions: ['.cs'], icon: '🔵' },
  go: { name: 'Go', extensions: ['.go'], icon: '🐹' },
  rust: { name: 'Rust', extensions: ['.rs'], icon: '🦀' },
  php: { name: 'PHP', extensions: ['.php'], icon: '🐘' },
  
  // 数据格式
  json: { name: 'JSON', extensions: ['.json'], icon: '📋' },
  xml: { name: 'XML', extensions: ['.xml'], icon: '📄' },
  yaml: { name: 'YAML', extensions: ['.yml', '.yaml'], icon: '📝' },
  
  // 查询语言
  sql: { name: 'SQL', extensions: ['.sql'], icon: '🗃️' },
  
  // 标记语言
  markdown: { name: 'Markdown', extensions: ['.md'], icon: '📖' },
  
  // 其他
  text: { name: 'Plain Text', extensions: ['.txt'], icon: '📄' }
} as const;

export type LanguageType = keyof typeof SUPPORTED_LANGUAGES;

// 格式化方案
export const FORMAT_STYLES = {
  standard: {
    name: '标准方案',
    description: '遵循官方推荐的代码风格',
    options: { indentSize: 2, indentType: 'spaces' as const, maxLineLength: 80, insertFinalNewline: true, trimTrailingWhitespace: true }
  },
  compact: {
    name: '紧凑方案',
    description: '最小化空白字符，节省空间',
    options: { indentSize: 2, indentType: 'spaces' as const, maxLineLength: 120, insertFinalNewline: false, trimTrailingWhitespace: true }
  },
  readable: {
    name: '可读性方案',
    description: '增加空白和缩进，提升可读性',
    options: { indentSize: 4, indentType: 'spaces' as const, maxLineLength: 100, insertFinalNewline: true, trimTrailingWhitespace: true }
  },
  team: {
    name: '团队方案',
    description: '常见的团队协作代码风格',
    options: { indentSize: 2, indentType: 'spaces' as const, maxLineLength: 100, insertFinalNewline: true, trimTrailingWhitespace: true }
  }
} as const;

export type FormatStyle = keyof typeof FORMAT_STYLES;

// 语言检测函数
export function detectLanguage(code: string): LanguageType {
  const trimmedCode = code.trim();
  
  // JSON 检测
  if ((trimmedCode.startsWith('{') && trimmedCode.endsWith('}')) || 
      (trimmedCode.startsWith('[') && trimmedCode.endsWith(']'))) {
    try {
      JSON.parse(trimmedCode);
      return 'json';
    } catch {}
  }
  
  // XML 检测
  if (trimmedCode.startsWith('<') && trimmedCode.includes('>')) {
    if (trimmedCode.includes('<?xml') || trimmedCode.match(/<[^>]+>/)) {
      return 'xml';
    }
  }
  
  // HTML 检测
  if (trimmedCode.includes('<!DOCTYPE html') || 
      trimmedCode.includes('<html') || 
      trimmedCode.includes('<head>') || 
      trimmedCode.includes('<body>')) {
    return 'html';
  }
  
  // CSS 检测
  if (trimmedCode.includes('{') && trimmedCode.includes('}') && 
      (trimmedCode.includes(':') || trimmedCode.includes('@'))) {
    if (trimmedCode.match(/[.#]?[\w-]+\s*\{[^}]*\}/)) {
      return 'css';
    }
  }
  
  // C++ 检测 (优先检测，避免与其他语言混淆)
  if (trimmedCode.includes('#include') || 
      (trimmedCode.includes('using namespace') && trimmedCode.includes('std')) ||
      trimmedCode.includes('cout') || trimmedCode.includes('cin') ||
      trimmedCode.includes('endl') || 
      trimmedCode.match(/int\s+main\s*\(/)) {
    return 'cpp';
  }
  
  // Java 检测
  if (trimmedCode.includes('public class') || 
      trimmedCode.includes('public static void main') ||
      trimmedCode.includes('System.out.println') ||
      trimmedCode.includes('import java.')) {
    return 'java';
  }
  
  // JavaScript/TypeScript 检测
  if (trimmedCode.includes('function') || trimmedCode.includes('=>') || 
      trimmedCode.includes('const ') || trimmedCode.includes('let ') || 
      trimmedCode.includes('var ')) {
    if (trimmedCode.includes(': ') && (trimmedCode.includes('interface') || trimmedCode.includes('type '))) {
      return 'typescript';
    }
    return 'javascript';
  }
  
  // Python 检测
  if (trimmedCode.includes('def ') || trimmedCode.includes('import ') || 
      trimmedCode.includes('from ') || trimmedCode.includes('class ') ||
      trimmedCode.includes('if __name__')) {
    return 'python';
  }
  
  // SQL 检测
  if (trimmedCode.match(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i)) {
    return 'sql';
  }
  
  // YAML 检测
  if (trimmedCode.includes('---') || trimmedCode.match(/^\s*\w+:\s*$/m)) {
    return 'yaml';
  }
  
  return 'text';
}

// JavaScript/TypeScript 格式化
function formatJavaScript(code: string, options: FormatOptions): FormatResult {
  try {
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    let formatted = code;
    let changes = 0;
    
    // 基本格式化规则
    // 1. 在 { 后添加换行和缩进
    formatted = formatted.replace(/\{\s*/g, (match) => {
      changes++;
      return '{\n' + indent;
    });
    
    // 2. 在 } 前添加换行
    formatted = formatted.replace(/\s*\}/g, (match) => {
      changes++;
      return '\n}';
    });
    
    // 3. 在 ; 后添加换行
    formatted = formatted.replace(/;\s*/g, (match) => {
      changes++;
      return ';\n' + indent;
    });
    
    // 4. 在操作符周围添加空格
    formatted = formatted.replace(/([=+\-*/<>!])([^=])/g, (match, op, next) => {
      changes++;
      return op + ' ' + next;
    });
    
    // 5. 清理多余的空行
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // 6. 修复缩进
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';
      
      if (trimmed.includes('}')) indentLevel = Math.max(0, indentLevel - 1);
      const result = indent.repeat(indentLevel) + trimmed;
      if (trimmed.includes('{')) indentLevel++;
      
      return result;
    });
    
    formatted = formattedLines.join('\n');
    
    if (options.trimTrailingWhitespace) {
      formatted = formatted.replace(/[ \t]+$/gm, '');
      changes++;
    }
    
    if (options.insertFinalNewline && !formatted.endsWith('\n')) {
      formatted += '\n';
      changes++;
    }
    
    return {
      formatted,
      success: true,
      language: 'javascript',
      changes
    };
  } catch (error) {
    return {
      formatted: code,
      success: false,
      error: error instanceof Error ? error.message : '格式化失败',
      language: 'javascript',
      changes: 0
    };
  }
}

// Python 格式化
function formatPython(code: string, options: FormatOptions): FormatResult {
  try {
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    let formatted = code;
    let changes = 0;
    
    // Python 格式化规则
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';
      
      // 减少缩进的关键字
      if (trimmed.match(/^(except|elif|else|finally):/)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const result = indent.repeat(indentLevel) + trimmed;
      
      // 增加缩进的关键字
      if (trimmed.match(/^(if|for|while|def|class|try|except|elif|else|finally|with).*:$/)) {
        indentLevel++;
      }
      
      return result;
    });
    
    formatted = formattedLines.join('\n');
    changes = lines.length;
    
    // 在操作符周围添加空格
    formatted = formatted.replace(/([=+\-*/<>!])([^=])/g, '$1 $2');
    
    if (options.trimTrailingWhitespace) {
      formatted = formatted.replace(/[ \t]+$/gm, '');
    }
    
    if (options.insertFinalNewline && !formatted.endsWith('\n')) {
      formatted += '\n';
    }
    
    return {
      formatted,
      success: true,
      language: 'python',
      changes
    };
  } catch (error) {
    return {
      formatted: code,
      success: false,
      error: error instanceof Error ? error.message : '格式化失败',
      language: 'python',
      changes: 0
    };
  }
}

// JSON 格式化
function formatJSON(code: string, options: FormatOptions): FormatResult {
  try {
    const parsed = JSON.parse(code);
    const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    const formatted = JSON.stringify(parsed, null, indentStr);
    
    return {
      formatted: options.insertFinalNewline ? formatted + '\n' : formatted,
      success: true,
      language: 'json',
      changes: 1
    };
  } catch (error) {
    return {
      formatted: code,
      success: false,
      error: 'JSON 格式错误: ' + (error instanceof Error ? error.message : '未知错误'),
      language: 'json',
      changes: 0
    };
  }
}

// XML 格式化
function formatXML(code: string, options: FormatOptions): FormatResult {
  try {
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    let formatted = code.replace(/>\s*</g, '><'); // 移除标签间的空白
    let indentLevel = 0;
    let changes = 0;
    
    // 简单的 XML 格式化
    formatted = formatted.replace(/(<[^>]+>)/g, (match) => {
      const isClosing = match.startsWith('</');
      const isSelfClosing = match.endsWith('/>');
      
      if (isClosing) indentLevel = Math.max(0, indentLevel - 1);
      
      const result = '\n' + indent.repeat(indentLevel) + match;
      
      if (!isClosing && !isSelfClosing) indentLevel++;
      
      changes++;
      return result;
    });
    
    formatted = formatted.trim();
    
    if (options.insertFinalNewline) {
      formatted += '\n';
    }
    
    return {
      formatted,
      success: true,
      language: 'xml',
      changes
    };
  } catch (error) {
    return {
      formatted: code,
      success: false,
      error: error instanceof Error ? error.message : '格式化失败',
      language: 'xml',
      changes: 0
    };
  }
}

// SQL 格式化
function formatSQL(code: string, options: FormatOptions): FormatResult {
  try {
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    let formatted = code.toUpperCase();
    let changes = 0;
    
    // SQL 关键字格式化
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
                     'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, '\n' + keyword);
      changes++;
    });
    
    // 添加缩进
    const lines = formatted.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';
      
      if (trimmed.match(/^(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING)$/)) {
        return trimmed;
      } else {
        return indent + trimmed;
      }
    });
    
    formatted = lines.join('\n').trim();
    
    if (options.insertFinalNewline) {
      formatted += '\n';
    }
    
    return {
      formatted,
      success: true,
      language: 'sql',
      changes
    };
  } catch (error) {
    return {
      formatted: code,
      success: false,
      error: error instanceof Error ? error.message : '格式化失败',
      language: 'sql',
      changes: 0
    };
  }
}

// 通用文本格式化
function formatText(code: string, options: FormatOptions): FormatResult {
  let formatted = code;
  let changes = 0;
  
  if (options.trimTrailingWhitespace) {
    const before = formatted;
    formatted = formatted.replace(/[ \t]+$/gm, '');
    if (before !== formatted) changes++;
  }
  
  if (options.insertFinalNewline && !formatted.endsWith('\n')) {
    formatted += '\n';
    changes++;
  }
  
  return {
    formatted,
    success: true,
    language: 'text',
    changes
  };
}

// C++ 格式化
function formatCpp(code: string, options: FormatOptions): FormatResult {
  try {
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    let formatted = code;
    let changes = 0;
    
    // 在操作符周围添加空格
    formatted = formatted.replace(/([=+\-*/<>!])([^=<>])/g, '$1 $2');
    formatted = formatted.replace(/([^=<>!])([=+\-*/<>])/g, '$1 $2');
    
    // 在逗号后添加空格
    formatted = formatted.replace(/,([^\s])/g, ', $1');
    
    // 在分号后添加换行
    formatted = formatted.replace(/;([^\s\n])/g, ';\n$1');
    
    // 在大括号前后添加适当的空格和换行
    formatted = formatted.replace(/\{([^\s\n])/g, '{\n$1');
    formatted = formatted.replace(/([^\s\n])\}/g, '$1\n}');
    
    // 处理 include 语句
    formatted = formatted.replace(/#include\s*<([^>]+)>/g, '#include <$1>');
    formatted = formatted.replace(/#include\s*"([^"]+)"/g, '#include "$1"');
    
    // 处理 using namespace
    formatted = formatted.replace(/using\s+namespace\s+([^;]+);/g, 'using namespace $1;');
    
    // 格式化函数定义
    formatted = formatted.replace(/(\w+)\s*\(([^)]*)\)\s*\{/g, '$1($2) {');
    
    // 处理缩进
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';
      
      // 减少缩进
      if (trimmed.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const result = indent.repeat(indentLevel) + trimmed;
      
      // 增加缩进
      if (trimmed.includes('{')) {
        indentLevel++;
      }
      
      return result;
    });
    
    formatted = formattedLines.join('\n');
    changes = lines.length;
    
    if (options.trimTrailingWhitespace) {
      formatted = formatted.replace(/[ \t]+$/gm, '');
    }
    
    if (options.insertFinalNewline && !formatted.endsWith('\n')) {
      formatted += '\n';
    }
    
    return {
      formatted,
      success: true,
      language: 'cpp',
      changes
    };
  } catch (error) {
    return {
      formatted: code,
      success: false,
      error: error instanceof Error ? error.message : '格式化失败',
      language: 'cpp',
      changes: 0
    };
  }
}

// Java 格式化
function formatJava(code: string, options: FormatOptions): FormatResult {
  try {
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    let formatted = code;
    let changes = 0;
    
    // 在操作符周围添加空格
    formatted = formatted.replace(/([=+\-*/<>!])([^=<>])/g, '$1 $2');
    formatted = formatted.replace(/([^=<>!])([=+\-*/<>])/g, '$1 $2');
    
    // 在逗号后添加空格
    formatted = formatted.replace(/,([^\s])/g, ', $1');
    
    // 在分号后添加换行
    formatted = formatted.replace(/;([^\s\n])/g, ';\n$1');
    
    // 在大括号前后添加适当的空格和换行
    formatted = formatted.replace(/\{([^\s\n])/g, ' {\n$1');
    formatted = formatted.replace(/([^\s\n])\}/g, '$1\n}');
    
    // 处理 import 语句
    formatted = formatted.replace(/import\s+([^;]+);/g, 'import $1;');
    
    // 格式化类和方法定义
    formatted = formatted.replace(/(public|private|protected)\s+(class|interface)\s+(\w+)/g, '$1 $2 $3');
    formatted = formatted.replace(/(public|private|protected)\s+(static\s+)?(\w+)\s+(\w+)\s*\(/g, '$1 $2$3 $4(');
    
    // 处理缩进
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';
      
      if (trimmed.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const result = indent.repeat(indentLevel) + trimmed;
      
      if (trimmed.includes('{')) {
        indentLevel++;
      }
      
      return result;
    });
    
    formatted = formattedLines.join('\n');
    changes = lines.length;
    
    if (options.trimTrailingWhitespace) {
      formatted = formatted.replace(/[ \t]+$/gm, '');
    }
    
    if (options.insertFinalNewline && !formatted.endsWith('\n')) {
      formatted += '\n';
    }
    
    return {
      formatted,
      success: true,
      language: 'java',
      changes
    };
  } catch (error) {
    return {
      formatted: code,
      success: false,
      error: error instanceof Error ? error.message : '格式化失败',
      language: 'java',
      changes: 0
    };
  }
}

// CSS 格式化
function formatCSS(code: string, options: FormatOptions): FormatResult {
  try {
    const indent = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize);
    let formatted = code;
    let changes = 0;
    
    // 在选择器后添加空格
    formatted = formatted.replace(/([^{\s])\{/g, '$1 {');
    
    // 在属性值后添加分号和换行
    formatted = formatted.replace(/([^;\s\n])\}/g, '$1;\n}');
    
    // 在冒号后添加空格
    formatted = formatted.replace(/:([^\s])/g, ': $1');
    
    // 在分号后添加换行
    formatted = formatted.replace(/;([^\s\n}])/g, ';\n$1');
    
    // 处理缩进
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';
      
      if (trimmed.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const result = indent.repeat(indentLevel) + trimmed;
      
      if (trimmed.includes('{')) {
        indentLevel++;
      }
      
      return result;
    });
    
    formatted = formattedLines.join('\n');
    changes = lines.length;
    
    if (options.trimTrailingWhitespace) {
      formatted = formatted.replace(/[ \t]+$/gm, '');
    }
    
    if (options.insertFinalNewline && !formatted.endsWith('\n')) {
      formatted += '\n';
    }
    
    return {
      formatted,
      success: true,
      language: 'css',
      changes
    };
  } catch (error) {
    return {
      formatted: code,
      success: false,
      error: error instanceof Error ? error.message : '格式化失败',
      language: 'css',
      changes: 0
    };
  }
}

// 主格式化函数
export function formatCode(code: string, language: LanguageType, style: FormatStyle = 'standard'): FormatResult {
  const options = FORMAT_STYLES[style].options;
  
  switch (language) {
    case 'javascript':
    case 'typescript':
    case 'react':
    case 'vue':
      return formatJavaScript(code, options);
    case 'python':
      return formatPython(code, options);
    case 'cpp':
    case 'csharp':
    case 'go':
    case 'rust':
    case 'php':
      return formatCpp(code, options);
    case 'java':
      return formatJava(code, options);
    case 'css':
    case 'scss':
      return formatCSS(code, options);
    case 'json':
      return formatJSON(code, options);
    case 'xml':
    case 'html':
      return formatXML(code, options);
    case 'sql':
      return formatSQL(code, options);
    default:
      return formatText(code, options);
  }
}

// 获取示例代码
export function getExampleCode(language: LanguageType): string {
  const examples: Record<LanguageType, string> = {
    javascript: `function fibonacci(n){if(n<=1)return n;return fibonacci(n-1)+fibonacci(n-2);}console.log(fibonacci(10));`,
    typescript: `interface User{name:string;age:number;}function greet(user:User):string{return \`Hello, \${user.name}!\`;}`,
    python: `def fibonacci(n):
if n<=1:return n
return fibonacci(n-1)+fibonacci(n-2)
print(fibonacci(10))`,
    java: `public class HelloWorld{public static void main(String[]args){System.out.println("Hello, World!");}}`,
    cpp: `#include<iostream>
using namespace std;int main(){cout<<"Hello, World!"<<endl;return 0;}`,
    csharp: `using System;class Program{static void Main(){Console.WriteLine("Hello, World!");}}`,
    go: `package main
import "fmt"
func main(){fmt.Println("Hello, World!")}`,
    rust: `fn main(){println!("Hello, World!");}`,
    php: `<?php function greet($name){return "Hello, ".$name."!";}echo greet("World");?>`,
    html: `<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello, World!</h1></body></html>`,
    css: `.container{display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f0f0f0;}`,
    scss: `$primary-color:#007bff;.button{background-color:$primary-color;&:hover{background-color:darken($primary-color,10%);}}`,
    vue: `<template><div class="hello"><h1>{{msg}}</h1></div></template><script>export default{name:'HelloWorld',props:{msg:String}}</script>`,
    react: `import React from 'react';function App(){return(<div className="App"><h1>Hello, World!</h1></div>);}export default App;`,
    json: `{"name":"John Doe","age":30,"city":"New York","hobbies":["reading","swimming","coding"]}`,
    xml: `<?xml version="1.0" encoding="UTF-8"?><root><person><name>John Doe</name><age>30</age></person></root>`,
    yaml: `name: John Doe
age: 30
address:
  street: 123 Main St
  city: New York
hobbies:
  - reading
  - swimming`,
    sql: `SELECT u.name,u.email,COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.active=1 GROUP BY u.id ORDER BY order_count DESC;`,
    markdown: `# Hello World
This is a **markdown** document with:
- Lists
- [Links](https://example.com)
- \`code\``,
    text: `This is a plain text document.
It can contain multiple lines
and various content.`
  };
  
  return examples[language] || '';
}