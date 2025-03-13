/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { NodeFetcher } from '../src/lib/NodeFetcher.js';
import { RequestPayload } from '../src/lib/types.js';

// 模拟node-fetch
jest.mock('node-fetch', () => {
  const mockFetch = jest.fn();
  
  // 创建模拟Response
  const createMockResponse = (url: string) => {
    // 根据URL返回不同的内容
    let textContent = '<html><body><h1>测试页面</h1></body></html>';
    let jsonContent = { test: 'data' };
    let contentType = 'text/html; charset=utf-8';
    
    if (url.includes('/api')) {
      textContent = JSON.stringify(jsonContent);
      contentType = 'application/json; charset=utf-8';
    } else if (url.includes('/text')) {
      textContent = '这是纯文本内容';
      contentType = 'text/plain; charset=utf-8';
    } else if (url.includes('/md')) {
      textContent = '# 标题\n\n这是Markdown内容';
      contentType = 'text/markdown; charset=utf-8';
    }
    
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      url: url,
      headers: {
        get: jest.fn((name) => {
          if (name.toLowerCase() === 'content-type') {
            return contentType;
          }
          return null;
        }),
        raw: () => ({}),
        entries: () => [['content-type', contentType]]
      },
      text: jest.fn().mockResolvedValue(textContent),
      json: jest.fn().mockResolvedValue(jsonContent),
      buffer: jest.fn().mockResolvedValue(Buffer.from(textContent)),
      clone: jest.fn(function() { return this; })
    };
  };
  
  // 设置默认返回值
  mockFetch.mockImplementation((url) => {
    return Promise.resolve(createMockResponse(url));
  });
  
  return mockFetch;
});

