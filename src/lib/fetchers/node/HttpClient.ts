/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import fetch from "node-fetch";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "http";
import { log, COMPONENTS } from '../../logger.js';
import { RequestPayload } from '../common/types.js';
import { getRandomUserAgent, randomDelay, getSystemProxy } from '../common/utils.js';

/**
 * HTTP客户端类 (HTTP client class)
 * 处理HTTP请求、重定向和错误 (Handle HTTP requests, redirects and errors)
 */
export class HttpClient {
  /**
   * 准备请求头 (Prepare request headers)
   * @param headers 原始请求头 (Original headers)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 处理后的请求头 (Processed headers)
   */
  private static prepareHeaders(headers: Record<string, string> = {}, debug: boolean): Record<string, string> {
    const requestHeaders: Record<string, string> = { ...headers };

    // 添加随机User-Agent (Add random User-Agent)
    if (!requestHeaders['User-Agent']) {
      const userAgent = getRandomUserAgent();
      requestHeaders['User-Agent'] = userAgent;
      log('node.usingUserAgent', debug, { userAgent }, COMPONENTS.NODE_FETCH);
    }

    return requestHeaders;
  }

  /**
   * 设置代理 (Set proxy)
   * @param url 请求URL (Request URL)
   * @param proxy 代理URL (Proxy URL)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 代理Agent (Proxy agent)
   */
  private static setupProxy(url: string, proxy: string | undefined, debug: boolean): Agent | undefined {
    if (!proxy) return undefined;

    let agent: Agent | undefined = undefined;

    if (url.startsWith('https://')) {
      agent = new HttpsProxyAgent(proxy);
      log('node.usingHttpsProxy', debug, {}, COMPONENTS.NODE_FETCH);
    } else {
      agent = new HttpProxyAgent(proxy);
      log('node.usingHttpProxy', debug, {}, COMPONENTS.NODE_FETCH);
    }

    return agent;
  }

  /**
   * 处理请求延迟 (Handle request delay)
   * @param noDelay 是否禁用延迟 (Whether to disable delay)
   * @param isRedirect 是否是重定向请求 (Whether it's a redirect request)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   */
  private static async handleDelay(noDelay: boolean | undefined, isRedirect: boolean, debug: boolean): Promise<void> {
    if (!noDelay && isRedirect) {
      log('node.addingRandomDelay', debug, {}, COMPONENTS.NODE_FETCH);
      await randomDelay();
    }
  }

  /**
   * 处理重定向URL (Handle redirect URL)
   * @param location 重定向位置 (Redirect location)
   * @param currentUrl 当前URL (Current URL)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns 完整的重定向URL (Complete redirect URL)
   */
  private static buildRedirectUrl(location: string, currentUrl: string, debug: boolean): string {
    let redirectUrl = location;

    if (location.startsWith('/')) {
      const urlObj = new URL(currentUrl);
      redirectUrl = `${urlObj.protocol}//${urlObj.host}${location}`;
    } else if (!location.startsWith('http')) {
      redirectUrl = new URL(location, currentUrl).toString();
    }

    log('node.constructedFullRedirectUrl', debug, { redirectUrl }, COMPONENTS.NODE_FETCH);
    return redirectUrl;
  }

  /**
   * 处理错误响应 (Handle error response)
   * @param response 响应对象 (Response object)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns Promise<never> 抛出错误 (Throws error)
   */
  private static async handleErrorResponse(response: any, debug: boolean): Promise<never> {
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

  /**
   * 处理请求错误 (Handle request error)
   * @param error 错误对象 (Error object)
   * @param fetchStart 请求开始时间 (Request start time)
   * @param timeout 超时时间 (Timeout)
   * @param redirectCount 重定向计数 (Redirect count)
   * @param maxRedirects 最大重定向次数 (Maximum redirects)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @returns Promise<never> 抛出错误 (Throws error)
   */
  private static handleRequestError(
    error: any,
    fetchStart: number,
    timeout: number,
    redirectCount: number,
    maxRedirects: number,
    debug: boolean
  ): never {
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
  }

  /**
   * 执行带重定向处理的HTTP请求 (Execute HTTP request with redirect handling)
   * 支持自动处理重定向、超时和代理 (Supports automatic handling of redirects, timeouts, and proxies)
   */
  public static async fetchWithRedirects({
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
    const systemProxy = getSystemProxy(useSystemProxy, debug, COMPONENTS.NODE_FETCH);
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

        // 处理延迟 (Handle delay)
        await this.handleDelay(noDelay, redirectCount > 0, debug);

        // 准备请求头 (Prepare request headers)
        const requestHeaders = this.prepareHeaders(headers, debug);

        // 设置代理 (Set proxy)
        const agent = this.setupProxy(currentUrl, finalProxy, debug);

        // 准备请求选项 (Prepare request options)
        const fetchOptions: any = {
          method: 'GET',
          headers: requestHeaders,
          timeout,
          signal: controller.signal,
        };

        if (agent) {
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
          duration: Date.now() - fetchStart,
        }, COMPONENTS.NODE_FETCH);

        // 处理错误响应 (Handle error response)
        if (response.status >= 400) {
          await this.handleErrorResponse(response, debug);
        }

        // 检查是否需要重定向 (Check if redirect is needed)
        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
          // 获取重定向URL (Get redirect URL)
          const location = response.headers.get('location') as string;
          currentUrl = this.buildRedirectUrl(location, currentUrl, debug);

          // 增加重定向计数 (Increase redirect count)
          redirectCount++;

          // 记录重定向 (Log redirect)
          log('node.redirecting', debug, {
            to: currentUrl,
            redirectCount,
          }, COMPONENTS.NODE_FETCH);

          // 关闭body读取器 (Close body reader)
          await response.text();
          continue;
        }

        // 返回成功响应 (Return successful response)
        clearTimeout(timeoutId);
        return response;
      }

      // 重定向次数超过限制 (Redirect count exceeds limit)
      const error = new Error(`Too many redirects (${maxRedirects})`);
      (error as any).code = 'EMAXREDIRECTS';
      throw error;
    } catch (error) {
      clearTimeout(timeoutId);
      return this.handleRequestError(error, fetchStart, timeout, redirectCount, maxRedirects, debug);
    }
  }

  /**
   * 计算代理通道等待时间 (Calculate proxy channel wait time)
   * @param proxyType 代理类型 (Proxy type)
   * @param proxy 代理服务器 (Proxy server)
   * @param _debug 调试模式 (Debug mode)
   * @returns 等待时间（毫秒） (Wait time in milliseconds)
   */
  public static calculateProxyDelay(proxyType: string, proxy: string, _debug: boolean): number {
    // 根据代理类型和代理服务器地址计算合适的延迟时间
    if (!proxy) return 0;

    // 基础延迟根据代理类型不同
    const baseDelay = proxyType === 'http' ? 2000 : 3000;

    // 计算延迟变量 (0-1000ms)
    const variableDelay = Math.floor(Math.random() * 1000);

    return baseDelay + variableDelay;
  }
} 