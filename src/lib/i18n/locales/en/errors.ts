/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { ERROR_KEYS } from '../../keys/errors.js';

export default {
  // 通用错误日志 (Generic error logging)
  [ERROR_KEYS.occurred]: 'Error occurred: type={{type}}, message={{message}}',
  
  // 参数错误 (Parameter errors)
  [ERROR_KEYS.missingRequiredParam]: 'Missing required parameter: {{param}}',
  [ERROR_KEYS.invalidUrl]: 'Invalid URL: {{url}}',
  
  // 请求错误 (Request errors)
  [ERROR_KEYS.requestTimeout]: 'Request timed out after {{timeout}}ms',
  [ERROR_KEYS.maxRedirectsExceeded]: 'Maximum redirects exceeded ({{max}})',
  [ERROR_KEYS.requestFailed]: 'Request failed with status {{status}}: {{message}}',
  [ERROR_KEYS.networkError]: 'Network error: {{message}}',
  
  // 响应错误 (Response errors)
  [ERROR_KEYS.invalidResponse]: 'Invalid response: {{message}}',
  [ERROR_KEYS.invalidContentType]: 'Invalid content type: {{contentType}}',
  [ERROR_KEYS.invalidJson]: 'Invalid JSON response',
  
  // 浏览器错误 (Browser errors)
  [ERROR_KEYS.browserInitFailed]: 'Browser initialization failed: {{message}}',
  [ERROR_KEYS.pageLoadFailed]: 'Page load failed: {{message}}',
  
  // 访问限制错误 (Access restriction errors)
  [ERROR_KEYS.forbidden]: 'Access forbidden (403)',
  [ERROR_KEYS.cloudflareProtection]: 'Cloudflare protection detected',
  [ERROR_KEYS.captchaRequired]: 'CAPTCHA verification required',
  
  // 连接错误 (Connection errors)
  [ERROR_KEYS.timeout]: 'Connection timed out after {{timeout}}',
  [ERROR_KEYS.connectionProblem]: 'Connection problem detected',
  
  // 通用错误 (Generic errors)
  [ERROR_KEYS.unknownError]: 'Unknown error: {{message}}'
}; 