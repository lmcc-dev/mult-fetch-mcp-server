/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 国际化键类型定义 (Internationalization key type definitions)
 * 用于提供类型安全和自动补全 (Used to provide type safety and auto-completion)
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
const createKeyGenerator = (module: string) => (key: string): string => `${module}.${key}`;

/**
 * 创建资源操作键 - 用于生成资源操作相关的键 (Create resource operation keys - for generating resource operation related keys)
 * @param module 模块名称 (Module name)
 * @param operation 操作名称 (Operation name)
 * @returns 资源操作键对象 (Resource operation keys object)
 */
const createResourceOperationKeys = (module: string, operation: string): ResourceOperationKeys => {
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
const createResourceKeys = (module: string): ResourcesKeys => {
  return {
    list: createResourceOperationKeys(module, 'list'),
    get: createResourceOperationKeys(module, 'get'),
    create: createResourceOperationKeys(module, 'create'),
    update: createResourceOperationKeys(module, 'update'),
    delete: createResourceOperationKeys(module, 'delete')
  };
};

/**
 * 获取器相关键 (Fetcher related keys)
 */
export const FETCHER_KEYS = (() => {
  const keyGen = createKeyGenerator('fetcher');
  return {
    // 延迟相关 (Delay related)
    addingDelay: keyGen('addingDelay'),
    delayCompleted: keyGen('delayCompleted'),
    
    // 代理相关 (Proxy related)
    usingProxy: keyGen('usingProxy'),
    usingSpecifiedProxy: keyGen('usingSpecifiedProxy'),
    attemptingToUseSystemProxy: keyGen('attemptingToUseSystemProxy'),
    notUsingProxy: keyGen('notUsingProxy'),
    finalProxyUsed: keyGen('finalProxyUsed'),
    noProxy: keyGen('noProxy'),
    usingHttpsProxy: keyGen('usingHttpsProxy'),
    usingHttpProxy: keyGen('usingHttpProxy'),
    
    // 请求相关 (Request related)
    fetchingUrl: keyGen('fetchingUrl'),
    usingUserAgent: keyGen('usingUserAgent'),
    requestOptions: keyGen('requestOptions'),
    startingFetch: keyGen('startingFetch'),
    fetchCompleted: keyGen('fetchCompleted'),
    
    // 响应相关 (Response related)
    responseStatus: keyGen('responseStatus'),
    redirectingTo: keyGen('redirectingTo'),
    constructedFullRedirectUrl: keyGen('constructedFullRedirectUrl'),
    requestSuccess: keyGen('requestSuccess'),
    
    // 错误相关 (Error related)
    errorResponse: keyGen('errorResponse'),
    errorResponseBody: keyGen('errorResponseBody'),
    errorReadingBody: keyGen('errorReadingBody'),
    fetchError: keyGen('fetchError'),
    requestAborted: keyGen('requestAborted'),
    networkError: keyGen('networkError'),
    requestTimeout: keyGen('requestTimeout'),
    fetchFailed: keyGen('fetchFailed'),
    tooManyRedirects: keyGen('tooManyRedirects'),
    
    // 内容类型相关 (Content type related)
    startingHtmlFetch: keyGen('startingHtmlFetch'),
    readingText: keyGen('readingText'),
    htmlContentLength: keyGen('htmlContentLength'),
    startingJsonFetch: keyGen('startingJsonFetch'),
    parsingJson: keyGen('parsingJson'),
    jsonParsed: keyGen('jsonParsed'),
    jsonParseError: keyGen('jsonParseError'),
    startingTxtFetch: keyGen('startingTxtFetch'),
    textContentLength: keyGen('textContentLength'),
    startingMarkdownFetch: keyGen('startingMarkdownFetch'),
    creatingTurndown: keyGen('creatingTurndown'),
    convertingToMarkdown: keyGen('convertingToMarkdown'),
    markdownContentLength: keyGen('markdownContentLength'),
    
    // 系统代理相关 (System proxy related)
    checkingProxyEnv: keyGen('checkingProxyEnv'),
    envVarValue: keyGen('envVarValue'),
    foundSystemProxy: keyGen('foundSystemProxy'),
    systemCommandProxySettings: keyGen('systemCommandProxySettings'),
    foundProxyFromCommand: keyGen('foundProxyFromCommand'),
    errorGettingProxyFromCommand: keyGen('errorGettingProxyFromCommand'),
    checkingSystemEnvVars: keyGen('checkingSystemEnvVars'),
    windowsEnvVars: keyGen('windowsEnvVars'),
    foundWindowsEnvProxy: keyGen('foundWindowsEnvProxy'),
    errorGettingWindowsEnvVars: keyGen('errorGettingWindowsEnvVars'),
    unixEnvVars: keyGen('unixEnvVars'),
    foundUnixEnvProxy: keyGen('foundUnixEnvProxy'),
    errorGettingUnixEnvVars: keyGen('errorGettingUnixEnvVars'),
    errorGettingSystemEnvVars: keyGen('errorGettingSystemEnvVars'),
    noSystemProxyFound: keyGen('noSystemProxyFound'),
    
    // 通用 (General)
    notSet: keyGen('notSet'),
    debug: keyGen('debug'),
    none: keyGen('none')
  } as const;
})();

/**
 * 浏览器相关键 (Browser related keys)
 */
export const BROWSER_KEYS = (() => {
  const keyGen = createKeyGenerator('browser');
  return {
    // 浏览器生命周期 (Browser lifecycle)
    closing: keyGen('closing'),
    closed: keyGen('closed'),
    starting: keyGen('starting'),
    startingFailed: keyGen('startingFailed'),
    alreadyRunning: keyGen('alreadyRunning'),
    
    // 页面操作 (Page operations)
    creatingPage: keyGen('creatingPage'),
    navigatingTo: keyGen('navigatingTo'),
    waitingForSelector: keyGen('waitingForSelector'),
    waitingForTimeout: keyGen('waitingForTimeout'),
    scrollingToBottom: keyGen('scrollingToBottom'),
    gettingContent: keyGen('gettingContent'),
    contentLength: keyGen('contentLength'),
    
    // Cookie 相关 (Cookie related)
    savingCookies: keyGen('savingCookies'),
    cookiesSaved: keyGen('cookiesSaved'),
    loadingCookies: keyGen('loadingCookies'),
    cookiesLoaded: keyGen('cookiesLoaded'),
    noCookiesFound: keyGen('noCookiesFound'),
    
    // 错误相关 (Error related)
    errorLoadingCookies: keyGen('errorLoadingCookies'),
    errorSavingCookies: keyGen('errorSavingCookies'),
    errorNavigating: keyGen('errorNavigating'),
    errorGettingContent: keyGen('errorGettingContent'),
    errorClosingBrowser: keyGen('errorClosingBrowser'),
    errorCreatingPage: keyGen('errorCreatingPage'),
    closingError: keyGen('closingError'),
    
    // 额外的浏览器相关键 (Additional browser related keys)
    waiting: keyGen('waiting'),
    startupSuccess: keyGen('startupSuccess'),
    navigating: keyGen('navigating'),
    scrolling: keyGen('scrolling'),
    scrollCompleted: keyGen('scrollCompleted'),
    contentTruncated: keyGen('contentTruncated'),
    pageClosed: keyGen('pageClosed'),
    fetchError: keyGen('fetchError'),
    highMemory: keyGen('highMemory'),
    closingDueToMemory: keyGen('closingDueToMemory'),
    forcingGC: keyGen('forcingGC'),
    memoryCheckError: keyGen('memoryCheckError'),
    usingCookies: keyGen('usingCookies'),
    usingProxy: keyGen('usingProxy'),
    
    // Cloudflare 相关 (Cloudflare related)
    checkingCloudflare: keyGen('checkingCloudflare'),
    cloudflareDetected: keyGen('cloudflareDetected'),
    simulatingHuman: keyGen('simulatingHuman'),
    simulatingHumanError: keyGen('simulatingHumanError'),
    stillOnCloudflare: keyGen('stillOnCloudflare'),
    bypassFailed: keyGen('bypassFailed'),
    cloudflareError: keyGen('cloudflareError'),
    continuingWithoutBypass: keyGen('continuingWithoutBypass'),
    unableToBypassCloudflare: keyGen('unableToBypassCloudflare'),
    
    // 获取和重试相关 (Fetch and retry related)
    fetchingWithRetry: keyGen('fetchingWithRetry'),
    memoryUsage: keyGen('memoryUsage'),
    memoryTooHigh: keyGen('memoryTooHigh'),
    contentTooLarge: keyGen('contentTooLarge'),
    failedToParseJSON: keyGen('failedToParseJSON'),
    startingBrowserFetchForMarkdown: keyGen('startingBrowserFetchForMarkdown'),
    errorInBrowserFetchForMarkdown: keyGen('errorInBrowserFetchForMarkdown'),
    fetchRequest: keyGen('fetchRequest'),
    usingStoredCookies: keyGen('usingStoredCookies'),
    closingInstance: keyGen('closingInstance'),
    fetchErrorWithAttempt: keyGen('fetchErrorWithAttempt'),
    retryingAfterDelay: keyGen('retryingAfterDelay'),
    
    // 浏览器启动相关 (Browser startup related)
    browserStartupSuccess: keyGen('browserStartupSuccess'),
    browserStartupFailed: keyGen('browserStartupFailed'),
    usingCustomChromePath: keyGen('usingCustomChromePath'),
    browserDisconnected: keyGen('browserDisconnected'),
    waitingForBrowserStart: keyGen('waitingForBrowserStart'),
    reusingExistingBrowser: keyGen('reusingExistingBrowser'),
    startingBrowser: keyGen('startingBrowser'),
    browserStarted: keyGen('browserStarted'),
    browserStartError: keyGen('browserStartError')
  } as const;
})();

/**
 * 资源相关键 (Resources related keys)
 */
export const RESOURCES_KEYS = (() => {
  const keyGen = createKeyGenerator('resources');
  const resourceKeys = createResourceKeys('resources');
  
  return {
    ...resourceKeys,
    // 额外的资源相关键 (Additional resource related keys)
    fileReadError: keyGen('fileReadError'),
    invalidUri: keyGen('invalidUri'),
    notFound: keyGen('notFound'),
    
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

/**
 * 服务器相关键 (Server related keys)
 */
export const SERVER_KEYS = (() => {
  const keyGen = createKeyGenerator('server');
  return {
    // 服务器状态相关 (Server status related)
    starting: keyGen('starting'),
    started: keyGen('started'),
    stopping: keyGen('stopping'),
    stopped: keyGen('stopped'),
    error: keyGen('error'),
    
    // 连接相关 (Connection related)
    connecting: keyGen('connecting'),
    connected: keyGen('connected'),
    connectionError: keyGen('connectionError'),
    disconnected: keyGen('disconnected'),
    
    // 请求处理相关 (Request handling related)
    requestReceived: keyGen('requestReceived'),
    requestProcessed: keyGen('requestProcessed'),
    requestError: keyGen('requestError'),
    
    // 浏览器相关 (Browser related)
    browser: {
      initializing: keyGen('browser.initializing'),
      initialized: keyGen('browser.initialized'),
      error: keyGen('browser.error'),
      closing: keyGen('browser.closing'),
      closed: keyGen('browser.closed')
    },
    
    // 工具相关 (Tool related)
    tool: {
      requestReceived: keyGen('tool.requestReceived'),
      requestProcessed: keyGen('tool.requestProcessed'),
      requestError: keyGen('tool.requestError')
    },
    
    // 原有键 (Original keys)
    receivedRequest: keyGen('receivedRequest'),
    processingRequest: keyGen('processingRequest'),
    requestCompleted: keyGen('requestCompleted'),
    requestFailed: keyGen('requestFailed'),
    receivedInterruptSignal: keyGen('receivedInterruptSignal'),
    receivedTerminateSignal: keyGen('receivedTerminateSignal'),
    uncaughtException: keyGen('uncaughtException'),
    debug: keyGen('debug'),
    listeningOn: keyGen('listeningOn'),
    
    // 新增的翻译键 (New translation keys)
    initializingBrowser: keyGen('initializingBrowser'),
    closingBrowser: keyGen('closingBrowser'),
    receivedToolRequest: keyGen('receivedToolRequest'),
    processingToolRequestError: keyGen('processingToolRequestError'),
    usingBrowserMode: keyGen('usingBrowserMode'),
    usingAutoDetectMode: keyGen('usingAutoDetectMode'),
    switchingToBrowserMode: keyGen('switchingToBrowserMode'),
    fetchError: keyGen('fetchError')
  } as const;
})();

/**
 * 客户端相关键 (Client related keys)
 */
export const CLIENT_KEYS = (() => {
  const keyGen = createKeyGenerator('client');
  return {
    connecting: keyGen('connecting'),
    connected: keyGen('connected'),
    disconnecting: keyGen('disconnecting'),
    disconnected: keyGen('disconnected'),
    error: keyGen('error'),
    callTool: keyGen('callTool'),
    callToolSuccess: keyGen('callToolSuccess'),
    callToolError: keyGen('callToolError'),
    statusCodeDetected: keyGen('statusCodeDetected'),
    usageInfo: keyGen('usageInfo'),
    exampleUsage: keyGen('exampleUsage'),
    invalidJson: keyGen('invalidJson'),
    usingCommandLineProxy: keyGen('usingCommandLineProxy'),
    invalidProxyFormat: keyGen('invalidProxyFormat'),
    usingEnvProxy: keyGen('usingEnvProxy'),
    usingShellProxy: keyGen('usingShellProxy'),
    noShellProxy: keyGen('noShellProxy'),
    systemProxyDisabled: keyGen('systemProxyDisabled'),
    usingSystemProxy: keyGen('usingSystemProxy'),
    noSystemProxy: keyGen('noSystemProxy'),
    requestFailed: keyGen('requestFailed'),
    fatalError: keyGen('fatalError'),
    startingServer: keyGen('startingServer'),
    fetchingUrl: keyGen('fetchingUrl'),
    usingMode: keyGen('usingMode'),
    fetchFailed: keyGen('fetchFailed'),
    fetchSuccess: keyGen('fetchSuccess'),
    browserModeNeeded: keyGen('browserModeNeeded'),
    retryingWithBrowser: keyGen('retryingWithBrowser'),
    browserModeFetchFailed: keyGen('browserModeFetchFailed'),
    browserModeFetchSuccess: keyGen('browserModeFetchSuccess'),
    serverClosed: keyGen('serverClosed'),
    proxySet: keyGen('proxySet')
  } as const;
})();

/**
 * 错误相关键 (Error related keys)
 */
export const ERROR_KEYS = (() => {
  const keyGen = createKeyGenerator('error');
  return {
    unexpected: keyGen('unexpected'),
    validation: keyGen('validation'),
    notFound: keyGen('notFound'),
    unauthorized: keyGen('unauthorized'),
    forbidden: keyGen('forbidden'),
    timeout: keyGen('timeout'),
    
    // 通用错误消息 (Common error messages)
    missingUrl: keyGen('missingUrl'),
    invalidUrl: keyGen('invalidUrl'),
    networkError: keyGen('networkError'),
    browserError: keyGen('browserError'),
    unexpectedError: keyGen('unexpectedError'),
    cloudflareProtection: keyGen('cloudflareProtection'),
    captchaRequired: keyGen('captchaRequired'),
    connectionProblem: keyGen('connectionProblem')
  } as const;
})();

/**
 * 工具相关键 (Tools related keys)
 */
export const TOOLS_KEYS = (() => {
  const keyGen = createKeyGenerator('tools');
  return {
    fetchHtml: {
      description: keyGen('fetchHtml.description'),
      error: keyGen('fetchHtml.error')
    },
    fetchJson: {
      description: keyGen('fetchJson.description'),
      error: keyGen('fetchJson.error'),
      invalidJson: keyGen('fetchJson.invalidJson')
    },
    fetchTxt: {
      description: keyGen('fetchTxt.description'),
      error: keyGen('fetchTxt.error')
    },
    fetchMarkdown: {
      description: keyGen('fetchMarkdown.description'),
      error: keyGen('fetchMarkdown.error')
    }
  } as const;
})();

/**
 * 提示相关键 (Prompts related keys)
 */
export const PROMPTS_KEYS = (() => {
  const keyGen = createKeyGenerator('prompts');
  return {
    // 提示列表和获取 (Prompt list and get)
    list: {
      request: keyGen('list.request')
    },
    get: {
      request: keyGen('get.request')
    },
    
    // 错误消息 (Error messages)
    notFound: keyGen('notFound'),
    missingRequiredArg: keyGen('missingRequiredArg'),
    useBrowserValue: keyGen('useBrowserValue'),
    
    // 通用提示 (Generic prompt)
    generic: {
      result: keyGen('generic.result'),
      message: keyGen('generic.message'),
      args: keyGen('generic.args')
    },
    
    // 是/否 (Yes/No)
    yes: keyGen('yes'),
    no: keyGen('no'),
    
    // 提示描述和参数 (Prompt descriptions and parameters)
    url: {
      description: keyGen('url.description')
    },
    format: {
      description: keyGen('format.description')
    },
    useBrowser: {
      description: keyGen('useBrowser.description')
    },
    selector: {
      description: keyGen('selector.description')
    },
    dataType: {
      description: keyGen('dataType.description')
    },
    error: {
      description: keyGen('error.description')
    },
    
    // 获取网站提示 (Fetch website prompt)
    fetchWebsite: {
      description: keyGen('fetchWebsite.description'),
      result: keyGen('fetchWebsite.result'),
      message: keyGen('fetchWebsite.message'),
      response: keyGen('fetchWebsite.response'),
      instruction: keyGen('fetchWebsite.instruction'),
      formatInstruction: keyGen('fetchWebsite.formatInstruction'),
      browserInstruction: keyGen('fetchWebsite.browserInstruction')
    },
    
    // 提取内容提示 (Extract content prompt)
    extractContent: {
      description: keyGen('extractContent.description'),
      result: keyGen('extractContent.result'),
      message: keyGen('extractContent.message'),
      selectorInstruction: keyGen('extractContent.selectorInstruction'),
      dataTypeInstruction: keyGen('extractContent.dataTypeInstruction')
    },
    
    // 调试获取提示 (Debug fetch prompt)
    debugFetch: {
      description: keyGen('debugFetch.description'),
      result: keyGen('debugFetch.result'),
      message: keyGen('debugFetch.message'),
      errorDetails: keyGen('debugFetch.errorDetails'),
      instruction: keyGen('debugFetch.instruction')
    }
  } as const;
})();

/**
 * 节点相关键 (Node related keys)
 */
export const NODE_KEYS = (() => {
  const keyGen = createKeyGenerator('node');
  return {
    // 延迟和代理相关 (Delay and proxy related)
    addingDelay: keyGen('addingDelay'),
    noProxy: keyGen('noProxy'),
    usingProxy: keyGen('usingProxy'),
    usingHttpsProxy: keyGen('usingHttpsProxy'),
    usingHttpProxy: keyGen('usingHttpProxy'),
    
    // 请求相关 (Request related)
    usingUserAgent: keyGen('usingUserAgent'),
    requestDetails: keyGen('requestDetails'),
    requestOptions: keyGen('requestOptions'),
    startingFetch: keyGen('startingFetch'),
    fetchingUrl: keyGen('fetchingUrl'),
    
    // 响应相关 (Response related)
    responseStatus: keyGen('responseStatus'),
    redirectingTo: keyGen('redirectingTo'),
    constructedFullRedirectUrl: keyGen('constructedFullRedirectUrl'),
    requestSuccess: keyGen('requestSuccess'),
    
    // 错误相关 (Error related)
    errorResponse: keyGen('errorResponse'),
    errorResponseBody: keyGen('errorResponseBody'),
    errorReadingBody: keyGen('errorReadingBody'),
    fetchError: keyGen('fetchError'),
    requestAborted: keyGen('requestAborted'),
    networkError: keyGen('networkError'),
    tooManyRedirects: keyGen('tooManyRedirects'),
    
    // 内容类型相关 (Content type related)
    startingHtmlFetch: keyGen('startingHtmlFetch'),
    readingText: keyGen('readingText'),
    htmlContentLength: keyGen('htmlContentLength'),
    htmlFetchError: keyGen('htmlFetchError'),
    startingJsonFetch: keyGen('startingJsonFetch'),
    parsingJson: keyGen('parsingJson'),
    jsonParsed: keyGen('jsonParsed'),
    jsonParseError: keyGen('jsonParseError'),
    jsonFetchError: keyGen('jsonFetchError'),
    startingTxtFetch: keyGen('startingTxtFetch'),
    startingMarkdownFetch: keyGen('startingMarkdownFetch'),
    creatingTurndown: keyGen('creatingTurndown'),
    convertingToMarkdown: keyGen('convertingToMarkdown')
  } as const;
})(); 