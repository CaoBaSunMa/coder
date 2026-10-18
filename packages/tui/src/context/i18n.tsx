import { createContext, createMemo, useContext, type JSX } from "solid-js"
import { useConfig } from "../config"
import { createTranslator, defaultI18n, type I18n } from "../util/i18n"

const I18nContext = createContext<() => I18n>()

/**
 * Binds the i18n layer to the resolved TUI config. Placed inside
 * `ConfigProvider` so switching `locale` in the config updates every consumer.
 */
export function I18nProvider(props: { children: JSX.Element }) {
  const config = useConfig()
  const i18n = createMemo(() => createTranslator(config.data.locale))
  return <I18nContext.Provider value={i18n}>{props.children}</I18nContext.Provider>
}

/**
 * Reads the active translator. Falls back to English when no provider is
 * mounted (isolated component renders and tests), which keeps default output
 * byte-for-byte identical to the pre-i18n TUI.
 */
export function useI18n(): I18n {
  const read = useContext(I18nContext) ?? (() => defaultI18n)
  return {
    get locale() {
      return read().locale
    },
    t: (key, params) => read().t(key, params),
  }
}
