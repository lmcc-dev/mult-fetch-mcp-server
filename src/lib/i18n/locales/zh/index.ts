/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { server } from './server.js';
import { client } from './client.js';
import { fetcher } from './fetcher.js';
import { browser } from './browser.js';
import { node } from './node.js';
import { tools } from './tools.js';
import { errors } from './errors.js';
import resources from './resources.js';
import prompts from './prompts.js';

// 中文翻译资源 (Chinese translation resources)
export const zhTranslation = {
  server,
  client,
  fetcher,
  browser,
  node,
  tools,
  errors,
  resources,
  prompts
}; 