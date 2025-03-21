/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 内容提取功能多格式测试脚本 (Content extraction feature multi-format test script)
 * 测试不同格式和参数组合下的内容提取功能 (Test content extraction functionality under different formats and parameter combinations)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';

// 定义类型接口 (Define type interfaces)
interface TestParameters {
    url: string;
    startCursor: number;
    debug: boolean;
    extractContent: boolean;
    includeMetadata: boolean;
    fallbackToOriginal: boolean;
    useSystemProxy: boolean;
    proxy: string | null;
}

interface TestResult {
    method: string;
    responseData: any;
    content: string;
    contentLength: number;
    metadata: any;
    parameters: TestParameters;
    groupName: string;
}

interface ComparisonMetrics {
    lengthDiff: number;
    percentDiff: string;
    baseHasHtml: boolean;
    extractionHasHtml: boolean;
    baseUrlCount: number;
    extractionUrlCount: number;
    effectivenessSummary: string;
}

interface ComparisonResult {
    method: string;
    baseResult: TestResult;
    extractionResult: TestResult;
    comparison: ComparisonMetrics;
}

interface TestResults {
    [method: string]: {
        [group: string]: TestResult;
    };
}

// 获取当前文件的目录路径 (Get the directory path of the current file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 获取项目根目录 (Get project root directory)
const rootDir = process.cwd();

// 测试URL - 不修改 (Test URL - Do not modify)
const TEST_URL = 'https://www.bbc.com/news/articles/ceqjd11l55wo';

// 测试方法列表 (Test method list)
const TEST_METHODS: string[] = [
    'fetch_html',
    'fetch_plaintext',
    'fetch_markdown',
    'fetch_txt',
    'fetch_json'
];

// 测试参数组 (Test parameter groups)
const TEST_PARAMS: Record<string, any> = {
    // 基础参数组 - 简化参数 (Base parameter group - Simplified parameters)
    base: {
        url: TEST_URL,
        startCursor: 0,
        extractContent: false
    },

    // 内容提取参数组 - 简化参数 (Content extraction parameter group - Simplified parameters)
    extraction: {
        url: TEST_URL,
        startCursor: 0,
        extractContent: true
    },

    // 无回退参数组 - 增加必要参数 (No fallback parameter group - Add necessary parameters)
    noFallback: {
        url: TEST_URL,
        startCursor: 0,
        extractContent: true,
        fallbackToOriginal: false
    }
};

// 创建存放测试结果的目录
const TEST_RESULTS_DIR = path.join(rootDir, '.test-results');
console.log(`[信息] 测试结果将保存到: ${TEST_RESULTS_DIR}`);
if (!fs.existsSync(TEST_RESULTS_DIR)) {
    fs.mkdirSync(TEST_RESULTS_DIR);
}

/**
 * 将参数对象转换为命令行参数数组 (Convert parameter object to command line argument array)
 * @param params 参数对象 (Parameter object)
 * @returns 命令行参数数组 (Command line argument array)
 */
function paramsToCommandArgs(params: TestParameters): string[] {
    return Object.entries(params).map(([key, value]) => {
        // 处理null和undefined值 (Handle null and undefined values)
        if (value === null || value === undefined) {
            return `--${key}=null`;
        }
        // 布尔值直接转换为字符串 (Convert boolean directly to string)
        if (typeof value === 'boolean') {
            return `--${key}=${value}`;
        }
        // 其他类型保持原样 (Keep other types as is)
        return `--${key}=${value}`;
    });
}

/**
 * 运行测试 (Run test)
 * @param method 测试方法 (Test method)
 * @param groupName 参数组名称 (Parameter group name)
 * @returns 测试结果对象 (Test result object)
 */
