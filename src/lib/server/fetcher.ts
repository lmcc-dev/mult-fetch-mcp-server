/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { BrowserFetcher } from '../BrowserFetcher.js';
import { NodeFetcher } from '../NodeFetcher.js';
import { FetchParams } from './types.js';
import { createLogger } from '../i18n/logger.js';
import { initializeBrowser, closeBrowserInstance, shouldSwitchToBrowser } from './browser.js';

// 创建服务器获取器日志记录器 (Create server fetcher logger)
const logger = createLogger('MCP-SERVER');

/**
 * 辅助函数：根据类型和参数自动选择合适的获取方法 (Helper function: automatically select appropriate fetching method based on type and parameters)
 * 支持自动在标准模式和浏览器模式之间切换 (Supports automatic switching between standard mode and browser mode)
 * @param params 请求参数 (Request parameters)
 * @param type 内容类型 (Content type)
 * @returns 获取结果 (Fetch result)
 */
export async function fetchWithAutoDetect(params: FetchParams, type: 'html' | 'json' | 'txt' | 'markdown') {
  const useBrowser = params.useBrowser === true;
  const autoDetectMode = params.autoDetectMode !== false; // 除非明确设置为 false，否则默认为 true (Unless explicitly set to false, default to true)
  const closeBrowserAfterFetch = params.closeBrowser === true; // 是否在获取后关闭浏览器 (Whether to close the browser after fetching)
  
  // 严格从调用参数中获取debug值
  const debug = params.debug === true;
  
  try {
    if (useBrowser) {
      // 如果使用浏览器模式，确保浏览器已初始化 (If using browser mode, ensure browser is initialized)
      await initializeBrowser(debug);
      if (debug) {
        logger.info('server.usingBrowserMode', { type, url: params.url });
      }
      
      // 确保params中包含debug参数 (Ensure params contains debug parameter)
      params.debug = debug;
      
      // 根据类型选择合适的浏览器获取方法 (Choose appropriate browser fetching method based on type)
      switch (type) {
        case 'html':
          return await BrowserFetcher.html(params);
        case 'json':
          return await BrowserFetcher.json(params);
        case 'txt':
          return await BrowserFetcher.txt(params);
        case 'markdown':
          return await BrowserFetcher.markdown(params);
      }
    } else {
      // 使用标准模式
      if (debug) {
        logger.info('server.usingAutoDetectMode', { type, url: params.url });
      }
      
      try {
        // 根据类型选择合适的标准获取方法 (Choose appropriate standard fetching method based on type)
        let result;
        switch (type) {
          case 'html':
            result = await NodeFetcher.html(params);
            break;
          case 'json':
            result = await NodeFetcher.json(params);
            break;
          case 'txt':
            result = await NodeFetcher.txt(params);
            break;
          case 'markdown':
            result = await NodeFetcher.markdown(params);
            break;
        }
        
        return result;
      } catch (error) {
        // 如果标准模式失败且启用了自动检测
        if (autoDetectMode && shouldSwitchToBrowser(error)) {
          if (debug) {
            logger.info('server.switchingToBrowserMode', { url: params.url });
          }
          
          // 确保浏览器已初始化
          await initializeBrowser(debug);
          
          // 设置浏览器模式参数
          params.useBrowser = true;
          params.debug = debug;
          
          // 根据类型选择合适的浏览器获取方法
          switch (type) {
            case 'html':
              return await BrowserFetcher.html(params);
            case 'json':
              return await BrowserFetcher.json(params);
            case 'txt':
              return await BrowserFetcher.txt(params);
            case 'markdown':
              return await BrowserFetcher.markdown(params);
          }
        }
        
        // 如果不需要切换到浏览器模式，则抛出原始错误
        throw error;
      }
    }
  } catch (error) {
    // 处理所有错误
    if (debug) {
      logger.error('server.fetchError', { type, error: error instanceof Error ? error.message : String(error) });
    }
    
    // 如果出错且启用了关闭浏览器选项，确保浏览器被关闭
    if (closeBrowserAfterFetch) {
      await closeBrowserInstance(debug);
    }
    
    throw error;
  }
}