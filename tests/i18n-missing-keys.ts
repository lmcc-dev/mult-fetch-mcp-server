/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 检测源码中使用但未在 i18n 中定义的国际化键 (Detect internationalization keys used in source code but not defined in i18n)
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
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
  keyFunctionNames: string[];
}

// 默认测试配置 (Default test configuration)
const defaultConfig: TestConfig = {
  generateReport: true,
  reportPath: path.join(__dirname, '../i18n-missing-keys-report.json'),
  verbose: false,
  srcDir: path.join(__dirname, '../src'),
  excludeDirs: ['node_modules', 'dist', 'build', 'coverage'],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  keyFunctionNames: ['t', 'log'] // 使用国际化键的函数名 (Function names that use internationalization keys)
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
      case '--key-functions':
        if (i + 1 < args.length) {
          config.keyFunctionNames = args[++i].split(',');
        }
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
未定义国际化键检测工具 (Missing Internationalization Keys Detection Tool)

用法: node --loader ts-node/esm tests/i18n-missing-keys.ts [选项]

选项:
  --no-report                不生成报告文件 (Don't generate report file)
  --report-path <path>       指定报告文件路径 (Specify report file path)
  --verbose                  显示详细信息 (Show verbose information)
  --src-dir <path>           指定源代码目录 (Specify source code directory)
  --exclude-dirs <dirs>      指定排除的目录，用逗号分隔 (Specify excluded directories, separated by commas)
  --file-extensions <exts>   指定文件扩展名，用逗号分隔 (Specify file extensions, separated by commas)
  --key-functions <funcs>    指定使用国际化键的函数名，用逗号分隔 (Specify function names that use internationalization keys, separated by commas)
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
 * 从文件中提取国际化键 (Extract internationalization keys from a file)
 * @param filePath 文件路径 (File path)
 * @param keyFunctionNames 使用国际化键的函数名 (Function names that use internationalization keys)
 * @returns 提取的键数组 (Array of extracted keys)
 */
function extractKeysFromFile(filePath: string, keyFunctionNames: string[]): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const extractedKeys: string[] = [];
    
    // 为每个函数名创建正则表达式 (Create regular expressions for each function name)
    for (const funcName of keyFunctionNames) {
      // 匹配 funcName('key') 或 funcName("key") 格式 (Match funcName('key') or funcName("key") format)
      const singleQuoteRegex = new RegExp(`${funcName}\\s*\\(\\s*['](.*?)[']`, 'g');
      const doubleQuoteRegex = new RegExp(`${funcName}\\s*\\(\\s*["](.*?)["]`, 'g');
      
      // 查找所有匹配项 (Find all matches)
      let match;
      
      // 处理单引号匹配 (Process single quote matches)
      while ((match = singleQuoteRegex.exec(content)) !== null) {
        if (match[1] && !match[1].includes('$')) { // 排除模板字符串 (Exclude template strings)
          // 排除特殊字符 (Exclude special characters)
          if (match[1].length > 1 && !['\\n', '.', 'location'].includes(match[1])) {
            extractedKeys.push(match[1]);
          }
        }
      }
      
      // 处理双引号匹配 (Process double quote matches)
      while ((match = doubleQuoteRegex.exec(content)) !== null) {
        if (match[1] && !match[1].includes('$')) { // 排除模板字符串 (Exclude template strings)
          // 排除特殊字符 (Exclude special characters)
          if (match[1].length > 1 && !['\\n', '.', 'location'].includes(match[1])) {
            extractedKeys.push(match[1]);
          }
        }
      }
    }
    
    return extractedKeys;
  } catch (error) {
    console.error(`读取文件 ${filePath} 时出错 (Error reading file ${filePath}):`, error);
    return [];
  }
}

/**
 * 检查源码中使用但未在 i18n 中定义的键 (Check keys used in source code but not defined in i18n)
 * @param config 测试配置 (Test configuration)
 */
async function checkMissingKeys(config: TestConfig) {
  console.log('\n=== 检查未定义的国际化键 (Check missing internationalization keys) ===');
  
  try {
    // 获取所有已定义的键 (Get all defined keys)
    const definedKeys = getAllKeysFromModules();
    console.log(`总计找到 ${definedKeys.length} 个已定义的键 (Total defined keys found: ${definedKeys.length})`);
    
    // 获取所有源代码文件 (Get all source code files)
    const files = await getAllSourceFiles(config);
    console.log(`总计找到 ${files.length} 个源代码文件 (Total source code files found: ${files.length})`);
    
    // 从所有文件中提取键 (Extract keys from all files)
    const usedKeysSet = new Set<string>();
    const missingKeys: { key: string; files: string[] }[] = [];
    
    for (const file of files) {
      const extractedKeys = extractKeysFromFile(file, config.keyFunctionNames);
      
      for (const key of extractedKeys) {
        usedKeysSet.add(key);
        
        // 检查键是否已定义 (Check if the key is defined)
        if (!definedKeys.includes(key)) {
          // 查找已有的相同键记录 (Find existing record for the same key)
          const existingRecord = missingKeys.find(record => record.key === key);
          
          if (existingRecord) {
            // 添加文件到现有记录 (Add file to existing record)
            if (!existingRecord.files.includes(file)) {
              existingRecord.files.push(file);
            }
          } else {
            // 创建新记录 (Create new record)
            missingKeys.push({
              key,
              files: [file]
            });
          }
        }
      }
    }
    
    // 输出结果 (Output results)
    if (missingKeys.length > 0) {
      console.log(`\n❌ 发现 ${missingKeys.length} 个未定义的键 (Found ${missingKeys.length} missing keys)`);
      
      if (config.verbose) {
        for (const { key, files } of missingKeys) {
          console.log(`键 (Key): ${key}`);
          console.log(`文件 (Files):`);
          for (const file of files) {
            console.log(`  - ${file}`);
          }
          console.log('---');
        }
      }
    } else {
      console.log('\n✅ 所有使用的键都已定义 (All used keys are defined)');
    }
    
    // 生成报告 (Generate report)
    if (config.generateReport) {
      const report = {
        timestamp: new Date().toISOString(),
        totalDefinedKeys: definedKeys.length,
        totalUsedKeys: usedKeysSet.size,
        totalFiles: files.length,
        missingKeys: missingKeys.map(({ key, files }) => ({
          key,
          files,
          fileCount: files.length
        })),
        hasMissingKeys: missingKeys.length > 0
      };
      
      generateReport(report, config.reportPath);
    }
    
    return {
      missingKeys,
      hasMissingKeys: missingKeys.length > 0
    };
  } catch (error) {
    console.error('\n❌ 检查未定义的键时出错 (Error checking missing keys):');
    console.error(error);
    return {
      missingKeys: [],
      hasMissingKeys: true
    };
  }
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
 * 主函数 (Main function)
 */
async function main() {
  console.log('=== 检测未定义的国际化键 (Detecting missing internationalization keys) ===');
  
  try {
    // 解析命令行参数 (Parse command line arguments)
    const config = parseCommandLineArgs();
    
    // 检查未定义的键 (Check missing keys)
    const result = await checkMissingKeys(config);
    
    // 设置退出码 (Set exit code)
    process.exit(result.hasMissingKeys ? 1 : 0);
  } catch (error) {
    console.error('❌ 程序执行出错 (Error executing program):');
    console.error(error);
    process.exit(1);
  }
}

// 执行主函数 (Execute main function)
main();