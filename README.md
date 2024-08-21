<div align="center">
<img src="https://raw.githubusercontent.com/houjiazong/llm-alchemist/main/public/logo.svg" width="150" />
</div>

[中文 README](README.zh.md)

# LLM Alchemist

LLM Alchemist is an open-source tool designed to evaluate Large Language Models (LLMs) through prompt testing. With simple configuration, you can batch evaluate prompts and store all configurations securely in your local IndexedDB. The project is built using modern web technologies like React, TypeScript, Vite, and the OpenAI JS API, ensuring high performance and easy deployment.

## Features

- **Batch Prompt Evaluation**: Efficiently test multiple prompts with just a few clicks.
- **Secure Local Storage**: All configurations are securely stored in the browser's IndexedDB, ensuring data privacy.
- **Modern Tech Stack**: Built with Vite, React, and TypeScript, offering a fast and reliable development experience.
- **OpenAI JS API Integration**: Seamless interaction with the OpenAI API to obtain model responses.
- **Vercel Deployment**: One-click deployment to Vercel, making it easy to bring your tool online.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14.x or later)
- [pnpm](https://pnpm.io/) (recommended for package management, version 7.x or later)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/houjiazong/LLM-Alchemist.git
cd LLM-Alchemist
```

2. **Install dependencies:**

```bash
pnpm install
```

### Running the Project

1. **Copy the development proxy configuration file:**

```bash
cp example.dev.proxy.config.ts dev.proxy.config.ts
```

2. **Start the development server:**

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

The output will be located in the dist folder, ready for deployment.

## Deployment

You can deploy this project directly to Vercel by clicking the button below:

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/houjiazong/llm-alchemist&project-name=llm-alchemist&repository-name=LLM-Alchemist)

## Handling CORS Issues

After deploying the project, you may encounter Cross-Origin Resource Sharing (CORS) issues, especially when making API requests to different domains. To resolve this, ensure that the server corresponding to your BaseURL is configured to allow requests from your deployed domain.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
