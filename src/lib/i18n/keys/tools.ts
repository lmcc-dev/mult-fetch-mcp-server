/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * 工具相关键 (Tools related keys)
 */
export const TOOLS_KEYS = (() => {
  const keyGen = createKeyGenerator('tools');
  return {
    // 通用工具描述 (General tool descriptions)
    fetchHtmlDescription: keyGen('fetchHtmlDescription'),
    fetchJsonDescription: keyGen('fetchJsonDescription'),
    fetchTxtDescription: keyGen('fetchTxtDescription'),
    fetchMarkdownDescription: keyGen('fetchMarkdownDescription'),
    
    // 参数描述 (Parameter descriptions)
    urlDescription: keyGen('urlDescription'),
    
    // 错误消息 (Error messages)
    fetchHtmlError: keyGen('fetchHtmlError'),
    fetchJsonError: keyGen('fetchJsonError'),
    fetchTxtError: keyGen('fetchTxtError'),
    fetchMarkdownError: keyGen('fetchMarkdownError'),
    jsonParseWarning: keyGen('jsonParseWarning'),
    
    // 成功消息 (Success messages)
    fetchHtmlSuccess: keyGen('fetchHtmlSuccess'),
    fetchJsonSuccess: keyGen('fetchJsonSuccess'),
    fetchTxtSuccess: keyGen('fetchTxtSuccess'),
    fetchMarkdownSuccess: keyGen('fetchMarkdownSuccess'),
    
    // 工具调用相关 (Tool call related)
    callReceived: keyGen('callReceived'),
    unknownTool: keyGen('unknownTool'),
    callError: keyGen('callError'),
    missingUrl: keyGen('missingUrl'),
    fetchRequest: keyGen('fetchRequest'),
    fetchError: keyGen('fetchError'),
    
    // 参数相关 (Parameters related)
    missingUrlOrChunkId: keyGen('missingUrlOrChunkId'),
    missingStartCursor: keyGen('missingStartCursor'),
    fetchChunkRequest: keyGen('fetchChunkRequest')
  } as const;
})(); 