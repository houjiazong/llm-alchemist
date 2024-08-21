<div align="center">
<img src="https://raw.githubusercontent.com/houjiazong/llm-alchemist/main/public/logo.svg" width="150" />
</div>

[English README](README.md)

# LLM Alchemist

LLM Alchemist 是一个开源工具，旨在通过提示测试来评估大型语言模型（LLM）。通过简单的配置，您可以批量评估提示，并将所有配置安全地存储在本地的 IndexedDB 中。该项目使用现代 Web 技术构建，如 React、TypeScript、Vite 和 OpenAI JS API，性能优异且易于部署。

## 功能

- **批量提示评估**：通过简单操作高效地测试多个提示。
- **安全的本地存储**：所有配置安全地存储在浏览器的 IndexedDB 中，确保数据隐私。
- **现代技术栈**：使用 Vite、React、TypeScript 构建，提供快速可靠的开发体验。
- **OpenAI JS API 集成**：无缝与 OpenAI 的 API 交互，获取模型响应。
- **Vercel 部署支持**：一键部署至 Vercel，轻松将您的工具上线。

## 入门指南

### 先决条件

- [Node.js](https://nodejs.org/) (版本 14.x 或更高)
- [pnpm](https://pnpm.io/) (推荐用于包管理，版本 7.x 或更高)

### 安装

1. **克隆仓库：**

```bash
git clone https://github.com/houjiazong/LLM-Alchemist.git
cd LLM-Alchemist
```

2. **安装依赖项：**

```bash
pnpm install
```

### 运行项目

1. **复制开发环境转发配置文件：**

```bash
cp example.dev.proxy.config.js dev.proxy.config.js
```

2. **启动开发：**

```bash
pnpm dev
```

### 生产构建

```bash
pnpm build
```

输出将位于 dist 文件夹中，可用于部署。

## 部署

您可以通过点击下面的按钮将此项目直接部署到 Vercel：

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/houjiazong/llm-alchemist&project-name=llm-alchemist&repository-name=LLM-Alchemist)

## 生产环境处理 CORS 问题

- 项目部署后，你可能会遇到跨域资源共享 (CORS) 问题，尤其是在向其他域发出 API 请求时。要解决此问题，请确保你的 BaseURL 对应的服务器配置为允许来自您部署的域的请求。

- 你也可以通过设置环境变量`VITE_PROXY_URL`来自定义代理服务，比如：

```
VITE_PROXY_URL=https://your-proxy-url.com?target=
```

程序在运行时，会把请求的原地址追加至target参数中。

## 许可证

此项目使用 MIT 许可证。详情请参阅 LICENSE 文件。
