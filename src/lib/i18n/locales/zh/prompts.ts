/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { PROMPTS_KEYS } from '../../keys/prompts.js';

// 提示相关消息 (Prompts related messages)
export default {
  // 提示列表和获取 (Prompt list and get)
  [PROMPTS_KEYS.list.request]: "收到提示列表请求: {{params}}",
  [PROMPTS_KEYS.get.request]: "收到提示获取请求: {{promptName}}, {{args}}",
  
  // 错误消息 (Error messages)
  [PROMPTS_KEYS.notFound]: "未找到提示模板",
  [PROMPTS_KEYS.missingRequiredArg]: "缺少必需参数",
  [PROMPTS_KEYS.useBrowserValue]: "处理 useBrowser 参数: 原始值={{original}}, 解析值={{parsed}}",
  
  // 通用提示 (Generic prompt)
  [PROMPTS_KEYS.generic.result]: "执行通用提示",
  [PROMPTS_KEYS.generic.message]: "执行提示模板",
  [PROMPTS_KEYS.generic.args]: "参数",
  
  // 是/否 (Yes/No)
  [PROMPTS_KEYS.yes]: "是",
  [PROMPTS_KEYS.no]: "否",
  
  // 提示描述和参数 (Prompt descriptions and parameters)
  [PROMPTS_KEYS.url.description]: "网站 URL",
  [PROMPTS_KEYS.format.description]: "返回格式，选项: html, json, text, markdown",
  [PROMPTS_KEYS.useBrowser.description]: "是否使用浏览器模式获取内容",
  [PROMPTS_KEYS.selector.description]: "用于提取特定内容的 CSS 选择器",
  [PROMPTS_KEYS.dataType.description]: "要提取的数据类型，如表格、列表、联系信息等",
  [PROMPTS_KEYS.error.description]: "获取过程中遇到的错误信息",
  
  // 获取网站提示 (Fetch website prompt)
  [PROMPTS_KEYS.fetchWebsite.description]: "获取网站内容",
  [PROMPTS_KEYS.fetchWebsite.result]: "网站内容获取结果",
  [PROMPTS_KEYS.fetchWebsite.message]: "我想获取网站的内容",
  [PROMPTS_KEYS.fetchWebsite.response]: "我可以帮您获取网站内容。请提供网站 URL 和所需格式。",
  [PROMPTS_KEYS.fetchWebsite.instruction]: "请获取以下网站的内容",
  [PROMPTS_KEYS.fetchWebsite.formatInstruction]: "请以以下格式返回内容",
  [PROMPTS_KEYS.fetchWebsite.browserInstruction]: "使用浏览器模式",
  
  // 提取内容提示 (Extract content prompt)
  [PROMPTS_KEYS.extractContent.description]: "从网站提取特定内容",
  [PROMPTS_KEYS.extractContent.result]: "内容提取结果",
  [PROMPTS_KEYS.extractContent.message]: "请从以下网站提取内容",
  [PROMPTS_KEYS.extractContent.selectorInstruction]: "使用以下 CSS 选择器提取内容",
  [PROMPTS_KEYS.extractContent.dataTypeInstruction]: "提取以下类型的数据",
  
  // 调试获取提示 (Debug fetch prompt)
  [PROMPTS_KEYS.debugFetch.description]: "调试网站获取问题",
  [PROMPTS_KEYS.debugFetch.result]: "获取问题调试结果",
  [PROMPTS_KEYS.debugFetch.message]: "我在获取以下网站时遇到问题",
  [PROMPTS_KEYS.debugFetch.errorDetails]: "错误详情",
  [PROMPTS_KEYS.debugFetch.instruction]: "请分析可能的原因并提供解决方案。考虑以下几点：\n1. 网站是否有反爬虫措施\n2. 是否需要浏览器模式\n3. 是否需要特定的请求头\n4. 是否需要处理重定向或 Cookie\n5. 网站是否需要 JavaScript 渲染"
}; 