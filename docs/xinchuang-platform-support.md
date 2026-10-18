# Coder（OpenCode V2 分支）信创平台支持可行性报告

> 文档日期：2026-10-18
> 适用仓库：本仓库 `coder`（产品名 **Coder**，内部标识 `@xcoder`，CLI 可执行文件名 `coder` / `coder2`，Node 变体 `coder2-node`）
> 结论对象：能否在国内信创 CPU（x86_64 海光/兆芯、ARM64 鲲鹏/飞腾、LoongArch64 龙芯、SW64 申威）与操作系统（麒麟 V10、统信 UOS、中科方德）上**运行或移植** Coder 的 CLI、桌面端与运行时。

---

## 0. 阅读约定与本报告的依据标注

本文所有判断区分两类来源，正文中用标签显式标注：

- **【仓库证据】** —— 直接来自本仓库源码/构建脚本/CI 的可核对事实，均给出 `文件:行号`。
- **【外部资料】** —— 来自上游官方文档或社区项目的公开信息，均给出链接。
- **【推断】** —— 基于上述两类证据的分析结论，非直接事实。

**可行性标签定义**（严格按题意使用三者）：

| 标签 | 含义 |
| --- | --- |
| ✅ 已验证 | 上游运行时与仓库构建矩阵**均已原生支持**该架构，官方产线已在稳定产出该目标，可直接复用，无需改代码。⚠️ 本报告受环境限制**未在信创实机运行**，因此"已验证"指"官方工具链与产物链路成立"，落地前仍须执行第 10 节的现场冒烟清单。 |
| 🟡 理论可行需工作 | 需要扩展构建矩阵、补齐原生预编译产物（prebuild）或移植底层依赖后才能产出可用二进制。 |
| ❌ 不可行 | 当前没有可用的运行时或构建工具链，短期内无法在合理成本内达成。 |

**重要澄清（关于旧世界/新世界）**：LoongArch64 存在两套互不兼容的软件 ABI 体系——**旧世界**（Kylin V10、Loongnix 20、UOS V20，内核 4.19/5.4/5.10，glibc 2.28，Node 14.16.1）与**新世界**（内核 ≥5.19、glibc ≥2.36、Node ≥18）。本报告对龙芯的可行性结论**只对新世界成立**，旧世界因 glibc 过旧而基本不可行。【外部资料】

---

## 1. 目标与范围

### 1.1 Coder 的三种交付形态【仓库证据】

| 形态 | 产物 | 构建脚本 | 运行时 |
| --- | --- | --- | --- |
| CLI（主） | `cli-<os>-<arch>/bin/coder`（单文件可执行） | `packages/cli/script/build.ts` | Bun（`bun build --compile`） |
| CLI（Node 变体） | `cli-node-<os>-<arch>/bin/coder2-node` | `packages/cli/script/build-node.ts` | Node SEA（Single Executable Application，Node 26.4.0） |
| 桌面端 | `coder-desktop-<os>-<arch>.<ext>`（dmg/zip、nsis、AppImage/deb/rpm），内部捆绑 CLI | `packages/desktop/electron-builder.config.ts` | Electron 44.4.5 |

三者共同依赖一批**原生预编译组件**（native prebuilds），这是信创适配的真正难点，而不是 JS 代码本身。

### 1.2 目标平台

- CPU：x86_64（海光 Hygon、兆芯 Zhaoxin）、ARM64（鲲鹏 Kunpeng、飞腾 Phytium）、LoongArch64（龙芯）、SW64（申威）
- OS：银河麒麟 V10、统信 UOS、中科方德（均为 glibc 系 Linux）；另评估 musl 场景
- 优先级：P0 = x86_64 + ARM64（麒麟/统信，glibc/musl）；P1 = LoongArch64（Node SEA 路线）；P2 = 申威/其他

---

## 2. 结论速览

### 2.1 平台可行性总表

| CPU 架构 | OS / 环境（libc） | CLI（Bun） | CLI（Node SEA） | 桌面端（Electron） | 综合结论 |
| --- | --- | --- | --- | --- | --- |
| x86_64（海光；兆芯 KX-7000，含 AVX2） | 麒麟 V10 / UOS / 方德（glibc） | ✅ | ✅ | ✅ | **优先落地**，仅需现场冒烟 |
| x86_64（兆芯 KX-6000，无 AVX2） | 同上（glibc） | ✅（baseline 分支） | ✅ | ✅ | 可用，安装脚本自动回退 baseline |
| ARM64（鲲鹏 920 / 飞腾 S2500+） | 麒麟 V10 / UOS / 方德（glibc） | ✅ | ✅ | ✅ | **优先落地** |
| LoongArch64 **新世界** | Kylin V11 / UOS V25 / Debian loong64（glibc ≥2.36） | ❌（无官方 Bun） | 🟡 | 🟡（社区 Electron） | **P1**：走 Node SEA 路线 |
| LoongArch64 **旧世界** | Kylin V10 / UOS V20 龙芯版（glibc 2.28） | ❌ | ❌ | ❌ | 需先迁移到新世界 |
| SW64（申威） | 麒麟 / UOS 申威版 | ❌ | ❌ | ❌ | **短期不可行** |
| 任意（musl 环境，如 Alpine 容器） | musl | ✅ | ❌ | 不适用 | 仅 CLI | 

