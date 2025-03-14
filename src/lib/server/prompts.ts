/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { log, COMPONENTS } from '../logger.js';
import { t } from '../i18n/index.js';

// 定义提示模板 (Define prompt templates)
const PROMPTS = {
  "mult-fetch-mcp:prompt:fetch-website": {
    name: "mult-fetch-mcp:prompt:fetch-website",
    description: t('prompts.fetchWebsite.description'),
    arguments: [
      {
        name: "url",
        description: t('prompts.url.description'),
        required: true
      },
      {
        name: "format",
        description: t('prompts.format.description'),
        required: false
      },
      {
        name: "useBrowser",
        description: t('prompts.useBrowser.description'),
        required: false
      }
    ]
  },
  "mult-fetch-mcp:prompt:extract-content": {
    name: "mult-fetch-mcp:prompt:extract-content",
    description: t('prompts.extractContent.description'),
    arguments: [
      {
        name: "url",
        description: t('prompts.url.description'),
        required: true
      },
      {
        name: "selector",
        description: t('prompts.selector.description'),
        required: false
      },
      {
        name: "dataType",
        description: t('prompts.dataType.description'),
        required: false
      }
    ]
  },
  "mult-fetch-mcp:prompt:debug-fetch": {
    name: "mult-fetch-mcp:prompt:debug-fetch",
    description: t('prompts.debugFetch.description'),
    arguments: [
      {
        name: "url",
        description: t('prompts.url.description'),
        required: true
      },
      {
        name: "error",
        description: t('prompts.error.description'),
        required: true
      }
    ]
  }
};

/**
 * 注册提示相关处理程序到服务器 (Register prompt handlers to server)
 * @param server MCP服务器实例 (MCP server instance)
 */
export function registerPrompts(server: Server): void {
  // 注册提示列表处理程序
  server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
    const debug = request.params?.debug === true;
    log('prompts.list.request', debug, { params: request.params }, COMPONENTS.PROMPTS);
    
    return {
      prompts: Object.values(PROMPTS)
    };
  });

  // 注册获取提示处理程序
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const promptName = request.params.name;
    const args = request.params.arguments || {};
    const debug = typeof args.debug === 'boolean' ? args.debug : false;
    
    log('prompts.get.request', debug, { promptName, args }, COMPONENTS.PROMPTS);
    
    // 检查提示是否存在
    if (!PROMPTS[promptName]) {
      throw new Error(t('prompts.notFound') + `: ${promptName}`);
    }
    
    // 检查必需参数
    const prompt = PROMPTS[promptName];
    const requiredArgs = prompt.arguments?.filter(arg => arg.required) || [];
    
    for (const arg of requiredArgs) {
      if (args[arg.name] === undefined) {
        throw new Error(t('prompts.missingRequiredArg') + `: ${arg.name}`);
      }
    }
    
    // 根据提示名称和参数生成消息
    if (promptName === "mult-fetch-mcp:prompt:fetch-website") {
      const url = args.url;
      const format = args.format || "html";
      let useBrowser = false;
      
      if (args.useBrowser !== undefined) {
        if (typeof args.useBrowser === 'boolean') {
          useBrowser = args.useBrowser;
        } else if (typeof args.useBrowser === 'string') {
          const useBrowserStr = args.useBrowser.toLowerCase().trim();
          useBrowser = useBrowserStr === 'true' || useBrowserStr === 'yes' || useBrowserStr === '是' || useBrowserStr === '1';
        } else if (typeof args.useBrowser === 'number') {
          useBrowser = args.useBrowser !== 0;
        }
      }
      
      log('prompts.useBrowserValue', debug, { original: args.useBrowser, parsed: useBrowser }, COMPONENTS.PROMPTS);
      
      let toolName = "fetch_html";
      if (format === "json") toolName = "fetch_json";
      if (format === "text") toolName = "fetch_txt";
      if (format === "markdown") toolName = "fetch_markdown";
      
      return {
        description: t('prompts.fetchWebsite.result'),
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: t('prompts.fetchWebsite.message')
            }
          },
          {
            role: "assistant",
            content: {
              type: "text",
              text: t('prompts.fetchWebsite.response')
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `${t('prompts.fetchWebsite.instruction')}: ${url}\n\n` +
                   `${t('prompts.fetchWebsite.formatInstruction')}: ${format}\n\n` +
                   `${t('prompts.fetchWebsite.browserInstruction')}: ${useBrowser ? t('prompts.yes') : t('prompts.no')}`
            }
          }
        ]
      };
    } else if (promptName === "mult-fetch-mcp:prompt:extract-content") {
      const url = args.url;
      const selector = args.selector || "main";
      const dataType = args.dataType || "text";
      
      return {
        description: t('prompts.extractContent.result'),
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `${t('prompts.extractContent.message')}: ${url}\n\n` +
                   `${t('prompts.extractContent.selectorInstruction')}: ${selector}\n\n` +
                   `${t('prompts.extractContent.dataTypeInstruction')}: ${dataType}`
            }
          }
        ]
      };
    } else if (promptName === "mult-fetch-mcp:prompt:debug-fetch") {
      const url = args.url;
      const error = args.error;
      
      return {
        description: t('prompts.debugFetch.result'),
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `${t('prompts.debugFetch.message')}: ${url}\n\n` +
                   `${t('prompts.debugFetch.errorDetails')}: ${error}\n\n` +
                   `${t('prompts.debugFetch.instruction')}`
            }
          }
        ]
      };
    }
    
    // 默认情况下返回一个通用消息
    return {
      description: t('prompts.generic.result'),
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${t('prompts.generic.message')}: ${promptName}\n\n` +
                 `${t('prompts.generic.args')}: ${JSON.stringify(args, null, 2)}`
          }
        }
      ]
    };
  });
} 