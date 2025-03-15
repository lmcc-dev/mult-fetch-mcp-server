/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, expect, test, beforeEach, vi } from 'vitest';
import { Fetcher } from '../../src/lib/fetchers/index.js';
import { FetcherFactory } from '../../src/lib/fetchers/FetcherFactory.js';
import { RequestPayload, FetchResponse } from '../../src/lib/fetchers/common/types.js';
import { log, COMPONENTS } from '../../src/lib/logger.js';

// Mock FetcherFactory
vi.mock('../../src/lib/fetchers/FetcherFactory.js', () => ({
  FetcherFactory: {
    createFetcher: vi.fn()
  }
}));

// Mock logger
vi.mock('../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    SERVER: 'SERVER'
  }
}));

describe('Fetcher 类测试 (Fetcher Class Tests)', () => {
  // 模拟 fetcher 实例
  const mockFetcher = {
    html: vi.fn(),
    json: vi.fn(),
    txt: vi.fn(),
    markdown: vi.fn()
  };
  
  // 模拟响应
  const mockResponse: FetchResponse = {
    content: [{ type: 'text', text: '测试内容' }],
    isError: false
  };
  
  // 测试请求参数
  const testPayload: RequestPayload = {
    url: 'https://example.com',
    debug: true
  };
  
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks();
    
    // 设置 FetcherFactory.createFetcher 的返回值
    (FetcherFactory.createFetcher as any).mockReturnValue(mockFetcher);
    
    // 设置 mockFetcher 方法的返回值
    mockFetcher.html.mockResolvedValue(mockResponse);
    mockFetcher.json.mockResolvedValue(mockResponse);
    mockFetcher.txt.mockResolvedValue(mockResponse);
    mockFetcher.markdown.mockResolvedValue(mockResponse);
  });
  
  test('应该正确获取HTML内容 (Should fetch HTML content correctly)', async () => {
    // 调用方法
    const result = await Fetcher.html(testPayload);
    
    // 验证 FetcherFactory.createFetcher 被调用
    expect(FetcherFactory.createFetcher).toHaveBeenCalledWith(testPayload);
    
    // 验证 mockFetcher.html 被调用
    expect(mockFetcher.html).toHaveBeenCalledWith(testPayload);
    
    // 验证返回结果
    expect(result).toBe(mockResponse);
    
    // 验证日志被记录
    expect(log).toHaveBeenCalledWith(
      'fetcher.fetchingHtml',
      true,
      expect.objectContaining({
        url: testPayload.url
      }),
      COMPONENTS.SERVER
    );
  });
  
  test('应该正确获取JSON内容 (Should fetch JSON content correctly)', async () => {
    // 调用方法
    const result = await Fetcher.json(testPayload);
    
    // 验证 FetcherFactory.createFetcher 被调用
    expect(FetcherFactory.createFetcher).toHaveBeenCalledWith(testPayload);
    
    // 验证 mockFetcher.json 被调用
    expect(mockFetcher.json).toHaveBeenCalledWith(testPayload);
    
    // 验证返回结果
    expect(result).toBe(mockResponse);
    
    // 验证日志被记录
    expect(log).toHaveBeenCalledWith(
      'fetcher.fetchingJson',
      true,
      expect.objectContaining({
        url: testPayload.url
      }),
      COMPONENTS.SERVER
    );
  });
  
  test('应该正确获取纯文本内容 (Should fetch plain text content correctly)', async () => {
    // 调用方法
    const result = await Fetcher.txt(testPayload);
    
    // 验证 FetcherFactory.createFetcher 被调用
    expect(FetcherFactory.createFetcher).toHaveBeenCalledWith(testPayload);
    
    // 验证 mockFetcher.txt 被调用
    expect(mockFetcher.txt).toHaveBeenCalledWith(testPayload);
    
    // 验证返回结果
    expect(result).toBe(mockResponse);
    
    // 验证日志被记录
    expect(log).toHaveBeenCalledWith(
      'fetcher.fetchingTxt',
      true,
      expect.objectContaining({
        url: testPayload.url
      }),
      COMPONENTS.SERVER
    );
  });
  
  test('应该正确获取Markdown内容 (Should fetch Markdown content correctly)', async () => {
    // 调用方法
    const result = await Fetcher.markdown(testPayload);
    
    // 验证 FetcherFactory.createFetcher 被调用
    expect(FetcherFactory.createFetcher).toHaveBeenCalledWith(testPayload);
    
    // 验证 mockFetcher.markdown 被调用
    expect(mockFetcher.markdown).toHaveBeenCalledWith(testPayload);
    
    // 验证返回结果
    expect(result).toBe(mockResponse);
    
    // 验证日志被记录
    expect(log).toHaveBeenCalledWith(
      'fetcher.fetchingMarkdown',
      true,
      expect.objectContaining({
        url: testPayload.url
      }),
      COMPONENTS.SERVER
    );
  });
}); 