### 2.2 一句话结论

【推断】

1. **P0（x86_64 + ARM64）可直接落地**：本仓库的 CLI/Node/桌面三条产线已原生覆盖这两个架构，在麒麟/UOS 上属"构建后冒烟即可"，工作量集中在 OS 兼容性验证而非架构移植。
2. **P1（LoongArch64）**：Bun 路线被上游卡住（Bun 无官方 loong64 产物，编译目标不支持），**唯一现实路径是基于 Node SEA 的 `coder2-node` 扩展**，但它仍需补齐 6 类原生 prebuild 并扩展架构校验器与安装脚本。
3. **SW64 短期不可行**：无 Node/Chromium/Electron/Bun 任一运行时可用，且无社区移植基础。

---

## 3. 仓库证据：现有构建/发布矩阵

### 3.1 CLI（Bun）编译目标矩阵【仓库证据】

`packages/cli/script/build.ts:37-55` 的 `allTargets`：

```ts
// LOGIC: 12 个目标 = {linux,darwin,win32} × {x64,arm64} × {默认,baseline} + linux 的 musl 变体
{ os: "linux",  arch: "arm64" }
{ os: "linux",  arch: "x64" }
{ os: "linux",  arch: "x64", avx2: false }          // baseline（无 AVX2）
{ os: "linux",  arch: "arm64", abi: "musl" }
{ os: "linux",  arch: "x64",   abi: "musl" }
{ os: "linux",  arch: "x64",   abi: "musl", avx2: false }
{ os: "darwin", arch: "arm64" }
{ os: "darwin", arch: "x64" }
{ os: "darwin", arch: "x64", avx2: false }
{ os: "win32",  arch: "arm64" }
{ os: "win32",  arch: "x64" }
{ os: "win32",  arch: "x64", avx2: false }
```

- 编译方式：`Bun.build` 的 `compile.target = bun-<os>-<arch>`（`build.ts:178`），即**依赖 Bun 官方的交叉编译目标**。
- 可执行文件来源：`compileExecutable()`（`build.ts:228-264`）在 `BUN_COMPILE_RELEASE` 存在时，从 `https://api.github.com/repos/oven-sh/bun/releases/tags/<release>` 解析并下载 `bun-<platform>-<arch>[-musl][-baseline].zip`；若资产不存在则**直接抛错**：`build.ts:250` —— `Bun release ${release} does not include ${name}.zip`。
- 固定版本：CI 中 `BUN_COMPILE_RELEASE: bun-v1.4.2`（`.github/workflows/publish.yml:101`），根 `package.json:8` 的 `packageManager` 也是 `bun@1.4.2`。

**含义**：新增架构（如 loong64）在 Bun 路线下，**前提是上游 oven-sh/bun 发布了对应架构的 release zip**，否则构建脚本在下载阶段就会失败。仓库没有"自建 Bun 二进制注入"的开关。【推断】

### 3.2 CLI（Node SEA）目标矩阵【仓库证据】

`packages/cli/script/build-node.ts:37-43`：

```ts
const allTargets = [
  nodeTarget("linux", "arm64"),
  nodeTarget("linux", "x64"),
  nodeTarget("darwin", "arm64"),
  nodeTarget("win32", "arm64"),
  nodeTarget("win32", "x64"),
]
```

- 版本锁定：`const NODE_VERSION = "26.4.0"`（`build-node.ts:19`），从 `https://nodejs.org/dist/v26.4.0` 下载官方 Node（`build-node.ts:200`）。
- 架构白名单：`packages/cli/src/node/target.ts:5-8` 的 `nodeTarget()` 只接受 `platform ∈ {darwin,linux,win32}` 且 `arch ∈ {arm64,x64}`，否则抛 `Unsupported Node executable target`。
- 目的是给 Bun CLI 提供"无 Bun 依赖"的备选实现（`build-node.ts:59` 明示 macOS x64 因 Node 26.4 SEA 不支持而排除）。

