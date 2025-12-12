#!/bin/bash

# QuickBridge 服务器端部署脚本
# 直接在服务器上运行此脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}QuickBridge 服务器端部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

DOMAIN="sync.ulises.cn"
PROJECT_DIR="/opt/quickbridge"

echo -e "${GREEN}[1/7] 更新系统...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}[2/7] 安装 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    rm get-docker.sh
else
    echo "Docker 已安装"
fi

echo -e "${GREEN}[3/7] 安装 Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose 已安装"
fi

echo -e "${GREEN}[4/7] 安装 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
else
    echo "Nginx 已安装"
fi

echo -e "${GREEN}[5/7] 配置项目目录...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 检查是否已有代码
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}请先上传代码到 $PROJECT_DIR${NC}"
    echo -e "${YELLOW}使用以下命令（在本地 Mac 运行）：${NC}"
    echo -e "${GREEN}rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' backend/ root@129.146.245.83:/opt/quickbridge/${NC}"
    exit 1
fi

echo -e "${GREEN}[6/7] 配置环境变量...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo "已从 .env.production 创建 .env"
    else
        echo -e "${YELLOW}警告: 未找到 .env.production，使用默认配置${NC}"
        cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
API_VERSION=v1
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=20971520
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
ADDRESS_TTL_HOURS=24
MAX_ADDRESS_LIFETIME_DAYS=7
CLEANUP_INTERVAL_HOURS=1
EOF
    fi
else
    echo ".env 已存在"
fi

echo -e "${GREEN}[7/7] 构建并启动服务...${NC}"
docker-compose down 2>/dev/null || true
docker-compose build
docker-compose up -d

echo ""
echo "等待服务启动..."
sleep 15

# 检查服务状态
echo ""
echo -e "${GREEN}检查服务状态...${NC}"
docker-compose ps

# 测试健康检查
echo ""
if curl -f http://localhost:3000/health 2>/dev/null; then
    echo -e "${GREEN}✓ 后端服务启动成功${NC}"
else
    echo -e "${RED}✗ 后端服务启动失败，查看日志:${NC}"
    docker-compose logs backend
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}基础服务部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo ""
echo -e "1. 配置 Nginx:"
echo -e "   ${GREEN}cp nginx.conf /etc/nginx/sites-available/$DOMAIN${NC}"
echo -e "   ${GREEN}ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/${NC}"
echo -e "   ${GREEN}rm -f /etc/nginx/sites-enabled/default${NC}"
echo -e "   ${GREEN}nginx -t && systemctl restart nginx${NC}"
echo ""
echo -e "2. 配置防火墙:"
echo -e "   ${GREEN}iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT${NC}"
echo -e "   ${GREEN}iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT${NC}"
echo -e "   ${GREEN}apt install iptables-persistent -y${NC}"
echo -e "   ${GREEN}netfilter-persistent save${NC}"
echo ""
echo -e "3. 配置 SSL 证书:"
echo -e "   ${GREEN}apt install certbot python3-certbot-nginx -y${NC}"
echo -e "   ${GREEN}certbot --nginx -d $DOMAIN${NC}"
echo ""
echo -e "4. 查看日志:"
echo -e "   ${GREEN}docker-compose logs -f${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
