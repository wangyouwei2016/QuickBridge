#!/bin/bash

# QuickBridge 快速部署脚本
# 用于将更新后的代码部署到服务器

set -e

SERVER="root@129.146.245.83"
REMOTE_DIR="/opt/quickbridge/backend"

echo "==========================================="
echo "QuickBridge 快速部署"
echo "==========================================="
echo ""

echo "[1/3] 上传代码到服务器..."
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude 'uploads' \
  ./ ${SERVER}:${REMOTE_DIR}/

echo ""
echo "[2/3] 在服务器上重新构建..."
ssh ${SERVER} << 'ENDSSH'
cd /opt/quickbridge
docker-compose down
docker-compose build --no-cache
docker-compose up -d
ENDSSH

echo ""
echo "[3/3] 等待服务启动..."
sleep 10

echo ""
echo "==========================================="
echo "检查服务状态..."
echo "==========================================="
ssh ${SERVER} "cd /opt/quickbridge && docker-compose ps"

echo ""
echo "==========================================="
echo "测试服务..."
echo "==========================================="
if curl -f https://sync.ulises.cn/api/v1/address/random 2>/dev/null; then
    echo "✓ API 服务正常"
fi

if curl -f https://sync.ulises.cn/ 2>/dev/null | grep -q "QuickBridge"; then
    echo "✓ Web 前端正常"
fi

echo ""
echo "==========================================="
echo "部署完成！"
echo "==========================================="
echo ""
echo "访问地址："
echo "  - Web 前端: https://sync.ulises.cn"
echo "  - API: https://sync.ulises.cn/api/v1"
echo ""
echo "查看日志："
echo "  ssh ${SERVER} 'cd /opt/quickbridge && docker-compose logs -f'"
echo ""
