/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 模拟依赖
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    registerTool: jest.fn(),
    registerResource: jest.fn(),
    registerPrompt: jest.fn()
  }))
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('../../src/lib/server/tools.js', () => ({
  registerTools: jest.fn()
}));

jest.mock('../../src/lib/server/resources.js', () => ({
  registerResources: jest.fn()
}));

jest.mock('../../src/lib/server/prompts.js', () => ({
  registerPrompts: jest.fn()
}));

jest.mock('../../src/lib/server/browser.js', () => ({
  closeBrowserInstance: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../src/lib/logger.js', () => ({
  log: jest.fn(),
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
  let exitHandler: Function;
  let sigintHandler: Function;
  let sigtermHandler: Function;
  let uncaughtExceptionHandler: Function;
  
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 模拟process.on
    process.on = jest.fn().mockImplementation((event: string, handler: Function) => {
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
    }) as any;
    
    // 模拟process.exit
    process.exit = jest.fn() as any;
    
    // 导入startServer函数
    // 注意：我们需要在每个测试中重新导入，以确保process.on的模拟生效
    jest.isolateModules(() => {
      require('../../src/lib/server/index.js').startServer();
    });
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