/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { createKeyGenerator } from './base.js';

/**
 * 工厂相关键 (Factory related keys)
 */
export const FACTORY_KEYS = (() => {
  const keyGen = createKeyGenerator('factory');
  return {
    // 日志消息 (Log messages)
    creating_fetcher: keyGen('creating_fetcher'),
    fetcher_created: keyGen('fetcher_created'),
    fetcher_creation_failed: keyGen('fetcher_creation_failed'),
    invalid_fetcher_type: keyGen('invalid_fetcher_type'),
    browser_mode_enabled: keyGen('browser_mode_enabled'),
    browser_mode_disabled: keyGen('browser_mode_disabled'),
    using_default_mode: keyGen('using_default_mode'),
    initializing: keyGen('initializing'),
    initialization_complete: keyGen('initialization_complete'),
    initialization_failed: keyGen('initialization_failed'),
    auto_detecting_mode: keyGen('auto_detecting_mode'),
    using_browser_mode: keyGen('using_browser_mode'),
    using_node_mode: keyGen('using_node_mode'),
    defaultingToNodeMode: keyGen('defaultingToNodeMode')
  } as const;
})();

// 为了向后兼容，保留旧的 FACTORY 对象 (For backward compatibility, keep the old FACTORY object)
export const FACTORY = {
  CREATING_FETCHER: 'factory.creating_fetcher',
  FETCHER_CREATED: 'factory.fetcher_created',
  FETCHER_CREATION_FAILED: 'factory.fetcher_creation_failed',
  INVALID_FETCHER_TYPE: 'factory.invalid_fetcher_type',
  BROWSER_MODE_ENABLED: 'factory.browser_mode_enabled',
  BROWSER_MODE_DISABLED: 'factory.browser_mode_disabled',
  USING_DEFAULT_MODE: 'factory.using_default_mode',
  INITIALIZING: 'factory.initializing',
  INITIALIZATION_COMPLETE: 'factory.initialization_complete',
  INITIALIZATION_FAILED: 'factory.initialization_failed',
  AUTO_DETECTING_MODE: 'factory.auto_detecting_mode',
  USING_BROWSER_MODE: 'factory.using_browser_mode',
  USING_NODE_MODE: 'factory.using_node_mode',
  DEFAULTING_TO_NODE_MODE: 'factory.defaultingToNodeMode'
}; 