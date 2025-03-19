/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 定义请求参数类型 (Define request parameter type)
 * 包含所有网页获取所需的配置选项 (Contains all configuration options needed for webpage fetching)
 */
export interface FetchParams {
  /**
   * 要获取的URL (URL to fetch)
   */
  url: string;
  
  /**
   * 开始游标位置，指定从哪个字节位置开始获取内容 (Start cursor position, specifies from which byte position to start fetching content)
   * 首次请求时默认为0，后续请求时必须提供以支持断点续传 (Default is 0 for first request, must be provided for subsequent requests to support resuming)
   */
  startCursor?: number;
  
  /**
   * 请求头 (Request headers)
   */
  headers?: Record<string, string>;
  
  /**
   * 超时时间(毫秒) (Timeout in milliseconds)
   */
  timeout?: number;
  
  /**
   * 代理服务器URL (Proxy server URL)
   */
  proxy?: string;
  
  /**
   * 最大重定向次数 (Maximum number of redirects)
   */
  maxRedirects?: number;
  
  /**
   * 是否禁用随机延迟 (Whether to disable random delay)
   */
  noDelay?: boolean;
  
  /**
   * 是否使用系统代理 (Whether to use system proxy)
   */
  useSystemProxy?: boolean;
  
  /**
   * 是否启用调试输出 (Whether to enable debug output)
   */
  debug?: boolean;
  
  /**
   * 是否使用浏览器模式 (Whether to use browser mode)
   */
  useBrowser?: boolean;
  
  /**
   * 是否自动检测并切换模式 (Whether to automatically detect and switch modes)
   */
  autoDetectMode?: boolean;
  
  /**
   * 浏览器模式下等待的选择器 (Selector to wait for in browser mode)
   */
  waitForSelector?: string;
  
  /**
   * 浏览器模式下等待的超时时间(毫秒) (Timeout to wait in browser mode in milliseconds)
   */
  waitForTimeout?: number;
  
  /**
   * 是否滚动到页面底部 (Whether to scroll to the bottom of the page)
   */
  scrollToBottom?: boolean;
  
  /**
   * 是否保存cookies (Whether to save cookies)
   */
  saveCookies?: boolean;
  
  /**
   * 是否在获取后关闭浏览器 (Whether to close the browser after fetching)
   */
  closeBrowser?: boolean;
  
  /**
   * 请求方法 (Request method)
   */
  method?: string;
  
  /**
   * 分块ID (Chunk ID)
   */
  chunkId?: string;
  
  /**
   * 内容大小限制(字节) (Content size limit in bytes)
   */
  contentSizeLimit?: number;
  
  /**
   * 是否启用内容分割 (Whether to enable content splitting)
   */
  enableContentSplitting?: boolean;
}