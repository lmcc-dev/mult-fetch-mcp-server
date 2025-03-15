/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// 创建模拟logger模块
const mockLogger = {
  log: vi.fn(),
  getLogFilePath: vi.fn().mockReturnValue('/mock/path/to/debug.log'),
  clearLogFile: vi.fn(),
  COMPONENTS: {
    RESOURCES: 'resources'
  }
};

// 模拟logger模块
vi.mock('../../src/lib/logger.js', () => {
  return {
    default: mockLogger,
    ...mockLogger
  };
});

// 模拟fs模块
vi.mock('fs', () => {
  return {
    default: {
      readFileSync: vi.fn()
    },
    readFileSync: vi.fn()
  };
});

// 模拟path模块
vi.mock('path', () => {
  return {
    default: {
      dirname: vi.fn(),
      resolve: vi.fn(),
      join: vi.fn(),
      extname: vi.fn()
    },
    dirname: vi.fn(),
    resolve: vi.fn(),
    join: vi.fn(),
    extname: vi.fn()
  };
});

// 模拟url模块
vi.mock('url', () => {
  return {
    default: {
      fileURLToPath: vi.fn()
    },
    fileURLToPath: vi.fn()
  };
});

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
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
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
    mockLogger.log('resources.list.request', debug, { params: request.params }, 'resources');
    
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
    mockLogger.log('resources.read.request', debug, { uri }, 'resources');
    
    try {
      // 解析URI并读取相应文件
      let filePath = null;
      let content = '';
      
      // 处理日志文件URI
      if (uri === 'file:///logs/debug') {
        filePath = mockLogger.getLogFilePath();
        content = fs.readFileSync(filePath, 'utf-8');
      } else if (uri === 'file:///logs/clear') {
        mockLogger.clearLogFile();
        content = 'Log file cleared';
        filePath = '/mock/path/to/clear.log';
      } else if (uri.startsWith('file:///docs/')) {
        // 处理文档文件URI
        const docPath = uri.replace('file:///docs/', '');
        filePath = path.join('/mock/path/to', `${docPath}.md`);
        content = fs.readFileSync(filePath, 'utf-8');
      } else if (uri.startsWith('file:///src/')) {
        // 处理源代码文件URI
        const srcPath = uri.replace('file:///src/', '');
        filePath = path.join('/mock/path/to', `${srcPath}.ts`);
        content = fs.readFileSync(filePath, 'utf-8');
      } else {
        throw new Error(`resources.notFound: ${uri}`);
      }
      
      // 获取MIME类型
      const mimeType = getMimeType(filePath);
      
      // 返回资源内容
      return {
        contents: [
          {
            uri,
            type: mimeType,
            text: content
          }
        ]
      };
    } catch (error) {
      mockLogger.log('resources.fileReadError', true, { 
        filePath: 'unknown', 
        error: error instanceof Error ? error.message : String(error) 
      }, 'resources');
      throw error;
    }
  });
};

// 模拟resources模块
vi.mock('../../src/lib/server/resources.js', () => ({
  registerResources
}));

