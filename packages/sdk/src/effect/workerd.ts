export * as CoderWorkerd from "./workerd"

import { Layer } from "effect"
import type { Config, Scope } from "effect"
import { WorkerdProfile } from "../internal/workerd"
import { Coder } from "./opencode"

export type Configuration = WorkerdProfile.Configuration

export interface CreateOptions<R = never> extends WorkerdProfile.Options {
  readonly log?: Coder.CreateOptions["log"]
  readonly plugins?: Coder.CreateOptions["plugins"]
  readonly workspaceProviders?: Coder.CreateOptions["workspaceProviders"]
  readonly instances?: Coder.CreateOptions<R>["instances"]
}

export const create = <R = never>({ log, plugins, workspaceProviders, instances, ...options }: CreateOptions<R>) => {
  const profile = WorkerdProfile.make(options)
  return Coder.create(
    { ...profile.options, log, plugins, workspaceProviders, instances },
    { overrides: profile.replacements },
  )
}

export const layer = <R = never>(
  options: CreateOptions<R>,
): Layer.Layer<Coder.Service, Config.ConfigError | Error, Exclude<R, Scope.Scope>> =>
  Layer.effect(Coder.Service, create(options))

export type Interface = Coder.Interface
export type Requirements = Scope.Scope
