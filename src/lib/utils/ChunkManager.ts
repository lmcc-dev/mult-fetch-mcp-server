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
   * 存储分段内容大小信息的Map (Map to store chunk size information)
   * 键为分段ID，值为{totalBytes, fetchedBytes}对象 (Key is chunk ID, value is {totalBytes, fetchedBytes} object)
   */
  private static sizeInfo: Map<string, {totalBytes: number, fetchedBytes: number[]}> = new Map();
  
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
   * @param totalBytes 原始内容总字节数 (Total bytes of original content)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 分段ID (Chunk ID)
   */
  public static storeChunks(chunks: string[], totalBytes: number, debug: boolean = false): string {
    // 清理过期的分段内容 (Clean up expired chunks)
    this.cleanupExpiredChunks(debug);
    
    // 生成唯一的分段ID (Generate unique chunk ID)
    const chunkId = uuidv4();
    
    // 计算每个分块的字节大小 (Calculate byte size of each chunk)
    const chunkSizes = chunks.map(chunk => Buffer.byteLength(chunk, 'utf8'));
    
    // 存储分段内容 (Store chunked content)
    this.chunks.set(chunkId, chunks);
    
    // 存储分段大小信息 (Store chunk size information)
    this.sizeInfo.set(chunkId, {
      totalBytes,
      fetchedBytes: chunkSizes
    });
    
    // 设置过期时间 (Set expiration time)
    const expirationTime = Date.now() + this.EXPIRATION_TIME;
    this.expirations.set(chunkId, expirationTime);
    
    log('chunkManager.storedChunks', debug, { 
      chunkId, 
      count: chunks.length,
      totalChunks: chunks.length,
      totalBytes,
      expiresAt: new Date(expirationTime).toISOString()
    }, COMPONENTS.CHUNK_MANAGER);
    
    return chunkId;
  }
  
  /**
   * 获取分段内容 (Get chunked content)
   * @param chunkId 分段ID (Chunk ID)
   * @param startCursor 开始游标位置，指示从哪个字节开始获取 (Start cursor position, indicating from which byte to start fetching)
   * @param sizeLimit 本次获取的最大字节数 (Maximum bytes to fetch in this request)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 分段内容，包含获取信息 (Chunk content with fetch information)
   */
  public static getChunkBySize(
    chunkId: string, 
    startCursor: number = 0, 
    sizeLimit: number = 50 * 1024, 
    debug: boolean = false
  ): {content: string, fetchedBytes: number, remainingBytes: number, isLastChunk: boolean, totalBytes: number} | null {
    // 检查分段ID是否存在 (Check if chunk ID exists)
    if (!this.chunks.has(chunkId) || !this.sizeInfo.has(chunkId)) {
      log('chunkManager.chunkIdNotFound', debug, { chunkId }, COMPONENTS.CHUNK_MANAGER);
      return null;
    }
    
    // 获取分段内容数组和大小信息 (Get chunked content array and size information)
    const chunks = this.chunks.get(chunkId)!;
    const { totalBytes, fetchedBytes } = this.sizeInfo.get(chunkId)!;
    
    // 验证startCursor是否有效 (Validate if startCursor is valid)
    if (startCursor < 0 || startCursor >= totalBytes) {
      log('chunkManager.invalidStartCursor', debug, { 
        chunkId, 
        startCursor, 
        totalBytes 
      }, COMPONENTS.CHUNK_MANAGER);
      return null;
    }
    
    // 计算当前位置和每个分块的起始位置 (Calculate current position and start position of each chunk)
    let currentPosition = 0;
    let chunkIndex = 0;
    let fetchedSoFar = 0;
    let resultContent = '';
    
    // 找到开始位置对应的分块 (Find the chunk corresponding to the start position)
    for (let i = 0; i < fetchedBytes.length; i++) {
      if (currentPosition + fetchedBytes[i] > startCursor) {
        chunkIndex = i;
        break;
      }
      fetchedSoFar += fetchedBytes[i];
      currentPosition += fetchedBytes[i];
    }
    
    // 从找到的分块开始，读取指定大小的内容 (Start reading from the found chunk, up to the specified size)
    let bytesToFetch = sizeLimit;
    let bytesActuallyFetched = 0;
    
    while (chunkIndex < chunks.length && bytesToFetch > 0) {
      resultContent += chunks[chunkIndex];
      bytesActuallyFetched += fetchedBytes[chunkIndex];
      bytesToFetch -= fetchedBytes[chunkIndex];
      chunkIndex++;
    }
    
    // 计算总获取字节数和剩余字节数 (Calculate total fetched bytes and remaining bytes)
    const totalFetchedBytes = startCursor + bytesActuallyFetched;
    const remainingBytes = totalBytes - totalFetchedBytes;
    const isLastChunk = (remainingBytes <= 0);
    
    log('chunkManager.retrievedChunkBySize', debug, { 
      chunkId, 
      startCursor,
      size: sizeLimit,
      bytesRequested: sizeLimit,
      bytesRetrieved: bytesActuallyFetched,
      totalFetchedBytes,
      remainingBytes,
      isLastChunk
    }, COMPONENTS.CHUNK_MANAGER);
    
    // 返回内容和获取信息 (Return content and fetch information)
    return {
      content: resultContent,
      fetchedBytes: totalFetchedBytes,
      remainingBytes,
      isLastChunk,
      totalBytes
    };
  }
  
  /**
   * 获取分段大小信息 (Get chunk size information)
   * @param chunkId 分段ID (Chunk ID)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 分段大小信息 (Chunk size information)
   */
  public static getSizeInfo(chunkId: string, debug: boolean = false): {totalBytes: number, fetchedBytes: number[]} | null {
    // 检查分段ID是否存在 (Check if chunk ID exists)
    if (!this.sizeInfo.has(chunkId)) {
      log('chunkManager.sizeInfoNotFound', debug, { chunkId }, COMPONENTS.CHUNK_MANAGER);
      return null;
    }
    
    // 返回分段大小信息 (Return chunk size information)
    return this.sizeInfo.get(chunkId)!;
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
        this.sizeInfo.delete(chunkId);
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