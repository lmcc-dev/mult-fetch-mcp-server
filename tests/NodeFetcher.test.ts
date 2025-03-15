/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { NodeFetcher } from '../src/lib/NodeFetcher.js';
import { RequestPayload } from '../src/lib/types.js';
import { vi } from 'vitest';

// 模拟TurndownService
vi.mock('turndown', () => {
  return {
    default: class TurndownService {
      turndown(html: string) {
        return '# 标题\n\n这是Markdown内容';
      }
    }
  };
});

// 模拟node-fetch
vi.mock('node-fetch', () => {
  const mockFetch = vi.fn();
  
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
    
    // 创建响应对象
    const response: any = {
      ok: url.includes('/error') ? false : true,
      status: url.includes('/error') ? 404 : 200,
      statusText: url.includes('/error') ? 'Not Found' : 'OK',
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'content-type') {
            return contentType;
          }
          return null;
        },
        has: (name: string) => {
          if (name.toLowerCase() === 'content-type') {
            return true;
          }
          if (name.toLowerCase() === 'location' && url.includes('/redirect')) {
            return true;
          }
          return false;
        },
        entries: () => {
          return [
            ['content-type', contentType],
            ['date', 'Wed, 01 Jan 2023 00:00:00 GMT'],
            ['server', 'Test Server']
          ][Symbol.iterator]();
        },
        raw: () => ({}),
        forEach: () => {}
      },
      text: () => Promise.resolve(textContent),
      json: () => Promise.resolve(jsonContent),
      clone: () => response,
      url: url
    };
    
    return response;
  };
  
  // 设置mockFetch的行为
  mockFetch.mockImplementation((url, options) => {
    if (url.includes('/error')) {
      return Promise.resolve(createMockResponse(url));
    }
    
    return Promise.resolve(createMockResponse(url));
  });
  
  return { default: mockFetch };
});

// 模拟http-proxy-agent和https-proxy-agent
vi.mock('http-proxy-agent', () => {
  return {
    HttpProxyAgent: vi.fn().mockImplementation(() => ({}))
  };
});

vi.mock('https-proxy-agent', () => {
  return {
    HttpsProxyAgent: vi.fn().mockImplementation(() => ({}))
  };
});

// 模拟child_process
vi.mock('child_process', () => {
  return {
    execSync: vi.fn().mockReturnValue(Buffer.from(''))
  };
});

// 模拟i18n
vi.mock('../src/lib/i18n/index.js', () => {
  return {
    t: (key: string, options?: any) => {
      return options ? `${key} ${JSON.stringify(options)}` : key;
    }
  };
});

// 模拟logger
vi.mock('../src/lib/logger.js', () => {
  return {
    log: vi.fn(),
    COMPONENTS: {
      NODE_FETCH: 'NODE-FETCH'
    }
  };
});

