/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * 客户端相关键 (Client related keys)
 */
export const CLIENT_KEYS = (() => {
  const keyGen = createKeyGenerator('client');
  return {
    // 连接相关 (Connection related)
    connecting: keyGen('connecting'),
    connected: keyGen('connected'),
    connectionFailed: keyGen('connectionFailed'),
    disconnected: keyGen('disconnected'),
    reconnecting: keyGen('reconnecting'),
    
    // 错误相关 (Error related)
    clientError: keyGen('clientError'),
    transportError: keyGen('transportError'),
    requestError: keyGen('requestError'),
    fetchError: keyGen('fetchError'),
    
    // 请求相关 (Request related)
    requestStarted: keyGen('requestStarted'),
    requestCompleted: keyGen('requestCompleted'),
    requestCancelled: keyGen('requestCancelled'),
    
    // 内容相关 (Content related)
    fetchingHtml: keyGen('fetchingHtml'),
    fetchingJson: keyGen('fetchingJson'),
    fetchingText: keyGen('fetchingText'),
    fetchingMarkdown: keyGen('fetchingMarkdown'),
    fetchSuccessful: keyGen('fetchSuccessful'),
    contentLength: keyGen('contentLength'),
    
    // 分段内容相关 (Chunked content related)
    hasMoreChunks: keyGen('hasMoreChunks'),
    nextChunkCommand: keyGen('nextChunkCommand'),
    chunkInfoSaved: keyGen('chunkInfoSaved'),
    chunkInfoSaveError: keyGen('chunkInfoSaveError'),
    chunkInfoLoaded: keyGen('chunkInfoLoaded'),
    chunkInfoLoadError: keyGen('chunkInfoLoadError'),
    noChunkInfo: keyGen('noChunkInfo'),
    fetchingNextChunk: keyGen('fetchingNextChunk'),
    chunkUsageInfo: keyGen('chunkUsageInfo'),
    invalidChunkIndex: keyGen('invalidChunkIndex'),
    missingMethodOrUrl: keyGen('missingMethodOrUrl'),
    fetchingAllChunks: keyGen('fetchingAllChunks'),
    fetchingChunk: keyGen('fetchingChunk'),
    fetchChunkFailed: keyGen('fetchChunkFailed'),
    allChunksFetched: keyGen('allChunksFetched'),
    allChunksCommand: keyGen('allChunksCommand'),
    allChunksUsageInfo: keyGen('allChunksUsageInfo'),
    
    // 调试相关 (Debug related)
    debugMode: keyGen('debugMode'),
    debugInfo: keyGen('debugInfo'),
    error: keyGen('error'),
    callTool: keyGen('callTool'),
    callToolSuccess: keyGen('callToolSuccess'),
    callToolError: keyGen('callToolError'),
    statusCodeDetected: keyGen('statusCodeDetected'),
    usageInfo: keyGen('usageInfo'),
    exampleUsage: keyGen('exampleUsage'),
    invalidJson: keyGen('invalidJson'),
    usingCommandLineProxy: keyGen('usingCommandLineProxy'),
    invalidProxyFormat: keyGen('invalidProxyFormat'),
    usingEnvProxy: keyGen('usingEnvProxy'),
    usingShellProxy: keyGen('usingShellProxy'),
    noShellProxy: keyGen('noShellProxy'),
    systemProxyDisabled: keyGen('systemProxyDisabled'),
    usingSystemProxy: keyGen('usingSystemProxy'),
    noSystemProxy: keyGen('noSystemProxy'),
    requestFailed: keyGen('requestFailed'),
    fatalError: keyGen('fatalError'),
    startingServer: keyGen('startingServer'),
    fetchingUrl: keyGen('fetchingUrl'),
    usingMode: keyGen('usingMode'),
    fetchFailed: keyGen('fetchFailed'),
    fetchSuccess: keyGen('fetchSuccess'),
    browserModeNeeded: keyGen('browserModeNeeded'),
    retryingWithBrowser: keyGen('retryingWithBrowser'),
    browserModeFetchFailed: keyGen('browserModeFetchFailed'),
    browserModeFetchSuccess: keyGen('browserModeFetchSuccess'),
    serverClosed: keyGen('serverClosed'),
    proxySet: keyGen('proxySet'),
    // 模式相关 (Mode related)
    usingStandardMode: keyGen('usingStandardMode'),
    usingBrowserMode: keyGen('usingBrowserMode'),
    
    // 参数相关 (Parameters related)
    sendingParameters: keyGen('sendingParameters'),
    limitingChunks: keyGen('limitingChunks'),
    maxChunksUsageInfo: keyGen('maxChunksUsageInfo')
  } as const;
})(); 