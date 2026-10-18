import { Location } from "@xcoder/core/location"
import { LocationServiceMap } from "@xcoder/core/location-services"
import { AbsolutePath } from "@xcoder/core/schema"
import { Voice } from "@xcoder/core/voice"
import { InvalidRequestError, ServiceUnavailableError } from "@xcoder/protocol/errors"
import { Global } from "@xcoder/util/global"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"
import { Api } from "../api"
import { awaitPlugins, locationErrors } from "../location"

export const VoiceHandler = HttpApiBuilder.group(Api, "server.voice", (handlers) =>
  Effect.gen(function* () {
    const global = yield* Global.Service
    const locations = yield* LocationServiceMap.Service
    const services = locations.get(Location.Ref.make({ directory: AbsolutePath.make(global.config) }))
    return handlers.handle(
      "voice.session",
      Effect.fn("server.voice.session")(
        function* (request) {
          yield* awaitPlugins
          const voice = yield* Voice.Service
          const transport = yield* voice
            .session(request.payload)
            .pipe(
              Effect.mapError((error) =>
                error._tag === "Voice.InvalidRequestError"
                  ? new InvalidRequestError({ message: error.message })
                  : new ServiceUnavailableError({ message: error.message, service: error.service }),
              ),
            )
          return { data: { transport } }
        },
        Effect.provide(services),
        locationErrors,
      ),
    )
  }),
)
