/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RequestPayload } from '../src/lib/types.js';
import { describe, test, expect } from 'vitest';

describe('类型定义测试 (Type Definitions Tests)', () => {
  test('RequestPayload类型可以正确创建 (RequestPayload type can be correctly created)', () => {
    // 创建一个最小的RequestPayload对象
    const minimalPayload: RequestPayload = {
      url: 'https://example.com'
    };
    
    // 验证对象属性
    expect(minimalPayload.url).toBe('https://example.com');
    expect(minimalPayload.debug).toBeUndefined();
    
    // 创建一个完整的RequestPayload对象
    const fullPayload: RequestPayload = {
      url: 'https://example.com',
      debug: true,
      headers: {
        'User-Agent': 'Test Agent',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      proxy: 'http://proxy.example.com:8080',
      timeout: 30000,
      maxRedirects: 5,
      noDelay: true,
      useBrowser: true,
      autoDetectMode: true,
      closeBrowser: true,
      waitForSelector: '#content',
      waitForTimeout: 5000,
      scrollToBottom: true,
      useSystemProxy: true,
      saveCookies: true
    };
    
    // 验证对象属性
    expect(fullPayload.url).toBe('https://example.com');
    expect(fullPayload.debug).toBe(true);
    expect(fullPayload.headers).toEqual({
      'User-Agent': 'Test Agent',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    });
    expect(fullPayload.proxy).toBe('http://proxy.example.com:8080');
    expect(fullPayload.timeout).toBe(30000);
    expect(fullPayload.maxRedirects).toBe(5);
    expect(fullPayload.noDelay).toBe(true);
    expect(fullPayload.useBrowser).toBe(true);
    expect(fullPayload.autoDetectMode).toBe(true);
    expect(fullPayload.closeBrowser).toBe(true);
    expect(fullPayload.waitForSelector).toBe('#content');
    expect(fullPayload.waitForTimeout).toBe(5000);
    expect(fullPayload.scrollToBottom).toBe(true);
    expect(fullPayload.useSystemProxy).toBe(true);
    expect(fullPayload.saveCookies).toBe(true);
  });
}); 