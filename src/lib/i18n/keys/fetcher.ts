/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

const PREFIX = 'fetcher';
const keyGen = createKeyGenerator(PREFIX);

/**
 * 获取器相关的国际化键 (Internationalization keys related to fetcher)
 */
export const FETCHER_KEYS = {
  // 内容大小相关 (Content size related)
  contentLength: keyGen('contentLength'),
  contentTooLarge: keyGen('contentTooLarge'),
  contentTruncated: keyGen('contentTruncated'),

  // 分块处理相关 (Chunk processing related)
  chunkRetrievalFailed: keyGen('chunkRetrievalFailed'),
  gettingChunkBySize: keyGen('gettingChunkBySize'),
  chunkNotFound: keyGen('chunkNotFound'),

  // 获取类型相关 (Fetch type related)
  fetchingPlainText: keyGen('fetchingPlainText'),

  // 延迟相关 (Delay related)
  addingDelay: keyGen('addingDelay'),
  delayCompleted: keyGen('delayCompleted'),

  // 代理相关 (Proxy related)
  usingProxy: keyGen('usingProxy'),
  usingSpecifiedProxy: keyGen('usingSpecifiedProxy'),
  attemptingToUseSystemProxy: keyGen('attemptingToUseSystemProxy'),
  notUsingProxy: keyGen('notUsingProxy'),
  finalProxyUsed: keyGen('finalProxyUsed'),
  noProxy: keyGen('noProxy'),
  foundNoProxy: keyGen('foundNoProxy'),
  usingHttpsProxy: keyGen('usingHttpsProxy'),
  usingHttpProxy: keyGen('usingHttpProxy'),
  systemProxyDisabled: keyGen('systemProxyDisabled'),

  // 请求相关 (Request related)
  fetchingUrl: keyGen('fetchingUrl'),
  usingUserAgent: keyGen('usingUserAgent'),
  requestOptions: keyGen('requestOptions'),
  startingFetch: keyGen('startingFetch'),
  fetchCompleted: keyGen('fetchCompleted'),

  // 响应相关 (Response related)
  responseStatus: keyGen('responseStatus'),
  redirectingTo: keyGen('redirectingTo'),
  constructedFullRedirectUrl: keyGen('constructedFullRedirectUrl'),
  requestSuccess: keyGen('requestSuccess'),

  // 错误相关 (Error related)
  errorResponse: keyGen('errorResponse'),
  errorResponseBody: keyGen('errorResponseBody'),
  errorReadingBody: keyGen('errorReadingBody'),
  fetchError: keyGen('fetchError'),
  requestAborted: keyGen('requestAborted'),
  networkError: keyGen('networkError'),
  requestTimeout: keyGen('requestTimeout'),
  fetchFailed: keyGen('fetchFailed'),
  tooManyRedirects: keyGen('tooManyRedirects'),

  // 内容类型相关 (Content type related)
  startingHtmlFetch: keyGen('startingHtmlFetch'),
  fetchingHtml: keyGen('fetchingHtml'),
  fetchingJson: keyGen('fetchingJson'),
  fetchingTxt: keyGen('fetchingTxt'),
  fetchingMarkdown: keyGen('fetchingMarkdown'),
  readingText: keyGen('readingText'),
  htmlContentLength: keyGen('htmlContentLength'),
  startingJsonFetch: keyGen('startingJsonFetch'),
  parsingJson: keyGen('parsingJson'),
  jsonParsed: keyGen('jsonParsed'),
  jsonParseError: keyGen('jsonParseError'),
  startingTxtFetch: keyGen('startingTxtFetch'),
  textContentLength: keyGen('textContentLength'),
  startingMarkdownFetch: keyGen('startingMarkdownFetch'),
  creatingTurndown: keyGen('creatingTurndown'),
  convertingToMarkdown: keyGen('convertingToMarkdown'),
  markdownContentLength: keyGen('markdownContentLength'),

  // 系统代理相关 (System proxy related)
  checkingProxyEnv: keyGen('checkingProxyEnv'),
  envVarValue: keyGen('envVarValue'),
  foundSystemProxy: keyGen('foundSystemProxy'),
  systemCommandProxySettings: keyGen('systemCommandProxySettings'),
  foundProxyFromCommand: keyGen('foundProxyFromCommand'),
  errorGettingProxyFromCommand: keyGen('errorGettingProxyFromCommand'),
  checkingSystemEnvVars: keyGen('checkingSystemEnvVars'),
  windowsEnvVars: keyGen('windowsEnvVars'),
  foundWindowsEnvProxy: keyGen('foundWindowsEnvProxy'),
  errorGettingWindowsEnvVars: keyGen('errorGettingWindowsEnvVars'),
  unixEnvVars: keyGen('unixEnvVars'),
  foundUnixEnvProxy: keyGen('foundUnixEnvProxy'),
  errorGettingUnixEnvVars: keyGen('errorGettingUnixEnvVars'),
  errorGettingSystemEnvVars: keyGen('errorGettingSystemEnvVars'),
  noSystemProxyFound: keyGen('noSystemProxyFound'),

  // 通用 (General)
  notSet: keyGen('notSet'),
  debug: keyGen('debug'),
  none: keyGen('none'),

  // 新增键
  chunkInfo: keyGen('chunkInfo'),
  lastChunkDetected: keyGen('lastChunkDetected'),
} as const; 