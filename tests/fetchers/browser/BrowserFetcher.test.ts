/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Browser, Page } from 'puppeteer';
import { BrowserFetcher } from '../../../src/lib/fetchers/browser/BrowserFetcher.js';
import { RequestPayload } from '../../../src/lib/types.js';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { log, COMPONENTS } from '../../../src/lib/logger.js';
import puppeteer from 'puppeteer';
import * as puppeteerExtra from 'puppeteer-extra';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserInstance } from '../../../src/lib/fetchers/browser/BrowserInstance.js';
import { FetchResponse } from '../../../src/lib/fetchers/common/types.js';

// Mock Puppeteer
vi.mock('puppeteer', () => {
  return {
    default: {
      launch: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue({}),
          waitForSelector: vi.fn().mockResolvedValue({}),
          content: vi.fn().mockResolvedValue('<html><body>测试内容</body></html>'),
          evaluate: vi.fn(),
          close: vi.fn()
        }),
        close: vi.fn()
      })
    }
  };
});

// Mock puppeteer-extra
vi.mock('puppeteer-extra', () => {
  return {
    __esModule: true,
    default: {
      use: vi.fn().mockReturnThis(),
      launch: vi.fn()
    }
  };
});

// Mock puppeteer-extra-plugin-stealth
vi.mock('puppeteer-extra-plugin-stealth', () => {
  return {
    __esModule: true,
    default: vi.fn().mockReturnValue({})
  };
});

// Mock JSDOM
vi.mock('jsdom', () => {
  return {
    JSDOM: class {
      window: any;
      constructor(html: string) {
        this.window = {
          document: {
            body: {
              textContent: '这是纯文本内容'
            }
          }
        };
      }
    }
  };
});

// Mock TurndownService
vi.mock('turndown', () => {
  return {
    default: class TurndownService {
      constructor(options?: any) {}
      addRule(name: string, rule: any) {}
      turndown(html: string) {
        return '# 标题\n\n这是Markdown内容';
      }
    }
  };
});

// Mock child_process
vi.mock('child_process', () => {
  return {
    execSync: vi.fn().mockImplementation((cmd) => {
      if (cmd.includes('http_proxy')) {
        return 'http_proxy=http://proxy.example.com:8080';
      }
      return '';
    })
  };
});

// Mock logger
vi.mock('../../../src/lib/logger.js', () => {
  return {
    log: vi.fn(),
    COMPONENTS: {
      BROWSER_FETCH: 'browser-fetch'
    }
  };
});

// Mock BrowserInstance
vi.mock('../../../src/lib/fetchers/browser/BrowserInstance.js', () => {
  return {
    BrowserInstance: {
      getInstance: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue({}),
          waitForSelector: vi.fn().mockResolvedValue({}),
          content: vi.fn().mockResolvedValue('<html><body>测试内容</body></html>'),
          evaluate: vi.fn(),
          close: vi.fn()
        }),
        close: vi.fn()
      })
    }
  };
});

describe('BrowserFetcher 类测试 (BrowserFetcher Class Tests)', () => {
  let browserFetcher: BrowserFetcher;
  let requestPayload: RequestPayload;

  beforeEach(() => {
    // 创建BrowserFetcher实例 (Create BrowserFetcher instance)
    browserFetcher = new BrowserFetcher();
    
    // 重置模拟 (Reset mocks)
    vi.clearAllMocks();
    
    // 设置请求参数 (Set request parameters)
    requestPayload = {
      url: 'https://example.com',
      headers: { 'User-Agent': 'test-agent' },
      timeout: 5000,
      waitForSelector: 'body',
      waitForTimeout: 1000,
      debug: true
    };
    
    // 模拟静态fetch方法 (Mock static fetch method)
    vi.spyOn(BrowserFetcher as any, 'fetch').mockResolvedValue({
      content: [{ type: 'text', text: '<html><body>测试内容</body></html>' }],
      isError: false
    });
  });

  describe('html 方法测试 (html Method Tests)', () => {
    it('应该成功获取HTML内容 (should successfully fetch HTML content)', async () => {
      // 调用方法 (Call method)
      const result = await browserFetcher.html(requestPayload);
      
      // 验证结果 (Verify result)
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toBe('<html><body>测试内容</body></html>');
    });
    
    it('应该处理获取HTML时的错误 (should handle errors when fetching HTML)', async () => {
      // 模拟错误 (Mock error)
      vi.spyOn(BrowserFetcher as any, 'fetch').mockResolvedValue({
        content: [{ type: 'text', text: 'Error fetching HTML: Error: 连接失败' }],
        isError: true
      });
      
      // 调用方法 (Call method)
      const result = await browserFetcher.html(requestPayload);
      
      // 验证结果 (Verify result)
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('连接失败');
    });
  });
  
  describe('json 方法测试 (json Method Tests)', () => {
    it('应该成功获取JSON内容 (should successfully fetch JSON content)', async () => {
      // 模拟JSON内容 (Mock JSON content)
      vi.spyOn(BrowserFetcher as any, 'fetch').mockResolvedValue({
        content: [{ type: 'text', text: '{"name":"测试","value":123}' }],
        isError: false
      });
      
      // 调用方法 (Call method)
      const result = await browserFetcher.json(requestPayload);
      
      // 验证结果 (Verify result)
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toBe('{"name":"测试","value":123}');
    });
  });
  
  describe('txt 方法测试 (txt Method Tests)', () => {
    it('应该成功获取纯文本内容 (should successfully fetch plain text content)', async () => {
      // 模拟HTML内容 (Mock HTML content)
      vi.spyOn(BrowserFetcher as any, 'fetch').mockResolvedValue({
        content: [{ type: 'text', text: '<html><body>这是纯文本内容</body></html>' }],
        isError: false
      });
      
      // 调用方法 (Call method)
      const result = await browserFetcher.txt(requestPayload);
      
      // 验证结果 (Verify result)
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('这是纯文本内容');
    });
  });
  
  describe('markdown 方法测试 (markdown Method Tests)', () => {
    it('应该成功获取Markdown内容 (should successfully fetch Markdown content)', async () => {
      // 模拟HTML内容 (Mock HTML content)
      vi.spyOn(BrowserFetcher as any, 'fetch').mockResolvedValue({
        content: [{ type: 'text', text: '<html><body><h1>标题</h1><p>这是Markdown内容</p></body></html>' }],
        isError: false
      });
      
      // 调用方法 (Call method)
      const result = await browserFetcher.markdown(requestPayload);
      
      // 验证结果 (Verify result)
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('标题');
      expect(result.content[0].text).toContain('这是Markdown内容');
    });
  });
});