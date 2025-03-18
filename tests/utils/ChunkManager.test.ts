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
  });

  test('storeChunks应正确存储分块内容 (storeChunks should correctly store chunked content)', () => {
    // 测试数据
    const chunks = ['chunk1', 'chunk2', 'chunk3'];
    
    // 调用测试方法
    const chunkId = ChunkManager.storeChunks(chunks);
    
    // 验证返回的chunkId
    expect(chunkId).toBe('test-uuid');
    
    // 验证内容被正确存储
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['chunks'].get(chunkId)).toEqual(chunks);
    
    // 验证过期时间被设置
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['expirations'].has(chunkId)).toBe(true);
  });

  test('getChunk应返回正确的分块内容 (getChunk should return correct chunk content)', () => {
    // 准备测试数据
    const chunks = ['chunk1', 'chunk2', 'chunk3'];
    const chunkId = 'test-chunk-id';
    
    // 手动设置内部状态
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(chunkId, chunks);
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['expirations'].set(chunkId, Date.now() + 60000); // 设置为未过期
    
    // 获取第二个分块
    const result = ChunkManager.getChunk(chunkId, 1);
    
    // 验证结果
    expect(result).toBe('chunk2');
  });

  test('getChunk应处理无效chunkId和索引 (getChunk should handle invalid chunkId and index)', () => {
    // 无效的chunkId
    expect(ChunkManager.getChunk('non-existent-id', 0)).toBeNull();
    
    // 准备测试数据
    const chunks = ['chunk1'];
    const chunkId = 'test-chunk-id';
    
    // 设置内部状态
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(chunkId, chunks);
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['expirations'].set(chunkId, Date.now() + 60000); // 设置为未过期
    
    // 无效的索引
    expect(ChunkManager.getChunk(chunkId, 1)).toBeNull();
    expect(ChunkManager.getChunk(chunkId, -1)).toBeNull();
  });

  test('getTotalChunks应返回正确的分块总数 (getTotalChunks should return correct total chunks)', () => {
    // 准备测试数据
    const chunks = ['chunk1', 'chunk2', 'chunk3'];
    const chunkId = 'test-chunk-id';
    
    // 设置内部状态
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(chunkId, chunks);
    
    // 获取分块总数
    const count = ChunkManager.getTotalChunks(chunkId);
    
    // 验证结果
    expect(count).toBe(3);
    
    // 测试无效的chunkId
    expect(ChunkManager.getTotalChunks('non-existent-id')).toBe(0);
  });

  test('cleanupExpiredChunks应清理过期的分块 (cleanupExpiredChunks should clean up expired chunks)', () => {
    // 准备测试数据：过期的分块
    const expiredChunkId = 'expired-chunk-id';
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(expiredChunkId, ['expired-chunk']);
    // @ts-ignore - 设置为过期时间（过去的时间）
    ChunkManager['expirations'].set(expiredChunkId, Date.now() - 1000);
    
    // 准备测试数据：未过期的分块
    const validChunkId = 'valid-chunk-id';
    // @ts-ignore - 访问私有属性用于测试
    ChunkManager['chunks'].set(validChunkId, ['valid-chunk']);
    // @ts-ignore - 设置为未过期时间（未来的时间）
    ChunkManager['expirations'].set(validChunkId, Date.now() + 60000);
    
    // 执行清理
    // @ts-ignore - 访问私有方法用于测试
    ChunkManager['cleanupExpiredChunks']();
    
    // 验证结果：过期的分块应该被删除，未过期的分块仍然存在
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['chunks'].has(expiredChunkId)).toBe(false);
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['expirations'].has(expiredChunkId)).toBe(false);
    
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['chunks'].has(validChunkId)).toBe(true);
    // @ts-ignore - 访问私有属性用于测试
    expect(ChunkManager['expirations'].has(validChunkId)).toBe(true);
  });
}); 