/**
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: Tests for HttpClient SSRF protections.
 */

import { describe, expect, test, vi, beforeEach } from 'vitest';
import fetch from 'node-fetch';
import tls from 'tls';
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
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual(expect.objectContaining({ redirect: 'manual' }));
  });

  test('blocks protocol-relative redirects to loopback', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 302,
      statusText: 'Found',
      headers: {
        has: (name: string) => name.toLowerCase() === 'location',
        get: () => '//127.0.0.1/secret',
      },
      text: async () => '',
    } as any);

    await expect(
      HttpClient.fetchWithRedirects({
        url: 'https://example.com/start',
        useSystemProxy: false,
        noDelay: true,
      })
    ).rejects.toThrow(/Blocked IP address/);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('follows protocol-relative redirects to the redirected host', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        status: 302,
        statusText: 'Found',
        headers: {
          has: (name: string) => name.toLowerCase() === 'location',
          get: () => '//cdn.example/app',
        },
        text: async () => '',
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: { has: () => false, get: () => null },
        text: async () => 'ok',
      } as any);

    await HttpClient.fetchWithRedirects({
      url: 'https://example.com/start',
      useSystemProxy: false,
      noDelay: true,
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe('https://cdn.example/app');
  });

  test('pins direct https connections to the validated address', async () => {
    const connect = vi.spyOn(tls, 'connect').mockImplementation((() => ({ on: vi.fn() })) as unknown as typeof tls.connect);

    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: { has: () => false, get: () => null },
      text: async () => 'ok',
    } as any);

    await HttpClient.fetchWithRedirects({
      url: 'https://example.com/path',
      useSystemProxy: false,
      noDelay: true,
    });

    const options = vi.mocked(fetch).mock.calls[0][1] as unknown as {
      agent?: { createConnection: (opts: object, callback?: () => void) => void };
      redirect?: string;
    };
    expect(options.redirect).toBe('manual');
    options.agent?.createConnection({ host: 'example.com', port: 443 }, () => undefined);

    expect(connect).toHaveBeenCalled();
    expect(connect.mock.calls[0][0]).toEqual(expect.objectContaining({
      host: '93.184.216.34',
      servername: 'example.com',
    }));

    connect.mockRestore();
  });
});
