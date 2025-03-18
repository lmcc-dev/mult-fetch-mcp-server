/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { BROWSER_KEYS } from '../../keys/browser.js';

// 浏览器相关消息 (Browser related messages)
export default {
  // 浏览器生命周期 (Browser lifecycle)
  [BROWSER_KEYS.closing]: "Closing browser...",
  [BROWSER_KEYS.closed]: "Browser closed",
  [BROWSER_KEYS.starting]: "Starting new browser instance",
  [BROWSER_KEYS.startingFailed]: "Browser startup failed: {{error}}",
  [BROWSER_KEYS.alreadyRunning]: "Browser is already starting, please wait...",
  
  // 页面操作 (Page operations)
  [BROWSER_KEYS.creatingPage]: "Creating new page",
  [BROWSER_KEYS.navigatingTo]: "Navigating to URL: {{url}}",
  [BROWSER_KEYS.waitingForSelector]: "Waiting for selector: {{selector}}",
  [BROWSER_KEYS.waitingForTimeout]: "Waiting for timeout: {{timeout}}ms",
  [BROWSER_KEYS.scrollingToBottom]: "Auto-scrolling page...",
  [BROWSER_KEYS.scrollError]: "Error while scrolling: {{error}}",
  [BROWSER_KEYS.gettingContent]: "Getting page content...",
  [BROWSER_KEYS.contentLength]: "Content length: {{length}} bytes",
  [BROWSER_KEYS.contentTruncated]: "Content truncated from {{originalLength}} to {{truncatedLength}} bytes",
  [BROWSER_KEYS.contentSplit]: "Content split into {{chunks}} chunks",
  [BROWSER_KEYS.startingHtmlFetch]: "Starting HTML fetch",
  
  // Cookie 相关 (Cookie related)
  [BROWSER_KEYS.savingCookies]: "Saving cookies for domain: {{domain}}",
  [BROWSER_KEYS.cookiesSaved]: "Cookies saved",
  [BROWSER_KEYS.loadingCookies]: "Loading cookies for domain: {{domain}}",
  [BROWSER_KEYS.cookiesLoaded]: "Cookies loaded",
  [BROWSER_KEYS.noCookiesFound]: "No cookies found for domain: {{domain}}",
  
  // 错误相关 (Error related)
  [BROWSER_KEYS.errorLoadingCookies]: "Error loading cookies: {{error}}",
  [BROWSER_KEYS.errorSavingCookies]: "Error saving cookies: {{error}}",
  [BROWSER_KEYS.errorNavigating]: "Error navigating to {{url}}: {{error}}",
  [BROWSER_KEYS.errorGettingContent]: "Error getting content: {{error}}",
  [BROWSER_KEYS.errorClosingBrowser]: "Error closing browser: {{error}}",
  [BROWSER_KEYS.errorCreatingPage]: "Error creating page: {{error}}",
  [BROWSER_KEYS.closingError]: "Error closing browser: {{error}}",
  
  // 额外的浏览器相关键 (Additional browser related keys)
  [BROWSER_KEYS.waiting]: "Waiting for {{ms}}ms",
  [BROWSER_KEYS.startupSuccess]: "Browser startup successful",
  [BROWSER_KEYS.navigating]: "Navigating to {{url}}",
  [BROWSER_KEYS.scrolling]: "Auto-scrolling page...",
  [BROWSER_KEYS.scrollCompleted]: "Auto-scroll completed",
  [BROWSER_KEYS.pageClosed]: "Page closed",
  [BROWSER_KEYS.fetchError]: "Error in browser fetch: {{error}}",
  [BROWSER_KEYS.highMemory]: "High memory usage detected: {{usage}}MB",
  [BROWSER_KEYS.closingDueToMemory]: "Closing browser due to high memory usage",
  [BROWSER_KEYS.forcingGC]: "Forcing garbage collection",
  [BROWSER_KEYS.memoryCheckError]: "Error checking memory: {{error}}",
  [BROWSER_KEYS.usingCookies]: "Using cookies for {{domain}}",
  [BROWSER_KEYS.usingProxy]: "Using proxy: {{proxy}}",
  
  // Cloudflare 相关 (Cloudflare related)
  [BROWSER_KEYS.checkingCloudflare]: "Checking for Cloudflare protection",
  [BROWSER_KEYS.cloudflareDetected]: "Cloudflare protection detected",
  [BROWSER_KEYS.simulatingHuman]: "Simulating human interaction to bypass Cloudflare",
  [BROWSER_KEYS.simulatingHumanError]: "Error simulating human interaction: {{error}}",
  [BROWSER_KEYS.stillOnCloudflare]: "Still on Cloudflare page after bypass attempt",
  [BROWSER_KEYS.bypassFailed]: "Cloudflare bypass failed",
  [BROWSER_KEYS.cloudflareError]: "Cloudflare error: {{error}}",
  [BROWSER_KEYS.continuingWithoutBypass]: "Continuing without Cloudflare bypass",
  [BROWSER_KEYS.unableToBypassCloudflare]: "Unable to bypass Cloudflare protection",
  [BROWSER_KEYS.cloudflareBypass]: "Attempting to bypass Cloudflare protection",
  [BROWSER_KEYS.cloudflareBypassSuccess]: "Cloudflare protection bypassed",
  [BROWSER_KEYS.cloudflareBypassFailed]: "Failed to bypass Cloudflare protection: {{error}}",
  [BROWSER_KEYS.cloudflareBypassNotNeeded]: "Continuing without Cloudflare bypass",
  
  // 获取和重试相关 (Fetch and retry related)
  [BROWSER_KEYS.fetchingWithRetry]: "Fetching with retry: attempt {{attempt}} of {{maxAttempts}}",
  [BROWSER_KEYS.memoryUsage]: "Current memory usage: {{usage}}MB",
  [BROWSER_KEYS.memoryTooHigh]: "Memory usage too high: {{heapUsed}}MB heap used, {{heapTotal}}MB heap total, {{rss}}MB RSS",
  [BROWSER_KEYS.contentTooLarge]: "Content too large: {{size}} bytes",
  [BROWSER_KEYS.failedToParseJSON]: "Failed to parse JSON: {{error}}",
  [BROWSER_KEYS.startingBrowserFetchForMarkdown]: "Starting browser fetch for Markdown",
  [BROWSER_KEYS.errorInBrowserFetchForMarkdown]: "Error in browser fetch for Markdown: {{error}}",
  [BROWSER_KEYS.fetchRequest]: "Fetch request: {{url}}",
  [BROWSER_KEYS.usingStoredCookies]: "Using stored cookies for domain: {{domain}}",
  [BROWSER_KEYS.closingInstance]: "Closing browser instance",
  [BROWSER_KEYS.fetchErrorWithAttempt]: "Fetch error (attempt {{attempt}}): {{error}}",
  [BROWSER_KEYS.retryingAfterDelay]: "Retrying after {{delay}}ms delay",
  
  // 浏览器启动相关 (Browser startup related)
  [BROWSER_KEYS.browserStartupSuccess]: "Browser startup successful",
  [BROWSER_KEYS.browserStartupFailed]: "Browser startup failed: {{error}}",
  [BROWSER_KEYS.usingCustomChromePath]: "Using custom Chrome path: {{path}}",
  [BROWSER_KEYS.browserDisconnected]: "Browser disconnected",
  [BROWSER_KEYS.waitingForBrowserStart]: "Waiting for browser to start",
  [BROWSER_KEYS.reusingExistingBrowser]: "Reusing existing browser instance",
  [BROWSER_KEYS.startingBrowser]: "Starting browser...",
  [BROWSER_KEYS.browserStarted]: "Browser started",
  [BROWSER_KEYS.browserStartError]: "Browser start error: {{error}}",
  
  // Fetch related
  [BROWSER_KEYS.htmlFetchError]: "Error fetching HTML: {{error}}",
  [BROWSER_KEYS.jsonFetchError]: "Error fetching JSON: {{error}}",
  [BROWSER_KEYS.txtFetchError]: "Error fetching text: {{error}}",
  [BROWSER_KEYS.markdownFetchError]: "Error fetching Markdown: {{error}}",
  [BROWSER_KEYS.creatingTurndown]: "Creating Turndown service",
  [BROWSER_KEYS.convertingToMarkdown]: "Converting HTML to Markdown",
  [BROWSER_KEYS.markdownContentLength]: "Markdown content length: {{length}} bytes",
  [BROWSER_KEYS.startingJsonFetch]: "Starting JSON fetch",
  [BROWSER_KEYS.startingTxtFetch]: "Starting text fetch",
  [BROWSER_KEYS.startingMarkdownFetch]: "Starting Markdown fetch",
  [BROWSER_KEYS.jsonParsed]: "JSON parsed successfully",
  [BROWSER_KEYS.jsonParseError]: "Error parsing JSON: {{error}}",
  
  // Proxy related
  [BROWSER_KEYS.proxyConnected]: "Proxy connected",
  [BROWSER_KEYS.proxyError]: "Proxy error: {{error}}",
  
  // Response related
  [BROWSER_KEYS.responseStatus]: "Response status: {{status}}",
  [BROWSER_KEYS.responseError]: "Response error: {{status}} {{statusText}}",
  [BROWSER_KEYS.responseSuccess]: "Response success",
  [BROWSER_KEYS.responseRedirect]: "Response redirect to: {{location}}",
  [BROWSER_KEYS.responseTimeout]: "Response timeout after {{timeout}}ms",
  
  // Error handling
  [BROWSER_KEYS.errorResponse]: "Error response: {{status}}",
  [BROWSER_KEYS.errorResponseBody]: "Error response body: {{body}}",
  [BROWSER_KEYS.accessDenied]: "Access denied: {{error}}",
  [BROWSER_KEYS.timeoutError]: "Timeout error: {{error}}",
  [BROWSER_KEYS.networkError]: "Network error: {{error}}",
  [BROWSER_KEYS.unknownError]: "Unknown error: {{error}}"
}; 