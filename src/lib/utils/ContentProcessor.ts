/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import TurndownService from 'turndown';
import { log, COMPONENTS } from '../logger.js';
import { ToolError, ErrorType } from '../utils/errors.js';
import { convert as htmlToText } from 'html-to-text';

/**
 * 内容处理器类 (Content processor class)
 * 处理不同格式的内容转换和处理 (Process and convert content in different formats)
 */
export class ContentProcessor {
  /**
   * 将HTML转换为Markdown (Convert HTML to Markdown)
   * @param html HTML内容 (HTML content)
   * @param debug 是否开启调试 (Whether to enable debugging)
   * @returns Markdown内容 (Markdown content)
   */
  public static htmlToMarkdown(html: string, debug: boolean): string {
    // 始终使用COMPONENTS.PROCESSOR作为组件标识符 (Always use COMPONENTS.PROCESSOR as component identifier)
    log('processor.creatingTurndown', debug, {}, COMPONENTS.PROCESSOR);
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-'
    });

    // 添加表格支持 (Add table support)
    turndownService.addRule('tables', {
      filter: ['table'],
      replacement: function (content) {
        const tableContent = content.trim();
        return '\n\n' + tableContent + '\n\n';
      }
    });

    // 将HTML转换为Markdown (Convert HTML to Markdown)
    log('processor.convertingToMarkdown', debug, {}, COMPONENTS.PROCESSOR);
    const markdown = turndownService.turndown(html);
    log('processor.markdownContentLength', debug, { length: markdown.length }, COMPONENTS.PROCESSOR);

    return markdown;
  }

  /**
   * 将HTML转换为纯文本 (Convert HTML to plain text)
   * @param html HTML内容 (HTML content)
   * @param debug 是否开启调试 (Whether to enable debugging)
   * @returns 纯文本内容 (Plain text content)
   */
  public static htmlToText(html: string, debug: boolean): string {
    // 始终使用COMPONENTS.PROCESSOR作为组件标识符 (Always use COMPONENTS.PROCESSOR as component identifier)
    log('processor.creatingHtmlToText', debug, {}, COMPONENTS.PROCESSOR);

    // 配置html-to-text选项 (Configure html-to-text options)
    const options = {
      wordwrap: false as const,
      selectors: [
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
        { selector: 'img', format: 'skip' },
        { selector: 'table', options: { uppercaseHeaderCells: false } }
      ]
    };

    // 将HTML转换为纯文本 (Convert HTML to plain text)
    log('processor.convertingToText', debug, {}, COMPONENTS.PROCESSOR);
    const text = htmlToText(html, options);
    log('processor.textContentLength', debug, { length: text.length }, COMPONENTS.PROCESSOR);

    return text;
  }

  /**
   * 解析JSON字符串 (Parse JSON string)
   * @param text JSON字符串 (JSON string)
   * @param debug 是否开启调试 (Whether to enable debugging)
   * @returns 解析结果 (Parse result - success or error with message)
   */
  public static parseJson(text: string, debug: boolean): { success: boolean; result?: any; error?: string } {
    log('processor.parsingJson', debug, {}, COMPONENTS.PROCESSOR);
    try {
      const parsed = JSON.parse(text);
      log('processor.jsonParsed', debug, {}, COMPONENTS.PROCESSOR);
      return { success: true, result: parsed };
    } catch (parseError) {
      const textPreview = text.length > 100 ? `${text.substring(0, 100)}...` : text;
      const errorMessage = `Invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}. Text preview: "${textPreview}", length: ${text.length}`;

      log('processor.jsonParseError', debug, {
        error: String(parseError),
        textPreview,
        textLength: text.length
      }, COMPONENTS.PROCESSOR);

      return { success: false, error: errorMessage };
    }
  }

  /**
   * 处理文本内容，确保是UTF-8编码 (Process text content, ensure it's UTF-8 encoded)
   * @param text 文本内容 (Text content)
   * @param debug 是否开启调试 (Whether to enable debugging)
   * @returns 处理后的文本 (Processed text)
   */
  public static processTextContent(text: string, debug: boolean): string {
    log('processor.processingText', debug, { length: text.length }, COMPONENTS.PROCESSOR);
    // 这里可以添加文本处理逻辑，如编码转换、去除特殊字符等
    // (Add text processing logic here, such as encoding conversion, removing special characters, etc.)
    return text;
  }

  /**
   * 验证内容大小并处理过大的内容 (Validate content size and handle oversized content)
   * @param content 内容 (Content)
   * @param contentSizeLimit 内容大小限制 (Content size limit)
   * @param debug 是否开启调试 (Whether to enable debugging)
   */
  public static validateContentSize(
    content: string,
    contentSizeLimit: number,
    debug: boolean
  ): void {
    const contentSize = content.length;

    if (contentSize > contentSizeLimit) {
      log('processor.contentTooLarge', debug, {
        contentSize,
        contentSizeLimit
      }, COMPONENTS.PROCESSOR);

      throw new ToolError(
        `Content size (${contentSize}) exceeds the allowed limit (${contentSizeLimit})`,
        ErrorType.TOOL_EXECUTION_ERROR,
        COMPONENTS.PROCESSOR,
        {
          contentSize,
          contentSizeLimit
        }
      );
    } else {
      log('processor.contentSizeOk', debug, {
        contentSize,
        contentSizeLimit
      }, COMPONENTS.PROCESSOR);
    }
  }
} 