/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { log, COMPONENTS } from '../logger.js';
import { isAccessDeniedError, isNetworkError } from './errorDetection.js';

// 扩展组件常量 (Extend component constants)
const EXTENDED_COMPONENTS = {
  ...COMPONENTS,
  UNKNOWN: 'UNKNOWN',
  BROWSER: 'BROWSER'
};

/**
 * 错误类型枚举 (Error type enumeration)
 */
export enum ErrorType {
  // 网络错误 (Network errors)
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  
  // HTTP 错误 (HTTP errors)
  HTTP_CLIENT_ERROR = 'HTTP_CLIENT_ERROR',
  HTTP_SERVER_ERROR = 'HTTP_SERVER_ERROR',
  
  // 访问控制错误 (Access control errors)
  ACCESS_DENIED = 'ACCESS_DENIED',
  CLOUDFLARE_PROTECTION = 'CLOUDFLARE_PROTECTION',
  CAPTCHA_REQUIRED = 'CAPTCHA_REQUIRED',
  
  // 解析错误 (Parsing errors)
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',
  HTML_PARSE_ERROR = 'HTML_PARSE_ERROR',
  
  // 浏览器错误 (Browser errors)
  BROWSER_LAUNCH_ERROR = 'BROWSER_LAUNCH_ERROR',
  BROWSER_NAVIGATION_ERROR = 'BROWSER_NAVIGATION_ERROR',
  BROWSER_CONTENT_ERROR = 'BROWSER_CONTENT_ERROR',
  
  // 资源错误 (Resource errors)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ACCESS_ERROR = 'RESOURCE_ACCESS_ERROR',
  
  // 工具错误 (Tool errors)
  TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',
  TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR',
  
  // 参数错误 (Parameter errors)
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  
  // 其他错误 (Other errors)
  UNKNOWN = 'UNKNOWN'
}

/**
 * 基础错误类 (Base error class)
 */
export class FetchError extends Error {
  type: ErrorType;
  statusCode?: number;
  originalError?: Error | unknown;
  details?: Record<string, any>;
  component: string;
  
  /**
   * 构造函数 (Constructor)
   * @param message 错误消息 (Error message)
   * @param type 错误类型 (Error type)
   * @param component 组件名称 (Component name)
   * @param details 错误详情 (Error details)
   */
  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    component: string = EXTENDED_COMPONENTS.UNKNOWN,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'FetchError';
    this.type = type;
    this.component = component;
    this.details = details;
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, FetchError.prototype);
  }
  
  /**
   * 记录错误日志 (Log error)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @param forceLog 是否强制记录日志 (Whether to force logging)
   */
  log(debug: boolean = false, forceLog: boolean = false): void {
    const logDetails = {
      type: this.type,
      message: this.message,
      ...(this.statusCode ? { statusCode: this.statusCode } : {}),
      ...(this.details || {})
    };
    
    log('error.occurred', debug || forceLog, logDetails, this.component);
  }
  
  /**
   * 转换为标准响应格式 (Convert to standard response format)
   * @returns 标准响应对象 (Standard response object)
   */
  toResponse(): { isError: true; content: Array<{ text: string }> } {
    return {
      isError: true,
      content: [
        {
          text: this.message
        }
      ]
    };
  }
}

/**
 * 网络错误类 (Network error class)
 */
