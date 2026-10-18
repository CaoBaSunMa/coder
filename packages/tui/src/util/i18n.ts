// Dependency-free message catalog for the TUI. English is the canonical
// dictionary: `MessageKey` is derived from it and the Chinese dictionary must
// cover every key. The default locale is `en`, so callers that never opt into a
// locale keep the exact English output the rest of the TUI is written against.

export type Locale = "en" | "zh"

/** A message is either a single template or a `count`-driven plural pair. */
export type Message = string | { readonly one: string; readonly other: string }

export type MessageParams = Readonly<Record<string, string | number>>

export const en = {
  "app.name": "Coder",
  "app.terminalTitle": "OC | {title}",

  "common.ok": "ok",
  "common.confirm": "confirm",
  "common.cancel": "cancel",
  "common.select": "select",
  "common.fullscreen": "fullscreen",
  "common.minimize": "minimize",

  "footer.agents": "agents",
  "footer.commands": "commands",
  "footer.shell": "shell",
  "footer.exitShellMode": "exit shell mode",
  "footer.subagents": { one: "{count} subagent", other: "{count} subagents" },
  "footer.shells": { one: "{count} shell", other: "{count} shells" },

  "help.title": "Help",
  "help.close": "Close help",
  "help.description": "Press {key} to see all available actions and commands in any context.",

  "update.title": "Update",
  "update.updating": "Updating Coder",
  "update.available": "Update available",
  "update.checking": "Checking for updates…",
  "update.message": "An update is available. After installing, you'll be prompted to restart Coder.",
  "update.installing": "Installing Coder {version}…",
  "update.installed":
    "Update successful! A restart is required. Any active sessions will be resumed automatically.",
  "update.current": "Coder is already up to date.",
  "update.confirm": "Confirm update action",
  "update.previous": "Previous update action",
  "update.next": "Next update action",

  "crash.title": "Coder crashed",
  "crash.subtitle": "An unexpected error stopped the session.",
  "crash.errorLabel": "Error",
  "crash.stackLabel": "Stack trace",
  "crash.scroll": "↑↓ scroll",
  "crash.copy": "Copy report",
  "crash.copied": "✓ Copied",
  "crash.copyFailed": "Copy failed",
  "crash.restart": "Restart",
  "crash.quit": "Quit",
  "crash.unknownError": "An unknown error occurred.",
  "crash.noStack": "No stack trace available.",
  "crash.footer.copy": "Copy the report and open a GitHub issue to help us fix this.",
  "crash.footer.copied": "Report copied — paste it into a new GitHub issue.",
  "crash.footer.failed": "Clipboard write failed. Try again or report the crash manually.",
  "crash.version": "Coder {version}",

  "model.select": "Select model",
  "model.search": "Search models",
  "model.favorites": "Favorites",
  "model.recent": "Recent",
  "model.free": "Free",
  "model.favoriteMarked": "(Favorite)",
  "model.favorite": "Favorite",
  "model.favoriteLower": "favorite",
  "model.connect": "Connect an integration",
  "model.connectLower": "connect integration",
  "model.integrations": "View all integrations",
  "model.integrationsLower": "view all integrations",

  "agent.select": "Select agent",
  "agent.search": "Search agents",

  "permission.required": "Permission required",
  "permission.reject": "Reject permission",
  "permission.rejectHint": "Tell Coder what to do differently",
  "permission.allowOnce": "Allow once",
  "permission.alwaysAllow": "Always allow",
  "permission.rejectOption": "Reject",
  "permission.noDiff": "No diff provided",
  "permission.patterns": "Patterns",

  "command.exit": "Exit the app",
  "command.help": "Help",
  "command.docs": "Open docs",
  "command.update": "Update Coder",
  "command.settings": "Open settings",
  "command.status": "View status",
} satisfies Record<string, Message>

export type MessageKey = keyof typeof en

