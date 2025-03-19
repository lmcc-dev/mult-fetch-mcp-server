/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { log, COMPONENTS } from '../logger.js';
import { fetchWithAutoDetect } from './fetcher.js';
import { FetchParams } from './types.js';
import { closeBrowserInstance } from './browser.js';
import { BaseFetcher } from '../fetchers/common/BaseFetcher.js';
import { TemplateUtils } from '../utils/TemplateUtils.js';

/**
 * 获取HTML获取工具定义 (Get HTML fetch tool definition)
 * @returns HTML获取工具定义 (HTML fetch tool definition)
 */
function getHtmlFetchToolDefinition() {
  return {
    name: "fetch_html",
    description: "Fetch a website and return the content as HTML. Best practices: 1) Always set startCursor=0 for initial requests, and use the fetchedBytes value from previous response for subsequent requests to ensure content continuity. 2) Set contentSizeLimit between 20000-50000 for large pages. 3) When handling large content, use the chunking system by following the startCursor instructions in the system notes rather than increasing contentSizeLimit. 4) If content retrieval fails, you can retry using the same chunkId and startCursor, or adjust startCursor as needed but you must handle any resulting data duplication or gaps yourself. 5) Always explain to users when content is chunked and ask if they want to continue retrieving subsequent parts.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the website to fetch",
        },
        startCursor: {
          type: "number",
          description: "Starting cursor position in bytes. Set to 0 for initial requests, and use the value from previous responses for subsequent requests to resume content retrieval.",
        },
        headers: {
          type: "object",
          description: "Optional headers to include in the request",
        },
        proxy: {
          type: "string",
          description: "Optional proxy server to use (format: http://host:port or https://host:port)",
        },
        noDelay: {
          type: "boolean",
          description: "Optional flag to disable random delay between requests (default: false)",
        },
        timeout: {
          type: "number",
          description: "Optional timeout in milliseconds (default: 30000)",
        },
        maxRedirects: {
          type: "number",
          description: "Optional maximum number of redirects to follow (default: 10)",
        },
        useSystemProxy: {
          type: "boolean",
          description: "Optional flag to use system proxy environment variables (default: true)",
        },
        debug: {
          type: "boolean",
          description: "Optional flag to enable detailed debug logging (default: false)",
        },
        useBrowser: {
          type: "boolean",
          description: "Optional flag to use headless browser for fetching (default: false)",
        },
        autoDetectMode: {
          type: "boolean",
          description: "Optional flag to automatically switch to browser mode if standard fetch fails (default: true). Set to false to strictly use the specified mode without automatic switching.",
        },
        waitForSelector: {
          type: "string",
          description: "Optional CSS selector to wait for when using browser mode",
        },
        waitForTimeout: {
          type: "number",
          description: "Optional timeout to wait after page load in browser mode (default: 5000)",
        },
        scrollToBottom: {
          type: "boolean",
          description: "Optional flag to scroll to bottom of page in browser mode (default: false)",
        },
        saveCookies: {
          type: "boolean",
          description: "Optional flag to save cookies for future requests to the same domain (default: true)",
        },
        closeBrowser: {
          type: "boolean",
          description: "Optional flag to close the browser after fetching (default: false)",
        },
        contentSizeLimit: {
          type: "number",
          description: "Optional maximum content size in bytes before splitting into chunks (default: 50KB). Set between 20KB-50KB for optimal results. For large content, prefer smaller values (20KB-30KB) to avoid truncation.",
        },
        enableContentSplitting: {
          type: "boolean",
          description: "Optional flag to enable content splitting for large responses (default: true)",
        },
        chunkId: {
          type: "string",
          description: `Optional chunk ID for retrieving a specific chunk of content from a previous request. The system adds prompts in the format ${TemplateUtils.SYSTEM_NOTE.START} ... ${TemplateUtils.SYSTEM_NOTE.END} which AI models should ignore when processing the content.`,
        },
      },
      required: ["url", "startCursor"],
    },
  };
}

/**
 * 获取JSON获取工具定义 (Get JSON fetch tool definition)
 * @returns JSON获取工具定义 (JSON fetch tool definition)
 */
