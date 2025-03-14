/**
* Author: Martin <lmccc.dev@gmail.com>  
* Co-Author: AI Assistant (Claude)
* Description: This code was collaboratively developed by Martin and AI Assistant.
*/

import { createKeyGenerator } from './base.js';

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