/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { log, COMPONENTS } from '../logger.js';

// 定义提示模板 (Define prompt templates)
const PROMPTS = {
  "fetch-website": {
    name: "fetch-website",
    description: "prompts.fetchWebsite.description",
    arguments: [
      {
        name: "url",
        description: "prompts.url.description",
        required: true
      },
      {
        name: "format",
        description: "prompts.format.description",
        required: false
      },
      {
        name: "useBrowser",
        description: "prompts.useBrowser.description",
        required: false
      }
    ]
  },
  "extract-content": {
    name: "extract-content",
    description: "prompts.extractContent.description",
    arguments: [
      {
        name: "url",
        description: "prompts.url.description",
        required: true
      },
      {
        name: "selector",
        description: "prompts.selector.description",
        required: false
      },
      {
        name: "dataType",
        description: "prompts.dataType.description",
        required: false
      }
    ]
  },
  "debug-fetch": {
    name: "debug-fetch",
    description: "prompts.debugFetch.description",
    arguments: [
      {
        name: "url",
        description: "prompts.url.description",
        required: true
      },
      {
        name: "error",
        description: "prompts.error.description",
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
      throw new Error(`prompts.notFound: ${promptName}`);
    }
    
    // 检查必需参数
    const prompt = PROMPTS[promptName];
    const requiredArgs = prompt.arguments?.filter(arg => arg.required) || [];
    
    for (const arg of requiredArgs) {
      if (args[arg.name] === undefined) {
        throw new Error(`prompts.missingRequiredArg: ${arg.name}`);
      }
    }
    
    // 根据提示名称和参数生成消息
    if (promptName === "fetch-website") {
      const url = args.url;
      const format = args.format || "html";
      const useBrowser = typeof args.useBrowser === 'boolean' ? args.useBrowser : false;
      
      let toolName = "fetch_html";
      if (format === "json") toolName = "fetch_json";
      if (format === "text") toolName = "fetch_txt";
      if (format === "markdown") toolName = "fetch_markdown";
      
      return {
        description: `prompts.fetchWebsite.result`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `prompts.fetchWebsite.message`
            }
          },
          {
            role: "assistant",
            content: {
              type: "text",
              text: `prompts.fetchWebsite.response`
            }
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `prompts.fetchWebsite.instruction: ${url}\n\n` +
                   `prompts.fetchWebsite.formatInstruction: ${format}\n\n` +
                   `prompts.fetchWebsite.browserInstruction: ${useBrowser ? 'prompts.yes' : 'prompts.no'}`
            }
          }
        ]
      };
    } else if (promptName === "extract-content") {
      const url = args.url;
      const selector = args.selector || "main";
      const dataType = args.dataType || "text";
      
      return {
        description: `prompts.extractContent.result`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `prompts.extractContent.message: ${url}\n\n` +
                   `prompts.extractContent.selectorInstruction: ${selector}\n\n` +
                   `prompts.extractContent.dataTypeInstruction: ${dataType}`
            }
          }
        ]
      };
    } else if (promptName === "debug-fetch") {
      const url = args.url;
      const error = args.error;
      
      return {
        description: `prompts.debugFetch.result`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `prompts.debugFetch.message: ${url}\n\n` +
                   `prompts.debugFetch.errorDetails: ${error}\n\n` +
                   `prompts.debugFetch.instruction`
            }
          }
        ]
      };
    }
    
    // 默认情况下返回一个通用消息
    return {
      description: `prompts.generic.result`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `prompts.generic.message: ${promptName}\n\n` +
                 `prompts.generic.args: ${JSON.stringify(args, null, 2)}`
          }
        }
      ]
    };
  });
} 