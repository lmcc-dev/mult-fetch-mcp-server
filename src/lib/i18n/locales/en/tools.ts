/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { TOOLS_KEYS } from '../../keys/tools.js';

export default {
  // 工具描述 (Tool descriptions)  
  // 参数描述 (Parameter descriptions)  
  // 错误消息 (Error messages)  [TOOLS_KEYS.jsonParseWarning]: 'Warning: JSON parse error: {{error}}',
  
  // 成功消息 (Success messages)  
  // 工具调用相关 (Tool call related)
  [TOOLS_KEYS.callReceived]: 'Received tool call: {{name}} with args: {{args}}',
  [TOOLS_KEYS.unknownTool]: 'Unknown tool: {{name}}',
  [TOOLS_KEYS.callError]: 'Error calling tool {{name}}: {{error}}',
  [TOOLS_KEYS.missingUrl]: 'Missing URL parameter',
  [TOOLS_KEYS.fetchRequest]: 'Fetching {{type}} from URL: {{url}}',
  [TOOLS_KEYS.fetchError]: 'Error fetching from URL {{url}}: {{error}}'
}; 