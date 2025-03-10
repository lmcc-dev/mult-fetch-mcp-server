/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 获取项目根目录 (Get the project root directory)
const rootDir = process.cwd();

/**
 * 直接调用客户端脚本进行测试 (Directly call client script for testing)
 * 不通过MCP协议，直接测试客户端功能 (Test client functionality directly without going through MCP protocol)
 */
async function testDirectClient() {
  console.log('开始直接调用客户端脚本进行测试...');
  
  // 测试用例列表
  const testCases = [
    {
      name: 'HTML 获取测试',
      method: 'fetch_html',
      params: {
        url: 'https://example.com',
        debug: true
      }
    },
    {
      name: 'JSON 获取测试',
      method: 'fetch_json',
      params: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        debug: true
      }
    },
    {
      name: 'TXT 获取测试',
      method: 'fetch_txt',
      params: {
        url: 'https://example.com',
        debug: true
      }
    },
    {
      name: 'Markdown 获取测试',
      method: 'fetch_markdown',
      params: {
        url: 'https://example.com',
        debug: true
      }
    },
    {
      name: '错误处理测试 - 无效URL',
      method: 'fetch_html',
      params: {
        url: 'https://this-domain-does-not-exist-123456789.com',
        debug: true,
        timeout: 5000
      }
    }
  ];
  
  // 依次执行每个测试用例
  for (const testCase of testCases) {
    console.log(`\n执行测试: ${testCase.name}`);
    
    // 构建命令行参数
    const clientPath = path.resolve(rootDir, 'dist/src/client.js');
    const args = [
      clientPath,
      testCase.method,
      JSON.stringify(testCase.params)
    ];
    
    console.log(`运行命令: node ${args.join(' ')}`);
    
    // 执行命令
    const result = await new Promise<{code: number, stdout: string, stderr: string}>((resolve) => {
      const childProcess = spawn('node', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      childProcess.on('close', (code) => {
        resolve({
          code: code || 0,
          stdout,
          stderr
        });
      });
    });
    
    // 输出结果
    console.log(`退出代码: ${result.code}`);
    
    if (result.code === 0) {
      console.log('测试成功!');
      
      // 尝试解析JSON结果
      try {
        const jsonResult = JSON.parse(result.stdout);
        console.log('结果类型:', typeof jsonResult);
        
        if (typeof jsonResult === 'string') {
          console.log('内容长度:', jsonResult.length);
          console.log('内容预览:', jsonResult.substring(0, 200) + '...');
        } else {
          console.log('结果:', JSON.stringify(jsonResult, null, 2));
        }
      } catch (error) {
        console.log('原始输出:');
        console.log(result.stdout);
      }
    } else {
      console.error('测试失败!');
      console.error('错误输出:');
      console.error(result.stderr);
    }
  }
  
  console.log('\n所有测试完成!');
}

// 运行测试
testDirectClient().catch(error => {
  console.error('运行测试时出错:', error);
  process.exit(1);
}); 