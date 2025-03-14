/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RESOURCES_KEYS } from '../../keys/resources.js';

// 资源相关消息 (Resource related messages)
export default {
  // 列表操作 (List operations)
  [RESOURCES_KEYS.list.request]: "List resources request received",
  [RESOURCES_KEYS.list.success]: "Resources listed successfully",
  [RESOURCES_KEYS.list.error]: "Error listing resources: {{error}}",
  [RESOURCES_KEYS.list.notFound]: "No resources found",
  [RESOURCES_KEYS.list.duplicate]: "Duplicate resource found in list",

  // 获取操作 (Get operations)
  [RESOURCES_KEYS.get.request]: "Get resource request received",
  [RESOURCES_KEYS.get.success]: "Resource retrieved successfully",
  [RESOURCES_KEYS.get.error]: "Error retrieving resource: {{error}}",
  [RESOURCES_KEYS.get.notFound]: "Resource not found",
  [RESOURCES_KEYS.get.duplicate]: "Duplicate resource found",

  // 读取操作 (Read operations)
  [RESOURCES_KEYS.read.request]: "Read resource request received",
  [RESOURCES_KEYS.read.success]: "Resource read successfully",
  [RESOURCES_KEYS.read.error]: "Error reading resource: {{error}}",
  [RESOURCES_KEYS.read.notFound]: "Resource to read not found",
  [RESOURCES_KEYS.readError]: "Error reading resource: {{error}}",

  // 创建操作 (Create operations)
  [RESOURCES_KEYS.create.request]: "Create resource request received",
  [RESOURCES_KEYS.create.success]: "Resource created successfully",
  [RESOURCES_KEYS.create.error]: "Error creating resource: {{error}}",
  [RESOURCES_KEYS.create.notFound]: "Parent resource not found",
  [RESOURCES_KEYS.create.duplicate]: "Resource already exists",

  // 更新操作 (Update operations)
  [RESOURCES_KEYS.update.request]: "Update resource request received",
  [RESOURCES_KEYS.update.success]: "Resource updated successfully",
  [RESOURCES_KEYS.update.error]: "Error updating resource: {{error}}",
  [RESOURCES_KEYS.update.notFound]: "Resource to update not found",
  [RESOURCES_KEYS.update.duplicate]: "Update would create duplicate resource",

  // 删除操作 (Delete operations)
  [RESOURCES_KEYS.delete.request]: "Delete resource request received",
  [RESOURCES_KEYS.delete.success]: "Resource deleted successfully",
  [RESOURCES_KEYS.delete.error]: "Error deleting resource: {{error}}",
  [RESOURCES_KEYS.delete.notFound]: "Resource to delete not found",
  [RESOURCES_KEYS.delete.duplicate]: "Multiple resources match delete criteria",

  // 其他资源相关消息 (Other resource related messages)
  [RESOURCES_KEYS.fileReadError]: "Error reading file: {{error}}",
  [RESOURCES_KEYS.invalidUri]: "Invalid URI: {{uri}}",
  [RESOURCES_KEYS.notFound]: "Resource not found: {{path}}",

  // 资源描述 (Resource descriptions)
  [RESOURCES_KEYS.readme.description]: "Project README file",
  [RESOURCES_KEYS.package.description]: "Package configuration file",
  [RESOURCES_KEYS.index.description]: "Main entry point file",
  [RESOURCES_KEYS.client.description]: "Client implementation file",
  [RESOURCES_KEYS.sourceFile.name]: "Source file",
  [RESOURCES_KEYS.sourceFile.description]: "Source code file",
  [RESOURCES_KEYS.docFile.name]: "Documentation file",
  [RESOURCES_KEYS.docFile.description]: "Documentation file",
  [RESOURCES_KEYS.filename.description]: "File name"
}; 