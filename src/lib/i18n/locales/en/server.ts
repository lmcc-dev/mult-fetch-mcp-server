/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { SERVER_KEYS } from '../../keys/server.js';

// 服务器相关消息 (Server related messages)
export default {
  // 服务器状态相关 (Server status related)
  [SERVER_KEYS.starting]: "MCP server starting...",
  [SERVER_KEYS.started]: "MCP server started",  [SERVER_KEYS.startupError]: "MCP server startup error: {{error}}",
  
  // 连接相关 (Connection related)  [SERVER_KEYS.connectionError]: "Error connecting to MCP transport: {{error}}",
  
  // 请求处理相关 (Request handling related)  
  // 浏览器相关 (Browser related)  [SERVER_KEYS.closingBrowser]: "Closing browser instance...",  
  // 工具相关 (Tool related)  
  // 入口相关 (Entry related)
  [SERVER_KEYS.entry.loaded]: "MCP server entry point loaded",
  
  // 原有键 (Original keys)  [SERVER_KEYS.receivedInterruptSignal]: "Received interrupt signal, shutting down server...",
  [SERVER_KEYS.receivedTerminateSignal]: "Received terminate signal, shutting down server...",  
  // 新增的翻译键 (New translation keys)  [SERVER_KEYS.usingBrowserMode]: "Using browser mode for: {{url}}",
  [SERVER_KEYS.usingAutoDetectMode]: "Using auto-detect mode for: {{url}}",
  [SERVER_KEYS.switchingToBrowserMode]: "Standard mode failed, switching to browser mode: {{url}}",}; 