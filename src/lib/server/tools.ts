/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { log, COMPONENTS } from '../logger.js';
import { fetchWithAutoDetect } from './fetcher.js';
import { FetchParams } from './types.js';
import { closeBrowserInstance } from './browser.js';

/**
 * 获取HTML获取工具定义 (Get HTML fetch tool definition)
 * @returns HTML获取工具定义 (HTML fetch tool definition)
 */
function getHtmlFetchToolDefinition() {
  return {
    name: "fetch_html",
    description: "Fetch a website and return the content as HTML",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the website to fetch",
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
          description: "Optional flag to automatically switch to browser mode if standard fetch fails (default: true)",
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
      },
      required: ["url"],
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
    description: "Fetch a JSON file from a URL",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the JSON to fetch",
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
      },
      required: ["url"],
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
    description: "Fetch a website, return the content as plain text (no HTML)",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the website to fetch",
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
      },
      required: ["url"],
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
    description: "Fetch a website and return the content as Markdown",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the website to fetch",
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
      },
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
    getHtmlFetchToolDefinition(),
    getJsonFetchToolDefinition(),
    getTextFetchToolDefinition(),
    getMarkdownFetchToolDefinition()
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
      if (name === 'fetch_html' || name === 'fetch_json' || name === 'fetch_txt' || name === 'fetch_markdown') {
        const result = await handleFetchRequest(name, args, debug);
        return result;
      } else {
        // 未知工具 (Unknown tool)
        log('tools.unknownTool', debug, { name }, COMPONENTS.SERVER);
        return {
          isError: true,
          content: [
            {
              text: `Unknown tool: ${name}`
            }
          ]
        };
      }
    } catch (error: any) {
      // 处理错误 (Handle error)
      log('tools.callError', debug, { name, error: error.message }, COMPONENTS.SERVER);
      return {
        isError: true,
        content: [
          {
            text: error.message
          }
        ]
      };
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
  if (!args.url) {
    log('tools.missingUrl', debug, {}, COMPONENTS.SERVER);
    return {
      isError: true,
      content: [
        {
          text: "URL parameter is required"
        }
      ]
    };
  }
  
  // 记录请求 (Log request)
  log('tools.fetchRequest', debug, { url: args.url, type: name }, COMPONENTS.SERVER);
  
  // 执行获取请求 (Execute fetch request)
  try {
    const params: FetchParams = {
      ...args,
      method: name
    };
    
    // 根据工具名称确定内容类型 (Determine content type based on tool name)
    const type = name.replace('fetch_', '') as 'html' | 'json' | 'txt' | 'markdown';
    
    const result = await fetchWithAutoDetect(params, type);
    return result;
  } catch (error: any) {
    // 处理错误 (Handle error)
    log('tools.fetchError', debug, { url: args.url, error: error.message }, COMPONENTS.SERVER);
    return {
      isError: true,
      content: [
        {
          text: `Error fetching ${args.url}: ${error.message}`
        }
      ]
    };
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