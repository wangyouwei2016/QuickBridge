# QuickBridge 部署指南

本文档详细说明如何将 QuickBridge 后端部署到生产服务器。

## 📋 前置要求

### 服务器要求
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 至少 1GB RAM
- 至少 10GB 磁盘空间
- 公网 IP 地址
- 域名：sync.ulises.cn（已配置 DNS A 记录指向服务器 IP）

### 需要安装的软件
- Docker & Docker Compose
- Nginx
- Certbot (用于 SSL 证书)

---

## 🚀 部署步骤

### 1. 连接到服务器

```bash
ssh your-user@your-server-ip
```

### 2. 安装 Docker 和 Docker Compose

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 3. 安装 Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. 安装 Certbot (Let's Encrypt SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5. 上传后端代码到服务器

**方法 1：使用 Git（推荐）**

```bash
# 在服务器上
cd /opt
sudo git clone https://github.com/your-username/chrome-extension-QuickBridge.git
sudo chown -R $USER:$USER chrome-extension-QuickBridge
cd chrome-extension-QuickBridge/backend
```

**方法 2：使用 SCP**

```bash
# 在本地电脑上
cd /Users/wangyw/Documents/GitHub/chrome-extension-QuickBridge
tar -czf backend.tar.gz backend/
scp backend.tar.gz your-user@your-server-ip:/opt/

# 在服务器上
cd /opt
tar -xzf backend.tar.gz
cd backend
```

### 6. 配置环境变量

```bash
cd /opt/chrome-extension-QuickBridge/backend
cp .env.production .env

# 编辑 .env 文件（如果需要修改配置）
nano .env
```

### 7. 构建并启动 Docker 容器

```bash
cd /opt/chrome-extension-QuickBridge/backend

# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 验证服务运行
curl http://localhost:3000/health
```

### 8. 配置 Nginx 反向代理

```bash
# 复制 Nginx 配置文件
sudo cp nginx.conf /etc/nginx/sites-available/sync.ulises.cn

# 创建符号链接
sudo ln -s /etc/nginx/sites-available/sync.ulises.cn /etc/nginx/sites-enabled/

# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 9. 获取 SSL 证书

```bash
# 使用 Certbot 自动配置 SSL
sudo certbot --nginx -d sync.ulises.cn

# 或者手动获取证书
sudo certbot certonly --nginx -d sync.ulises.cn

# 设置自动续期
sudo certbot renew --dry-run
```

### 10. 测试部署

```bash
# 测试 HTTP (应该重定向到 HTTPS)
curl -I http://sync.ulises.cn

# 测试 HTTPS
curl https://sync.ulises.cn/health

# 测试 API
curl -X POST https://sync.ulises.cn/api/v1/address/random
```

---

## 🔧 更新扩展配置

部署完成后，需要更新 Chrome 扩展的 API 地址：

### 1. 修改本地 .env 文件

```bash
# 在本地项目根目录
cd /Users/wangyw/Documents/GitHub/chrome-extension-QuickBridge
nano .env
```

修改为：
```env
VITE_API_BASE_URL=https://sync.ulises.cn/api/v1
VITE_POLL_INTERVAL_MS=3000
VITE_MAX_FILE_SIZE=20971520
```

### 2. 重新构建扩展

```bash
# 停止当前开发服务器 (Ctrl+C)
# 然后重新启动
pnpm dev
```

### 3. 重新加载 Chrome 扩展

1. 打开 `chrome://extensions/`
2. 找到 QuickBridge 扩展
3. 点击刷新按钮 🔄

---

## 📊 监控和维护

### 查看日志

```bash
# 查看后端日志
docker-compose logs -f backend

# 查看 Redis 日志
docker-compose logs -f redis

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/sync.ulises.cn.access.log
sudo tail -f /var/log/nginx/sync.ulises.cn.error.log
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart backend
docker-compose restart redis

# 重启 Nginx
sudo systemctl restart nginx
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 更新代码

```bash
cd /opt/chrome-extension-QuickBridge/backend

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 🔒 安全建议

### 1. 配置防火墙

```bash
# 安装 UFW
sudo apt install ufw -y

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 2. 限制 Redis 访问

在 `docker-compose.yml` 中，Redis 端口已经只绑定到 localhost，不对外暴露。

### 3. 设置 Redis 密码（可选）

```bash
# 编辑 docker-compose.yml
nano docker-compose.yml
```

修改 Redis 配置：
```yaml
redis:
  command: redis-server --appendonly yes --requirepass your-strong-password
```

同时更新 backend 环境变量：
```yaml
backend:
  environment:
    - REDIS_PASSWORD=your-strong-password
```

### 4. 配置 CORS（生产环境）

编辑 `.env` 文件：
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 🐛 故障排查

### 问题 1：无法访问 API

**检查：**
```bash
# 检查 Docker 容器状态
docker-compose ps

# 检查后端日志
docker-compose logs backend

# 检查 Nginx 状态
sudo systemctl status nginx

# 检查端口占用
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 问题 2：SSL 证书问题

**检查：**
```bash
# 测试 SSL 证书
sudo certbot certificates

# 手动续期
sudo certbot renew

# 检查 Nginx SSL 配置
sudo nginx -t
```

### 问题 3：Redis 连接失败

**检查：**
```bash
# 进入 backend 容器
docker-compose exec backend sh

# 测试 Redis 连接
redis-cli -h redis ping

# 查看 Redis 日志
docker-compose logs redis
```

### 问题 4：文件上传失败

**检查：**
```bash
# 检查 uploads 目录权限
ls -la uploads/

# 修复权限
chmod 755 uploads/

# 检查磁盘空间
df -h
```

---

## 📈 性能优化

### 1. 启用 Nginx 缓存

在 `nginx.conf` 中添加：
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=quickbridge_cache:10m max_size=100m inactive=60m;

location /api/v1/ {
    proxy_cache quickbridge_cache;
    proxy_cache_valid 200 5m;
    # ... 其他配置
}
```

### 2. 配置 Redis 持久化

已在 `docker-compose.yml` 中配置 AOF 持久化。

### 3. 监控资源使用

```bash
# 查看容器资源使用
docker stats

# 查看系统资源
htop
```

---

## 📞 支持

如有问题，请查看：
- 后端日志：`docker-compose logs backend`
- Nginx 日志：`/var/log/nginx/sync.ulises.cn.error.log`
- Redis 日志：`docker-compose logs redis`
