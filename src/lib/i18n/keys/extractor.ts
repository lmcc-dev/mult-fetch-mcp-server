/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

const PREFIX = 'extractor';
const keyGen = createKeyGenerator(PREFIX);

/**
 * 内容提取器国际化键值 (Content extractor internationalization keys)
 */
export const EXTRACTOR_KEYS = {
    // 基础操作 (Basic operations)
    creating_jsdom: keyGen('creating_jsdom'),
    page_not_readerable: keyGen('page_not_readerable'),
    creating_reader: keyGen('creating_reader'),
    parsing_content: keyGen('parsing_content'),
    parsing_failed: keyGen('parsing_failed'),
    parsing_success: keyGen('parsing_success'),
    extraction_error: keyGen('extraction_error'),

    // 可读性检测 (Readability detection)
    unlikely_page_type: keyGen('unlikely_page_type'),
    has_article_elements: keyGen('has_article_elements'),
    has_enough_paragraphs: keyGen('has_enough_paragraphs'),
    not_enough_content: keyGen('not_enough_content')
}; 