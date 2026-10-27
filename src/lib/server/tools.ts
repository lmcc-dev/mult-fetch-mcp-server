/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: MCP tool registration. 2.0 exposes one fetch tool plus thin aliases. / MCP 工具注册。2.0 暴露一个 fetch 工具和薄别名。
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { log, COMPONENTS } from '../logger.js';
import { fetchWithAutoDetect } from './fetcher.js';
import { FetchParams } from './types.js';
import { closeBrowserInstance } from './browser.js';
import { BaseFetcher } from '../fetchers/common/BaseFetcher.js';
import { TemplateUtils } from '../utils/TemplateUtils.js';
import { ContentSizeManager } from '../utils/ContentSizeManager.js';

/**
 * 2.0 支持的正文格式 (Body formats supported in 2.0)
 */
const FETCH_FORMATS = ['html', 'markdown', 'plaintext', 'json', 'txt'] as const;

type FetchFormat = typeof FETCH_FORMATS[number];

/**
 * 1.x 工具名到格式的映射 (Map of 1.x tool names to formats)
 */
const ALIAS_FORMATS: Record<string, FetchFormat> = {
  fetch_html: 'html',
  fetch_json: 'json',
  fetch_txt: 'txt',
  fetch_markdown: 'markdown',
  fetch_plaintext: 'plaintext'
};

/**
 * 基本请求参数定义 (Basic request parameters definition)
 * 所有工具共享的基本参数 (Basic parameters shared by all tools)
 */
const baseRequestParams = {
  url: {
    type: "string",
    description: "Absolute http(s) URL to fetch. Required on the first call. Optional when cursor or chunkId continues a truncated response.",
  },
  headers: {
    type: "object",
    description: "Optional request headers as a string-to-string map.",
  },
  proxy: {
    type: "string",
    description: "Optional proxy URL (http://host:port or https://host:port).",
  },
  timeout: {
    type: "number",
    description: "Request timeout in milliseconds. Default: 30000.",
  },
  maxRedirects: {
    type: "number",
    description: "Maximum redirects to follow. Default: 10. Each redirect is checked for SSRF.",
  },
  useSystemProxy: {
    type: "boolean",
    description: "Use HTTP_PROXY / HTTPS_PROXY / NO_PROXY when no proxy argument is set. Default: true.",
  },
  debug: {
    type: "boolean",
    description: "Write debug logs to stderr. Default: false. Do not enable unless the user asked for diagnostics.",
  },
  noDelay: {
    type: "boolean",
    description: "Skip the random delay between redirects. Default: false.",
  }
};

/**
 * 浏览器相关参数定义 (Browser-related parameters definition)
 * 与浏览器模式相关的参数 (Parameters related to browser mode)
 */
const browserParams = {
  useBrowser: {
    type: "boolean",
    description: "Use the optional headless browser. Default: false. Requires puppeteer to be installed. Leave false for normal HTTP fetches.",
  },
  waitForSelector: {
    type: "string",
    description: "CSS selector to wait for in browser mode.",
  },
  waitForTimeout: {
    type: "number",
    description: "Extra wait after load in browser mode, in milliseconds. Default: 5000.",
  },
  scrollToBottom: {
    type: "boolean",
    description: "Scroll to the bottom before reading the page in browser mode. Default: false.",
  },
  closeBrowser: {
    type: "boolean",
    description: "Close the browser after this call. Default: false.",
  },
  saveCookies: {
    type: "boolean",
    description: "Keep cookies for the same site across browser-mode calls. Default: true.",
  },
  autoDetectMode: {
    type: "boolean",
    description: "Retry with the browser after an HTTP 403 or challenge page. Default: false. Set true only when the HTTP fetch is blocked and puppeteer is installed.",
  }
};

/**
 * 内容窗口参数 (Content window parameters)
 * 默认一次返回正文，只有被截断时才需要续传 (Return the body once; continue only when truncated)
 */
const contentWindowParams = {
  maxChars: {
    type: "number",
    description: "Maximum characters to return in this response. Default: 100000. The cut prefers a newline or space. Omit this on a normal fetch.",
  },
  maxBytes: {
    type: "number",
    description: "Maximum UTF-8 bytes to return in this response. Default: 1048576. Used together with maxChars; the smaller budget wins.",
  },
  cursor: {
    type: "string",
    description: "Continuation token from a previous truncated response (nextCursor). Omit on the first call. When set, the server returns the next slice and does not refetch the URL.",
  },
  chunkId: {
    type: "string",
    description: "Legacy or document id. Prefer cursor. With a 1.x byte chunk, also pass startCursor.",
  },
  startCursor: {
    type: "number",
    description: "Legacy byte offset used only with chunkId from a 1.x split. Not required. Do not send this for a normal fetch or for a cursor continuation.",
  },
  contentSizeLimit: {
    type: "number",
    description: "Legacy byte chunk size. When set without maxChars/maxBytes, the 1.x byte splitter is used. Prefer maxChars.",
  },
  enableContentSplitting: {
    type: "boolean",
    description: "When false, oversized content is truncated with no continuation cursor. Default: true.",
  }
};

