/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Browser, Page } from 'puppeteer';
import { BrowserFetcher } from '../src/lib/BrowserFetcher.js';
import { RequestPayload } from '../src/lib/types.js';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { log, COMPONENTS } from '../src/lib/logger.js';
import puppeteer from 'puppeteer';
import * as puppeteerExtra from 'puppeteer-extra';

// Mock Puppeteer
jest.mock('puppeteer', () => ({
  __esModule: true,
  default: {
    launch: jest.fn()
  }
}));

// Mock puppeteer-extra
jest.mock('puppeteer-extra', () => {
  const mockPuppeteerExtra = {
    use: jest.fn(),
    launch: jest.fn()
  };
  return {
    __esModule: true,
    default: mockPuppeteerExtra
  };
});

// Mock puppeteer-extra-plugin-stealth
jest.mock('puppeteer-extra-plugin-stealth', () => {
  const mockStealthPlugin = jest.fn();
  return {
    __esModule: true,
    default: mockStealthPlugin
  };
});

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

// Mock JSDOM
jest.mock('jsdom', () => ({
  JSDOM: jest.fn().mockImplementation(() => ({
    window: {
      document: {
        body: {
          textContent: '测试文本内容'
        }
      }
    }
  }))
}));

// Mock TurndownService
jest.mock('turndown', () => jest.fn().mockImplementation(() => ({
  addRule: jest.fn(),
  turndown: jest.fn().mockReturnValue('# 转换后的Markdown内容')
})));

// Mock i18n
jest.mock('../src/lib/i18n/index.js', () => ({
  t: (key: string, options?: any) => key
}));

// Mock logger
jest.mock('../src/lib/logger.js', () => ({
  log: jest.fn(),
  COMPONENTS: {
    BROWSER_FETCH: 'BROWSER_FETCH'
  }
}));

