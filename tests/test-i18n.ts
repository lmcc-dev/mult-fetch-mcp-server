/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 测试国际化功能 (Test internationalization functionality)
import { log, COMPONENTS, clearTranslationCache } from '../src/lib/logger.js';
import i18next, { t, changeLanguage, getCurrentLanguage, hasTranslation, getSupportedLanguages } from '../src/lib/i18n/index.js';
import { enTranslation } from '../src/lib/i18n/locales/en/index.js';
import { zhTranslation } from '../src/lib/i18n/locales/zh/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入所有键模块 (Import all key modules)
import * as allKeys from '../src/lib/i18n/keys/index.js';

// 定义测试配置 (Define test configuration)
interface TestConfig {
  generateReport: boolean;
  reportPath: string;
  checkEmptyValues: boolean;
  checkPlaceholders: boolean;
  verbose: boolean;
  testCache: boolean;
  testSampleKeys: boolean;
}

// 默认测试配置 (Default test configuration)
const defaultConfig: TestConfig = {
  generateReport: true,
  reportPath: path.join(__dirname, '../i18n-test-report.json'),
  checkEmptyValues: true,
  checkPlaceholders: true,
  verbose: false,
  testCache: false,
  testSampleKeys: false
};

// 解析命令行参数 (Parse command line arguments)
function parseCommandLineArgs(): TestConfig {
  const config = { ...defaultConfig };
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--no-report':
        config.generateReport = false;
        break;
      case '--report-path':
        if (i + 1 < args.length) {
          config.reportPath = args[++i];
        }
        break;
      case '--no-check-empty':
        config.checkEmptyValues = false;
        break;
      case '--no-check-placeholders':
        config.checkPlaceholders = false;
        break;
      case '--verbose':
        config.verbose = true;
        break;
      case '--test-cache':
        config.testCache = true;
        break;
      case '--test-sample-keys':
        config.testSampleKeys = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }
  
  return config;
}

// 打印帮助信息 (Print help information)
function printHelp() {
  console.log(`
国际化测试工具 (Internationalization Test Tool)

用法: node --loader ts-node/esm tests/test-i18n.ts [选项]

选项:
  --no-report                不生成报告文件 (Don't generate report file)
  --report-path <path>       指定报告文件路径 (Specify report file path)
  --no-check-empty           不检查空值 (Don't check empty values)
  --no-check-placeholders    不检查占位符 (Don't check placeholders)
  --verbose                  显示详细信息 (Show verbose information)
  --test-cache               测试翻译缓存 (Test translation cache)
  --test-sample-keys         测试样例键 (Test sample keys)
  --help                     显示帮助信息 (Show help information)
  `);
}

/**
 * 递归获取对象中的所有键 (Recursively get all keys in an object)
 * @param obj 要获取键的对象 (Object to get keys from)
 * @param prefix 键前缀 (Key prefix)
 * @returns 键数组 (Array of keys)
 */
function getAllKeysFromObject(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // 递归获取嵌套对象的键 (Recursively get keys of nested objects)
      keys = [...keys, ...getAllKeysFromObject(obj[key], prefix ? `${prefix}.${key}` : key)];
    } else if (typeof obj[key] === 'string') {
      // 直接使用键值作为完整的键路径 (Use key value as the complete key path)
      keys.push(obj[key] as string);
    }
  }
  
  return keys;
}

/**
 * 从键模块中获取所有键 (Get all keys from key modules)
 * @returns 键数组 (Array of keys)
 */
function getAllKeysFromModules(): string[] {
  const allKeysSet = new Set<string>();
  
  // 遍历所有键模块 (Iterate through all key modules)
  for (const moduleKey in allKeys) {
    const keyModule = (allKeys as any)[moduleKey];
    if (typeof keyModule === 'object' && keyModule !== null) {
      // 获取模块中的所有键 (Get all keys in the module)
      const keysInModule = getAllKeysFromObject(keyModule);
      keysInModule.forEach(key => allKeysSet.add(key));
    }
  }
  
  return Array.from(allKeysSet);
}

