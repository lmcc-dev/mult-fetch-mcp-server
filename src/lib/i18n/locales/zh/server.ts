/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { SERVER_KEYS } from '../../keys/server.js';

// 服务器相关消息 (Server related messages)
export default {
  // 服务器状态相关 (Server status related)
  [SERVER_KEYS.starting]: "MCP 服务器启动中...",
  [SERVER_KEYS.started]: "MCP 服务器已启动",
  [SERVER_KEYS.stopping]: "MCP 服务器停止中...",
  [SERVER_KEYS.stopped]: "MCP 服务器已停止",
  [SERVER_KEYS.error]: "MCP 服务器错误: {{error}}",
  [SERVER_KEYS.startupError]: "MCP 服务器启动错误: {{error}}",
  
  // 连接相关 (Connection related)
  [SERVER_KEYS.connecting]: "正在连接到 MCP 传输: {{transport}}",
  [SERVER_KEYS.connected]: "已连接到 MCP 传输",
  [SERVER_KEYS.connectionFailed]: "连接到 MCP 传输失败: {{error}}",
  [SERVER_KEYS.disconnected]: "已断开与 MCP 传输的连接: {{transport}}",
  [SERVER_KEYS.connectionError]: "连接到 MCP 传输时出错: {{error}}",
  
  // 错误相关 (Error related)
  [SERVER_KEYS.serverError]: "MCP 服务器错误: {{error}}",
  [SERVER_KEYS.transportError]: "MCP 传输错误: {{error}}",
  
  // 请求处理相关 (Request handling related)
  [SERVER_KEYS.receivedRequest]: "收到请求: {{id}}",
  [SERVER_KEYS.processingRequest]: "处理请求: {{id}}",
  [SERVER_KEYS.requestCompleted]: "请求完成: {{id}}",
  [SERVER_KEYS.requestError]: "处理{{name}}请求时出错: {{error}}",
  [SERVER_KEYS.requestReceived]: "收到请求: {{id}}",
  [SERVER_KEYS.requestProcessed]: "处理了 {{method}} 请求: {{path}} ({{time}}ms)",
  [SERVER_KEYS.requestFailed]: "工具请求失败: {{tool}}, 错误: {{error}}",
  
  // 浏览器相关 (Browser related)
  [SERVER_KEYS.initializingBrowser]: "初始化浏览器实例...",
  [SERVER_KEYS.browserInitialized]: "浏览器实例已初始化",
  [SERVER_KEYS.browserInitFailed]: "浏览器初始化失败: {{error}}",
  [SERVER_KEYS.closingBrowser]: "关闭浏览器实例...",
  [SERVER_KEYS.browserClosed]: "浏览器实例已关闭",
  
  // 工具相关 (Tool related)
  [SERVER_KEYS.tool.requestReceived]: "收到 {{name}} 工具请求",
  [SERVER_KEYS.tool.requestProcessed]: "处理了 {{name}} 工具请求 ({{time}}ms)",
  [SERVER_KEYS.tool.requestError]: "处理 {{name}} 请求时出错: {{error}}",
  
  // 入口相关 (Entry related)
  [SERVER_KEYS.entry.loaded]: "MCP 服务器入口点已加载",
  
  // 系统相关 (System related)
  [SERVER_KEYS.receivedInterruptSignal]: "收到中断信号，正在关闭服务器...",
  [SERVER_KEYS.receivedTerminateSignal]: "收到终止信号，正在关闭服务器...",
  [SERVER_KEYS.uncaughtException]: "未捕获的异常: {{error}}",
  [SERVER_KEYS.debug]: "{{message}}",
  [SERVER_KEYS.listeningOn]: "服务器监听端口 {{port}}",
  
  // 其他键 (Other keys)
  [SERVER_KEYS.receivedToolRequest]: "收到工具请求: {{name}}",
  [SERVER_KEYS.processingToolRequestError]: "处理工具请求时出错: {{name}}, {{error}}",
  [SERVER_KEYS.usingBrowserMode]: "对 {{url}} 使用浏览器模式",
  [SERVER_KEYS.usingAutoDetectMode]: "对 {{url}} 使用自动检测模式",
  [SERVER_KEYS.switchingToBrowserMode]: "标准模式失败，切换到浏览器模式: {{url}}",
  [SERVER_KEYS.fetchError]: "获取 {{type}} 时出错: {{error}}"
}; 