export const zh: Record<MessageKey, Message> = {
  "app.name": "Coder",
  "app.terminalTitle": "OC | {title}",

  "common.ok": "确定",
  "common.confirm": "确认",
  "common.cancel": "取消",
  "common.select": "选择",
  "common.fullscreen": "全屏",
  "common.minimize": "还原",

  "footer.agents": "智能体",
  "footer.commands": "命令",
  "footer.shell": "终端",
  "footer.exitShellMode": "退出终端模式",
  "footer.subagents": "{count} 个子代理",
  "footer.shells": "{count} 个终端",

  "help.title": "帮助",
  "help.close": "关闭帮助",
  "help.description": "按 {key} 可在任意场景查看所有可用操作和命令。",

  "update.title": "更新",
  "update.updating": "正在更新 Coder",
  "update.available": "有可用更新",
  "update.checking": "正在检查更新…",
  "update.message": "有可用更新。安装后将提示重启 Coder。",
  "update.installing": "正在安装 Coder {version}…",
  "update.installed": "更新成功！需要重启。进行中的会话将自动恢复。",
  "update.current": "Coder 已是最新版本。",
  "update.confirm": "确认更新操作",
  "update.previous": "上一个更新操作",
  "update.next": "下一个更新操作",

  "crash.title": "Coder 崩溃了",
  "crash.subtitle": "意外错误导致会话中止。",
  "crash.errorLabel": "错误",
  "crash.stackLabel": "堆栈跟踪",
  "crash.scroll": "↑↓ 滚动",
  "crash.copy": "复制报告",
  "crash.copied": "✓ 已复制",
  "crash.copyFailed": "复制失败",
  "crash.restart": "重启",
  "crash.quit": "退出",
  "crash.unknownError": "发生未知错误。",
  "crash.noStack": "没有可用的堆栈跟踪信息。",
  "crash.footer.copy": "复制报告并创建 GitHub issue，帮助我们修复此问题。",
  "crash.footer.copied": "报告已复制 —— 请粘贴到新的 GitHub issue 中。",
  "crash.footer.failed": "剪贴板写入失败。请重试，或手动提交崩溃报告。",
  "crash.version": "Coder {version}",

  "model.select": "选择模型",
  "model.search": "搜索模型",
  "model.favorites": "收藏",
  "model.recent": "最近使用",
  "model.free": "免费",
  "model.favoriteMarked": "（已收藏）",
  "model.favorite": "收藏",
  "model.favoriteLower": "收藏",
  "model.connect": "连接集成",
  "model.connectLower": "连接集成",
  "model.integrations": "查看所有集成",
  "model.integrationsLower": "查看所有集成",

  "agent.select": "选择智能体",
  "agent.search": "搜索智能体",

  "permission.required": "需要授权",
  "permission.reject": "拒绝授权",
  "permission.rejectHint": "告诉 Coder 应该如何处理",
  "permission.allowOnce": "允许一次",
  "permission.alwaysAllow": "始终允许",
  "permission.rejectOption": "拒绝",
  "permission.noDiff": "没有提供差异内容",
  "permission.patterns": "匹配模式",

  "command.exit": "退出应用",
  "command.help": "帮助",
  "command.docs": "打开文档",
  "command.update": "更新 Coder",
  "command.settings": "打开设置",
  "command.status": "查看状态",
}

const dictionaries: Record<Locale, Record<MessageKey, Message>> = { en, zh }

/**
 * Resolves the active locale from the highest-priority source that is set:
 * explicit config, `CODER_LOCALE`, then `LC_ALL`/`LANG`, falling back to `en`.
 * Unknown or unsupported values are ignored so the default stays English.
 */
export function resolveLocale(input: {
  explicit?: string | undefined
  environment?: Readonly<Record<string, string | undefined>>
}): Locale {
  const explicit = normalizeLocale(input.explicit)
  if (explicit) return explicit
  const environment = input.environment ?? {}
  const override = normalizeLocale(environment.CODER_LOCALE)
  if (override) return override
  const system = normalizeLocale(environment.LC_ALL) ?? normalizeLocale(environment.LANG)
  if (system) return system
  return "en"
}

export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const entry = dictionaries[locale][key] ?? en[key]
  const template = typeof entry === "string" ? entry : params?.count === 1 ? entry.one : entry.other
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

export type I18n = {
  readonly locale: Locale
  readonly t: (key: MessageKey, params?: MessageParams) => string
}

export function createTranslator(locale: Locale): I18n {
  return { locale, t: (key, params) => translate(locale, key, params) }
}

/** English translator for surfaces that render without an `I18nProvider`. */
export const defaultI18n = createTranslator("en")

function normalizeLocale(value: string | undefined): Locale | undefined {
  if (!value) return undefined
  const tag = value.toLowerCase().replace(/_/g, "-")
  if (tag === "zh" || tag.startsWith("zh-")) return "zh"
  if (tag === "en" || tag.startsWith("en-")) return "en"
  return undefined
}
