/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { FACTORY_KEYS } from '../../keys/factory.js';

export default {
  // 日志消息 (Log messages)
  [FACTORY_KEYS.creating_fetcher]: 'Creating fetcher of type {{type}}',
  [FACTORY_KEYS.fetcher_created]: '{{type}} fetcher created successfully',
  [FACTORY_KEYS.fetcher_creation_failed]: 'Failed to create {{type}} fetcher: {{error}}',
  [FACTORY_KEYS.invalid_fetcher_type]: 'Invalid fetcher type: {{type}}',
  [FACTORY_KEYS.browser_mode_enabled]: 'Browser mode enabled',
  [FACTORY_KEYS.browser_mode_disabled]: 'Browser mode disabled',
  [FACTORY_KEYS.using_default_mode]: 'Using default mode: {{mode}}',
  [FACTORY_KEYS.initializing]: 'Initializing fetcher factory',
  [FACTORY_KEYS.initialization_complete]: 'Fetcher factory initialization complete',
  [FACTORY_KEYS.initialization_failed]: 'Fetcher factory initialization failed: {{error}}',
  [FACTORY_KEYS.auto_detecting_mode]: 'Auto detecting mode',
  [FACTORY_KEYS.using_browser_mode]: 'Using browser mode',
  [FACTORY_KEYS.using_node_mode]: 'Using Node mode',
  [FACTORY_KEYS.defaultingToNodeMode]: 'Defaulting to Node mode',
  
  // 为了向后兼容，保留旧的键 (For backward compatibility, keep the old keys)
  creating_fetcher: 'Creating fetcher of type {{type}}',
  fetcher_created: '{{type}} fetcher created successfully',
  fetcher_creation_failed: 'Failed to create {{type}} fetcher: {{error}}',
  invalid_fetcher_type: 'Invalid fetcher type: {{type}}',
  browser_mode_enabled: 'Browser mode enabled',
  browser_mode_disabled: 'Browser mode disabled',
  using_default_mode: 'Using default mode: {{mode}}',
  initializing: 'Initializing fetcher factory',
  initialization_complete: 'Fetcher factory initialization complete',
  initialization_failed: 'Fetcher factory initialization failed: {{error}}',
  auto_detecting_mode: 'Auto detecting mode',
  using_browser_mode: 'Using browser mode',
  using_node_mode: 'Using Node mode',
  defaulting_to_node_mode: 'Defaulting to Node mode'
}; 