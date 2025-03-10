/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 客户端相关消息 (Client related messages)
export const client = {
  connecting: "正在连接 MCP 服务器...",
  connected: "已连接到 MCP 服务器",
  disconnecting: "正在断开与 MCP 服务器的连接...",
  disconnected: "已断开与 MCP 服务器的连接",
  error: "客户端错误: {{error}}",
  callTool: "调用工具: {{tool}}",
  callToolSuccess: "工具调用成功: {{tool}}",
  callToolError: "工具调用失败: {{tool}}, 错误: {{error}}",
  statusCodeDetected: "检测到HTTP状态码: {{code}}",
  usageInfo: "用法: node client.js <method> <params_json> [proxy]",
  exampleUsage: "示例: node client.js fetch_html '{\"url\": \"https://example.com\", \"debug\": true}' http://127.0.0.1:7890",
  invalidJson: "参数解析错误，请提供有效的JSON字符串",
  usingCommandLineProxy: "使用命令行指定的代理: {{proxy}}",
  invalidProxyFormat: "代理格式无效，应以 http:// 或 https:// 开头: {{proxy}}",
  usingEnvProxy: "使用环境变量中的代理: {{proxy}}",
  usingShellProxy: "使用 shell 中的代理: {{proxy}}",
  noShellProxy: "无法从 shell 获取代理设置",
  systemProxyDisabled: "系统代理检测已禁用 (useSystemProxy=false)",
  proxySet: "已设置代理: {{proxy}}, 禁用系统代理自动检测",
  requestFailed: "请求失败: {{error}}",
  fatalError: "致命错误: {{error}}",
  startingServer: "启动服务器: {{path}}",
  fetchingUrl: "正在获取 URL: {{url}}",
  usingMode: "使用 {{mode}} 模式获取: {{url}}",
  fetchFailed: "获取失败: {{error}}",
  fetchSuccess: "获取成功: 内容长度 {{length}} 字节",
  browserModeNeeded: "需要浏览器模式, 切换: {{url}}",
  retryingWithBrowser: "使用浏览器模式重试: {{url}}",
  browserModeFetchFailed: "浏览器模式获取失败: {{error}}",
  browserModeFetchSuccess: "浏览器模式获取成功: 内容长度 {{length}} 字节",
  serverClosed: "服务器已关闭"
}; 