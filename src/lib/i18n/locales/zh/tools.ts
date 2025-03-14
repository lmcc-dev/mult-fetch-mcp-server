/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { TOOLS_KEYS } from '../../keys/tools.js';

export default {
  // 工具描述 (Tool descriptions)
  [TOOLS_KEYS.fetchHtmlDescription]: '获取网站并以HTML格式返回内容',
  [TOOLS_KEYS.fetchJsonDescription]: '从URL获取JSON文件',
  [TOOLS_KEYS.fetchTxtDescription]: '获取网站，以纯文本形式返回内容（无HTML）',
  [TOOLS_KEYS.fetchMarkdownDescription]: '获取网站并以Markdown格式返回内容',
  
  // 参数描述 (Parameter descriptions)
  [TOOLS_KEYS.urlDescription]: '要获取的网站URL',
  
  // 错误消息 (Error messages)
  [TOOLS_KEYS.fetchHtmlError]: '获取HTML失败: {{error}}',
  [TOOLS_KEYS.fetchJsonError]: '获取JSON失败: {{error}}',
  [TOOLS_KEYS.fetchTxtError]: '获取文本失败: {{error}}',
  [TOOLS_KEYS.fetchMarkdownError]: '获取Markdown失败: {{error}}',
  
  // 成功消息 (Success messages)
  [TOOLS_KEYS.fetchHtmlSuccess]: '成功从 {{url}} 获取HTML',
  [TOOLS_KEYS.fetchJsonSuccess]: '成功从 {{url}} 获取JSON',
  [TOOLS_KEYS.fetchTxtSuccess]: '成功从 {{url}} 获取文本',
  [TOOLS_KEYS.fetchMarkdownSuccess]: '成功从 {{url}} 获取Markdown',
  
  // 工具调用相关 (Tool call related)
  [TOOLS_KEYS.callReceived]: '收到工具调用: {{name}}，参数: {{args}}',
  [TOOLS_KEYS.unknownTool]: '未知工具: {{name}}',
  [TOOLS_KEYS.callError]: '调用工具 {{name}} 时出错: {{error}}',
  [TOOLS_KEYS.missingUrl]: '缺少URL参数',
  [TOOLS_KEYS.fetchRequest]: '正在从URL获取{{type}}: {{url}}',
  [TOOLS_KEYS.fetchError]: '从URL {{url}} 获取内容时出错: {{error}}'
}; 