**含义**：Node SEA 路线同样**硬编码**了平台/架构白名单，且下载源固定为 nodejs.org 官方 dist。LoongArch64 不在官方 dist，需要改用 `unofficial-builds` 或龙芯工具链，并扩展白名单与下载逻辑。【推断】

### 3.3 桌面端（Electron）打包矩阵【仓库证据】

- CLI 目标映射（`packages/desktop/scripts/utils.ts:22-59`）`CLI_BINARIES` 仅 6 项：`darwin-arm64`、`darwin-x64`、`win32-arm64`、`win32-x64`、`linux-x64`、`linux-arm64`（**注意：桌面端没有 musl 目标**）。
- 架构硬校验（`packages/desktop/electron-builder.config.ts:120-125`）：`afterPack` 中若非 `x64/arm64` 直接 `throw new Error("Unsupported desktop architecture")`，并要求打包架构与 CLI 目标架构一致。
- 原生库校验（同文件 `:132`、`:147-159`）：对捆绑的 `coder-cli` 与 `node-pty` 预编译 `.node` 调 `NativeArch.verify`。
- CI 矩阵（`.github/workflows/publish.yml:336-359`）6 条：mac x64/arm64、win arm64/x64、ubuntu x64/arm64；打包目标 `mac dmg/zip`、`win nsis`、`linux AppImage/deb/rpm`（`electron-builder.config.ts:177/188/209`）。

### 3.4 原生预编译依赖矩阵【仓库证据】

`bunfig.toml:5` 的 `minimumReleaseAgeExcludes` 列出了全部"必须在解析后立即允许"的原生包，结合 `packages/cli/package.json` 可归纳如下（这正是信创适配的**真实依赖清单**）：

| 依赖包（模式） | 作用 | 现有 prebuild 平台 | 是否有 loong64 / sw64 |
| --- | --- | --- | --- |
| `@opentui/core-{darwin-arm64,darwin-x64,linux-arm64,linux-arm64-musl,linux-x64,linux-x64-musl,win32-arm64,win32-x64}` | TUI 渲染原生核心 | 8 | ❌ |
| `@opencode-ai/pty-{darwin-arm64,darwin-x64,linux-arm64-gnu,linux-arm64-musl,linux-x64-gnu,linux-x64-musl}` | 持久化 PTY 辅助进程 | 6 | ❌ |
| `@ff-labs/fff-bin-*`（同上 8 平台） | 模糊搜索原生库 | 8 | ❌ |
| `@yuuang/ffi-rs-{darwin-arm64,linux-arm64-gnu,linux-x64-gnu,win32-arm64-msvc,win32-x64-msvc}` | FFI 绑定 | 5 | ❌ |
| `@parcel/watcher-{darwin-arm64,linux-arm64-glibc,linux-x64-glibc,win32-arm64,win32-x64}` | 文件监听 | 5 | ❌ |
| `@lydell/node-pty-*`（darwin/linux/win32 × arm64/x64） | 桌面端终端 | 6 | ❌ |

> pty 解析逻辑见 `packages/cli/script/opencode-pty.ts:21-33`（仅 darwin/linux 且仅 arm64/x64，包名后缀 `glibc→gnu`）；Node 侧资产名见 `packages/cli/src/node/target.ts:12-16`。

**含义**：即使 JS 运行时（Node）在 loong64 可用，上述 6 类原生依赖**全部没有 loong64 预编译产物**，必须逐个从源码移植/编译。这是 P1 工作量的主体。【推断】

### 3.5 架构校验器只认识 x64/arm64【仓库证据】

`script/native-arch.ts:11-13`：

```ts
const PE_MACHINES   = { 0x8664: "x64", 0xaa64: "arm64", 0x014c: "x86", 0x01c4: "arm" }
const ELF_MACHINES  = { 62: "x64", 183: "arm64", 3: "x86", 40: "arm" }        // 无 258(LoongArch) / SW64
const MACHO_CPUS    = { 0x01000007: "x64", 0x0100000c: "arm64", 7: "x86", 12: "arm" }
```

- `NativeArch.verify(file, arch: "x64" | "arm64")`（`native-arch.ts:32`）类型即限死两架构。
- 调用点：`packages/cli/script/build.ts:208`、`build-node.ts:137`、`packages/desktop/electron-builder.config.ts:132` 与 `:158`。

**含义**：新增架构必须同步扩展 `ELF_MACHINES`（LoongArch64 的 `e_machine = 258`）并放开 `verify` 的类型与全部调用点，否则构建会在校验阶段失败。这是一项**具体、可枚举的工作项**。【推断】

