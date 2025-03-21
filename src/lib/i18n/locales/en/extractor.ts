/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { EXTRACTOR_KEYS } from '../../keys/extractor.js';

/**
 * 内容提取器的英文翻译 (English translations for content extractor)
 */
export default {
    // Basic operations
    [EXTRACTOR_KEYS.creating_jsdom]: 'Creating JSDOM document for content extraction',
    [EXTRACTOR_KEYS.page_not_readerable]: 'Page is not suitable for Readability parsing',
    [EXTRACTOR_KEYS.creating_reader]: 'Creating Readability parser',
    [EXTRACTOR_KEYS.parsing_content]: 'Parsing content with Readability',
    [EXTRACTOR_KEYS.parsing_failed]: 'Failed to parse content with Readability',
    [EXTRACTOR_KEYS.parsing_success]: 'Successfully parsed content with Readability',
    [EXTRACTOR_KEYS.extraction_error]: 'Error occurred during content extraction',

    // Readability detection
    [EXTRACTOR_KEYS.unlikely_page_type]: 'Page type is unlikely to contain readable content',
    [EXTRACTOR_KEYS.has_article_elements]: 'Page contains article elements',
    [EXTRACTOR_KEYS.has_enough_paragraphs]: 'Page contains enough paragraphs for extraction',
    [EXTRACTOR_KEYS.not_enough_content]: 'Page does not contain enough content for extraction'
}; 