async function runTest(method: string, groupName: string): Promise<TestResult> {
    const params = TEST_PARAMS[groupName];

    console.log(`\n=== 内容提取功能测试 [${method}] [${groupName}] ===`);
    console.log(`[URL] ${TEST_URL}`);
    console.log(`[参数] ${JSON.stringify(params, null, 2)}`);
    console.log();

    return new Promise<TestResult>((resolve, reject) => {
        // 使用shell方式运行命令，避免参数转义问题
        const paramsJson = JSON.stringify(params);
        const command = `node dist/src/client.js ${method} '${paramsJson}' --debug`;
        console.log(`[调试] 执行命令: ${command}`);

        // 使用shell选项启动子进程，传递整个命令字符串
        const child = spawn(command, [], { shell: true });

        let stdout = '';
        let stderr = '';

        // 收集输出 (Collect output)
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
            // 不再将stderr输出视为错误，改为记录日志 (Don't treat stderr output as error, record as log instead)
            console.log(`[日志] ${data.toString()}`);
        });

        // 处理完成 (Handle completion)
        child.on('close', (code) => {
            console.log(`[测试完成] 退出码: ${code}`);

            try {
                // 尝试从stdout中提取JSON对象
                // 只取大括号开始到结束的部分
                const jsonMatch = stdout.match(/\{[\s\S]*\}\s*$/);

                if (!jsonMatch) {
                    // 如果没找到合适的JSON，记录输出并返回失败
                    console.error('[解析错误] 无法在输出中找到有效的JSON对象');
                    console.error('标准输出:');
                    console.error(stdout);
                    reject(new Error('无法在输出中找到有效的JSON对象'));
                    return;
                }

                const jsonString = jsonMatch[0];
                const jsonData = JSON.parse(jsonString);

                // 提取并处理响应内容
                const content = jsonData && jsonData.content && jsonData.content[0] ? jsonData.content[0].text : '';
                const contentLength = content ? content.length : 0;

                // 保存测试结果
                const testResult: TestResult = {
                    method: method,
                    responseData: jsonData,
                    content: content,
                    contentLength: contentLength,
                    metadata: jsonData.metadata || null,
                    parameters: params,
                    groupName: groupName
                };

                // 保存结果到文件
                const resultFile = path.join(TEST_RESULTS_DIR, `${method}-${groupName}-result.json`);
                fs.writeFileSync(resultFile, JSON.stringify(testResult, null, 2));

                // 显示结果摘要
                if (!jsonData.isError) {
                    console.log(`[成功] 获取到内容 (总长度: ${contentLength} 字符)`);

                    if (jsonData.metadata) {
                        console.log(`[元数据] ${JSON.stringify(jsonData.metadata, null, 2)}`);
                    }

                    // 打印更简洁的内容预览，最多显示200个字符 (Print more concise content preview, up to 200 characters)
                    console.log('[内容预览]');
                    if (content) {
                        // 移除多余空格和换行，简化显示 (Remove excess whitespace and newlines for simplified display)
                        const previewText = content.replace(/\s+/g, ' ').trim();
                        console.log(previewText.substring(0, Math.min(200, previewText.length)) + '...');
                    } else {
                        console.log('(空内容)');
                    }

                    resolve(testResult);
                } else {
                    // 使用响应中的错误消息 (Use error message from response)
                    const errorMessage = jsonData.content && jsonData.content[0] ? jsonData.content[0].text : '未知错误';
                    console.error(`[错误] ${errorMessage}`);

                    // 对于非回退测试的错误，我们也保存结果以便分析
                    if (groupName === 'noFallback') {
                        console.log('[预期错误] 由于禁用回退，预期会出现错误');
                        resolve(testResult);
                    } else {
                        reject(new Error(errorMessage));
                    }
                }
            } catch (err) {
                console.error(`[解析错误] ${(err as Error).message}`);
                console.error('标准输出:');
                console.error(stdout);
                reject(err);
            }
        });
    });
}

/**
 * 比较测试结果 (Compare test results)
 * @param method 测试方法 (Test method)
 * @param baseResult 基础参数测试结果 (Base parameter test result)
 * @param extractionResult 内容提取参数测试结果 (Content extraction parameter test result)
 */
