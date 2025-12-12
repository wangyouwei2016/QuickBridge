# Oracle Cloud ARM 服务器部署指南

本指南专门针对 Oracle Cloud 的 ARM (Ampere A1) 架构服务器。

## 🎯 Oracle Cloud 优势

- ✅ **永久免费**：4核24GB ARM 服务器
- ✅ **性能强大**：ARM 架构能效比高
- ✅ **完全兼容**：Docker 完美支持 ARM
- ✅ **公网 IP**：免费提供公网 IP

---

## 📋 前置准备

### 1. 确认服务器信息

```bash
# SSH 连接到 Oracle Cloud 服务器
ssh ubuntu@your-oracle-server-ip

# 确认架构（应该显示 aarch64）
uname -m

# 确认系统版本
cat /etc/os-release
```

### 2. 配置域名 DNS

将 `sync.ulises.cn` 的 A 记录指向你的 Oracle Cloud 服务器 IP。

---

## 🚀 快速部署

### 方法 1：使用一键部署脚本（推荐）

在**本地电脑**运行：

```bash
cd /Users/wangyw/Documents/GitHub/chrome-extension-QuickBridge

# 执行部署脚本
./deploy.sh your-oracle-server-ip ubuntu

# 注意：Oracle Cloud 默认用户是 ubuntu，不是 root
```

脚本会自动：
- ✅ 安装 Docker 和 Docker Compose
- ✅ 安装 Nginx
- ✅ 上传代码
- ✅ 构建 ARM 架构的 Docker 镜像
- ✅ 启动服务

---

### 方法 2：手动部署

如果自动脚本有问题，可以手动部署：

#### 步骤 1：连接服务器并安装依赖

```bash
# SSH 连接
ssh ubuntu@your-oracle-server-ip

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装 Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
docker --version
docker-compose --version
nginx -v
```

#### 步骤 2：上传代码

**在本地电脑运行：**

```bash
cd /Users/wangyw/Documents/GitHub/chrome-extension-QuickBridge

# 创建服务器目录
ssh ubuntu@your-oracle-server-ip "sudo mkdir -p /opt/quickbridge && sudo chown -R ubuntu:ubuntu /opt/quickbridge"

# 上传后端代码
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
    backend/ ubuntu@your-oracle-server-ip:/opt/quickbridge/
```

#### 步骤 3：配置环境变量

**在服务器上运行：**

```bash
cd /opt/quickbridge

# 复制环境变量模板
cp .env.production .env

# 编辑配置（如果需要）
nano .env
```

#### 步骤 4：构建并启动服务

```bash
cd /opt/quickbridge

# 构建 ARM 架构镜像（会自动检测架构）
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 等待服务启动（约 10-30 秒）
sleep 15

# 测试服务
curl http://localhost:3000/health
```

#### 步骤 5：配置 Nginx

```bash
# 上传 Nginx 配置（在本地运行）
scp backend/nginx.conf ubuntu@your-oracle-server-ip:/tmp/nginx-quickbridge.conf

# 在服务器上配置（在服务器运行）
sudo cp /tmp/nginx-quickbridge.conf /etc/nginx/sites-available/sync.ulises.cn
sudo ln -sf /etc/nginx/sites-available/sync.ulises.cn /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 步骤 6：配置防火墙（Oracle Cloud 特殊步骤）

Oracle Cloud 有两层防火墙，都需要配置：

**A. 配置 iptables（服务器内部）**

```bash
# 允许 HTTP 和 HTTPS
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# 保存规则
sudo netfilter-persistent save

# 或者使用 iptables-save
sudo sh -c "iptables-save > /etc/iptables/rules.v4"
```

**B. 配置 Oracle Cloud 安全列表（Web 控制台）**

1. 登录 Oracle Cloud 控制台
2. 进入：**Networking** → **Virtual Cloud Networks**
3. 选择你的 VCN → **Security Lists** → **Default Security List**
4. 点击 **Add Ingress Rules**
5. 添加以下规则：

   **规则 1：HTTP**
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `80`
   - Description: `Allow HTTP`

   **规则 2：HTTPS**
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `443`
   - Description: `Allow HTTPS`

#### 步骤 7：配置 SSL 证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d sync.ulises.cn

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 🧪 测试部署

### 1. 测试 HTTP（应该重定向到 HTTPS）

```bash
curl -I http://sync.ulises.cn
```

### 2. 测试 HTTPS

```bash
curl https://sync.ulises.cn/health
```

### 3. 测试 API

```bash
# 生成随机地址
curl -X POST https://sync.ulises.cn/api/v1/address/random

# 创建自定义地址
curl -X POST https://sync.ulises.cn/api/v1/address/custom \
  -H "Content-Type: application/json" \
  -d '{"address": "test12345"}'

# 上传文本
curl -X POST https://sync.ulises.cn/api/v1/data/test12345/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from Oracle Cloud ARM!"}'

