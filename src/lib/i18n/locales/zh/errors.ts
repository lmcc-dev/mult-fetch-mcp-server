/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 通用错误消息 (Common error messages)
export const errors = {
  missingUrl: "缺少必需参数: url",
  invalidUrl: "无效的 URL: {{url}}",
  timeout: "请求超时，已经过 {{timeout}}ms",
  networkError: "网络错误: {{error}}",
  browserError: "浏览器错误: {{error}}",
  unexpectedError: "意外错误: {{error}}",
  forbidden: "原因: 访问被禁止 (403 Forbidden)",
  cloudflareProtection: "原因: Cloudflare 保护",
  captchaRequired: "原因: 需要验证码",
  connectionProblem: "原因: 连接问题"
}; 