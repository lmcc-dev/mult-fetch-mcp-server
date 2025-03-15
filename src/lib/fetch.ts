/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Fetcher, RequestPayload, FetchResponse } from './fetchers/index.js';

/**
 * 获取HTML内容 (Get HTML content)
 * @param requestPayload 请求参数 (Request parameters)
 * @returns HTML内容 (HTML content)
 */
export async function fetchHtml(requestPayload: RequestPayload): Promise<FetchResponse> {
  return await Fetcher.html(requestPayload);
}

/**
 * 获取JSON内容 (Get JSON content)
 * @param requestPayload 请求参数 (Request parameters)
 * @returns JSON内容 (JSON content)
 */
export async function fetchJson(requestPayload: RequestPayload): Promise<FetchResponse> {
  return await Fetcher.json(requestPayload);
}

/**
 * 获取纯文本内容 (Get plain text content)
 * @param requestPayload 请求参数 (Request parameters)
 * @returns 纯文本内容 (Plain text content)
 */
export async function fetchTxt(requestPayload: RequestPayload): Promise<FetchResponse> {
  return await Fetcher.txt(requestPayload);
}

/**
 * 获取Markdown内容 (Get Markdown content)
 * @param requestPayload 请求参数 (Request parameters)
 * @returns Markdown内容 (Markdown content)
 */
export async function fetchMarkdown(requestPayload: RequestPayload): Promise<FetchResponse> {
  return await Fetcher.markdown(requestPayload);
}

// 导出所有类型和类 (Export all types and classes)
export * from './fetchers/index.js'; 