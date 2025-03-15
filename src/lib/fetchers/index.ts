/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RequestPayload, FetchResponse } from './common/types.js';
import { FetcherFactory } from './FetcherFactory.js';
import { log, COMPONENTS } from '../logger.js';

/**
 * 统一抓取器类 (Unified fetcher class)
 * 提供统一的接口来获取不同格式的内容 (Provides a unified interface to fetch content in different formats)
 */
export class Fetcher {
  /**
   * 获取HTML内容 (Get HTML content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns HTML内容 (HTML content)
   */
  public static async html(requestPayload: RequestPayload): Promise<FetchResponse> {
    const { debug = false } = requestPayload;
    log('fetcher.fetchingHtml', debug, { url: requestPayload.url }, COMPONENTS.SERVER);
    
    const fetcher = FetcherFactory.createFetcher(requestPayload);
    return await fetcher.html(requestPayload);
  }

  /**
   * 获取JSON内容 (Get JSON content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns JSON内容 (JSON content)
   */
  public static async json(requestPayload: RequestPayload): Promise<FetchResponse> {
    const { debug = false } = requestPayload;
    log('fetcher.fetchingJson', debug, { url: requestPayload.url }, COMPONENTS.SERVER);
    
    const fetcher = FetcherFactory.createFetcher(requestPayload);
    return await fetcher.json(requestPayload);
  }

  /**
   * 获取纯文本内容 (Get plain text content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 纯文本内容 (Plain text content)
   */
  public static async txt(requestPayload: RequestPayload): Promise<FetchResponse> {
    const { debug = false } = requestPayload;
    log('fetcher.fetchingTxt', debug, { url: requestPayload.url }, COMPONENTS.SERVER);
    
    const fetcher = FetcherFactory.createFetcher(requestPayload);
    return await fetcher.txt(requestPayload);
  }

  /**
   * 获取Markdown内容 (Get Markdown content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns Markdown内容 (Markdown content)
   */
  public static async markdown(requestPayload: RequestPayload): Promise<FetchResponse> {
    const { debug = false } = requestPayload;
    log('fetcher.fetchingMarkdown', debug, { url: requestPayload.url }, COMPONENTS.SERVER);
    
    const fetcher = FetcherFactory.createFetcher(requestPayload);
    return await fetcher.markdown(requestPayload);
  }
}

// 导出所有类型和类 (Export all types and classes)
export * from './common/types.js';
export * from './browser/BrowserFetcher.js';
export * from './node/NodeFetcher.js';
export * from './FetcherFactory.js'; 