/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

export default {
  // Prompt list and get
  list: {
    request: "Received prompt list request: {params}"
  },
  get: {
    request: "Received prompt get request: {promptName}, {args}"
  },
  
  // Error messages
  notFound: "Prompt template not found",
  missingRequiredArg: "Missing required argument",
  
  // Generic prompt
  generic: {
    result: "Execute generic prompt",
    message: "Execute prompt template",
    args: "Arguments"
  },
  
  // Yes/No
  yes: "Yes",
  no: "No",
  
  // Prompt descriptions and parameters
  url: {
    description: "Website URL"
  },
  format: {
    description: "Return format, options: html, json, text, markdown"
  },
  useBrowser: {
    description: "Whether to use browser mode to fetch content"
  },
  selector: {
    description: "CSS selector for extracting specific content"
  },
  dataType: {
    description: "Type of data to extract, such as tables, lists, contact info, etc."
  },
  error: {
    description: "Error information encountered during fetching"
  },
  
  // Fetch website prompt
  fetchWebsite: {
    description: "Fetch website content",
    result: "Website content fetch result",
    message: "I want to fetch the content of a website",
    response: "I can help you fetch website content. Please provide the website URL and desired format.",
    instruction: "Please fetch the content of the following website",
    formatInstruction: "Please return the content in the following format",
    browserInstruction: "Use browser mode"
  },
  
  // Extract content prompt
  extractContent: {
    description: "Extract specific content from a website",
    result: "Content extraction result",
    message: "Please extract content from the following website",
    selectorInstruction: "Use the following CSS selector to extract content",
    dataTypeInstruction: "Extract the following type of data"
  },
  
  // Debug fetch prompt
  debugFetch: {
    description: "Debug website fetching issues",
    result: "Fetch issue debugging result",
    message: "I'm having issues fetching the following website",
    errorDetails: "Error details",
    instruction: "Please analyze possible causes and provide solutions. Consider the following points:\n1. Does the website have anti-scraping measures\n2. Is browser mode needed\n3. Are specific headers required\n4. Is redirect or cookie handling needed\n5. Does the website require JavaScript rendering"
  }
}; 