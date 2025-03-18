/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import i18next, { t, changeLanguage, getCurrentLanguage } from '../src/lib/i18n/index.js';
import { createLogger } from '../src/lib/i18n/logger.js';
import { FETCHER_KEYS } from '../src/lib/i18n/keys/fetcher.js';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('i18n模块测试 (i18n Module Tests)', () => {
  // 保存原始环境变量
  const originalEnv = process.env.MCP_LANG;
  
  // 在每个测试后恢复环境变量
  afterEach(() => {
    process.env.MCP_LANG = originalEnv;
  });
  
  test('默认语言为英语 (Default language is English)', () => {
    // 确保没有设置MCP_LANG环境变量
    delete process.env.MCP_LANG;
    
    // 重新初始化i18next
    i18next.init({
      resources: i18next.options.resources,
      lng: process.env.MCP_LANG || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });
    
    // 验证当前语言为英语
    expect(getCurrentLanguage()).toBe('en');
  });
  
  test('可以切换语言 (Can switch language)', () => {
    // 切换到中文
    changeLanguage('zh');
    
    // 验证当前语言为中文
    expect(getCurrentLanguage()).toBe('zh');
    
    // 切换回英语
    changeLanguage('en');
    
    // 验证当前语言为英语
    expect(getCurrentLanguage()).toBe('en');
  });
  
  test('翻译函数能正确工作 (Translation function works correctly)', () => {
    // 切换到英语
    changeLanguage('en');
    
    // 测试一个存在的翻译键
    const serverStartingKey = 'server.starting';
    const serverStartingTranslation = t(serverStartingKey);
    
    // 验证翻译结果不为空且不等于键名
    expect(serverStartingTranslation).not.toBe('');
    expect(serverStartingTranslation).not.toBe(serverStartingKey);
    
    // 切换到中文
    changeLanguage('zh');
    
    // 测试同一个翻译键
    const zhTranslation = t(serverStartingKey);
    
    // 验证中文翻译结果不为空且不等于键名
    expect(zhTranslation).not.toBe('');
    expect(zhTranslation).not.toBe(serverStartingKey);
    
    // 验证中文翻译与英文翻译不同
    expect(zhTranslation).not.toBe(serverStartingTranslation);
  });
  
  test('带参数的翻译 (Translation with parameters)', () => {
    // 切换到英语
    changeLanguage('en');
    
    // 使用一个简单的翻译键进行测试
    const testKey = 'server.starting';
    const params = { name: 'Test Server' };
    const translationWithParams = t(testKey, params);
    
    // 验证翻译结果不为空且不等于键名
    expect(translationWithParams).not.toBe('');
    expect(translationWithParams).not.toBe(testKey);
  });
  
  test('不存在的翻译键返回键名 (Non-existent translation key returns key name)', () => {
    // 测试不存在的翻译键
    const nonExistentKey = 'non.existent.key';
    const translation = t(nonExistentKey);
    
    // 验证翻译结果等于键名
    expect(translation).toBe(nonExistentKey);
  });
});

describe('i18n Logger模块测试 (i18n Logger Module Tests)', () => {
  // 保存原始的console方法
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  // 在每个测试前设置mock
  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
    process.env.DEBUG = 'false';
  });
  
  // 在每个测试后恢复原始方法
  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    delete process.env.DEBUG;
  });
  
  test('创建日志记录器 (Create logger)', () => {
    // 创建日志记录器
    const logger = createLogger('TEST');
    
    // 验证logger对象包含预期的方法
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('debug');
  });
  
  test('info方法在forceLog=true时输出日志 (info method outputs logs when forceLog=true)', () => {
    // 创建日志记录器
    const logger = createLogger('TEST');
    
    // 调用info方法，设置forceLog为true
    logger.info('test.info', {}, true);
    
    // 验证console.error被调用（i18n logger使用console.error输出所有日志）
    expect(console.error).toHaveBeenCalled();
    
    // 验证调用参数包含前缀和消息
    const callArg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg).toContain('[TEST]');
  });
  
  test('info方法在DEBUG=false且forceDebug=false时不输出日志 (info method does not output logs when DEBUG=false and forceDebug=false)', () => {
    // 创建日志记录器
    const logger = createLogger('TEST');
    
    // 调用info方法，不强制输出
    logger.info('test.info');
    
    // 验证console.error没有被调用
    expect(console.error).not.toHaveBeenCalled();
  });
  
  test('info方法在forceDebug=true时输出日志 (info method outputs logs when forceDebug=true)', () => {
    // 创建日志记录器
    const logger = createLogger('TEST');
    
    // 调用info方法，强制输出
    logger.info('test.info', {}, true);
    
    // 验证console.error被调用
    expect(console.error).toHaveBeenCalled();
    
    // 验证调用参数包含前缀和消息
    const callArg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg).toContain('[TEST]');
  });
  
  test('error方法总是输出日志 (error method always outputs logs)', () => {
    // 创建日志记录器
    const logger = createLogger('TEST');
    
    // 调用error方法
    logger.error('test.error');
    
    // 验证console.error被调用
    expect(console.error).toHaveBeenCalled();
    
    // 验证调用参数包含前缀和消息
    const callArg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg).toContain('[TEST]');
    expect(callArg).toContain('test.error');
  });
  
  test('warn方法总是输出日志 (warn method always outputs logs)', () => {
    // 创建日志记录器
    const logger = createLogger('TEST');
    
    // 调用warn方法
    logger.warn('test.warn');
    
    // 验证console.error被调用
    expect(console.error).toHaveBeenCalled();
    
    // 验证调用参数包含前缀和消息
    const callArg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg).toContain('[TEST]');
    expect(callArg).toContain('test.warn');
  });
  
  test('debug方法在forceDebug=true时输出日志 (debug method outputs logs when forceDebug=true)', () => {
    // 创建日志记录器
    const logger = createLogger('TEST');
    
    // 调用debug方法，强制输出
    logger.debug('test.debug', {}, true);
    
    // 验证console.error被调用
    expect(console.error).toHaveBeenCalled();
    
    // 验证调用参数包含前缀和消息
    const callArg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg).toContain('[TEST]');
    expect(callArg).toContain('test.debug');
  });
  
  test('debug方法在forceDebug=false时不输出日志 (debug method does not output logs when forceDebug=false)', () => {
    // 创建日志记录器
    const logger = createLogger('TEST');
    
    // 调用debug方法，不强制输出
    logger.debug('test.debug');
    
    // 验证console.error没有被调用
    expect(console.error).not.toHaveBeenCalled();
  });
}); 