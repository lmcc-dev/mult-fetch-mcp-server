/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import { RequestPayload } from './types.js';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
import { createLogger } from './i18n/logger.js';
import { t } from './i18n/index.js';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// 创建浏览器获取器日志记录器 (Create browser fetcher logger)
const logger = createLogger('BROWSER-FETCH');

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

// 添加stealth插件
// @ts-ignore - 忽略puppeteer-extra的类型错误
puppeteerExtra.use(StealthPlugin());

/**
 * 定义响应接口 (Define response interface)
 * 包含内容和错误状态 (Contains content and error status)
 */
interface FetchResponse {
  content: Array<{ type: string; text: string }>;
  isError: boolean;
}

/**
 * 浏览器模式获取器类 (Browser mode fetcher class)
 * 使用Puppeteer实现浏览器模式的网页获取 (Implements webpage fetching in browser mode using Puppeteer)
 */
export class BrowserFetcher {
  /**
   * 浏览器实例 (Browser instance)
   * 静态单例，避免重复创建 (Static singleton to avoid repeated creation)
   */
  private static browser: Browser | null = null;
  
  /**
   * 浏览器启动状态标志 (Browser startup status flag)
   * 防止并发启动多个浏览器实例 (Prevents concurrent startup of multiple browser instances)
   */
  private static browserStarting = false;
  
  /**
   * 浏览器启动Promise (Browser startup Promise)
   * 用于等待浏览器启动完成 (Used to wait for browser startup completion)
   */
  private static browserStartPromise: Promise<Browser> | null = null;
  
  /**
   * Cookie存储 (Cookie storage)
   * 存储不同域名的Cookie (Store cookies for different domains)
   */
  private static cookieStore: Record<string, string> = {};
  
  /**
   * 上次内存检查时间 (Last memory check time)
   */
  private static lastMemoryCheck: number = 0;
  
  /**
   * 内存检查间隔（毫秒） (Memory check interval in milliseconds)
   */
  private static memoryCheckInterval: number = 60000;

