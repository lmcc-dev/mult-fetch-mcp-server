/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

export default {
  // Resource list errors
  list: {
    request: "Received resource list request: {params}"
  },
  // Resource read errors
  read: {
    request: "Received resource read request: {uri}",
    error: "Error reading resource: {uri}, {error}"
  },
  // File read errors
  fileReadError: "Error reading file: {filePath}, {error}",
  // Invalid URI
  invalidUri: "Invalid resource URI",
  // Resource not found
  notFound: "Resource not found",
  
  // Resource descriptions
  readme: {
    description: "Project README file, containing project overview, installation and usage instructions"
  },
  package: {
    description: "Project package configuration file, containing dependencies and script definitions"
  },
  index: {
    description: "Project entry file, containing server startup logic"
  },
  client: {
    description: "MCP client implementation, used for communicating with the server"
  },
  
  // Resource template descriptions
  sourceFile: {
    name: "Source Code File",
    description: "Access project source code files"
  },
  docFile: {
    name: "Documentation File",
    description: "Access project documentation files"
  },
  filename: {
    description: "Filename, including extension"
  }
}; 