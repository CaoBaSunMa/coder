import { Effect } from "effect"
import { define } from "@xcoder/plugin/effect/plugin"

export const KiloPlugin = define({
  id: "coder.provider.kilo",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.provider.transform((evt) => {
      for (const item of evt.list()) {
        if (item.provider.package !== "@xcoder/ai/providers/openai-compatible") continue
        if (item.provider.settings?.baseURL !== "https://api.kilo.ai/api/gateway") continue
        evt.update(item.provider.id, (provider) => {
          provider.headers = { ...provider.headers, "HTTP-Referer": "https://coder.example.com/", "X-Title": "coder" }
        })
      }
    })
  }),
})
