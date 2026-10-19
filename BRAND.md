# Coder 二开品牌与部署说明（BRAND.md）

本仓库是 **Coder V2**（上游 `anomalyco/opencode`，`dev` 分支）的二次开发分支，产品定名为 **Coder**，
用于满足信创（信息技术应用创新）场景的 AI 编程助手需求。本文件记录所有已改名的标识、**必须替换的占位符**，
以及上游同步方式。部署到真实环境前，请按第 3 节逐项替换。

## 1. 命名约定

| 项目 | 上游 OpenCode | 本分支 Coder |
| --- | --- | --- |
| 产品名 | OpenCode | Coder |
| CLI 命令 | `opencode` / `opencode2` | `coder` / `coder2`（兼容垫片） |
| npm scope | `@opencode/*` | `@xcoder/*` |
| npm 主安装包 | `@opencode/cli` | `@xcoder/cli` |
| 平台二进制包 | `@opencode/cli-<target>` | `@xcoder/cli-<target>` |
| 环境变量前缀 | `OPENCODE_*` | `CODER_*` |
| 全局配置目录 | `~/.config/opencode` | `~/.config/coder` |
| 数据目录 | `~/.local/share/opencode` | `~/.local/share/coder` |
| 状态/日志目录 | `~/.local/state/opencode`、`~/.cache/opencode` | `~/.local/state/coder`、`~/.cache/coder` |
| Windows 机器级配置 | `%ProgramData%\opencode` | `%ProgramData%\coder` |
| 项目配置目录 | `.opencode/` | `.coder/` |
| 项目配置文件 | `opencode.json(c)` | `coder.json(c)` |
| 二进制安装目录（install 脚本） | `~/.opencode/bin` | `~/.coder/bin` |
| 本机服务端口 | `0xC0DE` / `0xC0DF` | `0xC1DE` / `0xC1DF`（避免与同机上游实例冲突） |
| 服务注册文件 | `service.json`（状态目录内） | 同名（状态目录已隔离） |
| 桌面端 appId | `ai.opencode.desktop*` | `ai.coder.desktop*` |
| 桌面端 productName | OpenCode / OpenCode Dev / OpenCode Beta | Coder / Coder Dev / Coder Beta |
| 桌面端 URL 协议 | `opencode://` | `coder://` |
| CLI 制品命名 | `opencode-<target>.zip/tar.gz` | `coder-<target>.zip/tar.gz` |
| 桌面端制品命名 | `opencode-desktop-<os>-<arch>.<ext>` | `coder-desktop-<os>-<arch>.<ext>` |
| Homebrew 公式 | `opencode-v2` / `opencode-beta` | `coder` / `coder-beta` |

编译期常量（`packages/cli/script/build.ts` 注入）同步改名：上游 `OPENCODE_VERSION`、`OPENCODE_CHANNEL`、
`OPENCODE_ARTIFACT`、`OPENCODE_LIBC`、`OPENCODE_CLI_DIST` → 本分支 `CODER_VERSION`、`CODER_CHANNEL`、
`CODER_ARTIFACT`、`CODER_LIBC`、`CODER_CLI_DIST`。

### 1.1 品牌图形（C 记号 + Coder 字标）

上游的品牌图形是一个**空心方块**（字母 O 的几何化）以及 "OpenCode" 的方块字标。本分支改为：

| 图形 | 位置 | 设计 |
| --- | --- | --- |
| **C 记号** | `packages/ui/src/components/logo.tsx` 的 `Mark` / `Splash`，`packages/app/src/providers/coder-logo.tsx` | 同一个方块，右侧开口，形成块状 **C**；缺口下半部放一枚浅色方块，延续上游的"双层方块"意象 |
| **SVG 字标** | 同文件的 `Logo`（viewBox `144×42`）、`packages/ui/src/typography/wordmark/wordmark.tsx`（viewBox `442×129`） | **"Coder"** 五个字形，沿用上游网格：字形宽 24、步进 30、笔画 6、大写顶 y=6、基线 y=36 |
| **终端字标** | `packages/tui/src/logo.ts` | 块字符 "CODER"：`left` = CO（弱色）、`right` = DER（粗体），`go` = 单个 C 记号（窄终端用） |

字形定义（小网格，坐标相对各自字形原点）：

```
C  M24 6H0V36H24V30H6V12H24V6Z
o  M36 18H48V30H36V18Z  +  M54 36H30V12H54V36Z      （evenodd）
d  M84 6H78V12H60V36H84V6Z  +  M78 30H66V18H78V30Z  （evenodd）
e  M90 12H114V36H90V12Z + 眼 M96 18H108V24H96V18Z + 右下开口 M108 30H114V36H108V30Z（evenodd）
r  M144 12H120V36H126V18H144V12Z  +  肩 M144 18H138V24H144V18Z
```

