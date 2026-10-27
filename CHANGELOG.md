# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[中文更新说明](CHANGELOG.zh.md)

## [2.0.0] - 2026-10-27

### Breaking
- `startCursor` is no longer required. The first call returns the body in one response.
- Primary tool is `fetch` with `format`: `html` | `markdown` | `plaintext` | `json` | `txt` (default `markdown`). `fetch_html`, `fetch_json`, `fetch_txt`, `fetch_markdown`, and `fetch_plaintext` remain as thin aliases.
- Continuation is optional. A truncated response includes `nextCursor` and `chunkId`. Pass `cursor` to read the next slice. Do not send `startCursor` unless you are resuming a legacy byte chunk.
- Default budget is `maxChars=100000` and `maxBytes=1048576`. Cuts prefer a newline or space.
- `markdown` and `plaintext` extract readable content with Readability before conversion. Set `extractContent: false` to keep the whole document.
- Browser fallback is off unless `useBrowser` or `autoDetectMode` is true.

### Security
- SSRF checks from 1.3.x are unchanged: private, loopback, link-local, and cloud metadata targets are blocked before the request, including redirects.

## [1.3.4] - 2026-10-27

### Changed
- Republish the GitHub `v1.3.3` release as `1.3.4`. npm already has `@lmcc-dev/mult-fetch-mcp-server@1.3.3`, published on 2026-09-26. That tarball is an earlier build and cannot be overwritten.
- `1.3.4` contains the same SSRF hardening and fetch bugfixes that are on GitHub `main` and tag `v1.3.3` (PR #12). There is no additional behavior change in this version.

## [1.3.3] - 2026-10-27

### Security
- Block private, loopback, link-local, and cloud metadata targets before an outbound fetch, including redirect targets.
- Correct the CGNAT check (`100.64.0.0/10`), which previously never matched.
- Block documentation ranges, IPv6 multicast, site-local addresses, and private addresses embedded in 6to4, NAT64, and IPv4-mapped or IPv4-compatible IPv6.
- Stop node-fetch from following redirects itself (`redirect: 'manual'`) and resolve protocol-relative `//host` redirects before validating them.
- Pin direct HTTP(S) connections to the addresses that passed validation.
- Do not fall back to browser mode after a blocked URL. Browser mode now checks redirects and subresources and keeps Chrome private-network protection on unless `ALLOW_PRIVATE_NETWORK_REQUESTS=true`.

### Fixed
- Apply the configured proxy to browser mode, including proxy changes and proxy credentials.
- Honor `NO_PROXY` / `no_proxy` when selecting a system proxy.
- Keep caller headers when stored cookies are attached in browser mode.
- Close the browser page when a browser fetch fails.
- Convert the full HTML document to plain text or Markdown in browser mode before chunking.
- Honor a byte cursor that lands in the middle of a stored chunk.
- Truncate oversized content on UTF-8 byte boundaries.

### Changed
- Package version `1.3.3` was not published. This release includes the SSRF work already on `main` and the fixes above.

## [1.3.2] - 2025-03-21

### Fixed
- Resolve the package entry compilation issue in `tsconfig.json`.

### Added
- Intelligent main-content extraction.
- Clearer last-chunk detection for the demo client.

## [1.3.1] - 2025-03-19

### Fixed
- Add the missing `uuid` dependency required by chunk storage.

## [1.3.0] - 2025-03-19

### Added
- Byte-level content chunking and follow-up retrieval with `chunkId` and `startCursor`.
- HTML to plain text and Markdown conversion.
- Content size limits for large responses.

## [1.2.0] - 2025-03-15

### Added
- Internationalization (i18n) missing keys detection tool
  - Detects keys used in code but missing in translation files
  - Supports both English and Chinese translations
  - Generates detailed reports with missing keys information

- Internationalization (i18n) unused keys detection tool
  - Identifies unused i18n keys across the codebase
  - Supports dynamic key detection for complex usage patterns
  - Includes preservation mechanism for error-related keys
  - Provides report-only mode for safe analysis

- Error handling improvements
  - Added new ErrorHandler utility for consistent error management
  - Implemented comprehensive error testing

### Fixed
- Placeholder mismatch in English translation for `client.statusCodeDetected`
- Various minor bugs in the Node fetcher implementation

## [1.1.0] - 2025-03-01

### Added
- Initial public release 