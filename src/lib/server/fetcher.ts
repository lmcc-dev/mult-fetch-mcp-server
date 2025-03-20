/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Fetcher } from '../fetch.js';
import { FetchParams } from './types.js';
import { log, COMPONENTS } from '../logger.js';
import { initializeBrowser, closeBrowserInstance, shouldSwitchToBrowser } from './browser.js';

/**
 * 辅助函数：根据类型和参数自动选择合适的获取方法 (Helper function: automatically select appropriate fetching method based on type and parameters)
 * 支持自动在标准模式和浏览器模式之间切换 (Supports automatic switching between standard mode and browser mode)
 * @param params 请求参数 (Request parameters)
 * @param type 内容类型 (Content type)
 * @returns 获取结果 (Fetch result)
 */
export async function fetchWithAutoDetect(params: FetchParams, type: 'html' | 'json' | 'txt' | 'markdown' | 'plaintext') {
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
        log('server.usingBrowserMode', debug, { type, url: params.url }, COMPONENTS.SERVER);
      }

      // 确保params中包含debug参数 (Ensure params contains debug parameter)
      params.debug = debug;

      // 根据类型选择合适的浏览器获取方法 (Choose appropriate browser fetching method based on type)
      switch (type) {
        case 'html':
          return await Fetcher.html(params);
        case 'json':
          return await Fetcher.json(params);
        case 'txt':
          return await Fetcher.txt(params);
        case 'markdown':
          return await Fetcher.markdown(params);
        case 'plaintext':
          return await Fetcher.plainText(params);
        default:
          throw new Error(`Unsupported content type: ${type}`);
      }
    } else {
      // 使用标准模式
      if (debug) {
        log('server.usingAutoDetectMode', debug, { type, url: params.url }, COMPONENTS.SERVER);
      }

      try {
        // 根据类型选择合适的标准获取方法 (Choose appropriate standard fetching method based on type)
        let result;
        switch (type) {
          case 'html': {
            result = await Fetcher.html(params);
            break;
          }
          case 'json': {
            result = await Fetcher.json(params);
            break;
          }
          case 'txt': {
            result = await Fetcher.txt(params);
            break;
          }
          case 'markdown': {
            result = await Fetcher.markdown(params);
            break;
          }
          case 'plaintext': {
            result = await Fetcher.plainText(params);
            break;
          }
          default:
            throw new Error(`Unsupported content type: ${type}`);
        }

        // 检查结果是否为错误，并且是否包含403或forbidden关键词
        if (result.isError && autoDetectMode) {
          const errorText = result.content && result.content[0] && result.content[0].text
            ? String(result.content[0].text)
            : '';

          const is403Error = errorText.includes('403') ||
            errorText.toLowerCase().includes('forbidden');

          if (is403Error || shouldSwitchToBrowser(errorText)) {
            if (debug) {
              log('server.switchingToBrowserMode', debug, {
                url: params.url,
                error: errorText,
                reason: is403Error ? '403 Forbidden' : 'Other error requiring browser'
              }, COMPONENTS.SERVER);
            }

            // 确保浏览器已初始化
            await initializeBrowser(debug);

            // 设置浏览器模式参数
            const browserParams = {
              ...params,
              useBrowser: true,
              debug: debug
            };

            // 根据类型选择合适的浏览器获取方法
            let browserResult;
            switch (type) {
              case 'html':
                browserResult = await Fetcher.html(browserParams);
                break;
              case 'json':
                browserResult = await Fetcher.json(browserParams);
                break;
              case 'txt':
                browserResult = await Fetcher.txt(browserParams);
                break;
              case 'markdown':
                browserResult = await Fetcher.markdown(browserParams);
                break;
              case 'plaintext':
                browserResult = await Fetcher.plainText(browserParams);
                break;
              default:
                throw new Error(`Unsupported content type: ${type}`);
            }

            return browserResult;
          }
        }

        return result;
      } catch (error) {
        // 如果标准模式失败且启用了自动检测
        const errorMessage = error instanceof Error ? error.message : String(error);

        // 检查是否应该切换到浏览器模式
        // 特别处理 HTTP 403 Forbidden 错误，这是最常见的需要切换到浏览器模式的情况
        const shouldSwitch = autoDetectMode && (
          shouldSwitchToBrowser(error) ||
          errorMessage.includes('403') ||
          errorMessage.toLowerCase().includes('forbidden')
        );

        if (shouldSwitch) {
          if (debug) {
            log('server.switchingToBrowserMode', debug, { url: params.url }, COMPONENTS.SERVER);
          }

          // 确保浏览器已初始化
          await initializeBrowser(debug);

          // 设置浏览器模式参数
          const browserParams = {
            ...params,
            useBrowser: true,
            debug: debug
          };

          // 根据类型选择合适的浏览器获取方法
          let browserResult;
          switch (type) {
            case 'html':
              browserResult = await Fetcher.html(browserParams);
              break;
            case 'json':
              browserResult = await Fetcher.json(browserParams);
              break;
            case 'txt':
              browserResult = await Fetcher.txt(browserParams);
              break;
            case 'markdown':
              browserResult = await Fetcher.markdown(browserParams);
              break;
            case 'plaintext':
              browserResult = await Fetcher.plainText(browserParams);
              break;
            default:
              throw new Error(`Unsupported content type: ${type}`);
          }

          return browserResult;
        }

        // 如果不需要切换到浏览器模式，则抛出原始错误
        throw error;
      }
    }
  } catch (error) {
    // 处理所有错误
    if (debug) {
      log('server.fetchError', debug, { type, error: error instanceof Error ? error.message : String(error) }, COMPONENTS.SERVER);
    }

    // 如果出错且启用了关闭浏览器选项，确保浏览器被关闭
    if (closeBrowserAfterFetch) {
      await closeBrowserInstance(debug);
    }

    throw error;
  }
}