function getJsonFetchToolDefinition() {
  return {
    name: "fetch_json",
    description: "Fetch a JSON file from a URL. Best practices: 1) Always set startCursor=0 for initial requests, and use the fetchedBytes value from previous response for subsequent requests to ensure content continuity. 2) Set contentSizeLimit between 20000-50000 for large files. 3) When handling large content, use the chunking system by following the startCursor instructions in the system notes rather than increasing contentSizeLimit. 4) If content retrieval fails, you can retry using the same chunkId and startCursor, or adjust startCursor as needed but you must handle any resulting data duplication or gaps yourself. 5) Always explain to users when content is chunked and ask if they want to continue retrieving subsequent parts.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the JSON to fetch",
        },
        startCursor: {
          type: "number",
          description: "Starting cursor position in bytes. Set to 0 for initial requests, and use the value from previous responses for subsequent requests to resume content retrieval.",
        },
        headers: {
          type: "object",
          description: "Optional headers to include in the request",
        },
        proxy: {
          type: "string",
          description: "Optional proxy server to use (format: http://host:port or https://host:port)",
        },
        timeout: {
          type: "number",
          description: "Optional timeout in milliseconds (default: 30000)",
        },
        maxRedirects: {
          type: "number",
          description: "Optional maximum number of redirects to follow (default: 10)",
        },
        useSystemProxy: {
          type: "boolean",
          description: "Optional flag to use system proxy environment variables (default: true)",
        },
        debug: {
          type: "boolean",
          description: "Optional flag to enable detailed debug logging (default: false)",
        },
        noDelay: {
          type: "boolean",
          description: "Optional flag to disable random delay between requests (default: false)",
        },
        useBrowser: {
          type: "boolean",
          description: "Optional flag to use headless browser for fetching (default: false)",
        },
        waitForSelector: {
          type: "string",
          description: "Optional CSS selector to wait for when using browser mode",
        },
        waitForTimeout: {
          type: "number",
          description: "Optional timeout to wait after page load in browser mode (default: 5000)",
        },
        closeBrowser: {
          type: "boolean",
          description: "Optional flag to close the browser after fetching (default: false)",
        },
        contentSizeLimit: {
          type: "number",
          description: "Optional maximum content size in bytes before splitting into chunks (default: 50KB). Set between 20KB-50KB for optimal results. For large content, prefer smaller values (20KB-30KB) to avoid truncation.",
        },
        enableContentSplitting: {
          type: "boolean",
          description: "Optional flag to enable content splitting for large responses (default: true)",
        },
        chunkId: {
          type: "string",
          description: `Optional chunk ID for retrieving a specific chunk of content from a previous request. The system adds prompts in the format ${TemplateUtils.SYSTEM_NOTE.START} ... ${TemplateUtils.SYSTEM_NOTE.END} which AI models should ignore when processing the content.`,
        },
      },
      required: ["url", "startCursor"],
    },
  };
}

/**
 * 获取文本获取工具定义 (Get text fetch tool definition)
 * @returns 文本获取工具定义 (Text fetch tool definition)
 */
function getTextFetchToolDefinition() {
  return {
    name: "fetch_txt",
    description: "Fetch a website, return the content as plain text (no HTML). Best practices: 1) Always set startCursor=0 for initial requests, and use the fetchedBytes value from previous response for subsequent requests to ensure content continuity. 2) Set contentSizeLimit between 20000-50000 for large pages. 3) When handling large content, use the chunking system by following the startCursor instructions in the system notes rather than increasing contentSizeLimit. 4) If content retrieval fails, you can retry using the same chunkId and startCursor, or adjust startCursor as needed but you must handle any resulting data duplication or gaps yourself. 5) Always explain to users when content is chunked and ask if they want to continue retrieving subsequent parts.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the website to fetch",
        },
        startCursor: {
          type: "number",
          description: "Starting cursor position in bytes. Set to 0 for initial requests, and use the value from previous responses for subsequent requests to resume content retrieval.",
        },
        headers: {
          type: "object",
          description: "Optional headers to include in the request",
        },
        proxy: {
          type: "string",
          description: "Optional proxy server to use (format: http://host:port or https://host:port)",
        },
        timeout: {
          type: "number",
          description: "Optional timeout in milliseconds (default: 30000)",
        },
        maxRedirects: {
          type: "number",
          description: "Optional maximum number of redirects to follow (default: 10)",
        },
        useSystemProxy: {
          type: "boolean",
          description: "Optional flag to use system proxy environment variables (default: true)",
        },
        debug: {
          type: "boolean",
          description: "Optional flag to enable detailed debug logging (default: false)",
        },
        noDelay: {
          type: "boolean",
          description: "Optional flag to disable random delay between requests (default: false)",
        },
        useBrowser: {
          type: "boolean",
          description: "Optional flag to use headless browser for fetching (default: false)",
        },
        waitForSelector: {
          type: "string",
          description: "Optional CSS selector to wait for when using browser mode",
        },
        waitForTimeout: {
          type: "number",
          description: "Optional timeout to wait after page load in browser mode (default: 5000)",
        },
        scrollToBottom: {
          type: "boolean",
          description: "Optional flag to scroll to bottom of page in browser mode (default: false)",
        },
        contentSizeLimit: {
          type: "number",
          description: "Optional maximum content size in bytes before splitting into chunks (default: 50KB). Set between 20KB-50KB for optimal results. For large content, prefer smaller values (20KB-30KB) to avoid truncation.",
        },
        enableContentSplitting: {
          type: "boolean",
          description: "Optional flag to enable content splitting for large responses (default: true)",
        },
        chunkId: {
          type: "string",
          description: `Optional chunk ID for retrieving a specific chunk of content from a previous request. The system adds prompts in the format ${TemplateUtils.SYSTEM_NOTE.START} ... ${TemplateUtils.SYSTEM_NOTE.END} which AI models should ignore when processing the content.`,
        },
      },
      required: ["url", "startCursor"],
    },
  };
}

