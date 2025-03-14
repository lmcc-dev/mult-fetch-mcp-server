/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * 错误相关键 (Error related keys)
 */
export const ERROR_KEYS = (() => {
  const keyGen = createKeyGenerator('errors');
  const errorKeyGen = createKeyGenerator('error'); // 为 error 前缀创建键生成器
  
  return {
    // 通用错误日志 (Generic error logging)
    occurred: errorKeyGen('occurred'), // 添加 error.occurred 键
    
    // 参数错误 (Parameter errors)
    missingRequiredParam: keyGen('missingRequiredParam'),
    invalidUrl: keyGen('invalidUrl'),
    
    // 请求错误 (Request errors)
    requestTimeout: keyGen('requestTimeout'),
    maxRedirectsExceeded: keyGen('maxRedirectsExceeded'),
    requestFailed: keyGen('requestFailed'),
    networkError: keyGen('networkError'),
    
    // 响应错误 (Response errors)
    invalidResponse: keyGen('invalidResponse'),
    invalidContentType: keyGen('invalidContentType'),
    invalidJson: keyGen('invalidJson'),
    
    // 浏览器错误 (Browser errors)
    browserInitFailed: keyGen('browserInitFailed'),
    pageLoadFailed: keyGen('pageLoadFailed'),
    
    // 访问限制错误 (Access restriction errors)
    forbidden: keyGen('forbidden'),
    cloudflareProtection: keyGen('cloudflareProtection'),
    captchaRequired: keyGen('captchaRequired'),
    
    // 连接错误 (Connection errors)
    timeout: keyGen('timeout'),
    connectionProblem: keyGen('connectionProblem'),
    
    // 通用错误 (Generic errors)
    unknownError: keyGen('unknownError')
  } as const;
})(); 