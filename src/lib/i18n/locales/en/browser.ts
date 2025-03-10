/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 浏览器相关消息 (Browser related messages)
export const browser = {
  closing: "Closing browser...",
  closed: "Browser closed",
  starting: "Starting new browser instance",
  startingFailed: "Browser startup failed: {{error}}",
  waiting: "Browser is starting, waiting...",
  startupSuccess: "Browser started successfully",
  navigating: "Navigating to URL...",
  waitingForSelector: "Waiting for selector: {{selector}}",
  waitingForTimeout: "Waiting for timeout: {{timeout}}",
  scrolling: "Auto-scrolling page...",
  scrollCompleted: "Auto-scroll completed",
  gettingContent: "Getting page content...",
  savingCookies: "Saving cookies...",
  contentLength: "Content length: {{length}}",
  contentTruncated: "Content too large, truncating...",
  pageClosed: "Page closed",
  fetchError: "Error in browser fetch: {{error}}",
  highMemory: "High memory usage detected, attempting to free resources...",
  closingDueToMemory: "Closing browser due to high memory usage...",
  closingError: "Error closing browser: {{error}}",
  forcingGC: "Forcing garbage collection...",
  memoryCheckError: "Error checking memory usage: {{error}}",
  usingCookies: "Using stored cookies for domain: {{domain}}",
  usingProxy: "Using proxy: {{proxy}}",
  checkingCloudflare: "Checking for Cloudflare protection...",
  cloudflareDetected: "Cloudflare protection detected, attempting to bypass...",
  simulatingHuman: "Simulating human behavior...",
  simulatingHumanError: "Error simulating human behavior: {{error}}",
  stillOnCloudflare: "Still on Cloudflare protection page, trying to refresh...",
  bypassFailed: "Failed to bypass Cloudflare protection",
  cloudflareError: "Error handling Cloudflare protection: {{error}}",
  continuingWithoutBypass: "Unable to bypass Cloudflare protection, continuing to try to get content...",
  fetchingWithRetry: "Fetching HTML with browser (attempt {{attempt}}/{{maxAttempts}}): {{url}}",
  memoryUsage: "Memory usage - Heap: {{heapUsed}}MB/{{heapTotal}}MB, RSS: {{rss}}MB",
  memoryTooHigh: "Memory usage too high - Heap: {{heapUsed}}MB/{{heapTotal}}MB, RSS: {{rss}}MB",
  unableToBypassCloudflare: "Unable to bypass Cloudflare protection, continuing to try to get content...",
  contentTooLarge: "Content too large, truncating...",
  failedToParseJSON: "Failed to parse JSON: {{error}}",
  startingBrowserFetchForMarkdown: "Starting browser fetch for Markdown: {{url}}",
  errorInBrowserFetchForMarkdown: "Error in browser fetch for Markdown: {{error}}",
  fetchRequest: "Browser fetch request: {{url}}",
  usingStoredCookies: "Using stored cookies for domain: {{domain}}",
  closingInstance: "Closing browser instance",
  fetchErrorWithAttempt: "Error in browser fetch (attempt {{attempt}}/{{maxAttempts}}): {{error}}",
  retryingAfterDelay: "Retrying after {{delayMs}}ms delay..."
}; 