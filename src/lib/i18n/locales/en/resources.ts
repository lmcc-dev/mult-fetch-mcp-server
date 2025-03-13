/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RESOURCES_KEYS } from '../../keys.js';

// 资源相关消息 (Resources related messages)
export const resources = {
  // 资源列表相关 (Resource list related)
  [RESOURCES_KEYS.list.request]: "Received resource list request: {params}",
  [RESOURCES_KEYS.list.success]: "Resource list retrieved successfully",
  [RESOURCES_KEYS.list.error]: "Error retrieving resource list: {error}",
  
  // 资源获取相关 (Resource get related)
  [RESOURCES_KEYS.get.request]: "Received resource read request: {uri}",
  [RESOURCES_KEYS.get.success]: "Resource retrieved successfully: {uri}",
  [RESOURCES_KEYS.get.error]: "Error reading resource: {uri}, {error}",
  [RESOURCES_KEYS.get.notFound]: "Resource not found: {uri}",
  
  // 资源创建相关 (Resource create related)
  [RESOURCES_KEYS.create.request]: "Received resource create request: {uri}",
  [RESOURCES_KEYS.create.success]: "Resource created successfully: {uri}",
  [RESOURCES_KEYS.create.error]: "Error creating resource: {uri}, {error}",
  [RESOURCES_KEYS.create.duplicate]: "Resource already exists: {uri}",
  
  // 资源更新相关 (Resource update related)
  [RESOURCES_KEYS.update.request]: "Received resource update request: {uri}",
  [RESOURCES_KEYS.update.success]: "Resource updated successfully: {uri}",
  [RESOURCES_KEYS.update.error]: "Error updating resource: {uri}, {error}",
  [RESOURCES_KEYS.update.notFound]: "Resource not found for update: {uri}",
  
  // 资源删除相关 (Resource delete related)
  [RESOURCES_KEYS.delete.request]: "Received resource delete request: {uri}",
  [RESOURCES_KEYS.delete.success]: "Resource deleted successfully: {uri}",
  [RESOURCES_KEYS.delete.error]: "Error deleting resource: {uri}, {error}",
  [RESOURCES_KEYS.delete.notFound]: "Resource not found for deletion: {uri}",
  
  // 额外的键（不在 RESOURCES_KEYS 中定义的）
  fileReadError: "Error reading file: {filePath}, {error}",
  invalidUri: "Invalid resource URI",
  notFound: "Resource not found",
  
  // 资源描述 (Resource descriptions)
  readme: {
    description: "Project README file, containing project overview, installation and usage instructions"
  },
  package: {
    description: "Project package configuration file, containing dependencies and script definitions"
  },
  index: {
    description: "Project entry file, containing server startup logic"
  },
  client: {
    description: "MCP client implementation, used for communicating with the server"
  },
  
  // 资源模板描述 (Resource template descriptions)
  sourceFile: {
    name: "Source Code File",
    description: "Access project source code files"
  },
  docFile: {
    name: "Documentation File",
    description: "Access project documentation files"
  },
  filename: {
    description: "Filename, including extension"
  }
}; 