function compareResults(method: string, baseResult: TestResult, extractionResult: TestResult): void {
    console.log(`\n====== ${method} 参数效果对比结果 ======`);

    const baseContent = baseResult.content;
    const extractionContent = extractionResult.content;

    // 比较文本长度
    console.log(`[基础参数] 内容长度: ${baseResult.contentLength} 字符`);
    console.log(`[提取参数] 内容长度: ${extractionResult.contentLength} 字符`);

    const lengthDiff = extractionResult.contentLength - baseResult.contentLength;
    const percentDiff = baseResult.contentLength > 0 ?
        ((Math.abs(lengthDiff) / baseResult.contentLength) * 100).toFixed(2) : '0.00';

    if (lengthDiff > 0) {
        console.log(`[对比结果] 内容提取后长度增加了 ${lengthDiff} 字符 (+${percentDiff}%)`);
    } else if (lengthDiff < 0) {
        console.log(`[对比结果] 内容提取后长度减少了 ${Math.abs(lengthDiff)} 字符 (-${percentDiff}%)`);
    } else {
        console.log(`[对比结果] 内容长度没有变化`);
    }

    // 比较内容特征
    console.log("\n[内容特征对比]");
    const baseHasHtml = /<[^>]*>/.test(baseContent);
    const extractionHasHtml = /<[^>]*>/.test(extractionContent);

    console.log(`- 基础参数内容${baseHasHtml ? '包含' : '不包含'} HTML 标签`);
    console.log(`- 提取参数内容${extractionHasHtml ? '包含' : '不包含'} HTML 标签`);

    // 检查清晰度改进
    const urlCount = (content: string): number => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return (content.match(urlRegex) || []).length;
    };

    const baseUrlCount = urlCount(baseContent);
    const extractionUrlCount = urlCount(extractionContent);

    console.log(`- 基础参数内容包含 ${baseUrlCount} 个URL链接`);
    console.log(`- 提取参数内容包含 ${extractionUrlCount} 个URL链接`);

    if (extractionResult.metadata) {
        console.log("\n[元数据]");
        console.log(JSON.stringify(extractionResult.metadata, null, 2));
    }

    // 内容预览对比
    if (baseResult.contentLength > 0 && extractionResult.contentLength > 0) {
        console.log("\n[内容预览对比]");
        console.log("基础参数内容开头:");
        console.log(baseContent.substring(0, Math.min(200, baseContent.length)) + "...");
        console.log("\n提取参数内容开头:");
        console.log(extractionContent.substring(0, Math.min(200, extractionContent.length)) + "...");
    }

    // 对比后输出总结
    console.log("\n[总体评估]");
    if (extractionHasHtml && !baseHasHtml) {
        console.log("- 内容提取优化了HTML标签处理，保留了更多格式信息");
    } else if (!extractionHasHtml && baseHasHtml) {
        console.log("- 内容提取移除了HTML标签，简化了内容");
    }

    if (extractionUrlCount < baseUrlCount) {
        console.log("- 内容提取减少了URL链接，提供了更简洁的阅读体验");
    } else if (extractionUrlCount > baseUrlCount) {
        console.log("- 内容提取保留了更多URL链接，信息更完整");
    }

    if (extractionResult.metadata) {
        console.log("- 内容提取成功获取了元数据，提供了额外的页面信息");
    }

    const effectivenessSummary = lengthDiff !== 0 ||
        baseHasHtml !== extractionHasHtml ||
        baseUrlCount !== extractionUrlCount ||
        extractionResult.metadata ?
        "内容提取功能对此网页有明显效果" :
        "内容提取功能对此网页没有明显效果";
    console.log(`- 整体评估: ${effectivenessSummary}`);

    console.log("\n====== 对比结束 ======");

    // 保存比较结果
    const comparisonResult: ComparisonResult = {
        method: method,
        baseResult: baseResult,
        extractionResult: extractionResult,
        comparison: {
            lengthDiff: lengthDiff,
            percentDiff: percentDiff,
            baseHasHtml: baseHasHtml,
            extractionHasHtml: extractionHasHtml,
            baseUrlCount: baseUrlCount,
            extractionUrlCount: extractionUrlCount,
            effectivenessSummary: effectivenessSummary
        }
    };

    const comparisonFile = path.join(TEST_RESULTS_DIR, `${method}-comparison-result.json`);
    fs.writeFileSync(comparisonFile, JSON.stringify(comparisonResult, null, 2));
}

/**
 * 生成测试结果摘要 (Generate test result summary)
 * @param results 所有测试结果 (All test results)
 */
