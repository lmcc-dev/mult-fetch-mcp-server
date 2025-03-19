/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { log, COMPONENTS } from '../logger.js';
import { TemplateUtils } from './TemplateUtils.js';

/**
 * 内容大小管理器 (Content size manager)
 * 用于处理内容大小限制，防止返回过大的内容 (Used to handle content size limits, prevent returning too large content)
 */
export class ContentSizeManager {
  /**
   * 默认大小限制，单位为字节 (Default size limit in bytes)
   * 默认为50KB (Default is 50KB)
   */
  private static readonly DEFAULT_SIZE_LIMIT = 50 * 1024; // 50KB

  /**
   * 获取默认大小限制 (Get default size limit)
   * @returns 默认大小限制，单位为字节 (Default size limit in bytes)
   */
  public static getDefaultSizeLimit(): number {
    return this.DEFAULT_SIZE_LIMIT;
  }

  /**
   * 检查内容大小是否超过限制 (Check if content size exceeds limit)
   * @param content 内容 (Content)
   * @param sizeLimit 大小限制，单位为字节 (Size limit in bytes)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 是否超过限制 (Whether exceeds limit)
   */
  public static exceedsLimit(content: string, sizeLimit: number = this.DEFAULT_SIZE_LIMIT, debug: boolean = false): boolean {
    const contentSize = Buffer.byteLength(content, 'utf8');
    const exceedsLimit = contentSize > sizeLimit;
    
    if (debug) {
      log('contentSize.checking', debug, { 
        contentSize: `${(contentSize / 1024).toFixed(2)}KB`, 
        limit: `${(sizeLimit / 1024).toFixed(2)}KB`,
        exceedsLimit
      }, COMPONENTS.CONTENT_SIZE);
    }
    
    return exceedsLimit;
  }

  /**
   * 将内容分割成多个片段，不添加分段信息 (Split content into multiple chunks without adding chunk information)
   * 这个方法用于内部处理，返回原始分段 (This method is for internal processing, returns raw chunks)
   * @param content 原始内容 (Original content)
   * @param sizeLimit 每个片段的大小限制，单位为字节 (Size limit for each chunk in bytes)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 内容片段数组 (Array of content chunks)
   */
  public static splitContentIntoRawChunks(content: string, sizeLimit: number = this.DEFAULT_SIZE_LIMIT, debug: boolean = false): string[] {
    if (!this.exceedsLimit(content, sizeLimit, debug)) {
      return [content];
    }
    
    const contentSize = Buffer.byteLength(content, 'utf8');
    log('contentSize.splitting', debug, { 
      originalSize: `${(contentSize / 1024).toFixed(2)}KB`, 
      chunkSize: `${(sizeLimit / 1024).toFixed(2)}KB` 
    }, COMPONENTS.CONTENT_SIZE);
    
    // 分割内容 (Split content)
    const chunks: string[] = [];
    let currentChunk = '';
    let currentSize = 0;
    const chars = [...content];
    
    for (const char of chars) {
      const charSize = Buffer.byteLength(char, 'utf8');
      
      // 如果添加这个字符会超过限制，创建新的片段 (If adding this character would exceed the limit, create a new chunk)
      if (currentSize + charSize > sizeLimit && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
        currentSize = 0;
      }
      
      currentChunk += char;
      currentSize += charSize;
    }
    
    // 添加最后一个片段 (Add the last chunk)
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    log('contentSize.splitComplete', debug, { 
      chunks: chunks.length, 
      avgChunkSize: `${(contentSize / chunks.length / 1024).toFixed(2)}KB` 
    }, COMPONENTS.CONTENT_SIZE);
    
    return chunks;
  }

  /**
   * 将内容分割成多个片段，并添加分段信息 (Split content into multiple chunks and add chunk information)
   * @param content 原始内容 (Original content)
   * @param sizeLimit 每个片段的大小限制，单位为字节 (Size limit for each chunk in bytes)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @param offset 当前偏移量，用于确定是首次请求还是后续请求 (Current offset, used to determine if it's initial or subsequent request)
   * @returns 内容片段数组 (Array of content chunks)
   */
  public static splitContentIntoChunks(
    content: string,
    sizeLimit: number = this.DEFAULT_SIZE_LIMIT,
    debug: boolean = false,
    offset: number = 0
  ): { chunks: string[], totalBytes: number } {
    // 计算内容总字节大小 (Calculate total size of content in bytes)
    const totalBytes = Buffer.byteLength(content, 'utf8');
    
    // 使用TemplateUtils中的常量和方法生成示例模板以计算大小
    // (Use constants and methods from TemplateUtils to generate example templates for size calculation)
    const sampleChunkId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    const samplePrompt = TemplateUtils.generateSizeBasedChunkPrompt(
      50000, // fetchedBytes 
      totalBytes, 
      sampleChunkId, 
      totalBytes - 50000, // remainingBytes
      Math.ceil((totalBytes - 50000) / sizeLimit), // estimatedRequests
      sizeLimit,
      true // isFirstRequest
    );
    
    const maxChunkInfoSize = Buffer.byteLength(samplePrompt, 'utf8');
    
    // 计算实际可用的分段大小 (Calculate actual available chunk size)
    const effectiveChunkSize = sizeLimit - maxChunkInfoSize;
    
    // 分割内容 (Split content)
    const rawChunks = this.splitContentIntoRawChunks(content, effectiveChunkSize, debug);
    
    // 不需要添加分段信息，这将在加载时动态添加
    // (No need to add chunk information, it will be added dynamically when loading)
    
    log('contentSize.splitIntoChunks', debug, { 
      totalChunks: rawChunks.length, 
      chunkCount: rawChunks.length,
      chunkSize: effectiveChunkSize,
      totalBytes,
      effectiveChunkSize,
      sizeLimit
    }, COMPONENTS.CONTENT_SIZE);
    
    return { chunks: rawChunks, totalBytes };
  }
} 