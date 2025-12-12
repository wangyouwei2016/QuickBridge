#!/bin/bash

# QuickBridge GitHub Release 发布脚本
# 用法: ./scripts/release.sh <version>
# 示例: ./scripts/release.sh v1.0.0

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "QuickBridge GitHub Release 发布工具"
echo "=========================================="
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供版本号${NC}"
    echo "用法: ./scripts/release.sh <version>"
    echo "示例: ./scripts/release.sh v1.0.0"
    exit 1
fi

VERSION=$1
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ZIP_NAME="quickbridge-extension-${VERSION}.zip"
DIST_DIR="dist"
RELEASE_DIR="release"

# 检查 dist 目录
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}错误: dist 目录不存在${NC}"
    echo "请先运行 'pnpm build' 构建插件"
    exit 1
fi

# 检查 dist 目录是否为空
if [ -z "$(ls -A $DIST_DIR)" ]; then
    echo -e "${RED}错误: dist 目录为空${NC}"
    echo "请先运行 'pnpm build' 构建插件"
    exit 1
fi

# 创建 release 目录
mkdir -p "$RELEASE_DIR"

echo -e "${GREEN}[1/4] 打包插件...${NC}"
cd "$DIST_DIR"
zip -r "../${RELEASE_DIR}/${ZIP_NAME}" . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

echo -e "${GREEN}[2/4] 验证 ZIP 文件...${NC}"
if [ ! -f "${RELEASE_DIR}/${ZIP_NAME}" ]; then
    echo -e "${RED}错误: ZIP 文件创建失败${NC}"
    exit 1
fi

ZIP_SIZE=$(du -h "${RELEASE_DIR}/${ZIP_NAME}" | cut -f1)
echo "  ✓ ZIP 文件大小: ${ZIP_SIZE}"

# 检查是否安装了 gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}[3/4] 未安装 GitHub CLI (gh)${NC}"
    echo ""
    echo "请手动完成以下步骤："
    echo "1. 访问: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/new"
    echo "2. 创建新的 Release，标签为: ${VERSION}"
    echo "3. 上传文件: ${RELEASE_DIR}/${ZIP_NAME}"
    echo ""
    echo "或者安装 GitHub CLI 后重新运行此脚本："
    echo "  brew install gh  # macOS"
    echo "  gh auth login    # 登录"
    exit 0
fi

echo -e "${GREEN}[3/4] 检查 GitHub 认证...${NC}"
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}未登录 GitHub CLI${NC}"
    echo "正在启动登录流程..."
    gh auth login
fi

echo -e "${GREEN}[4/4] 创建 GitHub Release...${NC}"

# 检查标签是否已存在
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo -e "${YELLOW}警告: 标签 ${VERSION} 已存在${NC}"
    read -p "是否覆盖现有 Release? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "取消发布"
        exit 1
    fi

    # 删除现有 Release 和标签
    gh release delete "$VERSION" -y 2>/dev/null || true
    git tag -d "$VERSION" 2>/dev/null || true
    git push origin ":refs/tags/$VERSION" 2>/dev/null || true
fi

# 创建 Release Notes
RELEASE_NOTES="release-notes-${VERSION}.md"
cat > "$RELEASE_NOTES" << EOF
## QuickBridge ${VERSION}

### 📦 安装方式

#### 方式 1: 从 Chrome Web Store 安装（推荐）
- 访问 Chrome Web Store 搜索 "QuickBridge"
- 点击"添加到 Chrome"

#### 方式 2: 手动安装
1. 下载下方的 \`${ZIP_NAME}\` 文件
2. 解压到本地目录
3. 打开 Chrome 浏览器，访问 \`chrome://extensions\`
4. 开启右上角的"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的目录

### 🚀 功能特性

- ✅ 跨设备数据传输（文本 + 文件）
- ✅ 支持多条传输记录保存
- ✅ 文本展开/收起功能
- ✅ 一键复制完整文本
- ✅ 实时同步（3秒轮询）
- ✅ 二维码扫描快速连接
- ✅ 数据临时存储（24小时）

### 📝 更新内容

- 初始版本发布

### 🔧 后端部署

需要部署后端服务才能使用，详见 [README.md](https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/blob/main/README.md#部署指南)

### 📄 完整文档

查看 [README.md](https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/blob/main/README.md) 了解详细使用说明。

---

**文件说明**:
- \`${ZIP_NAME}\` - Chrome 浏览器插件（解压后手动安装）
EOF

# 创建 Release
gh release create "$VERSION" \
    "${RELEASE_DIR}/${ZIP_NAME}" \
    --title "QuickBridge ${VERSION}" \
    --notes-file "$RELEASE_NOTES" \
    --draft

# 清理临时文件
rm -f "$RELEASE_NOTES"

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Release 创建成功！${NC}"
echo "=========================================="
echo ""
echo "Release 信息:"
echo "  版本: ${VERSION}"
echo "  文件: ${ZIP_NAME}"
echo "  大小: ${ZIP_SIZE}"
echo ""
echo "下一步:"
echo "1. 访问 GitHub Release 页面检查内容"
echo "2. 如果一切正常，点击 'Publish release' 发布"
echo ""
echo "Release URL:"
gh release view "$VERSION" --web 2>/dev/null || echo "https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases"
echo ""
