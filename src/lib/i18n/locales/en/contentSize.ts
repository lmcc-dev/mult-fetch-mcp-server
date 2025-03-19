/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CONTENT_SIZE_KEYS } from '../../keys/contentSize.js';

/**
 * 内容大小相关的英文文本 (English texts related to content size)
 */
export const contentSizeEn = {
  [CONTENT_SIZE_KEYS.checking]: 'Checking content size: {{contentSize}}, limit: {{limit}}, exceeds limit: {{exceedsLimit}}',
  [CONTENT_SIZE_KEYS.truncating]: 'Content size exceeds limit, truncating. Original size: {{originalSize}}, limit: {{limit}}',
  [CONTENT_SIZE_KEYS.truncated]: 'Content truncated. Final size: {{finalSize}}, limit: {{limit}}',
  [CONTENT_SIZE_KEYS.splitting]: 'Content size exceeds limit, splitting. Original size: {{originalSize}}, chunk size: {{chunkSize}}',
  [CONTENT_SIZE_KEYS.splitComplete]: 'Content splitting complete. Total {{chunks}} chunks, average size: {{avgChunkSize}}',
  [CONTENT_SIZE_KEYS.splitIntoChunks]: 'Splitting content into {{chunkCount}} chunks of approximately {{chunkSize}} bytes each'
}; 