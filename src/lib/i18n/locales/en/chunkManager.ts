/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CHUNK_MANAGER_KEYS } from '../../keys/chunkManager.js';

/**
 * 分段管理相关的英文文本 (English texts related to chunk management)
 */
export const chunkManagerEn = {
  // 分段管理基础操作 (Basic chunk management operations)
  [CHUNK_MANAGER_KEYS.startingManager]: "Starting chunk manager",
  [CHUNK_MANAGER_KEYS.creatingChunks]: "Creating content chunks",
  [CHUNK_MANAGER_KEYS.splittingContent]: "Splitting content into chunks. Content size: {{contentSize}} bytes",
  [CHUNK_MANAGER_KEYS.creatingChunk]: "Creating chunk {{index}} of {{total}}",
  [CHUNK_MANAGER_KEYS.chunksCreated]: "Created {{count}} chunks from content",
  [CHUNK_MANAGER_KEYS.calculatingChunks]: "Calculating number of chunks needed",
  [CHUNK_MANAGER_KEYS.totalChunks]: "Total chunks: {{total}}, content size: {{contentSize}} bytes, chunk size: {{chunkSize}} bytes",
  [CHUNK_MANAGER_KEYS.storedChunks]: "Stored chunks: {{count}}",
  [CHUNK_MANAGER_KEYS.cleanedUpExpiredChunks]: "Cleaned up {{count}} expired chunks",
  
  // 分段相关错误 (Chunk related errors)
  [CHUNK_MANAGER_KEYS.invalidChunkId]: "Invalid chunk ID: {{chunkId}}",
  [CHUNK_MANAGER_KEYS.chunkNotFound]: "Chunk not found: {{chunkId}}",
  [CHUNK_MANAGER_KEYS.chunkIdNotFound]: "Chunk ID not found in storage: {{chunkId}}",
  [CHUNK_MANAGER_KEYS.invalidByteRange]: "Invalid byte range: start={{start}}, end={{end}}",
  [CHUNK_MANAGER_KEYS.invalidStartCursor]: "Invalid start cursor value: {{cursor}}",
  [CHUNK_MANAGER_KEYS.splitError]: "Error splitting content: {{error}}",
  [CHUNK_MANAGER_KEYS.sizeInfoNotFound]: "Size information not found for chunk: {{chunkId}}",
  
  // 分段内容控制 (Chunk content control)
  [CHUNK_MANAGER_KEYS.gettingChunk]: "Getting chunk: {{chunkId}}",
  [CHUNK_MANAGER_KEYS.chunkRetrieved]: "Chunk retrieved: {{chunkId}}, size: {{size}} bytes",
  [CHUNK_MANAGER_KEYS.retrievedChunkBySize]: "Retrieved chunk by size parameters: startCursor={{startCursor}}, size={{size}}",
  [CHUNK_MANAGER_KEYS.contentExceedsLimit]: "Content exceeds size limit: {{contentSize}} bytes (limit: {{limit}} bytes)",
  [CHUNK_MANAGER_KEYS.byteRangeSplit]: "Splitting content by byte range: {{start}}-{{end}} of {{total}} bytes",
  [CHUNK_MANAGER_KEYS.byteLimitApplied]: "Byte limit applied: {{limit}} bytes",
  
  // 进度和统计 (Progress and statistics)
  [CHUNK_MANAGER_KEYS.processingChunk]: "Processing chunk {{current}} of {{total}}",
  [CHUNK_MANAGER_KEYS.chunkStats]: "Chunk statistics - Total: {{total}}, Average size: {{avgSize}} bytes, Max size: {{maxSize}} bytes",
  [CHUNK_MANAGER_KEYS.remainingChunks]: "Remaining chunks: {{remaining}} of {{total}}",
  [CHUNK_MANAGER_KEYS.chunkProgress]: "Chunk progress: {{percent}}% complete ({{processed}}/{{total}} chunks)"
}; 