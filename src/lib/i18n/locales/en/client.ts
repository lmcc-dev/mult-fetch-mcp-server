/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 客户端相关消息 (Client related messages)
export const client = {
  connecting: "Connecting to MCP server...",
  connected: "Connected to MCP server",
  disconnecting: "Disconnecting from MCP server...",
  disconnected: "Disconnected from MCP server",
  error: "Client error: {{error}}",
  callTool: "Calling tool: {{tool}}",
  callToolSuccess: "Tool call successful: {{tool}}",
  callToolError: "Tool call failed: {{tool}}, error: {{error}}",
  statusCodeDetected: "HTTP status code detected: {{code}}",
  usageInfo: "Usage: node client.js <method> <params_json> [proxy]",
  exampleUsage: "Example: node client.js fetch_html '{\"url\":\"https://example.com\",\"debug\":true}'",
  invalidJson: "Invalid JSON parameters",
  usingCommandLineProxy: "Using command line proxy: {{proxy}}",
  invalidProxyFormat: "Invalid proxy format: {{proxy}}",
  usingEnvProxy: "Using environment variable proxy: {{proxy}}",
  usingShellProxy: "Using shell proxy: {{proxy}}",
  noShellProxy: "No shell proxy found",
  systemProxyDisabled: "System proxy detection disabled",
  usingSystemProxy: "Using system proxy: {{proxy}}",
  noSystemProxy: "No system proxy found",
  requestFailed: "Request failed: {{error}}",
  fatalError: "Fatal error: {{error}}",
  startingServer: "Starting server at path: {{path}}",
  fetchingUrl: "Fetching URL: {{url}}",
  usingMode: "Using {{mode}} mode for URL: {{url}}",
  fetchFailed: "Fetch failed: {{error}}",
  fetchSuccess: "Fetch successful, content length: {{length}} bytes",
  browserModeNeeded: "Browser mode needed for URL: {{url}}",
  retryingWithBrowser: "Retrying with browser mode for URL: {{url}}",
  browserModeFetchFailed: "Browser mode fetch failed: {{error}}",
  browserModeFetchSuccess: "Browser mode fetch successful, content length: {{length}} bytes",
  serverClosed: "Server closed"
}; 