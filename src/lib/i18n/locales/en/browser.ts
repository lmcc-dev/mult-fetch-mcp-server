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
  [BROWSER_KEYS.alreadyRunning]: "Browser is starting, waiting...",
  
  // 页面操作 (Page operations)
  [BROWSER_KEYS.creatingPage]: "Creating new page",
  [BROWSER_KEYS.navigatingTo]: "Navigating to URL: {{url}}",
  [BROWSER_KEYS.waitingForSelector]: "Waiting for selector: {{selector}}",
  [BROWSER_KEYS.waitingForTimeout]: "Waiting for timeout: {{timeout}}ms",
  [BROWSER_KEYS.scrollingToBottom]: "Auto-scrolling page...",
  [BROWSER_KEYS.gettingContent]: "Getting page content...",
  [BROWSER_KEYS.contentLength]: "Content length: {{length}} bytes",
  
  // Cookie 相关 (Cookie related)
  [BROWSER_KEYS.savingCookies]: "Saving cookies for domain: {{domain}}",
  [BROWSER_KEYS.cookiesSaved]: "Cookies saved successfully",
  [BROWSER_KEYS.loadingCookies]: "Loading cookies for domain: {{domain}}",
  [BROWSER_KEYS.cookiesLoaded]: "Cookies loaded successfully",
  [BROWSER_KEYS.noCookiesFound]: "No cookies found for domain: {{domain}}",
  
  // 错误相关 (Error related)
  [BROWSER_KEYS.errorLoadingCookies]: "Error loading cookies: {{error}}",
  [BROWSER_KEYS.errorSavingCookies]: "Error saving cookies: {{error}}",
  [BROWSER_KEYS.errorNavigating]: "Error navigating to URL: {{error}}",
  [BROWSER_KEYS.errorGettingContent]: "Error getting content: {{error}}",
  [BROWSER_KEYS.errorClosingBrowser]: "Error closing browser: {{error}}",
  [BROWSER_KEYS.errorCreatingPage]: "Error creating page: {{error}}",
  [BROWSER_KEYS.closingError]: "Error during browser closing: {{error}}",
  
  // 额外的浏览器相关键 (Additional browser related keys)
  [BROWSER_KEYS.waiting]: "Browser is starting, waiting...",
  [BROWSER_KEYS.startupSuccess]: "Browser started successfully",
  [BROWSER_KEYS.navigating]: "Navigating to URL: {{url}}",
  [BROWSER_KEYS.scrolling]: "Auto-scrolling page...",
  [BROWSER_KEYS.scrollCompleted]: "Auto-scroll completed",
  [BROWSER_KEYS.contentTruncated]: "Content too large, truncating...",
  [BROWSER_KEYS.pageClosed]: "Page closed",
  [BROWSER_KEYS.fetchError]: "Error in browser fetch: {{error}}",
  [BROWSER_KEYS.highMemory]: "High memory usage detected: {{usage}}MB",
  [BROWSER_KEYS.closingDueToMemory]: "Closing browser due to high memory usage",
  [BROWSER_KEYS.forcingGC]: "Forcing garbage collection",
  [BROWSER_KEYS.memoryCheckError]: "Error checking memory usage: {{error}}",
  [BROWSER_KEYS.usingCookies]: "Using cookies for domain: {{domain}}",
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
  
  // 获取和重试相关 (Fetch and retry related)
  [BROWSER_KEYS.fetchingWithRetry]: "Fetching with retry: attempt {{attempt}} of {{maxAttempts}}",
  [BROWSER_KEYS.memoryUsage]: "Current memory usage: {{usage}}MB",
  [BROWSER_KEYS.memoryTooHigh]: "Memory usage too high: {{usage}}MB",
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
  [BROWSER_KEYS.waitingForBrowserStart]: "Waiting for browser to start...",
  [BROWSER_KEYS.reusingExistingBrowser]: "Reusing existing browser instance",
  [BROWSER_KEYS.startingBrowser]: "Starting browser...",
  [BROWSER_KEYS.browserStarted]: "Browser started",
  [BROWSER_KEYS.browserStartError]: "Browser start error: {{error}}"
}; 