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
import { ContentSizeManager } from './lib/utils/ContentSizeManager.js';

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
  // 添加字节级分块相关字段 (Add byte-level chunking related fields)
  startCursor?: number;
  fetchedBytes?: number;
  totalBytes?: number;
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
function _saveChunkInfo(result: any, params: RequestPayload, debug: boolean = false): void {
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
    } catch (_error) {
      if (debug) {
        log('client.chunkInfoSaveError', debug, { error: String(_error) }, COMPONENTS.CLIENT);
      }
    }
  }
}

/**
 * 加载分段信息从临时文件 (Load chunk information from temporary file)
 * @param debug 是否为调试模式 (Whether in debug mode)
 * @returns 分段信息 (Chunk information)
 */
function _loadChunkInfo(debug: boolean = false): ChunkInfo | null {
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
  } catch (_error) {
    if (debug) {
      log('client.chunkInfoLoadError', debug, { error: String(_error) }, COMPONENTS.CLIENT);
    }
  }

  return null;
}

/**
 * 从响应内容中解析分段信息 (Parse chunk information from response content)
 * @param result 响应结果 (Response result)
 * @returns 包含分段信息的结果 (Result with chunk information)
 */
function _parseChunkInfo(result: any): any {
  if (result.isError || !result.content || !result.content[0] || !result.content[0].text) {
    return result;
  }

  const content = result.content[0].text;

  // 首先检查API直接返回的isLastChunk标识
  const isLastChunk = result.isLastChunk === true;

  // 支持多种分块ID匹配模式 (Support multiple chunking ID matching patterns)
  const systemNoteMatch = content.match(/=== SYSTEM NOTE ===\s*([\s\S]*?)\s*={19}/);
  const chunkIdMatch = systemNoteMatch ?
    systemNoteMatch[1].match(/chunkId(?:=|\s*[:=]\s*|\s*)?["']?([^"',\s]+)["']?/i) :
    content.match(/chunkId="([^"]+)"/);

  // 如果没有找到分块ID，返回原始结果 (If no chunk ID found, return original result)
  if (!chunkIdMatch) {
    return result;
  }

  const chunkId = chunkIdMatch[1];
  let currentChunk = 0;
  let totalChunks = 1;
  let hasMoreChunks = false;
  let fetchedBytes = 0;
  let totalBytes = 0;
  let remainingBytes = 0;

  // 查找字节级分块信息 (Look for byte-level chunking information)
  const byteInfoMatch = systemNoteMatch ?
    systemNoteMatch[1].match(/(\d+(?:,\d+)*)\s*bytes\s*(?:retrieved|fetched).*?(\d+)%\s*of\s*(?:the\s*)?total\s*(\d+(?:,\d+)*)\s*bytes/) :
    content.match(/retrieved ([,\d]+) bytes \((\d+)% of total ([,\d]+) bytes\)/);

  const remainingBytesMatch = systemNoteMatch ?
    systemNoteMatch[1].match(/(\d+(?:,\d+)*)\s*bytes\s*(?:are\s*)?remaining/) :
    content.match(/([,\d]+) bytes remaining/);

  // 查找旧版分块信息 (Look for old version chunking information)
  const partMatch = systemNoteMatch ?
    systemNoteMatch[1].match(/This is part (\d+) of (\d+)/) :
    content.match(/This is part (\d+) of (\d+)/);

  // 检查是否有"最后一部分"的提示 (Check if there's a "last part" hint)
  const lastPartMatch = systemNoteMatch ?
    systemNoteMatch[1].match(/(?:this|the) (?:is|last|final) (?:the|last|final)? part/i) :
    content.match(/(?:this|the) (?:is|last|final) (?:the|last|final)? part/i);

  // 如果有直接指示这是最后一部分的消息，设置isLastChunk为true (If there's a message directly indicating this is the last part, set isLastChunk to true)
  const contentIndicatesLastChunk = !!lastPartMatch || content.includes("No further requests needed");

  // 检查是否包含字节级分块信息 (Check if contains byte-level chunking info)
  if (byteInfoMatch) {
    // 移除千位分隔符逗号 (Remove thousands separator commas)
    fetchedBytes = parseInt(byteInfoMatch[1].replace(/,/g, ''), 10);
    const _percentage = parseInt(byteInfoMatch[2], 10);
    totalBytes = parseInt(byteInfoMatch[3].replace(/,/g, ''), 10);

    if (remainingBytesMatch) {
      remainingBytes = parseInt(remainingBytesMatch[1].replace(/,/g, ''), 10);
    } else {
      remainingBytes = totalBytes - fetchedBytes;
    }

    // 如果有明确的isLastChunk标识或内容中有指示，或者剩余字节为0，表示没有更多分块
    hasMoreChunks = !(isLastChunk || contentIndicatesLastChunk || remainingBytes <= 0);

    // 估算总分块数 (Estimate total chunks)
    if (fetchedBytes > 0) {
      // 估算总块数，基于已获取的字节数 (Estimate total chunks based on fetched bytes)
      totalChunks = Math.ceil(totalBytes / fetchedBytes);
      // 当前是第几块 (Current chunk number)
      currentChunk = Math.floor(fetchedBytes / (totalBytes / totalChunks));
    }
  }
  // 如果没有字节级信息，使用旧的部分匹配 (If no byte-level info, use old part matching)
  else if (partMatch) {
    currentChunk = parseInt(partMatch[1], 10) - 1; // 转换为0索引 (Convert to 0-based index)
    totalChunks = parseInt(partMatch[2], 10);
    // 如果有明确的isLastChunk标识或内容中有指示，或者当前是最后一块，表示没有更多分块
    hasMoreChunks = !(isLastChunk || contentIndicatesLastChunk || currentChunk >= totalChunks - 1);
  }

  return {
    ...result,
    isChunked: hasMoreChunks,
    hasMoreChunks,
    chunkId,
    currentChunk,
    totalChunks,
    fetchedBytes,
    totalBytes,
    remainingBytes,
    // 合并所有最后分块的判断条件
    isLastChunk: isLastChunk || contentIndicatesLastChunk || remainingBytes <= 0 || (partMatch && currentChunk >= totalChunks - 1)
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

  // 获取方法 (Get method)
  if (process.argv.length < 3) {
    log('client.usageInfo', true, { info: 'node src/client.js <method> <params_json> [--debug] [--all-chunks] [--max-chunks=N]' }, COMPONENTS.CLIENT);
    log('client.exampleUsage', true, { example: 'node src/client.js fetch_html {"url":"https://example.com"}' }, COMPONENTS.CLIENT);
    log('client.chunkUsageInfo', true, {}, COMPONENTS.CLIENT);
    log('client.allChunksUsageInfo', true, {}, COMPONENTS.CLIENT);
    log('client.maxChunksUsageInfo', true, { default: DEFAULT_MAX_CHUNKS }, COMPONENTS.CLIENT);
    log('client.alternateUsageInfo', true, { example: 'node src/client.js fetch_html --url=https://example.com --startCursor=0' }, COMPONENTS.CLIENT);
    process.exit(1);
  }

  const method = process.argv[2];
  let params: RequestPayload = {};
  let paramsJson = "{}";

  // 获取最大分块数限制 (Get maximum chunk limit)
  let maxChunks = DEFAULT_MAX_CHUNKS;
  const maxChunksArg = process.argv.find(arg => arg.startsWith('--max-chunks='));
  if (maxChunksArg) {
    const maxChunksValue = maxChunksArg.split('=')[1];
    if (maxChunksValue && !isNaN(parseInt(maxChunksValue))) {
      maxChunks = parseInt(maxChunksValue);
    }
  }

  // 解析命令行参数 (Parse command line arguments)
  const thirdArg = process.argv[3];
  const isJsonParams = thirdArg && thirdArg.startsWith('{') && thirdArg.endsWith('}');

  if (isJsonParams) {
    // JSON 格式参数 (JSON format parameters)
    paramsJson = thirdArg;
    try {
      params = JSON.parse(paramsJson);
    } catch (_error) {
      log('client.invalidJson', true, { error: String(_error) }, COMPONENTS.CLIENT);
      process.exit(1);
    }
  } else {
    // 命令行参数格式 (Command line argument format)
    // 收集所有 --key=value 格式的参数
    const argParams = process.argv.slice(3).filter(arg => arg.startsWith('--') && arg.includes('='));

    // 创建参数对象 (Create parameter object)
    for (const arg of argParams) {
      if (arg === '--debug' || arg === '--all-chunks' || arg.startsWith('--max-chunks=')) {
        continue; // 这些是特殊标志，不是参数 (These are special flags, not parameters)
      }

      const [key, value] = arg.substring(2).split('=');
      if (key && value !== undefined) {
        // 尝试将可能的数字和布尔值转换为实际类型 (Try to convert possible numbers and booleans to actual types)
        if (value === 'true') {
          params[key] = true;
        } else if (value === 'false') {
          params[key] = false;
        } else if (!isNaN(Number(value)) && value.trim() !== '') {
          params[key] = Number(value);
        } else {
          params[key] = value;
        }
      }
    }

    // 转换为 JSON 字符串以便在日志等地方使用 (Convert to JSON string for use in logs, etc.)
    paramsJson = JSON.stringify(params);
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
          } catch (_error) {
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
          } catch (_error) {
            // 忽略错误 (Ignore errors)
          }
        }

        if (proxyUrl) {
          log('client.usingSystemProxy', debug, { proxy: proxyUrl }, COMPONENTS.CLIENT);
          params.proxy = proxyUrl;
        } else {
          log('client.noSystemProxy', debug, {}, COMPONENTS.CLIENT);
        }
      } catch (_error) {
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
    const result = await smartFetch(initialParams, client);

    // 调试输出，查看响应结构 (Debug output, check response structure)
    if (debug) {
      log('client.responseStructure', debug, { structure: JSON.stringify(result, null, 2) }, COMPONENTS.CLIENT);
    }

    // 从响应内容中解析分段信息 (Parse chunk information from response content)
    let hasMoreChunks = false;
    let chunkId = '';
    let totalChunks = 1;
    let currentChunk = 0;

    // 检查是否有明确的最后分块标识
    const isLastChunk = result.isLastChunk === true;

    // 解析响应内容中的分段信息 (Parse chunk information from response content)
    if (result.content && result.content[0] && result.content[0].text) {
      const content = result.content[0].text;
      const chunkIdMatch = content.match(/chunkId="([^"]+)"/);
      const startCursorMatch = content.match(/startCursor=(\d+)/);
      const bytesRetrievedMatch = content.match(/retrieved ([,\d]+) bytes \((\d+)% of total ([,\d]+) bytes\)/);
      const remainingBytesMatch = content.match(/([,\d]+) bytes remaining/);
      const moreRequestsMatch = content.match(/approximately (\d+) more requests needed/);
      const partMatch = content.match(/This is part (\d+) of (\d+)/);

      // 如果找到了分块ID匹配 (If chunk ID match found)
      if (chunkIdMatch) {
        chunkId = chunkIdMatch[1];

        // 判断是否有字节级分块信息 (Check if there's byte-level chunking info)
        if (bytesRetrievedMatch) {
          // 移除数字中的逗号 (Remove commas from numbers)
          const fetchedBytesStr = bytesRetrievedMatch[1].replace(/,/g, '');
          const totalBytesStr = bytesRetrievedMatch[3].replace(/,/g, '');

          const fetchedBytes = parseInt(fetchedBytesStr, 10);
          const _percentage = parseInt(bytesRetrievedMatch[2], 10);
          const totalBytes = parseInt(totalBytesStr, 10);

          let remainingBytes = 0;
          if (remainingBytesMatch) {
            remainingBytes = parseInt(remainingBytesMatch[1].replace(/,/g, ''), 10);
          } else {
            remainingBytes = totalBytes - fetchedBytes;
          }

          // 如果使用isLastChunk标识，优先使用它；否则基于remainingBytes计算
          hasMoreChunks = isLastChunk ? false : remainingBytes > 0;

          // 估算剩余的请求次数 (Estimate remaining requests)
          let estimatedRemainingRequests = 0;
          if (moreRequestsMatch) {
            estimatedRemainingRequests = parseInt(moreRequestsMatch[1], 10);
          } else if (fetchedBytes > 0) {
            // 基于当前获取的字节数估算 (Estimate based on current fetched bytes)
            estimatedRemainingRequests = Math.ceil(remainingBytes / fetchedBytes);
          }

          // 估算总分块数 (Estimate total chunks)
          totalChunks = 1 + estimatedRemainingRequests;
          currentChunk = 0; // 当前是第一块 (Current is the first chunk)

          // 将字节信息添加到结果中 (Add byte information to result)
          result.fetchedBytes = fetchedBytes;
          result.totalBytes = totalBytes;
          result.remainingBytes = remainingBytes;
          // 如果服务器返回了isLastChunk属性，使用它；否则基于remainingBytes计算
          result.isLastChunk = isLastChunk || remainingBytes <= 0;
          result.hasMoreChunks = hasMoreChunks;
        }
        // 如果没有字节级信息，则使用分块匹配 (If no byte-level info, use chunk matching)
        else if (partMatch) {
          currentChunk = parseInt(partMatch[1], 10) - 1;
          totalChunks = parseInt(partMatch[2], 10);
          hasMoreChunks = isLastChunk ? false : currentChunk < totalChunks - 1;
        }
        // 如果有启动游标信息，这表明还有更多分块 (If start cursor info exists, indicates more chunks)
        else if (startCursorMatch) {
          hasMoreChunks = !isLastChunk && true;
        }

        // 使用解析出的分段信息 (Use parsed chunk information)
        result.isChunked = hasMoreChunks;
        result.hasMoreChunks = hasMoreChunks;
        result.chunkId = chunkId;
        result.currentChunk = currentChunk;
        result.totalChunks = totalChunks;

        // 保存分段信息到临时文件 (Save chunk information to temporary file)
        _saveChunkInfo(result, params, debug);
      }
    }

    // 调试输出，查看解析后的分段信息 (Debug output, check parsed chunk information)
    if (debug) {
      log('client.chunkInfoParsed', debug, {
        isChunked: result.isChunked,
        hasMoreChunks,
        isLastChunk,
        chunkId,
        currentChunk,
        totalChunks,
        fetchedBytes: result.fetchedBytes,
        totalBytes: result.totalBytes,
        remainingBytes: result.remainingBytes
      }, COMPONENTS.CLIENT);
    }

    // 输出结果 (Output result)
    console.log(JSON.stringify(result, null, 2));

    // 如果启用了获取所有分段内容，并且结果包含分段信息 (If all chunks mode is enabled and result contains chunk information)
    if (allChunksFlag && hasMoreChunks && chunkId && !isLastChunk) {
      try {
        // 确保totalChunks的计算正确 (Ensure totalChunks calculation is correct)
        if (result.totalBytes && result.fetchedBytes) {
          // 字节级分块：根据总字节数和已获取字节数计算总块数
          // Byte-level chunking: calculate total chunks based on total bytes and fetched bytes
          const contentSizeLimit = params.contentSizeLimit || ContentSizeManager.getDefaultSizeLimit();
          const remainingBytes = result.totalBytes - result.fetchedBytes;
          // 计算剩余需要的块数，加上已获取的第一个块
          // Calculate remaining chunks needed, plus the already fetched first chunk
          totalChunks = Math.ceil(remainingBytes / contentSizeLimit) + 1;

          log('client.recalculatedTotalChunks', debug, {
            totalBytes: result.totalBytes,
            fetchedBytes: result.fetchedBytes,
            remainingBytes: remainingBytes,
            contentSizeLimit: contentSizeLimit,
            totalChunks: totalChunks
          }, COMPONENTS.CLIENT);
        }

        // 计算实际要获取的分块数量 (Calculate actual number of chunks to fetch)
        const actualChunksToFetch = Math.min(totalChunks - 1, maxChunks);

        log('client.fetchingAllChunks', debug, { total: totalChunks, fetching: actualChunksToFetch }, COMPONENTS.CLIENT);

        if (actualChunksToFetch < totalChunks - 1) {
          log('client.limitingChunks', debug, { limit: maxChunks, total: totalChunks }, COMPONENTS.CLIENT);
          log('client.chunkLimitNotice', true, { total: totalChunks, fetching: maxChunks + 1 }, COMPONENTS.CLIENT);
          log('client.chunkLimitHint', true, {}, COMPONENTS.CLIENT);
        }

        // 获取剩余的分段内容 (Fetch remaining chunks)
        let nextStartCursor = result.fetchedBytes || 0;  // 字节级分块的起始位置 (Starting position for byte-level chunking)

        // 立即输出分块分隔符，表示第一个分块已完成 (Output chunk separator immediately to indicate first chunk is complete)
        console.log('\n');  // 添加空行使输出更清晰 (Add empty line for clearer output)
        log('client.chunkSeparator', true, {}, COMPONENTS.CLIENT);
        log('client.firstChunkCompleted', true, { index: 1, total: totalChunks }, COMPONENTS.CLIENT);

        for (let i = 1; i <= actualChunksToFetch; i++) {
          const currentChunkNumber = i + 1; // 当前分块编号（从1开始）

          // 输出正在获取的分块的信息 (Output information about the chunk being fetched)
          log('client.fetchingChunk', debug, { index: i, total: totalChunks }, COMPONENTS.CLIENT);
          log('client.fetchingChunkProgress', true, { current: currentChunkNumber, total: totalChunks }, COMPONENTS.CLIENT);

          // 准备获取下一段内容的参数 (Prepare parameters for fetching next chunk)
          const nextChunkParams = {
            ...params,
            debug: debug,
            method,
            chunkId: chunkId,
            startCursor: nextStartCursor,  // 使用字节级起始位置 (Use byte-level starting position)
            closeBrowser: false // 获取后续分段时强制设置为false，避免重复关闭浏览器
          };

          // 获取下一段内容 (Fetch next chunk)
          const nextChunkResult = await smartFetch(nextChunkParams, client);

          // 如果获取失败，输出错误信息并退出 (If fetch fails, output error message and exit)
          if (nextChunkResult.isError) {
            log('client.fetchChunkFailed', debug, { index: i, error: nextChunkResult.content[0].text }, COMPONENTS.CLIENT);
            log('client.fetchChunkFailedError', true, { index: currentChunkNumber, error: nextChunkResult.content[0].text }, COMPONENTS.CLIENT);
            break;
          }

          // 更新下一段的起始位置 (Update starting position for next chunk)
          if (nextChunkResult.fetchedBytes) {
            // 使用返回的已获取字节数更新起始位置 (Use returned fetched bytes to update starting position)
            nextStartCursor = result.fetchedBytes + nextChunkResult.fetchedBytes;
          } else if (nextChunkResult.content && nextChunkResult.content[0] && nextChunkResult.content[0].text) {
            // 尝试从响应内容中解析起始位置 (Try to parse starting position from response content)
            const content = nextChunkResult.content[0].text;
            const systemNoteMatch = content.match(/=== SYSTEM NOTE ===\s*([\s\S]*?)\s*={19}/);
            if (systemNoteMatch) {
              const startCursorMatch = systemNoteMatch[1].match(/startCursor=(\d+)/);
              if (startCursorMatch) {
                nextStartCursor = parseInt(startCursorMatch[1], 10);
              } else {
                // 如果找不到明确的startCursor值，使用估算值 (If no explicit startCursor value found, use estimated value)
                nextStartCursor += (params.contentSizeLimit || 1000);
              }
            } else {
              // 如果没有字节级信息，则递增索引 (If no byte-level info, increment index)
              nextStartCursor += (params.contentSizeLimit || 1000);
            }
          } else {
            // 如果没有任何信息可用，则递增索引 (If no information available, increment index)
            nextStartCursor += (params.contentSizeLimit || 1000);
          }

          // 立即输出分块完成的信息 (Output chunk completion information immediately)
          log('client.chunkContent', true, { index: currentChunkNumber }, COMPONENTS.CLIENT);

          // 立即输出当前分块内容 (Output current chunk content immediately)
          console.log(JSON.stringify(nextChunkResult, null, 2));

          // 输出分隔符，使每个分块的输出更清晰 (Output separator for clearer distinction between chunks)
          console.log('\n');  // 添加空行使输出更清晰 (Add empty line for clearer output)
          log('client.chunkSeparator', true, {}, COMPONENTS.CLIENT);

          // 输出当前进度信息 (Output current progress information)
          if (nextChunkResult.fetchedBytes && nextChunkResult.totalBytes) {
            const totalFetchedBytes = (result.fetchedBytes || 0) + nextChunkResult.fetchedBytes;
            const percent = Math.floor((totalFetchedBytes / nextChunkResult.totalBytes) * 100);
            log('client.chunkProgress', true, {
              current: currentChunkNumber,
              total: totalChunks,
              fetchedBytes: totalFetchedBytes,
              totalBytes: nextChunkResult.totalBytes,
              percent: percent
            }, COMPONENTS.CLIENT);
          } else {
            log('client.chunkCompleted', true, { current: currentChunkNumber, total: totalChunks }, COMPONENTS.CLIENT);
          }
        }

        // 输出所有分段内容获取完成的信息 (Output all chunks fetched message)
        const fetchedChunks = Math.min(totalChunks, maxChunks + 1);
        log('client.allChunksFetched', debug, { fetched: fetchedChunks, total: totalChunks }, COMPONENTS.CLIENT);

        if (fetchedChunks < totalChunks) {
          log('client.partialChunksFetched', true, { fetched: fetchedChunks, total: totalChunks }, COMPONENTS.CLIENT);
        } else {
          log('client.completeChunksFetched', true, { total: totalChunks }, COMPONENTS.CLIENT);
        }
      } catch (_error) {
        // 处理获取分块内容过程中的错误 (Handle errors during chunk fetching)
        log('client.fetchingChunksError', true, { error: String(_error) }, COMPONENTS.CLIENT);
        log('client.fetchingChunksErrorMessage', true, { error: String(_error) }, COMPONENTS.CLIENT);
      }
    }
    // 如果结果包含分段信息，但没有启用获取所有分段内容 (If result contains chunk information but all chunks mode is not enabled)
    else if (hasMoreChunks && chunkId && !isLastChunk) {
      log('client.hasMoreChunks', debug, {
        current: currentChunk,
        total: totalChunks,
        fetchedBytes: result.fetchedBytes,
        totalBytes: result.totalBytes,
        remainingBytes: result.remainingBytes
      }, COMPONENTS.CLIENT);

      // 提示用户如何获取所有分段内容 (Prompt user how to get all chunks)
      const allChunksCommand = `node dist/src/client.js ${method} '${paramsJson}' ${debug ? '--debug' : ''} --all-chunks`;
      const allChunksWithLimitCommand = `node dist/src/client.js ${method} '${paramsJson}' ${debug ? '--debug' : ''} --all-chunks --max-chunks=${maxChunks}`;

      log('client.allChunksCommand', debug, { command: allChunksCommand }, COMPONENTS.CLIENT);

      // 输出提示信息，告知用户有更多分段内容 (Output prompt message, inform user there are more chunks)
      if (result.fetchedBytes && result.totalBytes) {
        log('client.contentChunkedBytes', true, { fetched: result.fetchedBytes, total: result.totalBytes }, COMPONENTS.CLIENT);
      } else {
        log('client.contentChunkedCount', true, { current: currentChunk + 1, total: totalChunks }, COMPONENTS.CLIENT);
      }
      log('client.fetchAllChunksHint', true, { command: allChunksCommand }, COMPONENTS.CLIENT);

      if (totalChunks > maxChunks + 1) {
        log('client.fetchLimitedChunksHint', true, { limit: maxChunks + 1, command: allChunksWithLimitCommand }, COMPONENTS.CLIENT);
      }
    }
  } catch (_error) {
    // 处理错误 (Handle error)
    log('client.fatalError', true, { error: String(_error) }, COMPONENTS.CLIENT);

    // 返回标准错误结构体 (Return standard error structure)
    const errorResult = {
      isError: true,
      content: [
        {
          type: "text",
          text: `Fatal error: ${String(_error)}`
        }
      ]
    };

    console.log(JSON.stringify(errorResult, null, 2));
  } finally {
    // 关闭客户端连接 (Close client connection)
    log('client.serverClosed', debug, {}, COMPONENTS.CLIENT);
    await client.close();
  }
}

// 捕获未处理的异常 (Catch unhandled exceptions)
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  log('client.fatalError', true, { error: error.toString() }, COMPONENTS.CLIENT);
  process.exit(1);
});

// 执行主函数 (Execute main function)
main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
}); 