function generateSummary(results: TestResults): void {
    const summaryFile = path.join(TEST_RESULTS_DIR, 'test-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));

    console.log("\n====== 测试摘要 ======");
    console.log(`测试URL: ${TEST_URL}`);
    console.log(`测试方法: ${TEST_METHODS.join(', ')}`);
    console.log(`参数组: ${Object.keys(TEST_PARAMS).join(', ')}`);

    // 显示各个方法的内容长度对比
    console.log("\n[各格式内容长度对比]");
    const table: Record<string, Record<string, number | string>> = {};

    for (const method of TEST_METHODS) {
        table[method] = {};
        for (const group of Object.keys(TEST_PARAMS)) {
            if (results[method] && results[method][group]) {
                table[method][group] = results[method][group].contentLength;
            } else {
                table[method][group] = '未测试或失败';
            }
        }
    }

    // 格式化为表格输出
    console.log("方法 | " + Object.keys(TEST_PARAMS).join(' | '));
    console.log("-".repeat(50));

    for (const method of TEST_METHODS) {
        let row = `${method} | `;
        for (const group of Object.keys(TEST_PARAMS)) {
            row += `${table[method][group]} | `;
        }
        console.log(row);
    }

    console.log("\n[元数据支持情况]");
    for (const method of TEST_METHODS) {
        if (results[method] && results[method].extraction && results[method].extraction.metadata) {
            console.log(`- ${method}: 支持元数据`);
        } else {
            console.log(`- ${method}: 不支持元数据或测试失败`);
        }
    }

    console.log("\n[测试结论]");
    console.log("1. 各参数对内容提取的影响:");
    console.log("   - extractContent: 决定是否进行内容提取处理");
    console.log("   - includeMetadata: 决定是否在结果中包含元数据");
    console.log("   - fallbackToOriginal: 决定内容提取失败时是否回退到原始内容");

    console.log("\n2. 不同格式工具的特点:");
    console.log("   - fetch_html: 提供完整HTML结构");
    console.log("   - fetch_markdown: 提供Markdown格式内容，适合进一步处理");
    console.log("   - fetch_plaintext: 提供纯文本内容，无HTML标签");
    console.log("   - fetch_txt: 类似plaintext，但可能有不同处理");
    console.log("   - fetch_json: 用于JSON数据，不适用于一般网页内容提取");

    console.log("\n3. 内容提取效果最佳的格式:");
    let bestMethod = TEST_METHODS[0];
    let maxDiff = 0;

    for (const method of TEST_METHODS) {
        if (results[method] &&
            results[method].base &&
            results[method].extraction) {
            const diff = Math.abs(results[method].extraction.contentLength - results[method].base.contentLength);
            if (diff > maxDiff) {
                maxDiff = diff;
                bestMethod = method;
            }
        }
    }

    console.log(`   - ${bestMethod}格式表现最佳，内容提取效果最明显`);

    console.log("\n====== 摘要结束 ======");
    console.log(`\n[结果保存] 测试结果已保存至 ${TEST_RESULTS_DIR} 目录`);
}

/**
 * 运行所有测试 (Run all tests)
 */
async function runAllTests(): Promise<void> {
    const results: TestResults = {};

    try {
        // 轮询每个测试方法
        for (const method of TEST_METHODS) {
            console.log(`\n\n======= 开始测试 ${method} =======\n`);
            results[method] = {};

            // 测试各个参数组
            for (const group of Object.keys(TEST_PARAMS)) {
                try {
                    console.log(`\n--- 测试 ${method} 使用 ${group} 参数 ---`);
                    const result = await runTest(method, group);
                    results[method][group] = result;
                } catch (err) {
                    console.error(`测试 ${method} 使用 ${group} 参数失败: ${(err as Error).message}`);
                    // 继续测试其他参数组
                }
            }

            // 如果基础和提取参数都测试成功，进行比较
            if (results[method].base && results[method].extraction) {
                compareResults(method, results[method].base, results[method].extraction);
            }
        }

        // 生成测试摘要
        generateSummary(results);

        console.log("\n[测试完成] 所有测试已完成");
    } catch (err) {
        console.error(`\n[测试失败] ${(err as Error).message}`);

        // 即使有失败，也生成部分摘要
        if (Object.keys(results).length > 0) {
            generateSummary(results);
        }

        process.exit(1);
    }
}

// 执行测试 (Execute tests)
runAllTests(); 