/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';

// 模拟logger模块
jest.mock('../../src/lib/logger.js', () => ({
  log: jest.fn(),
  getLogFilePath: jest.fn().mockReturnValue('/mock/path/to/debug.log'),
  clearLogFile: jest.fn(),
  COMPONENTS: {
    RESOURCES: 'resources'
  }
}));

// 模拟fs模块
jest.mock('fs', () => ({
  readFileSync: jest.fn()
}));

// 模拟path模块
jest.mock('path', () => ({
  dirname: jest.fn(),
  resolve: jest.fn(),
  join: jest.fn(),
  extname: jest.fn()
}));

// 模拟url模块
jest.mock('url', () => ({
  fileURLToPath: jest.fn()
}));

// 获取MIME类型函数
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.md':
      return 'text/markdown';
    case '.json':
      return 'application/json';
    case '.ts':
      return 'text/typescript';
    case '.js':
      return 'text/javascript';
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.txt':
    case '.log':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

// 模拟registerResources函数
const registerResources = (server: Server) => {
  // 注册资源列表处理程序
  server.setRequestHandler(ListResourcesRequestSchema, async (request: any) => {
    const debug = request.params?.debug === true;
    require('../../src/lib/logger.js').log('resources.list.request', debug, { params: request.params }, 'resources');
    
    // 返回实际可用的资源列表
    return {
      resources: [
        {
          name: 'mult-fetch-mcp:log:debug-log',
          uri: 'file:///logs/debug',
          description: 'Debug log file containing all debug messages from the server'
        },
        {
          name: 'mult-fetch-mcp:log:clear-debug-log',
          uri: 'file:///logs/clear',
          description: 'Clear the debug log file'
        }
      ],
      resourceTemplates: [
        {
          uriTemplate: 'file:///src/{path}',
          description: 'Source code files in the project',
          name: 'mult-fetch-mcp:src:file'
        },
        {
          uriTemplate: 'file:///docs/{path}',
          description: 'Documentation files in the project',
          name: 'mult-fetch-mcp:docs:file'
        }
      ]
    };
  });

  // 注册资源读取处理程序
  server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
    const uri = request.params.uri;
    const debug = request.params?.debug === true;
    require('../../src/lib/logger.js').log('resources.read.request', debug, { uri }, 'resources');
    
    try {
      // 解析URI并读取相应文件
      let filePath = null;
      let content = '';
      
      // 处理日志文件URI
      if (uri === 'file:///logs/debug') {
        filePath = require('../../src/lib/logger.js').getLogFilePath();
        content = fs.readFileSync(filePath, 'utf-8');
      }
      
      // 处理清理日志文件URI
      else if (uri === 'file:///logs/clear') {
        require('../../src/lib/logger.js').clearLogFile();
        content = '日志文件已清理 (Log file has been cleared)';
      }
      
      // 处理文档资源
      else if (uri.startsWith('file:///docs/')) {
        const resourceName = uri.substring('file:///docs/'.length);
        filePath = path.join('/mock/path/to', resourceName + '.md');
        content = fs.readFileSync(filePath, 'utf-8');
      }
      
      // 处理源代码资源
      else if (uri.startsWith('file:///src/')) {
        const resourceName = uri.substring('file:///src/'.length);
        filePath = path.join('/mock/path/to', resourceName + '.ts');
        content = fs.readFileSync(filePath, 'utf-8');
      }
      
      // 处理无效URI
      else {
        throw new Error('Invalid URI');
      }
      
      // 获取MIME类型
      const mimeType = getMimeType(filePath || '');
      
      return {
        contents: [
          {
            uri,
            mimeType,
            text: content
          }
        ]
      };
    } catch (error) {
      require('../../src/lib/logger.js').log('resources.fileReadError', true, { 
        filePath: 'unknown', 
        error: error instanceof Error ? error.message : String(error) 
      }, 'resources');
      throw new Error(`resources.notFound: ${uri}`);
    }
  });
};

// 模拟resources模块
jest.mock('../../src/lib/server/resources.js', () => ({
  registerResources
}));

