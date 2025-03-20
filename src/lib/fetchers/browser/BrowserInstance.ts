/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Browser } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { log, COMPONENTS } from '../../logger.js';
import { getRandomUserAgent } from '../common/utils.js';

// 添加stealth插件
// @ts-ignore - 忽略puppeteer-extra的类型错误
puppeteerExtra.use(StealthPlugin());

/**
 * 浏览器实例管理类 (Browser instance management class)
 * 负责浏览器的创建、获取和关闭 (Responsible for creating, getting and closing browsers)
 */
export class BrowserInstance {
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
  public static checkMemoryUsage(debug: boolean = false): void {
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
      log('browser.memoryUsage', debug, { usage: heapUsed }, COMPONENTS.BROWSER_FETCH);

      // 如果内存使用过高，记录警告
      if (heapUsed > 500 || rss > 1000) {
        log('browser.memoryTooHigh', debug, { heapUsed, heapTotal, rss }, COMPONENTS.BROWSER_FETCH);
      }
    } catch (error) {
      log('browser.memoryCheckError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
    }
  }

  /**
   * 获取浏览器实例 (Get browser instance)
   * 如果浏览器未启动，则启动浏览器 (Start browser if not started)
   * @param debug 是否启用调试输出 (Whether to enable debug output)
   * @returns 浏览器实例 (Browser instance)
   */
  public static async getBrowser(debug: boolean = false): Promise<Browser> {
    // 检查内存使用情况 (Check memory usage)
    this.checkMemoryUsage(debug);

    // 如果浏览器已经存在，直接返回 (If browser already exists, return directly)
    if (this.browser) {
      log('browser.reusingExistingBrowser', debug, {}, COMPONENTS.BROWSER_FETCH);
      return this.browser;
    }

    // 如果浏览器正在启动中，等待启动完成 (If browser is starting, wait for startup to complete)
    if (this.browserStarting && this.browserStartPromise) {
      log('browser.waitingForBrowserStart', debug, {}, COMPONENTS.BROWSER_FETCH);
      return this.browserStartPromise;
    }

    // 标记浏览器正在启动 (Mark browser as starting)
    this.browserStarting = true;

    // 创建启动Promise (Create startup Promise)
    this.browserStartPromise = new Promise((resolve, reject) => {
      // 内部定义并立即调用异步函数
      (async () => {
        try {
          log('browser.startingBrowser', debug, {}, COMPONENTS.BROWSER_FETCH);

          // 准备浏览器启动参数 (Prepare browser startup parameters)
          const launchOptions: any = {
            headless: 'new',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu',
              '--disable-infobars',
              '--window-position=0,0',
              '--ignore-certificate-errors',
              '--ignore-certificate-errors-spki-list',
              '--disable-extensions',
              '--disable-default-apps',
              '--enable-features=NetworkService',
              '--disable-features=IsolateOrigins,site-per-process',
              '--disable-web-security',
              '--disable-site-isolation-trials',
              '--disable-features=BlockInsecurePrivateNetworkRequests',
              '--disable-features=IsolateOrigins',
              '--disable-features=site-per-process',
              '--disable-blink-features=AutomationControlled',
              '--user-agent=' + getRandomUserAgent()
            ],
            ignoreHTTPSErrors: true,
            defaultViewport: {
              width: 1920,
              height: 1080
            }
          };

          // 检查是否有环境变量指定的Chrome路径 (Check if there is a Chrome path specified by environment variables)
          const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
          if (executablePath) {
            log('browser.usingCustomChromePath', debug, { path: executablePath }, COMPONENTS.BROWSER_FETCH);
            launchOptions.executablePath = executablePath;
            launchOptions.channel = undefined;
          }

          // 启动浏览器 (Launch browser)
          // @ts-ignore - 忽略puppeteer-extra的类型错误
          this.browser = await puppeteerExtra.launch(launchOptions);

          log('browser.browserStarted', debug, {}, COMPONENTS.BROWSER_FETCH);

          // 设置浏览器关闭事件处理 (Set browser close event handling)
          this.browser.on('disconnected', () => {
            log('browser.browserDisconnected', debug, {}, COMPONENTS.BROWSER_FETCH);
            this.browser = null;
            this.browserStarting = false;
            this.browserStartPromise = null;
          });

          // 重置标志 (Reset flags)
          this.browserStarting = false;

          // 解析Promise (Resolve Promise)
          resolve(this.browser);
        } catch (error) {
          // 记录错误 (Log error)
          log('browser.browserStartError', true, { error: String(error) }, COMPONENTS.BROWSER_FETCH);

          // 重置标志 (Reset flags)
          this.browser = null;
          this.browserStarting = false;
          this.browserStartPromise = null;

          // 拒绝Promise (Reject Promise)
          reject(error);
        }
      })();
    });

    return this.browserStartPromise;
  }

  /**
   * 关闭浏览器 (Close browser)
   * @param debug 是否启用调试输出 (Whether to enable debug output)
   */
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
} 