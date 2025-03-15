/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// 删除未使用的国际化键 (Remove unused internationalization keys)
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义配置 (Define configuration)
interface Config {
  reportPath: string;
  verbose: boolean;
  preserveErrorKeys: boolean;
  dryRun: boolean;
}

// 默认配置 (Default configuration)
const defaultConfig: Config = {
  reportPath: path.join(__dirname, '../i18n-unused-keys-report.json'),
  verbose: false,
  preserveErrorKeys: true,
  dryRun: false
};

// 解析命令行参数 (Parse command line arguments)
function parseCommandLineArgs(): Config {
  const config = { ...defaultConfig };
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--report-path':
        if (i + 1 < args.length) {
          config.reportPath = args[++i];
        }
        break;
      case '--verbose':
        config.verbose = true;
        break;
      case '--no-preserve-error-keys':
        config.preserveErrorKeys = false;
        break;
      case '--dry-run':
        config.dryRun = true;
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
删除未使用的国际化键工具 (Remove Unused Internationalization Keys Tool)

用法: node --loader ts-node/esm tests/i18n-remove-unused-keys.ts [选项]

选项:
  --report-path <path>       指定报告文件路径 (Specify report file path)
  --verbose                  显示详细信息 (Show verbose information)
  --no-preserve-error-keys   不保留错误相关的键 (Don't preserve error-related keys)
  --dry-run                  仅显示将要删除的键，不实际删除 (Only show keys to be deleted, don't actually delete)
  --help                     显示帮助信息 (Show help information)
  `);
}

/**
 * 读取报告文件 (Read report file)
 * @param reportPath 报告文件路径 (Report file path)
 * @returns 报告数据 (Report data)
 */
function readReport(reportPath: string): any {
  try {
    const reportContent = fs.readFileSync(reportPath, 'utf-8');
    return JSON.parse(reportContent);
  } catch (error) {
    console.error(`读取报告文件时出错 (Error reading report file):`, error);
    process.exit(1);
  }
}

/**
 * 获取要删除的键 (Get keys to delete)
 * @param report 报告数据 (Report data)
 * @param config 配置 (Configuration)
 * @returns 要删除的键 (Keys to delete)
 */
function getKeysToDelete(report: any, config: Config): string[] {
  const { unusedKeys } = report;
  
  if (!unusedKeys || !Array.isArray(unusedKeys)) {
    console.error('报告中没有未使用的键 (No unused keys in report)');
    return [];
  }
  
  // 过滤要删除的键 (Filter keys to delete)
  return unusedKeys
    .map(item => item.key)
    .filter(key => {
      // 如果配置为保留错误相关的键，则跳过以 errors. 开头的键
      // (If configured to preserve error-related keys, skip keys starting with errors.)
      if (config.preserveErrorKeys && key.startsWith('errors.')) {
        if (config.verbose) {
          console.log(`保留错误相关的键: ${key} (Preserving error-related key: ${key})`);
        }
        return false;
      }
      
      return true;
    });
}

/**
 * 获取键所在的文件 (Get file containing the key)
 * @param key 键 (Key)
 * @returns 文件路径 (File path)
 */
function getKeyFile(key: string): string | null {
  const parts = key.split('.');
  if (parts.length < 1) return null;
  
  const namespace = parts[0];
  
  // 根据命名空间确定文件路径 (Determine file path based on namespace)
  const enPath = path.join(__dirname, `../src/lib/i18n/locales/en/${namespace}.ts`);
  const zhPath = path.join(__dirname, `../src/lib/i18n/locales/zh/${namespace}.ts`);
  
  // 检查文件是否存在 (Check if files exist)
  if (fs.existsSync(enPath) && fs.existsSync(zhPath)) {
    return namespace;
  }
  
  return null;
}

/**
 * 从文件中删除键 (Remove key from file)
 * @param namespace 命名空间 (Namespace)
 * @param key 键 (Key)
 * @param config 配置 (Configuration)
 */
function removeKeyFromFiles(namespace: string, key: string, config: Config): void {
  const enPath = path.join(__dirname, `../src/lib/i18n/locales/en/${namespace}.ts`);
  const zhPath = path.join(__dirname, `../src/lib/i18n/locales/zh/${namespace}.ts`);
  
  // 从英文文件中删除键 (Remove key from English file)
  removeKeyFromFile(enPath, key, config);
  
  // 从中文文件中删除键 (Remove key from Chinese file)
  removeKeyFromFile(zhPath, key, config);
}

/**
 * 从文件中删除键 (Remove key from file)
 * @param filePath 文件路径 (File path)
 * @param key 键 (Key)
 * @param config 配置 (Configuration)
 */
function removeKeyFromFile(filePath: string, key: string, config: Config): void {
  try {
    // 读取文件内容 (Read file content)
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 获取键的完整名称 (Get full key name)
    const parts = key.split('.');
    const keyName = parts.slice(1).join('.');
    
    // 构建正则表达式 (Build regular expression)
    const regex = new RegExp(`\\s*\\[.*\\.${keyName}\\]:\\s*['"].*['"],?\\n?`);
    
    // 替换内容 (Replace content)
    const newContent = content.replace(regex, '');
    
    // 如果内容没有变化，说明没有找到键 (If content hasn't changed, key wasn't found)
    if (newContent === content) {
      if (config.verbose) {
        console.log(`在文件 ${filePath} 中未找到键 ${key} (Key ${key} not found in file ${filePath})`);
      }
      return;
    }
    
    // 如果是演习模式，只显示要删除的内容 (If dry run, only show content to be deleted)
    if (config.dryRun) {
      if (config.verbose) {
        console.log(`将从文件 ${filePath} 中删除键 ${key} (Will remove key ${key} from file ${filePath})`);
      }
      return;
    }
    
    // 写入文件 (Write file)
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    if (config.verbose) {
      console.log(`已从文件 ${filePath} 中删除键 ${key} (Removed key ${key} from file ${filePath})`);
    }
  } catch (error) {
    console.error(`从文件 ${filePath} 中删除键 ${key} 时出错 (Error removing key ${key} from file ${filePath}):`, error);
  }
}

/**
 * 主函数 (Main function)
 */
async function main() {
  console.log('=== 删除未使用的国际化键 (Removing unused internationalization keys) ===');
  
  try {
    // 解析命令行参数 (Parse command line arguments)
    const config = parseCommandLineArgs();
    
    // 如果是演习模式，显示提示 (If dry run, show notice)
    if (config.dryRun) {
      console.log('演习模式：不会实际删除键 (Dry run: keys will not be actually deleted)');
    }
    
    // 读取报告 (Read report)
    const report = readReport(config.reportPath);
    
    // 获取要删除的键 (Get keys to delete)
    const keysToDelete = getKeysToDelete(report, config);
    
    console.log(`找到 ${keysToDelete.length} 个要删除的键 (Found ${keysToDelete.length} keys to delete)`);
    
    // 按命名空间分组键 (Group keys by namespace)
    const keysByNamespace: Record<string, string[]> = {};
    
    for (const key of keysToDelete) {
      const namespace = getKeyFile(key);
      
      if (namespace) {
        if (!keysByNamespace[namespace]) {
          keysByNamespace[namespace] = [];
        }
        
        keysByNamespace[namespace].push(key);
      } else {
        console.warn(`无法确定键 ${key} 所在的文件 (Cannot determine file for key ${key})`);
      }
    }
    
    // 删除键 (Delete keys)
    let totalDeleted = 0;
    
    for (const namespace in keysByNamespace) {
      const keys = keysByNamespace[namespace];
      
      console.log(`从命名空间 ${namespace} 中删除 ${keys.length} 个键 (Deleting ${keys.length} keys from namespace ${namespace})`);
      
      for (const key of keys) {
        removeKeyFromFiles(namespace, key, config);
        totalDeleted++;
      }
    }
    
    // 输出结果 (Output results)
    if (config.dryRun) {
      console.log(`演习模式：将删除 ${totalDeleted} 个键 (Dry run: would delete ${totalDeleted} keys)`);
    } else {
      console.log(`已删除 ${totalDeleted} 个键 (Deleted ${totalDeleted} keys)`);
    }
  } catch (error) {
    console.error('❌ 程序执行出错 (Error executing program):');
    console.error(error);
    process.exit(1);
  }
}

// 执行主函数 (Execute main function)
main(); 