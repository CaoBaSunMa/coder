# Coder TUI 国际化（i18n）

> 本文说明 Coder TUI（`packages/tui`）第一版简体中文（`zh`）本地化切片的启用方式、字典结构、扩展方式，以及当前已覆盖与尚未覆盖的界面范围。
>
> 设计原则：**默认行为完全不变**。未配置语言时，TUI 输出的每一个字符串都与本地化之前逐字节一致，因此现有测试与快照无需改动。

---

## 1. 快速启用

三种方式任选其一，优先级从高到低：

| 优先级 | 来源 | 取值 | 说明 |
| --- | --- | --- | --- |
| 1 | 配置项 `locale` | `"en"` / `"zh"` | 显式指定，优先级最高 |
| 2 | 环境变量 `CODER_LOCALE` | `en` / `zh` / `zh-CN` / `en-US` … | 项目级覆盖 |
| 3 | 环境变量 `LC_ALL`，其次 `LANG` | 同上 | 跟随系统/终端区域设置 |
| 4 | 兜底 | — | 未匹配到任何来源时使用 `en`（英文） |

> 只识别 `en` 与 `zh` 两个语言族：`zh`、`zh-CN`、`zh_CN`、`zh-TW` 等都归一到 `zh`；`en`、`en-US` 等都归一到 `en`。其它语言（如 `fr`、`ja`）当前不识别，会**回落到英文**，不会报错。

### 1.1 通过配置文件

TUI 配置中的 `locale` 字段（与 `theme`、`keybinds` 等并列）：

```jsonc
{
  "locale": "zh"
}
```

该字段会经由既有配置链路自动派生到 CLI 侧（`packages/cli/src/config/schema.ts` 直接展开 TUI 的 `Config.Info.fields`），无需额外接线。

### 1.2 通过环境变量

```bash
# 显式指定
CODER_LOCALE=zh coder

# 或跟随系统区域设置
LANG=zh_CN.UTF-8 coder
LC_ALL=zh_CN.UTF-8 coder
```

### 1.3 通过设置对话框

在 TUI 内打开设置（默认 `ctrl+,` / 命令面板 “Open settings”），**Appearance** 分类下新增 **Language** 项，可在 `English` 与 `简体中文` 之间切换。该项写入的正是配置项 `locale`。

---

## 2. 字典结构

核心模块：`packages/tui/src/util/i18n.ts`（纯函数，无第三方依赖）。

```ts
export type Locale = "en" | "zh"

// 文案要么是单条模板，要么是按 count 选择单/复数的两条模板
export type Message = string | { readonly one: string; readonly other: string }

export const en = { ... } satisfies Record<string, Message>

// MessageKey 从英文词典派生，是唯一的键集合真源
export type MessageKey = keyof typeof en

// 中文词典必须逐键覆盖，否则类型报错
export const zh: Record<MessageKey, Message> = { ... }
```

要点：

- **英文是唯一真源**。新增键只能先加到 `en`，`MessageKey` 会自动扩展；`zh` 缺少任何键都会在 `bun typecheck` 阶段报错。
- **插值**使用 `{name}` 占位符，例如 `"app.terminalTitle": "Coder | {title}"`，调用为 `t("app.terminalTitle", { title })`。缺失的参数会原样保留占位符。
- **复数**用 `{ one, other }` 对象表示，按 `params.count` 选择：`count === 1` 取 `one`，否则取 `other`。例如：

  ```ts
  "footer.subagents": { one: "{count} subagent", other: "{count} subagents" }
  ```

- **大小写敏感**：英文里同一个词可能既有首字母大写版本又有小写版本（例如 `Favorite` / `favorite`），因此存在 `model.favorite` 与 `model.favoriteLower` 等成对键，便于在句首/句中分别使用。

---

## 3. 运行时接线

- `packages/tui/src/context/i18n.tsx`
  - `I18nProvider`：读取已解析的 `Config`，用 `createMemo(() => createTranslator(config.data.locale))` 绑定当前语言；切换配置即全局生效。
  - `useI18n()`：返回 `{ locale, t }`。**没有 Provider 时回落到英文**（`defaultI18n`），因此独立渲染的组件与大量未包裹 Provider 的测试保持英文输出。
- `packages/tui/src/app.tsx`：在 `ConfigProvider` 内、`Keymap.Provider` 外包裹 `<I18nProvider>`，使所有子组件可用 `useI18n()`。启动崩溃界面 `ErrorComponent` 位于 `ConfigProvider` 之外，因此改为从已解析配置接收 `locale` 属性（`createTranslator`）。
- `packages/tui/src/config/index.tsx`：`Info` 新增可选 `locale`，`Resolved.locale` 为必填 `Locale`；`resolve()` 通过 `resolveLocale({ explicit: input.locale, environment: options.environment ?? process.env })` 计算得出。

---

## 4. 新增或修改文案

1. 在 `packages/tui/src/util/i18n.ts` 的 `en` 字典中添加键与英文文案。
2. 在 `zh` 字典中添加同名键与中文文案（类型会强制要求）。
3. 在组件中调用 `useI18n()` 取得 `t`，用 `t("your.key", { ...params })` 渲染。
   - 对于没有 `I18nProvider` 的独立渲染场景（如 `ErrorComponent`），改用 `createTranslator(locale)`。
