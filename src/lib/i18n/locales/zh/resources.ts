/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { RESOURCES_KEYS } from '../../keys/resources.js';

// 资源相关消息 (Resource related messages)
export default {
  // 列表操作 (List operations)
  [RESOURCES_KEYS.list.request]: "收到资源列表请求",
  [RESOURCES_KEYS.list.success]: "成功获取资源列表",
  [RESOURCES_KEYS.list.error]: "获取资源列表出错：{{error}}",
  [RESOURCES_KEYS.list.notFound]: "未找到任何资源",
  [RESOURCES_KEYS.list.duplicate]: "列表中发现重复资源",

  // 获取操作 (Get operations)
  [RESOURCES_KEYS.get.request]: "收到获取资源请求",
  [RESOURCES_KEYS.get.success]: "成功获取资源",
  [RESOURCES_KEYS.get.error]: "获取资源出错：{{error}}",
  [RESOURCES_KEYS.get.notFound]: "未找到请求的资源",
  [RESOURCES_KEYS.get.duplicate]: "发现重复资源",

  // 读取操作 (Read operations)
  [RESOURCES_KEYS.read.request]: "收到读取资源请求",
  [RESOURCES_KEYS.read.success]: "成功读取资源",
  [RESOURCES_KEYS.read.error]: "读取资源出错：{{error}}",
  [RESOURCES_KEYS.read.notFound]: "未找到要读取的资源",
  [RESOURCES_KEYS.readError]: "读取资源出错：{{error}}",

  // 创建操作 (Create operations)
  [RESOURCES_KEYS.create.request]: "收到创建资源请求",
  [RESOURCES_KEYS.create.success]: "成功创建资源",
  [RESOURCES_KEYS.create.error]: "创建资源出错：{{error}}",
  [RESOURCES_KEYS.create.notFound]: "未找到父资源",
  [RESOURCES_KEYS.create.duplicate]: "资源已存在",

  // 更新操作 (Update operations)
  [RESOURCES_KEYS.update.request]: "收到更新资源请求",
  [RESOURCES_KEYS.update.success]: "成功更新资源",
  [RESOURCES_KEYS.update.error]: "更新资源出错：{{error}}",
  [RESOURCES_KEYS.update.notFound]: "未找到要更新的资源",
  [RESOURCES_KEYS.update.duplicate]: "更新会导致资源重复",

  // 删除操作 (Delete operations)
  [RESOURCES_KEYS.delete.request]: "收到删除资源请求",
  [RESOURCES_KEYS.delete.success]: "成功删除资源",
  [RESOURCES_KEYS.delete.error]: "删除资源出错：{{error}}",
  [RESOURCES_KEYS.delete.notFound]: "未找到要删除的资源",
  [RESOURCES_KEYS.delete.duplicate]: "多个资源匹配删除条件",

  // 其他资源相关消息 (Other resource related messages)
  [RESOURCES_KEYS.fileReadError]: "读取文件出错：{{error}}",
  [RESOURCES_KEYS.invalidUri]: "无效的 URI：{{uri}}",
  [RESOURCES_KEYS.notFound]: "未找到资源：{{path}}",

  // 资源描述 (Resource descriptions)
  [RESOURCES_KEYS.readme.description]: "项目 README 文件",
  [RESOURCES_KEYS.package.description]: "包配置文件",
  [RESOURCES_KEYS.index.description]: "主入口文件",
  [RESOURCES_KEYS.client.description]: "客户端实现文件",
  [RESOURCES_KEYS.sourceFile.name]: "源代码文件",
  [RESOURCES_KEYS.sourceFile.description]: "项目源代码文件",
  [RESOURCES_KEYS.docFile.name]: "文档文件",
  [RESOURCES_KEYS.docFile.description]: "项目文档文件",
  [RESOURCES_KEYS.filename.description]: "文件名"
}; 