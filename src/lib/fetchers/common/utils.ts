/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { execSync } from 'child_process';
import { log, COMPONENTS } from '../../logger.js';
import { t } from '../../i18n/index.js';

/**
 * 常用浏览器的User-Agent列表 (List of common browser User-Agents)
 * 用于模拟不同浏览器的请求 (Used to simulate requests from different browsers)
 */
export const userAgents = [
  // Chrome
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  // Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
  // Safari
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  // Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
];

/**
 * 获取随机User-Agent (Get random User-Agent)
 * @returns 随机的User-Agent字符串 (Random User-Agent string)
 */
export function getRandomUserAgent(): string {
  const index = Math.floor(Math.random() * userAgents.length);
  return userAgents[index];
}

/**
 * 随机延迟函数 (Random delay function)
 * 模拟人类行为，避免被检测为机器人 (Simulate human behavior, avoid being detected as a bot)
 * @param minMs 最小延迟毫秒数 (Minimum delay in milliseconds)
 * @param maxMs 最大延迟毫秒数 (Maximum delay in milliseconds)
 * @returns Promise对象 (Promise object)
 */
export async function randomDelay(minMs = 500, maxMs = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * 从URL中提取域名 (Extract domain from URL)
 * @param url URL字符串 (URL string)
 * @returns 域名字符串 (Domain string)
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return '';
  }
}

/**
 * 获取系统代理设置 (Get system proxy settings)
 * @param useSystemProxy 是否使用系统代理 (Whether to use system proxy)
 * @param debug 是否启用调试输出 (Whether to enable debug output)
 * @param component 组件名称 (Component name)
 * @returns 系统代理URL或undefined (System proxy URL or undefined)
 */
export function getSystemProxy(
  useSystemProxy: boolean = true, 
  debug: boolean = false, 
  component: string = COMPONENTS.NODE_FETCH
): string | undefined {
  // 如果不使用系统代理，直接返回undefined (If not using system proxy, return undefined directly)
  if (!useSystemProxy) {
    log('fetcher.systemProxyDisabled', debug, {}, component);
    return undefined;
  }
  
  // 检查所有可能的代理环境变量 (Check all possible proxy environment variables)
  const proxyVars = [
    'HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 
    'ALL_PROXY', 'all_proxy', 'NO_PROXY', 'no_proxy'
  ];
  
  // 输出所有环境变量的值，帮助调试 (Output all environment variable values to help debugging)
  log('fetcher.checkingProxyEnv', debug, {}, component);
  for (const varName of proxyVars) {
    log('fetcher.envVarValue', debug, { 
      name: varName, 
      value: process.env[varName] || t('fetcher.notSet') 
    }, component);
  }
  
  // 尝试获取代理设置 (Try to get proxy settings)
  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 
                   process.env.http_proxy || process.env.https_proxy || 
                   process.env.ALL_PROXY || process.env.all_proxy;
  
  if (proxyUrl) {
    log('fetcher.foundSystemProxy', debug, { proxy: proxyUrl }, component);
    return proxyUrl;
  }
  
  // 尝试从系统命令获取代理设置
  try {
    let shellOutput = '';
    if (process.platform === 'win32') {
      // Windows 系统使用 set 命令，忽略错误 (Windows systems use set command, ignore errors)
      try {
        shellOutput = execSync('set http_proxy & set https_proxy & set HTTP_PROXY & set HTTPS_PROXY', { encoding: 'utf8' });
      } catch (winError) {
        log('fetcher.errorGettingWindowsEnvVars', debug, { error: winError.toString() }, component);
      }
    } else {
      // Unix 系统使用 env 命令，忽略错误 (Unix systems use env command, ignore errors)
      try {
        // 使用 env 命令获取所有环境变量，不使用 grep 过滤，避免在没有匹配时返回非零退出码
        shellOutput = execSync('env', { encoding: 'utf8' });
        // 在代码中过滤代理相关的环境变量
        shellOutput = shellOutput.split('\n')
          .filter(line => line.toLowerCase().includes('proxy'))
          .join('\n');
      } catch (unixError) {
        log('fetcher.errorGettingUnixEnvVars', debug, { error: unixError.toString() }, component);
      }
    }
    
    if (shellOutput.trim()) {
      log('fetcher.systemCommandProxySettings', debug, { output: shellOutput.trim() }, component);
      
      // 解析输出找到代理 URL
      const proxyMatch = shellOutput.match(/(?:HTTP_PROXY|HTTPS_PROXY|http_proxy|https_proxy)=([^\s]+)/i);
      if (proxyMatch && proxyMatch[1]) {
        const systemProxyUrl = proxyMatch[1];
        log('fetcher.foundProxyFromCommand', debug, { proxy: systemProxyUrl }, component);
        return systemProxyUrl;
      }
    } else {
      log('fetcher.noSystemProxyFound', debug, {}, component);
    }
  } catch (error) {
    log('fetcher.errorGettingSystemEnvVars', debug, { error: error.toString() }, component);
  }
  
  // 检查是否设置了 NO_PROXY
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;
  if (noProxy) {
    log('fetcher.foundNoProxy', debug, { noProxy: noProxy }, component);
  }
  
  return undefined;
} 