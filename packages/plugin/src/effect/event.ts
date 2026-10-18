import type { EventApi } from "@xcoder/client/effect/api"

export interface EventDomain extends Pick<EventApi<unknown>, "subscribe"> {}
