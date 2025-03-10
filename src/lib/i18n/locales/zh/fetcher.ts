/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 获取器相关消息 (Fetcher related messages)
export const fetcher = {
  addingDelay: "添加随机延迟",
  delayCompleted: "延迟完成，耗时 {{delay}}ms",
  usingProxy: "使用代理: {{proxy}}",
  usingSpecifiedProxy: "使用指定代理: {{proxy}}",
  attemptingToUseSystemProxy: "尝试使用系统代理",
  notUsingProxy: "不使用任何代理",
  finalProxyUsed: "最终使用的代理: {{proxy}}",
  noProxy: "不使用代理",
  fetchingUrl: "获取URL: {{url}} (重定向: {{redirect}})",
  usingUserAgent: "使用User-Agent: {{userAgent}}",
  usingHttpsProxy: "使用HTTPS代理",
  usingHttpProxy: "使用HTTP代理",
  requestOptions: "请求选项: {{options}}",
  startingFetch: "开始获取",
  fetchCompleted: "获取完成，耗时 {{duration}}ms",
  responseStatus: "响应状态: {{status}} {{statusText}}",
  redirectingTo: "重定向到: {{location}}",
  constructedFullRedirectUrl: "构建完整重定向URL: {{redirectUrl}}",
  requestSuccess: "请求成功",
  errorResponse: "错误响应: {{status}} {{statusText}}",
  errorResponseBody: "错误响应内容(前200字符): {{body}}",
  errorReadingBody: "读取响应内容时出错: {{error}}",
  fetchError: "获取错误: {{error}}",
  requestAborted: "请求中止，耗时 {{duration}}ms",
  networkError: "网络错误 ({{code}})，可能需要使用浏览器模式重试",
  requestTimeout: "请求超时，耗时 {{duration}}ms",
  fetchFailed: "获取失败: {{error}}",
  tooManyRedirects: "重定向次数过多 ({{redirects}})",
  startingHtmlFetch: "开始获取HTML",
  readingText: "读取文本内容",
  htmlContentLength: "HTML内容长度: {{length}} 字节",
  startingJsonFetch: "开始获取JSON",
  parsingJson: "解析JSON",
  jsonParsed: "JSON解析成功",
  jsonParseError: "JSON解析错误: {{error}}",
  startingTxtFetch: "开始获取文本",
  textContentLength: "文本内容长度: {{length}} 字节",
  startingMarkdownFetch: "开始获取Markdown",
  creatingTurndown: "创建Turndown服务",
  convertingToMarkdown: "转换为Markdown",
  markdownContentLength: "Markdown内容长度: {{length}} 字节",
  debug: "{{message}}",
  none: "无"
}; 