/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 模板工具类 (Template utilities class)
 * 提供处理模板替换的通用方法 (Provides common methods for template replacement)
 */
export class TemplateUtils {
  /**
   * 替换内容中的占位符 (Replace placeholders in content)
   * @param content 原始内容 (Original content)
   * @param replacements 替换项 (Replacements)
   * @returns 替换后的内容 (Content after replacement)
   */
  public static replaceTemplateVariables(
    content: string,
    replacements: Record<string, string>
  ): string {
    let result = content;

    // 遍历所有替换项 (Iterate through all replacements)
    for (const [key, value] of Object.entries(replacements)) {
      // 创建正则表达式 (Create regular expression)
      const regex = new RegExp(`{{${key}}}`, 'g');

      // 替换所有匹配项 (Replace all matches)
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * 系统提示相关的常量 (Constants related to system prompts)
   */
  public static SYSTEM_NOTE = {
    START: "=== SYSTEM NOTE ===",
    END: "==================="
  };

  /**
   * 生成基于字节大小的分块内容提示文本 (Generate size-based chunk prompt text)
   * @param fetchedBytes 已获取的字节数 (Bytes already fetched)
   * @param totalBytes 总字节数 (Total bytes)
   * @param chunkId 块ID (Chunk ID)
   * @param remainingBytes 剩余字节数 (Remaining bytes)
   * @param estimatedRequests 预计需要的请求次数 (Estimated number of requests needed)
   * @param currentSizeLimit 当前大小限制 (Current size limit)
   * @param isFirstRequest 是否为首次请求 (Whether it's the first request)
   * @returns 格式化的提示文本 (Formatted prompt text)
   */
  public static generateSizeBasedChunkPrompt(
    fetchedBytes: number,
    totalBytes: number,
    chunkId: string,
    remainingBytes: number,
    estimatedRequests: number,
    currentSizeLimit: number,
    isFirstRequest: boolean = true
  ): string {
    const prefix = isFirstRequest ? 'Content is too long and has been split. ' : '';
    const fetchedPercent = Math.round((fetchedBytes / totalBytes) * 100);

    return `\n\n${TemplateUtils.SYSTEM_NOTE.START}\n${prefix}You've retrieved ${fetchedBytes.toLocaleString()} bytes (${fetchedPercent}% of total ${totalBytes.toLocaleString()} bytes). ${remainingBytes.toLocaleString()} bytes remaining. With current contentSizeLimit=${currentSizeLimit.toLocaleString()}, approximately ${estimatedRequests} more requests needed to retrieve all content. To continue, use the same tool function with parameters chunkId="${chunkId}" and startCursor=${fetchedBytes}.\n${TemplateUtils.SYSTEM_NOTE.END}`;
  }

  /**
   * 生成最后一个分块的基于字节大小的提示信息 (Generate size-based prompt for the last chunk)
   * @param fetchedBytes 已获取的字节数 (Bytes already fetched)
   * @param totalBytes 总字节数 (Total bytes)
   * @param isFirstRequest 是否为首次请求 (Whether it's the first request)
   * @returns 分段提示信息 (Chunk prompt information)
   */
  public static generateSizeBasedLastChunkPrompt(
    fetchedBytes: number,
    totalBytes: number,
    isFirstRequest: boolean = true
  ): string {
    const prefix = isFirstRequest ? 'Content is too long and has been split. ' : '';
    const _fetchedPercent = Math.round((fetchedBytes / totalBytes) * 100);

    return `\n\n${TemplateUtils.SYSTEM_NOTE.START}\n${prefix}You've retrieved ${fetchedBytes.toLocaleString()} bytes (100% of total ${totalBytes.toLocaleString()} bytes).\nThis is the last part of the content.\n${TemplateUtils.SYSTEM_NOTE.END}`;
  }

  /**
   * 检查内容是否已包含系统提示 (Check if content already contains system prompt)
   * @param content 要检查的内容 (Content to check)
   * @returns 是否包含系统提示 (Whether it contains system prompt)
   */
  public static hasSystemPrompt(content: string): boolean {
    return content.includes(TemplateUtils.SYSTEM_NOTE.START) && content.includes(TemplateUtils.SYSTEM_NOTE.END);
  }
} 