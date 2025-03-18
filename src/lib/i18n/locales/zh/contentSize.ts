/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CONTENT_SIZE_KEYS } from '../../keys/contentSize.js';

/**
 * 内容大小相关的中文文本 (Chinese texts related to content size)
 */
export const contentSizeZh = {
  [CONTENT_SIZE_KEYS.checking]: '检查内容大小: {{contentSize}}, 限制: {{limit}}, 是否超过限制: {{exceedsLimit}}',
  [CONTENT_SIZE_KEYS.truncating]: '内容大小超过限制，正在截断。原始大小: {{originalSize}}, 限制: {{limit}}',
  [CONTENT_SIZE_KEYS.truncated]: '内容已截断。最终大小: {{finalSize}}, 限制: {{limit}}',
  [CONTENT_SIZE_KEYS.splitting]: '内容大小超过限制，正在分段。原始大小: {{originalSize}}, 分段大小: {{chunkSize}}',
  [CONTENT_SIZE_KEYS.splitComplete]: '内容分段完成。共{{chunks}}个分段，平均大小: {{avgChunkSize}}'
}; 