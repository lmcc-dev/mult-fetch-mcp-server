/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RequestPayload, FetchResponse } from "./types.js";
import { log } from "../../logger.js";
import { ContentSizeManager } from "../../utils/ContentSizeManager.js";
import { ChunkManager } from "../../utils/ChunkManager.js";
import { TemplateUtils } from "../../utils/TemplateUtils.js";

/**
 * 基础获取器类 (Base fetcher class)
 * 提供所有获取器共用的基础功能 (Provides basic functionality used by all fetchers)
 */
export class BaseFetcher {
  /**
   * 创建成功响应 (Create success response)
   * @param content 内容 (Content)
   * @returns 成功响应 (Success response)
   */
  public static createSuccessResponse(content: string): FetchResponse {
    return {
      isError: false,
      content: [
        {
          type: 'text',
          text: content
        }
      ]
    };
  }
  
  /**
   * 创建错误响应 (Create error response)
   * @param error 错误信息 (Error message)
   * @returns 错误响应 (Error response)
   */
  public static createErrorResponse(error: string): FetchResponse {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: error
        }
      ]
    };
  }
  
  /**
   * 处理内容分段 (Handle content chunking)
   * 如果内容超过大小限制，则进行分段处理 (If content exceeds size limit, chunk it)
   * @param content 内容 (Content)
   * @param contentSizeLimit 内容大小限制 (Content size limit)
   * @param enableContentSplitting 是否启用内容分段 (Whether to enable content splitting)
   * @param debug 是否启用调试输出 (Whether to enable debug output)
   * @param component 日志组件名称 (Log component name)
   * @returns 分段处理结果，如果不需要分段则返回null (Chunking result, or null if no chunking needed)
   */
  protected handleContentChunking(
    content: string, 
    contentSizeLimit: number = ContentSizeManager.getDefaultSizeLimit(),
    enableContentSplitting: boolean = true,
    debug: boolean = false,
    component: string
  ): FetchResponse | null {
    // 检查内容大小 (Check content size)
    const contentLength = content.length;
    log('fetcher.contentLength', debug, { length: contentLength }, component);
    
    // 如果内容大小超过限制且启用了内容分段 (If content size exceeds limit and content splitting is enabled)
    if (contentLength > contentSizeLimit && enableContentSplitting) {
      log('fetcher.contentTooLarge', debug, { 
        length: contentLength, 
        limit: contentSizeLimit 
      }, component);
      
      // 创建分段管理器 (Create chunk manager)
      const chunks = ContentSizeManager.splitContentIntoChunks(content, contentSizeLimit, debug);
      const chunkId = ChunkManager.storeChunks(chunks, debug);
      const firstChunk = ChunkManager.getChunk(chunkId, 0, debug);
      const totalChunks = ChunkManager.getTotalChunks(chunkId, debug);
      
      if (firstChunk === null) {
        return BaseFetcher.createErrorResponse('Error: Failed to retrieve the first chunk after splitting');
      }
      
      log('fetcher.contentSplit', debug, { 
        chunkId, 
        totalChunks,
        originalSize: contentLength,
        limit: contentSizeLimit
      }, component);
      
      // 返回第一段内容，并包含分段信息 (Return first chunk with chunking information)
      return {
        isError: false,
        content: [
          {
            type: 'text',
            text: firstChunk
          }
        ],
        isChunked: true,
        chunkId,
        totalChunks,
        currentChunk: 0,
        hasMoreChunks: totalChunks > 1
      };
    }
    
    // 如果内容大小超过限制但未启用内容分段 (If content size exceeds limit but content splitting is not enabled)
    if (contentLength > contentSizeLimit && !enableContentSplitting) {
      log('fetcher.contentTruncated', debug, { 
        originalLength: contentLength, 
        truncatedLength: contentSizeLimit 
      }, component);
      
      // 截断内容 (Truncate content)
      const truncatedContent = content.substring(0, contentSizeLimit);
      
      // 返回截断后的内容 (Return truncated content)
      return {
        isError: false,
        content: [
          {
            type: 'text',
            text: truncatedContent
          }
        ]
      };
    }
    
    // 如果不需要分段或截断，返回null (If no chunking or truncation needed, return null)
    return null;
  }
  
  /**
   * 从缓存中获取分段内容 (Get chunk content from cache)
   * @param chunkId 分段ID (Chunk ID)
   * @param chunkIndex 分段索引 (Chunk index)
   * @param debug 是否启用调试输出 (Whether to enable debug output)
   * @param component 日志组件名称 (Log component name)
   * @returns 分段内容 (Chunk content)
   */
  protected getChunkContent(
    chunkId: string, 
    chunkIndex: number,
    debug: boolean = false,
    component: string
  ): FetchResponse {
    log('fetcher.gettingChunk', debug, { chunkId, chunkIndex }, component);
    
    try {
      // 获取分段内容 (Get chunk content)
      const chunkContent = ChunkManager.getChunk(chunkId, chunkIndex, debug);
      
      if (chunkContent === null) {
        log('fetcher.chunkNotFound', debug, { chunkId, chunkIndex }, component);
        return BaseFetcher.createErrorResponse(`Chunk with ID ${chunkId} and index ${chunkIndex} not found`);
      }
      
      // 获取分段总数 (Get total chunks)
      const totalChunks = ChunkManager.getTotalChunks(chunkId, debug);
      
      log('fetcher.chunkRetrieved', debug, { 
        chunkId, 
        chunkIndex, 
        totalChunks,
        contentLength: chunkContent.length
      }, component);
      
      // 返回分段内容 (Return chunk content)
      return {
        isError: false,
        content: [
          {
            type: 'text',
            text: chunkContent
          }
        ],
        isChunked: true,
        chunkId,
        totalChunks,
        currentChunk: chunkIndex,
        hasMoreChunks: chunkIndex < totalChunks - 1
      };
    } catch (error) {
      log('fetcher.chunkRetrievalError', debug, { 
        chunkId, 
        chunkIndex, 
        error: String(error) 
      }, component);
      
      return BaseFetcher.createErrorResponse(`Error retrieving chunk: ${error}`);
    }
  }

  /**
   * 创建分段响应 (Create chunked response)
   * @param content 内容 (Content)
   * @param chunkId 分段ID (Chunk ID)
   * @param totalChunks 总分段数 (Total chunks)
   * @param currentChunk 当前分段索引 (Current chunk index)
   * @param additionalProps 额外属性 (Additional properties)
   * @returns 分段响应 (Chunked response)
   */
  public static createChunkedResponse(
    content: string,
    chunkId: string,
    totalChunks: number,
    currentChunk: number,
    additionalProps: Record<string, any> = {}
  ): FetchResponse {
    const hasMoreChunks = currentChunk < totalChunks - 1;
    
    return {
      content: [{ type: 'text', text: content }],
      isError: false,
      isChunked: true,
      totalChunks,
      currentChunk,
      chunkId,
      hasMoreChunks,
      ...additionalProps
    };
  }
  
  /**
   * 添加分段提示词 (Add chunk prompt)
   * @param response 响应对象 (Response object)
   * @returns 添加了提示词的响应对象 (Response object with prompt)
   */
  public static addChunkPrompt(response: FetchResponse): FetchResponse {
    if (response.isChunked && response.hasMoreChunks && response.content[0].text) {
      const nextChunkIndex = (response.currentChunk || 0) + 1;
      const promptText = `\n\n=== SYSTEM NOTE ===\nContent is too long and has been split. This is part ${response.currentChunk! + 1} of ${response.totalChunks}. To view the next part, use the same tool function with parameters chunkId="${response.chunkId}" and chunkIndex=${nextChunkIndex}\n===================`;
      
      // 创建新的响应对象，避免修改原始对象 (Create new response object to avoid modifying the original)
      return {
        ...response,
        content: [
          { 
            type: response.content[0].type || 'text', 
            text: response.content[0].text + promptText 
          }
        ]
      };
    }
    
    return response;
  }
} 