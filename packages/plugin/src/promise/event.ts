import type { EventApi } from "@xcoder/client/promise/api"

export interface EventDomain extends Pick<EventApi, "subscribe"> {}
