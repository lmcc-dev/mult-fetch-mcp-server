/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { registerPrompts } from "../../src/lib/server/prompts.js";
import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// 模拟i18n模块
jest.mock('../../src/lib/i18n/index.js', () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      'prompts.fetchWebsite.description': '获取网站内容',
      'prompts.url.description': '网站URL',
      'prompts.format.description': '返回格式',
      'prompts.useBrowser.description': '是否使用浏览器',
      'prompts.selector.description': '选择器',
      'prompts.dataType.description': '数据类型',
      'prompts.error.description': '错误信息',
      'prompts.notFound': '提示未找到',
      'prompts.missingRequiredArg': '缺少必需参数',
      'prompts.fetchWebsite.result': '获取网站结果',
      'prompts.fetchWebsite.message': '我需要获取网站内容',
      'prompts.fetchWebsite.response': '我可以帮你获取网站内容',
      'prompts.fetchWebsite.instruction': '请获取以下网站',
      'prompts.fetchWebsite.formatInstruction': '返回格式',
      'prompts.fetchWebsite.browserInstruction': '使用浏览器',
      'prompts.yes': '是',
      'prompts.no': '否',
      'prompts.extractContent.description': '提取网站内容',
      'prompts.extractContent.result': '提取内容结果',
      'prompts.extractContent.message': '请提取以下网站内容',
      'prompts.extractContent.selectorInstruction': '使用选择器',
      'prompts.extractContent.dataTypeInstruction': '数据类型',
      'prompts.debugFetch.description': '调试获取网站内容',
      'prompts.debugFetch.result': '调试结果',
      'prompts.debugFetch.message': '调试获取网站内容',
      'prompts.debugFetch.errorDetails': '错误详情',
      'prompts.debugFetch.instruction': '请提供调试建议',
      'prompts.generic.result': '通用结果',
      'prompts.generic.message': '提示',
      'prompts.generic.args': '参数'
    };
    return translations[key] || key;
  }
}));

// 模拟logger模块
jest.mock('../../src/lib/logger.js', () => ({
  log: jest.fn(),
  COMPONENTS: {
    PROMPTS: 'prompts'
  }
}));

