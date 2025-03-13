/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RESOURCES_KEYS } from '../../keys.js';

// 资源相关消息 (Resources related messages)
export const resources = {
  // 资源列表相关 (Resource list related)
  [RESOURCES_KEYS.list.request]: "收到资源列表请求: {params}",
  [RESOURCES_KEYS.list.success]: "资源列表获取成功",
  [RESOURCES_KEYS.list.error]: "获取资源列表时出错: {error}",
  
  // 资源获取相关 (Resource get related)
  [RESOURCES_KEYS.get.request]: "收到资源读取请求: {uri}",
  [RESOURCES_KEYS.get.success]: "资源获取成功: {uri}",
  [RESOURCES_KEYS.get.error]: "读取资源时出错: {uri}, {error}",
  [RESOURCES_KEYS.get.notFound]: "未找到资源: {uri}",
  
  // 资源创建相关 (Resource create related)
  [RESOURCES_KEYS.create.request]: "收到资源创建请求: {uri}",
  [RESOURCES_KEYS.create.success]: "资源创建成功: {uri}",
  [RESOURCES_KEYS.create.error]: "创建资源时出错: {uri}, {error}",
  [RESOURCES_KEYS.create.duplicate]: "资源已存在: {uri}",
  
  // 资源更新相关 (Resource update related)
  [RESOURCES_KEYS.update.request]: "收到资源更新请求: {uri}",
  [RESOURCES_KEYS.update.success]: "资源更新成功: {uri}",
  [RESOURCES_KEYS.update.error]: "更新资源时出错: {uri}, {error}",
  [RESOURCES_KEYS.update.notFound]: "未找到要更新的资源: {uri}",
  
  // 资源删除相关 (Resource delete related)
  [RESOURCES_KEYS.delete.request]: "收到资源删除请求: {uri}",
  [RESOURCES_KEYS.delete.success]: "资源删除成功: {uri}",
  [RESOURCES_KEYS.delete.error]: "删除资源时出错: {uri}, {error}",
  [RESOURCES_KEYS.delete.notFound]: "未找到要删除的资源: {uri}",
  
  // 额外的键（不在 RESOURCES_KEYS 中定义的）
  fileReadError: "读取文件时出错: {filePath}, {error}",
  invalidUri: "无效的资源URI",
  notFound: "资源未找到",
  
  // 资源描述 (Resource descriptions)
  readme: {
    description: "项目自述文件，包含项目概述、安装和使用说明"
  },
  package: {
    description: "项目包配置文件，包含依赖和脚本定义"
  },
  index: {
    description: "项目入口文件，包含服务器启动逻辑"
  },
  client: {
    description: "MCP客户端实现，用于与服务器通信"
  },
  
  // 资源模板描述 (Resource template descriptions)
  sourceFile: {
    name: "源代码文件",
    description: "访问项目源代码文件"
  },
  docFile: {
    name: "文档文件",
    description: "访问项目文档文件"
  },
  filename: {
    description: "文件名，包括扩展名"
  }
}; 