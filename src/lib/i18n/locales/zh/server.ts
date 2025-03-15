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
  [SERVER_KEYS.started]: "MCP 服务器已启动",  [SERVER_KEYS.startupError]: "MCP 服务器启动错误: {{error}}",
  
  // 连接相关 (Connection related)  [SERVER_KEYS.connectionError]: "连接到 MCP 传输时出错: {{error}}",
  
  // 错误相关 (Error related)  
  // 请求处理相关 (Request handling related)  
  // 浏览器相关 (Browser related)  [SERVER_KEYS.closingBrowser]: "关闭浏览器实例...",  
  // 工具相关 (Tool related)  
  // 入口相关 (Entry related)
  [SERVER_KEYS.entry.loaded]: "MCP 服务器入口点已加载",
  
  // 系统相关 (System related)
  [SERVER_KEYS.receivedInterruptSignal]: "收到中断信号，正在关闭服务器...",
  [SERVER_KEYS.receivedTerminateSignal]: "收到终止信号，正在关闭服务器...",  
  // 其他键 (Other keys)  [SERVER_KEYS.usingBrowserMode]: "对 {{url}} 使用浏览器模式",
  [SERVER_KEYS.usingAutoDetectMode]: "对 {{url}} 使用自动检测模式",
  [SERVER_KEYS.switchingToBrowserMode]: "标准模式失败，切换到浏览器模式: {{url}}",
  [SERVER_KEYS.fetchError]: "获取 {{type}} 时出错: {{error}}"
}; 