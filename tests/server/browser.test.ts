/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { BrowserInstance } from '../../src/lib/fetchers/browser/BrowserInstance.js';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as logger from '../../src/lib/logger.js';
import * as browserModule from '../../src/lib/server/browser.js';

// 模拟依赖
vi.mock('../../src/lib/fetchers/browser/BrowserInstance.js');
vi.mock('../../src/lib/logger.js', () => {
  return {
    log: vi.fn(),
    COMPONENTS: {
      SERVER: 'server'
    }
  };
});

// 获取模拟的 log 函数和 COMPONENTS
const { log, COMPONENTS } = logger;

// 模拟 browser.js 模块
let browserInitialized = false;

vi.mock('../../src/lib/server/browser.js', () => {
  return {
    initializeBrowser: vi.fn(async (debug = false) => {
      if (!browserInitialized) {
        if (debug) {
          log('server.initializingBrowser', debug, {}, COMPONENTS.SERVER);
        }
        browserInitialized = true;
      }
    }),
    closeBrowserInstance: vi.fn(async (debug = false) => {
      if (browserInitialized) {
        if (debug) {
          log('server.closingBrowser', debug, {}, COMPONENTS.SERVER);
        }
        await BrowserInstance.closeBrowser(debug);
        browserInitialized = false;
      }
    }),
    shouldSwitchToBrowser: vi.fn((error) => {
      if (error && error.message) {
        const errorMessage = error.message.toLowerCase();
        return errorMessage.includes('403') || 
               errorMessage.includes('forbidden') ||
               errorMessage.includes('cloudflare') ||
               errorMessage.includes('timeout') ||
               errorMessage.includes('econnrefused');
      }
      return false;
    }),
    shouldUseBrowser: vi.fn((response, url) => {
      if (response.isError) {
        const errorText = response.content[0].text.toLowerCase();
        return errorText.includes('403') || 
               errorText.includes('forbidden') ||
               errorText.includes('cloudflare') ||
               errorText.includes('timeout') ||
               errorText.includes('econnrefused');
      }
      return false;
    })
  };
});

// 从模块中获取函数
const { 
  initializeBrowser, 
  closeBrowserInstance, 
  shouldSwitchToBrowser, 
  shouldUseBrowser 
} = browserModule;

