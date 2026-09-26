/**
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: Tests for HttpClient SSRF protections.
 */

import { describe, expect, test, vi, beforeEach } from 'vitest';
import fetch from 'node-fetch';
import { lookup } from 'dns/promises';
import { HttpClient } from '../../../src/lib/fetchers/node/HttpClient.js';
import { UrlValidationError } from '../../../src/lib/utils/UrlValidator.js';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

vi.mock('dns/promises', () => ({
  lookup: vi.fn(),
}));

vi.mock('../../../src/lib/fetchers/common/utils.js', () => ({
  getRandomUserAgent: vi.fn(() => 'test-agent'),
  randomDelay: vi.fn(async () => undefined),
  getSystemProxy: vi.fn(() => undefined),
}));

describe('HttpClient SSRF protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(lookup).mockResolvedValue([{ address: '93.184.216.34', family: 4 }] as any);
  });

  test('blocks direct loopback requests before fetch is called', async () => {
    await expect(
      HttpClient.fetchWithRedirects({
        url: 'http://127.0.0.1:8080/latest/meta-data/',
        useSystemProxy: false,
      })
    ).rejects.toThrow(UrlValidationError);

    expect(fetch).not.toHaveBeenCalled();
  });

  test('blocks redirect targets that point to private addresses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 302,
      statusText: 'Found',
      headers: {
        has: (name: string) => name.toLowerCase() === 'location',
        get: () => 'http://127.0.0.1:8080/internal',
      },
      text: async () => '',
    } as any);

    await expect(
      HttpClient.fetchWithRedirects({
        url: 'https://example.com/redirect',
        useSystemProxy: false,
      })
    ).rejects.toThrow(/Blocked IP address/);

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
