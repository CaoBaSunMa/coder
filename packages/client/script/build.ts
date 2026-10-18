import { NodeFileSystem } from "@effect/platform-node"
import { compile, emitEffectImported, emitEffectShape, emitPromise, write } from "@xcoder/httpapi-codegen"
import { ClientApi, effectOmitEndpoints, groupNames, promiseOmitEndpoints } from "@xcoder/protocol/client"
import { Agent } from "@xcoder/schema/agent"
import { Command } from "@xcoder/schema/command"
import { Config } from "@xcoder/schema/config"
import { Credential } from "@xcoder/schema/credential"
import { Event } from "@xcoder/schema/event"
import { EventLog } from "@xcoder/schema/event-log"
import { FileDiff } from "@xcoder/schema/file-diff"
import { FileSystem } from "@xcoder/schema/filesystem"
import { Form } from "@xcoder/schema/form"
import { Instruction } from "@xcoder/schema/instruction"
import { InstructionEntry } from "@xcoder/schema/instruction-entry"
import { Integration } from "@xcoder/schema/integration"
import { Location } from "@xcoder/schema/location"
import { Mcp } from "@xcoder/schema/mcp"
import { Model } from "@xcoder/schema/model"
import { Money } from "@xcoder/schema/money"
import { Permission } from "@xcoder/schema/permission"
import { PermissionSaved } from "@xcoder/schema/permission-saved"
import { Plugin } from "@xcoder/schema/plugin"
import { Project } from "@xcoder/schema/project"
import { Worktree } from "@xcoder/schema/worktree"
import { AgentAttachment, FileAttachment, Prompt, PromptMention } from "@xcoder/schema/prompt"
import { PromptInput } from "@xcoder/schema/prompt-input"
import { Provider } from "@xcoder/schema/provider"
import { Pty } from "@xcoder/schema/pty"
import { PtyTicket } from "@xcoder/schema/pty-ticket"
import { Question } from "@xcoder/schema/question"
import { Reference } from "@xcoder/schema/reference"
import { AbsolutePath, RelativePath } from "@xcoder/schema/schema"
import { Session } from "@xcoder/schema/session"
import { SessionMessage } from "@xcoder/schema/session-message"
import { SessionInbox } from "@xcoder/schema/session-inbox"
import { Shell } from "@xcoder/schema/shell"
import { Skill } from "@xcoder/schema/skill"
import { Snapshot } from "@xcoder/schema/snapshot"
import { Vcs } from "@xcoder/schema/vcs"
import { WebSearch } from "@xcoder/schema/websearch"
import { Workspace } from "@xcoder/schema/workspace"
import { Effect, Schema } from "effect"
import { fileURLToPath } from "url"

