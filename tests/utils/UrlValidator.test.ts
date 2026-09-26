/**
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: Tests for SSRF URL validation.
 */

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { lookup } from 'dns/promises';
import { validateFetchUrl, UrlValidationError } from '../../src/lib/utils/UrlValidator.js';

vi.mock('dns/promises', () => ({
  lookup: vi.fn(),
}));

describe('UrlValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(lookup).mockResolvedValue([{ address: '93.184.216.34', family: 4 }] as any);
  });

  test('allows public https URLs after DNS resolution', async () => {
    await expect(validateFetchUrl('https://example.com/path')).resolves.toBeUndefined();
    expect(lookup).toHaveBeenCalledWith('example.com', { all: true, verbatim: true });
  });

  test('allows public http URLs', async () => {
    await expect(validateFetchUrl('http://example.org')).resolves.toBeUndefined();
  });

  test('blocks non-http schemes', async () => {
    await expect(validateFetchUrl('file:///etc/passwd')).rejects.toThrow(UrlValidationError);
    await expect(validateFetchUrl('ftp://example.com')).rejects.toThrow(UrlValidationError);
  });

  test('blocks loopback IPv4 addresses', async () => {
    await expect(validateFetchUrl('http://127.0.0.1/')).rejects.toThrow(/Blocked IP address/);
    await expect(validateFetchUrl('http://127.0.0.1:8080/latest/meta-data/')).rejects.toThrow(
      UrlValidationError
    );
  });

  test('blocks cloud metadata IP addresses', async () => {
    await expect(validateFetchUrl('http://169.254.169.254/latest/meta-data/')).rejects.toThrow(
      /Blocked IP address/
    );
  });

  test('blocks private IPv4 ranges', async () => {
    await expect(validateFetchUrl('http://10.0.0.1/')).rejects.toThrow(UrlValidationError);
    await expect(validateFetchUrl('http://192.168.1.1/')).rejects.toThrow(UrlValidationError);
    await expect(validateFetchUrl('http://172.16.0.1/')).rejects.toThrow(UrlValidationError);
  });

  test('blocks localhost hostnames without DNS lookup', async () => {
    await expect(validateFetchUrl('http://localhost/')).rejects.toThrow(/Blocked hostname/);
    expect(lookup).not.toHaveBeenCalled();
  });

  test('blocks hostnames that resolve to private addresses', async () => {
    vi.mocked(lookup).mockResolvedValue([{ address: '127.0.0.1', family: 4 }] as any);

    await expect(validateFetchUrl('http://rebind.example/')).rejects.toThrow(
      /Blocked IP address resolved/
    );
  });

  test('blocks IPv6 loopback and link-local addresses', async () => {
    await expect(validateFetchUrl('http://[::1]/')).rejects.toThrow(UrlValidationError);
    await expect(validateFetchUrl('http://[fe80::1]/')).rejects.toThrow(UrlValidationError);
  });

  test('blocks IPv4-mapped loopback addresses', async () => {
    await expect(validateFetchUrl('http://[::ffff:127.0.0.1]/')).rejects.toThrow(UrlValidationError);
  });

  test('rejects invalid URLs', async () => {
    await expect(validateFetchUrl('not-a-url')).rejects.toThrow(/Invalid URL/);
  });
});
