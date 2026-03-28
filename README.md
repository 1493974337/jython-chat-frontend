# Jython AI聊天前端

这是一个基于Vue 3 + TypeScript的聊天前端应用，用于与jython-helper后端进行长对话。该应用实现了现代化的聊天界面，支持流式响应、对话历史管理和会话持久化。

## 项目概述

- **前端技术栈**: Vue 3 + TypeScript + Vite + Pinia + Vue Router
- **UI风格**: 现代化响应式设计，支持桌面和移动端
- **通信方式**: REST API + Server-Sent Events (SSE) 流式响应
- **主要功能**: 实时聊天、流式消息显示、会话管理、对话历史保持

## 功能特性

### 1. 聊天功能
- **实时对话**: 与Jython AI助手进行自然语言对话
- **流式响应**: 支持Server-Sent Events (SSE) 流式消息显示，实时显示AI思考过程
- **对话历史**: 基于会话ID保持对话上下文，支持多轮对话
- **消息格式化**: 自动换行、时间戳显示、角色标识

### 2. 会话管理
- **会话持久化**: 每个会话拥有独立ID，保持对话历史
- **会话切换**: 支持创建新会话，清空当前对话历史
- **会话ID复制**: 一键复制会话ID，便于调试和共享

### 3. 用户体验
- **响应式设计**: 适配各种屏幕尺寸
- **键盘快捷键**: Enter发送消息，Shift+Enter换行
- **加载状态**: 发送消息时显示加载指示器
- **错误处理**: 网络错误友好提示

### 4. 开发支持
- **TypeScript支持**: 完整的类型定义
- **组合式API**: 使用Vue 3组合式函数封装业务逻辑
- **环境配置**: 支持不同环境的后端地址配置

## 项目结构

```
src/
├── components/           # 可复用组件
├── composables/         # 组合式函数
│   └── useChatApi.ts   # 聊天API封装
├── types/              # TypeScript类型定义
│   └── chat.ts        # 聊天相关类型
├── views/              # 页面组件
│   ├── ChatView.vue   # 聊天主页面
│   ├── HomeView.vue   # 首页
│   └── AboutView.vue  # 关于页面
├── router/            # 路由配置
│   └── index.ts
├── stores/            # 状态管理(Pinia)
├── assets/            # 静态资源
└── App.vue            # 根组件
```

## 快速开始

### 环境要求
- Node.js 18+ 或 20+
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```
应用将在 `http://localhost:5173` 启动。

### 生产环境构建
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 配置说明

### 环境变量
创建 `.env.development` 文件配置开发环境：
```
VITE_API_BASE_URL=http://localhost:8080
```

创建 `.env.production` 文件配置生产环境：
```
VITE_API_BASE_URL=https://your-production-api.com
```

### 后端接口
前端默认调用以下后端接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/conversation/chat` | POST | 普通聊天接口 |
| `/api/conversation/chat/stream` | POST | 流式聊天接口 |
| `/test` | GET | 连接测试接口 |

请求格式：
```json
{
  "message": "用户消息",
  "sessionId": "可选的会话ID"
}
```

响应格式：
```json
{
  "response": "AI回复",
  "sessionId": "会话ID"
}
```

## 技术实现细节

### 1. 流式消息处理
使用Server-Sent Events (SSE) 协议接收流式响应：
- 通过`fetch API`发送POST请求
- 使用`TextDecoder`解析二进制流
- 按SSE格式解析`data:`字段
- 实时更新UI显示部分结果

### 2. 状态管理
- 使用Vue 3的ref和reactive管理组件状态
- 使用组合式函数`useChatApi`封装所有API调用
- 会话ID通过ref管理，自动持久化

### 3. 响应式设计
- CSS Flexbox布局
- 媒体查询适配移动端
- 动态消息气泡样式

### 4. 类型安全
- 完整的TypeScript类型定义
- 接口请求/响应类型检查
- 组件Props类型约束

## 与后端集成

### jython-helper后端
本前端设计为与`jython-helper` Spring Boot后端配合使用，该后端基于：
- Spring Boot 3.4.2
- LangChain4j 1.12.1
- DeepSeek API (或OpenAI)

### 接口适配
前端已适配后端的以下接口：
1. **长对话接口**: 支持会话ID保持对话历史
2. **流式响应接口**: 实时显示AI回复
3. **错误处理**: 统一错误响应格式

### 跨域处理
开发时需要配置后端允许跨域请求，或通过代理解决。

## 开发指南

### 添加新功能
1. 在`types/chat.ts`中添加类型定义
2. 在`composables/useChatApi.ts`中添加API方法
3. 创建或修改Vue组件
4. 更新路由配置（如需要）

### 样式定制
- 使用CSS变量统一主题色
- 组件样式使用`scoped`限定作用域
- 响应式断点：768px (平板)、1024px (桌面)

### 代码规范
- 使用ESLint + Prettier保持代码风格一致
- 组件使用`<script setup>`语法
- 组合式函数命名以`use`开头

## 常见问题

### 1. 连接后端失败
- 检查后端服务是否运行
- 确认`VITE_API_BASE_URL`配置正确
- 查看浏览器控制台网络请求

### 2. 流式消息不显示
- 确认后端支持SSE协议
- 检查响应头`Content-Type: text/event-stream`
- 验证SSE数据格式是否正确

### 3. 会话ID不保持
- 检查本地存储是否被清除
- 确认每次请求都携带相同sessionId
- 验证后端ChatMemory配置

## 部署说明

### 静态文件部署
构建后的文件位于`dist/`目录，可直接部署到：
- Nginx / Apache
- GitHub Pages
- Vercel / Netlify

### Docker部署
可创建Dockerfile进行容器化部署。

## 许可证
MIT License

## 贡献指南
欢迎提交Issue和Pull Request。

---

*此项目为jython-helper AI系统的前端界面，专为Jython编程助手设计。*

## 原模板说明（保留）

This template should help get you started developing with Vue 3 in Vite.

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

### Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

### Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### Project Setup

```sh
npm install
```

#### Compile and Hot-Reload for Development

```sh
npm run dev
```

#### Type-Check, Compile and Minify for Production

```sh
npm run build
```

#### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```