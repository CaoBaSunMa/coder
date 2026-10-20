# Coder / OpenCode / MiMoCode 功能对比（COMPARISON.md）

本文件对比三个终端原生 AI 编程 agent 的功能面，用于本分支（**Coder**）的定位决策。
配合 `BRAND.md` 阅读：`BRAND.md` 记录本分支的品牌与部署规则，本文件记录**与上游及其它分支的功能差异**。

## 1. 三者关系（血统）

| 项目 | 出处 | 与 Coder 的关系 |
| --- | --- | --- |
| **OpenCode** | `anomalyco/opencode`（MIT） | **上游母体**。本分支的 `dev` 基线 |
| **Coder** | 本仓库（基于 OpenCode **V2 `dev`**） | 直接 fork：改品牌 + 信创适配，**功能集随上游同步** |
| **MiMoCode** | 小米 MiMo 团队 `XiaomiMiMo/MiMo-Code`（MIT + 使用限制 + 商标政策） | **同样基于 OpenCode**，但在其上自研了记忆/编排/语音层 |

三者不是并列产品，而是「一条主干 + 两个方向不同的分支」：

```
                 OpenCode (anomalyco, 上游主干)
                    │                    │
        品牌 fork ──┘                    └── 功能 fork
              │                                 │
         Coder (本仓库)                     MiMoCode (小米)
   ≈ 上游能力，只换品牌与部署             OpenCode 内核 + 自研上层
```

MiMoCode 的 npm 包内仍保留 `packages/opencode/dist/...` 路径，可直接确认其 OpenCode 血统。

## 2. 功能对比总表

| 维度 | OpenCode | Coder（本仓库） | MiMoCode |
| --- | --- | --- | --- |
| **形态** | TUI / 桌面端 / IDE 扩展 / Web / SDK | **与上游一致**（同代码库） | TUI / 桌面端 / IDE 扩展 / Web |
| **Agent 模式** | `build` / `plan`（Tab 切换） | **一致** | `build` / `plan` / **`compose`**（规格驱动编排） |
| **子 agent** | 有 | **一致** | 有；含生命周期跟踪、取消、后台执行 |
| **持久记忆** | 无内建 | **无** | ✅ **核心卖点**：`MEMORY.md` + `checkpoint.md` + `tasks/<id>/progress.md`、`notes.md`；SQLite FTS5；跨会话自动注入 |
| **上下文管理** | 自动压缩 | **一致** | ✅ 自动 checkpoint + 上下文重建 + 预算化注入 |
| **任务系统** | 有 | **一致** | ✅ 树形任务系统，与 checkpoint 联动 |
| **Skills** | 有 | **一致**（`.coder/skills`） | 20+ 内置 skills；`/skill-name` 调用或按相关性自动匹配 |
| **Workflows** | 无 | **无** | ✅ 确定性多 agent 编排脚本（`compose`、`deep-research`、`fact-check`、`research-experiment`） |
| **Goal / Stop 判定** | 无 | **无** | ✅ 判题模型，防止自主任务提前停止 |
| **语音输入** | 无 | **无** | ✅ 实时流式语音（TenVAD + MiMo ASR） |
| **知识沉淀 / 提炼** | 无 | **无** | ✅ `/dream` 沉淀知识、`/distill` 提炼可复用工作流 |
| **MCP / LSP / 自定义工具 / 权限 / 格式化 / Rules / 命令** | 全有 | **一致** | 有 |
| **会话分享** | 有 | **一致** | 有（Share Sessions） |
| **模型接入** | 任意 provider + OpenCode Zen | **一致**；另内置离线模型快照，可用 `CODER_MODELS_URL` / `CODER_MODELS_PATH` 覆盖 | MiMo Auto（限时免费匿名通道）+ 任意 provider + 从 Claude Code 导入认证 + OAuth（小米 / xAI 等） |
| **品牌 / 本地化** | 英文为主，多语 | ✅ 完全本地化：`coder` 命令、`@xcoder/*` scope、`CODER_*` 变量、C 记号字标、TUI i18n 切片、信创文档 | MiMo 品牌；中英双语，中文优先 |
| **许可** | MIT | MIT（保留上游版权声明） | MIT + Use Restrictions + 商标政策 |

## 3. 关键差异（一句话）

- **Coder vs OpenCode：能力等价，只换皮。**
  除品牌（命令 `coder`、scope `@xcoder/*`、环境变量 `CODER_*`、配置目录 `.coder/` 与 `~/.config/coder`、
  端口 `0xC1DE`、C 记号字标）与信创适配（离线模型快照、内网源 `CODER_NPM_REGISTRY`、占位域名）外，
  **功能集与上游逐版本同步**，不含自研功能层。命名规则与保留项见 `BRAND.md` 第 1、5 节。

- **Coder vs MiMoCode：同源不同路。**
  MiMoCode 在 OpenCode 之上做了**大量上层自研**（持久记忆、上下文重建、树形任务、compose 编排、
  workflows、判题模型、语音、知识沉淀）；Coder 则是「底层不动、功能对齐上游」。

- **OpenCode vs MiMoCode：**
  MiMoCode = OpenCode 内核 + 小米记忆/编排/语音层 + MiMo 模型生态（`MiMo Auto` 免费通道是获客抓手）。

## 4. 对本分支的结论与建议

1. 若目标是**信创环境下与上游能力对齐**，Coder 当前路线正确：原样落地 OpenCode 的策略，
   不引入额外维护负担，上游合并只走 `BRAND.md` 第 4 节的 rebrand 冲突规则。
2. 若后续要引入 MiMoCode 那类能力（持久记忆、多 agent 编排），注意它们属**在 OpenCode 之上新增的子系统**，
   与 Coder「零功能偏离」的定位冲突。建议二选一：
   - **保持纯换皮**：合上游最省力，沿用现有 rebrand 脚本 + `BRAND.md` 流程；
   - **或明确自研**：把记忆/编排作为独立模块单独建包（如 `packages/memory`），
     与上游同步时只处理 rebrand 冲突，避免污染合并路径。

## 5. 资料来源

- OpenCode 文档：<https://opencode.ai/docs/>
- MiMoCode 文档与包元数据：<https://mimo.xiaomi.com/mimocode/start>、<https://www.npmjs.com/package/@mimo-ai/cli>
- 本分支品牌与部署规则：`BRAND.md`

> 注：上游迭代较快，本表按 2026-10 的公开文档与包元数据整理；引入具体能力前请复核对应版本的官方文档。
