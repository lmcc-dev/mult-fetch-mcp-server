/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { BrowserFetcher } from './lib/BrowserFetcher.js';
import { RequestPayload } from './lib/types.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './lib/i18n/logger.js';
import { execSync } from 'child_process';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建客户端日志记录器 (Create client logger)
const logger = createLogger('CLIENT');

/**
 * 基于MCP的本地客户端 (MCP-based local client)
 * 使用标准输入输出（Stdio）传输方式与服务端通信 (Communicates with the server using standard input/output (Stdio) transport)
 */

/**
 * 日志函数 (Log function)
 * 输出调试信息到标准错误流 (Output debug information to standard error stream)
 * @param key 翻译键或消息 (Translation key or message)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @param options 翻译选项 (Translation options)
 */
function log(key: string, debug: boolean = false, options?: any): void {
  // 只有在明确设置 debug 为 true 时才输出日志 (Only output logs when debug is explicitly set to true)
  if (!debug) {
    return;
  }
  logger.debug(key, options, debug);
}

/**
 * 检查响应是否需要浏览器模式 (Check if response requires browser mode)
 * 根据错误信息判断是否需要切换到浏览器模式 (Determine if need to switch to browser mode based on error message)
 * @param response 响应对象 (Response object)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @returns 是否需要浏览器模式 (Whether browser mode is needed)
 */
function responseRequiresBrowser(response: any, debug: boolean = false): boolean {
  if (response.isError) {
    const errorText = response.content[0].text.toLowerCase();
    
    if (debug) {
      log('fetcher.fetchError', debug, { url: '', error: response.content[0].text });
      
      // 尝试从错误信息中提取HTTP状态码 (Try to extract HTTP status code from error message)
      const statusCodeMatch = response.content[0].text.match(/(\b[45]\d\d\b)/);
      if (statusCodeMatch) {
        log('client.statusCodeDetected', debug, { code: statusCodeMatch[0] });
      }
      
      // 尝试解析更详细的错误原因
      if (errorText.includes('403') || errorText.includes('forbidden')) {
        log('errors.forbidden', debug);
      } else if (errorText.includes('cloudflare')) {
        log('errors.cloudflareProtection', debug);
      } else if (errorText.includes('captcha')) {
        log('errors.captchaRequired', debug);
      } else if (errorText.includes('timeout')) {
        log('errors.timeout', debug, { timeout: '' });
      } else if (errorText.includes('socket') || errorText.includes('econnrefused')) {
        log('errors.connectionProblem', debug);
      }
    }
    
    return errorText.includes('403') || 
           errorText.includes('forbidden') ||
           errorText.includes('access denied') ||
           errorText.includes('cloudflare') ||
           errorText.includes('captcha') ||
           errorText.includes('javascript required') ||
           errorText.includes('timeout') ||
           errorText.includes('connect timeout') ||
           errorText.includes('socket') ||
           errorText.includes('econnrefused') ||
           errorText.includes('und_err_connect_timeout') ||
           errorText.includes('fetch failed');
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
  log('client.startingServer', debug, { path: serverPath });
  
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
    log('client.fetchingUrl', debug, { url });
    
    // 如果启用了自动检测模式（默认启用） (If auto-detect mode is enabled (enabled by default))
    if (params.autoDetectMode !== false) {
      // 首先尝试使用标准模式 (First try using standard mode)
      log('client.usingMode', debug, { mode: params.useBrowser ? 'browser' : 'standard', url });
      const result = await client.callTool({
        name: method,
        arguments: params
      });
      
      // 在调试模式下打印响应结果的摘要 (Print response result summary in debug mode)
      if (debug) {
        if (result.isError) {
          log('client.fetchFailed', debug, { error: result.content[0].text.substring(0, 150) + (result.content[0].text.length > 150 ? '...' : '') });
        } else {
          const contentLength = result.content[0].text.length;
          log('client.fetchSuccess', debug, { length: contentLength });
        }
      }
      
      // 如果失败并且响应表明需要浏览器模式，且当前不是浏览器模式 (If failed and response indicates browser mode is needed, and current mode is not browser mode)
      if (!params.useBrowser && responseRequiresBrowser(result, debug)) {
        log('client.browserModeNeeded', debug, { url });
        // 切换到浏览器模式重试 (Switch to browser mode and retry)
        params.useBrowser = true;
        // 设置关闭浏览器选项，确保资源被释放 (Set close browser option to ensure resources are released)
        params.closeBrowser = true;
        log('client.retryingWithBrowser', debug, { url });
        const browserResult = await client.callTool({
          name: method,
          arguments: params
        });
        
        // 在调试模式下打印浏览器模式的响应结果摘要 (Print browser mode response result summary in debug mode)
        if (debug) {
          if (browserResult.isError) {
            log('client.browserModeFetchFailed', debug, { error: browserResult.content[0].text.substring(0, 150) + (browserResult.content[0].text.length > 150 ? '...' : '') });
          } else {
            const contentLength = browserResult.content[0].text.length;
            log('client.browserModeFetchSuccess', debug, { length: contentLength });
          }
        }
        
        return browserResult;
      }
      
      return result;
    } else {
      // 不启用自动检测，直接使用指定模式
      log('client.usingMode', debug, { mode: params.useBrowser ? 'browser' : 'standard', url });
      // 如果使用浏览器模式，设置关闭浏览器选项
      if (params.useBrowser) {
        params.closeBrowser = true;
      }
      const result = await client.callTool({
        name: method,
        arguments: params
      });
      
      // 在调试模式下打印响应结果的摘要
      if (debug) {
        if (result.isError) {
          log('client.fetchFailed', debug, { error: result.content[0].text.substring(0, 150) + (result.content[0].text.length > 150 ? '...' : '') });
        } else {
          const contentLength = result.content[0].text.length;
          log('client.fetchSuccess', debug, { length: contentLength });
        }
      }
      
      return result;
    }
  } finally {
    // 关闭客户端连接 (Close client connection)
    await client.close();
    log('client.serverClosed', debug);
  }
}

