import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';

interface JsonToolProps {}

// 计算JSON深度的辅助函数
const getJsonDepth = (obj: any): number => {
  if (typeof obj !== 'object' || obj === null) return 0;
  
  let maxDepth = 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const depth = getJsonDepth(obj[key]);
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  return maxDepth + 1;
};

const JsonTool: React.FC<JsonToolProps> = () => {
  const [inputJson, setInputJson] = useState('');
  const [isMinified, setIsMinified] = useState(false);

  // JSON解析和验证
  const jsonAnalysis = useMemo(() => {
    if (!inputJson.trim()) {
      return {
        isValid: null,
        error: null,
        formatted: '',
        minified: '',
        stats: null
      };
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      const minified = JSON.stringify(parsed);
      
      // 统计信息
      const stats = {
        size: inputJson.length,
        formattedSize: formatted.length,
        minifiedSize: minified.length,
        type: Array.isArray(parsed) ? 'Array' : typeof parsed,
        keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0,
        depth: getJsonDepth(parsed)
      };

      return {
        isValid: true,
        error: null,
        formatted,
        minified,
        stats,
        parsed
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        formatted: '',
        minified: '',
        stats: null
      };
    }
  }, [inputJson]);

  // 语法高亮
  const highlightJson = (jsonString: string): string => {
    if (!jsonString) return '';
    
    return jsonString
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      });
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 清空输入
  const clearInput = () => {
    setInputJson('');
  };

  // 示例JSON
  const loadExample = () => {
    const example = {
      "name": "张三",
      "age": 30,
      "isActive": true,
      "address": {
        "street": "北京市朝阳区",
        "zipCode": "100000"
      },
      "hobbies": ["阅读", "游泳", "编程"],
      "spouse": null,
      "metadata": {
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T15:45:30Z",
        "version": 1.2
      }
    };
    setInputJson(JSON.stringify(example, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <style>{`
        .json-key { color: #0066cc; font-weight: 600; }
        .json-string { color: #22c55e; }
        .json-number { color: #f59e0b; }
        .json-boolean { color: #8b5cf6; font-weight: 600; }
        .json-null { color: #6b7280; font-style: italic; }
        
        .dark .json-string { color: #4ade80; }
        .dark .json-number { color: #fbbf24; }
        .dark .json-boolean { color: #a78bfa; }
        .dark .json-null { color: #9ca3af; }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔍 JSON 解析工具
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            强大的JSON格式化、验证和美化工具，支持语法高亮、错误检测和统计分析
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入区域 */}
          <Card className="p-6" accent="blue">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                JSON 输入
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={loadExample}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  示例
                </button>
                <button
                  onClick={clearInput}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  清空
                </button>
              </div>
            </div>
            
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder="请输入或粘贴JSON数据..."
              className="w-full h-96 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* 输入状态 */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {jsonAnalysis.isValid === true && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    有效的 JSON
                  </span>
                )}
                {jsonAnalysis.isValid === false && (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    无效的 JSON
                  </span>
                )}
                {jsonAnalysis.isValid === null && (
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    等待输入
                  </span>
                )}
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {inputJson.length} 字符
              </span>
            </div>
          </Card>

          {/* 输出区域 */}
          <Card className="p-6" accent="green">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                格式化输出
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinified(false)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    !isMinified 
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  格式化
                </button>
                <button
                  onClick={() => setIsMinified(true)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    isMinified 
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  压缩
                </button>
                {(jsonAnalysis.formatted || jsonAnalysis.minified) && (
                  <button
                    onClick={() => copyToClipboard(isMinified ? jsonAnalysis.minified : jsonAnalysis.formatted)}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    复制
                  </button>
                )}
              </div>
            </div>
            
            <div className="h-96 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-auto">
              {jsonAnalysis.error ? (
                <div className="p-4 text-red-600 dark:text-red-400 font-mono text-sm">
                  <div className="font-semibold mb-2">❌ JSON 解析错误:</div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                    {jsonAnalysis.error}
                  </div>
                </div>
              ) : jsonAnalysis.formatted || jsonAnalysis.minified ? (
                <pre 
                  className="p-4 text-sm font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: highlightJson(isMinified ? jsonAnalysis.minified : jsonAnalysis.formatted)
                  }}
                />
              ) : (
                <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                  在左侧输入JSON数据以查看格式化结果
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 统计信息 */}
        {jsonAnalysis.stats && (
          <Card className="p-6 mt-6" accent="purple">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              📊 JSON 统计信息
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {jsonAnalysis.stats.type}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">数据类型</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {jsonAnalysis.stats.keys}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">属性数量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {jsonAnalysis.stats.depth}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">嵌套深度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {jsonAnalysis.stats.size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">原始大小</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {jsonAnalysis.stats.formattedSize}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">格式化大小</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {jsonAnalysis.stats.minifiedSize}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">压缩大小</div>
              </div>
            </div>
            
            {/* 压缩比例 */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">压缩效果:</div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">格式化增加:</span>
                  <span className="ml-1 text-green-600 dark:text-green-400">
                    +{((jsonAnalysis.stats.formattedSize - jsonAnalysis.stats.size) / jsonAnalysis.stats.size * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">压缩减少:</span>
                  <span className="ml-1 text-red-600 dark:text-red-400">
                    -{((jsonAnalysis.stats.size - jsonAnalysis.stats.minifiedSize) / jsonAnalysis.stats.size * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JsonTool;