> 环形/带孔字形必须用 `fill-rule="evenodd"`（Solid JSX 中写 kebab-case 的 `fill-rule=`），
> 与仓库其它 SVG 一致；`packages/app/src/settings/about/animated-wordmark.tsx` 的逐字母
> `<symbol>` 也遵循同一字形定义。
> 改动字标时同步检查 `packages/app/component-tests/new-session-wordmark.spec.ts` 里的
> 弱色路径计数（现为 5）与 `.settings-about-wordmark` 的 `110×32` 尺寸（对应 144:42 比例）。

**位图图标**：

- `packages/ui/src/assets/favicon/` 的 SVG 与全部 PNG / ICO 已按 C 记号重绘（深色底板 #131010、
  白色 C、缺口下半部的浅色方块 #5A5858）。
- `packages/desktop/icons/{dev,beta,prod}/icon.png`（512 主图）由上游的 O 记号「保留底板与渐变、仅开缺口」
  得到：把圆环右侧笔画（512 画布上的 `x=325..395`、`y=146..360`）整体替换为**底板色**，底板色按行取
  自圆环外侧紧邻的像素，因此三个渠道各自的底色与渐变都被保留。几何为环 115..394 × 81..425、
  笔画约 70px，三个渠道共用。注意上游旧稿曾把缺口填成「内孔同色」，这对 dev / beta（深色环、浅色底板）
  会得到一个看不出开口的 O，必须填底板色。
- `icon.icns`、`icon.ico` 与 `icons/*/` 下其余 144 个 PNG 全部由各渠道的 512 主图按需缩放得到
  （缩小走 box 平均、放大走双线性），alpha 取「主图 alpha 与自身 alpha 的较小值」，所以圆形启动图标、
  透明留白、磁贴底板等各自的轮廓与原图一致。`icon.ico` 为 7 层 PNG（16/24/32/48/64/128/256），
  `icon.icns` 为 `ic11/ic12/ic07/ic13/ic08/ic14/ic09/ic10` 八个 PNG 块。
- Windows 应用商店磁贴（`StoreLogo.png`、`Square*Logo.png`）与 `ios/**`、`android/**` 的底板留白和
  蒙版并不是主图的等比缩放，这些家族的底板构图是简化版；它们不参与当前打包（Windows / macOS / Linux
  分别只用到 `icon.ico` / `icon.icns` / 同目录的 PNG）。

**刻意保留的上游外部依赖**（不可改名，否则无法安装）：

- `@opencode-ai/pty` / `@opencode-ai/pty-*`：终端 PTY 预编译产物（上游发布，作为第三方依赖使用）。
- `@opencode-ai/sdk`：`github/` 目录中 GitHub Action 集成所用（上游云端服务，本轮未启用）。
- `@opentui/*`、`@ff-labs/*`、`@pierre/*`、`@opentunnel/*` 等第三方包。
- `patches/` 目录中的补丁（其中 `@silvia-odwyer/photon-node` 的 `__CODER_PHOTON_WASM_PATH`
  与 `packages/core`、`packages/cli` 中的定义必须保持一致，改一处要同步另一处）。

**本轮未纳入改名的目录**（下游文档/营销/站点，后续里程碑整体替换，不参与编译）：

- `services/www`（官网与 V2 文档站）、`packages/web`（文档内容）、`packages/console`（控制台营销站）、
  `packages/posts`、`services/changelog`、`salesforce/`、`infra/`、`nix/`、`specs/`、`perf/`、`flake.*`。
  这些目录中仍会出现 `coder` / `Coder` 字样，属预期现象。

## 2. 改名方式

机械改名由一次性脚本完成（规则、排除目录、命名空间保护都写在脚本里）：

- `script/rebrand-fork.ts`：第一遍，全仓基础改名（`opencode`→`coder`、`@opencode/`→`@xcoder/` 等）。
- `script/rebrand-fork2.ts`：第二遍，补充规则与路径改名（含 `--skip`/`--only` 与 `@opencode-ai`/
  `vite-plugin-opencode` 哨兵保护）。
- `script/rebrand-cleanup.ts`：第三遍，清理品牌残留（幂等）。

并对以下文件做了人工修整：

- `install`（安装脚本）：改用 `@xcoder` scope、`~/.coder/bin`、新增内网 npm 源覆盖变量
  `CODER_NPM_REGISTRY`，移除上游的 `@opencode-ai` 旧包回落逻辑。
