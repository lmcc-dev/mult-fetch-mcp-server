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
import fs from 'fs';
import os from 'os';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 临时文件路径，用于存储分段信息 (Temporary file path for storing chunk information)
const CHUNK_INFO_FILE = path.join(os.tmpdir(), 'fetch-mcp-chunk-info.json');

/**
 * 分段信息接口 (Chunk information interface)
 */
interface ChunkInfo {
  method: string;
  url: string;
  chunkId: string;
  currentChunk: number;
  totalChunks: number;
  params: RequestPayload;
}

// 添加最大分块数限制，默认为10 (Add maximum chunk limit, default is 10)
const DEFAULT_MAX_CHUNKS = 10;

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
    
    // 检查是否包含 HTTP 403 Forbidden 错误，这是最常见的需要切换到浏览器模式的情况
    if (errorText.includes('403') || 
        errorText.toLowerCase().includes('forbidden')) {
      return true;
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
 * 保存分段信息到临时文件 (Save chunk information to temporary file)
 * @param result 获取结果 (Fetch result)
 * @param params 请求参数 (Request parameters)
 * @param debug 是否为调试模式 (Whether in debug mode)
 */
function saveChunkInfo(result: any, params: RequestPayload, debug: boolean = false): void {
  if (result.isChunked && result.hasMoreChunks) {
    try {
      const chunkInfo: ChunkInfo = {
        method: params.method || '',
        url: params.url,
        chunkId: result.chunkId,
        currentChunk: result.currentChunk,
        totalChunks: result.totalChunks,
        params: { ...params }
      };
      
      fs.writeFileSync(CHUNK_INFO_FILE, JSON.stringify(chunkInfo, null, 2));
      
      if (debug) {
        log('client.chunkInfoSaved', debug, { 
          file: CHUNK_INFO_FILE,
          current: result.currentChunk,
          total: result.totalChunks
        }, COMPONENTS.CLIENT);
      }
    } catch (error) {
      if (debug) {
        log('client.chunkInfoSaveError', debug, { error: String(error) }, COMPONENTS.CLIENT);
      }
    }
  }
}

/**
 * 加载分段信息从临时文件 (Load chunk information from temporary file)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @returns 分段信息 (Chunk information)
 */
function loadChunkInfo(debug: boolean = false): ChunkInfo | null {
  try {
    if (fs.existsSync(CHUNK_INFO_FILE)) {
      const chunkInfoStr = fs.readFileSync(CHUNK_INFO_FILE, 'utf8');
      const chunkInfo = JSON.parse(chunkInfoStr) as ChunkInfo;
      
      if (debug) {
        log('client.chunkInfoLoaded', debug, { 
          file: CHUNK_INFO_FILE,
          current: chunkInfo.currentChunk,
          total: chunkInfo.totalChunks
        }, COMPONENTS.CLIENT);
      }
      
      return chunkInfo;
    }
  } catch (error) {
    if (debug) {
      log('client.chunkInfoLoadError', debug, { error: String(error) }, COMPONENTS.CLIENT);
    }
  }
  
  return null;
}

/**
 * 从响应内容中解析分段信息 (Parse chunk information from response content)
 * @param result 响应结果 (Response result)
 * @returns 包含分段信息的结果 (Result with chunk information)
 */
function parseChunkInfo(result: any): any {
  if (result.isError || !result.content || !result.content[0] || !result.content[0].text) {
    return result;
  }
  
  const content = result.content[0].text;
  const chunkIdMatch = content.match(/chunkId="([^"]+)"/);
  const totalChunksMatch = content.match(/Part \d+ of (\d+)/);
  
  if (!chunkIdMatch) {
    return result;
  }
  
  const chunkId = chunkIdMatch[1];
  const currentChunk = 0; // 第一段的索引为0
  const totalChunks = totalChunksMatch ? parseInt(totalChunksMatch[1], 10) : 1;
  const hasMoreChunks = totalChunks > 1;
  
  return {
    ...result,
    isChunked: hasMoreChunks,
    hasMoreChunks,
    chunkId,
    currentChunk,
    totalChunks
  };
}

/**
 * 智能获取函数 (Smart fetch function)
 * 根据参数执行相应的获取操作 (Perform fetch operation based on parameters)
 */
