/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 获取项目根目录 (Get the project root directory)
const rootDir = process.cwd();

/**
 * 测试 MCP 客户端与服务器的交互 (Test interaction between MCP client and server)
 * 启动服务器进程并使用客户端发送请求 (Start server process and send requests using client)
 */
async function testMCP() {
  console.log('开始测试 MCP 客户端与服务器的交互...');
  
  let serverProcess = null;
  let client = null;
  
  try {
    // 启动 MCP 服务器 (Start MCP server)
    const serverPath = path.resolve(rootDir, 'dist/index.js');
    
    // 检查文件是否存在
    if (!fs.existsSync(serverPath)) {
      console.error(`错误：服务器文件不存在: ${serverPath}`);
      console.log('当前目录结构:');
      console.log('rootDir:', rootDir);
      console.log('dist目录内容:', fs.readdirSync(path.resolve(rootDir, 'dist')));
      process.exit(1);
    }
    
    console.log(`启动 MCP 服务器: ${serverPath}`);
    
    // 启动服务器进程
    serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });
    
    // 创建客户端传输层
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      stderr: 'inherit',
      env: {
        ...process.env,  // 传递所有环境变量，包括MCP_LANG
      }
    });
    
    // 创建客户端
    client = new Client({
      name: "test-mcp-client",
      version: "1.0.0"
    });
    
    // 连接到传输层
    await client.connect(transport);
    
    // 等待服务器启动
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // 测试 listTools 方法
      console.log('测试 listTools 方法...');
      const tools = await client.listTools();
      console.log('可用工具列表:');
      console.log(tools);
      console.log('');
      
      // 测试 fetch_html 方法
      console.log('测试 fetch_html 方法...');
      const htmlResult = await client.callTool({
        name: 'fetch_html',
        arguments: {
          url: 'https://example.com',
          debug: true
        }
      });
      
      if (htmlResult.isError) {
        console.error('获取 HTML 失败:', htmlResult.content[0].text);
      } else {
        console.log(`获取 HTML 成功，内容长度: ${htmlResult.content[0].text.length} 字节`);
        console.log(`HTML 内容预览: ${htmlResult.content[0].text.substring(0, 100)}...`);
      }
      console.log('');
      
      // 测试 fetch_json 方法
      console.log('测试 fetch_json 方法...');
      const jsonResult = await client.callTool({
        name: 'fetch_json',
        arguments: {
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          debug: true
        }
      });
      
      if (jsonResult.isError) {
        console.error('获取 JSON 失败:', jsonResult.content[0].text);
      } else {
        console.log(`获取 JSON 成功，内容: ${jsonResult.content[0].text}`);
      }
      
      // 关闭浏览器实例（如果有的话）
      console.log('\n关闭浏览器实例...');
      await client.callTool({
        name: 'fetch_html',
        arguments: {
          url: 'about:blank',
          debug: true,
          useBrowser: true,
          closeBrowser: true
        }
      });
      
      console.log('\n所有测试完成!');
    } catch (error) {
      console.error('测试过程中出错:', error);
    }
  } finally {
    // 确保关闭客户端连接
    if (client) {
      try {
        await client.close();
        console.log('客户端连接已关闭');
      } catch (err) {
        console.error('关闭客户端连接时出错:', err);
      }
    }
    
    // 确保关闭服务器进程
    if (serverProcess) {
      try {
        serverProcess.kill('SIGTERM');
        console.log('服务器进程已终止');
      } catch (err) {
        console.error('终止服务器进程时出错:', err);
      }
    }
    
    // 强制退出进程
    console.log('测试完成，强制退出进程');
    process.exit(0);
  }
}

// 运行测试
testMCP().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
}); 