- `packages/cli/script/publish-homebrew.ts`：公式名 `coder`/`coder-beta`、类名 `Coder`/`CoderBeta`。
- `packages/cli/src/services/service-config.ts`：服务端口改为 `0xC1DE`。
- `.github/workflows/publish.yml`：删除 V1 遗留构建/上传/下载步骤（`packages/coder/*` 已不存在）。
- `.github/workflows/`：删除上游内部机器人工作流（`coder.yml`、`review.yml`、`triage.yml`、
  `duplicate-issues.yml`、`docs-*`、`pr-*`、`close-*`、`compliance-close.yml`、`notify-discord.yml`、
  `deploy-www/changelog/posts.yml`、`deploy.yml`、`models-snapshot.yml`、`publish-github-action.yml`、
  `release-github-action.yml`、`stats.yml`），保留发布/测试/基础设施类共 10 个。

> 脚本为一次性工具，已执行完毕；上游合并后如出现新的 `coder` 标识，请手工按同样规则处理，
> 不要重复整仓执行 `rebrand-fork.ts`。

## 3. 必须替换的占位符（部署前检查清单）

### 3.1 域名

| 占位符 | 用途 | 代码位置（示例） |
| --- | --- | --- |
| `https://coder.example.com` | 官网 / 安装脚本 `/install` / 文档 / 配置 `$schema` / 登录 | `install`、`packages/cli/src/config/schema.ts` |
| `https://releases.coder.example.com/update/api` | 更新与发布 API（渠道、清单、发布回调） | `packages/cli/src/services/updater.ts`、`script/update-artifact.ts`、`services/update` |
| `https://releases.coder.example.com/files/bin` | 二进制与桌面安装包文件服务 | `script/update-artifact.ts`、`packages/cli/script/publish*.ts` |
| `https://models.coder.example.com` | 模型目录（models.dev 兼容快照）；仓库内置快照保证离线可用，运行时可用 `CODER_MODELS_URL`（在线地址）/`CODER_MODELS_PATH`（本地文件）覆盖 | `packages/core/src/models-dev.ts`、`packages/cli/src/server-process.ts` |
| `https://console.coder.example.com` / `https://app.coder.example.com` | Coder Console 云端（登录、推理网关、Web 搜索、统计） | `packages/core`、`packages/console`（本轮未启用） |
| `https://dev.coder.example.com` | 开发/预览站点 | 站点与服务配置 |
| `registry.coder.example.com/coder` | 容器镜像仓库（上游为 `ghcr.io/<仓库所有者>/opencode`，当前 `containers.yml` 仍用 `ghcr.io/${{ github.repository_owner }}`，需替换） | `.github/workflows/containers.yml` |

### 3.2 代码托管与分发

| 占位符 | 用途 |
| --- | --- |
| `coder-ai/coder` | Git 仓库（`github/` 集成、文档链接、CI 守卫 `if: github.repository == 'coder-ai/coder'`） |
| `raw.githubusercontent.com/coder-ai/coder/<commit>/…` | AppStream 元数据与文档里的截图直链（`packages/desktop/scripts/copy-metainfo.ts`）；该 commit 属上游，需换成真实仓库中的提交 |
| `coder-ai/homebrew-tap` | Homebrew tap 仓库（`packages/cli/script/publish-homebrew.ts`） |
| `coder-production-files` | S3/R2 存储桶名（`script/update-artifact.ts`） |
| npm registry | 默认 `https://registry.npmjs.org`；内网可在安装脚本用 `CODER_NPM_REGISTRY` 覆盖，发布侧在 CI 配置 |
| AUR | `packages/cli/script/publish-aur.ts`（Beta 渠道，可选） |

### 3.3 CI 密钥 / 变量（`.github/workflows/publish.yml`）

`vars.CODER_APP_ID`、`secrets.CODER_APP_SECRET`、`secrets.CODER_API_KEY`、
`secrets.APPLE_CERTIFICATE` / `APPLE_CERTIFICATE_PASSWORD` / `APPLE_API_KEY` / `APPLE_API_KEY_PATH` /
`APPLE_API_ISSUER`、`secrets.AZURE_TRUSTED_SIGNING_*` / `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` /
`AZURE_SUBSCRIPTION_ID`、`secrets.CLOUDFLARE_API_TOKEN`、`secrets.AUR_KEY`、
`secrets.WINGET_GITHUB_TOKEN`、`secrets.SENTRY_AUTH_TOKEN`、`vars.SENTRY_ORG`、
`vars.WEB_SENTRY_DSN`、`vars.WEB_SENTRY_PROJECT`、`secrets.DISCORD_WEBHOOK`。

### 3.4 代码签名

- Windows：`packages/desktop/electron-builder.config.ts` 的 `win.signtoolOptions.sign` →
  `script/sign-windows.ps1`（Azure Trusted Signing）。信创环境需替换为自有代码签名证书方案。
- macOS：Apple Developer ID + 公证，见 `publish.yml` 的 `sign-cli-macos` 步骤与
  `packages/cli/script/entitlements.plist`、`packages/desktop/resources/entitlements*.plist`。
