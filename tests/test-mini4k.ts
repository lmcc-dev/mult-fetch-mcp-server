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
 * 测试 mini4k.com 网站（已知需要浏览器模式） (Test mini4k.com website (known to require browser mode))
 * 验证浏览器模式下的网页获取功能 (Verify webpage fetching functionality in browser mode)
 */
async function testMini4k() {
  console.log('开始测试 mini4k.com 网站...');
  
  let serverProcess = null;
  let client = null;
  
  try {
    // 启动服务器进程
    const serverPath = path.resolve(rootDir, 'dist/index.js');
    console.log(`启动服务器: ${serverPath}`);
    
    serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });
    
    // 检查文件是否存在
    if (!fs.existsSync(serverPath)) {
      console.error(`错误：服务器文件不存在: ${serverPath}`);
      console.log('当前目录结构:');
      console.log('rootDir:', rootDir);
      console.log('dist目录内容:', fs.readdirSync(path.resolve(rootDir, 'dist')));
      process.exit(1);
    }
    
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
      name: "test-mini4k-client",
      version: "1.0.0"
    });
    
    // 连接到传输层
    await client.connect(transport);
    
    // 等待服务器启动
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      console.log('\n测试标准模式获取 mini4k.com...');
      // 使用标准模式获取
      const standardResult = await client.callTool({
        name: 'fetch_html',
        arguments: {
          url: 'https://mini4k.com',
          debug: true,
          timeout: 30000,
          waitForTimeout: 3000,
          scrollToBottom: false, // 禁用滚动到底部
          startCursor: 0
        }
      });
      
      console.log(`标准模式结果 - 是否错误: ${standardResult.isError}`);
      if (!standardResult.isError && standardResult.content && standardResult.content[0]) {
        console.log(`标准模式内容长度: ${standardResult.content[0].text.length} 字节`);
        console.log(`标准模式内容预览: ${standardResult.content[0].text.substring(0, 200)}...`);
      } else if (standardResult.isError) {
        console.log(`标准模式错误: ${standardResult.content[0].text}`);
      }
      
      console.log('\n测试浏览器模式获取 mini4k.com...');
      // 使用浏览器模式获取
      const browserResult = await client.callTool({
        name: 'fetch_html',
        arguments: {
          url: 'https://mini4k.com',
          debug: true,
          useBrowser: true,
          timeout: 30000,
          waitForTimeout: 3000,
          scrollToBottom: false, // 禁用滚动到底部
          startCursor: 0
        }
      });
      
      console.log(`浏览器模式结果 - 是否错误: ${browserResult.isError}`);
      if (!browserResult.isError && browserResult.content && browserResult.content[0]) {
        console.log(`浏览器模式内容长度: ${browserResult.content[0].text.length} 字节`);
        console.log(`浏览器模式内容预览: ${browserResult.content[0].text.substring(0, 200)}...`);
      } else if (browserResult.isError) {
        console.log(`浏览器模式错误: ${browserResult.content[0].text}`);
      }
      
      // 测试 HTML 转纯文本功能
      console.log('\n测试 HTML 转纯文本功能...');
      const plaintextResult = await client.callTool({
        name: 'fetch_plaintext',
        arguments: {
          url: 'https://mini4k.com',
          debug: true,
          useBrowser: true, // 使用浏览器模式，因为标准模式可能会失败
          timeout: 30000,
          waitForTimeout: 3000,
          startCursor: 0
        }
      });
      
      console.log(`纯文本结果 - 是否错误: ${plaintextResult.isError}`);
      if (!plaintextResult.isError && plaintextResult.content && plaintextResult.content[0]) {
        console.log(`纯文本内容长度: ${plaintextResult.content[0].text.length} 字节`);
        console.log(`纯文本内容预览: ${plaintextResult.content[0].text.substring(0, 200)}...`);
      } else if (plaintextResult.isError) {
        console.log(`纯文本错误: ${plaintextResult.content[0].text}`);
      }
      
      // 测试分块功能
      console.log('\n测试分块功能...');
      const chunkResult = await client.callTool({
        name: 'fetch_html',
        arguments: {
          url: 'https://mini4k.com',
          debug: true,
          useBrowser: true,
          timeout: 30000,
          waitForTimeout: 3000,
          contentSizeLimit: 3000, // 设置较小的内容大小限制来触发分块
          startCursor: 0,
          enableContentSplitting: true
        }
      });
      
      console.log(`分块结果 - 是否错误: ${chunkResult.isError}`);
      if (!chunkResult.isError && chunkResult.content && chunkResult.content[0]) {
        console.log(`第一个分块内容长度: ${chunkResult.content[0].text.length} 字节`);
        console.log(`第一个分块内容预览: ${chunkResult.content[0].text.substring(0, 100)}...`);
        
        // 检查是否有更多分块
        const systemNoteMatch = chunkResult.content[0].text.match(/===\s*SYSTEM\s*NOTE\s*===.*?====================/s);
        if (systemNoteMatch) {
          console.log('检测到系统注释，表示有更多分块可用');
          console.log(systemNoteMatch[0]);
          
          // 提取 chunkId 和 fetchedBytes
          const chunkIdMatch = systemNoteMatch[0].match(/chunkId:\s*"([^"]+)"/);
          const fetchedBytesMatch = systemNoteMatch[0].match(/fetchedBytes:\s*(\d+)/);
          
          if (chunkIdMatch && fetchedBytesMatch) {
            const chunkId = chunkIdMatch[1];
            const fetchedBytes = parseInt(fetchedBytesMatch[1]);
            
            console.log(`获取到 chunkId: ${chunkId}, fetchedBytes: ${fetchedBytes}`);
            
            // 获取第二个分块
            console.log('\n获取第二个分块...');
            const secondChunkResult = await client.callTool({
              name: 'fetch_html',
              arguments: {
                url: 'https://mini4k.com',
                debug: true,
                useBrowser: true,
                timeout: 30000,
                chunkId: chunkId,
                startCursor: fetchedBytes,
                contentSizeLimit: 3000,
                enableContentSplitting: true
              }
            });
            
            console.log(`第二个分块结果 - 是否错误: ${secondChunkResult.isError}`);
            if (!secondChunkResult.isError && secondChunkResult.content && secondChunkResult.content[0]) {
              console.log(`第二个分块内容长度: ${secondChunkResult.content[0].text.length} 字节`);
              console.log(`第二个分块内容预览: ${secondChunkResult.content[0].text.substring(0, 100)}...`);
            } else if (secondChunkResult.isError) {
              console.log(`第二个分块错误: ${secondChunkResult.content[0].text}`);
            }
          }
        } else {
          console.log('没有检测到更多分块');
        }
      } else if (chunkResult.isError) {
        console.log(`分块错误: ${chunkResult.content[0].text}`);
      }
      
      // 关闭浏览器实例
      console.log('\n关闭浏览器实例...');
      await client.callTool({
        name: 'fetch_html',
        arguments: {
          url: 'about:blank',
          debug: true,
          useBrowser: true,
          closeBrowser: true,
          startCursor: 0
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
testMini4k().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
}); 