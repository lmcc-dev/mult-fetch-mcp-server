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
          url: 'https://example.com'
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com', method: 'fetch_html' },
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
          url: 'https://example.com/data.json'
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com/data.json', method: 'fetch_json' },
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
          url: 'https://example.com/text.txt'
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com/text.txt', method: 'fetch_txt' },
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
          url: 'https://example.com/readme.md'
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com/readme.md', method: 'fetch_markdown' },
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
          url: 'https://example.com'
        }
      }
    };
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证 fetchWithAutoDetect 被调用，且参数正确
    expect(fetchWithAutoDetect).toHaveBeenCalledWith(
      { url: 'https://example.com', method: 'fetch_plaintext' },
      'plaintext'
    );
    
    // 验证返回结果
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', 'mock content');
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
    
    // 创建请求对象
    const request = {
      params: {
        name: 'fetch_html',
        arguments: {
          url: 'https://example.com'
        }
      }
    };
    
    // 设置模拟抛出错误
    (fetchWithAutoDetect as Mock).mockRejectedValue(new Error('Fetch failed'));
    
    // 调用处理程序
    const result = await callToolHandler(request);
    
    // 验证返回结果
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0].text).toContain('Fetch failed');
  });
}); 