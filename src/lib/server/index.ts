/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { log, COMPONENTS } from '../logger.js';
import { closeBrowserInstance } from './browser.js';
import { registerTools } from './tools.js';
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';

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

  log('server.starting', true, {}, COMPONENTS.SERVER);
  // 初始化 StdioServerTransport，不传递任何参数
  const transport = new StdioServerTransport();

  // 设置进程退出时的清理逻辑 (Set up cleanup logic when process exits)
  process.on('exit', () => {
    log('server.stopping', true, {}, COMPONENTS.SERVER);
    // 同步清理逻辑 (Synchronous cleanup logic)
  });

  process.on('SIGINT', async () => {
    log('server.receivedInterruptSignal', true, {}, COMPONENTS.SERVER);
    await closeBrowserInstance(false);
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    log('server.receivedTerminateSignal', true, {}, COMPONENTS.SERVER);
    await closeBrowserInstance(false);
    process.exit(0);
  });

  // 处理未捕获的异常
  process.on('uncaughtException', async (error) => {
    log('server.uncaughtException', true, { error: error.message }, COMPONENTS.SERVER);
    await closeBrowserInstance(false);
    process.exit(1);
  });

  try {
    log('server.connecting', true, { transport: 'stdio' }, COMPONENTS.SERVER);
    await server.connect(transport);
    log('server.started', true, {}, COMPONENTS.SERVER);
  } catch (_error) {
    log('server.connectionError', true, { error: String(_error) }, COMPONENTS.SERVER);
    await closeBrowserInstance(false);
    process.exit(1);
  }
}