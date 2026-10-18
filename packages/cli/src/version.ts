import { Option, Schema } from "effect"

declare const CODER_VERSION: string
declare const CODER_CHANNEL: string
declare const CODER_ARTIFACT: string
declare const CODER_RELEASE_HIGHLIGHTS: string

const version = typeof CODER_VERSION === "string" ? CODER_VERSION : "local"
const channel = typeof CODER_CHANNEL === "string" ? CODER_CHANNEL : "local"
const artifact = typeof CODER_ARTIFACT === "string" ? CODER_ARTIFACT : "cli"
// Stable release builds embed the release notes' Highlights; every other build has none.
const highlights =
  typeof CODER_RELEASE_HIGHLIGHTS === "string"
    ? Option.getOrElse(
        Schema.decodeUnknownOption(
          Schema.fromJsonString(Schema.Array(Schema.Struct({ title: Schema.String, body: Schema.String }))),
        )(CODER_RELEASE_HIGHLIGHTS),
        () => [],
      )
    : []

export {
  version as CODER_VERSION,
  channel as CODER_CHANNEL,
  artifact as CODER_ARTIFACT,
  highlights as CODER_HIGHLIGHTS,
}
export const CODER_LOCAL = channel === "local"
