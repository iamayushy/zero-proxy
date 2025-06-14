#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { URL } = require('url');

const args = process.argv.slice(2);
let targetBackend = 'http://localhost:3000';
let port = 8081;
let timeout = 10000;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' || args[i] === '-t') {
    targetBackend = args[i + 1];
    i++;
  } else if (args[i] === '--port' || args[i] === '-p') {
    port = parseInt(args[i + 1], 10);
    i++;
  }
  else if (args[i] === '--timeout' || args[i] === '-to') {
    timeout = parseInt(args[i + 1], 10);
    i++;
  }
  else if (args[i] === '--help' || args[i] === '-h') {
    console.log('Usage: zero-proxy --target <url> --port <port> --timeout 4000');
    process.exit(0);
  }
}

let parsedBackend;
try {
  parsedBackend = new URL(targetBackend);
} catch (err) {
  console.error('❌ Invalid target URL:', targetBackend);
  process.exit(1);
}



console.log('🚀 Starting Zero Proxy...');
console.log(`🔁 Forwarding requests to: ${targetBackend}`);
console.log(`🌐 Listening on: http://localhost:${port}`);
console.log('⛔ WebSocket not supported');
console.log('🔒 Press Ctrl+C to stop\n');

const server = http.createServer((req, res) => {
  const startTime = Date.now();
  console.log(`➡️  ${req.method} ${req.url}`);

  const targetUrl = new URL(req.url, targetBackend);

  const options = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: { ...req.headers }
  };

  options.headers.host = targetUrl.host;
  if (options.headers.referer) {
    const refererUrl = new URL(options.headers.referer);
    options.headers.referer = `${targetUrl.protocol}//${targetUrl.host}${refererUrl.pathname}${refererUrl.search}`;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const proxyLib = targetUrl.protocol === 'https:' ? https : http;
  const proxyReq = proxyLib.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
    proxyRes.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`✅ ${req.method} ${req.url} → ${proxyRes.statusCode} (${duration}ms)`);
    });
  });

  proxyReq.setTimeout(timeout, () => {
    console.error(`⏱️  Proxy request timed out: ${req.url}`);
    proxyReq.destroy();
    res.writeHead(504);
    res.end('Proxy timeout');
  });

  proxyReq.on('error', (error) => {
    console.error(`❌ Proxy request error: ${error.message}`);
    res.writeHead(500);
    res.end(`Proxy error: ${error.message}`);
  });

  req.pipe(proxyReq);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

server.listen(port);
