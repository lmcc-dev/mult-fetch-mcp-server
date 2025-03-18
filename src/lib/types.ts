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

// 浏览器特定参数
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
  chunkId: z.string().optional(),
  chunkIndex: z.number().optional(),
}).merge(BrowserParamsSchema);

export type RequestPayload = z.infer<typeof RequestPayloadSchema>; 