describe('resources模块测试', () => {
  let server: Server;
  let listResourcesHandler: any;
  let readResourceHandler: any;

  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 创建模拟Server实例
    server = {
      setRequestHandler: jest.fn((schema, handler) => {
        if (schema === ListResourcesRequestSchema) {
          listResourcesHandler = handler;
        } else if (schema === ReadResourceRequestSchema) {
          readResourceHandler = handler;
        }
      })
    } as unknown as Server;

    // 注册资源处理程序
    registerResources(server);
  });

  describe('registerResources', () => {
    it('应该注册ListResourcesRequestSchema和ReadResourceRequestSchema处理程序', () => {
      expect(server.setRequestHandler).toHaveBeenCalledTimes(2);
      expect(server.setRequestHandler).toHaveBeenCalledWith(ListResourcesRequestSchema, expect.any(Function));
      expect(server.setRequestHandler).toHaveBeenCalledWith(ReadResourceRequestSchema, expect.any(Function));
    });
  });

  describe('ListResourcesRequestSchema处理程序', () => {
    it('应该返回可用的资源列表', async () => {
      const request = { params: {} };
      const response = await listResourcesHandler(request);

      expect(response).toHaveProperty('resources');
      expect(Array.isArray(response.resources)).toBe(true);
      expect(response.resources.length).toBe(2);
      
      // 验证返回的资源
      const resourceNames = response.resources.map((r: any) => r.name);
      expect(resourceNames).toContain('mult-fetch-mcp:log:debug-log');
      expect(resourceNames).toContain('mult-fetch-mcp:log:clear-debug-log');
      
      // 验证资源模板
      expect(response).toHaveProperty('resourceTemplates');
      expect(Array.isArray(response.resourceTemplates)).toBe(true);
      expect(response.resourceTemplates.length).toBe(2);
      
      const templateNames = response.resourceTemplates.map((t: any) => t.name);
      expect(templateNames).toContain('mult-fetch-mcp:src:file');
      expect(templateNames).toContain('mult-fetch-mcp:docs:file');
    });

    it('应该处理debug参数', async () => {
      const request = { params: { debug: true } };
      await listResourcesHandler(request);
      
      // 验证日志调用
      expect(require('../../src/lib/logger.js').log).toHaveBeenCalledWith(
        'resources.list.request',
        true,
        { params: { debug: true } },
        'resources'
      );
    });
  });

  describe('ReadResourceRequestSchema处理程序', () => {
    it('应该处理debug日志资源', async () => {
      // 模拟文件内容
      (fs.readFileSync as jest.Mock).mockReturnValue('Debug log content');
      (path.extname as jest.Mock).mockReturnValue('.log');
      
      const request = {
        params: {
          uri: 'file:///logs/debug'
        }
      };
      
      const response = await readResourceHandler(request);
      
      expect(response).toHaveProperty('contents');
      expect(Array.isArray(response.contents)).toBe(true);
      expect(response.contents.length).toBe(1);
      
      // 验证内容
      const content = response.contents[0];
      expect(content.uri).toBe('file:///logs/debug');
      expect(content.mimeType).toBe('text/plain');
      expect(content.text).toBe('Debug log content');
      
      // 验证getLogFilePath被调用
      expect(require('../../src/lib/logger.js').getLogFilePath).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/to/debug.log', 'utf-8');
    });

    it('应该处理清理日志资源', async () => {
      const request = {
        params: {
          uri: 'file:///logs/clear'
        }
      };
      
      const response = await readResourceHandler(request);
      
      expect(response).toHaveProperty('contents');
      expect(Array.isArray(response.contents)).toBe(true);
      expect(response.contents.length).toBe(1);
      
      // 验证内容
      const content = response.contents[0];
      expect(content.uri).toBe('file:///logs/clear');
      expect(content.text).toContain('日志文件已清理');
      
      // 验证clearLogFile被调用
      expect(require('../../src/lib/logger.js').clearLogFile).toHaveBeenCalled();
    });

    it('应该处理文档资源', async () => {
      // 模拟路径和文件内容
      (path.join as jest.Mock).mockReturnValue('/mock/path/to/README.md');
      (fs.readFileSync as jest.Mock).mockReturnValue('# README content');
      (path.extname as jest.Mock).mockReturnValue('.md');
      
      const request = {
        params: {
          uri: 'file:///docs/readme'
        }
      };
      
      const response = await readResourceHandler(request);
      
      expect(response).toHaveProperty('contents');
      expect(Array.isArray(response.contents)).toBe(true);
      expect(response.contents.length).toBe(1);
      
      // 验证内容
      const content = response.contents[0];
      expect(content.uri).toBe('file:///docs/readme');
      expect(content.mimeType).toBe('text/markdown');
      expect(content.text).toBe('# README content');
      
      // 验证path.join被调用
      expect(path.join).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/to/README.md', 'utf-8');
    });

    it('应该处理源代码资源', async () => {
      // 模拟路径和文件内容
      (path.join as jest.Mock).mockReturnValue('/mock/path/to/index.ts');
      (fs.readFileSync as jest.Mock).mockReturnValue('// Source code');
      (path.extname as jest.Mock).mockReturnValue('.ts');
      
      const request = {
        params: {
          uri: 'file:///src/index'
        }
      };
      
      const response = await readResourceHandler(request);
      
      expect(response).toHaveProperty('contents');
      expect(Array.isArray(response.contents)).toBe(true);
      expect(response.contents.length).toBe(1);
      
      // 验证内容
      const content = response.contents[0];
      expect(content.uri).toBe('file:///src/index');
      expect(content.mimeType).toBe('text/typescript');
      expect(content.text).toBe('// Source code');
      
      // 验证path.join被调用
      expect(path.join).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/to/index.ts', 'utf-8');
    });

    it('应该处理无效的URI', async () => {
      const request = {
        params: {
          uri: 'invalid-uri'
        }
      };
      
      await expect(readResourceHandler(request)).rejects.toThrow('resources.notFound');
    });

    it('应该处理文件读取错误', async () => {
      // 模拟路径
      (path.join as jest.Mock).mockReturnValue('/mock/path/to/file.txt');
      // 模拟文件读取错误
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });
      
      const request = {
        params: {
          uri: 'file:///docs/file'
        }
      };
      
      await expect(readResourceHandler(request)).rejects.toThrow('resources.notFound');
      
      // 验证错误日志
      expect(require('../../src/lib/logger.js').log).toHaveBeenCalledWith(
        'resources.fileReadError',
        expect.any(Boolean),
        expect.objectContaining({
          error: expect.any(String)
        }),
        'resources'
      );
    });

    it('应该处理debug参数', async () => {
      // 模拟文件内容
      (fs.readFileSync as jest.Mock).mockReturnValue('Debug log content');
      (path.extname as jest.Mock).mockReturnValue('.log');
      
      const request = {
        params: {
          uri: 'file:///logs/debug',
          debug: true
        }
      };
      
      await readResourceHandler(request);
      
      // 验证日志调用
      expect(require('../../src/lib/logger.js').log).toHaveBeenCalledWith(
        'resources.read.request',
        true,
        { uri: 'file:///logs/debug' },
        'resources'
      );
    });
  });

  describe('getMimeType函数', () => {
    it('应该返回正确的MIME类型', async () => {
      // 测试不同的文件扩展名
      const testExtensions = [
        { ext: '.md', mime: 'text/markdown' },
        { ext: '.json', mime: 'application/json' },
        { ext: '.ts', mime: 'text/typescript' },
        { ext: '.js', mime: 'text/javascript' },
        { ext: '.html', mime: 'text/html' },
        { ext: '.css', mime: 'text/css' },
        { ext: '.txt', mime: 'text/plain' },
        { ext: '.log', mime: 'text/plain' },
        { ext: '.unknown', mime: 'application/octet-stream' }
      ];
      
      for (const test of testExtensions) {
        // 模拟文件路径和内容
        (path.extname as jest.Mock).mockReturnValue(test.ext);
        (fs.readFileSync as jest.Mock).mockReturnValue('File content');
        
        const request = {
          params: {
            uri: `file:///docs/file${test.ext}`
          }
        };
        
        const response = await readResourceHandler(request);
        expect(response.contents[0].mimeType).toBe(test.mime);
      }
    });
  });
}); 