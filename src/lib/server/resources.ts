/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { log, getLogFilePath, COMPONENTS } from '../logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取项目根目录路径 (Get project root directory path)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

/**
 * 注册资源相关处理程序到服务器 (Register resource handlers to server)
 * @param server MCP服务器实例 (MCP server instance)
 */
export function registerResources(server: Server): void {
  // 注册资源列表处理程序
  server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    const debug = request.params?.debug === true;
    log('resources.list.request', debug, { params: request.params }, COMPONENTS.RESOURCES);
    
    // 返回实际可用的资源列表
    return {
      resources: [
        // 项目文档资源 (Project documentation resources)
        {
          uri: 'file:///logs/debug',
          description: 'Debug log file containing all debug messages from the server'
        }
      ],
      resourceTemplates: [
        // 源代码文件模板 (Source code file template)
        
    
      ]
    };
  });

  // 注册资源读取处理程序
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const debug = request.params?.debug === true;
    log('resources.read.request', debug, { uri }, COMPONENTS.RESOURCES);
    
    try {
      // 解析URI并读取相应文件
      const filePath = parseResourceUri(uri);
      if (!filePath) {
        throw new Error(`resources.invalidUri`);
      }
      
      const content = await readFileContent(filePath);
      const mimeType = getMimeType(filePath);
      
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
      log('resources.readError', debug, { uri, error: error instanceof Error ? error.message : String(error) }, COMPONENTS.RESOURCES);
      throw new Error(`resources.notFound: ${uri}`);
    }
  });
}

/**
 * 解析资源URI为文件路径 (Parse resource URI to file path)
 * @param uri 资源URI (Resource URI)
 * @returns 文件路径或null (File path or null)
 */
function parseResourceUri(uri: string): string | null {
  // 处理日志文件URI
  if (uri === 'file:///logs/debug') {
    return getLogFilePath();
  }
  
  // 处理预定义的URI模式
  if (uri.startsWith('file:///docs/')) {
    const resourceName = uri.substring('file:///docs/'.length);
    if (resourceName === 'readme') {
      return path.join(projectRoot, 'README.md');
    } else if (resourceName === 'package') {
      return path.join(projectRoot, 'package.json');
    } else {
      return path.join(projectRoot, resourceName);
    }
  } else if (uri.startsWith('file:///src/')) {
    const resourceName = uri.substring('file:///src/'.length);
    if (resourceName === 'index') {
      return path.join(projectRoot, 'index.ts');
    } else if (resourceName === 'client') {
      return path.join(projectRoot, 'src', 'client.ts');
    } else {
      return path.join(projectRoot, 'src', resourceName);
    }
  }
  
  return null;
}

/**
 * 读取文件内容 (Read file content)
 * @param filePath 文件路径 (File path)
 * @returns 文件内容 (File content)
 */
async function readFileContent(filePath: string): Promise<string> {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    log('resources.fileReadError', true, { filePath, error: error instanceof Error ? error.message : String(error) }, COMPONENTS.RESOURCES);
    throw new Error('resources.fileReadError');
  }
}

/**
 * 根据文件路径获取MIME类型 (Get MIME type based on file path)
 * @param filePath 文件路径 (File path)
 * @returns MIME类型 (MIME type)
 */
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