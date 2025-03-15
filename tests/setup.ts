/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { vi } from 'vitest';

// 全局模拟设置
// 将 vi 添加到全局，以便在测试中使用
(global as any).vi = vi;

// 为了兼容 Jest 的 jest.fn(), jest.mock() 等
(global as any).jest = {
  fn: vi.fn,
  mock: vi.mock,
  spyOn: vi.spyOn,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks
};

// 设置测试环境
beforeAll(() => {
  // 全局设置，在所有测试开始前运行
});

afterAll(() => {
  // 全局清理，在所有测试结束后运行
}); 