/**
 * 获取翻译值 (Get translation value)
 * @param key 键 (Key)
 * @param translations 翻译资源 (Translation resources)
 * @returns 翻译值 (Translation value)
 */
function getTranslationValue(key: string, translations: any): string | undefined {
  // 检查是否是命名空间格式的键 (Check if the key is in namespace format)
  const parts = key.split('.');
  if (parts.length > 1) {
    const namespace = parts[0];
    const subKey = parts.slice(1).join('.');
    
    // 检查命名空间是否存在 (Check if the namespace exists)
    if (translations[namespace] && translations[namespace][subKey] !== undefined) {
      return translations[namespace][subKey];
    }
  }
  
  // 直接在翻译资源中查找键 (Look up the key directly in translation resources)
  for (const moduleName in translations) {
    const module = translations[moduleName];
    if (module && module[key] !== undefined) {
      return module[key];
    }
  }
  
  return undefined;
}

/**
 * 检查键是否存在于翻译资源中 (Check if a key exists in translation resources)
 * @param key 要检查的键 (Key to check)
 * @param translations 翻译资源 (Translation resources)
 * @returns 键是否存在 (Whether the key exists)
 */
function keyExistsInTranslations(key: string, translations: any): boolean {
  return getTranslationValue(key, translations) !== undefined;
}

/**
 * 检查翻译值是否为空 (Check if a translation value is empty)
 * @param key 键 (Key)
 * @param translations 翻译资源 (Translation resources)
 * @returns 翻译值是否为空 (Whether the translation value is empty)
 */
function isTranslationEmpty(key: string, translations: any): boolean {
  const value = getTranslationValue(key, translations);
  return value === '' || value === null || value === undefined;
}

/**
 * 提取占位符 (Extract placeholders)
 * @param text 文本 (Text)
 * @returns 占位符数组 (Array of placeholders)
 */
function extractPlaceholders(text: string): string[] {
  if (!text) return [];
  
  // 匹配 {{xxx}} 和 {xxx} 格式的占位符 (Match {{xxx}} and {xxx} format placeholders)
  const placeholders: string[] = [];
  const regex1 = /\{\{([^{}]+)\}\}/g;
  const regex2 = /\{([^{}]+)\}/g;
  
  let match;
  while ((match = regex1.exec(text)) !== null) {
    placeholders.push(match[1]);
  }
  
  while ((match = regex2.exec(text)) !== null) {
    placeholders.push(match[1]);
  }
  
  return placeholders;
}

/**
 * 检查占位符是否匹配 (Check if placeholders match)
 * @param key 键 (Key)
 * @param enValue 英文值 (English value)
 * @param zhValue 中文值 (Chinese value)
 * @returns 占位符是否匹配 (Whether placeholders match)
 */
function checkPlaceholdersMatch(key: string, enValue: string, zhValue: string): boolean {
  const enPlaceholders = extractPlaceholders(enValue);
  const zhPlaceholders = extractPlaceholders(zhValue);
  
  // 检查占位符数量是否相同 (Check if the number of placeholders is the same)
  if (enPlaceholders.length !== zhPlaceholders.length) {
    return false;
  }
  
  // 检查占位符名称是否相同 (Check if placeholder names are the same)
  const enSet = new Set(enPlaceholders);
  for (const placeholder of zhPlaceholders) {
    if (!enSet.has(placeholder)) {
      return false;
    }
  }
  
  return true;
}

/**
 * 测试翻译键 (Test translation keys)
 * @param keys 要测试的键数组 (Array of keys to test)
 * @param language 语言 (Language)
 */
