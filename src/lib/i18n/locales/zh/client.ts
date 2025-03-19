/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { CLIENT_KEYS } from '../../keys/client.js';

// 客户端相关消息 (Client related messages)
export default {
  // 连接相关 (Connection related)
  [CLIENT_KEYS.connecting]: '正在连接 MCP 服务器...',
  [CLIENT_KEYS.connected]: '已连接到 MCP 服务器',
  [CLIENT_KEYS.connectionFailed]: '连接 MCP 服务器失败: {{error}}',
  [CLIENT_KEYS.disconnected]: '已断开与 MCP 服务器的连接',
  [CLIENT_KEYS.reconnecting]: '正在重新连接 MCP 服务器...',
  
  // 错误相关 (Error related)
  [CLIENT_KEYS.clientError]: '客户端错误: {{error}}',
  [CLIENT_KEYS.transportError]: '传输错误: {{error}}',
  [CLIENT_KEYS.requestError]: '请求错误: {{error}}',
  [CLIENT_KEYS.fetchError]: '获取错误: {{error}}',
  
  // 请求相关 (Request related)
  [CLIENT_KEYS.requestStarted]: '请求已开始: {{id}}',
  [CLIENT_KEYS.requestCompleted]: '请求已完成: {{id}}',
  [CLIENT_KEYS.requestCancelled]: '请求已取消: {{id}}',
  
  // 内容相关 (Content related)
  [CLIENT_KEYS.fetchingHtml]: '正在获取 HTML: {{url}}',
  [CLIENT_KEYS.fetchingJson]: '正在获取 JSON: {{url}}',
  [CLIENT_KEYS.fetchingText]: '正在获取文本: {{url}}',
  [CLIENT_KEYS.fetchingMarkdown]: '正在获取 Markdown: {{url}}',
  [CLIENT_KEYS.fetchSuccessful]: '获取成功',
  [CLIENT_KEYS.contentLength]: '内容长度: {{length}} 字节',
  
  // 分段内容相关 (Chunked content related)
  [CLIENT_KEYS.hasMoreChunks]: '内容已分段: {{current}}/{{total}} 段',
  [CLIENT_KEYS.nextChunkCommand]: '获取下一段内容，请运行: {{command}}',
  [CLIENT_KEYS.chunkInfoSaved]: '分段信息已保存到 {{file}}',
  [CLIENT_KEYS.chunkInfoSaveError]: '保存分段信息失败: {{error}}',
  [CLIENT_KEYS.chunkInfoLoaded]: '已从 {{file}} 加载分段信息',
  [CLIENT_KEYS.chunkInfoLoadError]: '加载分段信息失败: {{error}}',
  [CLIENT_KEYS.noChunkInfo]: '未找到之前的分段信息',
  [CLIENT_KEYS.fetchingNextChunk]: '正在获取下一段内容 ({{chunkIndex}}/{{total}})',
  [CLIENT_KEYS.chunkUsageInfo]: '对于分段内容: 使用 --all-chunks 一次性获取所有分段',
  [CLIENT_KEYS.invalidChunkIndex]: '无效的分段索引: {{index}}',
  [CLIENT_KEYS.missingMethodOrUrl]: '缺少方法或URL参数',
  [CLIENT_KEYS.fetchingAllChunks]: '正在获取所有分段内容，共 {{total}} 段',
  [CLIENT_KEYS.fetchingChunk]: '正在获取第 {{index}}/{{total}} 段内容',
  [CLIENT_KEYS.fetchChunkFailed]: '获取第 {{index}} 段内容失败: {{error}}',
  [CLIENT_KEYS.allChunksFetched]: '所有分段内容获取完成，共 {{total}} 段',
  [CLIENT_KEYS.allChunksCommand]: '一次性获取所有分段内容，请运行: {{command}}',
  [CLIENT_KEYS.allChunksUsageInfo]: '使用 --all-chunks 参数一次性获取所有分段内容',
  [CLIENT_KEYS.limitingChunks]: '限制获取分段数量为 {{limit}} (总计: {{total}})',
  [CLIENT_KEYS.maxChunksUsageInfo]: '使用 --max-chunks=N 参数限制获取的分段数量 (默认: {{default}})',
  
  // 新增的分段内容相关键 (New chunked content related keys)
  [CLIENT_KEYS.responseStructure]: '\n--- 响应结构 (Response structure) ---\n{{structure}}\n--- 响应结构结束 (End of response structure) ---\n',
  [CLIENT_KEYS.parsedByteChunkInfo]: '\n--- 解析后的字节级分段信息 (Parsed byte-level chunk information) ---\nchunkId: {{chunkId}}\nfetchedBytes: {{fetchedBytes}}\ntotalBytes: {{totalBytes}}\nremainingBytes: {{remainingBytes}}\nestimatedRemainingRequests: {{estimatedRemainingRequests}}\n--- 解析后的字节级分段信息结束 (End of parsed byte-level chunk information) ---\n',
  [CLIENT_KEYS.parsedChunkInfo]: '\n--- 解析后的分段信息 (Parsed chunk information) ---\nchunkId: {{chunkId}}\ncurrentChunk: {{currentChunk}}\ntotalChunks: {{totalChunks}}\nhasMoreChunks: {{hasMoreChunks}}\n--- 解析后的分段信息结束 (End of parsed chunk information) ---\n',
  [CLIENT_KEYS.chunkLimitNotice]: '\n注意：内容共有 {{total}} 段，但只获取前 {{fetching}} 段 (Note: Content has {{total}} chunks, but only fetching first {{fetching}} chunks)',
  [CLIENT_KEYS.chunkLimitHint]: '要获取更多分段，请使用 --max-chunks=N 参数 (To fetch more chunks, use --max-chunks=N parameter)\n',
  [CLIENT_KEYS.fetchingChunkProgress]: '\n正在获取第 {{current}}/{{total}} 段内容... (Fetching chunk {{current}}/{{total}}...)',
  [CLIENT_KEYS.fetchChunkFailedError]: '\n获取第 {{index}} 段内容失败: {{error}}\n',
  [CLIENT_KEYS.chunkContent]: '\n--- 第 {{index}} 段内容 (Chunk {{index}}) ---\n',
  [CLIENT_KEYS.chunkSeparator]: '\n' + '-'.repeat(80),
  [CLIENT_KEYS.partialChunksFetched]: '\n已获取 {{fetched}}/{{total}} 段内容 (Fetched {{fetched}}/{{total}} chunks)\n',
  [CLIENT_KEYS.completeChunksFetched]: '\n所有分段内容获取完成，共 {{total}} 段 (All chunks fetched, total: {{total}})\n',
  [CLIENT_KEYS.fetchingChunksErrorMessage]: '\n获取分块内容时出错: {{error}}\n',
  [CLIENT_KEYS.contentChunkedBytes]: '\n内容已分段: 已获取 {{fetched}} 字节，总共 {{total}} 字节 (Content is chunked: retrieved {{fetched}} bytes of total {{total}} bytes)',
  [CLIENT_KEYS.contentChunkedCount]: '\n内容已分段: {{current}}/{{total}} 段 (Content is chunked: {{current}}/{{total}} chunks)',
  [CLIENT_KEYS.fetchAllChunksHint]: '获取所有分段内容，请运行: (To fetch all chunks, run:)\n{{command}}\n',
  [CLIENT_KEYS.fetchLimitedChunksHint]: '获取前 {{limit}} 段内容，请运行: (To fetch first {{limit}} chunks, run:)\n{{command}}\n',
  [CLIENT_KEYS.firstChunkCompleted]: '\n第一段内容已完成 (First chunk completed): {{index}}/{{total}}\n',
  [CLIENT_KEYS.chunkProgress]: '\n第 {{current}}/{{total}} 段完成，已获取 {{fetchedBytes}}/{{totalBytes}} 字节 ({{percent}}%) (Chunk {{current}}/{{total}} completed, retrieved {{fetchedBytes}}/{{totalBytes}} bytes ({{percent}}%))\n',
  [CLIENT_KEYS.chunkCompleted]: '\n第 {{current}}/{{total}} 段完成 (Chunk {{current}}/{{total}} completed)\n',
  [CLIENT_KEYS.recalculatedTotalChunks]: '重新计算总块数: {{totalChunks}} (基于总字节数: {{totalBytes}}, 已获取字节数: {{fetchedBytes}}, 剩余字节数: {{remainingBytes}}, 内容大小限制: {{contentSizeLimit}})',
  [CLIENT_KEYS.fetchingChunksError]: '获取分块内容时发生错误: {{error}}',
  
  // 调试相关 (Debug related)
  [CLIENT_KEYS.debugMode]: '调试模式: {{enabled}}',
  [CLIENT_KEYS.debugInfo]: '调试信息: {{info}}',
  
  // 原有键 (Original keys)
  [CLIENT_KEYS.error]: '错误: {{error}}',
  [CLIENT_KEYS.callTool]: '调用工具: {{name}}',
  [CLIENT_KEYS.callToolSuccess]: '工具调用成功: {{name}}',
  [CLIENT_KEYS.callToolError]: '工具调用错误: {{name}} - {{error}}',
  [CLIENT_KEYS.statusCodeDetected]: '检测到状态码: {{code}}',
  [CLIENT_KEYS.usageInfo]: '使用信息: {{info}}',
  [CLIENT_KEYS.exampleUsage]: '使用示例: {{example}}',
  [CLIENT_KEYS.alternateUsageInfo]: '参数样式使用示例: {{example}}',
  [CLIENT_KEYS.invalidJson]: '无效的 JSON: {{error}}',
  [CLIENT_KEYS.usingCommandLineProxy]: '使用命令行代理: {{proxy}}',
  [CLIENT_KEYS.invalidProxyFormat]: '无效的代理格式: {{proxy}}',
  [CLIENT_KEYS.usingEnvProxy]: '使用环境代理: {{proxy}}',
  [CLIENT_KEYS.usingShellProxy]: '使用 Shell 代理: {{proxy}}',
  [CLIENT_KEYS.noShellProxy]: '未找到 Shell 代理',
  [CLIENT_KEYS.systemProxyDisabled]: '系统代理已禁用',
  [CLIENT_KEYS.usingSystemProxy]: '使用系统代理: {{proxy}}',
  [CLIENT_KEYS.noSystemProxy]: '未找到系统代理',
  [CLIENT_KEYS.requestFailed]: '请求失败: {{error}}',
  [CLIENT_KEYS.fatalError]: '致命错误: {{error}}',
  [CLIENT_KEYS.startingServer]: '正在启动服务器...',
  [CLIENT_KEYS.fetchingUrl]: '正在获取 URL: {{url}}',
  [CLIENT_KEYS.usingMode]: '使用 {{mode}} 模式',
  [CLIENT_KEYS.fetchFailed]: '获取失败: {{error}}',
  [CLIENT_KEYS.fetchSuccess]: '获取成功',
  [CLIENT_KEYS.browserModeNeeded]: '需要浏览器模式: {{url}}',
  [CLIENT_KEYS.retryingWithBrowser]: '使用浏览器模式重试',
  [CLIENT_KEYS.browserModeFetchFailed]: '浏览器模式获取失败: {{error}}',
  [CLIENT_KEYS.browserModeFetchSuccess]: '浏览器模式获取成功',
  [CLIENT_KEYS.serverClosed]: '服务器已关闭',
  [CLIENT_KEYS.proxySet]: '代理已设置: {{proxy}}',
  
  // 模式相关 (Mode related)
  [CLIENT_KEYS.usingStandardMode]: '使用标准模式',
  [CLIENT_KEYS.usingBrowserMode]: '使用浏览器模式',
  
  // 参数相关 (Parameters related)
  [CLIENT_KEYS.sendingParameters]: '正在发送参数到 MCP: {{params}}'
}; 