// 模拟http-proxy-agent和https-proxy-agent
jest.mock('http-proxy-agent', () => ({
  HttpProxyAgent: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('https-proxy-agent', () => ({
  HttpsProxyAgent: jest.fn().mockImplementation(() => ({}))
}));

// 模拟child_process
jest.mock('child_process', () => ({
  execSync: jest.fn().mockReturnValue(Buffer.from(''))
}));

// 模拟i18n
jest.mock('../src/lib/i18n/index.js', () => ({
  t: (key: string, options?: any) => {
    return options ? `${key} ${JSON.stringify(options)}` : key;
  }
}));

// 模拟logger
jest.mock('../src/lib/logger.js', () => ({
  log: jest.fn(),
  COMPONENTS: {
    NODE_FETCH: 'NODE-FETCH'
  }
}));

describe('NodeFetcher类测试 (NodeFetcher Class Tests)', () => {
  let fetch: jest.Mock;
  
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 获取模拟的fetch函数
    fetch = require('node-fetch');
  });
  
  describe('基本功能测试 (Basic Functionality Tests)', () => {
    test('应该有html方法 (Should have html method)', () => {
      expect(typeof NodeFetcher.html).toBe('function');
    });
    
    test('应该有json方法 (Should have json method)', () => {
      expect(typeof NodeFetcher.json).toBe('function');
    });
    
    test('应该有txt方法 (Should have txt method)', () => {
      expect(typeof NodeFetcher.txt).toBe('function');
    });
    
    test('应该有markdown方法 (Should have markdown method)', () => {
      expect(typeof NodeFetcher.markdown).toBe('function');
    });
  });
  
  describe('html方法测试 (html Method Tests)', () => {
    test('应该能够获取HTML内容 (Should fetch HTML content)', async () => {
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com',
        debug: true
      };
      
      // 调用方法
      const result = await NodeFetcher.html(payload);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.url).toBe('https://example.com');
      expect(result.status).toBe(200);
      expect(result.headers).toBeDefined();
      expect(result.html).toContain('<html>');
      
      // 验证fetch被调用
      expect(fetch).toHaveBeenCalledWith(
        payload.url,
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: expect.any(Number)
        })
      );
    });
    
    test('应该处理获取HTML时的错误 (Should handle errors when fetching HTML)', async () => {
      // 模拟fetch失败
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com',
        debug: true
      };
      
      // 调用方法并验证它抛出错误
      await expect(NodeFetcher.html(payload)).rejects.toThrow('Network error');
    });
  });
  
  describe('json方法测试 (json Method Tests)', () => {
    test('应该能够获取JSON内容 (Should fetch JSON content)', async () => {
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com/api',
        debug: true
      };
      
      // 调用方法
      const result = await NodeFetcher.json(payload);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.json).toBeDefined();
      expect(result.json).toEqual({ test: 'data' });
      expect(result.url).toBe('https://example.com/api');
      expect(result.status).toBe(200);
      expect(result.headers).toBeDefined();
      
      // 验证fetch被调用
      expect(fetch).toHaveBeenCalledWith(
        payload.url,
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: expect.any(Number)
        })
      );
    });
    
    test('应该处理获取JSON时的错误 (Should handle errors when fetching JSON)', async () => {
      // 模拟fetch失败
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com/api',
        debug: true
      };
      
      // 调用方法并验证它抛出错误
      await expect(NodeFetcher.json(payload)).rejects.toThrow('Network error');
    });
  });
  
  describe('txt方法测试 (txt Method Tests)', () => {
    test('应该能够获取文本内容 (Should fetch text content)', async () => {
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com/text',
        debug: true
      };
      
      // 调用方法
      const result = await NodeFetcher.txt(payload);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.url).toBe('https://example.com/text');
      expect(result.status).toBe(200);
      expect(result.headers).toBeDefined();
      
      // 验证fetch被调用
      expect(fetch).toHaveBeenCalledWith(
        payload.url,
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: expect.any(Number)
        })
      );
    });
    
    test('应该处理获取文本时的错误 (Should handle errors when fetching text)', async () => {
      // 模拟fetch失败
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com/text',
        debug: true
      };
      
      // 调用方法并验证它抛出错误
      await expect(NodeFetcher.txt(payload)).rejects.toThrow('Network error');
    });
  });
  
  describe('markdown方法测试 (markdown Method Tests)', () => {
    test('应该能够获取Markdown内容 (Should fetch Markdown content)', async () => {
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com/md',
        debug: true
      };
      
      // 调用方法
      const result = await NodeFetcher.markdown(payload);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.markdown).toBeDefined();
      expect(result.url).toBe('https://example.com/md');
      expect(result.status).toBe(200);
      expect(result.headers).toBeDefined();
      
      // 验证fetch被调用
      expect(fetch).toHaveBeenCalledWith(
        payload.url,
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: expect.any(Number)
        })
      );
    });
    
    test('应该处理获取Markdown时的错误 (Should handle errors when fetching Markdown)', async () => {
      // 模拟fetch失败
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com/md',
        debug: true
      };
      
      // 调用方法并验证它抛出错误
      await expect(NodeFetcher.markdown(payload)).rejects.toThrow('Network error');
    });
  });
  
  describe('代理功能测试 (Proxy Functionality Tests)', () => {
    test('应该正确处理HTTP代理 (Should handle HTTP proxy correctly)', async () => {
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'http://example.com',
        proxy: 'http://proxy.example.com:8080',
        debug: true
      };
      
      // 调用方法
      await NodeFetcher.html(payload);
      
      // 验证HttpProxyAgent被调用
      const { HttpProxyAgent } = require('http-proxy-agent');
      expect(HttpProxyAgent).toHaveBeenCalledWith(payload.proxy);
    });
    
    test('应该正确处理HTTPS代理 (Should handle HTTPS proxy correctly)', async () => {
      // 准备测试数据
      const payload: RequestPayload = {
        url: 'https://example.com',
        proxy: 'http://proxy.example.com:8080',
        debug: true
      };
      
      // 调用方法
      await NodeFetcher.html(payload);
      
      // 验证HttpsProxyAgent被调用
      const { HttpsProxyAgent } = require('https-proxy-agent');
      expect(HttpsProxyAgent).toHaveBeenCalledWith(payload.proxy);
    });
  });
}); 