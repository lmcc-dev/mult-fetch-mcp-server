/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import i18next, { TOptions } from 'i18next';
import { enTranslation } from './locales/en/index.js';
import { zhTranslation } from './locales/zh/index.js';

// 支持的语言类型 (Supported language types)
export type SupportedLanguage = 'en' | 'zh';

// 翻译资源类型 (Translation resources type)
export type TranslationResources = typeof enTranslation;

// 定义语言资源 (Define language resources)
const resources = {
  en: {
    translation: enTranslation
  },
  zh: {
    translation: zhTranslation
  }
};

/**
 * 将嵌套的翻译资源扁平化 (Flatten nested translation resources)
 * @param resources 嵌套的翻译资源 (Nested translation resources)
 * @returns 扁平化的翻译资源 (Flattened translation resources)
 */
function flattenResources(resources: Record<string, any>): Record<string, any> {
  const flattened: Record<string, any> = {};

  // 遍历所有语言 (Iterate through all languages)
  for (const lang in resources) {
    flattened[lang] = { translation: {} };
    const translation = resources[lang].translation;

    // 遍历所有命名空间 (Iterate through all namespaces)
    for (const namespace in translation) {
      const nsTranslation = translation[namespace];

      // 遍历命名空间中的所有键 (Iterate through all keys in the namespace)
      for (const key in nsTranslation) {
        // 直接使用原始键名，不添加命名空间前缀 (Use the original key directly, without adding namespace prefix)
        flattened[lang].translation[key] = nsTranslation[key];
      }
    }
  }

  return flattened;
}

// 扁平化翻译资源 (Flatten translation resources)
const flattenedResources = flattenResources(resources);

/**
 * 初始化 i18next 配置 (Initialize i18next configuration)
 */
const initializeI18n = () => {
  // 获取当前语言环境 (Get current language environment)
  const currentLanguage = process.env.MCP_LANG || 'en';

  // 初始化 i18next (Initialize i18next)
  i18next.init({
    resources: flattenedResources,
    // 优先使用专门的环境变量，其次默认使用英语
    // (Priority: dedicated environment variable, then default to English)
    lng: currentLanguage as SupportedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // 不转义插值 (Don't escape interpolation)
    },
    debug: false, // 禁用 i18n 调试 (Disable i18n debug)
    returnEmptyString: false, // 不返回空字符串 (Don't return empty string)
    returnNull: false, // 不返回 null (Don't return null)
    returnObjects: true, // 返回对象 (Return objects)
    saveMissing: false, // 不保存缺失的翻译键 (Don't save missing translation keys)
    keySeparator: false, // 禁用键分隔符，使用完整的键路径 (Disable key separator, use full key path)
    nsSeparator: false, // 禁用命名空间分隔符 (Disable namespace separator)
    missingKeyHandler: (_lng, _ns, _key, _fallbackValue) => {
      // 不输出任何日志，由上层调用决定是否输出 (Don't output any logs, let the upper-level call decide whether to output)
    }
  });

  return i18next;
};

// 初始化 i18next 实例 (Initialize i18next instance)
const i18n = initializeI18n();

// 导出 i18next 实例 (Export i18next instance)
export default i18n;

/**
 * 翻译函数类型 (Translation function type)
 * 支持字符串和嵌套对象的翻译 (Supports translation of strings and nested objects)
 */
export type TranslateFunction = <T = string>(
  key: string,
  options?: TOptions | undefined
) => T extends string ? string : any;

/**
 * 翻译函数 - 提供类型安全和错误处理 (Translation function - provides type safety and error handling)
 * @param key 翻译键 (Translation key)
 * @param options 翻译选项 (Translation options)
 * @returns 翻译结果 (Translation result)
 */
export const t: TranslateFunction = (key, options?) => {
  try {
    // 检查键是否存在 (Check if the key exists)
    const exists = i18n.exists(key);
    if (!exists) {
      return key as any;
    }

    const result = i18n.t(key, options);
    return result;
  } catch (_error) {
    return key as any; // 出错时返回原始键 (Return the original key when an error occurs)
  }
};

/**
 * 切换语言函数 (Language switching function)
 * @param lng 目标语言 (Target language)
 * @returns Promise，解析为切换后的语言 (Promise that resolves to the switched language)
 */
export const changeLanguage = (lng: SupportedLanguage): Promise<unknown> => {
  // 不输出任何日志，由上层调用决定是否输出 (Don't output any logs, let the upper-level call decide whether to output)
  return i18n.changeLanguage(lng).then(() => lng);
};

/**
 * 获取当前语言函数 (Get current language function)
 * @returns 当前语言 (Current language)
 */
export const getCurrentLanguage = (): SupportedLanguage =>
  (i18n.language || 'en') as SupportedLanguage;

/**
 * 检查键是否存在 (Check if a key exists)
 * @param key 要检查的键 (Key to check)
 * @returns 键是否存在 (Whether the key exists)
 */
export const hasTranslation = (key: string): boolean => {
  return i18n.exists(key);
};

/**
 * 获取所有支持的语言 (Get all supported languages)
 * @returns 支持的语言数组 (Array of supported languages)
 */
export const getSupportedLanguages = (): SupportedLanguage[] => {
  return Object.keys(resources) as SupportedLanguage[];
}; 