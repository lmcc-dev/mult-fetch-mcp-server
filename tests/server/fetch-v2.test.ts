/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant
 * Description: 2.0 单次抓取、截断续传与 SSRF 回归 / 2.0 single-shot fetch, continuation, and SSRF regression
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { NodeFetcher } from '../../src/lib/fetchers/node/NodeFetcher.js';
import { HttpClient } from '../../src/lib/fetchers/node/HttpClient.js';

vi.mock('../../src/lib/fetchers/node/HttpClient.js', () => ({
  HttpClient: {
    fetchWithRedirects: vi.fn()
  }
}));

const LONG_TEXT = 'alpha beta gamma delta epsilon zeta eta theta';

describe('fetch 2.0 content window', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(HttpClient.fetchWithRedirects).mockResolvedValue({
      text: async () => LONG_TEXT
    } as any);
  });

  test('returns the full body in one response when no cursor is sent', async () => {
    const fetcher = new NodeFetcher();
    const result = await fetcher.txt({
      url: 'https://example.com/story.txt',
      maxChars: 1000,
      maxBytes: 10000
    });

    expect(result.isError).toBe(false);
    expect(result.truncated).toBe(false);
    expect(result.nextCursor).toBeUndefined();
    expect(result.content[0].text).toBe(LONG_TEXT);
    expect(HttpClient.fetchWithRedirects).toHaveBeenCalledTimes(1);
  });

  test('truncates on a word boundary and continues with nextCursor', async () => {
    const fetcher = new NodeFetcher();
    const first = await fetcher.txt({
      url: 'https://example.com/story.txt',
      maxChars: 12,
      maxBytes: 1000,
      noDelay: true
    });

    expect(first.isError).toBe(false);
    expect(first.truncated).toBe(true);
    expect(first.nextCursor).toEqual(expect.stringMatching(/^doc:/));
    expect(first.chunkId).toBeTruthy();
    expect(first.content[0].text.startsWith('alpha beta')).toBe(true);
    expect(first.content[0].text).toContain(`cursor="${first.nextCursor}"`);
    expect(HttpClient.fetchWithRedirects).toHaveBeenCalledTimes(1);

    const second = await fetcher.txt({
      url: 'https://example.com/story.txt',
      cursor: first.nextCursor,
      maxChars: 1000,
      maxBytes: 1000
    });

    expect(second.isError).toBe(false);
    expect(second.truncated).toBe(false);
    expect(second.content[0].text.startsWith('gamma')).toBe(true);
    expect(second.content[0].text).toContain('theta');
    expect(HttpClient.fetchWithRedirects).toHaveBeenCalledTimes(1);
  });
});
