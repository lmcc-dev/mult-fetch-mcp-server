/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * 提示相关键 (Prompts related keys)
 */
export const PROMPTS_KEYS = (() => {
  const keyGen = createKeyGenerator('prompts');
  return {
    // 提示列表和获取 (Prompt list and get)
    list: {
      request: keyGen('list.request')
    },
    get: {
      request: keyGen('get.request')
    },
    
    // 错误消息 (Error messages)
    notFound: keyGen('notFound'),
    missingRequiredArg: keyGen('missingRequiredArg'),
    useBrowserValue: keyGen('useBrowserValue'),
    
    // 通用提示 (Generic prompt)
    generic: {
      result: keyGen('generic.result'),
      message: keyGen('generic.message'),
      args: keyGen('generic.args')
    },
    
    // 是/否 (Yes/No)
    yes: keyGen('yes'),
    no: keyGen('no'),
    
    // 提示描述和参数 (Prompt descriptions and parameters)
    url: {
      description: keyGen('url.description')
    },
    format: {
      description: keyGen('format.description')
    },
    useBrowser: {
      description: keyGen('useBrowser.description')
    },
    selector: {
      description: keyGen('selector.description')
    },
    dataType: {
      description: keyGen('dataType.description')
    },
    error: {
      description: keyGen('error.description')
    },
    
    // 获取网站提示 (Fetch website prompt)
    fetchWebsite: {
      description: keyGen('fetchWebsite.description'),
      result: keyGen('fetchWebsite.result'),
      message: keyGen('fetchWebsite.message'),
      response: keyGen('fetchWebsite.response'),
      instruction: keyGen('fetchWebsite.instruction'),
      formatInstruction: keyGen('fetchWebsite.formatInstruction'),
      browserInstruction: keyGen('fetchWebsite.browserInstruction')
    },
    
    // 提取内容提示 (Extract content prompt)
    extractContent: {
      description: keyGen('extractContent.description'),
      result: keyGen('extractContent.result'),
      message: keyGen('extractContent.message'),
      selectorInstruction: keyGen('extractContent.selectorInstruction'),
      dataTypeInstruction: keyGen('extractContent.dataTypeInstruction')
    },
    
    // 调试获取提示 (Debug fetch prompt)
    debugFetch: {
      description: keyGen('debugFetch.description'),
      result: keyGen('debugFetch.result'),
      message: keyGen('debugFetch.message'),
      errorDetails: keyGen('debugFetch.errorDetails'),
      instruction: keyGen('debugFetch.instruction')
    }
  } as const;
})(); 