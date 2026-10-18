import type { FileSystem } from "@xcoder/core/filesystem"
import { Bus } from "@xcoder/core/bus"
import { Image } from "@xcoder/core/image"
import { LocationServiceMap } from "@xcoder/core/location-service-map"
import type { LocationServices } from "@xcoder/core/location-services"
import { Plugin } from "@xcoder/core/plugin"
import { PluginHooks } from "@xcoder/core/plugin/hooks"
import { Skill } from "@xcoder/core/skill"
import type { Location } from "@xcoder/schema/location"
import { makeGlobalNode } from "@xcoder/util/effect/app-node"
import { LayerNode } from "@xcoder/util/effect/layer-node"
import { Effect, Layer, LayerMap } from "effect"

// Plain-prompt unit fixtures use virtual directories.
export const promptLocationNode = makeGlobalNode({
  service: LocationServiceMap.Service,
  layer: Layer.effect(
    LocationServiceMap.Service,
    Effect.gen(function* () {
      const bus = yield* Bus.Service
      return yield* LayerMap.make(
        (_ref: Location.Ref) =>
          LayerNode.compile(LayerNode.group([PluginHooks.node, Image.node, Skill.node, Plugin.node]), {
            replacements: [
              Bus.node.replace(Layer.succeed(Bus.Service, bus)),
              Plugin.node.replace(Layer.mock(Plugin.Service, { awaitActivation: Effect.void })),
            ],
          }) as unknown as Layer.Layer<LocationServices, FileSystem.DirectoryNotFoundError>,
      )
    }),
  ),
  deps: [Bus.node],
})
