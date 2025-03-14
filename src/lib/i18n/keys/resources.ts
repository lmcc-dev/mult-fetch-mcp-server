/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator, createResourceKeys } from './base.js';

/**
 * 资源相关键 (Resources related keys)
 */
export const RESOURCES_KEYS = (() => {
  const keyGen = createKeyGenerator('resources');
  const resourceKeys = createResourceKeys('resources');
  
  return {
    ...resourceKeys,
    // 读取操作 (Read operations)
    read: {
      request: keyGen('read.request'),
      success: keyGen('read.success'),
      error: keyGen('read.error'),
      notFound: keyGen('read.notFound')
    },
    // 额外的资源相关键 (Additional resource related keys)
    fileReadError: keyGen('fileReadError'),
    invalidUri: keyGen('invalidUri'),
    notFound: keyGen('notFound'),
    readError: keyGen('readError'),
    
    // 资源描述 (Resource descriptions)
    readme: {
      description: keyGen('readme.description')
    },
    package: {
      description: keyGen('package.description')
    },
    index: {
      description: keyGen('index.description')
    },
    client: {
      description: keyGen('client.description')
    },
    
    // 资源模板描述 (Resource template descriptions)
    sourceFile: {
      name: keyGen('sourceFile.name'),
      description: keyGen('sourceFile.description')
    },
    docFile: {
      name: keyGen('docFile.name'),
      description: keyGen('docFile.description')
    },
    filename: {
      description: keyGen('filename.description')
    }
  } as const;
})(); 