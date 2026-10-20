import { Schema } from "effect"
import { createSimpleContext } from "@xcoder/ui/context"
import { Persistence } from "@/runtime/persistence/schema"
import { Persist, persisted } from "@/runtime/persistence/storage"
import { useServerSDK } from "@/runtime/server/client"
import { uuid } from "@/runtime/persistence/uuid"

export type LocalModel = {
  id: string
  name: string
  /** OpenAI-compatible endpoint URL; empty when the model is only a local file reference. */
  endpoint: string
  /** Path to the model artifact on disk; empty when only an endpoint is known. */
  path: string
}

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

  const [store, setStore] = persisted(
    Persist.serverGlobal(serverSdk.scope, "settings-v2.models.local"),
    LocalModelsSchema,
    { models: [] },
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

  return { list, add, update, remove }
}

export const { use: useLocalModels, provider: LocalModelsProvider } = createSimpleContext({
  name: "LocalModels",
  gate: false,
  init: () => createLocalModelsController(),
})
