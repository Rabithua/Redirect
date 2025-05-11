# Redirect Proxy

本项目是一个基于 Deno 的 HTTP 代理服务器，将本地请求（如 `localhost:3000`）转发到指定的 OpenAI API 或其他目标地址。

## 特性

- 支持所有 HTTP 方法
- 自动转发请求头和请求体
- 支持 CORS
- 详细日志输出

## 使用方法

1. 安装 [Deno](https://deno.com/manual/getting_started/installation)
2. 设置环境变量：

   ```sh
   export PORT=3000
   export TARGET_URL=https://api.openai.com
   ```

3. 启动代理服务器：

   ```sh
   deno run --allow-net --allow-env main.ts
   ```

4. 现在你可以通过 `http://localhost:3000` 访问并自动转发到 `TARGET_URL`。

## 环境变量

- `PORT`：本地监听端口（如 3000）
- `TARGET_URL`：目标 API 地址（如 `https://api.openai.com`）

## 日志

每次请求会在控制台输出详细信息，包括方法、路径、查询参数、来源、目标和请求体等。

## 许可

MIT License