# 获取文本
curl https://sync.ulises.cn/api/v1/data/test12345/text
```

---

## 📊 性能优化（ARM 特定）

### 1. 启用 ARM 优化

ARM 架构的 Node.js 性能已经很好，但可以进一步优化：

```bash
# 编辑 docker-compose.yml，添加资源限制
nano /opt/quickbridge/docker-compose.yml
```

添加：
```yaml
services:
  backend:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### 2. 配置 Redis 持久化

```bash
# 编辑 docker-compose.yml
nano /opt/quickbridge/docker-compose.yml
```

Redis 配置已经包含 AOF 持久化，无需额外配置。

### 3. 监控资源使用

```bash
# 查看容器资源使用
docker stats

# 查看系统资源
htop  # 需要先安装: sudo apt install htop
```

---

## 🔧 维护命令

### 查看日志

```bash
cd /opt/quickbridge

# 查看所有日志
docker-compose logs -f

# 只看后端日志
docker-compose logs -f backend

# 只看 Redis 日志
docker-compose logs -f redis

# 查看最近 100 行
docker-compose logs --tail=100 backend
```

### 重启服务

```bash
cd /opt/quickbridge

# 重启所有服务
docker-compose restart

# 只重启后端
docker-compose restart backend

# 重启 Nginx
sudo systemctl restart nginx
```

### 更新代码

```bash
# 在本地上传新代码
cd /Users/wangyw/Documents/GitHub/chrome-extension-QuickBridge
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
    backend/ ubuntu@your-oracle-server-ip:/opt/quickbridge/

# 在服务器上重新构建
ssh ubuntu@your-oracle-server-ip
cd /opt/quickbridge
docker-compose down
docker-compose build
docker-compose up -d
```

### 备份数据

```bash
# 备份 Redis 数据
docker-compose exec redis redis-cli SAVE
sudo cp /opt/quickbridge/redis-data/dump.rdb ~/backup-$(date +%Y%m%d).rdb

# 备份上传的文件
sudo tar -czf ~/uploads-backup-$(date +%Y%m%d).tar.gz /opt/quickbridge/uploads/
```

---

## 🐛 故障排查

### 问题 1：Docker 构建失败

**症状：** 构建时出现架构相关错误

**解决：**
```bash
# 确认 Docker 支持 ARM
docker info | grep Architecture

# 清理并重新构建
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### 问题 2：无法访问服务

**检查清单：**

```bash
# 1. 检查服务是否运行
docker-compose ps

# 2. 检查端口监听
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 3. 检查 iptables
sudo iptables -L -n | grep -E '80|443'

# 4. 测试本地访问
curl http://localhost:3000/health

# 5. 检查 Nginx 配置
sudo nginx -t
sudo systemctl status nginx

# 6. 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

### 问题 3：SSL 证书获取失败

**原因：** DNS 未生效或防火墙阻止

**解决：**
```bash
# 1. 确认 DNS 已生效
nslookup sync.ulises.cn

# 2. 确认 80 端口可访问
curl -I http://sync.ulises.cn

# 3. 手动获取证书
sudo certbot certonly --standalone -d sync.ulises.cn

# 4. 配置 Nginx 使用证书
sudo nano /etc/nginx/sites-available/sync.ulises.cn
```

### 问题 4：Redis 连接失败

**检查：**
```bash
# 进入后端容器
docker-compose exec backend sh

# 测试 Redis 连接
redis-cli -h redis ping

# 查看 Redis 日志
docker-compose logs redis
```

---

## 💰 成本估算

Oracle Cloud ARM 服务器：
- **免费额度**：4核24GB RAM，永久免费
- **带宽**：10TB/月 出站流量
- **存储**：200GB 块存储

QuickBridge 资源使用：
- CPU：< 5%（空闲时）
- 内存：~200MB（后端 + Redis）
- 存储：取决于上传的文件

**结论：完全在免费额度内！** 🎉

---

## 📝 下一步

1. **运行部署脚本**：
   ```bash
   ./deploy.sh your-oracle-ip ubuntu
   ```

2. **配置防火墙**（Oracle Cloud 控制台）

3. **配置 SSL 证书**：
   ```bash
   ssh ubuntu@your-oracle-ip
   sudo certbot --nginx -d sync.ulises.cn
   ```

4. **更新扩展配置**：
   ```bash
   # 编辑 .env
   VITE_API_BASE_URL=https://sync.ulises.cn/api/v1

   # 重启开发服务器
   pnpm dev
   ```

5. **测试完整流程** ✅

---

## 🎉 完成！

部署完成后，你的 QuickBridge 将运行在：
- 🌐 **Web 访问**：https://sync.ulises.cn
- 🔌 **API 地址**：https://sync.ulises.cn/api/v1
- 💪 **ARM 架构**：高性能、低功耗
- 💰 **完全免费**：Oracle Cloud 永久免费额度

如有问题，查看日志：
```bash
ssh ubuntu@your-oracle-ip
cd /opt/quickbridge
docker-compose logs -f
```
