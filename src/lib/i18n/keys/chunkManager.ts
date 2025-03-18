/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * 分段管理器键值 (Chunk manager keys)
 */
export const CHUNK_MANAGER_KEYS = (() => {
  const keyGen = createKeyGenerator('chunkManager');
  return {
    // 分段存储相关 (Chunk storage related)
    storedChunks: keyGen('storedChunks'),
    chunkIdNotFound: keyGen('chunkIdNotFound'),
    invalidChunkIndex: keyGen('invalidChunkIndex'),
    retrievedChunk: keyGen('retrievedChunk'),
    cleanedUpExpiredChunks: keyGen('cleanedUpExpiredChunks')
  } as const;
})(); 