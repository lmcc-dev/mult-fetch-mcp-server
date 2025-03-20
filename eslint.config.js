/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // 项目基础设置
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.tmp/**',
      'temp/**',
      'tmp/**',
      'vitest.config.js',
    ],
  },
  // 使用推荐配置
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    // 自定义规则
    rules: {
      // 禁止未使用的变量 (Forbid unused variables)
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      
      // 禁止使用any类型，除非明确注释 (Forbid any type unless explicitly commented)
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // 禁止重复导入 (Forbid duplicate imports)
      'no-duplicate-imports': 'error',
      
      // 使用===而不是== (Use === instead of ==)
      'eqeqeq': ['error', 'always'],
      
      // 限制最大行长度 (Limit maximum line length)
      'max-len': ['warn', { 
        'code': 100, 
        'ignoreComments': true, 
        'ignoreUrls': true,
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true
      }],
      
      // 禁止未使用的表达式 (Forbid unused expressions)
      'no-unused-expressions': 'error',
      
      // 不允许有多个空行 (Do not allow multiple empty lines)
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }],
      
      // 需要使用分号 (Require semicolons)
      'semi': ['error', 'always'],
      
      // 要求在括号内使用一致的空格 (Require consistent spacing inside parentheses)
      'space-in-parens': ['error', 'never'],
      
      // 要求在花括号内使用一致的空格 (Require consistent spacing inside braces)
      'object-curly-spacing': ['error', 'always'],
    },
  },
  // 针对测试文件的特殊规则 (Special rules for test files)
  {
    files: ['**/*.test.ts', '**/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);