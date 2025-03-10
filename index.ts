#!/usr/bin/env node

/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 * 
 * MCP 服务器启动入口 (MCP Server Entry Point)
 * 
 * 这个文件是 MCP 服务器的主入口点，它导入并启动 src/mcp-server.ts 中定义的服务器。
 * (This file is the main entry point of the MCP server, it imports and starts the server defined in src/mcp-server.ts.)
 * 
 * 使用方法 (Usage):
 * node dist/index.js
 */

// 导入服务器模块 (Import server module)
import './src/mcp-server.js';

// 服务器在 src/mcp-server.js 中已经启动，这里不需要额外的代码
// 在 MCP 模式下，不能有任何标准输出，否则会干扰 JSON-RPC 通信
// (The server is already started in src/mcp-server.js, no additional code is needed here)
// (In MCP mode, there should be no standard output, otherwise it will interfere with JSON-RPC communication)
// console.log('MCP 服务器入口已加载，服务器正在启动...'); 