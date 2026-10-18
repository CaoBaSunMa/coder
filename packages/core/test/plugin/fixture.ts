import { Agent } from "@xcoder/core/agent"
import { AISDK } from "@xcoder/core/aisdk"
import { Command } from "@xcoder/core/command"
import { Config } from "@xcoder/core/config"
import { Credential } from "@xcoder/core/credential"
import { Database } from "@xcoder/core/database/database"
import { FileAccess } from "@xcoder/core/file-access"
import { LayerNodePlatform } from "@xcoder/util/effect/app-node-platform"
import { AppProcess } from "@xcoder/util/process"
import { LayerNode } from "@xcoder/util/effect/layer-node"
import { Bus } from "@xcoder/core/bus"
import { FileSystem } from "@xcoder/core/filesystem"
import { FSUtil } from "@xcoder/util/fs-util"
import { Form } from "@xcoder/core/form"
import { Generate } from "@xcoder/core/generate"
import { Integration } from "@xcoder/core/integration"
import { KV } from "@xcoder/core/kv"
import { Location } from "@xcoder/core/location"
import { ManagedPolicy } from "@xcoder/core/managed-policy"
import { Mcp } from "@xcoder/core/mcp/index"
import { Model } from "@xcoder/core/model"
import { Npm } from "@xcoder/util/npm"
import { Plugin } from "@xcoder/core/plugin"
import { PluginHooks } from "@xcoder/core/plugin/hooks"
import { Provider } from "@xcoder/core/provider"
import { Session } from "@xcoder/core/session"
import { PersistentPty } from "@xcoder/core/persistent-pty"
import { LocationServiceMap } from "@xcoder/core/location-service-map"
import { AppNodeBuilder } from "@xcoder/core/effect/app-node-builder"
import { Permission } from "@xcoder/core/permission"
import { Reference } from "@xcoder/core/reference"
import { Rpc } from "@xcoder/core/rpc"
import { Skill } from "@xcoder/core/skill"
import { SkillDiscovery } from "@xcoder/core/skill/discovery"
import { Watcher } from "@xcoder/core/filesystem/watcher"
import { Tool } from "@xcoder/core/tool"
import { Vcs } from "@xcoder/core/vcs"
import { WebSearch } from "@xcoder/core/websearch"
import { Worktree } from "@xcoder/core/worktree"
import { WorktreeStrategies } from "@xcoder/core/worktree/strategies"
import { Effect, Layer } from "effect"
import { tempLocationLayer } from "../fixture/location"
import { emptyMcpLayer } from "../fixture/mcp"

const npmLayer = Layer.succeed(
  Npm.Service,
  Npm.Service.of({
    add: (name) => Effect.succeed({ directory: "", name }),
    resolve: (name) => Effect.succeed({ directory: "", name }),
    check: () => Effect.succeed(false),
    update: (name) => Effect.succeed({ directory: "", name }),
    which: () => Effect.undefined,
  }),
)

const generateLayer = Layer.succeed(Generate.Service, Generate.Service.of({ text: () => Effect.succeed("") }))

const configLayer = Config.testLayer()

const permissionLayer = Layer.succeed(
  Permission.Service,
  Permission.Service.of({
    close: Effect.void,
    ask: (input) => Effect.succeed({ id: input.id ?? Permission.ID.create(), effect: "ask" }),
    assert: () => Effect.void,
    reply: () => Effect.void,
    get: () => Effect.succeed(undefined),
    forSession: () => Effect.succeed([]),
    list: () => Effect.succeed([]),
  }),
)

export const makePluginTestLayer = (permission = permissionLayer) =>
  AppNodeBuilder.build(
    LayerNode.group([
      AppProcess.node,
      FileSystem.node,
      FSUtil.node,
      Location.node,
      Npm.node,
      Credential.node,
      Config.node,
      Database.node,
      FileAccess.node,
      Bus.node,
      Form.node,
      Generate.node,
      LayerNodePlatform.httpClient,
      Plugin.node,
      Agent.node,
      AISDK.node,
      Provider.node,
      Model.node,
      Command.node,
      Integration.node,
      KV.node,
      ManagedPolicy.node,
      Mcp.node,
      Session.node,
      PersistentPty.node,
      LocationServiceMap.node,
      Permission.node,
      PluginHooks.node,
      Reference.node,
      Rpc.node,
      Skill.node,
      SkillDiscovery.node,
      Tool.node,
      Vcs.node,
      Watcher.node,
      WebSearch.node,
      Worktree.node,
      WorktreeStrategies.node,
    ]),
    [
      Location.node.replace(tempLocationLayer),
      Npm.node.replace(npmLayer),
      Config.node.replace(configLayer),
      Mcp.node.replace(emptyMcpLayer),
      Generate.node.replace(generateLayer),
      Permission.node.replace(permission),
    ],
  ).pipe(Layer.provideMerge(configLayer))

export const PluginTestLayer = makePluginTestLayer()
