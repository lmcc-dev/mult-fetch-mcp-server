/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { startServer } from './lib/server/index.js';

/**
 * 主函数 (Main function)
 * 统一处理debug和MCP_LANG的获取方式 (Unified handling of debug and MCP_LANG acquisition)
 */
async function main() {
  // MCP_LANG从环境变量获取，已在i18n/index.ts中处理
  // debug将从调用参数获取，不需要在这里处理
  
  // 启动服务器
  await startServer();
}

// 启动服务器
main().catch(async (error) => {
  console.error(`服务器启动错误: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});