describe('NodeFetcher类测试 (NodeFetcher Class Tests)', () => {
  // 在每个测试前重置模拟
  beforeEach(() => {
    vi.clearAllMocks();
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
      const url = 'https://example.com';
      const options: RequestPayload = {
        url,
        proxy: 'http://127.0.0.1:1087',
        useSystemProxy: true,
        debug: true
      };
      
      // 调用被测试的方法
      const result = await NodeFetcher.html(options);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.url).toBe('https://example.com');
      expect(result.status).toBe(200);
      expect(result.headers).toBeDefined();
    });
    
    test('应该处理获取HTML时的错误 (Should handle errors when fetching HTML)', async () => {
      // 模拟fetch失败
      const fetch = await import('node-fetch');
      vi.mocked(fetch.default).mockRejectedValueOnce(new Error('Network error'));
      
      // 准备测试数据
      const url = 'https://example.com/error';
      const options: RequestPayload = {
        url,
        debug: true
      };
      
      // 验证错误处理
      await expect(NodeFetcher.html(options)).rejects.toThrow('Network error');
    });
  });
  
  describe('json方法测试 (json Method Tests)', () => {
    test('应该能够获取JSON内容 (Should fetch JSON content)', async () => {
      // 准备测试数据
      const url = 'https://example.com/api';
      const options: RequestPayload = {
        url,
        proxy: 'http://127.0.0.1:1087',
        useSystemProxy: true,
        debug: true
      };
      
      // 调用被测试的方法
      const result = await NodeFetcher.json(options);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.json).toBeDefined();
      expect(result.json).toEqual({ test: 'data' });
      expect(result.status).toBe(200);
    });
    
    test('应该处理获取JSON时的错误 (Should handle errors when fetching JSON)', async () => {
      // 模拟fetch失败
      const fetch = await import('node-fetch');
      vi.mocked(fetch.default).mockRejectedValueOnce(new Error('Network error'));
      
      // 准备测试数据
      const url = 'https://example.com/api/error';
      const options: RequestPayload = {
        url,
        debug: true
      };
      
      // 验证错误处理
      await expect(NodeFetcher.json(options)).rejects.toThrow('Network error');
    });
  });
  
  describe('txt方法测试 (txt Method Tests)', () => {
    test('应该能够获取文本内容 (Should fetch text content)', async () => {
      // 准备测试数据
      const url = 'https://example.com/text';
      const options: RequestPayload = {
        url,
        proxy: 'http://127.0.0.1:1087',
        useSystemProxy: true,
        debug: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
        }
      };
      
      // 调用被测试的方法
      const result = await NodeFetcher.txt(options);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.text).toBe('这是纯文本内容');
      expect(result.status).toBe(200);
    });
    
    test('应该处理获取文本时的错误 (Should handle errors when fetching text)', async () => {
      // 模拟fetch失败
      const fetch = await import('node-fetch');
      vi.mocked(fetch.default).mockRejectedValueOnce(new Error('Network error'));
      
      // 准备测试数据
      const url = 'https://example.com/text/error';
      const options: RequestPayload = {
        url,
        debug: true
      };
      
      // 验证错误处理
      await expect(NodeFetcher.txt(options)).rejects.toThrow('Network error');
    });
  });
  
  describe('markdown方法测试 (markdown Method Tests)', () => {
    test('应该能够获取Markdown内容 (Should fetch Markdown content)', async () => {
      // 准备测试数据
      const url = 'https://example.com/md';
      const options: RequestPayload = {
        url,
        proxy: 'http://127.0.0.1:1087',
        useSystemProxy: true,
        debug: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
        }
      };
      
      // 调用被测试的方法
      const result = await NodeFetcher.markdown(options);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.markdown).toBeDefined();
      expect(result.markdown).toBe('# 标题\n\n这是Markdown内容');
      expect(result.status).toBe(200);
    });
    
    test('应该处理获取Markdown时的错误 (Should handle errors when fetching Markdown)', async () => {
      // 模拟fetch失败
      const fetch = await import('node-fetch');
      vi.mocked(fetch.default).mockRejectedValueOnce(new Error('Network error'));
      
      // 准备测试数据
      const url = 'https://example.com/md/error';
      const options: RequestPayload = {
        url,
        debug: true
      };
      
      // 验证错误处理
      await expect(NodeFetcher.markdown(options)).rejects.toThrow('Network error');
    });
  });
  
  describe('代理功能测试 (Proxy Functionality Tests)', () => {
    test('应该正确处理HTTP代理 (Should handle HTTP proxy correctly)', async () => {
      // 准备测试数据
      const url = 'http://example.com';
      const options: RequestPayload = {
        url,
        proxy: 'http://proxy.example.com:8080',
        useSystemProxy: false,
        debug: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };
      
      // 模拟fetch失败以测试错误处理
      const fetch = await import('node-fetch');
      vi.mocked(fetch.default).mockRejectedValueOnce(new Error('Network error: ENOTFOUND'));
      
      // 验证错误处理
      await expect(NodeFetcher.html(options)).rejects.toThrow('Network error: ENOTFOUND');
    });
    
    test('应该正确处理HTTPS代理 (Should handle HTTPS proxy correctly)', async () => {
      // 准备测试数据
      const url = 'https://example.com';
      const options: RequestPayload = {
        url,
        proxy: 'http://proxy.example.com:8080',
        useSystemProxy: false,
        debug: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
        }
      };
      
      // 模拟fetch失败以测试错误处理
      const fetch = await import('node-fetch');
      vi.mocked(fetch.default).mockRejectedValueOnce(new Error('Network error: ENOTFOUND'));
      
      // 验证错误处理
      await expect(NodeFetcher.html(options)).rejects.toThrow('Network error: ENOTFOUND');
    });
  });
}); 