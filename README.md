# CodeCheck

一个基于 TypeScript 的命令行工具。

## 功能特性

- 📝 **文章检查**: 检查 Markdown/MDX 文件的内容规范
- 🔍 **代码检查**: 检查 JavaScript/TypeScript 文件
- 🛡️ **XSS 检查**: 检查 HTML 文件中的 XSS 漏洞
- 🎯 **灵活配置**: 支持自定义检查路径
- ⚡ **快速高效**: 基于 Glob 模式匹配，快速定位文件

## 安装

```bash
npm install -g codecheck
```

## 使用

### 基本语法

```bash
codecheck <command> [options]
codecheck check article --path packages # 检查文章是否符合规范
codecheck check code --path packages # 检查代码是否符合规范
codecheck check xss --path packages # 检查 XSS 漏洞
```