async function smartFetch(params: RequestPayload & { method?: string }, client: Client): Promise<any> {
  // 不再从params中解构出debug，保留在rest中传递给MCP
  const { method, ...rest } = params;
  const debug = params.debug === true;
  
  // 检查是否提供了方法 (Check if method is provided)
  if (!method) {
    throw new Error('Method is required');
  }
  
  // 检查是否提供了URL (Check if URL is provided)
  if (method.includes('fetch_') && !rest.url) {
    throw new Error('URL is required for fetch methods');
  }
  
  // 记录获取URL (Log fetch URL)
  if (rest.url) {
    log('client.fetchingUrl', debug, { url: rest.url }, COMPONENTS.CLIENT);
  }
  
  // 检查是否需要使用浏览器模式 (Check if browser mode is needed)
  const useBrowser = rest.useBrowser === true;
  
  // 记录使用的模式 (Log mode used)
  if (useBrowser) {
    log('client.usingBrowserMode', debug, {}, COMPONENTS.CLIENT);
  } else {
    log('client.usingStandardMode', debug, {}, COMPONENTS.CLIENT);
  }
  
  // 在debug模式下输出发送给MCP的参数 (Output parameters sent to MCP in debug mode)
  if (debug) {
    log('client.sendingParameters', debug, { params: JSON.stringify(rest) }, COMPONENTS.CLIENT);
  }
  
  // 执行获取操作 (Perform fetch operation)
  // 注意：rest中包含debug参数，会被传递给MCP (Note: rest contains debug parameter, which will be passed to MCP)
  const result = await client.callTool({
    name: method,
    arguments: rest
  });
  
  // 检查是否需要使用浏览器模式 (Check if browser mode is needed)
  if (responseRequiresBrowser(result) && !useBrowser && rest.autoDetectMode !== false) {
    log('client.switchingToBrowserMode', debug, {}, COMPONENTS.CLIENT);
    
    // 使用浏览器模式重新获取 (Retry with browser mode)
    return smartFetch({
      ...params,
      useBrowser: true
    }, client);
  }
  
  // 记录获取成功 (Log fetch success)
  if (!result.isError) {
    log('client.fetchSuccessful', debug, {}, COMPONENTS.CLIENT);
  } else {
    // 记录获取失败 (Log fetch failure)
    log('client.fetchFailed', true, { error: result.content[0].text }, COMPONENTS.CLIENT);
  }
  
  return result;
}

/**
 * 主函数 (Main function)
 * 处理命令行参数并执行相应操作 (Process command line arguments and perform corresponding operations)
 */
