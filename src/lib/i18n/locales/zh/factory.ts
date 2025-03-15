/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { FACTORY_KEYS } from '../../keys/factory.js';

export default {
  // 日志消息 (Log messages)
  [FACTORY_KEYS.creating_fetcher]: '正在创建 {{type}} 类型的抓取器',
  [FACTORY_KEYS.fetcher_created]: '{{type}} 抓取器创建成功',
  [FACTORY_KEYS.fetcher_creation_failed]: '创建 {{type}} 抓取器失败: {{error}}',
  [FACTORY_KEYS.invalid_fetcher_type]: '无效的抓取器类型: {{type}}',
  [FACTORY_KEYS.browser_mode_enabled]: '浏览器模式已启用',
  [FACTORY_KEYS.browser_mode_disabled]: '浏览器模式已禁用',
  [FACTORY_KEYS.using_default_mode]: '使用默认模式: {{mode}}',
  [FACTORY_KEYS.initializing]: '正在初始化抓取器工厂',
  [FACTORY_KEYS.initialization_complete]: '抓取器工厂初始化完成',
  [FACTORY_KEYS.initialization_failed]: '抓取器工厂初始化失败: {{error}}',
  [FACTORY_KEYS.auto_detecting_mode]: '正在自动检测模式',
  [FACTORY_KEYS.using_browser_mode]: '使用浏览器模式',
  [FACTORY_KEYS.using_node_mode]: '使用Node模式',
  [FACTORY_KEYS.defaultingToNodeMode]: '默认使用Node模式',
  
  // 为了向后兼容，保留旧的键 (For backward compatibility, keep the old keys)
  creating_fetcher: '正在创建 {{type}} 类型的抓取器',
  fetcher_created: '{{type}} 抓取器创建成功',
  fetcher_creation_failed: '创建 {{type}} 抓取器失败: {{error}}',
  invalid_fetcher_type: '无效的抓取器类型: {{type}}',
  browser_mode_enabled: '浏览器模式已启用',
  browser_mode_disabled: '浏览器模式已禁用',
  using_default_mode: '使用默认模式: {{mode}}',
  initializing: '正在初始化抓取器工厂',
  initialization_complete: '抓取器工厂初始化完成',
  initialization_failed: '抓取器工厂初始化失败: {{error}}',
  auto_detecting_mode: '正在自动检测模式',
  using_browser_mode: '使用浏览器模式',
  using_node_mode: '使用Node模式',
  defaulting_to_node_mode: '默认使用Node模式'
};