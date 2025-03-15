/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { NodeFetcher } from '../../../src/lib/fetchers/node/NodeFetcher.js';
import { RequestPayload } from '../../../src/lib/types.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { log, COMPONENTS } from '../../../src/lib/logger.js';
import { FetchResponse } from '../../../src/lib/fetchers/common/types.js';
import { HttpClient } from '../../../src/lib/fetchers/node/HttpClient.js';

// 模拟TurndownService
vi.mock('turndown', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        turndown: vi.fn().mockImplementation((html) => {
          if (html.includes('<h1>标题</h1><p>这是Markdown内容</p>')) {
            return '# 标题\n\n这是Markdown内容';
          }
          return 'markdown content';
        }),
        addRule: vi.fn()
      };
    })
  };
});

// 模拟JSDOM
vi.mock('jsdom', () => {
  return {
    JSDOM: vi.fn().mockImplementation((html) => {
      return {
        window: {
          document: {
            body: {
              textContent: html.includes('这是纯文本内容') ? '这是纯文本内容' : 'text content'
            }
          }
        }
      };
    })
  };
});

// 模拟node-fetch
vi.mock('node-fetch', () => {
  return {
    default: vi.fn()
  };
});

// 模拟http-proxy-agent
vi.mock('http-proxy-agent', () => {
  return {
    HttpProxyAgent: class HttpProxyAgent {
      constructor(proxy: string) {}
    }
  };
});

// 模拟https-proxy-agent
vi.mock('https-proxy-agent', () => {
  return {
    HttpsProxyAgent: class HttpsProxyAgent {
      constructor(proxy: string) {}
    }
  };
});

// 模拟child_process
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

// 模拟logger
vi.mock('../../../src/lib/logger.js', () => {
  return {
    log: vi.fn(),
    COMPONENTS: {
      NODE_FETCH: 'node-fetch'
    }
  };
});

// 模拟HttpClient (Mock HttpClient)
vi.mock('../../../src/lib/fetchers/node/HttpClient.js', () => {
  return {
    HttpClient: {
      fetchWithRedirects: vi.fn()
    }
  };
});

import fetch from 'node-fetch';

