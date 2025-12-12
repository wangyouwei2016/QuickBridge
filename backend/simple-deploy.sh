#!/bin/bash

# QuickBridge 简化部署脚本
# 只负责构建 Docker 镜像并启动服务

set -e

echo "=========================================="
echo "QuickBridge 简化部署"
echo "=========================================="
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "错误: 未安装 Docker"
    echo "请先安装 Docker: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未安装 Docker Compose"
    echo "请先安装 Docker Compose"
    exit 1
fi

echo "[1/4] 停止旧容器..."
docker-compose down 2>/dev/null || true

echo "[2/4] 构建 Docker 镜像..."
docker-compose build

echo "[3/4] 启动服务..."
docker-compose up -d

echo "[4/4] 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "=========================================="
echo "服务状态:"
echo "=========================================="
docker-compose ps

echo ""
echo "=========================================="
echo "测试服务:"
echo "=========================================="
if curl -f http://localhost:3000/health 2>/dev/null; then
    echo "✓ 后端服务运行正常"
    echo ""
    echo "服务已启动在以下端口:"
    echo "  - 后端 API: http://localhost:3000"
    echo "  - Redis: localhost:6379 (仅容器内部访问)"
    echo ""
    echo "测试 API:"
    echo "  curl http://localhost:3000/health"
    echo "  curl -X POST http://localhost:3000/api/v1/address/random"
    echo ""
    echo "查看日志:"
    echo "  docker-compose logs -f"
    echo ""
    echo "停止服务:"
    echo "  docker-compose down"
else
    echo "✗ 服务启动失败"
    echo ""
    echo "查看日志:"
    docker-compose logs
    exit 1
fi

echo "=========================================="
echo "部署完成！"
echo "=========================================="
