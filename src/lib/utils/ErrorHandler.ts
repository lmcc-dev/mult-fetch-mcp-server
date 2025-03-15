/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { isAccessDeniedError, isNetworkError } from './errorDetection.js';
import { log, COMPONENTS } from '../logger.js';
import { ERROR_KEYS } from '../i18n/keys/errors.js';

/**
 * 错误类型枚举
 * (Error type enumeration)
 */
export enum ErrorType {
  NETWORK = 'network',
  ACCESS_DENIED = 'access_denied',
  TIMEOUT = 'timeout',
  PARSE = 'parse',
  VALIDATION = 'validation',
  BROWSER = 'browser',
  UNKNOWN = 'unknown'
}

/**
 * 错误处理器类，用于统一处理和分类错误
 * (Error handler class for unified error handling and classification)
 */
export class ErrorHandler {
  /**
   * 处理错误并返回格式化的错误消息
   * (Handle error and return formatted error message)
   * 
   * @param error 捕获的错误对象 (Caught error object)
   * @param component 组件名称，用于日志 (Component name for logging)
   * @param debug 是否启用调试模式 (Whether debug mode is enabled)
   * @param context 错误上下文信息 (Error context information)
   * @returns 格式化的错误消息 (Formatted error message)
   */
  public static handleError(
    error: unknown, 
    component: string = COMPONENTS.SERVER, 
    debug: boolean = false,
    context: Record<string, any> = {}
  ): string {
    const errorType = this.classifyError(error);
    const errorMessage = this.getErrorMessage(error);
    
    // 记录错误日志
    // (Log error)
    log(
      `errors.${errorType}_error`, 
      debug, 
      { 
        error: errorMessage,
        ...context
      }, 
      component
    );
    
    return errorMessage;
  }
  
  /**
   * 分类错误类型
   * (Classify error type)
   * 
   * @param error 捕获的错误对象 (Caught error object)
   * @returns 错误类型 (Error type)
   */
  public static classifyError(error: unknown): ErrorType {
    const errorMessage = this.getErrorMessage(error);
    
    if (isNetworkError(errorMessage)) {
      return ErrorType.NETWORK;
    }
    
    if (isAccessDeniedError(errorMessage)) {
      return ErrorType.ACCESS_DENIED;
    }
    
    if (errorMessage.toLowerCase().includes('timeout')) {
      return ErrorType.TIMEOUT;
    }
    
    if (errorMessage.toLowerCase().includes('parse') || 
        errorMessage.toLowerCase().includes('json') ||
        errorMessage.toLowerCase().includes('syntax')) {
      return ErrorType.PARSE;
    }
    
    if (errorMessage.toLowerCase().includes('browser') ||
        errorMessage.toLowerCase().includes('puppeteer') ||
        errorMessage.toLowerCase().includes('page') ||
        errorMessage.toLowerCase().includes('chrome')) {
      return ErrorType.BROWSER;
    }
    
    if (errorMessage.toLowerCase().includes('valid') ||
        errorMessage.toLowerCase().includes('schema') ||
        errorMessage.toLowerCase().includes('type')) {
      return ErrorType.VALIDATION;
    }
    
    return ErrorType.UNKNOWN;
  }
  
  /**
   * 获取错误消息
   * (Get error message)
   * 
   * @param error 捕获的错误对象 (Caught error object)
   * @returns 错误消息字符串 (Error message string)
   */
  public static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      
      try {
        return JSON.stringify(error);
      } catch {
        return String(error);
      }
    }
    
    return String(error);
  }
  
  /**
   * 创建带有错误类型的错误对象
   * (Create error object with error type)
   * 
   * @param message 错误消息 (Error message)
   * @param type 错误类型 (Error type)
   * @returns 带有类型的错误对象 (Error object with type)
   */
  public static createError(message: string, type: ErrorType = ErrorType.UNKNOWN): Error & { type: ErrorType } {
    const error = new Error(message) as Error & { type: ErrorType };
    error.type = type;
    return error;
  }
} 