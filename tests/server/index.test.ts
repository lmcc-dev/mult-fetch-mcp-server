/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// 模拟依赖
vi.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    registerTool: vi.fn(),
    registerResource: vi.fn(),
    registerPrompt: vi.fn()
  }))
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({}))
}));

vi.mock('../../src/lib/server/tools.js', () => ({
  registerTools: vi.fn()
}));

vi.mock('../../src/lib/server/resources.js', () => ({
  registerResources: vi.fn()
}));

vi.mock('../../src/lib/server/prompts.js', () => ({
  registerPrompts: vi.fn()
}));

vi.mock('../../src/lib/server/browser.js', () => ({
  closeBrowserInstance: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    SERVER: 'SERVER'
  }
}));

// 导入被测试的模块和依赖
import { closeBrowserInstance } from '../../src/lib/server/browser.js';
import { log } from '../../src/lib/logger.js';

// 测试信号处理函数
describe('MCP服务器信号处理测试 (MCP Server Signal Handling Tests)', () => {
  // 保存原始的process.on和process.exit
  const originalProcessOn = process.on;
  const originalProcessExit = process.exit;
  
  // 存储信号处理函数
  let exitHandler: Function | null = null;
  let sigintHandler: Function | null = null;
  let sigtermHandler: Function | null = null;
  let uncaughtExceptionHandler: Function | null = null;
  
  beforeEach(async () => {
    // 重置所有模拟
    vi.clearAllMocks();
    
    // 模拟process.on
    process.on = vi.fn().mockImplementation((event: string, handler: Function) => {
      // 存储处理函数以便测试
      if (event === 'exit') {
        exitHandler = handler;
      } else if (event === 'SIGINT') {
        sigintHandler = handler;
      } else if (event === 'SIGTERM') {
        sigtermHandler = handler;
      } else if (event === 'uncaughtException') {
        uncaughtExceptionHandler = handler;
      }
      return process;
    });
    
    // 模拟process.exit
    process.exit = vi.fn() as any;
    
    // 导入startServer函数
    // 使用动态导入而不是isolateModules
    const serverModule = await import('../../src/lib/server/index.js');
    serverModule.startServer();
  });
  
  afterEach(() => {
    // 恢复原始的process.on和process.exit
    process.on = originalProcessOn;
    process.exit = originalProcessExit;
  });
  
  test('应该处理SIGINT信号 (Should handle SIGINT signal)', async () => {
    // 确保处理函数已定义
    expect(sigintHandler).toBeDefined();
    
    // 调用SIGINT处理函数
    await sigintHandler();
    
    // 验证日志被记录
    expect(log).toHaveBeenCalledWith('server.receivedInterruptSignal', true, {}, expect.anything());
    
    // 验证closeBrowserInstance被调用
    expect(closeBrowserInstance).toHaveBeenCalledWith(false);
    
    // 验证process.exit被调用
    expect(process.exit).toHaveBeenCalledWith(0);
  });
  
  test('应该处理SIGTERM信号 (Should handle SIGTERM signal)', async () => {
    // 确保处理函数已定义
    expect(sigtermHandler).toBeDefined();
    
    // 调用SIGTERM处理函数
    await sigtermHandler();
    
    // 验证日志被记录
    expect(log).toHaveBeenCalledWith('server.receivedTerminateSignal', true, {}, expect.anything());
    
    // 验证closeBrowserInstance被调用
    expect(closeBrowserInstance).toHaveBeenCalledWith(false);
    
    // 验证process.exit被调用
    expect(process.exit).toHaveBeenCalledWith(0);
  });
  
  test('应该处理未捕获的异常 (Should handle uncaught exception)', async () => {
    // 确保处理函数已定义
    expect(uncaughtExceptionHandler).toBeDefined();
    
    // 创建测试错误
    const testError = new Error('Uncaught error');
    
    // 调用uncaughtException处理函数
    await uncaughtExceptionHandler(testError);
    
    // 验证日志被记录
    expect(log).toHaveBeenCalledWith('server.uncaughtException', true, {
      error: 'Uncaught error'
    }, expect.anything());
    
    // 验证closeBrowserInstance被调用
    expect(closeBrowserInstance).toHaveBeenCalledWith(false);
    
    // 验证process.exit被调用
    expect(process.exit).toHaveBeenCalledWith(1);
  });
}); 