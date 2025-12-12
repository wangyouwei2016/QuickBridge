# QuickBridge 发布脚本使用说明

本目录包含用于打包和发布 QuickBridge 插件的脚本。

## 📦 脚本列表

### 1. `pack-dist.sh` - 打包插件

简单打包当前 `dist` 目录为 ZIP 文件。

**用法**:

```bash
# 使用时间戳作为版本号
./scripts/pack-dist.sh

# 指定版本号
./scripts/pack-dist.sh v1.0.0
```

**输出**:
- 在 `release/` 目录生成 `quickbridge-extension-{version}.zip`

### 2. `release.sh` - 发布到 GitHub Release

自动打包并发布到 GitHub Release（需要 GitHub CLI）。

**用法**:

```bash
./scripts/release.sh v1.0.0
```

**功能**:
- ✅ 自动打包 dist 目录
- ✅ 创建 GitHub Release（草稿）
- ✅ 上传 ZIP 文件
- ✅ 生成 Release Notes

---

## 🚀 完整发布流程

### 方式 1: 手动发布（推荐新手）

#### 步骤 1: 构建插件

```bash
# 确保后端地址已配置
nano .env
# 设置 VITE_API_BASE_URL=https://your-domain.com/api/v1

# 构建插件
pnpm build
```

#### 步骤 2: 打包插件

```bash
./scripts/pack-dist.sh v1.0.0
```

#### 步骤 3: 手动上传到 GitHub

1. 访问 GitHub 仓库的 Releases 页面
2. 点击 "Create a new release"
3. 填写信息：
   - **Tag**: v1.0.0
   - **Title**: QuickBridge v1.0.0
   - **Description**: 复制下面的模板
4. 上传 `release/quickbridge-extension-v1.0.0.zip`
5. 点击 "Publish release"

**Release 描述模板**:

```markdown
## QuickBridge v1.0.0

### 📦 安装方式

#### 方式 1: 从 Chrome Web Store 安装（推荐）
- 访问 Chrome Web Store 搜索 "QuickBridge"
- 点击"添加到 Chrome"

#### 方式 2: 手动安装
1. 下载下方的 `quickbridge-extension-v1.0.0.zip` 文件
2. 解压到本地目录
3. 打开 Chrome 浏览器，访问 `chrome://extensions`
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

需要部署后端服务才能使用，详见 [README.md](../README.md#部署指南)

### 📄 完整文档

查看 [README.md](../README.md) 了解详细使用说明。
```

---

### 方式 2: 自动发布（使用 GitHub CLI）

#### 前置要求

安装 GitHub CLI：

```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# 登录
gh auth login
```

#### 一键发布

```bash
# 1. 构建插件
pnpm build

# 2. 自动打包并发布
./scripts/release.sh v1.0.0
```

脚本会：
1. 打包 dist 目录
2. 创建 GitHub Release（草稿状态）
3. 上传 ZIP 文件
4. 生成 Release Notes
5. 打开浏览器让你检查

检查无误后，在 GitHub 页面点击 "Publish release" 发布。

---

## 📋 版本号规范

建议使用语义化版本号：

- **v1.0.0** - 主版本.次版本.修订号
- **v1.0.0-beta.1** - 测试版本
- **v1.0.0-rc.1** - 候选版本

示例：
```bash
./scripts/release.sh v1.0.0        # 正式版
./scripts/release.sh v1.1.0        # 新功能
./scripts/release.sh v1.0.1        # 修复 bug
./scripts/release.sh v2.0.0        # 重大更新
./scripts/release.sh v1.0.0-beta.1 # 测试版
```

---

## 🔍 常见问题

### Q: dist 目录为空或文件很少？

**A**: 需要先构建插件：

```bash
pnpm build
```

### Q: 构建失败怎么办？

**A**: 检查以下几点：
1. 确保已安装依赖：`pnpm install`
2. 检查 Node.js 版本：`node -v`（需要 >= 18）
3. 检查 `.env` 文件是否配置正确

### Q: GitHub CLI 未安装？

**A**: 使用方式 1（手动发布），或安装 GitHub CLI：

```bash
brew install gh  # macOS
gh auth login    # 登录
```

### Q: 如何更新已发布的 Release？

**A**: 使用相同的版本号重新运行脚本，会提示是否覆盖：

```bash
./scripts/release.sh v1.0.0
# 提示: 标签 v1.0.0 已存在
# 是否覆盖现有 Release? (y/N): y
```

### Q: 如何删除 Release？

**A**: 使用 GitHub CLI 或在 GitHub 网页上删除：

```bash
# 使用 CLI
gh release delete v1.0.0

# 或访问 GitHub 网页
# https://github.com/YOUR_USERNAME/chrome-extension-QuickBridge/releases
```

---

## 📝 发布检查清单

发布前请确认：

- [ ] 已更新版本号（`package.json`）
- [ ] 已配置正确的后端地址（`.env`）
- [ ] 已运行 `pnpm build` 构建插件
- [ ] 已测试插件功能正常
- [ ] 已更新 CHANGELOG.md（如果有）
- [ ] 已更新 README.md（如果有新功能）
- [ ] Release Notes 描述清晰
- [ ] ZIP 文件大小合理（通常 < 10MB）

---

## 🎯 快速参考

```bash
# 完整发布流程（手动）
pnpm build
./scripts/pack-dist.sh v1.0.0
# 然后手动上传到 GitHub

# 完整发布流程（自动）
pnpm build
./scripts/release.sh v1.0.0

# 仅打包不发布
./scripts/pack-dist.sh v1.0.0

# 查看 Release 列表
gh release list

# 查看特定 Release
gh release view v1.0.0

# 删除 Release
gh release delete v1.0.0
```

---

## 📚 相关文档

- [GitHub Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [GitHub CLI 文档](https://cli.github.com/manual/)
- [Chrome Web Store 发布指南](https://developer.chrome.com/docs/webstore/publish/)
