/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * URL相关键 (URL related keys)
 */
export const URL_KEYS = (() => {
  const keyGen = createKeyGenerator('url');
  return {
    // 验证相关 (Validation related)
    invalidUrl: keyGen('invalidUrl'),
    missingScheme: keyGen('missingScheme'),
    invalidScheme: keyGen('invalidScheme'),
    invalidHostname: keyGen('invalidHostname'),
    
    // 处理相关 (Processing related)
    parsing: keyGen('parsing'),
    constructing: keyGen('constructing'),
    normalizing: keyGen('normalizing'),
    resolving: keyGen('resolving'),
    
    // 组件相关 (Component related)
    scheme: keyGen('scheme'),
    username: keyGen('username'),
    password: keyGen('password'),
    hostname: keyGen('hostname'),
    port: keyGen('port'),
    path: keyGen('path'),
    query: keyGen('query'),
    fragment: keyGen('fragment'),
    
    // 相对URL相关 (Relative URL related)
    baseUrl: keyGen('baseUrl'),
    relativeUrl: keyGen('relativeUrl'),
    absoluteUrl: keyGen('absoluteUrl'),
    
    // 转换相关 (Conversion related)
    toString: keyGen('toString'),
    toJSON: keyGen('toJSON'),
    
    // 错误相关 (Error related)
    parseError: keyGen('parseError'),
    constructError: keyGen('constructError'),
    normalizeError: keyGen('normalizeError'),
    resolveError: keyGen('resolveError')
  } as const;
})(); 