import type { CoderEvent } from "@xcoder/client"
import { useClient } from "./client"

type EventMetadata = {
  directory: string | undefined
}
type CoderEventMap = { [Type in CoderEvent["type"]]: Extract<CoderEvent, { type: Type }> }

export function useEvent() {
  const client = useClient()

  function subscribe(handler: (event: CoderEvent, metadata: EventMetadata) => void) {
    return client.event.listen(({ details }) => {
      if (details.type === "server.connected") return
      handler(details, { directory: details.location?.directory })
    })
  }

  function on<T extends CoderEvent["type"]>(
    type: T,
    handler: (event: CoderEventMap[T], metadata: EventMetadata) => void,
  ) {
    return client.event.on(type, (event) => {
      handler(event, { directory: event.location?.directory })
    })
  }

  return {
    subscribe,
    on,
  }
}
