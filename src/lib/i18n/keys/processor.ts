/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

const PREFIX = 'processor';
const keyGen = createKeyGenerator(PREFIX);

/**
 * 内容处理器相关的国际化键 (Internationalization keys related to content processor)
 */
export const PROCESSOR_KEYS = {
  // HTML转Markdown相关 (HTML to Markdown related)
  creatingTurndown: keyGen('creatingTurndown'),
  convertingToMarkdown: keyGen('convertingToMarkdown'),
  markdownContentLength: keyGen('markdownContentLength'),
  
  // HTML转纯文本相关 (HTML to plain text related)
  creatingHtmlToText: keyGen('creatingHtmlToText'),
  convertingToText: keyGen('convertingToText'),
  textContentLength: keyGen('textContentLength'),
  
  // JSON处理相关 (JSON processing related)
  parsingJson: keyGen('parsingJson'),
  jsonParsed: keyGen('jsonParsed'),
  jsonParseError: keyGen('jsonParseError'),
  
  // 文本处理相关 (Text processing related)
  processingText: keyGen('processingText'),
  
  // 内容大小验证相关 (Content size validation related)
  contentTooLarge: keyGen('contentTooLarge'),
  contentSizeOk: keyGen('contentSizeOk'),
}; 