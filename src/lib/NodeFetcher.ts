/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import TurndownService from "turndown";
import { RequestPayload } from "./types.js";
import fetch from "node-fetch";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "http";
import { execSync } from 'child_process';
import { t } from './i18n/index.js';
import { log, COMPONENTS } from './logger.js';

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
   * @param useSystemProxy 是否使用系统代理 (Whether to use system proxy)
   * @returns 代理URL或undefined (Proxy URL or undefined)
   */
  private static getSystemProxy(useSystemProxy: boolean = true): string | undefined {
    if (!useSystemProxy) {
      return undefined;
    }
    
    // 检查环境变量 (Check environment variables)
    log('fetcher.checkingProxyEnv', true, {}, COMPONENTS.NODE_FETCH);
    const envVars = ['https_proxy', 'HTTPS_PROXY', 'http_proxy', 'HTTP_PROXY'];
    for (const envVar of envVars) {
      log('fetcher.envVarValue', true, {
        envVar,
        value: process.env[envVar]
      }, COMPONENTS.NODE_FETCH);
      
      if (process.env[envVar]) {
        const proxyUrl = process.env[envVar] as string;
        log('fetcher.foundSystemProxy', true, { proxy: proxyUrl }, COMPONENTS.NODE_FETCH);
        return proxyUrl;
      }
    }
    
    // 尝试使用系统命令获取环境变量 (Try to get environment variables using system commands)
    try {
      const platform = process.platform;
      let proxyUrl: string | undefined;
      
      log('fetcher.checkingSystemEnvVars', true, { platform }, COMPONENTS.NODE_FETCH);
      
      if (platform === 'win32') {
        // Windows系统 - 使用set命令 (Windows - use set command)
        try {
          // 使用set命令获取代理环境变量 (Use set command to get proxy environment variables)
          const setOutput = execSync('set http_proxy & set https_proxy & set HTTP_PROXY & set HTTPS_PROXY').toString();
          log('fetcher.windowsEnvVars', true, { output: setOutput.trim() }, COMPONENTS.NODE_FETCH);
          
          // 解析输出找到代理设置 (Parse output to find proxy settings)
          const proxyMatch = setOutput.match(/(?:http_proxy|https_proxy|HTTP_PROXY|HTTPS_PROXY)=(https?:\/\/[^=\r\n]+)/i);
          if (proxyMatch && proxyMatch[1]) {
            proxyUrl = proxyMatch[1].trim();
            log('fetcher.foundWindowsEnvProxy', true, { proxy: proxyUrl }, COMPONENTS.NODE_FETCH);
          }
        } catch (winError) {
          log('fetcher.errorGettingWindowsEnvVars', true, { error: String(winError) }, COMPONENTS.NODE_FETCH);
        }
      } else {
        // Unix系统 (macOS/Linux) - 使用export或env命令 (Unix systems - use export or env command)
        try {
          // 使用env命令获取所有环境变量 (Use env command to get all environment variables)
          const envOutput = execSync('env').toString();
          log('fetcher.unixEnvVars', true, { output: envOutput.length > 200 ? envOutput.substring(0, 200) + '...' : envOutput }, COMPONENTS.NODE_FETCH);
          
          // 解析输出找到代理设置 (Parse output to find proxy settings)
          const proxyMatch = envOutput.match(/(?:http_proxy|https_proxy|HTTP_PROXY|HTTPS_PROXY)=(https?:\/\/[^=\n]+)/i);
          if (proxyMatch && proxyMatch[1]) {
            proxyUrl = proxyMatch[1].trim();
            log('fetcher.foundUnixEnvProxy', true, { proxy: proxyUrl }, COMPONENTS.NODE_FETCH);
          }
        } catch (unixError) {
          log('fetcher.errorGettingUnixEnvVars', true, { error: String(unixError) }, COMPONENTS.NODE_FETCH);
        }
      }
      
      if (proxyUrl) {
        return proxyUrl;
      }
      
      // 如果没有找到代理，记录日志 (If no proxy is found, log a message)
      log('fetcher.noSystemProxyFound', true, {}, COMPONENTS.NODE_FETCH);
    } catch (error) {
      log('fetcher.errorGettingSystemEnvVars', true, { error: String(error) }, COMPONENTS.NODE_FETCH);
    }
    
    // 检查NO_PROXY环境变量 (Check NO_PROXY environment variable)
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (noProxy) {
      log('fetcher.foundNoProxy', true, { noProxy }, COMPONENTS.NODE_FETCH);
    }
    
    return undefined;
  }

  /**
   * 执行带重定向处理的HTTP请求 (Perform HTTP request with redirect handling)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 响应数据 (Response data)
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
    log('node.fetchingUrl', debug, { url }, COMPONENTS.NODE_FETCH);
    
    // 处理代理设置 (Handle proxy settings)
    const systemProxy = this.getSystemProxy(useSystemProxy);
    const finalProxy = proxy || systemProxy;
    
    if (finalProxy) {
      log('node.usingProxy', debug, { proxy: finalProxy }, COMPONENTS.NODE_FETCH);
    }
    
    // 初始化重定向计数器 (Initialize redirect counter)
    let redirectCount = 0;
    let currentUrl = url;
    
    // 记录请求开始时间 (Record request start time)
    const fetchStart = Date.now();
    
    // 创建AbortController用于超时控制 (Create AbortController for timeout control)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // 处理重定向循环 (Handle redirect loop)
      while (redirectCount < maxRedirects) {
        log('node.fetchingUrl', debug, { url: currentUrl, redirect: redirectCount }, COMPONENTS.NODE_FETCH);
        
        // 如果启用了随机延迟且不是第一个请求，则添加延迟 (Add delay if random delay is enabled and not the first request)
        if (!noDelay && redirectCount > 0) {
          await this.randomDelay();
        }
        
        // 准备请求头 (Prepare request headers)
        const requestHeaders: Record<string, string> = {
          ...headers
        };
        
        // 添加随机User-Agent (Add random User-Agent)
        if (!requestHeaders['User-Agent']) {
          const userAgent = this.getRandomUserAgent();
          requestHeaders['User-Agent'] = userAgent;
          log('node.usingUserAgent', debug, { userAgent }, COMPONENTS.NODE_FETCH);
        }
        
        // 准备请求选项 (Prepare request options)
        const fetchOptions: any = {
          method: 'GET',
          headers: requestHeaders,
          timeout,
          signal: controller.signal,
        };
        
        // 设置代理 (Set proxy)
        let agent: Agent | undefined = undefined;
        
        if (finalProxy) {
          if (currentUrl.startsWith('https://')) {
            agent = new HttpsProxyAgent(finalProxy);
            log('node.usingHttpsProxy', debug, {}, COMPONENTS.NODE_FETCH);
          } else {
            agent = new HttpProxyAgent(finalProxy);
            log('node.usingHttpProxy', debug, {}, COMPONENTS.NODE_FETCH);
          }
          fetchOptions.agent = agent;
        }
        
        // 记录请求详情 (Log request details)
        log('node.requestDetails', debug, {
          url: currentUrl,
          method: fetchOptions.method || 'GET',
          headers: requestHeaders,
          proxy: finalProxy,
          timeout,
        }, COMPONENTS.NODE_FETCH);
        
        // 执行请求 (Execute request)
        const response = await fetch(currentUrl, fetchOptions);
        
        // 记录响应状态 (Log response status)
        log('node.responseStatus', debug, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        }, COMPONENTS.NODE_FETCH);
        
        // 处理重定向 (Handle redirects)
        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
          redirectCount++;
          
          // 获取重定向URL (Get redirect URL)
          const location = response.headers.get('location') as string;
          log('node.redirectingTo', debug, { location }, COMPONENTS.NODE_FETCH);
          
          // 构建完整的重定向URL (Build complete redirect URL)
          let redirectUrl = location;
          if (location.startsWith('/')) {
            const urlObj = new URL(currentUrl);
            redirectUrl = `${urlObj.protocol}//${urlObj.host}${location}`;
          } else if (!location.startsWith('http')) {
            redirectUrl = new URL(location, currentUrl).toString();
          }
          
          log('node.constructedFullRedirectUrl', debug, { redirectUrl }, COMPONENTS.NODE_FETCH);
          
          // 更新当前URL为重定向URL (Update current URL to redirect URL)
          currentUrl = redirectUrl;
          continue;
        }
        
        // 如果响应成功，返回响应 (If response is successful, return response)
        if (response.ok) {
          log('node.requestSuccess', debug, {}, COMPONENTS.NODE_FETCH);
          return response;
        } else {
          // 处理错误响应 (Handle error response)
          log('node.errorResponse', debug, { status: response.status, statusText: response.statusText }, COMPONENTS.NODE_FETCH);
          
          // 尝试读取错误响应体 (Try to read error response body)
          let errorText = '';
          try {
            errorText = await response.text();
            log('node.errorResponseBody', debug, { body: errorText.substring(0, 200) + (errorText.length > 200 ? '...' : '') }, COMPONENTS.NODE_FETCH);
          } catch (textError) {
            log('node.errorReadingBody', debug, { error: String(textError) }, COMPONENTS.NODE_FETCH);
          }
          
          // 创建错误对象 (Create error object)
          const error = new Error(`HTTP Error ${response.status}: ${response.statusText}`);
          (error as any).status = response.status;
          (error as any).statusText = response.statusText;
          (error as any).body = errorText;
          
          throw error;
        }
      }
      
      // 如果达到最大重定向次数，抛出错误 (If maximum redirects reached, throw error)
      throw new Error(`Too many redirects (${maxRedirects})`);
    } catch (error: any) {
      // 清除超时定时器 (Clear timeout timer)
      clearTimeout(timeoutId);
      
      // 记录错误 (Log error)
      log('node.fetchError', debug, { error: String(error) }, COMPONENTS.NODE_FETCH);
      
      // 处理超时错误 (Handle timeout error)
      if (error.name === 'AbortError') {
        log('node.requestAborted', debug, { duration: Date.now() - fetchStart }, COMPONENTS.NODE_FETCH);
        const timeoutError = new Error(`Request timeout after ${timeout}ms`);
        (timeoutError as any).code = 'ETIMEDOUT';
        (timeoutError as any).timeout = timeout;
        throw timeoutError;
      }
      
      // 处理网络错误 (Handle network error)
      if (error.code) {
        log('node.networkError', debug, { code: error.code || error.name }, COMPONENTS.NODE_FETCH);
        const networkError = new Error(`Network error: ${error.code || error.message}`);
        (networkError as any).code = error.code;
        (networkError as any).originalError = error;
        throw networkError;
      }
      
      // 处理重定向错误 (Handle redirect error)
      if (redirectCount >= maxRedirects) {
        log('node.tooManyRedirects', debug, { redirects: maxRedirects }, COMPONENTS.NODE_FETCH);
        const redirectError = new Error(`Too many redirects (${maxRedirects})`);
        (redirectError as any).code = 'EMAXREDIRECTS';
        (redirectError as any).redirects = redirectCount;
        throw redirectError;
      }
      
      // 重新抛出其他错误 (Rethrow other errors)
      throw error;
    } finally {
      // 清除超时定时器 (Clear timeout timer)
      clearTimeout(timeoutId);
    }
  }

  /**
   * 获取HTML内容 (Get HTML content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns HTML内容 (HTML content)
   */
  static async html(requestPayload: RequestPayload) {
    const { debug = false } = requestPayload;
    log('node.startingHtmlFetch', debug, {}, COMPONENTS.NODE_FETCH);
    
    try {
      // 执行请求 (Execute request)
      const response = await this._fetchWithRedirects(requestPayload);
      
      // 读取响应文本 (Read response text)
      log('node.readingText', debug, {}, COMPONENTS.NODE_FETCH);
      const html = await response.text();
      log('node.htmlContentLength', debug, { length: html.length }, COMPONENTS.NODE_FETCH);
      
      // 返回HTML内容 (Return HTML content)
      return {
        html,
        url: response.url,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      // 处理错误 (Handle error)
      log('node.htmlFetchError', debug, { error: error instanceof Error ? error.message : String(error) }, COMPONENTS.NODE_FETCH);
      
      // 重新抛出错误 (Rethrow error)
      throw error;
    }
  }

  /**
   * 获取JSON内容 (Get JSON content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns JSON内容 (JSON content)
   */
  static async json(requestPayload: RequestPayload) {
    const { debug = false } = requestPayload;
    log('node.startingJsonFetch', debug, {}, COMPONENTS.NODE_FETCH);
    
    try {
      // 执行请求 (Execute request)
      const response = await this._fetchWithRedirects(requestPayload);
      
      // 读取响应文本 (Read response text)
      const text = await response.text();
      
      // 解析JSON (Parse JSON)
      log('node.parsingJson', debug, {}, COMPONENTS.NODE_FETCH);
      let json;
      try {
        json = JSON.parse(text);
        log('node.jsonParsed', debug, {}, COMPONENTS.NODE_FETCH);
      } catch (parseError) {
        // 处理JSON解析错误 (Handle JSON parse error)
        const error = new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        (error as any).text = text;
        (error as any).originalError = parseError;
        
        log('node.jsonParseError', debug, { error: String(parseError) }, COMPONENTS.NODE_FETCH);
        
        throw error;
      }
      
      // 返回JSON内容 (Return JSON content)
      return {
        json,
        text,
        url: response.url,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      // 处理错误 (Handle error)
      log('node.jsonFetchError', debug, { error: error instanceof Error ? error.message : String(error) }, COMPONENTS.NODE_FETCH);
      
      // 重新抛出错误 (Rethrow error)
      throw error;
    }
  }

  /**
   * 获取纯文本内容 (Get plain text content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 纯文本内容 (Plain text content)
   */
  static async txt(requestPayload: RequestPayload) {
    const { debug = false } = requestPayload;
    log('fetcher.startingTxtFetch', debug, {}, COMPONENTS.NODE_FETCH);
    
    try {
      // 执行请求 (Execute request)
      const response = await this._fetchWithRedirects(requestPayload);
      
      // 读取响应文本 (Read response text)
      log('fetcher.readingText', debug, {}, COMPONENTS.NODE_FETCH);
      const text = await response.text();
      log('fetcher.textContentLength', debug, { length: text.length }, COMPONENTS.NODE_FETCH);
      
      // 返回纯文本内容 (Return plain text content)
      return {
        text,
        url: response.url,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      // 重新抛出错误 (Rethrow error)
      throw error;
    }
  }

  /**
   * 获取Markdown内容 (Get Markdown content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns Markdown内容 (Markdown content)
   */
  static async markdown(requestPayload: RequestPayload) {
    const { debug = false } = requestPayload;
    log('fetcher.startingMarkdownFetch', debug, {}, COMPONENTS.NODE_FETCH);
    
    try {
      // 执行请求 (Execute request)
      const response = await this._fetchWithRedirects(requestPayload);
      
      // 读取响应文本 (Read response text)
      log('fetcher.readingText', debug, {}, COMPONENTS.NODE_FETCH);
      const html = await response.text();
      log('fetcher.htmlContentLength', debug, { length: html.length }, COMPONENTS.NODE_FETCH);
      
      // 创建Turndown服务 (Create Turndown service)
      log('fetcher.creatingTurndown', debug, {}, COMPONENTS.NODE_FETCH);
      const turndownService = new TurndownService();
      
      // 将HTML转换为Markdown (Convert HTML to Markdown)
      log('fetcher.convertingToMarkdown', debug, {}, COMPONENTS.NODE_FETCH);
      const markdown = turndownService.turndown(html);
      log('fetcher.markdownContentLength', debug, { length: markdown.length }, COMPONENTS.NODE_FETCH);
      
      // 返回Markdown内容 (Return Markdown content)
      return {
        markdown,
        html,
        url: response.url,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      // 重新抛出错误 (Rethrow error)
      throw error;
    }
  }
} 