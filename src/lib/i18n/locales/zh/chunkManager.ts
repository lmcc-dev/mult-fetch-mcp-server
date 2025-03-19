/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CHUNK_MANAGER_KEYS } from '../../keys/chunkManager.js';

/**
 * 分段管理相关的中文文本 (Chinese texts related to chunk management)
 */
export const chunkManagerZh = {
  // 分段管理基础操作 (Basic chunk management operations)
  [CHUNK_MANAGER_KEYS.startingManager]: "启动分块管理器",
  [CHUNK_MANAGER_KEYS.creatingChunks]: "正在创建内容分块",
  [CHUNK_MANAGER_KEYS.splittingContent]: "正在将内容分割成块。内容大小：{{contentSize}} 字节",
  [CHUNK_MANAGER_KEYS.creatingChunk]: "正在创建第 {{index}}/{{total}} 个分块",
  [CHUNK_MANAGER_KEYS.chunksCreated]: "已从内容创建 {{count}} 个分块",
  [CHUNK_MANAGER_KEYS.calculatingChunks]: "正在计算所需的分块数量",
  [CHUNK_MANAGER_KEYS.totalChunks]: "总分块数：{{total}}，内容大小：{{contentSize}} 字节，分块大小：{{chunkSize}} 字节",
  [CHUNK_MANAGER_KEYS.storedChunks]: "已存储的分块：{{count}} 个",
  [CHUNK_MANAGER_KEYS.cleanedUpExpiredChunks]: "已清理 {{count}} 个过期分块",
  
  // 分段相关错误 (Chunk related errors)
  [CHUNK_MANAGER_KEYS.invalidChunkId]: "无效的分块ID：{{chunkId}}",
  [CHUNK_MANAGER_KEYS.chunkNotFound]: "找不到分块：{{chunkId}}",
  [CHUNK_MANAGER_KEYS.chunkIdNotFound]: "存储中未找到分块ID：{{chunkId}}",
  [CHUNK_MANAGER_KEYS.invalidByteRange]: "无效的字节范围：起始={{start}}，结束={{end}}",
  [CHUNK_MANAGER_KEYS.invalidStartCursor]: "无效的起始游标值：{{cursor}}",
  [CHUNK_MANAGER_KEYS.splitError]: "分割内容时出错：{{error}}",
  [CHUNK_MANAGER_KEYS.sizeInfoNotFound]: "未找到分块的大小信息：{{chunkId}}",
  
  // 分段内容控制 (Chunk content control)
  [CHUNK_MANAGER_KEYS.gettingChunk]: "正在获取分块：{{chunkId}}",
  [CHUNK_MANAGER_KEYS.chunkRetrieved]: "已检索分块：{{chunkId}}，大小：{{size}} 字节",
  [CHUNK_MANAGER_KEYS.retrievedChunkBySize]: "已按大小参数检索分块：起始游标={{startCursor}}，大小={{size}}",
  [CHUNK_MANAGER_KEYS.contentExceedsLimit]: "内容超过大小限制：{{contentSize}} 字节（限制：{{limit}} 字节）",
  [CHUNK_MANAGER_KEYS.byteRangeSplit]: "按字节范围分割内容：{{start}}-{{end}}，共 {{total}} 字节",
  [CHUNK_MANAGER_KEYS.byteLimitApplied]: "已应用字节限制：{{limit}} 字节",
  
  // 进度和统计 (Progress and statistics)
  [CHUNK_MANAGER_KEYS.processingChunk]: "正在处理第 {{current}}/{{total}} 个分块",
  [CHUNK_MANAGER_KEYS.chunkStats]: "分块统计 - 总数：{{total}}，平均大小：{{avgSize}} 字节，最大大小：{{maxSize}} 字节",
  [CHUNK_MANAGER_KEYS.remainingChunks]: "剩余分块：{{remaining}}/{{total}}",
  [CHUNK_MANAGER_KEYS.chunkProgress]: "分块进度：完成 {{percent}}%（{{processed}}/{{total}} 个分块）"
}; 