/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant
 * Description: 确认 2.0 抓取仍然拦截私网和链路本地地址 / 2.0 fetch still blocks private and link-local targets
 */

import { describe, expect, test, vi } from 'vitest';
import fetch from 'node-fetch';
import { NodeFetcher } from '../../src/lib/fetchers/node/NodeFetcher.js';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

describe('fetch 2.0 SSRF guard', () => {
  test('blocks private and link-local targets before any request', async () => {
    const fetcher = new NodeFetcher();
    const targets = [
      'http://127.0.0.1/secret',
      'http://10.0.0.8/admin',
      'http://169.254.169.254/latest/meta-data/',
      'http://[fe80::1]/local'
    ];

    for (const url of targets) {
      const result = await fetcher.txt({
        url,
        useSystemProxy: false,
        maxChars: 200
      });
      expect(result.isError, url).toBe(true);
      expect(result.content[0].text, url).toMatch(/Blocked (IP address|hostname)/);
    }

    expect(fetch).not.toHaveBeenCalled();
  });
});
