/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { TOOLS_KEYS } from '../../keys/tools.js';

export default {
  // 工具描述 (Tool descriptions)  
  // 参数描述 (Parameter descriptions)  
  // 错误消息 (Error messages)  [TOOLS_KEYS.jsonParseWarning]: '警告: JSON解析错误: {{error}}',
  
  // 成功消息 (Success messages)  
  // 工具调用相关 (Tool call related)
  [TOOLS_KEYS.callReceived]: '收到工具调用: {{name}}，参数: {{args}}',
  [TOOLS_KEYS.unknownTool]: '未知工具: {{name}}',
  [TOOLS_KEYS.callError]: '调用工具 {{name}} 时出错: {{error}}',
  [TOOLS_KEYS.missingUrl]: '缺少URL参数',
  [TOOLS_KEYS.fetchRequest]: '正在从URL获取{{type}}: {{url}}',
  [TOOLS_KEYS.fetchError]: '从URL {{url}} 获取内容时出错: {{error}}'
}; 