/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, expect, test, beforeEach, vi } from 'vitest';
import { fetchHtml, fetchJson, fetchTxt, fetchMarkdown } from '../src/lib/fetch.js';
import { Fetcher } from '../src/lib/fetchers/index.js';
import { RequestPayload, FetchResponse } from '../src/lib/fetchers/common/types.js';

// Mock Fetcher
vi.mock('../src/lib/fetchers/index.js', () => ({
  Fetcher: {
    html: vi.fn(),
    json: vi.fn(),
    txt: vi.fn(),
    markdown: vi.fn()
  }
}));

describe('fetch 函数测试 (fetch functions tests)', () => {
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
    
    // 设置 Fetcher 方法的返回值
    (Fetcher.html as any).mockResolvedValue(mockResponse);
    (Fetcher.json as any).mockResolvedValue(mockResponse);
    (Fetcher.txt as any).mockResolvedValue(mockResponse);
    (Fetcher.markdown as any).mockResolvedValue(mockResponse);
  });
  
  test('fetchHtml 应该调用 Fetcher.html (fetchHtml should call Fetcher.html)', async () => {
    // 调用方法
    const result = await fetchHtml(testPayload);
    
    // 验证 Fetcher.html 被调用
    expect(Fetcher.html).toHaveBeenCalledWith(testPayload);
    
    // 验证返回结果
    expect(result).toBe(mockResponse);
  });
  
  test('fetchJson 应该调用 Fetcher.json (fetchJson should call Fetcher.json)', async () => {
    // 调用方法
    const result = await fetchJson(testPayload);
    
    // 验证 Fetcher.json 被调用
    expect(Fetcher.json).toHaveBeenCalledWith(testPayload);
    
    // 验证返回结果
    expect(result).toBe(mockResponse);
  });
  
  test('fetchTxt 应该调用 Fetcher.txt (fetchTxt should call Fetcher.txt)', async () => {
    // 调用方法
    const result = await fetchTxt(testPayload);
    
    // 验证 Fetcher.txt 被调用
    expect(Fetcher.txt).toHaveBeenCalledWith(testPayload);
    
    // 验证返回结果
    expect(result).toBe(mockResponse);
  });
  
  test('fetchMarkdown 应该调用 Fetcher.markdown (fetchMarkdown should call Fetcher.markdown)', async () => {
    // 调用方法
    const result = await fetchMarkdown(testPayload);
    
    // 验证 Fetcher.markdown 被调用
    expect(Fetcher.markdown).toHaveBeenCalledWith(testPayload);
    
    // 验证返回结果
    expect(result).toBe(mockResponse);
  });
}); 