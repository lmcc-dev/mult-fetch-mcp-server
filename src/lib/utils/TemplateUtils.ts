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
} 