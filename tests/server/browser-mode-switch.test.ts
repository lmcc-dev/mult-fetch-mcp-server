/**
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant
 * Description: Tests that SSRF blocks do not fall through to browser mode. / 确认 SSRF 拦截不会再降级到浏览器模式。
 */

import { describe, expect, test, vi } from 'vitest';

vi.mock('puppeteer', () => ({
  default: { launch: vi.fn() },
}));

vi.mock('puppeteer-extra', () => ({
  default: {
    use: vi.fn(),
    launch: vi.fn(),
  },
}));

vi.mock('puppeteer-extra-plugin-stealth', () => ({
  default: vi.fn(),
}));

import { shouldSwitchToBrowser } from '../../src/lib/server/browser.js';
import { isBlockedFetchError } from '../../src/lib/utils/errorDetection.js';

describe('browser mode fallback', () => {
  test('does not retry blocked fetch targets in the browser', () => {
    expect(isBlockedFetchError('Blocked IP address: 127.0.0.1')).toBe(true);
    expect(shouldSwitchToBrowser('Blocked IP address: 127.0.0.1')).toBe(false);
    expect(shouldSwitchToBrowser('Blocked hostname: localhost')).toBe(false);
    expect(shouldSwitchToBrowser('Blocked URL scheme: file:')).toBe(false);
  });

  test('still switches for forbidden and challenge pages', () => {
    expect(shouldSwitchToBrowser('HTTP Error 403: Forbidden')).toBe(true);
    expect(shouldSwitchToBrowser('Access blocked by Cloudflare')).toBe(true);
  });
});
