/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

export default {
  // 提示列表和获取 (Prompt list and get)
  list: {
    request: "收到提示列表请求: {params}"
  },
  get: {
    request: "收到提示获取请求: {promptName}, {args}"
  },
  
  // 错误消息 (Error messages)
  notFound: "提示模板未找到",
  missingRequiredArg: "缺少必需参数",
  
  // 通用提示 (Generic prompt)
  generic: {
    result: "执行通用提示",
    message: "执行提示模板",
    args: "参数"
  },
  
  // 是/否 (Yes/No)
  yes: "是",
  no: "否",
  
  // 提示描述和参数 (Prompt descriptions and parameters)
  url: {
    description: "网站URL"
  },
  format: {
    description: "返回格式，可选值: html, json, text, markdown"
  },
  useBrowser: {
    description: "是否使用浏览器模式获取内容"
  },
  selector: {
    description: "CSS选择器，用于提取特定内容"
  },
  dataType: {
    description: "要提取的数据类型，如表格、列表、联系信息等"
  },
  error: {
    description: "获取过程中遇到的错误信息"
  },
  
  // 获取网站提示 (Fetch website prompt)
  fetchWebsite: {
    description: "获取网站内容",
    result: "网站内容获取结果",
    message: "我想获取一个网站的内容",
    response: "我可以帮你获取网站内容。请提供网站URL和所需的格式。",
    instruction: "请获取以下网站的内容",
    formatInstruction: "请以以下格式返回内容",
    browserInstruction: "是否使用浏览器模式"
  },
  
  // 提取内容提示 (Extract content prompt)
  extractContent: {
    description: "从网站提取特定内容",
    result: "内容提取结果",
    message: "请从以下网站提取内容",
    selectorInstruction: "使用以下CSS选择器提取内容",
    dataTypeInstruction: "提取以下类型的数据"
  },
  
  // 调试获取提示 (Debug fetch prompt)
  debugFetch: {
    description: "调试网站获取问题",
    result: "获取问题调试结果",
    message: "我在获取以下网站时遇到问题",
    errorDetails: "错误详情",
    instruction: "请分析可能的原因并提供解决方案。考虑以下几点：\n1. 网站是否有反爬虫措施\n2. 是否需要使用浏览器模式\n3. 是否需要设置特定的请求头\n4. 是否需要处理重定向或cookie\n5. 网站是否需要JavaScript渲染"
  }
}; 