### 3.6 安装脚本的平台白名单【仓库证据】

`install:112-119` 的组合白名单仅 `linux-x64|linux-arm64|darwin-x64|darwin-arm64|windows-x64|windows-arm64`，其余直接 `Unsupported OS/Arch` 退出。arch 归一化只识别 `aarch64→arm64`、`x86_64→x64`（`install:88-94`）。musl 检测基于 `/etc/alpine-release` 与 `ldd --version`（`install:121-132`）；baseline（AVX2）检测读 `/proc/cpuinfo`（`install:134-140`）。

**含义**：`loongarch64`/`sw_64` 的 `uname -m` 不在归一化表内，即使二进制存在，安装脚本也会拒绝——须扩展归一化与白名单。

---

## 4. 运行时可行性分析

### 4.1 Bun

- Bun `bun build --compile` 的**官方支持目标**（`Bun.Build.CompileTarget`）仅：`darwin-x64/arm64`、`linux-x64/arm64`（+musl，+`baseline-musl`）、`windows-x64/arm64`——**没有 loong64，也没有 sw64**。【外部资料：https://bun.com/docs/bundler/executables】
- Bun 自身的 LoongArch64 支持仍为未实现：issue #15839「LoongArch64 support」2024-12-18 创建，2025-07-18 被指派，2026-04-03 仍有社区追问，2026-08-04 **被取消指派（removed their assignment）**，当前状态仍为 Open。【外部资料：https://github.com/oven-sh/bun/issues/15839】
- 社区/发行版存在非官方 loong64 Bun（如 Loong Arch Linux 的 `extra` 仓库），但非上游、版本与 ABI 不受控，**不建议作为产线依赖**。【外部资料：https://loongarchlinux.org/package/?repo=extra&arch=loong64&name=bun】
- 补充事实：上游最新文档指出 x64 版 Bun **统一以 Nehalem（SSE4.2）为基线、运行时按 CPU 派发 AVX2/AVX-512**，`-baseline`/`-modern` 后缀仅为向后兼容而保留。这对**兆芯 KX-6000（无 AVX2）**尤其重要。【外部资料：https://bun.com/docs/bundler/executables】

**结论**：Bun 路线在 x86_64/ARM64 原生可用；**LoongArch64 与 SW64 在 Bun 路线下不可行**。

### 4.2 Node.js

- Node 官方 BUILDING.md 将 **GNU/Linux loong64** 列为 **Experimental**（"可能编译不过或测试集不通过；核心团队不为这些平台出 release"）。【外部资料：https://github.com/nodejs/node/blob/main/BUILDING.md】
- 官方 nodejs.org dist **不提供** loong64 二进制；社区 **unofficial-builds** 项目提供 `linux-loong64` recipe（用龙芯工具链交叉编译），支持 `>= v23`，另有 `v20.10+`、`v21`、`v22.14+`，并明确声明"无任何保证、基本未经测试"。【外部资料：https://github.com/nodejs/unofficial-builds】
- Node 官方 Linux 二进制（x64/arm64）要求 **glibc ≥ 2.28**——这一点与麒麟 V10/UOS（glibc 2.28）刚好卡在边界。【外部资料：https://github.com/nodejs/node/blob/main/BUILDING.md】

**结论**：x86_64/ARM64 的 Node 官方支持良好；LoongArch64 需依赖 unofficial-builds（可作 P1 基础，但需接受其不稳定定位）；SW64 无任何 Node 产物。

### 4.3 Electron

- 无官方 LoongArch/申威构建。社区项目 `darkyzhou/electron-loong64` 提供 loong64 版 Electron（基于 AOSC 的 Chromium loongarch64 补丁），**要求 glibc ≥ 2.38（即新世界）且 CPU 支持 LSX**；并有配套的 `electron-builder` 移植（`LoongDotJS/electron-builder`，已发布 `26.15.6`/`26.0.12`/`25.1.8` 等分支）。【外部资料：https://github.com/darkyzhou/electron-loong64 ；https://github.com/LoongDotJS/electron-builder】
- 本仓库桌面端使用 `electron 44.4.5` 与 `electron-builder 26.15.7`（`packages/desktop/package.json:49,53-54`），与社区移植的版本线（26.15.x）接近，但仍属**社区分支**，非官方维护。【仓库证据 + 外部资料】

**结论**：桌面端 loong64 只能基于社区 Electron + 社区 electron-builder，且必须运行在 glibc ≥ 2.38 的新世界发行版；SW64 无 Electron。

---

## 5. 按 CPU 架构分析

### 5.1 x86_64（海光 Hygon / 兆芯 Zhaoxin）—— ✅ 已验证

