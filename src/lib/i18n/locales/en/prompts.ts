/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { PROMPTS_KEYS } from '../../keys/prompts.js';

export default {
  // 提示列表和获取 (Prompt list and get)
  [PROMPTS_KEYS.list.request]: 'Received prompt list request: {{params}}',
  [PROMPTS_KEYS.get.request]: 'Received prompt get request: {{promptName}}, {{args}}',
  
  // 错误消息 (Error messages)
  [PROMPTS_KEYS.notFound]: 'Prompt template not found',
  [PROMPTS_KEYS.missingRequiredArg]: 'Missing required argument',
  [PROMPTS_KEYS.useBrowserValue]: 'Processing useBrowser parameter: original={{original}}, parsed={{parsed}}',
  
  // 通用提示 (Generic prompt)
  [PROMPTS_KEYS.generic.result]: 'Execute generic prompt',
  [PROMPTS_KEYS.generic.message]: 'Execute prompt template',
  [PROMPTS_KEYS.generic.args]: 'Arguments',
  
  // 是/否 (Yes/No)
  [PROMPTS_KEYS.yes]: 'Yes',
  [PROMPTS_KEYS.no]: 'No',
  
  // 提示描述和参数 (Prompt descriptions and parameters)
  [PROMPTS_KEYS.url.description]: 'Website URL',
  [PROMPTS_KEYS.format.description]: 'Return format, options: html, json, text, markdown',
  [PROMPTS_KEYS.useBrowser.description]: 'Whether to use browser mode to fetch content',
  [PROMPTS_KEYS.selector.description]: 'CSS selector for extracting specific content',
  [PROMPTS_KEYS.dataType.description]: 'Type of data to extract, such as tables, lists, contact info, etc.',
  [PROMPTS_KEYS.error.description]: 'Error information encountered during fetching',
  
  // 获取网站提示 (Fetch website prompt)
  [PROMPTS_KEYS.fetchWebsite.description]: 'Fetch website content',
  [PROMPTS_KEYS.fetchWebsite.result]: 'Website content fetch result',
  [PROMPTS_KEYS.fetchWebsite.message]: 'I want to fetch the content of a website',
  [PROMPTS_KEYS.fetchWebsite.response]: 'I can help you fetch website content. Please provide the website URL and desired format.',
  [PROMPTS_KEYS.fetchWebsite.instruction]: 'Please fetch the content of the following website',
  [PROMPTS_KEYS.fetchWebsite.formatInstruction]: 'Please return the content in the following format',
  [PROMPTS_KEYS.fetchWebsite.browserInstruction]: 'Use browser mode',
  
  // 提取内容提示 (Extract content prompt)
  [PROMPTS_KEYS.extractContent.description]: 'Extract specific content from a website',
  [PROMPTS_KEYS.extractContent.result]: 'Content extraction result',
  [PROMPTS_KEYS.extractContent.message]: 'Please extract content from the following website',
  [PROMPTS_KEYS.extractContent.selectorInstruction]: 'Use the following CSS selector to extract content',
  [PROMPTS_KEYS.extractContent.dataTypeInstruction]: 'Extract the following type of data',
  
  // 调试获取提示 (Debug fetch prompt)
  [PROMPTS_KEYS.debugFetch.description]: 'Debug website fetching issues',
  [PROMPTS_KEYS.debugFetch.result]: 'Fetch issue debugging result',
  [PROMPTS_KEYS.debugFetch.message]: 'I\'m having issues fetching the following website',
  [PROMPTS_KEYS.debugFetch.errorDetails]: 'Error details',
  [PROMPTS_KEYS.debugFetch.instruction]: 'Please analyze possible causes and provide solutions. Consider the following points:\n1. Does the website have anti-scraping measures\n2. Is browser mode needed\n3. Are specific headers required\n4. Is redirect or cookie handling needed\n5. Does the website require JavaScript rendering'
}; 