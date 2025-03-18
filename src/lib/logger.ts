/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createLogger } from './i18n/logger.js';
import { t } from './i18n/index.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// 导入所有翻译文件 (Import all translation files)
import serverZh from './i18n/locales/zh/server.js';
import clientZh from './i18n/locales/zh/client.js';
import toolsZh from './i18n/locales/zh/tools.js';
import browserZh from './i18n/locales/zh/browser.js';
import nodeZh from './i18n/locales/zh/node.js';
import fetcherZh from './i18n/locales/zh/fetcher.js';
import factoryZh from './i18n/locales/zh/factory.js';
import errorsZh from './i18n/locales/zh/errors.js';
import resourcesZh from './i18n/locales/zh/resources.js';
import promptsZh from './i18n/locales/zh/prompts.js';
import { contentSizeZh } from './i18n/locales/zh/contentSize.js';
import { chunkManagerZh } from './i18n/locales/zh/chunkManager.js';
import { processorZh } from './i18n/locales/zh/processor.js';

// 创建翻译映射 (Create translation mapping)
const translationMap: Record<string, any> = {
  server: serverZh,
  client: clientZh,
  tools: toolsZh,
  browser: browserZh,
  node: nodeZh,
  fetcher: fetcherZh,
  factory: factoryZh,
  errors: errorsZh,
  resources: resourcesZh,
  prompts: promptsZh,
  contentSize: contentSizeZh,
  chunkManager: chunkManagerZh,
  processor: processorZh
};

// 组件名称常量 (Component name constants)
export const COMPONENTS = {
  SERVER: 'MCP-SERVER',
  NODE_FETCH: 'NODE-FETCH',
  BROWSER_FETCH: 'BROWSER-FETCH',
  CLIENT: 'CLIENT',
  RESOURCES: 'MCP-RESOURCES',
  PROMPTS: 'MCP-PROMPTS',
  TOOLS: 'MCP-TOOLS',
  FETCHER_FACTORY: 'FETCHER-FACTORY',
  CONTENT_SIZE: 'CONTENT-SIZE',
  CHUNK_MANAGER: 'CHUNK-MANAGER',
  PROCESSOR: 'CONTENT-PROCESSOR'
};

// 日志文件路径 (Log file path)
const LOG_DIR = path.join(os.homedir(), '.mult-fetch-mcp-server');
const LOG_FILE = path.join(LOG_DIR, 'debug.log');

// 确保日志目录存在 (Ensure log directory exists)
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.error(`[${COMPONENTS.SERVER}] Failed to create log directory: ${error}`);
}

// 组件日志记录器缓存 (Component logger cache)
const loggerCache: Record<string, any> = {};

// 翻译缓存，避免重复翻译相同的键名 (Translation cache to avoid repeated translation of the same key)
const translationCache: Record<string, string> = {};

/**
 * 获取指定组件的日志记录器 (Get logger for specified component)
 * @param component 组件名称 (Component name)
 * @returns 日志记录器 (Logger)
 */
function getLogger(component: string) {
  if (!loggerCache[component]) {
    loggerCache[component] = createLogger(component);
  }
  return loggerCache[component];
}

/**
 * 获取格式化的本地时间 (Get formatted local time)
 * @returns 格式化的本地时间字符串 (Formatted local time string)
 */
