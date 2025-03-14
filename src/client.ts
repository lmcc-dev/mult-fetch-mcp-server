/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { RequestPayload } from './lib/types.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { log, COMPONENTS } from './lib/logger.js';
import { execSync } from 'child_process';
import { isAccessDeniedError, isNetworkError } from './lib/utils/errorDetection.js';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 基于MCP的本地客户端 (MCP-based local client)
 * 使用标准输入输出（Stdio）传输方式与服务端通信 (Communicates with the server using standard input/output (Stdio) transport)
 */

/**
 * 检查响应是否需要浏览器模式 (Check if response requires browser mode)
 * 根据错误信息判断是否需要切换到浏览器模式 (Determine if need to switch to browser mode based on error message)
 * @param response 响应对象 (Response object)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @returns 是否需要浏览器模式 (Whether browser mode is needed)
 */
function responseRequiresBrowser(response: any, debug: boolean = false): boolean {
  if (response.isError) {
    const errorText = response.content[0].text;
    
    if (debug) {
      log('client.fetchError', debug, { url: '', error: errorText }, COMPONENTS.CLIENT);
      
      // 尝试从错误信息中提取HTTP状态码 (Try to extract HTTP status code from error message)
      const statusCodeMatch = errorText.match(/(\b[45]\d\d\b)/);
      if (statusCodeMatch) {
        log('client.statusCodeDetected', debug, { code: statusCodeMatch[0] }, COMPONENTS.CLIENT);
      }
      
      // 尝试解析更详细的错误原因
      if (isAccessDeniedError(errorText)) {
        if (errorText.toLowerCase().includes('403') || errorText.toLowerCase().includes('forbidden')) {
          log('errors.forbidden', debug, {}, COMPONENTS.CLIENT);
        } else if (errorText.toLowerCase().includes('cloudflare')) {
          log('errors.cloudflareProtection', debug, {}, COMPONENTS.CLIENT);
        } else if (errorText.toLowerCase().includes('captcha')) {
          log('errors.captchaRequired', debug, {}, COMPONENTS.CLIENT);
        }
      } else if (isNetworkError(errorText)) {
        if (errorText.toLowerCase().includes('timeout')) {
          log('errors.timeout', debug, { timeout: '' }, COMPONENTS.CLIENT);
        } else if (errorText.toLowerCase().includes('socket') || errorText.toLowerCase().includes('econnrefused')) {
          log('errors.connectionProblem', debug, {}, COMPONENTS.CLIENT);
        }
      }
    }
    
    return isAccessDeniedError(errorText) || 
           isNetworkError(errorText) ||
           errorText.toLowerCase().includes('javascript required') ||
           errorText.toLowerCase().includes('und_err_connect_timeout') ||
           errorText.toLowerCase().includes('fetch failed');
  }
  
  return false;
}

/**
 * 智能获取函数，根据需要自动切换模式 (Smart fetch function, automatically switches modes as needed)
 * 支持在标准模式和浏览器模式之间自动切换 (Supports automatic switching between standard mode and browser mode)
 * @param params 请求参数 (Request parameters)
 * @returns 获取结果 (Fetch result)
 */