function testKeys(keys: string[], language: string) {
  console.log(`\n=== 测试 ${language} 翻译 (Testing ${language} translation) ===`);
  
  for (const key of keys) {
    try {
      const translated = t(key);
      console.log(`Key: ${key}`);
      console.log(`Translation: ${translated}`);
      console.log('---');
    } catch (error) {
      console.error(`Error translating key: ${key}`);
      console.error(error);
      console.log('---');
    }
  }
}

/**
 * 测试日志函数 (Test log function)
 * @param keys 要测试的键数组 (Array of keys to test)
 * @param component 组件名称 (Component name)
 */
function testLogFunction(keys: string[], component: string) {
  console.log(`\n=== 测试日志函数 (Testing log function) ===`);
  
  for (const key of keys) {
    try {
      log(key, true, {}, component);
    } catch (error) {
      console.error(`Error logging key: ${key}`);
      console.error(error);
    }
  }
}

/**
 * 测试带参数的翻译 (Test translation with parameters)
 * @param keys 要测试的键数组 (Array of keys to test)
 * @param params 参数对象 (Parameters object)
 */
function testWithParams(keys: string[], params: Record<string, any>) {
  console.log(`\n=== 测试带参数的翻译 (Testing translation with parameters) ===`);
  
  for (const key of keys) {
    try {
      const translated = t(key, params);
      console.log(`Key: ${key}`);
      console.log(`Params: ${JSON.stringify(params)}`);
      console.log(`Translation: ${translated}`);
      console.log('---');
    } catch (error) {
      console.error(`Error translating key with params: ${key}`);
      console.error(error);
      console.log('---');
    }
  }
}

/**
 * 测试翻译缓存 (Test translation cache)
 * @param key 要测试的键 (Key to test)
 * @param iterations 迭代次数 (Number of iterations)
 */
function testTranslationCache(key: string, iterations: number) {
  console.log(`\n=== 测试翻译缓存 (Testing translation cache) ===`);
  
  console.log(`Key: ${key}`);
  console.log(`Iterations: ${iterations}`);
  
  try {
    // 清除翻译缓存 (Clear translation cache)
    clearTranslationCache();
    
    // 测试不使用缓存的性能 (Test performance without cache)
    console.log('Without cache:');
    const startWithoutCache = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      t(key);
    }
    
    const endWithoutCache = Date.now();
    console.log(`Time: ${endWithoutCache - startWithoutCache}ms`);
    
    // 测试使用缓存的性能 (Test performance with cache)
    console.log('With cache:');
    const startWithCache = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      log(key, true, {}, COMPONENTS.SERVER);
    }
    
    const endWithCache = Date.now();
    console.log(`Time: ${endWithCache - startWithCache}ms`);
  } catch (error) {
    console.error('Error testing translation cache:');
    console.error(error);
  }
  
  console.log('---');
}

/**
 * 设置环境变量 (Set environment variable)
 * @param name 环境变量名称 (Environment variable name)
 * @param value 环境变量值 (Environment variable value)
 */
function setEnv(name: string, value: string) {
  process.env[name] = value;
  console.log(`Set environment variable ${name}=${value}`);
}

/**
 * 生成测试报告 (Generate test report)
 * @param report 报告对象 (Report object)
 * @param reportPath 报告文件路径 (Report file path)
 */
