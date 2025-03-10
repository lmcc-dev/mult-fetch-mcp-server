/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { t } from './index.js';

/**
 * 创建一个带前缀的日志记录器 (Create a logger with prefix)
 * @param prefix 日志前缀 (Log prefix)
 * @returns 日志记录器对象 (Logger object)
 */
export function createLogger(prefix: string) {
  return {
    /**
     * 输出信息日志 (Output info log)
     * @param key 翻译键 (Translation key)
     * @param params 翻译参数 (Translation parameters)
     * @param forceDebug 是否强制输出信息日志 (Whether to force output info logs)
     */
    info: (key: string, params?: Record<string, any>, forceDebug?: boolean) => {
      // 只有在环境变量DEBUG为true或forceDebug为true时才输出信息日志
      if (process.env.DEBUG === 'true' || forceDebug === true) {
        console.error(`[${prefix}] ${t(key, params)}`);
      }
    },
    
    /**
     * 输出错误日志 (Output error log)
     * @param key 翻译键 (Translation key)
     * @param params 翻译参数 (Translation parameters)
     */
    error: (key: string, params?: Record<string, any>) => {
      // 错误日志总是输出，不受debug控制
      console.error(`[${prefix}] ${t(key, params)}`);
    },
    
    /**
     * 输出警告日志 (Output warning log)
     * @param key 翻译键 (Translation key)
     * @param params 翻译参数 (Translation parameters)
     */
    warn: (key: string, params?: Record<string, any>) => {
      // 警告日志总是输出，不受debug控制
      console.error(`[${prefix}] ${t(key, params)}`);
    },
    
    /**
     * 输出调试日志 (Output debug log)
     * @param key 翻译键 (Translation key)
     * @param params 翻译参数 (Translation parameters)
     * @param forceDebug 是否强制输出调试日志 (Whether to force output debug logs)
     */
    debug: (key: string, params?: Record<string, any>, forceDebug?: boolean) => {
      // 只有在forceDebug=true时才输出调试日志
      if (forceDebug === true) {
        console.error(`[${prefix}] ${t(key, params)}`);
      }
    }
  };
} 