async function smartFetch(params: RequestPayload & { method?: string }) {
  const debug = params.debug === true;
  
  // 创建服务器进程 (Create server process)
  const serverPath = path.resolve(path.dirname(__dirname), 'index.js');
  log('client.startingServer', debug, { path: serverPath }, COMPONENTS.CLIENT);
  
  // 创建客户端传输层 (Create client transport layer)
  const transport = new StdioClientTransport({
    command: 'node',
    args: [serverPath],
    stderr: 'inherit',
    env: {
      ...process.env,  // 传递所有环境变量，包括MCP_LANG和DEBUG
    }
  });
  
  // 创建客户端 (Create client)
  const client = new Client({
    name: "fetch-mcp-client",
    version: "1.0.0"
  });
  
  // 连接到传输层 (Connect to transport layer)
  await client.connect(transport);
  
  try {
    const { url, method = 'fetch_html' } = params;
    log('client.fetchingUrl', debug, { url }, COMPONENTS.CLIENT);
    
    // 如果启用了自动检测模式（默认启用） (If auto-detect mode is enabled (enabled by default))
    if (params.autoDetectMode !== false) {
      // 首先尝试使用标准模式 (First try using standard mode)
      log('client.usingMode', debug, { mode: params.useBrowser ? 'browser' : 'standard', url }, COMPONENTS.CLIENT);
      const result = await client.callTool({
        name: method,
        arguments: params
      });
      
      // 在调试模式下打印响应结果的摘要 (Print response result summary in debug mode)
      if (debug) {
        if (result.isError) {
          log('client.fetchFailed', debug, { url, error: result.content[0].text }, COMPONENTS.CLIENT);
        } else {
          log('client.fetchSuccess', debug, { url }, COMPONENTS.CLIENT);
        }
      }
      
      // 检查是否需要切换到浏览器模式 (Check if need to switch to browser mode)
      if (result.isError && responseRequiresBrowser(result, debug) && !params.useBrowser) {
        log('client.browserModeNeeded', debug, { url }, COMPONENTS.CLIENT);
        log('client.retryingWithBrowser', debug, { url }, COMPONENTS.CLIENT);
        
        // 切换到浏览器模式重试 (Switch to browser mode and retry)
        const browserResult = await client.callTool({
          name: method,
          arguments: {
            ...params,
            useBrowser: true
          }
        });
        
        if (browserResult.isError) {
          log('client.browserModeFetchFailed', debug, { url, error: browserResult.content[0].text }, COMPONENTS.CLIENT);
        } else {
          log('client.browserModeFetchSuccess', debug, { url }, COMPONENTS.CLIENT);
        }
        
        return browserResult;
      }
      
      if (result.isError) {
        log('client.fetchFailed', debug, { url, error: result.content[0].text }, COMPONENTS.CLIENT);
      } else {
        log('client.fetchSuccess', debug, { url }, COMPONENTS.CLIENT);
      }
      
      return result;
    } else {
      // 直接使用指定的模式 (Directly use the specified mode)
      log('client.usingMode', debug, { mode: params.useBrowser ? 'browser' : 'standard', url }, COMPONENTS.CLIENT);
      const result = await client.callTool({
        name: method,
        arguments: params
      });
      
      if (result.isError) {
        log('client.fetchFailed', debug, { url, error: result.content[0].text }, COMPONENTS.CLIENT);
      } else {
        log('client.fetchSuccess', debug, { url }, COMPONENTS.CLIENT);
      }
      
      return result;
    }
  } finally {
    // 关闭客户端连接 (Close client connection)
    log('client.serverClosed', debug, {}, COMPONENTS.CLIENT);
    await client.close();
  }
}

/**
 * 主函数 (Main function)
 * 处理命令行参数并执行相应操作 (Process command line arguments and perform corresponding operations)
 */
