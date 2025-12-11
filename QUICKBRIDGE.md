# QuickBridge - 跨设备数据传输 Chrome 扩展

QuickBridge 是一个简单易用的跨设备数据传输工具，支持文本和文件（最大 20MB）的快速分享，无需注册登录。

## ✨ 特性

- 🚀 **极度简单** - 无需注册，无需登录，打开即用
- 📱 **跨平台** - 支持任意设备，手机、电脑、平板都可以
- 🔗 **地址系统** - 随机生成或自定义地址（5位以上）
- 📝 **文本传输** - 快速分享文本内容
- 📁 **文件传输** - 支持最大 20MB 的文件上传下载
- 📲 **二维码** - 扫码快速访问
- 🔄 **实时同步** - 3秒轮询，实时更新数据
- 🎨 **现代界面** - 基于 React + Tailwind CSS

## 🏗️ 项目结构

```
chrome-extension-QuickBridge/
├── backend/                    # Node.js 后端服务
│   ├── src/
│   │   ├── controllers/       # 控制器
│   │   ├── services/          # 业务逻辑
│   │   ├── routes/            # 路由
│   │   ├── middleware/        # 中间件
│   │   └── config/            # 配置
│   └── package.json
├── packages/
│   └── sync-service/          # 同步服务包
│       ├── lib/
│       │   ├── api/           # API 客户端
│       │   ├── storage/       # Chrome Storage 封装
│       │   ├── types/         # TypeScript 类型
│       │   └── utils/         # 工具函数
│       └── package.json
└── pages/
    └── side-panel/            # Side Panel 界面
        ├── src/
        │   ├── components/    # React 组件
        │   ├── hooks/         # 自定义 Hooks
        │   └── SidePanel.tsx
        └── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装后端依赖
cd backend
pnpm install
```

### 2. 配置环境变量

**后端配置：**

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，配置 Redis 等信息
```

**扩展配置：**

```bash
# 在项目根目录
cp .example.env .env
# 编辑 .env 文件，配置 API 地址
```

### 3. 启动 Redis

```bash
# macOS (使用 Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:latest
```

### 4. 启动后端服务

```bash
cd backend
pnpm dev
```

后端将在 `http://localhost:3000` 启动

### 5. 启动扩展开发模式

```bash
# 在项目根目录
pnpm dev
```

### 6. 加载扩展到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

## 📖 使用方法

### 发送端（设备 A）

1. 点击 Chrome 扩展图标，打开 Side Panel
2. 点击"生成随机地址"或创建自定义地址
3. 系统会显示二维码和地址
4. 输入文本或上传文件
5. 等待接收端访问

### 接收端（设备 B）

1. 打开 Side Panel
2. 扫描二维码或手动输入地址
3. 点击"加入地址"
4. 查看文本或下载文件

## 🛠️ 技术栈

### 后端
- Node.js + TypeScript
- Express.js
- Redis (数据存储)
- Multer (文件上传)
- Zod (数据验证)

### Chrome 扩展
- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS
- Chrome Extension Manifest V3

## 📦 构建生产版本

### 构建后端

```bash
cd backend
pnpm build
pnpm start
```

### 构建扩展

```bash
pnpm build
```

构建产物在 `dist` 目录

## 🔒 安全特性

- 速率限制（防止滥用）
- CORS 配置
- 文件大小限制（20MB）
- 输入验证（Zod）
- 地址碰撞防护
- 数据自动过期（24小时不活跃）

## 🌐 API 端点

### 地址管理
- `POST /api/v1/address/random` - 生成随机地址
- `POST /api/v1/address/custom` - 创建自定义地址
- `GET /api/v1/address/:address/status` - 检查地址状态

### 数据操作
- `POST /api/v1/data/:address/text` - 上传文本
- `GET /api/v1/data/:address/text` - 获取文本
- `POST /api/v1/data/:address/file` - 上传文件
- `GET /api/v1/data/:address/file/:id` - 下载文件
- `GET /api/v1/data/:address/list` - 列出所有数据
- `DELETE /api/v1/data/:address` - 删除所有数据

## 📝 开发说明

### 添加新功能

1. 后端：在 `backend/src/` 中添加相应的 service、controller 和 route
2. 扩展：在 `packages/sync-service/lib/api/` 中添加 API 调用
3. UI：在 `pages/side-panel/src/components/` 中添加组件

### 调试

- 后端：查看终端日志
- 扩展：打开 Chrome DevTools，查看 Console 和 Network

## 🚀 部署

### 后端部署

推荐使用 Docker + Nginx：

```bash
cd backend
docker build -t quickbridge-backend .
docker run -d -p 3000:3000 --env-file .env quickbridge-backend
```

配置 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name sync.ulises.cn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 扩展发布

1. 构建生产版本：`pnpm build`
2. 打包 `dist` 目录为 zip
3. 上传到 [Chrome Web Store](https://chrome.google.com/webstore/developer/dashboard)

## 🎯 实现的功能清单

### 后端 ✅
- [x] Express + TypeScript 项目结构
- [x] Redis 数据存储
- [x] 地址生成和验证服务
- [x] 文本数据 API
- [x] 文件上传/下载 API (Multer)
- [x] 速率限制中间件
- [x] 错误处理中间件
- [x] CORS 配置
- [x] 数据清理服务

### Chrome 扩展 ✅
- [x] @extension/sync-service 包
- [x] API 客户端封装
- [x] Chrome Storage 封装
- [x] QR 码生成工具
- [x] 文件工具函数
- [x] Side Panel 主界面
- [x] 地址管理组件
- [x] QR 码显示组件
- [x] 文本传输组件
- [x] 文件上传组件
- [x] 文件列表组件
- [x] 同步 Hooks (useSyncService, usePolling)

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请通过 GitHub Issues 联系。
