# QuickBridge 简化部署指南

只需要 Docker 和 Docker Compose，其他的（Nginx、SSL）你自己配置。

## 📋 前置要求

服务器上需要安装：
- Docker
- Docker Compose

## 🚀 快速部署

### 1. 安装 Docker（如果未安装）

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker
systemctl start docker
systemctl enable docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 上传代码到服务器

**在本地 Mac 运行：**

```bash
cd /Users/wangyw/Documents/GitHub/chrome-extension-QuickBridge

# 上传后端代码
scp -r backend root@129.146.245.83:/opt/quickbridge/
```

### 3. 在服务器上部署

**SSH 连接到服务器：**

```bash
ssh root@129.146.245.83
```

**运行部署脚本：**

```bash
cd /opt/quickbridge

# 配置环境变量（可选，使用默认配置）
cp .env.production .env

# 运行部署脚本
bash simple-deploy.sh
```

## ✅ 完成！

服务将运行在：
- **后端 API**: `http://localhost:3000`
- **Redis**: `localhost:6379`（仅容器内部）

## 🔧 常用命令

```bash
cd /opt/quickbridge

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 只看后端日志
docker-compose logs -f backend

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose down
docker-compose build
docker-compose up -d
```

## 🌐 配置反向代理

服务运行在 `localhost:3000`，你需要配置 Nginx 或其他反向代理。

### Nginx 配置示例

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🧪 测试 API

```bash
# 健康检查
curl http://localhost:3000/health

# 生成随机地址
curl -X POST http://localhost:3000/api/v1/address/random

# 创建自定义地址
curl -X POST http://localhost:3000/api/v1/address/custom \
  -H "Content-Type: application/json" \
  -d '{"address": "test12345"}'

# 上传文本
curl -X POST http://localhost:3000/api/v1/data/test12345/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World"}'

# 获取文本
curl http://localhost:3000/api/v1/data/test12345/text
```

## 🐛 故障排查

### 查看详细日志

```bash
# 查看所有日志
docker-compose logs

# 查看最近 100 行
docker-compose logs --tail=100

# 实时查看日志
docker-compose logs -f
```

### 进入容器调试

```bash
# 进入后端容器
docker-compose exec backend sh

# 测试 Redis 连接
docker-compose exec backend sh -c "redis-cli -h redis ping"
```

### 重新构建

```bash
# 清理并重新构建
docker-compose down
docker system prune -a  # 清理所有未使用的镜像
docker-compose build --no-cache
docker-compose up -d
```

## 📊 资源使用

查看容器资源使用情况：

```bash
docker stats
```

## 🔄 更新代码

```bash
# 在本地上传新代码
scp -r backend root@129.146.245.83:/opt/quickbridge/

# 在服务器上重新部署
cd /opt/quickbridge
docker-compose down
docker-compose build
docker-compose up -d
```

## 🎯 端口说明

- **3000**: 后端 API（需要暴露给外部）
- **6379**: Redis（仅容器内部，不需要暴露）

确保防火墙允许 3000 端口（或者通过 Nginx 代理 80/443 端口）。