/**
 * 内容提取参数定义 (Content extraction parameters definition)
 * 与内容提取相关的参数 (Parameters related to content extraction)
 */
const contentExtractionParams = {
  extractContent: {
    type: "boolean",
    description: "Extract the main article with Readability before converting. Default: true for markdown and plaintext, false for html, json, and txt.",
  },
  includeMetadata: {
    type: "boolean",
    description: "Include title, byline, and site name when extractContent is true. Default: true.",
  },
  fallbackToOriginal: {
    type: "boolean",
    description: "If Readability finds no article, convert the original document. Default: true.",
  }
};

/**
 * 合并参数对象 (Merge parameter objects)
 * @param objects 要合并的参数对象数组 (Array of parameter objects to merge)
 * @returns 合并后的参数对象 (Merged parameter object)
 */
function mergeParams(...objects: Record<string, any>[]) {
  return objects.reduce((result, current) => {
    return { ...result, ...current };
  }, {});
}

/**
 * 主工具 fetch (Primary fetch tool)
 * @returns 工具定义 (Tool definition)
 */
function getFetchToolDefinition() {
  return {
    name: "fetch",
    description: "Fetch an http(s) URL and return its content in one response. Use this to read a web page or a JSON/text URL. Default format is markdown with readable-article extraction. Do not send startCursor. Parameters that matter: url (required on the first call), format (html | markdown | plaintext | json | txt, default markdown). Optional: maxChars (default 100000), maxBytes (default 1048576), timeout (default 30000). If the response is truncated it includes nextCursor and chunkId; call fetch again with that cursor to continue. Private, loopback, and link-local targets are blocked. Browser rendering is off unless useBrowser or autoDetectMode is true.",
    inputSchema: {
      type: "object",
      properties: mergeParams(
        {
          format: {
            type: "string",
            enum: [...FETCH_FORMATS],
            description: "Output format. markdown (default) and plaintext extract readable content over HTTP. html returns markup. json expects a JSON document. txt returns the raw body.",
          }
        },
        baseRequestParams,
        browserParams,
        contentWindowParams,
        contentExtractionParams
      ),
      required: ["url"],
    },
  };
}

/**
 * 1.x 别名工具 (Thin 1.x alias tool)
 * @param name 工具名 (Tool name)
 * @param format 固定格式 (Fixed format)
 * @param summary 给模型的一句说明 (One-line description for the model)
 * @returns 工具定义 (Tool definition)
 */
function getAliasToolDefinition(name: string, format: FetchFormat, summary: string) {
  const properties = mergeParams(baseRequestParams, browserParams, contentWindowParams);
  if (format !== 'json' && format !== 'txt') {
    Object.assign(properties, contentExtractionParams);
  }

  return {
    name,
    description: `Deprecated alias of fetch with format="${format}". ${summary} Prefer the fetch tool. startCursor is not required.`,
    inputSchema: {
      type: "object",
      properties,
      required: ["url"],
    },
  };
}

/**
 * 获取所有工具定义 (Get all tool definitions)
 * @returns 工具定义数组 (Array of tool definitions)
 */
function getAllToolDefinitions() {
  return [
    getFetchToolDefinition(),
    getAliasToolDefinition('fetch_html', 'html', 'Returns HTML.'),
    getAliasToolDefinition('fetch_json', 'json', 'Returns a JSON document.'),
    getAliasToolDefinition('fetch_txt', 'txt', 'Returns the raw response body.'),
    getAliasToolDefinition('fetch_markdown', 'markdown', 'Returns Markdown.'),
    getAliasToolDefinition('fetch_plaintext', 'plaintext', 'Returns plain text extracted from HTML.')
  ];
}

/**
 * 解析本次调用的格式 (Resolve the format for this call)
 * @param name 工具名 (Tool name)
 * @param args 参数 (Arguments)
 * @returns 格式，无法识别时返回 null (Format, or null when it is not recognized)
 */
function resolveFormat(name: string, args: Record<string, any>): FetchFormat | null {
  if (name === 'fetch') {
    const format = (args.format ?? 'markdown') as string;
    return (FETCH_FORMATS as readonly string[]).includes(format) ? format as FetchFormat : null;
  }
  return ALIAS_FORMATS[name] ?? null;
}

/**
 * 组装获取参数，并补上 2.0 默认值 (Build fetch params and apply 2.0 defaults)
 * @param name 工具名 (Tool name)
 * @param args 调用参数 (Call arguments)
 * @param format 正文格式 (Body format)
 * @returns 获取参数 (Fetch parameters)
 */
