/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { BROWSER_KEYS } from '../../keys/browser.js';

export default {
  // 浏览器生命周期 (Browser lifecycle)
  [BROWSER_KEYS.closing]: "正在关闭浏览器...",
  [BROWSER_KEYS.closed]: "浏览器已关闭",
  [BROWSER_KEYS.starting]: "正在启动新的浏览器实例",
  [BROWSER_KEYS.startingFailed]: "浏览器启动失败: {{error}}",
  [BROWSER_KEYS.alreadyRunning]: "浏览器正在启动中，请稍等...",
  
  // 页面操作 (Page operations)
  [BROWSER_KEYS.creatingPage]: "正在创建新页面",
  [BROWSER_KEYS.navigatingTo]: "正在导航到网址: {{url}}",
  [BROWSER_KEYS.waitingForSelector]: "正在等待选择器: {{selector}}",
  [BROWSER_KEYS.waitingForTimeout]: "正在等待超时: {{timeout}}毫秒",
  [BROWSER_KEYS.scrollingToBottom]: "正在自动滚动页面...",
  [BROWSER_KEYS.scrollError]: "滚动过程中出错: {{error}}",
  [BROWSER_KEYS.gettingContent]: "正在获取页面内容...",
  [BROWSER_KEYS.contentLength]: "内容长度: {{length}} 字节",
  [BROWSER_KEYS.contentTruncated]: "内容已从 {{originalLength}} 截断至 {{truncatedLength}} 字节",
  [BROWSER_KEYS.contentSplit]: "内容已分割成 {{chunks}} 个块",
  [BROWSER_KEYS.startingHtmlFetch]: "开始获取 HTML",
  
  // Cookie 相关 (Cookie related)
  [BROWSER_KEYS.savingCookies]: "正在保存域名的 Cookie: {{domain}}",
  [BROWSER_KEYS.cookiesSaved]: "Cookie 已保存",
  [BROWSER_KEYS.loadingCookies]: "正在加载域名的 Cookie: {{domain}}",
  [BROWSER_KEYS.cookiesLoaded]: "Cookie 已加载",
  [BROWSER_KEYS.noCookiesFound]: "未找到域名的 Cookie: {{domain}}",
  
  // 错误相关 (Error related)
  [BROWSER_KEYS.errorLoadingCookies]: "加载 Cookie 出错: {{error}}",
  [BROWSER_KEYS.errorSavingCookies]: "保存 Cookie 出错: {{error}}",
  [BROWSER_KEYS.errorNavigating]: "导航至 {{url}} 出错: {{error}}",
  [BROWSER_KEYS.errorGettingContent]: "获取内容出错: {{error}}",
  [BROWSER_KEYS.errorClosingBrowser]: "关闭浏览器出错: {{error}}",
  [BROWSER_KEYS.errorCreatingPage]: "创建页面出错: {{error}}",
  [BROWSER_KEYS.closingError]: "关闭浏览器出错: {{error}}",
  
  // 额外的浏览器相关键 (Additional browser related keys)
  [BROWSER_KEYS.waiting]: "等待 {{ms}} 毫秒",
  [BROWSER_KEYS.startupSuccess]: "浏览器启动成功",
  [BROWSER_KEYS.navigating]: "正在导航至 {{url}}",
  [BROWSER_KEYS.scrolling]: "正在自动滚动页面...",
  [BROWSER_KEYS.scrollCompleted]: "自动滚动完成",
  [BROWSER_KEYS.pageClosed]: "页面已关闭",
  [BROWSER_KEYS.fetchError]: "浏览器获取过程中出错: {{error}}",
  [BROWSER_KEYS.highMemory]: "检测到高内存使用: {{usage}}MB",
  [BROWSER_KEYS.closingDueToMemory]: "由于高内存使用正在关闭浏览器",
  [BROWSER_KEYS.forcingGC]: "强制进行垃圾回收",
  [BROWSER_KEYS.memoryCheckError]: "检查内存时出错: {{error}}",
  [BROWSER_KEYS.usingCookies]: "正在使用 {{domain}} 的 Cookie",
  [BROWSER_KEYS.usingProxy]: "正在使用代理: {{proxy}}",
  
  // Cloudflare 相关 (Cloudflare related)
  [BROWSER_KEYS.checkingCloudflare]: "正在检查 Cloudflare 保护",
  [BROWSER_KEYS.cloudflareDetected]: "检测到 Cloudflare 保护",
  [BROWSER_KEYS.simulatingHuman]: "正在模拟人类交互以绕过 Cloudflare",
  [BROWSER_KEYS.simulatingHumanError]: "模拟人类交互时出错: {{error}}",
  [BROWSER_KEYS.stillOnCloudflare]: "尝试绕过后仍在 Cloudflare 页面",
  [BROWSER_KEYS.bypassFailed]: "Cloudflare 绕过失败",
  [BROWSER_KEYS.cloudflareError]: "Cloudflare 错误: {{error}}",
  [BROWSER_KEYS.continuingWithoutBypass]: "继续访问而不绕过 Cloudflare",
  [BROWSER_KEYS.unableToBypassCloudflare]: "无法绕过 Cloudflare 保护",
  [BROWSER_KEYS.cloudflareBypass]: "正在尝试绕过 Cloudflare 保护",
  [BROWSER_KEYS.cloudflareBypassSuccess]: "已绕过 Cloudflare 保护",
  [BROWSER_KEYS.cloudflareBypassFailed]: "绕过 Cloudflare 保护失败: {{error}}",
  [BROWSER_KEYS.cloudflareBypassNotNeeded]: "继续访问而不需要绕过 Cloudflare",
  
  // 获取和重试相关 (Fetch and retry related)
  [BROWSER_KEYS.fetchingWithRetry]: "正在重试获取: 第 {{attempt}} 次尝试，共 {{maxAttempts}} 次",
  [BROWSER_KEYS.memoryUsage]: "当前内存使用: {{usage}}MB",
  [BROWSER_KEYS.memoryTooHigh]: "内存使用过高: 堆使用 {{heapUsed}}MB，堆总计 {{heapTotal}}MB，RSS {{rss}}MB",
  [BROWSER_KEYS.contentTooLarge]: "内容过大: {{size}} 字节",
  [BROWSER_KEYS.failedToParseJSON]: "解析 JSON 失败: {{error}}",
  [BROWSER_KEYS.startingBrowserFetchForMarkdown]: "正在启动浏览器获取 Markdown",
  [BROWSER_KEYS.errorInBrowserFetchForMarkdown]: "浏览器获取 Markdown 时出错: {{error}}",
  [BROWSER_KEYS.fetchRequest]: "获取请求: {{url}}",
  [BROWSER_KEYS.usingStoredCookies]: "使用存储的 {{domain}} 域名 Cookie",
  [BROWSER_KEYS.closingInstance]: "正在关闭浏览器实例",
  [BROWSER_KEYS.fetchErrorWithAttempt]: "获取错误 (第 {{attempt}} 次尝试): {{error}}",
  [BROWSER_KEYS.retryingAfterDelay]: "在延迟 {{delay}} 毫秒后重试",
  
  // 浏览器启动相关 (Browser startup related)
  [BROWSER_KEYS.browserStartupSuccess]: "浏览器启动成功",
  [BROWSER_KEYS.browserStartupFailed]: "浏览器启动失败: {{error}}",
  [BROWSER_KEYS.usingCustomChromePath]: "使用自定义 Chrome 路径: {{path}}",
  [BROWSER_KEYS.browserDisconnected]: "浏览器已断开连接",
  [BROWSER_KEYS.waitingForBrowserStart]: "等待浏览器启动",
  [BROWSER_KEYS.reusingExistingBrowser]: "重用现有浏览器实例",
  [BROWSER_KEYS.startingBrowser]: "正在启动浏览器...",
  [BROWSER_KEYS.browserStarted]: "浏览器已启动",
  [BROWSER_KEYS.browserStartError]: "浏览器启动错误: {{error}}",
  
  // Fetch 相关 (Fetch related)
  [BROWSER_KEYS.htmlFetchError]: "获取 HTML 时出错: {{error}}",
  [BROWSER_KEYS.jsonFetchError]: "获取 JSON 时出错: {{error}}",
  [BROWSER_KEYS.txtFetchError]: "获取文本时出错: {{error}}",
  [BROWSER_KEYS.markdownFetchError]: "获取 Markdown 时出错: {{error}}",
  [BROWSER_KEYS.creatingTurndown]: "正在创建 Turndown 实例用于 Markdown 转换",
  [BROWSER_KEYS.convertingToMarkdown]: "正在将 HTML 转换为 Markdown",
  [BROWSER_KEYS.markdownContentLength]: "Markdown 内容长度: {{length}} 字节",
  [BROWSER_KEYS.startingJsonFetch]: "开始获取 JSON",
  [BROWSER_KEYS.startingTxtFetch]: "开始获取文本",
  [BROWSER_KEYS.startingMarkdownFetch]: "开始获取 Markdown",
  [BROWSER_KEYS.startingPlainTextFetch]: "开始获取纯文本",
  [BROWSER_KEYS.extractingText]: "正在从 HTML 内容中提取文本",
  [BROWSER_KEYS.textExtracted]: "文本已提取，长度: {{length}} 字节",
  [BROWSER_KEYS.jsonParsed]: "JSON 解析成功",
  [BROWSER_KEYS.jsonParseError]: "解析 JSON 出错: {{error}}",
  
  // 代理相关 (Proxy related)
  [BROWSER_KEYS.proxyConnected]: "已连接到代理: {{proxy}}",
  [BROWSER_KEYS.proxyError]: "代理错误: {{error}}",
  
  // 响应相关 (Response related)
  [BROWSER_KEYS.responseStatus]: "响应状态: {{status}}",
  [BROWSER_KEYS.responseError]: "响应错误: {{error}}",
  [BROWSER_KEYS.responseSuccess]: "响应成功",
  [BROWSER_KEYS.responseRedirect]: "响应重定向至: {{url}}",
  [BROWSER_KEYS.responseTimeout]: "响应在 {{timeout}} 毫秒后超时",
  
  // 错误处理 (Error handling)
  [BROWSER_KEYS.errorResponse]: "来自服务器的错误响应: {{status}}",
  [BROWSER_KEYS.errorResponseBody]: "错误响应体: {{body}}",
  [BROWSER_KEYS.accessDenied]: "访问被拒绝: {{status}} - {{message}}",
  [BROWSER_KEYS.timeoutError]: "请求在 {{timeout}} 毫秒后超时",
  [BROWSER_KEYS.networkError]: "网络错误: {{error}}",
  [BROWSER_KEYS.unknownError]: "未知错误: {{error}}"
}; 