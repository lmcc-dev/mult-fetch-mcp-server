/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { z } from "zod";
import { Agent } from "http";

/**
 * 扩展RequestInit类型，添加agent属性 (Extend RequestInit type, add agent property)
 * 用于支持代理和超时设置 (Used to support proxy and timeout settings)
 */
export interface ExtendedRequestInit extends RequestInit {
  /**
   * HTTP代理代理实例 (HTTP proxy agent instance)
   */
  agent?: Agent;
  /**
   * 调度器配置 (Dispatcher configuration)
   */
  dispatcher?: {
    /**
     * 连接超时时间(毫秒) (Connection timeout in milliseconds)
     */
    connectTimeout?: number;
    [key: string]: any;
  };
}

/**
 * 浏览器特定参数 (Browser-specific parameters)
 */
export const BrowserParamsSchema = z.object({
  waitForSelector: z.string().optional(),
  waitForTimeout: z.number().optional(),
  scrollToBottom: z.boolean().optional(),
  saveCookies: z.boolean().optional(),
  useBrowser: z.boolean().optional(),
  useNodeFetch: z.boolean().optional(),
  autoDetectMode: z.boolean().optional(),
  closeBrowser: z.boolean().optional(),
});

/**
 * 请求参数模式 (Request parameters schema)
 */
export const RequestPayloadSchema = z.object({
  url: z.string(),
  method: z.string().optional(),
  headers: z.record(z.string()).optional(),
  proxy: z.string().optional(),
  noDelay: z.boolean().optional(),
  timeout: z.number().optional(),
  maxRedirects: z.number().optional(),
  useSystemProxy: z.boolean().optional(),
  debug: z.boolean().optional(),
  useBrowser: z.boolean().optional(),
  useNodeFetch: z.boolean().optional(),
  autoDetectMode: z.boolean().optional(),
  waitForSelector: z.string().optional(),
  waitForTimeout: z.number().optional(),
  scrollToBottom: z.boolean().optional(),
  closeBrowser: z.boolean().optional(),
  saveCookies: z.boolean().optional(),
}).merge(BrowserParamsSchema);

export type RequestPayload = z.infer<typeof RequestPayloadSchema>;

/**
 * 定义响应接口 (Define response interface)
 * 包含内容和错误状态 (Contains content and error status)
 */
export interface FetchResponse {
  content: Array<{ type: string; text: string }>;
  isError: boolean;
}

/**
 * 定义HTML响应接口 (Define HTML response interface)
 */
export interface HtmlResponse {
  html: string;
  url: string;
  status: number;
  headers: Record<string, string>;
}

/**
 * 定义JSON响应接口 (Define JSON response interface)
 */
export interface JsonResponse {
  json: any;
  text: string;
  url: string;
  status: number;
  headers: Record<string, string>;
}

/**
 * 定义文本响应接口 (Define text response interface)
 */
export interface TextResponse {
  text: string;
  url: string;
  status: number;
  headers: Record<string, string>;
}

/**
 * 定义Markdown响应接口 (Define Markdown response interface)
 */
export interface MarkdownResponse {
  markdown: string;
  html: string;
  url: string;
  status: number;
  headers: Record<string, string>;
}

/**
 * 定义抓取器接口 (Define fetcher interface)
 */
export interface IFetcher {
  html(requestPayload: RequestPayload): Promise<any>;
  json(requestPayload: RequestPayload): Promise<any>;
  txt(requestPayload: RequestPayload): Promise<any>;
  markdown(requestPayload: RequestPayload): Promise<any>;
} 