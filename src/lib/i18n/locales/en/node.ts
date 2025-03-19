/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { NODE_KEYS } from '../../keys/node.js';

// Node获取器相关消息 (Node fetcher related messages)
export default {
  // 延迟和代理相关 (Delay and proxy related)
  [NODE_KEYS.addingDelay]: "Adding delay: {{delay}}ms",
  [NODE_KEYS.noProxy]: "No proxy",
  [NODE_KEYS.usingProxy]: "Using proxy: {{proxy}}",
  [NODE_KEYS.usingHttpsProxy]: "Using HTTPS proxy",
  [NODE_KEYS.usingHttpProxy]: "Using HTTP proxy",
  
  // 系统代理相关 (System proxy related)
  [NODE_KEYS.checkingProxyEnv]: "Checking proxy environment variables",
  [NODE_KEYS.envVarValue]: "Environment variable {{name}}: {{value}}",
  [NODE_KEYS.foundSystemProxy]: "Found system proxy: {{proxy}}",
  [NODE_KEYS.checkingSystemEnvVars]: "Checking system environment variables",
  [NODE_KEYS.windowsEnvVars]: "Windows environment variables: {{vars}}",
  [NODE_KEYS.foundWindowsEnvProxy]: "Found Windows environment proxy: {{proxy}}",
  [NODE_KEYS.errorGettingWindowsEnvVars]: "Error getting Windows environment variables: {{error}}",
  [NODE_KEYS.unixEnvVars]: "Unix environment variables: {{vars}}",
  [NODE_KEYS.foundUnixEnvProxy]: "Found Unix environment proxy: {{proxy}}",
  [NODE_KEYS.errorGettingUnixEnvVars]: "Error getting Unix environment variables: {{error}}",
  [NODE_KEYS.noSystemProxyFound]: "No system proxy found",
  [NODE_KEYS.errorGettingSystemEnvVars]: "Error getting system environment variables: {{error}}",
  [NODE_KEYS.foundNoProxy]: "Found NO_PROXY: {{noProxy}}",
  
  // 请求相关 (Request related)
  [NODE_KEYS.usingUserAgent]: "Using User-Agent: {{userAgent}}",
  [NODE_KEYS.requestDetails]: "Request details: method={{method}}, URL={{url}}",
  [NODE_KEYS.requestOptions]: "Request options: {{options}}",
  [NODE_KEYS.startingFetch]: "Starting fetch: {{method}} {{url}}",
  [NODE_KEYS.fetchingUrl]: "Fetching URL: {{url}}",
  
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
  [NODE_KEYS.htmlContentLength]: 'HTML content length: {{length}} bytes',
  [NODE_KEYS.htmlFetchError]: 'Error fetching HTML: {{error}}',
  [NODE_KEYS.startingJsonFetch]: 'Starting JSON fetch',
  [NODE_KEYS.parsingJson]: 'Parsing JSON',
  [NODE_KEYS.jsonParsed]: 'JSON parsed successfully',
  [NODE_KEYS.jsonParseError]: 'JSON parse error: {{error}}',
  [NODE_KEYS.jsonFetchError]: 'Error fetching JSON: {{error}}',
  [NODE_KEYS.startingTxtFetch]: 'Starting plain text fetch',
  [NODE_KEYS.textContentLength]: 'Text content length: {{length}} bytes',
  [NODE_KEYS.startingMarkdownFetch]: 'Starting Markdown fetch',
  [NODE_KEYS.creatingTurndown]: 'Creating Turndown service',
  [NODE_KEYS.convertingToMarkdown]: 'Converting HTML to Markdown',
  [NODE_KEYS.markdownContentLength]: 'Markdown content length: {{length}} bytes',
  [NODE_KEYS.startingPlainTextFetch]: 'Starting plain text extraction',
  [NODE_KEYS.extractingText]: 'Extracting text from HTML content',
  [NODE_KEYS.textExtracted]: 'Text extracted, length: {{length}} bytes',
  
  // 内容分段相关 (Content splitting related)
  [NODE_KEYS.contentSplit]: 'Content split into {{chunks}} chunks',
  [NODE_KEYS.gettingChunk]: 'Getting chunk content, ID: {{chunkId}}, index: {{chunkIndex}}'
}; 