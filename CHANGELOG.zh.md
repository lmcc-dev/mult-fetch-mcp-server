# 更新日志

本文件记录项目的重要变更。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

英文说明见 [CHANGELOG.md](CHANGELOG.md)。

## [2.0.0] - 2026-10-27

### 破坏性变更
- `startCursor` 不再是必填。第一次调用默认一次返回正文。
- 主工具改为 `fetch`，用 `format` 选择 `html` | `markdown` | `plaintext` | `json` | `txt`（默认 `markdown`）。`fetch_html`、`fetch_json`、`fetch_txt`、`fetch_markdown`、`fetch_plaintext` 保留为薄别名。
- 只有响应被截断时才需要续传。截断结果带 `nextCursor` 和 `chunkId`。下一次把 `cursor` 设为 `nextCursor`。除非在恢复旧的字节分块，否则不要传 `startCursor`。
- 默认预算是 `maxChars=100000`、`maxBytes=1048576`。截断尽量落在换行或空格上。
- `markdown` 和 `plaintext` 会先用 Readability 抽取正文再转换。需要整页时传 `extractContent: false`。
- 除非显式设置 `useBrowser` 或 `autoDetectMode`，否则不会自动改走浏览器。

### 安全
- 1.3.x 的 SSRF 校验保持不变：私网、环回、链路本地和云元数据地址会在请求前拦截，重定向目标同样校验。

## [1.3.4] - 2026-10-27

### 变更
- 将 GitHub 上的 `v1.3.3` 发布内容重新发为 `1.3.4`。npm 上已经有 `@lmcc-dev/mult-fetch-mcp-server@1.3.3`，发布于 2026-09-26。那个包是更早的构建，不能覆盖。
- `1.3.4` 的内容与 GitHub `main` 和标签 `v1.3.3`（PR #12）上的 SSRF 加固与抓取修复相同。这个版本没有额外的行为变化。

## [1.3.3] - 2026-10-27

### 安全
- 在出站抓取前拦截私网、环回、链路本地和云元数据地址，重定向目标同样校验。
- 修正原先永远不会命中的运营商级 NAT 网段 `100.64.0.0/10`。
- 拦截文档地址、IPv6 组播、站点本地地址，以及嵌在 6to4、NAT64、IPv4 映射或 IPv4 兼容地址里的私网 IPv4。
- node-fetch 改为 `redirect: 'manual'`，由本服务自己跟随重定向；协议相对地址 `//host` 会先解析再校验。
- 直连 HTTP(S) 时，套接字固定到已通过校验的地址。
- URL 被拦截后不再自动改走浏览器。浏览器模式会检查重定向和子资源；除非设置 `ALLOW_PRIVATE_NETWORK_REQUESTS=true`，否则不再关闭 Chrome 的私网请求保护。

### 修复
- 浏览器模式会实际使用配置的代理，代理变更时重启浏览器，并支持代理认证。
- 选择系统代理时遵守 `NO_PROXY` / `no_proxy`。
- 浏览器模式附带已保存 Cookie 时，不再覆盖调用方传入的请求头。
- 浏览器抓取失败时关闭页面。
- 浏览器模式先转换完整 HTML，再做纯文本或 Markdown 分块。
- 字节游标落在分块中间时，从该偏移继续返回。
- 超长内容按 UTF-8 字节边界截断。

### 变更
- `1.3.3` 此前没有发布。本版本包含已经在 `main` 上的 SSRF 防护，以及上面的修复。

## [1.3.2] - 2025-03-21

### 修复
- 修复 `tsconfig.json` 中入口文件的编译问题。

### 新增
- 正文智能提取。
- 演示客户端对最后一块内容的判断更明确。

## [1.3.1] - 2025-03-19

### 修复
- 补上分块存储所需的 `uuid` 依赖。

## [1.3.0] - 2025-03-19

### 新增
- 按字节分块，并用 `chunkId` 与 `startCursor` 继续获取。
- HTML 转纯文本和 Markdown。
- 大响应的内容大小限制。

## [1.2.0] - 2025-03-15

### 新增
- 国际化缺失键和未使用键检查工具。
- 统一的 `ErrorHandler`。

### 修复
- 英文文案 `client.statusCodeDetected` 的占位符不匹配。
- Node 抓取实现中的若干小问题。

## [1.1.0] - 2025-03-01

### 新增
- 首次公开发布。