- Linux：不上签名（AppImage/deb/rpm）。

## 4. 上游同步

```sh
# 已配置的远程
git remote -v
# origin    https://github.com/coder-ai/coder.git        （占位，替换为真实仓库）
# upstream  https://github.com/anomalyco/opencode.git

git fetch upstream dev
git merge upstream/dev        # 或基于 upstream/dev 重建二开分支
```

合并上游时注意：

1. `script/rebrand-fork.ts` 触及的文件最容易冲突；冲突解决以“保留 Coder 品牌 + 采纳上游功能”为准。
2. 上游若新增 `CODER_*` 环境变量、`coder` 命令引用、`coder.ai` 端点，需要按第 1 节规则补改名。
3. 上游 `dev` 是唯一基线分支；本仓库默认分支亦为 `dev`。

## 5. 已知遗留（本轮范围外）

- TUI（终端界面）默认仍为英文；简体中文界面为可选能力，见 `docs/tui-i18n.md`。
- 官网/文档站（`services/www`、`packages/web`）仍是上游内容，需下一里程碑整体替换。
- `.coder/` 下的仓库自用开发配置、`.github/ISSUE_TEMPLATE`、`CHANGELOG.md` 保留上游历史与措辞。
- `github/`（GitHub Action）仍依赖上游 `@opencode-ai/sdk`，未启用。
- `packages/ai` 的语音/转写 HTTP 录音夹具（`test/fixtures/recordings/`）保留上游文案 `Hello from OpenCode.`：
  这些卡带记录的是**真实音频**的识别结果与字符级时间戳，离线无法重录。机械改名会把请求体改成 `Coder`
  而响应里的分片仍是 `OpenCode`，导致卡带自相矛盾。需在具备厂商 API Key 后用 `RECORD=true` 重新录制。
- `packages/merman` 的 `DEPLOYMENT - Anomaly` 等流程图标签是渲染布局测试的合成 fixture（框宽随文字变化），
  属测试数据而非产品品牌，保留不动。
- 桌面端内部特权协议 `oc://renderer`、`oc://extensions/...` 未改名：它是应用内部协议，用户不可见，
  且与 `headers.ts`/`scheme.ts`/扩展资源服务耦合；用户可见的深链协议已为 `coder://`。
- `flake.nix`/`nix/`、`infra/`、`salesforce/` 未适配本分支品牌。

### 5.1 Windows 环境下已知的测试失败（非品牌改动引入）

在未开启 Developer Mode、缺少 POSIX 工具链的 Windows 上，全量测试存在下列**环境相关**失败。
它们与改名无关（在上游 `dev` 上同样会失败），已逐项核实：

| 原因 | 失败用例 | 影响包 |
| --- | --- | --- |
| 缺少 POSIX 命令 `sleep` / `echo` / `mktemp` | `rejects incompatible daemons…`、`cross-spawn spawner > …`、`command subagents > …`、`mini handler passes resolved CLI keybinds…` | `core`(6)、`cli`(1) |
| 符号链接创建权限（`EPERM: symlink`） | `FileSystem > canonicalizes local symlinked directories`、`plugin-keymap`、`plugin-source` | `core`(1)、`tui`(5) |
| solid-js 条件导出解析到生产构建（缺 `jsxDEV`） | 所有 `.tsx` 渲染测试 | `app`(36)、`ui`(3)、`session-ui`(1) |
| 缺少 `pwsh` | `installer grants sandbox access…` | `desktop`(1) |
| esbuild 服务 / Electron 下载并发冲突 | `serves browser-loadable picker scripts…` | `desktop`(2) |
| `readdir` 顺序并列（按 mtime 排序时输入顺序不定） | `legacy store import > copies every namespace…` | `desktop`(1) |
| 系统区域为 zh-CN，`localeCompare` 排序不同 | `production model menu keeps labels…` | `tui`(2) |
| 后台服务启动 3s 超时 | `recovers when an unresponsive contender…` | `client`(1) |
| 超长命令行 git diff 60s 超时 | `Git trees > diffs a path selection longer…` | `core`(1，偶发) |
| git 未创建符号链接（`core.symlinks=false`） | `@xcoder/app` 类型检查报 `TS1128` | `bun run check` |

> 复现说明：`packages/app`、`packages/ui`、`packages/session-ui`、`packages/core` 的测试必须用各自的
> `bun run test` 脚本运行（`core` 会注入隔离的 `HOME`/`XDG_*`/`CODER_TEST_HOME`）；直接 `bun test`
> 会额外触发 `preload.test.ts` 等失败。`@xcoder/app` 类型检查可通过临时把
> `packages/ui/src/custom-elements.d.ts` 内容复制到 `packages/app/src/custom-elements.d.ts` 通过（核对后还原）。
