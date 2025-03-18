/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

export default {
  // 客户端相关 (Client related)
  'client.startingServer': 'Starting server...',
  'client.usingEnvProxy': 'Using environment proxy: {proxy}',
  'client.usingSystemProxy': 'Using system proxy: {proxy}',
  'client.noSystemProxy': 'No system proxy found',
  'client.systemProxyDisabled': 'System proxy detection disabled',
  'client.proxySet': 'Proxy set: {proxy}',
  'client.fetchingUrl': 'Fetching URL: {url}',
  'client.usingBrowserMode': 'Using browser mode',
  'client.usingStandardMode': 'Using standard mode',
  'client.switchingToBrowserMode': 'Switching to browser mode',
  'client.fetchSuccessful': 'Fetch successful',
  'client.fetchFailed': 'Fetch failed: {error}',
  'client.fatalError': 'Fatal error: {error}',
  'client.serverClosed': 'Server closed',
  
  // 使用信息 (Usage information)
  'client.usageInfo': 'Usage: {info}',
  'client.exampleUsage': 'Example: {example}',
  'client.chunkUsageInfo': 'To fetch a specific chunk, use --chunk-id and --chunk-index parameters',
  'client.allChunksUsageInfo': 'To fetch all chunks, use --all-chunks parameter',
  'client.invalidJson': 'Invalid JSON: {error}',
  'client.usingCommandLineProxy': 'Using command line proxy: {proxy}',
  'client.invalidProxyFormat': 'Invalid proxy format: {proxy}',
  
  // 分段内容相关 (Chunked content related)
  'client.chunkInfoSaved': 'Chunk info saved to {file}, current: {current}, total: {total}',
  'client.chunkInfoSaveError': 'Error saving chunk info: {error}',
  'client.chunkInfoLoaded': 'Chunk info loaded from {file}, current: {current}, total: {total}',
  'client.chunkInfoLoadError': 'Error loading chunk info: {error}',
  'client.fetchingAllChunks': 'Fetching all chunks, total: {total}',
  'client.fetchingChunk': 'Fetching chunk {index}/{total}',
  'client.fetchChunkFailed': 'Failed to fetch chunk {index}: {error}',
  'client.allChunksFetched': 'All chunks fetched, total: {total}',
  'client.hasMoreChunks': 'Content is chunked: {current}/{total}',
  'client.allChunksCommand': 'To fetch all chunks, run: {command}',
  
  // 参数相关 (Parameters related)
  'client.sendingParameters': 'Sending parameters to MCP: {params}',
  'client.limitingChunks': 'Limiting chunks to {limit} (total: {total})',
  'client.maxChunksUsageInfo': 'Use --max-chunks=N to limit the number of chunks to fetch (default: {default})',
  
  // 错误相关 (Error related)
  'errors.forbidden': 'Access forbidden (HTTP 403)',
  'errors.cloudflareProtection': 'Cloudflare protection detected',
  'errors.captchaRequired': 'CAPTCHA verification required',
  'errors.timeout': 'Request timed out after {timeout}',
  'errors.connectionProblem': 'Connection problem detected'
}; 