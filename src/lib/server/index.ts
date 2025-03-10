/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { log } from './logger.js';
import { closeBrowserInstance } from './browser.js';
import { registerTools } from './tools.js';
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';
import { createLogger } from '../i18n/logger.js';

// 创建服务器日志记录器 (Create server logger)
const logger = createLogger('MCP-SERVER');

// 创建MCP服务器
const server = new Server(
  {
    name: "mult-fetch-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {
        listChanged: true
      },
      tools: {},
      prompts: {
        listChanged: true
      },
    },
  },
);

/**
 * 启动服务器 (Start the server)
 * 初始化MCP服务器并设置信号处理 (Initialize MCP server and set up signal handling)
 */
export async function startServer(): Promise<void> {
  // 注册工具
  registerTools(server);
  
  // 注册资源
  registerResources(server);
  
  // 注册提示
  registerPrompts(server);
  
  logger.info('server.starting');
  // 初始化 StdioServerTransport，不传递任何参数
  const transport = new StdioServerTransport();
  
  // 设置进程退出时的清理逻辑 (Set up cleanup logic when process exits)
  process.on('exit', () => {
    logger.info('server.stopping');
    // 同步清理逻辑 (Synchronous cleanup logic)
  });
  
  process.on('SIGINT', async () => {
    logger.info('server.receivedInterruptSignal');
    await closeBrowserInstance(false);
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    logger.info('server.receivedTerminateSignal');
    await closeBrowserInstance(false);
    process.exit(0);
  });
  
  // 处理未捕获的异常
  process.on('uncaughtException', async (error) => {
    logger.error('server.uncaughtException', { error: error.message });
    await closeBrowserInstance(false);
    process.exit(1);
  });
  
  try {
    logger.info('server.connecting', { transport: 'stdio' });
    await server.connect(transport);
    logger.info('server.started');
  } catch (error) {
    logger.error('server.connectionError', { error: error instanceof Error ? error.message : String(error) });
    await closeBrowserInstance(false);
    process.exit(1);
  }
}