/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

const PREFIX = 'contentSize';
const keyGen = createKeyGenerator(PREFIX);

/**
 * 内容大小相关的国际化键 (Internationalization keys related to content size)
 */
export const CONTENT_SIZE_KEYS = {
  // 内容大小检查相关 (Content size checking related)
  checking: keyGen('checking'),
  truncating: keyGen('truncating'),
  truncated: keyGen('truncated'),
  splitting: keyGen('splitting'),
  splitComplete: keyGen('splitComplete'),
  splitIntoChunks: keyGen('splitIntoChunks')
} as const; 