/*
 * Author: Martin <lmccc.dev@gmail.com>
 * Co-Author: AI Assistant
 * Description: Pin outbound HTTP(S) sockets to validated addresses so a later DNS reply cannot retarget the connection. / 将出站 HTTP(S) 连接固定到已校验地址，避免后续 DNS 应答把连接改到内网。
 */

import http from 'http';
import https from 'https';
import net from 'net';
import tls from 'tls';
import type { ValidatedAddress } from '../../utils/UrlValidator.js';

interface ConnectOptions {
  host?: string;
  servername?: string;
  family?: number;
  [key: string]: unknown;
}

/**
 * 从请求选项中取出 TLS SNI 主机名 (Resolve the TLS SNI hostname from request options)
 */
function resolveServername(options: ConnectOptions): string | undefined {
  if (options.servername) {
    return options.servername;
  }

  const host = options.host ? String(options.host) : '';
  const bareHost = host.replace(/^\[|\]$/g, '');
  if (host && !net.isIP(bareHost)) {
    return host;
  }

  return undefined;
}

/**
 * 创建绑定到已校验地址的 HTTP(S) Agent
 * (Create an HTTP(S) agent pinned to an already validated address)
 * Node 的 Agent 类型没有公开 createConnection，运行时该方法存在，因此在边界处收窄断言。
 * (Agent typings omit createConnection even though the runtime method exists.)
 */
export function createPinnedAgent(requestUrl: string, addresses: ValidatedAddress[]): http.Agent {
  const target = addresses[0];
  if (!target) {
    throw new Error('No validated address available for pinned connection');
  }

  const isHttps = new URL(requestUrl).protocol === 'https:';
  const agent = isHttps ? new https.Agent() : new http.Agent();

  const connect = (options: ConnectOptions, callback?: () => void) => {
    const nextOptions: ConnectOptions = {
      ...options,
      host: target.address,
      family: target.family,
    };

    if (isHttps) {
      nextOptions.servername = resolveServername(options);
      return tls.connect(nextOptions as unknown as tls.ConnectionOptions, callback);
    }

    return net.connect(nextOptions as unknown as net.NetConnectOpts, callback);
  };

  (agent as http.Agent & { createConnection: typeof connect }).createConnection = connect;
  return agent;
}
