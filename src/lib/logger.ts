/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createLogger } from './i18n/logger.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 组件名称常量 (Component name constants)
export const COMPONENTS = {
  SERVER: 'MCP-SERVER',
  NODE_FETCH: 'NODE-FETCH',
  BROWSER_FETCH: 'BROWSER-FETCH',
  CLIENT: 'CLIENT',
  RESOURCES: 'MCP-RESOURCES',
  PROMPTS: 'MCP-PROMPTS',
  TOOLS: 'MCP-TOOLS'
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
 * 将日志写入文件 (Write log to file)
 * @param component 组件名称 (Component name)
 * @param message 日志消息 (Log message)
 */
function writeToLogFile(component: string, message: string): void {
  try {
    const timestamp = new Date().toISOString();
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
  
  // 输出到控制台 (Output to console)
  logger.debug(key, options, debug);
  
  // 写入日志文件 (Write to log file)
  const message = typeof key === 'string' ? key : JSON.stringify(key);
  writeToLogFile(component, message);
} 