function getFormattedLocalTime(): string {
  const now = new Date();
  
  // 获取本地时间的年、月、日、时、分、秒、毫秒
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  // 格式化为 YYYY-MM-DD HH:MM:SS.mmm
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * 将日志写入文件 (Write log to file)
 * @param component 组件名称 (Component name)
 * @param message 日志消息 (Log message)
 */
function writeToLogFile(component: string, message: string): void {
  try {
    const timestamp = getFormattedLocalTime();
    const logEntry = `${timestamp} [${component}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.error(`[${COMPONENTS.SERVER}] Failed to write to log file: ${error}`);
  }
}

/**
 * 清除日志文件 (Clear log file)
 */
export function clearLogFile(): void {
  try {
    fs.writeFileSync(LOG_FILE, '');
  } catch (error) {
    console.error(`[${COMPONENTS.SERVER}] Failed to clear log file: ${error}`);
  }
}

/**
 * 获取日志文件路径 (Get log file path)
 * @returns 日志文件的完整路径 (Full path to the log file)
 */
export function getLogFilePath(): string {
  return LOG_FILE;
}

/**
 * 尝试翻译键名 (Try to translate a key)
 * @param key 翻译键 (Translation key)
 * @param options 翻译选项 (Translation options)
 * @param component 组件名称 (Component name)
 * @returns 翻译后的文本 (Translated text)
 */
function translateKey(key: string, options?: any, component: string = COMPONENTS.SERVER): string {
  // 如果没有选项，尝试使用缓存 (If no options, try to use cache)
  if (!options || Object.keys(options).length === 0) {
    // 生成缓存键 (Generate cache key)
    const cacheKey = `${key}`;
    
    // 如果缓存中存在该键，直接返回缓存的翻译 (If the key exists in cache, return the cached translation)
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    try {
      // 尝试翻译键名 (Try to translate the key)
      const translated = t(key, options);
      
      // 确保结果是字符串 (Ensure the result is a string)
      const translatedStr = typeof translated === 'string' ? translated : JSON.stringify(translated);
      
      // 如果翻译结果与键名相同，可能是嵌套键未被正确处理 (If translation result is the same as key, nested key may not be handled correctly)
      if (translatedStr === key) {
        // 尝试手动处理嵌套键 (Try to manually handle nested keys)
        const parts = key.split('.');
        if (parts.length > 1) {
          const namespace = parts[0];
          const subKey = parts.slice(1).join('.');
          
          // 根据命名空间获取对应的翻译对象 (Get translation object based on namespace)
          const translation = translationMap[namespace];
          
          // 如果找到了翻译对象，尝试获取子键的翻译 (If translation object is found, try to get translation of subkey)
          if (translation && translation[subKey]) {
            // 将翻译结果存入缓存 (Store the translation result in cache)
            translationCache[cacheKey] = translation[subKey];
            return translation[subKey];
          }
        }
      }
      
      // 将翻译结果存入缓存 (Store the translation result in cache)
      translationCache[cacheKey] = translatedStr;
      
      return translatedStr;
    } catch (error) {
      // 如果翻译失败，返回原始键名 (If translation fails, return the original key)
      return key;
    }
  } else {
    // 如果有选项，不使用缓存 (If there are options, don't use cache)
    try {
      // 尝试翻译键名 (Try to translate the key)
      const translated = t(key, options);
      
      // 确保结果是字符串 (Ensure the result is a string)
      let translatedStr = typeof translated === 'string' ? translated : JSON.stringify(translated);
      
      // 检查翻译后的字符串是否仍然包含占位符，如果包含，手动进行插值替换
      // (Check if the translated string still contains placeholders, if so, manually perform interpolation)
      if (options && typeof translatedStr === 'string') {
        for (const key in options) {
          const placeholder = `{{${key}}}`;
          if (translatedStr.includes(placeholder)) {
            translatedStr = translatedStr.replace(new RegExp(placeholder, 'g'), String(options[key]));
          }
        }
      }
      
      // 如果翻译结果与键名相同，可能是嵌套键未被正确处理 (If translation result is the same as key, nested key may not be handled correctly)
      if (translatedStr === key) {
        // 尝试手动处理嵌套键 (Try to manually handle nested keys)
        const parts = key.split('.');
        if (parts.length > 1) {
          const namespace = parts[0];
          const subKey = parts.slice(1).join('.');
          
          // 根据命名空间获取对应的翻译对象 (Get translation object based on namespace)
          const translation = translationMap[namespace];
          
          // 如果找到了翻译对象，尝试获取子键的翻译 (If translation object is found, try to get translation of subkey)
          if (translation && translation[subKey]) {
            // 如果有选项，进行插值 (If there are options, do interpolation)
            let result = translation[subKey];
            for (const key in options) {
              const placeholder = `{{${key}}}`;
              if (result.includes(placeholder)) {
                result = result.replace(new RegExp(placeholder, 'g'), String(options[key]));
              }
            }
            return result;
          }
        }
      }
      
      return translatedStr;
    } catch (error) {
      // 如果翻译失败，返回原始键名 (If translation fails, return the original key)
      return key;
    }
  }
}

/**
 * 统一日志函数 (Unified log function)
 * 输出调试信息到标准错误流和日志文件 (Output debug information to standard error stream and log file)
 * @param key 翻译键或消息 (Translation key or message)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @param options 翻译选项 (Translation options)
 * @param component 组件名称 (Component name)
 */
export function log(key: string, debug: boolean = false, options?: any, component: string = COMPONENTS.SERVER): void {
  // 只有在明确设置 debug 为 true 时才输出日志 (Only output logs when debug is explicitly set to true)
  if (!debug) {
    return;
  }
  
  // 获取组件的日志记录器 (Get logger for component)
  const logger = getLogger(component);
  
  // 翻译键名 (Translate the key)
  const translatedMessage = translateKey(key, options, component);
  
  // 在 MCP 环境中，所有日志都应该使用 error 级别输出 (In MCP environment, all logs should be output at error level)
  console.error(`[${component}] ${translatedMessage}`);
  
  // 写入日志文件 (Write to log file)
  writeToLogFile(component, translatedMessage);
}

/**
 * 清除翻译缓存 (Clear translation cache)
 */
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
} 