/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CLIENT_KEYS } from '../../keys/client.js';

// 客户端相关消息 (Client related messages)
export default {
  // 连接相关 (Connection related)  
  // 错误相关 (Error related)  [CLIENT_KEYS.fetchError]: 'Fetch error: {{error}}',
  
  // 请求相关 (Request related)  
  // 内容相关 (Content related)  
  // 调试相关 (Debug related)  
  // 原有键 (Original keys)  [CLIENT_KEYS.statusCodeDetected]: 'Status code detected: {{statusCode}}',
  [CLIENT_KEYS.usageInfo]: 'Usage info: {{info}}',
  [CLIENT_KEYS.exampleUsage]: 'Example usage: {{example}}',
  [CLIENT_KEYS.invalidJson]: 'Invalid JSON: {{error}}',
  [CLIENT_KEYS.usingCommandLineProxy]: 'Using command line proxy: {{proxy}}',
  [CLIENT_KEYS.invalidProxyFormat]: 'Invalid proxy format: {{proxy}}',  [CLIENT_KEYS.systemProxyDisabled]: 'System proxy disabled',
  [CLIENT_KEYS.usingSystemProxy]: 'Using system proxy: {{proxy}}',
  [CLIENT_KEYS.noSystemProxy]: 'No system proxy found',
  [CLIENT_KEYS.requestFailed]: 'Request failed: {{error}}',
  [CLIENT_KEYS.fatalError]: 'Fatal error: {{error}}',
  [CLIENT_KEYS.startingServer]: 'Starting server...',
  [CLIENT_KEYS.fetchingUrl]: 'Fetching URL: {{url}}',
  [CLIENT_KEYS.usingMode]: 'Using {{mode}} mode',
  [CLIENT_KEYS.fetchFailed]: 'Fetch failed: {{error}}',
  [CLIENT_KEYS.fetchSuccess]: 'Fetch successful',
  [CLIENT_KEYS.browserModeNeeded]: 'Browser mode needed for: {{url}}',
  [CLIENT_KEYS.retryingWithBrowser]: 'Retrying with browser mode',
  [CLIENT_KEYS.browserModeFetchFailed]: 'Browser mode fetch failed: {{error}}',
  [CLIENT_KEYS.browserModeFetchSuccess]: 'Browser mode fetch successful',
  [CLIENT_KEYS.serverClosed]: 'Server closed',
  [CLIENT_KEYS.proxySet]: 'Proxy set: {{proxy}}'
}; 