/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import server from './server.js';
import client from './client.js';
import fetcher from './fetcher.js';
import factory from './factory.js';
import browser from './browser.js';
import node from './node.js';
import tools from './tools.js';
import errors from './errors.js';
import resources from './resources.js';
import prompts from './prompts.js';
import url from './url.js';
import extractor from './extractor.js';
import { contentSizeEn as contentSize } from './contentSize.js';
import { chunkManagerEn as chunkManager } from './chunkManager.js';
import { processorEn as processor } from './processor.js';

// 英文翻译资源 (English translation resources)
export const enTranslation = {
  server,
  client,
  fetcher,
  factory,
  browser,
  node,
  tools,
  errors,
  resources,
  prompts,
  url,
  extractor,
  contentSize,
  chunkManager,
  processor
}; 