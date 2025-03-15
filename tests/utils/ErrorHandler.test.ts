/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler, ErrorType } from '../../src/lib/utils/ErrorHandler.js';
import * as logger from '../../src/lib/logger.js';

// 模拟logger模块
vi.mock('../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    SERVER: 'MCP-SERVER',
    NODE_FETCH: 'NODE-FETCH',
    BROWSER_FETCH: 'BROWSER-FETCH',
    CLIENT: 'CLIENT'
  }
}));

describe('ErrorHandler 类测试 (ErrorHandler Class Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getErrorMessage 方法测试 (getErrorMessage Method Tests)', () => {
    it('应该正确处理 Error 对象 (Should correctly handle Error objects)', () => {
      const error = new Error('测试错误');
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('测试错误');
    });

    it('应该正确处理字符串错误 (Should correctly handle string errors)', () => {
      const error = '测试错误字符串';
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('测试错误字符串');
    });

    it('应该正确处理带有 message 属性的对象 (Should correctly handle objects with message property)', () => {
      const error = { message: '对象中的错误消息' };
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('对象中的错误消息');
    });

    it('应该正确处理普通对象 (Should correctly handle plain objects)', () => {
      const error = { code: 404, status: 'Not Found' };
      const message = ErrorHandler.getErrorMessage(error);
      expect(message).toBe('{"code":404,"status":"Not Found"}');
    });

    it('应该正确处理 null 和 undefined (Should correctly handle null and undefined)', () => {
      expect(ErrorHandler.getErrorMessage(null)).toBe('null');
      expect(ErrorHandler.getErrorMessage(undefined)).toBe('undefined');
    });
  });

  describe('classifyError 方法测试 (classifyError Method Tests)', () => {
    it('应该正确分类网络错误 (Should correctly classify network errors)', () => {
      const networkErrors = [
        'network error',
        'connection refused',
        'host unreachable',
        'ECONNREFUSED'
      ];

      networkErrors.forEach(error => {
        expect(ErrorHandler.classifyError(error)).toBe(ErrorType.NETWORK);
      });
    });

    it('应该正确分类访问被拒绝错误 (Should correctly classify access denied errors)', () => {
      const accessDeniedErrors = [
        '403 Forbidden',
        'access denied',
        'cloudflare protection',
        'captcha required',
        'security check'
      ];

      accessDeniedErrors.forEach(error => {
        expect(ErrorHandler.classifyError(error)).toBe(ErrorType.ACCESS_DENIED);
      });
    });

    it('应该正确分类超时错误 (Should correctly classify timeout errors)', () => {
      expect(ErrorHandler.classifyError('request timeout')).toBe(ErrorType.TIMEOUT);
    });

    it('应该正确分类解析错误 (Should correctly classify parse errors)', () => {
      const parseErrors = [
        'parse error',
        'JSON syntax error',
        'invalid syntax'
      ];

      parseErrors.forEach(error => {
        expect(ErrorHandler.classifyError(error)).toBe(ErrorType.PARSE);
      });
    });

    it('应该正确分类浏览器错误 (Should correctly classify browser errors)', () => {
      const browserErrors = [
        'browser crashed',
        'puppeteer error',
        'page load failed',
        'chrome not found'
      ];

      browserErrors.forEach(error => {
        expect(ErrorHandler.classifyError(error)).toBe(ErrorType.BROWSER);
      });
    });

    it('应该正确分类验证错误 (Should correctly classify validation errors)', () => {
      const validationErrors = [
        'invalid url',
        'schema validation failed',
        'type error'
      ];

      validationErrors.forEach(error => {
        expect(ErrorHandler.classifyError(error)).toBe(ErrorType.VALIDATION);
      });
    });

    it('应该将未知错误分类为 UNKNOWN (Should classify unknown errors as UNKNOWN)', () => {
      expect(ErrorHandler.classifyError('some random error')).toBe(ErrorType.UNKNOWN);
    });
  });

  describe('handleError 方法测试 (handleError Method Tests)', () => {
    it('应该调用 log 函数并返回错误消息 (Should call log function and return error message)', () => {
      const error = new Error('测试错误');
      const component = 'TEST-COMPONENT';
      const debug = true;
      const context = { url: 'https://example.com' };

      const result = ErrorHandler.handleError(error, component, debug, context);

      expect(logger.log).toHaveBeenCalledWith(
        'errors.unknown_error',
        debug,
        { error: '测试错误', ...context },
        component
      );
      expect(result).toBe('测试错误');
    });

    it('应该使用默认组件和调试值 (Should use default component and debug values)', () => {
      const error = new Error('测试错误');
      
      ErrorHandler.handleError(error);
      
      expect(logger.log).toHaveBeenCalledWith(
        'errors.unknown_error',
        false,
        { error: '测试错误' },
        logger.COMPONENTS.SERVER
      );
    });

    it('应该根据错误类型使用正确的日志键 (Should use correct log key based on error type)', () => {
      const networkError = 'network error occurred';
      
      ErrorHandler.handleError(networkError, logger.COMPONENTS.NODE_FETCH, true);
      
      expect(logger.log).toHaveBeenCalledWith(
        'errors.network_error',
        true,
        { error: 'network error occurred' },
        logger.COMPONENTS.NODE_FETCH
      );
    });
  });

  describe('createError 方法测试 (createError Method Tests)', () => {
    it('应该创建带有类型的错误对象 (Should create error object with type)', () => {
      const error = ErrorHandler.createError('自定义错误', ErrorType.NETWORK);
      
      expect(error instanceof Error).toBe(true);
      expect(error.message).toBe('自定义错误');
      expect(error.type).toBe(ErrorType.NETWORK);
    });

    it('应该使用默认错误类型 (Should use default error type)', () => {
      const error = ErrorHandler.createError('自定义错误');
      
      expect(error.type).toBe(ErrorType.UNKNOWN);
    });
  });
}); 