const promiseContract = compile(ClientApi, { groupNames, omitEndpoints: promiseOmitEndpoints })
const effectContract = compile(ClientApi, { groupNames, omitEndpoints: effectOmitEndpoints })
const effectTypeReferences = [
  ...namespaceTypes("Agent", "@xcoder/schema/agent", Agent),
  ...namespaceTypes("Command", "@xcoder/schema/command", Command),
  ...namespaceTypes("Config", "@xcoder/schema/config", Config),
  ...namespaceTypes("Credential", "@xcoder/schema/credential", Credential),
  ...namespaceTypes("Event", "@xcoder/schema/event", Event),
  ...namespaceTypes("EventLog", "@xcoder/schema/event-log", EventLog),
  ...namespaceTypes("FileDiff", "@xcoder/schema/file-diff", FileDiff),
  ...namespaceTypes("FileSystem", "@xcoder/schema/filesystem", FileSystem),
  ...namespaceTypes("Form", "@xcoder/schema/form", Form),
  ...namespaceTypes("Instruction", "@xcoder/schema/instruction", Instruction),
  ...namespaceTypes("InstructionEntry", "@xcoder/schema/instruction-entry", InstructionEntry),
  ...namespaceTypes("Integration", "@xcoder/schema/integration", Integration),
  typeReference("Location.PublicRef", "@xcoder/schema/location", Location.PublicRef),
  typeReference("Location.PublicInfo", "@xcoder/schema/location", Location.PublicInfo),
  ...namespaceTypes("Mcp", "@xcoder/schema/mcp", Mcp),
  ...namespaceTypes("Model", "@xcoder/schema/model", Model),
  ...namespaceTypes("Money", "@xcoder/schema/money", Money),
  ...namespaceTypes("Permission", "@xcoder/schema/permission", Permission),
  ...namespaceTypes("PermissionSaved", "@xcoder/schema/permission-saved", PermissionSaved),
  ...namespaceTypes("Plugin", "@xcoder/schema/plugin", Plugin),
  ...namespaceTypes("Project", "@xcoder/schema/project", Project),
  ...namespaceTypes("Worktree", "@xcoder/schema/worktree", Worktree),
  ...namespaceTypes("PromptInput", "@xcoder/schema/prompt-input", PromptInput),
  ...namespaceTypes("Provider", "@xcoder/schema/provider", Provider),
  ...namespaceTypes("Pty", "@xcoder/schema/pty", Pty),
  ...namespaceTypes("PtyTicket", "@xcoder/schema/pty-ticket", PtyTicket),
  ...namespaceTypes("Question", "@xcoder/schema/question", Question),
  ...namespaceTypes("Reference", "@xcoder/schema/reference", Reference),
  ...namespaceTypes("Session", "@xcoder/schema/session", Session),
  ...namespaceTypes("SessionMessage", "@xcoder/schema/session-message", SessionMessage),
  ...namespaceTypes("SessionInbox", "@xcoder/schema/session-inbox", SessionInbox),
  ...namespaceTypes("Shell", "@xcoder/schema/shell", Shell),
  ...namespaceTypes("Skill", "@xcoder/schema/skill", Skill),
  ...namespaceTypes("Snapshot", "@xcoder/schema/snapshot", Snapshot),
  ...namespaceTypes("Vcs", "@xcoder/schema/vcs", Vcs),
  ...namespaceTypes("WebSearch", "@xcoder/schema/websearch", WebSearch),
  ...namespaceTypes("Workspace", "@xcoder/schema/workspace", Workspace),
  typeReference("Prompt", "@xcoder/schema/prompt", Prompt),
  typeReference("PromptMention", "@xcoder/schema/prompt", PromptMention),
  typeReference("FileAttachment", "@xcoder/schema/prompt", FileAttachment),
  typeReference("AgentAttachment", "@xcoder/schema/prompt", AgentAttachment),
  typeReference("AbsolutePath", "@xcoder/schema/schema", AbsolutePath),
  typeReference("RelativePath", "@xcoder/schema/schema", RelativePath),
]

await Effect.runPromise(
  Effect.all(
    [
      write(
        emitPromise(promiseContract, {
          mutableOutputs: true,
        }),
        fileURLToPath(new URL("../src/promise/generated", import.meta.url)),
      ),
      write(
        emitEffectImported(effectContract, {
          module: "../../contract",
          api: "ClientApi",
          shapeModule: "../api/api.js",
        }),
        fileURLToPath(new URL("../src/effect/generated", import.meta.url)),
      ),
      write(
        emitEffectShape(effectContract, {
          typeReferences: effectTypeReferences,
          outputTypes: {
            "event.subscribe": {
              name: "CoderEvent",
              import: 'import type { CoderEvent } from "@xcoder/protocol/groups/event"',
            },
          },
        }),
        fileURLToPath(new URL("../src/effect/api", import.meta.url)),
      ),
    ],
    { concurrency: 3, discard: true },
  ).pipe(Effect.provide(NodeFileSystem.layer)),
)

function namespaceTypes(namespace: string, module: string, values: object) {
  return Object.entries(values).flatMap(([name, schema]) =>
    Schema.isSchema(schema) ? [typeReference(`${namespace}.${name}`, module, schema)] : [],
  )
}

function typeReference(name: string, module: string, schema: Schema.Top) {
  return {
    schema,
    name,
    import: `import type { ${name.split(".")[0]} } from ${JSON.stringify(module)}`,
  }
}