/**
 * 获取Markdown获取工具定义 (Get Markdown fetch tool definition)
 * @returns Markdown获取工具定义 (Markdown fetch tool definition)
 */
function getMarkdownFetchToolDefinition() {
  return {
    name: "fetch_markdown",
    description: "Fetch a website and return the content as Markdown. Best practices: 1) Always set startCursor=0 for initial requests, and use the fetchedBytes value from previous response for subsequent requests to ensure content continuity. 2) Set contentSizeLimit between 20000-50000 for large pages. 3) When handling large content, use the chunking system by following the startCursor instructions in the system notes rather than increasing contentSizeLimit. 4) If content retrieval fails, you can retry using the same chunkId and startCursor, or adjust startCursor as needed but you must handle any resulting data duplication or gaps yourself. 5) Always explain to users when content is chunked and ask if they want to continue retrieving subsequent parts.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the website to fetch",
        },
        startCursor: {
          type: "number",
          description: "Starting cursor position in bytes. Set to 0 for initial requests, and use the value from previous responses for subsequent requests to resume content retrieval.",
        },
        headers: {
          type: "object",
          description: "Optional headers to include in the request",
        },
        proxy: {
          type: "string",
          description: "Optional proxy server to use (format: http://host:port or https://host:port)",
        },
        timeout: {
          type: "number",
          description: "Optional timeout in milliseconds (default: 30000)",
        },
        maxRedirects: {
          type: "number",
          description: "Optional maximum number of redirects to follow (default: 10)",
        },
        useSystemProxy: {
          type: "boolean",
          description: "Optional flag to use system proxy environment variables (default: true)",
        },
        debug: {
          type: "boolean",
          description: "Optional flag to enable detailed debug logging (default: false)",
        },
        noDelay: {
          type: "boolean",
          description: "Optional flag to disable random delay between requests (default: false)",
        },
        useBrowser: {
          type: "boolean",
          description: "Optional flag to use headless browser for fetching (default: false)",
        },
        waitForSelector: {
          type: "string",
          description: "Optional CSS selector to wait for when using browser mode",
        },
        waitForTimeout: {
          type: "number",
          description: "Optional timeout to wait after page load in browser mode (default: 5000)",
        },
        scrollToBottom: {
          type: "boolean",
          description: "Optional flag to scroll to bottom of page in browser mode (default: false)",
        },
        contentSizeLimit: {
          type: "number",
          description: "Optional maximum content size in bytes before splitting into chunks (default: 50KB). Set between 20KB-50KB for optimal results. For large content, prefer smaller values (20KB-30KB) to avoid truncation.",
        },
        enableContentSplitting: {
          type: "boolean",
          description: "Optional flag to enable content splitting for large responses (default: true)",
        },
        chunkId: {
          type: "string",
          description: `Optional chunk ID for retrieving a specific chunk of content from a previous request. The system adds prompts in the format ${TemplateUtils.SYSTEM_NOTE.START} ... ${TemplateUtils.SYSTEM_NOTE.END} which AI models should ignore when processing the content.`,
        },
      },
      required: ["url", "startCursor"],
    },
  };
}

/**
 * 获取纯文本获取工具定义 (Get plain text fetch tool definition)
 * @returns 纯文本获取工具定义 (Plain text fetch tool definition)
 */
