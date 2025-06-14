# 🔁 Zero Proxy

Zero Proxy is a lightweight, zero-dependency HTTP proxy server built with Node.js. It forwards incoming HTTP requests to a target backend server, with optional support for request customization, CORS headers, timeout handling, and graceful shutdown.

> ⚠️ Note: WebSocket connections are not supported in this version.

---

## 🚀 Features

- 🧭 Route and forward HTTP requests to any backend.
- 🧾 CLI support for dynamic configuration (`--target`, `--port`).
- 🎯 Preserves HTTP method and headers.
- 🔐 CORS header support (for frontend browser compatibility).
- ⏱️ Built-in timeout handling for backend requests.
- 💥 Graceful error and shutdown handling.
- 📜 Minimal logging for visibility into request flow.

---

## 📦 Requirements

- [Node.js](https://nodejs.org/) v14 or higher

---

## 🛠️ Installation

Clone this repository:

```bash
git clone https://github.com/iamayushy/zero-proxy.git
cd zero-proxy
```

## Usage

```js
npx zero-proxy --target <url> --port <port> --timeout <number>
```
