/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { registerTools } from '../../src/lib/server/tools.js';
import { fetchWithAutoDetect } from '../../src/lib/server/fetcher.js';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// 模拟 fetchWithAutoDetect 函数
vi.mock('../../src/lib/server/fetcher.js', () => ({
  fetchWithAutoDetect: vi.fn()
}));

// 模拟 logger
vi.mock('../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    TOOLS: 'tools'
  }
}));

describe('工具注册和调用测试 (Tools Registration and Calling Tests)', () => {
  let mockServer: { setRequestHandler: ReturnType<typeof vi.fn> };
  let mockSetRequestHandler: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();
    
    // 创建模拟的 Server 实例
    mockSetRequestHandler = vi.fn();
    mockServer = {
      setRequestHandler: mockSetRequestHandler
    } as unknown as { setRequestHandler: ReturnType<typeof vi.fn> };
    
    // 设置 fetchWithAutoDetect 的默认返回值
    (fetchWithAutoDetect as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: 'text', text: 'mock content' }],
      isError: false
    });
  });
  
  test('应该正确注册工具列表处理程序 (Should register list tools handler correctly)', () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 验证 setRequestHandler 被调用了两次（一次用于列表，一次用于调用）
    expect(mockSetRequestHandler).toHaveBeenCalledTimes(2);
    
    // 验证第一次调用是用于注册工具列表处理程序
    expect(mockSetRequestHandler.mock.calls[0][0]).toBe(ListToolsRequestSchema);
    
    // 获取注册的处理程序
    const listToolsHandler = mockSetRequestHandler.mock.calls[0][1];
    
    // 调用处理程序并验证返回的工具列表
    return listToolsHandler().then((result: any) => {
      expect(result).toHaveProperty('tools');
      expect(result.tools).toBeInstanceOf(Array);
      expect(result.tools.length).toBe(5); // 应该有5个工具
      
      // 验证工具名称
      const toolNames = result.tools.map((tool: any) => tool.name);
      expect(toolNames).toContain('fetch_html');
      expect(toolNames).toContain('fetch_json');
      expect(toolNames).toContain('fetch_txt');
      expect(toolNames).toContain('fetch_markdown');
      expect(toolNames).toContain('fetch_plaintext'); // 验证新添加的HTML转文本工具
      
      // 验证每个工具都有必要的属性
      result.tools.forEach((tool: any) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type', 'object');
        expect(tool.inputSchema).toHaveProperty('properties');
        expect(tool.inputSchema.properties).toHaveProperty('url');
        // 不同工具可能有不同的 required 字段
        expect(tool.inputSchema).toHaveProperty('required');
      });
    });
  });
  
  test('应该正确注册工具调用处理程序 (Should register call tool handler correctly)', () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 验证第二次调用是用于注册工具调用处理程序
    expect(mockSetRequestHandler.mock.calls[1][0]).toBe(CallToolRequestSchema);
  });
  
  test('应该正确处理 fetch_html 工具调用 (Should handle fetch_html tool call correctly)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 创建请求对象
    const request = {
      params: {
        name: 'fetch_html',
        arguments: {
          url: 'https://example.com',
          startCursor: 0
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com', method: 'fetch_html', startCursor: 0 },
      'html'
    );
    
    // 验证返回结果
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', 'mock content');
  });
  
  test('应该正确处理 fetch_json 工具调用 (Should handle fetch_json tool call correctly)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 创建请求对象
    const request = {
      params: {
        name: 'fetch_json',
        arguments: {
          url: 'https://example.com/data.json',
          startCursor: 0
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com/data.json', method: 'fetch_json', startCursor: 0 },
      'json'
    );
    
    // 验证返回结果
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', 'mock content');
  });
  
  test('应该正确处理 fetch_txt 工具调用 (Should handle fetch_txt tool call correctly)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 创建请求对象
    const request = {
      params: {
        name: 'fetch_txt',
        arguments: {
          url: 'https://example.com/text.txt',
          startCursor: 0
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com/text.txt', method: 'fetch_txt', startCursor: 0 },
      'txt'
    );
    
    // 验证返回结果
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', 'mock content');
  });
  
  test('应该正确处理 fetch_markdown 工具调用 (Should handle fetch_markdown tool call correctly)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 创建请求对象
    const request = {
      params: {
        name: 'fetch_markdown',
        arguments: {
          url: 'https://example.com/readme.md',
          startCursor: 0
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com/readme.md', method: 'fetch_markdown', startCursor: 0 },
      'markdown'
    );
    
    // 验证返回结果
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', 'mock content');
  });
  
  test('应该正确处理 fetch_plaintext 工具调用 (Should handle fetch_plaintext tool call correctly)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 创建请求对象
    const request = {
      params: {
        name: 'fetch_plaintext',
        arguments: {
          url: 'https://example.com',
          startCursor: 0
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com', method: 'fetch_plaintext', startCursor: 0 },
      'plaintext'
    );
    
    // 验证返回结果
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', 'mock content');
  });
  
  test('应该正确处理带有分块ID的请求 (Should handle request with chunk ID correctly)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 设置模拟返回值，模拟分块返回
    (fetchWithAutoDetect as Mock).mockResolvedValue({
      content: [{ 
        type: 'text', 
        text: 'chunk content',
        metadata: {
          chunkInfo: {
            isChunked: true,
            chunkId: 'test-chunk-id',
            startCursor: 1000,
            totalBytes: 5000,
            fetchedBytes: 1000,
            remainingBytes: 3000,
            isLastChunk: false
          }
        }
      }],
      isError: false
    });
    
    // 创建请求对象，包含分块ID和起始游标
    const request = {
      params: {
        name: 'fetch_html',
        arguments: {
          url: 'https://example.com',
          chunkId: 'test-chunk-id',
          startCursor: 1000
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确，包含分块信息
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { 
        url: 'https://example.com', 
        method: 'fetch_html',
        chunkId: 'test-chunk-id',
        startCursor: 1000
      },
      'html'
    );
    
    // 验证返回结果包含分块信息
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', 'chunk content');
    expect(result.content[0]).toHaveProperty('metadata');
    expect(result.content[0].metadata).toHaveProperty('chunkInfo');
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('isChunked', true);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('chunkId', 'test-chunk-id');
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('startCursor', 1000);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('totalBytes', 5000);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('fetchedBytes', 1000);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('remainingBytes', 3000);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('isLastChunk', false);
  });
  
  test('应该正确处理启用内容分割的请求 (Should handle request with content splitting enabled)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 设置模拟返回值，模拟分块返回
    (fetchWithAutoDetect as Mock).mockResolvedValue({
      content: [{ 
        type: 'text', 
        text: 'chunked content',
        metadata: {
          chunkInfo: {
            isChunked: true,
            chunkId: 'auto-generated-id',
            startCursor: 0,
            totalBytes: 10000,
            fetchedBytes: 1024,
            remainingBytes: 8976,
            isLastChunk: false
          }
        }
      }],
      isError: false
    });
    
    // 创建请求对象，启用内容分割
    const request = {
      params: {
        name: 'fetch_html',
        arguments: {
          url: 'https://example.com',
          enableContentSplitting: true,
          contentSizeLimit: 1024, // 1KB
          startCursor: 0
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { 
        url: 'https://example.com', 
        method: 'fetch_html',
        enableContentSplitting: true,
        contentSizeLimit: 1024,
        startCursor: 0
      },
      'html'
    );
    
    // 验证返回结果包含分块信息
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('metadata');
    expect(result.content[0].metadata).toHaveProperty('chunkInfo');
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('isChunked', true);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('chunkId', 'auto-generated-id');
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('startCursor', 0);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('totalBytes', 10000);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('fetchedBytes', 1024);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('remainingBytes', 8976);
    expect(result.content[0].metadata.chunkInfo).toHaveProperty('isLastChunk', false);
  });
  
  test('应该正确处理未知工具调用 (Should handle unknown tool call correctly)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 创建请求对象
    const request = {
      params: {
        name: 'unknown_tool',
        arguments: {
          url: 'https://example.com'
        }
      }
    };
    
    // 设置模拟返回值
    (fetchWithAutoDetect as Mock).mockResolvedValue({
      isError: true,
      content: [{ text: 'Unknown tool: unknown_tool' }]
    });
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证返回结果
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0].text).toContain('Unknown tool');
  });
  
  test('应该正确处理工具调用错误 (Should handle tool call error correctly)', async () => {
    // 调用被测试的函数
    registerTools(mockServer as unknown as Server);
    
    // 获取注册的处理程序
    const callToolHandler = mockSetRequestHandler.mock.calls[1][1];
    
    // 模拟fetchWithAutoDetect抛出错误
    (fetchWithAutoDetect as Mock).mockRejectedValue(new Error('Fetch failed'));
    
    // 创建请求对象
    const request = {
      params: {
        name: 'fetch_html',
        arguments: {
          url: 'https://example.com',
          startCursor: 0
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证返回错误
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0].text).toContain('Error fetching https://example.com');
  });
}); 