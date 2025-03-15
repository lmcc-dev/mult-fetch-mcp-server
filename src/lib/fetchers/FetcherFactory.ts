/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RequestPayload, IFetcher } from './common/types.js';
import { BrowserFetcher } from './browser/BrowserFetcher.js';
import { NodeFetcher } from './node/NodeFetcher.js';
import { log, COMPONENTS } from '../logger.js';

/**
 * 抓取器工厂类 (Fetcher factory class)
 * 根据请求参数创建合适的抓取器实例 (Create appropriate fetcher instance based on request parameters)
 */
export class FetcherFactory {
  /**
   * 创建抓取器实例 (Create fetcher instance)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 抓取器实例 (Fetcher instance)
   */
  public static createFetcher(requestPayload: RequestPayload): IFetcher {
    const { 
      useBrowser = false, 
      useNodeFetch = false, 
      autoDetectMode = true,
      debug = false 
    } = requestPayload;
    
    // 如果明确指定使用浏览器模式 (If browser mode is explicitly specified)
    if (useBrowser) {
      log('factory.using_browser_mode', debug, {}, COMPONENTS.FETCHER_FACTORY);
      return new BrowserFetcher();
    }
    
    // 如果明确指定使用Node模式 (If Node mode is explicitly specified)
    if (useNodeFetch) {
      log('factory.using_node_mode', debug, {}, COMPONENTS.FETCHER_FACTORY);
      return new NodeFetcher();
    }
    
    // 如果启用自动检测模式 (If auto-detect mode is enabled)
    if (autoDetectMode) {
      // 这里可以添加更复杂的逻辑来决定使用哪种模式
      // 例如，根据URL特征、请求头等判断
      // 目前简单地默认使用Node模式，因为它更轻量级
      log('factory.auto_detecting_mode', debug, { defaultToNode: true }, COMPONENTS.FETCHER_FACTORY);
      return new NodeFetcher();
    }
    
    // 默认使用Node模式 (Default to Node mode)
    log('factory.defaultingToNodeMode', debug, {}, COMPONENTS.FETCHER_FACTORY);
    return new NodeFetcher();
  }
} 