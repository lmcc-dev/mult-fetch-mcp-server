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
import { t } from './i18n/index.js';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { log, COMPONENTS } from './logger.js';
import { NodeFetcher } from './NodeFetcher.js';
import { JSDOM } from 'jsdom';

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
      
      // 记录内存使用情况
      log('browser.memoryUsage', debug, { heapUsed, heapTotal, rss }, COMPONENTS.BROWSER_FETCH);
      
      // 如果内存使用过高，记录警告
      if (heapUsed > 500 || rss > 1000) {
        log('browser.memoryTooHigh', debug, { heapUsed, heapTotal, rss }, COMPONENTS.BROWSER_FETCH);
      }
    } catch (error) {
      log('browser.memoryCheckError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
    }
  }

  /**
   * 获取系统代理设置 (Get system proxy settings)
   * @param useSystemProxy 是否使用系统代理 (Whether to use system proxy)
   * @returns 系统代理URL或undefined (System proxy URL or undefined)
   */
  private static getSystemProxy(useSystemProxy: boolean = true, debug: boolean = false): string | undefined {
    // 如果不使用系统代理，直接返回undefined (If not using system proxy, return undefined directly)
    if (!useSystemProxy) {
      log('fetcher.systemProxyDisabled', debug, {}, COMPONENTS.BROWSER_FETCH);
      return undefined;
    }
    
    // 检查所有可能的代理环境变量 (Check all possible proxy environment variables)
    const proxyVars = [
      'HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 
      'ALL_PROXY', 'all_proxy', 'NO_PROXY', 'no_proxy'
    ];
    
    // 输出所有环境变量的值，帮助调试 (Output all environment variable values to help debugging)
    log('fetcher.checkingProxyEnv', debug, {}, COMPONENTS.BROWSER_FETCH);
    for (const varName of proxyVars) {
      log('fetcher.envVarValue', debug, { 
        envVar: varName, 
        value: process.env[varName] || t('fetcher.notSet') 
      }, COMPONENTS.BROWSER_FETCH);
    }
    
    // 尝试获取代理设置 (Try to get proxy settings)
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 
                     process.env.http_proxy || process.env.https_proxy || 
                     process.env.ALL_PROXY || process.env.all_proxy;
    
    if (proxyUrl) {
      log('fetcher.foundSystemProxy', debug, { proxy: proxyUrl }, COMPONENTS.BROWSER_FETCH);
      return proxyUrl;
    }
    
    // 尝试从系统命令获取代理设置
    try {
      let shellOutput = '';
      if (process.platform === 'win32') {
        // Windows 系统使用 set 命令，忽略错误 (Windows systems use set command, ignore errors)
        try {
          shellOutput = execSync('set http_proxy & set https_proxy & set HTTP_PROXY & set HTTPS_PROXY', { encoding: 'utf8' });
        } catch (winError) {
          log('fetcher.errorGettingWindowsEnvVars', debug, { error: winError.toString() }, COMPONENTS.BROWSER_FETCH);
        }
      } else {
        // Unix 系统使用 env 命令，忽略错误 (Unix systems use env command, ignore errors)
        try {
          // 使用 env 命令获取所有环境变量，不使用 grep 过滤，避免在没有匹配时返回非零退出码
          shellOutput = execSync('env', { encoding: 'utf8' });
          // 在代码中过滤代理相关的环境变量
          shellOutput = shellOutput.split('\n')
            .filter(line => line.toLowerCase().includes('proxy'))
            .join('\n');
        } catch (unixError) {
          log('fetcher.errorGettingUnixEnvVars', debug, { error: unixError.toString() }, COMPONENTS.BROWSER_FETCH);
        }
      }
      
      if (shellOutput.trim()) {
        log('fetcher.systemCommandProxySettings', debug, { output: shellOutput.trim() }, COMPONENTS.BROWSER_FETCH);
        
        // 解析输出找到代理 URL
        const proxyMatch = shellOutput.match(/(?:HTTP_PROXY|HTTPS_PROXY|http_proxy|https_proxy)=([^\s]+)/i);
        if (proxyMatch && proxyMatch[1]) {
          const systemProxyUrl = proxyMatch[1];
          log('fetcher.foundProxyFromCommand', debug, { proxy: systemProxyUrl }, COMPONENTS.BROWSER_FETCH);
          return systemProxyUrl;
        }
      } else {
        log('fetcher.noSystemProxyFound', debug, {}, COMPONENTS.BROWSER_FETCH);
      }
    } catch (error) {
      log('fetcher.errorGettingSystemEnvVars', debug, { error: error.toString() }, COMPONENTS.BROWSER_FETCH);
    }
    
    // 检查是否设置了 NO_PROXY
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (noProxy) {
      log('fetcher.foundNoProxy', debug, { noProxy: noProxy }, COMPONENTS.BROWSER_FETCH);
    }
    
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
    // 如果浏览器正在启动，等待启动完成
    if (this.browserStarting) {
      log('browser.waiting', debug, {}, COMPONENTS.BROWSER_FETCH);
      return this.browserStartPromise!;
    }
    
    // 如果浏览器已经启动，直接返回
    if (this.browser) {
      log('browser.starting', debug, { debug }, COMPONENTS.BROWSER_FETCH);
      return this.browser;
    }
    
    this.browserStarting = true;
    this.browserStartPromise = (async () => {
      try {
        // 获取代理设置 - 优先使用用户指定的代理，其次使用系统代理
        const proxyServer = proxy || (useSystemProxy ? this.getSystemProxy(useSystemProxy, debug) : undefined);
        
        // 详细记录代理设置情况
        if (proxy) {
          log('fetcher.usingSpecifiedProxy', debug, { proxy }, COMPONENTS.BROWSER_FETCH);
        } else if (useSystemProxy) {
          log('fetcher.attemptingToUseSystemProxy', debug, {}, COMPONENTS.BROWSER_FETCH);
        } else {
          log('fetcher.notUsingProxy', debug, {}, COMPONENTS.BROWSER_FETCH);
        }
        
        log('fetcher.finalProxyUsed', debug, { proxy: proxyServer || t('fetcher.none') }, COMPONENTS.BROWSER_FETCH);
        
        // 启动浏览器
        const args = [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certifcate-errors',
          '--ignore-certifcate-errors-spki-list',
          '--disable-features=site-per-process',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--allow-running-insecure-content',
          '--disable-blink-features=AutomationControlled',
        ];
        
        // 如果有代理，添加代理参数
        if (proxyServer) {
          args.push(`--proxy-server=${proxyServer}`);
          log('browser.usingProxy', debug, { proxy: proxyServer }, COMPONENTS.BROWSER_FETCH);
        }
        
        // 启动浏览器
        // @ts-ignore - 忽略puppeteer-extra的类型错误
        const browser = await puppeteerExtra.launch({
          headless: 'new',
          args,
          ignoreHTTPSErrors: true,
          defaultViewport: {
            width: 1920,
            height: 1080
          }
        });
        
        this.browser = browser;
        log('browser.startupSuccess', debug, {}, COMPONENTS.BROWSER_FETCH);
        
        // 设置浏览器关闭事件
        browser.on('disconnected', () => {
          this.browser = null;
          log('browser.closed', debug, {}, COMPONENTS.BROWSER_FETCH);
        });
        
        return browser;
      } catch (error) {
        this.browser = null;
        log('browser.startingFailed', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
        throw error;
      } finally {
        this.browserStarting = false;
      }
    })();
    
    return this.browserStartPromise;
  }

  // 关闭浏览器
  public static async closeBrowser(debug: boolean = false): Promise<void> {
    log('browser.closing', debug, { debug }, COMPONENTS.BROWSER_FETCH);
    
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        log('browser.closed', debug, { debug }, COMPONENTS.BROWSER_FETCH);
      }
    } catch (error) {
      log('browser.closingError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
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
    log('browser.scrolling', debug, { debug }, COMPONENTS.BROWSER_FETCH);
    
    try {
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
      
      log('browser.scrollCompleted', debug, { debug }, COMPONENTS.BROWSER_FETCH);
    } catch (error) {
      // 忽略滚动错误，不影响主要功能
    }
  }

  // 检查是否存在Cloudflare保护并尝试绕过
  private static async handleCloudflareProtection(page: Page, url: string, debug: boolean): Promise<boolean> {
    log('browser.checkingCloudflare', debug, { debug }, COMPONENTS.BROWSER_FETCH);
    
    try {
      // 检查是否存在Cloudflare挑战页面的特征
      const isCloudflarePage = await page.evaluate(() => {
        return document.title.includes('Cloudflare') || 
               document.title.includes('Security Check') ||
               document.body.textContent?.includes('Checking your browser') ||
               document.body.textContent?.includes('Please wait') ||
               document.querySelector('#challenge-form') !== null;
      });
      
      if (isCloudflarePage) {
        log('browser.cloudflareDetected', debug, { debug }, COMPONENTS.BROWSER_FETCH);
        
        // 模拟人类行为以通过Cloudflare检查
        log('browser.simulatingHuman', debug, {}, COMPONENTS.BROWSER_FETCH);
        await this.simulateHumanBehavior(page, debug);
        
        // 等待页面加载完成
        await page.waitForNavigation({ 
          waitUntil: 'networkidle2',
          timeout: 30000
        }).catch(() => {});
        
        // 再次检查是否仍在Cloudflare页面
        const stillOnCloudflare = await page.evaluate(() => {
          return document.title.includes('Cloudflare') || 
                 document.title.includes('Security Check') ||
                 document.body.textContent?.includes('Checking your browser') ||
                 document.querySelector('#challenge-form') !== null;
        });
        
        if (stillOnCloudflare) {
          log('browser.stillOnCloudflare', debug, { debug }, COMPONENTS.BROWSER_FETCH);
          
          // 再次尝试模拟人类行为
          log('browser.simulatingHuman', debug, {}, COMPONENTS.BROWSER_FETCH);
          await this.simulateHumanBehavior(page, debug);
          
          // 再次等待页面加载
          await page.waitForNavigation({ 
            waitUntil: 'networkidle2',
            timeout: 30000
          }).catch(() => {});
          
          // 最终检查
          const bypassFailed = await page.evaluate(() => {
            return document.title.includes('Cloudflare') || 
                   document.title.includes('Security Check') ||
                   document.body.textContent?.includes('Checking your browser') ||
                   document.querySelector('#challenge-form') !== null;
          });
          
          if (bypassFailed) {
            log('browser.bypassFailed', debug, { debug }, COMPONENTS.BROWSER_FETCH);
            return false;
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      log('browser.cloudflareError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
      return false;
    }
  }
  
  // 模拟人类行为以绕过Cloudflare保护
  private static async simulateHumanBehavior(page: Page, debug: boolean): Promise<void> {
    log('browser.simulatingHuman', debug, {}, COMPONENTS.BROWSER_FETCH);
    
    try {
      // 随机移动鼠标
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * 500);
        const y = Math.floor(Math.random() * 500);
        await page.mouse.move(x, y);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
      }
      
      // 随机点击页面
      await page.mouse.click(Math.floor(Math.random() * 500), Math.floor(Math.random() * 500));
      
      // 随机滚动
      await page.evaluate(() => {
        window.scrollBy(0, Math.floor(Math.random() * 200));
      });
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    } catch (error) {
      log('browser.simulatingHumanError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
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
      useSystemProxy
    }, COMPONENTS.BROWSER_FETCH);
    
    // 检查内存使用情况
    this.checkMemoryUsage(debug);
    
    // 获取代理设置 - 优先使用用户指定的代理，其次使用系统代理
    const effectiveProxy = proxy || (useSystemProxy ? this.getSystemProxy(useSystemProxy, debug) : undefined);
    
    // 详细记录代理设置情况
    if (proxy) {
      log('fetcher.usingSpecifiedProxy', debug, { proxy }, COMPONENTS.BROWSER_FETCH);
    } else if (useSystemProxy) {
      log('fetcher.attemptingToUseSystemProxy', debug, {}, COMPONENTS.BROWSER_FETCH);
    } else {
      log('fetcher.notUsingProxy', debug, {}, COMPONENTS.BROWSER_FETCH);
    }
    
    log('fetcher.finalProxyUsed', debug, { proxy: effectiveProxy || t('fetcher.none') }, COMPONENTS.BROWSER_FETCH);

    try {
      // 如果只是要关闭浏览器，不需要获取内容
      if (url === 'about:blank' && closeBrowser) {
        await this.closeBrowser(debug);
        return {
          content: [{ type: 'text', text: 'Browser closed successfully' }],
          isError: false
        };
      }
      
      // 获取浏览器实例
      const browser = await this.getBrowser({ proxy: effectiveProxy, debug, useSystemProxy });
      
      // 创建新页面
      const page = await browser.newPage();
      
      // 设置页面超时
      page.setDefaultTimeout(timeout);
      
      // 设置用户代理
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // 设置请求头
      await page.setExtraHTTPHeaders(headers);
      
      // 如果有存储的cookies，使用它们
      const domain = this.getDomain(url);
      const storedCookies = this.getCookies(domain);
      if (storedCookies && saveCookies) {
        log('browser.usingStoredCookies', debug, { domain: this.getDomain(url) }, COMPONENTS.BROWSER_FETCH);
        await page.setExtraHTTPHeaders({
          'Cookie': storedCookies
        });
      }
      
      // 如果使用代理，记录日志
      if (effectiveProxy) {
        log('browser.usingProxy', debug, { proxy: effectiveProxy }, COMPONENTS.BROWSER_FETCH);
      }
      
      // 导航到URL
      log('browser.navigating', debug, { debug }, COMPONENTS.BROWSER_FETCH);
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: timeout
      });
      
      // 尝试处理Cloudflare保护
      const bypassedCloudflare = await this.handleCloudflareProtection(page, url, debug);
      if (!bypassedCloudflare) {
        log('browser.continuingWithoutBypass', debug, { debug }, COMPONENTS.BROWSER_FETCH);
      }
      
      // 等待选择器
      log('browser.waitingForSelector', debug, { selector: waitForSelector, debug }, COMPONENTS.BROWSER_FETCH);
      await page.waitForSelector(waitForSelector, { 
        timeout: timeout
      }).catch(() => {});
      
      // 等待额外时间
      log('browser.waitingForTimeout', debug, { timeout: waitForTimeout, debug }, COMPONENTS.BROWSER_FETCH);
      await new Promise(resolve => setTimeout(resolve, waitForTimeout));
      
      // 如果需要滚动到底部
      if (scrollToBottom) {
        log('browser.scrolling', debug, { debug }, COMPONENTS.BROWSER_FETCH);
        await this.autoScroll(page, debug);
      }
      
      // 获取页面内容
      log('browser.gettingContent', debug, { debug }, COMPONENTS.BROWSER_FETCH);
      const content = await page.content();
      
      // 如果需要保存cookies
      if (saveCookies) {
        log('browser.savingCookies', debug, { debug }, COMPONENTS.BROWSER_FETCH);
        const cookies = await page.evaluate(() => document.cookie);
        if (cookies) {
          this.saveCookies(url, cookies);
        }
      }
      
      // 记录内容长度
      const contentLength = content.length;
      log('browser.contentLength', debug, { length: contentLength, debug }, COMPONENTS.BROWSER_FETCH);
      
      // 如果内容太长，截断它
      let finalContent = content;
      if (contentLength > 10 * 1024 * 1024) { // 10MB
        finalContent = content.substring(0, 10 * 1024 * 1024);
        log('browser.contentTruncated', debug, { debug }, COMPONENTS.BROWSER_FETCH);
      }
      
      // 关闭页面
      await page.close();
      log('browser.pageClosed', debug, { debug }, COMPONENTS.BROWSER_FETCH);
      
      // 如果需要关闭浏览器
      if (closeBrowser) {
        await this.closeBrowser(debug);
      }
      
      return {
        content: [{ type: 'text', text: finalContent }],
        isError: false
      };
    } catch (error) {
      log('browser.fetchError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
      
      // 如果需要关闭浏览器
      if (closeBrowser) {
        await this.closeBrowser(debug);
      }
      
      return {
        content: [{ type: 'text', text: `Error fetching ${url}: ${error}` }],
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
      debug = false,
      closeBrowser = false
    } = requestPayload;
    
    // 如果只是要关闭浏览器，不需要获取内容
    if (url === 'about:blank' && closeBrowser) {
      log('browser.closingInstance', debug, { debug }, COMPONENTS.BROWSER_FETCH);
      await this.closeBrowser(debug);
      return {
        content: [{ type: 'text', text: 'Browser closed successfully' }],
        isError: false
      };
    }
    
    // 设置最大重试次数
    const maxRetries = 2;
    
    const fetchWithRetry = async (retryCount = 0): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> => {
      log('browser.fetchingWithRetry', debug, { attempt: retryCount + 1, maxAttempts: maxRetries, url }, COMPONENTS.BROWSER_FETCH);
      
      try {
        return await this.fetch(requestPayload);
      } catch (error) {
        if (retryCount < maxRetries) {
          // 计算延迟时间，随着重试次数增加而增加
          const delayMs = 1000 * (retryCount + 1);
          log('browser.retryingAfterDelay', debug, { delayMs }, COMPONENTS.BROWSER_FETCH);
          
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return fetchWithRetry(retryCount + 1);
        }
        
        // 超过最大重试次数，返回错误
        return {
          content: [{ type: 'text', text: `Error fetching ${url} after ${maxRetries + 1} attempts: ${error}` }],
          isError: true
        };
      }
    };
    
    try {
      return await fetchWithRetry();
    } finally {
      // 如果需要关闭浏览器
      if (closeBrowser) {
        log('browser.closingInstance', debug, {}, COMPONENTS.BROWSER_FETCH);
        await this.closeBrowser(debug);
      }
    }
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
      debug = false,
      closeBrowser = false
    } = requestPayload;
    
    // 如果只是要关闭浏览器，不需要获取内容
    if (url === 'about:blank' && closeBrowser) {
      log('browser.closingInstance', debug, {}, COMPONENTS.BROWSER_FETCH);
      await this.closeBrowser(debug);
      return {
        content: [{ type: 'text', text: 'Browser closed successfully' }],
        isError: false
      };
    }
    
    // 设置最大重试次数
    const maxRetries = 2;
    
    const fetchWithRetry = async (retryCount = 0): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> => {
      log('browser.fetchingWithRetry', debug, { attempt: retryCount + 1, maxAttempts: maxRetries + 1, url }, COMPONENTS.BROWSER_FETCH);
      
      try {
        const result = await this.fetch(requestPayload);
        
        // 如果获取成功，尝试解析JSON
        if (!result.isError) {
          try {
            const jsonText = result.content[0].text;
            // 尝试解析JSON
            JSON.parse(jsonText);
            // 如果解析成功，直接返回结果
            return result;
          } catch (error) {
            // JSON解析失败
            log('browser.failedToParseJSON', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
            return {
              content: [{ type: 'text', text: `Error parsing JSON from ${url}: ${error}` }],
              isError: true
            };
          }
        }
        
        return result;
      } catch (error) {
        log('browser.fetchErrorWithAttempt', debug, { error: String(error), attempt: retryCount + 1, maxAttempts: maxRetries + 1 }, COMPONENTS.BROWSER_FETCH);
        
        if (retryCount < maxRetries) {
          // 计算延迟时间，随着重试次数增加而增加
          const delayMs = 1000 * (retryCount + 1);
          log('browser.retryingAfterDelay', debug, { delayMs }, COMPONENTS.BROWSER_FETCH);
          
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return fetchWithRetry(retryCount + 1);
        }
        
        // 超过最大重试次数，返回错误
        return {
          content: [{ type: 'text', text: `Error fetching JSON from ${url} after ${maxRetries + 1} attempts: ${error}` }],
          isError: true
        };
      }
    };
    
    try {
      return await fetchWithRetry();
    } finally {
      // 如果需要关闭浏览器
      if (closeBrowser) {
        log('browser.closingInstance', debug, {}, COMPONENTS.BROWSER_FETCH);
        await this.closeBrowser(debug);
      }
    }
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
      debug = false,
      closeBrowser = false
    } = requestPayload;
    
    // 如果只是要关闭浏览器，不需要获取内容
    if (url === 'about:blank' && closeBrowser) {
      log('browser.closingInstance', debug, {}, COMPONENTS.BROWSER_FETCH);
      await this.closeBrowser(debug);
      return {
        content: [{ type: 'text', text: 'Browser closed successfully' }],
        isError: false
      };
    }
    
    // 设置最大重试次数
    const maxRetries = 2;
    
    const fetchWithRetry = async (retryCount = 0): Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }> => {
      log('browser.fetchingWithRetry', debug, { attempt: retryCount + 1, maxAttempts: maxRetries + 1, url }, COMPONENTS.BROWSER_FETCH);
      
      try {
        const result = await this.fetch(requestPayload);
        
        // 如果获取成功，提取纯文本
        if (!result.isError) {
          const htmlContent = result.content[0].text;
          
          // 使用JSDOM提取纯文本
          const dom = new JSDOM(htmlContent);
          const textContent = dom.window.document.body.textContent || '';
          
          // 清理文本（移除多余空白）
          const cleanedText = textContent
            .replace(/\s+/g, ' ')
            .trim();
          
          return {
            content: [{ type: 'text', text: cleanedText }],
            isError: false
          };
        }
        
        return result;
      } catch (error) {
        log('browser.fetchErrorWithAttempt', debug, { error: String(error), attempt: retryCount + 1, maxAttempts: maxRetries + 1 }, COMPONENTS.BROWSER_FETCH);
        
        if (retryCount < maxRetries) {
          // 计算延迟时间，随着重试次数增加而增加
          const delayMs = 1000 * (retryCount + 1);
          log('browser.retryingAfterDelay', debug, { delayMs }, COMPONENTS.BROWSER_FETCH);
          
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return fetchWithRetry(retryCount + 1);
        }
        
        // 超过最大重试次数，返回错误
        return {
          content: [{ type: 'text', text: `Error fetching text from ${url} after ${maxRetries + 1} attempts: ${error}` }],
          isError: true
        };
      }
    };
    
    try {
      return await fetchWithRetry();
    } finally {
      // 如果需要关闭浏览器
      if (closeBrowser) {
        log('browser.closingInstance', debug, {}, COMPONENTS.BROWSER_FETCH);
        await this.closeBrowser(debug);
      }
    }
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
    const { url, debug = false } = requestPayload;
    
    log('browser.startingBrowserFetchForMarkdown', debug, { url }, COMPONENTS.BROWSER_FETCH);
    
    try {
      // 获取HTML内容
      const htmlResult = await this.html(requestPayload);
      
      if (htmlResult.isError) {
        return htmlResult;
      }
      
      // 将HTML转换为Markdown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-'
      });
      
      // 添加表格支持
      turndownService.addRule('tables', {
        filter: ['table'],
        replacement: function(content, node) {
          const tableContent = content.trim();
          return '\n\n' + tableContent + '\n\n';
        }
      });
      
      // 转换HTML为Markdown
      const markdown = turndownService.turndown(htmlResult.content[0].text);
      
      return {
        content: [{ type: 'text', text: markdown }],
        isError: false
      };
    } catch (error) {
      log('browser.errorInBrowserFetchForMarkdown', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
      
      return {
        content: [{ type: 'text', text: `Error converting HTML to Markdown for ${url}: ${error}` }],
        isError: true
      };
    }
  }
} 