  /**
   * 检查内存使用情况 (Check memory usage)
   * 定期监控浏览器内存使用，必要时关闭浏览器释放资源 (Periodically monitor browser memory usage, close browser to release resources when necessary)
   * @param debug 是否启用调试输出 (Whether to enable debug output)
   */
  private static checkMemoryUsage(debug: boolean = false): void {
    const now = Date.now();
    
    // 每隔一段时间检查一次内存 (Check memory at regular intervals)
    if (now - this.lastMemoryCheck < this.memoryCheckInterval) {
      return;
    }
    
    this.lastMemoryCheck = now;
    
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const rss = Math.round(memoryUsage.rss / 1024 / 1024);
      
      // 输出内存使用情况 (Output memory usage)
      log('browser.memoryUsage', debug, { heapUsed, heapTotal, rss });
      
      // 如果内存使用过高，关闭浏览器 (If memory usage is too high, close the browser)
      if (heapUsed > 500 || rss > 1000) {
        log('browser.memoryTooHigh', debug, { heapUsed, heapTotal, rss });
        this.closeBrowser(debug);
      }
    } catch (error) {
      log('browser.memoryCheckError', debug, { error: String(error) });
    }
  }

  /**
   * 获取系统代理设置 (Get system proxy settings)
   * @param useSystemProxy 是否使用系统代理 (Whether to use system proxy)
   * @returns 系统代理URL或undefined (System proxy URL or undefined)
   */
  private static getSystemProxy(useSystemProxy: boolean = true): string | undefined {
    // 如果不使用系统代理，直接返回undefined (If not using system proxy, return undefined directly)
    if (!useSystemProxy) {
      logger.info('fetcher.systemProxyDisabled');
      return undefined;
    }
    
    // 检查所有可能的代理环境变量 (Check all possible proxy environment variables)
    const proxyVars = [
      'HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 
      'ALL_PROXY', 'all_proxy', 'NO_PROXY', 'no_proxy'
    ];
    
    // 输出所有环境变量的值，帮助调试 (Output all environment variable values to help debugging)
    logger.info('fetcher.checkingProxyEnv');
    for (const varName of proxyVars) {
      logger.info('fetcher.envVarValue', { 
        name: varName, 
        value: process.env[varName] || t('fetcher.notSet') 
      });
    }
    
    // 尝试获取代理设置 (Try to get proxy settings)
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 
                     process.env.http_proxy || process.env.https_proxy || 
                     process.env.ALL_PROXY || process.env.all_proxy;
    
    if (proxyUrl) {
      logger.info('fetcher.foundSystemProxy', { proxy: proxyUrl });
      return proxyUrl;
    }
    
    // 如果环境变量中没有找到代理，尝试从系统命令获取
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
      
      logger.info('fetcher.systemCommandProxySettings', { output: shellOutput.trim() });
      
      // 解析输出找到代理 URL
      const proxyMatch = shellOutput.match(/(?:HTTP_PROXY|HTTPS_PROXY|http_proxy|https_proxy)=([^\s]+)/i);
      if (proxyMatch && proxyMatch[1]) {
        const systemProxyUrl = proxyMatch[1];
        logger.info('fetcher.foundProxyFromCommand', { proxy: systemProxyUrl });
        return systemProxyUrl;
      }
    } catch (error) {
      logger.error('fetcher.errorGettingProxyFromCommand', { error: error.toString() });
    }
    
    // 检查是否设置了 NO_PROXY (Check if NO_PROXY is set)
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (noProxy) {
      logger.info('fetcher.foundNoProxy', { noProxy: noProxy });
    }
    
    logger.info('fetcher.noSystemProxyFound');
    return undefined;
  }

  // 获取或启动浏览器实例
  private static async getBrowser({
    proxy,
    debug = false,
    useSystemProxy = true
  }: {
    proxy?: string;
    debug?: boolean;
    useSystemProxy?: boolean;
  }): Promise<Browser> {
    // 如果浏览器已经在启动中，等待启动完成
    if (this.browserStartPromise) {
      log('browser.waiting', debug);
      return this.browserStartPromise;
    }

    this.browserStarting = true;
    log('browser.starting', debug, { debug });

    // 获取代理设置 - 优先使用用户指定的代理，其次使用系统代理
    const proxyServer = proxy || (useSystemProxy ? this.getSystemProxy(useSystemProxy) : undefined);
    
    // 详细记录代理设置情况
    if (debug) {
      if (proxy) {
        log('browser.usingSpecifiedProxy', debug, { proxy });
      } else if (useSystemProxy) {
        log('browser.attemptingToUseSystemProxy', debug);
      } else {
        log('browser.notUsingProxy', debug);
      }
      
      log('browser.finalProxyUsed', debug, { proxy: proxyServer || t('fetcher.none') });
    }
    
    // 创建启动Promise
    this.browserStartPromise = (async () => {
      try {
        // 准备浏览器启动参数
        const args = [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-extensions',
          '--disable-features=TranslateUI,BlinkGenPropertyTrees',
          '--disable-ipc-flooding-protection',
        ];
        
        // 如果有代理，添加代理参数
        if (proxyServer) {
          args.push(`--proxy-server=${proxyServer}`);
          log('browser.usingProxy', debug, { proxy: proxyServer });
        }
        
        // 使用puppeteer-extra和stealth插件
        // @ts-ignore - 忽略类型错误
        const browser = await puppeteerExtra.launch({
          // @ts-ignore - 忽略headless类型错误
          headless: "new",
          args: args,
          defaultViewport: {
            width: 1920,
            height: 1080
          },
          timeout: 30000, // 减少启动超时时间
          ignoreHTTPSErrors: true,
        });

        log('browser.startupSuccess', debug);
        this.browser = browser;

        // 设置浏览器关闭事件处理
        browser.on('disconnected', () => {
          log('browser.closed', debug);
          this.browser = null;
          this.browserStarting = false;
          this.browserStartPromise = null;
        });

        return browser;
      } catch (error) {
        log('browser.startingFailed', debug, { error: String(error) });
        this.browserStarting = false;
        this.browserStartPromise = null;
        throw error;
      }
    })();

    return this.browserStartPromise;
  }

  // 关闭浏览器
  public static async closeBrowser(debug: boolean = false): Promise<void> {
    if (this.browser) {
      log('browser.closing', debug, { debug });
      
      try {
        await this.browser.close();
        this.browser = null;
        this.browserStartPromise = null;
        this.browserStarting = false;
        log('browser.closed', debug, { debug });
      } catch (error) {
        log('browser.closingError', debug, { error: String(error) });
      }
    }
  }

  // 从URL中提取域名
  private static getDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return '';
    }
  }

  // 保存Cookie到存储
  private static saveCookies(url: string, cookies: string): void {
    const domain = this.getDomain(url);
    if (domain) {
      this.cookieStore[domain] = cookies;
    }
  }

  // 从存储获取Cookie
  private static getCookies(url: string): string | undefined {
    const domain = this.getDomain(url);
    return domain ? this.cookieStore[domain] : undefined;
  }

  // 自动滚动页面到底部
  private static async autoScroll(page: Page, debug: boolean): Promise<void> {
    log('browser.scrolling', debug, { debug });
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    log('browser.scrollCompleted', debug, { debug });
  }

  // 检查是否存在Cloudflare保护并尝试绕过
  private static async handleCloudflareProtection(page: Page, url: string, debug: boolean): Promise<boolean> {
    try {
      log('browser.checkingCloudflare', debug, { debug });
      
      // 检查是否存在Cloudflare保护
      const cloudflareDetected = await page.evaluate(() => {
        return document.title.includes('Cloudflare') || 
               document.querySelector('div.cf-browser-verification') !== null ||
               document.querySelector('div.cf-challenge-running') !== null;
      });
      
      if (!cloudflareDetected) {
        return true; // 没有Cloudflare保护
      }
      
      log('browser.cloudflareDetected', debug, { debug });
      
      // 尝试绕过Cloudflare保护
      log('browser.simulatingHuman', debug);
      await this.simulateHumanBehavior(page, debug);
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 检查是否仍然在Cloudflare页面
      const stillOnCloudflare = await page.evaluate(() => {
        return document.title.includes('Cloudflare') || 
               document.querySelector('div.cf-browser-verification') !== null ||
               document.querySelector('div.cf-challenge-running') !== null;
      });
      
      if (stillOnCloudflare) {
        log('browser.stillOnCloudflare', debug, { debug });
        
        // 尝试刷新页面
        await page.reload({ waitUntil: 'networkidle2' });
        
        // 再次模拟人类行为
        log('browser.simulatingHuman', debug);
        await this.simulateHumanBehavior(page, debug);
        
        // 再次等待
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 最终检查
        const finalCheck = await page.evaluate(() => {
          return document.title.includes('Cloudflare') || 
                 document.querySelector('div.cf-browser-verification') !== null ||
                 document.querySelector('div.cf-challenge-running') !== null;
        });
        
        if (finalCheck) {
          log('browser.bypassFailed', debug, { debug });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      log('browser.cloudflareError', debug, { error: String(error) });
      return false;
    }
  }
  
  // 模拟人类行为以绕过Cloudflare保护
  private static async simulateHumanBehavior(page: Page, debug: boolean): Promise<void> {
    try {
      log('browser.simulatingHuman', debug);
      
      // 减少模拟行为的复杂度，提高性能
      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.move(200, 200);
      await page.mouse.up();
      
      // 随机点击页面上的一些元素
      await page.evaluate(() => {
        const elements = document.querySelectorAll('button, a, input');
        if (elements.length > 0) {
          const randomElement = elements[Math.floor(Math.random() * elements.length)];
          if (randomElement) {
            (randomElement as HTMLElement).click();
          }
        }
      });
      
    } catch (error) {
      log('browser.simulatingHumanError', debug, { error: String(error) });
    }
  }

  /**
   * 使用Puppeteer获取网页内容 (Get webpage content using Puppeteer)
   * 浏览器模式获取的底层实现方法 (Low-level implementation method for browser mode fetching)
   * @param params 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async fetch({
    url,
    headers = {},
    proxy,
    timeout = 30000,
    waitForSelector = 'body',
    waitForTimeout = 5000,
    scrollToBottom = false,
    saveCookies = true,
    closeBrowser = false,
    useSystemProxy = true,
    debug = false,
  }: RequestPayload): Promise<FetchResponse> {
    log('browser.fetchRequest', debug, {
      url,
      waitForSelector,
      waitForTimeout,
      scrollToBottom,
      saveCookies,
      closeBrowser,
      timeout,
      proxy,
      useSystemProxy,
      debug
    });
    
    // 获取代理设置 - 优先使用用户指定的代理，其次使用系统代理
    const effectiveProxy = proxy || (useSystemProxy ? this.getSystemProxy(useSystemProxy) : undefined);
    
    // 详细记录代理设置情况
    if (debug) {
      if (proxy) {
        log('browser.usingSpecifiedProxy', debug, { proxy });
      } else if (useSystemProxy) {
        log('browser.attemptingToUseSystemProxy', debug);
      } else {
        log('browser.notUsingProxy', debug);
      }
      
      log('browser.finalProxyUsed', debug, { proxy: effectiveProxy || t('fetcher.none') });
    }

    try {
      // 获取浏览器实例
      const browser = await this.getBrowser({
        proxy,
        debug,
        useSystemProxy
      });
      
      // 创建新页面
      const page = await browser.newPage();
      
      try {
        // 设置用户代理
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // 设置请求头
        await page.setExtraHTTPHeaders(headers);
        
        // 如果有存储的Cookie，设置Cookie
        const storedCookies = this.getCookies(url);
        if (storedCookies && debug) {
          log('browser.usingStoredCookies', debug, { domain: this.getDomain(url) });
          await page.setCookie(...JSON.parse(storedCookies));
        }
        
        // 如果提供了代理，设置代理
        if (effectiveProxy) {
          log('browser.usingProxy', debug, { proxy: effectiveProxy });
          // 注意：Puppeteer需要在启动时设置代理，这里只是记录
        }
        
        // 导航到URL
        log('browser.navigating', debug, { debug });
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: timeout
        });
        
        // 处理Cloudflare保护
        const bypassedCloudflare = await this.handleCloudflareProtection(page, url, debug);
        if (!bypassedCloudflare) {
          log('browser.continuingWithoutBypass', debug, { debug });
        }
        
        // 如果指定了等待选择器，则等待
        if (waitForSelector) {
          log('browser.waitingForSelector', debug, { selector: waitForSelector, debug });
          await page.waitForSelector(waitForSelector, { timeout });
        }
        
        // 等待指定的时间
        if (waitForTimeout > 0) {
          log('browser.waitingForTimeout', debug, { timeout: waitForTimeout, debug });
          await new Promise(resolve => setTimeout(resolve, waitForTimeout));
        }
        
        // 如果需要滚动到底部
        if (scrollToBottom) {
          log('browser.scrolling', debug, { debug });
          await this.autoScroll(page, debug);
        }
        
        // 获取页面内容
        log('browser.gettingContent', debug, { debug });
        const content = await page.content();
        
        // 如果启用了保存Cookie
        if (saveCookies) {
          log('browser.savingCookies', debug, { debug });
          const context = page.browser().defaultBrowserContext();
          const cookies = await context.cookies();
          this.saveCookies(url, JSON.stringify(cookies));
        }
        
        // 检查内容大小
        const contentLength = content.length;
        log('browser.contentLength', debug, { length: contentLength, debug });
        
        // 如果内容太大，截断它
        const maxContentLength = 10 * 1024 * 1024; // 10MB
        if (contentLength > maxContentLength) {
          log('browser.contentTruncated', debug, { debug });
          const truncatedContent = content.substring(0, maxContentLength);
          return { 
            content: [{ 
              type: "text", 
              text: truncatedContent + `\n\n[内容已截断，原始大小: ${contentLength} 字节]` 
            }], 
            isError: false 
          };
        }
        
        return { content: [{ type: "text", text: content }], isError: false };
      } finally {
        // 关闭页面
        await page.close();
        log('browser.pageClosed', debug, { debug });
      }
    } catch (error) {
      log('browser.fetchError', debug, { error: String(error) });
      return { 
        content: [{ 
          type: "text", 
          text: `Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}` 
        }], 
        isError: true 
      };
    }
  }

  /**
   * 使用Puppeteer获取HTML内容 (Get HTML content using Puppeteer)
   * 通过浏览器模式获取网页HTML (Fetch webpage HTML in browser mode)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async html(requestPayload: RequestPayload & {
    waitForSelector?: string;
    waitForTimeout?: number;
    scrollToBottom?: boolean;
    saveCookies?: boolean;
    closeBrowser?: boolean;
    useSystemProxy?: boolean;
  }): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> {
    const { 
      url, 
      headers = {},
      proxy,
      timeout = 30000,
      debug = false, 
      waitForSelector = 'body', 
      waitForTimeout = 5000, 
      scrollToBottom = false,
      saveCookies = true,
      closeBrowser = false,
      useSystemProxy = true
    } = requestPayload;
    
    // 如果启用了系统代理且没有指定代理，则使用系统代理
    const finalProxy = proxy || (useSystemProxy ? this.getSystemProxy(useSystemProxy) : undefined);
    
    // 如果只是要关闭浏览器，不需要获取内容
    if (closeBrowser && url === 'about:blank') {
      log('browser.closingInstance', debug, { debug });
      await this.closeBrowser(debug);
      return {
        content: [{ type: 'text', text: String(t('browser.closed')) }],
        isError: false
      };
    }
    
    // 添加最大重试次数
    const maxRetries = 3;
    
    // 递归函数，用于重试
    const fetchWithRetry = async (retryCount = 0): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> => {
      try {
        log('browser.fetchingWithRetry', debug, { attempt: retryCount + 1, maxAttempts: maxRetries, url });
        
        // 检查内存使用情况
        this.checkMemoryUsage(debug);
        
        // 获取浏览器实例
        const browser = await this.getBrowser({
          proxy,
          debug,
          useSystemProxy
        });
        
        // 创建新页面
        const page = await browser.newPage();
        
        try {
          // 设置用户代理
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          
          // 注入脚本以修改浏览器指纹
          await page.evaluateOnNewDocument(() => {
            // 覆盖webdriver属性
            Object.defineProperty(navigator, 'webdriver', {
              get: () => false,
            });
            
            // 添加语言
            Object.defineProperty(navigator, 'languages', {
              get: () => ['zh-CN', 'zh', 'en-US', 'en'],
            });
            
            // 添加插件
            Object.defineProperty(navigator, 'plugins', {
              get: () => {
                return [
                  {
                    0: {
                      type: 'application/x-google-chrome-pdf',
                      suffixes: 'pdf',
                      description: 'Portable Document Format',
                      enabledPlugin: Plugin,
                    },
                    name: 'Chrome PDF Plugin',
                    filename: 'internal-pdf-viewer',
                    description: 'Portable Document Format',
                  },
                ];
              },
            });
          });
          
          // 如果有存储的Cookie，设置Cookie
          const storedCookies = this.getCookies(url);
          if (storedCookies && debug) {
            log('browser.usingStoredCookies', debug, { domain: this.getDomain(url) });
            await page.setCookie(...JSON.parse(storedCookies));
          }
          
          // 设置请求头
          await page.setExtraHTTPHeaders(headers);
          
          // 如果提供了代理，设置代理
          if (finalProxy) {
            log('browser.usingProxy', debug, { proxy: finalProxy });
            // 注意：Puppeteer需要在启动时设置代理，这里只是记录
          }
          
          // 导航到URL
          log('browser.navigating', debug, { debug });
          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: timeout
          });
          
          // 处理Cloudflare保护
          const bypassedCloudflare = await this.handleCloudflareProtection(page, url, debug);
          if (!bypassedCloudflare) {
            log('browser.unableToBypassCloudflare', debug, { debug });
          }
          
          // 如果指定了等待选择器，则等待
          if (waitForSelector) {
            log('browser.waitingForSelector', debug, { selector: waitForSelector, debug });
            await page.waitForSelector(waitForSelector, { timeout });
          }
          
          // 等待指定的时间
          if (waitForTimeout > 0) {
            log('browser.waitingForTimeout', debug, { timeout: waitForTimeout, debug });
            await new Promise(resolve => setTimeout(resolve, waitForTimeout));
          }
          
          // 如果需要滚动到底部
          if (scrollToBottom) {
            log('browser.scrolling', debug, { debug });
            await this.autoScroll(page, debug);
          }
          
          // 获取页面内容
          log('browser.gettingContent', debug, { debug });
          const content = await page.content();
          
          // 如果启用了保存Cookie
          if (saveCookies) {
            log('browser.savingCookies', debug, { debug });
            const context = page.browser().defaultBrowserContext();
            const cookies = await context.cookies();
            this.saveCookies(url, JSON.stringify(cookies));
          }
          
          // 检查内容大小
          const contentLength = content.length;
          log('browser.contentLength', debug, { length: contentLength, debug });
          
          // 如果内容太大，截断它
          const maxContentLength = 10 * 1024 * 1024; // 10MB
          if (contentLength > maxContentLength) {
            log('browser.contentTooLarge', debug, { debug });
            const truncatedContent = content.substring(0, maxContentLength);
            return { 
              content: [{ 
                type: "text", 
                text: truncatedContent + `\n\n[内容已截断，原始大小: ${contentLength} 字节]` 
              }], 
              isError: false 
            };
          }
          
          return { content: [{ type: "text", text: content }], isError: false };
        } finally {
          // 关闭页面
          await page.close();
          log('browser.pageClosed', debug, { debug });
        }
      } catch (error) {
        log('browser.fetchErrorWithAttempt', debug, { error: String(error), attempt: retryCount + 1, maxAttempts: maxRetries + 1 });
        
        // 如果还有重试次数，则重试
        if (retryCount < maxRetries) {
          // 添加指数退避延迟
          const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
          log('browser.retryingAfterDelay', debug, { delayMs });
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return fetchWithRetry(retryCount + 1);
        }
        
        // 超过最大重试次数，返回错误
        return { 
          content: [{ 
            type: "text", 
            text: `Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}` 
          }], 
          isError: true 
        };
      }
    };
    
    if (closeBrowser) {
      log('browser.closingInstance', debug, {});
      await this.closeBrowser(debug);
    }
    
    return fetchWithRetry();
  }

  /**
   * 使用Puppeteer获取JSON内容 (Get JSON content using Puppeteer)
   * 通过浏览器模式获取JSON数据 (Fetch JSON data in browser mode)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async json(requestPayload: RequestPayload & {
    waitForSelector?: string;
    waitForTimeout?: number;
    scrollToBottom?: boolean;
    saveCookies?: boolean;
    closeBrowser?: boolean;
    useSystemProxy?: boolean;
  }): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> {
    const { 
      url, 
      headers = {},
      proxy,
      timeout = 30000,
      debug = false, 
      waitForSelector = 'body', 
      waitForTimeout = 5000, 
      scrollToBottom = false,
      saveCookies = true,
      closeBrowser = false,
      useSystemProxy = true
    } = requestPayload;
    
    // 如果启用了系统代理且没有指定代理，则使用系统代理
    const finalProxy = proxy || (useSystemProxy ? this.getSystemProxy(useSystemProxy) : undefined);
    
    // 如果只是要关闭浏览器，不需要获取内容
    if (closeBrowser && url === 'about:blank') {
      log('browser.closingInstance', debug, {});
      await this.closeBrowser(debug);
      return {
        content: [{ type: 'text', text: String(t('browser.closed')) }],
        isError: false
      };
    }
    
    // 添加最大重试次数
    const maxRetries = 2;
    
    // 递归函数，用于重试
    const fetchWithRetry = async (retryCount = 0): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> => {
      try {
        log('browser.fetchingWithRetry', debug, { attempt: retryCount + 1, maxAttempts: maxRetries + 1, url });
        
        // 检查内存使用情况
        this.checkMemoryUsage(debug);
        
        // 获取HTML内容
        const htmlResult = await this.html({
          url,
          headers,
          proxy,
          timeout,
          debug,
          waitForSelector,
          waitForTimeout,
          scrollToBottom,
          saveCookies,
          closeBrowser,
          useSystemProxy
        });
        
        if (htmlResult.isError) {
          return htmlResult;
        }
        
        // 尝试解析JSON
        try {
          const htmlContent = htmlResult.content[0].text;
          
          // 从HTML中提取JSON
          const jsonMatch = htmlContent.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i) || 
                           htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          
          let jsonText = jsonMatch ? jsonMatch[1] : htmlContent;
          
          // 尝试清理和解析JSON
          jsonText = jsonText.trim();
          const jsonData = JSON.parse(jsonText);
          
          return {
            content: [{ type: "text", text: JSON.stringify(jsonData, null, 2) }],
            isError: false
          };
        } catch (error) {
          log('browser.failedToParseJSON', debug, { error: String(error) });
          return {
            content: [{ type: "text", text: `Failed to parse JSON: ${(error as Error).message}` }],
            isError: true
          };
        }
      } catch (error) {
        log('browser.fetchErrorWithAttempt', debug, { error: String(error), attempt: retryCount + 1, maxAttempts: maxRetries + 1 });
        
        // 如果还有重试次数，则重试
        if (retryCount < maxRetries) {
          // 添加指数退避延迟
          const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
          log('browser.retryingAfterDelay', debug, { delayMs });
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return fetchWithRetry(retryCount + 1);
        }
        
        // 超过最大重试次数，返回错误
        return { 
          content: [{ 
            type: "text", 
            text: `Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}` 
          }], 
          isError: true 
        };
      }
    };
    
    if (closeBrowser) {
      log('browser.closingInstance', debug, {});
      await this.closeBrowser(debug);
    }
    
    return fetchWithRetry();
  }

  /**
   * 使用Puppeteer获取纯文本内容 (Get plain text content using Puppeteer)
   * 通过浏览器模式获取网页纯文本 (Fetch webpage plain text in browser mode)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async txt(requestPayload: RequestPayload & {
    waitForSelector?: string;
    waitForTimeout?: number;
    scrollToBottom?: boolean;
    saveCookies?: boolean;
    closeBrowser?: boolean;
    useSystemProxy?: boolean;
  }): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> {
    const { 
      url, 
      headers = {},
      proxy,
      timeout = 30000,
      debug = false, 
      waitForSelector = 'body', 
      waitForTimeout = 5000, 
      scrollToBottom = false,
      saveCookies = true,
      closeBrowser = false,
      useSystemProxy = true
    } = requestPayload;
    
    // 如果启用了系统代理且没有指定代理，则使用系统代理
    const finalProxy = proxy || (useSystemProxy ? this.getSystemProxy(useSystemProxy) : undefined);
    
    // 如果只是要关闭浏览器，不需要获取内容
    if (closeBrowser && url === 'about:blank') {
      log('browser.closingInstance', debug, {});
      await this.closeBrowser(debug);
      return {
        content: [{ type: 'text', text: String(t('browser.closed')) }],
        isError: false
      };
    }
    
    // 添加最大重试次数
    const maxRetries = 2;
    
    // 递归函数，用于重试
    const fetchWithRetry = async (retryCount = 0): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> => {
      try {
        log('browser.fetchingWithRetry', debug, { attempt: retryCount + 1, maxAttempts: maxRetries + 1, url });
        
        // 检查内存使用情况
        this.checkMemoryUsage(debug);
        
        // 获取HTML内容
        const htmlResult = await this.html({
          url,
          headers,
          proxy,
          timeout,
          debug,
          waitForSelector,
          waitForTimeout,
          scrollToBottom,
          saveCookies,
          closeBrowser,
          useSystemProxy
        });
        
        if (htmlResult.isError) {
          return htmlResult;
        }
        
        // 提取纯文本
        const text = htmlResult.content[0].text;
        
        return {
          content: [{ type: "text", text }],
          isError: false
        };
      } catch (error) {
        log('browser.fetchErrorWithAttempt', debug, { error: String(error), attempt: retryCount + 1, maxAttempts: maxRetries + 1 });
        
        // 如果还有重试次数，则重试
        if (retryCount < maxRetries) {
          // 添加指数退避延迟
          const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
          log('browser.retryingAfterDelay', debug, { delayMs });
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return fetchWithRetry(retryCount + 1);
        }
        
        // 超过最大重试次数，返回错误
        return { 
          content: [{ 
            type: "text", 
            text: `Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}` 
          }], 
          isError: true 
        };
      }
    };
    
    if (closeBrowser) {
      log('browser.closingInstance', debug, {});
      await this.closeBrowser(debug);
    }
    
    return fetchWithRetry();
  }

  /**
   * 使用Puppeteer获取Markdown内容 (Get Markdown content using Puppeteer)
   * 通过浏览器模式获取HTML并转换为Markdown (Fetch HTML in browser mode and convert to Markdown)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  static async markdown(requestPayload: RequestPayload & {
    waitForSelector?: string;
    waitForTimeout?: number;
    scrollToBottom?: boolean;
    saveCookies?: boolean;
    closeBrowser?: boolean;
    useSystemProxy?: boolean;
  }): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> {
    const { 
      url, 
      headers = {},
      proxy,
      timeout = 30000,
      debug = false, 
      waitForSelector = 'body', 
      waitForTimeout = 5000, 
      scrollToBottom = false,
      saveCookies = true,
      closeBrowser = false,
      useSystemProxy = true
    } = requestPayload;
    
    // 如果启用了系统代理且没有指定代理，则使用系统代理
    const finalProxy = proxy || (useSystemProxy ? this.getSystemProxy(useSystemProxy) : undefined);
    
    try {
      log('browser.startingBrowserFetchForMarkdown', debug, { url });
      
      // 获取HTML内容
      const result = await this.html({
        url,
        headers,
        proxy,
        timeout,
        debug,
        waitForSelector,
        waitForTimeout,
        scrollToBottom,
        saveCookies,
        closeBrowser,
        useSystemProxy
      });
      
      if (result.isError) {
        return result;
      }
      
      // 将HTML转换为Markdown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
      });
      
      const markdown = turndownService.turndown(result.content[0].text);
      
      return {
        content: [{ type: "text", text: markdown }],
        isError: false
      };
    } catch (error) {
      log('browser.errorInBrowserFetchForMarkdown', debug, { error: String(error) });
      return {
        content: [{ type: "text", text: (error as Error).message }],
        isError: true
      };
    }
  }
} 