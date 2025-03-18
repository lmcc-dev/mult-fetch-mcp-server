/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { fetchPlainText } from '../../src/lib/fetch.js';
import { FetcherFactory } from '../../src/lib/fetchers/FetcherFactory.js';

// 模拟FetcherFactory
vi.mock('../../src/lib/fetchers/FetcherFactory.js', () => ({
  FetcherFactory: {
    createFetcher: vi.fn().mockImplementation((payload) => {
      return {
        plainText: vi.fn().mockImplementation(async () => {
          if (payload.url === 'https://example.com') {
            return {
              content: [{ type: 'text', text: 'Hello World' }],
              isError: false
            };
          } else if (payload.url === 'https://example.com/large') {
            // 返回分块内容
            return {
              content: [{ type: 'text', text: 'This is chunk 1 with system note' }],
              isError: false,
              isChunked: true,
              totalChunks: 2,
              currentChunk: 1,
              chunkId: 'test-chunk-id',
              hasMoreChunks: true
            };
          } else if (payload.url === 'https://example.com/error') {
            throw new Error('Fetch error');
          }
          return {
            content: [{ type: 'text', text: '' }],
            isError: false
          };
        })
      };
    })
  }
}));

describe('fetchPlainText 测试 (fetchPlainText Tests)', () => {
  beforeEach(() => {
    // 清理所有模拟方法的调用记录
    vi.clearAllMocks();
  });

  test('fetchPlainText应正确获取内容并转换为纯文本 (fetchPlainText should correctly fetch and convert content to plain text)', async () => {
    const url = 'https://example.com';
    const result = await fetchPlainText({ url });

    // 验证结果格式
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError');
    expect(result.isError).toBe(false);
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]).toHaveProperty('type');
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0].text).toBe('Hello World');

    // 验证方法调用
    expect(FetcherFactory.createFetcher).toHaveBeenCalledWith({ url });
  });

  test('fetchPlainText应处理大内容并正确分块 (fetchPlainText should handle large content and chunk it correctly)', async () => {
    const url = 'https://example.com/large';
    const result = await fetchPlainText({ url });

    // 验证结果包含内容
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError');
    expect(result.isError).toBe(false);
    
    // 验证分块信息
    expect(result).toHaveProperty('isChunked');
    expect(result.isChunked).toBe(true);
    expect(result).toHaveProperty('totalChunks');
    expect(result.totalChunks).toBe(2);
    expect(result).toHaveProperty('currentChunk');
    expect(result.currentChunk).toBe(1);
    expect(result).toHaveProperty('chunkId');
    expect(result.chunkId).toBe('test-chunk-id');
    
    // 验证方法调用
    expect(FetcherFactory.createFetcher).toHaveBeenCalledWith({ url });
  });

  test('fetchPlainText在提供无效URL时应抛出错误 (fetchPlainText should throw an error when an invalid URL is provided)', async () => {
    const url = 'https://example.com/error';
    
    await expect(fetchPlainText({ url })).rejects.toThrow('Fetch error');
    
    // 验证方法调用
    expect(FetcherFactory.createFetcher).toHaveBeenCalledWith({ url });
  });

  test('fetchPlainText应支持自定义参数 (fetchPlainText should support custom parameters)', async () => {
    const url = 'https://example.com';
    const params = { useBrowser: true };
    
    await fetchPlainText({ url, ...params });
    
    // 验证方法调用时传递了自定义参数
    expect(FetcherFactory.createFetcher).toHaveBeenCalledWith({ url, ...params });
  });
}); 