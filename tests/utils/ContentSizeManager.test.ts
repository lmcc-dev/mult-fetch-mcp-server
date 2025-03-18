/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ContentSizeManager } from '../../src/lib/utils/ContentSizeManager.js';
import { ChunkManager } from '../../src/lib/utils/ChunkManager.js';

// 模拟ChunkManager模块
vi.mock('../../src/lib/utils/ChunkManager.js', () => ({
  ChunkManager: {
    storeChunks: vi.fn().mockReturnValue('test-chunk-id')
  }
}));

// 模拟logger
vi.mock('../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    CONTENT_SIZE: 'content-size'
  }
}));

describe('ContentSizeManager 测试 (ContentSizeManager Tests)', () => {
  beforeEach(() => {
    // 清理mocks
    vi.clearAllMocks();
  });

  test('getDefaultSizeLimit应返回正确的默认大小限制 (getDefaultSizeLimit should return correct default size limit)', () => {
    const limit = ContentSizeManager.getDefaultSizeLimit();
    expect(limit).toBe(100 * 1024); // 100KB
  });

  test('exceedsLimit应正确判断内容是否超出限制 (exceedsLimit should correctly determine if content exceeds limit)', () => {
    // 创建一个超出50字节限制的字符串
    const longContent = 'a'.repeat(60);
    const shortContent = 'short';

    // 测试超出限制的情况
    const resultExceeds = ContentSizeManager.exceedsLimit(longContent, 50, true);
    expect(resultExceeds).toBe(true);

    // 测试未超出限制的情况
    const resultNotExceeds = ContentSizeManager.exceedsLimit(shortContent, 50, true);
    expect(resultNotExceeds).toBe(false);
  });

  test('exceedsLimit当未提供限制时应使用默认限制 (exceedsLimit should use default limit when no limit provided)', () => {
    // 创建一个内容
    const content = 'a'.repeat(150 * 1024); // 150KB

    // 测试超出默认限制的情况
    const resultExceeds = ContentSizeManager.exceedsLimit(content, undefined, true);
    expect(resultExceeds).toBe(true);

    // 创建未超出默认限制的内容
    const smallContent = 'a'.repeat(50 * 1024); // 50KB
    const resultNotExceeds = ContentSizeManager.exceedsLimit(smallContent, undefined, true);
    expect(resultNotExceeds).toBe(false);
  });

  test('splitContentIntoRawChunks应正确分割内容 (splitContentIntoRawChunks should correctly split content)', () => {
    // 创建测试内容
    const content = 'a'.repeat(300); // 300字节的内容
    const chunkSize = 100; // 每块100字节

    // 调用被测试方法
    const chunks = ContentSizeManager.splitContentIntoRawChunks(content, chunkSize, true);

    // 验证分块结果
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toBe('a'.repeat(100));
    expect(chunks[1]).toBe('a'.repeat(100));
    expect(chunks[2]).toBe('a'.repeat(100));
  });

  test('splitContentIntoRawChunks应处理小于chunkSize的内容 (splitContentIntoRawChunks should handle content smaller than chunkSize)', () => {
    // 创建小于chunkSize的内容
    const content = 'small content';
    const chunkSize = 100;

    // 调用被测试方法
    const chunks = ContentSizeManager.splitContentIntoRawChunks(content, chunkSize, true);

    // 验证分块结果
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe('small content');
  });

  test('splitContentIntoChunks应正确分割内容并添加分块信息 (splitContentIntoChunks should correctly split content and add chunk info)', () => {
    // 创建测试内容
    const content = 'a'.repeat(300); // 300字节的内容
    const chunkSize = 100; // 每块100字节

    // 模拟splitContentIntoRawChunks的行为
    const splitContentIntoRawChunksSpy = vi.spyOn(ContentSizeManager, 'splitContentIntoRawChunks').mockReturnValue([
      'a'.repeat(100),
      'a'.repeat(100),
      'a'.repeat(100)
    ]);

    // 调用被测试方法
    const chunks = ContentSizeManager.splitContentIntoChunks(content, chunkSize, true);

    // 验证splitContentIntoRawChunks被调用
    expect(splitContentIntoRawChunksSpy).toHaveBeenCalledWith(content, expect.any(Number), true);

    // 验证分块结果包含系统提示信息
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toContain('a'.repeat(100)); 
    expect(chunks[0]).toContain('=== SYSTEM NOTE ===');
    expect(chunks[0]).toContain('Content is too long and has been split');
    expect(chunks[0]).toContain('part 1 of');
  });

  test('splitContentIntoChunks应处理小于chunkSize的内容 (splitContentIntoChunks should handle content smaller than chunkSize)', () => {
    // 创建小于chunkSize的内容
    const content = 'small content';
    const chunkSize = 100;

    // 模拟exceedsLimit返回false表示内容不超过限制
    vi.spyOn(ContentSizeManager, 'exceedsLimit').mockReturnValue(true);
    
    // 模拟splitContentIntoRawChunks返回单个分块
    vi.spyOn(ContentSizeManager, 'splitContentIntoRawChunks').mockReturnValue([content]);

    // 调用被测试方法
    const chunks = ContentSizeManager.splitContentIntoChunks(content, chunkSize, true);

    // 验证分块结果 - 对于小内容应返回一个数组，内容包含系统信息
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain(content);
    expect(chunks[0]).toContain('=== SYSTEM NOTE ===');
  });

  test('splitContentIntoChunks最后一个分块应包含正确的提示信息 (splitContentIntoChunks last chunk should contain correct note)', () => {
    // 创建测试内容
    const content = 'a'.repeat(300); // 300字节的内容
    const chunkSize = 100; // 每块100字节

    // 模拟splitContentIntoRawChunks的行为，返回三个分块
    vi.spyOn(ContentSizeManager, 'splitContentIntoRawChunks').mockReturnValue([
      'a'.repeat(100),
      'a'.repeat(100),
      'a'.repeat(100)
    ]);

    // 调用被测试方法
    const chunks = ContentSizeManager.splitContentIntoChunks(content, chunkSize, true);

    // 验证最后一个分块
    const lastChunk = chunks[chunks.length - 1];
    expect(lastChunk).toContain('a'.repeat(100)); // 包含原始内容
    expect(lastChunk).toContain('=== SYSTEM NOTE ==='); // 包含分块信息
    expect(lastChunk).toContain('This is the last part of the content'); // 包含最后一个分块的提示
    expect(lastChunk).not.toContain('To view the next part'); // 不包含下一个分块的提示
  });
}); 