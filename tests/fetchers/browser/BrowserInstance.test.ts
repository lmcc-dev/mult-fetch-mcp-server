/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, expect, test, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Browser } from 'puppeteer';
import { BrowserInstance } from '../../../src/lib/fetchers/browser/BrowserInstance.js';
import { log, COMPONENTS } from '../../../src/lib/logger.js';

// 使用vi.hoisted创建模拟对象，确保它们在vi.mock之前被定义
const mockBrowser = vi.hoisted(() => ({
  newPage: vi.fn(),
  close: vi.fn(),
  on: vi.fn()
}));

const mockLaunch = vi.hoisted(() => vi.fn().mockResolvedValue(mockBrowser));

// Mock Puppeteer
vi.mock('puppeteer', () => ({
  __esModule: true,
  default: {
    launch: vi.fn()
  }
}));

// Mock puppeteer-extra
vi.mock('puppeteer-extra', () => ({
  __esModule: true,
  default: {
    use: vi.fn(),
    launch: mockLaunch
  }
}));

// Mock puppeteer-extra-plugin-stealth
vi.mock('puppeteer-extra-plugin-stealth', () => ({
  __esModule: true,
  default: vi.fn()
}));

// Mock logger
vi.mock('../../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    BROWSER_FETCH: 'BROWSER_FETCH'
  }
}));

describe('BrowserInstance 类测试 (BrowserInstance Class Tests)', () => {
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
    vi.useFakeTimers();
  });

  afterAll(() => {
    // 恢复真实计时器
    vi.useRealTimers();
  });

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // 模拟 process.memoryUsage
    vi.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);

    // 重置 BrowserInstance 的静态属性
    // @ts-ignore - 访问私有属性用于测试
    BrowserInstance.browser = null;
    // @ts-ignore
    BrowserInstance.browserStarting = false;
    // @ts-ignore
    BrowserInstance.browserStartPromise = null;
    // @ts-ignore
    BrowserInstance.lastMemoryCheck = 0;
  });

  describe('内存管理测试 (Memory Management Tests)', () => {
    test('应该正确检查内存使用情况 (Should check memory usage correctly)', () => {
      // 调用方法
      BrowserInstance.checkMemoryUsage(true);

      // 验证 process.memoryUsage 被调用
      expect(process.memoryUsage).toHaveBeenCalled();
      
      // 验证日志被记录
      expect(log).toHaveBeenCalledWith(
        'browser.memoryUsage',
        true,
        expect.objectContaining({
          usage: expect.any(Number)
        }),
        COMPONENTS.BROWSER_FETCH
      );
    });

    test('当内存使用过高时应该记录警告 (Should log warning when memory usage is high)', () => {
      // 模拟高内存使用情况
      const highMemoryUsage = {
        heapUsed: 900 * 1024 * 1024,    // 900MB
        heapTotal: 1024 * 1024 * 1024,   // 1GB
        rss: 1.5 * 1024 * 1024 * 1024,   // 1.5GB
        external: 200 * 1024 * 1024,      // 200MB
        arrayBuffers: 100 * 1024 * 1024   // 100MB
      };
      
      vi.spyOn(process, 'memoryUsage').mockReturnValue(highMemoryUsage);

      // 调用方法
      BrowserInstance.checkMemoryUsage(true);

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

    test('应该在检查间隔内只检查一次内存 (Should check memory only once within interval)', () => {
      // 连续调用两次
      BrowserInstance.checkMemoryUsage(true);
      BrowserInstance.checkMemoryUsage(true);

      // 验证 process.memoryUsage 只被调用一次
      expect(process.memoryUsage).toHaveBeenCalledTimes(1);
    });

    test('应该在超过检查间隔后重新检查内存 (Should check memory again after interval)', () => {
      // 第一次调用
      BrowserInstance.checkMemoryUsage(true);
      
      // 模拟时间经过
      vi.advanceTimersByTime(60000); // 60秒后
      
      // 第二次调用
      BrowserInstance.checkMemoryUsage(true);
      
      // 验证 process.memoryUsage 被调用两次
      expect(process.memoryUsage).toHaveBeenCalledTimes(2);
    });
  });

  describe('浏览器实例管理测试 (Browser Instance Management Tests)', () => {
    test('应该正确获取浏览器实例 (Should get browser instance correctly)', async () => {
      // 调用方法
      const browser = await BrowserInstance.getBrowser(true);
      
      // 验证 puppeteer-extra.launch 被调用
      expect(mockLaunch).toHaveBeenCalled();
      
      // 验证返回的浏览器实例
      expect(browser).toBe(mockBrowser);
      
      // 验证日志被记录
      expect(log).toHaveBeenCalledWith(
        'browser.startingBrowser',
        true,
        expect.any(Object),
        COMPONENTS.BROWSER_FETCH
      );
    });
    
    test('应该重用已存在的浏览器实例 (Should reuse existing browser instance)', async () => {
      // 设置浏览器实例
      // @ts-ignore - 访问私有属性用于测试
      BrowserInstance.browser = mockBrowser;
      
      // 调用方法
      const browser = await BrowserInstance.getBrowser(true);
      
      // 验证 puppeteer-extra.launch 没有被调用
      expect(mockLaunch).not.toHaveBeenCalled();
      
      // 验证返回的浏览器实例
      expect(browser).toBe(mockBrowser);
      
      // 验证日志被记录
      expect(log).toHaveBeenCalledWith(
        'browser.reusingExistingBrowser',
        true,
        expect.any(Object),
        COMPONENTS.BROWSER_FETCH
      );
    });
    
    test('应该正确关闭浏览器实例 (Should close browser instance correctly)', async () => {
      // 设置浏览器实例
      // @ts-ignore - 访问私有属性用于测试
      BrowserInstance.browser = mockBrowser;
      
      // 调用方法
      await BrowserInstance.closeBrowser(true);
      
      // 验证 browser.close 被调用
      expect(mockBrowser.close).toHaveBeenCalled();
      
      // 验证浏览器实例被重置
      // @ts-ignore - 访问私有属性用于测试
      expect(BrowserInstance.browser).toBeNull();
      
      // 验证日志被记录
      expect(log).toHaveBeenCalledWith(
        'browser.closed',
        true,
        expect.any(Object),
        COMPONENTS.BROWSER_FETCH
      );
    });
  });
}); 