describe('prompts模块测试', () => {
  let server: Server;
  let listPromptsHandler: any;
  let getPromptHandler: any;

  beforeEach(() => {
    // 创建模拟Server实例
    server = {
      setRequestHandler: jest.fn((schema, handler) => {
        if (schema === ListPromptsRequestSchema) {
          listPromptsHandler = handler;
        } else if (schema === GetPromptRequestSchema) {
          getPromptHandler = handler;
        }
      })
    } as unknown as Server;

    // 注册提示处理程序
    registerPrompts(server);
  });

  describe('registerPrompts', () => {
    it('应该注册ListPromptsRequestSchema和GetPromptRequestSchema处理程序', () => {
      expect(server.setRequestHandler).toHaveBeenCalledTimes(2);
      expect(server.setRequestHandler).toHaveBeenCalledWith(ListPromptsRequestSchema, expect.any(Function));
      expect(server.setRequestHandler).toHaveBeenCalledWith(GetPromptRequestSchema, expect.any(Function));
    });
  });

  describe('ListPromptsRequestSchema处理程序', () => {
    it('应该返回所有可用的提示', async () => {
      const request = { params: {} };
      const response = await listPromptsHandler(request);

      expect(response).toHaveProperty('prompts');
      expect(Array.isArray(response.prompts)).toBe(true);
      expect(response.prompts.length).toBe(3);
      
      // 验证返回的提示
      const promptNames = response.prompts.map((p: any) => p.name);
      expect(promptNames).toContain('mult-fetch-mcp:prompt:fetch-website');
      expect(promptNames).toContain('mult-fetch-mcp:prompt:extract-content');
      expect(promptNames).toContain('mult-fetch-mcp:prompt:debug-fetch');
    });

    it('应该处理debug参数', async () => {
      const request = { params: { debug: true } };
      await listPromptsHandler(request);
      
      // 验证日志调用
      expect(require('../../src/lib/logger.js').log).toHaveBeenCalledWith(
        'prompts.list.request',
        true,
        { params: { debug: true } },
        'prompts'
      );
    });
  });

  describe('GetPromptRequestSchema处理程序', () => {
    it('应该处理fetch-website提示', async () => {
      const request = {
        params: {
          name: 'mult-fetch-mcp:prompt:fetch-website',
          arguments: {
            url: 'https://example.com',
            format: 'html',
            useBrowser: false
          }
        }
      };
      
      const response = await getPromptHandler(request);
      
      expect(response).toHaveProperty('description');
      expect(response).toHaveProperty('messages');
      expect(Array.isArray(response.messages)).toBe(true);
      expect(response.messages.length).toBe(3);
      
      // 验证消息内容
      const userMessage = response.messages[2];
      expect(userMessage.role).toBe('user');
      expect(userMessage.content.type).toBe('text');
      expect(userMessage.content.text).toContain('https://example.com');
      expect(userMessage.content.text).toContain('html');
      expect(userMessage.content.text).toContain('否');
    });

    it('应该处理extract-content提示', async () => {
      const request = {
        params: {
          name: 'mult-fetch-mcp:prompt:extract-content',
          arguments: {
            url: 'https://example.com',
            selector: 'main',
            dataType: 'text'
          }
        }
      };
      
      const response = await getPromptHandler(request);
      
      expect(response).toHaveProperty('description');
      expect(response).toHaveProperty('messages');
      expect(Array.isArray(response.messages)).toBe(true);
      expect(response.messages.length).toBe(1);
      
      // 验证消息内容
      const userMessage = response.messages[0];
      expect(userMessage.role).toBe('user');
      expect(userMessage.content.type).toBe('text');
      expect(userMessage.content.text).toContain('https://example.com');
      expect(userMessage.content.text).toContain('main');
      expect(userMessage.content.text).toContain('text');
    });

    it('应该处理debug-fetch提示', async () => {
      const request = {
        params: {
          name: 'mult-fetch-mcp:prompt:debug-fetch',
          arguments: {
            url: 'https://example.com',
            error: '404 Not Found'
          }
        }
      };
      
      const response = await getPromptHandler(request);
      
      expect(response).toHaveProperty('description');
      expect(response).toHaveProperty('messages');
      expect(Array.isArray(response.messages)).toBe(true);
      expect(response.messages.length).toBe(1);
      
      // 验证消息内容
      const userMessage = response.messages[0];
      expect(userMessage.role).toBe('user');
      expect(userMessage.content.type).toBe('text');
      expect(userMessage.content.text).toContain('https://example.com');
      expect(userMessage.content.text).toContain('404 Not Found');
    });

    it('应该处理未知提示', async () => {
      const request = {
        params: {
          name: 'unknown-prompt',
          arguments: {}
        }
      };
      
      await expect(getPromptHandler(request)).rejects.toThrow('提示未找到');
    });

    it('应该检查必需参数', async () => {
      const request = {
        params: {
          name: 'mult-fetch-mcp:prompt:fetch-website',
          arguments: {
            // 缺少必需的url参数
            format: 'html'
          }
        }
      };
      
      await expect(getPromptHandler(request)).rejects.toThrow('缺少必需参数');
    });

    it('应该处理不同类型的useBrowser参数', async () => {
      // 测试字符串类型的useBrowser
      const request1 = {
        params: {
          name: 'mult-fetch-mcp:prompt:fetch-website',
          arguments: {
            url: 'https://example.com',
            useBrowser: 'true'
          }
        }
      };
      
      const response1 = await getPromptHandler(request1);
      expect(response1.messages[2].content.text).toContain('是');
      
      // 测试数字类型的useBrowser
      const request2 = {
        params: {
          name: 'mult-fetch-mcp:prompt:fetch-website',
          arguments: {
            url: 'https://example.com',
            useBrowser: 1
          }
        }
      };
      
      const response2 = await getPromptHandler(request2);
      expect(response2.messages[2].content.text).toContain('是');
      
      // 测试零值
      const request3 = {
        params: {
          name: 'mult-fetch-mcp:prompt:fetch-website',
          arguments: {
            url: 'https://example.com',
            useBrowser: 0
          }
        }
      };
      
      const response3 = await getPromptHandler(request3);
      expect(response3.messages[2].content.text).toContain('否');
    });

    it('应该使用默认格式', async () => {
      const request = {
        params: {
          name: 'mult-fetch-mcp:prompt:fetch-website',
          arguments: {
            url: 'https://example.com'
            // 未指定format，应使用默认值html
          }
        }
      };
      
      const response = await getPromptHandler(request);
      expect(response.messages[2].content.text).toContain('html');
    });
  });
}); 