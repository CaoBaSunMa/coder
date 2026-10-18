// TODO: Keep additional network capabilities inside Schema and Protocol as the client grows; /effect must never import
// Core or Server. Preserve these datatype exports so internal model reorganizations do not require caller migrations.
import type { Effect } from "effect"
import type { Coder } from "./client.js"

export * from "./generated/index"
export { Coder } from "./client.js"
export type {
  AgentApi,
  AppApi,
  CommandApi,
  ConfigApi,
  EventApi,
  IntegrationApi,
  ModelApi,
  PluginApi,
  ProviderApi,
  ReferenceApi,
  RpcApi,
  RpcClient,
  WebSearchApi,
  SessionApi,
  SkillApi,
} from "./api.js"
export { Agent } from "@xcoder/schema/agent"
export { Command } from "@xcoder/schema/command"
export { Config } from "@xcoder/schema/config"
export { Credential } from "@xcoder/schema/credential"
export { Event } from "@xcoder/schema/event"
export { EventLog } from "@xcoder/schema/event-log"
export { FileSystem } from "@xcoder/schema/filesystem"
export { Form } from "@xcoder/schema/form"
export { Integration } from "@xcoder/schema/integration"
export { Location } from "@xcoder/schema/location"
export { Model } from "@xcoder/schema/model"
export { Permission } from "@xcoder/schema/permission"
export { PermissionSaved } from "@xcoder/schema/permission-saved"
export { Project } from "@xcoder/schema/project"
export { Worktree } from "@xcoder/schema/worktree"
export { Vcs } from "@xcoder/schema/vcs"
export { Provider } from "@xcoder/schema/provider"
export { Pty } from "@xcoder/schema/pty"
export { Question } from "@xcoder/schema/question"
export { Reference } from "@xcoder/schema/reference"
export { WebSearch } from "@xcoder/schema/websearch"
export { AbsolutePath, RelativePath } from "@xcoder/schema/schema"
export { Session } from "@xcoder/schema/session"
export { SessionInbox } from "@xcoder/schema/session-inbox"
export { SessionMessage } from "@xcoder/schema/session-message"
export { Skill } from "@xcoder/schema/skill"
export { Prompt } from "@xcoder/schema/prompt"
export { PromptInput } from "@xcoder/schema/prompt-input"
export type { CoderEvent } from "@xcoder/protocol/groups/event"
export type CoderClient = Effect.Success<ReturnType<typeof Coder.make>>
