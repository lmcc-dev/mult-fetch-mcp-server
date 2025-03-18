/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { PROCESSOR_KEYS } from '../../keys/processor.js';

/**
 * 处理器相关的中文文本 (Chinese texts related to processor)
 */
export const processorZh = {
  // HTML转Markdown相关 (HTML to Markdown related)
  [PROCESSOR_KEYS.creatingTurndown]: '创建 Turndown 服务',
  [PROCESSOR_KEYS.convertingToMarkdown]: '将 HTML 转换为 Markdown',
  [PROCESSOR_KEYS.markdownContentLength]: 'Markdown 内容长度: {{length}} 字节',
  
  // HTML转纯文本相关 (HTML to plain text related)
  [PROCESSOR_KEYS.creatingHtmlToText]: '创建 HTML-to-Text 转换器',
  [PROCESSOR_KEYS.convertingToText]: '将 HTML 转换为纯文本',
  [PROCESSOR_KEYS.textContentLength]: '纯文本内容长度: {{length}} 字节',
  
  // JSON处理相关 (JSON processing related)
  [PROCESSOR_KEYS.parsingJson]: '解析 JSON 内容',
  [PROCESSOR_KEYS.jsonParsed]: '成功解析 JSON 内容',
  [PROCESSOR_KEYS.jsonParseError]: '解析 JSON 失败: {{error}}。预览: {{textPreview}}，长度: {{textLength}} 字节',
  
  // 文本处理相关 (Text processing related)
  [PROCESSOR_KEYS.processingText]: '处理文本内容，长度: {{length}} 字节',
  
  // 内容大小验证相关 (Content size validation related)
  [PROCESSOR_KEYS.contentTooLarge]: '内容大小 ({{contentSize}} 字节) 超过允许的限制 ({{contentSizeLimit}} 字节)',
  [PROCESSOR_KEYS.contentSizeOk]: '内容大小 ({{contentSize}} 字节) 在允许的限制内 ({{contentSizeLimit}} 字节)',
}; 