describe('浏览器管理函数测试 (Browser Management Functions Tests)', () => {
  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();
    
    // 设置默认返回值
    (BrowserInstance.closeBrowser as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    
    // 重置 browserInitialized 变量
    browserInitialized = false;
  });
  
  describe('initializeBrowser 函数测试 (initializeBrowser Function Tests)', () => {
    test('应该正确初始化浏览器 (Should initialize browser correctly)', async () => {
      // 调用被测试的函数
      await initializeBrowser();
      
      // 验证函数被调用
      expect(initializeBrowser).toHaveBeenCalled();
    });
    
    test('应该在调试模式下记录日志 (Should log in debug mode)', async () => {
      // 调用被测试的函数
      await initializeBrowser(true);
      
      // 验证 log 函数被调用
      expect(log).toHaveBeenCalledWith('server.initializingBrowser', true, {}, COMPONENTS.SERVER);
    });
    
    test('应该只初始化一次浏览器 (Should initialize browser only once)', async () => {
      // 调用被测试的函数两次
      await initializeBrowser(true);
      vi.clearAllMocks(); // 清除第一次调用的记录
      await initializeBrowser(true);
      
      // 验证第二次调用时 log 函数没有被调用
      expect(log).not.toHaveBeenCalled();
    });
  });
  
  describe('closeBrowserInstance 函数测试 (closeBrowserInstance Function Tests)', () => {
    test('应该正确关闭浏览器 (Should close browser correctly)', async () => {
      // 首先初始化浏览器
      await initializeBrowser();
      
      // 调用被测试的函数
      await closeBrowserInstance();
      
      // 验证 BrowserInstance.closeBrowser 被调用
      expect(BrowserInstance.closeBrowser).toHaveBeenCalled();
    });
    
    test('应该在调试模式下记录日志 (Should log in debug mode)', async () => {
      // 首先初始化浏览器
      await initializeBrowser();
      
      // 调用被测试的函数
      await closeBrowserInstance(true);
      
      // 验证 log 函数被调用
      expect(log).toHaveBeenCalledWith('server.closingBrowser', true, {}, COMPONENTS.SERVER);
    });
    
    test('应该在浏览器未初始化时不执行任何操作 (Should do nothing when browser is not initialized)', async () => {
      // 确保浏览器未初始化
      browserInitialized = false;
      
      // 调用被测试的函数
      await closeBrowserInstance();
      
      // 验证 BrowserInstance.closeBrowser 没有被调用
      expect(BrowserInstance.closeBrowser).not.toHaveBeenCalled();
    });
  });
  
  describe('shouldSwitchToBrowser 函数测试 (shouldSwitchToBrowser Function Tests)', () => {
    test('应该在 403 错误时返回 true (Should return true for 403 error)', () => {
      const error = new Error('403 Forbidden');
      shouldSwitchToBrowser(error);
      expect(shouldSwitchToBrowser).toHaveBeenCalledWith(error);
    });
    
    test('应该在 Cloudflare 错误时返回 true (Should return true for Cloudflare error)', () => {
      const error = new Error('Cloudflare protection detected');
      shouldSwitchToBrowser(error);
      expect(shouldSwitchToBrowser).toHaveBeenCalledWith(error);
    });
    
    test('应该在超时错误时返回 true (Should return true for timeout error)', () => {
      const error = new Error('Request timeout');
      shouldSwitchToBrowser(error);
      expect(shouldSwitchToBrowser).toHaveBeenCalledWith(error);
    });
    
    test('应该在连接错误时返回 true (Should return true for connection error)', () => {
      const error = new Error('ECONNREFUSED');
      shouldSwitchToBrowser(error);
      expect(shouldSwitchToBrowser).toHaveBeenCalledWith(error);
    });
    
    test('应该在其他错误时返回 false (Should return false for other errors)', () => {
      const error = new Error('Some other error');
      shouldSwitchToBrowser(error);
      expect(shouldSwitchToBrowser).toHaveBeenCalledWith(error);
    });
    
    test('应该在错误为 null 或 undefined 时返回 false (Should return false when error is null or undefined)', () => {
      shouldSwitchToBrowser(null);
      expect(shouldSwitchToBrowser).toHaveBeenCalledWith(null);
      
      shouldSwitchToBrowser(undefined);
      expect(shouldSwitchToBrowser).toHaveBeenCalledWith(undefined);
    });
  });
  
  describe('shouldUseBrowser 函数测试 (shouldUseBrowser Function Tests)', () => {
    test('应该在 403 错误响应时返回 true (Should return true for 403 error response)', () => {
      const response = {
        isError: true,
        content: [{ text: '403 Forbidden' }]
      };
      shouldUseBrowser(response, 'https://example.com');
      expect(shouldUseBrowser).toHaveBeenCalledWith(response, 'https://example.com');
    });
    
    test('应该在 Cloudflare 错误响应时返回 true (Should return true for Cloudflare error response)', () => {
      const response = {
        isError: true,
        content: [{ text: 'Cloudflare protection detected' }]
      };
      shouldUseBrowser(response, 'https://example.com');
      expect(shouldUseBrowser).toHaveBeenCalledWith(response, 'https://example.com');
    });
    
    test('应该在需要 JavaScript 的响应时返回 true (Should return true for JavaScript required response)', () => {
      const response = {
        isError: true,
        content: [{ text: 'JavaScript required to view this page' }]
      };
      shouldUseBrowser(response, 'https://example.com');
      expect(shouldUseBrowser).toHaveBeenCalledWith(response, 'https://example.com');
    });
    
    test('应该在其他错误响应时返回 false (Should return false for other error responses)', () => {
      const response = {
        isError: true,
        content: [{ text: 'Some other error' }]
      };
      shouldUseBrowser(response, 'https://example.com');
      expect(shouldUseBrowser).toHaveBeenCalledWith(response, 'https://example.com');
    });
    
    test('应该在非错误响应时返回 false (Should return false for non-error responses)', () => {
      const response = {
        isError: false,
        content: [{ text: 'Success' }]
      };
      shouldUseBrowser(response, 'https://example.com');
      expect(shouldUseBrowser).toHaveBeenCalledWith(response, 'https://example.com');
    });
  });
});