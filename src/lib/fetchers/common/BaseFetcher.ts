/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { FetchResponse } from './types.js';
import { log } from '../../logger.js';
import { ChunkManager } from '../../utils/ChunkManager.js';
import { ContentSizeManager } from '../../utils/ContentSizeManager.js';
import { TemplateUtils } from '../../utils/TemplateUtils.js';

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
   * @param errorMessage 错误信息 (Error message)
   * @returns 错误响应 (Error response)
   */
  public static createErrorResponse(errorMessage: string): FetchResponse {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: errorMessage
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
    const contentBytes = Buffer.byteLength(content, 'utf8');
    log('fetcher.contentLength', debug, { length: contentLength, bytes: contentBytes }, component);

    // 如果内容大小超过限制且启用了内容分段 (If content size exceeds limit and content splitting is enabled)
    if (contentBytes > contentSizeLimit && enableContentSplitting) {
      log('fetcher.contentTooLarge', debug, {
        size: contentBytes,
        limit: contentSizeLimit
      }, component);

      // 分割内容 (Split content)
      const { chunks, totalBytes } = ContentSizeManager.splitContentIntoChunks(content, contentSizeLimit, debug, 0);

      // 存储分割后的内容 (Store chunked content)
      const chunkId = ChunkManager.storeChunks(chunks, totalBytes, debug);

      // 获取第一个分片 (Get first chunk)
      const chunkResult = ChunkManager.getChunkBySize(chunkId, 0, contentSizeLimit, debug);

      if (!chunkResult) {
        log('fetcher.chunkRetrievalFailed', debug, { chunkId }, component);
        return BaseFetcher.createErrorResponse("Failed to retrieve chunk content");
      }

      const { content: firstChunk, fetchedBytes, remainingBytes, totalBytes: totalSize } = chunkResult;

      // 计算预计还需要的请求次数 (Calculate estimated number of requests needed)
      const estimatedRequests = Math.ceil(remainingBytes / contentSizeLimit);

      // 添加分段提示 (Add chunk prompt)
      const isFirstRequest = true;
      let chunkWithPrompt: string;

      // 检查是否已经检索了全部内容
      if (remainingBytes <= 0) {
        chunkWithPrompt = firstChunk + TemplateUtils.generateSizeBasedLastChunkPrompt(
          fetchedBytes,
          totalSize,
          isFirstRequest
        );
      } else {
        chunkWithPrompt = firstChunk + TemplateUtils.generateSizeBasedChunkPrompt(
          fetchedBytes,
          totalSize,
          chunkId,
          remainingBytes,
          estimatedRequests,
          contentSizeLimit,
          isFirstRequest
        );
      }

      // 创建响应 (Create response)
      return {
        isError: false,
        isChunked: true,
        content: [
          {
            type: 'text',
            text: chunkWithPrompt
          }
        ],
        chunkId,
        totalBytes: totalSize,
        fetchedBytes,
        remainingBytes,
        hasMoreChunks: remainingBytes > 0
      };
    }

    // 如果内容大小超过限制但未启用内容分段 (If content size exceeds limit but content splitting is not enabled)
    if (contentBytes > contentSizeLimit && !enableContentSplitting) {
      log('fetcher.contentTruncated', debug, {
        originalBytes: contentBytes,
        truncatedLength: contentSizeLimit
      }, component);

      const truncatedContent = content.substring(0, contentSizeLimit);

      return BaseFetcher.createSuccessResponse(
        truncatedContent + `\n\n${TemplateUtils.SYSTEM_NOTE.START}\nContent was too large (${contentBytes} bytes) and has been truncated to ${contentSizeLimit} bytes. Enable content splitting to view the full content.\n${TemplateUtils.SYSTEM_NOTE.END}`
      );
    }

    // 如果不需要分段，返回null (If no chunking needed, return null)
    return null;
  }

  /**
   * 获取分段内容 - 基于字节偏移量 (Get chunked content based on byte offset)
   * @param chunkId 分段ID (Chunk ID)
   * @param startCursor 开始游标位置 (Start cursor position)
   * @param sizeLimit 大小限制 (Size limit)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @param component 日志组件名称 (Log component name)
   * @returns 获取结果 (Fetch result)
   */
  protected getChunkContent(
    chunkId: string,
    startCursor: number = 0,
    sizeLimit: number = ContentSizeManager.getDefaultSizeLimit(),
    debug: boolean = false,
    component: string
  ): FetchResponse {
    log('fetcher.gettingChunkBySize', debug, {
      chunkId,
      startCursor,
      start: startCursor,
      end: startCursor + sizeLimit,
      sizeLimit
    }, component);

    // 获取分段内容 (Get chunked content)
    const chunkResult = ChunkManager.getChunkBySize(chunkId, startCursor, sizeLimit, debug);

    // 如果获取失败，返回错误 (If retrieval failed, return error)
    if (!chunkResult) {
      log('fetcher.chunkNotFound', debug, { chunkId, startCursor }, component);
      return BaseFetcher.createErrorResponse(`Chunk with ID ${chunkId} at cursor position ${startCursor} not found`);
    }

    // 获取相关信息 (Get related information)
    const { content, fetchedBytes, remainingBytes, isLastChunk, totalBytes } = chunkResult;

    // 记录是否为最后一个分块的详细信息
    log('fetcher.chunkInfo', debug, {
      chunkId,
      fetchedBytes,
      totalBytes,
      remainingBytes,
      isLastChunk,
      percentage: `${Math.round((fetchedBytes / totalBytes) * 100)}%`
    }, component);

    // 计算预计还需要的请求次数 (Calculate estimated number of requests needed)
    const estimatedRequests = Math.ceil(remainingBytes / sizeLimit);

    // 添加分段提示 (Add chunk prompt)
    let contentWithPrompt: string;

    // 如果是最后一个分段或没有剩余内容 (If it's the last chunk or there's no remaining content)
    if (isLastChunk || remainingBytes <= 0) {
      log('fetcher.lastChunkDetected', debug, {
        fetchedBytes,
        totalBytes,
        remainingBytes
      }, component);

      contentWithPrompt = content + TemplateUtils.generateSizeBasedLastChunkPrompt(
        fetchedBytes,
        totalBytes,
        startCursor === 0 // 如果startCursor为0，则为首次请求 (If startCursor is 0, it's the first request)
      );
    } else {
      // 如果不是最后一个分段 (If it's not the last chunk)
      contentWithPrompt = content + TemplateUtils.generateSizeBasedChunkPrompt(
        fetchedBytes,
        totalBytes,
        chunkId,
        remainingBytes,
        estimatedRequests,
        sizeLimit,
        startCursor === 0 // 如果startCursor为0，则为首次请求 (If startCursor is 0, it's the first request)
      );
    }

    // 创建响应 (Create response)
    return {
      isError: false,
      isChunked: true,
      content: [
        {
          type: 'text',
          text: contentWithPrompt
        }
      ],
      chunkId,
      totalBytes,
      fetchedBytes,
      remainingBytes,
      hasMoreChunks: remainingBytes > 0,
      isLastChunk // 明确添加isLastChunk属性以便客户端使用
    };
  }

  /**
   * 添加分段提示词 (Add chunk prompt)
   * @param response 响应对象 (Response object)
   * @returns 添加了提示词的响应对象 (Response object with prompt)
   */
  public static addChunkPrompt(response: FetchResponse): FetchResponse {
    // 检查是否存在字节信息并需要添加分块提示 (Check if byte information exists and need to add chunk prompt)
    if (response.isChunked && response.hasMoreChunks && response.totalBytes && response.fetchedBytes && response.remainingBytes) {
      const chunkId = response.chunkId || '';
      const currentSizeLimit = response.fetchedBytes; // 假设当前大小限制与已获取字节数相同 (Assume current size limit is the same as fetched bytes)
      const estimatedRequests = Math.ceil(response.remainingBytes / currentSizeLimit);

      // 检查内容中是否已经包含系统提示 (Check if content already contains system note)
      if (TemplateUtils.hasSystemPrompt(response.content[0].text || '')) {
        // 已存在提示，直接返回原始响应 (Note already exists, return original response)
        return response;
      }

      // 使用基于字节的提示 (Use byte-based prompt)
      let promptText;

      // 检查是否还有剩余字节 (Check if there are remaining bytes)
      if (response.remainingBytes <= 0) {
        // 没有剩余字节，使用最后一块的提示 (No remaining bytes, use last chunk prompt)
        promptText = TemplateUtils.generateSizeBasedLastChunkPrompt(
          response.fetchedBytes,
          response.totalBytes,
          false // 设置为false表示这不是首次请求 (Set to false indicating this is not the first request)
        );
      } else {
        // 仍有剩余字节，使用普通分块提示 (Still has remaining bytes, use regular chunk prompt)
        promptText = TemplateUtils.generateSizeBasedChunkPrompt(
          response.fetchedBytes,
          response.totalBytes,
          chunkId,
          response.remainingBytes,
          estimatedRequests,
          currentSizeLimit,
          false // 设置为false表示这不是首次请求 (Set to false indicating this is not the first request)
        );
      }

      // 创建新的响应对象，避免修改原始对象 (Create new response object to avoid modifying the original)
      return {
        ...response,
        content: [
          {
            type: 'text',
            text: (response.content[0].text || '') + promptText
          }
        ]
      };
    }

    // 如果不需要添加提示，返回原始响应 (If no prompt needed, return original response)
    return response;
  }
} 