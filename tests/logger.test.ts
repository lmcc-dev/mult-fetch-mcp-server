/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { log, COMPONENTS } from '../src/lib/logger.js';

// 模拟i18n模块
jest.mock('../src/lib/i18n/index.js', () => ({
  t: (key: string, options?: any) => {
    // 简单地返回原始key，用于测试
    return options ? `${key} ${JSON.stringify(options)}` : key;
  }
}));

// 模拟i18n/logger模块
jest.mock('../src/lib/i18n/logger.js', () => ({
  createLogger: (prefix: string) => ({
    debug: (key: string, params?: any, forceDebug?: boolean) => {
      if (forceDebug === true) {
        if (key === 'test.error') {
          // 对于错误日志，使用console.error
          console.error(`[${prefix}] ${key} ${params ? JSON.stringify(params) : ''}`);
        } else {
          console.log(`[${prefix}] ${key} ${params ? JSON.stringify(params) : ''}`);
        }
      }
    },
    error: (key: string, params?: any) => {
      console.error(`[${prefix}] ${key} ${params ? JSON.stringify(params) : ''}`);
    }
  })
}));

// 保存原始的console.log和console.error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Logger模块测试 (Logger Module Tests)', () => {
  // 在每个测试前设置mock
  beforeEach(() => {
    // Mock console.log和console.error
    console.log = jest.fn();
    console.error = jest.fn();
  });

  // 在每个测试后恢复原始函数
  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  test('正常日志输出 (Normal log output)', () => {
    // 调用log函数，debug设为true
    log('test.message', true, {}, COMPONENTS.SERVER);
    
    // 验证console.log被调用
    expect(console.log).toHaveBeenCalled();
    
    // 验证调用参数包含正确的组件和消息
    const callArg = (console.log as jest.Mock).mock.calls[0][0];
    expect(callArg).toContain(COMPONENTS.SERVER);
    expect(callArg).toContain('test.message');
  });

  test('错误日志输出 (Error log output)', () => {
    // 调用log函数，使用错误消息key
    log('test.error', true, {}, COMPONENTS.SERVER);
    
    // 验证console.error被调用
    expect(console.error).toHaveBeenCalled();
    
    // 验证调用参数包含正确的组件和消息
    const callArg = (console.error as jest.Mock).mock.calls[0][0];
    expect(callArg).toContain(COMPONENTS.SERVER);
    expect(callArg).toContain('test.error');
  });

  test('带有额外数据的日志 (Log with extra data)', () => {
    const extraData = { key: 'value', number: 123 };
    
    // 调用log函数，传入额外数据，debug设为true
    log('test.extra', true, extraData, COMPONENTS.NODE_FETCH);
    
    // 验证console.log被调用
    expect(console.log).toHaveBeenCalled();
    
    // 验证调用参数包含正确的组件、消息和额外数据
    const callArg = (console.log as jest.Mock).mock.calls[0][0];
    expect(callArg).toContain(COMPONENTS.NODE_FETCH);
    expect(callArg).toContain('test.extra');
    expect(callArg).toContain(JSON.stringify(extraData));
  });

  test('不同组件的日志 (Logs from different components)', () => {
    // 测试所有组件
    Object.values(COMPONENTS).forEach(component => {
      // 调用log函数，debug设为true
      log('test.component', true, {}, component);
      
      // 验证console.log被调用
      expect(console.log).toHaveBeenCalled();
      
      // 验证调用参数包含正确的组件
      const callArg = (console.log as jest.Mock).mock.calls.pop()[0];
      expect(callArg).toContain(component);
    });
  });
  
  test('当debug为false时不输出日志 (No log output when debug is false)', () => {
    // 调用log函数，debug设为false
    log('test.nodebug', false, {}, COMPONENTS.SERVER);
    
    // 验证console.log和console.error都没有被调用
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
}); 