- 海光基于 AMD Zen 授权，支持 AVX2，等价于标准 x86_64 Linux 服务器，**无特殊适配**。
- 兆芯分两代：**KX-6000/KH-30000 仅支持到 AVX（无 AVX2）**，**KX-7000/KH-40000 起支持 AVX2**。本仓库已为 x64 提供 `avx2: false` 的 baseline 目标（`build.ts:45,48,51,54`），安装脚本也按 `/proc/cpuinfo` 自动切换到 `-baseline`（`install:134-140`）。
- 上游最新文档进一步说明 Bun 的 x64 单文件已统一以 SSE4.2 为基线并运行时派发（见 §4.1），因此**兆芯 KX-6000 亦可运行**（pinned 的 Bun 1.4.2 是否已合并该行为需按 §10 实测确认）。【外部资料】

**结论**：海光 = 直接可用；兆芯 KX-6000 用 baseline 构建/回退即可，KX-7000 无差异。

### 5.2 ARM64（鲲鹏 Kunpeng / 飞腾 Phytium）—— ✅ 已验证

- 本仓库 CLI/Node/桌面三条产线均已原生覆盖 `arm64`（见 §3.1/§3.2/§3.3），Linux arm64 同时有 glibc 与 musl 版。
- 麒麟 V10/UOS 的 ARM64 版本均为标准 glibc（≥2.28），与 Node/Bun/Electron 的 Linux ARM64 产物兼容。
- 唯一注意事项：**飞腾部分早期核心为 ARMv8.0，无 LSE 原子指令**，个别原生库可能有性能或兼容差异，但非阻断性，属冒烟阶段核查项。【推断】

### 5.3 LoongArch64（龙芯）—— 🟡 理论可行需工作

**分世界讨论**（依据【外部资料】https://areweloongyet.com/docs/old-and-new-worlds/ 及 https://liblol.aosc.io）：

| 世界 | 代表发行版 | 内核 | glibc | Node | 结论 |
| --- | --- | --- | --- | --- | --- |
| 旧世界 | 麒麟 V10、Loongnix 20、UOS V20（龙芯） | 4.19/5.4/5.10 | **2.28** | 14.16.1 | ❌ 不可行 |
| 新世界 | Kylin V11、UOS V25、Loongnix 25、Debian loong64、AOSC OS | ≥5.19（常见 ≥6.1） | **≥2.36** | ≥18 | 🟡 走 Node SEA |

- **Bun 路线（CLI 主产物）**：❌。上游无 loong64 编译目标，也无官方 loong64 release zip；`build.ts` 会在 `compileExecutable` 处直接失败。
- **Node SEA 路线**：🟡 唯一现实路径，但有三大前置工作：
  1. 扩展 `nodeTarget()` 白名单与下载源（改用 unofficial-builds 或龙芯工具链自建 Node）；
  2. 将 `NODE_VERSION` 切到有 loong64 产物的版本线（loong64 支持 `>= v23`），当前锁定的 26.4.0 需确认 unofficial-builds 是否已产出；
  3. 补齐 §3.4 的 6 类原生 prebuild。
- **桌面端**：🟡 需社区 `electron-loong64`（glibc ≥2.38 + LSX）+ `LoongDotJS/electron-builder`，且必须跑在新世界。

### 5.4 SW64（申威）—— ❌ 不可行

- 无官方/主流 Node、Bun、Chromium、Electron、ffi-rs、node-pty、parcel/watcher 的 SW64 产物，也无成熟社区移植。
- 申威生态多为自研或 OpenEuler-SW64 生态，通用 Node/Electron 栈缺失。
- 【推断】在可预见周期内，SW64 上无法以合理成本运行 Coder 的任一交付形态。若业务必须覆盖申威，应走**独立的技术预研 + 长期共建**，不在本报告承诺范围内。

---

## 6. 按操作系统 / libc 分析

| OS | 基础 | libc | glibc 版本 | 与 Node/Bun/Electron 兼容性 |
| --- | --- | --- | --- | --- |
| 银河麒麟 V10（x86_64/ARM64） | 部分基于 Debian 11 / openEuler | glibc | 2.28（部分 SP 为 2.31） | ✅ 卡在 Node 的最低线 2.28，可用 |
| 统信 UOS V20 | Debian 系 | glibc | 2.28 | ✅ 同麒麟 |
| 中科方德桌面 V5.0 | kernel 5.4 系 | glibc | 2.x 系 | ✅ 结构同类 |
| Kylin V11 / UOS V25（新世界 LoongArch） | — | glibc | ≥2.36 | ✅ 满足 Electron loong64 的 2.38？**需实测**（2.36 < 2.38，可能需 V25+） |
| Alpine / musl 容器 | musl | musl | — | CLI 的 musl 目标 ✅；Node SEA ❌（仅 glibc）；桌面不适用 |

