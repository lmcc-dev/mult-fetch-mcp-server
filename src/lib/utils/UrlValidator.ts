/**
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: SSRF protection for outbound fetch requests.
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

function isBlockedIPv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  if (value < 0) {
    return true;
  }

  const firstOctet = value >>> 24;
  const secondOctet = (value >>> 16) & 0xff;

  if (firstOctet === 0) return true; // 0.0.0.0/8
  if (firstOctet === 10) return true; // 10.0.0.0/8
  if (firstOctet === 127) return true; // 127.0.0.0/8
  if (firstOctet === 100 && (value & 0xc0000000) === 0x64400000) return true; // 100.64.0.0/10
  if (firstOctet === 169 && secondOctet === 254) return true; // 169.254.0.0/16
  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) return true; // 172.16.0.0/12
  if (firstOctet === 192 && secondOctet === 168) return true; // 192.168.0.0/16
  if (firstOctet === 192 && secondOctet === 0) return true; // 192.0.0.0/24
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

  if (
    groups[0] === 0 &&
    groups[1] === 0 &&
    groups[2] === 0 &&
    groups[3] === 0 &&
    groups[4] === 0 &&
    groups[5] === 0xffff
  ) {
    const mappedValue = (groups[6] << 16) | groups[7];
    const mappedIpv4 = [
      (mappedValue >>> 24) & 0xff,
      (mappedValue >>> 16) & 0xff,
      (mappedValue >>> 8) & 0xff,
      mappedValue & 0xff,
    ].join('.');
    return isBlockedIPv4(mappedIpv4);
  }

  const first = groups[0];

  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7
  if (first === 0x2001 && groups[1] === 0xdb8) return true; // documentation range 2001:db8::/32

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

async function validateResolvedAddresses(hostname: string): Promise<void> {
  const normalizedHostname = normalizeHostname(hostname);
  const addresses = await lookup(normalizedHostname, { all: true, verbatim: true });

  if (addresses.length === 0) {
    throw new UrlValidationError(`Unable to resolve hostname: ${normalizedHostname}`);
  }

  for (const address of addresses) {
    if (isBlockedIpAddress(address.address)) {
      throw new UrlValidationError(
        `Blocked IP address resolved for ${normalizedHostname}: ${address.address}`
      );
    }
  }
}

/**
 * Validate a URL before making an outbound fetch request.
 * Blocks private, loopback, link-local, and metadata targets.
 */
export async function validateFetchUrl(urlString: string): Promise<void> {
  const url = parseFetchUrl(urlString);
  validateScheme(url);
  validateHostnameOrIp(url.hostname);

  if (!isIP(normalizeHostname(url.hostname))) {
    await validateResolvedAddresses(url.hostname);
  }
}
