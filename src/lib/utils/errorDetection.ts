/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 检查错误文本是否表示访问被拒绝或需要人机验证
 * (Check if error text indicates access denied or requires human verification)
 * 
 * @param errorText 错误文本 (Error text to check)
 * @returns 是否为访问被拒绝错误 (Whether it's an access denied error)
 */
export function isAccessDeniedError(errorText: string): boolean {
  if (!errorText) return false;
  
  const lowerCaseError = errorText.toLowerCase();
  return lowerCaseError.includes('403') || 
         lowerCaseError.includes('forbidden') ||
         lowerCaseError.includes('access denied') ||
         lowerCaseError.includes('cloudflare') ||
         lowerCaseError.includes('captcha') ||
         lowerCaseError.includes('blocked') ||
         lowerCaseError.includes('security check');
}

/**
 * 检查错误文本是否表示网络错误
 * (Check if error text indicates a network error)
 * 
 * @param errorText 错误文本 (Error text to check)
 * @returns 是否为网络错误 (Whether it's a network error)
 */
export function isNetworkError(errorText: string): boolean {
  if (!errorText) return false;
  
  const lowerCaseError = errorText.toLowerCase();
  return lowerCaseError.includes('network') ||
         lowerCaseError.includes('connection') ||
         lowerCaseError.includes('timeout') ||
         lowerCaseError.includes('unreachable') ||
         lowerCaseError.includes('econnrefused');
} 