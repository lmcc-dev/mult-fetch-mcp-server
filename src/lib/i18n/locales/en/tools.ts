/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { TOOLS_KEYS } from '../../keys/tools.js';

export default {
  // 工具描述 (Tool descriptions)
  [TOOLS_KEYS.fetchHtmlDescription]: 'Fetch a website and return the content as HTML',
  [TOOLS_KEYS.fetchJsonDescription]: 'Fetch a JSON file from a URL',
  [TOOLS_KEYS.fetchTxtDescription]: 'Fetch a website, return the content as plain text (no HTML)',
  [TOOLS_KEYS.fetchMarkdownDescription]: 'Fetch a website and return the content as Markdown',
  
  // 参数描述 (Parameter descriptions)
  [TOOLS_KEYS.urlDescription]: 'URL of the website to fetch',
  
  // 错误消息 (Error messages)
  [TOOLS_KEYS.fetchHtmlError]: 'Error fetching HTML: {{error}}',
  [TOOLS_KEYS.fetchJsonError]: 'Error fetching JSON: {{error}}',
  [TOOLS_KEYS.fetchTxtError]: 'Error fetching text: {{error}}',
  [TOOLS_KEYS.fetchMarkdownError]: 'Error fetching Markdown: {{error}}',
  
  // 成功消息 (Success messages)
  [TOOLS_KEYS.fetchHtmlSuccess]: 'Successfully fetched HTML from {{url}}',
  [TOOLS_KEYS.fetchJsonSuccess]: 'Successfully fetched JSON from {{url}}',
  [TOOLS_KEYS.fetchTxtSuccess]: 'Successfully fetched text from {{url}}',
  [TOOLS_KEYS.fetchMarkdownSuccess]: 'Successfully fetched Markdown from {{url}}',
  
  // 工具调用相关 (Tool call related)
  [TOOLS_KEYS.callReceived]: 'Received tool call: {{name}} with args: {{args}}',
  [TOOLS_KEYS.unknownTool]: 'Unknown tool: {{name}}',
  [TOOLS_KEYS.callError]: 'Error calling tool {{name}}: {{error}}',
  [TOOLS_KEYS.missingUrl]: 'Missing URL parameter',
  [TOOLS_KEYS.fetchRequest]: 'Fetching {{type}} from URL: {{url}}',
  [TOOLS_KEYS.fetchError]: 'Error fetching from URL {{url}}: {{error}}'
}; 