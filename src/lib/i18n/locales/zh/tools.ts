/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 工具相关消息 (Tool related messages)
export const tools = {
  fetchHtml: {
    description: "获取网站并以 HTML 格式返回内容",
    error: "获取 HTML 失败: {{error}}"
  },
  fetchJson: {
    description: "从 URL 获取 JSON 文件",
    error: "获取 JSON 失败: {{error}}",
    invalidJson: "URL 返回的 JSON 无效: {{url}}"
  },
  fetchTxt: {
    description: "获取网站，以纯文本格式返回内容（无 HTML）",
    error: "获取文本失败: {{error}}"
  },
  fetchMarkdown: {
    description: "获取网站并以 Markdown 格式返回内容",
    error: "获取 Markdown 失败: {{error}}"
  }
}; 