import { expect, test } from "bun:test"
import { selectTheme, selectThemeMode, supportsThemeMode, themeModes } from "@xcoder/theme/tui"
import { getCoderTheme } from "../../../src/theme"

test("selects complete light and dark themes independently", () => {
  const light = selectTheme(getCoderTheme(), "light")
  const dark = selectTheme(getCoderTheme(), "dark")
  expect(selectTheme(getCoderTheme())).toEqual(light)
  expect(light.hue).toEqual(getCoderTheme().light.hue)
  expect(dark.text).toEqual(getCoderTheme().base.text)
  expect(dark.hue).toEqual(getCoderTheme().dark.hue)
  expect(selectThemeMode(getCoderTheme(), "dark")).toEqual({ theme: dark, mode: "dark" })
})

test("selects the available mode when the requested mode is missing", () => {
  const lightOnly = { base: getCoderTheme().base, light: getCoderTheme().light } as const
  const darkOnly = { base: getCoderTheme().base, dark: getCoderTheme().dark } as const

  expect(themeModes(lightOnly)).toEqual(["light"])
  expect(themeModes(darkOnly)).toEqual(["dark"])
  expect(supportsThemeMode(lightOnly, "light")).toBeTrue()
  expect(supportsThemeMode(lightOnly, "dark")).toBeFalse()
  expect(selectThemeMode(lightOnly, "dark")).toEqual({ theme: selectTheme(getCoderTheme(), "light"), mode: "light" })
  expect(selectThemeMode(darkOnly, "light")).toEqual({ theme: selectTheme(getCoderTheme(), "dark"), mode: "dark" })
})
