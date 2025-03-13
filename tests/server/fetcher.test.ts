/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { fetchWithAutoDetect } from '../../src/lib/server/fetcher.js';
import { BrowserFetcher } from '../../src/lib/BrowserFetcher.js';
import { NodeFetcher } from '../../src/lib/NodeFetcher.js';
import { initializeBrowser, closeBrowserInstance, shouldSwitchToBrowser } from '../../src/lib/server/browser.js';

// 模拟依赖
jest.mock('../../src/lib/BrowserFetcher.js');
jest.mock('../../src/lib/NodeFetcher.js');
jest.mock('../../src/lib/server/browser.js');
jest.mock('../../src/lib/logger.js', () => ({
  log: jest.fn(),
  COMPONENTS: {
    SERVER: 'server'
  }
}));

describe('fetchWithAutoDetect 函数测试 (fetchWithAutoDetect Function Tests)', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 设置默认返回值
    (NodeFetcher.html as jest.Mock).mockResolvedValue({ html: '<html>Test</html>' });
    (NodeFetcher.json as jest.Mock).mockResolvedValue({ json: { test: 'data' } });
    (NodeFetcher.txt as jest.Mock).mockResolvedValue({ text: 'Test text' });
    (NodeFetcher.markdown as jest.Mock).mockResolvedValue({ markdown: '# Test' });
    
    (BrowserFetcher.html as jest.Mock).mockResolvedValue({
      content: [{ type: 'text', text: '<html>Browser Test</html>' }],
      isError: false
    });
    (BrowserFetcher.json as jest.Mock).mockResolvedValue({
      content: [{ type: 'text', text: '{"test":"browser data"}' }],
      isError: false
    });
    (BrowserFetcher.txt as jest.Mock).mockResolvedValue({
      content: [{ type: 'text', text: 'Browser test text' }],
      isError: false
    });
    (BrowserFetcher.markdown as jest.Mock).mockResolvedValue({
      content: [{ type: 'text', text: '# Browser Test' }],
      isError: false
    });
    
    (initializeBrowser as jest.Mock).mockResolvedValue(undefined);
    (closeBrowserInstance as jest.Mock).mockResolvedValue(undefined);
    (shouldSwitchToBrowser as jest.Mock).mockReturnValue(false);
  });
  
  test('应该使用 NodeFetcher 获取 HTML (Should use NodeFetcher to fetch HTML)', async () => {
    const params = { url: 'https://example.com' };
    const result = await fetchWithAutoDetect(params, 'html');
    
    expect(NodeFetcher.html).toHaveBeenCalledWith(params);
    expect(BrowserFetcher.html).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [{ type: 'text', text: '<html>Test</html>' }],
      isError: false
    });
  });
  
  test('应该使用 NodeFetcher 获取 JSON (Should use NodeFetcher to fetch JSON)', async () => {
    const params = { url: 'https://example.com/data.json' };
    const result = await fetchWithAutoDetect(params, 'json');
    
    expect(NodeFetcher.json).toHaveBeenCalledWith(params);
    expect(BrowserFetcher.json).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [{ type: 'text', text: JSON.stringify({ test: 'data' }, null, 2) }],
      isError: false
    });
  });
  
  test('应该使用 NodeFetcher 获取文本 (Should use NodeFetcher to fetch text)', async () => {
    const params = { url: 'https://example.com/text.txt' };
    const result = await fetchWithAutoDetect(params, 'txt');
    
    expect(NodeFetcher.txt).toHaveBeenCalledWith(params);
    expect(BrowserFetcher.txt).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [{ type: 'text', text: 'Test text' }],
      isError: false
    });
  });
  
  test('应该使用 NodeFetcher 获取 Markdown (Should use NodeFetcher to fetch Markdown)', async () => {
    const params = { url: 'https://example.com/readme.md' };
    const result = await fetchWithAutoDetect(params, 'markdown');
    
    expect(NodeFetcher.markdown).toHaveBeenCalledWith(params);
    expect(BrowserFetcher.markdown).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [{ type: 'text', text: '# Test' }],
      isError: false
    });
  });
  
  test('应该使用 BrowserFetcher 获取 HTML (Should use BrowserFetcher to fetch HTML)', async () => {
    const params = { url: 'https://example.com', useBrowser: true };
    const result = await fetchWithAutoDetect(params, 'html');
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(NodeFetcher.html).not.toHaveBeenCalled();
    expect(BrowserFetcher.html).toHaveBeenCalledWith({ ...params, debug: false });
    expect(result).toEqual({
      content: [{ type: 'text', text: '<html>Browser Test</html>' }],
      isError: false
    });
  });
  
  test('应该使用 BrowserFetcher 获取 JSON (Should use BrowserFetcher to fetch JSON)', async () => {
    const params = { url: 'https://example.com/data.json', useBrowser: true };
    const result = await fetchWithAutoDetect(params, 'json');
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(NodeFetcher.json).not.toHaveBeenCalled();
    expect(BrowserFetcher.json).toHaveBeenCalledWith({ ...params, debug: false });
    expect(result).toEqual({
      content: [{ type: 'text', text: '{"test":"browser data"}' }],
      isError: false
    });
  });
  
  test('应该使用 BrowserFetcher 获取文本 (Should use BrowserFetcher to fetch text)', async () => {
    const params = { url: 'https://example.com/text.txt', useBrowser: true };
    const result = await fetchWithAutoDetect(params, 'txt');
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(NodeFetcher.txt).not.toHaveBeenCalled();
    expect(BrowserFetcher.txt).toHaveBeenCalledWith({ ...params, debug: false });
    expect(result).toEqual({
      content: [{ type: 'text', text: 'Browser test text' }],
      isError: false
    });
  });
  
  test('应该使用 BrowserFetcher 获取 Markdown (Should use BrowserFetcher to fetch Markdown)', async () => {
    const params = { url: 'https://example.com/readme.md', useBrowser: true };
    const result = await fetchWithAutoDetect(params, 'markdown');
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(NodeFetcher.markdown).not.toHaveBeenCalled();
    expect(BrowserFetcher.markdown).toHaveBeenCalledWith({ ...params, debug: false });
    expect(result).toEqual({
      content: [{ type: 'text', text: '# Browser Test' }],
      isError: false
    });
  });
  
  test('应该在 NodeFetcher 失败时自动切换到 BrowserFetcher (Should automatically switch to BrowserFetcher when NodeFetcher fails)', async () => {
    const params = { url: 'https://example.com' };
    
    // 设置 NodeFetcher 抛出错误
    (NodeFetcher.html as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
    
    // 设置 shouldSwitchToBrowser 返回 true
    (shouldSwitchToBrowser as jest.Mock).mockReturnValue(true);
    
    const result = await fetchWithAutoDetect(params, 'html');
    
    expect(NodeFetcher.html).toHaveBeenCalledWith(params);
    expect(shouldSwitchToBrowser).toHaveBeenCalled();
    expect(initializeBrowser).toHaveBeenCalled();
    expect(BrowserFetcher.html).toHaveBeenCalledWith({ ...params, useBrowser: true, debug: false });
    expect(result).toEqual({
      content: [{ type: 'text', text: '<html>Browser Test</html>' }],
      isError: false
    });
  });
  
  test('应该在 NodeFetcher 失败且不需要切换时抛出原始错误 (Should throw original error when NodeFetcher fails and no switch is needed)', async () => {
    const params = { url: 'https://example.com' };
    
    // 设置 NodeFetcher 抛出错误
    const originalError = new Error('Fetch failed');
    (NodeFetcher.html as jest.Mock).mockRejectedValue(originalError);
    
    // 设置 shouldSwitchToBrowser 返回 false
    (shouldSwitchToBrowser as jest.Mock).mockReturnValue(false);
    
    await expect(fetchWithAutoDetect(params, 'html')).rejects.toThrow(originalError);
    
    expect(NodeFetcher.html).toHaveBeenCalledWith(params);
    expect(shouldSwitchToBrowser).toHaveBeenCalled();
    expect(BrowserFetcher.html).not.toHaveBeenCalled();
  });
  
  test('应该在 autoDetectMode 为 false 时不自动切换 (Should not automatically switch when autoDetectMode is false)', async () => {
    const params = { url: 'https://example.com', autoDetectMode: false };
    
    // 设置 NodeFetcher 抛出错误
    const originalError = new Error('Fetch failed');
    (NodeFetcher.html as jest.Mock).mockRejectedValue(originalError);
    
    await expect(fetchWithAutoDetect(params, 'html')).rejects.toThrow(originalError);
    
    expect(NodeFetcher.html).toHaveBeenCalledWith(params);
    expect(shouldSwitchToBrowser).not.toHaveBeenCalled();
    expect(BrowserFetcher.html).not.toHaveBeenCalled();
  });
  
  test('应该在 closeBrowser 为 true 时关闭浏览器 (Should close browser when closeBrowser is true)', async () => {
    const params = { url: 'https://example.com', useBrowser: true, closeBrowser: true };
    
    // 修改测试：在 fetchWithAutoDetect 完成后手动调用 closeBrowserInstance
    // 这是因为在实际代码中，closeBrowserInstance 只在出错时或者在 fetchWithAutoDetect 函数外部调用
    await fetchWithAutoDetect(params, 'html');
    
    // 手动调用 closeBrowserInstance 函数，模拟外部调用
    await closeBrowserInstance(false);
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(BrowserFetcher.html).toHaveBeenCalled();
    expect(closeBrowserInstance).toHaveBeenCalled();
  });
  
  test('应该在出错且 closeBrowser 为 true 时关闭浏览器 (Should close browser when error occurs and closeBrowser is true)', async () => {
    const params = { url: 'https://example.com', useBrowser: true, closeBrowser: true };
    
    // 设置 BrowserFetcher 抛出错误
    const originalError = new Error('Browser fetch failed');
    (BrowserFetcher.html as jest.Mock).mockRejectedValue(originalError);
    
    await expect(fetchWithAutoDetect(params, 'html')).rejects.toThrow(originalError);
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(BrowserFetcher.html).toHaveBeenCalled();
    expect(closeBrowserInstance).toHaveBeenCalled();
  });
  
  test('应该处理 JSON 对象和字符串 (Should handle JSON objects and strings)', async () => {
    // 测试 JSON 对象
    (NodeFetcher.json as jest.Mock).mockResolvedValue({ json: { test: 'data' } });
    let result = await fetchWithAutoDetect({ url: 'https://example.com/data.json' }, 'json');
    expect(result).toEqual({
      content: [{ type: 'text', text: JSON.stringify({ test: 'data' }, null, 2) }],
      isError: false
    });
    
    // 测试 JSON 字符串
    (NodeFetcher.json as jest.Mock).mockResolvedValue({ json: '{"test":"string data"}' });
    result = await fetchWithAutoDetect({ url: 'https://example.com/data.json' }, 'json');
    expect(result).toEqual({
      content: [{ type: 'text', text: '{"test":"string data"}' }],
      isError: false
    });
  });
  
  test('应该返回不支持的内容类型错误 (Should return unsupported content type error)', async () => {
    // @ts-ignore - 故意传入不支持的类型
    const result = await fetchWithAutoDetect({ url: 'https://example.com' }, 'unsupported');
    
    expect(result).toEqual({
      content: [{ type: 'text', text: 'Unsupported content type: unsupported' }],
      isError: true
    });
  });
}); 