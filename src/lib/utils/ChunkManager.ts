/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { log, COMPONENTS } from '../logger.js';
import { v4 as uuidv4 } from 'uuid';
import { TemplateUtils } from './TemplateUtils.js';

/**
 * 分段内容管理器 (Chunk content manager)
 * 用于存储和管理分段内容 (Used to store and manage chunked content)
 */
export class ChunkManager {
  /**
   * 存储分段内容的Map (Map to store chunked content)
   * 键为分段ID，值为分段内容数组 (Key is chunk ID, value is array of chunk content)
   */
  private static chunks: Map<string, string[]> = new Map();
  
  /**
   * 分段内容的过期时间（毫秒） (Expiration time for chunked content in milliseconds)
   * 默认为10分钟 (Default is 10 minutes)
   */
  private static readonly EXPIRATION_TIME = 10 * 60 * 1000; // 10分钟
  
  /**
   * 分段内容的过期时间Map (Map to store expiration time for chunked content)
   * 键为分段ID，值为过期时间戳 (Key is chunk ID, value is expiration timestamp)
   */
  private static expirations: Map<string, number> = new Map();
  
  /**
   * 存储分段内容 (Store chunked content)
   * @param chunks 分段内容数组 (Array of chunk content)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 分段ID (Chunk ID)
   */
  public static storeChunks(chunks: string[], debug: boolean = false): string {
    // 清理过期的分段内容 (Clean up expired chunks)
    this.cleanupExpiredChunks(debug);
    
    // 生成唯一的分段ID (Generate unique chunk ID)
    const chunkId = uuidv4();
    
    // 替换所有分段中的占位符 (Replace placeholders in all chunks)
    const processedChunks = chunks.map(chunk => {
      // 创建替换项 (Create replacements)
      const replacements: Record<string, string> = {
        chunkId: chunkId
      };
      
      // 使用TemplateUtils替换占位符 (Use TemplateUtils to replace placeholders)
      return TemplateUtils.replaceTemplateVariables(chunk, replacements);
    });
    
    // 存储分段内容 (Store chunked content)
    this.chunks.set(chunkId, processedChunks);
    
    // 设置过期时间 (Set expiration time)
    const expirationTime = Date.now() + this.EXPIRATION_TIME;
    this.expirations.set(chunkId, expirationTime);
    
    log('chunkManager.storedChunks', debug, { 
      chunkId, 
      totalChunks: chunks.length,
      expiresAt: new Date(expirationTime).toISOString()
    }, COMPONENTS.CHUNK_MANAGER);
    
    return chunkId;
  }
  
  /**
   * 获取分段内容 (Get chunked content)
   * @param chunkId 分段ID (Chunk ID)
   * @param index 分段索引 (Chunk index)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 分段内容 (Chunk content)
   */
  public static getChunk(chunkId: string, index: number, debug: boolean = false): string | null {
    // 检查分段ID是否存在 (Check if chunk ID exists)
    if (!this.chunks.has(chunkId)) {
      log('chunkManager.chunkIdNotFound', debug, { chunkId }, COMPONENTS.CHUNK_MANAGER);
      return null;
    }
    
    // 获取分段内容数组 (Get chunked content array)
    const chunks = this.chunks.get(chunkId)!;
    
    // 检查分段索引是否有效 (Check if chunk index is valid)
    if (index < 0 || index >= chunks.length) {
      log('chunkManager.invalidChunkIndex', debug, { 
        chunkId, 
        requestedIndex: index, 
        totalChunks: chunks.length 
      }, COMPONENTS.CHUNK_MANAGER);
      return null;
    }
    
    // 更新过期时间 (Update expiration time)
    const expirationTime = Date.now() + this.EXPIRATION_TIME;
    this.expirations.set(chunkId, expirationTime);
    
    log('chunkManager.retrievedChunk', debug, { 
      chunkId, 
      index, 
      totalChunks: chunks.length,
      expiresAt: new Date(expirationTime).toISOString()
    }, COMPONENTS.CHUNK_MANAGER);
    
    // 返回指定索引的分段内容 (Return chunk content at specified index)
    return chunks[index];
  }
  
  /**
   * 获取分段总数 (Get total number of chunks)
   * @param chunkId 分段ID (Chunk ID)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 分段总数 (Total number of chunks)
   */
  public static getTotalChunks(chunkId: string, debug: boolean = false): number {
    // 检查分段ID是否存在 (Check if chunk ID exists)
    if (!this.chunks.has(chunkId)) {
      log('chunkManager.chunkIdNotFound', debug, { chunkId }, COMPONENTS.CHUNK_MANAGER);
      return 0;
    }
    
    // 返回分段总数 (Return total number of chunks)
    return this.chunks.get(chunkId)!.length;
  }
  
  /**
   * 清理过期的分段内容 (Clean up expired chunks)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   */
  private static cleanupExpiredChunks(debug: boolean = false): void {
    const now = Date.now();
    let expiredCount = 0;
    
    // 遍历所有分段ID (Iterate through all chunk IDs)
    for (const [chunkId, expirationTime] of this.expirations.entries()) {
      // 如果分段内容已过期，则删除 (If chunk content has expired, delete it)
      if (expirationTime < now) {
        this.chunks.delete(chunkId);
        this.expirations.delete(chunkId);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      log('chunkManager.cleanedUpExpiredChunks', debug, { 
        expiredCount,
        remainingChunks: this.chunks.size
      }, COMPONENTS.CHUNK_MANAGER);
    }
  }
} 