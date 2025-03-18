/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

export default {
  // 客户端相关 (Client related)
  'client.startingServer': '正在启动服务器...',
  'client.usingEnvProxy': '使用环境代理: {proxy}',
  'client.usingSystemProxy': '使用系统代理: {proxy}',
  'client.noSystemProxy': '未找到系统代理',
  'client.systemProxyDisabled': '系统代理检测已禁用',
  'client.proxySet': '代理已设置: {proxy}',
  'client.fetchingUrl': '正在获取 URL: {url}',
  'client.usingBrowserMode': '使用浏览器模式',
  'client.usingStandardMode': '使用标准模式',
  'client.switchingToBrowserMode': '正在切换到浏览器模式',
  'client.fetchSuccessful': '获取成功',
  'client.fetchFailed': '获取失败: {error}',
  'client.fatalError': '致命错误: {error}',
  'client.serverClosed': '服务器已关闭',
  
  // 使用信息 (Usage information)
  'client.usageInfo': '用法: {info}',
  'client.exampleUsage': '示例: {example}',
  'client.chunkUsageInfo': '要获取特定分段，请使用 --chunk-id 和 --chunk-index 参数',
  'client.allChunksUsageInfo': '要获取所有分段，请使用 --all-chunks 参数',
  'client.invalidJson': '无效的 JSON: {error}',
  'client.usingCommandLineProxy': '使用命令行代理: {proxy}',
  'client.invalidProxyFormat': '无效的代理格式: {proxy}',
  
  // 分段内容相关 (Chunked content related)
  'client.chunkInfoSaved': '分段信息已保存到 {file}，当前: {current}，总计: {total}',
  'client.chunkInfoSaveError': '保存分段信息错误: {error}',
  'client.chunkInfoLoaded': '已从 {file} 加载分段信息，当前: {current}，总计: {total}',
  'client.chunkInfoLoadError': '加载分段信息错误: {error}',
  'client.fetchingAllChunks': '正在获取所有分段内容，共 {total} 段',
  'client.fetchingChunk': '正在获取第 {index}/{total} 段内容',
  'client.fetchChunkFailed': '获取第 {index} 段内容失败: {error}',
  'client.allChunksFetched': '所有分段内容获取完成，共 {total} 段',
  'client.hasMoreChunks': '内容已分段: {current}/{total} 段',
  'client.allChunksCommand': '一次性获取所有分段内容，请运行: {command}',
  
  // 参数相关 (Parameters related)
  'client.sendingParameters': '正在发送参数到 MCP: {params}',
  'client.limitingChunks': '限制获取分段数量为 {limit} (总计: {total})',
  'client.maxChunksUsageInfo': '使用 --max-chunks=N 参数限制获取的分段数量 (默认: {default})',
  
  // 错误相关 (Error related)
  'errors.forbidden': '访问被禁止 (HTTP 403)',
  'errors.cloudflareProtection': '检测到 Cloudflare 保护',
  'errors.captchaRequired': '需要验证码验证',
  'errors.timeout': '请求超时，超时时间: {timeout}',
  'errors.connectionProblem': '检测到连接问题'
}; 