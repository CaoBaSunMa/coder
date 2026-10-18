import path from "node:path"
import { CODER_CHANNEL } from "./version"

export function databasePath(data: string) {
  const filename =
    process.env.CODER_DB ??
    (["latest", "dev", "beta", "next", "prod"].includes(CODER_CHANNEL) ||
    process.env.CODER_DISABLE_CHANNEL_DB === "1" ||
    process.env.CODER_DISABLE_CHANNEL_DB === "true"
      ? "opencode.db"
      : `coder-${CODER_CHANNEL.replace(/[^a-zA-Z0-9._-]/g, "-")}.db`)
  return filename === ":memory:" ? filename : path.resolve(data, filename)
}