/**
 * 主函数 (Main function)
 * 处理命令行参数并执行相应操作 (Process command line arguments and perform corresponding operations)
 */
async function main() {
  // 检查命令行参数 (Check command line arguments)
  if (process.argv.length < 4) {
    log('client.usageInfo', true);
    log('client.exampleUsage', true);
    process.exit(1);
  }

  const method = process.argv[2];
  let paramsJson = process.argv[3];
  let params: RequestPayload;

  try {
    params = JSON.parse(paramsJson);
  } catch (error) {
    log('client.invalidJson', true);
    process.exit(1);
  }

  const debug = params.debug === true;

  // 检查是否提供了代理参数 (Check if proxy parameter is provided)
  const proxyArg = process.argv[4];
  if (proxyArg) {
    if (proxyArg.startsWith('http://') || proxyArg.startsWith('https://')) {
      log('client.usingCommandLineProxy', debug, { proxy: proxyArg });
      params.proxy = proxyArg;
    } else {
      log('client.invalidProxyFormat', debug, { proxy: proxyArg });
    }
  }

  // 如果没有设置代理但启用了系统代理检测 (If no proxy is set but system proxy detection is enabled)
  if (!params.proxy && params.useSystemProxy !== false) {
    // 尝试从环境变量获取代理 (Try to get proxy from environment variables)
    const envProxy = process.env.HTTP_PROXY || process.env.http_proxy || 
                    process.env.HTTPS_PROXY || process.env.https_proxy;
    
    if (envProxy) {
      log('client.usingEnvProxy', debug, { proxy: envProxy });
      params.proxy = envProxy;
    } else {
      // 尝试从shell获取代理设置 (Try to get proxy settings from shell)
      try {
        const shellProxy = execSync('git config --global http.proxy || git config --global https.proxy || echo ""').toString().trim();
        if (shellProxy) {
          log('client.usingShellProxy', debug, { proxy: shellProxy });
          params.proxy = shellProxy;
        } else {
          log('client.noShellProxy', debug);
        }
      } catch (error) {
        // 忽略错误 (Ignore errors)
      }
    }
  } else if (params.useSystemProxy === false) {
    log('client.systemProxyDisabled', debug);
  }

  // 如果已经设置了代理，禁用系统代理自动检测 (If proxy is already set, disable system proxy auto-detection)
  if (params.proxy) {
    log('client.proxySet', debug, { proxy: params.proxy });
    params.useSystemProxy = false;
  }

  try {
    // 执行请求 (Execute request)
    const result = await smartFetch({ ...params, method });
    // 使用process.stdout.write输出结果，这是实际的结果输出，不是日志
    // (Use process.stdout.write to output the result, this is the actual result output, not a log)
    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (error: any) {
    log('client.requestFailed', debug, { error: error.message });
    process.exit(1);
  }
}

// 捕获未处理的异常 (Catch unhandled exceptions)
process.on('uncaughtException', (error) => {
  log('client.fatalError', true, { error: error.toString() });
  process.exit(1);
});

// 执行主函数 (Execute main function)
main(); 