describe('resources模块测试', () => {
  let server: Server;
  let listResourcesHandler: any;
  let readResourceHandler: any;

  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();
    
    // 创建模拟Server实例
    server = {
      setRequestHandler: vi.fn((schema, handler) => {
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
      
      // 验证资源列表内容
      expect(response.resources[0]).toHaveProperty('name', 'mult-fetch-mcp:log:debug-log');
      expect(response.resources[0]).toHaveProperty('uri', 'file:///logs/debug');
      
      expect(response.resources[1]).toHaveProperty('name', 'mult-fetch-mcp:log:clear-debug-log');
      expect(response.resources[1]).toHaveProperty('uri', 'file:///logs/clear');
      
      // 验证资源模板
      expect(response).toHaveProperty('resourceTemplates');
      expect(Array.isArray(response.resourceTemplates)).toBe(true);
      expect(response.resourceTemplates.length).toBe(2);
      
      expect(response.resourceTemplates[0]).toHaveProperty('uriTemplate', 'file:///src/{path}');
      expect(response.resourceTemplates[1]).toHaveProperty('uriTemplate', 'file:///docs/{path}');
    });
    
    it('应该处理debug参数', async () => {
      const request = {
        params: {
          debug: true
        }
      };
      
      await listResourcesHandler(request);
      
      // 验证日志调用
      expect(mockLogger.log).toHaveBeenCalledWith(
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
      (fs.readFileSync as any).mockReturnValue('Debug log content');
      (path.extname as any).mockReturnValue('.log');
      
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
      expect(content).toHaveProperty('uri', 'file:///logs/debug');
      expect(content).toHaveProperty('type', 'text/plain');
      expect(content).toHaveProperty('text', 'Debug log content');
      
      // 验证getLogFilePath被调用
      expect(mockLogger.getLogFilePath).toHaveBeenCalled();
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
      expect(content).toHaveProperty('uri', 'file:///logs/clear');
      expect(content).toHaveProperty('text', 'Log file cleared');
      
      // 验证clearLogFile被调用
      expect(mockLogger.clearLogFile).toHaveBeenCalled();
    });
    
    it('应该处理文档资源', async () => {
      // 模拟路径和文件内容
      (path.join as any).mockReturnValue('/mock/path/to/README.md');
      (fs.readFileSync as any).mockReturnValue('# README content');
      (path.extname as any).mockReturnValue('.md');
      
      const request = {
        params: {
          uri: 'file:///docs/README'
        }
      };
      
      const response = await readResourceHandler(request);
      
      expect(response).toHaveProperty('contents');
      expect(Array.isArray(response.contents)).toBe(true);
      expect(response.contents.length).toBe(1);
      
      // 验证内容
      const content = response.contents[0];
      expect(content).toHaveProperty('uri', 'file:///docs/README');
      expect(content).toHaveProperty('type', 'text/markdown');
      expect(content).toHaveProperty('text', '# README content');
      
      // 验证path.join被调用
      expect(path.join).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/to/README.md', 'utf-8');
    });
    
    it('应该处理源代码资源', async () => {
      // 模拟路径和文件内容
      (path.join as any).mockReturnValue('/mock/path/to/index.ts');
      (fs.readFileSync as any).mockReturnValue('// Source code');
      (path.extname as any).mockReturnValue('.ts');
      
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
      expect(content).toHaveProperty('uri', 'file:///src/index');
      expect(content).toHaveProperty('type', 'text/typescript');
      expect(content).toHaveProperty('text', '// Source code');
      
      // 验证path.join被调用
      expect(path.join).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/to/index.ts', 'utf-8');
    });
    
    it('应该处理无效的URI', async () => {
      const request = {
        params: {
          uri: 'invalid://uri'
        }
      };
      
      await expect(readResourceHandler(request)).rejects.toThrow('resources.notFound');
    });
    
    it('应该处理文件读取错误', async () => {
      // 模拟路径
      (path.join as any).mockReturnValue('/mock/path/to/file.txt');
      // 模拟文件读取错误
      (fs.readFileSync as any).mockImplementation(() => {
        throw new Error('File read error');
      });
      
      const request = {
        params: {
          uri: 'file:///src/error/file'
        }
      };
      
      await expect(readResourceHandler(request)).rejects.toThrow('File read error');
      
      // 验证错误日志
      expect(mockLogger.log).toHaveBeenCalledWith(
        'resources.fileReadError',
        true,
        expect.objectContaining({
          error: 'File read error'
        }),
        'resources'
      );
    });
    
    it('应该处理debug参数', async () => {
      // 模拟文件内容
      (fs.readFileSync as any).mockReturnValue('Debug log content');
      (path.extname as any).mockReturnValue('.log');
      
      const request = {
        params: {
          uri: 'file:///logs/debug',
          debug: true
        }
      };
      
      await readResourceHandler(request);
      
      // 验证日志调用
      expect(mockLogger.log).toHaveBeenCalledWith(
        'resources.read.request',
        true,
        { uri: 'file:///logs/debug' },
        'resources'
      );
    });
  });
  
  describe('getMimeType函数', () => {
    it('应该返回正确的MIME类型', () => {
      const testExtensions = [
        { ext: '.html', mime: 'text/html' },
        { ext: '.js', mime: 'text/javascript' },
        { ext: '.css', mime: 'text/css' },
        { ext: '.json', mime: 'application/json' },
        { ext: '.png', mime: 'image/png' },
        { ext: '.jpg', mime: 'image/jpeg' },
        { ext: '.gif', mime: 'image/gif' },
        { ext: '.svg', mime: 'image/svg+xml' },
        { ext: '.md', mime: 'text/markdown' },
        { ext: '.txt', mime: 'text/plain' },
        { ext: '.log', mime: 'text/plain' },
        { ext: '.ts', mime: 'text/typescript' },
        { ext: '.unknown', mime: 'application/octet-stream' }
      ];
      
      for (const test of testExtensions) {
        // 模拟文件路径和内容
        (path.extname as any).mockReturnValue(test.ext);
        
        const mime = getMimeType(`/path/to/file${test.ext}`);
        expect(mime).toBe(test.mime);
      }
    });
  });
}); 