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
  [SERVER_KEYS.started]: "MCP server started",
  [SERVER_KEYS.stopping]: "MCP server stopping...",
  [SERVER_KEYS.stopped]: "MCP server stopped",
  [SERVER_KEYS.error]: "MCP server error: {{error}}",
  [SERVER_KEYS.startupError]: "MCP server startup error: {{error}}",
  
  // 连接相关 (Connection related)
  [SERVER_KEYS.connecting]: "Connecting to MCP transport: {{transport}}",
  [SERVER_KEYS.connected]: "Connected to MCP transport",
  [SERVER_KEYS.connectionFailed]: "Failed to connect to MCP transport: {{error}}",
  [SERVER_KEYS.disconnected]: "Disconnected from MCP transport: {{transport}}",
  [SERVER_KEYS.connectionError]: "Error connecting to MCP transport: {{error}}",
  
  // 请求处理相关 (Request handling related)
  [SERVER_KEYS.requestReceived]: "Received request: {{id}}",
  [SERVER_KEYS.requestProcessed]: "Processed {{method}} request: {{path}} ({{time}}ms)",
  [SERVER_KEYS.requestError]: "Error processing {{name}} request: {{error}}",
  
  // 浏览器相关 (Browser related)
  [SERVER_KEYS.initializingBrowser]: "Initializing browser instance...",
  [SERVER_KEYS.browserInitialized]: "Browser instance initialized",
  [SERVER_KEYS.browserInitFailed]: "Browser initialization failed: {{error}}",
  [SERVER_KEYS.closingBrowser]: "Closing browser instance...",
  [SERVER_KEYS.browserClosed]: "Browser instance closed",
  
  // 工具相关 (Tool related)
  [SERVER_KEYS.tool.requestReceived]: "Received {{name}} tool request",
  [SERVER_KEYS.tool.requestProcessed]: "Processed {{name}} tool request ({{time}}ms)",
  [SERVER_KEYS.tool.requestError]: "Error processing {{name}} request: {{error}}",
  
  // 入口相关 (Entry related)
  [SERVER_KEYS.entry.loaded]: "MCP server entry point loaded",
  
  // 原有键 (Original keys)
  [SERVER_KEYS.receivedRequest]: "Received request: {{id}}",
  [SERVER_KEYS.processingRequest]: "Processing request: {{id}}",
  [SERVER_KEYS.requestCompleted]: "Request completed: {{id}}",
  [SERVER_KEYS.requestFailed]: "Request failed for tool: {{tool}}, error: {{error}}",
  [SERVER_KEYS.receivedInterruptSignal]: "Received interrupt signal, shutting down server...",
  [SERVER_KEYS.receivedTerminateSignal]: "Received terminate signal, shutting down server...",
  [SERVER_KEYS.uncaughtException]: "Uncaught exception: {{error}}",
  [SERVER_KEYS.debug]: "{{message}}",
  [SERVER_KEYS.listeningOn]: "Server listening on port {{port}}",
  
  // 新增的翻译键 (New translation keys)
  [SERVER_KEYS.receivedToolRequest]: "Received tool request: {{name}}",
  [SERVER_KEYS.processingToolRequestError]: "Error processing tool request: {{name}}, {{error}}",
  [SERVER_KEYS.usingBrowserMode]: "Using browser mode for: {{url}}",
  [SERVER_KEYS.usingAutoDetectMode]: "Using auto-detect mode for: {{url}}",
  [SERVER_KEYS.switchingToBrowserMode]: "Standard mode failed, switching to browser mode: {{url}}",
  [SERVER_KEYS.fetchError]: "Error fetching {{type}}: {{error}}",
  [SERVER_KEYS.serverError]: "MCP server error: {{error}}",
  [SERVER_KEYS.transportError]: "MCP transport error: {{error}}"
}; 