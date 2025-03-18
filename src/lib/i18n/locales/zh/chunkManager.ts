/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CHUNK_MANAGER_KEYS } from '../../keys/chunkManager.js';

/**
 * 分块管理器相关的中文文本 (Chinese texts related to chunk manager)
 */
export const chunkManagerZh = {
  [CHUNK_MANAGER_KEYS.storedChunks]: '存储分段内容，ID: {{chunkId}}, 总分段数: {{totalChunks}}, 过期时间: {{expiresAt}}',
  [CHUNK_MANAGER_KEYS.chunkIdNotFound]: '未找到分段ID: {{chunkId}}',
  [CHUNK_MANAGER_KEYS.invalidChunkIndex]: '无效的分段索引，ID: {{chunkId}}, 请求索引: {{requestedIndex}}, 总分段数: {{totalChunks}}',
  [CHUNK_MANAGER_KEYS.retrievedChunk]: '获取分段内容，ID: {{chunkId}}, 索引: {{index}}, 总分段数: {{totalChunks}}, 过期时间: {{expiresAt}}',
  [CHUNK_MANAGER_KEYS.cleanedUpExpiredChunks]: '清理过期分段内容，已清理: {{expiredCount}}, 剩余: {{remainingChunks}}'
}; 