/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { RequestPayload } from "./types.js";
import fetch from "node-fetch";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "http";
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { createLogger } from './i18n/logger.js';
import { t } from './i18n/index.js';

// 创建Node获取器日志记录器 (Create Node fetcher logger)
const logger = createLogger('NODE-FETCH');

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
  
  // 所有日志消息都使用翻译键 (All log messages use translation keys)
  logger.debug(key, options, debug);
}

export class NodeFetcher {
  /**
   * 常用浏览器的User-Agent列表 (List of common browser User-Agents)
   * 用于模拟不同浏览器的请求 (Used to simulate requests from different browsers)
   */
  private static userAgents = [
    // Chrome
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    // Firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
    // Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    // Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
  ];

  /**
   * 获取随机User-Agent (Get random User-Agent)
   * @returns 随机的User-Agent字符串 (Random User-Agent string)
   */
  private static getRandomUserAgent(): string {
    const index = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[index];
  }

  /**
   * 随机延迟函数 (Random delay function)
   * 模拟人类行为，避免被检测为机器人 (Simulate human behavior, avoid being detected as a bot)
   * @param minMs 最小延迟毫秒数 (Minimum delay in milliseconds)
   * @param maxMs 最大延迟毫秒数 (Maximum delay in milliseconds)
   * @returns Promise对象 (Promise object)
   */
  private static async randomDelay(minMs = 500, maxMs = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 获取系统代理设置 (Get system proxy settings)
   * 从环境变量和系统命令中获取代理设置 (Get proxy settings from environment variables and system commands)
   * @param useSystemProxy 是否使用系统代理 (Whether to use system proxy)
   * @returns 代理URL或undefined (Proxy URL or undefined)
   */
  private static getSystemProxy(useSystemProxy: boolean = true): string | undefined {
    // 如果禁用了系统代理检测，直接返回undefined (If system proxy detection is disabled, return undefined directly)
    if (!useSystemProxy) {
      return undefined;
    }
    
    // 检查环境变量中的代理设置 (Check proxy settings in environment variables)
    const proxyVars = [
      'HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 
      'ALL_PROXY', 'all_proxy', 'NO_PROXY', 'no_proxy'
    ];
    
    // 输出所有环境变量的值，帮助调试
    log('fetcher.checkingProxyEnv', true, {});
    for (const varName of proxyVars) {
      log('fetcher.envVarValue', true, { 
        name: varName, 
        value: process.env[varName] || t('fetcher.notSet') 
      });
    }
    
    // 尝试获取代理设置
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 
                     process.env.http_proxy || process.env.https_proxy || 
                     process.env.ALL_PROXY || process.env.all_proxy;
    
    if (proxyUrl) {
      log('fetcher.foundSystemProxy', true, { proxy: proxyUrl });
      return proxyUrl;
    }
    
    // 如果环境变量中没有找到代理，尝试从系统命令获取 (If no proxy found in environment variables, try getting from system commands)
    try {
      const platform = os.platform();
      let shellOutput = '';
      
      if (platform === 'win32') {
        // Windows 系统
        shellOutput = execSync('set | findstr "HTTP_PROXY HTTPS_PROXY http_proxy https_proxy"').toString();
      } else if (platform === 'darwin' || platform === 'linux') {
        // macOS 或 Linux 系统
        shellOutput = execSync('env | grep -i -E "HTTP_PROXY|HTTPS_PROXY|http_proxy|https_proxy"').toString();
      }
      
      log('fetcher.systemCommandProxySettings', true, { output: shellOutput.trim() });
      
      // 解析输出找到代理 URL (Parse output to find proxy URL)
      const proxyMatch = shellOutput.match(/(?:HTTP_PROXY|HTTPS_PROXY|http_proxy|https_proxy)=([^\s]+)/i);
      if (proxyMatch && proxyMatch[1]) {
        log('fetcher.foundProxyFromCommand', true, { proxy: proxyMatch[1] });
        return proxyMatch[1];
      }
    } catch (error) {
      log('fetcher.errorGettingProxyFromCommand', true, { error: String(error) });
    }
    
    // 检查 NO_PROXY 设置 (Check NO_PROXY settings)
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (noProxy) {
      log('fetcher.foundNoProxy', true, { noProxy });
    }
    
    log('fetcher.noSystemProxyFound', true, {});
    return undefined;
  }

  /**
   * 处理重定向的fetch函数 (Fetch function that handles redirects)
   * 支持自动跟随重定向和代理设置 (Supports automatic redirect following and proxy settings)
   * @param params 请求参数 (Request parameters)
   * @returns 响应结果 (Response result)
   */
  private static async _fetchWithRedirects({
    url,
    headers = {},
    proxy,
    noDelay,
    timeout = 30000, // 默认30秒超时
    maxRedirects = 10, // 最大重定向次数
    useSystemProxy = true, // 是否使用系统代理
    debug = false, // 是否启用调试模式
  }: RequestPayload): Promise<any> {
    // 记录开始获取URL的日志
    log('node.fetchingUrl', debug, { url });
    
    // 如果没有禁用随机延迟，则添加随机延迟
    if (!noDelay) {
      await this.randomDelay();
    }
    
    // 获取系统代理
    const systemProxy = this.getSystemProxy(useSystemProxy);
    
    // 确定最终使用的代理
    const finalProxy = proxy || systemProxy;
    if (finalProxy) {
      log('node.usingProxy', debug, { proxy: finalProxy });
    }
    
    let redirectCount = 0;
    let currentUrl = url;
    
    // 添加随机User-Agent (Add random User-Agent)
    if (!headers['User-Agent']) {
      headers['User-Agent'] = this.getRandomUserAgent();
    }
    
    while (redirectCount < maxRedirects) {
      // 声明在try块外部，以便在catch块中可以访问
      let timeoutId: NodeJS.Timeout;
      let fetchStart: number;
      
      try {
        log('node.fetchingUrl', debug, { url: currentUrl, redirect: redirectCount });
        
        // 创建AbortController用于超时控制
        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);
        
        // 记录开始获取的时间
        fetchStart = Date.now();
        
        // 构建请求选项
        const userAgent = this.getRandomUserAgent();
        log('node.usingUserAgent', debug, { userAgent });
        
        const options: any = {
          method: 'GET',
          headers: {
            ...headers,
            'User-Agent': userAgent
          },
          redirect: 'manual', // 手动处理重定向
          signal: controller.signal,
          follow: 0 // 不自动跟随重定向
        };
        
        // 如果有代理，添加代理设置
        if (finalProxy) {
          const isHttps = currentUrl.startsWith("https://");
          if (isHttps) {
            log('node.usingHttpsProxy', debug);
            options.agent = new HttpsProxyAgent(finalProxy);
          } else {
            log('node.usingHttpProxy', debug);
            options.agent = new HttpProxyAgent(finalProxy);
          }
        }
        
        // 记录请求详情
        log('node.requestDetails', debug, {
          url: currentUrl,
          method: options.method,
          headers: options.headers,
          redirect: options.redirect,
          proxy: finalProxy ? "Set" : "None"
        });
        
        // 发送请求
        const response = await fetch(currentUrl, options);
        
        // 记录响应状态
        log('node.responseStatus', debug, { 
          status: response.status, 
          statusText: response.statusText,
          url: response.url
        });
        
        // 清除超时定时器
        clearTimeout(timeoutId);
        
        // 如果是重定向
        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
          const location = response.headers.get('location');
          log('node.redirectingTo', debug, { location });
          
          // 构建完整的重定向URL
          let redirectUrl = location;
          if (location.startsWith('/')) {
            // 相对路径，需要构建完整URL
            try {
              const baseUrl = new URL(currentUrl);
              redirectUrl = `${baseUrl.protocol}//${baseUrl.host}${location}`;
              log('node.constructedFullRedirectUrl', debug, { redirectUrl });
            } catch (e) {
              // 忽略URL解析错误
            }
          }
          
          // 更新当前URL和重定向计数
          currentUrl = redirectUrl;
          redirectCount++;
          continue;
        }
        
        // 如果是成功响应
        if (response.status >= 200 && response.status < 300) {
          log('node.requestSuccess', debug);
          return response;
        }
        
        // 如果是错误响应
        log('node.errorResponse', debug, { status: response.status, statusText: response.statusText });
        
        // 尝试读取响应内容
        let errorText = '';
        try {
          errorText = await response.text();
          log('node.errorResponseBody', debug, { body: errorText.substring(0, 200) + (errorText.length > 200 ? '...' : '') });
        } catch (textError) {
          log('node.errorReadingBody', debug, { error: String(textError) });
        }
        
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `HTTP Error ${response.status}: ${response.statusText}\n\n${errorText}`
            }
          ]
        };
        
      } catch (error) {
        // 清除超时定时器
        clearTimeout(timeoutId);
        
        // 详细记录错误信息
        log('node.fetchError', debug, { error: String(error) });
        if (error.name === 'AbortError') {
          log('node.requestAborted', debug, { duration: Date.now() - fetchStart });
        }
        
        // 如果是网络错误，可能需要使用浏览器模式重试
        if (
          error.code === 'ENOTFOUND' || 
          error.code === 'ECONNREFUSED' || 
          error.code === 'ECONNRESET' || 
          error.code === 'ETIMEDOUT' || 
          error.name === 'AbortError'
        ) {
          log('node.networkError', debug, { code: error.code || error.name });
        }
        
        throw error;
      }
    }
    
    log('node.tooManyRedirects', debug, { redirects: maxRedirects });
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Too many redirects (${maxRedirects})`
        }
      ]
    };
  }

  /**
   * 获取HTML内容 (Get HTML content)
   * 从URL获取HTML并返回 (Fetch HTML from URL and return)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async html(requestPayload: RequestPayload) {
    try {
      const debug = requestPayload.debug || false;
      log('node.startingHtmlFetch', debug);
      
      const response = await this._fetchWithRedirects(requestPayload);
      
      // 如果已经是错误响应对象，直接返回 (If it's already an error response object, return directly)
      if (response.isError) {
        return response;
      }
      
      log('node.readingText', debug);
      const html = await response.text();
      log('node.htmlContentLength', debug, { length: html.length });
      
      return {
        isError: false,
        content: [
          {
            type: "text",
            text: html
          }
        ]
      };
    } catch (error) {
      const debug = requestPayload.debug || false;
      log('node.htmlFetchError', debug, { error: error instanceof Error ? error.message : String(error) });
      
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error)
          }
        ]
      };
    }
  }

  /**
   * 获取JSON内容 (Get JSON content)
   * 从URL获取JSON并返回 (Fetch JSON from URL and return)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async json(requestPayload: RequestPayload) {
    try {
      const debug = requestPayload.debug || false;
      log('node.startingJsonFetch', debug);
      
      // 添加JSON特定的请求头 (Add JSON-specific request headers)
      const headers = requestPayload.headers || {};
      if (!headers['Accept']) {
        headers['Accept'] = 'application/json';
      }
      
      const response = await this._fetchWithRedirects({
        ...requestPayload,
        headers
      });
      
      // 如果已经是错误响应对象，直接返回 (If it's already an error response object, return directly)
      if (response.isError) {
        return response;
      }
      
      log('node.parsingJson', debug);
      const text = await response.text();
      
      try {
        const json = JSON.parse(text);
        log('node.jsonParsed', debug);
        
        return {
          isError: false,
          content: [
            {
              type: "text",
              text: JSON.stringify(json, null, 2)
            }
          ]
        };
      } catch (parseError) {
        log('node.jsonParseError', debug, { error: String(parseError) });
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Failed to parse JSON: ${(parseError as Error).message}\n\nRaw response:\n${text}`
            }
          ]
        };
      }
    } catch (error) {
      const debug = requestPayload.debug || false;
      log('node.jsonFetchError', debug, { error: error instanceof Error ? error.message : String(error) });
      
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error)
          }
        ]
      };
    }
  }

  /**
   * 获取纯文本内容 (Get plain text content)
   * 从URL获取纯文本并返回 (Fetch plain text from URL and return)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async txt(requestPayload: RequestPayload) {
    try {
      const debug = requestPayload.debug || false;
      log('fetcher.startingTxtFetch', debug, {});
      
      // 添加文本特定的请求头 (Add text-specific request headers)
      const headers = requestPayload.headers || {};
      if (!headers['Accept']) {
        headers['Accept'] = 'text/plain,*/*';
      }
      
      const response = await this._fetchWithRedirects({
        ...requestPayload,
        headers
      });
      
      // 如果已经是错误响应对象，直接返回 (If it's already an error response object, return directly)
      if (response.isError) {
        return response;
      }
      
      log('fetcher.readingText', debug, {});
      const text = await response.text();
      log('fetcher.textContentLength', debug, { length: text.length });
      
      return {
        isError: false,
        content: [
          {
            type: "text",
            text
          }
        ]
      };
    } catch (error) {
      if (requestPayload.debug) {
        console.error("Text fetch error:", error);
      }
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error)
          }
        ]
      };
    }
  }

  /**
   * 获取Markdown内容 (Get Markdown content)
   * 从URL获取HTML并转换为Markdown (Fetch HTML from URL and convert to Markdown)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async markdown(requestPayload: RequestPayload) {
    try {
      const debug = requestPayload.debug || false;
      log('fetcher.startingMarkdownFetch', debug, {});
      
      const response = await this._fetchWithRedirects(requestPayload);
      
      // 如果已经是错误响应对象，直接返回 (If it's already an error response object, return directly)
      if (response.isError) {
        return response;
      }
      
      log('fetcher.readingText', debug, {});
      const html = await response.text();
      log('fetcher.htmlContentLength', debug, { length: html.length });
      
      log('fetcher.creatingTurndown', debug, {});
      const turndownService = new TurndownService();
      
      log('fetcher.convertingToMarkdown', debug, {});
      const markdown = turndownService.turndown(html);
      log('fetcher.markdownContentLength', debug, { length: markdown.length });
      
      return {
        isError: false,
        content: [
          {
            type: "text",
            text: markdown
          }
        ]
      };
    } catch (error) {
      if (requestPayload.debug) {
        console.error("Markdown fetch error:", error);
      }
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error)
          }
        ]
      };
    }
  }
} 