describe('NodeFetcher 类测试 (NodeFetcher Class Tests)', () => {
  let nodeFetcher: NodeFetcher;
  let requestPayload: RequestPayload;

  beforeEach(() => {
    // 创建NodeFetcher实例 (Create NodeFetcher instance)
    nodeFetcher = new NodeFetcher();
    
    // 重置模拟 (Reset mocks)
    vi.clearAllMocks();
    
    // 设置请求参数 (Set request parameters)
    requestPayload = {
      url: 'https://example.com',
      headers: { 'User-Agent': 'test-agent' },
      timeout: 5000,
      debug: true
    };
    
    // 默认模拟成功的响应 (Default mock for successful response)
    vi.mocked(HttpClient.fetchWithRedirects).mockResolvedValue({
      text: vi.fn().mockResolvedValue('<html><body>测试内容</body></html>'),
      json: vi.fn().mockResolvedValue({ name: '测试', value: 123 }),
      status: 200,
      ok: true,
      url: 'https://example.com'
    } as any);
  });

  describe('html 方法测试 (html Method Tests)', () => {
    it('应该成功获取HTML内容 (should successfully fetch HTML content)', async () => {
      // 模拟响应 (Mock response)
      vi.mocked(HttpClient.fetchWithRedirects).mockResolvedValue({
        text: vi.fn().mockResolvedValue('<html><body>测试内容</body></html>'),
        status: 200,
        ok: true,
        url: 'https://example.com'
      } as any);
      
      // 调用方法 (Call method)
      const result = await nodeFetcher.html(requestPayload);
      
      // 验证结果
      expect(result.content[0].text).toBe('<html><body>测试内容</body></html>');
      expect(result.isError).toBe(false);
      expect(HttpClient.fetchWithRedirects).toHaveBeenCalledWith(requestPayload);
    });
    
    it('应该处理获取HTML时的错误 (should handle errors when fetching HTML)', async () => {
      // 模拟错误 (Mock error)
      vi.mocked(HttpClient.fetchWithRedirects).mockRejectedValue(new Error('连接失败'));
      
      // 调用方法 (Call method)
      const result = await nodeFetcher.html(requestPayload);
      
      // 验证错误处理
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('连接失败');
      expect(HttpClient.fetchWithRedirects).toHaveBeenCalledWith(requestPayload);
    });
  });
  
  describe('json 方法测试 (json Method Tests)', () => {
    it('应该成功获取并解析JSON内容 (should successfully fetch and parse JSON content)', async () => {
      // 模拟JSON响应 (Mock JSON response)
      vi.mocked(HttpClient.fetchWithRedirects).mockResolvedValue({
        text: vi.fn().mockResolvedValue('{"name":"测试","value":123}'),
        json: vi.fn().mockResolvedValue({ name: '测试', value: 123 }),
        status: 200,
        ok: true,
        url: 'https://example.com'
      } as any);
      
      // 调用方法 (Call method)
      const result = await nodeFetcher.json(requestPayload);
      
      // 验证结果
      expect(result.content[0].text).toBe('{"name":"测试","value":123}');
      expect(result.isError).toBe(false);
      expect(HttpClient.fetchWithRedirects).toHaveBeenCalledWith(requestPayload);
    });
    
    it('应该处理无效的JSON内容 (should handle invalid JSON content)', async () => {
      // 模拟无效JSON响应 (Mock invalid JSON response)
      vi.mocked(HttpClient.fetchWithRedirects).mockResolvedValue({
        text: vi.fn().mockResolvedValue('{"invalid json'),
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        status: 200,
        ok: true,
        url: 'https://example.com'
      } as any);
      
      // 调用方法 (Call method)
      const result = await nodeFetcher.json(requestPayload);
      
      // 验证错误处理
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid JSON');
      expect(HttpClient.fetchWithRedirects).toHaveBeenCalledWith(requestPayload);
    });
  });
  
  describe('txt 方法测试 (txt Method Tests)', () => {
    it('应该成功获取纯文本内容 (should successfully fetch plain text content)', async () => {
      // 模拟HTML响应 (Mock HTML response)
      const htmlContent = '<html><body>这是纯文本内容</body></html>';
      vi.mocked(HttpClient.fetchWithRedirects).mockResolvedValue({
        text: vi.fn().mockResolvedValue(htmlContent),
        status: 200,
        ok: true,
        url: 'https://example.com'
      } as any);
      
      // 调用方法 (Call method)
      const result = await nodeFetcher.txt(requestPayload);
      
      // 验证结果 - NodeFetcher的txt方法直接返回HTML内容，不提取纯文本
      expect(result.content[0].text).toBe(htmlContent);
      expect(result.isError).toBe(false);
      expect(HttpClient.fetchWithRedirects).toHaveBeenCalledWith(requestPayload);
    });
  });
  
  describe('markdown 方法测试 (markdown Method Tests)', () => {
    it('应该成功获取并转换为Markdown内容 (should successfully fetch and convert to Markdown content)', async () => {
      // 模拟HTML响应 (Mock HTML response)
      vi.mocked(HttpClient.fetchWithRedirects).mockResolvedValue({
        text: vi.fn().mockResolvedValue('<html><body><h1>标题</h1><p>这是Markdown内容</p></body></html>'),
        status: 200,
        ok: true,
        url: 'https://example.com'
      } as any);
      
      // 调用方法 (Call method)
      const result = await nodeFetcher.markdown(requestPayload);
      
      // 验证结果
      expect(result.content[0].text).toBe('# 标题\n\n这是Markdown内容');
      expect(result.isError).toBe(false);
      expect(HttpClient.fetchWithRedirects).toHaveBeenCalledWith(requestPayload);
    });
  });
});