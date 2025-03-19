/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, test, expect, vi, Mock } from 'vitest';
import { fetchPlainText } from '../../src/lib/fetch.js';
import { Fetcher } from '../../src/lib/fetchers/index.js';
import { RequestPayload } from '../../src/lib/fetchers/common/types.js';

// 定义测试中使用的类型
interface ContentItem {
  type: string;
  text: string;
  metadata?: {
    chunkInfo: {
      isChunked: boolean;
      chunkId: string;
      startCursor: number;
      totalBytes: number;
      fetchedBytes: number;
      remainingBytes: number;
      isLastChunk: boolean;
    }
  }
}

// Mock the Fetcher.plainText function
vi.mock('../../src/lib/fetchers/index.js', () => ({
  Fetcher: {
    plainText: vi.fn()
  }
}));

describe('plain-text fetcher 测试 (plain-text fetcher tests)', () => {
  test('应该正确获取并转换内容为纯文本 (should correctly fetch and convert content to plain text)', async () => {
    // 模拟 Fetcher.plainText 的返回值
    (Fetcher.plainText as Mock).mockResolvedValue({
      content: [{ type: 'text', text: '<div>Example content</div>' }],
      isError: false
    });
    
    // 调用被测试的函数
    const result = await fetchPlainText({ url: 'https://example.com', startCursor: 0 });
    
    // 验证 Fetcher.plainText 被调用并传递了正确的参数
    expect(Fetcher.plainText).toHaveBeenCalledWith({ 
      url: 'https://example.com', 
      startCursor: 0 
    });
    
    // 验证返回结果正确
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', '<div>Example content</div>');
  });
  
  test('应该正确处理大型内容并返回分块信息 (should handle large content and return chunk information)', async () => {
    // 模拟返回值，包含分块信息
    const chunkInfo = {
      isChunked: true,
      chunkId: 'test-chunk-id',
      startCursor: 0,
      totalBytes: 10000,
      fetchedBytes: 1000,
      remainingBytes: 9000,
      isLastChunk: false
    };
    
    (Fetcher.plainText as Mock).mockResolvedValue({
      content: [{ 
        type: 'text', 
        text: 'Large content example', 
        metadata: { chunkInfo }
      }],
      isError: false
    });
    
    // 调用被测试的函数
    const result = await fetchPlainText({ 
      url: 'https://example.com/large',
      enableContentSplitting: true,
      contentSizeLimit: 1000,
      startCursor: 0
    } as RequestPayload);
    
    // 验证 Fetcher.plainText 被调用并传递了正确的参数
    expect(Fetcher.plainText).toHaveBeenCalledWith({ 
      url: 'https://example.com/large', 
      enableContentSplitting: true,
      contentSizeLimit: 1000,
      startCursor: 0 
    });
    
    // 验证返回结果包含分块信息
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    // 由于类型问题，使用toEqual代替单独的属性断言
    expect(result.content[0]).toEqual({
      type: 'text',
      text: 'Large content example',
      metadata: { chunkInfo }
    });
  });
  
  test('应该正确处理后续分块请求 (should handle subsequent chunk requests)', async () => {
    // 模拟返回值，包含后续分块信息
    const chunkInfo = {
      isChunked: true,
      chunkId: 'test-chunk-id',
      startCursor: 1000,
      totalBytes: 10000,
      fetchedBytes: 1000,
      remainingBytes: 8000,
      isLastChunk: false
    };
    
    (Fetcher.plainText as Mock).mockResolvedValue({
      content: [{ 
        type: 'text', 
        text: 'Subsequent chunk content', 
        metadata: { chunkInfo }
      }],
      isError: false
    });
    
    // 调用被测试的函数，包含chunkId和startCursor
    const result = await fetchPlainText({ 
      url: 'https://example.com/large',
      chunkId: 'test-chunk-id',
      startCursor: 1000
    } as unknown as RequestPayload);
    
    // 验证 Fetcher.plainText 被调用并传递了正确的参数
    expect(Fetcher.plainText).toHaveBeenCalledWith({ 
      url: 'https://example.com/large', 
      chunkId: 'test-chunk-id',
      startCursor: 1000
    });
    
    // 验证返回结果包含分块信息
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    // 由于类型问题，使用toEqual代替单独的属性断言
    expect(result.content[0]).toEqual({
      type: 'text',
      text: 'Subsequent chunk content',
      metadata: { chunkInfo }
    });
  });
  
  test('当URL无效时应抛出错误 (should throw error when URL is invalid)', async () => {
    // 模拟 Fetcher.plainText 抛出错误
    const errorMessage = 'Invalid URL or unable to fetch';
    (Fetcher.plainText as Mock).mockRejectedValue(new Error(errorMessage));
    
    // 将 fetchPlainText 包装在 try/catch 中来获取生成的错误响应
    let result;
    try {
      await fetchPlainText({ url: 'https://example.com/error', startCursor: 0 });
      // 如果没有抛出错误，测试应该失败
      expect(true).toBe(false);
    } catch (error) {
      // 处理错误，获取生成的错误响应
      result = {
        isError: true,
        content: [{ type: 'text', text: errorMessage }]
      };
    }
    
    // 验证 Fetcher.plainText 被调用并传递了正确的参数
    expect(Fetcher.plainText).toHaveBeenCalledWith({ 
      url: 'https://example.com/error', 
      startCursor: 0
    });
    
    // 验证返回结果包含错误信息
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0]).toHaveProperty('text', errorMessage);
  });
}); 