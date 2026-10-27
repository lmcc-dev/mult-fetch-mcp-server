/**
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant
 * Description: Tests for system proxy selection and NO_PROXY matching. / 系统代理选择与 NO_PROXY 匹配测试。
 */

import { afterEach, describe, expect, test, vi } from 'vitest';
import { getSystemProxy, isNoProxyMatch, splitProxyAuth } from '../../../src/lib/fetchers/common/utils.js';

vi.mock('../../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    NODE_FETCH: 'NODE-FETCH',
  },
}));

vi.mock('../../../src/lib/i18n/index.js', () => ({
  t: (key: string) => key,
}));

const PROXY_ENV_KEYS = [
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'http_proxy',
  'https_proxy',
  'ALL_PROXY',
  'all_proxy',
  'NO_PROXY',
  'no_proxy',
];

describe('proxy selection', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    for (const key of PROXY_ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  test('isNoProxyMatch matches exact hosts, subdomains, and wildcards', () => {
    expect(isNoProxyMatch('example.com', 'example.com,localhost')).toBe(true);
    expect(isNoProxyMatch('api.example.com', '.example.com')).toBe(true);
    expect(isNoProxyMatch('notexample.com', 'example.com')).toBe(false);
    expect(isNoProxyMatch('example.org', '*')).toBe(true);
  });

  test('getSystemProxy skips hosts listed in NO_PROXY', () => {
    process.env.HTTP_PROXY = 'http://proxy.example:8080';
    process.env.NO_PROXY = 'example.com,localhost';

    expect(getSystemProxy(true, false, 'TEST', 'https://example.com/a')).toBeUndefined();
    expect(getSystemProxy(true, false, 'TEST', 'https://api.example.com/a')).toBeUndefined();
    expect(getSystemProxy(true, false, 'TEST', 'https://other.test/a')).toBe('http://proxy.example:8080');
  });

  test('splitProxyAuth separates credentials from the server address', () => {
    expect(splitProxyAuth('http://user:p%40ss@proxy.example:8080')).toEqual({
      server: 'http://proxy.example:8080',
      username: 'user',
      password: 'p@ss',
    });
    expect(splitProxyAuth(undefined)).toEqual({});
  });
});
