/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant
 * Description: 按字符窗口截断并生成续传游标 / Truncate on a character window and issue a continuation cursor
 */

import { ChunkManager } from './ChunkManager.js';
import { ContentSizeManager } from './ContentSizeManager.js';
import { TemplateUtils } from './TemplateUtils.js';

/**
 * 一次内容窗口的结果 (Result of one content window)
 */
export interface ContentWindowResult {
  /** 本次返回的文本 (Text returned this call) */
  text: string;
  /** 是否被截断 (Whether the source was truncated) */
  truncated: boolean;
  /** 原文总字符数 (Total characters in the source) */
  totalChars: number;
  /** 已消费到的字符偏移（不含下一次要读的前导空白） (Character offset already consumed) */
  fetchedChars: number;
  /** 文档 ID，仅在需要续传时存在 (Document id, present only when continuation is possible) */
  chunkId?: string;
  /** 下一次调用应传入的游标 (Cursor to pass on the next call) */
  nextCursor?: string;
}

/**
 * 窗口选项 (Window options)
 */
export interface ContentWindowOptions {
  /** 本次最多返回的字符数 (Maximum characters to return) */
  maxChars?: number;
  /** 本次最多返回的 UTF-8 字节数 (Maximum UTF-8 bytes to return) */
  maxBytes?: number;
  /** 截断时是否保存全文并返回游标 (Store the full text and return a cursor when truncated) */
  enableContinuation?: boolean;
}

const CURSOR_PATTERN = /^doc:([0-9a-fA-F-]{36}):(\d+)$/;

/**
 * 在字符和字节预算内截断，并尽量落在空白边界
 * (Fit text to a character and byte budget, preferring a whitespace boundary)
 * @param content 待截断文本 (Text to fit)
 * @param maxChars 最大字符数 (Maximum characters)
 * @param maxBytes 最大字节数 (Maximum bytes)
 * @returns 截断结果 (Fitted slice)
 */
export function fitContent(
  content: string,
  maxChars: number,
  maxBytes: number
): { text: string; nextIndex: number; truncated: boolean } {
  const charBudget = Math.max(1, maxChars);
  const byteBudget = Math.max(1, maxBytes);

  if (content.length <= charBudget && Buffer.byteLength(content, 'utf8') <= byteBudget) {
    return { text: content, nextIndex: content.length, truncated: false };
  }

  let end = Math.min(content.length, charBudget);
  if (Buffer.byteLength(content.slice(0, end), 'utf8') > byteBudget) {
    let lo = 0;
    let hi = end;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (Buffer.byteLength(content.slice(0, mid), 'utf8') <= byteBudget) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    end = lo;
  }

  // 至少一个字符，避免续传卡在多字节字符上 (Always advance at least one character)
  if (end === 0) {
    end = 1;
  }

  if (end < content.length) {
    const window = Math.min(80, Math.max(0, end - 1));
    const regionStart = end - window;
    const region = content.slice(regionStart, end);
    const rel = Math.max(region.lastIndexOf('\n'), region.lastIndexOf(' '), region.lastIndexOf('\t'));
    if (rel > 0) {
      end = regionStart + rel;
    }
  }

  const text = content.slice(0, end).trimEnd();
  let nextIndex = end;
  while (nextIndex < content.length && /\s/.test(content[nextIndex])) {
    nextIndex += 1;
  }

  return {
    text,
    nextIndex,
    truncated: nextIndex < content.length
  };
}

/**
 * 为模型生成截断说明 (Build the truncation note models should follow)
 * @param result 窗口结果 (Window result)
 * @returns 附加在正文后的说明 (Note appended after the body)
 */
export function formatContinuationNote(result: ContentWindowResult): string {
  if (!result.truncated) {
    return '';
  }

  if (result.nextCursor && result.chunkId) {
    return `\n\n${TemplateUtils.SYSTEM_NOTE.START}\nResponse truncated to fit the character/byte budget. fetchedChars=${result.fetchedChars} totalChars=${result.totalChars}. To continue, call fetch again with cursor="${result.nextCursor}" (chunkId="${result.chunkId}"). Omit cursor to fetch the URL again from the start. startCursor is not required.\n${TemplateUtils.SYSTEM_NOTE.END}`;
  }

  return `\n\n${TemplateUtils.SYSTEM_NOTE.START}\nResponse truncated to fit the character/byte budget. fetchedChars=${result.fetchedChars} totalChars=${result.totalChars}. Continuation is disabled for this call.\n${TemplateUtils.SYSTEM_NOTE.END}`;
}

/**
 * 将全文装进一个窗口；超出时保存全文并给出 nextCursor
 * (Fit a document into one window and store it when the caller needs a cursor)
 * @param content 全文 (Full text)
 * @param options 窗口选项 (Window options)
 * @returns 窗口结果 (Window result)
 */
export function presentContent(content: string, options: ContentWindowOptions = {}): ContentWindowResult {
  const maxChars = options.maxChars ?? ContentSizeManager.getDefaultMaxChars();
  const maxBytes = options.maxBytes ?? ContentSizeManager.getDefaultMaxBytes();
  const fitted = fitContent(content, maxChars, maxBytes);

  if (!fitted.truncated || options.enableContinuation === false) {
    return {
      text: fitted.text,
      truncated: fitted.truncated,
      totalChars: content.length,
      fetchedChars: fitted.nextIndex
    };
  }

  const chunkId = ChunkManager.storeDocument(content);
  return {
    text: fitted.text,
    truncated: true,
    totalChars: content.length,
    fetchedChars: fitted.nextIndex,
    chunkId,
    nextCursor: `doc:${chunkId}:${fitted.nextIndex}`
  };
}

/**
 * 用上一次返回的游标继续读取 (Continue from a previously returned cursor)
 * @param cursor 续传游标 (Continuation cursor)
 * @param options 窗口选项 (Window options)
 * @returns 窗口结果；游标无效时返回 null (Window result, or null when the cursor is invalid)
 */
export function readCursor(cursor: string, options: ContentWindowOptions = {}): ContentWindowResult | null {
  const match = CURSOR_PATTERN.exec(cursor);
  if (!match) {
    return null;
  }

  const chunkId = match[1];
  const start = Number(match[2]);
  const content = ChunkManager.readDocument(chunkId);
  if (content === null || start > content.length || Number.isNaN(start)) {
    return null;
  }

  const maxChars = options.maxChars ?? ContentSizeManager.getDefaultMaxChars();
  const maxBytes = options.maxBytes ?? ContentSizeManager.getDefaultMaxBytes();
  const fitted = fitContent(content.slice(start), maxChars, maxBytes);
  const fetchedChars = start + fitted.nextIndex;

  return {
    text: fitted.text,
    truncated: fitted.truncated,
    totalChars: content.length,
    fetchedChars,
    chunkId,
    nextCursor: fitted.truncated ? `doc:${chunkId}:${fetchedChars}` : undefined
  };
}
