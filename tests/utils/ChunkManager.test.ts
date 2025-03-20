/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ChunkManager } from '../../src/lib/utils/ChunkManager.js';

// 模拟logger
vi.mock('../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    CHUNK_MANAGER: 'chunk-manager'
  }
}));

// 模拟uuid 
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid')
}));

describe('ChunkManager 测试 (ChunkManager Tests)', () => {
  beforeEach(() => {
    // 清理mocks
    vi.clearAllMocks();
    
    // 重置ChunkManager的静态属性
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'] = new Map();
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['expirations'] = new Map();
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['sizeInfo'] = new Map();
  });

  test('storeChunks应正确存储分块内容和大小信息 (storeChunks should correctly store chunked content and size information)', () => {
    // 测试数据
    const chunks = ['chunk1', 'chunk2', 'chunk3'];
    const totalBytes = 1000;
    
    // Mock Buffer.byteLength 以返回固定的字节大小
    const originalByteLength = Buffer.byteLength;
    global.Buffer.byteLength = vi.fn()
      .mockReturnValueOnce(200)  // chunk1
      .mockReturnValueOnce(300)  // chunk2
      .mockReturnValueOnce(500); // chunk3
    
    // 调用测试方法
    const chunkId = ChunkManager.storeChunks(chunks, totalBytes);
    
    // 恢复原始函数
    global.Buffer.byteLength = originalByteLength;
    
    // 验证返回的chunkId
    expect(chunkId).toBe('test-uuid');
    
    // 验证内容被正确存储
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['chunks'].get(chunkId)).toEqual(chunks);
    
    // 验证大小信息被正确存储
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['sizeInfo'].get(chunkId)).toEqual({
      totalBytes: 1000,
      fetchedBytes: [200, 300, 500]
    });
    
    // 验证过期时间被设置
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['expirations'].has(chunkId)).toBe(true);
  });

  test('getChunkBySize应返回正确的分块内容和大小信息 (getChunkBySize should return correct chunk content and size information)', () => {
    // 准备测试数据
    const chunks = ['chunk1', 'chunk2', 'chunk3'];
    const chunkId = 'test-chunk-id';
    const fetchedBytes = [100, 200, 300];
    const totalBytes = 600;
    
    // 手动设置内部状态
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(chunkId, chunks);
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['sizeInfo'].set(chunkId, { totalBytes, fetchedBytes });
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['expirations'].set(chunkId, Date.now() + 60000); // 设置为未过期
    
    // 使用startCursor=0获取从头开始的内容
    const resultStart = ChunkManager.getChunkBySize(chunkId, 0, 200);
    
    // 验证从头开始的结果
    expect(resultStart).not.toBeNull();
    expect(resultStart?.content).toBe('chunk1chunk2');
    expect(resultStart?.fetchedBytes).toBe(300);
    expect(resultStart?.remainingBytes).toBe(300);
    expect(resultStart?.isLastChunk).toBe(false);
    expect(resultStart?.totalBytes).toBe(600);
    
    // 使用startCursor=300获取从中间开始的内容
    const resultMiddle = ChunkManager.getChunkBySize(chunkId, 300, 300);
    
    // 验证从中间开始的结果
    expect(resultMiddle).not.toBeNull();
    expect(resultMiddle?.content).toBe('chunk3');
    expect(resultMiddle?.fetchedBytes).toBe(600);
    expect(resultMiddle?.remainingBytes).toBe(0);
    expect(resultMiddle?.isLastChunk).toBe(true);
    expect(resultMiddle?.totalBytes).toBe(600);
  });

  test('getChunkBySize应处理无效chunkId和startCursor (getChunkBySize should handle invalid chunkId and startCursor)', () => {
    // 无效的chunkId
    expect(ChunkManager.getChunkBySize('non-existent-id', 0)).toBeNull();
    
    // 准备测试数据
    const chunks = ['chunk1', 'chunk2', 'chunk3'];
    const chunkId = 'test-chunk-id';
    const fetchedBytes = [100, 200, 300];
    const totalBytes = 600;
    
    // 设置内部状态
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(chunkId, chunks);
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['sizeInfo'].set(chunkId, { totalBytes, fetchedBytes });
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['expirations'].set(chunkId, Date.now() + 60000); // 设置为未过期
    
    // 无效的startCursor - 负数
    expect(ChunkManager.getChunkBySize(chunkId, -1)).toBeNull();
    
    // 无效的startCursor - 超出总字节数
    expect(ChunkManager.getChunkBySize(chunkId, 700)).toBeNull();
  });

  test('getSizeInfo应返回正确的大小信息 (getSizeInfo should return correct size information)', () => {
    // 准备测试数据
    const chunkId = 'test-chunk-id';
    const fetchedBytes = [100, 200, 300];
    const totalBytes = 600;
    
    // 设置内部状态
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['sizeInfo'].set(chunkId, { totalBytes, fetchedBytes });
    
    // 获取大小信息
    const sizeInfo = ChunkManager.getSizeInfo(chunkId);
    
    // 验证结果
    expect(sizeInfo).not.toBeNull();
    expect(sizeInfo?.totalBytes).toBe(600);
    expect(sizeInfo?.fetchedBytes).toEqual([100, 200, 300]);
    
    // 测试无效的chunkId
    expect(ChunkManager.getSizeInfo('non-existent-id')).toBeNull();
  });

  test('cleanupExpiredChunks应清理过期的分块和大小信息 (cleanupExpiredChunks should clean up expired chunks and size information)', () => {
    // 准备测试数据：过期的分块
    const expiredChunkId = 'expired-chunk-id';
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(expiredChunkId, ['expired-chunk']);
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['sizeInfo'].set(expiredChunkId, { totalBytes: 100, fetchedBytes: [100] });
    // @ts-ignore - 设置为过期时间（过去的时间）
    ChunkManager['expirations'].set(expiredChunkId, Date.now() - 1000);
    
    // 准备测试数据：未过期的分块
    const validChunkId = 'valid-chunk-id';
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(validChunkId, ['valid-chunk']);
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['sizeInfo'].set(validChunkId, { totalBytes: 200, fetchedBytes: [200] });
    // @ts-ignore - 设置为未过期时间（未来的时间）
    ChunkManager['expirations'].set(validChunkId, Date.now() + 60000);
    
    // 执行清理
    // @ts-ignore - 访问私有方法用于测试
    ChunkManager['cleanupExpiredChunks']();
    
    // 验证结果：过期的分块应该被删除，未过期的分块仍然存在
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['chunks'].has(expiredChunkId)).toBe(false);
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['sizeInfo'].has(expiredChunkId)).toBe(false);
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['expirations'].has(expiredChunkId)).toBe(false);
    
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['chunks'].has(validChunkId)).toBe(true);
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['sizeInfo'].has(validChunkId)).toBe(true);
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['expirations'].has(validChunkId)).toBe(true);
  });
}); 