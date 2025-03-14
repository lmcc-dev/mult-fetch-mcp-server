/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * 节点相关键 (Node related keys)
 */
export const NODE_KEYS = (() => {
  const keyGen = createKeyGenerator('node');
  return {
    // 延迟和代理相关 (Delay and proxy related)
    addingDelay: keyGen('addingDelay'),
    noProxy: keyGen('noProxy'),
    usingProxy: keyGen('usingProxy'),
    usingHttpsProxy: keyGen('usingHttpsProxy'),
    usingHttpProxy: keyGen('usingHttpProxy'),
    
    // 系统代理相关 (System proxy related)
    checkingProxyEnv: keyGen('checkingProxyEnv'),
    envVarValue: keyGen('envVarValue'),
    foundSystemProxy: keyGen('foundSystemProxy'),
    checkingSystemEnvVars: keyGen('checkingSystemEnvVars'),
    windowsEnvVars: keyGen('windowsEnvVars'),
    foundWindowsEnvProxy: keyGen('foundWindowsEnvProxy'),
    errorGettingWindowsEnvVars: keyGen('errorGettingWindowsEnvVars'),
    unixEnvVars: keyGen('unixEnvVars'),
    foundUnixEnvProxy: keyGen('foundUnixEnvProxy'),
    errorGettingUnixEnvVars: keyGen('errorGettingUnixEnvVars'),
    noSystemProxyFound: keyGen('noSystemProxyFound'),
    errorGettingSystemEnvVars: keyGen('errorGettingSystemEnvVars'),
    foundNoProxy: keyGen('foundNoProxy'),
    
    // 请求相关 (Request related)
    usingUserAgent: keyGen('usingUserAgent'),
    requestDetails: keyGen('requestDetails'),
    requestOptions: keyGen('requestOptions'),
    startingFetch: keyGen('startingFetch'),
    fetchingUrl: keyGen('fetchingUrl'),
    
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
    tooManyRedirects: keyGen('tooManyRedirects'),
    
    // 内容类型相关 (Content type related)
    startingHtmlFetch: keyGen('startingHtmlFetch'),
    readingText: keyGen('readingText'),
    htmlContentLength: keyGen('htmlContentLength'),
    htmlFetchError: keyGen('htmlFetchError'),
    startingJsonFetch: keyGen('startingJsonFetch'),
    parsingJson: keyGen('parsingJson'),
    jsonParsed: keyGen('jsonParsed'),
    jsonParseError: keyGen('jsonParseError'),
    jsonFetchError: keyGen('jsonFetchError'),
    startingTxtFetch: keyGen('startingTxtFetch'),
    textContentLength: keyGen('textContentLength'),
    startingMarkdownFetch: keyGen('startingMarkdownFetch'),
    creatingTurndown: keyGen('creatingTurndown'),
    convertingToMarkdown: keyGen('convertingToMarkdown'),
    markdownContentLength: keyGen('markdownContentLength')
  } as const;
})(); 