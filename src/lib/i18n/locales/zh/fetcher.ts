/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { FETCHER_KEYS } from '../../keys/fetcher.js';

/**
 * 获取器相关的中文文本 (Chinese texts related to fetcher)
 */
export default {
  // 内容大小相关 (Content size related)
  [FETCHER_KEYS.contentLength]: "内容长度: {{length}} 字节",
  [FETCHER_KEYS.contentTooLarge]: "内容过大: {{size}} 字节，限制: {{limit}} 字节",
  [FETCHER_KEYS.contentTruncated]: "内容已从 {{originalSize}} 截断至 {{truncatedSize}} 字节",

  // 分块处理相关 (Chunk processing related)
  [FETCHER_KEYS.chunkRetrievalFailed]: "获取分块失败: {{error}}",
  [FETCHER_KEYS.gettingChunkBySize]: "正在获取分块内容，chunkId：{{chunkId}}，起始位置：{{startCursor}}，大小：{{sizeLimit}}",
  [FETCHER_KEYS.chunkNotFound]: "未找到指定分块内容，chunkId：{{chunkId}}，起始位置：{{startCursor}}",
  [FETCHER_KEYS.chunkInfo]: "分块信息：获取了 {{fetchedBytes}} 字节，总大小 {{totalBytes}} 字节，剩余 {{remainingBytes}} 字节，完成度 {{percentage}}，是否为最后分块：{{isLastChunk}}",
  [FETCHER_KEYS.lastChunkDetected]: "检测到这是最后一个分块，已获取字节：{{fetchedBytes}}，总字节：{{totalBytes}}，剩余字节：{{remainingBytes}}",

  // 获取类型相关 (Fetch type related)
  [FETCHER_KEYS.fetchingPlainText]: "获取纯文本内容",

  // 延迟相关 (Delay related)
  [FETCHER_KEYS.addingDelay]: "添加延迟: {{delay}}毫秒",
  [FETCHER_KEYS.delayCompleted]: "延迟完成",

  // 代理相关 (Proxy related)
  [FETCHER_KEYS.usingProxy]: "使用代理: {{proxy}}",
  [FETCHER_KEYS.usingSpecifiedProxy]: "使用指定的代理: {{proxy}}",
  [FETCHER_KEYS.attemptingToUseSystemProxy]: "尝试使用系统代理",
  [FETCHER_KEYS.notUsingProxy]: "不使用代理",
  [FETCHER_KEYS.finalProxyUsed]: "最终使用的代理: {{proxy}}",
  [FETCHER_KEYS.noProxy]: "无代理",
  [FETCHER_KEYS.foundNoProxy]: "找到NO_PROXY设置: {{noProxy}}",
  [FETCHER_KEYS.usingHttpsProxy]: "使用HTTPS代理",
  [FETCHER_KEYS.usingHttpProxy]: "使用HTTP代理",
  [FETCHER_KEYS.systemProxyDisabled]: "系统代理已禁用",

  // 请求相关 (Request related)
  [FETCHER_KEYS.fetchingUrl]: "获取URL: {{url}}",
  [FETCHER_KEYS.usingUserAgent]: "使用User-Agent: {{userAgent}}",
  [FETCHER_KEYS.requestOptions]: "请求选项: {{options}}",
  [FETCHER_KEYS.startingFetch]: "开始获取: {{url}}",
  [FETCHER_KEYS.fetchCompleted]: "获取完成",

  // 响应相关 (Response related)
  [FETCHER_KEYS.responseStatus]: "响应状态: {{status}}",
  [FETCHER_KEYS.redirectingTo]: "重定向到: {{url}}",
  [FETCHER_KEYS.constructedFullRedirectUrl]: "构建完整重定向URL: {{url}}",
  [FETCHER_KEYS.requestSuccess]: "请求成功",

  // 错误相关 (Error related)
  [FETCHER_KEYS.errorResponse]: "错误响应: {{status}}",
  [FETCHER_KEYS.errorResponseBody]: "错误响应体: {{body}}",
  [FETCHER_KEYS.errorReadingBody]: "读取响应体出错: {{error}}",
  [FETCHER_KEYS.fetchError]: "获取错误: {{error}}",
  [FETCHER_KEYS.requestAborted]: "请求已中止",
  [FETCHER_KEYS.networkError]: "网络错误: {{error}}",
  [FETCHER_KEYS.requestTimeout]: "请求超时: {{timeout}}毫秒",
  [FETCHER_KEYS.fetchFailed]: "获取失败: {{error}}",
  [FETCHER_KEYS.tooManyRedirects]: "重定向次数过多",

  // 内容类型相关 (Content type related)
  [FETCHER_KEYS.startingHtmlFetch]: "开始获取HTML",
  [FETCHER_KEYS.fetchingHtml]: "获取HTML",
  [FETCHER_KEYS.fetchingJson]: "获取JSON",
  [FETCHER_KEYS.fetchingTxt]: "获取文本",
  [FETCHER_KEYS.fetchingMarkdown]: "获取Markdown",
  [FETCHER_KEYS.readingText]: "读取文本内容",
  [FETCHER_KEYS.htmlContentLength]: "HTML内容长度: {{length}} 字节",
  [FETCHER_KEYS.startingJsonFetch]: "开始获取JSON",
  [FETCHER_KEYS.parsingJson]: "解析JSON",
  [FETCHER_KEYS.jsonParsed]: "JSON解析成功",
  [FETCHER_KEYS.jsonParseError]: "JSON解析错误: {{error}}",
  [FETCHER_KEYS.startingTxtFetch]: "开始获取文本",
  [FETCHER_KEYS.textContentLength]: "文本内容长度: {{length}} 字节",
  [FETCHER_KEYS.startingMarkdownFetch]: "开始获取Markdown",
  [FETCHER_KEYS.creatingTurndown]: "创建Turndown服务",
  [FETCHER_KEYS.convertingToMarkdown]: "将HTML转换为Markdown",
  [FETCHER_KEYS.markdownContentLength]: "Markdown内容长度: {{length}} 字节",

  // 系统代理相关 (System proxy related)
  [FETCHER_KEYS.checkingProxyEnv]: "检查代理环境变量",
  [FETCHER_KEYS.envVarValue]: "环境变量 {{name}}: {{value}}",
  [FETCHER_KEYS.foundSystemProxy]: "找到系统代理: {{proxy}}",
  [FETCHER_KEYS.systemCommandProxySettings]: "系统命令代理设置: {{output}}",
  [FETCHER_KEYS.foundProxyFromCommand]: "从命令中找到代理: {{proxy}}",
  [FETCHER_KEYS.errorGettingProxyFromCommand]: "获取命令代理时出错: {{error}}",
  [FETCHER_KEYS.checkingSystemEnvVars]: "检查系统环境变量",
  [FETCHER_KEYS.windowsEnvVars]: "Windows环境变量: {{vars}}",
  [FETCHER_KEYS.foundWindowsEnvProxy]: "找到Windows环境代理: {{proxy}}",
  [FETCHER_KEYS.errorGettingWindowsEnvVars]: "获取Windows环境变量时出错: {{error}}",
  [FETCHER_KEYS.unixEnvVars]: "Unix环境变量: {{vars}}",
  [FETCHER_KEYS.foundUnixEnvProxy]: "找到Unix环境代理: {{proxy}}",
  [FETCHER_KEYS.errorGettingUnixEnvVars]: "获取Unix环境变量时出错: {{error}}",
  [FETCHER_KEYS.errorGettingSystemEnvVars]: "获取系统环境变量时出错: {{error}}",
  [FETCHER_KEYS.noSystemProxyFound]: "未找到系统代理",

  // 通用 (General)
  [FETCHER_KEYS.notSet]: "未设置",
  [FETCHER_KEYS.debug]: "调试: {{message}}",
  [FETCHER_KEYS.none]: "无",

  // 内容提取相关 (Content extraction related)
  [FETCHER_KEYS.extractingContent]: "正在提取页面主要内容，URL: {{url}}",
  [FETCHER_KEYS.extractionSuccess]: "内容提取成功，内容长度: {{contentLength}}，标题: {{title}}",
  [FETCHER_KEYS.extractionFailed]: "内容提取失败，URL: {{url}}",
  [FETCHER_KEYS.extractionError]: "内容提取过程中出错: {{error}}, URL: {{url}}",
  [FETCHER_KEYS.noFallback]: "内容提取失败，且禁用了回退选项",
  [FETCHER_KEYS.usingOriginalContent]: "使用原始HTML内容作为结果",
  [FETCHER_KEYS.fallbackToOriginal]: "回退到原始HTML内容"
}; 