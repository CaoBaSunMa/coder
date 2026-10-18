import { registerCustomTheme } from "@pierre/diffs"
import { CoderTheme } from "./marked-theme"

let registered = false

export function registerCoderTheme() {
  if (registered) return
  registered = true
  registerCustomTheme("Coder", () => Promise.resolve(CoderTheme))
}
