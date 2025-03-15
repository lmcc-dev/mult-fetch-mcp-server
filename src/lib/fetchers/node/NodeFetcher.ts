/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import TurndownService from "turndown";
import { RequestPayload, FetchResponse, IFetcher } from "../common/types.js";
import { log, COMPONENTS } from '../../logger.js';
import { HttpClient } from './HttpClient.js';

/**
 * Node模式获取器类 (Node mode fetcher class)
 * 使用node-fetch实现标准模式的网页获取 (Implements webpage fetching in standard mode using node-fetch)
 */
export class NodeFetcher implements IFetcher {
  /**
   * 获取HTML内容 (Get HTML content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns HTML内容 (HTML content)
   */
  public async html(requestPayload: RequestPayload): Promise<FetchResponse> {
    const { debug = false } = requestPayload;
    log('node.startingHtmlFetch', debug, {}, COMPONENTS.NODE_FETCH);
    
    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);
      
      // 读取响应文本 (Read response text)
      log('node.readingText', debug, {}, COMPONENTS.NODE_FETCH);
      const html = await response.text();
      log('node.htmlContentLength', debug, { length: html.length }, COMPONENTS.NODE_FETCH);
      
      // 返回HTML内容 (Return HTML content)
      return {
        content: [{ type: 'text', text: html }],
        isError: false
      };
    } catch (error) {
      // 处理错误 (Handle error)
      log('node.htmlFetchError', debug, { error: error instanceof Error ? error.message : String(error) }, COMPONENTS.NODE_FETCH);
      
      // 返回错误信息 (Return error message)
      return {
        content: [{ type: 'text', text: `Error fetching HTML: ${error}` }],
        isError: true
      };
    }
  }

  /**
   * 获取JSON内容 (Get JSON content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns JSON内容 (JSON content)
   */
  public async json(requestPayload: RequestPayload): Promise<FetchResponse> {
    const { debug = false } = requestPayload;
    log('node.startingJsonFetch', debug, {}, COMPONENTS.NODE_FETCH);
    
    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);
      
      // 读取响应文本 (Read response text)
      const text = await response.text();
      
      // 解析JSON (Parse JSON)
      log('node.parsingJson', debug, {}, COMPONENTS.NODE_FETCH);
      let json;
      try {
        json = JSON.parse(text);
        log('node.jsonParsed', debug, {}, COMPONENTS.NODE_FETCH);
        
        // 返回JSON内容 (Return JSON content)
        return {
          content: [{ type: 'text', text }],
          isError: false
        };
      } catch (parseError) {
        // 处理JSON解析错误 (Handle JSON parse error)
        const textPreview = text.length > 100 ? `${text.substring(0, 100)}...` : text;
        const error = new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}. Text preview: "${textPreview}", length: ${text.length}`);
        (error as any).text = text;
        (error as any).originalError = parseError;
        
        log('fetcher.jsonParseError', debug, { 
          error: String(parseError),
          textPreview,
          textLength: text.length
        }, COMPONENTS.NODE_FETCH);
        
        // 返回错误信息 (Return error message)
        return {
          content: [{ type: 'text', text: `Error parsing JSON: ${error}` }],
          isError: true
        };
      }
    } catch (error) {
      // 处理错误 (Handle error)
      log('node.jsonFetchError', debug, { error: error instanceof Error ? error.message : String(error) }, COMPONENTS.NODE_FETCH);
      
      // 返回错误信息 (Return error message)
      return {
        content: [{ type: 'text', text: `Error fetching JSON: ${error}` }],
        isError: true
      };
    }
  }

  /**
   * 获取纯文本内容 (Get plain text content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns 纯文本内容 (Plain text content)
   */
  public async txt(requestPayload: RequestPayload): Promise<FetchResponse> {
    const { debug = false } = requestPayload;
    log('node.startingTxtFetch', debug, {}, COMPONENTS.NODE_FETCH);
    
    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);
      
      // 读取响应文本 (Read response text)
      log('node.readingText', debug, {}, COMPONENTS.NODE_FETCH);
      const text = await response.text();
      log('node.textContentLength', debug, { length: text.length }, COMPONENTS.NODE_FETCH);
      
      // 返回纯文本内容 (Return plain text content)
      return {
        content: [{ type: 'text', text }],
        isError: false
      };
    } catch (error) {
      // 处理错误 (Handle error)
      log('node.txtFetchError', debug, { error: error instanceof Error ? error.message : String(error) }, COMPONENTS.NODE_FETCH);
      
      // 返回错误信息 (Return error message)
      return {
        content: [{ type: 'text', text: `Error fetching text: ${error}` }],
        isError: true
      };
    }
  }

  /**
   * 获取Markdown内容 (Get Markdown content)
   * @param requestPayload 请求参数 (Request parameters)
   * @returns Markdown内容 (Markdown content)
   */
  public async markdown(requestPayload: RequestPayload): Promise<FetchResponse> {
    const { debug = false } = requestPayload;
    log('node.startingMarkdownFetch', debug, {}, COMPONENTS.NODE_FETCH);
    
    try {
      // 执行请求 (Execute request)
      const response = await HttpClient.fetchWithRedirects(requestPayload);
      
      // 读取响应文本 (Read response text)
      log('node.readingText', debug, {}, COMPONENTS.NODE_FETCH);
      const html = await response.text();
      log('node.htmlContentLength', debug, { length: html.length }, COMPONENTS.NODE_FETCH);
      
      // 创建Turndown服务 (Create Turndown service)
      log('node.creatingTurndown', debug, {}, COMPONENTS.NODE_FETCH);
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
      
      // 将HTML转换为Markdown (Convert HTML to Markdown)
      log('node.convertingToMarkdown', debug, {}, COMPONENTS.NODE_FETCH);
      const markdown = turndownService.turndown(html);
      log('node.markdownContentLength', debug, { length: markdown.length }, COMPONENTS.NODE_FETCH);
      
      // 返回Markdown内容 (Return Markdown content)
      return {
        content: [{ type: 'text', text: markdown }],
        isError: false
      };
    } catch (error) {
      // 处理错误 (Handle error)
      log('node.markdownFetchError', debug, { error: error instanceof Error ? error.message : String(error) }, COMPONENTS.NODE_FETCH);
      
      // 返回错误信息 (Return error message)
      return {
        content: [{ type: 'text', text: `Error fetching Markdown: ${error}` }],
        isError: true
      };
    }
  }
} 