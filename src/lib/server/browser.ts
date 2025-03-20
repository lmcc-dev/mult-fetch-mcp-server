/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { BrowserInstance } from '../fetchers/browser/BrowserInstance.js';
import { log, COMPONENTS } from '../logger.js';
import { isAccessDeniedError, isNetworkError } from '../utils/errorDetection.js';

// 全局浏览器实例 (Global browser instance)
let browserInitialized = false;

/**
 * 初始化浏览器实例 (Initialize browser instance)
 * 确保浏览器实例已准备好用于网页获取 (Ensure browser instance is ready for webpage fetching)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @returns Promise对象 (Promise object)
 */
export async function initializeBrowser(debug: boolean = false): Promise<void> {
  if (!browserInitialized) {
    if (debug) {
      log('server.initializingBrowser', debug, {}, COMPONENTS.SERVER);
    }
    // BrowserFetcher 是静态类，不需要实例化 (BrowserFetcher is a static class, no need to instantiate)
    browserInitialized = true;
  }
}

/**
 * 关闭浏览器实例 (Close browser instance)
 * 释放浏览器资源 (Release browser resources)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @returns Promise对象 (Promise object)
 */
export async function closeBrowserInstance(debug: boolean = false): Promise<void> {
  if (browserInitialized) {
    if (debug) {
      log('server.closingBrowser', debug, {}, COMPONENTS.SERVER);
    }
    await BrowserInstance.closeBrowser(debug);
    browserInitialized = false;
  }
}

/**
 * 判断是否应该切换到浏览器模式 (Determine if should switch to browser mode)
 * 根据错误信息判断是否需要浏览器模式 (Based on error message to determine if browser mode is needed)
 * @param error 错误对象 (Error object)
 * @returns 是否应该切换到浏览器模式 (Whether should switch to browser mode)
 */
export function shouldSwitchToBrowser(error: any): boolean {
  // 检查错误是否表明需要浏览器模式 (Check if error indicates browser mode is needed)
  if (!error) return false;

  // 提取错误消息，无论错误对象的形式如何
  let errorMessage: string;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    } else if ('content' in error && Array.isArray(error.content) && error.content.length > 0) {
      // 处理 MCP 响应格式
      const content = error.content[0];
      errorMessage = content && typeof content === 'object' && 'text' in content ? String(content.text) : String(error);
    } else {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = String(error);
      }
    }
  } else {
    errorMessage = String(error);
  }

  // 检查是否包含 HTTP 403 Forbidden 错误，这是最常见的需要切换到浏览器模式的情况
  if (errorMessage.includes('403') ||
    errorMessage.toLowerCase().includes('forbidden')) {
    return true;
  }

  return isAccessDeniedError(errorMessage) ||
    isNetworkError(errorMessage) ||
    errorMessage.toLowerCase().includes('javascript required') ||
    errorMessage.toLowerCase().includes('und_err_connect_timeout') ||
    errorMessage.toLowerCase().includes('fetch failed');
}

/**
 * 检查是否应该使用浏览器模式 (Check if browser mode should be used)
 * 根据响应内容判断是否需要浏览器模式 (Determine if browser mode is needed based on response content)
 * @param response 响应对象 (Response object)
 * @param _url 请求URL (Request URL)
 * @returns 是否应该使用浏览器模式 (Whether to use browser mode)
 */
export function shouldUseBrowser(response: any, _url: string): boolean {
  // 检查响应是否表明需要浏览器模式 (Check if response indicates browser mode is needed)
  if (response.isError) {
    const errorText = response.content[0].text.toLowerCase();
    return errorText.includes('403') ||
      errorText.includes('forbidden') ||
      errorText.includes('access denied') ||
      errorText.includes('cloudflare') ||
      errorText.includes('captcha') ||
      errorText.includes('javascript required') ||
      errorText.includes('browser') ||
      errorText.includes('cookie');
  }

  return false;
}