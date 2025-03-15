/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { BROWSER_KEYS } from '../../keys/browser.js';

export default {
  // 浏览器生命周期 (Browser lifecycle)  
  // 页面操作 (Page operations)  [BROWSER_KEYS.waitingForSelector]: "等待选择器: {{selector}}",
  [BROWSER_KEYS.waitingForTimeout]: "等待超时: {{timeout}}ms",  [BROWSER_KEYS.scrollError]: "滚动时出错: {{error}}",
  [BROWSER_KEYS.gettingContent]: "获取页面内容...",
  [BROWSER_KEYS.contentLength]: "内容长度: {{length}} 字节",
  
  // Cookie 相关 (Cookie related)  
  // 错误相关 (Error related)  [BROWSER_KEYS.closingError]: "浏览器关闭过程中出错: {{error}}",
  
  // 额外的浏览器相关键 (Additional browser related keys)  [BROWSER_KEYS.navigating]: "导航到 URL: {{url}}",
  [BROWSER_KEYS.scrolling]: "自动滚动页面...",
  [BROWSER_KEYS.scrollCompleted]: "自动滚动完成",
  [BROWSER_KEYS.contentTruncated]: "内容过大，正在截断...",  [BROWSER_KEYS.memoryCheckError]: "检查内存使用错误: {{error}}",  [BROWSER_KEYS.usingProxy]: "使用代理: {{proxy}}",
  
  // Cloudflare 相关 (Cloudflare related)
  [BROWSER_KEYS.checkingCloudflare]: "检查 Cloudflare 保护",
  [BROWSER_KEYS.cloudflareDetected]: "检测到 Cloudflare 保护",
  [BROWSER_KEYS.simulatingHuman]: "模拟人类交互以绕过 Cloudflare",
  [BROWSER_KEYS.simulatingHumanError]: "模拟人类交互错误: {{error}}",
  [BROWSER_KEYS.stillOnCloudflare]: "绕过尝试后仍在 Cloudflare 页面",
  [BROWSER_KEYS.bypassFailed]: "Cloudflare 绕过失败",
  [BROWSER_KEYS.cloudflareError]: "Cloudflare 错误: {{error}}",
  [BROWSER_KEYS.continuingWithoutBypass]: "继续而不绕过 Cloudflare",  
  // 获取和重试相关 (Fetch and retry related)
  [BROWSER_KEYS.fetchingWithRetry]: "重试获取: 第 {{attempt}} 次，共 {{maxAttempts}} 次",
  [BROWSER_KEYS.memoryUsage]: "当前内存使用: {{usage}}MB",
  [BROWSER_KEYS.memoryTooHigh]: "内存使用过高: {{usage}}MB",  [BROWSER_KEYS.failedToParseJSON]: "解析 JSON 失败: {{error}}",
  [BROWSER_KEYS.startingBrowserFetchForMarkdown]: "开始浏览器获取 Markdown",
  [BROWSER_KEYS.errorInBrowserFetchForMarkdown]: "浏览器获取 Markdown 错误: {{error}}",
  [BROWSER_KEYS.fetchRequest]: "获取请求: {{url}}",
  [BROWSER_KEYS.usingStoredCookies]: "使用存储的域名 Cookie: {{domain}}",
  [BROWSER_KEYS.closingInstance]: "关闭浏览器实例",
  [BROWSER_KEYS.fetchErrorWithAttempt]: "获取错误 (第 {{attempt}} 次): {{error}}",
  [BROWSER_KEYS.retryingAfterDelay]: "延迟 {{delay}}ms 后重试",
  
  // 浏览器启动相关 (Browser startup related)  [BROWSER_KEYS.usingCustomChromePath]: "使用自定义 Chrome 路径: {{path}}",
  [BROWSER_KEYS.browserDisconnected]: "浏览器已断开连接",
  [BROWSER_KEYS.waitingForBrowserStart]: "等待浏览器启动...",
  [BROWSER_KEYS.reusingExistingBrowser]: "重用现有浏览器实例",
  [BROWSER_KEYS.startingBrowser]: "启动浏览器...",
  [BROWSER_KEYS.browserStarted]: "浏览器已启动",
  [BROWSER_KEYS.browserStartError]: "浏览器启动错误: {{error}}"
}; 