**关键风险点（glibc 基线）**：x86_64/ARM64 的产线构建宿主为 `ubuntu-2404`（glibc 2.39，见 `publish.yml:78/203` 等），但真正决定运行时兼容下限的是**产线中各原生组件的 prebuild 基线**（node-pty/opentui/fff/ffi-rs/parcel-watcher 由各自上游编译）。需在麒麟 V10/UOS（glibc 2.28）实机用 `ldd`/`readelf -V` 核查是否存在更高 glibc 符号版本依赖——这是 P0 冒烟的首要项。【推断】

---

## 7. 组件级可行性矩阵

| 组件 | x86_64 | ARM64 | LoongArch64（新世界） | SW64 |
| --- | --- | --- | --- | --- |
| 核心 JS/TS 业务逻辑（纯 JS） | ✅ | ✅ | ✅（架构无关） | ✅（架构无关） |
| Bun 运行时 | ✅ | ✅ | ❌ | ❌ |
| Node 运行时 | ✅ | ✅ | 🟡（unofficial-builds） | ❌ |
| CLI 单文件（Bun compile） | ✅ | ✅ | ❌ | ❌ |
| CLI Node SEA（coder2-node） | ✅ | ✅ | 🟡 | ❌ |
| TUI（@opentui/core 原生核心） | ✅ | ✅ | 🟡（需移植 prebuild） | ❌ |
| PTY（@opencode-ai/pty / node-pty） | ✅ | ✅ | 🟡（需移植） | ❌ |
| 模糊搜索（fff） | ✅ | ✅ | 🟡（需移植） | ❌ |
| FFI（ffi-rs） | ✅ | ✅ | 🟡（需移植） | ❌ |
| 文件监听（@parcel/watcher） | ✅ | ✅ | 🟡（需移植） | ❌ |
| 桌面 Electron | ✅ | ✅ | 🟡（社区 Electron） | ❌ |
| 架构校验 / 安装脚本 | ✅ | ✅ | 🟡（需扩展） | ❌ |

---

## 8. 工作项、工作量与风险

> 工作量为人日（PD）粗估，含编码、联调、冒烟；不含硬件采购与等待上游。风险等级：低/中/高。

### P0：x86_64 + ARM64（麒麟/UOS/方德，glibc + musl）

| # | 工作项 | 证据/位置 | 工作量 | 风险 |
| --- | --- | --- | --- | --- |
| P0-1 | 在麒麟 V10 / UOS（x86_64、ARM64）实机安装并冒烟 CLI | §3.1 | 2-4 PD | 低 |
| P0-2 | 核查全部原生 prebuild 的 glibc 符号版本底线（ldd/readelf） | §6 风险点 | 3-5 PD | 中（可能触发替换/降级组件） |
| P0-3 | 扩展 `install` 脚本的 OS 兼容（麒麟/UOS 的 `uname -s` 判定与 musl 探测） | `install:80-132` | 1-2 PD | 低 |
| P0-4 | musl 场景端到端验证（CLI musl 目标 + node-pty/opentui musl prebuild） | `build.ts:46-48` | 2-3 PD | 中 |
| P0-5 | 兆芯 KX-6000（无 AVX2）baseline 路径实测 | `install:134-140` | 1-2 PD | 低 |
| P0-6 | 桌面端（AppImage/deb/rpm）在麒麟/UOS 安装运行冒烟 | §3.3 | 3-5 PD | 中（桌面依赖差异） |

小计：约 12-21 PD。

### P1：LoongArch64（新世界，Node SEA 路线）

| # | 工作项 | 证据/位置 | 工作量 | 风险 |
| --- | --- | --- | --- | --- |
| P1-1 | 扩展 `nodeTarget()` 支持 loong64 + 切换到可用 Node 版本/下载源（unofficial-builds/自建） | `src/node/target.ts:5-8`、`build-node.ts:19,200` | 3-5 PD | 中 |
| P1-2 | 扩展 `NativeArch`：新增 ELF `e_machine=258`（LoongArch64），放开 `verify` 类型与调用点 | `script/native-arch.ts:11-13,32` | 2-3 PD | 低 |
| P1-3 | 移植/自建 `@lydell/node-pty` loong64 | §3.4 | 5-10 PD | 高（含原生编译与稳定性） |
| P1-4 | 移植/自建 `@opentui/core` loong64（TUI 渲染核心） | §3.4 | 5-10 PD | 高 |
| P1-5 | 移植/自建 `@ff-labs/fff-bin`、`@yuuang/ffi-rs`、`@parcel/watcher` loong64 | §3.4 | 8-15 PD | 高 |
| P1-6 | 扩展 `install` 脚本识别 `loongarch64`/`loong64` | `install:88-119` | 1-2 PD | 低 |
| P1-7 | CLI Node SEA 在 loong64 实机/模拟机冒烟（服务、PTY、TUI、web） | §10 | 5-8 PD | 中 |
| P1-8 | （可选）桌面端基于社区 Electron/e-builder 构建 | §4.3 | 10-20 PD | 高（依赖社区分支与 glibc ≥2.38） |

