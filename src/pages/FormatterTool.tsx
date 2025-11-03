import React, { useState, useEffect, useCallback } from 'react';
import { 
  formatCode, 
  detectLanguage, 
  getExampleCode,
  SUPPORTED_LANGUAGES, 
  FORMAT_STYLES,
  type LanguageType, 
  type FormatStyle,
  type FormatResult 
} from '../utils/formatter';

const FormatterTool: React.FC = () => {
  // 状态管理
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>('javascript');
  const [selectedStyle, setSelectedStyle] = useState<FormatStyle>('standard');
  const [autoDetect, setAutoDetect] = useState(true);
  const [formatResult, setFormatResult] = useState<FormatResult | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatTime, setFormatTime] = useState(0);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, []);

  // 格式化代码
  const handleFormat = useCallback((code: string, language: LanguageType, style: FormatStyle) => {
    if (!code.trim()) {
      setOutputCode('');
      setFormatResult(null);
      return;
    }

    setIsFormatting(true);
    const startTime = performance.now();

    try {
      const result = formatCode(code, language, style);
      const endTime = performance.now();
      
      setOutputCode(result.formatted);
      setFormatResult(result);
      setFormatTime(Math.round(endTime - startTime));
    } catch (error) {
      setFormatResult({
        formatted: code,
        success: false,
        error: error instanceof Error ? error.message : '格式化失败',
        language,
        changes: 0
      });
    } finally {
      setIsFormatting(false);
    }
  }, []);

  // 自动检测语言
  const handleAutoDetect = useCallback((code: string) => {
    if (autoDetect && code.trim()) {
      const detectedLanguage = detectLanguage(code);
      if (detectedLanguage !== selectedLanguage) {
        setSelectedLanguage(detectedLanguage);
      }
    }
  }, [autoDetect, selectedLanguage]);

  // 监听输入变化
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputCode.trim()) {
        handleAutoDetect(inputCode);
        handleFormat(inputCode, selectedLanguage, selectedStyle);
      } else {
        setOutputCode('');
        setFormatResult(null);
      }
    }, 300); // 防抖

    return () => clearTimeout(timeoutId);
  }, [inputCode, selectedLanguage, selectedStyle, handleFormat, handleAutoDetect]);

  // 加载示例代码
  const loadExample = useCallback(() => {
    const example = getExampleCode(selectedLanguage);
    setInputCode(example);
  }, [selectedLanguage]);

  // 清空内容
  const clearAll = useCallback(() => {
    setInputCode('');
    setOutputCode('');
    setFormatResult(null);
  }, []);

  // 获取统计信息
  const getStats = () => {
    return {
      inputChars: inputCode.length,
      outputChars: outputCode.length,
      inputLines: inputCode.split('\n').length,
      outputLines: outputCode.split('\n').length,
      changes: formatResult?.changes || 0,
      formatTime
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎨 通用代码格式化工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持多种编程语言和格式化方案，让你的代码更加规范和美观
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 语言选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                编程语言
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as LanguageType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                  <option key={key} value={key}>
                    {lang.icon} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 格式化方案 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                格式化方案
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as FormatStyle)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(FORMAT_STYLES).map(([key, style]) => (
                  <option key={key} value={key}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 自动检测 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                语言检测
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  自动检测语言
                </span>
              </label>
            </div>

            {/* 操作按钮 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                操作
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={loadExample}
                  className="px-3 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  示例
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 py-2 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  清空
                </button>
              </div>
            </div>
          </div>

          {/* 格式化方案描述 */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{FORMAT_STYLES[selectedStyle].name}:</strong> {FORMAT_STYLES[selectedStyle].description}
            </p>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 输入区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                输入代码
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{stats.inputChars} 字符</span>
                <span>•</span>
                <span>{stats.inputLines} 行</span>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="在此输入你的代码..."
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 输出区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                格式化结果
              </h2>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>{stats.outputChars} 字符</span>
                  <span className="mx-1">•</span>
                  <span>{stats.outputLines} 行</span>
                </div>
                <button
                  onClick={() => copyToClipboard(outputCode)}
                  disabled={!outputCode}
                  className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
                >
                  复制结果
                </button>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={outputCode}
                readOnly
                placeholder="格式化后的代码将显示在这里..."
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {SUPPORTED_LANGUAGES[selectedLanguage].icon}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">当前语言</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {SUPPORTED_LANGUAGES[selectedLanguage].name}
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatResult?.success ? '✅' : formatResult ? '❌' : '⏳'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">格式化状态</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isFormatting ? '处理中...' : formatResult?.success ? '成功' : formatResult ? '失败' : '待处理'}
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.changes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">格式化变更</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {stats.changes} 处修改
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatTime}ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">处理时间</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatTime} 毫秒
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.inputChars}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">输入字符</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {stats.inputChars} 字符
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {stats.outputChars}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">输出字符</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {stats.outputChars} 字符
              </div>
            </div>
          </div>
          
          {/* 错误信息 */}
          {formatResult && !formatResult.success && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  格式化失败
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {formatResult.error}
              </p>
            </div>
          )}
        </div>

        {/* 支持的语言列表 */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            支持的编程语言
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
              <div
                key={key}
                className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                  selectedLanguage === key
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setSelectedLanguage(key as LanguageType)}
              >
                <span className="text-lg">{lang.icon}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatterTool;