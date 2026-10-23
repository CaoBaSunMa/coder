import { Button } from "@xcoder/ui/button"
import { createSignal } from "solid-js"
import type { ModelSelection } from "./selection"
import { ModelSelectorPopoverView } from "./select-dialog"

const chatgpt = {
  id: "gpt-5.6-sol",
  providerID: "openai",
  api: { id: "gpt-5.6-sol", url: "https://api.openai.com/v1", npm: "@xcoder/ai/providers/openai" },
  name: "GPT-5.6 Sol",
  family: "gpt",
  capabilities: {
    temperature: true,
    reasoning: true,
    attachment: true,
    toolcall: true,
    input: { text: true, audio: false, image: true, video: false, pdf: false },
    output: { text: true, audio: false, image: false, video: false, pdf: false },
    interleaved: true,
  },
  cost: { input: 0, output: 0, cache: { read: 0, write: 0 } },
  limit: { context: 400_000, output: 64_000 },
  status: "active",
  options: {},
  headers: {},
  release_date: "2026-09-01",
  variants: {},
  provider: {
    id: "openai",
    name: "OpenAI",
    source: "custom",
    env: [],
    options: {},
    models: {},
  },
  latest: true,
} satisfies NonNullable<ReturnType<ModelSelection["current"]>>

const models = [
  chatgpt,
  {
    ...chatgpt,
    id: "gpt-5.6-terra",
    api: { ...chatgpt.api, id: "gpt-5.6-terra" },
    name: "GPT-5.6 Terra",
    latest: false,
  },
]

const locals = [
  { id: "local-sol", name: "GPT-5.6 Sol", endpoint: "http://127.0.0.1:8080/v1", path: "" },
  { id: "local-orphan", name: "my-local-7b", endpoint: "http://127.0.0.1:8081/v1", path: "" },
]

function SelectorStory(props: { plan: boolean; local?: boolean }) {
  const [current, setCurrent] = createSignal(models[0].id)
  const localRows = (search: string) =>
    locals
      .filter((local) => local.name.toLowerCase().includes(search.toLowerCase()))
      .map((local) => ({ local, match: models.find((model) => model.name === local.name) }))

  return (
    <div class="flex min-h-[280px] items-end justify-center">
      <ModelSelectorPopoverView
        trigger={(trigger) => (
          <Button {...trigger} variant="ghost-muted">
            {models.find((model) => model.id === current())?.name}
          </Button>
        )}
        all={() => models}
        models={(search) => models.filter((model) => model.name.toLowerCase().includes(search.toLowerCase()))}
        groups={(items) => [{ category: "openai", items }]}
        local={props.local ? localRows : undefined}
        current={`openai:${current()}`}
        chatgptPlan={props.plan}
        select={(item) => setCurrent(item.id)}
        onManage={() => undefined}
        onClose={() => undefined}
      />
    </div>
  )
}

export default {
  title: "App/Dialogs/Model Selector",
  id: "app-dialog-model-selector",
}

export const ChatGPTPlan = { render: () => <SelectorStory plan /> }

export const ApiKey = { render: () => <SelectorStory plan={false} /> }

export const LocalModels = { render: () => <SelectorStory plan={false} local /> }
