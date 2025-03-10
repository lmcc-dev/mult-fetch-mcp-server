/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

// Node获取器相关消息 (Node fetcher related messages)
export const node = {
  addingDelay: "Adding random delay...",
  noProxy: "No proxy will be used",
  usingProxy: "Using proxy: {{proxy}}",
  usingHttpsProxy: "Using HTTPS proxy agent",
  usingHttpProxy: "Using HTTP proxy agent",
  usingUserAgent: "Using User-Agent: {{userAgent}}",
  requestDetails: "Request details: URL={{url}}, Method={{method}}, Proxy={{proxy}}",
  requestOptions: "Request options: {{options}}",
  startingFetch: "Starting fetch request...",
  fetchingUrl: "Fetching URL: {{url}}",
  responseStatus: "Response status: {{status}} {{statusText}}",
  redirectingTo: "Redirecting to: {{location}}",
  constructedFullRedirectUrl: "Constructed full redirect URL: {{redirectUrl}}",
  requestSuccess: "Request successful",
  errorResponse: "Error response: {{status}} {{statusText}}",
  errorResponseBody: "Error response body (first 200 chars): {{body}}",
  errorReadingBody: "Failed to read error response body: {{error}}",
  fetchError: "Fetch error: {{error}}",
  requestAborted: "Request aborted after {{duration}}ms",
  networkError: "Network error ({{code}}), might retry with browser mode",
  tooManyRedirects: "Too many redirects ({{redirects}})",
  startingHtmlFetch: "Starting HTML fetch",
  readingText: "Got response, reading text",
  htmlContentLength: "HTML content length: {{length}} bytes",
  htmlFetchError: "HTML fetch error: {{error}}",
  startingJsonFetch: "Starting JSON fetch",
  parsingJson: "Got response, parsing JSON",
  jsonParsed: "JSON parsed successfully",
  jsonParseError: "JSON parse error: {{error}}",
  jsonFetchError: "JSON fetch error: {{error}}",
  startingTxtFetch: "Starting TXT fetch",
  startingMarkdownFetch: "Starting Markdown fetch",
  creatingTurndown: "Creating TurndownService instance",
  convertingToMarkdown: "Converting HTML to Markdown"
}; 