import { ensurePluginRuntime, provides } from "@xcoder/plugin/runtime"
import { Plugin, PluginContextProvider, usePlugin } from "@xcoder/plugin/tui"
import { ensureRuntimePluginSupport } from "@opentui/solid/runtime-plugin-support/configure"

ensurePluginRuntime()
ensureRuntimePluginSupport({
  additional: {
    "@xcoder/plugin/tui": { Plugin, PluginContextProvider, usePlugin },
  },
  preserve: provides,
})
