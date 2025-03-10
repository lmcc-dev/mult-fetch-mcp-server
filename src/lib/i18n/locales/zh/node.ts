/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// Node获取器相关消息 (Node fetcher related messages)
export const node = {
  addingDelay: "添加随机延迟...",
  noProxy: "不使用代理",
  usingProxy: "使用代理: {{proxy}}",
  usingHttpsProxy: "使用HTTPS代理代理",
  usingHttpProxy: "使用HTTP代理代理",
  usingUserAgent: "使用User-Agent: {{userAgent}}",
  requestDetails: "请求详情: URL={{url}}, 方法={{method}}, 代理={{proxy}}",
  requestOptions: "请求选项: {{options}}",
  startingFetch: "开始获取请求...",
  fetchingUrl: "获取URL: {{url}}",
  responseStatus: "响应状态: {{status}} {{statusText}}",
  redirectingTo: "重定向到: {{location}}",
  constructedFullRedirectUrl: "构建完整重定向URL: {{redirectUrl}}",
  requestSuccess: "请求成功",
  errorResponse: "错误响应: {{status}} {{statusText}}",
  errorResponseBody: "错误响应内容(前200字符): {{body}}",
  errorReadingBody: "读取错误响应体失败: {{error}}",
  fetchError: "获取错误: {{error}}",
  requestAborted: "请求中止，耗时 {{duration}}ms",
  networkError: "网络错误 ({{code}})，可能需要使用浏览器模式重试",
  tooManyRedirects: "重定向次数过多 ({{redirects}})",
  startingHtmlFetch: "开始HTML获取",
  readingText: "获得响应，正在读取文本",
  htmlContentLength: "HTML内容长度: {{length}} 字节",
  htmlFetchError: "HTML获取错误: {{error}}",
  startingJsonFetch: "开始JSON获取",
  parsingJson: "获得响应，正在解析JSON",
  jsonParsed: "JSON解析成功",
  jsonParseError: "JSON解析错误: {{error}}",
  jsonFetchError: "JSON获取错误: {{error}}",
  startingTxtFetch: "开始TXT获取",
  startingMarkdownFetch: "开始Markdown获取",
  creatingTurndown: "创建TurndownService实例",
  convertingToMarkdown: "将HTML转换为Markdown"
}; 