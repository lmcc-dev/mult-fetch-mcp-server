/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createLogger } from '../i18n/logger.js';

// 创建服务器日志记录器 (Create server logger)
const logger = createLogger('MCP-SERVER');

/**
 * 日志函数 (Log function)
 * 输出调试信息到标准错误流 (Output debug information to standard error stream)
 * @param key 翻译键或消息 (Translation key or message)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @param options 翻译选项 (Translation options)
 */
export function log(key: string, debug: boolean = false, options?: any): void {
  // 只有在明确设置 debug 为 true 时才输出日志 (Only output logs when debug is explicitly set to true)
  if (!debug) {
    return;
  }
  
  // 所有日志消息都使用翻译键 (All log messages use translation keys)
  logger.debug(key, options, debug);
}