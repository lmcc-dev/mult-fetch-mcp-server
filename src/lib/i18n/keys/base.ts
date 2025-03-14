/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 基础键类型 - 所有模块键的基础接口 (Base key type - base interface for all module keys)
 */
export interface BaseKeys {
  [key: string]: string;
}

/**
 * 资源操作类型 - 用于统一资源操作相关的键 (Resource operation type - for unifying resource operation related keys)
 */
export interface ResourceOperationKeys {
  request: string;
  success: string;
  error: string;
  notFound?: string;
  duplicate?: string;
}

/**
 * 资源键类型 - 用于统一资源相关的键 (Resource keys type - for unifying resource related keys)
 */
export interface ResourcesKeys {
  list: ResourceOperationKeys;
  get: ResourceOperationKeys;
  create: ResourceOperationKeys;
  update: ResourceOperationKeys;
  delete: ResourceOperationKeys;
}

/**
 * 创建键名生成器 - 用于生成特定模块的键名 (Create key name generator - for generating key names for specific modules)
 * @param module 模块名称 (Module name)
 * @returns 键名生成函数 (Key name generator function)
 */
export const createKeyGenerator = (module: string) => (key: string): string => `${module}.${key}`;

/**
 * 创建资源操作键 - 用于生成资源操作相关的键 (Create resource operation keys - for generating resource operation related keys)
 * @param module 模块名称 (Module name)
 * @param operation 操作名称 (Operation name)
 * @returns 资源操作键对象 (Resource operation keys object)
 */
export const createResourceOperationKeys = (module: string, operation: string): ResourceOperationKeys => {
  const keyGen = createKeyGenerator(`${module}.${operation}`);
  return {
    request: keyGen('request'),
    success: keyGen('success'),
    error: keyGen('error'),
    notFound: keyGen('notFound'),
    duplicate: keyGen('duplicate')
  };
};

/**
 * 创建资源键 - 用于生成资源相关的键 (Create resource keys - for generating resource related keys)
 * @param module 模块名称 (Module name)
 * @returns 资源键对象 (Resource keys object)
 */
export const createResourceKeys = (module: string): ResourcesKeys => {
  return {
    list: createResourceOperationKeys(module, 'list'),
    get: createResourceOperationKeys(module, 'get'),
    create: createResourceOperationKeys(module, 'create'),
    update: createResourceOperationKeys(module, 'update'),
    delete: createResourceOperationKeys(module, 'delete')
  };
}; 