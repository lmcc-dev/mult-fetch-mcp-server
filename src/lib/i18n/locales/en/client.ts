/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CLIENT_KEYS } from '../../keys/client.js';

// 客户端相关消息 (Client related messages)
export default {
  // 连接相关 (Connection related)
  [CLIENT_KEYS.connecting]: 'Connecting to MCP server...',
  [CLIENT_KEYS.connected]: 'Connected to MCP server',
  [CLIENT_KEYS.connectionFailed]: 'Failed to connect to MCP server: {{error}}',
  [CLIENT_KEYS.disconnected]: 'Disconnected from MCP server',
  [CLIENT_KEYS.reconnecting]: 'Reconnecting to MCP server...',

  // 错误相关 (Error related)
  [CLIENT_KEYS.clientError]: 'Client error: {{error}}',
  [CLIENT_KEYS.transportError]: 'Transport error: {{error}}',
  [CLIENT_KEYS.requestError]: 'Request error: {{error}}',
  [CLIENT_KEYS.fetchError]: 'Fetch error: {{error}}',

  // 请求相关 (Request related)
  [CLIENT_KEYS.requestStarted]: 'Request started: {{id}}',
  [CLIENT_KEYS.requestCompleted]: 'Request completed: {{id}}',
  [CLIENT_KEYS.requestCancelled]: 'Request cancelled: {{id}}',

  // 内容相关 (Content related)
  [CLIENT_KEYS.fetchingHtml]: 'Fetching HTML from {{url}}',
  [CLIENT_KEYS.fetchingJson]: 'Fetching JSON from {{url}}',
  [CLIENT_KEYS.fetchingText]: 'Fetching text from {{url}}',
  [CLIENT_KEYS.fetchingMarkdown]: 'Fetching Markdown from {{url}}',
  [CLIENT_KEYS.fetchSuccessful]: 'Fetch successful',
  [CLIENT_KEYS.contentLength]: 'Content length: {{length}} bytes',

  // 分段内容相关 (Chunked content related)
  [CLIENT_KEYS.hasMoreChunks]: 'Content is chunked: {{current}}/{{total}} chunks',
  [CLIENT_KEYS.nextChunkCommand]: 'To fetch the next chunk, run: {{command}}',
  [CLIENT_KEYS.chunkInfoSaved]: 'Chunk information saved to {{file}}',
  [CLIENT_KEYS.chunkInfoSaveError]: 'Failed to save chunk information: {{error}}',
  [CLIENT_KEYS.chunkInfoLoaded]: 'Chunk information loaded from {{file}}',
  [CLIENT_KEYS.chunkInfoLoadError]: 'Failed to load chunk information: {{error}}',
  [CLIENT_KEYS.noChunkInfo]: 'No previous chunk information found',
  [CLIENT_KEYS.fetchingNextChunk]: 'Fetching next chunk ({{chunkIndex}}/{{total}})',
  [CLIENT_KEYS.chunkUsageInfo]: 'For chunked content: Use --all-chunks to fetch all chunks at once',
  [CLIENT_KEYS.invalidChunkIndex]: 'Invalid chunk index: {{index}}',
  [CLIENT_KEYS.missingMethodOrUrl]: 'Missing method or URL parameters',
  [CLIENT_KEYS.fetchingAllChunks]: 'Fetching all chunks, total: {{total}}',
  [CLIENT_KEYS.fetchingChunk]: 'Fetching chunk {{index}}/{{total}}',
  [CLIENT_KEYS.fetchChunkFailed]: 'Failed to fetch chunk {{index}}: {{error}}',
  [CLIENT_KEYS.allChunksFetched]: 'All chunks fetched, total: {{total}}',
  [CLIENT_KEYS.allChunksCommand]: 'To fetch all chunks at once, run: {{command}}',
  [CLIENT_KEYS.allChunksUsageInfo]: 'Use --all-chunks to fetch all chunks in a single command',
  [CLIENT_KEYS.limitingChunks]: 'Limiting chunks to {{limit}} (total: {{total}})',
  [CLIENT_KEYS.maxChunksUsageInfo]: 'Use --max-chunks=N to limit the number of chunks to fetch (default: {{default}})',

  // 新增的分段内容相关键 (New chunked content related keys)
  [CLIENT_KEYS.responseStructure]: '\n--- Response structure ---\n{{structure}}\n--- End of response structure ---\n',
  [CLIENT_KEYS.parsedByteChunkInfo]: '\n--- Parsed byte-level chunk information ---\nchunkId: {{chunkId}}\nfetchedBytes: {{fetchedBytes}}\ntotalBytes: {{totalBytes}}\nremainingBytes: {{remainingBytes}}\nestimatedRemainingRequests: {{estimatedRemainingRequests}}\n--- End of parsed byte-level chunk information ---\n',
  [CLIENT_KEYS.parsedChunkInfo]: '\n--- Parsed chunk information ---\nchunkId: {{chunkId}}\ncurrentChunk: {{currentChunk}}\ntotalChunks: {{totalChunks}}\nhasMoreChunks: {{hasMoreChunks}}\n--- End of parsed chunk information ---\n',
  [CLIENT_KEYS.chunkInfoParsed]: 'Parsed chunk information: isChunked={{isChunked}}, hasMoreChunks={{hasMoreChunks}}, isLastChunk={{isLastChunk}}, chunkId={{chunkId}}, currentChunk={{currentChunk}}, totalChunks={{totalChunks}}, fetchedBytes={{fetchedBytes}}, totalBytes={{totalBytes}}, remainingBytes={{remainingBytes}}',
  [CLIENT_KEYS.chunkLimitNotice]: '\nNote: Content has {{total}} chunks, but only fetching first {{fetching}} chunks',
  [CLIENT_KEYS.chunkLimitHint]: 'To fetch more chunks, use --max-chunks=N parameter\n',
  [CLIENT_KEYS.fetchingChunkProgress]: '\nFetching chunk {{current}}/{{total}}...',
  [CLIENT_KEYS.fetchChunkFailedError]: '\nFailed to fetch chunk {{index}}: {{error}}\n',
  [CLIENT_KEYS.chunkContent]: '\n--- Chunk {{index}} ---\n',
  [CLIENT_KEYS.chunkSeparator]: '\n' + '-'.repeat(80),
  [CLIENT_KEYS.partialChunksFetched]: '\nFetched {{fetched}}/{{total}} chunks\n',
  [CLIENT_KEYS.completeChunksFetched]: '\nAll chunks fetched, total: {{total}}\n',
  [CLIENT_KEYS.fetchingChunksErrorMessage]: '\nError fetching chunks: {{error}}\n',
  [CLIENT_KEYS.contentChunkedBytes]: '\nContent is chunked: retrieved {{fetched}} bytes of total {{total}} bytes',
  [CLIENT_KEYS.contentChunkedCount]: '\nContent is chunked: {{current}}/{{total}} chunks',
  [CLIENT_KEYS.fetchAllChunksHint]: 'To fetch all chunks, run:\n{{command}}\n',
  [CLIENT_KEYS.fetchLimitedChunksHint]: 'To fetch first {{limit}} chunks, run:\n{{command}}\n',
  [CLIENT_KEYS.firstChunkCompleted]: '\nFirst chunk completed: {{index}}/{{total}}\n',
  [CLIENT_KEYS.chunkProgress]: '\nChunk {{current}}/{{total}} completed, retrieved {{fetchedBytes}}/{{totalBytes}} bytes ({{percent}}%)\n',
  [CLIENT_KEYS.chunkCompleted]: '\nChunk {{current}}/{{total}} completed\n',
  [CLIENT_KEYS.recalculatedTotalChunks]: 'Recalculated total chunks: {{totalChunks}} (based on totalBytes: {{totalBytes}}, fetchedBytes: {{fetchedBytes}}, remainingBytes: {{remainingBytes}}, contentSizeLimit: {{contentSizeLimit}})',
  [CLIENT_KEYS.fetchingChunksError]: 'Error occurred while fetching chunks: {{error}}',

  // 调试相关 (Debug related)
  [CLIENT_KEYS.debugMode]: 'Debug mode: {{enabled}}',
  [CLIENT_KEYS.debugInfo]: 'Debug info: {{info}}',

  // 其他键 (Other keys)
  [CLIENT_KEYS.error]: 'Error: {{error}}',
  [CLIENT_KEYS.callTool]: 'Calling tool: {{tool}}',
  [CLIENT_KEYS.callToolSuccess]: 'Tool call successful: {{tool}}',
  [CLIENT_KEYS.callToolError]: 'Tool call error: {{tool}} - {{error}}',
  [CLIENT_KEYS.statusCodeDetected]: 'Status code detected: {{statusCode}}',
  [CLIENT_KEYS.usageInfo]: 'Usage: {{usage}}',
  [CLIENT_KEYS.exampleUsage]: 'Example usage: {{example}}',
  [CLIENT_KEYS.invalidJson]: 'Invalid JSON: {{error}}',
  [CLIENT_KEYS.usingCommandLineProxy]: 'Using command line proxy: {{proxy}}',
  [CLIENT_KEYS.invalidProxyFormat]: 'Invalid proxy format: {{proxy}}',
  [CLIENT_KEYS.usingEnvProxy]: 'Using environment proxy: {{proxy}}',
  [CLIENT_KEYS.usingShellProxy]: 'Using shell proxy: {{proxy}}',
  [CLIENT_KEYS.noShellProxy]: 'No shell proxy found',
  [CLIENT_KEYS.systemProxyDisabled]: 'System proxy disabled',
  [CLIENT_KEYS.usingSystemProxy]: 'Using system proxy: {{proxy}}',
  [CLIENT_KEYS.noSystemProxy]: 'No system proxy',
  [CLIENT_KEYS.requestFailed]: 'Request failed: {{error}}',
  [CLIENT_KEYS.fatalError]: 'Fatal error: {{error}}',
  [CLIENT_KEYS.startingServer]: 'Starting server...',
  [CLIENT_KEYS.fetchingUrl]: 'Fetching URL: {{url}}',
  [CLIENT_KEYS.usingMode]: 'Using {{mode}} mode',
  [CLIENT_KEYS.fetchFailed]: 'Fetch failed: {{error}}',
  [CLIENT_KEYS.fetchSuccess]: 'Fetch successful',
  [CLIENT_KEYS.browserModeNeeded]: 'Browser mode needed',
  [CLIENT_KEYS.retryingWithBrowser]: 'Retrying with browser mode',
  [CLIENT_KEYS.browserModeFetchFailed]: 'Browser mode fetch failed: {{error}}',
  [CLIENT_KEYS.browserModeFetchSuccess]: 'Browser mode fetch successful',
  [CLIENT_KEYS.serverClosed]: 'Server closed',
  [CLIENT_KEYS.proxySet]: 'Proxy set: {{proxy}}',

  // 模式相关 (Mode related)
  [CLIENT_KEYS.usingStandardMode]: 'Using standard mode',
  [CLIENT_KEYS.usingBrowserMode]: 'Using browser mode',
  [CLIENT_KEYS.switchingToBrowserMode]: 'Switching to browser mode',

  // 参数相关 (Parameters related)
  [CLIENT_KEYS.sendingParameters]: 'Sending parameters to MCP: {{params}}',
  [CLIENT_KEYS.invalidUrl]: 'Invalid URL: {{url}}',
  [CLIENT_KEYS.missingUrl]: 'Missing URL parameter',
  [CLIENT_KEYS.missingStartCursor]: 'Missing startCursor parameter',

  // 其他 (Others)
  [CLIENT_KEYS.alternateUsageInfo]: 'For alternate formats, use --plaintext or --markdown flags'
}; 