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
  exampleUsage: "Example: node client.js fetch_html '{\"url\": \"https://example.com\", \"debug\": true}' http://127.0.0.1:7890",
  invalidJson: "Parameter parsing error, please provide a valid JSON string",
  usingCommandLineProxy: "Using command line specified proxy: {{proxy}}",
  invalidProxyFormat: "Invalid proxy format, should start with http:// or https://: {{proxy}}",
  usingEnvProxy: "Using proxy from environment variables: {{proxy}}",
  usingShellProxy: "Using proxy from shell: {{proxy}}",
  noShellProxy: "Unable to get proxy settings from shell",
  systemProxyDisabled: "System proxy detection disabled (useSystemProxy=false)",
  proxySet: "Proxy set: {{proxy}}, disabling system proxy auto-detection",
  requestFailed: "Request failed: {{error}}",
  fatalError: "Fatal error: {{error}}",
  startingServer: "Starting server: {{path}}",
  fetchingUrl: "Fetching URL: {{url}}",
  usingMode: "Using {{mode}} mode to fetch: {{url}}",
  fetchFailed: "Fetch failed: {{error}}",
  fetchSuccess: "Fetch successful: Content length {{length}} bytes",
  browserModeNeeded: "Browser mode needed, switching: {{url}}",
  retryingWithBrowser: "Retrying with browser mode: {{url}}",
  browserModeFetchFailed: "Browser mode fetch failed: {{error}}",
  browserModeFetchSuccess: "Browser mode fetch successful: Content length {{length}} bytes",
  serverClosed: "Server closed"
}; 