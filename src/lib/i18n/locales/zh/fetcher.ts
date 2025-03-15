/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { FETCHER_KEYS } from '../../keys/fetcher.js';

// 获取器相关消息 (Fetcher related messages)
export default {  [FETCHER_KEYS.checkingProxyEnv]: "检查代理环境变量",  [FETCHER_KEYS.errorGettingUnixEnvVars]: "获取 Unix 环境变量时出错: {{error}}",
  [FETCHER_KEYS.errorGettingSystemEnvVars]: "获取系统环境变量时出错: {{error}}",
  [FETCHER_KEYS.noSystemProxyFound]: "未找到系统代理",}; 