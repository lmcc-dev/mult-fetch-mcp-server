/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { ERROR_KEYS } from '../../keys/errors.js';

export default {
  // 通用错误日志 (Generic error logging)
  [ERROR_KEYS.occurred]: '发生错误: 类型={{type}}, 消息={{message}}',
  
  // 参数错误 (Parameter errors)
  [ERROR_KEYS.missingRequiredParam]: '缺少必需参数: {{param}}',
  [ERROR_KEYS.invalidUrl]: '无效的URL: {{url}}',
  
  // 请求错误 (Request errors)
  [ERROR_KEYS.requestTimeout]: '请求超时，已经过 {{timeout}}ms',
  [ERROR_KEYS.maxRedirectsExceeded]: '超过最大重定向次数 ({{max}})',
  [ERROR_KEYS.requestFailed]: '请求失败，状态码 {{status}}: {{message}}',
  [ERROR_KEYS.networkError]: '网络错误: {{message}}',
  
  // 响应错误 (Response errors)
  [ERROR_KEYS.invalidResponse]: '无效的响应: {{message}}',
  [ERROR_KEYS.invalidContentType]: '无效的内容类型: {{contentType}}',
  [ERROR_KEYS.invalidJson]: '无效的JSON响应',
  
  // 浏览器错误 (Browser errors)
  [ERROR_KEYS.browserInitFailed]: '浏览器初始化失败: {{message}}',
  [ERROR_KEYS.pageLoadFailed]: '页面加载失败: {{message}}',
  
  // 访问限制错误 (Access restriction errors)
  [ERROR_KEYS.forbidden]: '访问被禁止 (403)',
  [ERROR_KEYS.cloudflareProtection]: '检测到Cloudflare保护',
  [ERROR_KEYS.captchaRequired]: '需要验证码验证',
  
  // 连接错误 (Connection errors)
  [ERROR_KEYS.timeout]: '连接超时，已经过 {{timeout}}',
  [ERROR_KEYS.connectionProblem]: '检测到连接问题',
  
  // 通用错误 (Generic errors)
  [ERROR_KEYS.unknownError]: '未知错误: {{message}}',
  
  // 错误类型键 (Error type keys)
  [ERROR_KEYS.network_error]: '网络错误: {{error}}',
  [ERROR_KEYS.access_denied_error]: '访问被拒绝: {{error}}',
  [ERROR_KEYS.timeout_error]: '超时错误: {{error}}',
  [ERROR_KEYS.parse_error]: '解析错误: {{error}}',
  [ERROR_KEYS.validation_error]: '验证错误: {{error}}',
  [ERROR_KEYS.browser_error]: '浏览器错误: {{error}}',
  [ERROR_KEYS.unknown_error]: '未知错误: {{error}}'
}; 