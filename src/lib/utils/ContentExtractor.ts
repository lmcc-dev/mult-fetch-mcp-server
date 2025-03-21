/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { log, COMPONENTS } from '../logger.js';

/**
 * 内容提取器类 (Content extractor class)
 * 提供智能内容提取功能，基于Mozilla的Readability库 (Provides intelligent content extraction based on Mozilla's Readability library)
 */
export class ContentExtractor {
    /**
     * 提取HTML中的主要内容 (Extract main content from HTML)
     * @param html HTML内容 (HTML content)
     * @param url 页面URL，用于处理相对路径 (Page URL, used for handling relative paths)
     * @param debug 是否开启调试 (Whether to enable debugging)
     * @returns 提取的内容对象，包括标题、内容、文本等 (Extracted content object, including title, content, text, etc.)
     */
    public static extractContent(
        html: string,
        url: string,
        debug: boolean = false
    ): {
        title: string | null;
        content: string | null;
        textContent: string | null;
        excerpt: string | null;
        byline: string | null;
        siteName: string | null;
        length: number;
        isReaderable: boolean;
    } {
        log('extractor.creating_jsdom', debug, { url }, COMPONENTS.EXTRACTOR);

        try {
            // 创建JSDOM文档 (Create JSDOM document)
            const doc = new JSDOM(html, { url });

            // 检查页面是否适合进行可读性提取 (Check if the page is suitable for readability extraction)
            const isReaderable = this.isProbablyReaderable(doc.window.document, debug);

            // 如果页面不适合提取，返回空结果 (If the page is not suitable for extraction, return empty result)
            if (!isReaderable && debug) {
                log('extractor.page_not_readerable', true, { url }, COMPONENTS.EXTRACTOR);
            }

            // 即使页面可能不适合提取，我们也尝试进行提取 (Even if the page may not be suitable for extraction, we try to extract anyway)
            // 创建Readability解析器 (Create Readability parser)
            log('extractor.creating_reader', debug, {}, COMPONENTS.EXTRACTOR);
            const reader = new Readability(doc.window.document);

            // 解析内容 (Parse content)
            log('extractor.parsing_content', debug, {}, COMPONENTS.EXTRACTOR);
            const article = reader.parse();

            // 如果解析失败，返回空结果 (If parsing failed, return empty result)
            if (!article) {
                log('extractor.parsing_failed', debug, { url }, COMPONENTS.EXTRACTOR);
                return {
                    title: null,
                    content: null,
                    textContent: null,
                    excerpt: null,
                    byline: null,
                    siteName: null,
                    length: 0,
                    isReaderable
                };
            }

            log('extractor.parsing_success', debug, {
                title: article.title,
                contentLength: article.content?.length || 0,
                textLength: article.textContent?.length || 0
            }, COMPONENTS.EXTRACTOR);

            // 返回解析结果 (Return parsing result)
            return {
                title: article.title,
                content: article.content,
                textContent: article.textContent,
                excerpt: article.excerpt,
                byline: article.byline,
                siteName: article.siteName,
                length: article.length,
                isReaderable
            };
        } catch (error) {
            // 处理错误 (Handle error)
            log('extractor.extraction_error', true, {
                error: error instanceof Error ? error.message : String(error),
                url
            }, COMPONENTS.EXTRACTOR);

            return {
                title: null,
                content: null,
                textContent: null,
                excerpt: null,
                byline: null,
                siteName: null,
                length: 0,
                isReaderable: false
            };
        }
    }

    /**
     * 检查页面是否适合进行可读性提取 (Check if the page is suitable for readability extraction)
     * @param document DOM文档 (DOM document)
     * @param debug 是否开启调试 (Whether to enable debugging)
     * @returns 是否适合提取 (Whether it is suitable for extraction)
     */
    private static isProbablyReaderable(document: Document, debug: boolean = false): boolean {
        // 这些是常见的无法提取内容的页面类型 (These are common page types that cannot extract content)
        const unlikelyPageTypes = [
            /login/i, /signup/i, /register/i, /404/i, /403/i, /error/i, /captcha/i,
            /password/i, /forgot/i, /reset/i, /signin/i, /signout/i, /logout/i,
            /search/i, /contact/i, /about/i, /faq/i, /help/i, /support/i,
            /dashboard/i, /admin/i, /profile/i, /account/i, /settings/i,
            /cart/i, /checkout/i, /basket/i, /purchase/i, /payment/i,
            /calculator/i, /converter/i, /translator/i
        ];

        // 检查URL和标题是否包含不太可能包含文章的关键词 (Check if URL and title contain keywords that are unlikely to contain articles)
        const url = document.location?.href || '';
        const title = document.title || '';

        for (const pattern of unlikelyPageTypes) {
            if (pattern.test(url) || pattern.test(title)) {
                if (debug) {
                    log('extractor.unlikely_page_type', debug, { pattern: pattern.toString(), url, title }, COMPONENTS.EXTRACTOR);
                }
                return false;
            }
        }

        // 检查是否有文章相关元素 (Check if there are article-related elements)
        const hasArticleElements = !!document.querySelector('article') ||
            !!document.querySelector('[role="article"]') ||
            !!document.querySelector('[itemprop="articleBody"]') ||
            !!document.querySelector('.post-content') ||
            !!document.querySelector('.article-content') ||
            !!document.querySelector('.entry-content');

        if (hasArticleElements) {
            if (debug) {
                log('extractor.has_article_elements', debug, {}, COMPONENTS.EXTRACTOR);
            }
            return true;
        }

        // 检查是否有足够的段落 (Check if there are enough paragraphs)
        const paragraphs = document.querySelectorAll('p');
        if (paragraphs.length >= 5) {
            if (debug) {
                log('extractor.has_enough_paragraphs', debug, { count: paragraphs.length }, COMPONENTS.EXTRACTOR);
            }
            return true;
        }

        if (debug) {
            log('extractor.not_enough_content', debug, { paragraphs: paragraphs.length }, COMPONENTS.EXTRACTOR);
        }

        return false;
    }
} 