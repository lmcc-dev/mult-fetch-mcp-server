/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * 服务器相关键 (Server related keys)
 */
export const SERVER_KEYS = (() => {
  const keyGen = createKeyGenerator('server');
  return {
    // 服务器状态 (Server status)
    starting: keyGen('starting'),
    started: keyGen('started'),
    stopping: keyGen('stopping'),
    stopped: keyGen('stopped'),
    error: keyGen('error'),
    startupError: keyGen('startupError'),
    
    // 连接相关 (Connection related)
    connecting: keyGen('connecting'),
    connected: keyGen('connected'),
    connectionFailed: keyGen('connectionFailed'),
    disconnected: keyGen('disconnected'),
    connectionError: keyGen('connectionError'),
    
    // 错误相关 (Error related)
    serverError: keyGen('serverError'),
    transportError: keyGen('transportError'),
    
    // 请求处理 (Request handling)
    receivedRequest: keyGen('receivedRequest'),
    processingRequest: keyGen('processingRequest'),
    requestCompleted: keyGen('requestCompleted'),
    requestError: keyGen('requestError'),
    requestReceived: keyGen('requestReceived'),
    requestProcessed: keyGen('requestProcessed'),
    requestFailed: keyGen('requestFailed'),
    
    // 浏览器相关 (Browser related)
    initializingBrowser: keyGen('initializingBrowser'),
    browserInitialized: keyGen('browserInitialized'),
    browserInitFailed: keyGen('browserInitFailed'),
    closingBrowser: keyGen('closingBrowser'),
    browserClosed: keyGen('browserClosed'),
    
    // 工具相关 (Tool related)
    tool: {
      requestReceived: keyGen('tool.requestReceived'),
      requestProcessed: keyGen('tool.requestProcessed'),
      requestError: keyGen('tool.requestError')
    },
    
    // 系统相关 (System related)
    receivedInterruptSignal: keyGen('receivedInterruptSignal'),
    receivedTerminateSignal: keyGen('receivedTerminateSignal'),
    uncaughtException: keyGen('uncaughtException'),
    debug: keyGen('debug'),
    listeningOn: keyGen('listeningOn'),
    
    // 入口相关 (Entry related)
    entry: {
      loaded: keyGen('entry.loaded')
    },
    
    // 其他键 (Other keys)
    receivedToolRequest: keyGen('receivedToolRequest'),
    processingToolRequestError: keyGen('processingToolRequestError'),
    usingBrowserMode: keyGen('usingBrowserMode'),
    usingAutoDetectMode: keyGen('usingAutoDetectMode'),
    switchingToBrowserMode: keyGen('switchingToBrowserMode'),
    fetchError: keyGen('fetchError')
  } as const;
})(); 