function generateReport(report: any, reportPath: string) {
  try {
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n✅ 测试报告已生成: ${reportPath} (Test report generated: ${reportPath})`);
  } catch (error) {
    console.error(`\n❌ 生成测试报告失败 (Failed to generate test report):`, error);
  }
}

/**
 * 检查所有键是否都有中英文对应 (Check if all keys have both English and Chinese translations)
 * @param config 测试配置 (Test configuration)
 */
function checkAllKeysHaveTranslations(config: TestConfig) {
  console.log('\n=== 检查所有键是否都有中英文对应 (Check if all keys have both English and Chinese translations) ===');
  
  try {
    // 获取所有键 (Get all keys)
    const allKeys = getAllKeysFromModules();
    console.log(`总计找到 ${allKeys.length} 个键 (Total keys found: ${allKeys.length})`);
    
    // 检查结果 (Check results)
    const missingTranslations: { key: string; languages: string[] }[] = [];
    const emptyTranslations: { key: string; languages: string[] }[] = [];
    const placeholderMismatches: { key: string; enValue: string; zhValue: string }[] = [];
    
    // 检查每个键 (Check each key)
    for (const key of allKeys) {
      // 检查缺失的翻译 (Check missing translations)
      const missingLanguages: string[] = [];
      
      // 获取翻译值 (Get translation values)
      const enValue = getTranslationValue(key, enTranslation);
      const zhValue = getTranslationValue(key, zhTranslation);
      
      // 检查英文翻译 (Check English translation)
      if (enValue === undefined) {
        missingLanguages.push('en');
      }
      
      // 检查中文翻译 (Check Chinese translation)
      if (zhValue === undefined) {
        missingLanguages.push('zh');
      }
      
      if (missingLanguages.length > 0) {
        missingTranslations.push({ key, languages: missingLanguages });
      }
      
      // 如果两种语言的翻译都存在，进行进一步检查 (If translations for both languages exist, perform further checks)
      if (enValue !== undefined && zhValue !== undefined) {
        // 检查空值 (Check empty values)
        if (config.checkEmptyValues) {
          const emptyLanguages: string[] = [];
          
          if (enValue === '') {
            emptyLanguages.push('en');
          }
          
          if (zhValue === '') {
            emptyLanguages.push('zh');
          }
          
          if (emptyLanguages.length > 0) {
            emptyTranslations.push({ key, languages: emptyLanguages });
          }
        }
        
        // 检查占位符 (Check placeholders)
        if (config.checkPlaceholders && typeof enValue === 'string' && typeof zhValue === 'string') {
          if (!checkPlaceholdersMatch(key, enValue, zhValue)) {
            placeholderMismatches.push({ key, enValue, zhValue });
          }
        }
      }
    }
    
    // 输出结果 (Output results)
    let hasIssues = false;
    
    // 输出缺失的翻译 (Output missing translations)
    if (missingTranslations.length > 0) {
      hasIssues = true;
      console.log(`\n❌ 发现 ${missingTranslations.length} 个键缺少翻译 (Found ${missingTranslations.length} keys missing translations)`);
      
      if (config.verbose) {
        for (const { key, languages } of missingTranslations) {
          console.log(`键 (Key): ${key}`);
          console.log(`缺少翻译 (Missing translations for): ${languages.join(', ')}`);
          console.log('---');
        }
      }
    }
    
    // 输出空值 (Output empty values)
    if (config.checkEmptyValues && emptyTranslations.length > 0) {
      hasIssues = true;
      console.log(`\n❌ 发现 ${emptyTranslations.length} 个键的翻译为空 (Found ${emptyTranslations.length} keys with empty translations)`);
      
      if (config.verbose) {
        for (const { key, languages } of emptyTranslations) {
          console.log(`键 (Key): ${key}`);
          console.log(`空值语言 (Empty value languages): ${languages.join(', ')}`);
          console.log('---');
        }
      }
    }
    
    // 输出占位符不匹配 (Output placeholder mismatches)
    if (config.checkPlaceholders && placeholderMismatches.length > 0) {
      hasIssues = true;
      console.log(`\n❌ 发现 ${placeholderMismatches.length} 个键的占位符不匹配 (Found ${placeholderMismatches.length} keys with placeholder mismatches)`);
      
      if (config.verbose) {
        for (const { key, enValue, zhValue } of placeholderMismatches) {
          console.log(`键 (Key): ${key}`);
          console.log(`英文值 (English value): ${enValue}`);
          console.log(`中文值 (Chinese value): ${zhValue}`);
          console.log(`英文占位符 (English placeholders): ${extractPlaceholders(enValue).join(', ')}`);
          console.log(`中文占位符 (Chinese placeholders): ${extractPlaceholders(zhValue).join(', ')}`);
          console.log('---');
        }
      }
    }
    
    // 如果没有问题，输出成功信息 (If no issues, output success message)
    if (!hasIssues) {
      console.log('\n✅ 所有键都有正确的中英文对应 (All keys have correct English and Chinese translations)');
    }
    
    // 生成报告 (Generate report)
    if (config.generateReport) {
      const report = {
        timestamp: new Date().toISOString(),
        totalKeys: allKeys.length,
        missingTranslations,
        emptyTranslations: config.checkEmptyValues ? emptyTranslations : [],
        placeholderMismatches: config.checkPlaceholders ? placeholderMismatches : [],
        hasIssues
      };
      
      generateReport(report, config.reportPath);
    }
    
    return {
      missingTranslations,
      emptyTranslations,
      placeholderMismatches,
      hasIssues
    };
  } catch (error) {
    console.error('\n❌ 检查翻译时出错 (Error checking translations):');
    console.error(error);
    return {
      missingTranslations: [],
      emptyTranslations: [],
      placeholderMismatches: [],
      hasIssues: true
    };
  }
}

/**
 * 主测试函数 (Main test function)
 */
async function testI18n() {
  console.log('=== 测试国际化功能 (Testing internationalization functionality) ===');
  
  try {
    // 解析命令行参数 (Parse command line arguments)
    const config = parseCommandLineArgs();
    
    // 检查所有键是否都有中英文对应 (Check if all keys have both English and Chinese translations)
    const checkResult = checkAllKeysHaveTranslations(config);
    
    // 如果不需要进行其他测试，直接返回 (If no other tests are needed, return directly)
    if (!config.testSampleKeys && !config.testCache) {
      return checkResult;
    }
    
    // 测试样例键 (Test sample keys)
    if (config.testSampleKeys) {
      // 测试简单的键 (Test simple keys)
      const simpleKeys = [
        'server.starting',
        'server.started',
        'server.stopping',
        'server.stopped'
      ];
      
      // 确保 MCP_LANG 环境变量设置为英文 (Ensure MCP_LANG environment variable is set to English)
      setEnv('MCP_LANG', 'en');
      
      // 测试英文翻译 (Test English translation)
      await changeLanguage('en');
      console.log(`Current language: ${getCurrentLanguage()}`);
      testKeys(simpleKeys, 'English');
      
      // 测试日志函数 (Test log function)
      testLogFunction(simpleKeys, COMPONENTS.SERVER);
      
      // 测试带参数的翻译 (Test translation with parameters)
      testWithParams(['server.listeningOn'], { port: 8080 });
      
      // 确保 MCP_LANG 环境变量设置为中文 (Ensure MCP_LANG environment variable is set to Chinese)
      setEnv('MCP_LANG', 'zh');
      
      // 测试中文翻译 (Test Chinese translation)
      await changeLanguage('zh');
      console.log(`Current language: ${getCurrentLanguage()}`);
      testKeys(simpleKeys, 'Chinese');
      
      // 测试日志函数 (Test log function)
      testLogFunction(simpleKeys, COMPONENTS.SERVER);
      
      // 测试带参数的翻译 (Test translation with parameters)
      testWithParams(['server.listeningOn'], { port: 8080 });
    }
    
    // 测试翻译缓存 (Test translation cache)
    if (config.testCache) {
      testTranslationCache('server.starting', 10);
    }
    
    // 返回检查结果 (Return check result)
    return checkResult;
  } catch (error) {
    console.error('测试过程中出错 (Error during testing):');
    console.error(error);
    return {
      missingTranslations: [],
      emptyTranslations: [],
      placeholderMismatches: [],
      hasIssues: true
    };
  }
}

// 运行测试 (Run test)
testI18n().catch(error => {
  console.error('运行测试时出错 (Error running test):');
  console.error(error);
  process.exit(1);
}); 