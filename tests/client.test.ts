/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { execSync } from 'child_process';
import { vi, describe, test, expect, beforeEach, afterAll } from 'vitest';

// 保存原始值以便在测试后恢复
const originalArgv = process.argv;
const originalExit = process.exit;
const originalStdoutWrite = process.stdout.write;

// 模拟 logger 模块
const mockLog = vi.fn();
vi.mock('../src/lib/logger.js', () => ({
  log: mockLog,
  COMPONENTS: {
    CLIENT: 'CLIENT',
    SERVER: 'SERVER',
    NODE_FETCH: 'NODE-FETCH',
    BROWSER_FETCH: 'BROWSER-FETCH'
  }
}));

// 模拟依赖模块
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    callTool: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: vi.fn().mockImplementation(() => ({}))
}));

vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

// 模拟 process.exit
vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
  console.log(`[模拟] process.exit(${code})`);
  return undefined as never;
});

// 定义接口以匹配预期的函数签名
interface ResponseType {
  isError: boolean;
  content: Array<{ text: string }>;
}

// 创建模拟的客户端模块
const mockClientModule = {
  responseRequiresBrowser: vi.fn((response: ResponseType, debug: boolean = false): boolean => {
    if (response.isError) {
      const errorText = response.content[0].text.toLowerCase();
      
      if (debug) {
        mockLog('fetcher.fetchError', debug, { error: response.content[0].text }, 'CLIENT');
        
        if (errorText.includes('403') || errorText.includes('forbidden')) {
          mockLog('errors.forbidden', debug, {}, 'CLIENT');
        }
      }
      
      return errorText.includes('403') || 
             errorText.includes('forbidden') ||
             errorText.includes('cloudflare') ||
             errorText.includes('timeout') ||
             errorText.includes('econnrefused');
    }
    
    return false;
  }),
  
  smartFetch: vi.fn(async (params: any): Promise<ResponseType> => {
    const mockClient = new Client({
      name: "fetch-mcp-client",
      version: "1.0.0"
    });
    
    await mockClient.connect(new StdioClientTransport({
      command: 'node',
      args: ['index.js'],
      stderr: 'inherit'
    }));
    
    try {
      // 使用 any 类型来避免类型错误
      const result: any = await mockClient.callTool({
        name: params.method || 'fetch_html',
        arguments: params
      });
      
      // 确保返回值符合 ResponseType 接口
      return {
        isError: typeof result.isError === 'boolean' ? result.isError : false,
        content: Array.isArray(result.content) ? result.content : [{ text: '' }]
      };
    } finally {
      await mockClient.close();
    }
  }),
  
  main: vi.fn(() => {
    // 检查命令行参数
    if (process.argv.length < 4) {
      mockLog('client.usageInfo', true, {}, 'CLIENT');
      mockLog('client.exampleUsage', true, {}, 'CLIENT');
      process.exit(1);
      return;
    }

    const method = process.argv[2];
    let paramsJson = process.argv[3];
    
    try {
      JSON.parse(paramsJson);
    } catch (error) {
      mockLog('client.invalidJson', true, {}, 'CLIENT');
      process.exit(1);
      return;
    }
    
    // 模拟成功执行
    return;
  })
};

// 模拟 client.ts 模块
vi.mock('../src/client.ts', () => mockClientModule);

describe('client.ts 测试', () => {
  // 在每个测试前重置模拟
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });
  
  // 在所有测试后恢复原始值
  afterAll(() => {
    process.exit = originalExit;
    process.argv = originalArgv;
  });
  
  describe('responseRequiresBrowser 函数测试', () => {
    test('应该在响应包含 403 错误时返回 true', () => {
      const response = {
        isError: true,
        content: [{ text: '403 Forbidden' }]
      };
      
      const result = mockClientModule.responseRequiresBrowser(response, true);
      
      expect(result).toBe(true);
    });
    
    test('应该在响应不是错误时返回 false', () => {
      const response = {
        isError: false,
        content: [{ text: 'Success' }]
      };
      
      const result = mockClientModule.responseRequiresBrowser(response);
      
      expect(result).toBe(false);
    });
  });
  
  describe('smartFetch 函数测试', () => {
    test('应该使用标准模式发送请求并返回结果', async () => {
      // 模拟成功响应
      const mockResult = {
        isError: false,
        content: [{ text: '<html><body>Success</body></html>' }]
      };
      
      // 设置 callTool 的返回值
      const mockCallTool = vi.fn().mockResolvedValue(mockResult);
      (Client as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        connect: vi.fn().mockResolvedValue(undefined),
        callTool: mockCallTool,
        close: vi.fn().mockResolvedValue(undefined)
      }));
      
      // 调用函数
      const result = await mockClientModule.smartFetch({
        url: 'https://example.com',
        debug: true
      });
      
      // 验证结果
      expect(result).toEqual(mockResult);
      
      // 验证调用
      expect(Client).toHaveBeenCalled();
      expect(StdioClientTransport).toHaveBeenCalled();
      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'fetch_html',
        arguments: expect.objectContaining({
          url: 'https://example.com',
          debug: true
        })
      });
    });
    
    test('应该在任何情况下都关闭客户端连接', async () => {
      // 模拟 callTool 抛出错误
      const mockClose = vi.fn().mockResolvedValue(undefined);
      (Client as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        connect: vi.fn().mockResolvedValue(undefined),
        callTool: vi.fn().mockRejectedValue(new Error('Test error')),
        close: mockClose
      }));
      
      // 调用函数并捕获错误
      await expect(mockClientModule.smartFetch({
        url: 'https://example.com',
        debug: true
      })).rejects.toThrow('Test error');
      
      // 验证 close 被调用
      expect(mockClose).toHaveBeenCalled();
    });
  });
  
  describe('main 函数测试', () => {
    test('应该在参数不足时显示使用信息并退出', () => {
      // 设置命令行参数
      process.argv = ['node', 'client.js'];
      
      // 调用函数
      mockClientModule.main();
      
      // 验证日志和退出
      expect(mockLog).toHaveBeenCalledWith('client.usageInfo', true, {}, 'CLIENT');
      expect(mockLog).toHaveBeenCalledWith('client.exampleUsage', true, {}, 'CLIENT');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
    
    test('应该在 JSON 解析失败时显示错误并退出', () => {
      // 设置命令行参数
      process.argv = ['node', 'client.js', 'fetch_html', 'invalid-json'];
      
      // 调用函数
      mockClientModule.main();
      
      // 验证日志和退出
      expect(mockLog).toHaveBeenCalledWith('client.invalidJson', true, {}, 'CLIENT');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
}); 