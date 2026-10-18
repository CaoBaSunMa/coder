import { Plugin } from "@xcoder/plugin/tui"
import { createMermaidCodeBlockRenderer } from "./markdown.js"
import { resolveCoderDiagramPalette } from "./palette.js"

export default Plugin.define({
  id: "coder.merman",
  setup(context) {
    context.markdown.registerCodeBlockRenderer(
      "mermaid",
      createMermaidCodeBlockRenderer(context.renderer, () => ({
        colors: resolveCoderDiagramPalette(context.theme, context.themeMode),
      })),
    )
  },
})
