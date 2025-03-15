/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CLIENT_KEYS } from '../../keys/client.js';

// 客户端相关消息 (Client related messages)
export default {
  // 连接相关 (Connection related)  
  // 错误相关 (Error related)  [CLIENT_KEYS.fetchError]: '获取错误: {{error}}',
  
  // 请求相关 (Request related)  
  // 内容相关 (Content related)  
  // 调试相关 (Debug related)  
  // 原有键 (Original keys)  [CLIENT_KEYS.statusCodeDetected]: '检测到状态码: {{code}}',
  [CLIENT_KEYS.usageInfo]: '使用信息: {{info}}',
  [CLIENT_KEYS.exampleUsage]: '使用示例: {{example}}',
  [CLIENT_KEYS.invalidJson]: '无效的 JSON: {{error}}',
  [CLIENT_KEYS.usingCommandLineProxy]: '使用命令行代理: {{proxy}}',
  [CLIENT_KEYS.invalidProxyFormat]: '无效的代理格式: {{proxy}}',  [CLIENT_KEYS.systemProxyDisabled]: '系统代理已禁用',
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