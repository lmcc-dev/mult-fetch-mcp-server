/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { log, COMPONENTS } from '../logger.js';

/**
 * 内容大小管理器 (Content size manager)
 * 用于处理内容大小限制，防止返回过大的内容 (Used to handle content size limits, prevent returning too large content)
 */
export class ContentSizeManager {
  /**
   * 默认大小限制，单位为字节 (Default size limit in bytes)
   * 默认为100KB (Default is 100KB)
   */
  private static readonly DEFAULT_SIZE_LIMIT = 100 * 1024; // 100KB

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
   * @returns 内容片段数组 (Array of content chunks)
   */
  public static splitContentIntoChunks(content: string, sizeLimit: number = this.DEFAULT_SIZE_LIMIT, debug: boolean = false): string[] {
    // 分段信息模板 (Chunk information template)
    const chunkInfoTemplate = '\n\n=== SYSTEM NOTE ===\nContent is too long and has been split. This is part {{current}} of {{total}}.\nTo view the next part, use the same tool function with parameters chunkId="{{chunkId}}" and chunkIndex={{nextIndex}}\n===================';
    
    // 最后一个分段的信息模板 (Last chunk information template)
    const lastChunkInfoTemplate = '\n\n=== SYSTEM NOTE ===\nContent is too long and has been split. This is part {{current}} of {{total}}.\nThis is the last part of the content.\n===================';
    
    // 计算分段信息的最大大小 (Calculate maximum size of chunk information)
    const maxChunkInfoSize = Buffer.byteLength(chunkInfoTemplate
      .replace('{{current}}', '999')
      .replace('{{total}}', '999')
      .replace('{{chunkId}}', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
      .replace('{{nextIndex}}', '999'), 'utf8');
    
    // 计算实际可用的分段大小 (Calculate actual available chunk size)
    const effectiveChunkSize = sizeLimit - maxChunkInfoSize;
    
    // 分割内容 (Split content)
    const rawChunks = this.splitContentIntoRawChunks(content, effectiveChunkSize, debug);
    
    // 添加分段信息 (Add chunk information)
    const totalChunks = rawChunks.length;
    
    // 这里只添加占位符，实际的 chunkId 会在 ChunkManager 中替换 (Add placeholders here, actual chunkId will be replaced in ChunkManager)
    const finalChunks = rawChunks.map((chunk, index) => {
      // 判断是否为最后一个分段 (Check if it's the last chunk)
      const isLastChunk = index === totalChunks - 1;
      
      if (isLastChunk) {
        // 最后一个分段使用不同的模板，不包含获取下一个分段的提示
        // Last chunk uses a different template without prompt for next chunk
        const chunkInfo = lastChunkInfoTemplate
          .replace(/{{current}}/g, (index + 1).toString())
          .replace(/{{total}}/g, totalChunks.toString());
        
        return chunk + chunkInfo;
      } else {
        // 非最后一个分段，添加下一个分段的索引 (Not the last chunk, add next index)
        const nextIndex = index + 1;
        
        const chunkInfo = chunkInfoTemplate
          .replace(/{{current}}/g, (index + 1).toString())
          .replace(/{{total}}/g, totalChunks.toString())
          .replace(/{{chunkId}}/g, '{{chunkId}}') // 保留占位符 (Keep placeholder)
          .replace(/{{nextIndex}}/g, nextIndex.toString());
        
        return chunk + chunkInfo;
      }
    });
    
    return finalChunks;
  }
} 