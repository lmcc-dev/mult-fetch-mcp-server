/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 测试 MCP 方法 (Test MCP methods)
 * 测试 resources/list 和 prompts/list 方法 (Test resources/list and prompts/list methods)
 */
async function testMcpMethods() {
  console.log('开始测试 MCP 方法...\n');
  
  // 创建服务器进程 (Create server process)
  const serverPath = path.resolve(path.dirname(__dirname), 'index.js');
  console.log(`使用服务器路径: ${serverPath}`);
  
  // 创建客户端传输层 (Create client transport layer)
  const transport = new StdioClientTransport({
    command: 'node',
    args: [serverPath],
    stderr: 'inherit',
    env: {
      ...process.env,  // 传递所有环境变量，包括MCP_LANG
    }
  });
  
  // 创建客户端 (Create client)
  const client = new Client({
    name: "mcp-methods-test-client",
    version: "1.0.0"
  });
  
  try {
    // 连接到传输层 (Connect to transport layer)
    console.log('连接到 MCP 服务器...');
    await client.connect(transport);
    console.log('连接成功!\n');
    
    // 测试 resources/list 方法 (Test resources/list method)
    console.log('测试 resources/list 方法...');
    try {
      const resourcesResult = await client.listResources({});
      console.log('resources/list 结果:');
      console.log(JSON.stringify(resourcesResult, null, 2));
      console.log('resources/list 测试成功!\n');
    } catch (error) {
      console.error('resources/list 测试失败:', error);
    }
    
    // 测试 prompts/list 方法 (Test prompts/list method)
    console.log('测试 prompts/list 方法...');
    try {
      const promptsResult = await client.listPrompts({});
      console.log('prompts/list 结果:');
      console.log(JSON.stringify(promptsResult, null, 2));
      console.log('prompts/list 测试成功!\n');
    } catch (error) {
      console.error('prompts/list 测试失败:', error);
    }
    
    /* 
    // 测试 resources/read 方法 (Test resources/read method)
    // 注释掉此部分，因为我们没有找到可用的资源 (Comment out this part because we didn't find available resources)
    console.log('测试 resources/read 方法...');
    try {
      const readResult = await client.readResource({
        uri: 'file:///docs/readme'
      });
      console.log('resources/read 结果 (前100个字符):');
      if (readResult.contents && readResult.contents[0] && readResult.contents[0].text) {
        console.log((readResult.contents[0].text as string).substring(0, 100) + '...');
      } else {
        console.log(readResult);
      }
      console.log('resources/read 测试成功!\n');
    } catch (error) {
      console.error('resources/read 测试失败:', error);
    }
    */
    
    // 测试 prompts/get 方法 (Test prompts/get method)
    console.log('测试 prompts/get 方法...');
    try {
      const getPromptResult = await client.getPrompt({
        name: 'fetch-website',
        arguments: {
          url: 'https://example.com',
          format: 'html',
          useBrowser: 'false'
        }
      });
      console.log('prompts/get 结果:');
      console.log(JSON.stringify(getPromptResult, null, 2));
      console.log('prompts/get 测试成功!\n');
    } catch (error) {
      console.error('prompts/get 测试失败:', error);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  } finally {
    // 关闭客户端连接 (Close client connection)
    await client.close();
    console.log('测试完成，客户端连接已关闭');
  }
}

// 执行测试 (Execute test)
testMcpMethods().catch(error => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});