4. 运行 `bun typecheck`（见第 7 节）确认键对齐，并运行相关组件测试确认英文输出未被改变。

示例：

```tsx
const i18n = useI18n()
return <text>{i18n.t("model.select")}</text>
```

---

## 5. 当前覆盖范围

已翻译的界面分面（`en` 与 `zh` 均有对应文案）：

| 分面 | 位置 | 说明 |
| --- | --- | --- |
| 应用/终端标题 | `app.tsx` | `app.name`、`app.terminalTitle`（终端窗口标题） |
| 通用动作词 | `i18n.ts` | `common.*`：`ok`、`confirm`、`cancel`、`select`、`fullscreen`、`minimize` |
| 底部状态栏/提示 | `feature-plugins/prompt/footer.tsx` | `footer.*`：`agents`、`commands`、`shell`、子代理/终端计数（复数）、布局宽度串 |
| 帮助对话框 | `ui/dialog-help.tsx` | `help.*`：标题、关闭、说明 |
| 更新通知对话框 | `component/dialog-update.tsx` | `update.*`：标题、按钮（Skip/Update/Restart）、检查中/安装中/已完成等正文 |
| 崩溃/错误边界界面 | `component/error-component.tsx` | `crash.*`：标题、错误/堆栈标签、复制/重启/退出、页脚提示 |
| 模型选择对话框 | `component/dialog-model.tsx` | `model.*`：选择/搜索、收藏/最近、免费徽标、收藏标记、连接集成等 |
| 智能体选择对话框 | `component/dialog-agent.tsx` | `agent.*`：选择/搜索 |
| 权限提示 | `routes/session/permission.tsx` | `permission.*`：标题、允许一次/始终允许/拒绝、拒绝输入提示、按键说明 |
| 命令面板命令标题 | `app.tsx` | `command.*`：Help、Exit the app、Open docs、Update Coder、Open settings、View status |

---

## 6. 尚未覆盖（已知缺口）

以下字符串**当前仍为英文**，属于有意保留的后续工作，特此显式记录，避免误解为“已全部本地化”：

- **Mini（精简）前端**：`packages/tui/src/util/permission.ts` 的 `permissionOptionLabel` / `permissionAlwaysLines`、以及 `permissionSemanticLabel` 等被 Mini 输出路径使用的标签未接入 i18n；Mini 相关测试断言英文文案。
- **命令面板的其余条目**：仅上表列出的 6 个命令标题做了翻译，命令自身描述、插件注册的命令名、参数提示等仍为英文。
- **设置对话框的选项文本**：除 `Language` 一项外，设置项名称/说明/取值标签（如主题名、各类 `show/hide`）保持原样。
- **按键绑定对话框的正文**：标题与说明已翻译，但具体键位名称来自 `TuiKeybind` 数据，未翻译。
- **状态/提示类动态文本**：Toast、状态栏细节、用量/耗时、提供方与模型报错、Markdown 与转录内容、工具输出等仍为英文。
- **插件贡献的字符串**：由外部插件提供的命令与面板文本不在本层翻译范围内。
- **Storybook 与调试界面**：`feature-plugins/system/storybook`、debug 面板未翻译。

> 结论：这是一次**高可见度界面**的第一版切片，覆盖应用标题、底栏、帮助、更新、崩溃、模型/智能体选择、权限提示与命令面板标题；其余区域待后续按同一字典机制增量补齐。

---

## 7. 验证

在对应包目录内执行（不要在仓库根目录运行测试）：

```bash
# TUI 与 CLI 类型检查
cd packages/tui && bun typecheck
cd packages/cli && bun typecheck

# i18n 单元测试（解析顺序、插值、复数、中英键对齐）
cd packages/tui && bun test --timeout 30000 test/util/i18n.test.ts

# 受影响分面的组件测试
cd packages/tui && bun test --timeout 30000 \
  test/component/dialog-update.test.tsx \
  test/feature-plugins/prompt-footer.test.tsx \
  test/config-v2.test.tsx
```

`test/util/i18n.test.ts` 覆盖：显式配置 / `CODER_LOCALE` / `LANG` 的优先级与归一化、`{param}` 插值、`count` 复数选择、以及 `zh` 与 `en` 的键完全对齐。

### 7.1 前置条件说明（环境相关）

i18n 落地时，品牌重命名（`opencode` → `coder`）尚未完成，`packages/tui/src/theme/index.ts` 曾导入尚不存在的
`./assets/v2/coder.json` / `./assets/v2/coder2.json`（当时仅有旧的 `opencode.json` / `opencode2.json`），导致
`bun typecheck` 与主题测试在与 i18n 无关的环节失败。

该阻塞**已解除**：品牌重命名已补齐主题资源，`src/theme/assets/coder.json`、`src/theme/assets/v2/coder.json`、
`src/theme/assets/v2/coder2.json` 均已就位，`packages/tui` 的 `bun typecheck` 通过。
