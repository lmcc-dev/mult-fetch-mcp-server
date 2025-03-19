/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { URL_KEYS } from '../../keys/url.js';

// URL相关消息 (URL related messages)
export default {
  // 验证相关 (Validation related)
  [URL_KEYS.invalidUrl]: '无效的 URL: {{url}}',
  [URL_KEYS.missingScheme]: '缺少 URL 协议',
  [URL_KEYS.invalidScheme]: '无效的 URL 协议: {{scheme}}',
  [URL_KEYS.invalidHostname]: '无效的主机名: {{hostname}}',
  
  // 处理相关 (Processing related)
  [URL_KEYS.parsing]: '正在解析 URL: {{url}}',
  [URL_KEYS.constructing]: '正在从组件构建 URL',
  [URL_KEYS.normalizing]: '正在标准化 URL: {{url}}',
  [URL_KEYS.resolving]: '正在解析 URL: {{url}} 相对于基础: {{base}}',
  
  // 组件相关 (Component related)
  [URL_KEYS.scheme]: '协议: {{scheme}}',
  [URL_KEYS.username]: '用户名: {{username}}',
  [URL_KEYS.password]: '密码: {{password}}',
  [URL_KEYS.hostname]: '主机名: {{hostname}}',
  [URL_KEYS.port]: '端口: {{port}}',
  [URL_KEYS.path]: '路径: {{path}}',
  [URL_KEYS.query]: '查询参数: {{query}}',
  [URL_KEYS.fragment]: '片段: {{fragment}}',
  
  // 相对URL相关 (Relative URL related)
  [URL_KEYS.baseUrl]: '基础 URL: {{url}}',
  [URL_KEYS.relativeUrl]: '相对 URL: {{url}}',
  [URL_KEYS.absoluteUrl]: '绝对 URL: {{url}}',
  
  // 转换相关 (Conversion related)
  [URL_KEYS.toString]: '正在将 URL 转换为字符串',
  [URL_KEYS.toJSON]: '正在将 URL 转换为 JSON',
  
  // 错误相关 (Error related)
  [URL_KEYS.parseError]: '解析 URL 错误: {{error}}',
  [URL_KEYS.constructError]: '构建 URL 错误: {{error}}',
  [URL_KEYS.normalizeError]: '标准化 URL 错误: {{error}}',
  [URL_KEYS.resolveError]: '解析 URL 错误: {{error}}'
}; 