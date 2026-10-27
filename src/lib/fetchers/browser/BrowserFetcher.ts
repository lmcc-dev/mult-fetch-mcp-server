/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { JSDOM } from 'jsdom';
import type { Page } from 'puppeteer';
import { log, COMPONENTS } from '../../logger.js';
import { RequestPayload, FetchResponse, IFetcher } from '../common/types.js';
import { BrowserInstance } from './BrowserInstance.js';
import { PageOperations, CookieManager } from './PageOperations.js';
import { getRandomUserAgent, getSystemProxy, splitProxyAuth } from '../common/utils.js';
import { ContentSizeManager } from '../../utils/ContentSizeManager.js';
import { BaseFetcher } from '../common/BaseFetcher.js';
import { ContentProcessor } from '../../utils/ContentProcessor.js';
import { isBrowserInternalUrl, validateFetchUrl } from '../../utils/UrlValidator.js';

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
    const systemProxy = useSystemProxy
      ? getSystemProxy(useSystemProxy, debug, COMPONENTS.BROWSER_FETCH, url)
      : undefined;
    const effectiveProxy = proxy || systemProxy;
    const proxyAuth = splitProxyAuth(effectiveProxy);

    // 详细记录代理设置情况
    if (proxy) {
      log('fetcher.usingSpecifiedProxy', debug, { proxy }, COMPONENTS.BROWSER_FETCH);
    } else if (useSystemProxy) {
      log('fetcher.attemptingToUseSystemProxy', debug, {}, COMPONENTS.BROWSER_FETCH);
    } else {
      log('fetcher.notUsingProxy', debug, {}, COMPONENTS.BROWSER_FETCH);
    }

    log('fetcher.finalProxyUsed', debug, { proxy: effectiveProxy || 'none' }, COMPONENTS.BROWSER_FETCH);

    let page: Page | null = null;

    try {
      // 如果只是要关闭浏览器，不需要获取内容
      if (url === 'about:blank' && closeBrowser) {
        return BaseFetcher.createSuccessResponse('Browser closed successfully');
      }

      // 获取浏览器实例，并把代理传给启动参数 (Launch or reuse a browser with the proxy applied)
      const browser = await BrowserInstance.getBrowser(debug, proxyAuth.server);

      // 创建新页面
      page = await browser.newPage();

      // 设置页面超时
      page.setDefaultTimeout(timeout);

      // 设置用户代理
      await page.setUserAgent(getRandomUserAgent());

      // 设置请求头；Cookie 必须和用户头合并，否则会覆盖掉前面的头
      // (Merge cookies with caller headers so the second call does not drop them)
      const storedCookies = CookieManager.getCookies(url);
      const extraHeaders = { ...headers };
      if (storedCookies && saveCookies) {
        log('browser.usingStoredCookies', debug, { domain: url }, COMPONENTS.BROWSER_FETCH);
        extraHeaders.Cookie = storedCookies;
      }
      if (Object.keys(extraHeaders).length > 0) {
        await page.setExtraHTTPHeaders(extraHeaders);
      }

      if (proxyAuth.username) {
        await page.authenticate({
          username: proxyAuth.username,
          password: proxyAuth.password || '',
        });
      }

      // 如果使用代理，记录日志
      if (effectiveProxy) {
        log('browser.usingProxy', debug, { proxy: effectiveProxy }, COMPONENTS.BROWSER_FETCH);
      }

      await validateFetchUrl(url);

      // 拦截后续导航、重定向和子资源，避免只校验了初始 URL
      // (Screen later navigations, redirects, and subresources; the initial URL check is not enough)
      await page.setRequestInterception(true);
      page.on('request', async (request) => {
        const requestUrl = request.url();
        try {
          if (!isBrowserInternalUrl(requestUrl)) {
            await validateFetchUrl(requestUrl);
          }
          await request.continue();
        } catch (requestError) {
          log('browser.fetchError', debug, { error: String(requestError), url: requestUrl }, COMPONENTS.BROWSER_FETCH);
          try {
            await request.abort('blockedbyclient');
          } catch (_abortError) {
            // 请求可能已经结束 (The request may already be settled)
          }
        }
      });

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
      }).catch(() => { });

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
      const contentLength = Buffer.byteLength(content, 'utf8');
      log('browser.contentLength', debug, { length: contentLength }, COMPONENTS.BROWSER_FETCH);

      // 如果内容太长，按字节截断，避免把多字节字符截断一半
      // (Truncate by bytes so a multibyte character is not split in half)
      let finalContent = content;
      const maxBrowserBytes = 10 * 1024 * 1024;
      if (contentLength > maxBrowserBytes) {
        finalContent = ContentSizeManager.truncateToBytes(content, maxBrowserBytes);
        log('browser.contentTruncated', debug, {}, COMPONENTS.BROWSER_FETCH);
      }

      return BaseFetcher.createSuccessResponse(finalContent);
    } catch (error) {
      log('browser.fetchError', debug, { error: String(error) }, COMPONENTS.BROWSER_FETCH);

      return BaseFetcher.createErrorResponse(`Error fetching ${url}: ${error}`);
    } finally {
      if (page) {
        try {
          await page.close();
          log('browser.pageClosed', debug, {}, COMPONENTS.BROWSER_FETCH);
        } catch (closeError) {
          log('browser.fetchError', debug, { error: String(closeError) }, COMPONENTS.BROWSER_FETCH);
        }
      }

      if (closeBrowser) {
        await BrowserInstance.closeBrowser(debug);
      }
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
      closeBrowser: _closeBrowser = false,
      contentSizeLimit = ContentSizeManager.getDefaultSizeLimit(),
      enableContentSplitting = true,
      chunkId,
      startCursor = 0,
      extractContent = false,
      includeMetadata = true,
      fallbackToOriginal = true
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

      // 处理内容提取 (Process content extraction)
      const { content: processedContent, metadata } = this.processWithContentExtraction(
        html,
        url,
        {
          extractContent,
          includeMetadata,
          fallbackToOriginal
        },
        debug,
        COMPONENTS.BROWSER_FETCH
      );

      // 检查内容大小并处理 (Check content size and process)
      const chunkingResult = this.handleContentChunking(
        processedContent,
        contentSizeLimit,
        enableContentSplitting,
        debug,
        COMPONENTS.BROWSER_FETCH
      );

      if (chunkingResult) {
        // 如果有元数据，添加到分块结果中 (If there is metadata, add it to the chunk result)
        if (metadata) {
          chunkingResult.metadata = metadata;
        }
        return chunkingResult;
      }

      // 创建新的结果（使用处理后的内容） (Create new result with processed content)
      const processedResult = BaseFetcher.createSuccessResponse(processedContent);

      // 如果有元数据，添加到结果中 (If there is metadata, add it to the result)
      if (metadata) {
        processedResult.metadata = metadata;
      }

      return processedResult;
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
      closeBrowser: _closeBrowser = false,
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
      closeBrowser: _closeBrowser = false,
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
      url: _url,
      debug = false,
      closeBrowser: _closeBrowser = false,
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

    // 先拿到完整 HTML 再转换，避免 html() 先分块后只转换第一段
    // (Convert the full HTML document; html() may already return only the first chunk)
    const result = await BrowserFetcher.fetch(requestPayload);

    if (result.isError) {
      return result;
    }

    const html = result.content[0].text;
    const { content: processedHtml, metadata } = this.processWithContentExtraction(
      html,
      requestPayload.url,
      {
        extractContent: requestPayload.extractContent,
        includeMetadata: requestPayload.includeMetadata,
        fallbackToOriginal: requestPayload.fallbackToOriginal
      },
      debug,
      COMPONENTS.BROWSER_FETCH
    );

    // 使用ContentProcessor将HTML转换为纯文本 (Use ContentProcessor to convert HTML to plain text)
    const plainText = ContentProcessor.htmlToText(processedHtml, debug);

    // 检查内容大小并处理 (Check content size and process)
    const chunkingResult = this.handleContentChunking(
      plainText,
      contentSizeLimit,
      enableContentSplitting,
      debug,
      COMPONENTS.BROWSER_FETCH
    );

    if (chunkingResult) {
      if (metadata) {
        chunkingResult.metadata = metadata;
      }
      return chunkingResult;
    }

    // 返回纯文本内容 (Return plain text content)
    const plainTextResult = BaseFetcher.createSuccessResponse(plainText);
    if (metadata) {
      plainTextResult.metadata = metadata;
    }
    return plainTextResult;
  }

  /**
   * 获取HTML并转换为Markdown (Get HTML and convert to Markdown)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns Markdown内容 (Markdown content)
   */
  public async markdown(requestPayload: RequestPayload): Promise<FetchResponse> {
    const {
      url: _url,
      debug = false,
      closeBrowser: _closeBrowser = false,
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

    // 先拿到完整 HTML 再转换，避免 html() 先分块后只转换第一段
    // (Convert the full HTML document; html() may already return only the first chunk)
    const result = await BrowserFetcher.fetch(requestPayload);

    if (result.isError) {
      return result;
    }

    const html = result.content[0].text;
    const { content: processedHtml, metadata } = this.processWithContentExtraction(
      html,
      requestPayload.url,
      {
        extractContent: requestPayload.extractContent,
        includeMetadata: requestPayload.includeMetadata,
        fallbackToOriginal: requestPayload.fallbackToOriginal
      },
      debug,
      COMPONENTS.BROWSER_FETCH
    );

    // 使用ContentProcessor将HTML转换为Markdown (Use ContentProcessor to convert HTML to Markdown)
    const markdown = ContentProcessor.htmlToMarkdown(processedHtml, debug);

    // 检查内容大小并处理 (Check content size and process)
    const chunkingResult = this.handleContentChunking(
      markdown,
      contentSizeLimit,
      enableContentSplitting,
      debug,
      COMPONENTS.BROWSER_FETCH
    );

    if (chunkingResult) {
      if (metadata) {
        chunkingResult.metadata = metadata;
      }
      return chunkingResult;
    }

    // 返回Markdown内容 (Return Markdown content)
    const markdownResult = BaseFetcher.createSuccessResponse(markdown);
    if (metadata) {
      markdownResult.metadata = metadata;
    }
    return markdownResult;
  }
} 