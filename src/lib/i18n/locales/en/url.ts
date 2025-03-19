/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { URL_KEYS } from '../../keys/url.js';

// URL相关消息 (URL related messages)
export default {
  // 验证相关 (Validation related)
  [URL_KEYS.invalidUrl]: 'Invalid URL: {{url}}',
  [URL_KEYS.missingScheme]: 'Missing URL scheme',
  [URL_KEYS.invalidScheme]: 'Invalid URL scheme: {{scheme}}',
  [URL_KEYS.invalidHostname]: 'Invalid hostname: {{hostname}}',
  
  // 处理相关 (Processing related)
  [URL_KEYS.parsing]: 'Parsing URL: {{url}}',
  [URL_KEYS.constructing]: 'Constructing URL from components',
  [URL_KEYS.normalizing]: 'Normalizing URL: {{url}}',
  [URL_KEYS.resolving]: 'Resolving URL: {{url}} against base: {{base}}',
  
  // 组件相关 (Component related)
  [URL_KEYS.scheme]: 'Scheme: {{scheme}}',
  [URL_KEYS.username]: 'Username: {{username}}',
  [URL_KEYS.password]: 'Password: {{password}}',
  [URL_KEYS.hostname]: 'Hostname: {{hostname}}',
  [URL_KEYS.port]: 'Port: {{port}}',
  [URL_KEYS.path]: 'Path: {{path}}',
  [URL_KEYS.query]: 'Query: {{query}}',
  [URL_KEYS.fragment]: 'Fragment: {{fragment}}',
  
  // 相对URL相关 (Relative URL related)
  [URL_KEYS.baseUrl]: 'Base URL: {{url}}',
  [URL_KEYS.relativeUrl]: 'Relative URL: {{url}}',
  [URL_KEYS.absoluteUrl]: 'Absolute URL: {{url}}',
  
  // 转换相关 (Conversion related)
  [URL_KEYS.toString]: 'Converting URL to string',
  [URL_KEYS.toJSON]: 'Converting URL to JSON',
  
  // 错误相关 (Error related)
  [URL_KEYS.parseError]: 'Error parsing URL: {{error}}',
  [URL_KEYS.constructError]: 'Error constructing URL: {{error}}',
  [URL_KEYS.normalizeError]: 'Error normalizing URL: {{error}}',
  [URL_KEYS.resolveError]: 'Error resolving URL: {{error}}'
}; 