function buildFetchParams(name: string, args: Record<string, any>, format: FetchFormat): FetchParams {
  const params: FetchParams = {
    ...args,
    method: name,
    autoDetectMode: args.autoDetectMode === true
  };

  const legacyByteLimit = args.contentSizeLimit !== undefined
    && args.maxChars === undefined
    && args.maxBytes === undefined;

  if (!legacyByteLimit) {
    if (args.maxChars === undefined) {
      params.maxChars = ContentSizeManager.getDefaultMaxChars();
    }
    if (args.maxBytes === undefined) {
      params.maxBytes = ContentSizeManager.getDefaultMaxBytes();
    }
  }

  if ((format === 'markdown' || format === 'plaintext') && args.extractContent === undefined) {
    params.extractContent = true;
  }

  return params;
}

/**
 * 注册工具列表处理程序 (Register tool list handler)
 * @param server MCP服务器实例 (MCP server instance)
 */
function registerToolListHandler(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: getAllToolDefinitions()
    };
  });
}

/**
 * 注册工具调用处理程序 (Register tool call handler)
 * @param server MCP服务器实例 (MCP server instance)
 */
function registerToolCallHandler(server: Server) {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments || {};
    const debug = args.debug === true;

    log('tools.callReceived', debug, { name, args: JSON.stringify(args) }, COMPONENTS.SERVER);

    try {
      if (name === 'fetch' || name in ALIAS_FORMATS) {
        const result = await handleFetchRequest(name, args, debug);
        return result;
      }

      log('tools.unknownTool', debug, { name }, COMPONENTS.SERVER);
      return BaseFetcher.createErrorResponse(`Unknown tool: ${name}`);
    } catch (error: any) {
      log('tools.callError', debug, { name, error: error.message }, COMPONENTS.SERVER);
      return BaseFetcher.createErrorResponse(`Error fetching ${args.url || args.cursor || `chunk ${args.chunkId}`}: ${error.message}`);
    } finally {
      if (args.closeBrowser === true) {
        await closeBrowserInstance(debug);
      }
    }
  });
}

/**
 * 处理获取请求 (Handle fetch request)
 * @param name 工具名称 (Tool name)
 * @param args 请求参数 (Request parameters)
 * @param debug 是否启用调试模式 (Whether debug mode is enabled)
 * @returns 请求结果 (Request result)
 */
async function handleFetchRequest(name: string, args: any, debug: boolean) {
  const format = resolveFormat(name, args);
  if (!format) {
    return BaseFetcher.createErrorResponse(`Unsupported format: ${args.format}. Use one of: ${FETCH_FORMATS.join(', ')}.`);
  }

  if (!args.url && !args.chunkId && !args.cursor) {
    log('tools.missingUrlOrChunkId', debug, {}, COMPONENTS.SERVER);
    return BaseFetcher.createErrorResponse("url is required unless cursor or chunkId continues a truncated response");
  }

  if (args.cursor || args.chunkId) {
    log('tools.fetchChunkRequest', debug, { chunkId: args.chunkId || args.cursor, startCursor: args.startCursor, type: name }, COMPONENTS.SERVER);
  } else {
    log('tools.fetchRequest', debug, { url: args.url, startCursor: args.startCursor, type: name }, COMPONENTS.SERVER);
  }

  try {
    const params = buildFetchParams(name, args, format);
    let result = await fetchWithAutoDetect(params, format);

    if (result.isError) {
      if (!result.content[0].type) {
        result.content[0].type = "text";
      }
    } else {
      if (format === 'json') {
        try {
          JSON.parse(result.content[0].text);
        } catch (jsonError: any) {
          log('tools.jsonParseWarning', debug, { error: jsonError.message }, COMPONENTS.SERVER);
        }
      }

      if (!result.content[0].type) {
        result.content[0].type = "text";
      }

      if (result.isChunked && result.hasMoreChunks && !TemplateUtils.hasSystemPrompt(result.content[0].text || '')) {
        result = BaseFetcher.addChunkPrompt(result);
      }
    }

    if (!result.content[0].type) {
      return BaseFetcher.createErrorResponse(`Unsupported content type: ${format}`);
    }

    return {
      content: result.content,
      isError: result.isError,
      ...(result.nextCursor ? { nextCursor: result.nextCursor } : {}),
      ...(result.chunkId && result.hasMoreChunks ? { chunkId: result.chunkId } : {}),
      ...(result.truncated ? { truncated: true } : {})
    };
  } catch (error: any) {
    log('tools.fetchError', debug, { url: args.url, error: error.message }, COMPONENTS.SERVER);
    return BaseFetcher.createErrorResponse(`Error fetching ${args.url || args.cursor || `chunk ${args.chunkId}`}: ${error.message}`);
  }
}

/**
 * 注册工具到服务器 (Register tools to server)
 * 设置工具列表和处理程序 (Set up tool list and handlers)
 * @param server MCP服务器实例 (MCP server instance)
 */
export function registerTools(server: Server): void {
  registerToolListHandler(server);
  registerToolCallHandler(server);
}
