/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RequestPayload, FetchResponse, IFetcher } from "../common/types.js";
import { log, COMPONENTS } from '../../logger.js';
import { HttpClient } from './HttpClient.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { ContentSizeManager } from '../../utils/ContentSizeManager.js';
import { BaseFetcher } from "../common/BaseFetcher.js";
import { ContentProcessor } from "../../utils/ContentProcessor.js";

/**
 * Node模式获取器类 (Node mode fetcher class)
 * 使用node-fetch实现标准模式的网页获取 (Implements webpage fetching in standard mode using node-fetch)
 */
export class NodeFetcher extends BaseFetcher implements IFetcher {
  /**
   * 获取HTML内容 (Get HTML content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns HTML内容 (HTML content)
   */
  public async html(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      debug = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;

    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.NODE_FETCH);
    }

    log('node.startingHtmlFetch', debug, {}, COMPONENTS.NODE_FETCH);

    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);

      // 读取响应文本 (Read response text)
      log('node.readingText', debug, {}, COMPONENTS.NODE_FETCH);
      const html = await response.text();
      log('node.htmlContentLength', debug, { length: html.length }, COMPONENTS.NODE_FETCH);

      // 检查内容大小并处理 (Check content size and process)
      const chunkingResult = this.handleContentChunking(
        html,
        contentSizeLimit,
        enableContentSplitting,
        debug,
        COMPONENTS.NODE_FETCH
      );

      if (chunkingResult) {
        return chunkingResult;
      }

      // 返回HTML内容 (Return HTML content)
      return BaseFetcher.createSuccessResponse(html);
    } catch (error) {
      // 使用ErrorHandler处理错误 (Use ErrorHandler to handle error)
      const errorMessage = ErrorHandler.handleError(
        error,
        COMPONENTS.NODE_FETCH,
        debug,
        { url: requestPayload.url, method: 'html' }
      );

      // 返回错误信息 (Return error message)
      return BaseFetcher.createErrorResponse(`Error fetching HTML: ${errorMessage}`);
    }
  }

  /**
   * 获取JSON内容 (Get JSON content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns JSON内容 (JSON content)
   */
  public async json(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      debug = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;

    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.NODE_FETCH);
    }

    log('node.startingJsonFetch', debug, {}, COMPONENTS.NODE_FETCH);

    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);

      // 读取响应文本 (Read response text)
      const text = await response.text();

      // 解析JSON (Parse JSON)
      log('node.parsingJson', debug, {}, COMPONENTS.NODE_FETCH);
      try {
        JSON.parse(text);
        log('node.jsonParsed', debug, {}, COMPONENTS.NODE_FETCH);

        // 检查内容大小并处理 (Check content size and process)
        const chunkingResult = this.handleContentChunking(
          text,
          contentSizeLimit,
          enableContentSplitting,
          debug,
          COMPONENTS.NODE_FETCH
        );

        if (chunkingResult) {
          return chunkingResult;
        }

        // 返回JSON内容 (Return JSON content)
        return BaseFetcher.createSuccessResponse(text);
      } catch (parseError) {
        // 处理JSON解析错误 (Handle JSON parse error)
        const textPreview = text.length > 100 ? `${text.substring(0, 100)}...` : text;
        const error = new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}. Text preview: "${textPreview}", length: ${text.length}`);
        (error as any).text = text;
        (error as any).originalError = parseError;

        log('fetcher.jsonParseError', debug, {
          error: String(parseError),
          textPreview,
          textLength: text.length
        }, COMPONENTS.NODE_FETCH);

        // 返回错误信息 (Return error message)
        return BaseFetcher.createErrorResponse(`Error parsing JSON: ${error.message}`);
      }
    } catch (error) {
      // 使用ErrorHandler处理错误 (Use ErrorHandler to handle error)
      const errorMessage = ErrorHandler.handleError(
        error,
        COMPONENTS.NODE_FETCH,
        debug,
        { url: requestPayload.url, method: 'json' }
      );

      // 返回错误信息 (Return error message)
      return BaseFetcher.createErrorResponse(`Error fetching JSON: ${errorMessage}`);
    }
  }

  /**
   * 获取纯文本内容 (Get plain text content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 纯文本内容 (Plain text content)
   */
  public async txt(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      debug = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;

    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.NODE_FETCH);
    }

    log('node.startingTxtFetch', debug, {}, COMPONENTS.NODE_FETCH);

    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);

      // 读取响应文本 (Read response text)
      log('node.readingText', debug, {}, COMPONENTS.NODE_FETCH);
      const text = await response.text();
      log('node.textContentLength', debug, { length: text.length }, COMPONENTS.NODE_FETCH);

      // 检查内容大小并处理 (Check content size and process)
      const chunkingResult = this.handleContentChunking(
        text,
        contentSizeLimit,
        enableContentSplitting,
        debug,
        COMPONENTS.NODE_FETCH
      );

      if (chunkingResult) {
        return chunkingResult;
      }

      // 返回纯文本内容 (Return plain text content)
      return BaseFetcher.createSuccessResponse(text);
    } catch (error) {
      // 使用ErrorHandler处理错误 (Use ErrorHandler to handle error)
      const errorMessage = ErrorHandler.handleError(
        error,
        COMPONENTS.NODE_FETCH,
        debug,
        { url: requestPayload.url, method: 'txt' }
      );

      // 返回错误信息 (Return error message)
      return BaseFetcher.createErrorResponse(`Error fetching text: ${errorMessage}`);
    }
  }

  /**
   * 获取HTML并转换为纯文本 (Get HTML and convert to plain text)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 纯文本响应 (Plain text response)
   */
  public async plainText(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      debug = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;

    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.NODE_FETCH);
    }

    log('node.startingPlainTextFetch', debug, { url: requestPayload.url }, COMPONENTS.NODE_FETCH);

    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);

      // 读取响应文本 (Read response text)
      const html = await response.text();

      // 将HTML转换为纯文本 (Convert HTML to plain text)
      const plainText = ContentProcessor.htmlToText(html, debug);

      // 检查内容大小并处理 (Check content size and process)
      const chunkingResult = this.handleContentChunking(
        plainText,
        contentSizeLimit,
        enableContentSplitting,
        debug,
        COMPONENTS.NODE_FETCH
      );

      if (chunkingResult) {
        return chunkingResult;
      }

      // 返回纯文本内容 (Return plain text content)
      return BaseFetcher.createSuccessResponse(plainText);
    } catch (error) {
      // 使用ErrorHandler处理错误 (Use ErrorHandler to handle error)
      const errorMessage = ErrorHandler.handleError(
        error,
        COMPONENTS.NODE_FETCH,
        debug,
        { url: requestPayload.url, method: 'plainText' }
      );

      // 返回错误信息 (Return error message)
      return BaseFetcher.createErrorResponse(`Error fetching plain text: ${errorMessage}`);
    }
  }

  /**
   * 获取Markdown内容 (Get Markdown content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns Markdown内容 (Markdown content)
   */
  public async markdown(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      debug = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;

    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.NODE_FETCH);
    }

    log('node.startingMarkdownFetch', debug, { url: requestPayload.url }, COMPONENTS.NODE_FETCH);

    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);

      // 读取响应文本 (Read response text)
      const html = await response.text();

      // 将HTML转换为Markdown (Convert HTML to Markdown)
      const markdown = ContentProcessor.htmlToMarkdown(html, debug);

      // 检查内容大小并处理 (Check content size and process)
      const chunkingResult = this.handleContentChunking(
        markdown,
        contentSizeLimit,
        enableContentSplitting,
        debug,
        COMPONENTS.NODE_FETCH
      );

      if (chunkingResult) {
        return chunkingResult;
      }

      // 返回Markdown内容 (Return Markdown content)
      return BaseFetcher.createSuccessResponse(markdown);
    } catch (error) {
      // 使用ErrorHandler处理错误 (Use ErrorHandler to handle error)
      const errorMessage = ErrorHandler.handleError(
        error,
        COMPONENTS.NODE_FETCH,
        debug,
        { url: requestPayload.url, method: 'markdown' }
      );

      // 返回错误信息 (Return error message)
      return BaseFetcher.createErrorResponse(`Error fetching Markdown: ${errorMessage}`);
    }
  }
}