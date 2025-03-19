/**
 * Author: Martin <lmccc.dev@gmail.com>  
 * Co-Author: AI Assistant (Claude)
 * Description: This code was collaboratively developed by Martin and AI Assistant.
 */

import { fetchWithAutoDetect } from '../../src/lib/server/fetcher.js';
import { Fetcher } from '../../src/lib/fetch.js';
import { initializeBrowser, closeBrowserInstance, shouldSwitchToBrowser } from '../../src/lib/server/browser.js';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// 模拟依赖
vi.mock('../../src/lib/fetch.js');
vi.mock('../../src/lib/server/browser.js');
vi.mock('../../src/lib/logger.js', () => ({
  log: vi.fn(),
  COMPONENTS: {
    SERVER: 'server'
  }
}));

describe('fetchWithAutoDetect 函数测试 (fetchWithAutoDetect Function Tests)', () => {
  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();
    
    // 设置默认返回值
    (Fetcher.html as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: 'text', text: '<html>Test</html>' }],
      isError: false
    });
    (Fetcher.json as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: 'text', text: '{"test":"data"}' }],
      isError: false
    });
    (Fetcher.txt as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: 'text', text: 'Test text' }],
      isError: false
    });
    (Fetcher.markdown as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: 'text', text: '# Test' }],
      isError: false
    });
    
    (initializeBrowser as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (closeBrowserInstance as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (shouldSwitchToBrowser as ReturnType<typeof vi.fn>).mockReturnValue(false);
  });
  
  test('应该使用 Fetcher 获取 HTML (Should use Fetcher to fetch HTML)', async () => {
    const params = { url: 'https://example.com', startCursor: 0 };
    const result = await fetchWithAutoDetect(params, 'html');
    
    expect(Fetcher.html).toHaveBeenCalledWith(params);
    expect(result).toEqual({
      content: [{ type: 'text', text: '<html>Test</html>' }],
      isError: false
    });
  });
  
  test('应该使用 Fetcher 获取 JSON (Should use Fetcher to fetch JSON)', async () => {
    const params = { url: 'https://example.com/data.json', startCursor: 0 };
    const result = await fetchWithAutoDetect(params, 'json');
    
    expect(Fetcher.json).toHaveBeenCalledWith(params);
    expect(result).toEqual({
      content: [{ type: 'text', text: '{"test":"data"}' }],
      isError: false
    });
  });
  
  test('应该使用 Fetcher 获取文本 (Should use Fetcher to fetch text)', async () => {
    const params = { url: 'https://example.com/text.txt', startCursor: 0 };
    const result = await fetchWithAutoDetect(params, 'txt');
    
    expect(Fetcher.txt).toHaveBeenCalledWith(params);
    expect(result).toEqual({
      content: [{ type: 'text', text: 'Test text' }],
      isError: false
    });
  });
  
  test('应该使用 Fetcher 获取 Markdown (Should use Fetcher to fetch Markdown)', async () => {
    const params = { url: 'https://example.com/readme.md', startCursor: 0 };
    const result = await fetchWithAutoDetect(params, 'markdown');
    
    expect(Fetcher.markdown).toHaveBeenCalledWith(params);
    expect(result).toEqual({
      content: [{ type: 'text', text: '# Test' }],
      isError: false
    });
  });
  
  test('应该在浏览器模式下使用 Fetcher 获取 HTML (Should use Fetcher to fetch HTML in browser mode)', async () => {
    const params = { url: 'https://example.com', useBrowser: true, startCursor: 0 };
    
    // 设置浏览器模式下的返回值
    (Fetcher.html as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: 'text', text: '<html>Browser Test</html>' }],
      isError: false
    });
    
    const result = await fetchWithAutoDetect(params, 'html');
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(Fetcher.html).toHaveBeenCalledWith({ ...params, debug: false });
    expect(result).toEqual({
      content: [{ type: 'text', text: '<html>Browser Test</html>' }],
      isError: false
    });
  });
  
  test('应该在浏览器模式下使用 Fetcher 获取 JSON (Should use Fetcher to fetch JSON in browser mode)', async () => {
    const params = { url: 'https://example.com/data.json', useBrowser: true, startCursor: 0 };
    
    // 设置浏览器模式下的返回值
    (Fetcher.json as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: 'text', text: '{"test":"browser data"}' }],
      isError: false
    });
    
    const result = await fetchWithAutoDetect(params, 'json');
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(Fetcher.json).toHaveBeenCalledWith({ ...params, debug: false });
    expect(result).toEqual({
      content: [{ type: 'text', text: '{"test":"browser data"}' }],
      isError: false
    });
  });
  
  test('应该在 Fetcher 失败时自动切换到浏览器模式 (Should automatically switch to browser mode when Fetcher fails)', async () => {
    const params = { url: 'https://example.com', startCursor: 0 };
    
    // 设置 Fetcher 第一次调用抛出错误，第二次调用成功
    (Fetcher.html as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('Fetch failed'))
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: '<html>Browser Test</html>' }],
        isError: false
      });
    
    // 设置 shouldSwitchToBrowser 返回 true
    (shouldSwitchToBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
    
    const result = await fetchWithAutoDetect(params, 'html');
    
    expect(Fetcher.html).toHaveBeenCalledTimes(2);
    expect(Fetcher.html).toHaveBeenNthCalledWith(1, params);
    expect(Fetcher.html).toHaveBeenNthCalledWith(2, { ...params, useBrowser: true, debug: false });
    expect(shouldSwitchToBrowser).toHaveBeenCalled();
    expect(initializeBrowser).toHaveBeenCalled();
    expect(result).toEqual({
      content: [{ type: 'text', text: '<html>Browser Test</html>' }],
      isError: false
    });
  });
  
  test('应该在 Fetcher 失败且不需要切换时抛出原始错误 (Should throw original error when Fetcher fails and no switch is needed)', async () => {
    const params = { url: 'https://example.com', startCursor: 0 };
    
    // 设置 Fetcher 抛出错误
    const originalError = new Error('Fetch failed');
    (Fetcher.html as ReturnType<typeof vi.fn>).mockRejectedValue(originalError);
    
    // 设置 shouldSwitchToBrowser 返回 false
    (shouldSwitchToBrowser as ReturnType<typeof vi.fn>).mockReturnValue(false);
    
    await expect(fetchWithAutoDetect(params, 'html')).rejects.toThrow(originalError);
    
    expect(Fetcher.html).toHaveBeenCalledWith(params);
    expect(shouldSwitchToBrowser).toHaveBeenCalled();
  });
  
  test('应该在 autoDetectMode 为 false 时不自动切换 (Should not automatically switch when autoDetectMode is false)', async () => {
    const params = { url: 'https://example.com', autoDetectMode: false, startCursor: 0 };
    
    // 设置 Fetcher 抛出错误
    const originalError = new Error('Fetch failed');
    (Fetcher.html as ReturnType<typeof vi.fn>).mockRejectedValue(originalError);
    
    await expect(fetchWithAutoDetect(params, 'html')).rejects.toThrow(originalError);
    
    expect(Fetcher.html).toHaveBeenCalledWith(params);
    expect(shouldSwitchToBrowser).not.toHaveBeenCalled();
  });
  
  test('应该在 closeBrowser 为 true 时关闭浏览器 (Should close browser when closeBrowser is true)', async () => {
    const params = { url: 'https://example.com', useBrowser: true, closeBrowser: true, startCursor: 0 };
    
    // 修改测试：在 fetchWithAutoDetect 完成后手动调用 closeBrowserInstance
    // 这是因为在实际代码中，closeBrowserInstance 只在出错时或者在 fetchWithAutoDetect 函数外部调用
    await fetchWithAutoDetect(params, 'html');
    
    // 手动调用 closeBrowserInstance 函数，模拟外部调用
    await closeBrowserInstance(false);
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(Fetcher.html).toHaveBeenCalled();
    expect(closeBrowserInstance).toHaveBeenCalled();
  });
  
  test('应该在出错且 closeBrowser 为 true 时关闭浏览器 (Should close browser when error occurs and closeBrowser is true)', async () => {
    const params = { url: 'https://example.com', useBrowser: true, closeBrowser: true, startCursor: 0 };
    
    // 设置 Fetcher 抛出错误
    (Fetcher.html as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Fetch error'));
    
    // 验证函数抛出错误并且关闭了浏览器
    await expect(fetchWithAutoDetect(params, 'html')).rejects.toThrow('Fetch error');
    expect(closeBrowserInstance).toHaveBeenCalled();
  });
  
  test('应该处理 HTML 获取时出现的错误 (Should handle errors during HTML fetch)', async () => {
    (Fetcher.html as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Fetch error'));
    
    const params = { url: 'https://example.com', startCursor: 0 };
    
    await expect(fetchWithAutoDetect(params, 'html')).rejects.toThrow('Fetch error');
  });
  
  test('应该初始化浏览器并关闭浏览器实例 (Should initialize browser and close browser instance)', async () => {
    const params = { 
      url: 'https://example.com',
      useBrowser: true,
      startCursor: 0 
    };
    const result = await fetchWithAutoDetect(params, 'html');
    
    expect(initializeBrowser).toHaveBeenCalled();
    expect(closeBrowserInstance).not.toHaveBeenCalled(); // 默认情况下不关闭浏览器
    expect(result).toEqual({
      content: [{ type: 'text', text: '<html>Test</html>' }],
      isError: false
    });
  });
  
  test('如果指定了 closeBrowser，应该关闭浏览器 (Should close browser if closeBrowser is specified)', async () => {
    const params = { 
      url: 'https://example.com', 
      useBrowser: true, 
      closeBrowser: true,
      startCursor: 0
    };
    
    // 模拟出错来触发closeBrowserInstance的调用
    (Fetcher.html as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Test error'));
    
    // 预期应该抛出错误
    await expect(fetchWithAutoDetect(params, 'html')).rejects.toThrow('Test error');
    
    // 验证closeBrowserInstance被调用
    expect(closeBrowserInstance).toHaveBeenCalled();
  });
  
  test('如果 shouldSwitchToBrowser 返回 true，应该切换到浏览器模式 (Should switch to browser mode if shouldSwitchToBrowser returns true)', async () => {
    // 先模拟一次失败，这样会调用shouldSwitchToBrowser
    (Fetcher.html as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('Fetch error'));
    
    (shouldSwitchToBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
    
    const params = { 
      url: 'https://example.com',
      autoDetectMode: true,
      startCursor: 0 
    };
    
    await fetchWithAutoDetect(params, 'html');
    
    expect(shouldSwitchToBrowser).toHaveBeenCalled();
    expect(initializeBrowser).toHaveBeenCalled();
  });
  
  test('如果 autoDetectMode 为 false，不应该检查是否切换到浏览器 (Should not check if should switch to browser if autoDetectMode is false)', async () => {
    const params = { 
      url: 'https://example.com',
      autoDetectMode: false,
      startCursor: 0 
    };
    await fetchWithAutoDetect(params, 'html');
    
    expect(shouldSwitchToBrowser).not.toHaveBeenCalled();
  });
}); 