/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 服务器相关消息 (Server related messages)
export const server = {
  starting: "MCP server starting...",
  started: "MCP server started",
  stopping: "MCP server stopping...",
  stopped: "MCP server stopped",
  error: "MCP server error: {{error}}",
  receivedRequest: "Received request for tool: {{tool}}",
  processingRequest: "Processing request for tool: {{tool}}",
  requestCompleted: "Request completed for tool: {{tool}}",
  requestFailed: "Request failed for tool: {{tool}}, error: {{error}}",
  receivedInterruptSignal: "Received interrupt signal, shutting down server...",
  receivedTerminateSignal: "Received terminate signal, shutting down server...",
  uncaughtException: "Uncaught exception: {{error}}",
  debug: "{{message}}",
  
  // 新增的翻译键 (New translation keys)
  initializingBrowser: "Initializing browser instance...",
  closingBrowser: "Closing browser instance...",
  receivedToolRequest: "Received {{name}} request: {{url}}",
  processingToolRequestError: "Error processing {{name}} request: {{error}}",
  usingBrowserMode: "Using browser mode to fetch {{type}}: {{url}}",
  usingAutoDetectMode: "Using auto-detect mode to fetch {{type}}: {{url}}",
  switchingToBrowserMode: "Standard mode failed, switching to browser mode: {{url}}",
  fetchError: "Error fetching {{type}}: {{error}}"
}; 