/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CHUNK_MANAGER_KEYS } from '../../keys/chunkManager.js';

/**
 * 分块管理器相关的英文文本 (English texts related to chunk manager)
 */
export const chunkManagerEn = {
  [CHUNK_MANAGER_KEYS.storedChunks]: 'Stored chunk content, ID: {{chunkId}}, total chunks: {{totalChunks}}, expires at: {{expiresAt}}',
  [CHUNK_MANAGER_KEYS.chunkIdNotFound]: 'Chunk ID not found: {{chunkId}}',
  [CHUNK_MANAGER_KEYS.invalidChunkIndex]: 'Invalid chunk index, ID: {{chunkId}}, requested index: {{requestedIndex}}, total chunks: {{totalChunks}}',
  [CHUNK_MANAGER_KEYS.retrievedChunk]: 'Retrieved chunk content, ID: {{chunkId}}, index: {{index}}, total chunks: {{totalChunks}}, expires at: {{expiresAt}}',
  [CHUNK_MANAGER_KEYS.cleanedUpExpiredChunks]: 'Cleaned up expired chunks, expired: {{expiredCount}}, remaining: {{remainingChunks}}'
}; 