function getPlainTextFetchToolDefinition() {
  return {
    name: "fetch_plaintext",
    description: "Fetch a website and return the content as plain text with HTML tags removed. Best practices: 1) Always set startCursor=0 for initial requests, and use the fetchedBytes value from previous response for subsequent requests to ensure content continuity. 2) Set contentSizeLimit between 20000-50000 for large pages. 3) When handling large content, use the chunking system by following the startCursor instructions in the system notes rather than increasing contentSizeLimit. 4) If content retrieval fails, you can retry using the same chunkId and startCursor, or adjust startCursor as needed but you must handle any resulting data duplication or gaps yourself. 5) Always explain to users when content is chunked and ask if they want to continue retrieving subsequent parts.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the website to fetch",
        },
        startCursor: {
          type: "number",
          description: "Starting cursor position in bytes. Set to 0 for initial requests, and use the value from previous responses for subsequent requests to resume content retrieval.",
        },
        headers: {
          type: "object",
          description: "Optional headers to include in the request",
        },
        proxy: {
          type: "string",
          description: "Optional proxy server to use (format: http://host:port or https://host:port)",
        },
        noDelay: {
          type: "boolean",
          description: "Optional flag to disable random delay between requests (default: false)",
        },
        timeout: {
          type: "number",
          description: "Optional timeout in milliseconds (default: 30000)",
        },
        maxRedirects: {
          type: "number",
          description: "Optional maximum number of redirects to follow (default: 10)",
        },
        useSystemProxy: {
          type: "boolean",
          description: "Optional flag to use system proxy environment variables (default: true)",
        },
        debug: {
          type: "boolean",
          description: "Optional flag to enable detailed debug logging (default: false)",
        },
        useBrowser: {
          type: "boolean",
          description: "Optional flag to use headless browser for fetching (default: false)",
        },
        autoDetectMode: {
          type: "boolean",
          description: "Optional flag to automatically switch to browser mode if standard fetch fails (default: true). Set to false to strictly use the specified mode without automatic switching.",
        },
        waitForSelector: {
          type: "string",
          description: "Optional CSS selector to wait for when using browser mode",
        },
        waitForTimeout: {
          type: "number",
          description: "Optional timeout to wait after page load in browser mode (default: 5000)",
        },
        scrollToBottom: {
          type: "boolean",
          description: "Optional flag to scroll to bottom of page in browser mode (default: false)",
        },
        saveCookies: {
          type: "boolean",
          description: "Optional flag to save cookies for future requests to the same domain (default: true)",
        },
        closeBrowser: {
          type: "boolean",
          description: "Optional flag to close the browser after fetching (default: false)",
        },
        contentSizeLimit: {
          type: "number",
          description: "Optional maximum content size in bytes before splitting into chunks (default: 50KB). Set between 20KB-50KB for optimal results. For large content, prefer smaller values (20KB-30KB) to avoid truncation.",
        },
        enableContentSplitting: {
          type: "boolean",
          description: "Optional flag to enable content splitting for large responses (default: true)",
        },
        chunkId: {
          type: "string",
          description: `Optional chunk ID for retrieving a specific chunk of content from a previous request. The system adds prompts in the format ${TemplateUtils.SYSTEM_NOTE.START} ... ${TemplateUtils.SYSTEM_NOTE.END} which AI models should ignore when processing the content.`,
        },
      },
      required: ["url", "startCursor"],
    },
  };
}

/**
 * 获取所有工具定义 (Get all tool definitions)
 * @returns 工具定义数组 (Array of tool definitions)
 */
