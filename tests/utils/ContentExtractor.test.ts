/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ContentExtractor } from '../../src/lib/utils/ContentExtractor.js';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// 模拟logger (Mock logger)
vi.mock('../../src/lib/logger.js', () => ({
    log: vi.fn(),
    COMPONENTS: {
        EXTRACTOR: 'CONTENT-EXTRACTOR'
    }
}));

// 模拟JSDOM (Mock JSDOM)
vi.mock('jsdom', () => {
    const mockDocument = {
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(),
        location: { href: 'https://example.com/article' },
        title: 'Test Article'
    };

    return {
        JSDOM: vi.fn().mockImplementation(() => ({
            window: {
                document: mockDocument
            }
        }))
    };
});

// 模拟Readability (Mock Readability)
const mockParse = vi.fn();
vi.mock('@mozilla/readability', () => ({
    Readability: vi.fn().mockImplementation(() => ({
        parse: mockParse
    }))
}));

describe('ContentExtractor 测试 (ContentExtractor Tests)', () => {
    beforeEach(() => {
        // 清理mocks (Clear mocks)
        vi.clearAllMocks();
    });

    test('extractContent应正确提取页面内容 (extractContent should correctly extract page content)', () => {
        // 设置模拟返回值 (Set mock return values)
        const mockArticle = {
            title: 'Test Article Title',
            content: '<div><p>This is the article content.</p></div>',
            textContent: 'This is the article content.',
            excerpt: 'Article excerpt',
            byline: 'Author Name',
            siteName: 'Example Site',
            length: 100,
            dir: 'ltr',
            lang: 'en',
            publishedTime: '2023-01-01T00:00:00Z'
        };

        // 设置Readability的parse方法返回模拟文章 (Set Readability's parse method to return mock article)
        mockParse.mockReturnValue(mockArticle);

        // 设置isProbablyReaderable返回true (Set isProbablyReaderable to return true)
        const originalIsProbablyReaderable = ContentExtractor['isProbablyReaderable'];
        ContentExtractor['isProbablyReaderable'] = vi.fn().mockReturnValue(true);

        // 调用测试方法 (Call test method)
        const result = ContentExtractor.extractContent(
            '<html><body><article><p>Test content</p></article></body></html>',
            'https://example.com/article',
            true
        );

        // 恢复原始方法 (Restore original method)
        ContentExtractor['isProbablyReaderable'] = originalIsProbablyReaderable;

        // 验证结果 (Verify results)
        expect(result).toEqual({
            title: 'Test Article Title',
            content: '<div><p>This is the article content.</p></div>',
            textContent: 'This is the article content.',
            excerpt: 'Article excerpt',
            byline: 'Author Name',
            siteName: 'Example Site',
            length: 100,
            isReaderable: true
        });

        // 验证JSDOM和Readability被正确调用 (Verify JSDOM and Readability were correctly called)
        expect(JSDOM).toHaveBeenCalledWith(
            '<html><body><article><p>Test content</p></article></body></html>',
            { url: 'https://example.com/article' }
        );
        expect(Readability).toHaveBeenCalled();
        expect(mockParse).toHaveBeenCalled();
    });

    test('extractContent应在无法提取内容时返回空结果 (extractContent should return empty result when content cannot be extracted)', () => {
        // 设置Readability的parse方法返回null (Set Readability's parse method to return null)
        mockParse.mockReturnValue(null);

        // 设置isProbablyReaderable返回false (Set isProbablyReaderable to return false)
        const originalIsProbablyReaderable = ContentExtractor['isProbablyReaderable'];
        ContentExtractor['isProbablyReaderable'] = vi.fn().mockReturnValue(false);

        // 调用测试方法 (Call test method)
        const result = ContentExtractor.extractContent(
            '<html><body><div>Test content</div></body></html>',
            'https://example.com/page',
            true
        );

        // 恢复原始方法 (Restore original method)
        ContentExtractor['isProbablyReaderable'] = originalIsProbablyReaderable;

        // 验证结果 (Verify results)
        expect(result).toEqual({
            title: null,
            content: null,
            textContent: null,
            excerpt: null,
            byline: null,
            siteName: null,
            length: 0,
            isReaderable: false
        });
    });

    test('extractContent应处理提取过程中的错误 (extractContent should handle errors during extraction)', () => {
        // 设置JSDOM抛出错误 (Set JSDOM to throw an error)
        vi.mocked(JSDOM).mockImplementationOnce(() => {
            throw new Error('JSDOM error');
        });

        // 调用测试方法 (Call test method)
        const result = ContentExtractor.extractContent(
            '<html><body><div>Test content</div></body></html>',
            'https://example.com/page',
            true
        );

        // 验证结果 (Verify results)
        expect(result).toEqual({
            title: null,
            content: null,
            textContent: null,
            excerpt: null,
            byline: null,
            siteName: null,
            length: 0,
            isReaderable: false
        });
    });

    test('isProbablyReaderable应检测特定类型的页面 (isProbablyReaderable should detect specific types of pages)', () => {
        // 创建测试用的document对象 (Create document object for testing)
        const mockDocument = {
            location: { href: 'https://example.com/article' },
            title: 'Test Article',
            querySelector: vi.fn(),
            querySelectorAll: vi.fn()
        };

        // 测试1: 页面包含不太可能是文章的URL特征 (Test 1: Page contains URL patterns unlikely to be articles)
        const loginPageDoc = {
            ...mockDocument,
            location: { href: 'https://example.com/login' },
            title: 'Login Page'
        };

        expect(ContentExtractor['isProbablyReaderable'](loginPageDoc as unknown as Document, true)).toBe(false);

        // 测试2: 页面包含文章元素 (Test 2: Page contains article elements)
        const articlePageDoc = {
            ...mockDocument,
            querySelector: vi.fn().mockImplementation((selector) => {
                if (selector === 'article') return { tagName: 'ARTICLE' };
                return null;
            })
        };

        expect(ContentExtractor['isProbablyReaderable'](articlePageDoc as unknown as Document, true)).toBe(true);

        // 测试3: 页面包含足够的段落 (Test 3: Page contains enough paragraphs)
        const paragraphsPageDoc = {
            ...mockDocument,
            querySelector: vi.fn().mockReturnValue(null),
            querySelectorAll: vi.fn().mockImplementation((selector) => {
                if (selector === 'p') return Array(6).fill({ tagName: 'P' });
                return [];
            })
        };

        expect(ContentExtractor['isProbablyReaderable'](paragraphsPageDoc as unknown as Document, true)).toBe(true);

        // 测试4: 页面内容不足 (Test 4: Not enough content on page)
        const insufficientContentDoc = {
            ...mockDocument,
            querySelector: vi.fn().mockReturnValue(null),
            querySelectorAll: vi.fn().mockImplementation((selector) => {
                if (selector === 'p') return Array(2).fill({ tagName: 'P' });
                return [];
            })
        };

        expect(ContentExtractor['isProbablyReaderable'](insufficientContentDoc as unknown as Document, true)).toBe(false);
    });
}); 