export class NetworkError extends FetchError {
  constructor(
    message: string,
    component: string = EXTENDED_COMPONENTS.UNKNOWN,
    details?: Record<string, any>,
    originalError?: Error | unknown
  ) {
    super(message, ErrorType.NETWORK, component, details);
    this.name = 'NetworkError';
    this.originalError = originalError;
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * 超时错误类 (Timeout error class)
 */
export class TimeoutError extends NetworkError {
  constructor(
    message: string,
    component: string = EXTENDED_COMPONENTS.UNKNOWN,
    details?: Record<string, any>,
    originalError?: Error | unknown
  ) {
    super(message, component, details, originalError);
    this.name = 'TimeoutError';
    this.type = ErrorType.TIMEOUT;
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * HTTP 错误类 (HTTP error class)
 */
export class HttpError extends FetchError {
  constructor(
    message: string,
    statusCode: number,
    component: string = EXTENDED_COMPONENTS.UNKNOWN,
    details?: Record<string, any>,
    originalError?: Error | unknown
  ) {
    const type = statusCode >= 400 && statusCode < 500 
      ? ErrorType.HTTP_CLIENT_ERROR 
      : ErrorType.HTTP_SERVER_ERROR;
    
    super(message, type, component, details);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * 访问被拒绝错误类 (Access denied error class)
 */
export class AccessDeniedError extends HttpError {
  constructor(
    message: string,
    statusCode: number = 403,
    component: string = EXTENDED_COMPONENTS.UNKNOWN,
    details?: Record<string, any>,
    originalError?: Error | unknown
  ) {
    super(message, statusCode, component, details, originalError);
    this.name = 'AccessDeniedError';
    this.type = ErrorType.ACCESS_DENIED;
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, AccessDeniedError.prototype);
  }
}

/**
 * 解析错误类 (Parse error class)
 */
export class ParseError extends FetchError {
  constructor(
    message: string,
    type: ErrorType = ErrorType.JSON_PARSE_ERROR,
    component: string = EXTENDED_COMPONENTS.UNKNOWN,
    details?: Record<string, any>,
    originalError?: Error | unknown
  ) {
    super(message, type, component, details);
    this.name = 'ParseError';
    this.originalError = originalError;
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

/**
 * 浏览器错误类 (Browser error class)
 */
export class BrowserError extends FetchError {
  constructor(
    message: string,
    type: ErrorType = ErrorType.BROWSER_LAUNCH_ERROR,
    component: string = EXTENDED_COMPONENTS.BROWSER,
    details?: Record<string, any>,
    originalError?: Error | unknown
  ) {
    super(message, type, component, details);
    this.name = 'BrowserError';
    this.originalError = originalError;
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, BrowserError.prototype);
  }
}

/**
 * 工具错误类 (Tool error class)
 */
export class ToolError extends FetchError {
  constructor(
    message: string,
    type: ErrorType = ErrorType.TOOL_EXECUTION_ERROR,
    component: string = COMPONENTS.TOOLS,
    details?: Record<string, any>,
    originalError?: Error | unknown
  ) {
    super(message, type, component, details);
    this.name = 'ToolError';
    this.originalError = originalError;
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, ToolError.prototype);
  }
}

/**
 * 参数错误类 (Parameter error class)
 */
export class ParameterError extends FetchError {
  constructor(
    message: string,
    type: ErrorType = ErrorType.INVALID_PARAMETER,
    component: string = EXTENDED_COMPONENTS.UNKNOWN,
    details?: Record<string, any>
  ) {
    super(message, type, component, details);
    this.name = 'ParameterError';
    
    // 确保 instanceof 正常工作 (Ensure instanceof works correctly)
    Object.setPrototypeOf(this, ParameterError.prototype);
  }
}

/**
 * 创建错误对象 (Create error object)
 * @param error 原始错误 (Original error)
 * @param component 组件名称 (Component name)
 * @param details 错误详情 (Error details)
 * @returns 标准化的错误对象 (Standardized error object)
 */
export function createError(
  error: Error | string | unknown,
  component: string = EXTENDED_COMPONENTS.UNKNOWN,
  details?: Record<string, any>
): FetchError {
  // 如果已经是 FetchError 类型，直接返回
  if (error instanceof FetchError) {
    return error;
  }
  
  // 获取错误消息
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : 'Unknown error';
  
  // 检查错误类型并创建相应的错误对象
  const errorText = errorMessage.toLowerCase();
  
  // 检查是否为访问被拒绝错误
  if (isAccessDeniedError(errorText)) {
    return new AccessDeniedError(errorMessage, 403, component, details, error);
  }
  
  // 检查是否为网络错误
  if (isNetworkError(errorText)) {
    // 检查是否为超时错误
    if (errorText.includes('timeout')) {
      return new TimeoutError(errorMessage, component, details, error);
    }
    return new NetworkError(errorMessage, component, details, error);
  }
  
  // 检查是否为 HTTP 错误
  const statusCodeMatch = errorText.match(/(\d{3})/);
  if (statusCodeMatch) {
    const statusCode = parseInt(statusCodeMatch[1], 10);
    if (statusCode >= 400 && statusCode < 600) {
      return new HttpError(errorMessage, statusCode, component, details, error);
    }
  }
  
  // 检查是否为解析错误
  if (errorText.includes('json') && (errorText.includes('parse') || errorText.includes('invalid'))) {
    return new ParseError(errorMessage, ErrorType.JSON_PARSE_ERROR, component, details, error);
  }
  
  if (errorText.includes('html') && (errorText.includes('parse') || errorText.includes('invalid'))) {
    return new ParseError(errorMessage, ErrorType.HTML_PARSE_ERROR, component, details, error);
  }
  
  // 检查是否为浏览器错误
  if (errorText.includes('browser') || errorText.includes('puppeteer') || errorText.includes('chrome')) {
    if (errorText.includes('launch') || errorText.includes('start')) {
      return new BrowserError(errorMessage, ErrorType.BROWSER_LAUNCH_ERROR, component, details, error);
    }
    if (errorText.includes('navigate') || errorText.includes('goto')) {
      return new BrowserError(errorMessage, ErrorType.BROWSER_NAVIGATION_ERROR, component, details, error);
    }
    return new BrowserError(errorMessage, ErrorType.BROWSER_CONTENT_ERROR, component, details, error);
  }
  
  // 默认返回通用错误
  return new FetchError(errorMessage, ErrorType.UNKNOWN, component, details);
}

/**
 * 处理错误 (Handle error)
 * @param error 原始错误 (Original error)
 * @param component 组件名称 (Component name)
 * @param debug 是否启用调试模式 (Whether debug mode is enabled)
 * @param details 错误详情 (Error details)
 * @returns 标准化的错误响应 (Standardized error response)
 */
export function handleError(
  error: Error | string | unknown,
  component: string = EXTENDED_COMPONENTS.UNKNOWN,
  debug: boolean = false,
  details?: Record<string, any>
): { isError: true; content: Array<{ text: string }> } {
  // 创建标准化的错误对象
  const standardError = createError(error, component, details);
  
  // 记录错误日志
  standardError.log(debug, true);
  
  // 返回标准化的错误响应
  return standardError.toResponse();
}

// 导出错误检测函数
export { isAccessDeniedError, isNetworkError }; 