async function main() {
  // 检查命令行参数 (Check command line arguments)
  if (process.argv.length < 4) {
    log('client.usageInfo', true, {}, COMPONENTS.CLIENT);
    log('client.exampleUsage', true, {}, COMPONENTS.CLIENT);
    process.exit(1);
  }

  const method = process.argv[2];
  let paramsJson = process.argv[3];
  let params: RequestPayload;

  try {
    params = JSON.parse(paramsJson);
  } catch (error) {
    log('client.invalidJson', true, {}, COMPONENTS.CLIENT);
    
    // 返回标准错误结构体 (Return standard error structure)
    const errorResult = {
      isError: true,
      content: [
        {
          type: "text",
          text: `Invalid JSON parameter: ${paramsJson}`
        }
      ]
    };
    
    process.stdout.write(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }

  const debug = params.debug === true;
  
  // 检查是否提供了代理参数 (Check if proxy parameter is provided)
  const proxyArg = process.argv[4];
  if (proxyArg) {
    if (proxyArg.startsWith('http://') || proxyArg.startsWith('https://')) {
      log('client.usingCommandLineProxy', debug, { proxy: proxyArg }, COMPONENTS.CLIENT);
      params.proxy = proxyArg;
    } else {
      log('client.invalidProxyFormat', debug, { proxy: proxyArg }, COMPONENTS.CLIENT);
    }
  }

  // 如果没有设置代理但启用了系统代理检测 (If no proxy is set but system proxy detection is enabled)
  if (!params.proxy && params.useSystemProxy !== false) {
    // 尝试从环境变量获取代理 (Try to get proxy from environment variables)
    const envProxy = process.env.HTTP_PROXY || process.env.http_proxy || 
                    process.env.HTTPS_PROXY || process.env.https_proxy;
    
    if (envProxy) {
      log('client.usingEnvProxy', debug, { proxy: envProxy }, COMPONENTS.CLIENT);
      params.proxy = envProxy;
    } else {
      // 尝试使用系统命令获取环境变量 (Try to get environment variables using system commands)
      try {
        let proxyUrl: string | undefined;
        const platform = process.platform;
        
        if (platform === 'win32') {
          // Windows系统 - 使用set命令 (Windows - use set command)
          try {
            const setOutput = execSync('set http_proxy & set https_proxy & set HTTP_PROXY & set HTTPS_PROXY').toString();
            const proxyMatch = setOutput.match(/(?:http_proxy|https_proxy|HTTP_PROXY|HTTPS_PROXY)=(https?:\/\/[^=\r\n]+)/i);
            if (proxyMatch && proxyMatch[1]) {
              proxyUrl = proxyMatch[1].trim();
            }
          } catch (error) {
            // 忽略错误 (Ignore errors)
          }
        } else {
          // Unix系统 (macOS/Linux) - 使用env命令 (Unix systems - use env command)
          try {
            const envOutput = execSync('env | grep -i proxy').toString();
            const proxyMatch = envOutput.match(/(?:http_proxy|https_proxy|HTTP_PROXY|HTTPS_PROXY)=(https?:\/\/[^=\n]+)/i);
            if (proxyMatch && proxyMatch[1]) {
              proxyUrl = proxyMatch[1].trim();
            }
          } catch (error) {
            // 忽略错误 (Ignore errors)
          }
        }
        
        if (proxyUrl) {
          log('client.usingSystemProxy', debug, { proxy: proxyUrl }, COMPONENTS.CLIENT);
          params.proxy = proxyUrl;
        } else {
          log('client.noSystemProxy', debug, {}, COMPONENTS.CLIENT);
        }
      } catch (error) {
        // 忽略错误 (Ignore errors)
      }
    }
  } else if (params.useSystemProxy === false) {
    log('client.systemProxyDisabled', debug, {}, COMPONENTS.CLIENT);
  }

  // 如果已经设置了代理，禁用系统代理自动检测 (If proxy is already set, disable system proxy auto-detection)
  if (params.proxy) {
    log('client.proxySet', debug, { proxy: params.proxy }, COMPONENTS.CLIENT);
    params.useSystemProxy = false;
  }

  try {
    // 执行请求 (Execute request)
    const result = await smartFetch({ ...params, method });
    
    // 使用process.stdout.write输出结果，这是实际的结果输出，不是日志
    // (Use process.stdout.write to output the result, this is the actual result output, not a log)
    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (error: any) {
    log('client.requestFailed', debug, { error: error.message }, COMPONENTS.CLIENT);
    
    // 即使在出错的情况下也输出标准结构体 (Output standard structure even in case of error)
    const errorResult = {
      isError: true,
      content: [
        {
          type: "text",
          text: `Client error: ${error.message}`
        }
      ]
    };
    
    process.stdout.write(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

// 捕获未处理的异常 (Catch unhandled exceptions)
process.on('uncaughtException', (error) => {
  log('client.fatalError', true, { error: error.toString() }, COMPONENTS.CLIENT);
  process.exit(1);
});

// 执行主函数 (Execute main function)
main(); 