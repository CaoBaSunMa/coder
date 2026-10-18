import { expect, test } from "bun:test"
import { en, resolveLocale, translate, zh } from "../../src/util/i18n"

test("resolves the locale in priority order", () => {
  expect(resolveLocale({ explicit: "zh", environment: { CODER_LOCALE: "en" } })).toBe("zh")
  expect(resolveLocale({ environment: { CODER_LOCALE: "zh-CN", LANG: "en_US.UTF-8" } })).toBe("zh")
  expect(resolveLocale({ environment: { LC_ALL: "zh_CN.UTF-8", LANG: "en_US.UTF-8" } })).toBe("zh")
  expect(resolveLocale({ environment: { LANG: "zh_CN.UTF-8" } })).toBe("zh")
  expect(resolveLocale({ environment: {} })).toBe("en")
  expect(resolveLocale({ environment: { CODER_LOCALE: "fr" } })).toBe("en")
})

test("translates and interpolates messages", () => {
  expect(translate("en", "footer.commands")).toBe("commands")
  expect(translate("zh", "footer.commands")).toBe("命令")
  expect(translate("zh", "help.description", { key: "ctrl+p" })).toBe("按 ctrl+p 可在任意场景查看所有可用操作和命令。")
})

test("selects the plural form from the count parameter", () => {
  expect(translate("en", "footer.subagents", { count: 1 })).toBe("1 subagent")
  expect(translate("en", "footer.subagents", { count: 3 })).toBe("3 subagents")
  expect(translate("zh", "footer.subagents", { count: 2 })).toBe("2 个子代理")
})

test("Chinese covers every English key", () => {
  expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort())
})
