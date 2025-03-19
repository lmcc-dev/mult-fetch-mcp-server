/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

const PREFIX = 'chunkManager';
const keyGen = createKeyGenerator(PREFIX);

/**
 * 分段管理相关的国际化键 (Internationalization keys related to chunk management)
 */
export const CHUNK_MANAGER_KEYS = {
  // 分段管理基础操作 (Basic chunk management operations)
  startingManager: keyGen('startingManager'),
  creatingChunks: keyGen('creatingChunks'),
  splittingContent: keyGen('splittingContent'),
  creatingChunk: keyGen('creatingChunk'),
  chunksCreated: keyGen('chunksCreated'),
  calculatingChunks: keyGen('calculatingChunks'),
  totalChunks: keyGen('totalChunks'),
  storedChunks: keyGen('storedChunks'),
  cleanedUpExpiredChunks: keyGen('cleanedUpExpiredChunks'),
  
  // 分段相关错误 (Chunk related errors)
  invalidChunkId: keyGen('invalidChunkId'),
  chunkNotFound: keyGen('chunkNotFound'),
  chunkIdNotFound: keyGen('chunkIdNotFound'),
  invalidByteRange: keyGen('invalidByteRange'),
  invalidStartCursor: keyGen('invalidStartCursor'),
  splitError: keyGen('splitError'),
  sizeInfoNotFound: keyGen('sizeInfoNotFound'),
  
  // 分段内容控制 (Chunk content control)
  gettingChunk: keyGen('gettingChunk'),
  chunkRetrieved: keyGen('chunkRetrieved'),
  retrievedChunkBySize: keyGen('retrievedChunkBySize'),
  contentExceedsLimit: keyGen('contentExceedsLimit'),
  byteRangeSplit: keyGen('byteRangeSplit'),
  byteLimitApplied: keyGen('byteLimitApplied'),
  
  // 进度和统计 (Progress and statistics)
  processingChunk: keyGen('processingChunk'),
  chunkStats: keyGen('chunkStats'),
  remainingChunks: keyGen('remainingChunks'),
  chunkProgress: keyGen('chunkProgress')
} as const; 