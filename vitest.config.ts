/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    globals: true, // 启用全局测试 API，如 describe, it, expect 等
    setupFiles: ['./tests/setup.ts'], // 添加设置文件
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.ts']
    },
    deps: {
      // 处理 ESM 模块
      interopDefault: true
    },
    // 模拟 Jest 的 transformIgnorePatterns
    testTransformMode: {
      web: ['node_modules/(?!(@modelcontextprotocol)/)']
    }
  }
}); 