# Croc UI

<div align="center">

![Croc UI](https://img.shields.io/badge/Platforms-macOS%20|%20Windows%20|%20Linux-blue)
![Rust](https://img.shields.io/badge/Rust-1.70+-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.0-green)

**基于 Tauri 的跨平台安全文件传输客户端**

[Croc](https://github.com/schollz/croc) 官方推荐的桌面 UI

</div>

## ✨ 特性

- 🚀 **跨平台支持** - macOS、Windows、Linux
- 🔒 **端到端加密** - 继承 croc 安全传输
- 🎨 **现代化 UI** - 暗色科技风格设计
- 📊 **实时进度** - 显示传输速度、剩余时间
- 🎯 **简单易用** - 6 位连接码即可开始传输
- 💨 **快速传输** - 支持文件和文件夹

## 📥 安装

### macOS

```bash
# 使用 Homebrew
brew install croc-ui

# 或下载 .dmg 安装包
# 发布地址: https://github.com/septemxx/croc-ui/releases
```

> ⚠️ **首次打开提示"已损坏"或"无法验证开发者"？**
>
> 由于本项目采用 **ad-hoc 签名**（非 Apple Developer ID 签名），macOS Gatekeeper 在首次打开时会拦截。请按以下任一方法处理：
>
> **方法 A：终端命令（推荐，一次解决）**
>
> ```bash
> # 移除下载的隔离属性（注意路径根据实际调整）
> xattr -cr "/Applications/Croc UI.app"
> ```
>
> **方法 B：右键打开**
>
> 1. 在 Finder 中找到 `Croc UI.app`
> 2. **右键** 点击 → 选择"打开"
> 3. 在弹出的对话框中点击"打开"
>
> **方法 C：系统设置**
>
> 1. 尝试打开应用失败后
> 2. 打开"系统设置" → "隐私与安全性"
> 3. 向下滚动找到被阻止的应用，点击"仍要打开"
>
> 之后即可正常双击打开。

### Windows

```bash
# 使用 Scoop
scoop bucket add extras
scoop install croc-ui

# 或下载 .msi 安装包
```

### Linux

```bash
# Debian/Ubuntu
sudo dpkg -i croc-ui_*.deb

# 或下载 .deb 包
```

## 🔧 前置要求

在使用前，请确保系统已安装 **croc** 命令行工具：

```bash
# macOS / Linux
curl -sL https://getcroc.schollz.com | bash

# Windows (使用 Scoop)
scoop install croc

# Windows (使用 Chocolatey)
choco install croc
```

验证安装：

```bash
croc --version
```

## 🛠️ 从源码构建

### 环境要求

- Node.js 18+
- Rust 1.70+
- npm 或 yarn

### 构建步骤

```bash
# 克隆项目
git clone https://github.com/septemxx/croc-ui.git
cd croc-ui

# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建生产版本
npm run tauri build
```

## 🎮 使用方法

### 发送文件

1. 选择「发送」模式
2. 点击「选择文件」或「选择文件夹」
3. 点击「开始发送」
4. 将生成的 6 位连接码分享给接收方

### 接收文件

1. 选择「接收」模式
2. 输入发送方提供的 6 位连接码
3. 选择文件保存位置
4. 点击「连接并接收」

## 📁 项目结构

```
croc-ui/
├── src/                      # React 前端源码
│   ├── components/           # UI 组件
│   ├── hooks/                # React Hooks
│   ├── store/                # 状态管理
│   └── utils/                # 工具函数
├── src-tauri/                # Rust 后端
│   └── src/lib.rs            # Tauri 命令
└── package.json              # 项目配置
```

## 🧪 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Rust + Tauri 2.0
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **动画**: Framer Motion
- **文件传输**: [croc](https://github.com/schollz/croc)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [croc](https://github.com/schollz/croc) - 安全文件传输工具
- [Tauri](https://tauri.app/) - 跨平台应用框架
- 所有开源贡献者