async function main() {
  // 检查是否请求所有分段内容 (Check if requesting all chunks)
  const allChunksFlag = process.argv.includes('--all-chunks');
  let method: string;
  let params: RequestPayload;
  
  // 获取最大分块数限制 (Get maximum chunk limit)
  let maxChunks = DEFAULT_MAX_CHUNKS;
  const maxChunksArg = process.argv.find(arg => arg.startsWith('--max-chunks='));
  if (maxChunksArg) {
    const maxChunksValue = maxChunksArg.split('=')[1];
    if (maxChunksValue && !isNaN(parseInt(maxChunksValue))) {
      maxChunks = parseInt(maxChunksValue);
    }
  }
  
  // 检查命令行参数 (Check command line arguments)
  if (process.argv.length < 4) {
    log('client.usageInfo', true, { info: 'node src/client.js <method> <params_json> [--debug] [--all-chunks] [--max-chunks=N]' }, COMPONENTS.CLIENT);
    log('client.exampleUsage', true, { example: 'node src/client.js fetch_html {"url":"https://example.com"}' }, COMPONENTS.CLIENT);
    log('client.chunkUsageInfo', true, {}, COMPONENTS.CLIENT);
    log('client.allChunksUsageInfo', true, {}, COMPONENTS.CLIENT);
    log('client.maxChunksUsageInfo', true, { default: DEFAULT_MAX_CHUNKS }, COMPONENTS.CLIENT);
    process.exit(1);
  }

  method = process.argv[2];
  let paramsJson = process.argv[3];

  try {
    params = JSON.parse(paramsJson);
  } catch (e) {
    log('client.invalidJson', true, { error: String(e) }, COMPONENTS.CLIENT);
    process.exit(1);
  }

  const debug = params.debug === true || process.argv.includes('--debug');
  
  // 检查是否提供了代理参数 (Check if proxy parameter is provided)
  const proxyArg = process.argv[4];
  if (proxyArg && !proxyArg.startsWith('--')) {
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
    // 执行获取操作 (Perform fetch operation)
    const initialParams = {
      ...params,
      debug: debug,
      method
    };
    
    // 获取第一段内容 (Fetch first chunk)
    let result = await smartFetch(initialParams, client);
    
    // 调试输出，查看响应结构 (Debug output, check response structure)
    if (debug) {
      console.log('\n--- 响应结构 (Response structure) ---');
      console.log(JSON.stringify(result, null, 2));
      console.log('--- 响应结构结束 (End of response structure) ---\n');
    }
    
    // 从响应内容中解析分段信息 (Parse chunk information from response content)
    let chunkId: string | undefined;
    let currentChunk = 0;
    let totalChunks = 1;
    let hasMoreChunks = false;
    
    if (result.content && result.content[0] && result.content[0].text) {
      const content = result.content[0].text;
      // 更新正则表达式以匹配系统提示中的分段信息
      // Update regex to match chunk information in system notes
      const chunkIdMatch = content.match(/chunkId="([^"]+)"/);
      const partMatch = content.match(/This is part (\d+) of (\d+)/);
      
      if (chunkIdMatch) {
        chunkId = chunkIdMatch[1];
        if (partMatch) {
          currentChunk = parseInt(partMatch[1], 10) - 1; // 转换为0索引 (Convert to 0-based index)
          totalChunks = parseInt(partMatch[2], 10);
          hasMoreChunks = currentChunk < totalChunks - 1;
        }
        
        // 调试输出，查看解析后的分段信息 (Debug output, check parsed chunk information)
        if (debug) {
          console.log('\n--- 解析后的分段信息 (Parsed chunk information) ---');
          console.log('chunkId:', chunkId);
          console.log('currentChunk:', currentChunk);
          console.log('totalChunks:', totalChunks);
          console.log('hasMoreChunks:', hasMoreChunks);
          console.log('--- 解析后的分段信息结束 (End of parsed chunk information) ---\n');
        }
      }
    }
    
    // 输出第一段内容 (Output first chunk)
    process.stdout.write(JSON.stringify(result, null, 2));
    
    // 如果启用了获取所有分段内容，并且结果包含分段信息 (If all chunks mode is enabled and result contains chunk information)
    if (allChunksFlag && hasMoreChunks && chunkId) {
      // 计算实际要获取的分块数量 (Calculate actual number of chunks to fetch)
      const actualChunksToFetch = Math.min(totalChunks - 1, maxChunks);
      
      log('client.fetchingAllChunks', debug, { total: totalChunks, fetching: actualChunksToFetch }, COMPONENTS.CLIENT);
      
      if (actualChunksToFetch < totalChunks - 1) {
        log('client.limitingChunks', debug, { limit: maxChunks, total: totalChunks }, COMPONENTS.CLIENT);
        console.log(`\n注意：内容共有 ${totalChunks} 段，但只获取前 ${maxChunks + 1} 段 (Note: Content has ${totalChunks} chunks, but only fetching first ${maxChunks + 1} chunks)`);
        console.log(`要获取更多分段，请使用 --max-chunks=N 参数 (To fetch more chunks, use --max-chunks=N parameter)\n`);
      }
      
      // 不再创建数组存储所有分段内容，而是获取后立即输出
      // No longer create an array to store all chunks, output immediately after fetching
      
      // 获取剩余的分段内容 (Fetch remaining chunks)
      for (let i = 1; i <= actualChunksToFetch; i++) {
        log('client.fetchingChunk', debug, { index: i, total: totalChunks }, COMPONENTS.CLIENT);
        
        // 输出正在获取的提示信息 (Output fetching prompt)
        console.log(`\n正在获取第 ${i+1}/${totalChunks} 段内容... (Fetching chunk ${i+1}/${totalChunks}...)`);
        
        // 准备获取下一段内容的参数 (Prepare parameters for fetching next chunk)
        const nextChunkParams = {
          ...params,
          debug: debug,
          method,
          chunkId: chunkId,
          chunkIndex: i,
          closeBrowser: false // 获取后续分段时强制设置为false，避免重复关闭浏览器
        };
        
        // 获取下一段内容 (Fetch next chunk)
        const nextChunkResult = await smartFetch(nextChunkParams, client);
        
        // 如果获取失败，输出错误信息并退出 (If fetch fails, output error message and exit)
        if (nextChunkResult.isError) {
          log('client.fetchChunkFailed', debug, { index: i, error: nextChunkResult.content[0].text }, COMPONENTS.CLIENT);
          console.log(`\n获取第 ${i+1} 段内容失败: ${nextChunkResult.content[0].text}\n`);
          break;
        }
        
        // 立即输出分段内容 (Output chunk immediately)
        console.log(`\n--- 第 ${i+1} 段内容 (Chunk ${i+1}) ---\n`);
        process.stdout.write(JSON.stringify(nextChunkResult, null, 2));
        
        // 输出分隔线，使输出更清晰 (Output separator for clarity)
        console.log('\n' + '-'.repeat(80));
      }
      
      // 输出所有分段内容获取完成的信息 (Output all chunks fetched message)
      const fetchedChunks = Math.min(totalChunks, maxChunks + 1);
      log('client.allChunksFetched', debug, { fetched: fetchedChunks, total: totalChunks }, COMPONENTS.CLIENT);
      
      if (fetchedChunks < totalChunks) {
        console.log(`\n已获取 ${fetchedChunks}/${totalChunks} 段内容 (Fetched ${fetchedChunks}/${totalChunks} chunks)\n`);
      } else {
        console.log(`\n所有分段内容获取完成，共 ${totalChunks} 段 (All chunks fetched, total: ${totalChunks})\n`);
      }
    } 
    // 如果结果包含分段信息，但没有启用获取所有分段内容 (If result contains chunk information but all chunks mode is not enabled)
    else if (hasMoreChunks && chunkId) {
      log('client.hasMoreChunks', debug, { 
        current: currentChunk,
        total: totalChunks
      }, COMPONENTS.CLIENT);
      
      // 提示用户如何获取所有分段内容 (Prompt user how to get all chunks)
      const allChunksCommand = `node dist/src/client.js ${method} '${paramsJson}' ${debug ? '--debug' : ''} --all-chunks`;
      const allChunksWithLimitCommand = `node dist/src/client.js ${method} '${paramsJson}' ${debug ? '--debug' : ''} --all-chunks --max-chunks=${maxChunks}`;
      
      log('client.allChunksCommand', debug, { command: allChunksCommand }, COMPONENTS.CLIENT);
      
      // 输出提示信息，告知用户有更多分段内容 (Output prompt message, inform user there are more chunks)
      console.log(`\n内容已分段: ${currentChunk+1}/${totalChunks} 段 (Content is chunked: ${currentChunk+1}/${totalChunks} chunks)`);
      console.log(`获取所有分段内容，请运行: (To fetch all chunks, run:)\n${allChunksCommand}\n`);
      
      if (totalChunks > maxChunks + 1) {
        console.log(`获取前 ${maxChunks + 1} 段内容，请运行: (To fetch first ${maxChunks + 1} chunks, run:)\n${allChunksWithLimitCommand}\n`);
      }
    }
  } catch (error: any) {
    // 处理错误 (Handle error)
    log('client.fatalError', true, { error: String(error) }, COMPONENTS.CLIENT);
    
    // 返回标准错误结构体 (Return standard error structure)
    const errorResult = {
      isError: true,
      content: [
        {
          type: "text",
          text: `Fatal error: ${String(error)}`
        }
      ]
    };
    
    process.stdout.write(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  } finally {
    // 关闭客户端连接 (Close client connection)
    log('client.serverClosed', debug, {}, COMPONENTS.CLIENT);
    await client.close();
  }
}

// 捕获未处理的异常 (Catch unhandled exceptions)
process.on('uncaughtException', (error) => {
  log('client.fatalError', true, { error: error.toString() }, COMPONENTS.CLIENT);
  process.exit(1);
});

// 执行主函数 (Execute main function)
main(); 