小计：CLI 主体约 29-51 PD；桌面端另计 10-20 PD。**总量取决于 P1-3~P1-5 的原生移植能否对齐上游**。

### P2：SW64（申威）与其他

| # | 工作项 | 工作量 | 风险 |
| --- | --- | --- | --- |
| P2-1 | 技术预研：Node/Bun/Chromium 在 SW64 的可用性评估 | 5-10 PD（仅结论） | 极高 |
| P2-2 | 结论：短期不立项 | — | — |

---

## 9. 建议路线

### 9.1 分阶段落地

1. **阶段一（P0，1-2 个迭代）**：在 x86_64（海光/兆芯）与 ARM64（鲲鹏/飞腾）的麒麟 V10、UOS 上完成 CLI + 桌面端冒烟，冻结 glibc 兼容基线。**这是投入产出比最高、风险最低的路径。**
2. **阶段二（P1，3-6 个迭代）**：以 **Node SEA 路线**推进 LoongArch64 新世界；先把纯 JS 的 `coder2-node` 跑起来（最小可用：`--version/--help`、服务启动、基本对话），再逐个补齐原生 prebuild（建议优先级：node-pty → opentui → fff/parcel-watcher → ffi-rs）。**不要尝试 Bun 路线**。
3. **阶段三（P1 纵深，可选）**：桌面端 loong64，基于社区 Electron + electron-builder，明确接受其非官方定位与 glibc ≥2.38 约束。
4. **阶段四（P2）**：SW64 仅做预研，不承诺交付。

### 9.2 工程建议

- **统一原生依赖的取用策略**：把 6 类 prebuild 的"平台→包名"映射集中到 `packages/cli/src/node/target.ts` 与 `packages/cli/script/build.ts` 两处，新增架构时只改一处映射表，避免散落硬编码。
- **架构扩展做成数据驱动**：`NativeArch` 的 `ELF_MACHINES`/`PE_MACHINES` 与 `verify` 的架构类型应改为表驱动 + 约定类型，降低未来新增架构成本。
- **安装脚本与构建矩阵同源**：`install` 的白名单、`build.ts` 的 `allTargets`、桌面端 `CLI_BINARIES` 三处目前各写一遍，建议抽公共常量，避免"构建有、安装不认"。
- **对 LoongArch 明确"新世界优先"**：只支持 Kylin V11/UOS V25/Debian loong64 等新世界发行版；旧世界（Kylin V10/UOS V20 龙芯版）明确不支持，避免无谓投入。

---

## 10. 验证方法

### 10.1 环境准备

- **x86_64**：在 x86 物理机/虚拟机上安装麒麟 V10、UOS、方德（KVM/VirtualBox 均可）；兆芯 KX-6000 需真机或能关闭 AVX2 的模拟环境。
- **ARM64**：优先鲲鹏/飞腾真机；无真机时用 QEMU `qemu-system-aarch64`（或 Apple Silicon 上以 `--platform linux/arm64` 的容器做部分验证）。
- **LoongArch64**：新世界真机（3A6000 及以上）最佳；无真机可用 `qemu-user-static` + `binfmt_misc` 运行 loong64 二进制做**功能验证**（性能不可用）。
- **通用**：`docker buildx build --platform linux/arm64|linux/loong64` 构建/运行容器镜像做交叉验证。

### 10.2 CLI 冒烟清单（在目标机执行）

```bash
# 1) 安装（本地二进制方式，跳过架构白名单）
./install --binary /path/to/coder
coder --version
coder --help

# 2) 架构与 libc 自检
file   "$(command -v coder)"
readelf -h "$(command -v coder)" | grep Machine     # 期望 x86-64 / AArch64 / LoongArch
ldd    "$(command -v coder)"                        # 确认无 "not found" 且 glibc 符号可解析

# 3) 服务启动与基本交互（在项目目录内）
cd /path/to/project
coder            # 进入 TUI：验证渲染(OpenTUI)、PTY 终端、文件监听、模糊搜索

# 4) 非交互冒烟
coder --version && coder run "print hello" || true   # 视命令集而定
```

