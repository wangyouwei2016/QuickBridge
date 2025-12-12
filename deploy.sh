#!/bin/bash

# QuickBridge 一键部署脚本
# 使用方法: ./deploy.sh your-server-ip

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供服务器 IP 地址${NC}"
    echo "使用方法: ./deploy.sh your-server-ip"
    exit 1
fi

SERVER_IP=$1
SERVER_USER=${2:-root}
DOMAIN="sync.ulises.cn"
PROJECT_DIR="/opt/quickbridge"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}QuickBridge 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "服务器 IP: ${YELLOW}$SERVER_IP${NC}"
echo -e "服务器用户: ${YELLOW}$SERVER_USER${NC}"
echo -e "域名: ${YELLOW}$DOMAIN${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 确认继续
read -p "确认开始部署? (y/n) " -r REPLY
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "部署已取消"
    exit 1
fi

echo -e "${GREEN}[1/8] 测试 SSH 连接...${NC}"
if ! ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'SSH 连接成功'"; then
    echo -e "${RED}错误: 无法连接到服务器${NC}"
    exit 1
fi

echo -e "${GREEN}[2/8] 安装 Docker 和 Docker Compose...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # 更新系统
    sudo apt update

    # 安装 Docker
    if ! command -v docker &> /dev/null; then
        echo "安装 Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -aG docker $USER
    else
        echo "Docker 已安装"
    fi

    # 安装 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "安装 Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        echo "Docker Compose 已安装"
    fi
ENDSSH

echo -e "${GREEN}[3/8] 安装 Nginx...${NC}"
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    if ! command -v nginx &> /dev/null; then
        echo "安装 Nginx..."
        sudo apt install nginx -y
        sudo systemctl start nginx
        sudo systemctl enable nginx
    else
        echo "Nginx 已安装"
    fi
ENDSSH

echo -e "${GREEN}[4/8] 创建项目目录...${NC}"
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p $PROJECT_DIR && sudo chown -R \$USER:\$USER $PROJECT_DIR"

echo -e "${GREEN}[5/8] 上传后端代码...${NC}"
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
    backend/ $SERVER_USER@$SERVER_IP:$PROJECT_DIR/

echo -e "${GREEN}[6/8] 配置环境变量...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_DIR && cp .env.production .env"

echo -e "${GREEN}[7/8] 启动 Docker 容器...${NC}"
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    cd $PROJECT_DIR
    docker-compose down 2>/dev/null || true
    docker-compose build
    docker-compose up -d

    echo "等待服务启动..."
    sleep 10

    # 检查服务状态
    docker-compose ps

    # 测试健康检查
    if curl -f http://localhost:3000/health 2>/dev/null; then
        echo "✓ 后端服务启动成功"
    else
        echo "✗ 后端服务启动失败，查看日志:"
        docker-compose logs backend
        exit 1
    fi
ENDSSH

echo -e "${GREEN}[8/8] 配置 Nginx 反向代理...${NC}"
scp backend/nginx.conf $SERVER_USER@$SERVER_IP:/tmp/nginx-quickbridge.conf
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    # 复制 Nginx 配置
    sudo cp /tmp/nginx-quickbridge.conf /etc/nginx/sites-available/$DOMAIN

    # 创建符号链接
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

    # 删除默认配置
    sudo rm -f /etc/nginx/sites-enabled/default

    # 测试配置
    sudo nginx -t

    # 重启 Nginx
    sudo systemctl restart nginx
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo ""
echo -e "1. 配置 SSL 证书（在服务器上运行）:"
echo -e "   ${GREEN}ssh $SERVER_USER@$SERVER_IP${NC}"
echo -e "   ${GREEN}sudo apt install certbot python3-certbot-nginx -y${NC}"
echo -e "   ${GREEN}sudo certbot --nginx -d $DOMAIN${NC}"
echo ""
echo -e "2. 测试 API（在本地运行）:"
echo -e "   ${GREEN}curl http://$DOMAIN/health${NC}"
echo -e "   ${GREEN}curl -X POST http://$DOMAIN/api/v1/address/random${NC}"
echo ""
echo -e "3. 更新扩展配置:"
echo -e "   编辑 ${GREEN}.env${NC} 文件，修改:"
echo -e "   ${GREEN}VITE_API_BASE_URL=https://$DOMAIN/api/v1${NC}"
echo ""
echo -e "4. 重新构建扩展:"
echo -e "   ${GREEN}pnpm dev${NC}"
echo ""
echo -e "5. 查看服务日志:"
echo -e "   ${GREEN}ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_DIR && docker-compose logs -f'${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
