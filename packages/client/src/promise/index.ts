import type { Coder } from "./client.js"

export * from "./generated/index.js"
export { Coder } from "./client.js"
export type {
  AgentApi,
  CommandApi,
  ConfigApi,
  EventApi,
  IntegrationApi,
  ModelApi,
  PluginApi,
  ProviderApi,
  ReferenceApi,
  RpcApi,
  RpcCallOptions,
  RpcClient,
  RpcEventPayload,
  WebSearchApi,
  SessionApi,
  SkillApi,
} from "./api.js"
export type { EventSubscribeOutput as CoderEvent } from "./generated/types.js"
export type CoderClient = ReturnType<typeof Coder.make>
