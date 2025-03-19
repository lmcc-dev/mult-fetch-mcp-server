/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Page } from 'puppeteer';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';
import { log, COMPONENTS } from '../../logger.js';
import { RequestPayload, FetchResponse, IFetcher } from '../common/types.js';
import { BrowserInstance } from './BrowserInstance.js';
import { PageOperations, CookieManager } from './PageOperations.js';
import { getRandomUserAgent, getSystemProxy } from '../common/utils.js';
import { ContentSizeManager } from '../../utils/ContentSizeManager.js';
import { BaseFetcher } from '../common/BaseFetcher.js';
import { ContentProcessor } from '../../utils/ContentProcessor.js';

/**
 * 浏览器模式获取器类 (Browser mode fetcher class)
 * 使用Puppeteer实现浏览器模式的网页获取 (Implements webpage fetching in browser mode using Puppeteer)
 */
export class BrowserFetcher extends BaseFetcher implements IFetcher {
  /**
   * 使用Puppeteer获取网页内容 (Get webpage content using Puppeteer)
   * 浏览器模式获取的底层实现方法 (Low-level implementation method for browser mode fetching)
   * @param params 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  private static async fetch({
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
    BrowserInstance.checkMemoryUsage(debug);
    
    // 获取代理设置 - 优先使用用户指定的代理，其次使用系统代理
    const effectiveProxy = proxy || (useSystemProxy ? getSystemProxy(useSystemProxy, debug, COMPONENTS.BROWSER_FETCH) : undefined);
    
    // 详细记录代理设置情况
    if (proxy) {
      log('fetcher.usingSpecifiedProxy', debug, { proxy }, COMPONENTS.BROWSER_FETCH);
    } else if (useSystemProxy) {
      log('fetcher.attemptingToUseSystemProxy', debug, {}, COMPONENTS.BROWSER_FETCH);
    } else {
      log('fetcher.notUsingProxy', debug, {}, COMPONENTS.BROWSER_FETCH);
    }
    
    log('fetcher.finalProxyUsed', debug, { proxy: effectiveProxy || 'none' }, COMPONENTS.BROWSER_FETCH);

    try {
      // 如果只是要关闭浏览器，不需要获取内容
      if (url === 'about:blank' && closeBrowser) {
        await BrowserInstance.closeBrowser(debug);
        return BaseFetcher.createSuccessResponse('Browser closed successfully');
      }
      
      // 获取浏览器实例
      const browser = await BrowserInstance.getBrowser(debug);
      
      // 创建新页面
      const page = await browser.newPage();
      
      // 设置页面超时
      page.setDefaultTimeout(timeout);
      
      // 设置用户代理
      await page.setUserAgent(getRandomUserAgent());
      
      // 设置请求头
      await page.setExtraHTTPHeaders(headers);
      
      // 如果有存储的cookies，使用它们
      const storedCookies = CookieManager.getCookies(url);
      if (storedCookies && saveCookies) {
        log('browser.usingStoredCookies', debug, { domain: url }, COMPONENTS.BROWSER_FETCH);
        await page.setExtraHTTPHeaders({
          'Cookie': storedCookies
        });
      }
      
      // 如果使用代理，记录日志
      if (effectiveProxy) {
        log('browser.usingProxy', debug, { proxy: effectiveProxy }, COMPONENTS.BROWSER_FETCH);
      }
      
      // 导航到URL
      log('browser.navigating', debug, { url }, COMPONENTS.BROWSER_FETCH);
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: timeout
      });
      
      // 尝试处理Cloudflare保护
      const bypassedCloudflare = await PageOperations.handleCloudflareProtection(page, url, debug);
      if (!bypassedCloudflare) {
        log('browser.continuingWithoutBypass', debug, {}, COMPONENTS.BROWSER_FETCH);
      }
      
      // 等待选择器
      log('browser.waitingForSelector', debug, { selector: waitForSelector }, COMPONENTS.BROWSER_FETCH);
      await page.waitForSelector(waitForSelector, { 
        timeout: timeout
      }).catch(() => {});
      
      // 等待额外时间
      log('browser.waitingForTimeout', debug, { timeout: waitForTimeout }, COMPONENTS.BROWSER_FETCH);
      await new Promise(resolve => setTimeout(resolve, waitForTimeout));
      
      // 如果需要滚动到底部
      if (scrollToBottom) {
        log('browser.scrolling', debug, {}, COMPONENTS.BROWSER_FETCH);
        await PageOperations.autoScroll(page, debug);
      }
      
      // 获取页面内容
      log('browser.gettingContent', debug, {}, COMPONENTS.BROWSER_FETCH);
      const content = await page.content();
      
      // 如果需要保存cookies
      if (saveCookies) {
        log('browser.savingCookies', debug, { domain: url }, COMPONENTS.BROWSER_FETCH);
        const cookies = await page.evaluate(() => document.cookie);
        if (cookies) {
          CookieManager.saveCookies(url, cookies);
        }
      }
      
      // 记录内容长度
      const contentLength = content.length;
      log('browser.contentLength', debug, { length: contentLength }, COMPONENTS.BROWSER_FETCH);
      
      // 如果内容太长，截断它
      let finalContent = content;
      if (contentLength > 10 * 1024 * 1024) { // 10MB
        finalContent = content.substring(0, 10 * 1024 * 1024);
        log('browser.contentTruncated', debug, {}, COMPONENTS.BROWSER_FETCH);
      }
      
      // 关闭页面
      await page.close();
      log('browser.pageClosed', debug, {}, COMPONENTS.BROWSER_FETCH);
      
      // 如果需要关闭浏览器
      if (closeBrowser) {
        await BrowserInstance.closeBrowser(debug);
      }
      
      return BaseFetcher.createSuccessResponse(finalContent);
    } catch (error) {
      log('browser.fetchError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
      
      // 如果需要关闭浏览器
      if (closeBrowser) {
        await BrowserInstance.closeBrowser(debug);
      }
      
      return BaseFetcher.createErrorResponse(`Error fetching ${url}: ${error}`);
    }
  }

  /**
   * 使用Puppeteer获取HTML内容 (Get HTML content using Puppeteer)
   * 通过浏览器模式获取HTML页面 (Fetch HTML page in browser mode)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  public async html(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      url,
      debug = false,
      closeBrowser = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;
    
    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.BROWSER_FETCH);
    }
    
    log('browser.startingHtmlFetch', debug, { url }, COMPONENTS.BROWSER_FETCH);
    
    try {
      // 使用通用的fetch方法获取内容 (Use common fetch method to get content)
      const result = await BrowserFetcher.fetch(requestPayload);
      
      // 如果出错，直接返回错误 (If error, return error directly)
      if (result.isError) {
        return result;
      }
      
      // 获取HTML内容 (Get HTML content)
      const html = result.content[0].text;
      
      // 检查内容大小并处理 (Check content size and process)
      const chunkingResult = this.handleContentChunking(
        html, 
        contentSizeLimit, 
        enableContentSplitting, 
        debug, 
        COMPONENTS.BROWSER_FETCH
      );
      
      if (chunkingResult) {
        return chunkingResult;
      }
      
      // 返回HTML内容 (Return HTML content)
      return result;
    } catch (error) {
      // 处理错误 (Handle error)
      log('browser.htmlFetchError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
      
      return BaseFetcher.createErrorResponse(`Error fetching HTML: ${error}`);
    }
  }

  /**
   * 使用Puppeteer获取JSON内容 (Get JSON content using Puppeteer)
   * 通过浏览器模式获取JSON数据 (Fetch JSON data in browser mode)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  public async json(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      url,
      debug = false,
      closeBrowser = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;
    
    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.BROWSER_FETCH);
    }
    
    log('browser.startingJsonFetch', debug, { url }, COMPONENTS.BROWSER_FETCH);
    
    try {
      // 使用通用的fetch方法获取内容 (Use common fetch method to get content)
      const result = await BrowserFetcher.fetch(requestPayload);
      
      // 如果出错，直接返回错误 (If error, return error directly)
      if (result.isError) {
        return result;
      }
      
      // 获取文本内容 (Get text content)
      const text = result.content[0].text;
      
      // 尝试解析JSON (Try to parse JSON)
      try {
        JSON.parse(text);
        log('browser.jsonParsed', debug, {}, COMPONENTS.BROWSER_FETCH);
        
        // 检查内容大小并处理 (Check content size and process)
        const chunkingResult = this.handleContentChunking(
          text, 
          contentSizeLimit, 
          enableContentSplitting, 
          debug, 
          COMPONENTS.BROWSER_FETCH
        );
        
        if (chunkingResult) {
          return chunkingResult;
        }
        
        // 返回JSON内容 (Return JSON content)
        return result;
      } catch (parseError) {
        // 处理JSON解析错误 (Handle JSON parse error)
        log('browser.jsonParseError', debug, { error: String(parseError) }, COMPONENTS.BROWSER_FETCH);
        
        return BaseFetcher.createErrorResponse(`Error parsing JSON: ${parseError}`);
      }
    } catch (error) {
      // 处理错误 (Handle error)
      log('browser.jsonFetchError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
      
      return BaseFetcher.createErrorResponse(`Error fetching JSON: ${error}`);
    }
  }

  /**
   * 使用Puppeteer获取纯文本内容 (Get plain text content using Puppeteer)
   * 通过浏览器模式获取网页纯文本 (Fetch webpage plain text in browser mode)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 获取结果 (Fetch result)
   */
  public async txt(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      url,
      debug = false,
      closeBrowser = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;
    
    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.BROWSER_FETCH);
    }
    
    log('browser.startingTxtFetch', debug, { url }, COMPONENTS.BROWSER_FETCH);
    
    try {
      // 使用通用的fetch方法获取内容 (Use common fetch method to get content)
      const result = await BrowserFetcher.fetch(requestPayload);
      
      // 如果出错，直接返回错误 (If error, return error directly)
      if (result.isError) {
        return result;
      }
      
      // 获取HTML内容 (Get HTML content)
      const html = result.content[0].text;
      
      // 使用JSDOM提取纯文本 (Extract plain text using JSDOM)
      log('browser.extractingText', debug, {}, COMPONENTS.BROWSER_FETCH);
      const dom = new JSDOM(html);
      const text = dom.window.document.body.textContent || '';
      log('browser.textExtracted', debug, { length: text.length }, COMPONENTS.BROWSER_FETCH);
      
      // 检查内容大小并处理 (Check content size and process)
      const chunkingResult = this.handleContentChunking(
        text, 
        contentSizeLimit, 
        enableContentSplitting, 
        debug, 
        COMPONENTS.BROWSER_FETCH
      );
      
      if (chunkingResult) {
        return chunkingResult;
      }
      
      // 返回纯文本内容 (Return plain text content)
      return BaseFetcher.createSuccessResponse(text);
    } catch (error) {
      // 处理错误 (Handle error)
      log('browser.txtFetchError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);
      
      return BaseFetcher.createErrorResponse(`Error fetching text: ${error}`);
    }
  }

  /**
   * 获取HTML并转换为纯文本 (Get HTML and convert to plain text)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 纯文本响应 (Plain text response)
   */
  public async plainText(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      url,
      debug = false,
      closeBrowser = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;
    
    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.BROWSER_FETCH);
    }
    
    log('browser.startingPlainTextFetch', debug, { url: requestPayload.url }, COMPONENTS.BROWSER_FETCH);
    
    // 使用HTML方法获取内容 (Use HTML method to get content)
    const result = await this.html(requestPayload);
    
    if (result.isError) {
      return result;
    }
    
    // 获取HTML内容 (Get HTML content)
    const html = result.content[0].text;
    
    // 使用ContentProcessor将HTML转换为纯文本 (Use ContentProcessor to convert HTML to plain text)
    const plainText = ContentProcessor.htmlToText(html, debug, COMPONENTS.BROWSER_FETCH);
    
    // 检查内容大小并处理 (Check content size and process)
    const chunkingResult = this.handleContentChunking(
      plainText, 
      contentSizeLimit, 
      enableContentSplitting, 
      debug, 
      COMPONENTS.BROWSER_FETCH
    );
    
    if (chunkingResult) {
      return chunkingResult;
    }
    
    // 返回纯文本内容 (Return plain text content)
    return BaseFetcher.createSuccessResponse(plainText);
  }

  /**
   * 获取HTML并转换为Markdown (Get HTML and convert to Markdown)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns Markdown内容 (Markdown content)
   */
  public async markdown(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      url,
      debug = false,
      closeBrowser = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0
    } = requestPayload;
    
    // 如果提供了分段ID和起始游标，则从缓存中获取分段内容 (If chunk ID and startCursor are provided, get chunk content from cache)
    if (chunkId && startCursor !== undefined) {
      return this.getChunkContent(chunkId, startCursor, contentSizeLimit, debug, COMPONENTS.BROWSER_FETCH);
    }
    
    log('browser.startingMarkdownFetch', debug, { url: requestPayload.url }, COMPONENTS.BROWSER_FETCH);
    
    // 使用HTML方法获取内容 (Use HTML method to get content)
    const result = await this.html(requestPayload);
    
    if (result.isError) {
      return result;
    }
    
    // 获取HTML内容 (Get HTML content)
    const html = result.content[0].text;
    
    // 使用ContentProcessor将HTML转换为Markdown (Use ContentProcessor to convert HTML to Markdown)
    const markdown = ContentProcessor.htmlToMarkdown(html, debug, COMPONENTS.BROWSER_FETCH);
    
    // 检查内容大小并处理 (Check content size and process)
    const chunkingResult = this.handleContentChunking(
      markdown, 
      contentSizeLimit, 
      enableContentSplitting, 
      debug, 
      COMPONENTS.BROWSER_FETCH
    );
    
    if (chunkingResult) {
      return chunkingResult;
    }
    
    // 返回Markdown内容 (Return Markdown content)
    return BaseFetcher.createSuccessResponse(markdown);
  }
} 