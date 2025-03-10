/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 工具相关消息 (Tool related messages)
export const tools = {
  fetchHtml: {
    description: "Fetch a website and return the content as HTML",
    error: "Error fetching HTML: {{error}}"
  },
  fetchJson: {
    description: "Fetch a JSON file from a URL",
    error: "Error fetching JSON: {{error}}",
    invalidJson: "Invalid JSON response from URL: {{url}}"
  },
  fetchTxt: {
    description: "Fetch a website, return the content as plain text (no HTML)",
    error: "Error fetching text: {{error}}"
  },
  fetchMarkdown: {
    description: "Fetch a website and return the content as Markdown",
    error: "Error fetching Markdown: {{error}}"
  }
}; 