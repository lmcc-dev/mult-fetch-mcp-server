/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { NODE_KEYS } from '../../keys/node.js';

// Node获取器相关消息 (Node fetcher related messages)
export default {
  // 延迟和代理相关 (Delay and proxy related)  [NODE_KEYS.usingProxy]: 'Using proxy: {{proxy}}',
  [NODE_KEYS.usingHttpsProxy]: 'Using HTTPS proxy',
  [NODE_KEYS.usingHttpProxy]: 'Using HTTP proxy',
  
  // 系统代理相关 (System proxy related)  
  // 请求相关 (Request related)
  [NODE_KEYS.usingUserAgent]: "Using User-Agent: {{userAgent}}",  [NODE_KEYS.fetchingUrl]: "Fetching URL: {{url}}",
  
  // 响应相关 (Response related)
  [NODE_KEYS.responseStatus]: "Response status: {{status}}",
  [NODE_KEYS.redirectingTo]: "Redirecting to: {{url}}",
  [NODE_KEYS.constructedFullRedirectUrl]: "Constructed full redirect URL: {{url}}",
  [NODE_KEYS.requestSuccess]: "Request successful",
  
  // 错误相关 (Error related)
  [NODE_KEYS.errorResponse]: "Error response: {{status}}",
  [NODE_KEYS.errorResponseBody]: "Error response body: {{body}}",
  [NODE_KEYS.errorReadingBody]: "Error reading response body: {{error}}",
  [NODE_KEYS.fetchError]: "Fetch error: {{error}}",
  [NODE_KEYS.requestAborted]: "Request aborted",
  [NODE_KEYS.networkError]: "Network error: {{code}}",
  [NODE_KEYS.tooManyRedirects]: "Too many redirects",
  
  // 内容类型相关 (Content type related)
  [NODE_KEYS.startingHtmlFetch]: 'Starting HTML fetch',
  [NODE_KEYS.readingText]: 'Reading text content',
  [NODE_KEYS.htmlContentLength]: 'HTML content length: {{length}} bytes',  [NODE_KEYS.startingJsonFetch]: 'Starting JSON fetch',
  [NODE_KEYS.parsingJson]: 'Parsing JSON',  [NODE_KEYS.startingTxtFetch]: 'Starting plain text fetch',
  [NODE_KEYS.textContentLength]: 'Text content length: {{length}} bytes',
  [NODE_KEYS.startingMarkdownFetch]: 'Starting Markdown fetch',
  [NODE_KEYS.creatingTurndown]: 'Creating Turndown service',
  [NODE_KEYS.convertingToMarkdown]: 'Converting HTML to Markdown',
  [NODE_KEYS.markdownContentLength]: 'Markdown content length: {{length}} bytes'
}; 