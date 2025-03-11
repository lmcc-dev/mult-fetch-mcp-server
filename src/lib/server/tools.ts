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
 * 注册工具到服务器 (Register tools to server)
 * 设置工具列表和处理程序 (Set up tool list and handlers)
 * @param server MCP服务器实例 (MCP server instance)
 */
export function registerTools(server: Server): void {
  // 注册工具列表处理程序
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
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
        },
        {
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
        },
        {
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
              closeBrowser: {
                type: "boolean",
                description: "Optional flag to close the browser after fetching (default: false)",
              },
            },
            required: ["url"],
          },
        },
        {
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
              closeBrowser: {
                type: "boolean",
                description: "Optional flag to close the browser after fetching (default: false)",
              },
            },
            required: ["url"],
          },
        },
      ],
    };
  });

  // 注册工具调用处理程序
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const parameters = request.params.arguments;
    const params = parameters as unknown as FetchParams;
    
    try {
      // 记录工具请求
      log('server.receivedToolRequest', params.debug === true, { name, url: params.url }, COMPONENTS.TOOLS);
      
      if (name === "fetch_html") {
        const result = await fetchWithAutoDetect(params, 'html');
        return {
          content: [
            {
              type: "text",
              text: result.content[0].text
            }
          ],
          isError: result.isError
        };
      } else if (name === "fetch_json") {
        const result = await fetchWithAutoDetect(params, 'json');
        return {
          content: [
            {
              type: "text",
              text: result.content[0].text
            }
          ],
          isError: result.isError
        };
      } else if (name === "fetch_txt") {
        const result = await fetchWithAutoDetect(params, 'txt');
        return {
          content: [
            {
              type: "text",
              text: result.content[0].text
            }
          ],
          isError: result.isError
        };
      } else if (name === "fetch_markdown") {
        const result = await fetchWithAutoDetect(params, 'markdown');
        return {
          content: [
            {
              type: "text",
              text: result.content[0].text
            }
          ],
          isError: result.isError
        };
      }

      throw new Error(`Unknown tool name: ${name}`);
    } catch (error) {
      // 记录错误
      log('server.processingToolRequestError', params.debug === true, { name, error: error instanceof Error ? error.message : String(error) }, COMPONENTS.TOOLS);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error processing request: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });
}