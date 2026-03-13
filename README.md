# Twins - AI 写作风格克隆

通过 AI 克隆你独特的写作风格。上传你的过往作品，提取你的风格 DNA，生成符合你语调的内容。

**语言 / Language**: 中文 | [English](./README.en.md)

## 功能特性

- **风格 DNA 提取**：AI 分析你的写作，理解你的语调、结构、词汇和独特习惯
- **多格式支持**：通过 URL、文件上传（.txt、.md）或直接粘贴文本上传文章
- **AI 内容生成**：使用 GPT-4 或 Claude 以你的写作风格生成新内容
- **安全的 API 密钥管理**：你的 API 密钥经过加密并安全存储
- **深色主题界面**：现代化的 OpenAI 风格界面

## 技术栈

- **框架**：Next.js 15 + App Router
- **语言**：TypeScript
- **样式**：Tailwind CSS + shadcn/ui
- **认证**：NextAuth.js v5（Google、GitHub OAuth）
- **数据库**：Vercel Postgres + Drizzle ORM
- **AI**：OpenAI GPT-4 & Anthropic Claude

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 数据库（或 Vercel Postgres）
- OpenAI 或 Anthropic API 密钥

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/ZhaoYis/Twins.git
cd Twins
```

2. 安装依赖：
```bash
npm install
```

3. 设置环境变量：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 并填入你的配置值：
```env
# 数据库
POSTGRES_URL=你的 postgres 连接字符串

# NextAuth
AUTH_SECRET=你的密钥至少 32 个字符
AUTH_GOOGLE_ID=你的 Google 客户端 ID
AUTH_GOOGLE_SECRET=你的 Google 客户端密钥
AUTH_GITHUB_ID=你的 GitHub 客户端 ID
AUTH_GITHUB_SECRET=你的 GitHub 客户端密钥

# 加密
ENCRYPTION_KEY=你的 32 字节加密密钥

# 应用 URL
NEXTAUTH_URL=http://localhost:3000
```

4. 运行数据库迁移：
```bash
npm run db:push
```

5. 启动开发服务器：
```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 使用方法

1. **登录**：使用 Google 或 GitHub OAuth 登录
2. **添加 API 密钥**：前往设置页面添加你的 OpenAI 或 Anthropic API 密钥
3. **上传文章**：上传你的过往作品（至少 1 篇以获得最佳效果）
4. **提取风格 DNA**：点击"分析我的风格"创建你的风格配置
5. **生成内容**：输入主题，以你的写作风格生成内容

## 部署

此项目已配置为在 Vercel 上部署：

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 为你的域名设置 OAuth 重定向 URL
5. 部署

### 自定义域名

项目已配置为在 `twins.dsx.plus` 部署。请相应更新 OAuth 重定向 URL。

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   ├── auth/               # 认证页面
│   ├── dashboard/          # 仪表板页面
│   └── settings/           # 设置页面
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   ├── landing/            # 首页部分
│   ├── dashboard/          # 仪表板组件
│   └── shared/             # 共享组件
├── lib/
│   ├── ai/                 # AI 服务抽象
│   ├── db/                 # 数据库工具
│   └── auth/               # 认证工具
└── types/                  # TypeScript 类型
```

## 许可证

MIT

