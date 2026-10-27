# mult-fetch-mcp-server

[![npm 版本](https://img.shields.io/npm/v/@lmcc-dev/mult-fetch-mcp-server.svg)](https://www.npmjs.com/package/@lmcc-dev/mult-fetch-mcp-server)
[![许可证: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 版本](https://img.shields.io/node/v/@lmcc-dev/mult-fetch-mcp-server)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.7.0-brightgreen.svg)](https://github.com/modelcontextprotocol/typescript-sdk)
[![GitHub Stars](https://img.shields.io/github/stars/lmcc-dev/mult-fetch-mcp-server)](https://github.com/lmcc-dev/mult-fetch-mcp-server/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/lmcc-dev/mult-fetch-mcp-server)](https://github.com/lmcc-dev/mult-fetch-mcp-server/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/lmcc-dev/mult-fetch-mcp-server)](https://github.com/lmcc-dev/mult-fetch-mcp-server/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/lmcc-dev/mult-fetch-mcp-server)](https://github.com/lmcc-dev/mult-fetch-mcp-server/pulls)
[![npm 下载量](https://img.shields.io/badge/下载量-即将更新-lightgrey)](https://www.npmjs.com/package/@lmcc-dev/mult-fetch-mcp-server)
[![GitHub 最后提交](https://img.shields.io/github/last-commit/lmcc-dev/mult-fetch-mcp-server)](https://github.com/lmcc-dev/mult-fetch-mcp-server/commits/main)
[![GitHub 贡献者](https://img.shields.io/github/contributors/lmcc-dev/mult-fetch-mcp-server)](https://github.com/lmcc-dev/mult-fetch-mcp-server/graphs/contributors)
[![codecov](https://codecov.io/gh/lmcc-dev/mult-fetch-mcp-server/branch/main/graph/badge.svg)](https://codecov.io/gh/lmcc-dev/mult-fetch-mcp-server)
[![CodeFactor](https://www.codefactor.io/repository/github/lmcc-dev/mult-fetch-mcp-server/badge)](https://www.codefactor.io/repository/github/lmcc-dev/mult-fetch-mcp-server)


<!-- 未来可考虑添加的徽章:
[![Maintainability](https://api.codeclimate.com/v1/badges/a99a88d28ad37a79dbf6/maintainability)](https://codeclimate.com/github/lmcc-dev/mult-fetch-mcp-server/maintainability)
-->

本项目实现了一个符合MCP规范的客户端和服务器，用于在AI助手和外部工具之间进行通信。

[English](./README.md) | [中文文档](./README.zh.md)

## 2.0 版本

调用 `fetch`，传入 URL。默认格式是 Markdown：走 HTTP 抓取，并抽取可读正文。不需要传 `startCursor`。

| `format` | 返回内容 |
| --- | --- |
| `markdown` | 可读正文的 Markdown（默认） |
| `plaintext` | 可读正文的纯文本 |
| `html` | HTML |
| `json` | JSON 文档 |
| `txt` | 原始响应体 |

普通页面一次返回。默认预算是 `maxChars` 100000、`maxBytes` 1048576，截断尽量落在换行或空格上。正文更长时，响应里会有 `nextCursor` 和 `chunkId`。再次调用 `fetch`，把 `cursor` 设为 `nextCursor`。

`fetch_html`、`fetch_json`、`fetch_txt`、`fetch_markdown`、`fetch_plaintext` 是固定格式的薄别名。

### Cursor

写入 `~/.cursor/mcp.json`，或项目里的 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "mult-fetch": {
      "command": "npx",
      "args": ["-y", "@lmcc-dev/mult-fetch-mcp-server"],
      "env": {
        "MCP_LANG": "zh"
      }
    }
  }
}
```

### Claude Desktop

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mult-fetch": {
      "command": "npx",
      "args": ["-y", "@lmcc-dev/mult-fetch-mcp-server"],
      "env": {
        "MCP_LANG": "zh"
      }
    }
  }
}
```

保存后重启宿主，让它抓取一个 URL。它应该调用 `fetch`，并且不传 `startCursor`。

### 浏览器模式

默认的 HTTP 抓取不需要 Chrome 或 Puppeteer。正常安装可以不装它们（`npm install --omit=optional` 会跳过可选包）。需要无头浏览器渲染时，安装可选包并设置 `useBrowser: true`：

```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

`autoDetectMode` 默认为 false。出现 403 时不会自动打开浏览器，除非显式打开这个开关。

### 安全

每次请求（包括重定向）在发出前都会检查：

- 环回地址（`127.0.0.0/8`、`::1`、`localhost`）
- 私网（`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`）
- 链路本地和云元数据（`169.254.0.0/16`，包括 `169.254.169.254`，以及 IPv6 `fe80::/10`）
- 运营商级 NAT `100.64.0.0/10`、文档地址，以及嵌在 6to4、NAT64 或 IPv4 映射地址里的私网地址

直连会固定到已通过校验的地址。默认超时 30 秒，单次响应受 `maxChars` 和 `maxBytes` 限制。浏览器模式使用同一套 URL 校验。只有确实需要浏览器访问私网时，才设置 `ALLOW_PRIVATE_NETWORK_REQUESTS=true`。

## 项目结构

```
fetch-mcp/
├── src/                         # 源代码目录
│   ├── lib/                     # 库文件
│   │   ├── fetchers/            # 网页获取实现
│   │   │   ├── browser/         # 基于浏览器的获取
│   │   │   │   ├── BrowserFetcher.ts      # 浏览器获取实现
│   │   │   │   ├── BrowserInstance.ts     # 浏览器实例管理
│   │   │   │   └── PageOperations.ts      # 页面交互操作
│   │   │   ├── node/            # 基于Node.js的获取
│   │   │   └── common/          # 共享获取工具
│   │   ├── utils/               # 工具模块
│   │   │   ├── ChunkManager.ts        # 内容分块功能
│   │   │   ├── ContentProcessor.ts    # HTML到文本转换
│   │   │   ├── ContentExtractor.ts    # 内容智能提取
│   │   │   ├── ContentSizeManager.ts  # 内容大小限制
│   │   │   └── ErrorHandler.ts        # 错误处理
│   │   ├── server/              # 服务器相关模块
│   │   │   ├── index.ts         # 服务器入口
│   │   │   ├── browser.ts       # 浏览器管理
│   │   │   ├── fetcher.ts       # 网页获取逻辑
│   │   │   ├── tools.ts         # 工具注册和处理
│   │   │   ├── resources.ts     # 资源处理
│   │   │   ├── prompts.ts       # 提示模板
│   │   │   └── types.ts         # 服务器类型定义
│   │   ├── i18n/                # 国际化支持
│   │   └── types.ts             # 通用类型定义
│   ├── client.ts                # MCP 客户端实现
│   └── mcp-server.ts            # MCP 服务器主入口
├── index.ts                     # 服务器入口点
├── tests/                       # 测试文件
└── dist/                        # 编译后的文件
```

## MCP规范

模型上下文协议（Model Context Protocol, MCP）定义了两种主要的传输方式：

1. **标准输入输出（Stdio）**：客户端将MCP服务器作为子进程启动，双方通过标准输入（stdin）和标准输出（stdout）进行通信。
2. **服务器发送事件（Server-Sent Events, SSE）**：用于在客户端和服务器之间传递消息。

本项目实现了基于标准输入输出（Stdio）的传输方式。

## 特性

- 基于官方 MCP SDK 的实现
- 支持标准输入输出（Stdio）传输方式
- 一个 `fetch` 工具，用 `format` 选择 HTML、JSON、文本、Markdown 或纯文本
- 默认走 HTTP 抓取，无头浏览器渲染是可选项
- 单次响应窗口（`maxChars` / `maxBytes`），正文被截断时用 `cursor` 续传
- 详细的调试日志输出到标准错误流
- 支持中英文双语国际化
- 模块化设计，便于维护和扩展
- **智能内容提取**：基于Mozilla Readability库，能够从网页中提取有意义的主要内容，过滤广告和导航元素
- **元数据支持**：能够提取网页元数据，如标题、作者、发布日期、站点信息等
- **智能内容分析**：自动检测页面是否包含有意义的内容，过滤登录页、错误页等无实质内容的页面
- **浏览器自动化增强**：支持页面滚动、Cookie管理、选择器等待等高级浏览器交互

## 安装

### 通过 Smithery 安装

要通过 [Smithery](https://smithery.ai/server/@lmcc-dev/mult-fetch-mcp-server) 自动为 Claude 桌面版安装 Mult Fetch MCP Server：

```bash
npx -y @smithery/cli install @lmcc-dev/mult-fetch-mcp-server --client claude
```

### 本地安装

```bash
pnpm install
```

### 全局安装

```bash
pnpm add -g @lmcc-dev/mult-fetch-mcp-server
```

或者直接使用 npx 运行（无需安装）：

```bash
npx @lmcc-dev/mult-fetch-mcp-server
```

## 与 Claude 集成

要将此工具与 Claude 桌面版集成，需要添加服务器配置：

### 配置文件位置

- **MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

### 配置示例

#### 方式一：使用 npx（推荐）

这种方式最简单，不需要指定完整路径，适合全局安装或直接使用 npx：

```json
{
  "mcpServers": {
    "mult-fetch-mcp-server": {
      "command": "npx",
      "args": ["-y", "@lmcc-dev/mult-fetch-mcp-server"],
      "env": {
        "MCP_LANG": "zh"  // 设置语言为中文，可选值: "zh" 或 "en"
      }
    }
  }
}
```

#### 方式二：指定完整路径

如果您需要使用特定位置的安装，可以指定完整路径：

```json
{
  "mcpServers": {
    "mult-fetch-mcp-server": {
      "command": "path-to/bin/node",
      "args": ["path-to/@lmcc-dev/mult-fetch-mcp-server/dist/index.js"],
      "env": {
        "MCP_LANG": "zh"  // 设置语言为中文，可选值: "zh" 或 "en"
      }
    }
  }
}
```

请将 `path-to/bin/node` 替换为您系统上 Node.js 可执行文件的路径，将 `path-to/@lmcc-dev/mult-fetch-mcp-server` 替换为此项目的实际路径。

### 使用示例

以下是在 Claude 桌面客户端中使用此工具的示例：

![Claude 桌面客户端示例](./images/example_zh.png)

图片展示了 Claude 如何使用 fetch 工具获取网页内容并根据您的指令进行处理。

### 使用方法

配置完成后，重启 Claude 桌面版，然后您可以在对话中使用以下工具：

- `fetch`: 抓取 URL。`format` 取 `html`、`markdown`（默认）、`plaintext`、`json` 或 `txt`
- `fetch_html`、`fetch_json`、`fetch_txt`、`fetch_markdown`、`fetch_plaintext`: 1.x 保留的别名

## 构建

```bash
pnpm run build
```

## 运行服务器

```bash
pnpm run server
# 或者
node dist/index.js
# 如果全局安装，可以直接运行
mult-fetch-mcp-server
# 或者使用 npx
npx mult-fetch-mcp-server
```

## 客户端演示工具

> **注意**：以下 client.js 功能仅供演示和测试使用。当与 Claude 或其他 AI 助手一起使用时，MCP 服务器由 AI 驱动，它会自动管理分块处理过程。

### 命令行客户端

本项目包含一个命令行客户端，用于测试和开发目的：

```bash
pnpm run client <method> <params_json>
# 例如
pnpm run client fetch_html '{"url": "https://example.com", "debug": true}'
```

### 演示客户端分块控制参数

在使用命令行客户端进行测试时，可以使用这些参数来演示内容分块功能：

- `--all-chunks`：命令行标志，用于自动按顺序获取所有块（仅用于演示目的）
- `--max-chunks`：命令行标志，用于限制要获取的最大块数（可选，默认为10）

#### 实时输出演示

client.js 演示工具提供实时输出功能：

```bash
node dist/src/client.js fetch_html '{"url":"https://example.com", "startCursor": 0, "contentSizeLimit": 500}' --all-chunks --debug
```

演示客户端将自动按顺序获取所有块并立即显示它们，展示大型内容如何能够实时处理。

## 运行测试

```bash
# 运行 MCP 功能测试
npm run test:mcp

# 运行 mini4k.com 网站测试
npm run test:mini4k

# 运行直接客户端调用测试
npm run test:direct
```

## 语言设置

本项目支持中英文双语国际化。您可以使用环境变量设置语言：

### 使用环境变量

设置 `MCP_LANG` 环境变量来控制语言：

```bash
# 设置为英文
export MCP_LANG=en
npm run server

# 设置为中文
export MCP_LANG=zh
npm run server

# Windows 系统
set MCP_LANG=zh
npm run server
```

使用环境变量的方式可以确保所有相关进程（包括 MCP 服务器）都使用相同的语言设置。

### 默认语言

默认情况下，系统会按照以下优先级选择语言：
1. `MCP_LANG` 环境变量
2. 操作系统语言（如果以 "zh" 开头，则使用中文）
3. 英文（作为最终回退选项）

## 调试

本项目遵循 MCP 协议的规范，默认情况下不会输出任何日志，以避免干扰 JSON-RPC 通信。调试信息通过调用参数控制：

### 使用 debug 参数

在调用工具时，设置 `debug: true` 参数：

```json
{
  "url": "https://example.com",
  "debug": true
}
```

调试消息会发送到标准错误流（stderr），使用以下格式：

```
[MCP-SERVER] MCP 服务器启动中...
[CLIENT] 正在获取URL: https://example.com
```

### 调试日志文件

当启用调试模式时，所有调试消息也会写入到位于以下位置的日志文件：

```
~/.mult-fetch-mcp-server/debug.log
```

可以通过 MCP 资源 API 访问此日志文件：

```typescript
// 访问调试日志文件
const result = await client.readResource({ uri: "file:///logs/debug" });
console.log(result.contents[0].text);

// 清除调试日志文件
const clearResult = await client.readResource({ uri: "file:///logs/clear" });
console.log(clearResult.contents[0].text);
```

日志文件包含来自所有组件（服务器、客户端、获取器）的带时间戳的条目，可用于排查问题。

## 代理设置

本工具支持多种配置代理设置的方法：

### 1. 使用 `proxy` 参数

最直接的方式是在请求参数中指定代理：

```json
{
  "url": "https://example.com",
  "proxy": "http://your-proxy-server:port",
  "debug": true
}
```

### 2. 使用环境变量

工具会自动检测并使用标准环境变量中的代理设置：

```bash
# 设置代理环境变量
export HTTP_PROXY=http://your-proxy-server:port
export HTTPS_PROXY=http://your-proxy-server:port

# 运行服务器
npm run server
```

### 3. 系统代理检测

工具会根据您的操作系统尝试检测系统代理设置：

- **Windows**：使用 `set` 命令从环境变量中读取代理设置
- **macOS/Linux**：使用 `env` 命令从环境变量中读取代理设置

### 4. 代理故障排除

如果您在代理检测方面遇到问题：

1. 使用 `debug: true` 参数查看有关代理检测的详细日志
2. 使用 `proxy` 参数明确指定代理
3. 确保您的代理 URL 格式正确：`http://host:port` 或 `https://host:port`
4. 对于需要浏览器功能的网站，设置 `useBrowser: true` 使用浏览器模式

### 5. 浏览器模式和代理

当使用浏览器模式（`useBrowser: true`）时，工具将：

1. 首先尝试使用明确指定的代理（如果提供）
2. 然后尝试使用系统代理设置
3. 最后，如果没有找到代理，则不使用代理继续

浏览器模式对于实现了反爬虫措施或需要 JavaScript 执行的网站特别有用。

## 参数处理

本项目采用以下方式处理参数：

- **debug**: 通过调用参数传递，每个请求可以单独控制是否启用调试输出
- **MCP_LANG**: 通过环境变量获取，控制整个服务器的语言设置

## 使用方法

### 创建客户端

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建客户端传输层
const transport = new StdioClientTransport({
  command: 'node',
  args: [path.resolve(__dirname, 'dist/index.js')],
  stderr: 'inherit',
  env: {
    ...process.env  // 传递所有环境变量，包括MCP_LANG
  }
});

// 创建客户端
const client = new Client({
  name: "example-client",
  version: "1.0.0"
});

// 连接到传输层
await client.connect(transport);

// 使用客户端
const result = await client.callTool({
  name: 'fetch_html',
  arguments: {
    url: 'https://example.com',
    debug: true  // 通过参数控制调试输出
  }
});

if (result.isError) {
  console.error('获取失败:', result.content[0].text);
} else {
  console.log('获取成功!');
  console.log('内容预览:', result.content[0].text.substring(0, 500));
}
```

### 支持的工具

- `fetch`: 抓取 URL。`format` 取 `html`、`markdown`（默认）、`plaintext`、`json` 或 `txt`
- `fetch_html`、`fetch_json`、`fetch_txt`、`fetch_markdown`、`fetch_plaintext`: 1.x 别名

### 资源支持

服务器包含对 resources/list 和 resources/read 方法的支持，但当前实现中没有定义任何资源。资源系统设计用于提供对项目文件和文档的访问，但此功能尚未完全实现。

#### 资源使用示例

```typescript
// 示例：列出可用资源
const resourcesResult = await client.listResources({});
console.log('可用资源:', resourcesResult);

// 注意：目前这将返回空的资源列表和资源模板列表
```

### 支持的提示模板

服务器提供以下提示模板：

- `fetch-website`: 获取网站内容，支持不同格式和浏览器模式
- `extract-content`: 从网站提取特定内容，支持CSS选择器和数据类型指定
- `debug-fetch`: 调试网站获取问题，分析可能的原因并提供解决方案

#### 提示模板使用方法

1. 使用 `prompts/list` 获取可用提示模板列表
2. 使用 `prompts/get` 获取特定提示模板内容

```typescript
// 示例：列出可用提示模板
const promptsResult = await client.listPrompts({});
console.log('可用提示模板:', promptsResult);

// 示例：获取网站内容提示
const fetchPrompt = await client.getPrompt({
  name: "fetch-website",
  arguments: {
    url: "https://example.com",
    format: "html",
    useBrowser: "false"
  }
});
console.log('获取网站提示:', fetchPrompt);

// 示例：调试网站获取问题
const debugPrompt = await client.getPrompt({
  name: "debug-fetch",
  arguments: {
    url: "https://example.com",
    error: "连接超时"
  }
});
console.log('调试获取提示:', debugPrompt);
```

### 参数选项

每个工具支持以下参数：

#### 基本参数
- `url`: 要获取的URL（必需）
- `headers`: 自定义请求头（可选，默认为{}）
- `proxy`: 代理服务器URL，格式为http://host:port或https://host:port（可选）

#### 网络控制参数
- `timeout`: 超时时间（毫秒）（可选，默认为30000）
- `maxRedirects`: 最大重定向次数（可选，默认为10）
- `noDelay`: 是否禁用请求间的随机延迟（可选，默认为false）
- `useSystemProxy`: 是否使用系统代理（可选，默认为true）

#### 内容窗口
- `maxChars`: 本次响应的最大字符数（可选，默认 100000）。截断尽量落在换行或空格上。
- `maxBytes`: 本次响应的最大 UTF-8 字节数（可选，默认 1048576）。
- `cursor`: 来自 `nextCursor` 的续传令牌。第一次调用不要传。设置后服务器不会重新请求 URL。
- `enableContentSplitting`: 设为 false 时，超长内容只截断、不返回游标（可选，默认 true）。
- `contentSizeLimit`: 旧版字节分块大小。在未设置 `maxChars` / `maxBytes` 时沿用 1.x 字节分割。
- `startCursor`: 旧版字节偏移。不是必填。只在配合 1.x 的 `chunkId` 时使用。

#### 分块管理
- `chunkId`: 响应被截断时和 `nextCursor` 一起返回的文档 ID。

把 `cursor` 传回 `fetch` 即可读取下一段。这个流程不使用 `startCursor`。

#### 模式控制参数
- `useBrowser`: 是否使用浏览器模式（可选，默认为false）
- `useNodeFetch`: 是否强制使用Node.js模式（可选，默认为false，与`useBrowser`互斥）
- `autoDetectMode`: 在 403 或验证页时改用浏览器重试（可选，默认 false）。需要已安装可选的 Puppeteer 包。

#### 浏览器模式特有参数
- `waitForSelector`: 浏览器模式下等待的选择器（可选，默认为'body'）
- `waitForTimeout`: 浏览器模式下等待的超时时间（毫秒）（可选，默认为5000）
- `scrollToBottom`: 浏览器模式下是否滚动到页面底部（可选，默认为false）
- `saveCookies`: 浏览器模式下是否保存cookies（可选，默认为true）
- `closeBrowser`: 是否关闭浏览器实例（可选，默认为false）

#### 内容提取参数
- `extractContent`: 转换前使用 Readability（可选）。`markdown` 和 `plaintext` 默认为 true，`html`、`json`、`txt` 默认为 false。
- `includeMetadata`: 是否在提取的内容中包含元数据（可选，默认为false，仅当`extractContent`为true时有效）
- `fallbackToOriginal`: 当提取失败时是否回退到原始内容（可选，默认为true，仅当`extractContent`为true时有效）

#### 调试参数
- `debug`: 是否启用调试输出（可选，默认为false）

### 内容提取特性

使用内容提取功能可以获取网页的核心内容，过滤掉导航栏、广告、侧边栏等干扰元素：

```json
{
  "url": "https://example.com/article",
  "extractContent": true,
  "includeMetadata": true
}
```

提取的内容将包括以下元数据（如果可用）：
- 标题 (title)
- 作者 (byline)
- 站点名称 (siteName)
- 摘要 (excerpt)
- 内容长度 (length)
- 可读性标志 (isReaderable)

### 特殊用法

#### 不获取内容直接关闭浏览器
要关闭浏览器实例而不执行任何获取操作：
```json
{
  "url": "about:blank",
  "closeBrowser": true
}
```

#### 代理优先级
代理的确定顺序如下：
1. 命令行指定的代理
2. 请求中的`proxy`参数
3. 环境变量中的代理（如果`useSystemProxy`为true）
4. Git配置中的代理（如果`useSystemProxy`为true）

如果设置了`proxy`参数，`useSystemProxy`将自动设置为false。

### 调试输出

当设置`debug: true`时，日志将输出到stderr，带有以下前缀：
- `[MCP-SERVER]`: MCP服务器的日志
- `[NODE-FETCH]`: Node.js获取器的日志
- `[BROWSER-FETCH]`: 浏览器获取器的日志
- `[CLIENT]`: 客户端的日志
- `[TOOLS]`: 工具实现的日志
- `[FETCHER]`: 主获取器接口的日志
- `[CONTENT]`: 内容处理相关的日志
- `[CONTENT-PROCESSOR]`: HTML内容处理器的日志
- `[CONTENT-SIZE]`: 内容大小管理相关的日志
- `[CHUNK-MANAGER]`: 内容分块操作相关的日志
- `[ERROR-HANDLER]`: 错误处理相关的日志
- `[BROWSER-MANAGER]`: 浏览器实例管理器的日志
- `[CONTENT-EXTRACTOR]`: 内容提取器的日志


## 许可证

MIT