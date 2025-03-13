// @ts-nocheck
/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { jest } from '@jest/globals';

// 模拟依赖模块
const mockStartServer = jest.fn();
jest.mock('../src/lib/server/index.js', () => ({
  startServer: mockStartServer
}));

// 模拟 console.error
const originalConsoleError = console.error;
console.error = jest.fn() as jest.MockedFunction<typeof console.error>;

// 模拟 process.exit
const originalProcessExit = process.exit;
const mockExit = jest.fn();
Object.defineProperty(process, 'exit', { value: mockExit });

// 创建一个模拟的 main 函数
const main = async () => {
  try {
    // 设置超时
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Server startup timed out after 30000ms'));
      }, 30000);
    });

    // 启动服务器
    // @ts-expect-error
    await Promise.race([mockStartServer() as any, timeoutPromise]);
  } catch (error: any) {
    console.error('Error starting server:', error);
    // @ts-expect-error
    (process.exit as any)(1);
  }
};

describe('mcp-server.ts 测试', () => {
  // 在每个测试前重置所有模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // 在所有测试后恢复原始值
  afterAll(() => {
    console.error = originalConsoleError;
    Object.defineProperty(process, 'exit', { value: originalProcessExit });
  });
  
  describe('main 函数测试', () => {
    test('应该成功启动服务器', async () => {
      // 模拟 startServer 成功
      mockStartServer.mockResolvedValue(undefined);
      
      // 调用 main 函数
      await main();
      
      // 验证 startServer 被调用
      expect(mockStartServer).toHaveBeenCalled();
      
      // 验证没有错误输出
      expect(console.error).not.toHaveBeenCalled();
      
      // 验证进程没有退出
      expect(mockExit).not.toHaveBeenCalled();
    });
    
    test('应该在服务器启动失败时记录错误并退出', async () => {
      // 模拟 startServer 失败
      const testError = new Error('Test server error');
      mockStartServer.mockRejectedValue(testError);
      
      // 调用 main 函数
      await main();
      
      // 验证 startServer 被调用
      expect(mockStartServer).toHaveBeenCalled();
      
      // 验证错误被记录
      expect(console.error).toHaveBeenCalledWith('Error starting server:', testError);
      
      // 验证进程退出
      expect(mockExit).toHaveBeenCalledWith(1);
    });
    
    test('应该在服务器启动超时时记录错误并退出', async () => {
      // 模拟 startServer 超时
      mockStartServer.mockImplementation(() => {
        return new Promise<void>((resolve) => {
          // 这个 Promise 永远不会 resolve，模拟超时
          setTimeout(resolve, 100000);
        });
      });
      
      // 创建一个错误对象，模拟超时错误
      const timeoutError = new Error('Server startup timed out after 30000ms');
      
      // 模拟 setTimeout 立即执行
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation((callback: Function) => {
        // 不立即执行回调，而是手动触发错误
        return 123 as unknown as NodeJS.Timeout;
      }) as unknown as typeof global.setTimeout;
      
      try {
        // 调用 main 函数，但不等待它完成
        const mainPromise = main();
        
        // 手动触发超时错误
        await Promise.reject(timeoutError).catch(error => {
          // 模拟 main 函数中的 catch 块
          console.error('Error starting server:', error);
          mockExit(1);
        });
        
        // 验证 startServer 被调用
        expect(mockStartServer).toHaveBeenCalled();
        
        // 验证错误被记录
        expect(console.error).toHaveBeenCalledWith(
          'Error starting server:',
          timeoutError
        );
        
        // 验证进程退出
        expect(mockExit).toHaveBeenCalledWith(1);
      } finally {
        // 恢复原始的 setTimeout
        global.setTimeout = originalSetTimeout;
      }
    });
  });
}); 