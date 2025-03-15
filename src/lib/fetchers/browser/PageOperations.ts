/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Page } from 'puppeteer';
import { log, COMPONENTS } from '../../logger.js';
import { getDomain } from '../common/utils.js';

/**
 * Cookie存储类 (Cookie storage class)
 * 管理不同域名的Cookie (Manage cookies for different domains)
 */
export class CookieManager {
  /**
   * Cookie存储 (Cookie storage)
   * 存储不同域名的Cookie (Store cookies for different domains)
   */
  private static cookieStore: Record<string, string> = {};

  /**
   * 保存Cookie到存储 (Save cookies to storage)
   * @param url 网址 (URL)
   * @param cookies Cookie字符串 (Cookie string)
   */
  public static saveCookies(url: string, cookies: string): void {
    const domain = getDomain(url);
    if (domain) {
      this.cookieStore[domain] = cookies;
    }
  }

  /**
   * 从存储获取Cookie (Get cookies from storage)
   * @param url 网址 (URL)
   * @returns Cookie字符串或undefined (Cookie string or undefined)
   */
  public static getCookies(url: string): string | undefined {
    const domain = getDomain(url);
    return domain ? this.cookieStore[domain] : undefined;
  }
}

/**
 * 页面操作类 (Page operations class)
 * 提供浏览器页面的各种操作方法 (Provides various operation methods for browser pages)
 */
export class PageOperations {
  /**
   * 自动滚动页面到底部 (Auto scroll page to bottom)
   * @param page 页面对象 (Page object)
   * @param debug 是否启用调试输出 (Whether to enable debug output)
   */
  public static async autoScroll(page: Page, debug: boolean): Promise<void> {
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
      log('browser.scrollError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
    }
  }

  /**
   * 检查是否存在Cloudflare保护并尝试绕过 (Check if Cloudflare protection exists and try to bypass)
   * @param page 页面对象 (Page object)
   * @param url 网址 (URL)
   * @param debug 是否启用调试输出 (Whether to enable debug output)
   * @returns 是否成功绕过 (Whether successfully bypassed)
   */
  public static async handleCloudflareProtection(page: Page, url: string, debug: boolean): Promise<boolean> {
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
  
  /**
   * 模拟人类行为以绕过Cloudflare保护 (Simulate human behavior to bypass Cloudflare protection)
   * @param page 页面对象 (Page object)
   * @param debug 是否启用调试输出 (Whether to enable debug output)
   */
  public static async simulateHumanBehavior(page: Page, debug: boolean): Promise<void> {
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
} 