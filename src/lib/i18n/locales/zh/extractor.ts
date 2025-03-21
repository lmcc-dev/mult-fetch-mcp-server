/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { EXTRACTOR_KEYS } from '../../keys/extractor.js';

// 内容提取器的中文翻译 (Chinese translations for content extractor)
export default {
    // 基础操作 (Basic operations)
    [EXTRACTOR_KEYS.creating_jsdom]: '正在为内容提取创建JSDOM文档',
    [EXTRACTOR_KEYS.page_not_readerable]: '页面不适合使用Readability解析',
    [EXTRACTOR_KEYS.creating_reader]: '正在创建Readability解析器',
    [EXTRACTOR_KEYS.parsing_content]: '正在使用Readability解析内容',
    [EXTRACTOR_KEYS.parsing_failed]: '使用Readability解析内容失败',
    [EXTRACTOR_KEYS.parsing_success]: '使用Readability成功解析内容',
    [EXTRACTOR_KEYS.extraction_error]: '内容提取过程中发生错误',

    // 可读性检测 (Readability detection)
    [EXTRACTOR_KEYS.unlikely_page_type]: '页面类型不太可能包含可读内容',
    [EXTRACTOR_KEYS.has_article_elements]: '页面包含文章元素',
    [EXTRACTOR_KEYS.has_enough_paragraphs]: '页面包含足够的段落可供提取',
    [EXTRACTOR_KEYS.not_enough_content]: '页面不包含足够的内容用于提取'
}; 