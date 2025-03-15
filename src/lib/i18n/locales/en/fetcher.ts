/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { FETCHER_KEYS } from '../../keys/fetcher.js';

// 获取器相关消息 (Fetcher related messages)
export default {  [FETCHER_KEYS.checkingProxyEnv]: "Checking proxy environment variables",  [FETCHER_KEYS.errorGettingUnixEnvVars]: "Error getting Unix environment variables: {{error}}",
  [FETCHER_KEYS.errorGettingSystemEnvVars]: "Error getting system environment variables: {{error}}",
  [FETCHER_KEYS.noSystemProxyFound]: "No system proxy found",}; 