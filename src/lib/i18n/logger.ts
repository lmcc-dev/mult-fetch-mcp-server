/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { t, TranslateFunction } from './index.js';

/**
 * 日志级别枚举 (Log level enum)
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * 日志参数类型 (Log parameters type)
 */
export type LogParams = Record<string, any>;

/**
 * 日志记录器接口 (Logger interface)
 */
export interface Logger {
  debug: (key: string, params?: LogParams, forceLog?: boolean) => void;
  info: (key: string, params?: LogParams, forceLog?: boolean) => void;
  warn: (key: string, params?: LogParams) => void;
  error: (key: string, params?: LogParams) => void;
}

/**
 * 获取当前日志级别 (Get current log level)
 * @returns 日志级别 (Log level)
 */
function getCurrentLogLevel(): LogLevel {
  const debugEnv = process.env.DEBUG;
  
  if (debugEnv === 'none') return LogLevel.NONE;
  if (debugEnv === 'error') return LogLevel.ERROR;
  if (debugEnv === 'warn') return LogLevel.WARN;
  if (debugEnv === 'info') return LogLevel.INFO;
  if (debugEnv === 'debug' || debugEnv === 'true') return LogLevel.DEBUG;
  
  // 默认为 INFO 级别 (Default to INFO level)
  return LogLevel.INFO;
}

/**
 * 尝试翻译键名 (Try to translate a key)
 * @param key 翻译键 (Translation key)
 * @param params 翻译参数 (Translation parameters)
 * @returns 翻译后的文本 (Translated text)
 */
function translateKey(key: string, params?: LogParams): string {
  try {
    // 尝试翻译键名 (Try to translate the key)
    const translated = t(key, params);
    // 确保结果是字符串 (Ensure the result is a string)
    let translatedStr = typeof translated === 'string' ? translated : JSON.stringify(translated);
    
    // 检查翻译后的字符串是否仍然包含占位符，如果包含，手动进行插值替换
    // (Check if the translated string still contains placeholders, if so, manually perform interpolation)
    if (params && typeof translatedStr === 'string') {
      for (const key in params) {
        const placeholder = `{{${key}}}`;
        if (translatedStr.includes(placeholder)) {
          translatedStr = translatedStr.replace(new RegExp(placeholder, 'g'), String(params[key]));
        }
      }
    }
    
    return translatedStr;
  } catch (error) {
    // 如果翻译失败，返回原始键名 (If translation fails, return the original key)
    return key;
  }
}

/**
 * 创建一个带前缀的日志记录器 (Create a logger with prefix)
 * @param prefix 日志前缀 (Log prefix)
 * @returns 日志记录器对象 (Logger object)
 */
export function createLogger(prefix: string): Logger {
  return {
    /**
     * 输出调试日志 (Output debug log)
     * @param key 翻译键 (Translation key)
     * @param params 翻译参数 (Translation parameters)
     * @param forceLog 是否强制输出日志 (Whether to force output logs)
     */
    debug: (key: string, params?: LogParams, forceLog?: boolean): void => {
      // 只有在明确设置 forceLog 为 true 时才输出日志 (Only output logs when forceLog is explicitly set to true)
      if (forceLog) {
        const translatedMessage = translateKey(key, params);
        // 在 MCP 环境中，所有日志都应该使用 error 级别输出
        // (In MCP environment, all logs should be output at error level)
        console.error(`[${prefix}] ${translatedMessage}`);
      }
    },
    
    /**
     * 输出信息日志 (Output info log)
     * @param key 翻译键 (Translation key)
     * @param params 翻译参数 (Translation parameters)
     * @param forceLog 是否强制输出日志 (Whether to force output logs)
     */
    info: (key: string, params?: LogParams, forceLog?: boolean): void => {
      // 只有在明确设置 forceLog 为 true 时才输出日志 (Only output logs when forceLog is explicitly set to true)
      if (forceLog) {
        const translatedMessage = translateKey(key, params);
        // 在 MCP 环境中，所有日志都应该使用 error 级别输出
        // (In MCP environment, all logs should be output at error level)
        console.error(`[${prefix}] ${translatedMessage}`);
      }
    },
    
    /**
     * 输出警告日志 (Output warning log)
     * @param key 翻译键 (Translation key)
     * @param params 翻译参数 (Translation parameters)
     */
    warn: (key: string, params?: LogParams): void => {
      // 警告日志总是输出 (Warning logs are always output)
      const translatedMessage = translateKey(key, params);
      // 在 MCP 环境中，所有日志都应该使用 error 级别输出
      // (In MCP environment, all logs should be output at error level)
      console.error(`[${prefix}] ${translatedMessage}`);
    },
    
    /**
     * 输出错误日志 (Output error log)
     * @param key 翻译键 (Translation key)
     * @param params 翻译参数 (Translation parameters)
     */
    error: (key: string, params?: LogParams): void => {
      // 错误日志总是输出 (Error logs are always output)
      const translatedMessage = translateKey(key, params);
      // 在 MCP 环境中，所有日志都应该使用 error 级别输出
      // (In MCP environment, all logs should be output at error level)
      console.error(`[${prefix}] ${translatedMessage}`);
    }
  };
} 