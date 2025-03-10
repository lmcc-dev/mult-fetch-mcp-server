/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 服务器相关消息 (Server related messages)
export const server = {
  starting: "MCP 服务器启动中...",
  started: "MCP 服务器已启动",
  stopping: "MCP 服务器停止中...",
  stopped: "MCP 服务器已停止",
  error: "MCP 服务器错误: {{error}}",
  receivedRequest: "收到工具请求: {{tool}}",
  processingRequest: "正在处理工具请求: {{tool}}",
  requestCompleted: "工具请求完成: {{tool}}",
  requestFailed: "工具请求失败: {{tool}}, 错误: {{error}}",
  receivedInterruptSignal: "收到中断信号，正在关闭服务器...",
  receivedTerminateSignal: "收到终止信号，正在关闭服务器...",
  uncaughtException: "未捕获的异常: {{error}}",
  debug: "{{message}}",
  
  // 新增的翻译键 (New translation keys)
  initializingBrowser: "初始化浏览器实例...",
  closingBrowser: "关闭浏览器实例...",
  receivedToolRequest: "收到{{name}}请求: {{url}}",
  processingToolRequestError: "处理{{name}}请求时出错: {{error}}",
  usingBrowserMode: "使用浏览器模式获取 {{type}}: {{url}}",
  usingAutoDetectMode: "使用自动检测模式获取 {{type}}: {{url}}",
  switchingToBrowserMode: "标准模式失败，切换到浏览器模式: {{url}}",
  fetchError: "获取 {{type}} 时出错: {{error}}"
}; 