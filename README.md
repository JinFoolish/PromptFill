<div align="center">

# SparkPrompt

[中文](#-sparkprompt---中文介绍) | [English](#-sparkprompt---english-introduction)

</div>

---

<a name="-sparkprompt---中文介绍"></a>
## ✨ SparkPrompt - 中文介绍

SparkPrompt 是一款现代化的桌面端提示词（Prompt）管理与生图应用。它旨在帮助用户高效地创建、管理和复用复杂的 AI 绘画提示词，并直接集成主流 AI 绘画模型进行创作。

### 核心功能 (Features)

#### 1. 📝 智能提示词管理
*   **模板系统**：创建和保存常用的提示词模板。
*   **变量替换**：支持在模板中嵌入变量（如 `{风格}`, `{主体}`），生成时动态替换。
*   **分类管理**：通过 Category（分类）和 Bank（词库）管理不同的变量，构建结构化的提示词库。

#### 2. 🎨 AI 生图集成
直接在应用内调用强大的 AI 模型生成图像，支持以下服务：
*   **Aliyun DashScope (通义万相)**
    *   支持模型：`z-image-turbo`, `wan2.6-t2i`, `qwen-image-max`
*   **Google Nanobanana (Gemini)**
    *   支持模型：`gemini-2.5-flash-image`, `gemini-3-pro-image-preview`
    *   支持设置 API Key 进行调用。

#### 3. 🖼️ 历史记录与画廊
*   **生成历史**：自动保存所有的生成记录，包含图片、完整的提示词参数。
*   **画廊视图**：通过瀑布流形式浏览生成的作品。

#### 4. 🛠️ 现代化 UI/UX
*   **极简设计**：基于 "Minimalist Studio" 设计美学，黑白单色调搭配精细的交互动画。
*   **流畅体验**：使用 Framer Motion 实现丝滑的 UI 动效。
*   **响应式布局**：基于 Radix UI 和 Tailwind CSS 构建。

### 技术栈 (Tech Stack)

*   **Runtime**: [Bun](https://bun.sh/)
*   **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Radix UI
*   **Backend**: Go (Golang), [Wails](https://wails.io/)

### 快速开始 (Getting Started)

#### 前置要求
*   [Go](https://go.dev/) (>= 1.21)
*   [Bun](https://bun.sh/) (>= 1.0)
*   [Wails CLI](https://wails.io/docs/gettingstarted/installation)

#### 安装与运行

1.  **克隆项目**
    ```bash
    git clone https://github.com/your-username/SparkPrompt.git
    cd SparkPrompt
    ```

2.  **安装前端依赖**
    ```bash
    cd frontend
    bun install
    ```

3.  **运行开发环境**
    回到项目根目录：
    ```bash
    wails dev
    ```

4.  **构建应用**
    ```bash
    wails build
    ```

---

<a name="-sparkprompt---english-introduction"></a>
## ✨ SparkPrompt - English Introduction

SparkPrompt is a modern desktop application for AI prompt management and image generation. It is designed to help users efficiently create, manage, and reuse complex AI image generation prompts, integrating directly with mainstream AI models.

### Key Features

#### 1. 📝 Smart Prompt Management
*   **Template System**: Create and save frequently used prompt templates.
*   **Variable Replacement**: Support embedding variables in templates (e.g., `{Style}`, `{Subject}`) for dynamic replacement during generation.
*   **Category Management**: Manage variables via Categories and Banks to build a structured prompt library.

#### 2. 🎨 AI Image Generation Integration
Directly invoke powerful AI models within the app for image creation:
*   **Aliyun DashScope**
    *   Supported models: `z-image-turbo`, `wan2.6-t2i`, `qwen-image-max`
*   **Google Nanobanana (Gemini)**
    *   Supported models: `gemini-2.5-flash-image`, `gemini-3-pro-image-preview`
    *   Supports custom API Key configuration.

#### 3. �️ History & Gallery
*   **Generation History**: Automatically saves all generation records, including images and full prompt parameters.
*   **Gallery View**: Browse generated works in a waterfall layout.

#### 4. 🛠️ Modern UI/UX
*   **Minimalist Design**: Based on "Minimalist Studio" aesthetics, featuring a monochrome palette with precise interactive animations.
*   **Fluid Experience**: Silky smooth UI animations powered by Framer Motion.
*   **Responsive Layout**: Built with Radix UI and Tailwind CSS.

### Tech Stack

*   **Runtime**: [Bun](https://bun.sh/)
*   **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Radix UI
*   **Backend**: Go (Golang), [Wails](https://wails.io/)

### Getting Started

#### Prerequisites
*   [Go](https://go.dev/) (>= 1.21)
*   [Bun](https://bun.sh/) (>= 1.0)
*   [Wails CLI](https://wails.io/docs/gettingstarted/installation)

#### Installation & Run

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/SparkPrompt.git
    cd SparkPrompt
    ```

2.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    bun install
    ```

3.  **Run Development Environment**
    Return to the project root:
    ```bash
    wails dev
    ```

4.  **Build Application**
    ```bash
    wails build
    ```

## ⚙️ Configuration

You can configure API Keys for AI services in the settings:

1.  Go to the **Settings** page.
2.  Find the **AI Providers** section.
3.  Enter your **Aliyun DashScope API Key** or **Google Gemini API Key**.
4.  Save and start generating images.
