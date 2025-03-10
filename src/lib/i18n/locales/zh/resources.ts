/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

export default {
  // 资源列表错误 (Resource list errors)
  list: {
    request: "收到资源列表请求: {params}"
  },
  // 资源读取错误 (Resource read errors)
  read: {
    request: "收到资源读取请求: {uri}",
    error: "读取资源时出错: {uri}, {error}"
  },
  // 文件读取错误 (File read errors)
  fileReadError: "读取文件时出错: {filePath}, {error}",
  // 无效的URI (Invalid URI)
  invalidUri: "无效的资源URI",
  // 资源未找到 (Resource not found)
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