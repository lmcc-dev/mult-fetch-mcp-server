/**
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: SSRF protection for outbound fetch requests.
 * 出站抓取的 SSRF 防护：拦截私网、环回、链路本地和云元数据地址。
 */

import { isIP } from 'net';
import { lookup } from 'dns/promises';

const ALLOWED_SCHEMES = new Set(['http:', 'https:']);

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata',
  'metadata.google.internal',
  'metadata.goog',
]);

/**
 * 已通过校验的目标地址 (Address that passed SSRF validation)
 */
export interface ValidatedAddress {
  address: string;
  family: 4 | 6;
}

export class UrlValidationError extends Error {
  public readonly code = 'EBLOCKEDURL';

  constructor(message: string) {
    super(message);
    this.name = 'UrlValidationError';
  }
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.');
  if (parts.length !== 4) {
    return -1;
  }

  let value = 0;
  for (const part of parts) {
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return -1;
    }
    value = (value << 8) + octet;
  }

  return value >>> 0;
}

/**
 * 判断 IPv4 是否属于不可公网访问的地址段
 * (Return true when an IPv4 address is not globally reachable)
 */
function isBlockedIPv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  if (value < 0) {
    return true;
  }

  const firstOctet = value >>> 24;
  const secondOctet = (value >>> 16) & 0xff;
  const thirdOctet = (value >>> 8) & 0xff;

  if (firstOctet === 0) return true; // 0.0.0.0/8
  if (firstOctet === 10) return true; // 10.0.0.0/8
  if (firstOctet === 127) return true; // 127.0.0.0/8
  if ((value & 0xffc00000) === 0x64400000) return true; // 100.64.0.0/10 CGNAT
  if (firstOctet === 169 && secondOctet === 254) return true; // 169.254.0.0/16
  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) return true; // 172.16.0.0/12
  if (firstOctet === 192 && secondOctet === 168) return true; // 192.168.0.0/16
  if (firstOctet === 192 && secondOctet === 0 && thirdOctet === 0) return true; // 192.0.0.0/24
  if (firstOctet === 192 && secondOctet === 0 && thirdOctet === 2) return true; // 192.0.2.0/24 TEST-NET-1
  if (firstOctet === 198 && secondOctet === 51 && thirdOctet === 100) return true; // 198.51.100.0/24 TEST-NET-2
  if (firstOctet === 203 && secondOctet === 0 && thirdOctet === 113) return true; // 203.0.113.0/24 TEST-NET-3
  if (firstOctet === 198 && (secondOctet === 18 || secondOctet === 19)) return true; // 198.18.0.0/15
  if (firstOctet >= 224) return true; // multicast and reserved ranges

  return false;
}

function expandIPv6(ip: string): number[] | null {
  const lower = ip.toLowerCase();
  const [head = '', tail = ''] = lower.split('::');
  const headParts = head ? head.split(':') : [];
  const tailParts = tail ? tail.split(':') : [];

  if (headParts.length + tailParts.length > 7) {
    return null;
  }

  const missing = 8 - headParts.length - tailParts.length;
  const parts = [
    ...headParts,
    ...Array.from({ length: missing }, () => '0'),
    ...tailParts,
  ];

  if (parts.length !== 8) {
    return null;
  }

  const groups: number[] = [];
  for (const part of parts) {
    if (!part) {
      return null;
    }
    const value = Number.parseInt(part, 16);
    if (!Number.isFinite(value) || value < 0 || value > 0xffff) {
      return null;
    }
    groups.push(value);
  }

  return groups;
}

function embeddedIPv4(high: number, low: number): string {
  const value = ((high << 16) | low) >>> 0;
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ].join('.');
}

/**
 * 判断 IPv6 是否应拦截，包括嵌入私网 IPv4 的隧道地址
 * (Return true when an IPv6 address, including tunneled embedded IPv4, must be blocked)
 */
function isBlockedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized === '::' || normalized === '::1') {
    return true;
  }

  const ipv4MappedMatch = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (ipv4MappedMatch) {
    return isBlockedIPv4(ipv4MappedMatch[1]);
  }

  const groups = expandIPv6(normalized);
  if (!groups) {
    return true;
  }

  // IPv4-mapped ::ffff:0:0/96 (IPv4 映射地址)
  if (
    groups[0] === 0 &&
    groups[1] === 0 &&
    groups[2] === 0 &&
    groups[3] === 0 &&
    groups[4] === 0 &&
    groups[5] === 0xffff
  ) {
    return isBlockedIPv4(embeddedIPv4(groups[6], groups[7]));
  }

  // Deprecated IPv4-compatible ::/96 (已废弃的 IPv4 兼容地址)
  if (groups.slice(0, 6).every((group) => group === 0)) {
    return isBlockedIPv4(embeddedIPv4(groups[6], groups[7]));
  }

  const first = groups[0];

  if ((first & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((first & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if (first === 0x2001 && groups[1] === 0xdb8) return true; // 2001:db8::/32 documentation

  // 6to4 2002::/16 embeds an IPv4 address in groups 1-2
  if (first === 0x2002) {
    return isBlockedIPv4(embeddedIPv4(groups[1], groups[2]));
  }

  // NAT64 well-known prefix 64:ff9b::/96
  if (
    first === 0x64 &&
    groups[1] === 0xff9b &&
    groups[2] === 0 &&
    groups[3] === 0 &&
    groups[4] === 0 &&
    groups[5] === 0
  ) {
    return isBlockedIPv4(embeddedIPv4(groups[6], groups[7]));
  }

  // NAT64 local-use prefix 64:ff9b:1::/48
  if (first === 0x64 && groups[1] === 0xff9b && groups[2] === 1) {
    return isBlockedIPv4(embeddedIPv4(groups[6], groups[7]));
  }

  return false;
}

function isBlockedIpAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    return isBlockedIPv4(ip);
  }
  if (version === 6) {
    return isBlockedIPv6(ip);
  }
  return true;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');
  if (BLOCKED_HOSTNAMES.has(normalized)) {
    return true;
  }

  return normalized.endsWith('.localhost');
}

function parseFetchUrl(urlString: string): URL {
  try {
    return new URL(urlString);
  } catch {
    throw new UrlValidationError(`Invalid URL: ${urlString}`);
  }
}

function validateScheme(url: URL): void {
  if (!ALLOWED_SCHEMES.has(url.protocol)) {
    throw new UrlValidationError(`Blocked URL scheme: ${url.protocol}`);
  }
}

function normalizeHostname(hostname: string): string {
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return hostname.slice(1, -1);
  }
  return hostname;
}

function validateHostnameOrIp(hostname: string): void {
  const normalizedHostname = normalizeHostname(hostname);
  const ipVersion = isIP(normalizedHostname);
  if (ipVersion) {
    if (isBlockedIpAddress(normalizedHostname)) {
      throw new UrlValidationError(`Blocked IP address: ${normalizedHostname}`);
    }
    return;
  }

  if (isBlockedHostname(normalizedHostname)) {
    throw new UrlValidationError(`Blocked hostname: ${normalizedHostname}`);
  }
}

async function validateResolvedAddresses(hostname: string): Promise<ValidatedAddress[]> {
  const normalizedHostname = normalizeHostname(hostname);
  const addresses = await lookup(normalizedHostname, { all: true, verbatim: true });

  if (addresses.length === 0) {
    throw new UrlValidationError(`Unable to resolve hostname: ${normalizedHostname}`);
  }

  const validated: ValidatedAddress[] = [];
  for (const address of addresses) {
    if (isBlockedIpAddress(address.address)) {
      throw new UrlValidationError(
        `Blocked IP address resolved for ${normalizedHostname}: ${address.address}`
      );
    }
    const family = address.family === 6 ? 6 : 4;
    validated.push({ address: address.address, family });
  }

  return validated;
}

/**
 * 浏览器内部地址不需要做网络 SSRF 校验
 * (Browser-internal URLs are not network requests)
 */
export function isBrowserInternalUrl(urlString: string): boolean {
  return /^(about:|data:|blob:|chrome-error:|chrome:)/i.test(urlString);
}

/**
 * Validate a URL before making an outbound fetch request.
 * Blocks private, loopback, link-local, and metadata targets.
 * 校验出站 URL，并返回可固定连接的公网地址。
 */
export async function validateFetchUrl(urlString: string): Promise<ValidatedAddress[]> {
  const url = parseFetchUrl(urlString);
  validateScheme(url);
  const hostname = normalizeHostname(url.hostname);
  validateHostnameOrIp(hostname);

  const ipVersion = isIP(hostname);
  if (ipVersion === 4 || ipVersion === 6) {
    return [{ address: hostname, family: ipVersion }];
  }

  return validateResolvedAddresses(hostname);
}
