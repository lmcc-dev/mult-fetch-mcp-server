/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { NODE_KEYS } from '../../keys/node.js';

// Node 相关消息 (Node related messages)
export default {
  // 延迟和代理相关 (Delay and proxy related)
  [NODE_KEYS.addingDelay]: '添加延迟: {{delay}}毫秒',
  [NODE_KEYS.noProxy]: '无代理',
  [NODE_KEYS.usingProxy]: '使用代理: {{proxy}}',
  [NODE_KEYS.usingHttpsProxy]: '使用HTTPS代理',
  [NODE_KEYS.usingHttpProxy]: '使用HTTP代理',

  // 系统代理相关 (System proxy related)
  [NODE_KEYS.checkingProxyEnv]: '检查代理环境变量',
  [NODE_KEYS.envVarValue]: '环境变量 {{name}}: {{value}}',
  [NODE_KEYS.foundSystemProxy]: '发现系统代理: {{proxy}}',
  [NODE_KEYS.checkingSystemEnvVars]: '检查系统环境变量',
  [NODE_KEYS.windowsEnvVars]: 'Windows环境变量: {{vars}}',
  [NODE_KEYS.foundWindowsEnvProxy]: '发现Windows环境代理: {{proxy}}',
  [NODE_KEYS.errorGettingWindowsEnvVars]: '获取Windows环境变量出错: {{error}}',
  [NODE_KEYS.unixEnvVars]: 'Unix环境变量: {{vars}}',
  [NODE_KEYS.foundUnixEnvProxy]: '发现Unix环境代理: {{proxy}}',
  [NODE_KEYS.errorGettingUnixEnvVars]: '获取Unix环境变量出错: {{error}}',
  [NODE_KEYS.noSystemProxyFound]: '未发现系统代理',
  [NODE_KEYS.errorGettingSystemEnvVars]: '获取系统环境变量出错: {{error}}',
  [NODE_KEYS.foundNoProxy]: '发现NO_PROXY: {{noProxy}}',

  // 请求相关 (Request related)
  [NODE_KEYS.usingUserAgent]: '使用User-Agent: {{userAgent}}',
  [NODE_KEYS.requestDetails]: '请求详情: 方法={{method}}, URL={{url}}',
  [NODE_KEYS.requestOptions]: '请求选项: {{options}}',
  [NODE_KEYS.startingFetch]: '开始获取: {{method}} {{url}}',
  [NODE_KEYS.fetchingUrl]: '获取URL: {{url}}',
  [NODE_KEYS.addingRandomDelay]: '添加请求间随机延迟',
  [NODE_KEYS.responseStatus]: '响应状态: {{status}}',
  [NODE_KEYS.redirectingTo]: '重定向到: {{url}}',
  [NODE_KEYS.redirecting]: '重定向到 {{to}}（重定向计数：{{redirectCount}}）',
  [NODE_KEYS.constructedFullRedirectUrl]: '构建完整重定向 URL: {{url}}',

  // 响应相关 (Response related)
  [NODE_KEYS.requestSuccess]: '请求成功',
  [NODE_KEYS.errorResponse]: '错误响应: {{status}}',
  [NODE_KEYS.errorResponseBody]: '错误响应内容: {{body}}',
  [NODE_KEYS.errorReadingBody]: '读取响应内容出错: {{error}}',

  // 错误相关 (Error related)
  [NODE_KEYS.fetchError]: '获取错误: {{error}}',
  [NODE_KEYS.requestAborted]: '请求中止',
  [NODE_KEYS.networkError]: '网络错误: {{code}}',
  [NODE_KEYS.tooManyRedirects]: '重定向次数过多',

  // HTML 获取相关 (HTML fetch related)
  [NODE_KEYS.startingHtmlFetch]: '开始获取HTML',
  [NODE_KEYS.readingText]: '读取文本内容',
  [NODE_KEYS.htmlContentLength]: 'HTML内容长度: {{length}}字节',
  [NODE_KEYS.htmlFetchError]: '获取HTML时出错: {{error}}',

  // JSON 获取相关 (JSON fetch related)
  [NODE_KEYS.startingJsonFetch]: '开始获取JSON',
  [NODE_KEYS.parsingJson]: '解析JSON',
  [NODE_KEYS.jsonParsed]: 'JSON解析完成',
  [NODE_KEYS.jsonParseError]: 'JSON解析错误: {{error}}',
  [NODE_KEYS.jsonFetchError]: '获取JSON时出错: {{error}}',

  // 文本获取相关 (Text fetch related)
  [NODE_KEYS.startingTxtFetch]: '开始获取纯文本',
  [NODE_KEYS.textContentLength]: 'Text内容长度: {{length}}字节',

  // Markdown 获取相关 (Markdown fetch related)
  [NODE_KEYS.startingMarkdownFetch]: '开始获取Markdown',
  [NODE_KEYS.creatingTurndown]: '创建Turndown服务',
  [NODE_KEYS.convertingToMarkdown]: '将HTML转换为Markdown',
  [NODE_KEYS.markdownContentLength]: 'Markdown内容长度: {{length}}字节',
  [NODE_KEYS.startingPlainTextFetch]: '开始提取纯文本',
  [NODE_KEYS.extractingText]: '从HTML内容中提取文本',
  [NODE_KEYS.textExtracted]: '文本已提取，长度: {{length}}字节',

  // 内容分段相关 (Content splitting related)
  [NODE_KEYS.contentSplit]: '内容已分段，共{{chunks}}个分段',
  [NODE_KEYS.gettingChunk]: '获取分段内容，ID: {{chunkId}}, 索引: {{chunkIndex}}'
}; 