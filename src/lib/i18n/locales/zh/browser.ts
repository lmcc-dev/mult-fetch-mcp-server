/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 浏览器相关消息 (Browser related messages)
export const browser = {
  closing: "正在关闭浏览器...",
  closed: "浏览器已关闭",
  starting: "启动新的浏览器实例",
  startingFailed: "浏览器启动失败: {{error}}",
  waiting: "浏览器正在启动中，等待...",
  startupSuccess: "浏览器启动成功",
  navigating: "正在导航到URL...",
  waitingForSelector: "等待选择器: {{selector}}",
  waitingForTimeout: "等待超时: {{timeout}}",
  scrolling: "自动滚动页面...",
  scrollCompleted: "自动滚动完成",
  gettingContent: "获取页面内容...",
  savingCookies: "保存Cookie...",
  contentLength: "内容长度: {{length}}",
  contentTruncated: "内容过大，进行截断...",
  pageClosed: "页面已关闭",
  fetchError: "浏览器获取错误: {{error}}",
  highMemory: "检测到内存使用率高，尝试释放资源...",
  closingDueToMemory: "由于内存使用率高，关闭浏览器...",
  closingError: "关闭浏览器错误: {{error}}",
  forcingGC: "强制垃圾回收...",
  memoryCheckError: "检查内存使用错误: {{error}}",
  usingCookies: "使用存储的域名Cookie: {{domain}}",
  usingProxy: "使用代理服务器: {{proxy}}",
  checkingCloudflare: "检查是否存在Cloudflare保护...",
  cloudflareDetected: "检测到Cloudflare保护，尝试绕过...",
  simulatingHuman: "模拟人类行为...",
  simulatingHumanError: "模拟人类行为时出错: {{error}}",
  stillOnCloudflare: "仍然在Cloudflare保护页面，尝试刷新...",
  bypassFailed: "无法绕过Cloudflare保护",
  cloudflareError: "处理Cloudflare保护时出错: {{error}}",
  continuingWithoutBypass: "无法绕过Cloudflare保护，继续尝试获取内容...",
  fetchingWithRetry: "使用浏览器获取HTML（尝试 {{attempt}}/{{maxAttempts}}）: {{url}}",
  memoryUsage: "内存使用情况 - Heap: {{heapUsed}}MB/{{heapTotal}}MB, RSS: {{rss}}MB",
  memoryTooHigh: "内存使用过高 - Heap: {{heapUsed}}MB/{{heapTotal}}MB, RSS: {{rss}}MB",
  unableToBypassCloudflare: "无法绕过Cloudflare保护，继续尝试获取内容...",
  contentTooLarge: "内容过大，截断中...",
  failedToParseJSON: "解析JSON失败: {{error}}",
  startingBrowserFetchForMarkdown: "开始使用浏览器获取Markdown: {{url}}",
  errorInBrowserFetchForMarkdown: "使用浏览器获取Markdown时出错: {{error}}",
  fetchRequest: "浏览器获取请求: {{url}}",
  usingStoredCookies: "使用存储的域名Cookie: {{domain}}",
  closingInstance: "关闭浏览器实例",
  fetchErrorWithAttempt: "浏览器获取错误（尝试 {{attempt}}/{{maxAttempts}}）: {{error}}",
  retryingAfterDelay: "延迟 {{delayMs}}ms 后重试..."
}; 