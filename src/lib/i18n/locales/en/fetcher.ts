/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { FETCHER_KEYS } from '../../keys/fetcher.js';

/**
 * 获取器相关的英文文本 (English texts related to fetcher)
 */
export default {
  // 内容大小相关 (Content size related)
  [FETCHER_KEYS.contentLength]: "Content length: {{length}} bytes",
  [FETCHER_KEYS.contentTooLarge]: "Content too large: {{size}} bytes, limit: {{limit}} bytes",
  [FETCHER_KEYS.contentTruncated]: "Content truncated from {{originalSize}} to {{truncatedSize}} bytes",

  // 分块处理相关 (Chunk processing related)
  [FETCHER_KEYS.chunkRetrievalFailed]: "Failed to retrieve chunk: {{error}}",
  [FETCHER_KEYS.gettingChunkBySize]: "Getting chunk by size, start: {{start}}, end: {{end}}",
  [FETCHER_KEYS.chunkNotFound]: "Chunk not found: {{chunkId}}",
  [FETCHER_KEYS.chunkInfo]: "Chunk info: Retrieved {{fetchedBytes}} bytes, total size {{totalBytes}} bytes, remaining {{remainingBytes}} bytes, completion {{percentage}}, is last chunk: {{isLastChunk}}",
  [FETCHER_KEYS.lastChunkDetected]: "Last chunk detected, fetched bytes: {{fetchedBytes}}, total bytes: {{totalBytes}}, remaining bytes: {{remainingBytes}}",

  // 获取类型相关 (Fetch type related)
  [FETCHER_KEYS.fetchingPlainText]: "Fetching plain text content",

  // 延迟相关 (Delay related)
  [FETCHER_KEYS.addingDelay]: "Adding delay: {{delay}}ms",
  [FETCHER_KEYS.delayCompleted]: "Delay completed",

  // 代理相关 (Proxy related)
  [FETCHER_KEYS.usingProxy]: "Using proxy: {{proxy}}",
  [FETCHER_KEYS.usingSpecifiedProxy]: "Using specified proxy: {{proxy}}",
  [FETCHER_KEYS.attemptingToUseSystemProxy]: "Attempting to use system proxy",
  [FETCHER_KEYS.notUsingProxy]: "Not using proxy",
  [FETCHER_KEYS.finalProxyUsed]: "Final proxy used: {{proxy}}",
  [FETCHER_KEYS.noProxy]: "No proxy",
  [FETCHER_KEYS.foundNoProxy]: "Found NO_PROXY setting: {{noProxy}}",
  [FETCHER_KEYS.usingHttpsProxy]: "Using HTTPS proxy",
  [FETCHER_KEYS.usingHttpProxy]: "Using HTTP proxy",
  [FETCHER_KEYS.systemProxyDisabled]: "System proxy disabled",

  // 请求相关 (Request related)
  [FETCHER_KEYS.fetchingUrl]: "Fetching URL: {{url}}",
  [FETCHER_KEYS.usingUserAgent]: "Using User-Agent: {{userAgent}}",
  [FETCHER_KEYS.requestOptions]: "Request options: {{options}}",
  [FETCHER_KEYS.startingFetch]: "Starting fetch: {{url}}",
  [FETCHER_KEYS.fetchCompleted]: "Fetch completed",

  // 响应相关 (Response related)
  [FETCHER_KEYS.responseStatus]: "Response status: {{status}}",
  [FETCHER_KEYS.redirectingTo]: "Redirecting to: {{url}}",
  [FETCHER_KEYS.constructedFullRedirectUrl]: "Constructed full redirect URL: {{url}}",
  [FETCHER_KEYS.requestSuccess]: "Request successful",

  // 错误相关 (Error related)
  [FETCHER_KEYS.errorResponse]: "Error response: {{status}}",
  [FETCHER_KEYS.errorResponseBody]: "Error response body: {{body}}",
  [FETCHER_KEYS.errorReadingBody]: "Error reading response body: {{error}}",
  [FETCHER_KEYS.fetchError]: "Fetch error: {{error}}",
  [FETCHER_KEYS.requestAborted]: "Request aborted",
  [FETCHER_KEYS.networkError]: "Network error: {{error}}",
  [FETCHER_KEYS.requestTimeout]: "Request timeout: {{timeout}}ms",
  [FETCHER_KEYS.fetchFailed]: "Fetch failed: {{error}}",
  [FETCHER_KEYS.tooManyRedirects]: "Too many redirects",

  // 内容类型相关 (Content type related)
  [FETCHER_KEYS.startingHtmlFetch]: "Starting HTML fetch",
  [FETCHER_KEYS.fetchingHtml]: "Fetching HTML",
  [FETCHER_KEYS.fetchingJson]: "Fetching JSON",
  [FETCHER_KEYS.fetchingTxt]: "Fetching text",
  [FETCHER_KEYS.fetchingMarkdown]: "Fetching Markdown",
  [FETCHER_KEYS.readingText]: "Reading text content",
  [FETCHER_KEYS.htmlContentLength]: "HTML content length: {{length}} bytes",
  [FETCHER_KEYS.startingJsonFetch]: "Starting JSON fetch",
  [FETCHER_KEYS.parsingJson]: "Parsing JSON",
  [FETCHER_KEYS.jsonParsed]: "JSON parsed successfully",
  [FETCHER_KEYS.jsonParseError]: "JSON parse error: {{error}}",
  [FETCHER_KEYS.startingTxtFetch]: "Starting text fetch",
  [FETCHER_KEYS.textContentLength]: "Text content length: {{length}} bytes",
  [FETCHER_KEYS.startingMarkdownFetch]: "Starting Markdown fetch",
  [FETCHER_KEYS.creatingTurndown]: "Creating Turndown service",
  [FETCHER_KEYS.convertingToMarkdown]: "Converting HTML to Markdown",
  [FETCHER_KEYS.markdownContentLength]: "Markdown content length: {{length}} bytes",

  // 系统代理相关 (System proxy related)
  [FETCHER_KEYS.checkingProxyEnv]: "Checking proxy environment variables",
  [FETCHER_KEYS.envVarValue]: "Environment variable {{name}}: {{value}}",
  [FETCHER_KEYS.foundSystemProxy]: "Found system proxy: {{proxy}}",
  [FETCHER_KEYS.systemCommandProxySettings]: "System command proxy settings: {{output}}",
  [FETCHER_KEYS.foundProxyFromCommand]: "Found proxy from command: {{proxy}}",
  [FETCHER_KEYS.errorGettingProxyFromCommand]: "Error getting proxy from command: {{error}}",
  [FETCHER_KEYS.checkingSystemEnvVars]: "Checking system environment variables",
  [FETCHER_KEYS.windowsEnvVars]: "Windows environment variables: {{vars}}",
  [FETCHER_KEYS.foundWindowsEnvProxy]: "Found Windows environment proxy: {{proxy}}",
  [FETCHER_KEYS.errorGettingWindowsEnvVars]: "Error getting Windows environment variables: {{error}}",
  [FETCHER_KEYS.unixEnvVars]: "Unix environment variables: {{vars}}",
  [FETCHER_KEYS.foundUnixEnvProxy]: "Found Unix environment proxy: {{proxy}}",
  [FETCHER_KEYS.errorGettingUnixEnvVars]: "Error getting Unix environment variables: {{error}}",
  [FETCHER_KEYS.errorGettingSystemEnvVars]: "Error getting system environment variables: {{error}}",
  [FETCHER_KEYS.noSystemProxyFound]: "No system proxy found",

  // 通用 (General)
  [FETCHER_KEYS.notSet]: "Not set",
  [FETCHER_KEYS.debug]: "Debug: {{message}}",
  [FETCHER_KEYS.none]: "None"
}; 