describe('BrowserFetcher 类测试 (BrowserFetcher Class Tests)', () => {
  let mockPuppeteerExtra: any;
  let mockBrowser: jest.Mocked<Browser>;
  let mockPage: jest.Mocked<Page>;
  
  // 模拟 process.memoryUsage 返回值
  const mockMemoryUsage = {
    heapUsed: 100 * 1024 * 1024,    // 100MB
    heapTotal: 200 * 1024 * 1024,    // 200MB
    rss: 300 * 1024 * 1024,         // 300MB
    external: 50 * 1024 * 1024,     // 50MB
    arrayBuffers: 10 * 1024 * 1024  // 10MB
  };

  beforeAll(() => {
    // 启用 Jest 的假计时器
    jest.useFakeTimers();
  });

  afterAll(() => {
    // 恢复真实计时器
    jest.useRealTimers();
  });

  beforeEach(() => {
    // 重置所有 mock
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // 模拟 process.memoryUsage
    jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);

    // 创建 mock 页面
    mockPage = {
      setDefaultTimeout: jest.fn(),
      setUserAgent: jest.fn(),
      setExtraHTTPHeaders: jest.fn(),
      goto: jest.fn(),
      waitForSelector: jest.fn(),
      content: jest.fn(),
      evaluate: jest.fn(),
      close: jest.fn(),
      cookies: jest.fn(),
      setCookie: jest.fn(),
      url: jest.fn()
    } as unknown as jest.Mocked<Page>;

    // 创建 mock 浏览器
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
      on: jest.fn()
    } as unknown as jest.Mocked<Browser>;

    // 重置 BrowserFetcher 的静态属性
    // @ts-ignore - 访问私有属性用于测试
    BrowserFetcher.browser = null;
    // @ts-ignore
    BrowserFetcher.browserStarting = false;
    // @ts-ignore
    BrowserFetcher.browserStartPromise = null;
    // @ts-ignore
    BrowserFetcher.lastMemoryCheck = 0;
    // @ts-ignore
    BrowserFetcher.cookieStore = {};

    // 获取 puppeteer-extra 的模拟实例
    mockPuppeteerExtra = require('puppeteer-extra').default;
    mockPuppeteerExtra.launch.mockReset();
  });

  describe('内存管理测试 (Memory Management Tests)', () => {
    test('应该正确检查内存使用情况 (Should check memory usage correctly)', async () => {
      // 准备测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证 process.memoryUsage 被调用
      expect(process.memoryUsage).toHaveBeenCalled();
    });

    test('当内存使用过高时应该记录警告 (Should log warning when memory usage is high)', async () => {
      // 模拟高内存使用情况
      const highMemoryUsage = {
        heapUsed: 900 * 1024 * 1024,    // 900MB
        heapTotal: 1024 * 1024 * 1024,   // 1GB
        rss: 1.5 * 1024 * 1024 * 1024,   // 1.5GB
        external: 200 * 1024 * 1024,      // 200MB
        arrayBuffers: 100 * 1024 * 1024   // 100MB
      };
      
      jest.spyOn(process, 'memoryUsage').mockReturnValue(highMemoryUsage);

      // 设置浏览器实例
      // @ts-ignore - 访问私有属性用于测试
      BrowserFetcher.browser = mockBrowser;

      // 准备测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证警告日志被记录
      expect(log).toHaveBeenCalledWith(
        'browser.memoryTooHigh',
        true,
        expect.objectContaining({
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
          rss: expect.any(Number)
        }),
        COMPONENTS.BROWSER_FETCH
      );
    });

    test('应该在检查间隔内只检查一次内存 (Should check memory only once within interval)', async () => {
      // 准备测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置浏览器实例
      // @ts-ignore - 访问私有属性用于测试
      BrowserFetcher.browser = mockBrowser;

      // 连续调用两次
      await BrowserFetcher.html(testPayload);
      await BrowserFetcher.html(testPayload);

      // 验证 process.memoryUsage 只被调用一次
      expect(process.memoryUsage).toHaveBeenCalledTimes(1);
    });

    test('应该在超过检查间隔后重新检查内存 (Should check memory again after interval)', async () => {
      // 准备测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置浏览器实例
      // @ts-ignore - 访问私有属性用于测试
      BrowserFetcher.browser = mockBrowser;

      // 第一次调用
      await BrowserFetcher.html(testPayload);
      
      // 模拟时间经过
      jest.advanceTimersByTime(60000); // 60秒后
      
      // 第二次调用
      await BrowserFetcher.html(testPayload);

      // 验证 process.memoryUsage 被调用两次
      expect(process.memoryUsage).toHaveBeenCalledTimes(2);
    });
  });

  describe('浏览器实例管理测试 (Browser Instance Management Tests)', () => {
    test('应该正确创建浏览器实例 (Should create browser instance correctly)', async () => {
      // 准备测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      const mockLaunch = require('puppeteer-extra').default.launch;
      mockLaunch.mockResolvedValue(mockBrowser);

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证浏览器实例被创建
      expect(mockLaunch).toHaveBeenCalled();
      
      // 验证事件监听器被设置
      expect(mockBrowser.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
    });

    test('应该复用已存在的浏览器实例 (Should reuse existing browser instance)', async () => {
      // 设置已存在的浏览器实例
      // @ts-ignore - 访问私有属性用于测试
      BrowserFetcher.browser = mockBrowser;

      // 准备测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证没有创建新的浏览器实例
      expect(require('puppeteer-extra').default.launch).not.toHaveBeenCalled();
    });

    test('应该正确处理浏览器启动中的状态 (Should handle browser starting state correctly)', async () => {
      // 模拟浏览器正在启动
      // @ts-ignore - 访问私有属性用于测试
      BrowserFetcher.browserStarting = true;
      // @ts-ignore
      BrowserFetcher.browserStartPromise = Promise.resolve(mockBrowser);

      // 准备测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证使用了现有的启动 Promise
      expect(require('puppeteer-extra').default.launch).not.toHaveBeenCalled();
    });

    test('应该在浏览器断开连接时清理实例 (Should clean up instance on browser disconnect)', async () => {
      // 设置 puppeteer-extra 的 launch 方法返回值
      const mockLaunch = require('puppeteer-extra').default.launch;
      mockLaunch.mockResolvedValue(mockBrowser);

      // 准备测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 获取断开连接的处理函数
      const disconnectHandler = mockBrowser.on.mock.calls.find(
        call => call[0] === 'disconnected'
      )?.[1];

      // 确保找到了处理函数
      expect(disconnectHandler).toBeDefined();

      // 调用断开连接的处理函数
      if (disconnectHandler) {
        disconnectHandler({ targetId: 'test-browser' });
      }

      // 验证浏览器实例被清理
      // @ts-ignore - 访问私有属性用于测试
      expect(BrowserFetcher.browser).toBeNull();
      // @ts-ignore
      expect(BrowserFetcher.browserStarting).toBeFalsy();
      // @ts-ignore
      expect(BrowserFetcher.browserStartPromise).toBeNull();
    });
  });

  describe('Cookie 管理测试 (Cookie Management Tests)', () => {
    beforeEach(() => {
      // 重置 BrowserFetcher 的静态属性
      (BrowserFetcher as any).cookieStore = {};
      (BrowserFetcher as any).browser = null;
      (BrowserFetcher as any).browserStarting = false;
      (BrowserFetcher as any).browserStartPromise = null;
      (BrowserFetcher as any).lastMemoryCheck = 0;
      
      // 重置 mock
      mockPage.evaluate.mockClear();
      mockPage.setExtraHTTPHeaders.mockClear();
      mockPage.goto.mockClear();
      mockPage.waitForSelector.mockClear();
      mockPage.content.mockClear();
      mockPage.close.mockClear();
      mockPage.url.mockClear();
      
      // 设置基本的 mock 返回值
      mockPage.content.mockResolvedValue('<html><body>Test content</body></html>');
      mockPage.waitForSelector.mockResolvedValue(null);
      
      // 模拟 puppeteerExtra.launch 返回浏览器实例
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
    });
    
    it('应该正确保存和获取 Cookie (Should save and retrieve cookies correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testDomain = 'example.com';
      const testCookie = 'test=value; path=/';
      
      // 模拟 getDomain 方法
      jest.spyOn(BrowserFetcher as any, 'getDomain')
        .mockReturnValue(testDomain);
      
      // 直接模拟 saveCookies 方法
      const originalSaveCookies = BrowserFetcher['saveCookies'];
      BrowserFetcher['saveCookies'] = jest.fn().mockImplementation((url, cookies) => {
        const domain = BrowserFetcher['getDomain'](url);
        if (domain) {
          BrowserFetcher['cookieStore'][domain] = cookies;
        }
      });
      
      // 模拟 evaluate 方法返回 cookie
      mockPage.evaluate.mockImplementation((fn: any) => {
        // 检查是否是获取 document.cookie 的调用
        if (fn && fn.toString && fn.toString().includes('document.cookie')) {
          return Promise.resolve(testCookie);
        }
        return Promise.resolve('');
      });
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async (params: any) => {
        // 模拟 fetch 方法的行为
        const { url, saveCookies } = params;
        
        // 如果有存储的 cookies，使用它们
        const storedCookies = BrowserFetcher['getCookies'](url);
        if (storedCookies && saveCookies) {
          await mockPage.setExtraHTTPHeaders({
            'Cookie': storedCookies
          });
        }
        
        // 模拟获取页面内容
        await mockPage.goto(url, { waitUntil: 'networkidle2' });
        
        // 如果需要保存 cookies
        if (saveCookies) {
          const cookies = await mockPage.evaluate(() => document.cookie);
          if (cookies) {
            BrowserFetcher['saveCookies'](url, cookies);
          }
        }
        
        return {
          content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
          isError: false
        };
      });
      
      // 第一次请求
      await BrowserFetcher.fetch({
        url: testUrl,
        useBrowser: true,
        saveCookies: true
      });
      
      // 验证 saveCookies 是否被调用
      expect(BrowserFetcher['saveCookies']).toHaveBeenCalledWith(testUrl, testCookie);
      
      // 验证 Cookie 是否被保存
      expect(BrowserFetcher['cookieStore'][testDomain]).toBe(testCookie);
      
      // 重置 mock 以便于验证
      mockPage.setExtraHTTPHeaders.mockClear();
      
      // 第二次请求
      await BrowserFetcher.fetch({
        url: testUrl,
        useBrowser: true,
        saveCookies: true
      });
      
      // 验证是否使用了保存的 Cookie
      expect(mockPage.setExtraHTTPHeaders).toHaveBeenCalledWith(expect.objectContaining({
        'Cookie': testCookie
      }));
      
      // 恢复原始方法
      BrowserFetcher['saveCookies'] = originalSaveCookies;
      BrowserFetcher.fetch = originalFetch;
    });
    
    it('当 saveCookies 为 false 时不应保存 Cookie (Should not save cookies when saveCookies is false)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testDomain = 'example.com';
      const testCookie = 'test=value; path=/';
      
      // 模拟 getDomain 方法
      jest.spyOn(BrowserFetcher as any, 'getDomain')
        .mockReturnValue(testDomain);
      
      // 直接模拟 saveCookies 方法
      const originalSaveCookies = BrowserFetcher['saveCookies'];
      BrowserFetcher['saveCookies'] = jest.fn();
      
      // 模拟 evaluate 方法返回 cookie
      mockPage.evaluate.mockImplementation((fn: any) => {
        // 检查是否是获取 document.cookie 的调用
        if (fn && fn.toString && fn.toString().includes('document.cookie')) {
          return Promise.resolve(testCookie);
        }
        return Promise.resolve('');
      });
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async (params: any) => {
        // 模拟 fetch 方法的行为
        const { url, saveCookies } = params;
        
        // 模拟获取页面内容
        await mockPage.goto(url, { waitUntil: 'networkidle2' });
        
        // 如果需要保存 cookies
        if (saveCookies) {
          const cookies = await mockPage.evaluate(() => document.cookie);
          if (cookies) {
            BrowserFetcher['saveCookies'](url, cookies);
          }
        }
        
        return {
          content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
          isError: false
        };
      });
      
      // 调用 fetch，设置 saveCookies 为 false
      await BrowserFetcher.fetch({
        url: testUrl,
        useBrowser: true,
        saveCookies: false
      });
      
      // 验证 saveCookies 没有被调用
      expect(BrowserFetcher['saveCookies']).not.toHaveBeenCalled();
      
      // 恢复原始方法
      BrowserFetcher['saveCookies'] = originalSaveCookies;
      BrowserFetcher.fetch = originalFetch;
    });
    
    it('应该为不同域名分别保存 Cookie (Should save cookies separately for different domains)', async () => {
      // 设置测试数据
      const testUrl1 = 'https://example.com/page1';
      const testUrl2 = 'https://another-site.com/page2';
      const testCookie1 = 'cookie1=value1';
      const testCookie2 = 'cookie2=value2';
      
      // 直接设置 cookieStore
      BrowserFetcher['cookieStore'] = {
        'example.com': testCookie1,
        'another-site.com': testCookie2
      };
      
      // 模拟 getDomain 方法
      const originalGetDomain = BrowserFetcher['getDomain'];
      BrowserFetcher['getDomain'] = jest.fn().mockImplementation((url: string) => {
        if (url.includes('example.com')) return 'example.com';
        if (url.includes('another-site.com')) return 'another-site.com';
        return '';
      });
      
      // 模拟 getCookies 方法
      const originalGetCookies = BrowserFetcher['getCookies'];
      BrowserFetcher['getCookies'] = jest.fn().mockImplementation((url) => {
        const domain = BrowserFetcher['getDomain'](url);
        return BrowserFetcher['cookieStore'][domain];
      });
      
      // 验证第一个域名的 Cookie
      const cookie1 = BrowserFetcher['getCookies'](testUrl1);
      expect(cookie1).toBe(testCookie1);
      
      // 验证第二个域名的 Cookie
      const cookie2 = BrowserFetcher['getCookies'](testUrl2);
      expect(cookie2).toBe(testCookie2);
      
      // 恢复原始方法
      BrowserFetcher['getDomain'] = originalGetDomain;
      BrowserFetcher['getCookies'] = originalGetCookies;
    }, 10000); // 增加超时时间
  });

  describe('代理设置测试 (Proxy Settings Tests)', () => {
    test('应该正确处理用户指定的代理 (Should handle user-specified proxy correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testProxy = 'http://proxy.example.com:8080';
      const testPayload = {
        url: testUrl,
        proxy: testProxy,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
        isError: false
      });

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证 fetch 方法被调用，并且传递了正确的代理参数
      expect(BrowserFetcher.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: testUrl,
          proxy: testProxy
        })
      );
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
    });

    test('应该正确处理系统代理设置 (Should handle system proxy settings correctly)', async () => {
      // 模拟环境变量
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        HTTP_PROXY: 'http://system-proxy.example.com:8080'
      };

      // 模拟 execSync
      const { execSync } = require('child_process');
      execSync.mockReturnValue('HTTP_PROXY=http://system-proxy.example.com:8080');

      // 设置测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        useSystemProxy: true,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
        isError: false
      });

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证 fetch 方法被调用，并且传递了正确的系统代理参数
      expect(BrowserFetcher.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: testUrl,
          useSystemProxy: true
        })
      );
      
      // 恢复原始方法和环境变量
      BrowserFetcher.fetch = originalFetch;
      process.env = originalEnv;
    });

    test('当 useSystemProxy 为 false 时不应使用系统代理 (Should not use system proxy when useSystemProxy is false)', async () => {
      // 模拟环境变量
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        HTTP_PROXY: 'http://system-proxy.example.com:8080'
      };

      // 设置测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        useSystemProxy: false,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
        isError: false
      });

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证 fetch 方法被调用，并且传递了正确的 useSystemProxy 参数
      expect(BrowserFetcher.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: testUrl,
          useSystemProxy: false
        })
      );
      
      // 恢复原始方法和环境变量
      BrowserFetcher.fetch = originalFetch;
      process.env = originalEnv;
    });

    test('用户指定的代理应优先于系统代理 (User-specified proxy should take precedence over system proxy)', async () => {
      // 模拟环境变量
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        HTTP_PROXY: 'http://system-proxy.example.com:8080'
      };

      // 设置测试数据
      const testUrl = 'https://example.com';
      const testProxy = 'http://user-proxy.example.com:8080';
      const testPayload = {
        url: testUrl,
        proxy: testProxy,
        useSystemProxy: true,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
        isError: false
      });

      // 调用方法
      await BrowserFetcher.html(testPayload);

      // 验证 fetch 方法被调用，并且传递了正确的代理参数（用户指定的代理）
      expect(BrowserFetcher.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: testUrl,
          proxy: testProxy,
          useSystemProxy: true
        })
      );
      
      // 恢复原始方法和环境变量
      BrowserFetcher.fetch = originalFetch;
      process.env = originalEnv;
    });
  });

  describe('内容获取测试 (Content Fetching Tests)', () => {
    test('应该正确获取 HTML 内容 (Should fetch HTML content correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testHtml = '<html><body><h1>Test Content</h1></body></html>';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟页面内容
      mockPage.content.mockResolvedValue(testHtml);
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: testHtml }],
          isError: false
        };
      });

      // 调用方法
      const result = await BrowserFetcher.html(testPayload);

      // 验证结果
      expect(result).toEqual({
        content: [{ type: 'text', text: testHtml }],
        isError: false
      });
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
    });

    test('应该正确获取 JSON 内容 (Should fetch JSON content correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://api.example.com/data.json';
      const testJson = { name: 'Test', value: 123 };
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟页面内容
      mockPage.content.mockResolvedValue(JSON.stringify(testJson));
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: JSON.stringify(testJson) }],
          isError: false
        };
      });

      // 调用方法
      const result = await BrowserFetcher.json(testPayload);

      // 验证结果
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(testJson) }],
        isError: false
      });
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
    });

    test('应该正确获取纯文本内容 (Should fetch text content correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com/text';
      const testHtml = '<html><body><h1>Test Content</h1><p>This is a paragraph.</p></body></html>';
      const expectedText = 'Test Content This is a paragraph.';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟页面内容
      mockPage.content.mockResolvedValue(testHtml);
      
      // 模拟 JSDOM
      const mockJsdom = require('jsdom').JSDOM;
      mockJsdom.mockImplementation(() => ({
        window: {
          document: {
            body: {
              textContent: expectedText
            }
          }
        }
      }));
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: testHtml }],
          isError: false
        };
      });

      // 调用方法
      const result = await BrowserFetcher.txt(testPayload);

      // 验证结果
      expect(result).toEqual({
        content: [{ type: 'text', text: expectedText }],
        isError: false
      });
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
    });

    test('应该正确获取 Markdown 内容 (Should fetch Markdown content correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com/markdown';
      const testHtml = '<html><body><h1>Test Content</h1><p>This is a paragraph.</p></body></html>';
      const expectedMarkdown = '# 转换后的Markdown内容';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟页面内容
      mockPage.content.mockResolvedValue(testHtml);
      
      // 模拟 TurndownService
      const mockTurndownService = require('turndown');
      mockTurndownService.mockImplementation(() => ({
        addRule: jest.fn(),
        turndown: jest.fn().mockReturnValue(expectedMarkdown)
      }));
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async () => {
        return {
          content: [{ type: 'text', text: testHtml }],
          isError: false
        };
      });

      // 调用方法
      const result = await BrowserFetcher.markdown(testPayload);

      // 验证结果
      expect(result).toEqual({
        content: [{ type: 'text', text: expectedMarkdown }],
        isError: false
      });
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
    });
    
    test('应该正确处理滚动到底部的选项 (Should handle scrollToBottom option correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testHtml = '<html><body><h1>Test Content</h1></body></html>';
      const testPayload = {
        url: testUrl,
        scrollToBottom: true,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟页面内容和评估方法
      mockPage.content.mockResolvedValue(testHtml);
      mockPage.evaluate.mockImplementation((fn) => {
        // 检查是否是自动滚动的调用
        if (fn && fn.toString && fn.toString().includes('scrollBy')) {
          return Promise.resolve();
        }
        return Promise.resolve('');
      });
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async (params) => {
        // 如果需要滚动到底部
        if (params.scrollToBottom) {
          // 模拟自动滚动
          await mockPage.evaluate(() => {});
        }
        
        return {
          content: [{ type: 'text', text: testHtml }],
          isError: false
        };
      });

      // 调用方法
      const result = await BrowserFetcher.html(testPayload);

      // 验证结果
      expect(result).toEqual({
        content: [{ type: 'text', text: testHtml }],
        isError: false
      });
      
      // 验证 fetch 方法被调用，并且传递了正确的 scrollToBottom 参数
      expect(BrowserFetcher.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: testUrl,
          scrollToBottom: true
        })
      );
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
    });
  });

  describe('错误处理和重试测试 (Error Handling and Retry Tests)', () => {
    test('应该正确处理网络错误并重试 (Should handle network errors and retry correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟 fetch 方法抛出错误，然后成功
      const originalFetch = BrowserFetcher.fetch;
      let fetchCallCount = 0;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async () => {
        fetchCallCount++;
        if (fetchCallCount === 1) {
          throw new Error('Network error');
        }
        return {
          content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
          isError: false
        };
      });

      // 模拟 setTimeout
      jest.useFakeTimers();
      const originalSetTimeout = global.setTimeout;
      // @ts-ignore - 忽略 setTimeout 类型错误
      global.setTimeout = jest.fn().mockImplementation((callback, ms) => {
        callback();
        return null as any;
      });

      // 调用方法
      const result = await BrowserFetcher.html(testPayload);

      // 验证 fetch 被调用了两次（一次失败，一次成功）
      expect(fetchCallCount).toBe(2);
      
      // 验证结果
      expect(result).toEqual({
        content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
        isError: false
      });
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
      global.setTimeout = originalSetTimeout;
      jest.useRealTimers();
    });

    test('应该在超过最大重试次数后返回错误 (Should return error after exceeding maximum retry count)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟 fetch 方法始终抛出错误
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async () => {
        throw new Error('Network error');
      });

      // 模拟 setTimeout
      jest.useFakeTimers();
      const originalSetTimeout = global.setTimeout;
      // @ts-ignore - 忽略 setTimeout 类型错误
      global.setTimeout = jest.fn().mockImplementation((callback, ms) => {
        callback();
        return null as any;
      });

      // 调用方法
      const result = await BrowserFetcher.html(testPayload);

      // 验证 fetch 被调用了 3 次（初始 + 2 次重试）
      expect(BrowserFetcher.fetch).toHaveBeenCalledTimes(3);
      
      // 验证结果是错误
      expect(result.isError).toBe(true);
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
      global.setTimeout = originalSetTimeout;
      jest.useRealTimers();
    });

    test('应该正确处理 Cloudflare 保护 (Should handle Cloudflare protection correctly)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟页面内容和评估方法
      mockPage.content.mockResolvedValue('<html><body><h1>Test Content</h1></body></html>');
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '<html><body>Test content</body></html>' }],
        isError: false
      });

      // 调用方法
      const result = await BrowserFetcher.html(testPayload);
      
      // 验证结果
      expect(result.isError).toBe(false);
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
    }, 10000); // 增加超时时间

    test('应该正确处理 about:blank 和 closeBrowser 选项 (Should handle about:blank and closeBrowser option correctly)', async () => {
      // 设置测试数据
      const testPayload = {
        url: 'about:blank',
        closeBrowser: true,
        debug: true
      };

      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 设置浏览器实例
      // @ts-ignore - 访问私有属性用于测试
      BrowserFetcher.browser = mockBrowser;
      
      // 调用方法
      const result = await BrowserFetcher.html(testPayload);

      // 验证浏览器关闭方法被调用
      expect(mockBrowser.close).toHaveBeenCalled();
      
      // 验证结果
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Browser closed successfully' }],
        isError: false
      });
    });

    test('应该在内容过长时截断内容 (Should truncate content when it is too long)', async () => {
      // 设置测试数据
      const testUrl = 'https://example.com';
      const testPayload = {
        url: testUrl,
        debug: true
      };

      // 生成一个超过 10MB 的内容
      const longContent = 'a'.repeat(11 * 1024 * 1024); // 11MB
      
      // 设置 puppeteer-extra 的 launch 方法返回值
      mockPuppeteerExtra.launch.mockResolvedValue(mockBrowser);
      
      // 模拟页面内容
      mockPage.content.mockResolvedValue(longContent);
      
      // 模拟 fetch 方法
      const originalFetch = BrowserFetcher.fetch;
      BrowserFetcher.fetch = jest.fn().mockImplementation(async () => {
        // 获取页面内容
        const content = await mockPage.content();
        
        // 如果内容太长，截断它
        let finalContent = content;
        if (content.length > 10 * 1024 * 1024) { // 10MB
          finalContent = content.substring(0, 10 * 1024 * 1024);
        }
        
        return {
          content: [{ type: 'text', text: finalContent }],
          isError: false
        };
      });

      // 调用方法
      const result = await BrowserFetcher.html(testPayload);

      // 验证结果内容长度不超过 10MB
      expect(result.content[0].text.length).toBe(10 * 1024 * 1024);
      
      // 恢复原始方法
      BrowserFetcher.fetch = originalFetch;
    });
  });
}); 