#!/usr/bin/env node

/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 * 
 * MCP 服务器启动入口 (MCP Server Entry Point)
 * 
 * 这个文件是 MCP 服务器的主入口点，它导入并启动 mcp-server.ts 中定义的服务器。
 * (This file is the main entry point of the MCP server, it imports and starts the server defined in mcp-server.ts.)
 * 
 * 使用方法 (Usage):
 * node dist/index.js
 */

// 导入服务器模块 (Import server module)
import './mcp-server.js';

// 服务器在 mcp-server.js 中已经启动，这里不需要额外的代码 
// (The server is already started in mcp-server.js, no additional code is needed here)
console.error('MCP server entry loaded, server starting...');