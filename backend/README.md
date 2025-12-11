# QuickBridge Backend API

跨设备数据传输后端服务

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

### 3. 启动 Redis

确保 Redis 服务正在运行：

```bash
# macOS (使用 Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:latest
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

### 5. 构建生产版本

```bash
npm run build
npm start
```

## API 端点

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

### 健康检查

- `GET /api/v1/health` - 健康检查
- `GET /api/v1/info` - API 信息

## 技术栈

- Node.js + TypeScript
- Express.js
- Redis
- Multer (文件上传)
- Zod (数据验证)

## 安全特性

- 速率限制
- CORS 配置
- Helmet 安全头
- 文件大小限制 (20MB)
- 输入验证

## 数据保留策略

- 地址 24 小时不活跃后过期
- 最长生命周期 7 天
- 每小时自动清理过期数据