function getAllToolDefinitions() {
  return [
    getHtmlFetchToolDefinition(),
    getJsonFetchToolDefinition(),
    getTextFetchToolDefinition(),
    getMarkdownFetchToolDefinition(),
    getPlainTextFetchToolDefinition()
  ];
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
      // 处理不同类型的获取请求 (Handle different types of fetch requests)
      if (name === 'fetch_html' || name === 'fetch_json' || name === 'fetch_txt' || name === 'fetch_markdown' || name === 'fetch_plaintext') {
        const result = await handleFetchRequest(name, args, debug);
        
        // 直接返回符合 MCP SDK 要求的格式
        return result;
      } else {
        // 未知工具 (Unknown tool)
        log('tools.unknownTool', debug, { name }, COMPONENTS.SERVER);
        
        return BaseFetcher.createErrorResponse(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      // 处理错误 (Handle error)
      log('tools.callError', debug, { name, error: error.message }, COMPONENTS.SERVER);
      
      return BaseFetcher.createErrorResponse(`Error fetching ${args.url || `chunk ${args.chunkId}`}: ${error.message}`);
    } finally {
      // 如果请求参数中指定了关闭浏览器，则关闭浏览器 (If request parameters specify to close browser, close browser)
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
  // 验证URL参数 (Validate URL parameter)
  if (!args.url && !args.chunkId) {
    log('tools.missingUrlOrChunkId', debug, {}, COMPONENTS.SERVER);
    
    return BaseFetcher.createErrorResponse("Either URL or chunkId parameter is required");
  }
  
  // 验证startCursor参数 (Validate startCursor parameter)
  if (args.startCursor === undefined) {
    log('tools.missingStartCursor', debug, {}, COMPONENTS.SERVER);
    
    return BaseFetcher.createErrorResponse("startCursor parameter is required. Use 0 for initial requests.");
  }
  
  // 记录请求 (Log request)
  if (args.chunkId) {
    log('tools.fetchChunkRequest', debug, { chunkId: args.chunkId, startCursor: args.startCursor, type: name }, COMPONENTS.SERVER);
  } else {
    log('tools.fetchRequest', debug, { url: args.url, startCursor: args.startCursor, type: name }, COMPONENTS.SERVER);
  }
  
  // 执行获取请求 (Execute fetch request)
  try {
    const params: FetchParams = {
      ...args,
      method: name
    };
    
    // 根据工具名称确定内容类型 (Determine content type based on tool name)
    const type = name.replace('fetch_', '') as 'html' | 'json' | 'txt' | 'markdown' | 'plaintext';
    
    let result = await fetchWithAutoDetect(params, type);
    
    // 确保返回标准结构体 (Ensure returning standard structure)
    if (result.isError) {
      // 确保错误内容有正确的类型 (Ensure error content has correct type)
      if (!result.content[0].type) {
        result.content[0].type = "text";
      }
    } else {
      // 对于 JSON 类型，验证内容是否为有效的 JSON (For JSON type, validate if content is valid JSON)
      if (type === 'json') {
        try {
          // 尝试解析 JSON (Try to parse JSON)
          JSON.parse(result.content[0].text);
        } catch (jsonError: any) {
          // JSON 解析失败，但仍然返回原始内容 (JSON parsing failed, but still return original content)
          log('tools.jsonParseWarning', debug, { error: jsonError.message }, COMPONENTS.SERVER);
          
          // 不将 isError 设置为 true，保持原始结果
          // (Don't set isError to true, keep original result)
        }
      }
      
      // 确保成功内容有正确的类型 (Ensure success content has correct type)
      if (!result.content[0].type) {
        result.content[0].type = "text";
      }
      
      // 如果内容是分段的，添加提示词 (If content is chunked, add prompt)
      if (result.isChunked && result.hasMoreChunks) {
        // 检查内容中是否已经包含系统提示，避免重复添加
        // Check if content already contains system note to avoid duplicate
        if (!TemplateUtils.hasSystemPrompt(result.content[0].text || '')) {
          // 使用BaseFetcher的addChunkPrompt方法添加提示词 (Use BaseFetcher's addChunkPrompt method to add prompt)
          result = BaseFetcher.addChunkPrompt(result);
        }
      }
    }
    
    // 如果没有匹配的类型，返回错误
    if (!result.content[0].type) {
      return BaseFetcher.createErrorResponse(`Unsupported content type: ${type}`);
    }
    
    // 将FetchResponse转换为符合MCP SDK要求的格式
    return {
      content: result.content,
      isError: result.isError
    };
  } catch (error: any) {
    // 处理错误 (Handle error)
    log('tools.fetchError', debug, { url: args.url, error: error.message }, COMPONENTS.SERVER);
    
    // 返回错误信息 (Return error message)
    return BaseFetcher.createErrorResponse(`Error fetching ${args.url || `chunk ${args.chunkId}`}: ${error.message}`);
  }
}

/**
 * 注册工具到服务器 (Register tools to server)
 * 设置工具列表和处理程序 (Set up tool list and handlers)
 * @param server MCP服务器实例 (MCP server instance)
 */
export function registerTools(server: Server): void {
  // 注册工具列表处理程序 (Register tool list handler)
  registerToolListHandler(server);
  
  // 注册工具调用处理程序 (Register tool call handler)
  registerToolCallHandler(server);
}