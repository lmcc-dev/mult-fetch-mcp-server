/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import i18next from 'i18next';
import { enTranslation } from './locales/en/index.js';
import { zhTranslation } from './locales/zh/index.js';

// 定义语言资源 (Define language resources)
const resources = {
  en: {
    translation: enTranslation
  },
  zh: {
    translation: zhTranslation
  }
};

// 初始化 i18next (Initialize i18next)
i18next.init({
  resources,
  // 优先使用专门的环境变量，其次是系统语言，最后回退到英语
  // (Priority: dedicated environment variable, then system language, finally fallback to English)
  lng: process.env.MCP_LANG || (process.env.LANG?.startsWith('zh') ? 'zh' : 'en'),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // 不转义插值 (Don't escape interpolation)
  }
});

// 导出 i18next 实例 (Export i18next instance)
export default i18next;

// 导出一个简便的翻译函数 (Export a convenient translation function)
export const t = (key: string, options?: any) => i18next.t(key, options);

// 导出语言切换函数 (Export language switching function)
export const changeLanguage = (lng: 'en' | 'zh') => i18next.changeLanguage(lng);

// 导出获取当前语言函数 (Export get current language function)
export const getCurrentLanguage = () => i18next.language; 