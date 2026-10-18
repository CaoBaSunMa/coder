# Coder 信创接入指南

> 本文面向信创（信息技术应用创新）环境的部署与运维人员，说明如何在国内 CPU / 操作系统、
> 内网网络与国产大模型环境下安装并配置 **Coder**。
>
> 占位符（域名、仓库、存储桶等）请先按 [`BRAND.md`](../BRAND.md) 第 3 节替换后再对外发布。
> 国产 CPU 适配范围与结论见 [`xinchuang-platform-support.md`](./xinchuang-platform-support.md)。

---

## 1. 环境与平台支持

| 平台 | 架构 | 支持级别 | 说明 |
| --- | --- | --- | --- |
| Windows | x64 / ARM64 | ✅ | CLI + 桌面端（NSIS 安装包） |
| Linux | x86_64（海光、兆芯等） | ✅ | CLI + 桌面端（`.deb` / `.rpm` / `.AppImage`） |
| Linux | ARM64（鲲鹏、飞腾等） | ✅ | 同上 |
| Linux | LoongArch64（龙芯） | 🟡 | 经 Node SEA/自编译 Bun 路径，需自行构建原生依赖 |
| Linux | SW64（申威） | ❌ | 暂不支持 |

---

## 2. 安装

### 2.1 内网 npm 源（推荐用于内网）

安装脚本默认访问公网 `https://registry.npmjs.org`，可用 `CODER_NPM_REGISTRY` 指向内网镜像：

```bash
CODER_NPM_REGISTRY=https://npm.internal.example.com \
  curl -fsSL https://coder.example.com/install | bash
```

安装目录优先级：`$CODER_INSTALL_DIR` → `$XDG_BIN_DIR` → `$HOME/bin` → `$HOME/.coder/bin`。

### 2.2 包管理器

```bash
npm i -g @xcoder/cli@latest     # 或 pnpm / yarn
bun i -g @xcoder/cli@latest
brew install coder-ai/tap/coder # macOS / Linux
```

### 2.3 桌面端

| 平台 | 制品 |
| --- | --- |
| Windows x64 / ARM64 | `coder-desktop-win-x64.exe` / `coder-desktop-win-arm64.exe` |
| macOS Intel / Apple Silicon | `coder-desktop-mac-x64.dmg` / `coder-desktop-mac-arm64.dmg` |
| Linux x64 / ARM64 | `coder-desktop-linux-{x64,arm64}.{AppImage,deb,rpm}` |

---

## 3. 配置文件

Coder 读取 `coder.json` / `coder.jsonc`，来源与优先级（从高到低）：

| 来源 | 路径 |
| --- | --- |
| 项目配置 | 项目内 `.coder/`（沿目录向上查找） |
| 用户全局 | `~/.config/coder/` |
| 系统级 | Linux `/etc/coder`、Windows `%ProgramData%\coder`、macOS `/Library/Application Support/coder` |

建议在文件顶部声明 JSON Schema 以获得补全与校验：

```jsonc
{
  "$schema": "https://coder.example.com/config.json"
}
```

---

## 4. 国产大模型接入

Coder 内置 models.dev 兼容目录，**下列国产厂商无需手写模型清单**，只要设置对应环境变量即可自动发现模型：

| Provider ID | 厂商 / 区域 | 环境变量 | 默认端点 |
| --- | --- | --- | --- |
| `alibaba-cn` | 阿里云百炼（国内） | `DASHSCOPE_API_KEY` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `alibaba` | 阿里云百炼（国际） | `DASHSCOPE_API_KEY` | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| `deepseek` | DeepSeek | `DEEPSEEK_API_KEY` | `https://api.deepseek.com` |
| `moonshotai-cn` | 月之暗面 Kimi（国内） | `MOONSHOT_API_KEY` | `https://api.moonshot.cn/v1` |
| `moonshotai` | Moonshot AI（国际） | `MOONSHOT_API_KEY` | `https://api.moonshot.ai/v1` |
| `zhipuai` | 智谱 GLM | `ZHIPU_API_KEY` | `https://open.bigmodel.cn/api/paas/v4` |
| `zai` | Z.AI | `ZHIPU_API_KEY` | `https://api.z.ai/api/paas/v4` |
| `zai-coding-plan` | Z.AI 编码套餐 | `ZHIPU_API_KEY` | `https://api.z.ai/api/coding/paas/v4` |
| `minimax-cn` | MiniMax（国内） | `MINIMAX_API_KEY` | `https://api.minimax.cn/anthropic/v1` |
| `minimax` | MiniMax（国际） | `MINIMAX_API_KEY` | `https://api.minimax.io/anthropic/v1` |

