/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { PROCESSOR_KEYS } from '../../keys/processor.js';

/**
 * 处理器相关的英文文本 (English texts related to processor)
 */
export const processorEn = {
  // HTML转Markdown相关 (HTML to Markdown related)
  [PROCESSOR_KEYS.creatingTurndown]: 'Creating Turndown service',
  [PROCESSOR_KEYS.convertingToMarkdown]: 'Converting HTML to Markdown',
  [PROCESSOR_KEYS.markdownContentLength]: 'Markdown content length: {{length}} bytes',
  
  // HTML转纯文本相关 (HTML to plain text related)
  [PROCESSOR_KEYS.creatingHtmlToText]: 'Creating HTML-to-Text converter',
  [PROCESSOR_KEYS.convertingToText]: 'Converting HTML to plain text',
  [PROCESSOR_KEYS.textContentLength]: 'Plain text content length: {{length}} bytes',
  
  // JSON处理相关 (JSON processing related)
  [PROCESSOR_KEYS.parsingJson]: 'Parsing JSON content',
  [PROCESSOR_KEYS.jsonParsed]: 'Successfully parsed JSON content',
  [PROCESSOR_KEYS.jsonParseError]: 'Failed to parse JSON: {{error}}. Preview: {{textPreview}}, Length: {{textLength}} bytes',
  
  // 文本处理相关 (Text processing related)
  [PROCESSOR_KEYS.processingText]: 'Processing text content with length: {{length}} bytes',
  
  // 内容大小验证相关 (Content size validation related)
  [PROCESSOR_KEYS.contentTooLarge]: 'Content size ({{contentSize}} bytes) exceeds the allowed limit ({{contentSizeLimit}} bytes)',
  [PROCESSOR_KEYS.contentSizeOk]: 'Content size ({{contentSize}} bytes) within allowed limit ({{contentSizeLimit}} bytes)',
}; 