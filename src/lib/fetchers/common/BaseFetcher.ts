/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RequestPayload, FetchResponse } from "./types.js";
import { log } from "../../logger.js";
import { ContentSizeManager } from "../../utils/ContentSizeManager.js";
import { ChunkManager } from "../../utils/ChunkManager.js";

/**
 * 基础获取器类 (Base fetcher class)
 * 提供通用的分段处理和分段获取逻辑 (Provides common chunking and chunk retrieval logic)
 */
export abstract class BaseFetcher {
  /**
   * 处理内容分段 (Handle content chunking)
   * @param content 原始内容 (Original content)
   * @param contentSizeLimit 内容大小限制 (Content size limit)
   * @param enableContentSplitting 是否启用分段 (Whether to enable content splitting)
   * @param debug 是否启用调试 (Whether to enable debug)
   * @param component 组件名称 (Component name)
   * @returns 处理结果 (Processing result)
   */
  protected handleContentChunking(
    content: string, 
    contentSizeLimit: number, 
    enableContentSplitting: boolean, 
    debug: boolean,
    component: string
  ): FetchResponse | null {
    if (contentSizeLimit && ContentSizeManager.exceedsLimit(content, contentSizeLimit, debug)) {
      if (enableContentSplitting) {
        // 使用 ContentSizeManager 分段处理内容 (Use ContentSizeManager to split content into chunks)
        const chunks = ContentSizeManager.splitContentIntoChunks(content, contentSizeLimit, debug);
        log('contentSplit', debug, { chunks: chunks.length }, component);
        
        // 存储分段内容 (Store chunked content)
        const chunkId = ChunkManager.storeChunks(chunks, debug);
        
        // 获取第一个分段 (Get the first chunk)
        const firstChunk = ChunkManager.getChunk(chunkId, 0, debug);
        
        if (firstChunk === null) {
          return {
            content: [{ type: 'text', text: 'Error: Failed to retrieve the first chunk after splitting' }],
            isError: true
          };
        }
        
        // 替换第一个分段中的 chunkId 占位符 (Replace chunkId placeholder in the first chunk)
        const firstChunkWithId = firstChunk.replace(/{{chunkId}}/g, chunkId);
        
        // 返回第一个分段，并包含分段元数据 (Return the first chunk with chunk metadata)
        return {
          content: [{ type: 'text', text: firstChunkWithId }],
          isError: false,
          isChunked: true,
          totalChunks: chunks.length,
          currentChunk: 0,
          chunkId,
          hasMoreChunks: chunks.length > 1
        };
      }
    }
    
    return null; // 不需要分段处理 (No chunking needed)
  }

  /**
   * 获取分段内容 (Get chunk content)
   * @param chunkId 分段ID (Chunk ID)
   * @param chunkIndex 分段索引 (Chunk index)
   * @param debug 是否启用调试 (Whether to enable debug)
   * @param component 组件名称 (Component name)
   * @returns 分段内容响应 (Chunk content response)
   */
  protected getChunkContent(
    chunkId: string,
    chunkIndex: number,
    debug: boolean,
    component: string
  ): FetchResponse {
    log('gettingChunk', debug, { chunkId, chunkIndex }, component);
    
    // 从缓存中获取分段内容 (Get chunk content from cache)
    const chunkContent = ChunkManager.getChunk(chunkId, chunkIndex, debug);
    
    // 如果找不到分段内容，返回错误 (If chunk content is not found, return error)
    if (chunkContent === null) {
      return {
        content: [{ type: 'text', text: `Error: Chunk not found with ID ${chunkId} and index ${chunkIndex}` }],
        isError: true
      };
    }
    
    // 获取分段总数 (Get total number of chunks)
    const totalChunks = ChunkManager.getTotalChunks(chunkId, debug);
    
    // 返回分段内容 (Return chunk content)
    return {
      content: [{ type: 'text', text: chunkContent }],
      isError: false,
      isChunked: true,
      totalChunks,
      currentChunk: chunkIndex,
      chunkId,
      hasMoreChunks: chunkIndex < totalChunks - 1
    };
  }

  /**
   * 创建成功响应 (Create success response)
   * @param content 内容 (Content)
   * @returns 成功响应 (Success response)
   */
  protected createSuccessResponse(content: string): FetchResponse {
    return {
      content: [{ type: 'text', text: content }],
      isError: false
    };
  }

  /**
   * 创建错误响应 (Create error response)
   * @param errorMessage 错误信息 (Error message)
   * @returns 错误响应 (Error response)
   */
  protected createErrorResponse(errorMessage: string): FetchResponse {
    return {
      content: [{ type: 'text', text: errorMessage }],
      isError: true
    };
  }
} 