/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CLIENT_KEYS } from '../../keys/client.js';

// 客户端相关消息 (Client related messages)
export default {
  // 连接相关 (Connection related)
  [CLIENT_KEYS.connecting]: '正在连接 MCP 服务器...',
  [CLIENT_KEYS.connected]: '已连接到 MCP 服务器',
  [CLIENT_KEYS.connectionFailed]: '连接 MCP 服务器失败: {{error}}',
  [CLIENT_KEYS.disconnected]: '已断开与 MCP 服务器的连接',
  [CLIENT_KEYS.reconnecting]: '正在重新连接 MCP 服务器...',
  
  // 错误相关 (Error related)
  [CLIENT_KEYS.clientError]: '客户端错误: {{error}}',
  [CLIENT_KEYS.transportError]: '传输错误: {{error}}',
  [CLIENT_KEYS.requestError]: '请求错误: {{error}}',
  [CLIENT_KEYS.fetchError]: '获取错误: {{error}}',
  
  // 请求相关 (Request related)
  [CLIENT_KEYS.requestStarted]: '请求已开始: {{id}}',
  [CLIENT_KEYS.requestCompleted]: '请求已完成: {{id}}',
  [CLIENT_KEYS.requestCancelled]: '请求已取消: {{id}}',
  
  // 内容相关 (Content related)
  [CLIENT_KEYS.fetchingHtml]: '正在获取 HTML: {{url}}',
  [CLIENT_KEYS.fetchingJson]: '正在获取 JSON: {{url}}',
  [CLIENT_KEYS.fetchingText]: '正在获取文本: {{url}}',
  [CLIENT_KEYS.fetchingMarkdown]: '正在获取 Markdown: {{url}}',
  [CLIENT_KEYS.fetchSuccessful]: '获取成功',
  [CLIENT_KEYS.contentLength]: '内容长度: {{length}} 字节',
  
  // 调试相关 (Debug related)
  [CLIENT_KEYS.debugMode]: '调试模式: {{enabled}}',
  [CLIENT_KEYS.debugInfo]: '调试信息: {{info}}',
  
  // 原有键 (Original keys)
  [CLIENT_KEYS.error]: '错误: {{error}}',
  [CLIENT_KEYS.callTool]: '调用工具: {{name}}',
  [CLIENT_KEYS.callToolSuccess]: '工具调用成功: {{name}}',
  [CLIENT_KEYS.callToolError]: '工具调用错误: {{name}} - {{error}}',
  [CLIENT_KEYS.statusCodeDetected]: '检测到状态码: {{statusCode}}',
  [CLIENT_KEYS.usageInfo]: '使用信息: {{info}}',
  [CLIENT_KEYS.exampleUsage]: '使用示例: {{example}}',
  [CLIENT_KEYS.invalidJson]: '无效的 JSON: {{error}}',
  [CLIENT_KEYS.usingCommandLineProxy]: '使用命令行代理: {{proxy}}',
  [CLIENT_KEYS.invalidProxyFormat]: '无效的代理格式: {{proxy}}',
  [CLIENT_KEYS.usingEnvProxy]: '使用环境代理: {{proxy}}',
  [CLIENT_KEYS.usingShellProxy]: '使用 Shell 代理: {{proxy}}',
  [CLIENT_KEYS.noShellProxy]: '未找到 Shell 代理',
  [CLIENT_KEYS.systemProxyDisabled]: '系统代理已禁用',
  [CLIENT_KEYS.usingSystemProxy]: '使用系统代理: {{proxy}}',
  [CLIENT_KEYS.noSystemProxy]: '未找到系统代理',
  [CLIENT_KEYS.requestFailed]: '请求失败: {{error}}',
  [CLIENT_KEYS.fatalError]: '致命错误: {{error}}',
  [CLIENT_KEYS.startingServer]: '正在启动服务器...',
  [CLIENT_KEYS.fetchingUrl]: '正在获取 URL: {{url}}',
  [CLIENT_KEYS.usingMode]: '使用 {{mode}} 模式',
  [CLIENT_KEYS.fetchFailed]: '获取失败: {{error}}',
  [CLIENT_KEYS.fetchSuccess]: '获取成功',
  [CLIENT_KEYS.browserModeNeeded]: '需要浏览器模式: {{url}}',
  [CLIENT_KEYS.retryingWithBrowser]: '使用浏览器模式重试',
  [CLIENT_KEYS.browserModeFetchFailed]: '浏览器模式获取失败: {{error}}',
  [CLIENT_KEYS.browserModeFetchSuccess]: '浏览器模式获取成功',
  [CLIENT_KEYS.serverClosed]: '服务器已关闭',
  [CLIENT_KEYS.proxySet]: '代理已设置: {{proxy}}'
}; 