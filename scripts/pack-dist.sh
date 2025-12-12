#!/bin/bash

# 简单打包 dist 目录脚本
# 用法: ./scripts/pack-dist.sh [version]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "QuickBridge 插件打包工具"
echo "=========================================="
echo ""

# 获取版本号
if [ -z "$1" ]; then
    VERSION=$(date +%Y%m%d-%H%M%S)
    echo -e "${YELLOW}未指定版本号，使用时间戳: ${VERSION}${NC}"
else
    VERSION=$1
fi

DIST_DIR="dist"
RELEASE_DIR="release"
ZIP_NAME="quickbridge-extension-${VERSION}.zip"

# 检查 dist 目录
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}错误: dist 目录不存在${NC}"
    echo "请先运行 'pnpm build' 构建插件"
    exit 1
fi

# 检查 dist 目录内容
FILE_COUNT=$(find "$DIST_DIR" -type f | wc -l | tr -d ' ')
if [ "$FILE_COUNT" -lt 5 ]; then
    echo -e "${YELLOW}警告: dist 目录文件较少 (${FILE_COUNT} 个文件)${NC}"
    echo "建议先运行 'pnpm build' 重新构建插件"
    read -p "是否继续打包? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 创建 release 目录
mkdir -p "$RELEASE_DIR"

echo -e "${GREEN}正在打包...${NC}"
cd "$DIST_DIR"
zip -r "../${RELEASE_DIR}/${ZIP_NAME}" . -x "*.DS_Store" -x "__MACOSX/*" -x "*.map"
cd ..

# 显示结果
if [ -f "${RELEASE_DIR}/${ZIP_NAME}" ]; then
    ZIP_SIZE=$(du -h "${RELEASE_DIR}/${ZIP_NAME}" | cut -f1)
    echo ""
    echo -e "${GREEN}✓ 打包成功！${NC}"
    echo ""
    echo "文件信息:"
    echo "  路径: ${RELEASE_DIR}/${ZIP_NAME}"
    echo "  大小: ${ZIP_SIZE}"
    echo ""
    echo "下一步:"
    echo "1. 手动上传到 GitHub Release:"
    echo "   https://github.com/YOUR_USERNAME/chrome-extension-QuickBridge/releases/new"
    echo ""
    echo "2. 或使用 GitHub CLI 自动发布:"
    echo "   ./scripts/release.sh ${VERSION}"
    echo ""
else
    echo -e "${RED}✗ 打包失败${NC}"
    exit 1
fi