验收点：TUI 无花屏/崩溃、内置终端可开、文件改动实时刷新（@parcel/watcher）、搜索可用（fff）、会话正常收发包。

### 10.3 桌面端冒烟

```bash
# 麒麟/UOS 上
sudo dpkg -i coder-desktop-<ver>-<arch>.deb   # 或 ./Coder-*.AppImage
coder-desktop                                  # 启动 GUI
```

验收点：窗口正常、主题/字体正常、内置终端可用（node-pty）、捆绑的 CLI `coder --version` 正常、协议 `coder://` 可唤起。

### 10.4 构建期校验

- Node SEA 与桌面打包都会调用 `NativeArch.verify`；扩展 loong64 后应能从构建日志确认 `ELF machine 258` 被正确识别，而非抛"must contain only …"。
- 对 CLI 产物运行本仓库既有 `verifyArtifact`（`packages/cli/script/verify-artifact.ts`）确保资产齐全。

### 10.5 CI 矩阵扩展（建议）

在 `.github/workflows/publish.yml` 的 `build-node-cli` 与 `build-cli` 矩阵中增加 loong64 条目（host 需为可产出 loong64 的 runner 或自建 runner / 交叉编译）。当前官方 runner 无 loong64，需自建或依赖模拟，这是 P1 的**基础设施前置项**。【推断】

---

## 11. 参考链接

| 主题 | 链接 |
| --- | --- |
| Bun 单文件可执行 / 支持目标 | https://bun.com/docs/bundler/executables |
| Bun LoongArch64 支持 issue（仍 Open） | https://github.com/oven-sh/bun/issues/15839 |
| Node.js 平台支持（loong64 = Experimental） | https://github.com/nodejs/node/blob/main/BUILDING.md |
| Node.js 非官方构建（linux-loong64 recipe） | https://github.com/nodejs/unofficial-builds |
| Electron LoongArch 移植（glibc ≥2.38 + LSX） | https://github.com/darkyzhou/electron-loong64 |
| electron-builder LoongArch 移植 | https://github.com/LoongDotJS/electron-builder |
| 龙架构旧世界/新世界说明 | https://areweloongyet.com/docs/old-and-new-worlds/ |
| 旧世界兼容层 libLoL | https://liblol.aosc.io |
| 麒麟 / UOS glibc 版本（2.28 / Debian11 2.31） | https://blog.lindexi.com/post/dotnet-8-版本与银河麒麟V10和UOS系统的-glibc-兼容性.html |
| Loong Arch Linux 的 bun 包（社区，仅供参考） | https://loongarchlinux.org/package/?repo=extra&arch=loong64&name=bun |

---

## 12. 总结

1. **x86_64（海光/兆芯）与 ARM64（鲲鹏/飞腾）在麒麟 V10、UOS、中科方德上属于"已验证"级别**：本仓库的 CLI（Bun）、CLI（Node SEA）、桌面端（Electron）三条产线已原生覆盖这两个架构，且上游运行时（Bun/Node/Electron）均官方支持。**落地成本主要是 OS 与 glibc 兼容性冒烟，而非架构移植**。唯一需要留意的是兆芯 KX-6000（无 AVX2）走 baseline 分支，以及各原生 prebuild 的 glibc 下限（建议以 glibc 2.28 为冻结基线）。

2. **LoongArch64 属"理论可行需工作"（P1）**：Bun 路线被上游卡死（无官方 loong64 编译目标与 release），**必须改走 Node SEA 路线**。真正的拦路虎不是 JS 运行时，而是**六类原生 prebuild 全部缺失 loong64**（opentui/core、opencode-pty、fff、ffi-rs、parcel/watcher、node-pty），以及仓库内**架构校验器与安装脚本的硬编码白名单**（`native-arch.ts`、`node/target.ts`、`install`）。这些是可枚举、可分阶段消化的具体工作项，估计 CLI 主体 29-51 人日（不含桌面端）。**前提是目标发行版为新世界（glibc ≥2.36）**；旧世界（Kylin V10/UOS V20 龙芯版，glibc 2.28）不可行。

3. **SW64（申威）属"不可行"**：无任何主流 JS 运行时可用的移植基础，短期不立项。

4. **建议**：先做 P0（投入小、见效快、直接可交付），再以"先 JS 跑通、后逐个补原生库"的节奏推进 P1，桌面端 loong64 作为可选纵深，并明确接受社区 Electron 的非官方定位。