例如使用国内百炼（通义千问）并设为默认模型：

```jsonc
{
  "$schema": "https://coder.example.com/config.json",
  "model": "alibaba-cn/qwen3.5-max"
}
```

```bash
export DASHSCOPE_API_KEY=sk-xxxxxxxx
coder
```

> 环境变量也可通过配置项的 `providers.<id>.env` 数组声明，便于在托管环境中集中指定。

---

## 5. 私有化部署 / 自建推理服务

任何 OpenAI 兼容端点（vLLM、Ollama、SGLang、国产一体机网关等）都可用内置的
`@xcoder/ai/providers/openai-compatible` 接入：

```jsonc
{
  "$schema": "https://coder.example.com/config.json",
  "providers": {
    "internal-vllm": {
      "name": "内网推理服务",
      "package": "@xcoder/ai/providers/openai-compatible",
      "env": ["INTERNAL_API_KEY"],
      "settings": {
        "baseURL": "http://10.0.0.10:8000/v1"
      },
      "models": {
        "qwen3-32b": {
          "name": "Qwen3 32B（内网）",
          "limit": { "context": 131072, "output": 8192 },
          "cost": { "input": 0, "output": 0 }
        }
      }
    }
  },
  "model": "internal-vllm/qwen3-32b"
}
```

字段说明（依据 `packages/schema/src/config/provider.ts`）：

| 字段 | 说明 |
| --- | --- |
| `name` | 展示名称 |
| `package` | 提供方实现包；OpenAI 兼容端点固定为 `@xcoder/ai/providers/openai-compatible` |
| `env` | 读取 API Key 的环境变量名数组（按顺序取第一个非空值） |
| `settings` | 透传给提供方的设置，常用 `baseURL`、`apiKey`、`timeout`、`headers` |
| `headers` / `body` | 附加到每个请求的 HTTP 头 / 请求体覆盖 |
| `compatibility` | 兼容开关（如 `maxTokensField`） |
| `models` | 模型清单；每项支持 `name`、`modelID`、`limit`、`cost`、`capabilities`、`variants`、`disabled` |

> 也可直接在 `settings.apiKey` 中写 `{env:INTERNAL_API_KEY}` 形式的模板。

---

## 6. 中文界面

TUI 默认英文，简体中文为可选能力（详见 [`tui-i18n.md`](./tui-i18n.md)）：

```jsonc
{
  "locale": "zh"
}
```

或用环境变量 / 系统区域设置：`CODER_LOCALE=zh coder`，`LANG=zh_CN.UTF-8 coder`。
TUI 内也可通过 **Settings → Appearance → Language → 简体中文** 切换。

---

## 7. 模型目录（离线与内网）

- Coder **自带离线快照**（`packages/core/src/models-dev/snapshot.txt`），首次启动即在无网络环境下提供完整模型目录。
- 后台每 5 分钟尝试刷新一次远端目录；端点为占位符 `https://models.coder.example.com`，未替换前刷新会失败并被忽略（不影响使用内置快照）。
- 可用环境变量覆盖目录来源，指向内网镜像或本地文件：

```bash
# 内网 models.dev 兼容镜像
export CODER_MODELS_URL=https://models.internal.example.com

# 或直接指定本地快照文件（优先级高于缓存与内置快照）
export CODER_MODELS_PATH=/etc/coder/models.json
```

---

## 8. 与上游共存

本分支的本机服务端口为 `0xC1DE` / `0xC1DF`，配置与状态目录亦为 `coder`，
可与同机上安装的上游实例并行运行而不冲突。

---

## 9. 部署前检查清单

1. 按 [`BRAND.md`](../BRAND.md) 第 3 节替换全部占位符域名、仓库、存储桶与 CI 密钥。
2. 内网环境设置 `CODER_NPM_REGISTRY`（安装）与 `CODER_MODELS_URL` / `CODER_MODELS_PATH`（模型目录）。
3. 配置国产模型环境变量，或按第 5 节接入私有化推理服务。
4. 按需设置 `locale: "zh"`。
5. 代码签名替换为信创环境可用的证书方案（见 `BRAND.md` 第 3.4 节）。
