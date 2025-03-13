/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

/**
 * 共享的国际化键结构 (Shared internationalization key structure)
 * 用于避免在不同语言文件中重复相同的键结构 (Used to avoid repeating the same key structure in different language files)
 */

/**
 * 获取器相关键 (Fetcher related keys)
 */
export const FETCHER_KEYS = {
  addingDelay: 'fetcher.addingDelay',
  delayCompleted: 'fetcher.delayCompleted',
  usingProxy: 'fetcher.usingProxy',
  usingSpecifiedProxy: 'fetcher.usingSpecifiedProxy',
  attemptingToUseSystemProxy: 'fetcher.attemptingToUseSystemProxy',
  notUsingProxy: 'fetcher.notUsingProxy',
  finalProxyUsed: 'fetcher.finalProxyUsed',
  noProxy: 'fetcher.noProxy',
  fetchingUrl: 'fetcher.fetchingUrl',
  usingUserAgent: 'fetcher.usingUserAgent',
  usingHttpsProxy: 'fetcher.usingHttpsProxy',
  usingHttpProxy: 'fetcher.usingHttpProxy',
  requestOptions: 'fetcher.requestOptions',
  startingFetch: 'fetcher.startingFetch',
  fetchCompleted: 'fetcher.fetchCompleted',
  responseStatus: 'fetcher.responseStatus',
  redirectingTo: 'fetcher.redirectingTo',
  constructedFullRedirectUrl: 'fetcher.constructedFullRedirectUrl',
  requestSuccess: 'fetcher.requestSuccess',
  errorResponse: 'fetcher.errorResponse',
  errorResponseBody: 'fetcher.errorResponseBody',
  errorReadingBody: 'fetcher.errorReadingBody',
  fetchError: 'fetcher.fetchError',
  requestAborted: 'fetcher.requestAborted',
  networkError: 'fetcher.networkError',
  requestTimeout: 'fetcher.requestTimeout',
  fetchFailed: 'fetcher.fetchFailed',
  tooManyRedirects: 'fetcher.tooManyRedirects',
  startingHtmlFetch: 'fetcher.startingHtmlFetch',
  readingText: 'fetcher.readingText',
  htmlContentLength: 'fetcher.htmlContentLength',
  startingJsonFetch: 'fetcher.startingJsonFetch',
  parsingJson: 'fetcher.parsingJson',
  jsonParsed: 'fetcher.jsonParsed',
  jsonParseError: 'fetcher.jsonParseError',
  startingTxtFetch: 'fetcher.startingTxtFetch',
  textContentLength: 'fetcher.textContentLength',
  startingMarkdownFetch: 'fetcher.startingMarkdownFetch',
  creatingTurndown: 'fetcher.creatingTurndown',
  convertingToMarkdown: 'fetcher.convertingToMarkdown',
  markdownContentLength: 'fetcher.markdownContentLength',
  checkingProxyEnv: 'fetcher.checkingProxyEnv',
  envVarValue: 'fetcher.envVarValue',
  foundSystemProxy: 'fetcher.foundSystemProxy',
  systemCommandProxySettings: 'fetcher.systemCommandProxySettings',
  foundProxyFromCommand: 'fetcher.foundProxyFromCommand',
  errorGettingProxyFromCommand: 'fetcher.errorGettingProxyFromCommand',
  checkingSystemEnvVars: 'fetcher.checkingSystemEnvVars',
  windowsEnvVars: 'fetcher.windowsEnvVars',
  foundWindowsEnvProxy: 'fetcher.foundWindowsEnvProxy',
  errorGettingWindowsEnvVars: 'fetcher.errorGettingWindowsEnvVars',
  unixEnvVars: 'fetcher.unixEnvVars',
  foundUnixEnvProxy: 'fetcher.foundUnixEnvProxy',
  errorGettingUnixEnvVars: 'fetcher.errorGettingUnixEnvVars',
  errorGettingSystemEnvVars: 'fetcher.errorGettingSystemEnvVars',
  noSystemProxyFound: 'fetcher.noSystemProxyFound',
  notSet: 'fetcher.notSet',
  debug: 'fetcher.debug',
  none: 'fetcher.none'
};

/**
 * 浏览器相关键 (Browser related keys)
 */
export const BROWSER_KEYS = {
  closing: 'browser.closing',
  closed: 'browser.closed',
  starting: 'browser.starting',
  startingFailed: 'browser.startingFailed',
  alreadyRunning: 'browser.alreadyRunning',
  creatingPage: 'browser.creatingPage',
  navigatingTo: 'browser.navigatingTo',
  waitingForSelector: 'browser.waitingForSelector',
  waitingForTimeout: 'browser.waitingForTimeout',
  scrollingToBottom: 'browser.scrollingToBottom',
  gettingContent: 'browser.gettingContent',
  contentLength: 'browser.contentLength',
  savingCookies: 'browser.savingCookies',
  cookiesSaved: 'browser.cookiesSaved',
  loadingCookies: 'browser.loadingCookies',
  cookiesLoaded: 'browser.cookiesLoaded',
  noCookiesFound: 'browser.noCookiesFound',
  errorLoadingCookies: 'browser.errorLoadingCookies',
  errorSavingCookies: 'browser.errorSavingCookies',
  errorNavigating: 'browser.errorNavigating',
  errorGettingContent: 'browser.errorGettingContent',
  errorClosingBrowser: 'browser.errorClosingBrowser',
  errorCreatingPage: 'browser.errorCreatingPage'
};

/**
 * 资源相关键 (Resources related keys)
 */
export const RESOURCES_KEYS = {
  list: {
    request: 'resources.list.request',
    success: 'resources.list.success',
    error: 'resources.list.error'
  },
  get: {
    request: 'resources.get.request',
    success: 'resources.get.success',
    error: 'resources.get.error',
    notFound: 'resources.get.notFound'
  },
  create: {
    request: 'resources.create.request',
    success: 'resources.create.success',
    error: 'resources.create.error',
    duplicate: 'resources.create.duplicate'
  },
  update: {
    request: 'resources.update.request',
    success: 'resources.update.success',
    error: 'resources.update.error',
    notFound: 'resources.update.notFound'
  },
  delete: {
    request: 'resources.delete.request',
    success: 'resources.delete.success',
    error: 'resources.delete.error',
    notFound: 'resources.delete.notFound'
  }
}; 