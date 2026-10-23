import { Schema } from "effect"
import { createSimpleContext } from "@xcoder/ui/context"
import { Persistence } from "@/runtime/persistence/schema"
import { Persist, persisted } from "@/runtime/persistence/storage"
import { useServerSDK } from "@/runtime/server/client"
import { uuid } from "@/runtime/persistence/uuid"

/** A catalog model a local model stands for. Structural so callers can join their own catalog shape. */
export type LocalModelCatalogEntry = { id: string; name: string }

export type LocalModel = {
  id: string
  name: string
  /** OpenAI-compatible endpoint URL; empty when the model is only a local file reference. */
  endpoint: string
  /** Path to the model artifact on disk; empty when only an endpoint is known. */
  path: string
}

/** A local model joined to the catalog model it stands for. `match` is undefined when nothing matches. */
export type LocalModelItem<T extends LocalModelCatalogEntry> = { local: LocalModel; match?: T }

/** Stable key for a joined local row, unique across the local list. */
export const localModelKey = (item: { local: LocalModel }) => `local:${item.local.id}`

/**
 * Joins the local list to a provider catalog by name, so a row can select the model it stands for.
 * Matching is case-insensitive on either the catalog id or its display name.
 */
export function joinLocalModels<T extends LocalModelCatalogEntry>(
  locals: LocalModel[],
  catalog: T[],
): LocalModelItem<T>[] {
  return locals.map((local) => ({
    local,
    match: catalog.find(
      (item) =>
        item.id.toLowerCase() === local.name.toLowerCase() ||
        item.name.toLowerCase() === local.name.toLowerCase(),
    ),
  }))
}

/**
 * Common local models a fresh list starts with. Every entry points at a runtime that speaks the
 * OpenAI API, so the seeded list is usable before anything is edited or removed.
 */
const PRESET_MODELS = [
  { id: "preset-qwen3-coder-30b", name: "qwen3-coder:30b", endpoint: "http://localhost:11434/v1", path: "" },
  { id: "preset-qwen2-5-coder-7b", name: "qwen2.5-coder:7b", endpoint: "http://localhost:11434/v1", path: "" },
  {
    id: "preset-deepseek-coder-v2-16b",
    name: "deepseek-coder-v2:16b",
    endpoint: "http://localhost:11434/v1",
    path: "",
  },
  { id: "preset-glm-4-5", name: "glm-4.5", endpoint: "http://localhost:11434/v1", path: "" },
  { id: "preset-kimi-k2", name: "kimi-k2", endpoint: "http://localhost:11434/v1", path: "" },
  {
    id: "preset-qwen3-coder-gguf",
    name: "qwen3-coder-30b-a3b-instruct",
    endpoint: "http://127.0.0.1:8080/v1",
    path: "/models/qwen3-coder-30b-a3b-instruct.gguf",
  },
  {
    id: "preset-deepseek-r1-distill-qwen-14b",
    name: "deepseek-r1-distill-qwen-14b",
    endpoint: "http://localhost:8000/v1",
    path: "",
  },
  { id: "preset-codegemma-7b-it", name: "codegemma-7b-it", endpoint: "http://localhost:1234/v1", path: "" },
] satisfies LocalModel[]

const presets = () => PRESET_MODELS.map((model) => ({ ...model }))

const LocalModelSchema = Persistence.struct({
  id: Schema.String,
  name: Schema.String,
  endpoint: Persistence.fallback(Schema.String, () => ""),
  path: Persistence.fallback(Schema.String, () => ""),
})

const LocalModelsSchema = Persistence.struct({
  models: Persistence.array(LocalModelSchema),
})

const createLocalModelsController = () => {
  const serverSdk = useServerSDK()

  // A list that was never stored starts with the common models; a stored list is never reseeded.
  const [store, setStore] = persisted(
    Persist.serverGlobal(serverSdk.scope, "settings-v2.models.local"),
    LocalModelsSchema,
    { models: presets() },
  )

  const list = () => store.models

  const add = (input: { name: string; endpoint: string; path: string }) =>
    setStore("models", store.models.length, {
      id: uuid(),
      name: input.name,
      endpoint: input.endpoint,
      path: input.path,
    })

  const update = (id: string, input: { name: string; endpoint: string; path: string }) => {
    const index = store.models.findIndex((model) => model.id === id)

    if (index < 0) return

    setStore("models", index, { id, name: input.name, endpoint: input.endpoint, path: input.path })
  }

  const remove = (id: string) => setStore("models", (models) => models.filter((model) => model.id !== id))

  /** Restores the common models, so an emptied list can be started over. */
  const initialize = () => setStore("models", presets())

  return { list, add, update, remove, initialize }
}

export const { use: useLocalModels, useMaybe: useMaybeLocalModels, provider: LocalModelsProvider } =
  createSimpleContext({
    name: "LocalModels",
    gate: false,
    init: () => createLocalModelsController(),
  })
