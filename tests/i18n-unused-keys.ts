/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 检测未使用的国际化键 (Detect unused internationalization keys)
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { enTranslation } from '../src/lib/i18n/locales/en/index.js';
import { zhTranslation } from '../src/lib/i18n/locales/zh/index.js';
import * as allKeys from '../src/lib/i18n/keys/index.js';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义测试配置 (Define test configuration)
interface TestConfig {
  generateReport: boolean;
  reportPath: string;
  verbose: boolean;
  srcDir: string;
  excludeDirs: string[];
  fileExtensions: string[];
  preserveErrorKeys: boolean; // 是否保留错误相关的键 (Whether to preserve error-related keys)
  reportOnly: boolean; // 是否只生成报告而不执行删除 (Whether to only generate report without deletion)
}

// 默认测试配置 (Default test configuration)
const defaultConfig: TestConfig = {
  generateReport: true,
  reportPath: path.join(__dirname, '../i18n-unused-keys-report.json'),
  verbose: false,
  srcDir: path.join(__dirname, '../src'),
  excludeDirs: ['node_modules', 'dist', 'build', 'coverage'],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  preserveErrorKeys: true, // 默认保留错误相关的键 (Preserve error-related keys by default)
  reportOnly: false // 默认不只生成报告 (Don't only generate report by default)
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
      case '--verbose':
        config.verbose = true;
        break;
      case '--src-dir':
        if (i + 1 < args.length) {
          config.srcDir = args[++i];
        }
        break;
      case '--exclude-dirs':
        if (i + 1 < args.length) {
          config.excludeDirs = args[++i].split(',');
        }
        break;
      case '--file-extensions':
        if (i + 1 < args.length) {
          config.fileExtensions = args[++i].split(',');
        }
        break;
      case '--no-preserve-error-keys':
        config.preserveErrorKeys = false;
        break;
      case '--report-only':
        config.reportOnly = true;
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
未使用国际化键检测工具 (Unused Internationalization Keys Detection Tool)

用法: node --loader ts-node/esm tests/i18n-unused-keys.ts [选项]

选项:
  --no-report                不生成报告文件 (Don't generate report file)
  --report-path <path>       指定报告文件路径 (Specify report file path)
  --verbose                  显示详细信息 (Show verbose information)
  --src-dir <path>           指定源代码目录 (Specify source code directory)
  --exclude-dirs <dirs>      指定排除的目录，用逗号分隔 (Specify excluded directories, separated by commas)
  --file-extensions <exts>   指定文件扩展名，用逗号分隔 (Specify file extensions, separated by commas)
  --no-preserve-error-keys   不保留错误相关的键 (Don't preserve error-related keys)
  --report-only              只生成报告，不执行删除 (Only generate report, don't delete)
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
 * 获取项目中的所有源代码文件 (Get all source code files in the project)
 * @param config 测试配置 (Test configuration)
 * @returns 文件路径数组 (Array of file paths)
 */
async function getAllSourceFiles(config: TestConfig): Promise<string[]> {
  const { srcDir, excludeDirs, fileExtensions } = config;
  
  console.log(`查找源代码文件，目录: ${srcDir} (Finding source code files, directory: ${srcDir})`);
  
  try {
    // 使用更简单的方法查找文件 (Use a simpler method to find files)
    const allFiles: string[] = [];
    
    // 递归查找文件 (Recursively find files)
    function findFilesRecursively(dir: string) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        // 检查是否是目录 (Check if it's a directory)
        if (stat.isDirectory()) {
          // 检查是否应该排除该目录 (Check if the directory should be excluded)
          if (!excludeDirs.some(excludeDir => file === excludeDir)) {
            findFilesRecursively(filePath);
          }
        } else if (stat.isFile()) {
          // 检查文件扩展名 (Check file extension)
          const ext = path.extname(file);
          if (fileExtensions.includes(ext)) {
            allFiles.push(filePath);
          }
        }
      }
    }
    
    // 开始递归查找 (Start recursive search)
    findFilesRecursively(srcDir);
    
    console.log(`找到 ${allFiles.length} 个源代码文件 (Found ${allFiles.length} source code files)`);
    return allFiles;
  } catch (error) {
    console.error(`获取源代码文件时出错 (Error getting source code files):`, error);
    return [];
  }
}

/**
 * 检查文件中是否使用了指定的键 (Check if a key is used in a file)
 * @param filePath 文件路径 (File path)
 * @param key 键 (Key)
 * @returns 是否使用了键 (Whether the key is used)
 */
function isKeyUsedInFile(filePath: string, key: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 检查直接使用键的情况 (Check direct key usage)
    if (content.includes(`'${key}'`) || content.includes(`"${key}"`)) {
      return true;
    }
    
    // 检查使用 t 函数的情况 (Check usage with t function)
    if (content.includes(`t('${key}'`) || content.includes(`t("${key}"`)) {
      return true;
    }
    
    // 检查使用 log 函数的情况 (Check usage with log function)
    if (content.includes(`log('${key}'`) || content.includes(`log("${key}"`)) {
      return true;
    }
    
    // 检查动态生成的键名 (Check dynamically generated key names)
    const parts = key.split('.');
    if (parts.length > 1) {
      const namespace = parts[0];
      const subKey = parts.slice(1).join('.');
      
      // 检查使用模板字符串的情况 (Check usage with template strings)
      if (content.includes(`\`${namespace}.`) || content.includes(`\`\${`) && content.includes(`}.${subKey}\``)) {
        return true;
      }
      
      // 检查使用字符串拼接的情况 (Check usage with string concatenation)
      if (content.includes(`'${namespace}.' +`) || content.includes(`"${namespace}." +`) ||
          content.includes(`+ '.${subKey}'`) || content.includes(`+ ".${subKey}"`)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`读取文件 ${filePath} 时出错 (Error reading file ${filePath}):`, error);
    return false;
  }
}

/**
 * 检查键是否在任何文件中使用 (Check if a key is used in any file)
 * @param key 键 (Key)
 * @param files 文件路径数组 (Array of file paths)
 * @param config 测试配置 (Test configuration)
 * @returns 是否使用了键 (Whether the key is used)
 */
function isKeyUsed(key: string, files: string[], config: TestConfig): boolean {
  // 如果配置为保留错误相关的键，并且键以 errors. 开头，则认为它是使用的
  if (config.preserveErrorKeys && key.startsWith('errors.')) {
    if (config.verbose) {
      console.log(`保留错误相关的键: ${key} (Preserving error-related key: ${key})`);
    }
    return true;
  }
  
  for (const file of files) {
    if (isKeyUsedInFile(file, key)) {
      if (config.verbose) {
        console.log(`键 ${key} 在文件 ${file} 中使用 (Key ${key} is used in file ${file})`);
      }
      return true;
    }
  }
  
  return false;
}

/**
 * 生成报告 (Generate report)
 * @param report 报告数据 (Report data)
 * @param reportPath 报告文件路径 (Report file path)
 */
function generateReport(report: any, reportPath: string) {
  try {
    // 创建目录 (Create directory)
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 写入报告文件 (Write report file)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`报告已生成: ${reportPath} (Report generated: ${reportPath})`);
  } catch (error) {
    console.error(`生成报告时出错 (Error generating report):`, error);
  }
}

/**
 * 检查未使用的键 (Check unused keys)
 * @param config 测试配置 (Test configuration)
 */
async function checkUnusedKeys(config: TestConfig) {
  console.log('\n=== 检查未使用的国际化键 (Check unused internationalization keys) ===');
  
  try {
    // 获取所有键 (Get all keys)
    const allKeys = getAllKeysFromModules();
    console.log(`总计找到 ${allKeys.length} 个键 (Total keys found: ${allKeys.length})`);
    
    // 获取所有源代码文件 (Get all source code files)
    const files = await getAllSourceFiles(config);
    console.log(`总计找到 ${files.length} 个源代码文件 (Total source code files found: ${files.length})`);
    
    // 检查每个键是否被使用 (Check if each key is used)
    const unusedKeys: string[] = [];
    
    for (const key of allKeys) {
      if (!isKeyUsed(key, files, config)) {
        unusedKeys.push(key);
      }
    }
    
    // 输出结果 (Output results)
    if (unusedKeys.length > 0) {
      console.log(`\n❌ 发现 ${unusedKeys.length} 个未使用的键 (Found ${unusedKeys.length} unused keys)`);
      
      if (config.verbose) {
        for (const key of unusedKeys) {
          const enValue = getTranslationValue(key, enTranslation);
          const zhValue = getTranslationValue(key, zhTranslation);
          
          console.log(`键 (Key): ${key}`);
          console.log(`英文值 (English value): ${enValue}`);
          console.log(`中文值 (Chinese value): ${zhValue}`);
          console.log('---');
        }
      }
    } else {
      console.log('\n✅ 所有键都被使用 (All keys are used)');
    }
    
    // 生成报告 (Generate report)
    if (config.generateReport) {
      const report = {
        timestamp: new Date().toISOString(),
        totalKeys: allKeys.length,
        totalFiles: files.length,
        unusedKeys: unusedKeys.map(key => ({
          key,
          enValue: getTranslationValue(key, enTranslation),
          zhValue: getTranslationValue(key, zhTranslation)
        })),
        hasUnusedKeys: unusedKeys.length > 0
      };
      
      generateReport(report, config.reportPath);
    }
    
    return {
      unusedKeys,
      hasUnusedKeys: unusedKeys.length > 0
    };
  } catch (error) {
    console.error('\n❌ 检查未使用的键时出错 (Error checking unused keys):');
    console.error(error);
    return {
      unusedKeys: [],
      hasUnusedKeys: true
    };
  }
}

/**
 * 主函数 (Main function)
 */
async function main() {
  console.log('=== 检测未使用的国际化键 (Detecting unused internationalization keys) ===');
  
  try {
    // 解析命令行参数 (Parse command line arguments)
    const config = parseCommandLineArgs();
    
    // 检查是否只生成报告 (Check if only generating report)
    if (config.reportOnly) {
      console.log('只生成报告，不执行删除 (Only generating report, not deleting)');
    }
    
    // 检查未使用的键 (Check unused keys)
    const result = await checkUnusedKeys(config);
    
    // 设置退出码 (Set exit code)
    process.exit(result.hasUnusedKeys ? 1 : 0);
  } catch (error) {
    console.error('❌ 程序执行出错 (Error executing program):');
    console.error(error);
    process.exit(1);
  }
}

// 执行主函数 (Execute main function)
main(); 