/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 导入Vitest的全局函数 (Import Vitest global functions)
import { beforeAll, afterAll, vi } from 'vitest';

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

// 设置测试环境 (Setup test environment)
process.env.NODE_ENV = 'test';

// 模拟控制台输出，避免测试时输出过多日志 (Mock console output to avoid too many logs during testing)
console.log = vi.fn();
console.info = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();

// 在所有测试开始前的操作 (Operations before all tests)
beforeAll(() => {
  // 全局设置，在所有测试开始前运行
  // 可以在这里添加全局设置 (Add global setup here)
});

// 在所有测试结束后的操作 (Operations after all tests)
afterAll(() => {
  // 全局清理，在所有测试结束后运行
  // 可以在这里添加全局清理 (Add global cleanup here)
}); 