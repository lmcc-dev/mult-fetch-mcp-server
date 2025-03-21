/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, test, expect, vi } from 'vitest';
import { TemplateUtils } from '../../src/lib/utils/TemplateUtils.js';

// 模拟logger (Mock logger)
vi.mock('../../src/lib/logger.js', () => ({
    log: vi.fn(),
    COMPONENTS: {
        UTILS: 'utils'
    }
}));

describe('TemplateUtils 测试 (TemplateUtils Tests)', () => {

    test('replaceTemplateVariables应正确替换占位符 (replaceTemplateVariables should correctly replace placeholders)', () => {
        // 测试数据 (Test data)
        const template = 'Hello {{name}}, welcome to {{place}}!';
        const replacements = {
            name: 'Martin',
            place: 'Beijing'
        };

        // 执行测试 (Execute test)
        const result = TemplateUtils.replaceTemplateVariables(template, replacements);

        // 验证结果 (Verify result)
        expect(result).toBe('Hello Martin, welcome to Beijing!');
    });

    test('replaceTemplateVariables应能处理多次出现的同一占位符 (replaceTemplateVariables should handle multiple occurrences of the same placeholder)', () => {
        // 测试数据 (Test data)
        const template = '{{name}} is using {{tool}}, {{name}} likes {{tool}}';
        const replacements = {
            name: 'Martin',
            tool: 'VSCode'
        };

        // 执行测试 (Execute test)
        const result = TemplateUtils.replaceTemplateVariables(template, replacements);

        // 验证结果 (Verify result)
        expect(result).toBe('Martin is using VSCode, Martin likes VSCode');
    });

    test('replaceTemplateVariables应能处理空字符串和空替换项 (replaceTemplateVariables should handle empty strings and empty replacements)', () => {
        // 测试空模板 (Test empty template)
        expect(TemplateUtils.replaceTemplateVariables('', { key: 'value' })).toBe('');

        // 测试空替换项 (Test empty replacements)
        expect(TemplateUtils.replaceTemplateVariables('Hello {{name}}', {})).toBe('Hello {{name}}');

        // 测试空值替换项 (Test empty value replacements)
        expect(TemplateUtils.replaceTemplateVariables('Hello {{name}}', { name: '' })).toBe('Hello ');
    });

    test('generateSizeBasedChunkPrompt应正确生成分块提示 (generateSizeBasedChunkPrompt should correctly generate chunk prompts)', () => {
        // 测试数据 (Test data)
        const fetchedBytes = 1000;
        const totalBytes = 5000;
        const chunkId = 'test-chunk-id';
        const remainingBytes = 4000;
        const estimatedRequests = 2;
        const currentSizeLimit = 2000;

        // 执行测试 - 首次请求 (Execute test - first request)
        const resultFirst = TemplateUtils.generateSizeBasedChunkPrompt(
            fetchedBytes,
            totalBytes,
            chunkId,
            remainingBytes,
            estimatedRequests,
            currentSizeLimit,
            true
        );

        // 验证结果包含正确的信息 (Verify result contains correct information)
        expect(resultFirst).toContain(TemplateUtils.SYSTEM_NOTE.START);
        expect(resultFirst).toContain(TemplateUtils.SYSTEM_NOTE.END);
        expect(resultFirst).toContain('Content is too long and has been split.');
        expect(resultFirst).toContain('1,000 bytes (20% of total 5,000 bytes)');
        expect(resultFirst).toContain('4,000 bytes remaining');
        expect(resultFirst).toContain('contentSizeLimit=2,000');
        expect(resultFirst).toContain('approximately 2 more requests needed');
        expect(resultFirst).toContain(`chunkId="${chunkId}"`);
        expect(resultFirst).toContain('startCursor=1000');

        // 执行测试 - 后续请求 (Execute test - subsequent request)
        const resultSubsequent = TemplateUtils.generateSizeBasedChunkPrompt(
            fetchedBytes,
            totalBytes,
            chunkId,
            remainingBytes,
            estimatedRequests,
            currentSizeLimit,
            false
        );

        // 验证结果不包含首次请求的提示文本 (Verify result does not contain first request prompt text)
        expect(resultSubsequent).not.toContain('Content is too long and has been split.');
    });

    test('generateSizeBasedLastChunkPrompt应正确生成最后一个分块的提示 (generateSizeBasedLastChunkPrompt should correctly generate last chunk prompts)', () => {
        // 测试数据 (Test data)
        const fetchedBytes = 5000;
        const totalBytes = 5000;

        // 执行测试 - 首次请求 (Execute test - first request)
        const resultFirst = TemplateUtils.generateSizeBasedLastChunkPrompt(
            fetchedBytes,
            totalBytes,
            true
        );

        // 验证结果包含正确的信息 (Verify result contains correct information)
        expect(resultFirst).toContain(TemplateUtils.SYSTEM_NOTE.START);
        expect(resultFirst).toContain(TemplateUtils.SYSTEM_NOTE.END);
        expect(resultFirst).toContain('Content is too long and has been split.');
        expect(resultFirst).toContain('5,000 bytes (100% of total 5,000 bytes)');
        expect(resultFirst).toContain('This is the last part of the content');
        expect(resultFirst).toContain('No further requests needed');

        // 执行测试 - 后续请求 (Execute test - subsequent request)
        const resultSubsequent = TemplateUtils.generateSizeBasedLastChunkPrompt(
            fetchedBytes,
            totalBytes,
            false
        );

        // 验证结果不包含首次请求的提示文本 (Verify result does not contain first request prompt text)
        expect(resultSubsequent).not.toContain('Content is too long and has been split.');
    });

    test('generateSizeBasedChunkPrompt在remainingBytes为0时应调用generateSizeBasedLastChunkPrompt (generateSizeBasedChunkPrompt should call generateSizeBasedLastChunkPrompt when remainingBytes is 0)', () => {
        // 测试数据 (Test data)
        const fetchedBytes = 5000;
        const totalBytes = 5000;
        const chunkId = 'test-chunk-id';
        const remainingBytes = 0;
        const estimatedRequests = 0;
        const currentSizeLimit = 2000;

        // 执行测试 (Execute test)
        const result = TemplateUtils.generateSizeBasedChunkPrompt(
            fetchedBytes,
            totalBytes,
            chunkId,
            remainingBytes,
            estimatedRequests,
            currentSizeLimit,
            true
        );

        // 验证结果与generateSizeBasedLastChunkPrompt的结果一致 
        // (Verify result matches the result of generateSizeBasedLastChunkPrompt)
        const expectedResult = TemplateUtils.generateSizeBasedLastChunkPrompt(
            fetchedBytes,
            totalBytes,
            true
        );

        expect(result).toBe(expectedResult);
    });

    test('hasSystemPrompt应正确检测内容是否包含系统提示 (hasSystemPrompt should correctly detect if content contains system prompt)', () => {
        // 测试数据 (Test data)
        const contentWithPrompt = `Some content\n\n${TemplateUtils.SYSTEM_NOTE.START}\nSystem note\n${TemplateUtils.SYSTEM_NOTE.END}`;
        const contentWithoutPrompt = 'Some content without system note';
        const contentWithStartOnly = `Some content\n\n${TemplateUtils.SYSTEM_NOTE.START}\nSystem note`;
        const contentWithEndOnly = `Some content\nSystem note\n${TemplateUtils.SYSTEM_NOTE.END}`;

        // 验证结果 (Verify results)
        expect(TemplateUtils.hasSystemPrompt(contentWithPrompt)).toBe(true);
        expect(TemplateUtils.hasSystemPrompt(contentWithoutPrompt)).toBe(false);
        expect(TemplateUtils.hasSystemPrompt(contentWithStartOnly)).toBe(false);
        expect(TemplateUtils.hasSystemPrompt(contentWithEndOnly)).toBe(false);
    });
}); 